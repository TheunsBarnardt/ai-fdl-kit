<!-- AUTO-GENERATED FROM magic-link-auth.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Magic Link Auth

> Passwordless email login via single-use magic links

**Category:** Auth · **Version:** 1.0.0 · **Tags:** authentication · passwordless · magic-link · email · security · identity

## What this does

Passwordless email login via single-use magic links

Specifies 8 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **email** *(email, required)* — Email Address
- **token_hash** *(hidden, required)* — Token Hash
- **expires_at** *(datetime, required)* — Token Expires At
- **used_at** *(datetime, optional)* — Token Used At
- **ip_address** *(text, optional)* — Requester IP Address
- **user_agent** *(text, optional)* — Requester User Agent

## What must be true

- **security → token → entropy_bytes:** 32
- **security → token → hash_algorithm:** sha256
- **security → token → expiry_minutes:** 15
- **security → token → single_use:** true
- **security → ip_binding → enabled:** false
- **security → ip_binding → warn_on_ip_mismatch:** true
- **security → rate_limit → window_seconds:** 300
- **security → rate_limit → max_requests:** 3
- **security → rate_limit → scope:** per_email
- **security → rate_limit → cooldown_seconds:** 60
- **security → rate_limit_global → window_seconds:** 60
- **security → rate_limit_global → max_requests:** 20
- **security → rate_limit_global → scope:** per_ip
- **security → enumeration_prevention → generic_response:** true
- **security → enumeration_prevention → constant_time_response:** true
- **security → max_active_tokens_per_email:** 3
- **email → case_sensitive:** false
- **email → trim_whitespace:** true
- **email → link_format:** {base_url}/auth/magic-link/verify?token={token}
- **email → subject:** Your sign-in link
- **email → from_name:** Application

## Success & failure scenarios

**✅ Success paths**

- **Send Magic Link** — when Email is valid format; User with this email exists; Account is not disabled, then show "If an account exists with this email, we sent a sign-in link." (same message always).
- **Send Magic Link No Account** — when Email is valid format; No user with this email exists, then show "If an account exists with this email, we sent a sign-in link." (SAME message — enumeration prevention).
- **Verify Magic Link** — when Token hash matches a stored hash; Token has not expired; Token has not been used; Account is not disabled, then redirect to dashboard.

**❌ Failure paths**

- **Rate Limited Per Email** — when More than 3 magic link requests for this email in 5 minutes, then show "If an account exists with this email, we sent a sign-in link." (same message — enumeration prevention). *(error: `MAGIC_LINK_RATE_LIMITED`)*
- **Rate Limited Per Ip** — when More than 20 magic link requests from this IP in 60 seconds, then show "Too many requests. Please wait a moment.". *(error: `MAGIC_LINK_RATE_LIMITED`)*
- **Token Expired** — when Token hash matches a stored hash; Token has expired, then show "This sign-in link has expired. Please request a new one.". *(error: `MAGIC_LINK_EXPIRED`)*
- **Token Already Used** — when Token hash matches; Token has already been used, then show "This sign-in link has already been used. Please request a new one.". *(error: `MAGIC_LINK_ALREADY_USED`)*
- **Token Invalid** — when Token hash does not match any stored hash, then show "Invalid sign-in link. Please request a new one.". *(error: `MAGIC_LINK_INVALID`)*

## Errors it can return

- `MAGIC_LINK_RATE_LIMITED` — Too many requests. Please wait a moment.
- `MAGIC_LINK_EXPIRED` — This sign-in link has expired. Please request a new one.
- `MAGIC_LINK_ALREADY_USED` — This sign-in link has already been used. Please request a new one.
- `MAGIC_LINK_INVALID` — Invalid sign-in link. Please request a new one.
- `MAGIC_LINK_ACCOUNT_DISABLED` — This account has been disabled. Please contact support.
- `MAGIC_LINK_VALIDATION_ERROR` — Please enter a valid email address

## Connects to

- **login** *(recommended)* — Magic link is an alternative to password-based login
- **signup** *(required)* — User account must exist to receive a magic link
- **email-verification** *(optional)* — Magic link implicitly verifies email ownership
- **session-management** *(recommended)* — Sessions created via magic link need tracking and revocation
- **multi-factor-auth** *(optional)* — MFA can be required as additional factor after magic link

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/auth/magic-link-auth/) · **Spec source:** [`magic-link-auth.blueprint.yaml`](./magic-link-auth.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
