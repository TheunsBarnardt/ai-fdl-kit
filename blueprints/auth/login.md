<!-- AUTO-GENERATED FROM login.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Login

> Authenticate a user with email and password

**Category:** Auth · **Version:** 1.0.0 · **Tags:** authentication · session · security · identity · saas

## What this does

Authenticate a user with email and password

Specifies 6 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **email** *(email, required)* — Email Address
- **password** *(password, required)* — Password
- **remember_me** *(boolean, optional)* — Remember me

## What must be true

- **security → max_attempts:** 5
- **security → lockout_duration_minutes:** 15
- **security → lockout_scope:** per_email
- **security → rate_limit → window_seconds:** 60
- **security → rate_limit → max_requests:** 10
- **security → rate_limit → scope:** per_ip
- **security → password_comparison → constant_time:** true
- **security → credential_error_handling → generic_message:** true
- **session → type:** jwt
- **session → access_token → expiry_minutes:** 15
- **session → refresh_token → expiry_days:** 7
- **session → refresh_token → rotate_on_use:** true
- **session → remember_me_expiry_days:** 30
- **session → extend_on_activity:** true
- **session → secure_flags → http_only:** true
- **session → secure_flags → secure:** true
- **session → secure_flags → same_site:** strict
- **email → require_verified:** true
- **email → case_sensitive:** false
- **email → trim_whitespace:** true

## Success & failure scenarios

**✅ Success paths**

- **Successful Login** — when Email is valid format; User found in database (after lowercase + trim normalization); Password matches stored hash (constant-time via bcrypt); status neq "disabled"; email_verified eq true, then redirect to /dashboard. _Why: The only path that creates a session. Atomic so the counter reset, session issuance, and success event all persist together — a half-succeeded login must roll back to avoid stale lockouts or orphaned sessions._

**❌ Failure paths**

- **Rate Limited** — when More than 10 requests in 60 seconds from this IP, then show "Too many login attempts. Please wait a moment.". _Why: Defends against credential-stuffing and brute-force probes by short-circuiting before any DB lookup, so attackers cannot use response timing to enumerate accounts._ *(error: `LOGIN_RATE_LIMITED`)*
- **Account Locked** — when Max attempts exceeded; Lockout period has not expired, then show "Account temporarily locked. Please try again later.". _Why: Stops repeated failed-login attempts on a single account. Distinct from rate_limited: this is per-account state (sticky), not per-IP rate (rolling)._ *(error: `LOGIN_ACCOUNT_LOCKED`)*
- **Account Disabled** — when Account deactivated by admin or user, then show "This account has been disabled. Please contact support.". _Why: Honors admin/user deactivation as an explicit, non-recoverable state. Checked before credentials so a disabled user can never observe a 'wrong password' response._ *(error: `LOGIN_ACCOUNT_DISABLED`)*
- **Invalid Credentials** — when User not found in database OR Password does not match (constant-time comparison), then show "Invalid email or password" (SAME message for both cases — enumeration prevention). _Why: Collapses 'user not found' and 'wrong password' into one indistinguishable response. Identical message + status + similar latency are mandatory to prevent user enumeration (OWASP ASVS 2.2.1)._ *(error: `LOGIN_INVALID_CREDENTIALS`)*
- **Email Not Verified** — when User exists, password correct, but email not verified, then redirect to /verify-email with message "Please verify your email before logging in". _Why: Blocks session creation until the user proves email ownership. Prevents unverified accounts from using protected features or receiving sensitive notifications._ *(error: `LOGIN_EMAIL_NOT_VERIFIED`)*

## Errors it can return

- `LOGIN_INVALID_CREDENTIALS` — Invalid email or password
- `LOGIN_ACCOUNT_LOCKED` — Account temporarily locked. Please try again later.
- `LOGIN_EMAIL_NOT_VERIFIED` — Please verify your email address to continue
- `LOGIN_ACCOUNT_DISABLED` — This account has been disabled. Please contact support.
- `LOGIN_RATE_LIMITED` — Too many login attempts. Please wait a moment.
- `LOGIN_VALIDATION_ERROR` — Please check your input and try again

## Events

**`login.success`** — User successfully authenticated
  Payload: `user_id`, `email`, `timestamp`, `ip_address`, `user_agent`, `session_id`

**`login.failed`** — Authentication attempt failed
  Payload: `email`, `timestamp`, `ip_address`, `user_agent`, `attempt_count`, `reason`

**`login.locked`** — Account locked due to too many failures
  Payload: `email`, `user_id`, `timestamp`, `lockout_until`, `attempt_count`

**`login.unverified`** — Login blocked — email not verified
  Payload: `user_id`, `email`, `timestamp`

## Connects to

- **signup** *(required)* — User must exist before they can log in
- **password-reset** *(recommended)* — Users will forget passwords
- **email-verification** *(recommended)* — Required when rules.email.require_verified is true
- **logout** *(required)* — Every login needs a logout
- **biometric-auth** *(optional)* — Palm vein scan as an alternative to password login

## Quality fitness 🟢 91/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `███████░░░` | 7/10 |
| Rules | `█████████░` | 9/10 |
| Outcomes | `███████████████████████░░` | 23/25 |
| Structured conditions | `██████████` | 10/10 |
| Error binding | `█████████░` | 9/10 |
| Field validation | `████████░░` | 8/10 |
| Relationships | `██████████` | 10/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `█████` | 5/5 |
| Simplicity | `█████` | 5/5 |

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/auth/login/) · **Spec source:** [`login.blueprint.yaml`](./login.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
