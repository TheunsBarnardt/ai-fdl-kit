---
title: "Oauth Oidc Client Management Blueprint"
layout: default
parent: "Integration"
grand_parent: Blueprint Catalog
description: "Lifecycle management of OAuth 2.0 and OpenID Connect clients — admin CRUD plus self-service OpenID Connect Dynamic Client Registration (RFC 7591). . 45 fields. "
---

# Oauth Oidc Client Management Blueprint

> Lifecycle management of OAuth 2.0 and OpenID Connect clients — admin CRUD plus self-service OpenID Connect Dynamic Client Registration (RFC 7591).


| | |
|---|---|
| **Feature** | `oauth-oidc-client-management` |
| **Category** | Integration |
| **Version** | 2.0.0 |
| **Tags** | oauth2, oidc, client-registration, dynamic-registration, rfc7591 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/integration/oauth-oidc-client-management.blueprint.yaml) |
| **JSON API** | [oauth-oidc-client-management.json]({{ site.baseurl }}/api/blueprints/integration/oauth-oidc-client-management.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `admin_api` | Admin API Consumer | system | Trusted backend operator with full CRUD access via privileged admin endpoints. Can set admin-only fields: metadata, access_token_strategy, skip_consent, skip_logout_consent.  |
| `client_owner` | Client Owner | human | Application developer or automated service that self-registers and manages its own OAuth 2.0 client via the public OIDC Dynamic Client Registration endpoint using a registration_access_token.  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `client_id` | text | No | Client ID |  |
| `client_name` | text | No | Client Name |  |
| `client_secret` | password | No | Client Secret | Validations: minLength |
| `redirect_uris` | text | No | Redirect URIs |  |
| `grant_types` | multiselect | No | Grant Types |  |
| `response_types` | multiselect | No | Response Types |  |
| `scope` | text | No | Scope |  |
| `audience` | text | No | Audience |  |
| `token_endpoint_auth_method` | select | No | Token Endpoint Auth Method |  |
| `token_endpoint_auth_signing_alg` | select | No | Token Endpoint Auth Signing Algorithm |  |
| `jwks_uri` | url | No | JWK Set URI |  |
| `jwks` | json | No | JWK Set (inline) |  |
| `subject_type` | select | No | Subject Type |  |
| `sector_identifier_uri` | url | No | Sector Identifier URI |  |
| `request_uris` | text | No | Request URIs |  |
| `request_object_signing_alg` | text | No | Request Object Signing Algorithm |  |
| `userinfo_signed_response_alg` | select | No | UserInfo Signed Response Algorithm |  |
| `frontchannel_logout_uri` | url | No | Front-Channel Logout URI |  |
| `frontchannel_logout_session_required` | boolean | No | Front-Channel Logout Session Required |  |
| `backchannel_logout_uri` | url | No | Back-Channel Logout URI |  |
| `backchannel_logout_session_required` | boolean | No | Back-Channel Logout Session Required |  |
| `post_logout_redirect_uris` | text | No | Post-Logout Redirect URIs |  |
| `owner` | text | No | Owner |  |
| `contacts` | text | No | Contacts |  |
| `policy_uri` | url | No | Policy URI |  |
| `tos_uri` | url | No | Terms of Service URI |  |
| `client_uri` | url | No | Client URI |  |
| `logo_uri` | url | No | Logo URI |  |
| `allowed_cors_origins` | text | No | Allowed CORS Origins |  |
| `metadata` | json | No | Metadata |  |
| `access_token_strategy` | select | No | Access Token Strategy |  |
| `skip_consent` | boolean | No | Skip Consent Screen |  |
| `skip_logout_consent` | boolean | No | Skip Logout Consent Screen |  |
| `authorization_code_grant_access_token_lifespan` | text | No | AuthCode Access Token Lifespan |  |
| `authorization_code_grant_id_token_lifespan` | text | No | AuthCode ID Token Lifespan |  |
| `authorization_code_grant_refresh_token_lifespan` | text | No | AuthCode Refresh Token Lifespan |  |
| `client_credentials_grant_access_token_lifespan` | text | No | Client Credentials Access Token Lifespan |  |
| `refresh_token_grant_access_token_lifespan` | text | No | Refresh Token Grant Access Token Lifespan |  |
| `refresh_token_grant_id_token_lifespan` | text | No | Refresh Token Grant ID Token Lifespan |  |
| `refresh_token_grant_refresh_token_lifespan` | text | No | Refresh Token Grant Refresh Token Lifespan |  |
| `device_authorization_grant_access_token_lifespan` | text | No | Device Auth Access Token Lifespan |  |
| `device_authorization_grant_id_token_lifespan` | text | No | Device Auth ID Token Lifespan |  |
| `device_authorization_grant_refresh_token_lifespan` | text | No | Device Auth Refresh Token Lifespan |  |
| `created_at` | datetime | No | Created At |  |
| `updated_at` | datetime | No | Updated At |  |

## Rules

- **security:**
  - **authentication:**
    - **admin_api:** All /admin/clients/* endpoints are privileged — must be protected by network policy, gateway auth, or service mesh. No built-in auth in handler.

    - **dynamic_registration:** /oauth2/register/{id} GET/PUT/DELETE require a valid registration_access_token (Bearer). Validated via HMAC strategy; constant-time compared against stored signature to prevent timing attacks. Source: client/handler.go ValidDynamicAuth()

    - **registration_token_rotation:** On every successful PUT to /oauth2/register/{id}, a new registration_access_token is generated and the old one invalidated. Source: client/handler.go setOidcDynamicClient()

  - **input_validation:**
    - **secret_minimum_length:** client_secret must be >= 6 chars. Auto-generated secrets are 26 chars. Source: client/validator.go:87

    - **redirect_uri_fragments:** Redirect URIs must not contain fragments (#). Source: client/validator.go — strings.Contains(r, "#")

    - **jwks_mutual_exclusion:** jwks and jwks_uri cannot both be set. Source: client/validator.go:60

    - **private_key_jwt_requirements:** When token_endpoint_auth_method=private_key_jwt, either jwks or jwks_uri must be set. token_endpoint_auth_signing_alg (if set) must be one of: RS256/RS384/RS512/PS256/PS384/PS512/ES256/ES384/ES512. Source: client/validator.go:53-58

    - **uri_scheme_validation:** policy_uri, tos_uri, logo_uri, client_uri must be valid http or https URLs. Source: client/validator.go — URI scheme check loop

    - **cors_origin_format:** allowed_cors_origins must be scheme://host[:port] only — no path, query, fragment, or embedded credentials. Source: client/validator.go — CORS validation loop

    - **post_logout_redirect_uri_match:** Each post_logout_redirect_uri must share scheme, hostname, and port with at least one registered redirect_uri. Source: client/validator.go — ContainsFunc check

    - **sector_identifier_uri_validation:** sector_identifier_uri must be HTTPS. Server fetches it at registration and validates all redirect_uris appear in the returned JSON array. Source: client/validator.go ValidateSectorIdentifierURL()

    - **private_ip_restriction:** When ClientHTTPNoPrivateIPRanges=true (configurable), jwks_uri, backchannel_logout_uri, and request_uris must not resolve to private IP ranges. Source: client/validator.go — ipx.AreAllAssociatedIPsAllowed()

    - **subject_type_validation:** subject_type must be in server's configured subject_types_supported. Defaults to public if supported. Source: client/validator.go

    - **userinfo_alg_validation:** userinfo_signed_response_alg must be none or RS256. Source: client/validator.go:100

  - **secret_handling:**
    - **never_return_in_list_or_get:** client_secret is always stripped from GET /admin/clients and GET /admin/clients/{id} responses. Source: client/handler.go — c[k].Secret = "" and c.Secret = ""

    - **secret_expires_at_always_zero:** client_secret_expires_at is always set to 0 (expiry not supported). Source: client/validator.go — c.SecretExpiresAt = 0

    - **only_echoed_on_create_update:** Secret is only returned in the response body of create and update operations for non-public clients. Never persisted in plaintext.

- **access:**
  - **dynamic_registration_disabled_by_default:** /oauth2/register endpoints are disabled by default. Enabled via: oidc.dynamic_client_registration.enabled=true. Source: client/handler.go requireDynamicAuth() + driver/config/provider.go KeyPublicAllowDynamicRegistration

  - **dynamic_registration_field_restrictions:** Dynamic Client Registration cannot set: client_secret, client_id, metadata, access_token_strategy, skip_consent, skip_logout_consent. Source: client/handler.go createOidcDynamicClient() + ValidateDynamicRegistration()

  - **dynamic_get_excludes_metadata:** GET /oauth2/register/{id} strips both Secret and Metadata from the response. Source: client/handler.go getOidcDynamicClient() — c.Metadata = nil

- **rate_limiting:**
  - **admin_write:**
    - **bucket:** hydra-admin-low
  - **admin_list:**
    - **bucket:** hydra-admin-medium
  - **admin_get:**
    - **bucket:** hydra-admin-high
  - **public_dynamic:**
    - **bucket:** hydra-public-low

## Outcomes

### Dynamic_registration_disabled (Priority: 1) — Error: `DYNAMIC_REGISTRATION_DISABLED`

**Given:**
- oidc.dynamic_client_registration.enabled = false (server default)

**Result:** 404 Not Found.

### Dynamic_registration_unauthorized (Priority: 1) — Error: `DYNAMIC_REGISTRATION_UNAUTHORIZED`

**Given:**
- ANY: registration_access_token missing from Authorization header OR registration_access_token is malformed or expired OR token signature does not match stored signature OR client has no registration access token

**Result:** 401 Unauthorized. Generic message to prevent client ID enumeration.

### Invalid_redirect_uri (Priority: 1) — Error: `INVALID_REDIRECT_URI`

**Given:**
- ANY: a redirect_uri contains a fragment (#) OR a redirect_uri is not a valid URL

**Result:** 400 Bad Request.

### Dynamic_field_violation (Priority: 1) — Error: `INVALID_REQUEST`

**Given:**
- ANY: dynamic registration request includes client_secret OR dynamic registration request includes metadata OR dynamic registration request sets skip_consent=true OR dynamic registration request sets skip_logout_consent=true OR dynamic registration request sets access_token_strategy

**Result:** 400 Bad Request.

### Invalid_client_metadata (Priority: 2) — Error: `INVALID_CLIENT_METADATA`

**Given:**
- ANY: private_key_jwt auth without jwks or jwks_uri OR both jwks and jwks_uri are set OR a JWK in the inline jwks set is invalid OR a URI field is not a valid http/https URL OR client_secret is shorter than 6 characters OR userinfo_signed_response_alg is not none or RS256 OR subject_type is not in server's supported list OR allowed_cors_origins entry has a path, query, or credentials OR post_logout_redirect_uri does not match any redirect_uri domain/port/scheme OR sector_identifier_uri is not HTTPS or missing redirect_uris in its array OR jwks_uri, backchannel_logout_uri, or request_uri resolves to private IP range OR access_token_strategy is not jwt or opaque

**Result:** 400 Bad Request.

### Client_not_found (Priority: 2) — Error: `CLIENT_NOT_FOUND`

**Given:**
- no client exists with the requested client_id

**Result:** 404 Not Found.

### Client_created (Priority: 5)

**Given:**
- admin API caller provides valid client configuration
- all validation rules pass

**Then:**
- **create_record**
- **emit_event** event: `client.created`
- **set_field** target: `client_secret_expires_at` value: `0`

**Result:** 201 Created. Full client object returned including client_secret (plaintext, once only) and registration_access_token. Secret is hashed in storage and never retrievable again.


### Clients_listed (Priority: 5)

**Given:**
- optional filters: client_name, owner
- optional keyset pagination parameters

**Result:** 200 OK. Array of client objects, paginated via Link header (keyset pagination). client_secret stripped from all records. Default page size: 100.


### Client_retrieved (Priority: 5)

**Given:**
- client with given client_id exists

**Result:** 200 OK. Full client record. client_secret always omitted.

### Client_replaced (Priority: 5)

**Given:**
- client with given client_id exists
- request body passes all validation rules

**Then:**
- **set_field** target: `updated_at` value: `now()`

**Result:** 200 OK. Updated client. client_secret echoed if provided in request; existing secret preserved otherwise.


### Client_patched (Priority: 5)

**Given:**
- client with given client_id exists
- JSON Patch document is valid (RFC 6902)
- patch does not attempt to modify the client_id field

**Then:**
- **set_field** target: `updated_at` value: `now()`

**Result:** 200 OK. Patched client. client_secret echoed if patch modified it.

### Client_deleted (Priority: 5)

**Given:**
- client with given client_id exists

**Then:**
- **delete_record**
- **emit_event** event: `client.deleted`

**Result:** 204 No Content.

### Client_lifespans_updated (Priority: 5)

**Given:**
- client with given client_id exists
- lifespan values are valid duration strings

**Then:**
- **set_field** target: `updated_at` value: `now()`

**Result:** 200 OK. Client returned with updated lifespan values. Only lifespan fields are modified; all other client fields are preserved.


### Client_registered_dynamic (Priority: 5)

**Given:**
- oidc.dynamic_client_registration.enabled = true
- request does not include any admin-only fields
- all validation rules pass

**Then:**
- **create_record**
- **emit_event** event: `client.registered`

**Result:** 201 Created. Server-assigned client_id and client_secret returned (once only). registration_access_token issued for self-managing this client.


### Dynamic_client_self_managed (Priority: 5)

**Given:**
- oidc.dynamic_client_registration.enabled = true
- valid registration_access_token in Authorization header
- token signature matches stored signature (constant-time compare)

**Result:** Client owner can GET (200), PUT (200, token rotated), or DELETE (204) their registration. GET strips client_secret and metadata. PUT issues new registration_access_token.


## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `INVALID_CLIENT_METADATA` | 400 | The value of one of the Client Metadata fields is invalid and the server has rejected this request.  | No |
| `INVALID_REDIRECT_URI` | 400 | The value of one or more redirect_uris is invalid. | No |
| `INVALID_REQUEST` | 400 | The request includes an unsupported parameter value or is otherwise malformed.  | No |
| `CLIENT_NOT_FOUND` | 404 | The requested OAuth 2.0 client does not exist. | No |
| `DYNAMIC_REGISTRATION_UNAUTHORIZED` | 401 | The requested OAuth 2.0 client does not exist or you provided incorrect credentials.  | No |
| `DYNAMIC_REGISTRATION_DISABLED` | 404 | Dynamic client registration is not enabled. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `client.created` | Fired when a new OAuth 2.0 client is registered via the admin API. | `client_id`, `client_name`, `grant_types`, `created_at` |
| `client.registered` | Fired when a client self-registers via OIDC Dynamic Client Registration. | `client_id`, `client_name`, `grant_types`, `created_at`, `registration_client_uri` |
| `client.deleted` | Fired when an OAuth 2.0 client is deleted. | `client_id` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| oauth-provider | required | Authorization server that issues tokens using these client registrations. |
| identity-brokering-social-login | optional | Social login flows consume OAuth 2.0 clients configured here. |
| openid-connect-server | recommended | Governs token lifespans, supported subject types, and default scopes referenced by client registrations.  |
| user-consent-management | recommended | Consent screen logic triggered during authorization for clients where skip_consent is false.  |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
tech_stack:
  language: Go
  framework: net/http (stdlib)
  orm: pop (github.com/gobuffalo/pop)
  database: PostgreSQL
  multi_tenancy: NID-scoped — all client records namespaced per network
  pagination: keyset (github.com/ory/x/pagination/keysetpagination_v2)
  json_patch: github.com/ory/x/jsonx.ApplyJSONPatch — /id path protected
api_endpoints:
  admin:
    - GET    /admin/clients                — list (keyset paginated, filterable)
    - POST   /admin/clients                — create
    - GET    /admin/clients/{id}           — get by ID (secret stripped)
    - PUT    /admin/clients/{id}           — replace
    - PATCH  /admin/clients/{id}           — patch (JSON Patch RFC 6902)
    - DELETE /admin/clients/{id}           — delete
    - PUT    /admin/clients/{id}/lifespans — update token lifespans only
  public_dynamic_registration:
    - POST   /oauth2/register              — self-register (DCR, disabled by
      default)
    - GET    /oauth2/register/{id}         — get own registration (secret +
      metadata stripped)
    - PUT    /oauth2/register/{id}         — update own registration (token
      rotated)
    - DELETE /oauth2/register/{id}         — delete own registration
agi:
  goals:
    - id: reliable_oauth_oidc_client_management
      description: >
        Full lifecycle management of OAuth 2.0 / OIDC clients — admin CRUD and
        self-service Dynamic Client Registration with security invariants
        enforced.
      success_metrics:
        - metric: success_rate
          target: ">= 99.5%"
          measurement: Successful operations divided by total attempts
        - metric: error_recovery_rate
          target: ">= 95%"
          measurement: Errors that auto-recover without manual intervention
      constraints:
        - type: availability
          description: Must degrade gracefully when the database is unavailable.
          negotiable: false
        - type: security
          description: >
            client_secret must never appear in logs, list responses, or GET
            responses. registration_access_token must be rotated on every DCR
            update.
          negotiable: false
  autonomy:
    level: supervised
    escalation_triggers:
      - error_rate > 5
      - secret_leaked_in_logs = true
  safety:
    action_permissions:
      - action: client_created
        permission: autonomous
      - action: client_deleted
        permission: requires_approval
  tradeoffs:
    - prefer: security
      over: convenience
      reason: >
        Secrets are never retrievable after creation — intentional trade-off to
        prevent credential leakage.
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Oauth Oidc Client Management Blueprint",
  "description": "Lifecycle management of OAuth 2.0 and OpenID Connect clients — admin CRUD plus self-service OpenID Connect Dynamic Client Registration (RFC 7591).\n. 45 fields. ",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "oauth2, oidc, client-registration, dynamic-registration, rfc7591"
}
</script>
