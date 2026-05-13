<h1 align="center">asset-md</h1>

<p align="center">
  <strong>A README for every creative asset, so AI agents stop guessing.</strong>
</p>

<p align="center">
  <a href="./.github/workflows/ci.yml"><img alt="CI" src="https://img.shields.io/badge/CI-passing-2ea44f?logo=github&logoColor=white"></a>
  <a href="./LICENSE"><img alt="License: MIT" src="https://img.shields.io/badge/License-MIT-blue.svg"></a>
  <a href="https://nodejs.org/"><img alt="Node 18+" src="https://img.shields.io/badge/Node-%E2%89%A518-339933?logo=node.js&logoColor=white"></a>
  <a href="https://www.typescriptlang.org/"><img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-strict-3178c6?logo=typescript&logoColor=white"></a>
  <img alt="Made for AI agents" src="https://img.shields.io/badge/made_for-AI%20agents-8a2be2">
  <img alt="Local-first" src="https://img.shields.io/badge/local--first-yes-1f2a44">
</p>

<p align="center">
  <code>asset-md</code> drops a <code>.ASSET.md</code> sidecar next to every image, audio file, model, or font in your repo,
  <br/>so Claude Code, Cursor, Codex, and any agent that reads the filesystem can use your art correctly the first time.
</p>

<p align="center">
  <a href="./docs/WHY_ASSET_MD.md">Why?</a> ·
  <a href="./docs/DEMO.md">60-second demo</a> ·
  <a href="./docs/SPEC.md">Write a card</a> ·
  <a href="./docs/integrations">Integrations</a> ·
  <a href="./examples">Examples</a>
</p>

<p align="center">
  <em>“ASSET.md is a README for creative assets. It helps AI agents understand what an asset is, where it belongs, how it should be used, and what constraints must be preserved.”</em>
</p>

---

## TL;DR

```bash
npm install   # or: npm link, after building
asset-md init                # scaffold
asset-md create-missing      # generate starter cards
$EDITOR assets/.../*.ASSET.md  # fill in real intent
asset-md validate            # CI-friendly; non-zero on failure
asset-md rules --target claude   # install the agent rule
```

A card looks like this:

```yaml
---
id: shopkeeper_bear
type: character
status: approved
source: assets/characters/shopkeeper_bear.png
usage:
  intended:  ["Behind the counter in the main store scene."]
  forbidden: ["Outside the store interior. Never recolored."]
ai:
  preserve_style: true
  allow_recolor: false
  allow_crop: false
---
```

---

## Before / after

**Before.** Your AI agent sees:

```
assets/characters/shopkeeper_bear.png
```

…and has to guess. Is the bear an NPC? An enemy? A logo? Can it be recolored? Where does it go on screen?

**After.** Your AI agent reads the sibling card you wrote *once*:

```
assets/characters/shopkeeper_bear.ASSET.md
```

```yaml
---
id: shopkeeper_bear
type: character
status: approved
source: assets/characters/shopkeeper_bear.png
usage:
  intended:  ["Behind the counter in the main store scene."]
  forbidden: ["Outside the store interior. Never recolored."]
ai:
  preserve_style: true
  allow_recolor: false
  allow_crop: false
---

## Style constraints
Palette is fixed: apron green #5a8a4f, bow #b8453d, fur #7a4f30.
The painted texture is intentional — do not upscale or auto-trace.
```

Now the agent has explicit context, the constraints are version-controlled, and the rules are the same for every human, agent, and CI check.

---

## Install

```bash
git clone <this-repo>
cd asset-cli
npm install
npm run build
# Optionally link globally:
npm link
asset-md --help
```

Node 18+ required.

---

## 30-second quickstart

```bash
asset-md init                  # scaffold ASSET_SPEC.md, asset-md.config.json, assets/, examples/
# drop your art into assets/
asset-md scan                  # see what's missing
asset-md create-missing        # generate starter cards for every asset
$EDITOR assets/.../*.ASSET.md  # fill in real intent
asset-md validate              # CI-friendly; non-zero on any failure
asset-md manifest              # produce ASSET_MANIFEST.json
asset-md rules --target claude # drop the agent rule into CLAUDE.md
```

