---
title: "Digital Assets Investments Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Evaluate digital assets on distributed ledgers using proof-of-work or proof-of-stake consensus — crypto, tokens, stablecoins, NFTs — and their investment featur"
---

# Digital Assets Investments Blueprint

> Evaluate digital assets on distributed ledgers using proof-of-work or proof-of-stake consensus — crypto, tokens, stablecoins, NFTs — and their investment features

| | |
|---|---|
| **Feature** | `digital-assets-investments` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | digital-assets, cryptocurrency, distributed-ledger, proof-of-work, proof-of-stake, cfa-level-1 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/digital-assets-investments.blueprint.yaml) |
| **JSON API** | [digital-assets-investments.json]({{ site.baseurl }}/api/blueprints/trading/digital-assets-investments.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `digital_analyst` | Digital Asset Analyst | system |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `asset_id` | text | Yes | Digital asset identifier |  |
| `asset_type` | select | Yes | cryptocurrency \| utility_token \| security_token \| stablecoin \| nft |  |
| `consensus_mechanism` | select | No | proof_of_work \| proof_of_stake \| delegated_pos \| other |  |

## Rules

- **distributed_ledger:**
  - **definition:** Shared, cryptographically secured database distributed across nodes
  - **permissioned_vs_permissionless:** Permissionless (public) supports open participation; permissioned restricts to vetted participants
- **consensus_mechanisms:**
  - **proof_of_work:** Miners solve puzzles; high energy use; Bitcoin
  - **proof_of_stake:** Validators stake tokens; energy-efficient; Ethereum post-merge
  - **delegated_pos:** Token holders elect validators
- **digital_asset_types:**
  - **cryptocurrency:** Native tokens of blockchains; medium of exchange, store of value
  - **utility_token:** Access to network services
  - **security_token:** Tokenised traditional securities; subject to securities law
  - **stablecoin:** Pegged to fiat or basket; collateralised or algorithmic
  - **nft:** Non-fungible; unique digital asset representation
- **investment_features:**
  - **high_volatility:** Large drawdowns; weak fundamentals anchor
  - **correlation:** Historically low, rising with institutional adoption
  - **custody_risk:** Private-key loss is permanent; exchange counterparty risk
  - **regulatory_uncertainty:** Evolving treatment across jurisdictions
- **access_routes:**
  - **direct:** Self-custody or exchange holdings
  - **etfs_and_funds:** Spot and futures-based products
  - **equity_proxies:** Miners and exchanges as indirect exposure
- **validation:**
  - **asset_required:** asset_id present
  - **valid_type:** asset_type in allowed set

## Outcomes

### Analyse_digital_asset (Priority: 1)

_Analyse digital-asset investment_

**Given:**
- `asset_id` (input) exists
- `asset_type` (input) in `cryptocurrency,utility_token,security_token,stablecoin,nft`

**Then:**
- **call_service** target: `digital_analyst`
- **emit_event** event: `digital.analysed`

### Invalid_type (Priority: 10) — Error: `DIGITAL_INVALID_TYPE`

_Unsupported asset type_

**Given:**
- `asset_type` (input) not_in `cryptocurrency,utility_token,security_token,stablecoin,nft`

**Then:**
- **emit_event** event: `digital.analysis_rejected`

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `DIGITAL_INVALID_TYPE` | 400 | asset_type must be cryptocurrency, utility_token, security_token, stablecoin, or nft | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `digital.analysed` |  | `asset_id`, `asset_type`, `consensus_mechanism`, `risk_profile` |
| `digital.analysis_rejected` |  | `asset_id`, `reason_code` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| alt-investments-features-categories | required |  |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Digital Assets Investments Blueprint",
  "description": "Evaluate digital assets on distributed ledgers using proof-of-work or proof-of-stake consensus — crypto, tokens, stablecoins, NFTs — and their investment featur",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "digital-assets, cryptocurrency, distributed-ledger, proof-of-work, proof-of-stake, cfa-level-1"
}
</script>
