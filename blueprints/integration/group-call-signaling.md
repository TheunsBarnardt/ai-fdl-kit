<!-- AUTO-GENERATED FROM group-call-signaling.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Group Call Signaling

> Group call signaling via call links with zero-knowledge room creation credential issuance and per-account call-link authentication

**Category:** Integration · **Version:** 1.0.0 · **Tags:** calling · group-call · zero-knowledge · call-link · turn · webrtc · privacy

## What this does

Group call signaling via call links with zero-knowledge room creation credential issuance and per-account call-link authentication

Specifies 5 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **create_call_link_credential_request** *(token, required)* — Create Call Link Credential Request
- **call_link_credential** *(token, required)* — Call Link Credential
- **redemption_time** *(number, required)* — Redemption Time
- **call_link_auth_credential** *(token, required)* — Call Link Auth Credential
- **account_identifier** *(token, required)* — Account Identifier

## What must be true

- **access_control → authenticated_only:** true
- **access_control → note:** Only authenticated accounts may request call-link creation credentials
- **rate_limiting → scope:** per_account
- **rate_limiting → note:** Per-account rate limiting is enforced on the call-link credential endpoint
- **server_blind → note:** The server issues a ZK credential over the requesting account ACI and the day-truncated current timestamp combined with the client-supplied room ID commitment; the server learns only the account identity, never the room ID or call participants
- **credential_validity → granularity:** calendar_day_utc
- **credential_validity → note:** Credentials are valid for the current calendar day only; the timestamp is truncated to midnight UTC; clients must request a fresh credential each day
- **credential_validity → deterministic:** true
- **credential_validity → note2:** The credential is computed deterministically from the truncated day timestamp so multiple requests on the same day produce equivalent credentials
- **credential_batch → note:** Call-link authentication credentials are issued in the same batch as group authentication credentials but may also be used independently for call-link room access
- **room_service_responsibility → note:** The room service (separate from the messaging server) is responsible for enforcing call-link membership, capacity limits, and expiry; the messaging server only issues credentials

## Success & failure scenarios

**✅ Success paths**

- **Credential Issued** — when Caller is authenticated and within rate limit; create_call_link_credential_request exists; Credential request blob is a valid ZK request, then ZK call-link creation credential and the truncated-day redemption timestamp returned to the client.
- **Call Link Auth Batch Issued** — when Caller is authenticated; Valid day-aligned redemption range provided within the allowed 7-day window, then Array of daily call-link auth credentials returned, one per day in the requested range.

**❌ Failure paths**

- **Rate Limited** — when Caller is authenticated; Call-link creation rate limit is exceeded for this account, then Request rejected with rate-limit error. *(error: `CALL_LINK_RATE_LIMITED`)*
- **Unauthenticated** — when Caller is not authenticated, then Request rejected as unauthorized. *(error: `CALL_LINK_UNAUTHORIZED`)*
- **Invalid Credential Request** — when Caller is authenticated and within rate limit; create_call_link_credential_request exists; Credential request blob is malformed or cannot be parsed as a valid ZK request, then Request rejected with bad-request error. *(error: `CALL_LINK_INVALID_REQUEST`)*

## Errors it can return

- `CALL_LINK_RATE_LIMITED` — Too many call-link credential requests. Please wait before trying again.
- `CALL_LINK_UNAUTHORIZED` — Authentication required to create call links.
- `CALL_LINK_INVALID_REQUEST` — Invalid call-link credential request.

## Events

**`call_link.credential_issued`** — A ZK call-link creation credential was issued for the requesting account
  Payload: `account_id`, `redemption_time`

**`call_link.auth_batch_issued`** — A batch of daily call-link authentication credentials was issued alongside group auth credentials
  Payload: `account_id`, `redemption_start`, `redemption_end`

**`call_link.rate_limited`** — A call-link credential request was rejected due to per-account rate limiting
  Payload: `account_id`

## Connects to

- **encrypted-group-metadata** *(required)* — Call-link authentication credentials are co-issued with group authentication credentials and share the same ZK server secret parameters
- **voip-call-signaling** *(recommended)* — Group calls use the same TURN relay infrastructure as 1:1 calls; TURN credentials may be fetched before joining a call-link room
- **login** *(required)* — Call-link credential issuance requires a valid authenticated device session
- **device-management** *(required)* — The requesting account must have a valid registered device

## Quality fitness 🟢 85/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `████████░░` | 8/10 |
| Outcomes | `██████████████████████░░░` | 22/25 |
| Structured conditions | `████░░░░░░` | 4/10 |
| Error binding | `██████████` | 10/10 |
| Field validation | `███████░░░` | 7/10 |
| Relationships | `██████████` | 10/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `████░` | 4/5 |
| Simplicity | `█████` | 5/5 |

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/integration/group-call-signaling/) · **Spec source:** [`group-call-signaling.blueprint.yaml`](./group-call-signaling.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
