<!-- AUTO-GENERATED FROM oauth-sso-providers.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Oauth Sso Providers

> Configure OAuth2/SSO identity providers to enable single sign-on login for platform users

**Category:** Auth · **Version:** 1.0.0 · **Tags:** oauth2 · sso · identity · login · social-login · federation · authentication

## What this does

Configure OAuth2/SSO identity providers to enable single sign-on login for platform users

Specifies 7 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **service_name** *(text, required)* — Service Name
- **server_url** *(url, required)* — Authorization Server URL
- **client_id** *(text, required)* — Client ID
- **client_secret** *(token, required)* — Client Secret
- **token_path** *(text, optional)* — Token Endpoint Path
- **identity_path** *(text, optional)* — Identity Endpoint Path
- **scope** *(text, optional)* — Scopes
- **username_field** *(text, optional)* — Username Field Mapping
- **email_field** *(text, optional)* — Email Field Mapping
- **name_field** *(text, optional)* — Name Field Mapping
- **avatar_field** *(text, optional)* — Avatar Field Mapping
- **roles_claim** *(text, optional)* — Roles Claim Field
- **merge_users** *(boolean, optional)* — Merge Existing Users
- **merge_users_distinct_services** *(boolean, optional)* — Merge Across Distinct Services
- **access_token_param** *(text, optional)* — Access Token Parameter Name
- **token_sent_via** *(select, optional)* — Token Transport
- **key_field** *(text, optional)* — Unique Key Field

## What must be true

- **general:** Each OAuth provider must have a unique service_name; re-configuring the same name updates the existing provider, server_url must be a valid absolute URL; relative paths are resolved against it for token_path and identity_path, client_secret must be stored encrypted at rest and never exposed in API responses or logs, If merge_users is enabled, the platform matches incoming identities to existing accounts by email before creating a new user, Field mappings (username_field, email_field, name_field, avatar_field) override platform defaults when provided, The roles_claim field, if present, maps identity provider roles to platform roles, On successful authentication the platform creates or updates the user record and sets the provider service on the user identity, Access tokens obtained via OAuth are registered as valid session tokens within the platform, Administrators may enable or disable each provider independently without affecting other providers, Users authenticated via SSO retain a link to their identity provider service; password login remains disabled for pure-SSO accounts unless explicitly enabled, Invalid or expired tokens from the identity provider must result in session termination on the platform

## Success & failure scenarios

**✅ Success paths**

- **Provider Configured** — when administrator submits valid OAuth provider configuration, then Provider is saved and the login button for this service becomes available on the login screen.
- **Existing User Merged** — when user authenticates via OAuth; merge_users is true; an existing platform account shares the same email as the identity, then Incoming OAuth identity is linked to the existing account; the user continues with their existing profile.
- **New User Provisioned** — when user authenticates via OAuth for the first time; no existing platform account matches the identity, then A new user account is created from the identity provider profile data.
- **User Authenticated** — when user initiates login via a configured OAuth provider; identity provider returns a valid authorization code; platform successfully exchanges the code for tokens and retrieves the user identity, then User is logged in; a session is created and the identity provider service is linked to the user record.

**❌ Failure paths**

- **Provider Misconfigured** — when administrator saves a provider configuration with an invalid server_url or missing client_id, then Configuration is rejected with a validation error; provider is not activated. *(error: `OAUTH_PROVIDER_MISCONFIGURED`)*
- **Token Exchange Failed** — when platform attempts to exchange authorization code for access token; identity provider returns an error or invalid response, then Login attempt is aborted and the user is shown a generic authentication error. *(error: `OAUTH_TOKEN_EXCHANGE_FAILED`)*
- **Identity Fetch Failed** — when platform successfully obtains an access token; identity endpoint returns an error or missing required fields, then Login is rejected; user is informed that profile information could not be retrieved. *(error: `OAUTH_IDENTITY_FETCH_FAILED`)*

## Errors it can return

- `OAUTH_TOKEN_EXCHANGE_FAILED` — Authentication failed. The identity provider did not return a valid token. Please try again.
- `OAUTH_IDENTITY_FETCH_FAILED` — Authentication failed. Your profile information could not be retrieved from the identity provider.
- `OAUTH_PROVIDER_MISCONFIGURED` — The identity provider configuration is invalid. Please check the settings and try again.

## Events

**`oauth.login_success`** — Fires when a user successfully authenticates via an OAuth provider
  Payload: `service_name`, `user_id`

**`oauth.login_failed`** — Fires when an OAuth login attempt fails at any stage of the flow
  Payload: `service_name`

**`oauth.user_provisioned`** — Fires when a new user account is created from an OAuth identity
  Payload: `service_name`, `user_id`

**`oauth.user_merged`** — Fires when an OAuth identity is linked to an existing user account
  Payload: `service_name`, `user_id`

**`oauth.provider_configured`** — Fires when an administrator saves a new or updated OAuth provider configuration
  Payload: `service_name`, `server_url`

## Connects to

- **login** *(required)* — OAuth SSO is an authentication method that integrates into the platform login flow
- **user-registration** *(recommended)* — SSO-provisioned users may bypass manual registration depending on configuration
- **role-based-access-control** *(optional)* — Roles from the identity provider's roles_claim can be mapped to platform roles
- **session-management** *(required)* — Successful OAuth authentication creates a managed session

## Quality fitness 🟢 84/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `███████░░░` | 7/10 |
| Outcomes | `███████████████████████░░` | 23/25 |
| Structured conditions | `████░░░░░░` | 4/10 |
| Error binding | `██████████` | 10/10 |
| Field validation | `█████░░░░░` | 5/10 |
| Relationships | `██████████` | 10/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `█████` | 5/5 |
| Simplicity | `█████` | 5/5 |

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/auth/oauth-sso-providers/) · **Spec source:** [`oauth-sso-providers.blueprint.yaml`](./oauth-sso-providers.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
