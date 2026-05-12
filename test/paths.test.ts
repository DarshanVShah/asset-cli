import { describe, it, expect } from "vitest";
import * as path from "path";
import { cardPathFor, idFromAssetPath, isSupportedAsset, isCardFile, toPosix } from "../src/util/paths";

describe("cardPathFor", () => {
  it("maps an asset path to its sibling .ASSET.md", () => {
    expect(cardPathFor("assets/characters/bear.png")).toBe(path.join("assets/characters", "bear.ASSET.md"));
    expect(cardPathFor("assets/audio/click.wav")).toBe(path.join("assets/audio", "click.ASSET.md"));
    expect(cardPathFor("models/coin.glb")).toBe(path.join("models", "coin.ASSET.md"));
  });

  it("handles uppercase extensions", () => {
    expect(cardPathFor("assets/ui/Button.PNG")).toBe(path.join("assets/ui", "Button.ASSET.md"));
  });

  it("handles names with dots in them", () => {
    expect(cardPathFor("assets/v2.0/hero.png")).toBe(path.join("assets/v2.0", "hero.ASSET.md"));
  });
});

describe("idFromAssetPath", () => {
  it("returns the filename stem", () => {
    expect(idFromAssetPath("assets/characters/shopkeeper_bear.png")).toBe("shopkeeper_bear");
    expect(idFromAssetPath("assets/audio/register_chime.wav")).toBe("register_chime");
  });
});

describe("isSupportedAsset / isCardFile", () => {
  it("recognizes supported extensions case-insensitively", () => {
    expect(isSupportedAsset("foo.png")).toBe(true);
    expect(isSupportedAsset("foo.PNG")).toBe(true);
    expect(isSupportedAsset("foo.wav")).toBe(true);
    expect(isSupportedAsset("foo.txt")).toBe(false);
  });

  it("identifies card files by suffix", () => {
    expect(isCardFile("assets/characters/bear.ASSET.md")).toBe(true);
    expect(isCardFile("assets/characters/bear.png")).toBe(false);
    expect(isCardFile("README.md")).toBe(false);
  });
});

describe("toPosix", () => {
  it("rewrites backslashes to forward slashes", () => {
    expect(toPosix("a\\b\\c")).toBe(path.sep === "\\" ? "a/b/c" : "a\\b\\c");
  });
});
