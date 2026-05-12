import * as fs from "fs";
import { log, c } from "../util/log";
import { scanDir, toRelative } from "../util/scanner";
import { createCardForAsset } from "./create";
import { resolveOptions } from "../util/config";

interface CreateMissingOptions {
  force?: boolean;
}

export async function runCreateMissing(dir: string | undefined, options: CreateMissingOptions = {}): Promise<void> {
  const opts = resolveOptions({ dirArg: dir });
  const { cwd, assetsDir, ignore, supportedExtensions, configSource, configWarnings } = opts;

  log.header(`asset-md create-missing ${c.dim(toRelative(assetsDir, cwd) || ".")}`);
  if (configSource) log.dim(`config: ${toRelative(configSource, cwd)}`);
  for (const w of configWarnings) log.warn(`config: ${w}`);

  if (!fs.existsSync(assetsDir)) {
    log.warn(`Directory not found: ${toRelative(assetsDir, cwd)}`);
    return;
  }

  const scan = await scanDir(assetsDir, { ignore, supportedExtensions });

  const created: string[] = [];
  const skipped: string[] = [];
  const overwritten: string[] = [];

  // Target list: every missing card, plus every asset when --force is set.
  const targets = options.force ? scan.assets : scan.missingCard;

  for (const asset of targets) {
    const result = createCardForAsset(asset, { force: Boolean(options.force), cwd });
    const relCard = toRelative(result.cardPath, cwd);
    if (result.status === "created") created.push(relCard);
    else if (result.status === "overwritten") overwritten.push(relCard);
    else if (result.status === "skipped") skipped.push(relCard);
  }

  log.info("");
  log.info(`${c.green("Created cards:")}        ${created.length}`);
  if (options.force) {
    log.info(`${c.yellow("Overwritten cards:")}    ${overwritten.length}`);
  }
  log.info(`${c.dim("Skipped (had card):")}   ${scan.withCard.length - overwritten.length}`);
  log.info(`${c.dim("Ignored files:")}        ${scan.ignored.length}`);

  if (created.length > 0) {
    log.header("Created:");
    for (const p of created) log.ok("  " + c.cyan(p));
  }
  if (overwritten.length > 0) {
    log.header("Overwritten:");
    for (const p of overwritten) log.warn("  " + c.yellow(p));
  }
  if (scan.ignored.length > 0) {
    log.header("Ignored (unsupported types):");
    const preview = scan.ignored.slice(0, 10);
    for (const p of preview) log.dim("  " + toRelative(p, cwd));
    if (scan.ignored.length > preview.length) {
      log.dim(`  ... and ${scan.ignored.length - preview.length} more`);
    }
  }
}
