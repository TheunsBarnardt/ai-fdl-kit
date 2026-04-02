---
title: "Integration"
layout: default
parent: Blueprint Catalog
has_children: true
nav_order: 4
description: "External service and hardware integration blueprints."
---

# Integration Blueprints

External service and hardware integration blueprints.

| Blueprint | Description | Version |
|-----------|-------------|----------|
| [Blockradar Api]({{ site.baseurl }}/blueprints/integration/blockradar-api/) | Blockradar stablecoin wallet infrastructure API — multi-chain wallets, addresses, deposits, withdrawals, swaps, gateway, checkout, and fiat offramp | 1.0.0 |
| [Chp Account Management]({{ site.baseurl }}/blueprints/integration/chp-account-management/) | Account management services for CHP — account mirroring, PayShap proxy management, real-time account verification (AVS-R), and check digit verification (CDV) | 1.0.0 |
| [Chp Eft]({{ site.baseurl }}/blueprints/integration/chp-eft/) | Electronic Funds Transfer operations via Electrum's Clearing House Payments platform — inbound/outbound credits, debits, returns, on-us debits, payment cancellation, and system error correction (SEC) | 1.0.0 |
| [Chp Inbound Payments]({{ site.baseurl }}/blueprints/integration/chp-inbound-payments/) | Electrum CHP inbound payment processing — receiving RTC, PayShap, and EFT credit transfers and direct debits from the national payment system | 1.0.0 |
| [Chp Outbound Payments]({{ site.baseurl }}/blueprints/integration/chp-outbound-payments/) | Electrum Clearing House Payments — outbound payment operations including RTC, PayShap, CBPR+, EFT credit transfers, bulk payments, direct debits, returns, and cancellations | 1.0.0 |
| [Chp Request To Pay]({{ site.baseurl }}/blueprints/integration/chp-request-to-pay/) | PayShap Request-To-Pay (RTP) and refunds for Electrum Clearing House Payments — outbound/inbound RTP initiation, cancellation, and refund processing via the ZA_RPP scheme | 1.0.0 |
| [Palm Vein]({{ site.baseurl }}/blueprints/integration/palm-vein/) | Palm vein biometric integration with PVD300/PVM310 scanner for registration, feature extraction, and 1:N template matching | 1.0.0 |
| [Plugin Overrides]({{ site.baseurl }}/blueprints/integration/plugin-overrides/) | Extensible plugin architecture with 12 UI override points, wrapping composition, field type customization, and sidebar panels | 1.0.0 |
