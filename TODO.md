# FDL Extraction Backlog

Sources queued for blueprint extraction via `/fdl-extract-web` or `/fdl-extract-code`.

## Financial / Trading → `trading`

| #   | Source                         | Type | URL                                                                                    | Status  |
| --- | ------------------------------ | ---- | -------------------------------------------------------------------------------------- | ------- |
| 1   | JSE Market Data Docs           | Web  | https://clientportal.jse.co.za/technical-library/market-data-documentation             | Pending |
| 2   | JSE Trading & Market Data Docs | Web  | https://clientportal.jse.co.za/technical-library/trading-and-market-data-documentation | Pending |
| 3   | QuickFIX                       | Code | https://github.com/quickfix/quickfix                                                   | Pending |
| 4   | QuantConnect Lean              | Code | https://github.com/QuantConnect/Lean                                                   | Pending |
| 5   | CCXT                           | Code | https://github.com/ccxt/ccxt                                                           | Pending |

## AI / ML Frameworks → `ai`

| #   | Source                    | Type | URL                                         | Status  |
| --- | ------------------------- | ---- | ------------------------------------------- | ------- |
| 6   | TensorFlow                | Code | https://github.com/tensorflow/tensorflow    | DONE    |
| 7   | PyTorch                   | Code | https://github.com/pytorch/pytorch          | DONE    |
| 8   | Megatron-LM               | Code | https://github.com/NVIDIA/Megatron-LM       | Pending |
| 9   | TensorRT-LLM              | Code | https://github.com/NVIDIA/TensorRT-LLM      | Pending |
| 10  | Hugging Face Transformers | Code | https://github.com/huggingface/transformers | Pending |
| 11  | LangChain                 | Code | https://github.com/langchain-ai/langchain   | Pending |

## AI / ML Ops → `ai`

| #   | Source | Type | URL                                | Status  |
| --- | ------ | ---- | ---------------------------------- | ------- |
| 12  | MLflow | Code | https://github.com/mlflow/mlflow   | Pending |
| 13  | Ray    | Code | https://github.com/ray-project/ray | Pending |

## Infrastructure / Platform → `infrastructure`

| #   | Source         | Type | URL                                      | Status  |
| --- | -------------- | ---- | ---------------------------------------- | ------- |
| 14  | NVIDIA AIStore | Code | https://github.com/NVIDIA/aistore        | Pending |
| 15  | Supabase       | Code | https://github.com/supabase/supabase     | Pending |
| 16  | Kubernetes     | Code | https://github.com/kubernetes/kubernetes | Pending |
| 17  | Terraform      | Code | https://github.com/hashicorp/terraform   | Pending |
| 18  | Apache Kafka   | Code | https://github.com/apache/kafka          | Pending |
| 19  | Redis          | Code | https://github.com/redis/redis           | Pending |

## Auth / Identity → `auth`

| #   | Source    | Type | URL                                  | Status  |
| --- | --------- | ---- | ------------------------------------ | ------- |
| 20  | Keycloak  | Code | https://github.com/keycloak/keycloak | Pending |
| 21  | Ory Hydra | Code | https://github.com/ory/hydra         | Pending |

## Observability → `observability`

| #   | Source                    | Type | URL                                                       | Status  |
| --- | ------------------------- | ---- | --------------------------------------------------------- | ------- |
| 22  | Grafana                   | Code | https://github.com/grafana/grafana                        | Pending |
| 23  | OpenTelemetry Collector   | Code | https://github.com/open-telemetry/opentelemetry-collector | Pending |
| 24  | Elasticsearch (ELK Stack) | Code | https://github.com/elastic/elasticsearch                  | Pending |
| 25  | Grafana Loki              | Code | https://github.com/grafana/loki                           | Pending |
| 26  | Fluentd                   | Code | https://github.com/fluent/fluentd                         | Pending |
| 27  | Vector                    | Code | https://github.com/vectordotdev/vector                    | Pending |

## Edge Computing / CDN → `infrastructure`

| #   | Source        | Type | URL                                           | Status  |
| --- | ------------- | ---- | --------------------------------------------- | ------- |
| 28  | Envoy Proxy   | Code | https://github.com/envoyproxy/envoy           | Pending |
| 29  | Varnish Cache | Code | https://github.com/varnishcache/varnish-cache | Pending |
| 30  | OpenResty     | Code | https://github.com/openresty/openresty        | Pending |
| 31  | Caddy         | Code | https://github.com/caddyserver/caddy          | Pending |

---

## Legend

- **Type**: `Web` = extract via `/fdl-extract-web`, `Code` = extract via `/fdl-extract-code` or `/fdl-extract-code-feature`
- **Status**: `Pending` | `In Progress` | `Done`
- **Category**: shown after `→` in each section header — maps to `category:` in blueprint schema
