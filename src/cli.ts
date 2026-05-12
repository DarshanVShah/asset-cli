#!/usr/bin/env node
import { Command } from "commander";
import { VERSION } from "./constants";
import { runInit } from "./commands/init";
import { runScan } from "./commands/scan";

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

program.parseAsync(process.argv).catch((err) => {
  console.error(err instanceof Error ? err.message : String(err));
  process.exit(1);
});
