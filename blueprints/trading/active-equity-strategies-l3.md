<!-- AUTO-GENERATED FROM active-equity-strategies-l3.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Active Equity Strategies L3

> Active equity strategies — bottom-up/top-down/factor approaches, value/momentum/growth/quality factors, activist strategies, quant strategies, and pitfalls

**Category:** Trading · **Version:** 1.0.0 · **Tags:** portfolio-management · equity · active-equity · value-investing · momentum · factor-investing · activist-investing · quantitative-equity · cfa-level-3

## What this does

Active equity strategies — bottom-up/top-down/factor approaches, value/momentum/growth/quality factors, activist strategies, quant strategies, and pitfalls

Specifies 2 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **strategy_id** *(text, required)* — Strategy identifier
- **strategy_type** *(select, required)* — bottom_up | top_down | factor | activist | stat_arb | event_driven

## What must be true

- **information_used → fundamental:** Financial statements, competitive analysis, management quality, valuation models
- **information_used → quantitative:** Statistical relationships, price data, alternative data; large data sets
- **information_used → forecast_vs_pattern:** Fundamental = forecast earnings/cash flows; quant = pattern recognition in data
- **information_used → judgment_vs_optimization:** Fundamental = PM judgment; quant = portfolio optimizer
- **bottom_up_strategies → value_investing:** Buy stocks trading below intrinsic value; low P/E, P/B, P/FCF; mean-reversion
- **bottom_up_strategies → garp:** Growth at Reasonable Price; PEG ratio; blend value and growth
- **bottom_up_strategies → deep_value:** Distressed or out-of-favor stocks; high margin of safety; high patience required
- **bottom_up_strategies → relative_value:** Compare similar stocks; buy undervalued vs peers; short overvalued
- **bottom_up_strategies → income_focus:** High dividend yield; payout sustainability; dividend growth
- **top_down_strategies → country_geographic:** Overweight countries with superior macro outlook, valuation, or momentum
- **top_down_strategies → sector_rotation:** Overweight sectors expected to outperform based on business cycle phase
- **top_down_strategies → volatility_based:** Low-volatility strategies; target stable return with reduced drawdown
- **top_down_strategies → thematic:** Long-term structural themes (AI, clean energy, aging population); high conviction
- **factor_strategies → value_factor:** Low price ratios (P/E, P/B, EV/EBITDA); contrarian; works over long horizons
- **factor_strategies → momentum_factor:** Recent outperformers continue; 12-1 month returns; strong empirical evidence
- **factor_strategies → growth_factor:** High revenue/earnings growth; expensive but justified by superior fundamentals
- **factor_strategies → quality_factor:** High ROE, low debt, stable earnings; defensive; outperforms in bear markets
- **factor_strategies → unconventional:** Alternative data (satellite, credit card, NLP); alpha decay faster
- **activist_strategies → popularity:** Activist hedge funds manage significant assets; increasing influence on governance
- **activist_strategies → tactics:** Board seats, proxy contests, open letters, merger blocking, capital structure change
- **activist_strategies → targets:** Underperforming vs peers; excessive cash; conglomerate discount; poor governance
- **activist_strategies → holding_period:** Typically 2-5 years; requires patience and resources
- **stat_arb_microstructure → pairs_trading:** Long undervalued, short overvalued within pair; mean-reversion
- **stat_arb_microstructure → market_making:** Provide liquidity; earn bid-ask spread; requires speed and technology
- **stat_arb_microstructure → high_frequency:** Exploit micro-structural inefficiencies; requires co-location and low latency
- **event_driven → merger_arb:** Long target, short acquirer in cash/stock deals; earn spread net of deal break risk
- **event_driven → spin_offs:** Newly independent companies often mispriced; forced selling by index funds
- **event_driven → earnings_events:** Trade around earnings announcements; exploit post-earnings drift
- **fundamental_process → idea_generation:** Screens, research, analyst input, market observation
- **fundamental_process → analysis:** Valuation model, competitive analysis, management assessment
- **fundamental_process → portfolio_construction:** Position sizing based on conviction and risk budget
- **fundamental_process → monitoring:** Track thesis; exit when thesis plays out or is invalidated
- **fundamental_process → pitfalls:** Value trap, overconfidence, anchoring, failure to update on new information
- **quantitative_process → signal_generation:** Identify predictive factors; test on historical data
- **quantitative_process → backtesting:** Validate signal; beware overfitting and data mining bias
- **quantitative_process → portfolio_construction:** Optimize factor exposure; control turnover and transaction costs
- **quantitative_process → pitfalls:** Overfitting, factor crowding, regime change, lookahead bias
- **style_classification → return_based:** Regress returns on factor indexes; infer style from factor loadings
- **style_classification → holdings_based:** Analyze actual portfolio holdings; more accurate but delayed
- **validation → strategy_required:** strategy_id present
- **validation → valid_type:** strategy_type in [bottom_up, top_down, factor, activist, stat_arb, event_driven]

## Success & failure scenarios

**✅ Success paths**

- **Implement Active Strategy** — when strategy_id exists; strategy_type in ["bottom_up","top_down","factor","activist","stat_arb","event_driven"], then call service; emit active_equity.strategy.implemented. _Why: Implement active equity strategy using specified approach._

**❌ Failure paths**

- **Invalid Strategy** — when strategy_type not_in ["bottom_up","top_down","factor","activist","stat_arb","event_driven"], then emit active_equity.strategy.rejected. _Why: Unsupported active equity strategy type._ *(error: `ACTIVE_EQUITY_INVALID_STRATEGY`)*

## Errors it can return

- `ACTIVE_EQUITY_INVALID_STRATEGY` — strategy_type must be one of the supported active equity strategies

## Events

**`active_equity.strategy.implemented`**
  Payload: `strategy_id`, `strategy_type`, `expected_alpha`, `active_risk`, `information_ratio`

**`active_equity.strategy.rejected`**
  Payload: `strategy_id`, `reason_code`

## Connects to

- **equity-portfolio-management-overview-l3** *(required)*
- **active-equity-portfolio-construction-l3** *(recommended)*

## Quality fitness 🟢 87/100

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
| AGI readiness | `████░` | 4/5 |
| Simplicity | `█████` | 5/5 |

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/trading/active-equity-strategies-l3/) · **Spec source:** [`active-equity-strategies-l3.blueprint.yaml`](./active-equity-strategies-l3.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
