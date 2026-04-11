<!-- AUTO-GENERATED FROM blockradar-api.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Stablecoin Wallet Api

> Stablecoin wallet infrastructure API — multi-chain wallets, addresses, deposits, withdrawals, swaps, gateway, checkout, and fiat offramp

**Category:** Integration · **Version:** 1.0.0 · **Tags:** blockchain · stablecoin · crypto · wallet · api · payments · defi · fintech

## What this does

Stablecoin wallet infrastructure API — multi-chain wallets, addresses, deposits, withdrawals, swaps, gateway, checkout, and fiat offramp

Specifies 22 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **api_key** *(token, required)* — API Key
- **wallet_id** *(token, required)* — Master Wallet ID
- **blockchain** *(text, required)* — Blockchain Network
- **network** *(select, required)* — Environment
- **webhook_url** *(url, required)* — Webhook URL
- **address_id** *(token, optional)* — Address ID
- **address** *(text, optional)* — Blockchain Address
- **address_name** *(text, optional)* — Address Name
- **disable_auto_sweep** *(boolean, optional)* — Disable Auto Sweep
- **enable_gasless_withdraw** *(boolean, optional)* — Enable Gasless Withdraw
- **show_private_key** *(boolean, optional)* — Show Private Key
- **metadata** *(json, optional)* — Custom Metadata
- **blockchain_id** *(token, optional)* — Blockchain UUID
- **blockchain_slug** *(text, optional)* — Blockchain Slug
- **is_evm_compatible** *(boolean, optional)* — EVM Compatible
- **token_standard** *(text, optional)* — Token Standard
- **derivation_path** *(text, optional)* — BIP44 Derivation Path
- **wallet_status** *(select, optional)* — Wallet Status
- **asset_id** *(token, required)* — Asset ID
- **amount** *(text, required)* — Amount
- **destination_address** *(text, optional)* — Destination Address
- **reference** *(text, optional)* — Internal Reference
- **note** *(text, optional)* — Note
- **transaction_hash** *(text, optional)* — Transaction Hash
- **currency** *(select, optional)* — Fiat Currency
- **account_identifier** *(text, optional)* — Bank Account Number
- **institution_identifier** *(text, optional)* — Bank/Institution Identifier
- **gateway_balance** *(number, optional)* — Unified USDC Gateway Balance
- **settlement_rule_name** *(text, optional)* — Settlement Rule Name
- **slippage_tolerance** *(text, optional)* — Slippage Tolerance (%)
- **settlement_order** *(select, optional)* — Execution Priority
- **payment_link_id** *(token, optional)* — Payment Link ID
- **payment_link_url** *(url, optional)* — Payment Link URL
- **message** *(text, optional)* — Message to Sign

## What must be true

