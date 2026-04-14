<!-- AUTO-GENERATED FROM local-to-public-server.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Local To Public Server

> Transform a local Ubuntu PC into a fully functional, hardened, publicly accessible server with web hosting, database, email, SSL, monitoring, and automated backups

**Category:** Infrastructure · **Version:** 1.0.0 · **Tags:** server · ubuntu · linux · self-hosted · networking · dns · ssl · security · monitoring · backup · web-server · database · email · firewall

## What this does

Transform a local Ubuntu PC into a fully functional, hardened, publicly accessible server with web hosting, database, email, SSL, monitoring, and automated backups

Specifies 19 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **public_ip** *(text, required)* — Public IP Address
- **domain_name** *(text, required)* — Domain Name
- **subdomains** *(json, optional)* — Subdomains
- **ddns_enabled** *(boolean, required)* — Dynamic DNS Enabled
- **ddns_provider** *(select, optional)* — DDNS Provider
- **router_port_forwarding** *(json, required)* — Port Forwarding Rules
- **ipv6_enabled** *(boolean, optional)* — IPv6 Enabled
- **ssl_email** *(email, required)* — SSL Certificate Email
- **ssl_provider** *(select, required)* — SSL Provider
- **ssl_auto_renew** *(boolean, required)* — Auto-Renew SSL
- **web_server** *(select, required)* — Web Server
- **web_root** *(text, required)* — Web Root Directory
- **reverse_proxy_targets** *(json, optional)* — Reverse Proxy Targets
- **database_engine** *(select, required)* — Database Engine
- **database_name** *(text, optional)* — Default Database Name
- **database_remote_access** *(boolean, optional)* — Allow Remote Database Access
- **email_server_enabled** *(boolean, optional)* — Email Server Enabled
- **email_server_type** *(select, optional)* — Email Server
- **ssh_port** *(number, required)* — SSH Port
- **ssh_key_only** *(boolean, required)* — SSH Key-Only Authentication
- **fail2ban_enabled** *(boolean, required)* — Fail2Ban Enabled
- **ufw_enabled** *(boolean, required)* — UFW Firewall Enabled
- **unattended_upgrades** *(boolean, required)* — Unattended Security Upgrades
- **monitoring_enabled** *(boolean, required)* — Monitoring Enabled
- **monitoring_stack** *(select, optional)* — Monitoring Stack
- **alert_email** *(email, required)* — Alert Email
- **backup_enabled** *(boolean, required)* — Automated Backups Enabled
- **backup_schedule** *(text, optional)* — Backup Schedule (cron)
- **backup_retention_days** *(number, optional)* — Backup Retention (days)
- **backup_offsite** *(boolean, optional)* — Offsite Backup Enabled
- **backup_offsite_target** *(select, optional)* — Offsite Backup Target
- **setup_status** *(select, required)* — Setup Status

## What must be true

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

## Success & failure scenarios

**✅ Success paths**

- **System Updated** — when Ubuntu 22.04 LTS or 24.04 LTS is installed; system has internet connectivity, then System up to date with base packages installed and admin user ready.
- **Security Hardened** — when setup_status eq "system_updated", then Server hardened: firewall active, SSH secured, intrusion detection running.
- **Services Installed** — when setup_status eq "security_hardened", then Web server, database, and email server installed and running on localhost.
- **Ssl Configured** — when setup_status eq "services_installed"; domain_name exists, then HTTPS working with A+ SSL rating, auto-renewal active.
- **Dns Configured** — when setup_status eq "ssl_configured"; public_ip exists, then Domain resolves to server, publicly accessible via HTTPS.
- **Monitoring Active** — when setup_status eq "dns_configured", then Monitoring dashboard live, alerts configured, logging operational.
- **Backups Configured** — when setup_status eq "monitoring_active", then Automated encrypted backups running daily with offsite replication.
- **Fully Operational** — when setup_status eq "backups_configured", then Server fully operational — publicly accessible, monitored, backed up, and hardened.
- **Service Auto Recovered** — when setup_status eq "degraded"; automatic restart of failed service succeeds; all health checks pass after restart, then Service auto-recovered — admin notified of incident and resolution.
- **Ssl Renewal Succeeded** — when SSL certificate renewal cron runs; certificate is within 30 days of expiry, then SSL certificate renewed and web server reloaded — zero downtime.
- **Backup Completed** — when scheduled backup cron triggers, then Backup completed, verified, and replicated offsite.
- **Security Update Available** — when security update check detects critical updates available, then Security patches applied — admin notified if reboot needed.
- **Port Scan Blocked** — when UFW logs show port scanning from single IP, then Scanner IP banned — logged for security audit.

**❌ Failure paths**

- **Service Degraded** — when setup_status eq "fully_operational"; any monitored service fails health check, then Admin alerted — automatic recovery attempted for known failure patterns. *(error: `SERVICE_DEGRADED`)*
- **Ssl Renewal Failed** — when SSL certificate renewal attempt fails; certificate expires in less than 14 days, then Admin urgently notified — manual intervention required before certificate expires. *(error: `SSL_RENEWAL_FAILED`)*
- **Ddns Updated** — when ddns_enabled eq true; public IP has changed since last check, then DNS updated with new IP — public access restored within DNS TTL. *(error: `DNS_UPDATE_FAILED`)*
- **Backup Failed** — when backup process encounters error, then Admin alerted of backup failure — manual investigation required. *(error: `BACKUP_FAILED`)*
- **Disk Space Critical** — when disk usage exceeds 85%, then Auto-cleanup attempted — admin notified if still above threshold. *(error: `DISK_SPACE_CRITICAL`)*
- **Intrusion Detected** — when Fail2Ban, rkhunter, or audit log detects suspicious activity, then Threat mitigated — admin alerted with full details. *(error: `INTRUSION_DETECTED`)*

