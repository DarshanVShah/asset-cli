---
id: shopkeeper_bear
type: character
status: approved
tags: [npc, shopkeeper, mascot, cozy]
source: assets/characters/shopkeeper_bear.png
engine:
  godot_node: AnimatedSprite2D
  anchor: bottom_center
usage:
  intended:
    - Behind the counter in the main store scene.
    - Idle, greet, and transact animations during open hours.
    - Tutorial dialog speaker for first-run players.
  forbidden:
    - Outside the store interior (no overworld appearances).
    - As a generic placeholder for any other NPC.
    - Recolored or restyled — the bear is a brand mascot.
ai:
  preserve_style: true
  allow_recolor: false
  allow_crop: false
---

# Asset: Shopkeeper Bear

## What this asset is
A warm, slightly chubby brown bear in a green apron and bowtie, drawn
in soft-edged hand-painted style. He is the proprietor of the general
store and the player's first NPC contact in the game.

## Intended use
Place him behind the wooden counter in `scenes/store_interior.tscn`,
anchored at his feet so his floor contact stays consistent across
animation frames. He should appear during all store-open hours and
drive transaction dialog. Reuse him as the speaker for the new-player
tutorial.

## Do not use for
Do not place him in outdoor scenes, do not use him as a stand-in for
unwritten NPCs, and do not adapt his sprite for villains or enemies.
He is a friendly authority figure and his on-screen meaning must stay
narrow.

## Placement rules
- Layer: `npc` (between `floor_props` and `foreground_lighting`).
- Anchor: `bottom_center` — his paws should rest on the counter base.
- Scale: 1.0; do not scale beyond 0.9–1.1 to fit a scene.
- Always face the player; never mirror to face away.

## Style constraints
- Keep the painted, slightly grainy texture.
- Palette is fixed: apron green `#5a8a4f`, bow `#b8453d`, fur `#7a4f30`.
- Outline weight is intentionally soft — do not auto-trace or sharpen.
- Do not introduce shading inconsistent with the game's flat-pastel style.

## Animation or interaction notes
Three required animations: `idle` (2s breath cycle), `greet` (waves
when the player enters the store), `transact` (slides item across the
counter). Voice barks (`assets/audio/bear_*.wav`) trigger on greet and
on completed purchase.

## Prompting guidance
When an AI generates related art (icons, dialog portraits, store
signage), refer to him as "the shopkeeper bear" and describe his
apron, bowtie, and warm expression. Do **not** prompt generic "bear
shopkeeper" — that drifts the style. For derived assets, anchor on
this card's palette and silhouette.
