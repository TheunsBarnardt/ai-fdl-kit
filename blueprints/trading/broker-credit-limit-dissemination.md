<!-- AUTO-GENERATED FROM broker-credit-limit-dissemination.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Broker Credit Limit Dissemination

> Disseminate per-account credit limits to broker trading systems for pre-trade risk checks, utilisation tracking and order blocking on breach.

**Category:** Trading · **Version:** 1.0.0 · **Tags:** credit-limit · pre-trade-risk · dissemination · risk-management · broker-feed

## What this does

Disseminate per-account credit limits to broker trading systems for pre-trade risk checks, utilisation tracking and order blocking on breach.

Specifies 5 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **broker_code** *(text, required)* — Broker code
- **account_code** *(text, required)* — Account code
- **valuation_date** *(date, required)* — Valuation date
- **credit_limit_amount_code** *(select, required)* — Credit limit type
- **credit_limit_amount** *(number, required)* — Credit limit amount
- **currency** *(text, optional)* — Limit currency
- **limit_scope** *(select, optional)* — Limit scope
- **utilised_amount** *(number, optional)* — Current utilised amount
- **run_date** *(date, required)* — Dissemination run date

## What must be true

- **general → rule_1:** A credit limit record must exist for every counter-party account before orders may be routed.
- **general → rule_2:** Three limit types are supported: PF (portfolio-derived, one-day validity), ST (static), UP (broker-uploaded, one-day validity).
- **general → rule_3:** PF and UP limits automatically expire after one trading day unless refreshed.
- **general → rule_4:** Broker trading systems must perform a pre-trade check against the latest disseminated limit and reject orders that would breach it.
- **general → rule_5:** End-of-day file is delivered via secure file transfer; real-time updates use push messages for intra-day changes.
- **general → rule_6:** Members must register in writing by Thursday 09:00 to begin receiving the feed from the following Monday.
- **general → rule_7:** No historical limit data is disseminated — only the current active limit per account.
- **general → rule_8:** Every record carries broker code, record type BC, sub-type 01 and continuation sequence 01.
- **general → rule_9:** Breaches must emit an alert to the broker risk desk and be logged for audit.

## Success & failure scenarios

**✅ Success paths**

- **Push Limit Update** — when limit_changed eq true, then call service; set last_pushed_at = "now"; emit credit_limit.updated. _Why: Push an intra-day limit update to the broker trading system when a limit changes._
- **Disseminate Limits Eod** — when eod_cycle eq "complete"; subscription_active eq true, then create_record; call service; emit credit_limit.eod_disseminated. _Why: Produce the end-of-day credit limit file for every subscribing broker._

**❌ Failure paths**

- **Block Order On Breach** — when projected_utilisation gt "credit_limit_amount", then move order_status received → rejected; emit order.blocked_credit_limit; notify via in_app. _Why: Reject an inbound order that would cause utilisation to exceed the account credit limit._ *(error: `ORDER_BLOCKED_CREDIT_LIMIT`)*
- **Breach Alert** — when utilised_amount gte "credit_limit_amount", then notify via in_app; notify via email; emit credit_limit.breached. _Why: Raise an alert when utilisation approaches or exceeds the limit._ *(error: `CREDIT_LIMIT_BREACHED`)*
- **Missing Limit Record** — when credit_limit_amount not_exists, then move order_status received → rejected; emit order.blocked_no_limit. _Why: Block trading on an account that has no active credit limit on file._ *(error: `NO_CREDIT_LIMIT_ON_FILE`)*

## Errors it can return

- `CREDIT_LIMIT_BREACHED` — Account credit limit has been breached.
- `ORDER_BLOCKED_CREDIT_LIMIT` — Order rejected — would exceed account credit limit.
- `NO_CREDIT_LIMIT_ON_FILE` — No active credit limit on file for this account.
- `INVALID_LIMIT_TYPE` — Credit limit type must be PF, ST or UP.
- `SUBSCRIPTION_NOT_ACTIVE` — Broker is not subscribed to the credit limit feed.
- `FEED_DELIVERY_FAILED` — Credit limit feed delivery failed — retry scheduled.

## Events

**`credit_limit.eod_disseminated`**
  Payload: `broker_code`, `run_date`, `record_count`

**`credit_limit.updated`**
  Payload: `broker_code`, `account_code`, `credit_limit_amount`, `credit_limit_amount_code`, `valuation_date`

**`credit_limit.breached`**
  Payload: `broker_code`, `account_code`, `utilised_amount`, `credit_limit_amount`

**`order.blocked_credit_limit`**
  Payload: `broker_code`, `account_code`, `order_id`, `credit_limit_amount`

**`order.blocked_no_limit`**
  Payload: `broker_code`, `account_code`, `order_id`

## Connects to

- **broker-client-account-maintenance** *(required)*
- **popia-compliance** *(required)*

## Quality fitness 🟢 76/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `███████░░░` | 7/10 |
| Outcomes | `█████████████████████░░░░` | 21/25 |
| Structured conditions | `██████████` | 10/10 |
| Error binding | `██████░░░░` | 6/10 |
| Field validation | `███████░░░` | 7/10 |
| Relationships | `██████░░░░` | 6/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `░░░░░` | 0/5 |
| Simplicity | `████░` | 4/5 |

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/trading/broker-credit-limit-dissemination/) · **Spec source:** [`broker-credit-limit-dissemination.blueprint.yaml`](./broker-credit-limit-dissemination.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
