<!-- AUTO-GENERATED FROM fund-factsheet.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Fund Factsheet

> Monthly or quarterly investor factsheet summarising fund strategy, performance, holdings, risk, fees, and disclosures, generated as a versioned PDF

**Category:** Trading · **Version:** 1.0.0 · **Tags:** factsheet · fund-reporting · asisa · disclosure · msci · benchmark · reporting

## What this does

Monthly or quarterly investor factsheet summarising fund strategy, performance, holdings, risk, fees, and disclosures, generated as a versioned PDF

Specifies 8 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **factsheet_id** *(text, required)* — Factsheet ID
- **fund_id** *(text, required)* — Fund Identifier
- **as_of_date** *(date, required)* — As-Of Date
- **frequency** *(select, required)* — Frequency
- **fund_name** *(text, required)* — Fund Name
- **fund_classification** *(text, required)* — ASISA Classification
- **investment_objective** *(rich_text, required)* — Investment Objective
- **investment_approach** *(rich_text, required)* — Investment Approach / Strategy
- **portfolio_manager** *(text, required)* — Portfolio Manager
- **launch_date** *(date, required)* — Launch Date
- **base_currency** *(text, required)* — Base Currency
- **benchmark** *(text, required)* — Benchmark
- **regulation_28_compliant** *(boolean, required)* — Regulation 28 Compliant
- **risk_profile** *(select, required)* — Risk Profile
- **recommended_term** *(text, required)* — Recommended Investment Term
- **minimum_investment** *(number, optional)* — Minimum Investment Amount
- **fee_structure** *(json, required)* — Fee Structure (management, performance, TER, TIC, TC)
- **top_holdings** *(json, required)* — Top Holdings (typically top 10)
- **sector_allocation** *(json, required)* — Sector Allocation
- **geographic_allocation** *(json, optional)* — Geographic Allocation
- **asset_allocation** *(json, required)* — Asset Class Allocation
- **returns_table** *(json, required)* — Periodic Returns vs Benchmark (1M, 3M, YTD, 1Y, 3Y, 5Y, SI)
- **monthly_returns** *(json, optional)* — Monthly Returns Grid (years x months)
- **risk_measures** *(json, required)* — Risk Measures (std dev, Sharpe, Sortino, max drawdown, VaR, best/worst month)
- **growth_chart_data** *(json, required)* — Investment Growth Chart Series
- **drawdown_chart_data** *(json, optional)* — Drawdown Chart Series
- **income_distributions** *(json, optional)* — Income Distributions History
- **manager_commentary** *(rich_text, optional)* — Portfolio Manager Commentary
- **disclosures** *(rich_text, required)* — Regulatory Disclosures and Disclaimers
- **pdf_storage_url** *(url, optional)* — Generated PDF Storage URL
- **pdf_hash** *(text, optional)* — PDF Content Hash (SHA-256)
- **status** *(select, required)* — Status

## What must be true

- **generation → trigger:** scheduled_job
- **generation → schedule:** monthly on the 5th business day after month-end, quarterly on the 7th business day after quarter-end
- **generation → inputs:** portfolio_positions_as_of_date, performance_series, benchmark_returns, fee_schedule, fund_mandate, manager_commentary
- **generation → as_of_snapshot:** true
- **content_requirements → investment_objective:** MUST: Present verbatim from the fund mandate
- **content_requirements → benchmark:** MUST: The benchmark declared in the IPS; changes require client/trustee approval and are disclosed
- **content_requirements → asisa_classification:** MUST: Aligned to the current ASISA Fund Classification Standard
- **content_requirements → regulation_28_flag:** MUST: Display Reg 28 status prominently for retirement-eligible funds
- **content_requirements → risk_profile:** MUST: Risk profile indicator is consistent with the fund's 36-month volatility bucket
- **content_requirements → fees_disclosure:** MUST: TER, TIC, and TC shown where applicable, in accordance with ASISA Standard on Total Expense Ratios
- **performance_calculation → methodology:** gips_compliant
- **performance_calculation → net_of_fees:** MUST: Net-of-fees returns shown with calculation method disclosed
- **performance_calculation → benchmark_alignment:** MUST: Benchmark returns computed over identical periods, same currency
- **performance_calculation → inception_label:** MUST: Performance labelled 'since inception' uses the actual launch date
- **risk_measures → basis:** 36-month rolling (or since inception if younger)
- **risk_measures → required_measures:** standard_deviation, sharpe_ratio, sortino_ratio, max_drawdown, best_month, worst_month, value_at_risk_95
- **risk_measures → risk_free_proxy_disclosed:** true
- **approval_workflow → draft_by:** portfolio_manager
- **approval_workflow → reviewed_by:** compliance_officer
- **approval_workflow → approved_by:** head_of_compliance
- **approval_workflow → authorization_logged:** true
- **disclosures → required_statements:** Collective Investment Schemes are generally medium to long-term investments., Past performance is not necessarily a guide to future performance., The value of participatory interests may go down as well as up., CIS are traded at ruling prices and may engage in scrip lending and borrowing., Annualised returns are period returns re-scaled to a period of 1 year., A schedule of fees and charges is available on request from the Manager.
- **disclosures → custom_disclosures_allowed:** true
- **versioning → supersedes_on_republish:** true
- **versioning → version_label:** YYYY-MM (monthly) or YYYY-Qn (quarterly)
- **versioning → retention_years:** 7
- **pii_and_privacy → contains_client_pii:** false
- **pii_and_privacy → top_holdings_delay_days:** 30
- **distribution → channels:** website, email, client_portal, regulator_filing
- **distribution → watermark_unpublished:** true

