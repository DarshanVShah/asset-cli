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

const DEFAULT_IGNORE = ["**/node_modules/**", "**/dist/**", "**/.git/**"];

export async function findCards(targetDir: string): Promise<string[]> {
  const abs = path.resolve(targetDir);
  if (!fs.existsSync(abs)) return [];
  const matches = await fg([`**/*${CARD_SUFFIX}`], {
    cwd: abs,
    onlyFiles: true,
    dot: false,
    ignore: DEFAULT_IGNORE,
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

/**
 * Validate a single .ASSET.md card. Checks frontmatter shape (via zod),
 * that the source file exists on disk, and that every required H2 section
 * is present in the body.
 */
export function validateCard(card: LoadedCard, cwd: string = process.cwd()): ValidationResult {
  const issues: ValidationIssue[] = [];

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
    return {
      cardPath: card.cardPath,
      cardPathRelative: card.cardPathRelative,
      ok: false,
      issues,
    };
  }

  const data = parsed.data;

  // Source file existence: resolve relative to repo root (cwd).
  const sourceAbs = path.isAbsolute(data.source) ? data.source : path.resolve(cwd, data.source);
  if (!fs.existsSync(sourceAbs)) {
    issues.push({ field: "source", message: `Source file does not exist: ${data.source}` });
  }

  // Required sections in body.
  for (const section of REQUIRED_SECTIONS) {
    const re = new RegExp(`^##\\s+${escapeRegex(section)}\\s*$`, "m");
    if (!re.test(card.body)) {
      issues.push({ field: "sections", message: `Missing required section: "## ${section}"` });
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
