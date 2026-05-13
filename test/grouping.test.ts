import { describe, it, expect } from "vitest";
import * as path from "path";
import { parseFrameName, groupAssets, groupCardPath } from "../src/util/grouping";

describe("parseFrameName", () => {
  it("recognizes underscore-separated frames", () => {
    expect(parseFrameName("walk_0.png")).toEqual({ stem: "walk", separator: "_", frame: 0, framePaddedLen: 1 });
    expect(parseFrameName("walk_07.png")).toEqual({ stem: "walk", separator: "_", frame: 7, framePaddedLen: 2 });
  });

  it("recognizes hyphen-separated frames", () => {
    expect(parseFrameName("walk-3.png")).toEqual({ stem: "walk", separator: "-", frame: 3, framePaddedLen: 1 });
  });

  it("recognizes no-separator frames with zero padding", () => {
    expect(parseFrameName("frame0001.png")).toEqual({ stem: "frame", separator: "", frame: 1, framePaddedLen: 4 });
  });

  it("recognizes dot-separated frames", () => {
    expect(parseFrameName("walk.0.png")).toEqual({ stem: "walk", separator: ".", frame: 0, framePaddedLen: 1 });
  });

  it("returns null for non-frame names", () => {
    expect(parseFrameName("walk.png")).toBeNull();
    expect(parseFrameName("walk_north.png")).toBeNull();
  });

  it("returns null when the stem is empty", () => {
    expect(parseFrameName("0.png")).toBeNull();
    expect(parseFrameName("_0.png")).toBeNull();
  });

  it("returns null for non-image extensions (audio/video not grouped in MVP)", () => {
    expect(parseFrameName("footstep_0.wav")).toBeNull();
    expect(parseFrameName("cutscene_0.mp4")).toBeNull();
  });

  it("preserves multi-token stems like walk_north", () => {
    // 'walk_north_0' -> stem 'walk_north', sep '_', frame 0
    expect(parseFrameName("walk_north_0.png")).toEqual({ stem: "walk_north", separator: "_", frame: 0, framePaddedLen: 1 });
  });
});

describe("groupAssets", () => {
  function p(rel: string): string {
    return path.resolve("/repo", rel);
  }

  it("groups a simple numbered series", () => {
    const r = groupAssets([
      p("characters/bear/walk_0.png"),
      p("characters/bear/walk_1.png"),
      p("characters/bear/walk_2.png"),
    ]);
    expect(r.groups.length).toBe(1);
    expect(r.groups[0].stem).toBe("walk");
    expect(r.groups[0].frames.map((f) => path.basename(f))).toEqual(["walk_0.png", "walk_1.png", "walk_2.png"]);
    expect(r.singletons).toEqual([]);
  });

  it("treats a single matching file as a singleton, not a group", () => {
    const r = groupAssets([p("characters/bear/walk_0.png")]);
    expect(r.groups).toEqual([]);
    expect(r.singletons.length).toBe(1);
  });

  it("groups two animations separately when they share a directory", () => {
    const r = groupAssets([
      p("vfx/explode_0.png"),
      p("vfx/explode_1.png"),
      p("vfx/sparkle_0.png"),
      p("vfx/sparkle_1.png"),
    ]);
    expect(r.groups.length).toBe(2);
    expect(r.groups.map((g) => g.stem).sort()).toEqual(["explode", "sparkle"]);
  });

  it("sorts frames by parsed number, not lexicographic order", () => {
    const r = groupAssets([
      p("a/x_10.png"),
      p("a/x_2.png"),
      p("a/x_1.png"),
    ]);
    expect(r.groups[0].frameNumbers).toEqual([1, 2, 10]);
  });

  it("does not group across directories", () => {
    const r = groupAssets([
      p("a/walk_0.png"),
      p("b/walk_0.png"),
    ]);
    expect(r.groups).toEqual([]);
    expect(r.singletons.length).toBe(2);
  });

  it("does not group across different separators", () => {
    const r = groupAssets([
      p("a/walk_0.png"),
      p("a/walk-1.png"),
    ]);
    expect(r.groups).toEqual([]);
    expect(r.singletons.length).toBe(2);
  });

  it("does not group across different extensions", () => {
    const r = groupAssets([
      p("a/walk_0.png"),
      p("a/walk_0.jpg"),
      p("a/walk_1.png"),
      p("a/walk_1.jpg"),
    ]);
    // Two groups: one for .png, one for .jpg
    expect(r.groups.length).toBe(2);
  });

  it("tolerates gaps in the frame sequence", () => {
    const r = groupAssets([
      p("a/x_0.png"),
      p("a/x_5.png"),
      p("a/x_100.png"),
    ]);
    expect(r.groups[0].frameNumbers).toEqual([0, 5, 100]);
  });

  it("emits deterministic order across runs", () => {
    const r1 = groupAssets([
      p("c/z_0.png"),
      p("c/z_1.png"),
      p("a/x_1.png"),
      p("a/x_0.png"),
      p("b/y_2.png"),
      p("b/y_1.png"),
    ]);
    const r2 = groupAssets([
      p("a/x_0.png"),
      p("b/y_1.png"),
      p("a/x_1.png"),
      p("b/y_2.png"),
      p("c/z_0.png"),
      p("c/z_1.png"),
    ]);
    expect(r1.groups.map((g) => g.stem)).toEqual(r2.groups.map((g) => g.stem));
  });
});

describe("groupCardPath", () => {
  it("returns <dir>/<stem>.ASSET.md", () => {
    const r = groupAssets([
      path.resolve("/repo/characters/bear/walk_0.png"),
      path.resolve("/repo/characters/bear/walk_1.png"),
    ]);
    expect(groupCardPath(r.groups[0])).toBe(path.resolve("/repo/characters/bear/walk.ASSET.md"));
  });
});
