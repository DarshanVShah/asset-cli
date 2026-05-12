import * as fs from "fs";
import * as path from "path";
import { z } from "zod";
import { ALL_SUPPORTED_EXTS } from "../constants";

export const CONFIG_FILENAME = "asset-md.config.json";

const DEFAULT_IGNORE = [
  "**/node_modules/**",
  "**/.git/**",
  "**/dist/**",
];

const ConfigSchema = z.object({
  assetsDir: z.string().min(1).default("assets"),
  manifestOutput: z.string().min(1).default("ASSET_MANIFEST.json"),
  ignore: z.array(z.string()).default(DEFAULT_IGNORE),
  supportedExtensions: z.array(z.string()).default(ALL_SUPPORTED_EXTS),
});

export type AssetMdConfig = z.infer<typeof ConfigSchema>;

export interface LoadConfigResult {
  config: AssetMdConfig;
  source: string | null; // absolute path to the loaded file, or null when defaults were used
  warnings: string[];
}

/**
 * Load asset-md.config.json from `cwd` (or any ancestor up to the filesystem root).
 * Falls back to defaults if no file is found or the file is malformed.
 */
export function loadConfig(cwd: string = process.cwd()): LoadConfigResult {
  const warnings: string[] = [];
  const found = findConfigFile(cwd);
  if (!found) {
    return { config: ConfigSchema.parse({}), source: null, warnings };
  }

  let raw: unknown;
  try {
    raw = JSON.parse(fs.readFileSync(found, "utf8"));
  } catch (err) {
    warnings.push(`Could not parse ${path.relative(cwd, found)}: ${(err as Error).message}. Using defaults.`);
    return { config: ConfigSchema.parse({}), source: found, warnings };
  }

  const parsed = ConfigSchema.safeParse(raw);
  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      warnings.push(`${issue.path.join(".") || "<root>"}: ${issue.message}`);
    }
    warnings.push("Falling back to defaults due to invalid config.");
    return { config: ConfigSchema.parse({}), source: found, warnings };
  }

  // Normalize: lowercase extensions, ensure leading dot.
  const cfg = parsed.data;
  cfg.supportedExtensions = cfg.supportedExtensions.map(normalizeExt);
  return { config: cfg, source: found, warnings };
}

function findConfigFile(startDir: string): string | null {
  let dir = path.resolve(startDir);
  // Walk up to root looking for the file.
  while (true) {
    const candidate = path.join(dir, CONFIG_FILENAME);
    if (fs.existsSync(candidate)) return candidate;
    const parent = path.dirname(dir);
    if (parent === dir) return null;
    dir = parent;
  }
}

function normalizeExt(ext: string): string {
  const lower = ext.toLowerCase().trim();
  return lower.startsWith(".") ? lower : "." + lower;
}

/**
 * Resolve effective options for a command: CLI args win, then config, then defaults.
 */
export interface ResolvedOptions {
  cwd: string;
  config: AssetMdConfig;
  assetsDir: string;          // absolute
  manifestOutput: string;     // absolute
  ignore: string[];
  supportedExtensions: string[];
  configSource: string | null;
  configWarnings: string[];
}

export interface ResolveOptionsInput {
  cwd?: string;
  dirArg?: string;            // CLI [dir] argument, if provided
  outputArg?: string;         // CLI --output, if provided
}

export function resolveOptions(input: ResolveOptionsInput = {}): ResolvedOptions {
  const cwd = input.cwd ?? process.cwd();
  const { config, source, warnings } = loadConfig(cwd);

  const assetsDirAbs = path.resolve(cwd, input.dirArg ?? config.assetsDir);
  const manifestAbs = path.resolve(cwd, input.outputArg ?? config.manifestOutput);

  return {
    cwd,
    config,
    assetsDir: assetsDirAbs,
    manifestOutput: manifestAbs,
    ignore: config.ignore,
    supportedExtensions: config.supportedExtensions,
    configSource: source,
    configWarnings: warnings,
  };
}
