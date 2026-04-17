<!-- AUTO-GENERATED FROM regulation-28-compliance.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Regulation 28 Compliance

> Prudential investment-limit compliance monitoring for SA retirement funds under Pension Funds Act Regulation 28.

**Category:** Trading · **Version:** 1.0.0 · **Tags:** compliance · regulatory · south-africa · pension-funds · investment-limits · fsca · popia · regulation-28

## What this does

Prudential investment-limit compliance monitoring for SA retirement funds under Pension Funds Act Regulation 28.

Combines technical outcomes (acceptance criteria) with documented business flows, so engineering and operations share one source of truth.

## Fields

- **fund_id** *(text, required)* — Retirement Fund ID
- **reporting_date** *(date, required)* — Valuation / Reporting Date
- **total_fund_value** *(number, required)* — Total Fair Value of Fund Assets (ZAR)
- **holdings** *(json, required)* — Holdings Snapshot
- **reporting_period** *(select, required)* — Reporting Period
- **breach_type** *(select, optional)* — Breach Type (if any)
- **remediation_plan_id** *(text, optional)* — Remediation Plan Reference
- **esg_assessment** *(rich_text, required)* — ESG / Sustainability Assessment

## What must be true

- **regulatory:** MUST: Apply asset-class fair-value caps measured after look-through into collective investment schemes, pooled vehicles, and linked-policy wrappers., MUST: Cap equity exposure at 75% of total fund value (listed + unlisted combined)., MUST: Cap immovable property exposure at 25% of total fund value., MUST: Cap foreign (offshore) asset exposure at 45% of total fund value, per National Treasury and FSCA direction., MUST: Cap African assets outside South Africa at 10% of total fund value, included within the 45% offshore limit., MUST: Cap hedge-fund exposure at 10% of total fund value., MUST: Cap private-equity exposure at 15% of total fund value., MUST: Cap commodities (including gold) at 10% of total fund value., MUST: Prohibit direct investment in crypto assets (0% cap) per FSCA guidance under Regulation 28., MUST: Enforce issuer concentration limits — max 5% per unlisted issuer, 10% per listed non-SOE issuer, 15% for SOE issuers, 25% for South African government debt per instrument category., MUST: Enforce bank-deposit limits — max 25% per top-four bank, 10% per other bank, per deposit-taking counterparty., MUST: Review the Investment Policy Statement at least annually and document how Reg 28 compliance is monitored., MUST: Document sustainability (ESG) considerations in every material investment decision per reg 28(2)(c)(ix)., MUST: Report breaches to the FSCA and the fund's board of trustees per FSCA-prescribed template and timeline., SHOULD: Distinguish active from passive breaches — remediation urgency differs., SHOULD: Apply the prudent person principle — investments must be liquid enough to meet benefit obligations., SHOULD: Monitor compliance continuously; do not rely on quarter-end snapshots alone., MAY: Apply stricter internal limits than Reg 28 minimums where trustees deem prudent.
- **security:** MUST: Restrict write access to holdings data to authorised fund administrators and principal officers only., MUST: Log every limit calculation, breach determination, and FSCA submission to an immutable audit trail., MUST: Treat member-level information as personal information under POPIA — regulatory returns are fund-level only, never per-member., MUST: Encrypt holdings and valuation data at rest and in transit (TLS 1.2+ minimum)., SHOULD: Require dual-control (maker-checker) for breach remediation approvals and FSCA submissions., SHOULD: Sign FSCA submissions with the fund's digital certificate.
- **data_integrity:** MUST: Reject holdings snapshots whose constituent fair values do not reconcile to total_fund_value within 0.01% tolerance., MUST: Apply look-through valuation to all pooled vehicles — no opaque CIS allocation may count toward limit calculation., MUST: Use fair value (IFRS 13) — reject cost-basis valuations for Reg 28 reporting., SHOULD: Version every holdings snapshot so historical compliance can be re-computed.

## Success & failure scenarios

**✅ Success paths**

- **Compliant Snapshot** — when fund holdings snapshot is complete; all asset-class exposures are within prescribed caps after look-through; all issuer concentration limits are within prescribed caps; holdings fair values reconcile to total_fund_value; ESG assessment is present and non-empty, then Fund is Reg 28 compliant for the reporting date; snapshot recorded to audit trail. _Why: Fund satisfies all Reg 28 caps for the reporting date; recorded for audit._
- **Remediation Plan Approved** — when a breach is in open state; remediation plan has been tabled to the board of trustees; board has approved the plan, then Remediation plan recorded; execution tracked until breach resolved. _Why: Board has approved a breach remediation plan; execution tracked to closure._
- **Quarterly Report Filed** — when reporting_period eq "quarterly"; compliance snapshot is in compliant or remediated state, then Form 28 filed with FSCA; submission reference captured for audit. _Why: Form 28 filed with FSCA for the quarter._

**❌ Failure paths**

