<!-- AUTO-GENERATED FROM terminal-offline-queue.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Terminal Offline Queue

> Offline transaction queuing for payment terminals — risk-limited queuing with automatic flush on reconnect

**Category:** Payment · **Version:** 1.0.0 · **Tags:** offline · queue · resilience · terminal · risk-management

## What this does

Offline transaction queuing for payment terminals — risk-limited queuing with automatic flush on reconnect

Specifies 8 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **queue_id** *(token, required)* — Queue Entry ID
- **terminal_id** *(text, required)* — Terminal ID
- **transaction_id** *(token, required)* — Transaction ID
- **payment_method** *(select, required)* — Payment Method
- **amount** *(number, required)* — Transaction Amount
- **currency** *(text, required)* — Currency
- **queued_at** *(datetime, required)* — Queued At
- **processed_at** *(datetime, optional)* — Processed At
- **queue_status** *(select, required)* — Queue Status
- **retry_count** *(number, optional)* — Retry Count
- **max_retries** *(number, required)* — Max Retries
- **failure_reason** *(text, optional)* — Failure Reason
- **offline_max_amount** *(number, required)* — Max Offline Transaction Amount
- **offline_max_queue_depth** *(number, required)* — Max Queue Depth
- **offline_max_total_value** *(number, required)* — Max Total Queued Value
- **queue_expiry_hours** *(number, required)* — Queue Expiry (hours)
- **current_queue_depth** *(number, optional)* — Current Queue Depth
- **current_queue_total** *(number, optional)* — Current Queue Total Value
- **encrypted_card_data** *(json, optional)* — Encrypted Card Data
- **palm_pay_ref** *(text, optional)* — Palm Pay Reference

## What must be true

- **risk_limits → per_transaction_cap:** Individual offline transactions capped at configured limit (default R500)
- **risk_limits → queue_depth_cap:** Maximum number of queued transactions (default 10)
- **risk_limits → total_value_cap:** Total value of all queued transactions capped (default R2,000)
- **queuing → offline_detection:** Terminal detects offline state via connectivity monitor
- **queuing → merchant_notification:** Merchant sees clear 'OFFLINE MODE' indicator on screen
- **queuing → customer_notification:** Customer informed that payment will be processed when connectivity restores
- **queuing → provisional_receipt:** Provisional receipt issued with 'pending' status
- **processing → fifo_order:** Queued transactions processed in first-in-first-out order
- **processing → auto_flush:** Queue automatically flushed when connectivity restores
- **processing → retry_with_backoff:** Failed transactions retried with exponential backoff (max 3 retries)
- **expiry → time_limit:** Queued transactions expire after configured duration (default 24 hours)
- **expiry → expired_notification:** Merchant notified of expired transactions for manual resolution
- **security → card_encryption:** Card data encrypted using terminal's hardware security module (HSM)
- **security → no_plaintext:** Card data never stored in plaintext on device
- **security → wipe_on_settle:** Card data wiped immediately after successful settlement
- **security → palm_ref_only:** For palm payments, only the resolved proxy reference is queued — no biometric data
- **card_vs_palm → card_offline:** Card offline transactions use encrypted card data stored in HSM
- **card_vs_palm → palm_offline:** Palm offline transactions use the resolved palm-pay proxy reference

## Success & failure scenarios

**✅ Success paths**

- **Transaction Queued** — when Terminal is offline; Amount within offline limit; Queue depth within limit; Total queued value within limit, then Transaction queued for processing when connectivity restores.
- **Queue Flushed** — when Connectivity restored; Queue has pending transactions, then All queued transactions submitted for processing.
- **Queued Transaction Settled** — when queue_status eq "processing"; Payment backend confirms settlement, then Queued transaction settled — final receipt sent.
- **Transaction Expired** — when queue_status eq "queued"; Transaction has been queued longer than queue_expiry_hours, then Queued transaction expired — merchant must resolve manually.

**❌ Failure paths**

- **Amount Exceeds Offline Limit** — when Terminal is offline; Amount exceeds offline cap, then Transaction blocked — amount exceeds offline limit. *(error: `OFFLINE_AMOUNT_EXCEEDED`)*
- **Queue Depth Exceeded** — when Terminal is offline; Queue is full, then Transaction blocked — offline queue is full. *(error: `OFFLINE_QUEUE_FULL`)*
- **Total Value Exceeded** — when Terminal is offline; Total queued value at limit, then Transaction blocked — total offline value limit reached. *(error: `OFFLINE_TOTAL_EXCEEDED`)*
- **Queued Transaction Failed** — when queue_status eq "processing"; Max retries exhausted, then Queued transaction failed after retries — merchant must resolve manually. *(error: `OFFLINE_PROCESSING_FAILED`)*

## Errors it can return

- `OFFLINE_AMOUNT_EXCEEDED` — Transaction amount exceeds the offline limit
- `OFFLINE_QUEUE_FULL` — Offline queue is full — cannot accept more transactions
- `OFFLINE_TOTAL_EXCEEDED` — Total offline transaction value limit reached
- `OFFLINE_PROCESSING_FAILED` — Failed to process queued transaction after retries
- `OFFLINE_TRANSACTION_EXPIRED` — Queued transaction has expired

## Connects to

- **terminal-payment-flow** *(required)* — Payment flow routes to offline queue when terminal is offline
- **payshap-rail** *(required)* — Queued palm payments processed via real-time rail on reconnect
- **payment-gateway** *(required)* — Queued card payments processed via payment gateway on reconnect
- **terminal-fleet** *(optional)* — Fleet management configures offline risk limits per terminal

## Quality fitness 🟢 88/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `██████████` | 10/10 |
| Outcomes | `██████████████████████░░░` | 22/25 |
| Structured conditions | `████████░░` | 8/10 |
| Error binding | `████████░░` | 8/10 |
| Field validation | `██████░░░░` | 6/10 |
| Relationships | `██████████` | 10/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `████░` | 4/5 |
| Simplicity | `█████` | 5/5 |

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/payment/terminal-offline-queue/) · **Spec source:** [`terminal-offline-queue.blueprint.yaml`](./terminal-offline-queue.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
