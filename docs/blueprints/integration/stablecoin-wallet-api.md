---
title: "Stablecoin Wallet Api Blueprint"
layout: default
parent: "Integration"
grand_parent: Blueprint Catalog
description: "Stablecoin wallet infrastructure API — multi-chain wallets, addresses, deposits, withdrawals, swaps, gateway, checkout, and fiat offramp. 34 fields. 22 outcomes"
---

# Stablecoin Wallet Api Blueprint

> Stablecoin wallet infrastructure API — multi-chain wallets, addresses, deposits, withdrawals, swaps, gateway, checkout, and fiat offramp

| | |
|---|---|
| **Feature** | `stablecoin-wallet-api` |
| **Category** | Integration |
| **Version** | 1.0.0 |
| **Tags** | blockchain, stablecoin, crypto, wallet, api, payments, defi, fintech |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/integration/blockradar-api.blueprint.yaml) |
| **JSON API** | [stablecoin-wallet-api.json]({{ site.baseurl }}/api/blueprints/integration/stablecoin-wallet-api.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `client_application` | Client Application | system | The fintech application integrating with Blockradar via REST API |
| `wallet_platform` | Wallet Infrastructure Platform | external | Stablecoin wallet infrastructure that orchestrates multi-chain operations |
| `blockchain_network` | Blockchain Network | external | Underlying blockchain networks (Ethereum, BSC, Polygon, Base, Tron, Solana, etc.) |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `api_key` | token | Yes | API Key |  |
| `wallet_id` | token | Yes | Master Wallet ID |  |
| `blockchain` | text | Yes | Blockchain Network |  |
| `network` | select | Yes | Environment |  |
| `webhook_url` | url | Yes | Webhook URL |  |
| `address_id` | token | No | Address ID |  |
| `address` | text | No | Blockchain Address |  |
| `address_name` | text | No | Address Name |  |
| `disable_auto_sweep` | boolean | No | Disable Auto Sweep |  |
| `enable_gasless_withdraw` | boolean | No | Enable Gasless Withdraw |  |
| `show_private_key` | boolean | No | Show Private Key |  |
| `metadata` | json | No | Custom Metadata |  |
| `blockchain_id` | token | No | Blockchain UUID |  |
| `blockchain_slug` | text | No | Blockchain Slug |  |
| `is_evm_compatible` | boolean | No | EVM Compatible |  |
| `token_standard` | text | No | Token Standard |  |
| `derivation_path` | text | No | BIP44 Derivation Path |  |
| `wallet_status` | select | No | Wallet Status |  |
| `asset_id` | token | Yes | Asset ID |  |
| `amount` | text | Yes | Amount | Validations: required |
| `destination_address` | text | No | Destination Address |  |
| `reference` | text | No | Internal Reference |  |
| `note` | text | No | Note |  |
| `transaction_hash` | text | No | Transaction Hash |  |
| `currency` | select | No | Fiat Currency |  |
| `account_identifier` | text | No | Bank Account Number |  |
| `institution_identifier` | text | No | Bank/Institution Identifier |  |
| `gateway_balance` | number | No | Unified USDC Gateway Balance |  |
| `settlement_rule_name` | text | No | Settlement Rule Name |  |
| `slippage_tolerance` | text | No | Slippage Tolerance (%) |  |
| `settlement_order` | select | No | Execution Priority |  |
| `payment_link_id` | token | No | Payment Link ID |  |
| `payment_link_url` | url | No | Payment Link URL |  |
| `message` | text | No | Message to Sign | Validations: maxLength |

## States

**State field:** `transaction_status`

**Values:**

| State | Initial | Terminal |
|-------|---------|----------|
| `pending` | Yes |  |
| `processing` |  |  |
| `success` |  | Yes |
| `failed` |  | Yes |
| `incomplete` |  |  |
| `cancelled` |  | Yes |

**Transitions:**

| Name | From | To | Actor | Condition |
|------|------|----|-------|-----------|
|  | `pending` | `processing` | blockradar |  |
|  | `processing` | `success` | blockchain_network |  |
|  | `processing` | `failed` | blockchain_network |  |
|  | `pending` | `cancelled` | client_application |  |
|  | `processing` | `incomplete` | blockradar |  |

## Rules

- **authentication:**
  - **api_key_header:** x-api-key
  - **api_key_required:** All API operations require the x-api-key header
  - **separate_keys:** Use separate API keys for testnet and mainnet environments
- **wallets:**
  - **one_per_chain:** Only one Master Wallet per blockchain network per account
  - **environment_isolation:** Wallets created in live are isolated from test, and vice versa
  - **fund_native_token:** Master wallet must hold native blockchain tokens (ETH, BNB, MATIC, etc.) for gas fees
  - **evm_address_sharing:** Addresses from one EVM wallet can receive deposits on other EVM-compatible chains (isEvmCompatible: true)
- **auto_sweep:**
  - **default_enabled:** true
  - **default_threshold:** 0
  - **address_override:** Address-level settings override master wallet configuration
- **gasless:**
  - **default_enabled:** false
  - **threshold_operators:** gt, gte, lt, lte, eq
  - **address_override:** Address-level settings override master wallet configuration
- **withdrawals:**
  - **batch_max:** 20
  - **batch_min:** 1
  - **amount_positive:** Amount must be greater than 0
- **gateway:**
  - **usdc_only:** Gateway only supports USDC for cross-chain operations
  - **no_direct_transfer:** Do NOT send USDC directly to Gateway Wallet contract — permanent loss of funds
  - **finality_required:** Funds credited only after transaction reaches finality on source chain
- **virtual_accounts:**
  - **mainnet_only:** Virtual accounts are only available on MAINNET
  - **compliance_required:** Must complete Due Diligence Form before using virtual accounts
- **fiat_withdrawal:**
  - **compliance_ngn:** NGN requires Naira-only onboarding form
  - **compliance_african:** KES, TZS, UGX, MWK require African currencies partner onboarding
- **signing:**
  - **message_max_length:** 4096
  - **broadcast_retries:** 10
  - **broadcast_interval:** 5m
- **auto_settlement:**
  - **rule_isolation:** Rules are isolated per blockchain — a rule on Ethereum does NOT affect Base
  - **address_override:** Child address rules completely override master wallet rules (no merging)
- **webhooks:**
  - **retry_attempts:** 5
  - **retry_backoff:** 5 min → 80 min (total ~2h35m)
  - **signature_header:** x-blockradar-signature
  - **signature_algorithm:** HMAC-SHA512 using API key
  - **must_return_200:** Webhook endpoint must return HTTP 200 OK
  - **https_required:** HTTPS required for production (HTTP allowed for local testing)
- **security:**
  - **https_required:** All API requests must be made over HTTPS
  - **ssl_verification:** Do not set VERIFY_PEER to FALSE — ensure SSL connection is verified
  - **api_key_secret:** API keys must not be committed to git or used in client-side code
  - **api_key_per_wallet:** Each wallet has its own API key
  - **key_rotation:** Compromised API keys can be reset from the dashboard
  - **aml_screening:** New addresses are screened against OFAC sanctions list
  - **private_key_caution:** showPrivateKey exposes sensitive information — use only in secure environments
  - **non_custodial:** Blockradar never stores private keys — only encrypted seed phrases and derivation paths
  - **encryption:** AES-256-GCM with PBKDF2 key derivation, random IV, and authentication tags
  - **real_time_key_computation:** Private keys computed on-demand for signing, then immediately wiped from memory
  - **dual_seed_system:** Separate encrypted seed phrases for mainnet and testnet environments
  - **seed_backup_required:** Users must back up seed phrases immediately — if compromised, Blockradar cannot recover funds
  - **shared_responsibility:** Blockradar secures the platform; customer secures integration, API keys, and seed phrase backups
  - **vulnerability_reporting:** Report vulnerabilities to support@blockradar.co

## Outcomes

### Wallet_created (Priority: 1)

**Given:**
- Client is authenticated with valid API key
- No master wallet exists for the selected blockchain

**Then:**
- **call_service** target: `blockradar_api.create_wallet` — POST /v1/wallets — create master wallet for a blockchain
- **emit_event** event: `wallet.created`

**Result:** Master wallet created — ready to generate addresses and receive deposits

### Deposit_received (Priority: 2)

**Given:**
- Customer deposits stablecoins to a dedicated address
- Transaction is confirmed on the blockchain

**Then:**
- **emit_event** event: `deposit.success`
- **call_service** target: `auto_sweep` — Funds automatically swept to master wallet (if auto-sweep enabled)

**Result:** Deposit notification sent via webhook — client updates customer record

### Deposit_sweep_success (Priority: 3)

**Given:**
- Deposit was received at a child address
- Auto-sweep is enabled for this address
- Master wallet has sufficient native token for gas

**Then:**
- **emit_event** event: `deposit.swept.success`

**Result:** Deposited funds swept to master wallet

### Deposit_sweep_failed (Priority: 4) — Error: `DEPOSIT_SWEEP_FAILED`

**Given:**
- Auto-sweep is enabled but master wallet has insufficient native token for gas

**Then:**
- **emit_event** event: `deposit.swept.failed`

**Result:** Auto-sweep failed — fund master wallet with native tokens

### Address_created (Priority: 5)

**Given:**
- Client is authenticated
- Master wallet exists and is funded

**Then:**
- **call_service** target: `blockradar_api.create_address` — POST /v1/wallets/{walletId}/addresses
- **emit_event** event: `address.created`

**Result:** Dedicated address generated for customer — can receive deposits across EVM chains

### Address_whitelisted (Priority: 6)

**Given:**
- Client provides an external address to monitor

**Then:**
- **call_service** target: `blockradar_api.whitelist_address` — POST /v1/wallets/{walletId}/addresses/whitelist
- **emit_event** event: `address.whitelisted`

**Result:** External address whitelisted for deposit monitoring

### Withdrawal_success (Priority: 7)

**Given:**
- Client is authenticated
- Master wallet has sufficient stablecoin balance
- `amount` (input) gt `0`

**Then:**
- **call_service** target: `blockradar_api.withdraw` — POST /v1/wallets/{walletId}/withdraw
- **emit_event** event: `withdraw.success`

**Result:** Stablecoins sent to destination address and confirmed on blockchain

### Withdrawal_failed (Priority: 8) — Error: `WITHDRAWAL_FAILED`

**Given:**
- Withdrawal was initiated but failed on the blockchain

**Then:**
- **emit_event** event: `withdraw.failed`

**Result:** Withdrawal failed — check balance and destination address

### Batch_withdrawal (Priority: 9)

**Given:**
- Client provides array of 1-20 withdrawal recipients
- Master wallet has sufficient balance for total amount

**Then:**
- **call_service** target: `blockradar_api.batch_withdraw` — POST /v1/wallets/{walletId}/withdraw with assets[] array (max 20)

**Result:** Batch withdrawal queued — individual webhook notifications per recipient

### Fiat_withdrawal_success (Priority: 10) | Transaction: atomic

**Given:**
- Client is authenticated
- Compliance requirements met for target currency
- Bank account verified via institution-account-verification
- Quote obtained and accepted

**Then:**
- **call_service** target: `blockradar_api.withdraw_fiat_execute` — POST /v1/wallets/{walletId}/withdraw/fiat/execute
- **emit_event** event: `offramp.success`

**Result:** Stablecoins converted to fiat and sent to bank account

### Fiat_withdrawal_failed (Priority: 11) — Error: `OFFRAMP_FAILED`

**Given:**
- Fiat withdrawal was initiated but failed

**Then:**
- **emit_event** event: `offramp.failed`

**Result:** Fiat withdrawal failed

### Gateway_deposit_success (Priority: 12)

**Given:**
- Client is authenticated
- Wallet is on a Gateway-supported chain
- Wallet has USDC balance

**Then:**
- **call_service** target: `blockradar_api.gateway_deposit` — POST /v1/wallets/{walletId}/gateway/deposit
- **emit_event** event: `gateway.deposit.success`

**Result:** USDC deposited to unified Gateway balance (after chain finality)

### Gateway_withdraw_success (Priority: 13)

**Given:**
- Client has sufficient Gateway USDC balance
- Destination chain is supported

**Then:**
- **call_service** target: `blockradar_api.gateway_withdraw` — POST /v1/wallets/{walletId}/gateway/withdraw
- **emit_event** event: `gateway.withdraw.success`

**Result:** USDC minted and withdrawn on destination chain

### Payment_link_created (Priority: 14)

**Given:**
- Client is authenticated
- Master wallet exists

**Then:**
- **call_service** target: `blockradar_api.create_payment_link` — POST /v1/wallets/{walletId}/payment-links
- **emit_event** event: `checkout.link_created`

**Result:** Shareable payment link generated — customers can pay via stablecoins

### Auto_settlement_executed (Priority: 15)

**Given:**
- Deposit matches an active auto-settlement rule
- Amount is within rule's min/max thresholds

**Then:**
- **call_service** target: `blockradar_api.auto_settle` — Automatic swap to destination asset on destination chain
- **emit_event** event: `swap.success`

**Result:** Deposit automatically converted and routed to destination chain

### Swap_success (Priority: 16)

**Given:**
- Client is authenticated
- Source asset balance is sufficient
- Swap quote obtained

**Then:**
- **call_service** target: `blockradar_api.execute_swap` — POST /v1/wallets/{walletId}/swap
- **emit_event** event: `swap.success`

**Result:** Asset swap executed successfully

### Message_signed (Priority: 17)

**Given:**
- Client is authenticated
- `message` (input) exists

**Then:**
- **call_service** target: `blockradar_api.sign_message` — POST /v1/wallets/{walletId}/signing/message
- **emit_event** event: `signed.success`

**Result:** Message signed with wallet's private key

### Transaction_broadcast (Priority: 18)

**Given:**
- Client provides raw transaction data

**Then:**
- **call_service** target: `blockradar_api.sign_and_broadcast` — POST /v1/wallets/{walletId}/signing/broadcast
- **emit_event** event: `signed.success`

**Result:** Transaction signed and broadcast — retries up to 10x at 5-min intervals

### Asset_recovered (Priority: 19)

**Given:**
- Assets were sent to correct address on wrong blockchain
- Client provides sender/recipient addresses and blockchain

**Then:**
- **call_service** target: `blockradar_api.salvage` — POST /v1/wallets/{walletId}/salvage
- **emit_event** event: `salvage.success`

**Result:** Stuck assets recovered and transferred to recipient address

### Deposit_rescanned (Priority: 20)

**Given:**
- Client has a transaction hash for a missing deposit

**Then:**
- **call_service** target: `blockradar_api.rescan_blocks` — POST /v1/wallets/{walletId}/rescan/blocks

**Result:** Blockchain rescanned — missing deposit webhook will be sent if found

### Webhook_verified (Priority: 21)

**Given:**
- Webhook received with x-blockradar-signature header
- HMAC-SHA512 of request body using API key matches signature

**Then:**
- Process the webhook event

**Result:** Webhook origin verified as Blockradar — safe to process

### Webhook_signature_invalid (Priority: 22) — Error: `WEBHOOK_SIGNATURE_INVALID`

**Given:**
- Webhook received but signature does not match

**Then:**
- Reject the webhook

**Result:** Webhook rejected — potential tampering or misconfiguration

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `BLOCKRADAR_AUTH_FAILED` | 401 | Invalid or missing API key | No |
| `BLOCKRADAR_VALIDATION_ERROR` | 400 | A validation or client-side error occurred | No |
| `BLOCKRADAR_NOT_FOUND` | 404 | Requested resource does not exist | No |
| `BLOCKRADAR_SERVER_ERROR` | 500 | An internal error occurred on Blockradar's end | Yes |
| `BLOCKRADAR_WALLET_EXISTS` | 409 | A master wallet already exists for this blockchain | No |
| `BLOCKRADAR_INSUFFICIENT_BALANCE` | 422 | Insufficient balance for this operation | No |
| `BLOCKRADAR_INSUFFICIENT_GAS` | 422 | Master wallet needs native tokens for gas fees | No |
| `WITHDRAWAL_FAILED` | 422 | Withdrawal failed to execute on the blockchain | Yes |
| `DEPOSIT_SWEEP_FAILED` | 422 | Auto-sweep failed — fund master wallet with native tokens | Yes |
| `OFFRAMP_FAILED` | 422 | Fiat withdrawal failed | Yes |
| `GATEWAY_DIRECT_TRANSFER` | 400 | Do not send USDC directly to Gateway contract — use the API | No |
| `BATCH_SIZE_EXCEEDED` | 400 | Batch withdrawal cannot exceed 20 recipients | No |
| `VIRTUAL_ACCOUNT_TESTNET` | 400 | Virtual accounts are only available on mainnet | No |
| `WEBHOOK_SIGNATURE_INVALID` | 403 | Webhook signature verification failed | No |
| `SWAP_FAILED` | 422 | Swap transaction failed | Yes |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `deposit.success` | Deposit confirmed on the blockchain | `wallet_id`, `address_id`, `amount`, `asset_id`, `transaction_hash`, `metadata` |
| `deposit.processing` | Deposit detected, awaiting confirmation | `wallet_id`, `address_id`, `amount`, `asset_id` |
| `deposit.failed` | Deposit failed to be processed | `wallet_id`, `address_id`, `error_code` |
| `deposit.swept.success` | Funds auto-swept from child address to master wallet | `wallet_id`, `address_id`, `amount`, `transaction_hash` |
| `deposit.swept.failed` | Auto-sweep failed (likely insufficient gas) | `wallet_id`, `address_id`, `error_code` |
| `withdraw.success` | Withdrawal confirmed on blockchain | `wallet_id`, `amount`, `asset_id`, `destination_address`, `transaction_hash` |
| `withdraw.failed` | Withdrawal failed | `wallet_id`, `error_code` |
| `offramp.processing` | Fiat withdrawal being processed | `wallet_id`, `amount`, `currency` |
| `offramp.success` | Fiat withdrawal completed | `wallet_id`, `amount`, `currency`, `institution_identifier` |
| `offramp.failed` | Fiat withdrawal failed | `wallet_id`, `error_code` |
| `gateway.deposit.success` | USDC deposited to Gateway unified balance | `wallet_id`, `amount`, `source_chain` |
| `gateway.withdraw.success` | USDC withdrawn from Gateway to destination chain | `wallet_id`, `amount`, `destination_chain` |
| `swap.success` | Asset swap executed successfully | `wallet_id`, `from_asset`, `to_asset`, `amount` |
| `swap.failed` | Swap transaction failed | `wallet_id`, `error_code` |
| `signed.success` | Transaction signed and broadcast successfully | `wallet_id`, `transaction_hash` |
| `signed.failed` | Transaction broadcast failed after all retries | `wallet_id`, `error_code` |
| `salvage.success` | Asset recovery completed | `wallet_id`, `amount`, `blockchain` |
| `salvage.failed` | Asset recovery failed | `wallet_id`, `error_code` |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
api:
  base_url: https://api.blockradar.co/v1
  auth:
    method: API Key
    header: x-api-key
    scope: per-wallet
  content_type: application/json
  postman_collection: https://documenter.getpostman.com/view/7709133/2s93eSYaVs
  github: https://github.com/blockradar
  response_format:
    statusCode: number — request status code
    message: string — summary of response
    data: object|array — results of the request
    meta: object — pagination info (totalItems, itemCount, itemsPerPage, totalPages,
      currentPage)
  pagination:
    default_page_size: 100
    default_page: 1
  environments:
    testnet: Test environment with faucet tokens
    mainnet: Live environment with real assets
  supported_blockchains:
    evm:
      - ethereum
      - bsc
      - polygon
      - base
      - arbitrum
      - optimism
      - celo
      - lisk
      - avalanche
    non_evm:
      - tron
      - solana
    additional:
      - asset-chain
      - plasma
      - arc
      - tempo
  supported_stablecoins:
    - USDT
    - USDC
    - DAI
    - BUSD
    - cUSD
    - cNGN
    - EURC
    - IDRX
    - ZARP
    - JPYC
    - AlphaUSD
  webhook_signature: HMAC-SHA512 via x-blockradar-signature header
  total_endpoints: 127
security:
  architecture: Non-custodial — private keys never stored, only encrypted seed phrases
  encryption: Custom AES-256-GCM with PBKDF2 key derivation
  key_computation: Real-time on-demand — computed for signing, immediately wiped
  seed_system: Dual encrypted seeds (mainnet/testnet) per business account
  compliance:
    - SOC2
    - ISO27001
    - PCI-DSS
    - GDPR
  aml_provider: OFAC sanctions screening on address creation
  disaster_recovery: Geo-distributed encrypted backups + user-exportable seed phrases
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Stablecoin Wallet Api Blueprint",
  "description": "Stablecoin wallet infrastructure API — multi-chain wallets, addresses, deposits, withdrawals, swaps, gateway, checkout, and fiat offramp. 34 fields. 22 outcomes",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "blockchain, stablecoin, crypto, wallet, api, payments, defi, fintech"
}
</script>
