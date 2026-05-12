---
id: general_store
type: background
status: approved
tags: [interior, store, hero-scene]
source: assets/backgrounds/general_store.png
engine:
  godot_node: Sprite2D
  anchor: center
usage:
  intended:
    - Main backdrop of the store interior scene.
    - Title-screen ambient background (slightly blurred variant).
  forbidden:
    - As a parallax mid-layer — it is a single flat painting.
    - As a generic interior for other shops or houses.
ai:
  preserve_style: true
  allow_recolor: false
  allow_crop: true
---

# Asset: General Store

## What this asset is
A wide hand-painted interior of a wooden general store: shelves lined
with jars and tins, warm window light from the left, a worn plank
floor. It is the visual anchor of the game's primary scene.

## Intended use
Place as the bottom-most sprite of `scenes/store_interior.tscn`,
centered behind all gameplay layers. A blurred copy serves as the
main-menu backdrop with reduced saturation.

## Do not use for
Not a parallax background — there is no second plane. Do not reuse for
other shops (the bakery, the smithy each have their own painting). Do
not place foreground objects on top of objects already painted in.

## Placement rules
- Layer: `bg` (lowest).
- Anchor: scene center; the painting is wider than the camera so safe
  cropping is allowed on left/right edges only.
- Never scale below 1.0 — the painted detail loses cohesion.

## Style constraints
- Warm sunlight only — never edit to night without producing a
  separate dedicated night variant.
- Wood grain and shelf labels are hand-painted; do not regenerate or
  upscale, as the texture will desync from sibling backgrounds.

## Animation or interaction notes
Static. The dust-mote particle effect (`vfx/dust_motes`) overlays this
background; do not bake the particles into the image.

## Prompting guidance
Describe as "a hand-painted cozy general store interior with warm
window light, wooden shelves, glass jars, and a worn plank floor."
When generating sibling shop interiors, match brushwork, palette
temperature, and shelf-to-floor ratio.
