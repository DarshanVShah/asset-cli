---
id: health_potion
type: prop
status: approved
tags: [item, consumable, pickup, healing]
source: assets/props/health_potion.png
engine:
  godot_node: Sprite2D
  anchor: center
usage:
  intended:
    - World pickup that restores 25 HP when collected.
    - Inventory icon (same sprite, no recolor).
    - Shop merchant listings.
  forbidden:
    - As decoration in scenes where it cannot be picked up.
    - Recolored to imply a different effect (mana, stamina, etc.).
ai:
  preserve_style: true
  allow_recolor: false
  allow_crop: false
---

# Asset: Health Potion

## What this asset is
A 16x16 pixel-art bottle: small flask with a cork stopper, filled
with red liquid, drawn in the same palette family as the player
knight. Single-frame static sprite.

## Intended use
Drop in the world as an `Area2D` pickup that calls
`player.heal(25)` on body-enter. Reuse the same sprite as the
inventory tile and the shop listing — no scaling, no recoloring.

## Do not use for
Not for decorative shelves or scenes where the player cannot
interact. Do not recolor blue/green/yellow to represent mana,
stamina, or other effects — each consumable has its own card and
its own sprite (see `mana_potion.ASSET.md`, etc.).

## Placement rules
- Layer: `pickups`.
- Anchor: `center` so the bottle sits visually on its tile.
- Tile size: 16x16; do not scale to 32x32 — the pixel ramp breaks.
- Collision: full sprite bounds for pickup.

## Style constraints
- Liquid color: `#c23a3a` exactly. Cork: `#7a4f30`. Glass shine:
  `#ffffff` single pixel only.
- 1px outline in `#2a1a1a`. No anti-aliasing.
- Must match other consumable bottles in flask silhouette so the
  family reads as a set.

## Animation or interaction notes
Static in world, but the parent scene applies a 0.5Hz vertical bob
(±2px) and a soft glow particle effect (`vfx/pickup_glow`) — do not
bake either into the sprite itself.

## Prompting guidance
"Pixel-art red health potion, 16x16, cork-stopped flask, same
palette as the player knight." When generating other consumables,
match flask silhouette and outline exactly; vary only the liquid
color and the card name.
