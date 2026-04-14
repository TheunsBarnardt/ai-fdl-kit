<!-- AUTO-GENERATED FROM session-management-revocation.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Session Management Revocation

> Lifecycle management for authenticated user sessions including creation, activity-based expiry extension, idle timeout enforcement, and explicit revocation by users or administrators.

**Category:** Auth · **Version:** 1.0.0 · **Tags:** sessions · tokens · revocation · idle-timeout · security

## What this does

Lifecycle management for authenticated user sessions including creation, activity-based expiry extension, idle timeout enforcement, and explicit revocation by users or administrators.

Specifies 8 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **session_id** *(hidden, required)* — Unique session identifier
- **session_token** *(token, required)* — Cryptographic bearer token presented on every authenticated request
- **user_id** *(hidden, required)* — Owner of the session
- **roles** *(text, required)* — Space-separated role identifiers captured at session creation time
- **device_id** *(text, optional)* — Optional identifier for the mobile/desktop device that created the session
- **expires_at** *(datetime, required)* — Absolute timestamp after which the session is no longer valid
- **last_activity_at** *(datetime, required)* — Timestamp of the most recent authenticated request; used for idle timeout
- **session_type** *(select, required)* — Classification of the session
- **csrf_token** *(token, required)* — Per-session CSRF token validated on state-mutating requests

## What must be true

- **rule_01:** Sessions are validated on every authenticated request by looking up the token in the database and an in-memory cache; a token not found in either is rejected.
- **rule_02:** The per-user maximum session count is 500; when exceeded, the least-recently-used sessions are revoked to make room.
- **rule_03:** Session length differs by type — mobile sessions, SSO sessions, and web sessions each have independently configurable maximum durations.
- **rule_04:** When activity-based extension is enabled, the expiry timestamp is extended on each request, but at most once per approximately 1% of the total session lifetime or once per day to limit write frequency.
- **rule_05:** Idle timeout is enforced separately from absolute expiry; if a configurable inactivity period elapses without requests, the session is revoked asynchronously.
- **rule_06:** User access tokens create sessions with a lifespan of 100 years; they are revoked by disabling or deleting the token, not by expiry.
- **rule_07:** When a session is revoked, the in-memory cache for that user is cleared to ensure all nodes reject the token immediately.
- **rule_08:** Revoking all sessions for a user also invalidates any associated OAuth access data.
- **rule_09:** Device-level revocation removes all sessions associated with a specific device ID, except optionally the current session.
- **rule_10:** A CSRF token is issued per session and validated on all state-mutating requests.

## Success & failure scenarios

**✅ Success paths**

- **Session Limit Enforced** — when new session would exceed the per-user maximum session count, then Oldest session silently terminated; new session proceeds.
- **Session Created** — when user has successfully authenticated (password + optional MFA); user account is active; session limit not exceeded or LRU revocation makes room, then Session token returned to client for use on subsequent requests.
- **Request Authenticated** — when request includes a valid session token; token found in cache or database; expires_at is in the future; idle timeout has not elapsed, then Request proceeds as authenticated.
- **Session Revoked By User** — when user requests sign-out or revokes a specific session, then Token invalid on all subsequent requests.
- **All Sessions Revoked** — when administrator or system revokes all sessions for a user (e.g., on deactivation), then User is signed out everywhere immediately.

**❌ Failure paths**

- **Session Token Invalid** — when session token not found in cache or database, then Request rejected with 401 Unauthorized. *(error: `SESSION_INVALID_TOKEN`)*
- **Session Expired** — when token found but expires_at is in the past, then Request rejected; client must re-authenticate. *(error: `SESSION_EXPIRED`)*
- **Idle Timeout Exceeded** — when time since last_activity_at exceeds configured idle timeout; activity-based extension is not enabled, then Session terminated; user must log in again. *(error: `SESSION_IDLE_TIMEOUT`)*

## Errors it can return

- `SESSION_INVALID_TOKEN` — Your session is invalid. Please sign in again.
- `SESSION_EXPIRED` — Your session has expired. Please sign in again.
- `SESSION_IDLE_TIMEOUT` — You have been signed out due to inactivity.
- `SESSION_NOT_FOUND` — Session not found.
- `SESSION_USER_DEACTIVATED` — Your account has been deactivated.

## Events

**`session.created`** — New authenticated session established
  Payload: `session_id`, `user_id`, `session_type`, `device_id`, `expires_at`, `timestamp`

**`session.revoked`** — Session explicitly terminated
  Payload: `session_id`, `user_id`, `reason`, `actor_id`, `timestamp`

**`session.all_revoked`** — All sessions for a user revoked in a single operation
  Payload: `user_id`, `actor_id`, `reason`, `timestamp`

**`session.extended`** — Session expiry pushed forward due to user activity
  Payload: `session_id`, `user_id`, `new_expires_at`, `timestamp`

## Connects to

- **multi-factor-authentication** *(required)* — Sessions are created only after MFA verification (when MFA is active)
- **saml-sso** *(required)* — SSO logins produce sessions with the SSO session type and extended lifetime
- **ldap-authentication-sync** *(required)* — LDAP logins create web-type sessions with directory-auth markers
- **user-deactivation-archiving** *(recommended)* — User deactivation triggers all-session revocation

## Quality fitness 🟢 81/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `██████░░░░` | 6/10 |
| Outcomes | `████████████████████████░` | 24/25 |
| Structured conditions | `█████░░░░░` | 5/10 |
| Error binding | `███████░░░` | 7/10 |
| Field validation | `██████░░░░` | 6/10 |
| Relationships | `██████████` | 10/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `████░` | 4/5 |
| Simplicity | `████░` | 4/5 |

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/auth/session-management-revocation/) · **Spec source:** [`session-management-revocation.blueprint.yaml`](./session-management-revocation.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
