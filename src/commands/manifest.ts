import * as path from "path";
import * as fs from "fs";
import { log, c } from "../util/log";
import { VERSION } from "../constants";
import { findCards, loadCard, validateCard, type CardFrontmatter } from "../util/card";
import { toRelative } from "../util/scanner";
import { toPosix } from "../util/paths";

interface ManifestOptions {
  output?: string;
}

interface ManifestAsset {
  id: string;
  type: string;
  status: string;
  source: string;
  card: string;
  tags: string[];
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
  return {
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
}

export async function runManifest(dir: string | undefined, options: ManifestOptions = {}): Promise<void> {
  const cwd = process.cwd();
  const targetDir = path.resolve(cwd, dir ?? "assets");
  const outputPath = path.resolve(cwd, options.output ?? "ASSET_MANIFEST.json");

  log.header(`asset-md manifest ${c.dim(toRelative(targetDir, cwd) || ".")}`);

  if (!fs.existsSync(targetDir)) {
    log.warn(`Directory not found: ${toRelative(targetDir, cwd)}`);
    process.exitCode = 1;
    return;
  }

  const cards = await findCards(targetDir);
  if (cards.length === 0) {
    log.warn(`No .ASSET.md files found in ${toRelative(targetDir, cwd)}`);
    return;
  }

  const entries: ManifestAsset[] = [];
  const invalid: string[] = [];

  for (const cardPath of cards) {
    const card = loadCard(cardPath, cwd);
    const result = validateCard(card, cwd);
    if (!result.ok || !result.data) {
      invalid.push(result.cardPathRelative);
      continue;
    }
    entries.push(toManifestEntry(result.data, result.cardPathRelative));
  }

  // Deterministic ordering for clean diffs.
  entries.sort((a, b) => a.id.localeCompare(b.id));

  const manifest: Manifest = {
    version: VERSION,
    generatedAt: new Date().toISOString(),
    assets: entries,
  };

  fs.writeFileSync(outputPath, JSON.stringify(manifest, null, 2) + "\n", "utf8");

  log.ok(`Wrote ${c.cyan(toPosix(path.relative(cwd, outputPath)))}`);
  log.info(`${c.green("Valid assets included:")} ${entries.length}`);
  if (invalid.length > 0) {
    log.warn(`${c.yellow("Skipped invalid cards:")}  ${invalid.length}`);
    for (const p of invalid.slice(0, 10)) log.dim("  " + p);
    if (invalid.length > 10) log.dim(`  ... and ${invalid.length - 10} more`);
    log.dim("Run `asset-md validate` to see the errors.");
  }
}
