# Demo

Three ways to demo `asset-md`:

1. [**Copy-paste script.**](#copy-paste-script) Run it in your
   terminal in 60 seconds.
2. [**Transcript.**](#what-it-looks-like) Read what the script would
   print, no install required.
3. [**Record a GIF.**](#recording-a-gif) Use the included `vhs` tape
   to produce `docs/demo.gif` for the README.

The story is the same in all three: from "I have a bunch of assets"
to "every asset has a card and validation passes" in about a minute.

---

## Copy-paste script

```bash
# 1. New empty project.
mkdir asset-md-demo && cd asset-md-demo

# 2. Scaffold.
asset-md init

# 3. Drop in a few placeholder assets (in real life, your art lives here).
mkdir -p assets/characters assets/ui assets/audio
touch assets/characters/shopkeeper_bear.png \
      assets/ui/coin_counter.png \
      assets/audio/register_chime.wav

# 4. See what's missing.
asset-md scan

# 5. Generate starter cards for every asset.
asset-md create-missing

# 6. Validate.
asset-md validate

# 7. Build a project-level manifest.
asset-md manifest

# 8. Get an agent-ready instruction block for one asset.
asset-md prompt assets/characters/shopkeeper_bear.png

# 9. Drop the agent rule into CLAUDE.md (or --target cursor/codex/agents).
asset-md rules --target claude
```

End state:

```
asset-md-demo/
├── ASSET_MANIFEST.json
├── ASSET_SPEC.md
├── CLAUDE.md
├── asset-md.config.json
├── assets/
│   ├── audio/
│   │   ├── register_chime.ASSET.md
│   │   └── register_chime.wav
│   ├── characters/
│   │   ├── shopkeeper_bear.ASSET.md
│   │   └── shopkeeper_bear.png
│   └── ui/
│       ├── coin_counter.ASSET.md
│       └── coin_counter.png
└── examples/
```

---

## What it looks like

Output captured from a real run on `2026-05-12`:

```
$ asset-md init

asset-md init
✓ ASSET_SPEC.md created
✓ asset-md.config.json created
✓ assets/ created
✓ examples/ created

Done. Try:
  asset-md scan
  asset-md create-missing
```

```
$ asset-md scan

asset-md scan assets
config: asset-md.config.json

Total assets found:      3
With .ASSET.md card:     0
Missing .ASSET.md card:  3
Ignored files:            0

Missing cards:
  assets/audio/register_chime.wav
  assets/characters/shopkeeper_bear.png
  assets/ui/coin_counter.png

Run `asset-md create-missing` to generate cards for these.
```

```
$ asset-md create-missing

asset-md create-missing assets
config: asset-md.config.json

Created cards:        3
Skipped (had card):   0
Ignored files:        0

Created:
✓   assets/audio/register_chime.ASSET.md
✓   assets/characters/shopkeeper_bear.ASSET.md
✓   assets/ui/coin_counter.ASSET.md
```

```
$ asset-md validate

asset-md validate assets
config: asset-md.config.json
✓ assets/audio/register_chime.ASSET.md
✓ assets/characters/shopkeeper_bear.ASSET.md
✓ assets/ui/coin_counter.ASSET.md

Valid:   3
Invalid: 0
Total:   3
```

```
$ asset-md prompt assets/characters/shopkeeper_bear.png

Before using `assets/characters/shopkeeper_bear.png`, read and
follow `assets/characters/shopkeeper_bear.ASSET.md`.

Asset summary:
- Type: character
- Status: draft
- Intended use: Use as a character sprite in gameplay scenes.
- Forbidden use: Do not use as a background, prop, or UI element.
- Style preservation: true
- Recolor allowed: false
- Crop allowed: false

Agent rule:
Use this asset according to its asset card. Do not infer its role
from the filename alone. Preserve all listed style and usage
constraints.
```

---

## Recording a GIF

We use [VHS](https://github.com/charmbracelet/vhs) (free, MIT, runs
locally) to make reproducible terminal recordings. Install once:

```bash
brew install vhs        # macOS
# or grab a release from the VHS repo on other platforms
```

Then from the repo root:

```bash
vhs docs/demo.tape
```

That produces `docs/demo.gif`. Commit the tape; do not commit the GIF
unless the repo is the canonical home for the GIF — most embeds are
better served by uploading the GIF to GitHub Releases or your hosting
of choice and linking from the README.

### The tape

`docs/demo.tape` contains:

```
# asset-md 60-second demo
Output docs/demo.gif

Set FontSize 14
Set Width 1100
Set Height 700
Set Theme "Catppuccin Mocha"
Set Padding 20
Set TypingSpeed 35ms

# Setup happens off-camera so the demo focuses on the CLI itself.
Hide
Type "rm -rf /tmp/asset-md-demo && mkdir -p /tmp/asset-md-demo && cd /tmp/asset-md-demo"
Enter
Type "mkdir -p assets/characters assets/ui assets/audio"
Enter
Type "touch assets/characters/shopkeeper_bear.png assets/ui/coin_counter.png assets/audio/register_chime.wav"
Enter
Type "clear"
Enter
Show

Type "# A new game project with three assets and no cards."
Enter
Sleep 800ms
Type "asset-md scan"
Enter
Sleep 2500ms

Type "# Generate starter cards for everything missing one."
Enter
Sleep 800ms
Type "asset-md create-missing"
Enter
Sleep 2500ms

Type "# Validate that every card meets the spec."
Enter
Sleep 800ms
Type "asset-md validate"
Enter
Sleep 2500ms

Type "# Print an agent-ready instruction block for one asset."
Enter
Sleep 800ms
Type "asset-md prompt assets/characters/shopkeeper_bear.png"
Enter
Sleep 4000ms

Type "# Drop the asset-aware rule into CLAUDE.md."
Enter
Sleep 800ms
Type "asset-md rules --target claude"
Enter
Sleep 2500ms

Type "# Done. Your agent now knows what every asset is for."
Enter
Sleep 2500ms
```

### Tips for a tight recording

- Keep total time under 60 seconds. The story is *fast*.
- Use a dark theme (`Catppuccin Mocha`, `Dracula`, etc.) — the
  green ✓ marks pop better against dark backgrounds.
- Don't show typos. The `Hide`/`Show` directives let you stage the
  setup off-camera; use them.
- Match the README's narrative beat-for-beat: scan → create-missing →
  validate → prompt → rules. Anything else is a distraction.
