<!-- AUTO-GENERATED FROM identity-brokering-social-login.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Identity Brokering Social Login

> OAuth 2.0 / OIDC social login with multi-provider identity brokering, account linking, profile normalization, PKCE/state/nonce CSRF protection, and configurable JWT or database session strategy.

**Category:** Integration · **Version:** 2.0.0 · **Tags:** oauth2 · oidc · social-login · identity-brokering · account-linking · pkce · jwt-session

## What this does

OAuth 2.0 / OIDC social login with multi-provider identity brokering, account linking, profile normalization, PKCE/state/nonce CSRF protection, and configurable JWT or database session strategy.

Combines technical outcomes (acceptance criteria) with documented business flows, so engineering and operations share one source of truth.

## Fields

- **provider** *(text, required)* — Provider ID
- **client_id** *(text, required)* — Client ID
- **provider_account_id** *(text, required)* — Provider Account ID
- **access_token** *(token, optional)* — Access Token
- **refresh_token** *(token, optional)* — Refresh Token
- **expires_at** *(number, optional)* — Token Expiry
- **scope** *(text, optional)* — Granted Scopes
- **token_type** *(text, optional)* — Token Type
- **id_token** *(token, optional)* — OIDC ID Token
- **session_strategy** *(select, optional)* — Session Strategy

## What must be true

