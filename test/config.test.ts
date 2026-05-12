import { describe, it, expect, beforeEach, afterEach } from "vitest";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { loadConfig, resolveOptions } from "../src/util/config";

let tmpDir: string;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "asset-md-cfg-"));
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

function writeConfig(contents: object | string): void {
  const body = typeof contents === "string" ? contents : JSON.stringify(contents);
  fs.writeFileSync(path.join(tmpDir, "asset-md.config.json"), body, "utf8");
}

describe("loadConfig", () => {
  it("returns defaults when no config exists", () => {
    const { config, source, warnings } = loadConfig(tmpDir);
    expect(source).toBeNull();
    expect(warnings).toEqual([]);
    expect(config.assetsDir).toBe("assets");
    expect(config.manifestOutput).toBe("ASSET_MANIFEST.json");
    expect(config.ignore).toContain("**/node_modules/**");
    expect(config.supportedExtensions).toContain(".png");
  });

  it("merges user values with defaults", () => {
    writeConfig({ assetsDir: "myart", manifestOutput: "out/m.json" });
    const { config, source, warnings } = loadConfig(tmpDir);
    expect(source).toBe(path.join(tmpDir, "asset-md.config.json"));
    expect(warnings).toEqual([]);
    expect(config.assetsDir).toBe("myart");
    expect(config.manifestOutput).toBe("out/m.json");
    expect(config.ignore).toContain("**/node_modules/**"); // default kept
    expect(config.supportedExtensions).toContain(".png");  // default kept
  });

  it("normalizes extensions (lowercase + leading dot)", () => {
    writeConfig({ supportedExtensions: ["PNG", ".JPG"] });
    const { config } = loadConfig(tmpDir);
    expect(config.supportedExtensions).toEqual([".png", ".jpg"]);
  });

  it("warns and falls back to defaults on malformed JSON", () => {
    writeConfig("{not valid");
    const { config, source, warnings } = loadConfig(tmpDir);
    expect(source).not.toBeNull();
    expect(warnings.length).toBeGreaterThan(0);
    expect(config.assetsDir).toBe("assets"); // default
  });

  it("warns and falls back on schema-invalid config", () => {
    writeConfig({ assetsDir: 42 }); // wrong type
    const { config, warnings } = loadConfig(tmpDir);
    expect(warnings.length).toBeGreaterThan(0);
    expect(config.assetsDir).toBe("assets"); // default
  });

  it("finds the config in an ancestor directory", () => {
    writeConfig({ assetsDir: "myart" });
    const nested = path.join(tmpDir, "a", "b");
    fs.mkdirSync(nested, { recursive: true });
    const { config } = loadConfig(nested);
    expect(config.assetsDir).toBe("myart");
  });
});

describe("resolveOptions precedence", () => {
  it("CLI arg overrides config which overrides default", () => {
    writeConfig({ assetsDir: "myart", manifestOutput: "out.json" });
    const fromCli = resolveOptions({ cwd: tmpDir, dirArg: "cliart", outputArg: "cli-out.json" });
    expect(fromCli.assetsDir).toBe(path.resolve(tmpDir, "cliart"));
    expect(fromCli.manifestOutput).toBe(path.resolve(tmpDir, "cli-out.json"));

    const fromConfig = resolveOptions({ cwd: tmpDir });
    expect(fromConfig.assetsDir).toBe(path.resolve(tmpDir, "myart"));
    expect(fromConfig.manifestOutput).toBe(path.resolve(tmpDir, "out.json"));
  });

  it("uses defaults when neither CLI nor config provide a value", () => {
    const r = resolveOptions({ cwd: tmpDir });
    expect(r.assetsDir).toBe(path.resolve(tmpDir, "assets"));
    expect(r.manifestOutput).toBe(path.resolve(tmpDir, "ASSET_MANIFEST.json"));
  });
});
