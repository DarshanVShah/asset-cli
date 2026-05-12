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

// Filename keywords as fallback hints.
const NAME_HINTS: Array<[RegExp, AssetType]> = [
  [/\b(button|btn|panel|menu|hud|icon|cursor)\b/i, "ui"],
  [/\b(bg|background|skybox)\b/i, "background"],
  [/\b(tile|tileset)\b/i, "tileset"],
  [/\b(coin|chest|potion|sword|item)\b/i, "prop"],
  [/\b(player|enemy|npc|character|portrait|hero|villain)\b/i, "character"],
  [/\b(theme|track|loop|music)\b/i, "music"],
  [/\b(click|chime|whoosh|hit|explode|sfx)\b/i, "audio"],
  [/\b(spark|smoke|fire|magic|aura|vfx)\b/i, "vfx"],
];

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
  for (const [re, type] of NAME_HINTS) {
    if (re.test(name)) return type;
  }

  return "unknown";
}