## Success & failure scenarios

**✅ Success paths**

- **Factsheet Generated Successfully** — when all required inputs (positions, performance, benchmark, fees) are available as of as_of_date; fund mandate, benchmark, and classification are current; risk measures are computable from the performance history, then Draft factsheet written to compliance review queue. _Why: All inputs present and fresh, content computed, PDF rendered and hashed._
- **Factsheet Approved And Published** — when status eq "compliance_review"; compliance officer has approved the draft, then Factsheet published across all distribution channels. _Why: Compliance approval recorded, version published, audit log entry written._
- **Factsheet Superseded** — when a newer factsheet for the same fund and as_of_date is published, then Prior version marked superseded; both remain in the audit record. _Why: A newer version supersedes a prior published version; prior remains readable for audit._

**❌ Failure paths**

- **Unauthorized Publish** — when caller does not have head_of_compliance role; status neq "compliance_review", then Publish blocked and attempt recorded to audit log. _Why: Caller attempted to publish without compliance approval._ *(error: `FACTSHEET_UNAUTHORIZED_PUBLISH`)*
- **Input Data Missing** — when any of positions, performance, benchmark returns, or fee schedule is missing or stale, then Generation aborted; operations team must resolve inputs before retry. _Why: One or more required inputs for generation are unavailable as of as_of_date._ *(error: `FACTSHEET_INPUT_MISSING`)*
- **Benchmark Mismatch** — when benchmark field does not match the benchmark declared in the current IPS, then Generation blocked; mandate and factsheet must be reconciled. _Why: The benchmark specified does not match the benchmark in the IPS._ *(error: `FACTSHEET_BENCHMARK_MISMATCH`)*
- **Pdf Render Failed** — when PDF rendering pipeline returned an error, then Generation aborted; engineering alerted. _Why: PDF rendering engine failed to produce output._ *(error: `FACTSHEET_RENDER_FAILED`)*
- **Compliance Rejected** — when status eq "compliance_review"; compliance officer rejected the draft, then Factsheet returned to portfolio manager with rejection reasons. _Why: Compliance review found issues requiring remediation._ *(error: `FACTSHEET_COMPLIANCE_REJECTED`)*

## Errors it can return

- `FACTSHEET_INPUT_MISSING` — Factsheet generation blocked: required input data is missing or stale.
- `FACTSHEET_COMPLIANCE_REJECTED` — Factsheet was rejected by compliance review.
- `FACTSHEET_BENCHMARK_MISMATCH` — Benchmark does not match the fund's declared IPS benchmark.
- `FACTSHEET_UNAUTHORIZED_PUBLISH` — You do not have permission to publish this factsheet.
- `FACTSHEET_RENDER_FAILED` — Factsheet PDF rendering failed. Engineering has been notified.

## Events

**`factsheet.generated`** — A draft factsheet was successfully generated and queued for compliance review
  Payload: `factsheet_id`, `fund_id`, `as_of_date`, `frequency`, `pdf_hash`

**`factsheet.published`** — A factsheet was approved by compliance and published to distribution channels
  Payload: `factsheet_id`, `fund_id`, `as_of_date`, `approver_id`, `pdf_hash`

**`factsheet.superseded`** — A prior published factsheet was superseded by a newer version
  Payload: `factsheet_id`, `superseding_factsheet_id`, `reason`

**`factsheet.rejected`** — Compliance review rejected the draft factsheet
  Payload: `factsheet_id`, `reviewer_id`, `rejection_reasons`

**`factsheet.generation_failed`** — Factsheet generation aborted due to missing or stale inputs
  Payload: `fund_id`, `as_of_date`, `missing_inputs`

**`factsheet.benchmark_mismatch`** — Benchmark does not match the IPS-declared benchmark
  Payload: `fund_id`, `expected_benchmark`, `provided_benchmark`

**`factsheet.unauthorized_publish_attempt`** — An unauthorized caller attempted to publish a factsheet
  Payload: `caller_id`, `factsheet_id`

**`factsheet.render_failed`** — PDF rendering pipeline failed
  Payload: `factsheet_id`, `render_error`

## Connects to

- **portfolio-management** *(required)* — Positions and cash balances as of the factsheet date are sourced from the portfolio manager
- **performance-attribution** *(required)* — Return series and risk measures are computed by the performance engine
- **regulation-28-compliance** *(recommended)* — The Reg 28 flag and compliance status are surfaced on the factsheet for retirement-eligible funds
- **immutable-audit-log** *(required)* — Approval events and published-version hashes are recorded to the audit log for regulator inspection
- **popia-compliance** *(required)* — Distribution lists (email recipients) contain PII and must satisfy POPIA consent and minimization

## Quality fitness 🟢 91/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `██████████` | 10/10 |
| Outcomes | `████████████████████████░` | 24/25 |
| Structured conditions | `███████░░░` | 7/10 |
| Error binding | `██████████` | 10/10 |
| Field validation | `██████░░░░` | 6/10 |
| Relationships | `██████████` | 10/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `████░` | 4/5 |
| Simplicity | `█████` | 5/5 |

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/trading/fund-factsheet/) · **Spec source:** [`fund-factsheet.blueprint.yaml`](./fund-factsheet.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
