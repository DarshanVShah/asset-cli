import * as fs from "fs";
import { log, c } from "../util/log";
import { scanDir, toRelative } from "../util/scanner";
import { resolveOptions } from "../util/config";
import { groupAssets, groupCardPath } from "../util/grouping";
import { cardPathFor } from "../util/paths";

interface ScanOptions {
  verbose?: boolean;
}

export async function runScan(dir: string | undefined, options: ScanOptions = {}): Promise<void> {
  const opts = resolveOptions({ dirArg: dir });
  const { cwd, assetsDir, ignore, supportedExtensions, configSource, configWarnings } = opts;

  log.header(`asset-md scan ${c.dim(toRelative(assetsDir, cwd) || ".")}`);
  if (configSource) log.dim(`config: ${toRelative(configSource, cwd)}`);
  for (const w of configWarnings) log.warn(`config: ${w}`);

  if (!fs.existsSync(assetsDir)) {
    log.warn(`Directory not found: ${toRelative(assetsDir, cwd)}`);
    log.dim("Run `asset-md init` to create the assets/ folder.");
    return;
  }

  const result = await scanDir(assetsDir, { ignore, supportedExtensions });
  const { groups, singletons } = groupAssets(result.assets);

  const missingGroups = groups.filter((g) => !fs.existsSync(groupCardPath(g)));
  const missingSingletons = singletons.filter((p) => !fs.existsSync(cardPathFor(p)));

  log.info("");
  log.info(`${c.bold("Total assets found:")}      ${result.assets.length}`);
  log.info(`${c.bold("Animation groups:")}        ${groups.length}  ${c.dim(`(${missingGroups.length} missing card)`)}`);
  log.info(`${c.bold("Singleton assets:")}        ${singletons.length}  ${c.dim(`(${missingSingletons.length} missing card)`)}`);
  log.info(`${c.dim("Ignored files:")}            ${result.ignored.length}`);

  if (options.verbose) {
    if (groups.length > 0) {
      log.header("Animation groups:");
      for (const g of groups) {
        const card = toRelative(groupCardPath(g), cwd);
        const has = fs.existsSync(groupCardPath(g));
        const range = `${g.frameNumbers[0]}–${g.frameNumbers[g.frameNumbers.length - 1]}`;
        const label = `${card} ${c.dim(`(${g.frames.length} frames, ${range})`)}`;
        if (has) log.dim("  ✓ " + label); else log.info("  " + c.yellow("✗ " + label));
      }
    }
    if (singletons.length > 0) {
      log.header("Singletons:");
      for (const p of singletons) {
        const rel = toRelative(p, cwd);
        if (fs.existsSync(cardPathFor(p))) log.dim("  ✓ " + rel);
        else log.info("  " + c.yellow("✗ " + rel));
      }
    }
    if (result.ignored.length > 0) {
      log.header("Ignored:");
      for (const p of result.ignored) log.dim("  " + toRelative(p, cwd));
    }
  } else {
    if (missingGroups.length > 0) {
      log.header("Missing animation cards:");
      const preview = missingGroups.slice(0, 10);
      for (const g of preview) {
        const card = toRelative(groupCardPath(g), cwd);
        const range = `${g.frameNumbers[0]}–${g.frameNumbers[g.frameNumbers.length - 1]}`;
        log.info("  " + c.yellow(card) + c.dim(` (${g.frames.length} frames, ${range})`));
      }
      if (missingGroups.length > preview.length) {
        log.dim(`  ... and ${missingGroups.length - preview.length} more (use --verbose to see all)`);
      }
    }
    if (missingSingletons.length > 0) {
      log.header("Missing singleton cards:");
      const preview = missingSingletons.slice(0, 10);
      for (const p of preview) log.info("  " + c.yellow(toRelative(p, cwd)));
      if (missingSingletons.length > preview.length) {
        log.dim(`  ... and ${missingSingletons.length - preview.length} more (use --verbose to see all)`);
      }
    }
    if (missingGroups.length > 0 || missingSingletons.length > 0) {
      log.info("");
      log.dim("Run `asset-md create-missing` to generate cards for these.");
    }
  }
}
