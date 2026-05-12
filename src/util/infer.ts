import * as path from "path";
import type { AssetType } from "../constants";
import { SUPPORTED_EXTENSIONS } from "../constants";

// Folder name keywords map to asset types.
const FOLDER_HINTS: Array<[RegExp, AssetType]> = [
  [/(^|\/)characters?(\/|$)/i, "character"],
  [/(^|\/)char(\/|$)/i, "character"],
  [/(^|\/)portraits?(\/|$)/i, "character"],
  [/(^|\/)backgrounds?(\/|$)/i, "background"],
  [/(^|\/)bg(\/|$)/i, "background"],
  [/(^|\/)scenery(\/|$)/i, "background"],
  [/(^|\/)props?(\/|$)/i, "prop"],
  [/(^|\/)objects?(\/|$)/i, "prop"],
  [/(^|\/)items?(\/|$)/i, "prop"],
  [/(^|\/)ui(\/|$)/i, "ui"],
  [/(^|\/)hud(\/|$)/i, "ui"],
  [/(^|\/)gui(\/|$)/i, "ui"],
  [/(^|\/)icons?(\/|$)/i, "ui"],
  [/(^|\/)buttons?(\/|$)/i, "ui"],
  [/(^|\/)tile(sets?)?(\/|$)/i, "tileset"],
  [/(^|\/)tiles(\/|$)/i, "tileset"],
  [/(^|\/)vfx(\/|$)/i, "vfx"],
  [/(^|\/)effects?(\/|$)/i, "vfx"],
  [/(^|\/)particles?(\/|$)/i, "vfx"],
  [/(^|\/)animations?(\/|$)/i, "animation"],
  [/(^|\/)anims?(\/|$)/i, "animation"],
  [/(^|\/)music(\/|$)/i, "music"],
  [/(^|\/)soundtrack(\/|$)/i, "music"],
  [/(^|\/)sfx(\/|$)/i, "audio"],
  [/(^|\/)sounds?(\/|$)/i, "audio"],
  [/(^|\/)audio(\/|$)/i, "audio"],
  [/(^|\/)voice(\/|$)/i, "audio"],
  [/(^|\/)fonts?(\/|$)/i, "font"],
  [/(^|\/)typography(\/|$)/i, "font"],
  [/(^|\/)models?(\/|$)/i, "model3d"],
  [/(^|\/)meshes?(\/|$)/i, "model3d"],
  [/(^|\/)3d(\/|$)/i, "model3d"],
  [/(^|\/)videos?(\/|$)/i, "video"],
  [/(^|\/)cutscenes?(\/|$)/i, "video"],
  [/(^|\/)references?(\/|$)/i, "reference"],
  [/(^|\/)refs?(\/|$)/i, "reference"],
];

// Filename keywords as fallback hints. We split the filename on common
// separators (_, -, space, .) and check each token — JS \b doesn't cross
// underscores, so "menu_button" wouldn't match \bbutton\b otherwise.
const NAME_KEYWORDS: Array<[Set<string>, AssetType]> = [
  [new Set(["button", "btn", "panel", "menu", "hud", "icon", "cursor"]), "ui"],
  [new Set(["bg", "background", "skybox"]), "background"],
  [new Set(["tile", "tileset"]), "tileset"],
  [new Set(["coin", "chest", "potion", "sword", "item"]), "prop"],
  [new Set(["player", "enemy", "npc", "character", "portrait", "hero", "villain"]), "character"],
  [new Set(["theme", "track", "loop", "music"]), "music"],
  [new Set(["click", "chime", "whoosh", "hit", "explode", "sfx"]), "audio"],
  [new Set(["spark", "smoke", "fire", "magic", "aura", "vfx"]), "vfx"],
];

function tokensOf(name: string): string[] {
  return name.toLowerCase().split(/[_\-\s.]+/).filter((t) => t.length > 0);
}

function extKind(ext: string): AssetType | null {
  ext = ext.toLowerCase();
  if (SUPPORTED_EXTENSIONS.image.includes(ext as any)) return null; // image needs more context
  if (SUPPORTED_EXTENSIONS.audio.includes(ext as any)) return "audio";
  if (SUPPORTED_EXTENSIONS.video.includes(ext as any)) return "video";
  if (SUPPORTED_EXTENSIONS.model.includes(ext as any)) return "model3d";
  if (SUPPORTED_EXTENSIONS.font.includes(ext as any)) return "font";
  return null;
}

/**
 * Infer asset type from folder, extension, and filename keywords.
 * Folder takes precedence (most reliable), then extension, then filename keywords.
 */
export function inferAssetType(assetPath: string): AssetType {
  const posix = assetPath.split(path.sep).join("/");
  const ext = path.extname(posix).toLowerCase();
  const name = path.basename(posix, ext);

  // 1. Folder hints (strongest signal).
  for (const [re, type] of FOLDER_HINTS) {
    if (re.test(posix)) return type;
  }

  // 2. Extension category for non-images.
  const extType = extKind(ext);
  if (extType) return extType;

  // 3. Filename keywords (for images we still couldn't place).
  const tokens = tokensOf(name);
  for (const [keywords, type] of NAME_KEYWORDS) {
    if (tokens.some((t) => keywords.has(t))) return type;
  }

  return "unknown";
}
