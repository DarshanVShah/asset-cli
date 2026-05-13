import * as fs from "fs";
import * as path from "path";
import { log, c } from "../util/log";
import { VERSION } from "../constants";
import { findCards, loadCard, validateCard, type CardFrontmatter } from "../util/card";
import { toRelative } from "../util/scanner";
import { toPosix } from "../util/paths";
import { resolveOptions } from "../util/config";

interface ManifestOptions {
  output?: string;
  allowMissingSource?: boolean;
}

interface ManifestAsset {
  id: string;
  type: string;
  status: string;
  source: string;
  card: string;
  tags: string[];
  frames?: string[]; // present only for animation groups
  usage: {
    intended: string[];
    forbidden: string[];
  };
  ai: {
    preserve_style: boolean;
    allow_recolor: boolean;
    allow_crop: boolean;
  };
}

interface Manifest {
  version: string;
  generatedAt: string;
  assets: ManifestAsset[];
}

function toManifestEntry(card: CardFrontmatter, cardPathRelative: string): ManifestAsset {
  const entry: ManifestAsset = {
    id: card.id,
    type: card.type,
    status: card.status,
    source: card.source,
    card: cardPathRelative,
    tags: card.tags ?? [],
    usage: {
      intended: card.usage?.intended ?? [],
      forbidden: card.usage?.forbidden ?? [],
    },
    ai: {
      preserve_style: card.ai?.preserve_style ?? true,
      allow_recolor: card.ai?.allow_recolor ?? false,
      allow_crop: card.ai?.allow_crop ?? false,
    },
  };
  if (card.frames && card.frames.length >= 2) entry.frames = card.frames;
  return entry;
}

export async function runManifest(dir: string | undefined, options: ManifestOptions = {}): Promise<void> {
  const opts = resolveOptions({ dirArg: dir, outputArg: options.output });
  const { cwd, assetsDir, manifestOutput, ignore, configSource, configWarnings } = opts;

  log.header(`asset-md manifest ${c.dim(toRelative(assetsDir, cwd) || ".")}`);
  if (configSource) log.dim(`config: ${toRelative(configSource, cwd)}`);
  for (const w of configWarnings) log.warn(`config: ${w}`);

  if (!fs.existsSync(assetsDir)) {
    log.warn(`Directory not found: ${toRelative(assetsDir, cwd)}`);
    process.exitCode = 1;
    return;
  }

  const cards = await findCards(assetsDir, { ignore });
  if (cards.length === 0) {
    log.warn(`No .ASSET.md files found in ${toRelative(assetsDir, cwd)}`);
    return;
  }

  const entries: ManifestAsset[] = [];
  const invalid: string[] = [];

  for (const cardPath of cards) {
    const card = loadCard(cardPath, cwd);
    const result = validateCard(card, cwd, { allowMissingSource: options.allowMissingSource });
    if (!result.ok || !result.data) {
      invalid.push(result.cardPathRelative);
      continue;
    }
    entries.push(toManifestEntry(result.data, result.cardPathRelative));
  }

  entries.sort((a, b) => a.id.localeCompare(b.id));

  const manifest: Manifest = {
    version: VERSION,
    generatedAt: new Date().toISOString(),
    assets: entries,
  };

  fs.mkdirSync(path.dirname(manifestOutput), { recursive: true });
  fs.writeFileSync(manifestOutput, JSON.stringify(manifest, null, 2) + "\n", "utf8");

  log.ok(`Wrote ${c.cyan(toPosix(path.relative(cwd, manifestOutput)))}`);
  log.info(`${c.green("Valid assets included:")} ${entries.length}`);
  if (invalid.length > 0) {
    log.warn(`${c.yellow("Skipped invalid cards:")}  ${invalid.length}`);
    for (const p of invalid.slice(0, 10)) log.dim("  " + p);
    if (invalid.length > 10) log.dim(`  ... and ${invalid.length - 10} more`);
    log.dim("Run `asset-md validate` to see the errors.");
  }
}
