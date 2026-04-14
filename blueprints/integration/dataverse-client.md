<!-- AUTO-GENERATED FROM dataverse-client.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Dataverse Client

> Enterprise service client for connecting to Microsoft Dataverse, managing authentication, executing CRUD operations on entities, batch processing, and discovery of available organizations

**Category:** Integration · **Version:** 1.0.0 · **Tags:** crm · cloud · dataverse · enterprise · entity-management · async-first · sdk

## What this does

Enterprise service client for connecting to Microsoft Dataverse, managing authentication, executing CRUD operations on entities, batch processing, and discovery of available organizations

Specifies 21 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **service_uri** *(url, required)* — Dataverse Instance URL
- **authentication_type** *(select, required)* — Authentication Type
- **username** *(email, optional)* — Username
- **password** *(password, optional)* — Password
- **client_id** *(text, required)* — Client / Application ID
- **client_secret** *(password, optional)* — Client Secret
- **redirect_uri** *(url, optional)* — Redirect URI
- **prompt_behavior** *(select, optional)* — Login Prompt
- **certificate_thumbprint** *(text, optional)* — Certificate Thumbprint
- **certificate_store_name** *(select, optional)* — Certificate Store
- **token_cache_path** *(text, optional)* — Token Cache Path
- **access_token_provider** *(text, optional)* — Token Provider Function
- **custom_headers_provider** *(text, optional)* — Custom Headers Function
- **domain** *(text, optional)* — Windows Domain
- **home_realm_uri** *(url, optional)* — Home Realm URI
- **use_current_user** *(boolean, optional)* — Use Current Windows User
- **skip_discovery** *(boolean, optional)* — Skip Organization Discovery
- **require_unique_instance** *(boolean, optional)* — Require Unique Instance
- **batch_id** *(text, optional)* — Batch ID
- **batch_return_results** *(boolean, optional)* — Batch Return Results
- **batch_continue_on_error** *(boolean, optional)* — Batch Continue on Error
- **entity_name** *(text, optional)* — Entity Name
- **record_id** *(text, optional)* — Record ID (GUID)
- **columns_to_retrieve** *(text, optional)* — Columns to Retrieve
- **filter_criteria** *(text, optional)* — Filter Criteria
- **sort_order** *(text, optional)* — Sort Order
- **page_size** *(number, optional)* — Page Size
- **relationship_name** *(text, optional)* — Relationship Name
- **related_entity_ids** *(text, optional)* — Related Entity IDs
- **request_body** *(json, optional)* — Request Body
- **response_body** *(json, optional)* — Response Body
- **http_method** *(select, optional)* — HTTP Method
- **query_string** *(text, optional)* — Query String
- **custom_headers** *(json, optional)* — Custom Headers
- **enable_logging** *(boolean, optional)* — Enable Logging
- **log_file_path** *(text, optional)* — Log File Path
- **in_memory_logging** *(boolean, optional)* — In-Memory Logging
- **log_retention_minutes** *(number, optional)* — Log Retention (Minutes)
- **msal_log_pii** *(boolean, optional)* — Log PII in MSAL

## What must be true

- **security → authentication:** OAuth is the recommended authentication type for cloud (Dataverse online) scenarios, Client Secret and Certificate auth are suitable for service-to-service scenarios, Interactive username/password auth is supported for user-interactive applications, Active Directory auth is limited to on-premises Dataverse deployments, Token cache must be stored securely (file permissions: 0600 / owner-only access), Client secrets must never be hardcoded; use environment variables or secure vaults, Certificate-based auth requires the certificate private key to be available locally
- **security → rate_limiting:** Dataverse enforces API throttling (429 Too Many Requests) when request volume exceeds service limits, Default retry logic includes exponential backoff for concurrency throttling, Affinity cookie (enabled by default) improves throttling by routing requests to consistent node, Disable affinity cookie only when required by load balancing scenarios
- **security → input_validation:** Entity names must be valid logical names (checked against metadata), Record IDs must be valid GUIDs (validated at SDK level), Column names must exist in entity schema or 'all' wildcard can be used, Relationship names must exist in organization metadata, Filter criteria must be valid OData or FetchXml syntax
- **reliability → retry_behavior:** Default max retry count: 10 (configurable), Default retry delay: 5 seconds between attempts (configurable), Exponential backoff can be enabled for throttling scenarios, Retries occur automatically for transient failures (network timeouts, service throttling), Non-transient errors (invalid credentials, record not found) do not retry
- **reliability → batch_constraints:** Maximum 5,000 requests per batch, Maximum 50,000 concurrent batches, Single batch request limit: 10 MB payload, Batch response includes individual request results; failures do not rollback entire batch unless transaction: true, Continue-on-error flag allows batch to proceed if individual requests fail
- **reliability → connection_pooling:** By default, service clients are pooled and reused within the same process, Setting require_unique_instance: true creates a new client instance (useful for multi-user scenarios), Each connection maintains its own authentication state and caching
- **observability → logging:** TraceLogger captures all SDK operations (connection, auth, API calls, errors), In-memory log collection must be explicitly enabled (can impact memory), Log files are rotated based on size and retention policy, PII logging is disabled by default (enable only in development)

