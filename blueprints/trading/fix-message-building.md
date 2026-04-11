<!-- AUTO-GENERATED FROM fix-message-building.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Fix Message Building

> Constructs, parses, and serializes FIX protocol messages with header, body, and trailer sections; supports repeating field groups and multi-version validation

**Category:** Trading · **Version:** 1.0.0 · **Tags:** fix-protocol · message-parsing · financial-messaging · field-map · repeating-groups

## What this does

Constructs, parses, and serializes FIX protocol messages with header, body, and trailer sections; supports repeating field groups and multi-version validation

Specifies 8 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **begin_string** *(text, required)* — Begin String
- **body_length** *(number, required)* — Body Length
- **msg_type** *(text, required)* — Msg Type
- **sender_comp_id** *(text, required)* — Sender Comp Id
- **target_comp_id** *(text, required)* — Target Comp Id
- **msg_seq_num** *(number, required)* — Msg Seq Num
- **sending_time** *(datetime, required)* — Sending Time
- **orig_sending_time** *(datetime, optional)* — Orig Sending Time
- **poss_dup_flag** *(boolean, optional)* — Poss Dup Flag
- **poss_resend** *(boolean, optional)* — Poss Resend
- **checksum** *(text, required)* — Checksum
- **appl_ver_id** *(text, optional)* — Appl Ver Id

## What must be true

- **message_structure:** Fields must appear in the correct section; body fields placed in header are rejected when ValidateFieldsOutOfOrder=Y, Groups (repeating sets of fields) are introduced by a count field and a delimiter field defined in the DataDictionary
- **message_structure → Every FIX message has three sections:** Header (BeginString, BodyLength, MsgType), Body (message-specific fields), and Trailer (Checksum)
- **framing:** Fields are separated by the SOH character (0x01), BeginString (tag 8) must be the first tag; BodyLength (tag 9) must be the second; CheckSum (tag 10) must be the last, BodyLength must exactly equal the byte count between tag 9 and tag 10, CheckSum must equal the modulo-256 sum of all bytes before it
- **serialization:** Serialization automatically recalculates BodyLength and CheckSum; manual assignment is ignored, Fields within each section are written in the order defined by the DataDictionary (or insertion order if dictionary absent), PreserveMessageFieldsOrder setting keeps original order for pass-through scenarios
- **groups:** Repeating groups begin with a count field (e.g. NoAllocs tag 78), The first field of each group instance is the delimiter; fields are assigned to the correct instance based on it, Groups may be nested; the outer group count field determines how many inner group iterations exist
- **message_identification:** Admin messages (Logon, Logout, Heartbeat, etc.) are handled by the session layer before application delivery, Application messages (NewOrderSingle, ExecutionReport, etc.) are delivered to the application via fromApp()

## Success & failure scenarios

**✅ Success paths**

- **Admin Message Received** — when parsed message has an admin MsgType (0,1,2,3,4,5,A), then Message routed to session layer for protocol processing via fromAdmin() callback.
- **App Message Built** — when application creates a new message with a valid MsgType; all required fields are set, then Message is serialized, persisted, and sent over the session connection.
- **App Message Parsed** — when raw FIX string received from wire; framing, checksum, and field structure are valid, then Structured Message object delivered to application via fromApp() callback.

**❌ Failure paths**

- **Invalid Framing** — when raw string received from socket; BeginString, BodyLength, or CheckSum is missing or invalid, then Message discarded; session-level Reject may be sent. *(error: `MESSAGE_PARSE_ERROR`)*
- **Checksum Mismatch** — when message parsed from wire; ValidateLengthAndChecksum is enabled; computed checksum does not match tag 10 value, then Message rejected; session Reject sent with reason. *(error: `INVALID_CHECKSUM`)*
- **Field Out Of Order** — when message parsed; ValidateFieldsOutOfOrder is enabled; a body field appears in the header, or header field in body, then Message rejected with TagOutOfOrder error. *(error: `FIELD_OUT_OF_ORDER`)*
- **Group Count Mismatch** — when message contains a repeating group; actual number of group instances does not match count field value, then Message rejected with RepeatingGroupCountMismatch error. *(error: `GROUP_COUNT_MISMATCH`)*
- **Field Not Found** — when application requests a field from a message; field tag is not present in the message, then FieldNotFound exception thrown to the application. *(error: `FIELD_NOT_FOUND`)*

## Errors it can return

- `MESSAGE_PARSE_ERROR` — Could not parse message
- `INVALID_CHECKSUM` — Checksum validation failed
- `INVALID_BODY_LENGTH` — Body length validation failed
- `FIELD_OUT_OF_ORDER` — Tag specified out of required order
- `GROUP_COUNT_MISMATCH` — Repeating group count mismatch
- `FIELD_NOT_FOUND` — Field not found in message
- `FIELD_CONVERT_ERROR` — Could not convert field value
- `DUPLICATE_FIELD` — Duplicate field number
- `INVALID_MESSAGE_TYPE` — Invalid message type

## Connects to

- **fix-session-management** *(required)* — Session layer controls when messages are sent/received and maintains sequence numbers
- **fix-protocol-validation** *(recommended)* — DataDictionary validates field types, required fields, and value ranges on parsed messages
- **fix-message-persistence** *(required)* — Outgoing messages are persisted before transmission for recovery purposes

## Quality fitness 🟢 81/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `██████████` | 10/10 |
| Outcomes | `████████████████████████░` | 24/25 |
| Structured conditions | `███░░░░░░░` | 3/10 |
| Error binding | `██████░░░░` | 6/10 |
| Field validation | `██████░░░░` | 6/10 |
| Relationships | `█████████░` | 9/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `████░` | 4/5 |
| Simplicity | `████░` | 4/5 |

**Recent auto-improvements** *(via autoresearch-style keep-or-reset loop — applied only because they raised the fitness score)*

- `T3` **auto-field-labels** — added labels to 12 fields

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/trading/fix-message-building/) · **Spec source:** [`fix-message-building.blueprint.yaml`](./fix-message-building.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
