<!-- AUTO-GENERATED FROM user-federation-ldap-kerberos.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# User Federation Ldap Kerberos

> LDAP, Kerberos, and AD directory integration

**Category:** Integration · **Version:** 1.0.0 · **Tags:** federation · ldap

## What this does

LDAP, Kerberos, and AD directory integration

Specifies 1 acceptance outcome that any implementation must satisfy, regardless of language or framework.

## Fields

- **connection_url** *(url, required)* — LDAP URL
- **bind_dn** *(text, required)* — Bind DN

## What must be true

- **core:** Directory synchronization

## Success & failure scenarios

**✅ Success paths**

- **User Found** — when connection_url exists null, then User found in directory.

## Errors it can return

- `FEDERATION_ERROR` — Federation service unavailable

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/integration/user-federation-ldap-kerberos/) · **Spec source:** [`user-federation-ldap-kerberos.blueprint.yaml`](./user-federation-ldap-kerberos.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
