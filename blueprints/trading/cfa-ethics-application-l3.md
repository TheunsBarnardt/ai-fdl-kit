<!-- AUTO-GENERATED FROM cfa-ethics-application-l3.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Cfa Ethics Application L3

> Applied ethics for Level 3 — case study applications of CFA Standards and Asset Manager Code of Professional Conduct covering loyalty, investment process, trading, risk, performance, and disclosure

**Category:** Trading · **Version:** 1.0.0 · **Tags:** ethics · professional-conduct · asset-manager-code · applied-ethics · fiduciary · portfolio-ethics · cfa-level-3

## What this does

Applied ethics for Level 3 — case study applications of CFA Standards and Asset Manager Code of Professional Conduct covering loyalty, investment process, trading, risk, performance, and disclosure

Specifies 2 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **case_id** *(text, required)* — Ethics case identifier
- **amc_area** *(select, required)* — loyalty | investment_process | trading | risk_compliance | performance | disclosure

## What must be true

- **l3_application_themes → portfolio_context:** At L3, ethics must be applied in the context of portfolio management — IPS, suitability, performance, conflicts
- **l3_application_themes → dual_roles:** Members may have multiple roles (PM, analyst, trader); conflicts between roles must be managed
- **l3_application_themes → institutional_context:** Fiduciary duties extend to beneficiaries, not just named clients; pensions, endowments
- **l3_application_themes → complex_situations:** L3 cases involve nuanced conflicts: soft dollars, referral fees, directed brokerage, trade allocation
- **asset_manager_code_loyalty → client_first:** Act in clients' best interests; subordinate personal interests and employer interests
- **asset_manager_code_loyalty → prudent_care:** Invest with care, loyalty, and due diligence appropriate to the mandate
- **asset_manager_code_loyalty → reasonable_cost:** Seek best execution; avoid unnecessary costs; soft dollars must be for client benefit
- **asset_manager_code_loyalty → proxy_voting:** Vote proxies in clients' interests; establish written proxy voting policy
- **asset_manager_code_loyalty → no_advantage:** Do not use clients' assets for personal benefit; no self-dealing
- **investment_process → strategy_adherence:** Manage in accordance with stated strategy, style, and risk; no style drift
- **investment_process → risk_limits:** Adhere to risk limits; escalate when limits are breached
- **investment_process → market_manipulation:** Never use any strategy that artificially influences prices
- **investment_process → short_selling:** Permitted but must not constitute market manipulation; cover in good faith
- **investment_process → benchmark_consistency:** Only compare to appropriate benchmark; disclose benchmark methodology
- **trading_conduct → best_execution:** Seek best execution on all trades; document selection criteria
- **trading_conduct → soft_dollars:** Soft dollars only for investment-related research benefiting clients
- **trading_conduct → directed_brokerage:** If client directs brokers, disclose impact on execution quality
- **trading_conduct → personal_trading:** No front-running; personal trades must not disadvantage clients; disclosure required
- **trading_conduct → trade_allocation:** Systematic and fair allocation across clients; no cherry-picking for favorites
- **risk_and_compliance → risk_management:** Implement risk management framework; measure and monitor; report to clients
- **risk_and_compliance → compliance_systems:** Robust compliance; regular review; independent oversight
- **risk_and_compliance → business_continuity:** Document and test business continuity and disaster recovery plans
- **risk_and_compliance → customary_records:** Maintain records supporting all investment decisions and compliance monitoring
- **risk_and_compliance → reporting:** Report compliance violations to management and relevant authorities promptly
- **performance_evaluation → fair_presentation:** Present performance completely and fairly; no selective cherry-picking
- **performance_evaluation → composite_integrity:** Include all fee-paying discretionary accounts; terminated accounts for relevant periods
- **performance_evaluation → gips_recommended:** Comply with GIPS or explain deviation; third-party verification preferred
- **performance_evaluation → simulation_disclosure:** Clearly disclose if performance includes back-tested or simulated results
- **disclosures → conflicts:** Disclose all material conflicts of interest in writing at least annually
- **disclosures → fees:** Full fee schedule; any soft dollars; referral arrangements; performance fees
- **disclosures → risks:** Describe investment risks in plain language; material strategy risks
- **disclosures → regulatory:** Regulatory and legal matters; sanctions; compliance exceptions
- **disclosures → client_access:** Clients should have access to personnel and procedures on request
- **validation → case_required:** case_id present
- **validation → valid_area:** amc_area in [loyalty, investment_process, trading, risk_compliance, performance, disclosure]

## Success & failure scenarios

**✅ Success paths**

- **Apply Ethics Framework** — when case_id exists; amc_area in ["loyalty","investment_process","trading","risk_compliance","performance","disclosure"], then call service; emit ethics.application.reviewed. _Why: Apply ethics framework to specified Asset Manager Code area._

**❌ Failure paths**

- **Invalid Area** — when amc_area not_in ["loyalty","investment_process","trading","risk_compliance","performance","disclosure"], then emit ethics.application.rejected. _Why: Unsupported AMC area._ *(error: `ETHICS_APP_INVALID_AREA`)*

## Errors it can return

- `ETHICS_APP_INVALID_AREA` — amc_area must be one of loyalty, investment_process, trading, risk_compliance, performance, disclosure

## Events

**`ethics.application.reviewed`**
  Payload: `case_id`, `amc_area`, `compliance_status`, `remediation_required`

**`ethics.application.rejected`**
  Payload: `case_id`, `reason_code`

## Connects to

- **cfa-ethics-standards-l3** *(required)*
- **gips-standards-l3** *(recommended)*

## Quality fitness 🟢 83/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `██████████` | 10/10 |
| Outcomes | `████████████████████░░░░░` | 20/25 |
| Structured conditions | `██████████` | 10/10 |
| Error binding | `██████████` | 10/10 |
| Field validation | `███████░░░` | 7/10 |
| Relationships | `██████░░░░` | 6/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `░░░░░` | 0/5 |
| Simplicity | `█████` | 5/5 |

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/trading/cfa-ethics-application-l3/) · **Spec source:** [`cfa-ethics-application-l3.blueprint.yaml`](./cfa-ethics-application-l3.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
