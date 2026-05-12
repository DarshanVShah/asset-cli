---
id: forest_tileset
type: tileset
status: approved
tags: [biome, forest, terrain, autotile]
source: assets/tilesets/forest_tileset.png
engine:
  godot_node: TileMap
  anchor: top_left
usage:
  intended:
    - Ground and terrain for all forest biome maps.
    - Tree, bush, and rock decoration tiles for the same biome.
  forbidden:
    - As a generic ground for non-forest biomes (desert, snow, cave).
    - Extracted as standalone props — tiles are not standalone art.
ai:
  preserve_style: true
  allow_recolor: false
  allow_crop: false
---

# Asset: Forest Tileset

## What this asset is
A 16x16 pixel-art tilesheet for the forest biome: grass autotile
(47 wang variants), dirt path autotile, tree canopy and trunk
tiles, bushes, mossy rocks, and a stream water autotile. Total
sheet: 384x384, organized into labeled rows.

## Intended use
Import into a `TileMap` and configure the autotile bitmasks to
match the row layout. Use for every map flagged `biome: forest`.
Combine with the forest-biome ambient audio and the matching
foliage particle effect.

## Do not use for
Do not use this tileset's grass for desert or snow maps — those
biomes have dedicated tilesets that match their own palettes. Do
not extract a single tree tile to use as a standalone prop; the
tree is composed across multiple tiles and reads wrong in isolation.

## Placement rules
- Tile size: 16x16 strictly.
- Z-order: ground < paths < decor < tree-canopy < weather.
- Autotile rows: row 0 grass, row 1 dirt, row 2 water, rows 3–7
  decor. Do not rearrange — the bitmask offsets are baked into the
  map data.

## Style constraints
- 4-color ramp per material (grass, dirt, water, foliage).
- No anti-aliasing; all transitions live in the wang variants.
- Lighting direction: top-left, consistent across every tile.

## Animation or interaction notes
The water autotile expects an 8-frame animation cycle at 4 fps,
driven by the TileMap's animation slot. No other tile is animated.
Footstep sounds depend on which tile the player stands on — see
`audio/footstep_*.wav`.

## Prompting guidance
"16x16 pixel-art forest biome tileset, 4-color material ramps,
top-left lighting." When generating additional decor tiles for this
biome, match palette, lighting direction, and outline weight. Do
not generate sibling biomes from this card — open the dedicated
biome card instead.
