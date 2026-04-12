<!-- AUTO-GENERATED FROM one-time-prekey-replenishment.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# One Time Prekey Replenishment

> Client-driven one-time pre-key pool monitoring and replenishment to ensure uninterrupted secure session establishment

**Category:** Auth · **Version:** 1.0.0 · **Tags:** prekeys · replenishment · pool-management · end-to-end-encryption · ec-keys · kem-keys · device-maintenance

## What this does

Client-driven one-time pre-key pool monitoring and replenishment to ensure uninterrupted secure session establishment

Specifies 9 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **identity_type** *(select, optional)* — Identity Type
- **ec_prekey_count** *(number, optional)* — Available EC One-Time Pre-Key Count
- **pq_prekey_count** *(number, optional)* — Available KEM One-Time Pre-Key Count
- **aci_ec_count** *(number, optional)* — ACI EC One-Time Pre-Key Count
- **pni_ec_count** *(number, optional)* — PNI EC One-Time Pre-Key Count
- **aci_pq_count** *(number, optional)* — ACI KEM One-Time Pre-Key Count
- **pni_pq_count** *(number, optional)* — PNI KEM One-Time Pre-Key Count
- **ec_one_time_prekeys** *(json, optional)* — EC One-Time Pre-Keys to Upload
- **pq_one_time_prekeys** *(json, optional)* — KEM One-Time Pre-Keys to Upload

## What must be true

- **polling → client_polls_on_startup:** true
- **polling → client_polls_after_wake:** true
- **polling → client_polls_after_key_consumption:** true
- **identity_management → four_pools_per_device:** true
- **identity_management → combined_count_endpoint_available:** true
- **upload_constraints → max_ec_keys_per_upload:** 100
- **upload_constraints → max_kem_keys_per_upload:** 100
- **upload_constraints → non_empty_list_replaces_existing_pool:** true
- **upload_constraints → all_kem_keys_must_be_signed_by_identity_key:** true
- **last_resort_fallback → kem_last_resort_key_used_when_pool_empty:** true
- **last_resort_fallback → last_resort_key_is_never_consumed:** true
- **orphan_cleanup → background_process_removes_unreferenced_pages:** true
- **orphan_cleanup → minimum_retention_before_deletion:** true
- **orphan_cleanup → cleanup_is_non_disruptive:** true
- **authentication → required_for_count_queries:** true
- **authentication → required_for_uploads:** true

## Success & failure scenarios

**✅ Success paths**

- **Count Query Success** — when device is authenticated; Specific identity type requested, then HTTP 200 — current EC and KEM one-time pre-key counts for the specified identity.
- **Combined Count Query Success** — when device is authenticated; combined count for all identity types requested, then HTTP 200 — EC and KEM counts for both ACI and PNI identities.
- **Pool Adequate** — when device is authenticated; all pools are at or above client replenishment threshold, then No upload required; client continues normal operation.
- **Pool Below Threshold** — when device is authenticated; EC one-time key pool is empty OR KEM one-time key pool is empty, then Client initiates a pre-key upload to replenish the depleted pool.
- **Upload Success** — when device is authenticated; ec_one_time_prekeys is non-empty OR pq_one_time_prekeys is non-empty; all submitted KEM pre-keys have valid signatures, then HTTP 200 — pool replenished; server-side counts updated.
- **Orphan Page Cleanup** — when background maintenance is running; a KEM pre-key storage page exists that is not referenced by any active device; the page has been unreferenced for longer than the minimum retention period, then Orphaned storage page deleted; no impact on active key exchange.

**❌ Failure paths**

- **Count Query Unauthenticated** — when request does not carry valid account credentials, then HTTP 401 — authentication required. *(error: `PREKEY_REPLENISHMENT_UNAUTHORIZED`)*
- **Upload Unauthenticated** — when upload request does not carry valid account credentials, then HTTP 401 — authentication required. *(error: `PREKEY_REPLENISHMENT_UNAUTHORIZED`)*
- **Upload Invalid Signature** — when device is authenticated; pq_one_time_prekeys batch is provided; one or more KEM pre-keys fail signature validation against the identity key, then HTTP 422 — invalid KEM pre-key signature; no keys stored. *(error: `PREKEY_REPLENISHMENT_INVALID_SIGNATURE`)*

## Errors it can return

- `PREKEY_REPLENISHMENT_UNAUTHORIZED` — Authentication required to manage pre-keys.
- `PREKEY_REPLENISHMENT_INVALID_SIGNATURE` — One or more pre-key signatures are invalid.

## Connects to

- **signal-prekey-bundle** *(required)* — One-time keys are consumed during pre-key bundle retrieval and must be replenished to avoid fallback to last-resort keys
- **phone-number-registration** *(recommended)* — After registration, clients should immediately upload one-time pre-key pools for both ACI and PNI identities

## Quality fitness 🟢 86/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `██████████` | 10/10 |
| Outcomes | `████████████████████████░` | 24/25 |
| Structured conditions | `█████░░░░░` | 5/10 |
| Error binding | `██████████` | 10/10 |
| Field validation | `█████░░░░░` | 5/10 |
| Relationships | `████████░░` | 8/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `████░` | 4/5 |
| Simplicity | `█████` | 5/5 |

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/auth/one-time-prekey-replenishment/) · **Spec source:** [`one-time-prekey-replenishment.blueprint.yaml`](./one-time-prekey-replenishment.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
