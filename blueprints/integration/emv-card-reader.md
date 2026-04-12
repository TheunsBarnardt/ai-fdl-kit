<!-- AUTO-GENERATED FROM emv-card-reader.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Emv Card Reader

> EMV card reader hardware SDK integration — chip, NFC contactless, and magnetic stripe with PIN entry and EMV kernel processing

**Category:** Integration · **Version:** 1.0.0 · **Tags:** emv · card-reader · nfc · contactless · pci · hardware · sdk

## What this does

EMV card reader hardware SDK integration — chip, NFC contactless, and magnetic stripe with PIN entry and EMV kernel processing

Specifies 11 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **reader_status** *(select, required)* — Reader Status
- **card_entry_mode** *(select, optional)* — Card Entry Mode
- **card_brand** *(text, optional)* — Card Brand
- **card_last_four** *(text, optional)* — Last Four Digits
- **card_token** *(token, optional)* — Card Token
- **application_id** *(text, optional)* — EMV Application ID (AID)
- **application_label** *(text, optional)* — Application Label
- **encrypted_pin_block** *(text, optional)* — Encrypted PIN Block
- **authorization_code** *(text, optional)* — Authorisation Code
- **amount** *(number, required)* — Transaction Amount
- **currency_code** *(text, required)* — Currency Code
- **cvm_result** *(select, optional)* — Cardholder Verification Method
- **contactless_limit** *(number, optional)* — Contactless CVM Limit
- **emv_tags** *(json, optional)* — EMV Tag Data
- **track2_equivalent** *(text, optional)* — Track 2 Equivalent Data

## What must be true

- **emv_kernel → application_selection:** PPSE (contactless) or PSE (contact) for application selection — present list if multiple AIDs
- **emv_kernel → terminal_action_analysis:** EMV kernel performs Terminal Action Analysis to determine online/offline/decline
- **emv_kernel → issuer_script_processing:** Process issuer scripts received in authorisation response
- **chip_contact → atr_required:** Read ATR (Answer to Reset) on card insertion
- **chip_contact → application_selection:** Select application via PSE or AID list
- **chip_contact → offline_data_auth:** Perform SDA/DDA/CDA as supported by card
- **chip_contact → cvm_processing:** Process CVM list — online PIN preferred
- **nfc_contactless → ppse_selection:** Select PPSE (2PAY.SYS.DDF01) for contactless application discovery
- **nfc_contactless → ctls_kernel:** Use appropriate contactless kernel (Visa payWave, Mastercard CTLS, Amex CTLS)
- **nfc_contactless → cvm_limit:** If amount exceeds contactless CVM limit, require PIN or fall back to chip
- **nfc_contactless → tap_timeout:** NFC read must complete within 500ms
- **magnetic_stripe → track_data:** Read Track 1 and Track 2 data
- **magnetic_stripe → fallback_only:** Magnetic stripe is fallback — prefer chip or NFC when available
- **magnetic_stripe → chip_card_detection:** If stripe-read card has chip, prompt for chip insertion (fallback prevention)
- **pin_entry → encrypted:** PIN entered on PCI PTS certified keypad — never in plaintext
- **pin_entry → pin_block_format:** ISO 9564 PIN block format
- **pin_entry → dukpt:** PIN encrypted with DUKPT (Derived Unique Key Per Transaction)
- **pin_entry → max_attempts:** Maximum 3 PIN attempts before card is blocked
- **pin_entry → timeout:** PIN entry times out after 30 seconds
- **pci_compliance → no_pan_storage:** Raw PAN (Primary Account Number) never stored on terminal
- **pci_compliance → tokenisation:** PAN tokenised immediately after read — only token persisted
- **pci_compliance → no_track_storage:** Track data never stored — transmitted for online auth only
- **pci_compliance → key_management:** Encryption keys managed via DUKPT — unique key per transaction
- **pci_compliance → tamper_detection:** Hardware tamper triggers key erasure and terminal lockdown
- **pci_compliance → pts_certification:** Terminal must be PCI PTS certified for PIN entry
- **card_brand_detection → method:** Card brand determined from EMV Application Identifier (AID) prefix
- **card_brand_detection → visa:** AID prefix A000-0000-0310-10
- **card_brand_detection → mastercard:** AID prefix A000-0000-0410-10
- **card_brand_detection → amex:** AID prefix A000-0000-2501
- **card_brand_detection → discover:** AID prefix A000-0001-5230-10

