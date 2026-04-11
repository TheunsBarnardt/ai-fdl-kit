---
title: "Identity Brokering Social Login Blueprint"
layout: default
parent: "Integration"
grand_parent: Blueprint Catalog
description: "OAuth 2.0 / OIDC social login with multi-provider identity brokering, account linking, profile normalization, PKCE/state/nonce CSRF protection, and configurable"
---

# Identity Brokering Social Login Blueprint

> OAuth 2.0 / OIDC social login with multi-provider identity brokering, account linking, profile normalization, PKCE/state/nonce CSRF protection, and configurable JWT or database session strategy.


| | |
|---|---|
| **Feature** | `identity-brokering-social-login` |
| **Category** | Integration |
| **Version** | 2.0.0 |
| **Tags** | oauth2, oidc, social-login, identity-brokering, account-linking, pkce, jwt-session |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/integration/identity-brokering-social-login.blueprint.yaml) |
| **JSON API** | [identity-brokering-social-login.json]({{ site.baseurl }}/api/blueprints/integration/identity-brokering-social-login.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `user` | User | human | Person initiating sign-in via an external identity provider |
| `oauth_provider` | OAuth / OIDC Provider | external | External identity provider (e.g. Google, GitHub, Discord). Handles user authentication and returns an authorization code plus profile data.  |
| `auth_service` | Auth Service | system | Core authentication engine that orchestrates the OAuth flow — constructs authorization URLs, exchanges codes for tokens, normalises profiles, and manages account linking.  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `provider` | text | Yes | Provider ID | Validations: required |
| `client_id` | text | Yes | Client ID | Validations: required |
| `provider_account_id` | text | Yes | Provider Account ID | Validations: required |
| `access_token` | token | No | Access Token |  |
| `refresh_token` | token | No | Refresh Token |  |
| `expires_at` | number | No | Token Expiry |  |
| `scope` | text | No | Granted Scopes |  |
| `token_type` | text | No | Token Type |  |
| `id_token` | token | No | OIDC ID Token |  |
| `session_strategy` | select | No | Session Strategy |  |

## Rules

- **security:** {"MUST":"generate a cryptographically random state parameter for every authorization request; validate it on callback to prevent CSRF"}, {"MUST":"support PKCE (RFC 7636) when provider.checks includes \"pkce\"; store code_verifier in an encrypted cookie and verify on callback"}, {"MUST":"generate and validate a nonce for OIDC providers when provider.checks includes \"nonce\", to prevent ID token replay"}, {"MUST":"store PKCE, state, and nonce values only in HTTP-only, encrypted cookies with SameSite=Lax; never expose them in URLs or response bodies"}, {"MUST":"sanitise the callbackUrl redirect target; reject destinations outside the application's trusted origin to prevent open redirects"}, {"MUST NOT":"automatically link a newly seen OAuth account to an existing user record by email address unless allowDangerousEmailAccountLinking is explicitly set to true for that provider"}, {"MUST NOT":"allow an OAuth account already linked to user A to be linked to user B; throw OAuthAccountNotLinked instead"}, SHOULD: require trustHost=true in reverse-proxy environments to ensure the redirect_uri is constructed from the correct host header
- **access:** All endpoints under the /auth/* route prefix are public (no prior session required), The signIn callback MAY block specific users by returning false; the result is surfaced as an AccessDenied error to the client

## Flows

### Oauth_authorization_code_flow

Full OAuth 2.0 Authorization Code flow with PKCE and state

1. **Clicks "Sign in with <Provider>" button** (user) — Triggers GET /auth/signin/{provider}
1. **Construct authorization URL** (auth_service) — Generates state parameter (encrypted, 15-min TTL cookie), PKCE code_verifier + code_challenge if provider.checks includes "pkce", nonce if OIDC and provider.checks includes "nonce". Builds redirect to provider's authorization_endpoint with client_id, redirect_uri, response_type=code, scope, state, code_challenge.

1. **Authenticate user and obtain consent** (oauth_provider) — Provider authenticates the user and shows a consent screen. On approval, redirects to redirect_uri with code and state.

1. **Validate callback and exchange code for tokens** (auth_service) — Validates state cookie matches state param (CSRF check). Validates PKCE code_verifier against stored challenge. POSTs to provider's token_endpoint with code and code_verifier. Receives access_token, refresh_token, id_token, expires_in.

1. **Fetch and normalise user profile** (auth_service) — OIDC: decodes claims from id_token (validated against JWKS). OAuth: requests userinfo endpoint with Bearer access_token. Calls provider.profile(rawProfile, tokens) to map provider-specific fields to standard {id, name, email, image} User shape.

1. **Account linking decision** (auth_service) — Looks up accounts table by (provider, providerAccountId). If found → sign in as that user. If not found and session active → link to current user. If not found and email collision → error (unless allowDangerousEmailAccountLinking). If not found and no collision → create user + link account.

1. **Invoke callback chain and issue session** (auth_service) — Invokes signIn → redirect → jwt → session callbacks in order. Issues JWT (JWE, RS256) stored in __Secure-next-auth.session-token cookie, or creates database session record and issues opaque session token.

1. **Redirected to application** (user) — Browser receives session cookie and is redirected to callbackUrl (validated to be within the application's trusted origin).


## Outcomes

### Configuration_error (Priority: 1) — Error: `CONFIGURATION`

**Given:**
- provider ID in callback path does not match any registered provider

**Then:**
- **emit_event** event: `auth.configuration_error`

**Result:** Request redirected to error page with error=Configuration query parameter.


### Invalid_check (Priority: 2) — Error: `INVALID_CHECK`

**Given:**
- OAuth callback received
- ANY: state cookie missing or does not match state query parameter OR PKCE code_verifier cookie missing or code_challenge mismatch OR OIDC nonce in ID token does not match stored nonce cookie

**Then:**
- **emit_event** event: `auth.invalid_check`

**Result:** Redirect to error page; no session is created.

### Oauth_callback_error (Priority: 3) — Error: `OAUTH_CALLBACK_ERROR`

**Given:**
- OAuth provider returned an error parameter in the callback URL
- e.g. user denied consent, or provider server error

**Then:**
- **emit_event** event: `auth.oauth_callback_error`

**Result:** Redirect to error page with provider error details (user-safe).

### Profile_parse_error (Priority: 4) — Error: `OAUTH_PROFILE_PARSE_ERROR`

**Given:**
- tokens successfully obtained from provider
- provider.profile() throws or returns null/undefined

**Then:**
- **emit_event** event: `auth.profile_parse_error`

**Result:** Redirect to error page; account not created.

### Access_denied (Priority: 5) — Error: `ACCESS_DENIED`

**Given:**
- profile normalised successfully
- signIn callback returned false or a custom error URL

**Then:**
- **emit_event** event: `auth.access_denied`

**Result:** Redirect to error page with error=AccessDenied.

### Email_conflict (Priority: 6) — Error: `OAUTH_ACCOUNT_NOT_LINKED`

**Given:**
- OAuth account not previously seen
- user is NOT currently signed in
- provider.allowDangerousEmailAccountLinking is false or unset
- a user record with the same email address already exists

**Then:**
- **emit_event** event: `auth.account_not_linked`

**Result:** Redirect to error page with error=OAuthAccountNotLinked. User must sign in with their original method first, then link the new provider from their profile settings.


### Provider_account_conflict (Priority: 7) — Error: `OAUTH_ACCOUNT_NOT_LINKED`

**Given:**
- OAuth account already exists in the accounts table
- user IS currently signed in
- the existing account belongs to a different user

**Then:**
- **emit_event** event: `auth.account_not_linked`

**Result:** Redirect to error page with error=OAuthAccountNotLinked. The provider account cannot be reassigned across users.


### Account_linked (Priority: 8)

**Given:**
- user IS currently signed in (active session)
- OAuth account not previously seen for this provider
- signIn callback returned true

**Then:**
- **create_record** target: `accounts`
- **emit_event** event: `auth.link_account`

**Result:** New provider account linked to the currently signed-in user. Existing session updated; user redirected to callbackUrl.


### New_user_registered (Priority: 9)

**Given:**
- OAuth account not previously seen
- user is NOT currently signed in
- no existing user with the same email address (or allowDangerousEmailAccountLinking: true)
- signIn callback returned true

**Then:**
- **create_record** target: `users`
- **create_record** target: `accounts`
- **emit_event** event: `auth.create_user`
- **emit_event** event: `auth.link_account`
- **emit_event** event: `auth.sign_in`

**Result:** New user record and account record created. Session issued (JWT cookie or database session token). User redirected to pages.newUser if configured, otherwise to callbackUrl.


### Sign_in_success (Priority: 10)

**Given:**
- OAuth account exists and is linked to a user
- user is NOT currently signed in (or is signed in as the same user)
- signIn callback returned true

**Then:**
- **emit_event** event: `auth.sign_in`

**Result:** Session issued. JWT strategy: signed JWE stored in HTTP-only cookie (default maxAge 30 days). Database strategy: session record created, opaque token stored in cookie. User redirected to callbackUrl.


## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `CONFIGURATION` | 500 | There is a problem with the server configuration. Check the server logs for more information. | No |
| `ACCESS_DENIED` | 403 | Access denied. | No |
| `OAUTH_ACCOUNT_NOT_LINKED` | 409 | To confirm your identity, sign in with the same account you used originally. | No |
| `OAUTH_CALLBACK_ERROR` | 400 | Try signing in with a different account. | No |
| `OAUTH_PROFILE_PARSE_ERROR` | 500 | Try signing in with a different account. | No |
| `OAUTH_SIGN_IN_ERROR` | 400 | Try signing in with a different account. | No |
| `INVALID_CHECK` | 400 | Try signing in with a different account. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `auth.sign_in` | Fired after every successful sign-in, whether new user or returning. Includes whether the user is newly created.  | `user_id`, `provider`, `provider_account_id`, `is_new_user` |
| `auth.sign_out` | Fired when a user signs out (JWT cookie deleted or database session revoked). | `user_id`, `session_strategy` |
| `auth.create_user` | Fired when a new user record is created in the database. | `user_id`, `email`, `provider` |
| `auth.update_user` | Fired when an existing user record is updated. | `user_id` |
| `auth.link_account` | Fired when a new OAuth account is linked to a user (both new registrations and explicit account linking while signed in).  | `user_id`, `provider`, `provider_account_id`, `access_token` |
| `auth.configuration_error` | Auth system misconfiguration detected (e.g. unknown provider). | `provider`, `error_type` |
| `auth.invalid_check` | CSRF/replay protection check failed during OAuth callback. | `provider`, `check_type` |
| `auth.account_not_linked` | Account linking blocked — email conflict or account already owned by another user.  | `provider`, `reason` |
| `auth.oauth_callback_error` | OAuth provider returned an error in the callback redirect. | `provider`, `error`, `error_description` |
| `auth.profile_parse_error` | Provider profile normalisation failed. | `provider` |
| `auth.access_denied` | signIn callback blocked the user from signing in. | `user_id`, `provider` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| oauth-provider | recommended | Manages registered OAuth provider configurations |
| oauth-oidc-client-management | recommended | OIDC client lifecycle and JWKS management |
| user-federation-ldap-kerberos | optional | Federated enterprise identity alongside social providers |

## AGI Readiness

### Goals

#### Reliable Identity Brokering Social Login

OAuth 2.0 / OIDC social login with multi-provider identity brokering, account linking, and session management


**Success Metrics:**

| Metric | Target | Measurement |
|--------|--------|-------------|
| success_rate | >= 99.5% | Successful sign-ins divided by total sign-in attempts |
| error_recovery_rate | >= 95% | Errors that resolve without manual intervention |
| account_linking_accuracy | = 100% | Zero false-positive account merges |

**Constraints:**

- **security** (non-negotiable): PKCE and state validation must never be skipped
- **availability** (non-negotiable): Must degrade gracefully when a provider is unavailable

### Autonomy

**Level:** `supervised`

**Escalation Triggers:**

- `error_rate > 5`
- `account_not_linked_errors > 10`

### Tradeoffs

| Prefer | Over | Reason |
|--------|------|--------|
| security | convenience | Auto-linking accounts by email without provider trust verification creates account-takeover attack surfaces  |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| sign_in_success | `autonomous` | - | - |
| new_user_registered | `autonomous` | - | - |
| account_linked | `supervised` | - | - |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
tech_stack:
  language: TypeScript
  framework: next-auth / auth.js (framework-agnostic core)
  runtime: Node.js
  oauth_library: oauth4webapi (RFC 6749, RFC 7636, RFC 8017)
  session_options:
    - jwt (JWE, default, no adapter required)
    - database (requires adapter — Prisma, MongoDB, Drizzle, etc.)
  provider_count: 125+ built-in social providers
source:
  repo: https://github.com/nextauthjs/next-auth
  project: NextAuth.js / Auth.js
  core_package: packages/core
  key_files:
    - packages/core/src/providers/oauth.ts
    - packages/core/src/lib/actions/callback/oauth/callback.ts
    - packages/core/src/lib/actions/callback/handle-login.ts
    - packages/core/src/lib/actions/callback/oauth/checks.ts
    - packages/core/src/lib/actions/signin/authorization-url.ts
    - packages/core/src/errors.ts
    - packages/core/src/types.ts
    - packages/core/src/index.ts
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Identity Brokering Social Login Blueprint",
  "description": "OAuth 2.0 / OIDC social login with multi-provider identity brokering, account linking, profile normalization, PKCE/state/nonce CSRF protection, and configurable",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "oauth2, oidc, social-login, identity-brokering, account-linking, pkce, jwt-session"
}
</script>
