---
title: "Oauth Sso Providers Blueprint"
layout: default
parent: "Auth"
grand_parent: Blueprint Catalog
description: "Configure OAuth2/SSO identity providers to enable single sign-on login for platform users. 17 fields. 7 outcomes. 3 error codes. rules: general. AGI: supervised"
---

# Oauth Sso Providers Blueprint

> Configure OAuth2/SSO identity providers to enable single sign-on login for platform users

| | |
|---|---|
| **Feature** | `oauth-sso-providers` |
| **Category** | Auth |
| **Version** | 1.0.0 |
| **Tags** | oauth2, sso, identity, login, social-login, federation, authentication |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/auth/oauth-sso-providers.blueprint.yaml) |
| **JSON API** | [oauth-sso-providers.json]({{ site.baseurl }}/api/blueprints/auth/oauth-sso-providers.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `administrator` | Platform Administrator | human | Configures identity provider settings and manages OAuth service integrations |
| `user` | User | human | Authenticates via an external identity provider instead of local credentials |
| `identity_provider` | Identity Provider | external | External OAuth2/OpenID Connect service that authenticates the user and issues tokens |
| `auth_service` | Authentication Service | system | Platform component that handles OAuth flow, token exchange, and user record merging |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `service_name` | text | Yes | Service Name |  |
| `server_url` | url | Yes | Authorization Server URL |  |
| `client_id` | text | Yes | Client ID |  |
| `client_secret` | token | Yes | Client Secret |  |
| `token_path` | text | No | Token Endpoint Path |  |
| `identity_path` | text | No | Identity Endpoint Path |  |
| `scope` | text | No | Scopes |  |
| `username_field` | text | No | Username Field Mapping |  |
| `email_field` | text | No | Email Field Mapping |  |
| `name_field` | text | No | Name Field Mapping |  |
| `avatar_field` | text | No | Avatar Field Mapping |  |
| `roles_claim` | text | No | Roles Claim Field |  |
| `merge_users` | boolean | No | Merge Existing Users |  |
| `merge_users_distinct_services` | boolean | No | Merge Across Distinct Services |  |
| `access_token_param` | text | No | Access Token Parameter Name |  |
| `token_sent_via` | select | No | Token Transport |  |
| `key_field` | text | No | Unique Key Field |  |

## Rules

- **general:** Each OAuth provider must have a unique service_name; re-configuring the same name updates the existing provider, server_url must be a valid absolute URL; relative paths are resolved against it for token_path and identity_path, client_secret must be stored encrypted at rest and never exposed in API responses or logs, If merge_users is enabled, the platform matches incoming identities to existing accounts by email before creating a new user, Field mappings (username_field, email_field, name_field, avatar_field) override platform defaults when provided, The roles_claim field, if present, maps identity provider roles to platform roles, On successful authentication the platform creates or updates the user record and sets the provider service on the user identity, Access tokens obtained via OAuth are registered as valid session tokens within the platform, Administrators may enable or disable each provider independently without affecting other providers, Users authenticated via SSO retain a link to their identity provider service; password login remains disabled for pure-SSO accounts unless explicitly enabled, Invalid or expired tokens from the identity provider must result in session termination on the platform

## Outcomes

### Provider_misconfigured (Priority: 1) — Error: `OAUTH_PROVIDER_MISCONFIGURED`

**Given:**
- administrator saves a provider configuration with an invalid server_url or missing client_id

**Result:** Configuration is rejected with a validation error; provider is not activated

### Token_exchange_failed (Priority: 2) — Error: `OAUTH_TOKEN_EXCHANGE_FAILED`

**Given:**
- platform attempts to exchange authorization code for access token
- identity provider returns an error or invalid response

**Then:**
- **emit_event** event: `oauth.login_failed`

**Result:** Login attempt is aborted and the user is shown a generic authentication error

### Identity_fetch_failed (Priority: 3) — Error: `OAUTH_IDENTITY_FETCH_FAILED`

**Given:**
- platform successfully obtains an access token
- identity endpoint returns an error or missing required fields

**Result:** Login is rejected; user is informed that profile information could not be retrieved

### Provider_configured (Priority: 7)

**Given:**
- administrator submits valid OAuth provider configuration

**Then:**
- **emit_event** event: `oauth.provider_configured`

**Result:** Provider is saved and the login button for this service becomes available on the login screen

### Existing_user_merged (Priority: 8)

**Given:**
- user authenticates via OAuth
- merge_users is true
- an existing platform account shares the same email as the identity

**Then:**
- **set_field** target: `user.services` value: `merged_identity`
- **emit_event** event: `oauth.user_merged`

**Result:** Incoming OAuth identity is linked to the existing account; the user continues with their existing profile

### New_user_provisioned (Priority: 9)

**Given:**
- user authenticates via OAuth for the first time
- no existing platform account matches the identity

**Then:**
- **create_record**
- **emit_event** event: `oauth.user_provisioned`

**Result:** A new user account is created from the identity provider profile data

### User_authenticated (Priority: 10)

**Given:**
- user initiates login via a configured OAuth provider
- identity provider returns a valid authorization code
- platform successfully exchanges the code for tokens and retrieves the user identity

**Then:**
- **create_record**
- **emit_event** event: `oauth.login_success`

**Result:** User is logged in; a session is created and the identity provider service is linked to the user record

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `OAUTH_TOKEN_EXCHANGE_FAILED` | 400 | Authentication failed. The identity provider did not return a valid token. Please try again. | No |
| `OAUTH_IDENTITY_FETCH_FAILED` | 400 | Authentication failed. Your profile information could not be retrieved from the identity provider. | No |
| `OAUTH_PROVIDER_MISCONFIGURED` | 400 | The identity provider configuration is invalid. Please check the settings and try again. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `oauth.login_success` | Fires when a user successfully authenticates via an OAuth provider | `service_name`, `user_id` |
| `oauth.login_failed` | Fires when an OAuth login attempt fails at any stage of the flow | `service_name` |
| `oauth.user_provisioned` | Fires when a new user account is created from an OAuth identity | `service_name`, `user_id` |
| `oauth.user_merged` | Fires when an OAuth identity is linked to an existing user account | `service_name`, `user_id` |
| `oauth.provider_configured` | Fires when an administrator saves a new or updated OAuth provider configuration | `service_name`, `server_url` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| login | required | OAuth SSO is an authentication method that integrates into the platform login flow |
| user-registration | recommended | SSO-provisioned users may bypass manual registration depending on configuration |
| role-based-access-control | optional | Roles from the identity provider's roles_claim can be mapped to platform roles |
| session-management | required | Successful OAuth authentication creates a managed session |

## AGI Readiness

### Goals

#### Secure Oauth Sso Authentication

Enable users to authenticate via external OAuth2/OpenID Connect providers with secure token handling and identity merging

**Success Metrics:**

| Metric | Target | Measurement |
|--------|--------|-------------|
| client_secret_exposure_rate | 0% | API responses or logs containing client_secret / total responses |
| sso_login_success_rate | > 99% | Successful OAuth logins / total OAuth login attempts |

### Autonomy

**Level:** `supervised`

**Human Checkpoints:**

- before enabling merge_users_distinct_services across multiple identity providers
- before disabling an OAuth provider that is the only login method for some users

### Verification

**Invariants:**

- client_secret is stored encrypted and never returned in API responses or logs
- invalid or expired identity provider tokens result in session termination
- SSO-only accounts do not have password login enabled unless explicitly configured

**Acceptance Tests:**

| Scenario | Given | When | Expect |
|----------|-------|------|--------|
| token exchange failure aborts login | identity provider returns an error during code exchange | OAuth callback is received | login aborted with OAUTH_TOKEN_EXCHANGE_FAILED and generic error shown to user |
| existing user merged on email match | merge_users is true and OAuth identity email matches an existing account | user authenticates via OAuth | OAuth identity linked to existing account rather than creating a new user |

### Composability

**Capabilities:**

- `oauth_flow_orchestration`: Orchestrate OAuth2 authorization code flow including token exchange and identity fetch
- `identity_merging`: Match incoming OAuth identities to existing accounts by email and link services

### Tradeoffs

| Prefer | Over | Reason |
|--------|------|--------|
| security | convenience | client secrets are never exposed even in admin UIs to prevent credential leakage |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| configure_oauth_provider | `human_required` | - | - |
| enable_merge_users | `supervised` | - | - |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
source:
  repo: https://github.com/RocketChat/Rocket.Chat
  project: Open-source team communication platform
  tech_stack: TypeScript, Meteor, React, MongoDB
  files_traced: 5
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Oauth Sso Providers Blueprint",
  "description": "Configure OAuth2/SSO identity providers to enable single sign-on login for platform users. 17 fields. 7 outcomes. 3 error codes. rules: general. AGI: supervised",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "oauth2, sso, identity, login, social-login, federation, authentication"
}
</script>
