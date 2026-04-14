<!-- AUTO-GENERATED FROM encrypted-group-metadata.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Encrypted Group Metadata

> Server-blind encrypted group management where the server stores opaque ciphertext and issues zero-knowledge credentials for group membership and group-send authorization

**Category:** Integration · **Version:** 1.0.0 · **Tags:** encryption · zero-knowledge · groups · privacy · credentials · server-blind

## What this does

Server-blind encrypted group management where the server stores opaque ciphertext and issues zero-knowledge credentials for group membership and group-send authorization

Specifies 6 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **group_auth_credential** *(token, required)* — Group Auth Credential
- **call_link_auth_credential** *(token, required)* — Call Link Auth Credential
- **redemption_time** *(number, required)* — Redemption Time
- **redemption_start** *(number, required)* — Redemption Window Start
- **redemption_end** *(number, required)* — Redemption Window End
- **pni** *(token, optional)* — Phone Number Identity
- **group_send_token** *(token, optional)* — Group Send Token

## What must be true

- **server_blind → note:** The messaging server never stores group membership lists, group titles, group avatars, or any group metadata in plaintext; all such data is held by a separate group-management service as opaque client-encrypted blobs
- **credential_issuance → batch:** true
- **credential_issuance → max_window_days:** 7
- **credential_issuance → alignment:** day
- **credential_issuance → min_start:** yesterday
- **credential_issuance → max_end:** today_plus_8_days
- **credential_issuance → note:** Group authentication credentials are issued in daily batches for a client-specified window up to 7 days; clients cache credentials locally and present the day-matched credential at redemption
- **identity_linking → note:** Credentials incorporate both the ACI and PNI service identifiers so the group service can correlate identities for membership checks without the messaging server learning group structure
- **group_send → verification:** zk_server_secret_params
- **group_send → expiry:** embedded_in_token
- **group_send → member_check:** all_recipients_must_be_in_token
- **group_send → exclusive_with:** unidentified_access_key
- **group_send → note:** Group send tokens allow senders to prove group membership without the server learning the group identity or sender membership
- **access_control → authenticated_only:** true
- **access_control → note:** Only authenticated accounts may request credential batches; credentials are bound to the requesting account's ACI

## Success & failure scenarios

**✅ Success paths**

- **Credential Batch Issued** — when Caller is authenticated; redemption_start exists; redemption_end exists; redemption_start is day-aligned and not earlier than yesterday; redemption_end is day-aligned and not later than today plus 8 days; redemption_end is not earlier than redemption_start; redemption_end is within 7 days of redemption_start, then Array of daily group-auth credentials and call-link auth credentials returned, one entry per day in the range, along with the account PNI.
- **Group Send Authorized** — when group_send_token exists; Token cryptographic verification passes against current server ZK parameters; Token has not expired; All target service identifiers are listed in the token member set, then Request authorized for message delivery or profile retrieval to the listed recipients.

**❌ Failure paths**

- **Invalid Redemption Range** — when Caller is authenticated; redemption_start is before yesterday OR redemption_end is after today plus 8 days OR redemption_end is earlier than redemption_start OR range between redemption_start and redemption_end exceeds 7 days OR redemption_start or redemption_end is not day-aligned, then Request rejected with bad-request error. *(error: `GROUP_CRED_INVALID_RANGE`)*
- **Unauthenticated** — when Caller is not authenticated, then Request rejected as unauthorized. *(error: `GROUP_CRED_UNAUTHORIZED`)*
- **Group Send Token Invalid** — when group_send_token exists; Token cryptographic verification fails OR Token has expired OR A target service identifier is not listed in the token member set, then Request rejected as unauthorized. *(error: `GROUP_SEND_TOKEN_INVALID`)*
- **Duplicate Auth Headers** — when group_send_token exists; Unidentified-access key header is also present in the same request, then Request rejected because both a group send token and unidentified-access key were supplied. *(error: `GROUP_CRED_DUPLICATE_AUTH`)*

## Errors it can return

- `GROUP_CRED_UNAUTHORIZED` — Authentication required to request group credentials.
- `GROUP_CRED_INVALID_RANGE` — Invalid redemption time range. Range must be day-aligned, start at yesterday or later, and span at most 7 days.
- `GROUP_SEND_TOKEN_INVALID` — Group send token is invalid or has expired.
- `GROUP_CRED_DUPLICATE_AUTH` — Provide either a group send token or an unidentified-access key, not both.

## Events

**`group_credentials.issued`** — A batch of daily group authentication and call-link authentication credentials was issued for an account
  Payload: `account_id`, `redemption_start`, `redemption_end`, `credential_count`

**`group_send.authorized`** — A group send token was successfully verified, authorizing message delivery or profile access
  Payload: `target_identifiers`, `token_expiry`

**`group_send.rejected`** — A group send token failed cryptographic verification or has expired
  Payload: `reason`

## Connects to

- **encrypted-profile-storage** *(recommended)* — Group send tokens may authorize unversioned profile lookups for group members
- **login** *(required)* — Credential batch issuance requires account authentication
- **e2e-key-exchange** *(required)* — ZK credentials are derived from account identity keys managed by the key-exchange feature
- **group-call-signaling** *(recommended)* — Call-link auth credentials issued in this batch are consumed by the group-call-signaling feature
- **device-management** *(recommended)* — Credentials are bound to account identifiers; device sessions must be valid at issuance time

## Quality fitness 🟢 85/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `████████░░` | 8/10 |
| Outcomes | `██████████████████████░░░` | 22/25 |
| Structured conditions | `█████░░░░░` | 5/10 |
| Error binding | `██████████` | 10/10 |
| Field validation | `██████░░░░` | 6/10 |
| Relationships | `██████████` | 10/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `████░` | 4/5 |
| Simplicity | `█████` | 5/5 |

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/integration/encrypted-group-metadata/) · **Spec source:** [`encrypted-group-metadata.blueprint.yaml`](./encrypted-group-metadata.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
