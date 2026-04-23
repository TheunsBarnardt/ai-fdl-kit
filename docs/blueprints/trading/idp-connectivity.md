---
title: "Idp Connectivity Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "JSE Information Delivery Portal (IDP) FTP connectivity for secure access to market data files. 6 fields. 4 outcomes. 5 error codes. rules: protocol_support, aut"
---

# Idp Connectivity Blueprint

> JSE Information Delivery Portal (IDP) FTP connectivity for secure access to market data files

| | |
|---|---|
| **Feature** | `idp-connectivity` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | connectivity, idp, ftp, data-delivery, market-data, ftps, sftp |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/idp-connectivity.blueprint.yaml) |
| **JSON API** | [idp-connectivity.json]({{ site.baseurl }}/api/blueprints/trading/idp-connectivity.json) |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `connection_protocol` | select | Yes | File transfer protocol for IDP access |  |
| `environment` | select | Yes | IDP server environment |  |
| `network_access_method` | select | Yes | Network access method |  |
| `tls_minimum_version` | select | Yes | Minimum TLS version for FTPS |  |
| `username_type` | select | Yes | Type of user account |  |
| `credentials_embedded` | boolean | Yes | Credentials embedded in automation scripts |  |

## Rules

- **protocol_support:**
  - **ftps_requirement:** FTPS (File Transfer Protocol with TLS) required for secure access
  - **ftps_port_production:** FTPS uses TCP port 990 for production IDP (passive mode)
  - **sftp_requirement:** SFTP supported for internet access only via TCP port 22
  - **tls_minimum_version:** TLS 1.1 minimum; TLS 1.0, SSL 2.0, SSL 3.0 prohibited
- **authentication:**
  - **service_account_requirement:** Automated downloads MUST use company-level service account
  - **individual_user_account:** Manual downloads require individual user account for each person
  - **no_credential_sharing:** No sharing of credentials allowed between users
- **credential_storage:**
  - **configuration_file_requirement:** Store service account credentials in configuration file
  - **never_embed_in_code:** MUST NOT embed credentials in automation scripts

## Outcomes

### Idp_protocol_selected (Priority: 1)

**Given:**
- `connection_protocol` (input) exists

**Then:**
- **emit_event** event: `idp.protocol.selected`

**Result:** IDP connection protocol selected with appropriate security

### Ftps_connection_configured (Priority: 2)

**Given:**
- `connection_protocol` (input) eq `ftps_implicit_tls`
- `tls_minimum_version` (input) exists

**Then:**
- **emit_event** event: `idp.ftps.configured`

**Result:** FTPS configured with implicit TLS on TCP port 990

### Service_account_provisioned (Priority: 3)

**Given:**
- `username_type` (input) eq `company_level_service_account`
- `credentials_embedded` (input) eq `false`

**Then:**
- **emit_event** event: `idp.service_account.provisioned`

**Result:** Service account provisioned for automated downloads

### Idp_connectivity_established (Priority: 10)

**Given:**
- `connection_protocol` (input) exists
- `environment` (input) exists

**Then:**
- **emit_event** event: `idp.connectivity.established`

**Result:** Complete IDP connectivity established with secure protocol

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `IDP_PROTOCOL_NOT_SUPPORTED` | 400 | Selected protocol not supported for this environment | No |
| `IDP_TLS_VERSION_UNSUPPORTED` | 400 | TLS version unsupported; minimum TLS 1.1 required | No |
| `IDP_AUTHENTICATION_FAILED` | 401 | IDP authentication failed; verify username and password | No |
| `IDP_CONNECTION_FAILED` | 500 | Unable to establish IDP connection | No |
| `IDP_CREDENTIAL_EMBEDDED_IN_CODE` | 400 | Credentials embedded in code; security risk; use configuration file | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `idp.protocol.selected` | IDP connection protocol selected | `protocol`, `tls_version`, `port`, `timestamp` |
| `idp.ftps.configured` | FTPS configured with implicit TLS | `tls_version`, `port_990`, `timestamp` |
| `idp.service_account.provisioned` | Service account created for automated downloads | `username`, `rotation_schedule_annual`, `timestamp` |
| `idp.connectivity.established` | Complete IDP connectivity established | `environment`, `protocol`, `timestamp` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| network-configuration-guide | required | Network must support routing to IDP servers |
| client-connectivity-standards | required | Client must meet JSE connectivity standards |

## AGI Readiness

### Goals

#### Reliable Idp Connectivity

JSE Information Delivery Portal (IDP) FTP connectivity for secure access to market data files

**Success Metrics:**

| Metric | Target | Measurement |
|--------|--------|-------------|
| policy_violation_rate | 0% | Operations that violate defined policies |
| audit_completeness | 100% | All decisions have complete audit trails |

**Constraints:**

- **regulatory** (non-negotiable): All operations must be auditable and traceable

### Autonomy

**Level:** `supervised`

**Human Checkpoints:**

- before making irreversible changes

**Escalation Triggers:**

- `error_rate > 5`
- `consecutive_failures > 3`

### Verification

**Invariants:**

- error messages never expose internal system details

### Tradeoffs

| Prefer | Over | Reason |
|--------|------|--------|
| accuracy | latency | trading operations require precise execution and full audit trails |

### Coordination

**Protocol:** `request_response`

**Consumes:**

| Capability | From | Fallback |
|------------|------|----------|
| `network_configuration_guide` | network-configuration-guide | fail |
| `client_connectivity_standards` | client-connectivity-standards | fail |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| idp_protocol_selected | `autonomous` | - | - |
| ftps_connection_configured | `autonomous` | - | - |
| service_account_provisioned | `autonomous` | - | - |
| idp_connectivity_established | `autonomous` | - | - |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Idp Connectivity Blueprint",
  "description": "JSE Information Delivery Portal (IDP) FTP connectivity for secure access to market data files. 6 fields. 4 outcomes. 5 error codes. rules: protocol_support, aut",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "connectivity, idp, ftp, data-delivery, market-data, ftps, sftp"
}
</script>