---

## Command reference

| Command | Purpose |
| --- | --- |
| `asset-md init [--force]` | Scaffold `ASSET_SPEC.md`, `asset-md.config.json`, `assets/`, `examples/`. |
| `asset-md scan [dir] [-v]` | Report animation groups and singletons, with/without cards. Auto-detects numbered series like `walk_0.png` … `walk_7.png`. |
| `asset-md create <assetPath> [--force]` | Write a starter card for a single asset. Type inferred from folder → extension → filename tokens. |
| `asset-md create-missing [dir] [--force]` | Bulk: one card per singleton, one card per animation group. |
| `asset-md validate [dir] [--allow-missing-source]` | Schema + source-existence + section checks. Exits non-zero on failure. Reports every issue per card in one pass. |
| `asset-md manifest [dir] [-o file] [--allow-missing-source]` | Write `ASSET_MANIFEST.json` (or any path) from every valid card. |
| `asset-md prompt <assetPath>` | Print a compact agent instruction block for one asset. |
| `asset-md rules [--target ...] [--all] [--print] [--force]` | Generate the agent rule into `CLAUDE.md`, `.cursor/rules/assets.mdc`, `CODEX.md`, or `AGENTS.md`. |

Every command supports `--help`.

---

## Configuration

`asset-md.config.json` at the repo root (or any ancestor) is automatically picked up. CLI arguments override config; config overrides defaults.

```json
{
  "assetsDir": "assets",
  "manifestOutput": "ASSET_MANIFEST.json",
  "ignore": [
    "**/node_modules/**",
    "**/.git/**",
    "**/dist/**"
  ],
  "supportedExtensions": [
    ".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg",
    ".wav", ".mp3", ".ogg",
    ".mp4", ".webm",
    ".glb", ".gltf", ".fbx", ".obj",
    ".ttf", ".otf", ".woff", ".woff2"
  ]
}
```

Malformed config does not crash — it warns and falls back to defaults.

---

## Animation grouping

When several files form a numbered series — say `walk_0.png` through `walk_7.png` in the same folder — `asset-md` treats them as one animation and writes a single card:

```
assets/characters/bear/
  walk_0.png
  walk_1.png
  ...
  walk_7.png
  walk.ASSET.md   ← one card covers the whole cycle
```

```yaml
---
id: walk
type: character       # type stays semantic; frames is an orthogonal "this is animated" signal
status: draft
source: assets/characters/bear/walk_0.png
frames:
  - assets/characters/bear/walk_0.png
  - ...
  - assets/characters/bear/walk_7.png
---
```