- **Reconciliation Failure** — when reconciliation_variance_pct gt 0.01, then Snapshot rejected; correct holdings data before re-running compliance. _Why: Rejects snapshots whose fair values do not reconcile to total fund value._ *(error: `REG28_RECONCILIATION_FAILED`)*
- **Active Breach Detected** — when breach_type eq "active"; equity_pct gt 75 OR property_pct gt 25 OR foreign_pct gt 45 OR africa_ex_sa_pct gt 10 OR hedge_fund_pct gt 10 OR private_equity_pct gt 15 OR crypto_pct gt 0, then Active breach flagged; remediation plan required within FSCA-prescribed timeline. _Why: Fund-initiated breach of a prudential limit — highest remediation urgency._ *(error: `REG28_ACTIVE_BREACH`)*
- **Passive Breach Detected** — when breach_type eq "passive", then Passive breach logged; remediation plan must bring exposure within cap within a reasonable period. _Why: Market-driven breach — remediation allowed within reasonable period._ *(error: `REG28_PASSIVE_BREACH`)*
- **Issuer Concentration Breach** — when issuer_concentration_breach eq true, then Issuer/counterparty limit exceeded; concentration risk flagged for remediation. _Why: Single-issuer or counterparty limit exceeded._ *(error: `REG28_ISSUER_CONCENTRATION`)*
- **Look Through Unavailable** — when opaque_holdings_count gt 0, then Look-through data missing; compliance cannot be computed until resolved. _Why: Opaque pooled vehicles prevent accurate limit computation._ *(error: `REG28_LOOK_THROUGH_MISSING`)*

## Business flows

**Daily Compliance Check** — Daily look-through compliance computation for a fund.

1. **step**
1. **step**
1. **step**
1. **step**
1. **step**
1. **step**
1. **step**
1. **step**

**Quarterly Fsca Return** — Prepare and submit Form 28 to the FSCA.

1. **step**
1. **step**
1. **step**
1. **step**
1. **step**

**Breach Remediation** — Close out a Reg 28 breach.

1. **step**
1. **step**
1. **step**
1. **step**
1. **step**
1. **step**

## Errors it can return

- `REG28_ACTIVE_BREACH` — The fund has breached a Regulation 28 prudential limit. Remediation required.
- `REG28_PASSIVE_BREACH` — A Regulation 28 limit has been exceeded due to market movement. Remediation plan required.
- `REG28_ISSUER_CONCENTRATION` — Issuer or counterparty concentration limit exceeded.
- `REG28_RECONCILIATION_FAILED` — Holdings do not reconcile to total fund value; snapshot rejected.
- `REG28_LOOK_THROUGH_MISSING` — Look-through data missing for one or more pooled vehicles.
- `REG28_UNAUTHORISED` — Caller is not authorised to submit or view Reg 28 data for this fund.
- `REG28_SUBMISSION_FAILED` — FSCA submission service is unavailable; please retry.

## Events

**`reg28.snapshot_compliant`** — A valuation snapshot satisfies all limits.
  Payload: `fund_id`, `reporting_date`, `total_fund_value`

**`reg28.snapshot_rejected`** — A snapshot failed reconciliation or look-through.
  Payload: `fund_id`, `reporting_date`, `reason`

**`reg28.breach_active`** — A trustee/fund-initiated breach was detected.
  Payload: `fund_id`, `reporting_date`, `breached_limit`, `exposure_pct`, `cap_pct`

**`reg28.breach_passive`** — A market-driven breach was detected.
  Payload: `fund_id`, `reporting_date`, `breached_limit`, `exposure_pct`, `cap_pct`, `cause`

**`reg28.breach_concentration`** — An issuer/counterparty concentration limit was exceeded.
  Payload: `fund_id`, `reporting_date`, `issuer_id`, `exposure_pct`, `cap_pct`

**`reg28.lookthrough_missing`** — Look-through data missing for one or more pooled vehicles.
  Payload: `fund_id`, `reporting_date`, `opaque_holdings`

**`reg28.report_filed`** — Quarterly Form 28 was submitted to FSCA.
  Payload: `fund_id`, `reporting_date`, `submission_reference`

**`reg28.remediation_approved`** — Board approved a breach remediation plan.
  Payload: `fund_id`, `breach_id`, `remediation_plan_id`, `target_resolution_date`

## Connects to

- **popia-compliance** *(required)* — Member and beneficiary data processed by the fund is personal information under POPIA.
- **broker-portfolio-management** *(recommended)* — Portfolio valuation data feeds the Reg 28 compliance engine.
- **bond-pricing-models** *(recommended)* — Fair-value pricing for fixed-income instruments used in limit calculations.
- **data-retention-policies** *(recommended)* — Audit logs and compliance snapshots have statutory retention requirements.
- **document-management** *(optional)* — Storage of IPS, board minutes, remediation plans, and FSCA submission proofs.

## Quality fitness 🟢 87/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `█████████░` | 9/10 |
| Outcomes | `████████████████████████░` | 24/25 |
| Structured conditions | `████████░░` | 8/10 |
| Error binding | `████████░░` | 8/10 |
| Field validation | `███████░░░` | 7/10 |
| Relationships | `██████████` | 10/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `██░░░` | 2/5 |
| Simplicity | `████░` | 4/5 |

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/trading/regulation-28-compliance/) · **Spec source:** [`regulation-28-compliance.blueprint.yaml`](./regulation-28-compliance.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
