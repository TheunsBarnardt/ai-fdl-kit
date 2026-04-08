---
title: "Local To Public Server Blueprint"
layout: default
parent: "Infrastructure"
grand_parent: Blueprint Catalog
description: "Transform a local Ubuntu PC into a fully functional, hardened, publicly accessible server with web hosting, database, email, SSL, monitoring, and automated back"
---

# Local To Public Server Blueprint

> Transform a local Ubuntu PC into a fully functional, hardened, publicly accessible server with web hosting, database, email, SSL, monitoring, and automated backups

| | |
|---|---|
| **Feature** | `local-to-public-server` |
| **Category** | Infrastructure |
| **Version** | 1.0.0 |
| **Tags** | server, ubuntu, linux, self-hosted, networking, dns, ssl, security, monitoring, backup, web-server, database, email, firewall |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/infrastructure/local-to-public-server.blueprint.yaml) |
| **JSON API** | [local-to-public-server.json]({{ site.baseurl }}/api/blueprints/infrastructure/local-to-public-server.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `setup_automation` | Setup Automation | system | Automated provisioning scripts that configure the entire server stack |
| `server` | Ubuntu Server | system | The local Ubuntu PC being converted to a public server |
| `dns_provider` | DNS Provider | external | Domain registrar or DNS service (Cloudflare, Route53, Namecheap) |
| `certificate_authority` | Certificate Authority | external | Let's Encrypt — free automated SSL certificate issuance and renewal |
| `monitoring_agent` | Monitoring Agent | system | Collects metrics, logs, and health status — alerts on problems |
| `backup_agent` | Backup Agent | system | Automated backup system — local snapshots + offsite replication |
| `admin` | Server Administrator | human | Owner who manages the server — receives alerts, performs maintenance |
| `visitor` | Public Visitor | external | Anyone accessing the server's public services (web, API, email) |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `public_ip` | text | Yes | Public IP Address | Validations: pattern |
| `domain_name` | text | Yes | Domain Name | Validations: required, pattern |
| `subdomains` | json | No | Subdomains |  |
| `ddns_enabled` | boolean | Yes | Dynamic DNS Enabled |  |
| `ddns_provider` | select | No | DDNS Provider |  |
| `router_port_forwarding` | json | Yes | Port Forwarding Rules |  |
| `ipv6_enabled` | boolean | No | IPv6 Enabled |  |
| `ssl_email` | email | Yes | SSL Certificate Email | Validations: email |
| `ssl_provider` | select | Yes | SSL Provider |  |
| `ssl_auto_renew` | boolean | Yes | Auto-Renew SSL |  |
| `web_server` | select | Yes | Web Server |  |
| `web_root` | text | Yes | Web Root Directory |  |
| `reverse_proxy_targets` | json | No | Reverse Proxy Targets |  |
| `database_engine` | select | Yes | Database Engine |  |
| `database_name` | text | No | Default Database Name |  |
| `database_remote_access` | boolean | No | Allow Remote Database Access |  |
| `email_server_enabled` | boolean | No | Email Server Enabled |  |
| `email_server_type` | select | No | Email Server |  |
| `ssh_port` | number | Yes | SSH Port | Validations: min, max |
| `ssh_key_only` | boolean | Yes | SSH Key-Only Authentication |  |
| `fail2ban_enabled` | boolean | Yes | Fail2Ban Enabled |  |
| `ufw_enabled` | boolean | Yes | UFW Firewall Enabled |  |
| `unattended_upgrades` | boolean | Yes | Unattended Security Upgrades |  |
| `monitoring_enabled` | boolean | Yes | Monitoring Enabled |  |
| `monitoring_stack` | select | No | Monitoring Stack |  |
| `alert_email` | email | Yes | Alert Email | Validations: email |
| `backup_enabled` | boolean | Yes | Automated Backups Enabled |  |
| `backup_schedule` | text | No | Backup Schedule (cron) |  |
| `backup_retention_days` | number | No | Backup Retention (days) |  |
| `backup_offsite` | boolean | No | Offsite Backup Enabled |  |
| `backup_offsite_target` | select | No | Offsite Backup Target |  |
| `setup_status` | select | Yes | Setup Status |  |

## States

**State field:** `setup_status`

**Values:**

| State | Initial | Terminal |
|-------|---------|----------|
| `not_started` | Yes |  |
| `system_updated` |  |  |
| `security_hardened` |  |  |
| `services_installed` |  |  |
| `ssl_configured` |  |  |
| `dns_configured` |  |  |
| `monitoring_active` |  |  |
| `backups_configured` |  |  |
| `fully_operational` |  |  |
| `degraded` |  |  |

**Transitions:**

| Name | From | To | Actor | Condition |
|------|------|----|-------|-----------|
|  | `not_started` | `system_updated` | setup_automation | System update and base configuration complete |
|  | `system_updated` | `security_hardened` | setup_automation | Firewall, SSH hardening, and Fail2Ban configured |
|  | `security_hardened` | `services_installed` | setup_automation | Web server, database, and email server installed and tested |
|  | `services_installed` | `ssl_configured` | setup_automation | SSL certificates obtained and HTTPS working |
|  | `ssl_configured` | `dns_configured` | setup_automation | DNS records configured and resolving correctly |
|  | `dns_configured` | `monitoring_active` | setup_automation | Monitoring stack installed, dashboards accessible, alerts configured |
|  | `monitoring_active` | `backups_configured` | setup_automation | Backup schedule active, offsite replication verified |
|  | `backups_configured` | `fully_operational` | setup_automation | All health checks pass, external accessibility verified, runbook generated |
|  | `fully_operational` | `degraded` | monitoring_agent | Any monitored service fails health check |
|  | `degraded` | `fully_operational` | setup_automation | All services restored and health checks pass |

## Rules

- **system_setup:** MUST: Start with Ubuntu 22.04 LTS or 24.04 LTS — no other versions, MUST: Run full system update (apt update && apt upgrade) before any configuration, MUST: Set timezone to UTC for consistent logging, MUST: Configure NTP time synchronization via systemd-timesyncd or chrony, MUST: Create non-root admin user with sudo privileges, MUST: Disable root SSH login, SHOULD: Remove unnecessary packages (snap, cloud-init on desktop installs), SHOULD: Configure swap file if RAM is under 4GB (set to 2x RAM, max 4GB), MAY: Install performance tuning (sysctl tweaks for network, file descriptors)
- **networking:** MUST: Detect public IP automatically via external service (ifconfig.me, ipinfo.io), MUST: Configure port forwarding on router for ports 80 (HTTP), 443 (HTTPS), and custom SSH port, MUST: Set up Dynamic DNS if ISP assigns dynamic IP — update DNS record on IP change, MUST: DDNS update check runs every 5 minutes via cron or systemd timer, MUST: Configure DNS A record pointing domain to public IP, MUST: Configure DNS AAAA record if IPv6 is available, SHOULD: Set up wildcard DNS for subdomains (*.example.com), SHOULD: Test port accessibility from external network before proceeding, MAY: Set up WireGuard VPN for secure remote management
- **firewall:** MUST: Enable UFW (Uncomplicated Firewall) with default deny incoming, MUST: Allow only required ports: HTTP (80), HTTPS (443), SSH (custom port), MUST: Allow email ports only if email server is enabled: SMTP (25), SMTPS (465), IMAP (993), MUST: Rate limit SSH connections (max 6 attempts per 30 seconds), MUST: Log all denied connections, SHOULD: Enable UFW logging at medium level, SHOULD: Block known malicious IP ranges via ipset or fail2ban, MAY: Set up port knocking for SSH as additional security layer
- **ssh:** MUST: Change SSH port from default 22 to custom port (1024-65535), MUST: Disable password authentication — key-only access, MUST: Disable root login via SSH, MUST: Use Ed25519 or RSA 4096-bit keys minimum, MUST: Set SSH idle timeout to 15 minutes, MUST: Limit SSH access to specific user accounts via AllowUsers directive, SHOULD: Enable SSH two-factor authentication via google-authenticator-libpam, SHOULD: Set MaxAuthTries to 3
- **fail2ban:** MUST: Install and enable Fail2Ban, MUST: Configure SSH jail: ban after 5 failed attempts for 1 hour, MUST: Configure web server jail: ban after 20 failed requests for 30 minutes, SHOULD: Configure email jail if email server is enabled, SHOULD: Enable persistent bans across reboots, SHOULD: Configure ban notification emails to admin, MAY: Configure recidive jail: ban repeat offenders for 1 week
- **web_server:** MUST: Install and configure chosen web server (Nginx recommended), MUST: Enable gzip/brotli compression for text, CSS, JS, JSON, XML, MUST: Set proper security headers: X-Frame-Options, X-Content-Type-Options, X-XSS-Protection, Strict-Transport-Security, Content-Security-Policy, Referrer-Policy, Permissions-Policy, MUST: Redirect all HTTP to HTTPS (301 redirect), MUST: Disable server version disclosure (server_tokens off), MUST: Configure proper file permissions (web root owned by www-data, 755 dirs, 644 files), MUST: Set up reverse proxy for application backends with proper headers (X-Real-IP, X-Forwarded-For, X-Forwarded-Proto), SHOULD: Enable HTTP/2 and HTTP/3 (QUIC), SHOULD: Configure rate limiting per IP (10 req/s burst 20), SHOULD: Set up virtual hosts for each subdomain, SHOULD: Configure proper logging (access + error logs with rotation), MAY: Set up page caching for static sites
- **ssl:** MUST: Obtain SSL certificate from Let's Encrypt using Certbot, MUST: Configure auto-renewal via systemd timer (check twice daily), MUST: Use TLS 1.2+ only — disable TLS 1.0 and 1.1, MUST: Configure strong cipher suites (ECDHE+AESGCM preferred), MUST: Enable OCSP stapling for faster SSL handshakes, MUST: Generate 4096-bit DH parameters for key exchange, SHOULD: Configure HSTS with 1-year max-age and includeSubDomains, SHOULD: Score A+ on SSL Labs test (ssllabs.com/ssltest), MAY: Set up certificate transparency monitoring
- **database:** MUST: Install chosen database engine and configure for production use, MUST: Bind database to localhost only (no remote access by default), MUST: Create application-specific database user with minimal privileges, MUST: Set strong random password for database root/admin user, MUST: Enable database logging (slow queries, errors), MUST: Include database in backup schedule, SHOULD: Configure connection pooling (PgBouncer for PostgreSQL), SHOULD: Set appropriate memory limits based on available RAM, SHOULD: Enable SSL for database connections, MAY: Set up read replica for read-heavy workloads
- **email:** MUST: Configure SPF record in DNS (v=spf1 mx a ~all), MUST: Configure DKIM signing for outbound email, MUST: Configure DMARC record in DNS, MUST: Set up reverse DNS (PTR record) — contact ISP if needed, MUST: Configure TLS for all email connections, SHOULD: Set up spam filtering (SpamAssassin or rspamd), SHOULD: Configure email quotas per mailbox, SHOULD: Set up webmail interface (Roundcube) if full email server, MAY: Set up email forwarding and aliases
- **monitoring:** MUST: Monitor: CPU, memory, disk, network, and service health, MUST: Alert via email when: CPU > 90% for 5 min, disk > 85%, RAM > 90%, any service down, MUST: Log rotation configured for all services (7 days compressed retention), MUST: Health check endpoint accessible at /health (returns 200 + system stats), SHOULD: Install Netdata for real-time web dashboard (lightweight, auto-discovers services), SHOULD: Monitor SSL certificate expiry — alert 14 days before, SHOULD: Monitor for security updates — alert when critical updates available, SHOULD: Track uptime percentage and response times, MAY: External uptime monitoring via free tier services (UptimeRobot, Hetrix)
- **backups:** MUST: Automated daily backups of: web root, database dumps, configuration files, SSL certs, MUST: Backup retention: 7 daily, 4 weekly, 3 monthly, MUST: Backup integrity verification — test restore weekly, MUST: Offsite backup replication (never rely on local backups alone), MUST: Backup encryption at rest (GPG or age), SHOULD: Incremental backups to minimize storage and transfer, SHOULD: Backup notification email on success and failure, SHOULD: Database point-in-time recovery enabled (WAL archiving for PostgreSQL), MAY: Snapshot-based backups if running on LVM
- **security:** MUST: Run CIS Ubuntu benchmark hardening (level 1 minimum), MUST: Disable unused network services and protocols, MUST: Configure AppArmor profiles for all internet-facing services, MUST: Set proper file system permissions (no world-writable files), MUST: Configure audit logging (auditd) for security events, MUST: Install and configure rootkit detection (rkhunter or chkrootkit) — weekly scan, MUST: Disable USB storage mounting (prevent physical USB attacks), SHOULD: Install and configure intrusion detection (AIDE or OSSEC), SHOULD: Enable automatic security updates (unattended-upgrades for security patches only), SHOULD: Configure process accounting, MAY: Set up centralized logging to external service
- **maintenance:** MUST: Create server runbook documenting all services, ports, credentials locations, and recovery procedures, MUST: Automated system health report emailed weekly to admin, SHOULD: Scheduled maintenance window weekly (Sunday 3-5 AM) for updates, SHOULD: Log all administrative actions for audit trail, MAY: Ansible/shell playbook for reproducible server setup from scratch

## SLA

| Scope | Max Duration | Escalation |
|-------|-------------|------------|
| web_response | 500ms |  |
| uptime | 99.9% |  |
| ssl_renewal | 30d | [object Object] |
| backup_completion | 4h |  |
| incident_response | 5m |  |
| ddns_update | 10m |  |

## Outcomes

### System_updated (Priority: 1)

**Given:**
- Ubuntu 22.04 LTS or 24.04 LTS is installed
- system has internet connectivity

**Then:**
- run apt update && apt full-upgrade -y
- set timezone to UTC
- configure NTP time sync
- create admin user with sudo privileges
- disable root account direct login
- install essential packages: curl, wget, git, ufw, fail2ban, certbot, unzip, htop, tmux, vim
- remove unnecessary packages (snap, cloud-init if desktop install)
- configure swap if RAM < 4GB
- **transition_state** field: `setup_status` from: `not_started` to: `system_updated`
- **emit_event** event: `setup.system_updated`

**Result:** System up to date with base packages installed and admin user ready

### Security_hardened (Priority: 2)

**Given:**
- `setup_status` (db) eq `system_updated`

**Then:**
- configure UFW: default deny incoming, allow outgoing, allow HTTP (80), HTTPS (443), custom SSH port
- enable UFW with logging
- change SSH port to custom port
- disable SSH password authentication — key-only
- disable SSH root login
- set SSH MaxAuthTries to 3 and idle timeout to 15 minutes
- install and configure Fail2Ban: SSH jail (5 attempts = 1 hour ban), web jail
- enable AppArmor for internet-facing services
- install rkhunter and configure weekly rootkit scan
- configure auditd for security event logging
- enable unattended-upgrades for security patches
- disable USB storage mounting
- **transition_state** field: `setup_status` from: `system_updated` to: `security_hardened`
- **emit_event** event: `setup.security_hardened`

**Result:** Server hardened: firewall active, SSH secured, intrusion detection running

### Services_installed (Priority: 3)

**Given:**
- `setup_status` (db) eq `security_hardened`

**Then:**
- install and configure web server (Nginx recommended)
- configure security headers, gzip compression, and server_tokens off
- set up default virtual host with placeholder page
- configure reverse proxy for application backends
- install chosen database engine
- secure database: set root password, remove test databases, restrict to localhost
- create application database and user with minimal privileges
- install email server if enabled (Postfix + Dovecot)
- configure SPF, DKIM, and DMARC DNS records for email
- **transition_state** field: `setup_status` from: `security_hardened` to: `services_installed`
- **emit_event** event: `setup.services_installed`

**Result:** Web server, database, and email server installed and running on localhost

### Ssl_configured (Priority: 4)

**Given:**
- `setup_status` (db) eq `services_installed`
- `domain_name` (input) exists

**Then:**
- obtain SSL certificate from Let's Encrypt using Certbot
- configure web server for HTTPS with strong TLS settings
- redirect all HTTP to HTTPS
- enable HSTS with 1-year max-age
- generate 4096-bit DH parameters
- enable OCSP stapling
- configure auto-renewal via systemd timer (twice daily check)
- test SSL configuration (target: A+ on SSL Labs)
- **transition_state** field: `setup_status` from: `services_installed` to: `ssl_configured`
- **emit_event** event: `setup.ssl_configured`

**Result:** HTTPS working with A+ SSL rating, auto-renewal active

### Dns_configured (Priority: 5)

**Given:**
- `setup_status` (db) eq `ssl_configured`
- `public_ip` (computed) exists

**Then:**
- detect public IP automatically
- configure DNS A record: domain → public IP
- configure DNS AAAA record if IPv6 available
- configure wildcard DNS record for subdomains
- set up Dynamic DNS updater if ISP assigns dynamic IP
- configure DDNS cron job (every 5 minutes)
- configure DNS MX record if email server enabled
- configure DNS TXT records for SPF, DKIM, DMARC
- verify DNS propagation and test external access
- **transition_state** field: `setup_status` from: `ssl_configured` to: `dns_configured`
- **emit_event** event: `setup.dns_configured`

**Result:** Domain resolves to server, publicly accessible via HTTPS

### Monitoring_active (Priority: 6)

**Given:**
- `setup_status` (db) eq `dns_configured`

**Then:**
- install monitoring stack (Netdata recommended — lightweight, auto-discovers services)
- configure monitoring dashboard accessible via subdomain (monitor.example.com)
- set up alert rules: CPU > 90%, disk > 85%, RAM > 90%, service down
- configure email alerts to admin
- set up log rotation for all services (7 days compressed)
- create /health endpoint returning system stats
- configure SSL certificate expiry monitoring (alert 14 days before)
- configure security update monitoring
- **transition_state** field: `setup_status` from: `dns_configured` to: `monitoring_active`
- **emit_event** event: `setup.monitoring_active`

**Result:** Monitoring dashboard live, alerts configured, logging operational

### Backups_configured (Priority: 7)

**Given:**
- `setup_status` (db) eq `monitoring_active`

**Then:**
- create backup script: web root, database dumps, config files, SSL certs
- configure backup schedule via systemd timer (daily at 3 AM)
- configure retention: 7 daily, 4 weekly, 3 monthly
- encrypt backups with GPG
- configure offsite replication to chosen target
- set up backup integrity verification (weekly test restore)
- configure backup notification emails (success and failure)
- enable database WAL archiving for point-in-time recovery (PostgreSQL)
- **transition_state** field: `setup_status` from: `monitoring_active` to: `backups_configured`
- **emit_event** event: `setup.backups_configured`

**Result:** Automated encrypted backups running daily with offsite replication

### Fully_operational (Priority: 8) | Transaction: atomic

**Given:**
- `setup_status` (db) eq `backups_configured`

**Then:**
- run full health check: all services responding, SSL valid, DNS resolving, backups verified
- test external access from outside network (HTTP, HTTPS, email if configured)
- verify firewall blocks all non-allowed ports
- run security scan (Lynis audit)
- generate server runbook with: all services, ports, credential locations, recovery procedures
- send setup completion email to admin with dashboard URL and runbook
- **transition_state** field: `setup_status` from: `backups_configured` to: `fully_operational`
- **emit_event** event: `setup.complete`
- **notify** to: `admin`

**Result:** Server fully operational — publicly accessible, monitored, backed up, and hardened

### Service_degraded (Priority: 9) — Error: `SERVICE_DEGRADED`

**Given:**
- `setup_status` (db) eq `fully_operational`
- any monitored service fails health check

**Then:**
- **transition_state** field: `setup_status` from: `fully_operational` to: `degraded`
- **notify** to: `admin`
- **emit_event** event: `server.degraded`

**Result:** Admin alerted — automatic recovery attempted for known failure patterns

### Service_auto_recovered (Priority: 10)

**Given:**
- `setup_status` (db) eq `degraded`
- automatic restart of failed service succeeds
- all health checks pass after restart

**Then:**
- **transition_state** field: `setup_status` from: `degraded` to: `fully_operational`
- **notify** to: `admin`
- **emit_event** event: `server.recovered`

**Result:** Service auto-recovered — admin notified of incident and resolution

### Ssl_renewal_succeeded (Priority: 11)

**Given:**
- SSL certificate renewal cron runs
- certificate is within 30 days of expiry

**Then:**
- renew certificate via Certbot
- reload web server to use new certificate
- **emit_event** event: `ssl.renewed`

**Result:** SSL certificate renewed and web server reloaded — zero downtime

### Ssl_renewal_failed (Priority: 12) — Error: `SSL_RENEWAL_FAILED`

**Given:**
- SSL certificate renewal attempt fails
- certificate expires in less than 14 days

**Then:**
- **notify** to: `admin`
- **emit_event** event: `ssl.renewal_failed`

**Result:** Admin urgently notified — manual intervention required before certificate expires

### Ddns_updated (Priority: 13)

**Given:**
- `ddns_enabled` (db) eq `true`
- public IP has changed since last check

**Then:**
- update DNS A record with new IP via DDNS provider API
- **emit_event** event: `dns.ip_changed`

**Result:** DNS updated with new IP — public access restored within DNS TTL

### Backup_completed (Priority: 14)

**Given:**
- scheduled backup cron triggers

**Then:**
- create encrypted backup of web root, database, configs, and SSL certs
- verify backup integrity via checksum
- replicate to offsite storage
- prune old backups per retention policy
- **emit_event** event: `backup.completed`

**Result:** Backup completed, verified, and replicated offsite

### Backup_failed (Priority: 15) — Error: `BACKUP_FAILED`

**Given:**
- backup process encounters error

**Then:**
- **notify** to: `admin`
- **emit_event** event: `backup.failed`

**Result:** Admin alerted of backup failure — manual investigation required

### Disk_space_critical (Priority: 16) — Error: `DISK_SPACE_CRITICAL`

**Given:**
- disk usage exceeds 85%

**Then:**
- automatically clean: apt cache, old logs, old backups beyond retention
- **notify** to: `admin`
- **emit_event** event: `server.disk_critical`

**Result:** Auto-cleanup attempted — admin notified if still above threshold

### Security_update_available (Priority: 17)

**Given:**
- security update check detects critical updates available

**Then:**
- apply security patches automatically via unattended-upgrades
- **emit_event** event: `security.updates_applied`
- **notify** to: `admin` — Notify admin if reboot is required after kernel update

**Result:** Security patches applied — admin notified if reboot needed

### Intrusion_detected (Priority: 18) — Error: `INTRUSION_DETECTED`

**Given:**
- Fail2Ban, rkhunter, or audit log detects suspicious activity

**Then:**
- block offending IP if applicable
- **notify** to: `admin`
- **emit_event** event: `security.intrusion_detected`

**Result:** Threat mitigated — admin alerted with full details

### Port_scan_blocked (Priority: 19)

**Given:**
- UFW logs show port scanning from single IP

**Then:**
- add IP to Fail2Ban ban list
- **emit_event** event: `security.port_scan`

**Result:** Scanner IP banned — logged for security audit

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `SERVICE_DEGRADED` | 503 | Service temporarily unavailable. Automatic recovery in progress. | Yes |
| `SSL_RENEWAL_FAILED` | 500 | SSL certificate renewal failed. Service remains available with current certificate. | Yes |
| `BACKUP_FAILED` | 500 | Automated backup failed. Previous backups remain available. | Yes |
| `DISK_SPACE_CRITICAL` | 503 | Server disk space critically low. Some operations may be affected. | Yes |
| `INTRUSION_DETECTED` | 403 | Suspicious activity detected and blocked. | No |
| `DNS_UPDATE_FAILED` | 503 | DNS update failed. Server may be temporarily unreachable via domain name. | Yes |
| `PORT_FORWARDING_FAILED` | 503 | Required ports are not accessible from the public internet. | Yes |
| `DATABASE_CONNECTION_FAILED` | 500 | Database connection failed. Automatic restart attempted. | Yes |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `setup.system_updated` | Phase 1 complete — system updated and base packages installed | `hostname`, `os_version`, `kernel_version`, `ram_mb`, `disk_gb` |
| `setup.security_hardened` | Phase 2 complete — security hardening applied | `ssh_port`, `firewall_rules`, `fail2ban_jails` |
| `setup.services_installed` | Phase 3 complete — all services installed and running | `web_server`, `database_engine`, `email_server_type`, `services_running` |
| `setup.ssl_configured` | Phase 4 complete — SSL certificates active | `domain_name`, `ssl_provider`, `cert_expiry`, `ssl_grade` |
| `setup.dns_configured` | Phase 5 complete — DNS resolving to server | `domain_name`, `public_ip`, `ddns_enabled`, `dns_records_configured` |
| `setup.monitoring_active` | Phase 6 complete — monitoring and alerting operational | `monitoring_stack`, `alert_rules`, `dashboard_url` |
| `setup.backups_configured` | Phase 7 complete — automated backups active | `backup_schedule`, `retention_policy`, `offsite_target`, `encryption_method` |
| `setup.complete` | All phases complete — server fully operational | `domain_name`, `public_ip`, `services_running`, `ssl_grade`, `lynis_score` |
| `server.degraded` | Service failure detected — auto-recovery in progress | `failed_service`, `error_details`, `timestamp` |
| `server.recovered` | Failed service auto-recovered | `recovered_service`, `downtime_seconds`, `recovery_method` |
| `server.disk_critical` | Disk usage exceeded threshold | `disk_usage_percent`, `largest_directories`, `auto_cleaned_mb` |
| `ssl.renewed` | SSL certificate auto-renewed | `domain_name`, `new_expiry`, `old_expiry` |
| `ssl.renewal_failed` | SSL renewal failed — urgent action needed | `domain_name`, `expiry_date`, `error_details` |
| `dns.ip_changed` | Public IP changed — DDNS updated | `old_ip`, `new_ip`, `updated_at` |
| `backup.completed` | Scheduled backup completed successfully | `backup_size_mb`, `files_backed_up`, `offsite_replicated`, `retention_pruned` |
| `backup.failed` | Backup failed — manual intervention needed | `error_details`, `last_successful_backup` |
| `security.updates_applied` | Security patches auto-applied | `packages_updated`, `reboot_required` |
| `security.intrusion_detected` | Suspicious activity detected and mitigated | `detection_source`, `threat_type`, `source_ip`, `action_taken` |
| `security.port_scan` | Port scan detected and blocked | `source_ip`, `ports_scanned`, `banned_duration` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| caching | recommended | Redis or Memcached for application-level caching |
| database-persistence | required | PostgreSQL or MySQL setup and configuration |
| cloud-storage | recommended | Offsite backup storage target |
| message-queue | optional | Redis or RabbitMQ for background job processing |
| ai-solo-business-automation | recommended | AI-to-AI service platform that runs on this server infrastructure |

<details>
<summary><strong>UI Hints</strong></summary>

```yaml
layout: wizard
sections:
  - name: Network Setup
    description: Domain, IP detection, port forwarding, DDNS configuration
  - name: Security
    description: Firewall rules, SSH config, Fail2Ban settings
  - name: Services
    description: Web server, database, and email server selection and configuration
  - name: SSL & DNS
    description: Certificate provisioning, DNS records, DDNS setup
  - name: Monitoring
    description: Monitoring stack selection, alert rules, dashboard access
  - name: Backups
    description: Backup schedule, retention, offsite target, encryption
  - name: Status Dashboard
    description: "Real-time server health: CPU, RAM, disk, services, uptime, recent alerts"
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Local To Public Server Blueprint",
  "description": "Transform a local Ubuntu PC into a fully functional, hardened, publicly accessible server with web hosting, database, email, SSL, monitoring, and automated back",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "server, ubuntu, linux, self-hosted, networking, dns, ssl, security, monitoring, backup, web-server, database, email, firewall"
}
</script>
