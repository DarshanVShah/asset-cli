// Source of truth for the CLI version is package.json. Read at runtime so
// `--version` and the manifest's version field can never drift from the
// published package. After compilation, dist/constants.js sits one level
// below the package root, so the relative path resolves correctly.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const pkg = require("../package.json") as { version: string };
export const VERSION: string = pkg.version;

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
