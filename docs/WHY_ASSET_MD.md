# Why ASSET.md?

> AI agents are increasingly asked to use creative assets they did not make.
> They have no context, no constraints, and no idea what the asset is for.
> `ASSET.md` fixes that — with the lightest-weight artifact possible.

---

## The problem

You hand an AI coding agent a task:

> "Add the shopkeeper to the store scene."

The agent looks at the project and sees:

```
assets/characters/shopkeeper_bear.png
```

The agent has to decide, *from a filename*:

- Is it a character? Or a logo? Or a decorative prop?
- What anchor and scale should it use?
- Can it be recolored to match a holiday event?
- Is it allowed to crop the image to fit a panel?
- What palette must be preserved?
- Is it the *current* shopkeeper or a deprecated draft?

The model guesses, and the guess is sometimes right, sometimes
disastrously wrong. Worse: the next agent run might guess differently.
There is no source of truth.

This is the same problem code had in the 1990s when a function's
behavior lived only in the author's head. We solved it for code with
docstrings, comments, and READMEs. We have not solved it for art.

---

## What people try first (and why it fails)

| Workaround | Why it falls over |
| --- | --- |
| **Filename conventions** (`bear_npc_shopkeeper_v2_DO_NOT_RECOLOR.png`) | Doesn't scale. Filenames become unreadable. Agents still miss subtle rules. Renames break references. |
| **A spreadsheet of asset metadata** | Lives outside Git, drifts from reality, agents can't read it without bespoke tooling. |
| **Embedding tags in EXIF/XMP** | Format-dependent (no XMP in `.wav`). Tools can't reliably read or write. Lost on export. |
| **A central database / asset CMS** | Heavy. Requires a daemon, accounts, sync. Reverses the relationship: now the *repo* is downstream of the asset system. |
| **README files per folder** | Closer. But not per-asset, so the rules become coarse and you stop reading them. |

What we want is the artifact closest to the asset, that lives in the
same Git tree, that any tool (human, AI, CI) can read without setup.

---

## The proposal

For every asset, a sibling Markdown file with YAML frontmatter:

```
assets/characters/shopkeeper_bear.png
assets/characters/shopkeeper_bear.ASSET.md
```

The card holds:

- **What the asset is** in plain language.
- **Where it should be used** and **where it must not be used**.
- **Style constraints** an AI must preserve.
- **AI-specific flags** (`preserve_style`, `allow_recolor`, `allow_crop`).
- **Engine hints** (Godot node type, anchor, layer).
- **Prompting guidance** for generating *related* assets.

It is a README for one specific asset. Nothing more.

---

## Why this works

1. **It lives in the repo.** No daemon, no DB, no accounts. The card
   travels with the asset through clones, branches, and reviews.
2. **It's plain text.** Humans, AI agents, Git diffs, code review, and
   `grep` all work. No proprietary format.
3. **It's validated.** `asset-md validate` is a CI gate. Missing or
   broken cards fail the build before they confuse an agent.
4. **It's bounded.** Seven required sections, one enum-typed field, a
   handful of AI flags. The format is small enough to fit in an
   agent's context window for any single task.
5. **It is the same problem we already solved for code.** Code has
   READMEs and docstrings; creative assets get an equivalent.

---

## What an agent does differently

With a sibling `.ASSET.md`, an AI agent's loop becomes:

```
on_asset_use(path):
  card = read_sibling_asset_md(path)
  if card:
    apply(card.usage.intended)
    forbid(card.usage.forbidden)
    enforce(card.ai.*)
  else:
    halt_and_warn("missing asset card for " + path)
```

Two consequences:

- **The agent stops inferring intent from filenames.** The
  filename is now just an identifier; the card is the contract.
- **Missing cards become a *signal*, not a guess.** The agent can
  refuse to act and ask the human to write a card. That's the right
  failure mode.

The `asset-md rules` command writes the equivalent policy into
`CLAUDE.md`, `.cursor/rules/assets.mdc`, `CODEX.md`, or `AGENTS.md`,
so each agent platform's native rule-loading mechanism picks it up.

---

## Why now

Three things shifted in 2025–2026:

1. **Coding agents started using assets.** A year ago, "AI in
   game dev" meant generating sprites. Now agents wire those sprites
   into scenes, dialog systems, and UI — which means they make
   intent decisions that the model has no context for.
2. **Repos became the source of truth for agents.** With MCP, project
   rules files, and per-tool conventions, agents now read the repo
   the same way humans do. A `.ASSET.md` is something they can read
   *today*, no infrastructure required.
3. **Creative teams care about style guardrails again.** Brand
   palettes, character canon, accessibility constraints — these are
   real liabilities when an agent can plausibly generate or remix
   art. A version-controlled card is the cheapest possible guardrail.

---

## What ASSET.md is *not*

- It is **not** a digital asset management system. It does not
  thumbnail, version, search, or transcode.
- It is **not** a license database. It can hold a `license` tag; it
  does not adjudicate rights.
- It is **not** a generator. You bring your own art.
- It is **not** an engine plugin. Engines that want to consume the
  metadata can read `ASSET_MANIFEST.json` — that's the integration
  point.
- It is **not** a replacement for code review or art direction. It is
  a record of the decisions a reviewer/director has already made, so
  those decisions survive the next AI-assisted edit.

---

## Where to go next

- [README](../README.md) — install + 30-second quickstart.
- [docs/SPEC.md](./SPEC.md) — how to author a card.
- [examples/](../examples) — three high-quality sample projects.
- [docs/integrations/](./integrations) — wiring asset-md into Claude
  Code, Cursor, Codex, and Godot.
