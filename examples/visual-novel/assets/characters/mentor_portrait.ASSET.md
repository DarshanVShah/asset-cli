---
id: mentor_portrait
type: character
status: approved
tags: [portrait, dialog, mentor, recurring]
source: assets/characters/mentor_portrait.png
engine:
  godot_node: TextureRect
  anchor: bottom_right
usage:
  intended:
    - Dialog portrait whenever the mentor character is speaking.
    - Mentor route's chapter-header illustration (full-body crop variant).
  forbidden:
    - As a CG event illustration — those are dedicated assets.
    - As an icon, avatar, or UI badge — there is no licensed mini variant.
ai:
  preserve_style: true
  allow_recolor: false
  allow_crop: true
---

# Asset: Mentor Portrait

## What this asset is
A three-quarter-length portrait of the mentor character: mid-40s,
wearing a navy cardigan over a white shirt, glasses, kind but tired
expression. Rendered in soft cel-shading with hand-painted hair
detail. Transparent background.

## Intended use
Display in the right-side portrait slot of the dialog box whenever
the mentor speaks. The same source supports cropped variants for
chapter-header art (head-and-shoulders crop into a banner).

## Do not use for
Not a CG. Not a chibi icon. The mentor has different sprite assets
for those use cases; using this portrait outside its slot breaks
the visual hierarchy of dialog vs event vs UI.

## Placement rules
- Slot: `dialog_portrait_right`.
- Anchor: `bottom_right`, offset (-32, -200) so the figure sits
  above the textbox.
- Cropping is allowed only for chapter-header variants; never crop
  inside dialog scenes — the framing was painted intentionally.

## Style constraints
- Cel-shading lives on a fixed two-tone light/shadow split; do not
  add a third midtone.
- Hair texture is hand-painted — never apply a smoothing or
  upscaling filter that destroys brushwork.
- Cardigan must read as navy `#1f2a44`; do not shift palette by
  scene lighting.

## Animation or interaction notes
Static. Expression changes are handled by swapping to sibling
expression sprites: `mentor_portrait_concerned.png`,
`mentor_portrait_smiling.png`, etc. Each has its own card.

## Prompting guidance
"Visual novel mentor portrait: mid-40s, navy cardigan, glasses,
soft cel-shading with hand-painted hair, transparent background."
When generating sibling expressions, copy clothing palette, pose
framing, and shading split exactly — only the face changes.
