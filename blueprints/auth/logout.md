<!-- AUTO-GENERATED FROM logout.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Logout

> End a user session and clear all authentication tokens

**Category:** Auth · **Version:** 1.0.0 · **Tags:** authentication · session · security · identity

## What this does

End a user session and clear all authentication tokens

Specifies 3 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **logout_scope** *(select, optional)* — Sign out from

## What must be true

- **security → requires_auth:** true
- **security → csrf_protection:** true
- **security → rate_limit → window_seconds:** 60
- **security → rate_limit → max_requests:** 10
- **security → rate_limit → scope:** per_user
- **session → clear_access_token:** true
- **session → clear_refresh_token:** true
- **session → invalidate_server_side:** true

## Success & failure scenarios

**✅ Success paths**

- **Not Authenticated** — when User is not logged in (no valid tokens), then redirect to /login (no error — graceful handling).
- **Successful Logout Current** — when User is authenticated; Logout scope is current device (or default), then redirect to /login.
- **Successful Logout All Devices** — when User is authenticated; User chose to sign out of all devices, then redirect to /login.

## Errors it can return

- `LOGOUT_CSRF_INVALID` — Invalid request. Please try again.
- `LOGOUT_RATE_LIMITED` — Too many requests. Please wait a moment.

## Connects to

- **login** *(required)* — Logout ends what login started
- **session-management** *(optional)* — View active sessions before choosing which to revoke

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/auth/logout/) · **Spec source:** [`logout.blueprint.yaml`](./logout.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
