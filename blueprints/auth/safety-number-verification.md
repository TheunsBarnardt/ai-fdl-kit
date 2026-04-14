<!-- AUTO-GENERATED FROM safety-number-verification.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Safety Number Verification

> Contact identity verification via cryptographic fingerprints that detects when a contact's identity key has changed, alerting users to potential key-change events

**Category:** Auth · **Version:** 1.0.0 · **Tags:** identity · key-verification · fingerprint · trust · end-to-end-encryption · key-transparency

## What this does

Contact identity verification via cryptographic fingerprints that detects when a contact's identity key has changed, alerting users to potential key-change events

Specifies 6 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **service_identifier** *(text, required)* — Service Identifier
- **identity_key** *(token, required)* — Identity Key
- **fingerprint** *(token, required)* — Identity Key Fingerprint
- **identity_type** *(select, required)* — Identity Type
- **sender_certificate** *(token, optional)* — Sender Certificate

## What must be true

- **identity_keys:** Each account holds one public identity key per identity type; these keys are set at registration and may change only when explicitly rotated by the user, The server must store and return the full 33-byte serialised identity key so that clients can compute the safety number independently, When an identity key changes the server must not silently reuse the old fingerprint; clients must re-verify after any key rotation, Signed pre-key signatures must be validated against the account's identity key when keys are uploaded or a new device is linked, preventing key substitution attacks
- **fingerprint_checks:** Batch identity key checks accept up to 1000 entries per request; each entry carries a service identifier and a 4-byte fingerprint, The server computes the SHA-256 hash of each stored identity key, extracts the 4 most-significant bytes, and compares them to the client-supplied fingerprint using a constant-time comparison, Only entries where the fingerprint does not match are returned in the response; a match means the client's view is consistent with the server's view
- **sender_certificates:** Sender certificates are short-lived (configurable expiry, typically 24 hours) and signed by a server-held private key; they embed the account UUID, device ID, and public identity key, Clients verify the sender certificate signature against the known server public key to confirm messages originate from the claimed sender, Key transparency proofs may supplement fingerprint checks by providing a publicly auditable, append-only log of identity key bindings

## Success & failure scenarios

**✅ Success paths**

- **Identity Key Not Found** — when the service identifier in the request does not correspond to any registered account, then The entry is omitted from the mismatch response; clients treat absent entries as unknown contacts rather than mismatches.
- **Fingerprint Mismatch** — when batch identity check request contains at least one element; at least one submitted fingerprint does not match the server-stored identity key for its service identifier, then HTTP 200 is returned; the response body contains only the mismatched entries with their current server-side identity keys so the client can detect key changes.
- **Fingerprint Match** — when batch identity check request contains at least one element; every submitted fingerprint matches the server-stored identity key fingerprint for that service identifier, then HTTP 200 is returned with an empty elements array; the client's view is consistent with the server's view.
- **Sender Certificate Issued** — when authenticated device requests a sender certificate; device has a valid registered identity key, then A signed certificate binding the account UUID, device ID, and identity key is returned; the certificate is valid for the configured TTL.

**❌ Failure paths**

- **Invalid Request** — when request contains more than 1000 elements OR fingerprint not_exists OR a service identifier field is malformed, then HTTP 422 is returned; client must correct the request before retrying. *(error: `IDENTITY_CHECK_INVALID_REQUEST`)*
- **Signed Prekey Invalid** — when a signed pre-key or last-resort key is uploaded; the signature on the key does not verify against the account's stored identity key, then HTTP 422 is returned; the key upload is rejected to prevent key substitution. *(error: `IDENTITY_PREKEY_INVALID_SIGNATURE`)*

## Errors it can return

- `IDENTITY_CHECK_INVALID_REQUEST` — Identity check request is malformed; check fingerprint sizes and identifier formats
- `IDENTITY_PREKEY_INVALID_SIGNATURE` — Pre-key signature does not match the account identity key

## Events

**`identity.verified`** — A batch identity check confirmed all submitted fingerprints match the server-stored keys
  Payload: `service_identifier`, `identity_type`

**`identity.key_mismatch`** — At least one submitted fingerprint did not match the stored identity key, indicating a possible key change
  Payload: `service_identifier`, `identity_key`, `identity_type`

**`identity.lookup_failed`** — The requested service identifier was not found in the account store during a batch identity check
  Payload: `service_identifier`

**`identity.certificate_issued`** — A short-lived sender certificate was issued to an authenticated device
  Payload: `service_identifier`, `device_id`, `expires_at`

**`identity.prekey_validation_failed`** — A signed pre-key upload was rejected because its signature was invalid
  Payload: `service_identifier`, `device_id`

## Connects to

- **e2e-key-exchange** *(required)* — Identity keys established during key exchange are the source of truth that safety number verification checks
- **phone-number-registration** *(required)* — Identity keys are created and stored at registration; the registered account must exist for verification to operate
- **sealed-sender-delivery** *(recommended)* — Sender certificates produced by this feature are embedded in sealed-sender messages so recipients can verify sender identity
- **multi-device-linking** *(recommended)* — Each linked device registers its own pre-keys but shares the account identity key; key verification spans all devices on the account

## Quality fitness 🟢 86/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `█████████░` | 9/10 |
| Outcomes | `███████████████████████░░` | 23/25 |
| Structured conditions | `████░░░░░░` | 4/10 |
| Error binding | `██████████` | 10/10 |
| Field validation | `██████░░░░` | 6/10 |
| Relationships | `██████████` | 10/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `████░` | 4/5 |
| Simplicity | `█████` | 5/5 |

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/auth/safety-number-verification/) · **Spec source:** [`safety-number-verification.blueprint.yaml`](./safety-number-verification.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
