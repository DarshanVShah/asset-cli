---
id: classroom_evening
type: background
status: approved
tags: [school, classroom, evening, story-key-scene]
source: assets/backgrounds/classroom_evening.png
engine:
  godot_node: Sprite2D
  anchor: center
usage:
  intended:
    - Backdrop for every classroom scene set in the late afternoon
      and early evening.
    - Chapter 3 climax conversation.
  forbidden:
    - As a daytime classroom scene — there is a separate daytime variant.
    - Cropped to a tight portrait shot — the wide framing is intentional.
ai:
  preserve_style: true
  allow_recolor: false
  allow_crop: false
---

# Asset: Classroom (Evening)

## What this asset is
A wide painted background of an empty Japanese high-school
classroom in late-afternoon light: warm sunset slanting through the
right-side windows, long shadows across the wooden desks, chalkboard
faintly dusted, hallway visible through the open door. 1920x1080.

## Intended use
Use as the bottom-most sprite of any classroom scene tagged
`time_of_day: evening`. Pair with the evening lighting layer
(`vfx/classroom_evening_dust`) and the warm ambient bus.

## Do not use for
Do not use for daytime classroom scenes (the lighting direction
and palette differ — `classroom_day.ASSET.md`). Do not use for
night scenes (`classroom_night.ASSET.md`). Do not crop tightly
on a single desk; the wide framing carries emotional weight.

## Placement rules
- Layer: `bg` (lowest).
- Anchor: scene center. Camera fits to the image; do not pan.
- No scale. No tint. No runtime color grade.

## Style constraints
- Sunset palette is fixed: warm oranges in window areas, cool
  shadow purples elsewhere. Do not equalize.
- Wood grain and chalkboard detail are hand-painted; do not
  auto-upscale or denoise.
- The hallway-through-doorway suggests offstage presence — keep
  the door open in all uses.

## Animation or interaction notes
Static painting. Atmosphere comes from the dust-motes particle
overlay (`vfx/classroom_evening_dust`) and the SFX bed
(`audio/classroom_evening_ambient`). Do not bake either into the
image.

## Prompting guidance
"Visual novel background: empty Japanese high-school classroom at
late afternoon, warm sunset through right-side windows, long
shadows, open door to hallway." When generating sibling moods
(rain, dusk, night), match camera framing exactly and shift only
lighting and palette.