## Success & failure scenarios

**✅ Success paths**

- **Establish Connection** — when service_uri exists; authentication_type exists; client_id exists, then Service client connected and authenticated to Dataverse.
- **Discover Organizations** — when authentication_type exists; client_id exists, then List of available Dataverse organizations returned with metadata.
- **Create Record** — when connection_state eq "authenticated"; entity_name exists, then New record created; record ID returned.
- **Retrieve Record** — when connection_state eq "authenticated"; entity_name exists; record_id exists, then Entity record returned with specified columns.
- **Query Records** — when connection_state eq "authenticated"; entity_name exists, then Entity collection returned with matching records.
- **Update Record** — when connection_state eq "authenticated"; record_id exists, then Record updated successfully.
- **Delete Record** — when connection_state eq "authenticated"; record_id exists, then Record deleted successfully.
- **Associate Entities** — when connection_state eq "authenticated"; relationship_name exists; record_id exists, then Entities associated successfully via relationship.
- **Disassociate Entities** — when connection_state eq "authenticated"; relationship_name exists, then Association removed successfully.
- **Execute Batch** — when connection_state eq "authenticated"; batch_id exists, then Batch results returned with individual request status.
- **Execute Organization Request** — when connection_state eq "authenticated", then Organization request executed and response returned.
- **Execute Web Request** — when connection_state eq "authenticated"; http_method exists; query_string exists, then HTTP response returned from Web API.
- **Retrieve Connection Metadata** — when connection_state eq "authenticated", then Organization metadata returned (name, ID, version).
- **Clone Connection** — when connection_state eq "authenticated", then New service client instance created with same configuration.
- **Dispose Connection** — when connection_state eq "authenticated", then Service client disposed and resources released.

**❌ Failure paths**

- **Connection Failed** — when connection_state eq "connection_failed", then Connection attempt failed due to invalid credentials or network issue. *(error: `CONNECTION_FAILED`)*
- **Record Not Found** — when record_id exists, then Record with specified ID not found. *(error: `RECORD_NOT_FOUND`)*
- **Insufficient Permissions** — Operation denied due to insufficient permissions. *(error: `INSUFFICIENT_PERMISSIONS`)*
- **Relationship Not Found** — when relationship_name exists, then Relationship not found in organization metadata. *(error: `RELATIONSHIP_NOT_FOUND`)*
- **Batch Limit Exceeded** — when batch_id exists, then Batch size exceeds maximum (5000 requests per batch). *(error: `BATCH_LIMIT_EXCEEDED`)*
- **Rate Limited** — when Dataverse throttling limit exceeded, then Request failed with 429 Too Many Requests. *(error: `RATE_LIMITED`)*

## Errors it can return

