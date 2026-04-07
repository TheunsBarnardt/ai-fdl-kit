---
title: "Fix Message Building Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Constructs, parses, and serializes FIX protocol messages with header, body, and trailer sections; supports repeating field groups and multi-version validation. "
---

# Fix Message Building Blueprint

> Constructs, parses, and serializes FIX protocol messages with header, body, and trailer sections; supports repeating field groups and multi-version validation

| | |
|---|---|
| **Feature** | `fix-message-building` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | fix-protocol, message-parsing, financial-messaging, field-map, repeating-groups |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/fix-message-building.blueprint.yaml) |
| **JSON API** | [fix-message-building.json]({{ site.baseurl }}/api/blueprints/trading/fix-message-building.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `session_layer` | Session Layer | system | Sends serialized message strings over the wire and receives raw byte streams |
| `application_layer` | Application Layer | system | Constructs outgoing messages and processes incoming parsed messages |
| `data_dictionary` | Data Dictionary | system | Validates field presence, types, and allowed values per FIX version |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `begin_string` | text | Yes |  |  |
| `body_length` | number | Yes |  |  |
| `msg_type` | text | Yes |  |  |
| `sender_comp_id` | text | Yes |  |  |
| `target_comp_id` | text | Yes |  |  |
| `msg_seq_num` | number | Yes |  |  |
| `sending_time` | datetime | Yes |  |  |
| `orig_sending_time` | datetime | No |  |  |
| `poss_dup_flag` | boolean | No |  |  |
| `poss_resend` | boolean | No |  |  |
| `checksum` | text | Yes |  |  |
| `appl_ver_id` | text | No |  |  |

## Rules

- **message_structure:** {"Every FIX message has three sections":"Header (BeginString, BodyLength, MsgType), Body (message-specific fields), and Trailer (Checksum)"}, Fields must appear in the correct section; body fields placed in header are rejected when ValidateFieldsOutOfOrder=Y, Groups (repeating sets of fields) are introduced by a count field and a delimiter field defined in the DataDictionary
- **framing:** Fields are separated by the SOH character (0x01), BeginString (tag 8) must be the first tag; BodyLength (tag 9) must be the second; CheckSum (tag 10) must be the last, BodyLength must exactly equal the byte count between tag 9 and tag 10, CheckSum must equal the modulo-256 sum of all bytes before it
- **serialization:** Serialization automatically recalculates BodyLength and CheckSum; manual assignment is ignored, Fields within each section are written in the order defined by the DataDictionary (or insertion order if dictionary absent), PreserveMessageFieldsOrder setting keeps original order for pass-through scenarios
- **groups:** Repeating groups begin with a count field (e.g. NoAllocs tag 78), The first field of each group instance is the delimiter; fields are assigned to the correct instance based on it, Groups may be nested; the outer group count field determines how many inner group iterations exist
- **message_identification:** Admin messages (Logon, Logout, Heartbeat, etc.) are handled by the session layer before application delivery, Application messages (NewOrderSingle, ExecutionReport, etc.) are delivered to the application via fromApp()

## Outcomes

### Invalid_framing (Priority: 1) — Error: `MESSAGE_PARSE_ERROR`

**Given:**
- raw string received from socket
- BeginString, BodyLength, or CheckSum is missing or invalid

**Then:**
- **emit_event** event: `fix.message.parse_error`

**Result:** Message discarded; session-level Reject may be sent

### Checksum_mismatch (Priority: 2) — Error: `INVALID_CHECKSUM`

**Given:**
- message parsed from wire
- ValidateLengthAndChecksum is enabled
- computed checksum does not match tag 10 value

**Then:**
- **emit_event** event: `fix.message.rejected`

**Result:** Message rejected; session Reject sent with reason

### Field_out_of_order (Priority: 3) — Error: `FIELD_OUT_OF_ORDER`

**Given:**
- message parsed
- ValidateFieldsOutOfOrder is enabled
- a body field appears in the header, or header field in body

**Then:**
- **emit_event** event: `fix.message.rejected`

**Result:** Message rejected with TagOutOfOrder error

### Group_count_mismatch (Priority: 4) — Error: `GROUP_COUNT_MISMATCH`

**Given:**
- message contains a repeating group
- actual number of group instances does not match count field value

**Then:**
- **emit_event** event: `fix.message.rejected`

**Result:** Message rejected with RepeatingGroupCountMismatch error

### Field_not_found (Priority: 5) — Error: `FIELD_NOT_FOUND`

**Given:**
- application requests a field from a message
- field tag is not present in the message

**Result:** FieldNotFound exception thrown to the application

### Admin_message_received (Priority: 8)

**Given:**
- parsed message has an admin MsgType (0,1,2,3,4,5,A)

**Then:**
- **emit_event** event: `fix.message.admin_received`

**Result:** Message routed to session layer for protocol processing via fromAdmin() callback

### App_message_built (Priority: 9)

**Given:**
- application creates a new message with a valid MsgType
- all required fields are set

**Then:**
- **set_field** target: `msg_seq_num` value: `next_sender_seq_num`
- **set_field** target: `sending_time` value: `current_utc_time`
- **emit_event** event: `fix.message.sent`

**Result:** Message is serialized, persisted, and sent over the session connection

### App_message_parsed (Priority: 10)

**Given:**
- raw FIX string received from wire
- framing, checksum, and field structure are valid

**Then:**
- **emit_event** event: `fix.message.app_received`

**Result:** Structured Message object delivered to application via fromApp() callback

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `MESSAGE_PARSE_ERROR` | 400 | Could not parse message | No |
| `INVALID_CHECKSUM` | 400 | Checksum validation failed | No |
| `INVALID_BODY_LENGTH` | 400 | Body length validation failed | No |
| `FIELD_OUT_OF_ORDER` | 400 | Tag specified out of required order | No |
| `GROUP_COUNT_MISMATCH` | 400 | Repeating group count mismatch | No |
| `FIELD_NOT_FOUND` | 400 | Field not found in message | No |
| `FIELD_CONVERT_ERROR` | 400 | Could not convert field value | No |
| `DUPLICATE_FIELD` | 400 | Duplicate field number | No |
| `INVALID_MESSAGE_TYPE` | 400 | Invalid message type | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `fix.message.sent` | Application message successfully serialized and queued for transmission | `session_id`, `msg_type`, `msg_seq_num`, `sending_time` |
| `fix.message.admin_received` | Administrative message received and routed to session layer | `session_id`, `msg_type`, `msg_seq_num` |
| `fix.message.app_received` | Application message parsed and delivered to application layer | `session_id`, `msg_type`, `msg_seq_num` |
| `fix.message.rejected` | Message rejected due to structural or validation failure | `session_id`, `msg_seq_num`, `reject_reason`, `ref_tag_id` |
| `fix.message.parse_error` | Raw message could not be parsed at all | `raw_message`, `error_detail` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| fix-session-management | required | Session layer controls when messages are sent/received and maintains sequence numbers |
| fix-protocol-validation | recommended | DataDictionary validates field types, required fields, and value ranges on parsed messages |
| fix-message-persistence | required | Outgoing messages are persisted before transmission for recovery purposes |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
tech_stack:
  language: C++
  framework: FIX Protocol Engine
  protocol: FIX 4.0–5.0 SP2 / FIXT 1.1
field_types:
  - STRING (text)
  - CHAR (single character)
  - PRICE (decimal number)
  - INT (integer)
  - AMT (monetary amount)
  - QTY (quantity)
  - CURRENCY (3-letter currency code)
  - EXCHANGE (exchange identifier)
  - UTCTIMESTAMP (UTC datetime)
  - BOOLEAN (Y/N)
  - LOCALMKTDATE (local date)
  - DATA (raw binary data)
  - FLOAT (floating point)
  - LENGTH (positive integer)
  - SEQNUM (sequence number integer)
  - NUMINGROUP (repeating group count)
  - PERCENTAGE (percentage value)
  - COUNTRY (2-char country code)
  - MONTHYEAR (month/year value)
  - DAYOFMONTH (day value)
  - UTCDATE, UTCTIMEONLY (date/time components)
  - XMLDATA (XML content)
  - LANGUAGE (language code)
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Fix Message Building Blueprint",
  "description": "Constructs, parses, and serializes FIX protocol messages with header, body, and trailer sections; supports repeating field groups and multi-version validation. ",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "fix-protocol, message-parsing, financial-messaging, field-map, repeating-groups"
}
</script>
