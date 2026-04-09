---
title: "Fix Protocol Validation Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Validates FIX messages against version-specific DataDictionary specifications; enforces field presence, type correctness, value ranges, repeating group structur"
---

# Fix Protocol Validation Blueprint

> Validates FIX messages against version-specific DataDictionary specifications; enforces field presence, type correctness, value ranges, repeating group structure, and message completeness

| | |
|---|---|
| **Feature** | `fix-protocol-validation` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | fix-protocol, validation, data-dictionary, field-validation, financial-messaging |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/fix-protocol-validation.blueprint.yaml) |
| **JSON API** | [fix-protocol-validation.json]({{ site.baseurl }}/api/blueprints/trading/fix-protocol-validation.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `data_dictionary` | Data Dictionary | system | Loaded from FIX XML specification file; defines all valid messages, fields, and their constraints per FIX version |
| `session_layer` | FIX Session Layer | system | Invokes validation before delivering messages to the application |
| `application_layer` | Application Layer | system | May perform additional application-level validation and reject messages via exceptions |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `validate_length_and_checksum` | boolean | No |  |  |
| `validate_fields_out_of_order` | boolean | No |  |  |
| `validate_fields_have_values` | boolean | No |  |  |
| `validate_user_defined_fields` | boolean | No |  |  |
| `allow_unknown_msg_fields` | boolean | No |  |  |
| `data_dictionary_path` | text | No |  |  |
| `transport_data_dictionary_path` | text | No |  |  |
| `app_data_dictionary_path` | text | No |  |  |
| `begin_string` | text | Yes |  |  |

## Rules

- **field_presence:** Every message type has a defined set of required fields; missing required fields cause RequiredTagMissing, Optional fields are allowed but must conform to their type constraints if present, Fields that do not belong to a message type are flagged as TagNotDefinedForMessage (unless AllowUnknownMsgFields=Y)
- **field_types:** Each field tag has a declared type (STRING, INT, PRICE, QTY, BOOLEAN, UTCTIMESTAMP, etc.), Field values are checked against their declared types; type mismatches produce IncorrectDataFormat, Enumerated fields (e.g. Side, OrdType) are validated against their allowed value set; unknown values produce IncorrectTagValue
- **group_validation:** Repeating groups must include a count field immediately before the first group instance, The first field of each group instance must be the declared delimiter field, Actual count of instances must match the declared count field; mismatch produces RepeatingGroupCountMismatch, Nested groups are recursively validated
- **message_type_validation:** MsgType (tag 35) must be a known type in the dictionary for this FIX version, Admin message types (0,1,2,3,4,5,A) are always known; application types must be in the spec, Unknown MsgType produces InvalidMessageType; UnsupportedMessageType if known but not implemented
- **version_specific_validation:** Each FIX version has its own DataDictionary; FIX.4.2 fields are not valid in FIX.4.0 messages, {"FIXT.1.1 uses two dictionaries":"transport (header/trailer) and application (body)"}, ApplVerID in message header selects the application-level dictionary for FIXT.1.1 validation

## Outcomes

### Dictionary_not_found (Priority: 1) — Error: `DICTIONARY_NOT_FOUND`

**Given:**
- message received with BeginString or ApplVerID
- no data dictionary is loaded for that version

**Then:**
- **emit_event** event: `fix.validation.error`

**Result:** Session configuration error; DataDictionaryNotFound exception raised

### Invalid_message_type (Priority: 2) — Error: `INVALID_MESSAGE_TYPE`

**Given:**
- message received
- MsgType is not present in the loaded data dictionary

**Then:**
- **emit_event** event: `fix.validation.rejected`

**Result:** Message rejected with InvalidMessageType; session Reject sent

### Required_tag_missing (Priority: 3) — Error: `REQUIRED_TAG_MISSING`

**Given:**
- message received
- one or more required fields for this MsgType are absent

**Then:**
- **emit_event** event: `fix.validation.rejected`

**Result:** Message rejected with RequiredTagMissing; session Reject sent

### Tag_not_defined_for_message (Priority: 4) — Error: `TAG_NOT_DEFINED_FOR_MESSAGE`

**Given:**
- message received
- a field tag is present that is not defined for this MsgType
- AllowUnknownMsgFields is false

**Then:**
- **emit_event** event: `fix.validation.rejected`

**Result:** Message rejected with TagNotDefinedForMessage

### Incorrect_data_format (Priority: 5) — Error: `INCORRECT_DATA_FORMAT`

**Given:**
- message received
- a field value cannot be parsed as its declared type (e.g. text in an INT field)

**Then:**
- **emit_event** event: `fix.validation.rejected`

**Result:** Message rejected with IncorrectDataFormat

### Incorrect_tag_value (Priority: 6) — Error: `INCORRECT_TAG_VALUE`

**Given:**
- message received
- a field value is not in the allowed set for an enumerated field

**Then:**
- **emit_event** event: `fix.validation.rejected`

**Result:** Message rejected with IncorrectTagValue

### No_tag_value (Priority: 7) — Error: `NO_TAG_VALUE`

**Given:**
- message received
- ValidateFieldsHaveValues is enabled
- a field tag appears with an empty value

**Then:**
- **emit_event** event: `fix.validation.rejected`

**Result:** Message rejected with NoTagValue

### Group_count_mismatch (Priority: 8) — Error: `GROUP_COUNT_MISMATCH`

**Given:**
- message contains a repeating group
- number of group instances does not match count field value

**Then:**
- **emit_event** event: `fix.validation.rejected`

**Result:** Message rejected with RepeatingGroupCountMismatch

### Message_valid (Priority: 10)

**Given:**
- message received
- all fields present are of correct type
- all required fields are present
- no unknown fields (or AllowUnknownMsgFields=Y)
- all group counts match
- checksum and length valid (or ValidateLengthAndChecksum=N)

**Then:**
- **emit_event** event: `fix.validation.passed`

**Result:** Message passes validation and is delivered to the application

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `DICTIONARY_NOT_FOUND` | 500 | Could not find data dictionary for FIX version | No |
| `INVALID_MESSAGE_TYPE` | 400 | MsgType is not a known message type | No |
| `REQUIRED_TAG_MISSING` | 400 | Required field is absent from message | No |
| `TAG_NOT_DEFINED_FOR_MESSAGE` | 400 | Field tag is not defined for this message type | No |
| `INCORRECT_DATA_FORMAT` | 400 | Field value cannot be parsed as its declared type | No |
| `INCORRECT_TAG_VALUE` | 400 | Field value is not in the allowed set | No |
| `NO_TAG_VALUE` | 400 | Field tag present with empty value | No |
| `GROUP_COUNT_MISMATCH` | 400 | Repeating group instance count does not match count field | No |
| `INVALID_TAG_NUMBER` | 400 | Tag number does not exist in specification | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `fix.validation.passed` | Message passed all validation checks | `session_id`, `msg_type`, `msg_seq_num` |
| `fix.validation.rejected` | Message failed validation; Reject will be sent to counterparty | `session_id`, `msg_seq_num`, `reject_reason`, `ref_tag_id`, `ref_msg_type` |
| `fix.validation.error` | Validation configuration error (missing dictionary, etc.) | `begin_string`, `appl_ver_id`, `error_detail` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| fix-message-building | required | Message structures that are built and parsed are validated by this feature |
| fix-session-management | required | Session layer invokes validation on every incoming message before application delivery |

## AGI Readiness

### Goals

#### Reliable Fix Protocol Validation

Validates FIX messages against version-specific DataDictionary specifications; enforces field presence, type correctness, value ranges, repeating group structure, and message completeness

**Success Metrics:**

| Metric | Target | Measurement |
|--------|--------|-------------|
| policy_violation_rate | 0% | Operations that violate defined policies |
| audit_completeness | 100% | All decisions have complete audit trails |

**Constraints:**

- **regulatory** (non-negotiable): All operations must be auditable and traceable

### Autonomy

**Level:** `supervised`

**Human Checkpoints:**

- before making irreversible changes

**Escalation Triggers:**

- `error_rate > 5`
- `consecutive_failures > 3`

### Verification

**Invariants:**

- error messages never expose internal system details

### Tradeoffs

| Prefer | Over | Reason |
|--------|------|--------|
| accuracy | latency | trading operations require precise execution and full audit trails |

### Coordination

**Protocol:** `orchestrated`

**Consumes:**

| Capability | From | Fallback |
|------------|------|----------|
| `fix_message_building` | fix-message-building | fail |
| `fix_session_management` | fix-session-management | fail |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| dictionary_not_found | `autonomous` | - | - |
| invalid_message_type | `autonomous` | - | - |
| required_tag_missing | `autonomous` | - | - |
| tag_not_defined_for_message | `autonomous` | - | - |
| incorrect_data_format | `autonomous` | - | - |
| incorrect_tag_value | `autonomous` | - | - |
| no_tag_value | `autonomous` | - | - |
| group_count_mismatch | `autonomous` | - | - |
| message_valid | `autonomous` | - | - |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
tech_stack:
  language: C++
  framework: FIX Protocol Engine
  protocol: FIX 4.0–5.0 SP2 / FIXT 1.1
supported_fix_versions:
  - FIX.4.0 (spec/FIX40.xml)
  - FIX.4.1 (spec/FIX41.xml)
  - FIX.4.2 (spec/FIX42.xml)
  - FIX.4.3 (spec/FIX43.xml)
  - FIX.4.4 (spec/FIX44.xml)
  - FIX.5.0 (spec/FIX50.xml)
  - FIX.5.0SP1 (spec/FIX50SP1.xml)
  - FIX.5.0SP2 (spec/FIX50SP2.xml)
  - FIXT.1.1 (spec/FIXT11.xml — transport layer)
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Fix Protocol Validation Blueprint",
  "description": "Validates FIX messages against version-specific DataDictionary specifications; enforces field presence, type correctness, value ranges, repeating group structur",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "fix-protocol, validation, data-dictionary, field-validation, financial-messaging"
}
</script>
