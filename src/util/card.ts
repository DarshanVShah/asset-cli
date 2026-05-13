import * as fs from "fs";
import * as path from "path";
import matter from "gray-matter";
import { z } from "zod";
import fg from "fast-glob";
import { ASSET_TYPES, REQUIRED_SECTIONS, CARD_SUFFIX } from "../constants";
import { toPosix } from "./paths";

export const CardFrontmatterSchema = z.object({
  id: z.string().min(1),
  type: z.enum(ASSET_TYPES),
  status: z.string().min(1),
  source: z.string().min(1),
  // Optional: for animation cards, the full ordered list of frame paths.
  // When present, every entry must exist on disk (unless --allow-missing-source).
  frames: z.array(z.string().min(1)).min(2).optional(),
  tags: z.array(z.string()).optional().default([]),
  engine: z
    .object({
      godot_node: z.string().optional(),
      anchor: z.string().optional(),
    })
    .partial()
    .optional(),
  usage: z
    .object({
      intended: z.array(z.string()).optional().default([]),
      forbidden: z.array(z.string()).optional().default([]),
    })
    .partial()
    .optional(),
  ai: z
    .object({
      preserve_style: z.boolean().optional(),
      allow_recolor: z.boolean().optional(),
      allow_crop: z.boolean().optional(),
    })
    .partial()
    .optional(),
});

export type CardFrontmatter = z.infer<typeof CardFrontmatterSchema>;

export interface LoadedCard {
  cardPath: string;            // absolute path
  cardPathRelative: string;    // posix relative to cwd
  raw: string;
  frontmatter: unknown;        // parsed YAML — may be invalid
  body: string;
  hasFrontmatter: boolean;
}

export interface FindCardsOptions {
  ignore?: string[];
}

export async function findCards(targetDir: string, options: FindCardsOptions = {}): Promise<string[]> {
  const abs = path.resolve(targetDir);
  if (!fs.existsSync(abs)) return [];
  const matches = await fg([`**/*${CARD_SUFFIX}`], {
    cwd: abs,
    onlyFiles: true,
    dot: false,
    ignore: options.ignore ?? [],
    absolute: true,
  });
  return matches;
}

export function loadCard(cardPath: string, cwd: string = process.cwd()): LoadedCard {
  const raw = fs.readFileSync(cardPath, "utf8");
  const parsed = matter(raw);
  // gray-matter returns {} for files without frontmatter; detect via the source delimiter.
  const hasFrontmatter = raw.startsWith("---");
  return {
    cardPath,
    cardPathRelative: toPosix(path.relative(cwd, cardPath)),
    raw,
    frontmatter: parsed.data,
    body: parsed.content,
    hasFrontmatter,
  };
}

export type ValidationCategory = "frontmatter" | "schema" | "source" | "sections";

export interface ValidationIssue {
  category: ValidationCategory;
  field: string;
  message: string;
}

const CATEGORY_ORDER: ValidationCategory[] = ["frontmatter", "schema", "source", "sections"];

/** Sort issues for predictable display: frontmatter → schema → source → sections. */
export function sortIssues(issues: ValidationIssue[]): ValidationIssue[] {
  return [...issues].sort((a, b) => {
    const ai = CATEGORY_ORDER.indexOf(a.category);
    const bi = CATEGORY_ORDER.indexOf(b.category);
    if (ai !== bi) return ai - bi;
    return a.field.localeCompare(b.field);
  });
}

/** Friendly message for one zod issue against the frontmatter schema. */
function formatSchemaIssue(issue: z.ZodIssue, raw: unknown): string {
  const field = issue.path.join(".") || "frontmatter";
  // Required-but-missing: zod surfaces this as `invalid_type` with `received: "undefined"`.
  if (issue.code === "invalid_type" && (issue as { received?: string }).received === "undefined") {
    return `missing required field: ${field}`;
  }
  if (issue.code === "invalid_enum_value" && field === "type") {
    const received = (raw as { type?: unknown } | undefined)?.type;
    return `invalid type: ${JSON.stringify(received)} (expected one of: ${ASSET_TYPES.join(", ")})`;
  }
  if (issue.code === "too_small") {
    return `${field} must not be empty`;
  }
  return `${field}: ${issue.message}`;
}

export interface ValidationResult {
  cardPath: string;
  cardPathRelative: string;
  ok: boolean;
  issues: ValidationIssue[];
  data?: CardFrontmatter;
}

export interface ValidateOptions {
  allowMissingSource?: boolean; // skip on-disk source-file existence check
}

/**
 * Validate a single .ASSET.md card. Performs all checks it can in one pass
 * and returns the full set of issues so the caller can show every problem
 * at once — frontmatter shape, source existence, and required H2 sections.
 */
export function validateCard(
  card: LoadedCard,
  cwd: string = process.cwd(),
  options: ValidateOptions = {},
): ValidationResult {
  const issues: ValidationIssue[] = [];

  // 1. Required H2 sections — always checkable from the body.
  for (const section of REQUIRED_SECTIONS) {
    const re = new RegExp(`^##\\s+${escapeRegex(section)}\\s*$`, "m");
    if (!re.test(card.body)) {
      issues.push({
        category: "sections",
        field: section,
        message: `missing section: "## ${section}"`,
      });
    }
  }

  // 2. Frontmatter must exist.
  if (!card.hasFrontmatter) {
    issues.push({
      category: "frontmatter",
      field: "frontmatter",
      message: "card has no YAML frontmatter (expected at top of file)",
    });
    return {
      cardPath: card.cardPath,
      cardPathRelative: card.cardPathRelative,
      ok: false,
      issues: sortIssues(issues),
    };
  }

  // 3. Schema check. Collect every zod issue rather than bailing on the first.
  const parsed = CardFrontmatterSchema.safeParse(card.frontmatter);
  let data: CardFrontmatter | undefined;
  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      const field = issue.path.join(".") || "frontmatter";
      issues.push({
        category: "schema",
        field,
        message: formatSchemaIssue(issue, card.frontmatter),
      });
    }
  } else {
    data = parsed.data;
  }

  // 4. Source-file existence — runs even when schema failed, using the raw
  //    value so the user sees every problem in one pass. For animation
  //    cards (frames: [...]), every frame path is checked.
  if (!options.allowMissingSource) {
    const rawFm = (card.frontmatter ?? {}) as { source?: unknown; frames?: unknown };

    const source = data?.source ?? (typeof rawFm.source === "string" ? rawFm.source : undefined);
    if (source && source.length > 0) {
      const sourceAbs = path.isAbsolute(source) ? source : path.resolve(cwd, source);
      if (!fs.existsSync(sourceAbs)) {
        issues.push({
          category: "source",
          field: "source",
          message: `source file does not exist: ${source}`,
        });
      }
    }

    const frames = data?.frames ?? (Array.isArray(rawFm.frames) ? (rawFm.frames as unknown[]).filter((x): x is string => typeof x === "string") : undefined);
    if (frames && frames.length > 0) {
      for (const frame of frames) {
        const frameAbs = path.isAbsolute(frame) ? frame : path.resolve(cwd, frame);
        if (!fs.existsSync(frameAbs)) {
          issues.push({
            category: "source",
            field: "frames",
            message: `frame file does not exist: ${frame}`,
          });
        }
      }
    }
  }

  return {
    cardPath: card.cardPath,
    cardPathRelative: card.cardPathRelative,
    ok: issues.length === 0,
    issues: sortIssues(issues),
    data,
  };
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
