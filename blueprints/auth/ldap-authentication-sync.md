<!-- AUTO-GENERATED FROM ldap-authentication-sync.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Ldap Authentication Sync

> Directory service authentication and periodic synchronization that validates credentials against an LDAP/Active Directory server and keeps user profiles and group memberships current with the...

**Category:** Auth · **Version:** 1.0.0 · **Tags:** ldap · active-directory · directory-sync · enterprise-auth · group-sync

## What this does

Directory service authentication and periodic synchronization that validates credentials against an LDAP/Active Directory server and keeps user profiles and group memberships current with the...

Specifies 6 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **server_url** *(url, required)* — LDAP/AD server connection URL (ldap:// or ldaps://)
- **bind_username** *(text, required)* — Service account DN used to bind to the directory for searches
- **bind_password** *(password, required)* — Password for the bind service account
- **base_dn** *(text, required)* — Base distinguished name from which to search for users
- **user_filter** *(text, optional)* — LDAP filter to restrict which directory entries are treated as users
- **group_filter** *(text, optional)* — LDAP filter to restrict which directory entries are treated as groups
- **attribute_username** *(text, required)* — Directory attribute mapped to application username
- **attribute_email** *(text, required)* — Directory attribute mapped to user email address
- **attribute_first_name** *(text, optional)* — Directory attribute mapped to first name
- **attribute_last_name** *(text, optional)* — Directory attribute mapped to last name
- **sync_interval_minutes** *(number, optional)* — How frequently the background sync job runs (in minutes)
- **max_login_attempts** *(number, optional)* — Maximum consecutive failed login attempts before account lockout

## What must be true

- **rule_01:** User passwords are never stored in the application; credentials are validated directly against the directory server on every login.
- **rule_02:** Failed login attempts are counted per user; exceeding the configured maximum triggers an account lockout.
- **rule_03:** A distributed lock prevents concurrent authentication attempts for the same user, eliminating race conditions.
- **rule_04:** On successful login, the failed attempt counter is reset to zero.
- **rule_05:** User profile attributes (email, first name, last name, username) are synchronized from directory attributes on every login and during background sync.
- **rule_06:** When a user is removed from the directory, the background sync deactivates their application account.
- **rule_07:** Group memberships in the directory are mapped to application group memberships during sync; group-constrained workspaces enforce this.
- **rule_08:** LDAP users can activate TOTP multi-factor authentication; after successful directory password validation, the TOTP code is checked before a session is created.
- **rule_09:** Non-LDAP accounts can be migrated to LDAP by providing valid directory credentials during a switch operation.
- **rule_10:** Diagnostic tests can be run against the live directory configuration without saving changes.

## Success & failure scenarios

**✅ Success paths**

- **User Deactivated By Sync** — when sync job runs; user exists in the application but is no longer present in the directory, then User account deactivated; existing sessions terminated.
- **Ldap Login Success** — when LDAP authentication is enabled; user provides valid directory username and password; account is not locked due to excessive failed attempts; MFA code is valid (if MFA is activated for this user), then User is authenticated and a session is established.
- **Sync Completed** — when background sync job triggers at configured interval; directory is reachable, then User profiles and group memberships reflect current directory state.

**❌ Failure paths**

- **Ldap Account Locked** — when failed login attempts equal or exceed max_login_attempts, then Login blocked until administrator resets the attempt counter. *(error: `LDAP_ACCOUNT_LOCKED`)*
- **Ldap Server Unreachable** — when LDAP server cannot be reached or connection refused, then Login rejected with temporary error; no change to attempt counter. *(error: `LDAP_SERVER_UNAVAILABLE`)*
- **Ldap Login Invalid Credentials** — when user provides incorrect directory password, then Login rejected; attempt counter incremented. *(error: `LDAP_INVALID_CREDENTIALS`)*

## Errors it can return

- `LDAP_INVALID_CREDENTIALS` — Your username or password is incorrect.
- `LDAP_ACCOUNT_LOCKED` — Your account has been locked due to too many failed login attempts.
- `LDAP_SERVER_UNAVAILABLE` — Unable to reach the directory server. Please try again later.
- `LDAP_NOT_ENABLED` — Directory authentication is not configured on this server.
- `LDAP_INVALID_FILTER` — The directory search filter is invalid. Please contact your administrator.
- `LDAP_USER_NOT_FOUND` — No matching account was found in the directory.

## Connects to

- **multi-factor-authentication** *(recommended)* — LDAP users can activate TOTP MFA; MFA check occurs after directory password validation
- **session-management** *(required)* — Successful LDAP login creates a managed session
- **team-workspaces** *(optional)* — Group-constrained workspaces use LDAP group sync to manage membership
- **saml-sso** *(optional)* — SAML and LDAP can coexist; SAML may delegate attribute enrichment to LDAP

## Quality fitness 🟢 80/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `██████░░░░` | 6/10 |
| Outcomes | `███████████████████████░░` | 23/25 |
| Structured conditions | `█████░░░░░` | 5/10 |
| Error binding | `██████░░░░` | 6/10 |
| Field validation | `███████░░░` | 7/10 |
| Relationships | `██████████` | 10/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `████░` | 4/5 |
| Simplicity | `████░` | 4/5 |

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/auth/ldap-authentication-sync/) · **Spec source:** [`ldap-authentication-sync.blueprint.yaml`](./ldap-authentication-sync.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
