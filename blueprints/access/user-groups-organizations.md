<!-- AUTO-GENERATED FROM user-groups-organizations.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# User Groups Organizations

> Hierarchical groups with role inheritance

**Category:** Access · **Version:** 1.0.0 · **Tags:** groups · organizations

## What this does

Hierarchical groups with role inheritance

Specifies 1 acceptance outcome that any implementation must satisfy, regardless of language or framework.

## Fields

- **group_id** *(text, required)* — Group ID
- **group_name** *(text, required)* — Group Name

## What must be true

- **core:** Group hierarchy and role inheritance

## Success & failure scenarios

**✅ Success paths**

- **Group Created** — when group_name exists null, then Group created.

## Errors it can return

- `GROUP_NOT_FOUND` — Group not found

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/access/user-groups-organizations/) · **Spec source:** [`user-groups-organizations.blueprint.yaml`](./user-groups-organizations.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
