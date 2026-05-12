# Using asset-md with Cursor

[Cursor](https://cursor.sh) supports project-scoped rules via
`.cursor/rules/*.mdc` files. `asset-md` ships a generator that writes
the right `.mdc` with the right metadata so the rule auto-applies
when working in `assets/`.

---

## 1. Install the rule

From your project root:

```bash
asset-md rules --target cursor
```

That writes:

```
.cursor/rules/assets.mdc
```

The `.mdc` includes the right Cursor metadata:

```yaml
---
description: How to work with creative assets in this repo via .ASSET.md sidecars
globs:
  - assets/**
  - "**/*.ASSET.md"
alwaysApply: true
---
```

Cursor will pick this up the next time you open the project.

---

## 2. What Cursor will do

With the rule active, Cursor's models will:

- Read the sibling `.ASSET.md` before referencing an asset.
- Follow the card's `usage.intended`, `usage.forbidden`, and `ai.*`
  flags.
- Ask for a card when one is missing rather than guessing.

The `alwaysApply: true` + `globs` combination means the rule fires
whenever you're working in `assets/` or editing any `.ASSET.md`.

---

## 3. Useful Cursor prompts

> "Wire up the coin counter HUD."
> → Cursor reads `assets/ui/coin_counter.ASSET.md` and uses the
> anchor/offset rules from the card.

> "Find every asset whose `ai.allow_recolor` is `false` and list it."
> → Cursor reads `ASSET_MANIFEST.json` and filters.

> "Refactor the store scene to use the approved bear, not the draft."
> → Cursor uses `status: approved` vs `draft` to disambiguate.

You can also `Cmd-L` (Inline Edit) on an asset path and let Cursor
read the card automatically when the rule is active.

---

## 4. CI: enforce cards in PRs

Same as any other integration:

```yaml
- run: npx asset-md validate
```

If you use Cursor's Background Agents, validation failures become
visible in the agent's task list.

---

## 5. Updating the rule

If you change asset-md versions and want the latest rule:

```bash
asset-md rules --target cursor --force
```

That rewrites the `.mdc` file completely.

---

## 6. Tip: keep `ASSET_MANIFEST.json` committed

For Cursor specifically — its file-tree-aware indexing benefits from
having the manifest committed. Tasks that span many assets ("find all
deprecated UI elements", "list every prop tagged 'holiday'") become
one search away.
