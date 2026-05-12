import { describe, it, expect, beforeEach, afterEach } from "vitest";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { loadCard, validateCard } from "../src/util/card";

let tmpDir: string;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "asset-md-val-"));
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

function writeFile(rel: string, content: string): string {
  const full = path.join(tmpDir, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content, "utf8");
  return full;
}

const FULL_BODY = `# Asset: Bear

## What this asset is
text

## Intended use
text

## Do not use for
text

## Placement rules
text

## Style constraints
text

## Animation or interaction notes
text

## Prompting guidance
text
`;

const FULL_FRONTMATTER = `---
id: bear
type: character
status: draft
source: assets/characters/bear.png
---`;

describe("validateCard", () => {
  it("accepts a fully-valid card whose source exists", () => {
    writeFile("assets/characters/bear.png", "");
    const cardPath = writeFile(
      "assets/characters/bear.ASSET.md",
      `${FULL_FRONTMATTER}\n\n${FULL_BODY}`,
    );
    const result = validateCard(loadCard(cardPath, tmpDir), tmpDir);
    expect(result.ok).toBe(true);
    expect(result.issues).toEqual([]);
    expect(result.data?.id).toBe("bear");
  });

  it("flags a missing source file", () => {
    const cardPath = writeFile(
      "assets/characters/bear.ASSET.md",
      `${FULL_FRONTMATTER}\n\n${FULL_BODY}`,
    );
    const result = validateCard(loadCard(cardPath, tmpDir), tmpDir);
    expect(result.ok).toBe(false);
    expect(result.issues.some((i) => i.category === "source")).toBe(true);
  });

  it("allows missing source when option is set", () => {
    const cardPath = writeFile(
      "assets/characters/bear.ASSET.md",
      `${FULL_FRONTMATTER}\n\n${FULL_BODY}`,
    );
    const result = validateCard(loadCard(cardPath, tmpDir), tmpDir, { allowMissingSource: true });
    expect(result.ok).toBe(true);
  });

  it("flags every missing required section", () => {
    const cardPath = writeFile(
      "assets/characters/bear.ASSET.md",
      `${FULL_FRONTMATTER}\n\n# Asset: Bear\n\n## What this asset is\ntext\n`,
    );
    writeFile("assets/characters/bear.png", "");
    const result = validateCard(loadCard(cardPath, tmpDir), tmpDir);
    const sectionIssues = result.issues.filter((i) => i.category === "sections");
    expect(sectionIssues.length).toBe(6);
  });

  it("reports schema, source, and section issues in one pass", () => {
    const cardPath = writeFile(
      "assets/characters/bear.ASSET.md",
      `---
id: bear
type: npc
status: draft
source: assets/characters/missing.png
---

# Asset: Bear

## What this asset is
text
`,
    );
    const result = validateCard(loadCard(cardPath, tmpDir), tmpDir);
    expect(result.ok).toBe(false);
    const categories = new Set(result.issues.map((i) => i.category));
    expect(categories.has("schema")).toBe(true);
    expect(categories.has("source")).toBe(true);
    expect(categories.has("sections")).toBe(true);
  });

  it("reports a missing required field with a friendly message", () => {
    const cardPath = writeFile(
      "assets/characters/bear.ASSET.md",
      `---
id: bear
type: character
status: draft
---

${FULL_BODY}`,
    );
    const result = validateCard(loadCard(cardPath, tmpDir), tmpDir);
    const sourceIssue = result.issues.find((i) => i.field === "source");
    expect(sourceIssue?.message).toMatch(/missing required field: source/);
  });

  it("reports a friendly invalid-type message", () => {
    const cardPath = writeFile(
      "assets/characters/bear.ASSET.md",
      `---
id: bear
type: npc
status: draft
source: assets/characters/bear.png
---

${FULL_BODY}`,
    );
    writeFile("assets/characters/bear.png", "");
    const result = validateCard(loadCard(cardPath, tmpDir), tmpDir);
    const typeIssue = result.issues.find((i) => i.field === "type");
    expect(typeIssue?.message).toMatch(/invalid type: "npc"/);
  });

  it("flags missing frontmatter", () => {
    const cardPath = writeFile(
      "assets/characters/bear.ASSET.md",
      `# Asset\n\nNo frontmatter here.\n`,
    );
    const result = validateCard(loadCard(cardPath, tmpDir), tmpDir);
    expect(result.issues.some((i) => i.category === "frontmatter")).toBe(true);
  });
});
