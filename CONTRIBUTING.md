# Contributing to asset-md

Thanks for the interest. `asset-md` is intentionally small — most
contributions should keep that property.

## TL;DR

```bash
git clone <repo>
cd asset-cli
npm install
npm test                 # vitest, 32+ tests
npm run lint             # tsc --noEmit
npm run build            # tsc -> dist/
```

Then run the CLI against the bundled examples or your own assets:

```bash
node dist/cli.js validate examples --allow-missing-source
```

---

## What we welcome

- **Bug reports** with a minimal reproduction (a tiny asset tree + the
  command that misbehaves is ideal).
- **New `type` values** in the asset-type enum, *if* you can show two
  or more real projects that need it. The enum is intentionally
  closed-ish.
- **Type-inference hints** (folder name / filename token mappings) for
  conventions you've seen in the wild.
- **Integration guides** in `docs/integrations/` for additional agent
  tools or engines.
- **Examples** in `examples/` that show high-quality `.ASSET.md`
  authoring for a domain we don't cover yet (e.g. tabletop, web
  illustration, audio plugins).

## What we are not building (yet)

- Cloud sync, hosted services, accounts.
- Visual editor or web UI.
- Computer-vision auto-tagging.
- Asset generation.
- A daemon or background process.
- Engine plugins (consume the manifest from your engine — that's
  enough).

If you're excited about one of these, we'd love a discussion issue
before code. The goal is to keep the core CLI tiny and the format
stable.

---

## Project layout

```
src/
  cli.ts                # commander entrypoint
  commands/             # one file per command
  util/                 # shared modules (config, scanner, card, infer, template, log, paths)
  constants.ts
test/                   # vitest suites — one per src/util module mostly
examples/               # sample projects, no binaries
docs/                   # WHY/SPEC/DEMO + integration guides
.github/workflows/ci.yml
```

Each command is its own file under `src/commands/`. Shared logic lives
in `src/util/`. Tests under `test/` mirror the module layout — when
adding a new util module, add a `.test.ts` for it.

---

## Pull request checklist

Before opening a PR:

- [ ] `npm run lint` is clean.
- [ ] `npm test` is green and every behavior change is covered by a
      test (add or update a test in `test/`).
- [ ] `npm run build` succeeds.
- [ ] If you changed the card schema or the validator, update
      `ASSET_SPEC.md` *and* `docs/SPEC.md` and adjust any affected
      example cards under `examples/`.
- [ ] If you added or removed a CLI command/flag, update `README.md`'s
      command reference.
- [ ] Run `node dist/cli.js validate examples --allow-missing-source`
      to ensure example cards still pass.
- [ ] Commit messages follow the repo's conventional style
      (`feat:`, `fix:`, `docs:`, `chore:`, `test:`, `ci:`).

## Commit style

Small, well-described commits. One feature per commit when possible.
Commit messages explain *why*, not *what* — the diff already shows the
what. Conventional prefixes (`feat:`, `fix:`, `docs:`, `chore:`,
`test:`, `ci:`) help CHANGELOG generation later.

## Tests

We use [Vitest](https://vitest.dev/). Tests live in `test/`. New
behavior needs a test; bug fixes need a regression test.

```bash
npm test                 # one-shot
npm run test:watch       # watch mode
```

## Releasing (for maintainers)

1. Bump `version` in `package.json`.
2. Update `CHANGELOG.md` (when we have one).
3. `npm run build && npm publish`.
4. Tag the release: `git tag v0.x.y && git push --tags`.

---

## Code of conduct

Be kind. This project's audience includes game devs, illustrators,
musicians, and AI tinkerers — not all of whom are TypeScript natives.
Explain things; don't gatekeep.