## Errors it can return

- `SERVICE_DEGRADED` — Service temporarily unavailable. Automatic recovery in progress.
- `SSL_RENEWAL_FAILED` — SSL certificate renewal failed. Service remains available with current certificate.
- `BACKUP_FAILED` — Automated backup failed. Previous backups remain available.
- `DISK_SPACE_CRITICAL` — Server disk space critically low. Some operations may be affected.
- `INTRUSION_DETECTED` — Suspicious activity detected and blocked.
- `DNS_UPDATE_FAILED` — DNS update failed. Server may be temporarily unreachable via domain name.
- `PORT_FORWARDING_FAILED` — Required ports are not accessible from the public internet.
- `DATABASE_CONNECTION_FAILED` — Database connection failed. Automatic restart attempted.

## Events

**`setup.system_updated`** — Phase 1 complete — system updated and base packages installed
  Payload: `hostname`, `os_version`, `kernel_version`, `ram_mb`, `disk_gb`

**`setup.security_hardened`** — Phase 2 complete — security hardening applied
  Payload: `ssh_port`, `firewall_rules`, `fail2ban_jails`

**`setup.services_installed`** — Phase 3 complete — all services installed and running
  Payload: `web_server`, `database_engine`, `email_server_type`, `services_running`

**`setup.ssl_configured`** — Phase 4 complete — SSL certificates active
  Payload: `domain_name`, `ssl_provider`, `cert_expiry`, `ssl_grade`

**`setup.dns_configured`** — Phase 5 complete — DNS resolving to server
  Payload: `domain_name`, `public_ip`, `ddns_enabled`, `dns_records_configured`

**`setup.monitoring_active`** — Phase 6 complete — monitoring and alerting operational
  Payload: `monitoring_stack`, `alert_rules`, `dashboard_url`

**`setup.backups_configured`** — Phase 7 complete — automated backups active
  Payload: `backup_schedule`, `retention_policy`, `offsite_target`, `encryption_method`

**`setup.complete`** — All phases complete — server fully operational
  Payload: `domain_name`, `public_ip`, `services_running`, `ssl_grade`, `lynis_score`

**`server.degraded`** — Service failure detected — auto-recovery in progress
  Payload: `failed_service`, `error_details`, `timestamp`

**`server.recovered`** — Failed service auto-recovered
  Payload: `recovered_service`, `downtime_seconds`, `recovery_method`

**`server.disk_critical`** — Disk usage exceeded threshold
  Payload: `disk_usage_percent`, `largest_directories`, `auto_cleaned_mb`

**`ssl.renewed`** — SSL certificate auto-renewed
  Payload: `domain_name`, `new_expiry`, `old_expiry`

**`ssl.renewal_failed`** — SSL renewal failed — urgent action needed
  Payload: `domain_name`, `expiry_date`, `error_details`

**`dns.ip_changed`** — Public IP changed — DDNS updated
  Payload: `old_ip`, `new_ip`, `updated_at`

**`backup.completed`** — Scheduled backup completed successfully
  Payload: `backup_size_mb`, `files_backed_up`, `offsite_replicated`, `retention_pruned`

**`backup.failed`** — Backup failed — manual intervention needed
  Payload: `error_details`, `last_successful_backup`

**`security.updates_applied`** — Security patches auto-applied
  Payload: `packages_updated`, `reboot_required`

**`security.intrusion_detected`** — Suspicious activity detected and mitigated
  Payload: `detection_source`, `threat_type`, `source_ip`, `action_taken`

**`security.port_scan`** — Port scan detected and blocked
  Payload: `source_ip`, `ports_scanned`, `banned_duration`

## Connects to

- **caching** *(recommended)* — Redis or Memcached for application-level caching
- **database-persistence** *(required)* — PostgreSQL or MySQL setup and configuration
- **cloud-storage** *(recommended)* — Offsite backup storage target
- **message-queue** *(optional)* — Redis or RabbitMQ for background job processing
- **ai-solo-business-automation** *(recommended)* — AI-to-AI service platform that runs on this server infrastructure

## Quality fitness 🟢 84/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `██████████` | 10/10 |
| Outcomes | `████████████████████████░` | 24/25 |
| Structured conditions | `███░░░░░░░` | 3/10 |
| Error binding | `████████░░` | 8/10 |
| Field validation | `██████░░░░` | 6/10 |
| Relationships | `██████████` | 10/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `████░` | 4/5 |
| Simplicity | `████░` | 4/5 |

**Recent auto-improvements** *(via autoresearch-style keep-or-reset loop — applied only because they raised the fitness score)*

- `T5` **bind-orphan-errors** — bound 1 orphan error codes to outcomes

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/infrastructure/local-to-public-server/) · **Spec source:** [`local-to-public-server.blueprint.yaml`](./local-to-public-server.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
