<!-- AUTO-GENERATED FROM account-opening.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Account Opening

> Investment account opening workflow with product selection, risk profiling, terms acceptance, funding instructions, and compliance review

**Category:** Workflow · **Version:** 1.0.0 · **Tags:** account-opening · investment · product-selection · risk-profiling · wealth-management · financial-services · kyc

## What this does

Investment account opening workflow with product selection, risk profiling, terms acceptance, funding instructions, and compliance review

Specifies 12 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **application_id** *(text, required)* — Application Id
- **client_id** *(text, required)* — Client Id
- **account_type** *(select, required)* — Account Type
- **selected_products** *(json, required)* — Selected Investment Products
- **risk_profile** *(select, required)* — Risk Profile
- **risk_score** *(number, required)* — Risk Assessment Score
- **investment_objective** *(select, required)* — Investment Objective
- **investment_horizon** *(select, required)* — Investment Horizon
- **initial_investment_amount** *(number, required)* — Initial Investment Amount
- **currency** *(select, required)* — Currency
- **source_of_funds** *(select, required)* — Source of Funds
- **source_of_funds_detail** *(text, optional)* — Source of Funds Details
- **terms_accepted** *(boolean, required)* — Terms and Conditions Accepted
- **terms_accepted_at** *(datetime, optional)* — Terms Accepted At
- **mandate_document_id** *(text, optional)* — Signed Mandate Document
- **funding_method** *(select, required)* — Funding Method
- **funding_reference** *(text, optional)* — Funding Reference Number
- **status** *(select, required)* — Status
- **compliance_notes** *(rich_text, optional)* — Compliance Review Notes
- **rejection_reason** *(text, optional)* — Rejection Reason

## What must be true

- **validation:** Client must complete onboarding (KYC) before opening an account, At least one investment product must be selected, Risk profile must be assessed before product selection is confirmed, Products must be suitable for the client's risk profile, Terms and conditions must be accepted before submission, Source of funds declaration is mandatory for compliance
- **product_suitability:** Conservative risk profile cannot select aggressive-growth products, Short-term horizon should warn on illiquid products, System validates product-risk alignment and warns on mismatches
- **compliance:** All applications require compliance review before account creation, Enhanced due diligence required for initial investments above threshold, Source of funds must be documented for anti-money laundering, Politically exposed persons require additional review
- **permissions:** Client can create and manage their own applications, Advisor can create applications on behalf of assigned clients, Compliance officer reviews and approves/rejects applications, Admin can override status and reassign applications

## Success & failure scenarios

**✅ Success paths**

- **Start Application** — when client_id exists; user.role in ["Client","Advisor","Admin"], then New account application created in draft status.
- **Cancel Application** — when application_id exists; status in ["draft","product_selection","risk_assessment","terms_review","funding"]; user.role in ["Client","Advisor","Admin"], then Application cancelled.
- **Get Application Status** — when application_id exists; user.role in ["Client","Advisor","Compliance","Admin"], then Return current application status with progress indicator.
- **Get Available Products** — when client_id exists; user.role in ["Client","Advisor"], then Return available investment products with descriptions, fees, and minimum investments.
- **Provide Funding Details** — when application_id exists; funding_method exists; initial_investment_amount gt 0; source_of_funds exists; status eq "funding", then Application submitted for compliance review.
- **Compliance Approve** — when application_id exists; status eq "compliance_review"; user.role in ["Compliance","Admin"], then Application approved, account creation initiated.
- **Compliance Reject** — when application_id exists; rejection_reason exists; status eq "compliance_review"; user.role in ["Compliance","Admin"], then Application rejected with reason.
- **Create Account** — when application_id exists; status eq "approved", then Investment account created in CRM and client notified.

**❌ Failure paths**

- **Select Products** — when application_id exists; selected_products exists; status in ["draft","product_selection"]; user.role in ["Client","Advisor"], then Products selected, moved to risk assessment. *(error: `NO_PRODUCTS_SELECTED`)*
- **Product Suitability Warning** — when application_id exists; risk_profile exists; product_risk_mismatch eq true, then Warning displayed about product-risk profile mismatch. *(error: `PRODUCT_SUITABILITY_VIOLATION`)*
- **Complete Risk Assessment** — when application_id exists; risk_score exists; risk_profile exists; investment_objective exists; investment_horizon exists; status eq "risk_assessment", then Risk assessment completed. *(error: `RISK_ASSESSMENT_REQUIRED`)*
- **Accept Terms** — when application_id exists; terms_accepted eq true; status eq "terms_review", then Terms accepted, moved to funding step. *(error: `TERMS_NOT_ACCEPTED`)*

## Errors it can return

- `APPLICATION_NOT_FOUND` — Account application not found
- `ONBOARDING_INCOMPLETE` — Client onboarding must be completed before opening an account
- `NO_PRODUCTS_SELECTED` — At least one investment product must be selected
- `RISK_ASSESSMENT_REQUIRED` — Risk assessment must be completed before proceeding
- `TERMS_NOT_ACCEPTED` — Terms and conditions must be accepted
- `INVALID_STATUS_TRANSITION` — This action is not allowed in the current application status
- `PRODUCT_SUITABILITY_VIOLATION` — Selected products do not match the client risk profile
- `INSUFFICIENT_MINIMUM_INVESTMENT` — Initial investment amount is below the minimum required
- `COMPLIANCE_REVIEW_REQUIRED` — Application requires compliance review before account creation
- `CRM_ACCOUNT_CREATION_FAILED` — Account creation in CRM failed. Please try again or contact support

## Connects to

- **client-onboarding** *(required)* — KYC onboarding must be completed before account can be opened
- **product-configurator** *(required)* — Products must exist in the catalog for selection during account opening
- **wizard-stepper** *(recommended)* — Multi-step account opening flow benefits from step-by-step wizard UI
- **document-management** *(recommended)* — Mandate documents and compliance paperwork need document storage
- **approval-chain** *(recommended)* — Compliance review follows an approval workflow pattern
- **email-notifications** *(recommended)* — Status change notifications sent via email
- **in-app-notifications** *(recommended)* — Real-time status updates shown in notification center
- **dataverse-client** *(required)* — Account creation and product data synced with CRM
- **audit-trail** *(recommended)* — All application changes must be tracked for regulatory compliance

## Quality fitness 🟢 85/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `██████████` | 10/10 |
| Outcomes | `██████████████████████░░░` | 22/25 |
| Structured conditions | `██████████` | 10/10 |
| Error binding | `█████░░░░░` | 5/10 |
| Field validation | `███████░░░` | 7/10 |
| Relationships | `██████████` | 10/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `██░░░` | 2/5 |
| Simplicity | `████░` | 4/5 |

**Recent auto-improvements** *(via autoresearch-style keep-or-reset loop — applied only because they raised the fitness score)*

- `T3` **auto-field-labels** — added labels to 5 fields
- `T5` **bind-orphan-errors** — bound 4 orphan error codes to outcomes

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/workflow/account-opening/) · **Spec source:** [`account-opening.blueprint.yaml`](./account-opening.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
