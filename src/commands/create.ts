import * as fs from "fs";
import * as path from "path";
import { log, c } from "../util/log";
import { cardPathFor, idFromAssetPath, isSupportedAsset, toPosix } from "../util/paths";
import { inferAssetType } from "../util/infer";
import { buildCardTemplate } from "../util/template";

interface CreateOptions {
  force?: boolean;
  cwd?: string;
}

export interface CreateResult {
  status: "created" | "overwritten" | "skipped" | "unsupported" | "missing-asset";
  cardPath: string;
  assetPath: string;
}

export function createCardForAsset(assetPath: string, options: CreateOptions = {}): CreateResult {
  const cwd = options.cwd ?? process.cwd();
  const force = Boolean(options.force);

  const absAsset = path.isAbsolute(assetPath) ? assetPath : path.resolve(cwd, assetPath);
  const cardPath = cardPathFor(absAsset);

  if (!fs.existsSync(absAsset)) {
    return { status: "missing-asset", cardPath, assetPath: absAsset };
  }
  if (!isSupportedAsset(absAsset)) {
    return { status: "unsupported", cardPath, assetPath: absAsset };
  }

  const exists = fs.existsSync(cardPath);
  if (exists && !force) {
    return { status: "skipped", cardPath, assetPath: absAsset };
  }

  const relSource = toPosix(path.relative(cwd, absAsset));
  const id = idFromAssetPath(absAsset);
  const type = inferAssetType(relSource);
  const content = buildCardTemplate({ id, type, sourceRelative: relSource });

  fs.writeFileSync(cardPath, content, "utf8");
  return { status: exists ? "overwritten" : "created", cardPath, assetPath: absAsset };
}

export function runCreate(assetPath: string, options: CreateOptions = {}): void {
  const cwd = options.cwd ?? process.cwd();
  const result = createCardForAsset(assetPath, options);
  const relCard = toPosix(path.relative(cwd, result.cardPath));
  const relAsset = toPosix(path.relative(cwd, result.assetPath));

  switch (result.status) {
    case "created":
      log.ok(`Created ${c.cyan(relCard)} for ${c.dim(relAsset)}`);
      break;
    case "overwritten":
      log.ok(`Overwrote ${c.cyan(relCard)} for ${c.dim(relAsset)}`);
      break;
    case "skipped":
      log.warn(`Card already exists: ${c.yellow(relCard)} (use --force to overwrite)`);
      break;
    case "unsupported":
      log.err(`Unsupported file type: ${relAsset}`);
      process.exitCode = 1;
      break;
    case "missing-asset":
      log.err(`Asset file not found: ${relAsset}`);
      process.exitCode = 1;
      break;
  }
}
