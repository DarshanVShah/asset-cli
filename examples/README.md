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
cd examples/cozy-store-game
asset-md validate
```

Validation will flag missing source files (because we don't ship the
binaries). That's expected — the cards demonstrate the *writing
style* you want, not the production state.
