---
id: register_chime
type: audio
status: approved
tags: [sfx, ui-feedback, currency]
source: assets/audio/register_chime.wav
engine:
  godot_node: AudioStreamPlayer
  anchor: n/a
usage:
  intended:
    - Plays whenever the player completes a sale at the counter.
    - Plays when the coin counter increments by any amount.
  forbidden:
    - As background ambience or in any looping context.
    - For any non-currency event (level-up, dialog click, etc.).
ai:
  preserve_style: true
  allow_recolor: false
  allow_crop: false
---

# Asset: Register Chime

## What this asset is
A short two-note brass-and-bell chime, ~600ms total, recorded with
a small handbell and a 1920s cash-register sample, mixed and gently
EQ'd. It is the game's signature "money happened" audio cue.

## Intended use
Trigger as a one-shot via `AudioStreamPlayer` whenever a sale closes
or the coin counter increments. Bus: `sfx`. Default volume: -6 dB.

## Do not use for
Not background music. Not a button click. Not a generic positive
sound — its meaning is specifically tied to currency. Reuse erodes
its signal value.

## Placement rules
- Bus: `sfx`.
- Volume: -6 dB (range allowed: -10 to -3).
- Polyphony: 2 max — if a third sale lands inside the tail, drop
  the oldest playback rather than stacking.

## Style constraints
- Do not pitch-shift more than ±2 semitones.
- Do not add reverb at runtime — the source already includes the
  intended room tone.
- Do not loop or extend; the natural decay is part of the cue.

## Animation or interaction notes
Pairs with the coin counter's tick tween (180ms) — the chime's
attack lands on tween start. Visual and audio cues must stay synced.

## Prompting guidance
When generating related cues (gem chime, dialog ding), match the
two-note structure and brass-bell timbre family. When the spec says
"reward sound," refer back to this card rather than inventing a new
chime — sibling cues should feel like the same instrument family.