- **authentication → api_key_header:** x-api-key
- **authentication → api_key_required:** All API operations require the x-api-key header
- **authentication → separate_keys:** Use separate API keys for testnet and mainnet environments
- **wallets → one_per_chain:** Only one Master Wallet per blockchain network per account
- **wallets → environment_isolation:** Wallets created in live are isolated from test, and vice versa
- **wallets → fund_native_token:** Master wallet must hold native blockchain tokens (ETH, BNB, MATIC, etc.) for gas fees
- **wallets → evm_address_sharing:** Addresses from one EVM wallet can receive deposits on other EVM-compatible chains (isEvmCompatible: true)
- **auto_sweep → default_enabled:** true
- **auto_sweep → default_threshold:** 0
- **auto_sweep → address_override:** Address-level settings override master wallet configuration
- **gasless → default_enabled:** false
- **gasless → threshold_operators:** gt, gte, lt, lte, eq
- **gasless → address_override:** Address-level settings override master wallet configuration
- **withdrawals → batch_max:** 20
- **withdrawals → batch_min:** 1
- **withdrawals → amount_positive:** Amount must be greater than 0
- **gateway → usdc_only:** Gateway only supports USDC for cross-chain operations
- **gateway → no_direct_transfer:** Do NOT send USDC directly to Gateway Wallet contract — permanent loss of funds
- **gateway → finality_required:** Funds credited only after transaction reaches finality on source chain
- **virtual_accounts → mainnet_only:** Virtual accounts are only available on MAINNET
- **virtual_accounts → compliance_required:** Must complete Due Diligence Form before using virtual accounts
- **fiat_withdrawal → compliance_ngn:** NGN requires Naira-only onboarding form
- **fiat_withdrawal → compliance_african:** KES, TZS, UGX, MWK require African currencies partner onboarding
- **signing → message_max_length:** 4096
- **signing → broadcast_retries:** 10
- **signing → broadcast_interval:** 5m
- **auto_settlement → rule_isolation:** Rules are isolated per blockchain — a rule on Ethereum does NOT affect Base
- **auto_settlement → address_override:** Child address rules completely override master wallet rules (no merging)
- **webhooks → retry_attempts:** 5
- **webhooks → retry_backoff:** 5 min → 80 min (total ~2h35m)
- **webhooks → signature_header:** x-blockradar-signature
- **webhooks → signature_algorithm:** HMAC-SHA512 using API key
- **webhooks → must_return_200:** Webhook endpoint must return HTTP 200 OK
- **webhooks → https_required:** HTTPS required for production (HTTP allowed for local testing)
- **security → https_required:** All API requests must be made over HTTPS
- **security → ssl_verification:** Do not set VERIFY_PEER to FALSE — ensure SSL connection is verified
- **security → api_key_secret:** API keys must not be committed to git or used in client-side code
- **security → api_key_per_wallet:** Each wallet has its own API key
- **security → key_rotation:** Compromised API keys can be reset from the dashboard
- **security → aml_screening:** New addresses are screened against OFAC sanctions list
- **security → private_key_caution:** showPrivateKey exposes sensitive information — use only in secure environments
- **security → non_custodial:** Blockradar never stores private keys — only encrypted seed phrases and derivation paths
- **security → encryption:** AES-256-GCM with PBKDF2 key derivation, random IV, and authentication tags
- **security → real_time_key_computation:** Private keys computed on-demand for signing, then immediately wiped from memory
- **security → dual_seed_system:** Separate encrypted seed phrases for mainnet and testnet environments
- **security → seed_backup_required:** Users must back up seed phrases immediately — if compromised, Blockradar cannot recover funds
- **security → shared_responsibility:** Blockradar secures the platform; customer secures integration, API keys, and seed phrase backups
- **security → vulnerability_reporting:** Report vulnerabilities to support@blockradar.co

## Success & failure scenarios

**✅ Success paths**

