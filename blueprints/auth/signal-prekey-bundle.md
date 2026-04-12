<!-- AUTO-GENERATED FROM signal-prekey-bundle.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Signal Prekey Bundle

> Upload and retrieval of pre-key bundles combining EC signed keys, one-time EC keys, and post-quantum KEM keys for establishing end-to-end encrypted sessions

**Category:** Auth · **Version:** 1.0.0 · **Tags:** prekeys · end-to-end-encryption · ec-keys · kem-keys · double-ratchet · post-quantum · identity-keys · key-exchange

## What this does

Upload and retrieval of pre-key bundles combining EC signed keys, one-time EC keys, and post-quantum KEM keys for establishing end-to-end encrypted sessions

Specifies 11 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **identity_type** *(select, required)* — Identity Type
- **ec_one_time_prekeys** *(json, optional)* — EC One-Time Pre-Keys
- **ec_signed_prekey** *(json, optional)* — Signed EC Pre-Key
- **pq_one_time_prekeys** *(json, optional)* — KEM One-Time Pre-Keys
- **pq_last_resort_prekey** *(json, optional)* — KEM Last-Resort Pre-Key
- **target_identifier** *(token, optional)* — Target Account Identifier
- **target_device_id** *(text, optional)* — Target Device ID
- **unidentified_access_key** *(token, optional)* — Unidentified Access Key
- **group_send_token** *(token, optional)* — Group Send Endorsement Token
- **digest** *(token, optional)* — Key Consistency Digest

## What must be true

- **signatures → all_signed_keys_must_validate_against_identity_key:** true
- **upload_limits → max_ec_one_time_prekeys_per_upload:** 100
- **upload_limits → max_kem_one_time_prekeys_per_upload:** 100
- **upload_limits → non_empty_ec_list_replaces_existing_pool:** true
- **upload_limits → non_empty_kem_list_replaces_existing_pool:** true
- **identity_key_changes → only_primary_device_may_change:** true
- **fetch_authorization → requires_exactly_one_of:** account_credentials, unidentified_access_key, group_send_token
- **fetch_authorization → group_send_token_must_be_verified_against_server_secret:** true
- **fetch_rate_limiting → per_requesting_account:** true
- **key_consumption → ec_one_time_keys_are_consumed_on_fetch:** true
- **key_consumption → kem_one_time_keys_are_consumed_on_fetch:** true
- **key_consumption → missing_signed_ec_or_kem_key_excludes_device:** true
- **consistency_check → digest_algorithm:** SHA-256
- **consistency_check → digest_covers:** identity_key, signed_ec_prekey_id, signed_ec_prekey_bytes, last_resort_kem_key_id, last_resort_kem_key_bytes

## Success & failure scenarios

**✅ Success paths**

- **Upload Success** — when device is authenticated; all submitted keys have valid signatures, then HTTP 200 — pre-keys stored successfully.
- **Fetch Success** — when Bundle retrieval requested; target account exists and at least one device has both a signed EC key and a KEM key; requester holds valid authorization credentials, then HTTP 200 — pre-key bundle with identity key, signed EC key, optional unsigned EC key, and KEM key per device.
- **Consistency Check Pass** — when Client submitted a key consistency digest; computed SHA-256 over identity key and repeated-use keys matches submitted digest, then HTTP 200 — client and server have consistent repeated-use key views.

**❌ Failure paths**

- **Upload Invalid Signatures** — when one or more submitted pre-keys have signatures that do not match the account identity key, then HTTP 422 — invalid signature; no keys stored. *(error: `PREKEY_INVALID_SIGNATURE`)*
- **Upload Identity Change Non Primary** — when ec_signed_prekey is present; requesting device is not the primary device, then HTTP 403 — only the primary device may change identity keys. *(error: `PREKEY_IDENTITY_CHANGE_FORBIDDEN`)*
- **Fetch Unauthenticated** — when Bundle retrieval requested; requesting device is not authenticated; No unidentified access key; No group send token, then HTTP 401 — at least one authorization mechanism required. *(error: `PREKEY_FETCH_UNAUTHORIZED`)*
- **Fetch Ambiguous Auth** — when Group send token provided; requesting device is authenticated OR Unidentified access key also provided, then HTTP 400 — only one authorization mechanism may be used per request. *(error: `PREKEY_FETCH_AMBIGUOUS_AUTH`)*
- **Fetch Group Token Invalid** — when Group send token provided; token verification fails against server secret params or target identifier, then HTTP 401 — group send token is invalid or expired. *(error: `PREKEY_GROUP_TOKEN_INVALID`)*
- **Fetch Rate Limited** — when authenticated account has exceeded pre-key fetch rate limit, then HTTP 429 with Retry-After header. *(error: `PREKEY_FETCH_RATE_LIMITED`)*
- **Fetch Not Found** — when Bundle retrieval requested; target account or device does not exist or has no available pre-keys for any requested device, then HTTP 404 — target not found or has no keys. *(error: `PREKEY_NOT_FOUND`)*
- **Consistency Check Fail** — when Client submitted a key consistency digest; computed digest does not match submitted digest OR signed EC pre-key or last-resort KEM key not found on server, then HTTP 409 — key views inconsistent; client should re-upload repeated-use keys. *(error: `PREKEY_CONSISTENCY_MISMATCH`)*

## Errors it can return

- `PREKEY_INVALID_SIGNATURE` — One or more pre-key signatures are invalid.
- `PREKEY_IDENTITY_CHANGE_FORBIDDEN` — Identity key changes can only be made from the primary device.
- `PREKEY_FETCH_UNAUTHORIZED` — Authentication required to retrieve pre-key bundles.
- `PREKEY_FETCH_AMBIGUOUS_AUTH` — Multiple authorization methods were provided. Use only one.
- `PREKEY_GROUP_TOKEN_INVALID` — Group send authorization token is invalid.
- `PREKEY_FETCH_RATE_LIMITED` — Too many key fetch requests. Please wait before trying again.
- `PREKEY_NOT_FOUND` — The requested account or device has no available pre-keys.
- `PREKEY_CONSISTENCY_MISMATCH` — Your device keys are out of sync. Please re-upload your pre-keys.

## Connects to

- **phone-number-registration** *(required)* — Signed pre-keys for both identities are required at account registration time
- **one-time-prekey-replenishment** *(required)* — One-time pre-key pools must be monitored and replenished after keys are consumed during key exchange

## Quality fitness 🟢 86/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `████████░░` | 8/10 |
| Outcomes | `████████████████████████░` | 24/25 |
| Structured conditions | `███████░░░` | 7/10 |
| Error binding | `██████████` | 10/10 |
| Field validation | `█████░░░░░` | 5/10 |
| Relationships | `████████░░` | 8/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `████░` | 4/5 |
| Simplicity | `█████` | 5/5 |

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/auth/signal-prekey-bundle/) · **Spec source:** [`signal-prekey-bundle.blueprint.yaml`](./signal-prekey-bundle.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
