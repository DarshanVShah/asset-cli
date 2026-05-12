---
id: player_knight
type: character
status: approved
tags: [player, knight, top-down, animated]
source: assets/characters/player_knight.png
engine:
  godot_node: AnimatedSprite2D
  anchor: bottom_center
usage:
  intended:
    - The player avatar in all gameplay scenes.
    - Top-down 4-direction walking and attacking animations.
  forbidden:
    - As an NPC or enemy sprite.
    - In dialog portraits — there is a separate portrait asset for that.
ai:
  preserve_style: true
  allow_recolor: false
  allow_crop: false
---

# Asset: Player Knight

## What this asset is
A 32x32 pixel-art knight in plate armor, drawn as a top-down
4-direction sprite sheet. Six rows: idle-down, idle-up, idle-side,
walk-down, walk-up, walk-side. Eight frames per walk row. Side
animations are flipped horizontally for left/right.

## Intended use
Instantiate via `AnimatedSprite2D` on the player scene. Bind input
to the animation state machine: idle when velocity is zero, walk
otherwise; direction follows the dominant input axis.

## Do not use for
Not an NPC. Not an enemy. Not a portrait. Anywhere the player is
shown talking, use `characters/player_knight_portrait.png` instead —
that asset is drawn at a different resolution and style.

## Placement rules
- Tile grid: 32px.
- Anchor: `bottom_center` so the feet align with the tile floor.
- Collision shape: 12x10px box at the feet only — never include the
  full sprite bounds.
- Z-index: matches the player's Y-coordinate for proper top-down
  depth sorting.

## Style constraints
- Strict 4-color armor ramp: `#c8d3df`, `#8a9aab`, `#52617a`, `#2a3140`.
- Outline is the darkest ramp color, 1px, never anti-aliased.
- Frame size is 32x32 exactly; do not pad or scale.
- All animations export at integer pixel offsets — no sub-pixel motion.

## Animation or interaction notes
Six required animations, all 8 frames at 8 fps: `idle_down`,
`idle_up`, `idle_side`, `walk_down`, `walk_up`, `walk_side`. Attack
animations live in the separate `player_knight_attack.png` sheet.

## Prompting guidance
Refer to as "the player knight, top-down 32x32 pixel-art" and cite
the four-color armor ramp. When generating equipment overlays
(helmet upgrades, capes), match the ramp exactly and respect the
1px outline — palette drift is the most common failure mode here.
