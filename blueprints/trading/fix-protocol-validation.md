<!-- AUTO-GENERATED FROM fix-protocol-validation.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Fix Protocol Validation

> Validates FIX messages against version-specific DataDictionary specifications; enforces field presence, type correctness, value ranges, repeating group structure, and message completeness

**Category:** Trading · **Version:** 1.0.0 · **Tags:** fix-protocol · validation · data-dictionary · field-validation · financial-messaging

## What this does

Validates FIX messages against version-specific DataDictionary specifications; enforces field presence, type correctness, value ranges, repeating group structure, and message completeness

Specifies 9 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **validate_length_and_checksum** *(boolean, optional)* — Validate Length And Checksum
- **validate_fields_out_of_order** *(boolean, optional)* — Validate Fields Out Of Order
- **validate_fields_have_values** *(boolean, optional)* — Validate Fields Have Values
- **validate_user_defined_fields** *(boolean, optional)* — Validate User Defined Fields
- **allow_unknown_msg_fields** *(boolean, optional)* — Allow Unknown Msg Fields
- **data_dictionary_path** *(text, optional)* — Data Dictionary Path
- **transport_data_dictionary_path** *(text, optional)* — Transport Data Dictionary Path
- **app_data_dictionary_path** *(text, optional)* — App Data Dictionary Path
- **begin_string** *(text, required)* — Begin String

## What must be true

- **field_presence:** Every message type has a defined set of required fields; missing required fields cause RequiredTagMissing, Optional fields are allowed but must conform to their type constraints if present, Fields that do not belong to a message type are flagged as TagNotDefinedForMessage (unless AllowUnknownMsgFields=Y)
- **field_types:** Each field tag has a declared type (STRING, INT, PRICE, QTY, BOOLEAN, UTCTIMESTAMP, etc.), Field values are checked against their declared types; type mismatches produce IncorrectDataFormat, Enumerated fields (e.g. Side, OrdType) are validated against their allowed value set; unknown values produce IncorrectTagValue
- **group_validation:** Repeating groups must include a count field immediately before the first group instance, The first field of each group instance must be the declared delimiter field, Actual count of instances must match the declared count field; mismatch produces RepeatingGroupCountMismatch, Nested groups are recursively validated
- **message_type_validation:** MsgType (tag 35) must be a known type in the dictionary for this FIX version, Admin message types (0,1,2,3,4,5,A) are always known; application types must be in the spec, Unknown MsgType produces InvalidMessageType; UnsupportedMessageType if known but not implemented
- **version_specific_validation:** Each FIX version has its own DataDictionary; FIX.4.2 fields are not valid in FIX.4.0 messages, ApplVerID in message header selects the application-level dictionary for FIXT.1.1 validation
- **version_specific_validation → FIXT.1.1 uses two dictionaries:** transport (header/trailer) and application (body)

## Success & failure scenarios

**✅ Success paths**

- **Message Valid** — when message received; all fields present are of correct type; all required fields are present; no unknown fields (or AllowUnknownMsgFields=Y); all group counts match; checksum and length valid (or ValidateLengthAndChecksum=N), then Message passes validation and is delivered to the application.

**❌ Failure paths**

- **Dictionary Not Found** — when message received with BeginString or ApplVerID; no data dictionary is loaded for that version, then Session configuration error; DataDictionaryNotFound exception raised. *(error: `DICTIONARY_NOT_FOUND`)*
- **Invalid Message Type** — when message received; MsgType is not present in the loaded data dictionary, then Message rejected with InvalidMessageType; session Reject sent. *(error: `INVALID_MESSAGE_TYPE`)*
- **Required Tag Missing** — when message received; one or more required fields for this MsgType are absent, then Message rejected with RequiredTagMissing; session Reject sent. *(error: `REQUIRED_TAG_MISSING`)*
- **Tag Not Defined For Message** — when message received; a field tag is present that is not defined for this MsgType; AllowUnknownMsgFields is false, then Message rejected with TagNotDefinedForMessage. *(error: `TAG_NOT_DEFINED_FOR_MESSAGE`)*
- **Incorrect Data Format** — when message received; a field value cannot be parsed as its declared type (e.g. text in an INT field), then Message rejected with IncorrectDataFormat. *(error: `INCORRECT_DATA_FORMAT`)*
- **Incorrect Tag Value** — when message received; a field value is not in the allowed set for an enumerated field, then Message rejected with IncorrectTagValue. *(error: `INCORRECT_TAG_VALUE`)*
- **No Tag Value** — when message received; ValidateFieldsHaveValues is enabled; a field tag appears with an empty value, then Message rejected with NoTagValue. *(error: `NO_TAG_VALUE`)*
- **Group Count Mismatch** — when message contains a repeating group; number of group instances does not match count field value, then Message rejected with RepeatingGroupCountMismatch. *(error: `GROUP_COUNT_MISMATCH`)*

## Errors it can return

- `DICTIONARY_NOT_FOUND` — Could not find data dictionary for FIX version
- `INVALID_MESSAGE_TYPE` — MsgType is not a known message type
- `REQUIRED_TAG_MISSING` — Required field is absent from message
- `TAG_NOT_DEFINED_FOR_MESSAGE` — Field tag is not defined for this message type
- `INCORRECT_DATA_FORMAT` — Field value cannot be parsed as its declared type
- `INCORRECT_TAG_VALUE` — Field value is not in the allowed set
- `NO_TAG_VALUE` — Field tag present with empty value
- `GROUP_COUNT_MISMATCH` — Repeating group instance count does not match count field
- `INVALID_TAG_NUMBER` — Tag number does not exist in specification

## Connects to

- **fix-message-building** *(required)* — Message structures that are built and parsed are validated by this feature
- **fix-session-management** *(required)* — Session layer invokes validation on every incoming message before application delivery

## Quality fitness 🟢 83/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `██████████` | 10/10 |
| Outcomes | `████████████████████████░` | 24/25 |
| Structured conditions | `███░░░░░░░` | 3/10 |
| Error binding | `█████████░` | 9/10 |
| Field validation | `█████░░░░░` | 5/10 |
| Relationships | `████████░░` | 8/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `████░` | 4/5 |
| Simplicity | `█████` | 5/5 |

📈 **+4** since baseline (79 → 83)

**Recent auto-improvements** *(via autoresearch-style keep-or-reset loop — applied only because they raised the fitness score)*

- `T3` **auto-field-labels** — added labels to 9 fields

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/trading/fix-protocol-validation/) · **Spec source:** [`fix-protocol-validation.blueprint.yaml`](./fix-protocol-validation.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
