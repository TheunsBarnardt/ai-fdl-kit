<!-- AUTO-GENERATED FROM oauth-oidc-client-management.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Oauth Oidc Client Management

> Lifecycle management of OAuth 2.0 and OpenID Connect clients — admin CRUD plus self-service OpenID Connect Dynamic Client Registration (RFC 7591).

**Category:** Integration · **Version:** 2.0.0 · **Tags:** oauth2 · oidc · client-registration · dynamic-registration · rfc7591

## What this does

Lifecycle management of OAuth 2.0 and OpenID Connect clients — admin CRUD plus self-service OpenID Connect Dynamic Client Registration (RFC 7591).

Specifies 15 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **client_id** *(text, optional)* — Client ID
- **client_name** *(text, optional)* — Client Name
- **client_secret** *(password, optional)* — Client Secret
- **redirect_uris** *(text, optional)* — Redirect URIs
- **grant_types** *(multiselect, optional)* — Grant Types
- **response_types** *(multiselect, optional)* — Response Types
- **scope** *(text, optional)* — Scope
- **audience** *(text, optional)* — Audience
- **token_endpoint_auth_method** *(select, optional)* — Token Endpoint Auth Method
- **token_endpoint_auth_signing_alg** *(select, optional)* — Token Endpoint Auth Signing Algorithm
- **jwks_uri** *(url, optional)* — JWK Set URI
- **jwks** *(json, optional)* — JWK Set (inline)
- **subject_type** *(select, optional)* — Subject Type
- **sector_identifier_uri** *(url, optional)* — Sector Identifier URI
- **request_uris** *(text, optional)* — Request URIs
- **request_object_signing_alg** *(text, optional)* — Request Object Signing Algorithm
- **userinfo_signed_response_alg** *(select, optional)* — UserInfo Signed Response Algorithm
- **frontchannel_logout_uri** *(url, optional)* — Front-Channel Logout URI
- **frontchannel_logout_session_required** *(boolean, optional)* — Front-Channel Logout Session Required
- **backchannel_logout_uri** *(url, optional)* — Back-Channel Logout URI
- **backchannel_logout_session_required** *(boolean, optional)* — Back-Channel Logout Session Required
- **post_logout_redirect_uris** *(text, optional)* — Post-Logout Redirect URIs
- **owner** *(text, optional)* — Owner
- **contacts** *(text, optional)* — Contacts
- **policy_uri** *(url, optional)* — Policy URI
- **tos_uri** *(url, optional)* — Terms of Service URI
- **client_uri** *(url, optional)* — Client URI
- **logo_uri** *(url, optional)* — Logo URI
- **allowed_cors_origins** *(text, optional)* — Allowed CORS Origins
- **metadata** *(json, optional)* — Metadata
- **access_token_strategy** *(select, optional)* — Access Token Strategy
- **skip_consent** *(boolean, optional)* — Skip Consent Screen
- **skip_logout_consent** *(boolean, optional)* — Skip Logout Consent Screen
- **authorization_code_grant_access_token_lifespan** *(text, optional)* — AuthCode Access Token Lifespan
- **authorization_code_grant_id_token_lifespan** *(text, optional)* — AuthCode ID Token Lifespan
- **authorization_code_grant_refresh_token_lifespan** *(text, optional)* — AuthCode Refresh Token Lifespan
- **client_credentials_grant_access_token_lifespan** *(text, optional)* — Client Credentials Access Token Lifespan
- **refresh_token_grant_access_token_lifespan** *(text, optional)* — Refresh Token Grant Access Token Lifespan
- **refresh_token_grant_id_token_lifespan** *(text, optional)* — Refresh Token Grant ID Token Lifespan
- **refresh_token_grant_refresh_token_lifespan** *(text, optional)* — Refresh Token Grant Refresh Token Lifespan
- **device_authorization_grant_access_token_lifespan** *(text, optional)* — Device Auth Access Token Lifespan
- **device_authorization_grant_id_token_lifespan** *(text, optional)* — Device Auth ID Token Lifespan
- **device_authorization_grant_refresh_token_lifespan** *(text, optional)* — Device Auth Refresh Token Lifespan
- **created_at** *(datetime, optional)* — Created At
- **updated_at** *(datetime, optional)* — Updated At

## What must be true

