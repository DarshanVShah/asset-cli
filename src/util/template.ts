import type { AssetType } from "../constants";

export interface CardTemplateInput {
  id: string;
  type: AssetType;
  sourceRelative: string;          // posix path relative to repo root (first frame for animations)
  framesRelative?: string[];       // ordered list, present only for animation groups
}

function humanizeId(id: string): string {
  return id
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

// Type-specific seed values that make the generated card feel like a real starting point.
function defaultsFor(type: AssetType): {
  engineNode: string;
  anchor: string;
  intended: string;
  forbidden: string;
  allowRecolor: boolean;
  allowCrop: boolean;
} {
  switch (type) {
    case "character":
      return {
        engineNode: "AnimatedSprite2D",
        anchor: "bottom_center",
        intended: "Use as a character sprite in gameplay scenes.",
        forbidden: "Do not use as a background, prop, or UI element.",
        allowRecolor: false,
        allowCrop: false,
      };
    case "background":
      return {
        engineNode: "Sprite2D",
        anchor: "center",
        intended: "Use as a scene backdrop behind gameplay.",
        forbidden: "Do not use as a character, prop, or UI panel.",
        allowRecolor: false,
        allowCrop: true,
      };
    case "prop":
      return {
        engineNode: "Sprite2D",
        anchor: "center",
        intended: "Use as an interactive or decorative prop in scenes.",
        forbidden: "Do not use as a character or UI element.",
        allowRecolor: false,
        allowCrop: false,
      };
    case "ui":
      return {
        engineNode: "TextureRect",
        anchor: "top_left",
        intended: "Use as a UI element (button, panel, icon, HUD).",
        forbidden: "Do not place inside the gameplay world.",
        allowRecolor: true,
        allowCrop: false,
      };
    case "tileset":
      return {
        engineNode: "TileMap",
        anchor: "top_left",
        intended: "Use as map terrain via the tileset system.",
        forbidden: "Do not extract single tiles as standalone props.",
        allowRecolor: false,
        allowCrop: false,
      };
    case "vfx":
      return {
        engineNode: "GPUParticles2D",
        anchor: "center",
        intended: "Use as a visual effect overlay (impact, magic, particles).",
        forbidden: "Do not use as a static prop or background.",
        allowRecolor: true,
        allowCrop: false,
      };
    case "animation":
      return {
        engineNode: "AnimatedSprite2D",
        anchor: "center",
        intended: "Drive an animation cycle for a character or object.",
        forbidden: "Do not use as a static still image.",
        allowRecolor: false,
        allowCrop: false,
      };
    case "audio":
      return {
        engineNode: "AudioStreamPlayer",
        anchor: "n/a",
        intended: "Use as a one-shot sound effect.",
        forbidden: "Do not loop as background music.",
        allowRecolor: false,
        allowCrop: false,
      };
    case "music":
      return {
        engineNode: "AudioStreamPlayer",
        anchor: "n/a",
        intended: "Use as background music for the appropriate scene mood.",
        forbidden: "Do not use as a one-shot SFX.",
        allowRecolor: false,
        allowCrop: false,
      };
    case "font":
      return {
        engineNode: "FontFile",
        anchor: "n/a",
        intended: "Use as a UI/text font.",
        forbidden: "Do not embed inside images as raster text.",
        allowRecolor: true,
        allowCrop: false,
      };
    case "model3d":
      return {
        engineNode: "MeshInstance3D",
        anchor: "origin",
        intended: "Use as a 3D mesh in the scene.",
        forbidden: "Do not flatten to a 2D sprite without permission.",
        allowRecolor: false,
        allowCrop: false,
      };
    case "video":
      return {
        engineNode: "VideoStreamPlayer",
        anchor: "center",
        intended: "Use as a cutscene or video element.",
        forbidden: "Do not extract single frames as standalone art.",
        allowRecolor: false,
        allowCrop: false,
      };
    case "reference":
      return {
        engineNode: "n/a",
        anchor: "n/a",
        intended: "Reference material only — not for direct use in builds.",
        forbidden: "Do not ship this file as part of the game.",
        allowRecolor: false,
        allowCrop: false,
      };
    default:
      return {
        engineNode: "Node",
        anchor: "center",
        intended: "Describe where this asset should be used.",
        forbidden: "Describe where this asset should not be used.",
        allowRecolor: false,
        allowCrop: false,
      };
  }
}

/**
 * Build the starter .ASSET.md content. The user is expected to edit each
 * section, but the defaults are typed so the file is useful out of the box.
 *
 * When `framesRelative` is provided (animation group), the card includes a
 * `frames:` list and a frame-count-aware Animation section. The asset
 * `type` is whatever the caller inferred — a character's walk cycle is
 * still type=character; `frames` is an orthogonal "this is animated"
 * signal. Callers should pass type=animation only when no other signal
 * applies.
 */
export function buildCardTemplate(input: CardTemplateInput): string {
  const { id, type, sourceRelative, framesRelative } = input;
  const isAnimation = !!(framesRelative && framesRelative.length >= 2);
  const d = defaultsFor(type);
  const title = humanizeId(id);
  const frameCount = framesRelative?.length ?? 0;

  const framesBlock = isAnimation
    ? "frames:\n" + framesRelative!.map((p) => `  - ${p}`).join("\n") + "\n"
    : "";

  const frontmatter = `---
id: ${id}
type: ${type}
status: draft
tags: []
source: ${sourceRelative}
${framesBlock}engine:
  godot_node: ${d.engineNode}
  anchor: ${d.anchor}
usage:
  intended:
    - ${d.intended}
  forbidden:
    - ${d.forbidden}
ai:
  preserve_style: true
  allow_recolor: ${d.allowRecolor}
  allow_crop: ${d.allowCrop}
---`;

  const animationNotes = isAnimation
    ? `Animation has ${frameCount} frames. Specify the playback frame rate, whether it loops, and any sub-ranges (e.g. frames 0-3 for windup, 4-7 for swing).`
    : "Describe allowed animations, interactions, sounds, or gameplay behavior.";

  const titleHeading = isAnimation ? `${title} (${frameCount} frames)` : title;

  const body = `# Asset: ${titleHeading}

## What this asset is
Describe the asset in plain language.

## Intended use
${d.intended}

## Do not use for
${d.forbidden}

## Placement rules
Describe scale, anchor, layer, scene context, or UI placement.

## Style constraints
Describe what must be preserved (palette, line weight, silhouette, mood).

## Animation or interaction notes
${animationNotes}

## Prompting guidance
Describe how an AI should refer to this asset when editing, extending, or generating related assets.
`;

  return frontmatter + "\n\n" + body;
}
