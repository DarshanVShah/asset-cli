# ASSET.md Specification (v0.1)

> ASSET.md is a README for creative assets. It helps AI agents understand
> what an asset is, where it belongs, how it should be used, and what
> constraints must be preserved.

This document defines the on-disk format for `.ASSET.md` sidecar files and
the validation rules enforced by `asset-md validate`.

---

## File location and naming

For every asset file, the card is a **sibling file** in the same directory,
with the asset's extension replaced by `.ASSET.md`:

| Asset path | Card path |
| ---------- | --------- |
| `assets/characters/shopkeeper_bear.png` | `assets/characters/shopkeeper_bear.ASSET.md` |
| `assets/audio/click.wav` | `assets/audio/click.ASSET.md` |
| `assets/models/coin.glb` | `assets/models/coin.ASSET.md` |

The matching rule is: drop the extension, append `.ASSET.md`. Card files are
never moved away from the asset they describe.

---

## File structure

Every card has two parts:

1. **YAML frontmatter** delimited by `---` at the top of the file.
2. **Markdown body** with seven required H2 sections.

---

## Frontmatter schema

### Required fields

| Field    | Type     | Notes |
| -------- | -------- | ----- |
| `id`     | string   | Stable identifier. By convention matches the asset's filename stem. |
| `type`   | enum     | One of the values listed below. |
| `status` | string   | Free-form, but conventionally `draft`, `approved`, or `deprecated`. |
| `source` | string   | Path to the asset file, relative to the repo root, using forward slashes. |

### Allowed values for `type`

```
character     background    prop          ui
audio         music         vfx           tileset
animation     font          model3d       video
reference     unknown
```

### Optional fields

```yaml
tags: [npc, mascot]              # free-form labels
engine:
  godot_node: AnimatedSprite2D   # engine-specific node hint
  anchor: bottom_center
usage:
  intended:                      # where this asset SHOULD be used
    - ...
  forbidden:                     # where this asset must NOT be used
    - ...
ai:
  preserve_style: true           # AI agents must preserve visual style
  allow_recolor: false           # may an AI recolor this?
  allow_crop: false              # may an AI crop this?
```

`usage.intended`, `usage.forbidden`, and the `ai.*` flags are the most
important fields for AI agents at runtime. Fill them in.

---

## Required Markdown sections

Every card must contain these H2 sections, in any order:

- `## What this asset is`
- `## Intended use`
- `## Do not use for`
- `## Placement rules`
- `## Style constraints`
- `## Animation or interaction notes`
- `## Prompting guidance`

The validator looks for these as exact H2 headings.

---

## Full example

```markdown
---
id: shopkeeper_bear
type: character
status: approved
tags: [npc, shopkeeper, mascot]
source: assets/characters/shopkeeper_bear.png
engine:
  godot_node: AnimatedSprite2D
  anchor: bottom_center
usage:
  intended:
    - Behind the counter in the main store scene.
    - Idle, greet, and transact animations during open hours.
  forbidden:
    - Outside the store interior.
    - Recolored or restyled — the bear is a brand mascot.
ai:
  preserve_style: true
  allow_recolor: false
  allow_crop: false
---

# Asset: Shopkeeper Bear

## What this asset is
A warm, slightly chubby brown bear in a green apron and bowtie...

## Intended use
Place him behind the wooden counter in `scenes/store_interior.tscn`...

## Do not use for
Do not place him in outdoor scenes...

## Placement rules
- Layer: `npc` (between `floor_props` and `foreground_lighting`).
- Anchor: `bottom_center` — his paws should rest on the counter base.
- Scale: 1.0; do not scale beyond 0.9–1.1...

## Style constraints
- Keep the painted, slightly grainy texture.
- Palette is fixed: apron green `#5a8a4f`, bow `#b8453d`, fur `#7a4f30`.

## Animation or interaction notes
Three required animations: `idle`, `greet`, `transact`...

## Prompting guidance
When an AI generates related art, refer to him as "the shopkeeper bear"...
```

See `examples/` for three project-scale examples covering characters,
backgrounds, UI, audio, music, props, tilesets, and dialog portraits.

---

## Validation rules (enforced by `asset-md validate`)

1. Card has YAML frontmatter (file begins with `---`).
2. Frontmatter contains `id`, `type`, `status`, `source`.
3. `type` is one of the allowed enum values.
4. The file at `source` exists on disk (relative to the repo root).
5. Every required H2 section is present in the body.

Any failure causes `asset-md validate` to exit with a non-zero status code,
making it CI-friendly.

---

## Manifest format (`ASSET_MANIFEST.json`)

`asset-md manifest` aggregates every valid card into a single JSON file at
the repo root:

```json
{
  "version": "0.1.0",
  "generatedAt": "2026-05-12T20:00:00.000Z",
  "assets": [
    {
      "id": "shopkeeper_bear",
      "type": "character",
      "status": "approved",
      "source": "assets/characters/shopkeeper_bear.png",
      "card": "assets/characters/shopkeeper_bear.ASSET.md",
      "tags": ["npc", "shopkeeper", "mascot"],
      "usage": { "intended": [...], "forbidden": [...] },
      "ai": { "preserve_style": true, "allow_recolor": false, "allow_crop": false }
    }
  ]
}
```

Entries are sorted by `id` for deterministic diffs.

---

## Versioning

This spec is `v0.1`. Breaking changes will bump the major version. The
`asset-md` CLI version is reported by `asset-md --version`.
