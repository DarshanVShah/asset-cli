import * as fs from "fs";
import * as path from "path";
import { log, c } from "../util/log";
import { scanDir, toRelative } from "../util/scanner";
import { createCardForAsset } from "./create";
import { resolveOptions } from "../util/config";
import { groupAssets, groupCardPath, type AnimationGroup } from "../util/grouping";
import { cardPathFor, toPosix } from "../util/paths";
import { buildCardTemplate } from "../util/template";
import { inferAssetType } from "../util/infer";

interface CreateMissingOptions {
  force?: boolean;
}

interface GroupOutcome {
  kind: "created" | "skipped-existing" | "skipped-conflict";
  cardPath: string;
  group: AnimationGroup;
  conflict?: string[]; // existing per-frame card paths that blocked grouping
}

function createGroupCard(group: AnimationGroup, cwd: string, force: boolean): GroupOutcome {
  const cardPath = groupCardPath(group);
  const conflicts: string[] = [];
  // Any sibling per-frame card blocks the merge unless --force.
  for (const frame of group.frames) {
    const perFrameCard = cardPathFor(frame);
    if (fs.existsSync(perFrameCard)) conflicts.push(perFrameCard);
  }
  if (conflicts.length > 0 && !force) {
    return { kind: "skipped-conflict", cardPath, group, conflict: conflicts };
  }
  if (fs.existsSync(cardPath) && !force) {
    return { kind: "skipped-existing", cardPath, group };
  }

  const firstFrame = group.frames[0];
  const sourceRelative = toPosix(path.relative(cwd, firstFrame));
  const framesRelative = group.frames.map((f) => toPosix(path.relative(cwd, f)));
  // Infer type from the path. If nothing matches (folder hint, name keyword)
  // we still know it's an animated series, so default to "animation".
  const inferred = inferAssetType(sourceRelative);
  const type = inferred === "unknown" ? "animation" : inferred;
  const content = buildCardTemplate({
    id: group.stem,
    type,
    sourceRelative,
    framesRelative,
  });
  fs.writeFileSync(cardPath, content, "utf8");
  return { kind: "created", cardPath, group };
}

export async function runCreateMissing(dir: string | undefined, options: CreateMissingOptions = {}): Promise<void> {
  const opts = resolveOptions({ dirArg: dir });
  const { cwd, assetsDir, ignore, supportedExtensions, configSource, configWarnings } = opts;

  log.header(`asset-md create-missing ${c.dim(toRelative(assetsDir, cwd) || ".")}`);
  if (configSource) log.dim(`config: ${toRelative(configSource, cwd)}`);
  for (const w of configWarnings) log.warn(`config: ${w}`);

  if (!fs.existsSync(assetsDir)) {
    log.warn(`Directory not found: ${toRelative(assetsDir, cwd)}`);
    return;
  }

  const scan = await scanDir(assetsDir, { ignore, supportedExtensions });

  // Group all assets (not just missing ones) so we can decide groups holistically.
  // We then filter per-group: skip if the group card already exists (unless --force).
  const { groups, singletons } = groupAssets(scan.assets);

  // Frames that belong to a group are excluded from per-frame creation logic.
  const groupedFrames = new Set<string>();
  for (const g of groups) for (const f of g.frames) groupedFrames.add(f);

  // -- Groups
  const groupOutcomes: GroupOutcome[] = [];
  for (const group of groups) {
    groupOutcomes.push(createGroupCard(group, cwd, Boolean(options.force)));
  }

  // -- Singletons + frames-from-tiny-groups: per-asset create flow
  const created: string[] = [];
  const overwritten: string[] = [];
  const singletonTargets = options.force
    ? singletons
    : singletons.filter((p) => !fs.existsSync(cardPathFor(p)));
  for (const asset of singletonTargets) {
    const result = createCardForAsset(asset, { force: Boolean(options.force), cwd });
    const relCard = toRelative(result.cardPath, cwd);
    if (result.status === "created") created.push(relCard);
    else if (result.status === "overwritten") overwritten.push(relCard);
  }

  // -- Summary
  const createdGroups = groupOutcomes.filter((o) => o.kind === "created");
  const skippedExisting = groupOutcomes.filter((o) => o.kind === "skipped-existing");
  const skippedConflict = groupOutcomes.filter((o) => o.kind === "skipped-conflict");

  log.info("");
  log.info(`${c.bold("Animation groups:")}    ${groups.length}`);
  log.info(`  ${c.green("created cards:")}    ${createdGroups.length}`);
  if (skippedExisting.length > 0) log.info(`  ${c.dim("skipped (had card):")} ${skippedExisting.length}`);
  if (skippedConflict.length > 0) log.info(`  ${c.yellow("skipped (per-frame cards exist):")} ${skippedConflict.length}`);
  log.info(`${c.bold("Singleton assets:")}    ${singletons.length}`);
  log.info(`  ${c.green("created cards:")}    ${created.length}`);
  log.info(`  ${c.dim("skipped (had card):")} ${singletons.length - created.length - overwritten.length}`);
  log.info(`${c.dim("Ignored files:")}        ${scan.ignored.length}`);

  if (createdGroups.length > 0) {
    log.header("Created (animation):");
    for (const o of createdGroups) {
      const rel = toRelative(o.cardPath, cwd);
      const range = `${o.group.frameNumbers[0]}–${o.group.frameNumbers[o.group.frameNumbers.length - 1]}`;
      log.ok(`  ${c.cyan(rel)} ${c.dim(`(${o.group.frames.length} frames, ${range})`)}`);
    }
  }

  if (skippedConflict.length > 0) {
    log.header("Skipped — per-frame cards already exist:");
    for (const o of skippedConflict) {
      const rel = toRelative(o.cardPath, cwd);
      log.warn(`  ${c.yellow(rel)} would replace ${o.conflict!.length} per-frame card(s):`);
      for (const cf of o.conflict!.slice(0, 5)) log.dim(`    ${toRelative(cf, cwd)}`);
      if (o.conflict!.length > 5) log.dim(`    ... and ${o.conflict!.length - 5} more`);
    }
    log.dim("To consolidate them, delete the per-frame cards (or re-run with --force) then rerun.");
  }

  if (created.length > 0) {
    log.header("Created (singletons):");
    for (const p of created) log.ok("  " + c.cyan(p));
  }

  if (scan.ignored.length > 0) {
    log.header("Ignored (unsupported types):");
    const preview = scan.ignored.slice(0, 10);
    for (const p of preview) log.dim("  " + toRelative(p, cwd));
    if (scan.ignored.length > preview.length) {
      log.dim(`  ... and ${scan.ignored.length - preview.length} more`);
    }
  }

}
