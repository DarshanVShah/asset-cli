import * as fs from "fs";
import * as path from "path";
import fg from "fast-glob";
import { ALL_SUPPORTED_EXTS, CARD_SUFFIX } from "../constants";
import { cardPathFor, toPosix } from "./paths";

export interface ScanResult {
  assets: string[];      // absolute paths to supported asset files
  withCard: string[];    // assets that have a matching .ASSET.md sibling
  missingCard: string[]; // assets missing a matching .ASSET.md sibling
  ignored: string[];     // files we walked past but didn't recognize
}

export interface ScanOptions {
  ignore?: string[];
  supportedExtensions?: string[]; // override default extension set
}

/**
 * Scan a directory for creative asset files.
 * Returns absolute paths. Caller can convert to posix-relative if needed.
 */
export async function scanDir(targetDir: string, options: ScanOptions = {}): Promise<ScanResult> {
  const ignore = options.ignore ?? [];
  const exts = (options.supportedExtensions ?? ALL_SUPPORTED_EXTS).map((e) => e.toLowerCase());
  const absDir = path.resolve(targetDir);

  if (!fs.existsSync(absDir)) {
    return { assets: [], withCard: [], missingCard: [], ignored: [] };
  }

  // Walk every file under targetDir, then classify.
  const allFiles = await fg(["**/*"], {
    cwd: absDir,
    onlyFiles: true,
    dot: false,
    ignore,
    absolute: true,
  });

  const assets: string[] = [];
  const ignored: string[] = [];
  const cardSet = new Set<string>();

  for (const file of allFiles) {
    if (file.endsWith(CARD_SUFFIX)) {
      cardSet.add(file);
      continue;
    }
    const ext = path.extname(file).toLowerCase();
    if (exts.includes(ext)) {
      assets.push(file);
    } else {
      ignored.push(file);
    }
  }

  const withCard: string[] = [];
  const missingCard: string[] = [];
  for (const asset of assets) {
    const card = cardPathFor(asset);
    if (cardSet.has(card)) {
      withCard.push(asset);
    } else {
      missingCard.push(asset);
    }
  }

  return { assets, withCard, missingCard, ignored };
}

export function toRelative(absPath: string, root: string): string {
  return toPosix(path.relative(root, absPath));
}
