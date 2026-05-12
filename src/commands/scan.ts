import * as path from "path";
import * as fs from "fs";
import { log, c } from "../util/log";
import { scanDir, toRelative } from "../util/scanner";

interface ScanOptions {
  verbose?: boolean;
}

export async function runScan(dir: string | undefined, options: ScanOptions = {}): Promise<void> {
  const cwd = process.cwd();
  const targetDir = path.resolve(cwd, dir ?? "assets");

  log.header(`asset-md scan ${c.dim(toRelative(targetDir, cwd) || ".")}`);

  if (!fs.existsSync(targetDir)) {
    log.warn(`Directory not found: ${toRelative(targetDir, cwd)}`);
    log.dim("Run `asset-md init` to create the assets/ folder.");
    return;
  }

  const result = await scanDir(targetDir);

  log.info("");
  log.info(`${c.bold("Total assets found:")}      ${result.assets.length}`);
  log.info(`${c.green("With .ASSET.md card:")}     ${result.withCard.length}`);
  log.info(`${c.yellow("Missing .ASSET.md card:")}  ${result.missingCard.length}`);
  log.info(`${c.dim("Ignored files:")}            ${result.ignored.length}`);

  if (options.verbose) {
    if (result.withCard.length > 0) {
      log.header("With cards:");
      for (const p of result.withCard) log.dim("  " + toRelative(p, cwd));
    }
    if (result.missingCard.length > 0) {
      log.header("Missing cards:");
      for (const p of result.missingCard) log.info("  " + c.yellow(toRelative(p, cwd)));
    }
    if (result.ignored.length > 0) {
      log.header("Ignored:");
      for (const p of result.ignored) log.dim("  " + toRelative(p, cwd));
    }
  } else {
    if (result.missingCard.length > 0) {
      log.header("Missing cards:");
      const preview = result.missingCard.slice(0, 10);
      for (const p of preview) log.info("  " + c.yellow(toRelative(p, cwd)));
      if (result.missingCard.length > preview.length) {
        log.dim(`  ... and ${result.missingCard.length - preview.length} more (use --verbose to see all)`);
      }
      log.info("");
      log.dim("Run `asset-md create-missing` to generate cards for these.");
    }
  }
}
