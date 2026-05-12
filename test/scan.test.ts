import { describe, it, expect, beforeEach, afterEach } from "vitest";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { scanDir } from "../src/util/scanner";

let tmpDir: string;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "asset-md-scan-"));
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

function touch(rel: string): void {
  const full = path.join(tmpDir, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, "", "utf8");
}

describe("scanDir", () => {
  it("classifies assets, paired cards, and ignored files", async () => {
    touch("characters/bear.png");
    touch("characters/bear.ASSET.md");
    touch("characters/witch.png");
    touch("notes.txt");

    const result = await scanDir(tmpDir);
    expect(result.assets.length).toBe(2);
    expect(result.withCard.length).toBe(1);
    expect(result.missingCard.length).toBe(1);
    expect(result.ignored.length).toBe(1);
    expect(result.ignored[0].endsWith("notes.txt")).toBe(true);
  });

  it("returns an empty result when the directory does not exist", async () => {
    const result = await scanDir(path.join(tmpDir, "does-not-exist"));
    expect(result.assets).toEqual([]);
    expect(result.withCard).toEqual([]);
    expect(result.missingCard).toEqual([]);
    expect(result.ignored).toEqual([]);
  });

  it("honors ignore patterns", async () => {
    touch("characters/bear.png");
    touch("skip-me/junk.png");
    const result = await scanDir(tmpDir, { ignore: ["**/skip-me/**"] });
    expect(result.assets.length).toBe(1);
    expect(result.assets[0].endsWith("bear.png")).toBe(true);
  });

  it("respects a custom supportedExtensions list", async () => {
    touch("a/foo.png");
    touch("a/bar.wav");
    const result = await scanDir(tmpDir, { supportedExtensions: [".png"] });
    expect(result.assets.length).toBe(1);
    expect(result.assets[0].endsWith("foo.png")).toBe(true);
    expect(result.ignored.some((p) => p.endsWith("bar.wav"))).toBe(true);
  });
});
