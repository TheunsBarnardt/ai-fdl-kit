<!-- AUTO-GENERATED FROM fine-grained-authorization.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Fine Grained Authorization

> Resource-based and policy-based authorization

**Category:** Access · **Version:** 1.0.0 · **Tags:** authorization · rbac

## What this does

Resource-based and policy-based authorization

Specifies 1 acceptance outcome that any implementation must satisfy, regardless of language or framework.

## Fields

- **resource_id** *(text, required)* — Resource ID
- **scope_name** *(text, required)* — Scope

## What must be true

- **core:** Authorization policy evaluation

## Success & failure scenarios

**✅ Success paths**

- **Access Granted** — when resource_id exists null, then Access granted.

## Errors it can return

- `ACCESS_DENIED` — Access denied

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/access/fine-grained-authorization/) · **Spec source:** [`fine-grained-authorization.blueprint.yaml`](./fine-grained-authorization.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
