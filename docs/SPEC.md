# How to write an ASSET.md

> The shorter, author-facing version. For the formal validator-bound
> specification, see [`ASSET_SPEC.md`](../ASSET_SPEC.md).

This page tells you, the human writing a card, what each field is
*for* and how to do a good job filling it in. It is intentionally
opinionated.

---

## The shape

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
  forbidden:
    - Outside the store interior.
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

Frontmatter is parsed by `gray-matter` (standard YAML). The body is
plain Markdown with seven H2 sections.

---

## Each field, in plain English

### `id` — required

A short, stable identifier. By convention it's the asset's filename
stem (`shopkeeper_bear.png` → `shopkeeper_bear`). Use it when you
want to refer to the asset from elsewhere — code, other cards, the
manifest.

**Rule of thumb.** If you'd be willing to rename the file when the
id changes, the id and filename should match.

### `type` — required, enum

What kind of asset this is. Drives type-specific defaults (engine
node hint, anchor, whether recolor makes sense). One of:

```
character  background  prop  ui
audio      music       vfx   tileset
animation  font        model3d  video
reference  unknown
```

When in doubt, `unknown` is honest — it tells an agent "I don't have
a strong rule here, fall back to your default judgement."

### `status` — required

Free-form, but the conventional values are:

- `draft` — being written, may change.
- `approved` — production-ready, treat as canonical.
- `deprecated` — exists but should not be used in new work.

Tools may filter by status later (e.g. a manifest variant excluding
deprecated assets). Pick one of these three unless you have a strong
reason.

### `source` — required

Path to the asset file, **relative to the repo root**, in
forward-slash form. The validator checks this file exists on disk
(unless `--allow-missing-source` is set).

### `tags` — optional, list of strings

Free-form. Tags exist for search and filtering by downstream tooling.
Don't put *rules* in tags — rules belong in `usage` and `ai`.

### `engine` — optional, object

Engine-specific hints. We ship `godot_node` and `anchor` because
that's the engine the author uses; the field is open — add your
engine's hints as new keys (`unity_prefab`, `web_component`, etc.).
Validators only look at the field's existence, not its contents.

### `usage.intended` / `usage.forbidden` — optional, list of strings

The most load-bearing fields for AI agents.

- `intended`: every place the asset *should* be used. Be specific
  ("behind the counter in `scenes/store_interior.tscn`"), not generic
  ("in the game").
- `forbidden`: places it must not be used, *especially* the
  almost-right places where an agent would otherwise reach for it
  ("do not use as a generic placeholder NPC", "do not recolor for
  holiday variants").

If a card has only `intended` rules and an agent fails for a missing
rule, the next pass should add a matching `forbidden` rule. Cards get
better over time.

### `ai.*` — optional, booleans

Three explicit flags for AI agents:

- `preserve_style` — must the agent keep the original style intact?
  Defaults to `true`.
- `allow_recolor` — may an agent recolor the asset (e.g. for
  variants)? Defaults to `false`.
- `allow_crop` — may an agent crop or letterbox the image? Defaults
  to `false`.

These are intentionally coarse. The body sections add nuance.

---

## The seven required sections

Every card body must contain these H2 sections, in any order. Empty
sections are valid but discouraged — an empty section signals you
deferred a decision, which is fine if intentional.

### `## What this asset is`

Plain-language description of what someone is *looking at*. Two to
four sentences. Include color, mood, technique, and the asset's role
in the project.

### `## Intended use`

The detail behind `usage.intended`. Concrete scenes, slots, code
paths. Reference filenames if helpful.

### `## Do not use for`

The detail behind `usage.forbidden`. Especially the *adjacent*
mistakes — the wrong-but-plausible places an agent might reach for
this asset.

### `## Placement rules`

The mechanical rules: anchor, scale, layer/z-order, collision
shape, padding, grid alignment, safe areas.

### `## Style constraints`

What must be preserved if anything is edited, generated, or recolored
around this asset. Palette hex codes. Line weight. Brushwork.
Lighting direction. Outline rules.

### `## Animation or interaction notes`

Allowed animations, interactions, sound triggers, gameplay
behavior. Frame counts and tween durations live here.

### `## Prompting guidance`

How an AI should *refer to* this asset when generating sibling
assets. The canonical short description ("warm hand-painted brown
bear in green apron and bowtie"). Palette references. What to copy
from this card and what to vary.

This section is what an agent reads when it's generating a *related*
asset, not when it's using this one directly.

---

## Authoring tips

- **Start with the starter.** `asset-md create <path>` gives you a
  card pre-populated for the inferred type. Edit it; don't write from
  scratch.
- **Be specific.** "Use as a UI element" is useless. "Anchor
  `top_right`, offset (-16, 16), bound to the player's coin total" is
  what an agent can act on.
- **Adjacent failure modes matter.** Most agent mistakes come from
  plausible-but-wrong placements. The `forbidden` list is where you
  rule those out.
- **Prefer rules over prose.** A bullet in `usage.forbidden` is a
  contract; a paragraph deep in the body is a hope.
- **One asset per card.** Don't try to describe a family of related
  assets in one card. Make a card for the family's representative,
  and reference it from the siblings' `## Prompting guidance`.
- **Cards get better over time.** A `draft` card with one `intended`
  bullet is already better than no card. Add rules as agents teach
  you what they get wrong.

---

## What the validator checks

(For the full rules, see [`ASSET_SPEC.md`](../ASSET_SPEC.md).)

1. Card has YAML frontmatter.
2. `id`, `type`, `status`, `source` exist.
3. `type` is one of the enum values above.
4. The file at `source` exists on disk (unless
   `--allow-missing-source` is set).
5. Every required H2 section is present in the body.

`asset-md validate` reports every issue in one pass and exits
non-zero on failure — wire it into CI.

---

## Examples

See [`examples/`](../examples) for three fully-written sample
projects covering characters, backgrounds, UI, audio, music, props,
tilesets, and dialog portraits. Each card is intended as a
*writing-style* reference, not a production asset library.
