---
title: "Chi Square Contingency Table Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Test independence of two categorical variables using a chi-square contingency table — comparing observed joint frequencies against the frequencies expected unde"
---

# Chi Square Contingency Table Blueprint

> Test independence of two categorical variables using a chi-square contingency table — comparing observed joint frequencies against the frequencies expected under the null of independence

| | |
|---|---|
| **Feature** | `chi-square-contingency-table` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | quantitative-methods, hypothesis-testing, chi-square, contingency-table, independence-test, categorical-data, cfa-level-1 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/chi-square-contingency-table.blueprint.yaml) |
| **JSON API** | [chi-square-contingency-table.json]({{ site.baseurl }}/api/blueprints/trading/chi-square-contingency-table.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `inference_engine` | Statistical Inference Engine | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `contingency_table` | json | Yes | r x c matrix of observed joint frequencies O_ij |  |
| `row_labels` | json | No | Labels for rows (r categories of variable 1) |  |
| `column_labels` | json | No | Labels for columns (c categories of variable 2) |  |
| `significance_level` | number | No | alpha (default 0.05) |  |

## Rules

- **core_formulas:**
  - **expected_frequency:** E_ij = (row_total_i * column_total_j) / grand_total
  - **chi_square_statistic:** chi_square = sum_i sum_j [ (O_ij - E_ij)^2 / E_ij ]
  - **degrees_of_freedom:** df = (r - 1) * (c - 1)
  - **distribution:** Chi-square with (r-1)(c-1) degrees of freedom under H0 of independence
- **hypotheses:**
  - **:** H0: the two categorical variables are independent
  - **alternative:** Ha: the variables are NOT independent (i.e., associated)
- **decision_rule:**
  - **reject_condition:** Reject H0 if chi_square > chi_square_critical_{alpha, (r-1)(c-1)}
  - **right_tail_only:** Chi-square test is always right-tailed
- **expected_cell_size_rule:**
  - **rule_of_thumb:** Every expected cell count >= 5 for chi-square approximation to hold
  - **fix_when_violated:** Combine sparse categories or use Fisher's exact test
- **interpretation:**
  - **large_chi_square:** Observed and expected frequencies diverge; reject independence
  - **small_chi_square:** Observed closely matches expected; fail to reject independence
  - **effect_size:** Cramer's V = sqrt(chi_square / (n * min(r-1, c-1))) — 0 to 1, interprets as correlation
- **investment_applications:**
  - **sector_and_return_class:** Test whether sector membership is independent of the return bucket (winner/loser/flat)
  - **rating_migrations:** Test independence between prior rating and subsequent rating change
  - **factor_exposures:** Test independence between style (value/growth) and risk bucket
  - **survey_analysis:** Test independence of wealth segment and risk tolerance
- **validation:**
  - **table_dimensions:** r >= 2, c >= 2
  - **expected_frequencies_adequate:** All E_ij >= 5 (ideally); E_ij >= 1 as minimum
  - **positive_grand_total:** Sum of all cells > 0

## Outcomes

### Run_chi_square_test (Priority: 1)

_Compute chi-square statistic and compare to critical value_

**Given:**
- `contingency_table` (input) exists
- `table_valid` (computed) eq `true`

**Then:**
- **call_service** target: `inference_engine`
- **emit_event** event: `inference.independence_test_completed`

### Low_expected_frequencies (Priority: 10)

_At least one expected cell is too sparse for chi-square approximation_

**Given:**
- `min_expected_cell` (computed) lt `5`

**Then:**
- **emit_event** event: `inference.independence_test_warning`

### Table_malformed (Priority: 11) — Error: `CHI_INDEP_TABLE_MALFORMED`

_Contingency table is not a valid r x c matrix_

**Given:**
- `table_valid` (computed) eq `false`

**Then:**
- **emit_event** event: `inference.independence_test_rejected`

### Missing_table (Priority: 12) — Error: `CHI_INDEP_TABLE_MISSING`

_Contingency table missing_

**Given:**
- `contingency_table` (input) not_exists

**Then:**
- **emit_event** event: `inference.independence_test_rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `CHI_INDEP_TABLE_MALFORMED` | 400 | Contingency table must be a rectangular r x c matrix with non-negative counts | No |
| `CHI_INDEP_TABLE_MISSING` | 400 | Contingency table is required | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `inference.independence_test_completed` |  | `test_id`, `chi_square`, `degrees_of_freedom`, `p_value`, `cramers_v`, `decision` |
| `inference.independence_test_warning` |  | `test_id`, `warning_message`, `min_expected_cell` |
| `inference.independence_test_rejected` |  | `test_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| hypothesis-test-variance | recommended | Variance tests and chi-square contingency tests share the same chi-square distribution family |
| hypothesis-testing-framework | required |  |
| parametric-vs-nonparametric-tests | recommended |  |
| correlation-significance-test | recommended |  |

## AGI Readiness

### Goals

#### Reliable Chi Square Contingency Table

Test independence of two categorical variables using a chi-square contingency table — comparing observed joint frequencies against the frequencies expected under the null of independence

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
| `hypothesis_testing_framework` | hypothesis-testing-framework | fail |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| run_chi_square_test | `autonomous` | - | - |
| low_expected_frequencies | `autonomous` | - | - |
| table_malformed | `autonomous` | - | - |
| missing_table | `autonomous` | - | - |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
worked_example:
  table:
    - - 30
      - 20
      - 10
    - - 15
      - 25
      - 20
    - - 5
      - 15
      - 25
  row_totals:
    - 60
    - 60
    - 45
  col_totals:
    - 50
    - 60
    - 55
  grand_total: 165
  degrees_of_freedom: 4
  chi_square: computed across 9 cells
  critical_0_05: 9.488
  decision: Reject H0 if chi_square > 9.488
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Chi Square Contingency Table Blueprint",
  "description": "Test independence of two categorical variables using a chi-square contingency table — comparing observed joint frequencies against the frequencies expected unde",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "quantitative-methods, hypothesis-testing, chi-square, contingency-table, independence-test, categorical-data, cfa-level-1"
}
</script>
