# asset-md

> **ASSET.md is a README for creative assets.** It helps AI agents understand what an asset is, where it belongs, how it should be used, and what constraints must be preserved.

`asset-md` is a small TypeScript CLI that creates and maintains `.ASSET.md` sidecar files next to your creative/game assets (images, audio, video, 3D models, fonts). The cards are plain Markdown with YAML frontmatter, so they work great with Git, code review, and any AI coding agent.

For every asset:

```
assets/characters/shopkeeper_bear.png
```

there is a sibling card:

```
assets/characters/shopkeeper_bear.ASSET.md
```

The card tells humans and agents *what the asset is, where it should be used, and what constraints must be preserved* — so an AI agent picking up the asset doesn't infer its role from the filename alone.

---

## Why this exists

LLM coding agents are increasingly asked to wire up creative assets — drop a sprite into a scene, build a dialog UI, place an SFX cue. Filenames are not enough context: `bear.png` could be a character, a logo, or a decorative prop, and the model has no idea what palette, anchor, or layer it belongs on.

`asset-md` solves that with the lightest-weight artifact possible: a Markdown file beside each asset. No daemon, no database, no proprietary format. Agents read it. Humans read it. CI validates it.

---

## Install (local / repo-local)

```bash
git clone <this-repo>
cd asset-cli
npm install
npm run build
# Run via node:
node dist/cli.js --help
# Or link the binary globally:
npm link
asset-md --help
```

Node 18+ required.

---

## Quick start

```bash
# 1. Scaffold the project
asset-md init

# 2. Drop assets into assets/
#    e.g. assets/characters/shopkeeper_bear.png

# 3. See what's missing
asset-md scan

# 4. Generate starter cards for every asset
asset-md create-missing

# 5. Edit each .ASSET.md to fill in real intent
$EDITOR assets/characters/shopkeeper_bear.ASSET.md

# 6. Validate
asset-md validate

# 7. Generate the project manifest
asset-md manifest
```

---

## Command reference

### `asset-md init`

Creates baseline project files: `ASSET_SPEC.md`, `asset-md.config.json`, `assets/`, `examples/`. Use `--force` to overwrite existing files.

### `asset-md scan [dir]`

Walks `[dir]` (default `assets/`) and reports counts for total assets, assets with a matching `.ASSET.md`, assets missing one, and ignored files. Use `--verbose` to list every path.

### `asset-md create <assetPath>`

Creates a starter `.ASSET.md` for a single asset. The type (`character`, `ui`, `audio`, etc.) is inferred from the folder name, file extension, and filename keywords. Use `--force` to overwrite an existing card.

### `asset-md create-missing [dir]`

Bulk version of `create`. Scans `[dir]` (default `assets/`) and writes a starter card for every supported asset that doesn't already have one.

### `asset-md validate [dir]`

Loads every `.ASSET.md` in `[dir]`, parses the YAML frontmatter, validates the shape (id, type, status, source required; type restricted to the spec's enum), checks the source file exists on disk, and verifies all seven required H2 sections are present. Exits non-zero on any failure — wire this into CI.

### `asset-md manifest [dir]`

Writes `ASSET_MANIFEST.json` at the repo root from every valid card. Use `--output <path>` to write somewhere else.

### `asset-md prompt <assetPath>`

Prints a compact agent instruction block for one asset. Pipe it directly into an AI agent's prompt, or copy it into a system message.

```
$ asset-md prompt assets/characters/shopkeeper_bear.png

Before using `assets/characters/shopkeeper_bear.png`, read and follow `assets/characters/shopkeeper_bear.ASSET.md`.

Asset summary:
- Type: character
- Status: approved
- Intended use: Behind the counter in the main store scene.
- Forbidden use: Outside the store interior (no overworld appearances).
- Style preservation: true
- Recolor allowed: false
- Crop allowed: false

Agent rule:
Use this asset according to its asset card. Do not infer its role from the filename alone. Preserve all listed style and usage constraints.
```

Every command supports `--help`.

---

## Supported file types

| Category | Extensions |
| -------- | ---------- |
| Image    | `.png`, `.jpg`, `.jpeg`, `.webp`, `.gif`, `.svg` |
| Audio    | `.wav`, `.mp3`, `.ogg` |
| Video    | `.mp4`, `.webm` |
| 3D model | `.glb`, `.gltf`, `.fbx`, `.obj` |
| Font     | `.ttf`, `.otf`, `.woff`, `.woff2` |

---

## Asset card format

See [`ASSET_SPEC.md`](./ASSET_SPEC.md) for the full specification. A minimal card:

```markdown
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
    - Where it should not be used.
ai:
  preserve_style: true
  allow_recolor: false
  allow_crop: false
---

# Asset: Shopkeeper Bear

## What this asset is
...

## Intended use
...

## Do not use for
...

## Placement rules
...

## Style constraints
...

## Animation or interaction notes
...

## Prompting guidance
...
```

---

## Example agent rule (Claude / Cursor / Codex)

Drop this into `CLAUDE.md`, `.cursorrules`, `AGENTS.md`, or wherever your agent reads project conventions:

> **Working with assets in this repo.**
> Every asset under `assets/` has a sibling `.ASSET.md` card. Before referencing, placing, editing, or generating around any asset, **read its `.ASSET.md` first** and follow the constraints in `usage.intended`, `usage.forbidden`, and the `ai.*` flags. Never infer an asset's role from its filename. If a card is missing, run `asset-md create <assetPath>` and fill it in before proceeding. To validate the whole project, run `asset-md validate`.

You can also pipe a single card into the agent's context on demand:

```bash
asset-md prompt assets/characters/shopkeeper_bear.png | pbcopy
```

---

## Project layout

```
.
├── ASSET_SPEC.md          # full card specification
├── asset-md.config.json   # project config (ignore patterns etc.)
├── assets/                # your real assets + sibling .ASSET.md cards
├── ASSET_MANIFEST.json    # generated; commit or .gitignore as you prefer
├── examples/              # sample projects with high-quality cards
└── src/                   # CLI source
```

---

## Scripts

```bash
npm run build   # tsc → dist/
npm run dev     # ts-node src/cli.ts -- <args>
npm start       # node dist/cli.js
npm run clean   # rm dist/
```

---

## Examples

See [`examples/`](./examples) for three fully-written sample projects:

- `cozy-store-game/` — a small store-management game
- `pixel-rpg/` — a top-down 32x32 pixel-art RPG
- `visual-novel/` — a dialogue-heavy school-life VN

These don't include real binaries — they're a writing-style reference.

---

## What this MVP does not do (yet)

- No cloud sync.
- No visual editor / web UI.
- No MCP server.
- No game-engine plugin.
- No paid APIs.
- No computer vision / auto-tagging.
- No asset generation. Bring your own art.

The CLI is intentionally useful even without AI — it scaffolds, validates, and indexes the cards your team writes by hand.