- **Wallet Created** — when Client is authenticated with valid API key; No master wallet exists for the selected blockchain, then Master wallet created — ready to generate addresses and receive deposits.
- **Deposit Received** — when Customer deposits stablecoins to a dedicated address; Transaction is confirmed on the blockchain, then Deposit notification sent via webhook — client updates customer record.
- **Deposit Sweep Success** — when Deposit was received at a child address; Auto-sweep is enabled for this address; Master wallet has sufficient native token for gas, then Deposited funds swept to master wallet.
- **Address Created** — when Client is authenticated; Master wallet exists and is funded, then Dedicated address generated for customer — can receive deposits across EVM chains.
- **Address Whitelisted** — when Client provides an external address to monitor, then External address whitelisted for deposit monitoring.
- **Withdrawal Success** — when Client is authenticated; Master wallet has sufficient stablecoin balance; Withdrawal amount is positive, then Stablecoins sent to destination address and confirmed on blockchain.
- **Batch Withdrawal** — when Client provides array of 1-20 withdrawal recipients; Master wallet has sufficient balance for total amount, then Batch withdrawal queued — individual webhook notifications per recipient.
- **Fiat Withdrawal Success** — when Client is authenticated; Compliance requirements met for target currency; Bank account verified via institution-account-verification; Quote obtained and accepted, then Stablecoins converted to fiat and sent to bank account.
- **Gateway Deposit Success** — when Client is authenticated; Wallet is on a Gateway-supported chain; Wallet has USDC balance, then USDC deposited to unified Gateway balance (after chain finality).
- **Gateway Withdraw Success** — when Client has sufficient Gateway USDC balance; Destination chain is supported, then USDC minted and withdrawn on destination chain.
- **Payment Link Created** — when Client is authenticated; Master wallet exists, then Shareable payment link generated — customers can pay via stablecoins.
- **Auto Settlement Executed** — when Deposit matches an active auto-settlement rule; Amount is within rule's min/max thresholds, then Deposit automatically converted and routed to destination chain.
- **Swap Success** — when Client is authenticated; Source asset balance is sufficient; Swap quote obtained, then Asset swap executed successfully.
- **Message Signed** — when Client is authenticated; Message to sign is provided, then Message signed with wallet's private key.
- **Transaction Broadcast** — when Client provides raw transaction data, then Transaction signed and broadcast — retries up to 10x at 5-min intervals.
- **Asset Recovered** — when Assets were sent to correct address on wrong blockchain; Client provides sender/recipient addresses and blockchain, then Stuck assets recovered and transferred to recipient address.
- **Deposit Rescanned** — when Client has a transaction hash for a missing deposit, then Blockchain rescanned — missing deposit webhook will be sent if found.
- **Webhook Verified** — when Webhook received with x-blockradar-signature header; HMAC-SHA512 of request body using API key matches signature, then Webhook origin verified as Blockradar — safe to process.

**❌ Failure paths**

- **Deposit Sweep Failed** — when Auto-sweep is enabled but master wallet has insufficient native token for gas, then Auto-sweep failed — fund master wallet with native tokens. *(error: `DEPOSIT_SWEEP_FAILED`)*
- **Withdrawal Failed** — when Withdrawal was initiated but failed on the blockchain, then Withdrawal failed — check balance and destination address. *(error: `WITHDRAWAL_FAILED`)*
- **Fiat Withdrawal Failed** — when Fiat withdrawal was initiated but failed, then Fiat withdrawal failed. *(error: `OFFRAMP_FAILED`)*
- **Webhook Signature Invalid** — when Webhook received but signature does not match, then Webhook rejected — potential tampering or misconfiguration. *(error: `WEBHOOK_SIGNATURE_INVALID`)*

## Errors it can return

- `BLOCKRADAR_AUTH_FAILED` — Invalid or missing API key
- `BLOCKRADAR_VALIDATION_ERROR` — A validation or client-side error occurred
- `BLOCKRADAR_NOT_FOUND` — Requested resource does not exist
- `BLOCKRADAR_SERVER_ERROR` — An internal error occurred on Blockradar's end
- `BLOCKRADAR_WALLET_EXISTS` — A master wallet already exists for this blockchain
- `BLOCKRADAR_INSUFFICIENT_BALANCE` — Insufficient balance for this operation
- `BLOCKRADAR_INSUFFICIENT_GAS` — Master wallet needs native tokens for gas fees
- `WITHDRAWAL_FAILED` — Withdrawal failed to execute on the blockchain
- `DEPOSIT_SWEEP_FAILED` — Auto-sweep failed — fund master wallet with native tokens
- `OFFRAMP_FAILED` — Fiat withdrawal failed
- `GATEWAY_DIRECT_TRANSFER` — Do not send USDC directly to Gateway contract — use the API
- `BATCH_SIZE_EXCEEDED` — Batch withdrawal cannot exceed 20 recipients
- `VIRTUAL_ACCOUNT_TESTNET` — Virtual accounts are only available on mainnet
- `WEBHOOK_SIGNATURE_INVALID` — Webhook signature verification failed
- `SWAP_FAILED` — Swap transaction failed

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/integration/stablecoin-wallet-api/) · **Spec source:** [`stablecoin-wallet-api.blueprint.yaml`](./stablecoin-wallet-api.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
