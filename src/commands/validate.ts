import * as fs from "fs";
import { log, c } from "../util/log";
import { findCards, loadCard, validateCard } from "../util/card";
import { toRelative } from "../util/scanner";
import { resolveOptions } from "../util/config";

interface ValidateOptions {
  allowMissingSource?: boolean;
}

export async function runValidate(dir: string | undefined, options: ValidateOptions = {}): Promise<void> {
  const opts = resolveOptions({ dirArg: dir });
  const { cwd, assetsDir, ignore, configSource, configWarnings } = opts;

  log.header(`asset-md validate ${c.dim(toRelative(assetsDir, cwd) || ".")}`);
  if (configSource) log.dim(`config: ${toRelative(configSource, cwd)}`);
  for (const w of configWarnings) log.warn(`config: ${w}`);

  if (!fs.existsSync(assetsDir)) {
    log.warn(`Directory not found: ${toRelative(assetsDir, cwd)}`);
    process.exitCode = 1;
    return;
  }

  const cards = await findCards(assetsDir, { ignore });
  if (cards.length === 0) {
    log.warn(`No .ASSET.md files found in ${toRelative(assetsDir, cwd)}`);
    log.dim("Run `asset-md create-missing` to generate cards.");
    return;
  }

  let okCount = 0;
  let failCount = 0;

  for (const cardPath of cards) {
    const card = loadCard(cardPath, cwd);
    const result = validateCard(card, cwd, { allowMissingSource: options.allowMissingSource });
    if (result.ok) {
      okCount++;
      log.ok(c.dim(result.cardPathRelative));
    } else {
      failCount++;
      log.err(c.red(result.cardPathRelative));
      for (const issue of result.issues) {
        log.info(`    ${c.red("✖")} ${issue.message}`);
      }
    }
  }

  log.info("");
  log.info(`${c.green("Valid:")}   ${okCount}`);
  log.info(`${c.red("Invalid:")} ${failCount}`);
  log.info(`${c.bold("Total:")}   ${cards.length}`);

  if (failCount > 0) {
    process.exitCode = 1;
  }
}
