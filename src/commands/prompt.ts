import * as fs from "fs";
import * as path from "path";
import { log } from "../util/log";
import { cardPathFor, toPosix } from "../util/paths";
import { CardFrontmatterSchema, loadCard } from "../util/card";
import { parseFrameName } from "../util/grouping";

function fmtList(items: string[] | undefined, fallback: string): string {
  if (!items || items.length === 0) return fallback;
  if (items.length === 1) return items[0];
  return items.map((s) => `- ${s}`).join("\n  ");
}

export function runPrompt(assetPath: string): void {
  const cwd = process.cwd();
  const absAsset = path.isAbsolute(assetPath) ? assetPath : path.resolve(cwd, assetPath);
  const relAsset = toPosix(path.relative(cwd, absAsset));

  // Resolve the card path. Prefer a per-file sibling card, but fall back to
  // an animation group card (<stem>.ASSET.md) if the asset looks like a frame.
  const perFileCard = cardPathFor(absAsset);
  let cardPath = perFileCard;
  if (!fs.existsSync(cardPath)) {
    const parsed = parseFrameName(path.basename(absAsset));
    if (parsed) {
      const groupCard = path.join(path.dirname(absAsset), parsed.stem + ".ASSET.md");
      if (fs.existsSync(groupCard)) cardPath = groupCard;
    }
  }
  const relCard = toPosix(path.relative(cwd, cardPath));

  if (!fs.existsSync(cardPath)) {
    log.err(`No matching card found: ${relCard}`);
    log.dim(`Run \`asset-md create ${relAsset}\` to generate one.`);
    process.exitCode = 1;
    return;
  }

  const card = loadCard(cardPath, cwd);
  const parsed = CardFrontmatterSchema.safeParse(card.frontmatter);
  if (!parsed.success) {
    log.err(`Card frontmatter is invalid: ${relCard}`);
    for (const issue of parsed.error.issues) {
      log.dim(`  ${issue.path.join(".") || "frontmatter"}: ${issue.message}`);
    }
    process.exitCode = 1;
    return;
  }

  const d = parsed.data;
  const intended = fmtList(d.usage?.intended, "(not specified)");
  const forbidden = fmtList(d.usage?.forbidden, "(not specified)");
  const preserveStyle = d.ai?.preserve_style ?? true;
  const allowRecolor = d.ai?.allow_recolor ?? false;
  const allowCrop = d.ai?.allow_crop ?? false;

  const frameLine = d.frames && d.frames.length >= 2
    ? `- Frames: ${d.frames.length}  (this card covers a numbered animation series)`
    : null;

  const out = [
    `Before using \`${relAsset}\`, read and follow \`${relCard}\`.`,
    "",
    "Asset summary:",
    `- Type: ${d.type}`,
    `- Status: ${d.status}`,
    ...(frameLine ? [frameLine] : []),
    `- Intended use: ${intended}`,
    `- Forbidden use: ${forbidden}`,
    `- Style preservation: ${preserveStyle}`,
    `- Recolor allowed: ${allowRecolor}`,
    `- Crop allowed: ${allowCrop}`,
    "",
    "Agent rule:",
    "Use this asset according to its asset card. Do not infer its role from the filename alone. Preserve all listed style and usage constraints.",
  ].join("\n");

  // Plain text — agents/tools may pipe this directly.
  console.log(out);
  // A tiny dim trailer for human users, suppressed in pipes.
  if (process.stdout.isTTY) {
    log.dim("");
    log.dim(`(source: ${relCard})`);
  }
}
