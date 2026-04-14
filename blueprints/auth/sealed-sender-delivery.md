<!-- AUTO-GENERATED FROM sealed-sender-delivery.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Sealed Sender Delivery

> Metadata-hidden message delivery that conceals the sender's identity from the server using unidentified access keys or group send endorsement tokens

**Category:** Auth · **Version:** 1.0.0 · **Tags:** messaging · privacy · end-to-end-encryption · anonymous-delivery · group-messaging

## What this does

Metadata-hidden message delivery that conceals the sender's identity from the server using unidentified access keys or group send endorsement tokens

Specifies 8 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **unidentified_access_key** *(token, optional)* — Unidentified Access Key
- **group_send_token** *(token, optional)* — Group Send Token
- **destination_identifier** *(text, required)* — Destination Identifier
- **message_payloads** *(json, required)* — Message Payloads
- **unrestricted_unidentified_access** *(boolean, optional)* — Unrestricted Unidentified Access
- **timestamp** *(number, required)* — Timestamp
- **online** *(boolean, optional)* — Online Only
- **urgent** *(boolean, optional)* — Urgent

## What must be true

- **authentication:** Exactly one authentication mechanism must be provided per request — either an unidentified access key or a group send endorsement token, never both, An unidentified access key must match the 16-byte key stored on the recipient account using a constant-time comparison to prevent timing attacks, Combined unidentified access keys for multi-recipient delivery are derived by XOR-ing each recipient's individual key; recipients with unrestricted access are excluded from the XOR, Group send endorsement tokens must be cryptographically verified against the set of recipient service identifiers and a server-held expiry key before delivery proceeds, An expired or invalid group send endorsement token must be rejected with a 401 response
- **delivery:** Story messages bypass access key authentication; group send endorsement tokens must not accompany story sends, When the recipient account does not exist the server must return 404 for single-recipient sends, Multi-recipient sends with a group send endorsement token may tolerate unknown recipients, returning their identifiers in the response; single-access-key multi-recipient sends must fail if any recipient cannot be resolved, The sender's identity is never recorded, logged, or stored by the server in sealed-sender delivery paths, Rate limiting is applied to the recipient account identifier to prevent abuse without identifying the sender

## Success & failure scenarios

**✅ Success paths**

- **Delivered Single Recipient** — when exactly one authentication mechanism is present and passes verification; destination account exists, then Encrypted payloads are enqueued for all registered recipient devices; HTTP 200 is returned with a sync flag.
- **Delivered Multi Recipient** — when exactly one authentication mechanism is present and passes verification; message targets multiple recipients via group send, then Encrypted payloads are fanned out to all resolved recipient devices; unresolved recipient identifiers are returned in the HTTP 200 response body.

**❌ Failure paths**

- **Missing Auth** — when unidentified_access_key not_exists; group_send_token not_exists, then Request is rejected with HTTP 401 Unauthorized. *(error: `SEALED_SENDER_MISSING_AUTH`)*
- **Conflicting Auth** — when unidentified_access_key exists; group_send_token exists, then Request is rejected with HTTP 400 Bad Request; both tokens must not be provided simultaneously. *(error: `SEALED_SENDER_CONFLICTING_AUTH`)*
- **Invalid Group Send Token** — when group_send_token exists; group send token signature verification fails or token is expired, then Request is rejected with HTTP 401; sender is not enrolled in the group or the token has expired. *(error: `SEALED_SENDER_INVALID_GROUP_TOKEN`)*
- **Access Key Mismatch** — when unidentified_access_key exists; recipient account has a stored access key and the presented key does not match, then Request is rejected with HTTP 401; the caller cannot prove permission to send to this recipient. *(error: `SEALED_SENDER_ACCESS_DENIED`)*
- **Recipient Not Found** — when destination account does not exist in the system; request is a single-recipient send, then Request is rejected with HTTP 404; recipient unknown. *(error: `SEALED_SENDER_RECIPIENT_NOT_FOUND`)*
- **Rate Limited** — when per-recipient delivery rate limit is exceeded, then Request is rejected with HTTP 429 and a Retry-After header. *(error: `SEALED_SENDER_RATE_LIMITED`)*

## Errors it can return

- `SEALED_SENDER_MISSING_AUTH` — Authentication required to deliver this message
- `SEALED_SENDER_CONFLICTING_AUTH` — Provide either an access key or a group token, not both
- `SEALED_SENDER_INVALID_GROUP_TOKEN` — Group send authorisation token is invalid or has expired
- `SEALED_SENDER_ACCESS_DENIED` — Not authorised to deliver to this recipient
- `SEALED_SENDER_RECIPIENT_NOT_FOUND` — Recipient not found
- `SEALED_SENDER_RATE_LIMITED` — Too many messages sent to this recipient; please retry later

## Events

**`sealed_sender.delivered`** — A sealed-sender message was successfully enqueued for a single recipient
  Payload: `destination_identifier`, `timestamp`, `device_count`

**`sealed_sender.multi_delivered`** — A sealed-sender multi-recipient message was fanned out to group members
  Payload: `recipient_count`, `unresolved_recipients`, `timestamp`

**`sealed_sender.rejected`** — A sealed-sender delivery attempt was rejected due to failed authentication or a missing recipient
  Payload: `destination_identifier`, `reason`

**`sealed_sender.rate_limited`** — A sealed-sender delivery attempt was rate-limited
  Payload: `destination_identifier`

## Connects to

- **e2e-key-exchange** *(required)* — Pre-key bundles and identity keys established by the key exchange feature are used to encrypt messages that travel over the sealed-sender path
- **phone-number-registration** *(required)* — Accounts must be registered and have an unidentified access key configured before sealed-sender delivery can be used
- **device-management** *(recommended)* — Messages are fanned out to all registered devices on the recipient account; device management determines which devices are present
- **multi-device-linking** *(recommended)* — Linked devices each receive a copy of sealed-sender messages independently

## Quality fitness 🟢 88/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `████████░░` | 8/10 |
| Outcomes | `████████████████████████░` | 24/25 |
| Structured conditions | `██████░░░░` | 6/10 |
| Error binding | `██████████` | 10/10 |
| Field validation | `██████░░░░` | 6/10 |
| Relationships | `██████████` | 10/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `████░` | 4/5 |
| Simplicity | `█████` | 5/5 |

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/auth/sealed-sender-delivery/) · **Spec source:** [`sealed-sender-delivery.blueprint.yaml`](./sealed-sender-delivery.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
