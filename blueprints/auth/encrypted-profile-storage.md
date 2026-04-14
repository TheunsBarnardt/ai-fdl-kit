<!-- AUTO-GENERATED FROM encrypted-profile-storage.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Encrypted Profile Storage

> Versioned, client-encrypted profile storage with avatar upload credential issuance and zero-knowledge profile key credential system

**Category:** Auth · **Version:** 1.0.0 · **Tags:** encryption · profile · zero-knowledge · avatar · versioning · privacy

## What this does

Versioned, client-encrypted profile storage with avatar upload credential issuance and zero-knowledge profile key credential system

Specifies 9 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **profile_version** *(text, required)* — Profile Version
- **commitment** *(token, required)* — Profile Key Commitment
- **name** *(token, optional)* — Encrypted Name
- **about** *(token, optional)* — Encrypted About
- **about_emoji** *(token, optional)* — Encrypted About Emoji
- **payment_address** *(token, optional)* — Encrypted Payment Address
- **phone_number_sharing** *(token, optional)* — Encrypted Phone Number Sharing
- **has_avatar** *(boolean, optional)* — Has Avatar
- **same_avatar** *(boolean, optional)* — Same Avatar
- **credential_request** *(token, optional)* — Credential Request
- **credential_type** *(select, optional)* — Credential Type

## What must be true

- **encryption → client_side_only:** true
- **encryption → note:** All profile field values (name, about, about_emoji, payment_address, phone_number_sharing) are encrypted on the client before upload; the server stores opaque ciphertext and never accesses plaintext
- **encryption → padding_required:** true
- **encryption → padding_purpose:** Fixed-size padding prevents traffic-analysis leakage of plaintext length
- **versioning → key:** account_identifier_plus_version
- **versioning → multi_version:** true
- **versioning → note:** Each profile version is keyed by both the account identifier and the version string; multiple versions may coexist per account
- **versioning → commitment_immutable:** true
- **versioning → commitment_note:** The profile key commitment is written once per version using a conditional update; it cannot be overwritten after creation
- **payment_address → scope:** current_version_only
- **payment_address → note:** Payment addresses are only returned when the requested version matches the account's current profile version
- **payment_address → region_blocking:** configurable
- **payment_address → region_note:** Payment addresses are blocked for phone-number prefixes on a configurable disallowed-regions list, unless a payment address was already set
- **avatar → max_size_bytes:** 10485760
- **avatar → storage:** object_storage_profiles_prefix
- **avatar → upload:** presigned_post_policy
- **avatar → note:** Avatar uploads require pre-signed form credentials; the server generates an object name from random bytes and signs a timed upload form
- **avatar → cleanup:** Previous avatar is deleted when an account sets a new avatar
- **access_control → methods:** authenticated, unidentified_access_key, group_send_token
- **access_control → note:** Profile retrieval requires authenticated access, a valid unidentified-access key, or a group send token (unversioned endpoint only)
- **access_control → rate_limiting:** per_authenticated_account
- **credentials → type:** expiring_profile_key
- **credentials → validity_days:** 7
- **credentials → note:** ZK expiring profile key credentials are valid for 7 days from issuance
- **deletion → on_account_delete:** all_versions_deleted
- **deletion → avatar_on_explicit_delete:** deleted
- **deletion → avatar_on_reimplicit_register:** preserved_for_pin_recovery

## Success & failure scenarios

**✅ Success paths**

- **Profile Set New Avatar** — when Caller is authenticated; commitment exists; has_avatar eq true; same_avatar eq false, then Profile stored; response contains pre-signed avatar upload form credentials.
- **Profile Set Clear Avatar** — when Caller is authenticated; commitment exists; has_avatar eq false, then Profile stored with no avatar; empty 200 response.
- **Profile Set Unchanged Avatar** — when Caller is authenticated; commitment exists; same_avatar eq true, then Profile stored; existing avatar object reused; empty 200 response.
- **Versioned Profile Retrieved** — when Caller provides valid authentication or unidentified-access key; profile_version exists, then Encrypted profile fields returned (name, about, about_emoji, avatar path, payment_address, phone_number_sharing); fields absent if version not found.
- **Profile Key Credential Issued** — when Caller provides valid authentication or unidentified-access key; credential_request exists; credential_type eq "expiringProfileKey"; Profile version exists in storage, then Versioned profile fields returned alongside an expiring ZK profile key credential valid for 7 days.
- **Batch Identity Check Mismatch** — when Unauthenticated batch identity check request submitted; At least one element 4-byte SHA-256 fingerprint does not match the stored identity key, then Response contains only the elements whose fingerprints differ from stored identity keys.

