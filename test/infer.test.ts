import { describe, it, expect } from "vitest";
import { inferAssetType } from "../src/util/infer";

describe("inferAssetType", () => {
  it("maps folder names to types", () => {
    expect(inferAssetType("assets/characters/bear.png")).toBe("character");
    expect(inferAssetType("assets/ui/button_start.png")).toBe("ui");
    expect(inferAssetType("assets/audio/click.wav")).toBe("audio");
    expect(inferAssetType("assets/backgrounds/shop.png")).toBe("background");
    expect(inferAssetType("assets/props/coin.png")).toBe("prop");
    expect(inferAssetType("assets/objects/coin.png")).toBe("prop");
    expect(inferAssetType("assets/tilesets/forest.png")).toBe("tileset");
    expect(inferAssetType("assets/music/theme.ogg")).toBe("music");
    expect(inferAssetType("assets/vfx/sparkles.png")).toBe("vfx");
    expect(inferAssetType("assets/fonts/title.ttf")).toBe("font");
  });

  it("falls back to extension category when folder gives no signal", () => {
    expect(inferAssetType("art/click.wav")).toBe("audio");
    expect(inferAssetType("art/movie.mp4")).toBe("video");
    expect(inferAssetType("art/coin.glb")).toBe("model3d");
    expect(inferAssetType("art/heading.woff2")).toBe("font");
  });

  it("falls back to filename keywords for unclassified images", () => {
    expect(inferAssetType("art/menu_button.png")).toBe("ui");
    expect(inferAssetType("art/coin.png")).toBe("prop");
    expect(inferAssetType("art/bg_skybox.png")).toBe("background");
    expect(inferAssetType("art/hero_player.png")).toBe("character");
  });

  it("returns `unknown` when no signal applies", () => {
    expect(inferAssetType("misc/abcd.png")).toBe("unknown");
  });

  it("is case-insensitive for folder hints", () => {
    expect(inferAssetType("Assets/Characters/Bear.PNG")).toBe("character");
    expect(inferAssetType("Assets/UI/Btn.png")).toBe("ui");
  });
});
