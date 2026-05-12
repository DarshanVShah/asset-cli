import * as path from "path";
import { CARD_SUFFIX, ALL_SUPPORTED_EXTS } from "../constants";

// Convert any path to forward-slash form for stable cross-platform display/storage.
export function toPosix(p: string): string {
  return p.split(path.sep).join("/");
}

// Given an asset path, return the sibling .ASSET.md path.
export function cardPathFor(assetPath: string): string {
  const dir = path.dirname(assetPath);
  const base = path.basename(assetPath);
  const ext = path.extname(base);
  const stem = base.slice(0, base.length - ext.length);
  return path.join(dir, stem + CARD_SUFFIX);
}

// Return the asset id derived from filename (without extension).
export function idFromAssetPath(assetPath: string): string {
  const base = path.basename(assetPath);
  const ext = path.extname(base);
  return base.slice(0, base.length - ext.length);
}

export function isSupportedAsset(filePath: string): boolean {
  const ext = path.extname(filePath).toLowerCase();
  return ALL_SUPPORTED_EXTS.includes(ext);
}

export function isCardFile(filePath: string): boolean {
  return filePath.endsWith(CARD_SUFFIX);
}
