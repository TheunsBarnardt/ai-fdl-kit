<!-- AUTO-GENERATED FROM derivatives-eod-data-delivery.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Derivatives Eod Data Delivery

> Abstract: shared FTP fixed-width flat file delivery specification for end-of-day exchange derivatives data. Extended by equity, currency, interest-rate, commodity, and bond-ETP blueprints.

**Category:** Trading · **Version:** 1.0.0 · **Tags:** market-data · eod · ftp · dissemination · fixed-width · non-live · derivatives

## What this does

Abstract: shared FTP fixed-width flat file delivery specification for end-of-day exchange derivatives data. Extended by equity, currency, interest-rate, commodity, and bond-ETP blueprints.

Specifies 4 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **market_number** *(number, required)* — Exchange market number identifying the instrument class
- **contract_type** *(text, required)* — Contract type code (F=Future, Y=Option, etc.)
- **instrument_type** *(text, required)* — Instrument type identifier
- **record_type** *(text, required)* — Record type code determining the file layout
- **record_sub_type** *(text, required)* — Record sub-type for further layout discrimination
- **run_date** *(date, required)* — Business date the data represents (CCYYMMDD)
- **instrument** *(text, optional)* — Instrument identifier
- **file_name** *(text, optional)* — Delivered flat file name

## What must be true

- **data_format → format:** fixed_width_flat_file
- **data_format → encoding:** ASCII
- **data_format → field_types → A:** Alpha only
- **data_format → field_types → N:** Numeric only (integer shown as N(I))
- **data_format → field_types → AN:** Alphanumeric
- **data_format → field_types → DATE:** 8-byte date CCYYMMDD
- **data_format → field_types → B:** Boolean — T for True, F for False
- **delivery → channel:** FTP
- **delivery → primary_time:** 20:30
- **delivery → frequency:** daily
- **subscription → requires_written_request:** true
- **subscription → requires_license_agreement:** true
- **subscription → provisioning:** Customer Services provides IDP user ID, dataset name, and password
- **redelivery → policy:** Exchange Operations redelivers on request if files are corrupted or missing
- **redelivery → contact:** Subscriber contacts Customer Services to initiate redelivery
- **immutability → rule:** EOD files are immutable once published — corrections trigger a new file with a redelivery flag

## Success & failure scenarios

**✅ Success paths**

- **Successful Delivery** — when subscriber is licensed and provisioned with IDP credentials; trading day has completed and EOD batch has run, then Subscriber receives complete end-of-day derivatives data via FTP. _Why: All subscribed record types delivered to subscriber after trading day closes._
- **Subscriber Provisioned** — when prospective subscriber has contacted Market Data Department in writing; license agreement is signed, then Subscriber has working FTP access and can connect to retrieve files. _Why: New subscriber granted FTP access after completing license and setup._

**❌ Failure paths**

- **Delivery Failed** — when EOD batch error or FTP transfer error occurs, then Delivery failed — Exchange Operations initiates redelivery procedure. _Why: File generation or FTP transfer failed._ *(error: `DELIVERY_FAILED`)*
- **Invalid Credentials** — when IDP authentication fails for subscriber, then Subscriber cannot connect — contact Customer Services to reset credentials. _Why: Subscriber FTP credentials rejected._ *(error: `INVALID_CREDENTIALS`)*

## Errors it can return

- `DELIVERY_FAILED` — End-of-day data file delivery failed. Exchange Operations will redeliver.
- `INVALID_CREDENTIALS` — IDP authentication failed — contact Customer Services.
- `DATASET_NOT_PROVISIONED` — Requested dataset has not been provisioned for this subscriber.

## Events

**`data.eod.delivered`** — All subscribed record types for a given market delivered for the business day
  Payload: `run_date`, `market_number`, `record_types`, `file_name`

**`data.eod.delivery_failed`** — EOD file delivery failed — redelivery process initiated
  Payload: `run_date`, `market_number`, `reason`

**`data.subscriber.provisioned`** — New subscriber provisioned with FTP access to a dataset
  Payload: `subscriber_id`, `dataset_name`

## Connects to

- **equity-derivatives-eod-data-delivery** *(optional)* — Equity derivatives instrument family
- **currency-derivatives-eod-data-delivery** *(optional)* — Currency derivatives instrument family
- **interest-rates-derivatives-eod-data-delivery** *(optional)* — Interest rate derivatives instrument family
- **commodity-derivatives-eod-data-delivery** *(optional)* — Commodity derivatives instrument family
- **bond-etp-eod-data-delivery** *(optional)* — Bond ETP instrument family

## Quality fitness 🟢 79/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `█████████░` | 9/10 |
| Outcomes | `██████████████████████░░░` | 22/25 |
| Structured conditions | `███░░░░░░░` | 3/10 |
| Error binding | `███████░░░` | 7/10 |
| Field validation | `██████░░░░` | 6/10 |
| Relationships | `██████████` | 10/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `██░░░` | 2/5 |
| Simplicity | `█████` | 5/5 |

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/trading/derivatives-eod-data-delivery/) · **Spec source:** [`derivatives-eod-data-delivery.blueprint.yaml`](./derivatives-eod-data-delivery.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
