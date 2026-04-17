<!-- AUTO-GENERATED FROM bayes-formula.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Bayes Formula

> Apply Bayes' formula to update a prior probability to a posterior probability in the light of new evidence — the formal rule for rational belief revision

**Category:** Trading · **Version:** 1.0.0 · **Tags:** quantitative-methods · probability · bayes · bayesian-updating · conditional-probability · prior-posterior · cfa-level-1

## What this does

Apply Bayes' formula to update a prior probability to a posterior probability in the light of new evidence — the formal rule for rational belief revision

Specifies 5 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **prior_probability** *(number, required)* — Prior probability P(event) before observing evidence
- **likelihood** *(number, required)* — Likelihood P(evidence | event)
- **complementary_likelihood** *(number, optional)* — P(evidence | not event) — used with prior to derive denominator
- **unconditional_evidence** *(number, optional)* — P(evidence) directly, if known — else derived via total probability
- **multiple_scenarios** *(json, optional)* — Array of {scenario_id, prior, likelihood} for multi-hypothesis Bayes

## What must be true

- **core_formula → bayes_two_scenario:** P(event | evidence) = P(evidence | event) * P(event) / P(evidence)
- **core_formula → denominator_total_probability:** P(evidence) = P(evidence | event) * P(event) + P(evidence | not event) * P(not event)
- **core_formula → bayes_multi_scenario:** P(S_i | evidence) = P(evidence | S_i) * P(S_i) / sum_j[ P(evidence | S_j) * P(S_j) ]
- **interpretation → prior:** Initial belief before observing evidence
- **interpretation → likelihood:** Probability of observing the evidence under each hypothesis
- **interpretation → posterior:** Updated belief after observing evidence
- **interpretation → evidence_informativeness:** Evidence shifts prior more when likelihoods differ substantially across hypotheses
- **key_properties → inversion:** Bayes swaps the direction of conditioning: P(A|B) → P(B|A)
- **key_properties → sequential_updates:** Today's posterior becomes tomorrow's prior; natural fit for streaming evidence
- **key_properties → calibration:** Formula is correct; the art is in specifying priors and likelihoods
- **common_fallacies → base_rate_neglect:** Ignoring the prior → confusing P(evidence | event) with P(event | evidence)
- **common_fallacies → prosecutor_fallacy:** Treating P(evidence | innocent) as P(innocent | evidence)
- **investment_applications → earnings_surprise:** Update P(firm_high_quality) given positive earnings surprise
- **investment_applications → credit_analysis:** Update default probability given rating migration
- **investment_applications → technical_signals:** Update P(trend_up) given breakout, factoring false-positive rate
- **investment_applications → portfolio_managers:** Bayesian blending of prior and observed returns (Black-Litterman)
- **validation → probabilities_in_range:** 0 <= prior_probability <= 1; 0 <= likelihood <= 1
- **validation → denominator_positive:** P(evidence) > 0 (else posterior undefined)

## Success & failure scenarios

**✅ Success paths**

- **Compute Two Scenario** — when prior_probability exists; likelihood exists; complementary_likelihood exists, then call service; emit probability.bayes_calculated. _Why: Standard Bayes with event and complement._
- **Compute Multi Scenario** — when multiple_scenarios exists, then call service; emit probability.bayes_calculated. _Why: Multi-hypothesis Bayes._

**❌ Failure paths**

- **Zero Evidence Probability** — when unconditional_evidence eq 0, then emit probability.bayes_rejected. _Why: Denominator P(evidence) is zero._ *(error: `BAYES_ZERO_EVIDENCE`)*
- **Probabilities Out Of Range** — when prior_probability lt 0 OR prior_probability gt 1 OR likelihood lt 0 OR likelihood gt 1, then emit probability.bayes_rejected. _Why: Prior or likelihood out of [0,1]._ *(error: `BAYES_INVALID_PROBABILITY`)*
- **Missing Inputs** — when prior_probability not_exists OR likelihood not_exists, then emit probability.bayes_rejected. _Why: Required inputs missing._ *(error: `BAYES_MISSING_INPUTS`)*

## Errors it can return

- `BAYES_ZERO_EVIDENCE` — P(evidence) is zero; posterior probability is undefined
- `BAYES_INVALID_PROBABILITY` — Probabilities must lie in [0, 1]
- `BAYES_MISSING_INPUTS` — Prior probability and likelihood are required

## Events

**`probability.bayes_calculated`**
  Payload: `hypothesis_id`, `prior_probability`, `likelihood`, `posterior_probability`, `evidence_probability`

**`probability.bayes_rejected`**
  Payload: `hypothesis_id`, `reason_code`

## Connects to

- **expected-value-variance** *(required)*
- **total-probability-rule** *(required)*
- **probability-tree-conditional-expectation** *(recommended)*

## Quality fitness 🟢 84/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `██████████` | 10/10 |
| Outcomes | `█████████████████████░░░░` | 21/25 |
| Structured conditions | `██████████` | 10/10 |
| Error binding | `██████████` | 10/10 |
| Field validation | `██████░░░░` | 6/10 |
| Relationships | `███████░░░` | 7/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `░░░░░` | 0/5 |
| Simplicity | `█████` | 5/5 |

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/trading/bayes-formula/) · **Spec source:** [`bayes-formula.blueprint.yaml`](./bayes-formula.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
