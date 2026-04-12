---
title: "File Upload Sharing Blueprint"
layout: default
parent: "Communication"
grand_parent: Blueprint Catalog
description: "Upload and share files, images, audio, and video in conversation channels with automatic thumbnail generation and inline preview. 10 fields. 9 outcomes. 5 error"
---

# File Upload Sharing Blueprint

> Upload and share files, images, audio, and video in conversation channels with automatic thumbnail generation and inline preview

| | |
|---|---|
| **Feature** | `file-upload-sharing` |
| **Category** | Communication |
| **Version** | 1.0.0 |
| **Tags** | files, uploads, media, attachments, sharing |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/communication/file-upload-sharing.blueprint.yaml) |
| **JSON API** | [file-upload-sharing.json]({{ site.baseurl }}/api/blueprints/communication/file-upload-sharing.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `uploader` | File Uploader | human | Authenticated user uploading and sharing a file in a channel |
| `recipient` | Channel Member | human | User who receives and views the shared file in the conversation |
| `system` | File Storage System | system | Handles storage, validation, thumbnail generation, and access control for uploaded files |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `file_id` | text | Yes | File ID |  |
| `channel_id` | text | Yes | Channel ID |  |
| `file_name` | text | Yes | File Name |  |
| `file_type` | text | Yes | MIME Type |  |
| `file_size` | number | Yes | File Size |  |
| `description` | text | No | File Description |  |
| `message_text` | text | No | Message Text |  |
| `thread_id` | text | No | Thread ID |  |
| `file_url` | url | No | File URL |  |
| `image_dimensions` | json | No | Image Dimensions |  |

## Rules

- **general:** The uploading user must be authenticated and have access to the target channel, File uploads may be restricted by allowed MIME types; files with disallowed types are rejected, File size must not exceed the configured maximum upload size for the workspace, For image files, a preview thumbnail is generated and stored separately to optimise load times, Image attachments include inline preview data (base64 small preview) for immediate rendering before the full image loads, Audio and video files are displayed with a native player control inline in the conversation, All other file types are displayed as a downloadable link attachment with filename and size, File records require file_id, file_name, file_type, and file_size to be valid; missing any of these rejects the upload, The file must be confirmed as uploaded to the storage backend before a message attachment is created, Files are stored with a namespaced path that includes the channel and user context to prevent collisions, Download URLs include the encoded filename to preserve the original name on download, After a file message is sent, a post-upload callback notifies registered integrations, End-to-end encrypted uploads use an encrypted content structure to protect file metadata and content, App-type bots may share files without the standard channel-membership access check

## Outcomes

### User_not_authenticated (Priority: 1) — Error: `UPLOAD_NOT_AUTHENTICATED`

**Given:**
- no authenticated user session exists

**Result:** Upload rejected; user must be logged in

### Channel_not_found (Priority: 2) — Error: `UPLOAD_CHANNEL_NOT_FOUND`

**Given:**
- channel_id does not correspond to an existing channel

**Result:** Upload rejected; the target channel could not be found

### User_no_channel_access (Priority: 3) — Error: `UPLOAD_NO_CHANNEL_ACCESS`

**Given:**
- authenticated user does not have access to the target channel

**Result:** Upload rejected; user does not have permission to post in this channel

### Invalid_file_record (Priority: 4) — Error: `UPLOAD_INVALID_FILE`

**Given:**
- file record is missing one or more required fields: file_id, file_name, file_type, file_size

**Result:** Upload rejected; the file record is incomplete or invalid

### File_not_confirmed_in_storage (Priority: 5) — Error: `UPLOAD_FILE_NOT_FOUND_IN_STORAGE`

**Given:**
- file_id cannot be matched to a confirmed upload record for this user and channel

**Result:** Upload rejected; the file has not been confirmed in storage

### Image_shared (Priority: 6)

**Given:**
- user is authenticated and has channel access
- file record is valid and confirmed in storage
- file_type matches an image MIME type

**Then:**
- **create_record** — Message with image attachment including preview, thumbnail URL, and dimensions
- **emit_event** event: `file.uploaded`

**Result:** Image is displayed inline in the conversation with a thumbnail preview

### Audio_shared (Priority: 7)

**Given:**
- user is authenticated and has channel access
- file record is valid and confirmed in storage
- file_type matches an audio MIME type

**Then:**
- **create_record** — Message with audio attachment and an inline audio player
- **emit_event** event: `file.uploaded`

**Result:** Audio file is displayed with an inline player control in the conversation

### Video_shared (Priority: 8)

**Given:**
- user is authenticated and has channel access
- file record is valid and confirmed in storage
- file_type matches a video MIME type

**Then:**
- **create_record** — Message with video attachment and an inline video player
- **emit_event** event: `file.uploaded`

**Result:** Video is displayed with an inline player control in the conversation

### Generic_file_shared (Priority: 9)

**Given:**
- user is authenticated and has channel access
- file record is valid and confirmed in storage
- file_type does not match image, audio, or video

**Then:**
- **create_record** — Message with a downloadable file link showing filename, format, and size
- **emit_event** event: `file.uploaded`

**Result:** File appears as a downloadable attachment with name and size information

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `UPLOAD_NOT_AUTHENTICATED` | 400 | You must be logged in to upload files | No |
| `UPLOAD_CHANNEL_NOT_FOUND` | 404 | The target channel could not be found | No |
| `UPLOAD_NO_CHANNEL_ACCESS` | 400 | You do not have permission to share files in this channel | No |
| `UPLOAD_INVALID_FILE` | 400 | The file is invalid or missing required information | No |
| `UPLOAD_FILE_NOT_FOUND_IN_STORAGE` | 404 | The file could not be confirmed; please try uploading again | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `file.uploaded` | Fired after a file message is successfully posted in a channel | `file_id`, `channel_id`, `uploader_user_id`, `file_name`, `file_type`, `file_size` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| direct-messaging | recommended | File sharing applies to direct messages and group conversations as well as channels |
| message-pinning | optional | File messages can be pinned for quick channel reference |
| link-preview-unfurling | optional | Shared file URLs may trigger link previews in other messages |

## AGI Readiness

### Goals

#### Secure File Delivery

Validate, store, and share files in conversations with appropriate type and size enforcement, access control, and inline preview generation

**Success Metrics:**

| Metric | Target | Measurement |
|--------|--------|-------------|
| upload_validation_rate | 100% | Files validated for type and size before storage confirmation / total uploads |
| unauthorised_file_access_rate | 0% | File accesses by users without channel membership / total access attempts |

### Autonomy

**Level:** `supervised`

**Human Checkpoints:**

- before changing workspace-level maximum upload size
- before modifying allowed MIME type lists

### Verification

**Invariants:**

- a file message is only created after the file is confirmed in storage
- file records must include file_id, file_name, file_type, and file_size
- uploader must be authenticated and have channel access

**Acceptance Tests:**

| Scenario | Given | When | Expect |
|----------|-------|------|--------|
| unconfirmed file rejected | file_id cannot be matched to a confirmed upload for the user | file message creation is attempted | UPLOAD_FILE_NOT_FOUND_IN_STORAGE error returned |
| image generates inline preview | uploaded file is an image MIME type | file message is posted | thumbnail and inline preview data are stored with the message |

### Composability

**Capabilities:**

- `multi_type_file_sharing`: Share images, audio, video, and generic files with type-appropriate inline rendering
- `storage_confirmed_upload`: Require backend storage confirmation before creating a file message

### Tradeoffs

| Prefer | Over | Reason |
|--------|------|--------|
| storage_integrity | upload_speed | requiring storage confirmation before message creation prevents orphaned file messages |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| upload_file | `autonomous` | - | - |
| delete_file_from_storage | `supervised` | - | - |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
source:
  repo: https://github.com/RocketChat/Rocket.Chat
  project: Open-source team communication platform
  tech_stack: TypeScript, Meteor, React, MongoDB
  files_traced: 5
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "File Upload Sharing Blueprint",
  "description": "Upload and share files, images, audio, and video in conversation channels with automatic thumbnail generation and inline preview. 10 fields. 9 outcomes. 5 error",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "files, uploads, media, attachments, sharing"
}
</script>