- **security:** SHOULD: require trustHost=true in reverse-proxy environments to ensure the redirect_uri is constructed from the correct host header
- **security → MUST:** generate a cryptographically random state parameter for every authorization request; validate it on callback to prevent CSRF
- **security → MUST:** support PKCE (RFC 7636) when provider.checks includes "pkce"; store code_verifier in an encrypted cookie and verify on callback
- **security → MUST:** generate and validate a nonce for OIDC providers when provider.checks includes "nonce", to prevent ID token replay
- **security → MUST:** store PKCE, state, and nonce values only in HTTP-only, encrypted cookies with SameSite=Lax; never expose them in URLs or response bodies
- **security → MUST:** sanitise the callbackUrl redirect target; reject destinations outside the application's trusted origin to prevent open redirects
- **security → MUST NOT:** automatically link a newly seen OAuth account to an existing user record by email address unless allowDangerousEmailAccountLinking is explicitly set to true for that provider
- **security → MUST NOT:** allow an OAuth account already linked to user A to be linked to user B; throw OAuthAccountNotLinked instead
- **access:** All endpoints under the /auth/* route prefix are public (no prior session required), The signIn callback MAY block specific users by returning false; the result is surfaced as an AccessDenied error to the client

## Success & failure scenarios

**✅ Success paths**

- **Account Linked** — when user IS currently signed in (active session); OAuth account not previously seen for this provider; signIn callback returned true, then New provider account linked to the currently signed-in user. Existing session updated; user redirected to callbackUrl.
- **New User Registered** — when OAuth account not previously seen; user is NOT currently signed in; no existing user with the same email address (or allowDangerousEmailAccountLinking: true); signIn callback returned true, then New user record and account record created. Session issued (JWT cookie or database session token). User redirected to pages.newUser if configured, otherwise to callbackUrl.
- **Sign In Success** — when OAuth account exists and is linked to a user; user is NOT currently signed in (or is signed in as the same user); signIn callback returned true, then Session issued. JWT strategy: signed JWE stored in HTTP-only cookie (default maxAge 30 days). Database strategy: session record created, opaque token stored in cookie. User redirected to callbackUrl.

**❌ Failure paths**

- **Configuration Error** — when provider ID in callback path does not match any registered provider, then Request redirected to error page with error=Configuration query parameter. *(error: `CONFIGURATION`)*
- **Invalid Check** — when OAuth callback received; state cookie missing or does not match state query parameter OR PKCE code_verifier cookie missing or code_challenge mismatch OR OIDC nonce in ID token does not match stored nonce cookie, then Redirect to error page; no session is created. *(error: `INVALID_CHECK`)*
- **Oauth Callback Error** — when OAuth provider returned an error parameter in the callback URL; e.g. user denied consent, or provider server error, then Redirect to error page with provider error details (user-safe). *(error: `OAUTH_CALLBACK_ERROR`)*
- **Profile Parse Error** — when tokens successfully obtained from provider; provider.profile() throws or returns null/undefined, then Redirect to error page; account not created. *(error: `OAUTH_PROFILE_PARSE_ERROR`)*
- **Access Denied** — when profile normalised successfully; signIn callback returned false or a custom error URL, then Redirect to error page with error=AccessDenied. *(error: `ACCESS_DENIED`)*
- **Email Conflict** — when OAuth account not previously seen; user is NOT currently signed in; provider.allowDangerousEmailAccountLinking is false or unset; a user record with the same email address already exists, then Redirect to error page with error=OAuthAccountNotLinked. User must sign in with their original method first, then link the new provider from their profile settings. *(error: `OAUTH_ACCOUNT_NOT_LINKED`)*
- **Provider Account Conflict** — when OAuth account already exists in the accounts table; user IS currently signed in; the existing account belongs to a different user, then Redirect to error page with error=OAuthAccountNotLinked. The provider account cannot be reassigned across users. *(error: `OAUTH_ACCOUNT_NOT_LINKED`)*

## Business flows

**Oauth Authorization Code Flow** — Full OAuth 2.0 Authorization Code flow with PKCE and state

1. **Clicks "Sign in with <Provider>" button** *(user)* — Triggers GET /auth/signin/{provider}
1. **Construct authorization URL** *(auth_service)* — Generates state parameter (encrypted, 15-min TTL cookie), PKCE code_verifier + code_challenge if provider.checks includes "pkce", nonce if OIDC and provider.checks includes "nonce". Builds redirect to provider's authorization_endpoint with client_id, redirect_uri, response_type=code, scope, state, code_challenge.
1. **Authenticate user and obtain consent** *(oauth_provider)* — Provider authenticates the user and shows a consent screen. On approval, redirects to redirect_uri with code and state.
1. **Validate callback and exchange code for tokens** *(auth_service)* — Validates state cookie matches state param (CSRF check). Validates PKCE code_verifier against stored challenge. POSTs to provider's token_endpoint with code and code_verifier. Receives access_token, refresh_token, id_token, expires_in.
1. **Fetch and normalise user profile** *(auth_service)* — OIDC: decodes claims from id_token (validated against JWKS). OAuth: requests userinfo endpoint with Bearer access_token. Calls provider.profile(rawProfile, tokens) to map provider-specific fields to standard {id, name, email, image} User shape.
1. **Account linking decision** *(auth_service)* — Looks up accounts table by (provider, providerAccountId). If found → sign in as that user. If not found and session active → link to current user. If not found and email collision → error (unless allowDangerousEmailAccountLinking). If not found and no collision → create user + link account.
1. **Invoke callback chain and issue session** *(auth_service)* — Invokes signIn → redirect → jwt → session callbacks in order. Issues JWT (JWE, RS256) stored in __Secure-next-auth.session-token cookie, or creates database session record and issues opaque session token.
1. **Redirected to application** *(user)* — Browser receives session cookie and is redirected to callbackUrl (validated to be within the application's trusted origin).

## Errors it can return

- `CONFIGURATION` — There is a problem with the server configuration. Check the server logs for more information.
- `ACCESS_DENIED` — Access denied.
- `OAUTH_ACCOUNT_NOT_LINKED` — To confirm your identity, sign in with the same account you used originally.
- `OAUTH_CALLBACK_ERROR` — Try signing in with a different account.
- `OAUTH_PROFILE_PARSE_ERROR` — Try signing in with a different account.
- `OAUTH_SIGN_IN_ERROR` — Try signing in with a different account.
- `INVALID_CHECK` — Try signing in with a different account.

## Events

**`auth.sign_in`** — Fired after every successful sign-in, whether new user or returning. Includes whether the user is newly created.

  Payload: `user_id`, `provider`, `provider_account_id`, `is_new_user`

**`auth.sign_out`** — Fired when a user signs out (JWT cookie deleted or database session revoked).
  Payload: `user_id`, `session_strategy`

**`auth.create_user`** — Fired when a new user record is created in the database.
  Payload: `user_id`, `email`, `provider`

**`auth.update_user`** — Fired when an existing user record is updated.
  Payload: `user_id`

**`auth.link_account`** — Fired when a new OAuth account is linked to a user (both new registrations and explicit account linking while signed in).

  Payload: `user_id`, `provider`, `provider_account_id`, `access_token`

**`auth.configuration_error`** — Auth system misconfiguration detected (e.g. unknown provider).
  Payload: `provider`, `error_type`

**`auth.invalid_check`** — CSRF/replay protection check failed during OAuth callback.
  Payload: `provider`, `check_type`

**`auth.account_not_linked`** — Account linking blocked — email conflict or account already owned by another user.

  Payload: `provider`, `reason`

**`auth.oauth_callback_error`** — OAuth provider returned an error in the callback redirect.
  Payload: `provider`, `error`, `error_description`

**`auth.profile_parse_error`** — Provider profile normalisation failed.
  Payload: `provider`

**`auth.access_denied`** — signIn callback blocked the user from signing in.
  Payload: `user_id`, `provider`

## Connects to

- **oauth-provider** *(recommended)* — Manages registered OAuth provider configurations
- **oauth-oidc-client-management** *(recommended)* — OIDC client lifecycle and JWKS management
- **user-federation-ldap-kerberos** *(optional)* — Federated enterprise identity alongside social providers

## Quality fitness 🟢 83/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `████████░░` | 8/10 |
| Outcomes | `████████████████████████░` | 24/25 |
| Structured conditions | `████░░░░░░` | 4/10 |
| Error binding | `█████████░` | 9/10 |
| Field validation | `███████░░░` | 7/10 |
| Relationships | `█████████░` | 9/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `██░░░` | 2/5 |
| Simplicity | `█████` | 5/5 |

📈 **+24** since baseline (59 → 83)

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/integration/identity-brokering-social-login/) · **Spec source:** [`identity-brokering-social-login.blueprint.yaml`](./identity-brokering-social-login.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
