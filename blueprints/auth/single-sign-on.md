<!-- AUTO-GENERATED FROM single-sign-on.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Single Sign On

> Enterprise SSO via SAML 2.0 and OIDC with JIT provisioning

**Category:** Auth · **Version:** 1.0.0 · **Tags:** authentication · sso · saml · oidc · enterprise · identity · federation

## What this does

Enterprise SSO via SAML 2.0 and OIDC with JIT provisioning

Specifies 7 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **idp_entity_id** *(text, required)* — IdP Entity ID
- **metadata_url** *(url, optional)* — IdP Metadata URL
- **certificate** *(text, required)* — X.509 Certificate
- **attribute_mapping** *(json, required)* — Attribute Mapping
- **enabled** *(boolean, required)* — SSO Enabled
- **sso_protocol** *(select, required)* — SSO Protocol
- **organization_id** *(text, required)* — Organization ID
- **default_role** *(text, optional)* — Default Role for JIT-Provisioned Users
- **domain_whitelist** *(text, optional)* — Allowed Email Domains
- **sign_requests** *(boolean, optional)* — Sign Authentication Requests
- **sp_entity_id** *(text, required)* — Service Provider Entity ID
- **acs_url** *(url, required)* — Assertion Consumer Service URL
- **slo_url** *(url, optional)* — Single Logout URL

## What must be true

- **security → assertion_validation → verify_signature:** true
- **security → assertion_validation → verify_issuer:** true
- **security → assertion_validation → verify_audience:** true
- **security → assertion_validation → verify_destination:** true
- **security → assertion_validation → verify_conditions:** true
- **security → assertion_validation → clock_skew_seconds:** 120
- **security → assertion_validation → replay_prevention:** true
- **security → certificate_management → allow_multiple_certs:** true
- **security → certificate_management → validate_expiry:** true
- **security → certificate_management → expiry_warning_days:** 30
- **security → certificate_management → min_key_size_bits:** 2048
- **security → encryption → encrypt_assertions:** false
- **security → encryption → sign_requests:** true
- **security → encryption → algorithm:** RSA_SHA256
- **security → rate_limit → window_seconds:** 60
- **security → rate_limit → max_requests:** 20
- **security → rate_limit → scope:** per_organization
- **jit_provisioning → enabled:** true
- **jit_provisioning → default_role:** member
- **jit_provisioning → sync_attributes_on_login:** true
- **jit_provisioning → deactivate_on_removal:** false
- **session → bridge_idp_session:** true
- **session → max_session_hours:** 8
- **session → force_reauth_on_sensitive_action:** true
- **saml → binding:** urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect
- **saml → name_id_format:** urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress
- **saml → authn_context:** urn:oasis:names:tc:SAML:2.0:ac:classes:PasswordProtectedTransport
- **oidc → response_type:** code
- **oidc → scopes:** openid, email, profile
- **oidc → pkce_required:** true
- **oidc → token_endpoint_auth:** client_secret_post

## Success & failure scenarios

**✅ Success paths**

- **Jit Provision New User** — when SAML assertion or OIDC token is valid; No local user matches the IdP identity; jit_provisioning_enabled eq true, then new user provisioned and authenticated — redirect to application.
- **Existing User Login** — when SAML assertion or OIDC token is valid; Local user matches the IdP identity; status neq "disabled", then redirect to application.

**❌ Failure paths**

- **Rate Limited** — when More than 20 SSO requests in 60 seconds from this organization, then show "Too many authentication attempts. Please wait a moment.". *(error: `SSO_RATE_LIMITED`)*
- **Sso Not Configured** — when No SSO configuration for this organization OR SSO is disabled for this organization, then show "SSO is not configured for your organization. Please contact your administrator.". *(error: `SSO_NOT_CONFIGURED`)*
- **Invalid Assertion** — when Assertion signature verification failed OR Audience does not match SP entity ID OR Assertion has expired, then show "Authentication failed. Please try again or contact your administrator.". *(error: `SSO_INVALID_ASSERTION`)*
- **Replay Attack Detected** — when Assertion ID already seen, then show "Authentication failed. Please try again.". *(error: `SSO_REPLAY_DETECTED`)*
- **Domain Not Allowed** — when Organization has domain restrictions; User email domain not in allowed list, then show "Your email domain is not authorized for this organization.". *(error: `SSO_DOMAIN_NOT_ALLOWED`)*

## Errors it can return

- `SSO_RATE_LIMITED` — Too many authentication attempts. Please wait a moment.
- `SSO_NOT_CONFIGURED` — SSO is not configured for your organization
- `SSO_INVALID_ASSERTION` — Authentication failed. Please try again or contact your administrator.
- `SSO_REPLAY_DETECTED` — Authentication failed. Please try again.
- `SSO_DOMAIN_NOT_ALLOWED` — Your email domain is not authorized for this organization.
- `SSO_CERTIFICATE_EXPIRED` — SSO configuration error. Please contact your administrator.
- `SSO_PROVISIONING_DISABLED` — Automatic account provisioning is not enabled. Contact your administrator.
- `SSO_ACCOUNT_DISABLED` — This account has been disabled. Please contact your administrator.

## Connects to

- **login** *(recommended)* — SSO is an alternative to password-based login for enterprise users
- **oauth-social-login** *(optional)* — Organizations may use OAuth for non-enterprise social login alongside SSO
- **session-management** *(recommended)* — SSO sessions need tracking, bridging, and revocation
- **multi-factor-auth** *(optional)* — MFA may be enforced at the IdP level or additionally at SP
- **logout** *(required)* — Single logout (SLO) must terminate both SP and IdP sessions

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/auth/single-sign-on/) · **Spec source:** [`single-sign-on.blueprint.yaml`](./single-sign-on.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
