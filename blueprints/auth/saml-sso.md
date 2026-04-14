<!-- AUTO-GENERATED FROM saml-sso.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Saml Sso

> SAML 2.0 identity provider integration enabling users to authenticate via a federated identity provider without maintaining local passwords.

**Category:** Auth · **Version:** 1.0.0 · **Tags:** saml · sso · federation · identity-provider · enterprise-auth

## What this does

SAML 2.0 identity provider integration enabling users to authenticate via a federated identity provider without maintaining local passwords.

Specifies 5 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **idp_metadata_url** *(url, required)* — URL of the identity provider's SAML metadata XML endpoint
- **idp_certificate** *(file, required)* — Public certificate of the identity provider for signature verification
- **service_provider_certificate** *(file, optional)* — Service provider public certificate sent to IdP for encryption
- **service_provider_private_key** *(file, optional)* — Service provider private key used to decrypt SAML assertions
- **attribute_email** *(text, required)* — SAML assertion attribute name that maps to user email
- **attribute_username** *(text, required)* — SAML assertion attribute name that maps to username
- **attribute_first_name** *(text, optional)* — SAML assertion attribute name that maps to first name
- **attribute_last_name** *(text, optional)* — SAML assertion attribute name that maps to last name
- **enable_sync_with_ldap** *(boolean, optional)* — When true, SAML user profiles are also synced against an LDAP directory
- **relay_state** *(token, optional)* — Opaque token generated per authentication request to prevent CSRF in the SAML fl

## What must be true

- **rule_01:** Users authenticated via SAML do not have or use a local password; password authentication is bypassed.
- **rule_02:** User profile attributes (email, username, first name, last name) are populated from SAML assertion attributes on each login.
- **rule_03:** A relay_state token is generated per authentication request and validated on callback to prevent CSRF attacks.
- **rule_04:** SAML users cannot activate TOTP multi-factor authentication; MFA is delegated to the identity provider.
- **rule_05:** Sessions created from SAML logins are marked as SSO sessions and may have a distinct session length configured separately from password-based sessions.
- **rule_06:** When LDAP sync is enabled alongside SAML, user attributes are additionally reconciled against the LDAP directory after assertion validation.
- **rule_07:** IdP metadata (certificates, endpoints) can be fetched automatically from a metadata URL or uploaded manually.
- **rule_08:** Certificate rotation requires updating both the IdP certificate in configuration and the service provider certificate exchange with the IdP.

## Success & failure scenarios

**✅ Success paths**

- **Sso Login Success** — when SAML is enabled in system configuration; user initiated login and was redirected to the identity provider; identity provider posted a valid signed assertion with required attributes; relay_state token matches the pending authentication request, then User is authenticated and redirected to the application.

**❌ Failure paths**

- **Sso Login Relay State Invalid** — when callback received from identity provider; relay_state does not match any pending authentication request, then Login rejected to prevent CSRF replay attack. *(error: `SAML_INVALID_RELAY_STATE`)*
- **Sso Login Invalid Signature** — when assertion received from identity provider; signature verification against IdP certificate fails, then Login rejected; user sees authentication error. *(error: `SAML_INVALID_SIGNATURE`)*
- **Sso Login Missing Attributes** — when assertion signature is valid; required attribute mappings (email or username) are absent in the assertion, then Login rejected; administrator must fix attribute mapping configuration. *(error: `SAML_MISSING_ATTRIBUTES`)*
- **Mfa Not Available For Saml** — when user authenticated via SAML attempts to enable TOTP MFA, then MFA activation blocked; user must configure MFA at the identity provider level. *(error: `MFA_NOT_SUPPORTED_FOR_SSO`)*

## Errors it can return

- `SAML_INVALID_SIGNATURE` — Authentication failed. Please contact your administrator.
- `SAML_MISSING_ATTRIBUTES` — Authentication failed due to a configuration error. Please contact your administrator.
- `SAML_INVALID_RELAY_STATE` — Authentication request is invalid or has expired. Please try again.
- `SAML_NOT_ENABLED` — Single sign-on is not configured on this server.
- `MFA_NOT_SUPPORTED_FOR_SSO` — Multi-factor authentication is managed by your identity provider.
- `SAML_CERTIFICATE_ERROR` — Identity provider certificate is missing or invalid.

## Events

**`auth.saml_login_success`** — User successfully authenticated via SAML SSO
  Payload: `user_id`, `email`, `session_id`, `timestamp`

**`auth.saml_login_failed`** — SAML authentication attempt failed
  Payload: `reason`, `ip_address`, `timestamp`

**`auth.saml_user_provisioned`** — New user account created from SAML assertion on first login
  Payload: `user_id`, `email`, `actor`, `timestamp`

## Connects to

- **session-management** *(required)* — SSO login produces a session with SSO-specific lifecycle settings
- **ldap-authentication-sync** *(optional)* — SAML can coexist with LDAP sync for attribute enrichment
- **multi-factor-authentication** *(optional)* — MFA is not applicable for SAML users; delegated to the IdP

## Quality fitness 🟢 76/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `██████░░░░` | 6/10 |
| Outcomes | `██████████████████████░░░` | 22/25 |
| Structured conditions | `███░░░░░░░` | 3/10 |
| Error binding | `███████░░░` | 7/10 |
| Field validation | `██████░░░░` | 6/10 |
| Relationships | `█████████░` | 9/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `████░` | 4/5 |
| Simplicity | `████░` | 4/5 |

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/auth/saml-sso/) · **Spec source:** [`saml-sso.blueprint.yaml`](./saml-sso.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
