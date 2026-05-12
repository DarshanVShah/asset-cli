#!/usr/bin/env node
import { Command } from "commander";
import { VERSION } from "./constants";
import { runInit } from "./commands/init";
import { runScan } from "./commands/scan";
import { runCreate } from "./commands/create";
import { runCreateMissing } from "./commands/createMissing";
import { runValidate } from "./commands/validate";

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
  .action(async (dir) => {
    await runValidate(dir);
  });

program.parseAsync(process.argv).catch((err) => {
  console.error(err instanceof Error ? err.message : String(err));
  process.exit(1);
});
