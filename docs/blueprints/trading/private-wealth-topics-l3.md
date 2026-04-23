---
title: "Private Wealth Topics L3 Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Advanced private wealth topics — tax management, asset location, concentrated positions, estate planning, charitable strategies, and generational wealth transfe"
---

# Private Wealth Topics L3 Blueprint

> Advanced private wealth topics — tax management, asset location, concentrated positions, estate planning, charitable strategies, and generational wealth transfer

| | |
|---|---|
| **Feature** | `private-wealth-topics-l3` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | portfolio-management, private-wealth, tax-management, asset-location, concentrated-positions, estate-planning, charitable-giving, generational-wealth, cfa-level-3 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/private-wealth-topics-l3.blueprint.yaml) |
| **JSON API** | [private-wealth-topics-l3.json]({{ site.baseurl }}/api/blueprints/trading/private-wealth-topics-l3.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `wealth_manager` | Wealth Manager | human |  |
| `tax_advisor` | Tax Advisor | human |  |
| `estate_attorney` | Estate Attorney | human |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `client_id` | text | Yes | Client identifier |  |
| `topic_type` | select | Yes | tax_management \| asset_location \| concentrated_position \| estate_planning \| charitable \| generational |  |

## Rules

- **tax_components:**
  - **interest_income:** Taxed as ordinary income; highest marginal rate
  - **dividend_income:** Qualified dividends taxed at lower capital gains rate
  - **capital_gains:** Short-term (<1yr) at ordinary rates; long-term at preferential rates
  - **account_type:** Taxable vs tax-deferred (pension, 401k) vs tax-exempt (Roth, ISA)
- **measuring_tax_efficiency:**
  - **after_tax_return:** Pre-tax return × (1 − effective tax rate)
  - **tax_drag:** Loss of compounding from annual tax payments on income/gains
  - **turnover:** High-turnover strategies realize gains frequently; high tax drag
  - **asset_class_efficiency:** Equities (buy-hold): efficient; bonds: inefficient; REITs: inefficient
- **asset_location:**
  - **principle:** Place tax-inefficient assets in tax-deferred; tax-efficient in taxable
  - **tax_deferred:** Bonds, REITs, active equity with high turnover
  - **taxable:** Index equity funds, municipal bonds, tax-managed funds
  - **optimization:** After-tax asset location can add 50-100 bps per year vs naive allocation
- **decumulation:**
  - **withdrawal_order:** Draw from taxable first, tax-deferred second, tax-exempt last (general rule)
  - **roth_conversion:** Convert to Roth in low-income years; tax-free growth thereafter
  - **required_distributions:** RMDs from tax-deferred accounts at 72+ (US); must plan for tax impact
- **basic_tax_strategies:**
  - **loss_harvesting:** Realize capital losses to offset gains; reinvest in similar (not identical) security
  - **gain_deferral:** Hold appreciated positions; defer realized gains to future years or death
  - **location_optimization:** Match asset class to most tax-efficient account type
  - **charitable_gifts:** Donate appreciated securities; deduct FMV; avoid capital gains
- **concentrated_positions:**
  - **risks:** Undiversified; single-stock risk; liquidity risk; potential tax liability on exit
  - **retention_reasons:** Low cost basis; restricted stock; emotional attachment; control
  - **staged_diversification:** Sell shares over multiple years; defer tax liability
  - **completion_portfolio:** Hold underweights to all other sectors vs concentrated stock; diversify without selling
  - **monetization:** Borrow against position (margin); variable prepaid forward; exchange fund
  - **collar:** Buy put, sell call; limit downside; may be treated as constructive sale depending on terms
  - **exchange_fund:** Contribute concentrated stock to fund; receive diversified interest; defer tax (7-year lock-up)
  - **charitable_remainder_trust:** Transfer appreciated stock; CRT sells; no immediate CGT; income stream to donor
- **private_business_and_real_estate:**
  - **personal_credit:** Borrow against business equity; retain ownership; access liquidity
  - **leveraged_recap:** Business borrows; distributes cash to owner; retains control
  - **esop:** Sell shares to employee ownership plan; tax-advantaged; retain employees
  - **real_estate_monetization:** Mortgage financing; installment sale; 1031 exchange
  - **opportunity_zone:** Defer and reduce gains via qualified opportunity zone investment
- **estate_planning:**
  - **will:** Legal document distributing estate; probate process; validity requirements
  - **trust:** Legal structure holding assets; avoids probate; flexibility in distribution
  - **legal_systems:** Common law (separate property default); civil law (community property default)
  - **lifetime_gifts:** Transfer wealth during lifetime; may use annual gift tax exclusion
  - **testamentary_bequest:** Transfer at death; included in taxable estate
  - **gift_efficiency:** Lifetime gift more efficient if post-gift appreciation escapes estate tax
- **estate_planning_tools:**
  - **irrevocable_trust:** Remove from taxable estate; loss of control; irrevocable
  - **grantor_retained_annuity:** GRAT; transfer appreciation to heirs; grantor retains annuity
  - **family_limited_partnership:** FLP; discount for lack of control/marketability; estate tax saving
  - **charitable_lead_trust:** CLT; charity gets income stream; heirs get remainder; reduces estate
  - **dynasty_trust:** Multi-generational; avoids estate tax at each generation transfer
- **generational_wealth:**
  - **family_governance:** Mission, values, decision-making; reduce conflict; preserve cohesion
  - **conflict_resolution:** Formal family council; independent trustee; pre-agreed dispute mechanism
  - **business_exit:** Succession planning; buyout; IPO; sale to third party
  - **unexpected:** Powers of attorney; healthcare directives; incapacity plan; divorce pre-nup
- **validation:**
  - **client_required:** client_id present
  - **valid_topic:** topic_type in [tax_management, asset_location, concentrated_position, estate_planning, charitable, generational]

## Outcomes

### Address_private_wealth_topic (Priority: 1)

_Address advanced private wealth management topic for client_

**Given:**
- `client_id` (input) exists
- `topic_type` (input) in `tax_management,asset_location,concentrated_position,estate_planning,charitable,generational`

**Then:**
- **call_service** target: `wealth_manager`
- **emit_event** event: `private_wealth.topic.addressed`

### Invalid_topic (Priority: 10) — Error: `PWM_TOPIC_INVALID`

_Unsupported topic type_

**Given:**
- `topic_type` (input) not_in `tax_management,asset_location,concentrated_position,estate_planning,charitable,generational`

**Then:**
- **emit_event** event: `private_wealth.topic.rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `PWM_TOPIC_INVALID` | 400 | topic_type must be one of tax_management, asset_location, concentrated_position, estate_planning, charitable, generational | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `private_wealth.topic.addressed` |  | `client_id`, `topic_type`, `tax_impact`, `estate_value`, `strategy_summary` |
| `private_wealth.topic.rejected` |  | `client_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| private-wealth-management-overview-l3 | required |  |

## AGI Readiness

### Goals

#### Reliable Private Wealth Topics L3

Advanced private wealth topics — tax management, asset location, concentrated positions, estate planning, charitable strategies, and generational wealth transfer

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
| `private_wealth_management_overview_l3` | private-wealth-management-overview-l3 | fail |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| address_private_wealth_topic | `autonomous` | - | - |
| invalid_topic | `autonomous` | - | - |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Private Wealth Topics L3 Blueprint",
  "description": "Advanced private wealth topics — tax management, asset location, concentrated positions, estate planning, charitable strategies, and generational wealth transfe",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "portfolio-management, private-wealth, tax-management, asset-location, concentrated-positions, estate-planning, charitable-giving, generational-wealth, cfa-level-3"
}
</script>
