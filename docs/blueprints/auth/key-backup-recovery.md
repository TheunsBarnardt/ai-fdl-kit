---
title: "Key Backup Recovery Blueprint"
layout: default
parent: "Auth"
grand_parent: Blueprint Catalog
description: "Securely back up and restore end-to-end encryption session keys. Keys are client-encrypted before upload; server stores only opaque ciphertext with versioned et"
---

# Key Backup Recovery Blueprint

> Securely back up and restore end-to-end encryption session keys. Keys are client-encrypted before upload; server stores only opaque ciphertext with versioned etag tracking.

| | |
|---|---|
| **Feature** | `key-backup-recovery` |
| **Category** | Auth |
| **Version** | 1.0.0 |
| **Tags** | key-backup, recovery, e2e, encryption, megolm, versioning |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/auth/key-backup-recovery.blueprint.yaml) |
| **JSON API** | [key-backup-recovery.json]({{ site.baseurl }}/api/blueprints/auth/key-backup-recovery.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `user_device` | User Device | human | Device uploading keys to backup or downloading them for recovery |
| `homeserver` | Homeserver | system | Server storing encrypted backup data without access to plaintext keys |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `backup_version` | text | Yes | Identifier of the active backup version |  |
| `etag` | text | No | Incrementing tag tracking the number of modifications to a backup version |  |
| `room_id` | token | No | Room whose session keys are being backed up |  |
| `session_id` | token | No | Identifier of the specific encryption session within a room |  |
| `session_data` | json | No | Encrypted session key payload; opaque to the server |  |
| `first_message_index` | number | No | Index of the earliest message this session key can decrypt |  |
| `forwarded_count` | number | No | Number of times this key has been forwarded between devices |  |
| `is_verified` | boolean | No | Whether the uploading device has verified the key's authenticity |  |

## States

**State field:** `backup_version_status`

**Values:**

| State | Initial | Terminal |
|-------|---------|----------|
| `active` | Yes |  |
| `superseded` |  | Yes |

**Transitions:**

| Name | From | To | Actor | Condition |
|------|------|----|-------|-----------|
|  | `active` | `superseded` | user_device |  |

## Rules

- **integrity:** Backup data is encrypted by the client before upload; server never has access to plaintext session keys, Uploads must specify the current backup version; mismatched versions are rejected, Read operations acquire a shared lock; write operations acquire an exclusive lock per user to prevent races, Version transitions are atomic; no writes are accepted to the old version after transition begins, The etag is incremented on every successful upload to allow clients to detect missed updates
- **isolation:** Backup versions are per-user; multiple users' backups are fully isolated, Deleting a backup version removes all associated session key data irreversibly

## Outcomes

### Backup_version_created (Priority: 1)

**Given:**
- user is authenticated
- no concurrent version transition is in progress

**Then:**
- **create_record** target: `key_backup` — New backup version record created with initial etag of 0
- **emit_event** event: `key_backup.version_created`

**Result:** New backup version is active and accepts key uploads

### Keys_uploaded (Priority: 2)

**Given:**
- uploaded version matches the current active version
- write lock is available

**Then:**
- **create_record** target: `key_backup` — Session keys merged into backup; etag incremented
- **set_field** target: `etag` — Etag incremented to reflect the change
- **emit_event** event: `key_backup.keys_uploaded`

**Result:** Keys are safely stored; client can discard local copy

### Keys_retrieved (Priority: 3)

**Given:**
- requester is authenticated as the backup owner
- backup version exists
- read lock is available

**Then:**
- **emit_event** event: `key_backup.keys_retrieved`

**Result:** Encrypted session keys returned; client decrypts and restores local encryption state

### Version_mismatch (Priority: 4) — Error: `KEY_BACKUP_VERSION_MISMATCH`

**Given:**
- uploaded version does not match the current active backup version

**Result:** Upload rejected; client should retrieve the current version and retry

### Backup_not_found (Priority: 5) — Error: `KEY_BACKUP_NOT_FOUND`

**Given:**
- requested backup version does not exist

**Result:** Operation fails; client should create a new backup version

### Backup_version_deleted (Priority: 6)

**Given:**
- user requests deletion of a backup version
- version exists

**Then:**
- **delete_record** target: `key_backup` — All session keys for the version removed; version record deleted
- **emit_event** event: `key_backup.version_deleted`

**Result:** Backup version and all its key data permanently removed

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `KEY_BACKUP_VERSION_MISMATCH` | 403 | The specified backup version does not match the current version | No |
| `KEY_BACKUP_NOT_FOUND` | 404 | Backup version not found | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `key_backup.version_created` | A new key backup version has been created | `user_id`, `backup_version` |
| `key_backup.keys_uploaded` | Session keys were successfully uploaded to a backup version | `user_id`, `backup_version`, `room_count`, `session_count`, `etag` |
| `key_backup.keys_retrieved` | Encrypted session keys were retrieved for recovery | `user_id`, `backup_version` |
| `key_backup.version_deleted` | A backup version and all its key data were permanently removed | `user_id`, `backup_version` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| e2e-key-exchange | required | Session keys generated during key exchange are the data being backed up |
| cross-signing-verification | recommended | Cross-signing trust level of the uploading device is recorded in is_verified |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
source:
  repo: https://github.com/element-hq/synapse
  project: Synapse Matrix homeserver
  tech_stack: Python / Twisted async
  files_traced: 4
  entry_points:
    - synapse/handlers/e2e_room_keys.py
    - synapse/storage/databases/main/e2e_room_keys.py
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Key Backup Recovery Blueprint",
  "description": "Securely back up and restore end-to-end encryption session keys. Keys are client-encrypted before upload; server stores only opaque ciphertext with versioned et",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "key-backup, recovery, e2e, encryption, megolm, versioning"
}
</script>
