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

export interface ValidationIssue {
  field: string;
  message: string;
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

  // Sections are always checkable from the body, regardless of frontmatter health.
  for (const section of REQUIRED_SECTIONS) {
    const re = new RegExp(`^##\\s+${escapeRegex(section)}\\s*$`, "m");
    if (!re.test(card.body)) {
      issues.push({ field: "sections", message: `Missing required section: "## ${section}"` });
    }
  }

  if (!card.hasFrontmatter) {
    issues.push({ field: "frontmatter", message: "Card has no YAML frontmatter (expected at top of file)" });
    return {
      cardPath: card.cardPath,
      cardPathRelative: card.cardPathRelative,
      ok: false,
      issues,
    };
  }

  const parsed = CardFrontmatterSchema.safeParse(card.frontmatter);
  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      const field = issue.path.length > 0 ? issue.path.join(".") : "frontmatter";
      issues.push({ field, message: issue.message });
    }
    // Try the source-file check using whatever `source` value the user wrote,
    // so users get all the feedback at once.
    const fm = card.frontmatter as { source?: unknown } | undefined;
    if (!options.allowMissingSource && fm && typeof fm.source === "string" && fm.source.length > 0) {
      const sourceAbs = path.isAbsolute(fm.source) ? fm.source : path.resolve(cwd, fm.source);
      if (!fs.existsSync(sourceAbs)) {
        issues.push({ field: "source", message: `Source file does not exist: ${fm.source}` });
      }
    }
    return {
      cardPath: card.cardPath,
      cardPathRelative: card.cardPathRelative,
      ok: false,
      issues,
    };
  }

  const data = parsed.data;

  if (!options.allowMissingSource) {
    const sourceAbs = path.isAbsolute(data.source) ? data.source : path.resolve(cwd, data.source);
    if (!fs.existsSync(sourceAbs)) {
      issues.push({ field: "source", message: `Source file does not exist: ${data.source}` });
    }
  }

  return {
    cardPath: card.cardPath,
    cardPathRelative: card.cardPathRelative,
    ok: issues.length === 0,
    issues,
    data,
  };
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
