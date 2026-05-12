---
id: coin_counter
type: ui
status: approved
tags: [hud, currency, top-right]
source: assets/ui/coin_counter.png
engine:
  godot_node: TextureRect
  anchor: top_right
usage:
  intended:
    - Top-right HUD element showing the player's current coin total.
    - Animates a +N tick when the player earns coins.
  forbidden:
    - In gameplay world layers — this is strictly HUD.
    - As decorative artwork anywhere else.
ai:
  preserve_style: true
  allow_recolor: true
  allow_crop: false
---

# Asset: Coin Counter

## What this asset is
A small UI panel: a brass-rimmed badge with a coin icon on the left
and a number readout on the right. The number area is empty in the
source PNG — the engine renders the count over it using the UI font.

## Intended use
Mount in the persistent HUD layer, anchored to the top-right corner
of the screen with a 16px margin. Bind its label to the player's
coin total. When coins change, trigger the `tick` tween (scale up
1.0 -> 1.15 -> 1.0 over 180ms).

## Do not use for
Not for in-world signs, not for transaction modals, and not for
non-currency counters (gems, hearts, energy each have their own
asset). This card asserts a specific HUD slot.

## Placement rules
- Layer: `hud`.
- Anchor: `top_right`, offset (-16, 16).
- Size: never scale below 0.75 or above 1.25.
- Reading order: always to the left of the pause button.

## Style constraints
- Brass rim color may be recolored to match seasonal events (gold
  default, silver winter, copper autumn). Provide a sibling variant
  rather than runtime-tinting.
- The coin icon inside the badge is the game's canonical coin —
  do not swap to other denominations.

## Animation or interaction notes
On coin gain: scale tween (1.0 -> 1.15 -> 1.0, 180ms) + the
`audio/register_chime` sound. On coin loss: brief red flash on
the number text only — the badge image itself does not change.

## Prompting guidance
Refer to it as "the coin-counter HUD badge" with explicit position
"top-right of the screen." When generating sibling HUD elements
(gem counter, energy meter), match badge geometry, rim thickness,
and font slot exactly so the HUD reads as a family.
