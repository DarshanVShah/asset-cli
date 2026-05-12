# asset-md examples

These three sample projects show what high-quality `.ASSET.md` cards
look like in practice. They do **not** include real asset binaries —
each `assets/<category>/` folder contains a `.gitkeep` so you can
drop your own art/audio in and the layout still works.

- `cozy-store-game/` — a small store-management game.
- `pixel-rpg/` — a top-down RPG.
- `visual-novel/` — a dialogue-heavy school-life VN.

Open any `.ASSET.md` to see the structure: YAML frontmatter on top,
followed by the required H2 sections.

Validate one of the examples:

```
asset-md validate examples --allow-missing-source
```

We pass `--allow-missing-source` because we don't ship the binaries.
The cards still validate against the schema and the required-section
rules — only the on-disk source-file check is relaxed.

You can also validate a single project:

```
asset-md validate examples/cozy-store-game --allow-missing-source
```