- `CONNECTION_FAILED` — Failed to establish connection to Dataverse. Check service URI, credentials, and network connectivity.
- `AUTHENTICATION_FAILED` — Authentication failed. Verify credentials, client ID, client secret, or certificate.
- `INVALID_CREDENTIALS` — Provided credentials are invalid or expired.
- `RATE_LIMITED` — Dataverse service throttling limit exceeded. Retry after specified delay.
- `RECORD_NOT_FOUND` — Entity record with specified ID not found.
- `INSUFFICIENT_PERMISSIONS` — User lacks required permissions for this operation.
- `INVALID_ENTITY_NAME` — Specified entity name is not valid or does not exist in organization.
- `INVALID_COLUMN_NAME` — Specified column/attribute name does not exist in entity schema.
- `INVALID_QUERY` — Query criteria is malformed or invalid OData/FetchXml syntax.
- `RELATIONSHIP_NOT_FOUND` — Specified relationship does not exist in organization metadata.
- `BATCH_PARTIAL_FAILURE` — One or more requests in batch failed while continue-on-error was false.
- `BATCH_LIMIT_EXCEEDED` — Batch size exceeds 5000 requests or concurrent batch limit exceeded.
- `ORGANIZATION_REQUEST_FAILED` — Organization request is invalid or not supported.
- `DISCOVERY_FAILED` — Organization discovery failed. Verify discovery service endpoint and credentials.
- `NETWORK_TIMEOUT` — Network timeout while communicating with Dataverse. Check connectivity.
- `INVALID_TOKEN` — Provided access token is invalid or expired.
- `MSAL_TIMEOUT` — Azure AD token acquisition timed out after 30 seconds.
- `CERTIFICATE_NOT_FOUND` — Certificate with specified thumbprint not found in Windows certificate store.

## Events

**`connection.initiated`** — Service client initialization started
  Payload: `service_uri`, `authentication_type`

**`connection.established`** — Successfully connected and authenticated to Dataverse
  Payload: `service_uri`, `organization_id`, `organization_name`

**`connection.failed`** — Connection attempt failed
  Payload: `error_code`, `error_message`

**`connection.disposed`** — Service client connection closed and resources released
  Payload: `timestamp`

**`discovery.started`** — Organization discovery operation initiated
  Payload: `discovery_uri`

**`discovery.completed`** — Organization discovery completed
  Payload: `organization_count`

**`record.created`** — Entity record successfully created
  Payload: `entity_name`, `record_id`, `created_timestamp`

**`record.retrieved`** — Entity record successfully retrieved
  Payload: `entity_name`, `record_id`, `column_count`

**`records.queried`** — Multiple records retrieved via query
  Payload: `entity_name`, `filter_criteria`, `result_count`, `page_size`

**`record.updated`** — Entity record successfully updated
  Payload: `entity_name`, `record_id`, `updated_fields`

**`record.deleted`** — Entity record successfully deleted
  Payload: `entity_name`, `record_id`

**`entities.associated`** — Two entities associated via relationship
  Payload: `relationship_name`, `entity_id`, `related_entity_count`

**`entities.disassociated`** — Association between entities removed
  Payload: `relationship_name`, `entity_id`

**`batch.created`** — Batch operation created and ready for requests
  Payload: `batch_id`, `batch_name`

**`batch.execution.started`** — Batch execution initiated
  Payload: `batch_id`, `request_count`

**`batch.execution.completed`** — Batch execution finished
  Payload: `batch_id`, `successful_count`, `failed_count`

**`organization.request.executed`** — Organization-level request executed
  Payload: `request_type`, `request_status`

**`web.request.executed`** — Raw HTTP request to Web API executed
  Payload: `http_method`, `endpoint`, `http_status`

**`throttling.detected`** — Dataverse throttling limit detected
  Payload: `retry_after_seconds`, `current_request_rate`

**`authentication.token.refreshed`** — OAuth access token refreshed
  Payload: `token_expiry`

**`logging.enabled`** — Trace logging started
  Payload: `log_file_path`

## Connects to

- **api-query-builder** *(recommended)* — Build OData and FetchXml queries for complex filtering
- **data-migration-tools** *(optional)* — Export/import entity data using Service Client
- **plugin-development** *(optional)* — Service Client used in Dataverse plugins and custom workflows
- **webhook-integration** *(optional)* — Receive Dataverse events and respond via Service Client

## Quality fitness 🟢 82/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `████████░░` | 8/10 |
| Outcomes | `█████████████████████░░░░` | 21/25 |
| Structured conditions | `██████████` | 10/10 |
| Error binding | `█████░░░░░` | 5/10 |
| Field validation | `█████░░░░░` | 5/10 |
| Relationships | `██████████` | 10/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `████░` | 4/5 |
| Simplicity | `████░` | 4/5 |

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/integration/dataverse-client/) · **Spec source:** [`dataverse-client.blueprint.yaml`](./dataverse-client.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