- **security → authentication → admin_api:** All /admin/clients/* endpoints are privileged — must be protected by network policy, gateway auth, or service mesh. No built-in auth in handler.
- **security → authentication → dynamic_registration:** /oauth2/register/{id} GET/PUT/DELETE require a valid registration_access_token (Bearer). Validated via HMAC strategy; constant-time compared against stored signature to prevent timing attacks. Source: client/handler.go ValidDynamicAuth()
- **security → authentication → registration_token_rotation:** On every successful PUT to /oauth2/register/{id}, a new registration_access_token is generated and the old one invalidated. Source: client/handler.go setOidcDynamicClient()
- **security → input_validation → secret_minimum_length:** client_secret must be >= 6 chars. Auto-generated secrets are 26 chars. Source: client/validator.go:87
- **security → input_validation → redirect_uri_fragments:** Redirect URIs must not contain fragments (#). Source: client/validator.go — strings.Contains(r, "#")
- **security → input_validation → jwks_mutual_exclusion:** jwks and jwks_uri cannot both be set. Source: client/validator.go:60
- **security → input_validation → private_key_jwt_requirements:** When token_endpoint_auth_method=private_key_jwt, either jwks or jwks_uri must be set. token_endpoint_auth_signing_alg (if set) must be one of: RS256/RS384/RS512/PS256/PS384/PS512/ES256/ES384/ES512. Source: client/validator.go:53-58
- **security → input_validation → uri_scheme_validation:** policy_uri, tos_uri, logo_uri, client_uri must be valid http or https URLs. Source: client/validator.go — URI scheme check loop
- **security → input_validation → cors_origin_format:** allowed_cors_origins must be scheme://host[:port] only — no path, query, fragment, or embedded credentials. Source: client/validator.go — CORS validation loop
- **security → input_validation → post_logout_redirect_uri_match:** Each post_logout_redirect_uri must share scheme, hostname, and port with at least one registered redirect_uri. Source: client/validator.go — ContainsFunc check
- **security → input_validation → sector_identifier_uri_validation:** sector_identifier_uri must be HTTPS. Server fetches it at registration and validates all redirect_uris appear in the returned JSON array. Source: client/validator.go ValidateSectorIdentifierURL()
- **security → input_validation → private_ip_restriction:** When ClientHTTPNoPrivateIPRanges=true (configurable), jwks_uri, backchannel_logout_uri, and request_uris must not resolve to private IP ranges. Source: client/validator.go — ipx.AreAllAssociatedIPsAllowed()
- **security → input_validation → subject_type_validation:** subject_type must be in server's configured subject_types_supported. Defaults to public if supported. Source: client/validator.go
- **security → input_validation → userinfo_alg_validation:** userinfo_signed_response_alg must be none or RS256. Source: client/validator.go:100
- **security → secret_handling → never_return_in_list_or_get:** client_secret is always stripped from GET /admin/clients and GET /admin/clients/{id} responses. Source: client/handler.go — c[k].Secret = "" and c.Secret = ""
- **security → secret_handling → secret_expires_at_always_zero:** client_secret_expires_at is always set to 0 (expiry not supported). Source: client/validator.go — c.SecretExpiresAt = 0
- **security → secret_handling → only_echoed_on_create_update:** Secret is only returned in the response body of create and update operations for non-public clients. Never persisted in plaintext.
- **access → dynamic_registration_disabled_by_default:** /oauth2/register endpoints are disabled by default. Enabled via: oidc.dynamic_client_registration.enabled=true. Source: client/handler.go requireDynamicAuth() + driver/config/provider.go KeyPublicAllowDynamicRegistration
- **access → dynamic_registration_field_restrictions:** Dynamic Client Registration cannot set: client_secret, client_id, metadata, access_token_strategy, skip_consent, skip_logout_consent. Source: client/handler.go createOidcDynamicClient() + ValidateDynamicRegistration()
- **access → dynamic_get_excludes_metadata:** GET /oauth2/register/{id} strips both Secret and Metadata from the response. Source: client/handler.go getOidcDynamicClient() — c.Metadata = nil
- **rate_limiting → admin_write → bucket:** hydra-admin-low
- **rate_limiting → admin_list → bucket:** hydra-admin-medium
- **rate_limiting → admin_get → bucket:** hydra-admin-high
- **rate_limiting → public_dynamic → bucket:** hydra-public-low

## Success & failure scenarios

**✅ Success paths**

- **Client Created** — when admin API caller provides valid client configuration; all validation rules pass, then 201 Created. Full client object returned including client_secret (plaintext, once only) and registration_access_token. Secret is hashed in storage and never retrievable again.
- **Clients Listed** — when optional filters: client_name, owner; optional keyset pagination parameters, then 200 OK. Array of client objects, paginated via Link header (keyset pagination). client_secret stripped from all records. Default page size: 100.
- **Client Retrieved** — when client with given client_id exists, then 200 OK. Full client record. client_secret always omitted.
- **Client Replaced** — when client with given client_id exists; request body passes all validation rules, then 200 OK. Updated client. client_secret echoed if provided in request; existing secret preserved otherwise.
- **Client Patched** — when client with given client_id exists; JSON Patch document is valid (RFC 6902); patch does not attempt to modify the client_id field, then 200 OK. Patched client. client_secret echoed if patch modified it.
- **Client Deleted** — when client with given client_id exists, then 204 No Content.
- **Client Lifespans Updated** — when client with given client_id exists; lifespan values are valid duration strings, then 200 OK. Client returned with updated lifespan values. Only lifespan fields are modified; all other client fields are preserved.
- **Client Registered Dynamic** — when oidc.dynamic_client_registration.enabled = true; request does not include any admin-only fields; all validation rules pass, then 201 Created. Server-assigned client_id and client_secret returned (once only). registration_access_token issued for self-managing this client.
- **Dynamic Client Self Managed** — when oidc.dynamic_client_registration.enabled = true; valid registration_access_token in Authorization header; token signature matches stored signature (constant-time compare), then Client owner can GET (200), PUT (200, token rotated), or DELETE (204) their registration. GET strips client_secret and metadata. PUT issues new registration_access_token.

**❌ Failure paths**

- **Dynamic Registration Disabled** — when oidc.dynamic_client_registration.enabled = false (server default), then 404 Not Found. *(error: `DYNAMIC_REGISTRATION_DISABLED`)*
- **Dynamic Registration Unauthorized** — when registration_access_token missing from Authorization header OR registration_access_token is malformed or expired OR token signature does not match stored signature OR client has no registration access token, then 401 Unauthorized. Generic message to prevent client ID enumeration. *(error: `DYNAMIC_REGISTRATION_UNAUTHORIZED`)*
- **Invalid Redirect Uri** — when a redirect_uri contains a fragment (#) OR a redirect_uri is not a valid URL, then 400 Bad Request. *(error: `INVALID_REDIRECT_URI`)*
- **Dynamic Field Violation** — when dynamic registration request includes client_secret OR dynamic registration request includes metadata OR dynamic registration request sets skip_consent=true OR dynamic registration request sets skip_logout_consent=true OR dynamic registration request sets access_token_strategy, then 400 Bad Request. *(error: `INVALID_REQUEST`)*
- **Invalid Client Metadata** — when private_key_jwt auth without jwks or jwks_uri OR both jwks and jwks_uri are set OR a JWK in the inline jwks set is invalid OR a URI field is not a valid http/https URL OR client_secret is shorter than 6 characters OR userinfo_signed_response_alg is not none or RS256 OR subject_type is not in server's supported list OR allowed_cors_origins entry has a path, query, or credentials OR post_logout_redirect_uri does not match any redirect_uri domain/port/scheme OR sector_identifier_uri is not HTTPS or missing redirect_uris in its array OR jwks_uri, backchannel_logout_uri, or request_uri resolves to private IP range OR access_token_strategy is not jwt or opaque, then 400 Bad Request. *(error: `INVALID_CLIENT_METADATA`)*
- **Client Not Found** — when no client exists with the requested client_id, then 404 Not Found. *(error: `CLIENT_NOT_FOUND`)*

## Errors it can return

- `INVALID_CLIENT_METADATA` — The value of one of the Client Metadata fields is invalid and the server has rejected this request.
- `INVALID_REDIRECT_URI` — The value of one or more redirect_uris is invalid.
- `INVALID_REQUEST` — The request includes an unsupported parameter value or is otherwise malformed.
- `CLIENT_NOT_FOUND` — The requested OAuth 2.0 client does not exist.
- `DYNAMIC_REGISTRATION_UNAUTHORIZED` — The requested OAuth 2.0 client does not exist or you provided incorrect credentials.
- `DYNAMIC_REGISTRATION_DISABLED` — Dynamic client registration is not enabled.

## Connects to

- **oauth-provider** *(required)* — Authorization server that issues tokens using these client registrations.
- **identity-brokering-social-login** *(optional)* — Social login flows consume OAuth 2.0 clients configured here.
- **openid-connect-server** *(recommended)* — Governs token lifespans, supported subject types, and default scopes referenced by client registrations.
- **user-consent-management** *(recommended)* — Consent screen logic triggered during authorization for clients where skip_consent is false.

## Quality fitness 🟢 84/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `█████████░` | 9/10 |
| Outcomes | `██████████████████████░░░` | 22/25 |
| Structured conditions | `████░░░░░░` | 4/10 |
| Error binding | `██████████` | 10/10 |
| Field validation | `█████░░░░░` | 5/10 |
| Relationships | `██████████` | 10/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `████░` | 4/5 |
| Simplicity | `█████` | 5/5 |

📈 **+25** since baseline (59 → 84)

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/integration/oauth-oidc-client-management/) · **Spec source:** [`oauth-oidc-client-management.blueprint.yaml`](./oauth-oidc-client-management.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