Detection: trailing digits with an optional `_`, `-`, or `.` separator (`walk_0`, `walk-01`, `frame0001`). Image extensions only in this MVP. Each frame must exist on disk to pass `asset-md validate`. `asset-md prompt walk_2.png` reads the group card automatically. See [`docs/SPEC.md`](./docs/SPEC.md#frames--optional-list-of-strings-animation-cards) for the full rules.

---

## Example workflow

```bash
# One-time setup.
asset-md init
asset-md rules --all                # drop rules for every agent platform

# Daily loop.
git pull
asset-md scan                       # check who needs cards
asset-md create-missing             # auto-generate starters for new art
$EDITOR assets/.../bear.ASSET.md    # write the real card
asset-md validate                   # fix any issues
asset-md manifest                   # refresh the manifest
git add assets/ ASSET_MANIFEST.json
git commit -m "art: shopkeeper bear + card"
```

In CI, the same flow gates merges:

```yaml
# .github/workflows/assets.yml
- run: npx asset-md validate
- run: npx asset-md manifest
```

---

## Agent rules — why and how

When an AI coding agent reaches for an asset, it should:

1. **Check for a sibling `.ASSET.md`.** If one exists, read it first.
2. **Follow `usage.intended`, `usage.forbidden`, and the `ai.*` flags.** Don't infer the asset's role from the filename.
3. **If a card is missing,** run `asset-md create <assetPath>` and fill it in before proceeding.

`asset-md rules` writes that policy into the conventional rules file for each platform:

| Target | File |
| --- | --- |
| `--target claude` | `CLAUDE.md` |
| `--target cursor` | `.cursor/rules/assets.mdc` |
| `--target codex`  | `CODEX.md` |
| `--target agents` | `AGENTS.md` |
| `--all` | all of the above |

The command appends to existing files and is idempotent — it won't duplicate the block on re-run unless you pass `--force`.

You can also pipe a single card directly into an agent's context:

```bash
asset-md prompt assets/characters/shopkeeper_bear.png | pbcopy
```

---

## Supported file types

| Category | Extensions |
| --- | --- |
| Image    | `.png`, `.jpg`, `.jpeg`, `.webp`, `.gif`, `.svg` |
| Audio    | `.wav`, `.mp3`, `.ogg` |
| Video    | `.mp4`, `.webm` |
| 3D model | `.glb`, `.gltf`, `.fbx`, `.obj` |
| Font     | `.ttf`, `.otf`, `.woff`, `.woff2` |

Override the list via `supportedExtensions` in `asset-md.config.json`.

---

## Card format

See [`ASSET_SPEC.md`](./ASSET_SPEC.md) for the full specification. In short:

```markdown
---
id: shopkeeper_bear
type: character           # one of the spec's enum values
status: draft
tags: []
source: assets/characters/shopkeeper_bear.png
engine:
  godot_node: AnimatedSprite2D
  anchor: bottom_center
usage:
  intended:  [...]
  forbidden: [...]
ai:
  preserve_style: true
  allow_recolor: false
  allow_crop: false
---

# Asset: Shopkeeper Bear

## What this asset is
## Intended use
## Do not use for
## Placement rules
## Style constraints
## Animation or interaction notes
## Prompting guidance
```

---

## Examples

[`examples/`](./examples) ships three high-quality sample projects:

- `cozy-store-game/` — store-management game (character, background, UI, audio)
- `pixel-rpg/` — top-down 32x32 pixel-art RPG (character, prop, tileset)
- `visual-novel/` — dialogue-heavy school-life VN (portrait, background, music)

No binaries are shipped. To validate them:

```bash
asset-md validate examples --allow-missing-source
```

---

## Why local-first

This is intentionally a local-first, plain-text tool:

- **No daemon, database, or cloud service** to set up or maintain.
- **No proprietary format.** Cards are Markdown + YAML — friendly to humans, agents, Git, and code review.
- **No paid APIs, no model calls.** The CLI is fully usable without AI; it just happens to be designed so that AI agents can use it well.

If you want fancier downstream tooling (visual editor, MCP server, engine plugin, auto-tagging), build it on top — the card format is open and stable.

---

## Scripts

```bash
npm run build        # tsc -> dist/
npm run dev          # ts-node src/cli.ts -- <args>
npm start            # node dist/cli.js
npm run lint         # tsc --noEmit
npm test             # vitest run
npm run test:watch   # vitest watch
npm run clean        # rm -rf dist
```

---

## Documentation

| | |
| --- | --- |
| [docs/WHY_ASSET_MD.md](./docs/WHY_ASSET_MD.md) | Why this exists and the problem it solves |
| [docs/SPEC.md](./docs/SPEC.md) | Author-facing guide to writing a card |
| [ASSET_SPEC.md](./ASSET_SPEC.md) | Formal validator-bound specification |
| [docs/DEMO.md](./docs/DEMO.md) | 60-second copy-paste demo + VHS tape for the GIF |
| [docs/integrations/](./docs/integrations) | Wiring up Claude Code, Cursor, Codex, Godot |
| [CONTRIBUTING.md](./CONTRIBUTING.md) | How to contribute |

---

## Project status

MVP. The format and CLI are intentionally minimal. Contributions,
ideas, and issues welcome — see [CONTRIBUTING.md](./CONTRIBUTING.md).

Licensed under the [MIT License](./LICENSE).
