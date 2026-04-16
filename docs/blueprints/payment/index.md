---
title: "Payment"
layout: default
parent: Blueprint Catalog
has_children: true
nav_order: 5
description: "Checkout, invoicing, POS, and financial transaction blueprints."
---

# Payment Blueprints

Checkout, invoicing, POS, and financial transaction blueprints.

| Blueprint | Description | Version |
|-----------|-------------|----------|
| [Cart Checkout]({{ site.baseurl }}/blueprints/payment/cart-checkout/) | Shopping cart and checkout flow with stock reservation, guest cart merge, multi-step checkout, tax, promo codes, and order placement. | 1.0.0 |
| [Cloud Emv Kernel]({{ site.baseurl }}/blueprints/payment/cloud-emv-kernel/) | Server-side EMV L2 kernel — processes SPoC-forwarded card data from thin-client terminals; handles chip/tap/stripe authorization, tokenisation, PIN verification | 1.0.0 |
| [Currency Conversion]({{ site.baseurl }}/blueprints/payment/currency-conversion/) | Convert amounts between currencies using live or cached exchange rates | 1.0.0 |
| [Dispute Management]({{ site.baseurl }}/blueprints/payment/dispute-management/) | Payment dispute and chargeback lifecycle — initiation, evidence collection, investigation, and resolution for PayShap and card transactions | 1.0.0 |
| [Driver Earnings Payouts]({{ site.baseurl }}/blueprints/payment/driver-earnings-payouts/) | Track driver earnings per trip, manage payout schedules, and process driver compensation | 1.0.0 |
| [Fraud Detection]({{ site.baseurl }}/blueprints/payment/fraud-detection/) | Real-time transaction fraud detection with risk scoring, velocity checks, anomaly detection, and auto-blocking for payment terminals | 1.0.0 |
| [Invoicing Payments]({{ site.baseurl }}/blueprints/payment/invoicing-payments/) | Invoicing and payment lifecycle: customer invoices, vendor bills, credit notes, receipts, payment registration, multi-currency, and follow-up.  | 1.0.0 |
| [Loyalty Coupons]({{ site.baseurl }}/blueprints/payment/loyalty-coupons/) | Loyalty and promotion engine supporting points, coupons, gift cards, discount codes, buy-X-get-Y offers, e-wallets, and next-order rewards.  | 1.0.0 |
| [Multi Currency Exchange]({{ site.baseurl }}/blueprints/payment/multi-currency-exchange/) | Manage exchange rates, perform multi-currency transactions, and revalue accounts for unrealized foreign exchange gains and losses | 1.0.0 |
| [Palm Pay]({{ site.baseurl }}/blueprints/payment/palm-pay/) | Palm vein biometric payment — link palm template to payment proxy for hands-free real-time payments | 1.0.0 |
| [Payment Methods]({{ site.baseurl }}/blueprints/payment/payment-methods/) | Saved payment methods with card tokenization, add/remove/set default, Luhn validation, expiry monitoring, and digital wallet support. | 1.0.0 |
| [Payment Processing]({{ site.baseurl }}/blueprints/payment/payment-processing/) | Process incoming, outgoing, and internal transfer payments with multi-currency support, reference allocation, and automatic reconciliation | 1.0.0 |
| [Pos Core]({{ site.baseurl }}/blueprints/payment/pos-core/) | Point-of-sale system managing sales sessions, product orders, payment processing, cash register operations, receipt generation, and accounting integration.  | 1.0.0 |
| [Pricing Rules Promotions]({{ site.baseurl }}/blueprints/payment/pricing-rules-promotions/) | Define and apply pricing rules, discount schemes, and promotional offers with priority-based conflict resolution, cumulative tracking, and free item support | 1.0.0 |
| [Rail Registry]({{ site.baseurl }}/blueprints/payment/rail-registry/) | Pluggable RailAdapter registry — admin API to add/swap rails, routing policy engine that selects a rail per payment by amount/region/merchant | 1.0.0 |
| [Refunds Returns]({{ site.baseurl }}/blueprints/payment/refunds-returns/) | Refund processing and return merchandise management with reason codes, approval workflow, partial/full refunds, and restocking. | 1.0.0 |
| [Sales Purchase Invoicing]({{ site.baseurl }}/blueprints/payment/sales-purchase-invoicing/) | Create, submit, and manage sales and purchase invoices with double-entry accounting, tax calculation, returns, and credit limit enforcement | 1.0.0 |
| [Shipping Calculation]({{ site.baseurl }}/blueprints/payment/shipping-calculation/) | Shipping rate calculation with zone-based pricing, dimensional weight, free shipping thresholds, carrier quotes, and delivery estimation. | 1.0.0 |
| [Subscription Billing]({{ site.baseurl }}/blueprints/payment/subscription-billing/) | Recurring subscription lifecycle with plan tiers, billing cycles, trials, proration, dunning retries, and cancellation handling. | 1.0.0 |
| [Terminal Enrollment]({{ site.baseurl }}/blueprints/payment/terminal-enrollment/) | At-terminal palm vein enrollment — walk-up registration with OTP verification and payment proxy linking | 1.0.0 |
| [Terminal Offline Queue]({{ site.baseurl }}/blueprints/payment/terminal-offline-queue/) | Offline transaction queuing for payment terminals — risk-limited queuing with automatic flush on reconnect | 1.0.0 |
| [Terminal Payment Flow]({{ site.baseurl }}/blueprints/payment/terminal-payment-flow/) | Payment terminal transaction orchestration — amount entry, method selection (palm or card), payment execution, and digital receipt delivery | 1.0.0 |
| [Terminal Thin Client]({{ site.baseurl }}/blueprints/payment/terminal-thin-client/) | Android thin-client payment terminal — base UI + palm-vein capture with on-device 1:N match + card reader SPoC passthrough + PGW API client; no rail SDKs or EMV kernel on-device | 1.0.0 |
| [Trip Billing Invoicing]({{ site.baseurl }}/blueprints/payment/trip-billing-invoicing/) | Calculate and manage trip-based billing, service rates, and invoice generation for completed deliveries | 1.0.0 |
