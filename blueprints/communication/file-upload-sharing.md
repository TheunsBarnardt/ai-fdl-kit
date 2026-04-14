<!-- AUTO-GENERATED FROM file-upload-sharing.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# File Upload Sharing

> Upload and share files, images, audio, and video in conversation channels with automatic thumbnail generation and inline preview

**Category:** Communication · **Version:** 1.0.0 · **Tags:** files · uploads · media · attachments · sharing

## What this does

Upload and share files, images, audio, and video in conversation channels with automatic thumbnail generation and inline preview

Specifies 9 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **file_id** *(text, required)* — File ID
- **channel_id** *(text, required)* — Channel ID
- **file_name** *(text, required)* — File Name
- **file_type** *(text, required)* — MIME Type
- **file_size** *(number, required)* — File Size
- **description** *(text, optional)* — File Description
- **message_text** *(text, optional)* — Message Text
- **thread_id** *(text, optional)* — Thread ID
- **file_url** *(url, optional)* — File URL
- **image_dimensions** *(json, optional)* — Image Dimensions

## What must be true

- **general:** The uploading user must be authenticated and have access to the target channel, File uploads may be restricted by allowed MIME types; files with disallowed types are rejected, File size must not exceed the configured maximum upload size for the workspace, For image files, a preview thumbnail is generated and stored separately to optimise load times, Image attachments include inline preview data (base64 small preview) for immediate rendering before the full image loads, Audio and video files are displayed with a native player control inline in the conversation, All other file types are displayed as a downloadable link attachment with filename and size, File records require file_id, file_name, file_type, and file_size to be valid; missing any of these rejects the upload, The file must be confirmed as uploaded to the storage backend before a message attachment is created, Files are stored with a namespaced path that includes the channel and user context to prevent collisions, Download URLs include the encoded filename to preserve the original name on download, After a file message is sent, a post-upload callback notifies registered integrations, End-to-end encrypted uploads use an encrypted content structure to protect file metadata and content, App-type bots may share files without the standard channel-membership access check

## Success & failure scenarios

**✅ Success paths**

- **Image Shared** — when user is authenticated and has channel access; file record is valid and confirmed in storage; file_type matches an image MIME type, then Image is displayed inline in the conversation with a thumbnail preview.
- **Audio Shared** — when user is authenticated and has channel access; file record is valid and confirmed in storage; file_type matches an audio MIME type, then Audio file is displayed with an inline player control in the conversation.
- **Video Shared** — when user is authenticated and has channel access; file record is valid and confirmed in storage; file_type matches a video MIME type, then Video is displayed with an inline player control in the conversation.
- **Generic File Shared** — when user is authenticated and has channel access; file record is valid and confirmed in storage; file_type does not match image, audio, or video, then File appears as a downloadable attachment with name and size information.

**❌ Failure paths**

- **User Not Authenticated** — when no authenticated user session exists, then Upload rejected; user must be logged in. *(error: `UPLOAD_NOT_AUTHENTICATED`)*
- **Channel Not Found** — when channel_id does not correspond to an existing channel, then Upload rejected; the target channel could not be found. *(error: `UPLOAD_CHANNEL_NOT_FOUND`)*
- **User No Channel Access** — when authenticated user does not have access to the target channel, then Upload rejected; user does not have permission to post in this channel. *(error: `UPLOAD_NO_CHANNEL_ACCESS`)*
- **Invalid File Record** — when file record is missing one or more required fields: file_id, file_name, file_type, file_size, then Upload rejected; the file record is incomplete or invalid. *(error: `UPLOAD_INVALID_FILE`)*
- **File Not Confirmed In Storage** — when file_id cannot be matched to a confirmed upload record for this user and channel, then Upload rejected; the file has not been confirmed in storage. *(error: `UPLOAD_FILE_NOT_FOUND_IN_STORAGE`)*

## Errors it can return

- `UPLOAD_NOT_AUTHENTICATED` — You must be logged in to upload files
- `UPLOAD_CHANNEL_NOT_FOUND` — The target channel could not be found
- `UPLOAD_NO_CHANNEL_ACCESS` — You do not have permission to share files in this channel
- `UPLOAD_INVALID_FILE` — The file is invalid or missing required information
- `UPLOAD_FILE_NOT_FOUND_IN_STORAGE` — The file could not be confirmed; please try uploading again

## Events

**`file.uploaded`** — Fired after a file message is successfully posted in a channel
  Payload: `file_id`, `channel_id`, `uploader_user_id`, `file_name`, `file_type`, `file_size`

## Connects to

- **direct-messaging** *(recommended)* — File sharing applies to direct messages and group conversations as well as channels
- **message-pinning** *(optional)* — File messages can be pinned for quick channel reference
- **link-preview-unfurling** *(optional)* — Shared file URLs may trigger link previews in other messages

## Quality fitness 🟢 81/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `███████░░░` | 7/10 |
| Outcomes | `██████████████████████░░░` | 22/25 |
| Structured conditions | `███░░░░░░░` | 3/10 |
| Error binding | `██████████` | 10/10 |
| Field validation | `██████░░░░` | 6/10 |
| Relationships | `█████████░` | 9/10 |
| Events | `████░` | 4/5 |
| AGI readiness | `█████` | 5/5 |
| Simplicity | `█████` | 5/5 |

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/communication/file-upload-sharing/) · **Spec source:** [`file-upload-sharing.blueprint.yaml`](./file-upload-sharing.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
