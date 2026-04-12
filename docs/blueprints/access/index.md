---
title: "Access Control"
layout: default
parent: Blueprint Catalog
has_children: true
nav_order: 2
description: "Permissions, roles, and access control blueprints."
---

# Access Control Blueprints

Permissions, roles, and access control blueprints.

| Blueprint | Description | Version |
|-----------|-------------|----------|
| [Admin Panel]({{ site.baseurl }}/blueprints/access/admin-panel/) | Administrative dashboard for user management, account linking, notification broadcasting, and system configuration | 1.0.0 |
| [Data Privacy Compliance]({{ site.baseurl }}/blueprints/access/data-privacy-compliance/) | GDPR/CCPA compliance with consent management, data export, right to erasure, and cookie consent | 1.0.0 |
| [Fine Grained Authorization]({{ site.baseurl }}/blueprints/access/fine-grained-authorization/) | Resource-based and policy-based authorization | 1.0.0 |
| [Fleet Device Sharing]({{ site.baseurl }}/blueprints/access/fleet-device-sharing/) | Control which users can see and operate which GPS devices through an ACL permission model, with hierarchical device groups that inherit configuration and enable bulk sharing, user restrictions to l... | 1.0.0 |
| [Guest Accounts]({{ site.baseurl }}/blueprints/access/guest-accounts/) | Restricted user accounts that can be invited to specific channels only, cannot access broader workspace content, and are automatically removed from a workspace when they have no remaining channel... | 1.0.0 |
| [Guest Room Access]({{ site.baseurl }}/blueprints/access/guest-room-access/) | Allow unauthenticated guest users to access rooms without a full account. Room owners control guest access via a state event. Revoking access removes existing guests. | 1.0.0 |
| [Openclaw Gateway Authentication]({{ site.baseurl }}/blueprints/access/openclaw-gateway-authentication/) | Multi-mode gateway authentication with rate limiting, device tokens, and Tailscale VPN integration | 1.0.0 |
| [Payload Access Control]({{ site.baseurl }}/blueprints/access/payload-access-control/) | Function-based access control with collection-level, field-level, and document-level permissions supporting boolean and WHERE clause results | 1.0.0 |
| [Permission Scheme Management]({{ site.baseurl }}/blueprints/access/permission-scheme-management/) | Named collections of default role assignments that can be applied to workspaces or channels to customize the permission baseline for all members, replacing system-wide role defaults with... | 1.0.0 |
| [Rate Limiting]({{ site.baseurl }}/blueprints/access/rate-limiting/) | Configurable request throttling with multiple scopes and algorithms to protect APIs from abuse | 1.0.0 |
| [Role Based Access]({{ site.baseurl }}/blueprints/access/role-based-access/) | Role-based access control with hierarchical permission inheritance | 1.0.0 |
| [Role Based Access Control]({{ site.baseurl }}/blueprints/access/role-based-access-control/) | Three-tier RBAC system where permissions are granted through roles assigned at system, workspace, and channel scopes. Roles are additive and hierarchical.  | 1.0.0 |
| [Room Invitations]({{ site.baseurl }}/blueprints/access/room-invitations/) | Controls how users enter rooms via invitation, direct join, or knock. Enforces join rules and rate-limits invitations. Supports third-party invitations via identity servers. | 1.0.0 |
| [Room Power Levels]({{ site.baseurl }}/blueprints/access/room-power-levels/) | Fine-grained numeric permission system controlling which users may send event types and perform membership actions. Higher numbers grant broader permissions. | 1.0.0 |
| [Team Organization]({{ site.baseurl }}/blueprints/access/team-organization/) | Multi-tenant organization and team management with member invitations and data isolation | 1.0.0 |
| [User Consent Management]({{ site.baseurl }}/blueprints/access/user-consent-management/) | OAuth/OIDC consent tracking and enforcement | 1.0.0 |
| [User Deactivation Archiving]({{ site.baseurl }}/blueprints/access/user-deactivation-archiving/) | Controlled suspension and permanent deletion of user accounts, preserving message history and audit trails on soft-deactivation while supporting hard deletion for GDPR right-to-erasure requests.  | 1.0.0 |
| [User Groups Organizations]({{ site.baseurl }}/blueprints/access/user-groups-organizations/) | Hierarchical groups with role inheritance | 1.0.0 |
