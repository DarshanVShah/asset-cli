export const VERSION = "0.1.0";

export const CARD_SUFFIX = ".ASSET.md";

export const SUPPORTED_EXTENSIONS = {
  image: [".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg"],
  audio: [".wav", ".mp3", ".ogg"],
  video: [".mp4", ".webm"],
  model: [".glb", ".gltf", ".fbx", ".obj"],
  font: [".ttf", ".otf", ".woff", ".woff2"],
} as const;

export const ALL_SUPPORTED_EXTS: string[] = Object.values(SUPPORTED_EXTENSIONS).flat();

export const ASSET_TYPES = [
  "character",
  "background",
  "prop",
  "ui",
  "audio",
  "music",
  "vfx",
  "tileset",
  "animation",
  "font",
  "model3d",
  "video",
  "reference",
  "unknown",
] as const;

export type AssetType = (typeof ASSET_TYPES)[number];

export const REQUIRED_SECTIONS = [
  "What this asset is",
  "Intended use",
  "Do not use for",
  "Placement rules",
  "Style constraints",
  "Animation or interaction notes",
  "Prompting guidance",
] as const;