**❌ Failure paths**

- **Rate Limited** — when Caller is authenticated; Profile read rate limit is exceeded for this account, then Request rejected with rate-limit error. *(error: `PROFILE_RATE_LIMITED`)*
- **Unauthorized Access** — when Caller provides neither valid authentication nor a valid unidentified-access key nor a valid group send token, then Request rejected as unauthorized. *(error: `PROFILE_UNAUTHORIZED`)*
- **Payment Address Region Blocked** — when Caller is authenticated and is updating their own profile; Request includes a payment address; Account phone number matches a blocked-region prefix and no payment address exists yet for this version, then Profile update rejected because payment addresses are not supported in this region. *(error: `PROFILE_PAYMENT_ADDRESS_REGION_BLOCKED`)*

## Errors it can return

- `PROFILE_RATE_LIMITED` — Too many profile requests. Please wait before trying again.
- `PROFILE_UNAUTHORIZED` — Not authorized to access this profile.
- `PROFILE_NOT_FOUND` — The requested profile or account was not found.
- `PROFILE_INVALID_REQUEST` — Invalid profile request. Check field sizes and formats.
- `PROFILE_PAYMENT_ADDRESS_REGION_BLOCKED` — Payment addresses are not supported in your region.
- `PROFILE_INVALID_CREDENTIAL_TYPE` — Unsupported credential type requested.
- `PROFILE_INVALID_CREDENTIAL_REQUEST` — The credential request is invalid or does not match the stored commitment.

## Events

**`profile.updated`** — A versioned profile was created or replaced by its owner
  Payload: `account_id`, `profile_version`, `avatar_changed`

**`profile.accessed`** — A profile version was retrieved by a requester
  Payload: `target_account_id`, `profile_version`, `requester_type`

**`profile.credential_issued`** — An expiring ZK profile key credential was issued for a profile version
  Payload: `target_account_id`, `profile_version`, `expiry`

**`profile.rate_limited`** — A profile read request was rejected due to rate limiting
  Payload: `requester_uuid`

**`profile.access_denied`** — A profile read was denied due to missing or invalid credentials
  Payload: `target_account_id`

**`profile.identity_mismatch`** — One or more accounts returned mismatched identity key fingerprints in a batch check
  Payload: `mismatched_identifiers`

**`profile.deleted`** — All versioned profiles for an account were deleted on account deletion or re-registration
  Payload: `account_id`, `avatars_deleted`

## Connects to

- **e2e-key-exchange** *(required)* — Profile key commitment is derived from the user's end-to-end encryption key material
- **device-management** *(required)* — Authenticated profile updates require a valid device session
- **login** *(required)* — Authenticated profile read/write endpoints require account authentication
- **encrypted-group-metadata** *(recommended)* — Group send tokens can gate unversioned profile retrieval for group members
- **multi-device-sync** *(recommended)* — Profile version changes should be synced across all devices belonging to the account

## Quality fitness 🟢 82/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `██████████` | 10/10 |
| Outcomes | `██████████████████████░░░` | 22/25 |
| Structured conditions | `███████░░░` | 7/10 |
| Error binding | `█████░░░░░` | 5/10 |
| Field validation | `█████░░░░░` | 5/10 |
| Relationships | `██████████` | 10/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `████░` | 4/5 |
| Simplicity | `████░` | 4/5 |

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/auth/encrypted-profile-storage/) · **Spec source:** [`encrypted-profile-storage.blueprint.yaml`](./encrypted-profile-storage.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
