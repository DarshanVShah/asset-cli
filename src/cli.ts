#!/usr/bin/env node
import { Command } from "commander";
import { VERSION } from "./constants";
import { runInit } from "./commands/init";
import { runScan } from "./commands/scan";
import { runCreate } from "./commands/create";
import { runCreateMissing } from "./commands/createMissing";
import { runValidate } from "./commands/validate";
import { runManifest } from "./commands/manifest";
import { runPrompt } from "./commands/prompt";
import { runRules, RULES_TARGETS, type RulesTarget } from "./commands/rules";

const program = new Command();

program
  .name("asset-md")
  .description("Create and maintain .ASSET.md sidecar files for creative/game assets.")
  .version(VERSION);

program
  .command("init")
  .description("Create baseline project files (ASSET_SPEC.md, assets/, asset-md.config.json, examples/)")
  .option("-f, --force", "overwrite existing files", false)
  .action((opts) => {
    runInit({ force: Boolean(opts.force) });
  });

program
  .command("scan")
  .description("Scan a directory for creative assets and report missing .ASSET.md cards")
  .argument("[dir]", "directory to scan (default: assets)")
  .option("-v, --verbose", "list every asset path, not just the missing summary", false)
  .action(async (dir, opts) => {
    await runScan(dir, { verbose: Boolean(opts.verbose) });
  });

program
  .command("create")
  .description("Create a starter .ASSET.md card for a single asset")
  .argument("<assetPath>", "path to the asset file")
  .option("-f, --force", "overwrite an existing .ASSET.md card", false)
  .action((assetPath, opts) => {
    runCreate(assetPath, { force: Boolean(opts.force) });
  });

program
  .command("create-missing")
  .description("Create .ASSET.md cards for every asset in [dir] that doesn't have one")
  .argument("[dir]", "directory to scan (default: assets)")
  .option("-f, --force", "regenerate cards even if they already exist", false)
  .action(async (dir, opts) => {
    await runCreateMissing(dir, { force: Boolean(opts.force) });
  });

program
  .command("validate")
  .description("Validate every .ASSET.md card in [dir] against the schema and required sections")
  .argument("[dir]", "directory to scan (default: assets)")
  .option("--allow-missing-source", "do not fail when the file at `source:` is absent (useful for example projects without binaries)", false)
  .action(async (dir, opts) => {
    await runValidate(dir, { allowMissingSource: Boolean(opts.allowMissingSource) });
  });

program
  .command("manifest")
  .description("Generate ASSET_MANIFEST.json from all valid .ASSET.md cards")
  .argument("[dir]", "directory to scan for cards (default: assets)")
  .option("-o, --output <file>", "manifest output path (overrides config; default: ASSET_MANIFEST.json)")
  .option("--allow-missing-source", "include cards whose source file does not exist on disk", false)
  .action(async (dir, opts) => {
    await runManifest(dir, { output: opts.output, allowMissingSource: Boolean(opts.allowMissingSource) });
  });

program
  .command("prompt")
  .description("Print a compact agent instruction block for an asset's .ASSET.md card")
  .argument("<assetPath>", "path to the asset file")
  .action((assetPath) => {
    runPrompt(assetPath);
  });

program
  .command("rules")
  .description("Generate an asset-aware agent rule file (Claude, Cursor, Codex, AGENTS.md)")
  .option(
    "-t, --target <target>",
    `which rules file to write: ${RULES_TARGETS.join(" | ")}`,
  )
  .option("-a, --all", "write rules for every supported target", false)
  .option("-p, --print", "print rule content to stdout instead of writing files", false)
  .option("-f, --force", "overwrite or rewrite existing rule content", false)
  .action((opts) => {
    if (opts.target && !RULES_TARGETS.includes(opts.target)) {
      console.error(`Unknown target "${opts.target}". Choose one of: ${RULES_TARGETS.join(", ")}`);
      process.exit(1);
    }
    runRules({
      target: opts.target as RulesTarget | undefined,
      all: Boolean(opts.all),
      print: Boolean(opts.print),
      force: Boolean(opts.force),
    });
  });

program.parseAsync(process.argv).catch((err) => {
  console.error(err instanceof Error ? err.message : String(err));
  process.exit(1);
});
