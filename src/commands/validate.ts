import * as path from "path";
import * as fs from "fs";
import { log, c } from "../util/log";
import { findCards, loadCard, validateCard } from "../util/card";
import { toRelative } from "../util/scanner";

export async function runValidate(dir: string | undefined): Promise<void> {
  const cwd = process.cwd();
  const targetDir = path.resolve(cwd, dir ?? "assets");

  log.header(`asset-md validate ${c.dim(toRelative(targetDir, cwd) || ".")}`);

  if (!fs.existsSync(targetDir)) {
    log.warn(`Directory not found: ${toRelative(targetDir, cwd)}`);
    process.exitCode = 1;
    return;
  }

  const cards = await findCards(targetDir);
  if (cards.length === 0) {
    log.warn(`No .ASSET.md files found in ${toRelative(targetDir, cwd)}`);
    log.dim("Run `asset-md create-missing` to generate cards.");
    return;
  }

  let okCount = 0;
  let failCount = 0;

  for (const cardPath of cards) {
    const card = loadCard(cardPath, cwd);
    const result = validateCard(card, cwd);
    if (result.ok) {
      okCount++;
      log.ok(c.dim(result.cardPathRelative));
    } else {
      failCount++;
      log.err(c.red(result.cardPathRelative));
      for (const issue of result.issues) {
        log.info(`    ${c.dim("-")} ${c.yellow(issue.field)}: ${issue.message}`);
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
