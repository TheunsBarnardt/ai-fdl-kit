# Ride-Hailing (Uber-like) — FDL Extraction Plan

A strategic plan for building a complete ride-hailing platform (rider app + driver app + dispatch backend) by extracting from open-source repos. Builds on top of `tracking.md` and `messaging.md` — don't re-extract features already covered there.

## Extraction order

Run these in order. Assumes you've already extracted the tracking and messaging stacks.

```bash
# 1. Fleet operations core — already in tracking.md
# If not yet extracted:
/fdl-extract-code-feature https://github.com/fleetbase/fleetbase

# 2. Classic rider/driver taxi flow (archived but patterns are gold)
/fdl-extract-code-feature https://github.com/ro31337/libretaxi

# 3. Payments, wallet, payouts, refunds
/fdl-extract-code-feature https://github.com/medusajs/medusa

# 4. Driver KYC / identity verification / document upload
/fdl-extract-code-feature https://github.com/ory/kratos

# 5. Support tickets, disputes, live chat to ops
/fdl-extract-code-feature https://github.com/chatwoot/chatwoot

# 6. Route optimization & ETAs — already in tracking.md
# /fdl-extract-code-feature https://github.com/VROOM-Project/vroom
```

`/fdl-auto-evolve` will run automatically after each extraction to validate, generate docs, and commit.

---

## 1. Fleetbase — Ride-hailing dispatch core

**Repo:** `https://github.com/fleetbase/fleetbase`
**Strength:** The closest open-source equivalent to an Uber backend. Dispatch, orders, drivers, real-time tracking, customer app, webhooks — all built for on-demand services.

Features to select:

 1. Ride request lifecycle (requested → accepted → arriving → in_progress → completed)
 2. Driver assignment and dispatch
 3. Real-time driver location streaming
 4. Customer (rider) app flow
 5. Driver app flow with accept/reject
 6. ETA calculation (to pickup, to drop-off)
 7. Order / trip state machine
 8. Webhook events for trip lifecycle
 9. Multi-tenant organization model
10. Public API for rider and driver apps
11. Fleet registry and vehicle types
12. Service zones / operational areas
13. Driver shift management
14. Trip history per rider and driver
15. Proof of pickup / drop-off (photo, signature)

---

## 2. LibreTaxi — Rider/driver flow, bidding, fare negotiation

**Repo:** `https://github.com/ro31337/libretaxi`
**Status:** Archived but still extractable — classic patterns.
**Strength:** Rider/driver split app, decentralized (no middleman), fare bidding. Unique patterns you won't find in Fleetbase.

Features to select:

 1. Rider request with destination and fare suggestion
 2. Driver bidding / fare negotiation
 3. Driver accept/decline with counter-offer
 4. Direct rider ↔ driver connection (no dispatcher)
 5. Minimal / privacy-preserving location sharing
 6. Trip start and end confirmation (both sides)
 7. Post-trip dual rating (rider ↔ driver)
 8. Cancellation flow with reason codes
 9. Favourite places (home, work quick-pick)
10. Language selection per user
11. Rider-to-driver simple text chat
12. Driver availability toggle (online/offline)

---

## 3. Medusa — Payments, wallet, payouts, refunds

**Repo:** `https://github.com/medusajs/medusa`
**Strength:** Modern Node.js commerce engine. The **money-flow primitives** are the same as ride-hailing even though it's an e-commerce platform.

Features to select:

 1. Customer wallet / store credit
 2. Payment session and authorization
 3. Multi-payment-method support (card, wallet, cash)
 4. Partial capture and refund
 5. Order total calculation with line items (fare, tips, tolls, surge)
 6. Tax calculation per region
 7. Discount / promotion codes
 8. Gift cards (for rider credit)
 9. Multi-currency support
10. Payout to third parties (driver earnings)
11. Transaction history and receipts
12. Dispute / chargeback handling
13. Price list per region / customer group
14. Order cancellation with refund rules

---

## 4. Ory Kratos — Driver KYC / identity verification

**Repo:** `https://github.com/ory/kratos`
**Strength:** Production-grade identity management. Extract **verification, MFA, document-bound identity** patterns for driver onboarding.

Features to select:

 1. Identity registration flow
 2. Email / phone verification
 3. Document-bound identity (ID, license, vehicle registration)
 4. Multi-step verification with resumable sessions
 5. Account recovery and self-service
 6. Multi-factor authentication (TOTP, WebAuthn)
 7. Session management and revocation
 8. Identity traits schema (structured KYC fields)
 9. Verification status per identity attribute
