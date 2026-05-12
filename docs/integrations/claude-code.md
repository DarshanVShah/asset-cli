# Using asset-md with Claude Code

[Claude Code](https://docs.anthropic.com/claude-code) reads
`CLAUDE.md` files at the repo root and in subdirectories for project
context. Drop the asset-md rule in once and every session picks it up.

---

## 1. Install the rule

From your project root:

```bash
asset-md rules --target claude
```

This either:
- Creates `CLAUDE.md` with the rule, or
- Appends an `## Working with creative assets (asset-md)` section to
  your existing `CLAUDE.md` (idempotent — re-running won't duplicate it).

`--force` rewrites the section if you want to update it after an
asset-md upgrade.

---

## 2. What Claude Code will do

Once `CLAUDE.md` contains the rule, Claude will (paraphrased):

> Before using any creative asset, check for a matching `.ASSET.md`
> sidecar. If it exists, read it first and follow its usage rules,
> placement rules, style constraints, AI constraints, and forbidden-
> use rules.

In practice this means Claude:

- Reads the sibling card before placing or referencing an asset.
- Respects `usage.intended`, `usage.forbidden`, and the `ai.*` flags.
- Stops short and asks for a card when one is missing.

---

## 3. Useful prompts

Once the rule is installed, these prompts work well:

> "Place the shopkeeper bear in the store scene."
> → Claude reads `assets/characters/shopkeeper_bear.ASSET.md` first
> and uses the anchor/scale/layer rules from the card.

> "Generate a sibling NPC for the bakery in the same style as the
> shopkeeper bear."
> → Claude reads the bear's `## Prompting guidance` section to know
> what to copy and what to vary.

> "Add a holiday recolor of the coin counter."
> → If the card has `allow_recolor: true`, Claude proceeds. If it has
> `allow_recolor: false`, Claude pushes back rather than silently
> recoloring.

You can also paste a single card's prompt block into a one-off chat:

```bash
asset-md prompt assets/characters/shopkeeper_bear.png | pbcopy
```

---

## 4. CI: enforce cards in PRs

Add a step to your existing CI:

```yaml
- name: Validate asset cards
  run: npx asset-md validate
```

Claude will see green/red feedback the same way humans do — a missing
or malformed card fails the build before merge.

---

## 5. Manifest as context

For tasks that touch many assets, give Claude the manifest:

```bash
asset-md manifest
# now ASSET_MANIFEST.json holds every valid card's metadata
```

`@ASSET_MANIFEST.json` (or whatever file-reference syntax your
workflow uses) gives Claude the full asset index in one shot — handy
for refactors, scene assembly, and asset-pass reviews.

---

## 6. When asset-md upgrades

If a future version changes the rule wording or adds new flags:

```bash
asset-md rules --target claude --force
```

That rewrites the asset-md section in `CLAUDE.md` without touching
anything else in the file.
