<!-- AUTO-GENERATED FROM cfa-ethics-standards-l2.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Cfa Ethics Standards L2

> Apply CFA ethics framework — Code of Ethics, Standards I-VII (professionalism, capital markets integrity, duties to clients/employers, investment analysis, conflicts, CFA designation)

**Category:** Trading · **Version:** 1.0.0 · **Tags:** ethics · professional-standards · cfa-standards · conflicts-of-interest · fiduciary-duty · cfa-level-2

## What this does

Apply CFA ethics framework — Code of Ethics, Standards I-VII (professionalism, capital markets integrity, duties to clients/employers, investment analysis, conflicts, CFA designation)

Specifies 2 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **member_id** *(text, required)* — Member or candidate identifier
- **standard_group** *(select, required)* — professionalism | capital_markets | clients | employers | investment_analysis | conflicts | cfa_responsibilities

## What must be true

- **code_of_ethics → act_integrity:** Act with integrity, competence, diligence, and respect
- **code_of_ethics → client_primacy:** Place interests of clients above personal interests
- **code_of_ethics → independence:** Maintain objectivity and independence
- **code_of_ethics → professional_conduct:** Reflect credit on the profession
- **code_of_ethics → capital_markets:** Promote capital market integrity
- **code_of_ethics → competence:** Maintain and improve professional competence
- **standard_i_professionalism → ia_knowledge_of_law:** Comply with most strict of applicable law, code, or regulations; dissociate from violations
- **standard_i_professionalism → ib_independence_objectivity:** No gifts or pressures compromising independent judgement
- **standard_i_professionalism → ic_misrepresentation:** Do not misrepresent qualifications, services, or performance
- **standard_i_professionalism → id_misconduct:** Do not engage in dishonesty, fraud, or deceit
- **standard_ii_capital_markets → iia_material_nonpublic:** Do not trade on material nonpublic information (mosaic theory allowed)
- **standard_ii_capital_markets → iib_market_manipulation:** Do not engage in information- or transaction-based manipulation
- **standard_iii_duties_to_clients → iiia_loyalty_prudence_care:** Act for clients' benefit; vote proxies in client interest
- **standard_iii_duties_to_clients → iiib_fair_dealing:** Deal fairly with all clients in recommendations and transactions
- **standard_iii_duties_to_clients → iiic_suitability:** Know client objectives, constraints, risk tolerance
- **standard_iii_duties_to_clients → iiid_performance_presentation:** Communicate performance fairly, accurately (GIPS preferred)
- **standard_iii_duties_to_clients → iiie_confidentiality:** Protect client information; exceptions for legal requirements
- **standard_iv_duties_to_employers → iva_loyalty:** Act in employer's interest; no misuse of firm assets; whistleblowing where warranted
- **standard_iv_duties_to_employers → ivb_additional_compensation:** Disclose and obtain consent for outside compensation
- **standard_iv_duties_to_employers → ivc_responsibilities_of_supervisors:** Prevent violations by subordinates; compliance systems
- **standard_v_investment_analysis → va_diligence_reasonable_basis:** Research independently; have basis for recommendations
- **standard_v_investment_analysis → vb_communication:** Disclose fact vs opinion; material changes promptly
- **standard_v_investment_analysis → vc_record_retention:** Maintain records supporting analysis per regulatory and firm requirements
- **standard_vi_conflicts_of_interest → via_disclosure_of_conflicts:** Disclose all conflicts in clear, prominent manner
- **standard_vi_conflicts_of_interest → vib_priority_of_transactions:** Client transactions before employer and personal; IPO restrictions
- **standard_vi_conflicts_of_interest → vic_referral_fees:** Disclose referral arrangements before or at time of engagement
- **standard_vii_cfa_responsibilities → viia_conduct_as_participant:** No cheating or compromising CFA exam integrity
- **standard_vii_cfa_responsibilities → viib_cfa_designation:** Do not misrepresent CFA designation; no partial designation
- **mosaic_theory → definition:** Non-material nonpublic info + public info may form material conclusion; not a violation
- **mosaic_theory → caution:** If single piece is material and nonpublic, mosaic doesn't shield
- **gips_performance → definition:** Global Investment Performance Standards; voluntary but strongly recommended
- **gips_performance → compliance:** Firm-wide; GIPS-compliant composites
- **gips_performance → advantage:** Standardised, comparable performance across managers
- **validation → member_required:** member_id present
- **validation → valid_standard:** standard_group in allowed set

## Success & failure scenarios

**✅ Success paths**

- **Review Ethics** — when member_id exists; standard_group in ["professionalism","capital_markets","clients","employers","investment_analysis","conflicts","cfa_responsibilities"], then call service; emit ethics.reviewed. _Why: Review ethics and professional standards compliance._

**❌ Failure paths**

- **Invalid Standard** — when standard_group not_in ["professionalism","capital_markets","clients","employers","investment_analysis","conflicts","cfa_responsibilities"], then emit ethics.rejected. _Why: Unsupported standard group._ *(error: `ETHICS_INVALID_STANDARD`)*

## Errors it can return

- `ETHICS_INVALID_STANDARD` — standard_group must be one of the supported standard groups

## Events

**`ethics.reviewed`**
  Payload: `member_id`, `standard_group`, `violation_found`, `remediation_required`

**`ethics.rejected`**
  Payload: `member_id`, `reason_code`

## Connects to

- **economics-investment-markets-l2** *(optional)*

## Quality fitness 🟢 86/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `██████████` | 10/10 |
| Outcomes | `████████████████████░░░░░` | 20/25 |
| Structured conditions | `██████████` | 10/10 |
| Error binding | `██████████` | 10/10 |
| Field validation | `███████░░░` | 7/10 |
| Relationships | `█████░░░░░` | 5/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `████░` | 4/5 |
| Simplicity | `█████` | 5/5 |

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/trading/cfa-ethics-standards-l2/) · **Spec source:** [`cfa-ethics-standards-l2.blueprint.yaml`](./cfa-ethics-standards-l2.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
