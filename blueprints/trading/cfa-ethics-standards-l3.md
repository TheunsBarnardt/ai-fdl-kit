<!-- AUTO-GENERATED FROM cfa-ethics-standards-l3.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Cfa Ethics Standards L3

> CFA Code of Ethics and Standards of Professional Conduct I-VII — professionalism, integrity, duties to clients, employers, investment analysis, conflicts of interest, and responsibilities

**Category:** Trading · **Version:** 1.0.0 · **Tags:** ethics · professional-conduct · cfa-standards · fiduciary-duty · conflicts-of-interest · material-nonpublic-information · cfa-level-3

## What this does

CFA Code of Ethics and Standards of Professional Conduct I-VII — professionalism, integrity, duties to clients, employers, investment analysis, conflicts of interest, and responsibilities

Specifies 2 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **case_id** *(text, required)* — Ethics case identifier
- **standard_violated** *(select, required)* — I_professionalism | II_integrity | III_duties_clients | IV_duties_employers | V_investment_analysis | VI_conflicts | VII_responsibilities

## What must be true

- **standard_i_professionalism → ia_knowledge_law:** Know and follow the more strict of applicable law or CFA Standards; dissociate from violations
- **standard_i_professionalism → ib_independence_objectivity:** Maintain objectivity; refuse gifts that compromise independence; disclose soft-dollar arrangements
- **standard_i_professionalism → ic_misrepresentation:** Never misrepresent qualifications, performance, or investment analysis; no plagiarism
- **standard_i_professionalism → id_misconduct:** No dishonesty, fraud, deceit; no actions reflecting adversely on the profession
- **standard_ii_integrity → iia_mnpi:** Do not act on or cause others to act on material nonpublic information; mosaic theory permitted
- **standard_ii_integrity → iib_market_manipulation:** Do not artificially influence prices or volumes; no pump-and-dump; no false information
- **standard_ii_integrity → materiality:** Material = information a reasonable investor would consider significant in investment decision
- **standard_ii_integrity → mosaic_theory:** Combining public information + non-material non-public information is permitted
- **standard_iii_duties_clients → iiia_loyalty:** Act in clients' best interests; place client interests above own and employer
- **standard_iii_duties_clients → iiib_fair_dealing:** Fair and equitable treatment across all clients; no front-running; simultaneous dissemination
- **standard_iii_duties_clients → iiic_suitability:** Know the client (IPS); recommend suitable investments; portfolio context matters
- **standard_iii_duties_clients → iiid_performance_presentation:** Fair and complete performance record; no cherry-picking; no misleading composite
- **standard_iii_duties_clients → iiie_preservation_confidentiality:** Keep client information confidential; exceptions: legal, employer compliance, consent
- **standard_iv_duties_employers → iva_loyalty:** Act in employer's best interests; don't take client list or proprietary info when leaving
- **standard_iv_duties_employers → ivb_additional_compensation:** Disclose any outside compensation that could create conflict with employer
- **standard_iv_duties_employers → ivc_responsibilities_supervisors:** Supervisors must prevent violations; establish and enforce compliance systems
- **standard_v_investment_analysis → va_diligence:** Reasonable basis for recommendations; thorough research; no recommendation without basis
- **standard_v_investment_analysis → vb_communication:** Distinguish fact from opinion; disclose limitations; communicate material changes
- **standard_v_investment_analysis → vc_record_retention:** Maintain records supporting investment analysis; at least 7 years
- **standard_vi_conflicts → via_disclosure:** Disclose all potential conflicts; fully disclose compensation, ownership, board positions
- **standard_vi_conflicts → vib_priority_transactions:** Clients before personal; employees before firm; no front-running
- **standard_vi_conflicts → vic_referral_fees:** Disclose any referral or solicitation fees; client must be able to assess independence
- **standard_vii_responsibilities → viia_conduct_exam:** Confidentiality of exam; don't misrepresent exam content or CFA designation
- **standard_vii_responsibilities → viib_cfa_designation:** Use CFA designation properly; don't claim superior performance from designation
- **recommended_procedures → know_law:** Compliance officer; legal counsel; distribution area laws; dissociation procedures
- **recommended_procedures → mnpi:** Firewall between departments; restricted list; personal trading policy; information barriers
- **recommended_procedures → fair_dealing:** Pro-rata distribution of investment recommendations; simultaneous dissemination
- **recommended_procedures → suitability:** Regular IPS review; reconfirm investment objectives and constraints
- **recommended_procedures → performance:** GIPS compliance recommended; include terminated accounts in composites
- **validation → case_required:** case_id present
- **validation → valid_standard:** standard_violated in [I_professionalism, II_integrity, III_duties_clients, IV_duties_employers, V_investment_analysis, VI_conflicts, VII_responsibilities]

## Success & failure scenarios

**✅ Success paths**

- **Evaluate Ethics Case** — when case_id exists; standard_violated in ["I_professionalism","II_integrity","III_duties_clients","IV_duties_employers","V_investment_analysis","VI_conflicts","VII_responsibilities"], then call service; emit ethics.case.evaluated. _Why: Evaluate professional conduct against CFA Standards._

**❌ Failure paths**

- **Invalid Standard** — when standard_violated not_in ["I_professionalism","II_integrity","III_duties_clients","IV_duties_employers","V_investment_analysis","VI_conflicts","VII_responsibilities"], then emit ethics.case.rejected. _Why: Unrecognized standard reference._ *(error: `ETHICS_INVALID_STANDARD`)*

## Errors it can return

- `ETHICS_INVALID_STANDARD` — standard_violated must reference a valid CFA Standard (I through VII)

## Events

**`ethics.case.evaluated`**
  Payload: `case_id`, `standard_violated`, `violation_found`, `recommended_action`

**`ethics.case.rejected`**
  Payload: `case_id`, `reason_code`

## Connects to

- **cfa-ethics-standards-l2** *(extends)* — Builds on L2 foundations — prerequisite before this level's material
- **cfa-ethics-application-l3** *(recommended)*
- **gips-standards-l3** *(recommended)*

## Quality fitness 🟢 89/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `██████████` | 10/10 |
| Outcomes | `████████████████████░░░░░` | 20/25 |
| Structured conditions | `██████████` | 10/10 |
| Error binding | `██████████` | 10/10 |
| Field validation | `███████░░░` | 7/10 |
| Relationships | `████████░░` | 8/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `████░` | 4/5 |
| Simplicity | `█████` | 5/5 |

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/trading/cfa-ethics-standards-l3/) · **Spec source:** [`cfa-ethics-standards-l3.blueprint.yaml`](./cfa-ethics-standards-l3.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
