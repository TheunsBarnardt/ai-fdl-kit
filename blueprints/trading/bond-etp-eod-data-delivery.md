<!-- AUTO-GENERATED FROM bond-etp-eod-data-delivery.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Bond Etp Eod Data Delivery

> End-of-day bond electronic trading platform data delivery via FTP — fixed-width and CSV formats covering daily trade details

**Category:** Trading · **Version:** 1.0.0 · **Tags:** market-data · eod · bond-etp · bonds · ftp · dissemination · fixed-width · csv · non-live

## What this does

End-of-day bond electronic trading platform data delivery via FTP — fixed-width and CSV formats covering daily trade details

Specifies 3 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **record_type** *(text, required)*
- **record_sub_type** *(text, required)*
- **run_date** *(date, required)*
- **filler_header** *(text, optional)*
- **trade_date** *(date, required)*
- **trade_time** *(text, required)*
- **instrument** *(text, required)*
- **yield** *(number, required)*
- **nominal** *(number, required)*
- **consideration** *(number, required)*
- **trade_type** *(text, required)*
- **settlement** *(date, required)*

## What must be true

- **data_format → format:** fixed_width_flat_file and CSV
- **data_format → encoding:** ASCII
- **data_format → field_types → A:** Alpha only
- **data_format → field_types → N:** Numeric only (integer shown as N(I))
- **data_format → field_types → AN:** Alphanumeric
- **data_format → field_types → D:** 8-byte date CCYYMMDD
- **data_format → field_types → B:** Boolean — T for True, F for False
- **data_format → padding → alpha:** space (ASCII 32) right-padded
- **data_format → padding → numeric:** decimal point consumes 1 byte, fixed position
- **delivery → channel:** FTP
- **delivery → frequency:** daily
- **subscription → requires_written_request:** true
- **subscription → requires_data_agreement:** true
- **instrument_identification → unique_instrument_number:** true
- **csv_format → delimiter:** ,
- **csv_format → columns:** 8
- **csv_format → header_rows:** 4

## Success & failure scenarios

**✅ Success paths**

- **Successful Fixed Width Delivery** — when subscriber is licensed and provisioned with IDP credentials; trading day has completed on bond electronic trading platform, then subscriber receives fixed-width bond ETP trade detail data.
- **Successful Csv Delivery** — when subscriber is licensed and provisioned with IDP credentials; trading day has completed on bond electronic trading platform, then subscriber receives CSV bond ETP trade detail data.
- **Subscriber Provisioned** — when prospective subscriber has contacted Market Data team in writing; data agreement (JDA) obligations are met, then subscriber has working FTP access to bond ETP data files.

## Errors it can return

- `DELIVERY_FAILED` — End-of-day bond ETP data file delivery failed
- `INVALID_CREDENTIALS` — IDP authentication failed — contact Customer Services
- `DATASET_NOT_PROVISIONED` — Requested dataset has not been provisioned for this subscriber

## Connects to

- **equities-eod-data-delivery** *(optional)* — Equities EOD data uses same FTP delivery infrastructure
- **bonds-eod-data-delivery** *(recommended)* — Full bonds market data provides broader bond market coverage

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/trading/bond-etp-eod-data-delivery/) · **Spec source:** [`bond-etp-eod-data-delivery.blueprint.yaml`](./bond-etp-eod-data-delivery.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
