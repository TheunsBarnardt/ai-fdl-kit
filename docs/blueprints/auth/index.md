---
title: "Auth"
layout: default
parent: Blueprint Catalog
has_children: true
nav_order: 1
description: "Authentication, identity, and session management blueprints."
---

# Auth Blueprints

Authentication, identity, and session management blueprints.

| Blueprint | Description | Version |
|-----------|-------------|----------|
| [Api Key Management]({{ site.baseurl }}/blueprints/auth/api-key-management/) | Create, rotate, revoke, and scope API keys for programmatic access | 1.0.0 |
| [Biometric Auth]({{ site.baseurl }}/blueprints/auth/biometric-auth/) | Palm vein biometric authentication — alternative to password login with enrollment of up to 2 palms per user | 1.0.0 |
| [Cross Signing Verification]({{ site.baseurl }}/blueprints/auth/cross-signing-verification/) | Three-key trust hierarchy for verifying devices and users. Master key signs self-signing and user-signing keys. All uploads are cryptographically validated before storage. | 1.0.0 |
| [Device Management]({{ site.baseurl }}/blueprints/auth/device-management/) | Track all client sessions as named devices per user account. List, rename, and delete devices with cascading cleanup. Auto-purge devices inactive beyond retention period. | 1.0.0 |
| [E2e Key Exchange]({{ site.baseurl }}/blueprints/auth/e2e-key-exchange/) | Manages cryptographic key material for end-to-end encrypted messaging. Handles device key publication, one-time pre-key upload/claiming, and cross-server key queries. | 1.0.0 |
| [Email Verification]({{ site.baseurl }}/blueprints/auth/email-verification/) | Verify user email ownership via a one-time token link | 1.0.0 |
| [Identity Lookup]({{ site.baseurl }}/blueprints/auth/identity-lookup/) | Bridge between user contact details (email, phone) and messaging identities via external identity servers. Enables invitations before account creation and contact binding. | 1.0.0 |
| [Key Backup Recovery]({{ site.baseurl }}/blueprints/auth/key-backup-recovery/) | Securely back up and restore end-to-end encryption session keys. Keys are client-encrypted before upload; server stores only opaque ciphertext with versioned etag tracking. | 1.0.0 |
| [Ldap Authentication Sync]({{ site.baseurl }}/blueprints/auth/ldap-authentication-sync/) | Directory service authentication and periodic synchronization that validates credentials against an LDAP/Active Directory server and keeps user profiles and group memberships current with the... | 1.0.0 |
| [Login]({{ site.baseurl }}/blueprints/auth/login/) | Authenticate a user with email and password | 1.0.0 |
| [Logout]({{ site.baseurl }}/blueprints/auth/logout/) | End a user session and clear all authentication tokens | 1.0.0 |
| [Magic Link Auth]({{ site.baseurl }}/blueprints/auth/magic-link-auth/) | Passwordless email login via single-use magic links | 1.0.0 |
| [Multi Factor Auth]({{ site.baseurl }}/blueprints/auth/multi-factor-auth/) | Second-factor authentication via TOTP, SMS OTP, or backup codes | 1.0.0 |
| [Multi Factor Authentication]({{ site.baseurl }}/blueprints/auth/multi-factor-authentication/) | TOTP-based second authentication factor using RFC 6238 time-based one-time passwords. Users enroll via QR code and submit 6-digit codes at login to verify possession of the registered... | 2.0.0 |
| [Oauth Social Login]({{ site.baseurl }}/blueprints/auth/oauth-social-login/) | Social sign-in via OAuth2/OIDC with account linking and profile sync | 1.0.0 |
| [Oauth Sso Providers]({{ site.baseurl }}/blueprints/auth/oauth-sso-providers/) | Configure OAuth2/SSO identity providers to enable single sign-on login for platform users | 1.0.0 |
| [Openid Connect Server]({{ site.baseurl }}/blueprints/auth/openid-connect-server/) | OAuth 2.0 and OpenID Connect identity provider with token issuance | 1.0.0 |
| [Password Reset]({{ site.baseurl }}/blueprints/auth/password-reset/) | Allow users to reset their password via email verification | 1.0.0 |
| [Payload Auth]({{ site.baseurl }}/blueprints/auth/payload-auth/) | Full authentication system with JWT sessions, API keys, account locking, email verification, and custom strategies | 1.0.0 |
| [Saml 2 Identity Provider]({{ site.baseurl }}/blueprints/auth/saml-2-identity-provider/) | SAML 2.0 identity provider with assertions and metadata | 1.0.0 |
| [Saml Sso]({{ site.baseurl }}/blueprints/auth/saml-sso/) | SAML 2.0 identity provider integration enabling users to authenticate via a federated identity provider without maintaining local passwords.  | 1.0.0 |
| [Session Management]({{ site.baseurl }}/blueprints/auth/session-management/) | Active session listing, device tracking, and session revocation | 1.0.0 |
| [Session Management Revocation]({{ site.baseurl }}/blueprints/auth/session-management-revocation/) | Lifecycle management for authenticated user sessions including creation, activity-based expiry extension, idle timeout enforcement, and explicit revocation by users or administrators.  | 1.0.0 |
| [Signup]({{ site.baseurl }}/blueprints/auth/signup/) | Register a new user account with email and password | 1.0.0 |
| [Single Sign On]({{ site.baseurl }}/blueprints/auth/single-sign-on/) | Enterprise SSO via SAML 2.0 and OIDC with JIT provisioning | 1.0.0 |
| [User Account Self Service]({{ site.baseurl }}/blueprints/auth/user-account-self-service/) | User self-service account and credential management | 1.0.0 |
| [User Authentication Session Management]({{ site.baseurl }}/blueprints/auth/user-authentication-session-management/) | Authentication flows, session management, brute-force protection | 1.0.0 |
