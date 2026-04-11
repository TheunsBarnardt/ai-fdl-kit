<!-- AUTO-GENERATED FROM tax-engine.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Tax Engine

> Tax engine with percentage, fixed, division, group, and formula-based tax types, repartition, cash-basis accounting, and fiscal position mapping.

**Category:** Data · **Version:** 1.0.0 · **Tags:** tax-computation · vat · sales-tax · fiscal-position · cash-basis

## What this does

Tax engine with percentage, fixed, division, group, and formula-based tax types, repartition, cash-basis accounting, and fiscal position mapping.

Specifies 8 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **tax_name** *(text, required)* — Tax Name
- **amount_type** *(select, required)* — Computation Type
- **tax_amount** *(number, required)* — Tax Rate/Amount
- **type_tax_use** *(select, required)* — Tax Scope
- **price_include** *(boolean, optional)* — Included in Price
- **tax_exigibility** *(select, required)* — Tax Exigibility
- **cash_basis_transition_account** *(text, optional)* — Cash Basis Transition Account
- **children_taxes** *(json, optional)* — Child Taxes
- **sequence** *(number, required)* — Computation Order
- **invoice_repartition_lines** *(json, required)* — Invoice Repartition
- **refund_repartition_lines** *(json, required)* — Refund Repartition
- **custom_formula** *(text, optional)* — Custom Formula
- **fiscal_position_name** *(text, required)* — Fiscal Position Name
- **tax_mapping_rules** *(json, required)* — Tax Mapping Rules

## What must be true

- **tax_name_unique_per_scope:** Tax names must be unique within the same company, tax scope (sale/purchase), and country.
- **group_tax_children_ordered:** Child taxes within a group are applied in sequence order. Each child's base is the original base (not the accumulated result).
- **cash_basis_requires_reconcile_account:** Cash-basis taxes require a transition account that supports reconciliation to hold the tax amount until payment.
- **price_include_adjusts_base:** When tax is included in price, the base is calculated by reverse- computing: base = price / (1 + tax_rate). The tax amount is the difference between price and base.
- **division_type_always_included:** Division-type taxes are always price-inclusive by definition. The formula is: tax = price - (price / (1 + rate/100)).
- **formula_safe_evaluation:** Custom formula taxes are evaluated in a sandboxed environment. Only approved variables (base, price_unit, quantity, product) are available. No system access or imports allowed.
- **fiscal_position_auto_mapping:** When a fiscal position is set on a transaction, all tax lines are automatically remapped according to the position's tax mapping rules.
- **repartition_must_sum_to_100:** Invoice and refund repartition line factors must sum to 100% for accurate tax distribution across accounts.

## Success & failure scenarios

**✅ Success paths**

- **Tax Computed Percent** — when amount_type eq "percent"; a transaction line has a base amount, quantity, and tax assigned, then Tax calculated as percentage of base and added to total.
- **Tax Computed Fixed** — when amount_type eq "fixed", then Fixed tax amount applied per unit regardless of price.
- **Tax Computed Group** — when amount_type eq "group"; group has one or more child taxes, then Combined tax from all child taxes in the group.
- **Tax Computed Price Inclusive** — when tax is marked as price-inclusive, then Tax extracted from the inclusive price, base adjusted downward.
- **Tax Computed Formula** — when amount_type eq "code"; a valid formula expression is configured, then Tax computed from custom formula.
- **Fiscal Position Applied** — when a fiscal position is assigned to the transaction; the position has tax mapping rules, then Tax lines reflect the customer's jurisdiction-specific rates.
- **Cash Basis Deferred** — when tax_exigibility eq "on_payment"; invoice is posted but payment not yet received, then Tax liability deferred until payment. On payment reconciliation, amount moves from transition account to final tax account.

**❌ Failure paths**

- **Invalid Formula** — when tax formula contains unsafe or invalid syntax, then Tax configuration rejected until formula is corrected. *(error: `TAX_INVALID_FORMULA`)*

## Errors it can return

- `TAX_INVALID_FORMULA` — The tax formula contains invalid syntax or unauthorized operations.
- `TAX_DUPLICATE_NAME` — A tax with this name already exists for this scope and country.
- `TAX_CASH_BASIS_NO_ACCOUNT` — Cash-basis taxes require a reconcilable transition account.
- `TAX_REPARTITION_UNBALANCED` — Repartition line factors do not sum to 100%.

## Connects to

- **invoicing-payments** *(required)* — Tax engine computes taxes on every invoice line
- **pos-core** *(required)* — POS order lines use tax engine for price calculation
- **quotation-order-management** *(required)* — Sales order lines use tax engine for pricing
- **ecommerce-store** *(required)* — Product prices on website include/exclude tax per configuration

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/data/tax-engine/) · **Spec source:** [`tax-engine.blueprint.yaml`](./tax-engine.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
