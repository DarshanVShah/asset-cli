import * as fs from "fs";
import * as path from "path";
import { log, c } from "../util/log";

interface InitOptions {
  force?: boolean;
  cwd?: string;
}

const DEFAULT_CONFIG = {
  version: "0.1.0",
  assetsDir: "assets",
  manifestPath: "ASSET_MANIFEST.json",
  ignore: ["**/node_modules/**", "**/dist/**", "**/.git/**"],
};

const DEFAULT_SPEC = `# ASSET.md Specification

ASSET.md is a README for creative assets. It helps AI agents understand
what an asset is, where it belongs, how it should be used, and what
constraints must be preserved.

For every asset file (image, audio, model, etc.), a sibling \`.ASSET.md\`
file lives next to it:

    assets/characters/shopkeeper_bear.png
    assets/characters/shopkeeper_bear.ASSET.md

## Frontmatter

Every \`.ASSET.md\` starts with YAML frontmatter:

\`\`\`yaml
---
id: shopkeeper_bear
type: character
status: draft
tags: []
source: assets/characters/shopkeeper_bear.png
engine:
  godot_node: AnimatedSprite2D
  anchor: bottom_center
usage:
  intended:
    - Where this asset should be used.
  forbidden:
    - Where this asset should not be used.
ai:
  preserve_style: true
  allow_recolor: false
  allow_crop: false
---
\`\`\`

## Required fields

- \`id\`: stable identifier (usually matches the filename stem)
- \`type\`: one of character, background, prop, ui, audio, music, vfx,
  tileset, animation, font, model3d, video, reference, unknown
- \`status\`: e.g. draft, approved, deprecated
- \`source\`: path to the asset file (relative to repo root)

## Required sections

Every card must contain these H2 sections:

- What this asset is
- Intended use
- Do not use for
- Placement rules
- Style constraints
- Animation or interaction notes
- Prompting guidance

Run \`asset-md validate\` to check cards against this spec.
`;

function writeFileIfMissing(filePath: string, content: string, force: boolean): "created" | "skipped" | "overwritten" {
  const exists = fs.existsSync(filePath);
  if (exists && !force) return "skipped";
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, "utf8");
  return exists ? "overwritten" : "created";
}

function ensureDir(dirPath: string): "created" | "exists" {
  if (fs.existsSync(dirPath)) return "exists";
  fs.mkdirSync(dirPath, { recursive: true });
  return "created";
}

export function runInit(options: InitOptions = {}): void {
  const cwd = options.cwd ?? process.cwd();
  const force = Boolean(options.force);

  log.header("asset-md init");

  const spec = path.join(cwd, "ASSET_SPEC.md");
  const config = path.join(cwd, "asset-md.config.json");
  const assetsDir = path.join(cwd, "assets");
  const examplesDir = path.join(cwd, "examples");

  const specResult = writeFileIfMissing(spec, DEFAULT_SPEC, force);
  const configResult = writeFileIfMissing(
    config,
    JSON.stringify(DEFAULT_CONFIG, null, 2) + "\n",
    force,
  );
  const assetsResult = ensureDir(assetsDir);
  const examplesResult = ensureDir(examplesDir);

  const report = (label: string, result: string) => {
    if (result === "created") log.ok(`${label} ${c.dim("created")}`);
    else if (result === "overwritten") log.ok(`${label} ${c.yellow("overwritten")}`);
    else if (result === "exists") log.dim(`${label} already exists`);
    else log.dim(`${label} already exists (use --force to overwrite)`);
  };

  report("ASSET_SPEC.md", specResult);
  report("asset-md.config.json", configResult);
  report("assets/", assetsResult);
  report("examples/", examplesResult);

  log.info("");
  log.info("Done. Try:");
  log.dim("  asset-md scan");
  log.dim("  asset-md create-missing");
}
