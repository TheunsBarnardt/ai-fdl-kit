---
title: "Trading"
layout: default
parent: Blueprint Catalog
has_children: true
nav_order: 99
description: "Trading blueprints."
---

# Trading Blueprints

Trading blueprints.

| Blueprint | Description | Version |
|-----------|-------------|----------|
| [Fix Message Building]({{ site.baseurl }}/blueprints/trading/fix-message-building/) | Constructs, parses, and serializes FIX protocol messages with header, body, and trailer sections; supports repeating field groups and multi-version validation | 1.0.0 |
| [Fix Protocol Validation]({{ site.baseurl }}/blueprints/trading/fix-protocol-validation/) | Validates FIX messages against version-specific DataDictionary specifications; enforces field presence, type correctness, value ranges, repeating group structure, and message completeness | 1.0.0 |
| [Fix Session Management]({{ site.baseurl }}/blueprints/trading/fix-session-management/) | Manages stateful FIX protocol sessions including logon/logout lifecycle, heartbeat monitoring, sequence number integrity, and time-window enforcement | 1.0.0 |
| [Market Data Feeds]({{ site.baseurl }}/blueprints/trading/market-data-feeds/) | Consume and distribute real-time and delayed market data including pricing, indices, commodities, forex, and trade feeds from multiple providers | 1.0.0 |
