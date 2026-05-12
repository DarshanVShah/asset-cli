import * as fs from "fs";
import * as path from "path";
import { log, c } from "../util/log";
import { toPosix } from "../util/paths";

export type RulesTarget = "claude" | "cursor" | "codex" | "agents";

interface RulesOptions {
  target?: RulesTarget;
  all?: boolean;
  print?: boolean;
  force?: boolean;
}

const CORE_RULE = `Before using any creative asset, check whether a matching \`.ASSET.md\` sidecar file exists. If it exists, read it first and follow its usage rules, placement rules, style constraints, AI constraints, and forbidden-use rules. Do not infer the asset's role from filename alone when an asset card is available.`;

const HOW_TO_USE_BLOCK = `To inspect a card from the terminal:

\`\`\`
asset-md prompt <assetPath>
\`\`\`

To validate every card in the project:

\`\`\`
asset-md validate
\`\`\`

If a card is missing for an asset you need to use, generate one with:

\`\`\`
asset-md create <assetPath>
\`\`\``;

interface TargetSpec {
  target: RulesTarget;
  outputPath: string;        // relative to cwd
  mode: "append" | "write";  // CLAUDE.md / AGENTS.md append a snippet; cursor writes a file
  content: () => string;
  description: string;
}

const HEADER = "## Working with creative assets (asset-md)";

function claudeSnippet(): string {
  return `${HEADER}

${CORE_RULE}

${HOW_TO_USE_BLOCK}
`;
}

function agentsSnippet(): string {
  // AGENTS.md is the same format as CLAUDE.md — just a different conventional filename.
  return claudeSnippet();
}

function codexSnippet(): string {
  // Codex CLI reads AGENTS.md, but some users keep a dedicated CODEX.md.
  return claudeSnippet();
}

function cursorRule(): string {
  // Cursor `.mdc` files take YAML-style frontmatter then markdown body.
  return `---
description: How to work with creative assets in this repo via .ASSET.md sidecars
globs:
  - assets/**
  - "**/*.ASSET.md"
alwaysApply: true
---

${HEADER}

${CORE_RULE}

${HOW_TO_USE_BLOCK}
`;
}

const TARGETS: Record<RulesTarget, TargetSpec> = {
  claude: {
    target: "claude",
    outputPath: "CLAUDE.md",
    mode: "append",
    content: claudeSnippet,
    description: "Claude Code project rule",
  },
  cursor: {
    target: "cursor",
    outputPath: path.join(".cursor", "rules", "assets.mdc"),
    mode: "write",
    content: cursorRule,
    description: "Cursor rule file",
  },
  codex: {
    target: "codex",
    outputPath: "CODEX.md",
    mode: "append",
    content: codexSnippet,
    description: "Codex CLI project rule",
  },
  agents: {
    target: "agents",
    outputPath: "AGENTS.md",
    mode: "append",
    content: agentsSnippet,
    description: "AGENTS.md project rule (generic)",
  },
};

export const RULES_TARGETS: RulesTarget[] = ["claude", "cursor", "codex", "agents"];

function appendIfNew(filePath: string, content: string, force: boolean): "written" | "appended" | "skipped" {
  const exists = fs.existsSync(filePath);
  if (!exists) {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, content, "utf8");
    return "written";
  }
  if (force) {
    fs.writeFileSync(filePath, content, "utf8");
    return "written";
  }
  const existing = fs.readFileSync(filePath, "utf8");
  if (existing.includes(HEADER)) {
    return "skipped";
  }
  const sep = existing.endsWith("\n") ? "\n" : "\n\n";
  fs.appendFileSync(filePath, sep + content);
  return "appended";
}

function writeOrSkip(filePath: string, content: string, force: boolean): "written" | "overwritten" | "skipped" {
  const exists = fs.existsSync(filePath);
  if (exists && !force) return "skipped";
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, "utf8");
  return exists ? "overwritten" : "written";
}

export function runRules(options: RulesOptions = {}): void {
  const cwd = process.cwd();

  if (options.all && options.target) {
    log.err("Use either --target or --all, not both.");
    process.exitCode = 1;
    return;
  }

  if (options.print) {
    const targets = options.all ? RULES_TARGETS : options.target ? [options.target] : ["claude" as const];
    for (const t of targets) {
      const spec = TARGETS[t];
      log.dim(`# ----- ${spec.outputPath} (${spec.description}) -----`);
      console.log(spec.content());
      console.log("");
    }
    return;
  }

  const targets: RulesTarget[] = options.all
    ? RULES_TARGETS
    : options.target
      ? [options.target]
      : (() => {
          log.err("Specify --target <claude|cursor|codex|agents>, --all, or --print.");
          process.exitCode = 1;
          return [];
        })();

  log.header("asset-md rules");

  for (const t of targets) {
    const spec = TARGETS[t];
    const abs = path.resolve(cwd, spec.outputPath);
    const rel = toPosix(path.relative(cwd, abs));
    const content = spec.content();

    let outcome: string;
    if (spec.mode === "append") {
      outcome = appendIfNew(abs, content, Boolean(options.force));
    } else {
      outcome = writeOrSkip(abs, content, Boolean(options.force));
    }

    if (outcome === "skipped") {
      log.dim(`  ${rel}: already contains the rule (use --force to rewrite)`);
    } else if (outcome === "appended") {
      log.ok(`  ${rel}: appended snippet`);
    } else if (outcome === "overwritten") {
      log.ok(`  ${c.yellow(rel)}: overwritten`);
    } else {
      log.ok(`  ${c.cyan(rel)}: created`);
    }
  }
}
