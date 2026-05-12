# Integrations

`asset-md` is intentionally tool-agnostic — it produces plain Markdown
sidecars and a JSON manifest. These guides show how to wire those
artifacts into specific agent platforms and engines.

| Tool | Guide |
| --- | --- |
| Claude Code | [claude-code.md](./claude-code.md) |
| Cursor      | [cursor.md](./cursor.md) |
| Codex CLI   | [codex.md](./codex.md) |
| Godot       | [godot.md](./godot.md) |

The pattern is the same in every case:

1. Run `asset-md rules --target <tool>` once to install the project
   rule.
2. Either commit `ASSET_MANIFEST.json` or generate it on demand.
3. Point the tool at the card or manifest when it needs context.

If you wire `asset-md` into another tool, a PR adding a guide here is
very welcome — see [CONTRIBUTING.md](../../CONTRIBUTING.md).
