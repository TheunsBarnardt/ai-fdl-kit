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
| [Api Gateway]({{ site.baseurl }}/blueprints/integration/api-gateway/) | Route, authenticate, rate-limit, and transform API requests through a centralized gateway with versioning, circuit breaking, and CORS support | 1.0.0 |
| [Application Services]({{ site.baseurl }}/blueprints/integration/application-services/) | Connect the messaging server to external systems through registered bridges. Services receive a filtered event stream, provision virtual users/rooms, and respond to existence queries. | 1.0.0 |
| [Bot Plugin Framework]({{ site.baseurl }}/blueprints/integration/bot-plugin-framework/) | Extension framework for bots, apps, and plugins to extend platform behavior through a defined API | 1.0.0 |
| [Build Integration]({{ site.baseurl }}/blueprints/integration/build-integration/) | Integrate CSS framework with build tools (PostCSS, CLI, Webpack, Vite, Next.js) to process templates and generate optimized CSS | 1.0.0 |
| [Clearing House Account Management]({{ site.baseurl }}/blueprints/integration/clearing-house-account-management/) | Account management services for payment clearing houses — account mirroring, proxy management, real-time account verification, and check digit verification | 1.0.0 |
| [Clearing House Eft]({{ site.baseurl }}/blueprints/integration/clearing-house-eft/) | Electronic Funds Transfer operations via clearing house platform — inbound/outbound credits, debits, returns, on-us debits, payment cancellation, and system error correction | 1.0.0 |
| [Clearing House Inbound Payments]({{ site.baseurl }}/blueprints/integration/clearing-house-inbound-payments/) | Clearing house inbound payment processing — receiving credit transfers and direct debits from the national payment system | 1.0.0 |
| [Clearing House Outbound Payments]({{ site.baseurl }}/blueprints/integration/clearing-house-outbound-payments/) | Clearing house outbound payment operations including credit transfers, bulk payments, direct debits, returns, and cancellations | 1.0.0 |
| [Clearing House Request To Pay]({{ site.baseurl }}/blueprints/integration/clearing-house-request-to-pay/) | Request-To-Pay (RTP) and refunds for clearing house payments — outbound/inbound RTP initiation, cancellation, and refund processing | 1.0.0 |
| [Custom Slash Commands]({{ site.baseurl }}/blueprints/integration/custom-slash-commands/) | User-defined slash commands that POST to external webhook endpoints on execution, enabling integration of external services with in-channel command syntax and configurable response visibility.  | 1.0.0 |
| [Dataverse Client]({{ site.baseurl }}/blueprints/integration/dataverse-client/) | Enterprise service client for connecting to Microsoft Dataverse, managing authentication, executing CRUD operations on entities, batch processing, and discovery of available organizations | 1.0.0 |
| [Driver Location Streaming]({{ site.baseurl }}/blueprints/integration/driver-location-streaming/) | Real-time GPS location updates from drivers, persisted as position history and broadcast to subscribers for live map tracking. | 1.0.0 |
| [Email Service]({{ site.baseurl }}/blueprints/integration/email-service/) | Send transactional and marketing emails through a provider-agnostic abstraction supporting templates, attachments, delivery tracking, and batch sends | 1.0.0 |
| [Encrypted Group Metadata]({{ site.baseurl }}/blueprints/integration/encrypted-group-metadata/) | Server-blind encrypted group management where the server stores opaque ciphertext and issues zero-knowledge credentials for group membership and group-send authorization | 1.0.0 |
| [Event Redaction]({{ site.baseurl }}/blueprints/integration/event-redaction/) | Remove sensitive content from previously sent events. Creates a redaction event that prunes original content while preserving graph position and essential metadata. | 1.0.0 |
| [Fix Connection Management]({{ site.baseurl }}/blueprints/integration/fix-connection-management/) | Manages TCP connections for FIX protocol engines including server-side acceptors, client-side initiators, SSL/TLS encryption, automatic reconnection, and socket configuration | 1.0.0 |
| [Fleet Ops Public Api]({{ site.baseurl }}/blueprints/integration/fleet-ops-public-api/) | Versioned public REST API for rider and driver mobile apps, covering order management, driver operations, tracking, and location updates with API key authentication. | 1.0.0 |
| [Fleet Public Api]({{ site.baseurl }}/blueprints/integration/fleet-public-api/) | RESTful public API with API key authentication and request logging for third-party integrations | 1.0.0 |
| [Gps Position Ingestion]({{ site.baseurl }}/blueprints/integration/gps-position-ingestion/) | Accept raw GPS position messages from heterogeneous hardware devices over multiple transport protocols, decode them into a normalised position record, and route through a processing pipeline before... | 1.0.0 |
| [Group Call Signaling]({{ site.baseurl }}/blueprints/integration/group-call-signaling/) | Group call signaling via call links with zero-knowledge room creation credential issuance and per-account call-link authentication | 1.0.0 |
| [Identity Brokering Social Login]({{ site.baseurl }}/blueprints/integration/identity-brokering-social-login/) | OAuth 2.0 / OIDC social login with multi-provider identity brokering, account linking, profile normalization, PKCE/state/nonce CSRF protection, and configurable JWT or database session strategy.  | 2.0.0 |
| [Incoming Webhooks]({{ site.baseurl }}/blueprints/integration/incoming-webhooks/) | Receive HTTP POST payloads from external systems and convert them into messages posted to designated channels | 1.0.0 |
| [Mqtt Location Ingestion]({{ site.baseurl }}/blueprints/integration/mqtt-location-ingestion/) | Subscribe to a message broker for device location publishes, parse and normalize location payloads, and route each message by type to the appropriate storage or processing handler. | 1.0.0 |
| [Oauth Oidc Client Management]({{ site.baseurl }}/blueprints/integration/oauth-oidc-client-management/) | Lifecycle management of OAuth 2.0 and OpenID Connect clients — admin CRUD plus self-service OpenID Connect Dynamic Client Registration (RFC 7591).  | 2.0.0 |
| [Oauth Provider]({{ site.baseurl }}/blueprints/integration/oauth-provider/) | OAuth 2.0 authorization server for issuing tokens to third-party applications | 1.0.0 |
| [Obd Dtc Diagnostics]({{ site.baseurl }}/blueprints/integration/obd-dtc-diagnostics/) | Read, decode, and clear Diagnostic Trouble Codes (DTCs) from vehicle ECUs; report MIL (malfunction indicator lamp) status, DTC count, and human-readable fault descriptions | 1.0.0 |
| [Obd Pid Reading]({{ site.baseurl }}/blueprints/integration/obd-pid-reading/) | Query vehicle ECUs for standardized Parameter IDs across OBD-II service modes, decoding raw byte responses into typed values with physical units and caching PID support per vehicle | 1.0.0 |
| [Obd Port Connection]({{ site.baseurl }}/blueprints/integration/obd-port-connection/) | Discover serial ports, negotiate baud rate with a diagnostic adapter, initialize it, validate OBD-II socket voltage, and auto-detect the vehicle protocol to establish a ready connection | 1.0.0 |
| [Obd Realtime Sensors]({{ site.baseurl }}/blueprints/integration/obd-realtime-sensors/) | Poll and stream live vehicle sensor readings — RPM, speed, coolant temperature, throttle position, mass air flow, and fuel level — with physical units and callback-driven updates | 1.0.0 |
| [Obd Vin Extraction]({{ site.baseurl }}/blueprints/integration/obd-vin-extraction/) | Read and decode the Vehicle Identification Number (VIN) from the vehicle ECU using OBD-II mode 9 service, stripping frame padding to produce a validated 17-character ISO 3779 string | 1.0.0 |
| [Openclaw Message Routing]({{ site.baseurl }}/blueprints/integration/openclaw-message-routing/) | Central message router resolving inbound messages to agents via binding precedence, role-based routing, and guild/channel/peer matching | 1.0.0 |
| [Openclaw Messaging Channel]({{ site.baseurl }}/blueprints/integration/openclaw-messaging-channel/) | Platform-agnostic messaging channel integration supporting Discord, Telegram, Slack, and 85+ platforms with unified message routing and delivery | 1.0.0 |
| [Openclaw Plugin System]({{ site.baseurl }}/blueprints/integration/openclaw-plugin-system/) | Plugin registration, lifecycle management, and capability-based permissions system for extending OpenClaw functionality | 1.0.0 |
| [Order Lifecycle Webhooks]({{ site.baseurl }}/blueprints/integration/order-lifecycle-webhooks/) | Configure and deliver webhook notifications to third-party endpoints for order lifecycle events | 1.0.0 |
| [Outgoing Webhooks]({{ site.baseurl }}/blueprints/integration/outgoing-webhooks/) | Trigger HTTP callbacks to external URLs when configured events occur in channels, enabling real-time integration with external systems | 1.0.0 |
| [Palm Vein]({{ site.baseurl }}/blueprints/integration/palm-vein/) | Biometric scanning hardware integration for palm vein pattern registration, feature extraction, and 1:N template matching | 1.0.0 |
| [Payment Gateway]({{ site.baseurl }}/blueprints/integration/payment-gateway/) | Process payments through a provider-agnostic gateway abstraction supporting authorization, capture, void, refund, and webhook-driven status updates | 1.0.0 |
| [Payshap Rail]({{ site.baseurl }}/blueprints/integration/payshap-rail/) | Real-time payment rail integration for instant credit push payments with proxy resolution, settlement confirmation, and retry handling | 1.0.0 |
| [Plugin Development]({{ site.baseurl }}/blueprints/integration/plugin-development/) | Create and register plugins to extend CSS framework with custom utilities, variants, and theme values | 1.0.0 |
| [Plugin Overrides]({{ site.baseurl }}/blueprints/integration/plugin-overrides/) | Extensible plugin architecture with 12 UI override points, wrapping composition, field type customization, and sidebar panels | 1.0.0 |
| [Prisma Cli]({{ site.baseurl }}/blueprints/integration/prisma-cli/) | CLI tools for schema validation, formatting, generation, and database introspection | 1.0.0 |
| [Pub Sub Messaging]({{ site.baseurl }}/blueprints/integration/pub-sub-messaging/) | Real-time fire-and-forget message broadcasting with direct channel subscriptions and pattern-based subscriptions; sharded variant for cluster deployments | 1.0.0 |
| [Realtime Driver Tracking]({{ site.baseurl }}/blueprints/integration/realtime-driver-tracking/) | Real-time GPS location tracking for drivers and vehicles with position history and live map updates | 1.0.0 |
| [Remote Device Commands]({{ site.baseurl }}/blueprints/integration/remote-device-commands/) | Send control commands from the platform to GPS tracking hardware using the device's native protocol channel or SMS fallback, supporting engine control, configuration, alarm management, and informat... | 1.0.0 |
| [Room Aliases]({{ site.baseurl }}/blueprints/integration/room-aliases/) | Human-readable addresses for rooms enabling lookup and sharing by name. Supports local alias creation with namespace enforcement and federated alias resolution. | 1.0.0 |
| [Room Lifecycle]({{ site.baseurl }}/blueprints/integration/room-lifecycle/) | Manage creation of communication rooms with configurable presets and version upgrades that atomically migrate members and state while tombstoning the old room. | 1.0.0 |
| [Room State History]({{ site.baseurl }}/blueprints/integration/room-state-history/) | Immutable append-only event graph forming a room's history and derived state. Handles state resolution on conflicts, efficient state caching, and authorization at every event. | 1.0.0 |
| [Server Plugin Framework]({{ site.baseurl }}/blueprints/integration/server-plugin-framework/) | Isolated server-side extension system where plugins run as separate processes, communicate with the host via RPC, and react to application lifecycle events through a standardized hook interface.  | 1.0.0 |
| [Slash Commands]({{ site.baseurl }}/blueprints/integration/slash-commands/) | Register and execute text commands with a / prefix in chat messages | 1.0.0 |
| [Space Hierarchy]({{ site.baseurl }}/blueprints/integration/space-hierarchy/) | Organize rooms into hierarchical trees called spaces. Browse and navigate nested room structures with paginated breadth-first traversal and federated child resolution. | 1.0.0 |
| [Stablecoin Wallet Api]({{ site.baseurl }}/blueprints/integration/stablecoin-wallet-api/) | Stablecoin wallet infrastructure API — multi-chain wallets, addresses, deposits, withdrawals, swaps, gateway, checkout, and fiat offramp | 1.0.0 |
| [User Federation Ldap Kerberos]({{ site.baseurl }}/blueprints/integration/user-federation-ldap-kerberos/) | LDAP, Kerberos, and AD directory integration | 1.0.0 |
| [Voip Call Signaling]({{ site.baseurl }}/blueprints/integration/voip-call-signaling/) | 1:1 voice and video call signaling with TURN relay credential issuance and ICE candidate relay for authenticated accounts | 1.0.0 |
| [Webhook Ingestion]({{ site.baseurl }}/blueprints/integration/webhook-ingestion/) | Receive and process incoming webhooks from external services with signature verification (HMAC/RSA), replay protection, idempotent deduplication, and async handler routing | 1.0.0 |
| [Webhook Trip Lifecycle]({{ site.baseurl }}/blueprints/integration/webhook-trip-lifecycle/) | HTTP webhook delivery for order and driver lifecycle events, allowing external systems to react to ride state changes in real time. | 1.0.0 |
