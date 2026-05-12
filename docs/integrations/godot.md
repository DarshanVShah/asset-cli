# Using asset-md with Godot

`asset-md` is an authoring tool, not a Godot plugin. The integration
is light by design: Godot consumes the generated
`ASSET_MANIFEST.json`, and you optionally use the card's `engine.*`
fields as defaults when instancing assets.

This guide shows a minimal pattern that has worked well for 2D games.

---

## 1. Generate the manifest

```bash
asset-md manifest
# writes ASSET_MANIFEST.json at the project root
```

Commit it. The manifest is small, deterministic, and human-readable.
Godot can load it via `FileAccess` like any other JSON resource.

---

## 2. Read the manifest in a GDScript autoload

`autoload/AssetCatalog.gd`:

```gdscript
extends Node

const MANIFEST_PATH := "res://ASSET_MANIFEST.json"

var by_id: Dictionary = {}    # id -> asset entry
var by_type: Dictionary = {}  # type -> Array of entries

func _ready() -> void:
    _load_manifest()

func _load_manifest() -> void:
    var f := FileAccess.open(MANIFEST_PATH, FileAccess.READ)
    if f == null:
        push_error("ASSET_MANIFEST.json not found; run `asset-md manifest`.")
        return
    var data: Variant = JSON.parse_string(f.get_as_text())
    if typeof(data) != TYPE_DICTIONARY:
        push_error("ASSET_MANIFEST.json is malformed.")
        return
    for entry in data.get("assets", []):
        by_id[entry["id"]] = entry
        var t: String = entry.get("type", "unknown")
        by_type.setdefault(t, [])
        by_type[t].append(entry)

func get_asset(id: String) -> Dictionary:
    return by_id.get(id, {})

func get_by_type(type: String) -> Array:
    return by_type.get(type, [])
```

Register the script as an Autoload (Project Settings → Autoload).

---

## 3. Use the card's engine hint when instancing

The card frontmatter can specify an engine-side hint:

```yaml
engine:
  godot_node: AnimatedSprite2D
  anchor: bottom_center
```

A small instancer helper:

```gdscript
func instance_asset(id: String, parent: Node) -> Node:
    var entry := AssetCatalog.get_asset(id)
    if entry.is_empty():
        push_error("Unknown asset id: %s" % id)
        return null

    var node_type := entry.get("engine", {}).get("godot_node", "Sprite2D")
    var node: Node = ClassDB.instantiate(node_type)
    if node == null:
        push_error("Unknown node type %s for asset %s" % [node_type, id])
        return null

    if node is Sprite2D or node is AnimatedSprite2D:
        var tex := load("res://" + entry["source"]) as Texture2D
        if tex:
            node.texture = tex

    parent.add_child(node)
    return node
```

This is intentionally small. The point is that the *card* declares
intent; the engine code respects it.

---

## 4. Enforce `ai.allow_recolor` / `allow_crop` at runtime

For tools or editor scripts that mutate assets, check the card flags:

```gdscript
func can_recolor(id: String) -> bool:
    var entry := AssetCatalog.get_asset(id)
    return entry.get("ai", {}).get("allow_recolor", false)
```

A holiday-recolor pipeline that respects the cards:

```gdscript
for entry in AssetCatalog.by_id.values():
    if entry.get("type") == "ui" and can_recolor(entry["id"]):
        recolor_ui_asset(entry)
```

---

## 5. CI

Generate the manifest before exporting:

```yaml
- run: npx asset-md validate
- run: npx asset-md manifest
- run: godot --headless --export-release "HTML5" build/index.html
```

That guarantees the exported build's `ASSET_MANIFEST.json` matches
what the validator just blessed.

---

## 6. Editor plugin? Not yet.

We have not built a Godot editor plugin. It would do three things:

- Show the card's content in the inspector when an asset is selected.
- Warn when placing an asset that violates its `forbidden` rules.
- Auto-apply `anchor` / `godot_node` defaults when dragging an asset
  into a scene.

If you want to build one, the surface area is small — see
[CONTRIBUTING.md](../../CONTRIBUTING.md) before starting.