## Success & failure scenarios

**✅ Success paths**

- **Reader Initialized** — when Terminal app initialises the card reader SDK, then Card reader SDK initialised and ready.
- **Card Detected Chip** — when reader_status eq "waiting_card"; Customer inserts chip card, then Chip card detected — reading ATR.
- **Card Detected Nfc** — when reader_status eq "waiting_card"; Customer taps card or device on NFC reader, then Contactless card detected — reading PPSE.
- **Card Detected Swipe** — when reader_status eq "waiting_card"; Customer swipes card through magnetic stripe reader, then Magnetic stripe card detected — reading track data.
- **Card Read Success** — when reader_status eq "card_detected"; Card data read successfully, then Card data read and tokenised — ready for CVM or online auth.
- **Pin Verified** — when reader_status eq "pin_entry"; Customer enters PIN on keypad, then PIN captured and encrypted — proceeding to online authorisation.
- **Online Auth Approved** — when reader_status eq "online_auth"; Issuer approves the transaction, then Card payment authorised by issuer.

**❌ Failure paths**

- **Online Auth Declined** — when reader_status eq "online_auth"; Issuer declines the transaction, then Card declined by issuer. *(error: `CARD_DECLINED`)*
- **Card Read Failed** — when reader_status in ["card_detected","reading"]; Card cannot be read — damaged, removed too early, or unsupported, then Card read failed — customer should try again or use different card. *(error: `CARD_READ_FAILED`)*
- **Pin Attempts Exceeded** — when reader_status eq "pin_entry"; Customer exceeds maximum PIN attempts (3), then Card blocked — too many incorrect PIN attempts. *(error: `CARD_PIN_BLOCKED`)*
- **Chip Fallback Required** — when card_entry_mode eq "magnetic_stripe"; Swiped card has an EMV chip, then Please insert chip card instead of swiping. *(error: `CARD_CHIP_FALLBACK`)*

## Errors it can return

- `CARD_DECLINED` — Card was declined by the issuer
- `CARD_READ_FAILED` — Could not read card — please try again
- `CARD_PIN_BLOCKED` — Card blocked — too many incorrect PIN attempts
- `CARD_CHIP_FALLBACK` — Please insert your chip card instead of swiping
- `CARD_READER_ERROR` — Card reader hardware error
- `CARD_UNSUPPORTED` — Card type not supported on this terminal
- `CARD_EXPIRED` — Card has expired
- `CARD_TIMEOUT` — Card read timed out — please present card again

## Connects to

- **terminal-payment-flow** *(required)* — Terminal payment flow uses card reader for card payment method
- **payment-gateway** *(required)* — Online authorisation routed through payment gateway
- **payment-methods** *(recommended)* — Card tokenisation and brand management
- **palm-vein** *(optional)* — Companion hardware SDK — palm scanner and card reader on same terminal

## Quality fitness 🟢 87/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `██████████` | 10/10 |
| Outcomes | `████████████████████████░` | 24/25 |
| Structured conditions | `████████░░` | 8/10 |
| Error binding | `██████░░░░` | 6/10 |
| Field validation | `██████░░░░` | 6/10 |
| Relationships | `██████████` | 10/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `████░` | 4/5 |
| Simplicity | `████░` | 4/5 |

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/integration/emv-card-reader/) · **Spec source:** [`emv-card-reader.blueprint.yaml`](./emv-card-reader.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
