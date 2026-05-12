# Using asset-md with Codex CLI

The [Codex CLI](https://openai.com/codex) reads project conventions
from `AGENTS.md` (and some users keep an additional `CODEX.md` for
Codex-specific notes). `asset-md` ships generators for both.

---

## 1. Install the rule

Pick one:

```bash
# Recommended: the generic AGENTS.md path that most agent CLIs respect.
asset-md rules --target agents

# Or Codex-specific:
asset-md rules --target codex

# Or both:
asset-md rules --all
```

`asset-md rules` is idempotent — re-running won't duplicate the
section. Pass `--force` to rewrite after an asset-md upgrade.

---

## 2. What Codex will do

With the rule in place, Codex (paraphrased):

> Before using any creative asset, check whether a matching
> `.ASSET.md` sidecar file exists. If it does, read it first and
> follow its usage rules, placement rules, style constraints, AI
> constraints, and forbidden-use rules. Do not infer the asset's role
> from filename alone when an asset card is available.

So when you ask Codex to:

> "Place the player knight in the forest map."

…it reads `assets/characters/player_knight.ASSET.md`, applies the
anchor/scale/layer rules, and respects the
`preserve_style`/`allow_recolor`/`allow_crop` flags.

---

## 3. Streaming a card into a one-off task

For tasks where you don't want to rely on the project rule, paste a
prompt block into the conversation:

```bash
asset-md prompt assets/characters/player_knight.png
```

Output:

```
Before using `assets/characters/player_knight.png`, read and
follow `assets/characters/player_knight.ASSET.md`.

Asset summary:
- Type: character
- Status: approved
- Intended use: ...
- Forbidden use: ...
- Style preservation: true
...
```

Copy that block into the prompt and the agent has the full context
without depending on the project rule.

---

## 4. CI

```yaml
- run: npx asset-md validate
```

If your Codex sessions go via PRs, the validator gates them the same
way it gates human PRs.

---

## 5. Updating the rule

```bash
asset-md rules --target agents --force
# or
asset-md rules --target codex --force
```

That rewrites the asset-md section in place. The rest of `AGENTS.md`/
`CODEX.md` is untouched.