10. Admin identity management APIs
11. Consent and privacy acknowledgement
12. Re-verification triggers (expired docs)

---

## 5. Chatwoot — Support, disputes, live chat to ops

**Repo:** `https://github.com/chatwoot/chatwoot`
**Strength:** Modern customer support platform. Extract **ticketing, conversation routing, SLA, macros** for rider/driver support and dispute resolution.

Features to select:

 1. Support conversation / ticket model
 2. Conversation assignment to agents
 3. Agent teams and routing rules
 4. Canned responses / macros
 5. Internal notes vs. customer-visible messages
 6. Conversation status (open, pending, resolved, snoozed)
 7. SLA policies and breach alerts
 8. Contact timeline and history
 9. Live chat widget for rider/driver apps
10. Multi-channel inbox (in-app, email, SMS)
11. Automation rules on conversation events
12. CSAT (customer satisfaction) surveys

---

## Ride-hailing-specific features to model manually

These aren't cleanly available in any one repo — you'll need to blueprint them directly (via `/fdl-create`) or piece together from multiple sources:

1. **Fare estimation** — base + per-km + per-minute + surge + tolls + booking fee
2. **Surge / dynamic pricing** — demand-based multipliers by zone and time window
3. **Dispatch algorithm** — find nearest N drivers, offer sequentially, fall through on reject/timeout
4. **Split payments** — company commission + driver cut + taxes + tips on a single charge
5. **Cancellation fees** — free window vs. chargeable, rider fault vs. driver fault
6. **Pool / shared rides** — multi-rider route with shared fare and detour tolerance
7. **Ride scheduling** — book in advance with driver matching near scheduled time
8. **Referral codes and promotions** — rider invite credit, first-ride discount
9. **Driver incentive programs** — quests, streak bonuses, peak-hour bonuses
10. **SOS / safety features** — panic button during trip, trip sharing with trusted contacts
11. **Masked phone numbers** — rider ↔ driver calls without exposing real numbers
12. **Multi-city / multi-region** — different pricing rules, currencies, regulations per city
13. **Driver rating aggregation** — weighted average, bottom-rated driver actions
14. **Rider rating aggregation** — low-rated rider may see longer match times
15. **Lost-and-found workflow** — rider reports item, routed to driver via support

---

## Coverage matrix

| Concern | Covered by |
|---|---|
| Trip lifecycle and dispatch | Fleetbase |
| Real-time driver location | Fleetbase + Traccar (from tracking.md) |
| Rider/driver split app flow | LibreTaxi + Fleetbase |
| Fare bidding / negotiation | LibreTaxi |
| Proof of pickup / drop-off | Fleetbase |
| ETA and routing | VROOM + OpenRouteService (from tracking.md) |
| In-app rider ↔ driver chat | Rocket.Chat (from messaging.md) |
| Payments and wallet | Medusa |
| Payouts to drivers | Medusa |
| Refunds, disputes, chargebacks | Medusa + Chatwoot |
| Driver KYC and verification | Ory Kratos |
| Document-bound identity | Ory Kratos |
| Support tickets and dispute resolution | Chatwoot |
| SLA tracking on support | Chatwoot |
| Multi-tenant organization | Fleetbase |
| Trip analytics and history | Fleetbase + TeslaMate (from tracking.md) |
| Fare estimation, surge, dispatch algo | **Model manually via /fdl-create** |

**Total:** ~65 features extractable across 5 repos, plus ~15 ride-hailing-specific features to model manually.

---

## Minimum viable stack

1. **Fleetbase** — dispatch core (non-negotiable)
2. **Traccar** (from `tracking.md`) — GPS backbone
3. **Medusa** — payments and wallet primitives
4. **Ory Kratos** — driver KYC

Add **Chatwoot** when you need support, **LibreTaxi** for negotiation/bidding patterns.

---

## Why these repos

- **Fleetbase** → the only modern open-source TMS built for on-demand services with ride-hailing as a first-class use case
- **LibreTaxi** → unique patterns (fare bidding, no middleman) that Fleetbase doesn't cover
- **Medusa** → production-grade payment primitives that transfer cleanly from e-commerce to ride-hailing money flows
- **Ory Kratos** → industry-standard identity/KYC you can trust for driver onboarding
- **Chatwoot** → mature support platform; reinventing this from scratch would waste months
