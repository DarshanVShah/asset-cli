---
id: main_theme
type: music
status: approved
tags: [music, theme, title, recurring-motif]
source: assets/music/main_theme.ogg
engine:
  godot_node: AudioStreamPlayer
  anchor: n/a
usage:
  intended:
    - Title screen background music.
    - Credits roll.
    - The motif (first 8 bars) recurs in `mentor_route_theme.ogg`
      and `final_scene_piano.ogg`.
  forbidden:
    - As gameplay-scene background music — each chapter has its own track.
    - Layered over dialogue scenes — too thematically loaded.
ai:
  preserve_style: true
  allow_recolor: false
  allow_crop: false
---

# Asset: Main Theme

## What this asset is
A 2 minute 40 second piano-and-strings instrumental in A minor.
Loop point at 0:08 → 2:32 (the intro plays once, then the body
loops). Composed as the leitmotif for the whole project — the
opening 8-bar piano figure recurs in two other tracks.

## Intended use
Plays under the title screen and credits. Bus: `music`. Volume:
-8 dB. Crossfade in over 1.5s when the title screen opens; fade
out over 2s when starting a new game.

## Do not use for
Not for any in-game scene; chapters have their own scoring. Do
not layer beneath dialog — the piano figure is too recognizable
and will pull focus from spoken text.

## Placement rules
- Bus: `music`.
- Volume: -8 dB.
- Loop region: 0:08 → 2:32 (samples 352800 → 6703200 at 44.1k).
- Only one music track plays at a time; never stack with another
  music asset.

## Style constraints
- Do not re-encode lossily for runtime; the OGG is already
  optimized.
- Do not pitch-shift or time-stretch — the leitmotif must remain
  recognizable across all sibling tracks.

## Animation or interaction notes
None directly, but the title-screen logo fade-in is timed to the
0:08 motif entry — if you change the loop point you must update
the title-screen animation as well.

## Prompting guidance
Refer to as "the main theme leitmotif: piano + strings in A minor,
intro motif at 0:00, loop body from 0:08." When generating sibling
arrangements (solo piano, music box, full ensemble), preserve the
8-bar opening motif intact; vary only instrumentation and tempo.
