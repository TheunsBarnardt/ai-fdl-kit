# Messaging & Chat — FDL Extraction Plan

A strategic plan for building a complete messaging/chat feature set by extracting from four open-source repos. Each repo is assigned the features it implements best, avoiding overlap.

## Extraction order

Run these in order — each builds on the previous without re-extracting shared concepts.

```bash
# 1. Messaging backbone (channels, threads, reactions, files, integrations)
/fdl-extract-code-feature https://github.com/RocketChat/Rocket.Chat

# 2. Enterprise layer (RBAC, SSO, compliance, audit, retention)
/fdl-extract-code-feature https://github.com/mattermost/mattermost

# 3. Federation + device-based E2EE (rooms, spaces, Olm/Megolm)
/fdl-extract-code-feature https://github.com/element-hq/synapse
# Alternative (Go, cleaner codebase):
# /fdl-extract-code-feature https://github.com/matrix-org/dendrite

# 4. Signal Protocol, phone auth, privacy primitives
/fdl-extract-code-feature https://github.com/signalapp/Signal-Server
```

`/fdl-auto-evolve` will run automatically after each extraction to validate, generate docs, and commit.

---

## 1. Rocket.Chat — Core messaging, channels, integrations

**Repo:** `https://github.com/RocketChat/Rocket.Chat`
**Strength:** Broadest feature surface, well-structured monorepo, strong integrations/apps model.

Features to select:

 1. Direct messages (1:1 conversations)
 2. Public and private channels
 3. Message threading and replies
 4. Message reactions (emoji)
 5. Message editing and deletion
 6. Message pinning and starring
 7. File upload and media sharing
 8. Link previews / URL unfurling
 9. Full-text message search
10. Custom emoji management
11. User presence (online/away/busy/offline)
12. Typing indicators
13. Read receipts
14. Incoming webhooks
15. Outgoing webhooks
16. Slash commands
17. Apps engine (bot/plugin framework)
18. OAuth SSO providers
19. Channel discovery / directory
20. User mentions and notifications

---

## 2. Mattermost — Enterprise, compliance, RBAC, admin

**Repo:** `https://github.com/mattermost/mattermost`
**Strength:** Everything the others gloss over — teams, compliance, audit, legal hold, SSO, retention.

Features to select:

 1. Teams / workspaces (multi-tenant org model)
 2. Role-based access control (system/team/channel roles)
 3. SAML 2.0 single sign-on
 4. AD/LDAP authentication and sync
 5. Multi-factor authentication (TOTP)
 6. Session management and revocation
 7. Guest accounts with restricted access
 8. Compliance exports (CSV / Actiance / GlobalRelay)
 9. Audit logging
10. Data retention policies
11. Legal hold
12. Channel moderation (mute/kick/ban)
13. User deactivation and archiving
14. Notification preferences and DND schedules
15. Email notifications
16. Mobile push notifications
17. Plugin framework (server-side extensions)
18. Custom slash commands
19. Data export (GDPR / user data download)
20. Permission scheme management

---

## 3. Matrix / Synapse — Federation, rooms, E2EE infrastructure

**Repo:** `https://github.com/element-hq/synapse`
**Alternative:** `https://github.com/matrix-org/dendrite` (Go, cleaner codebase)
**Strength:** The only mature federated protocol + Matrix's room/space model + device-based E2EE (Olm/Megolm).

Features to select:

 1. Server-to-server federation
 2. Room creation and lifecycle
 3. Room aliases and addressing
 4. Room state events and history
 5. Spaces (hierarchical room grouping)
 6. Room power levels (fine-grained permissions)
 7. Room invitations and join rules
 8. Guest access to rooms
 9. Device management and listing
10. Cross-signing device verification
11. End-to-end encryption (Olm/Megolm key exchange)
12. Encrypted key backup and recovery
13. Push notification gateway (sygnal pattern)
14. Identity server lookup (email/phone → user)
15. Application services / bridges
16. Media repository and thumbnailing
17. Room event redaction

---

## 4. Signal-Server — Phone-based identity, Signal Protocol, privacy

**Repo:** `https://github.com/signalapp/Signal-Server`
**Strength:** Phone-number auth, Signal Protocol (the gold standard), metadata-protection features you won't find elsewhere.

Features to select:

 1. Phone number registration and SMS/voice verification
 2. Registration lock PIN (account recovery)
 3. Signal Protocol prekey bundles
 4. One-time prekey replenishment
 5. Sealed sender (metadata-hidden delivery)
 6. Safety number verification
 7. Disappearing messages (per-conversation timer)
 8. Multi-device linking (primary + linked devices)
 9. Encrypted profile storage
10. Groups v2 (server-blind encrypted group metadata)
11. 1:1 voice and video calling (signaling)
12. Group calling signaling
13. Contact discovery (private set intersection)
14. Attachment encryption and storage
15. Rate limiting and abuse prevention
16. Push notification delivery (FCM / APNs)

---

## Coverage matrix

| Concern | Covered by |
|---|---|
| Messaging primitives, channels, threads, reactions, files | Rocket.Chat |
| Integrations, webhooks, slash commands, bots | Rocket.Chat + Mattermost |
| Federation, rooms/spaces, power levels | Matrix/Synapse |
| E2EE (device-based, Olm/Megolm) | Matrix/Synapse |
| E2EE (Signal Protocol, sealed sender, safety numbers) | Signal-Server |
| Phone-number identity, SMS verification, contact discovery | Signal-Server |
| Voice/video call signaling | Signal-Server |
| Disappearing messages, multi-device linking | Signal-Server |
| Enterprise auth (SAML, LDAP, MFA) | Mattermost |
| Compliance, audit, retention, legal hold, RBAC | Mattermost |
| Teams/workspaces, guest accounts | Mattermost |

**Total:** ~73 features across 4 repos — a near-complete messaging/chat feature surface with minimal duplication.

---

## Why these repos

Both **Telegram** (server) and **WhatsApp** are closed-source, so neither can be extracted. The four repos above collectively cover everything those platforms do — and more (federation, compliance) — while remaining open-source and extractable.

- **Rocket.Chat** → messaging backbone that all four layers sit on
- **Mattermost** → enterprise features Rocket.Chat lacks
- **Matrix/Synapse** → federation and room model (unique to Matrix)
- **Signal-Server** → Signal Protocol (the same E2EE used by WhatsApp under the hood)
