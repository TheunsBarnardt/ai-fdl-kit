---
title: "Comments Annotations Blueprint"
layout: default
parent: "Data"
grand_parent: Blueprint Catalog
description: "Threaded comments on any entity (polymorphic) with rich text, @mentions, reactions, edit windows, and rate limiting. 11 fields. 8 outcomes. 5 error codes. rules"
---

# Comments Annotations Blueprint

> Threaded comments on any entity (polymorphic) with rich text, @mentions, reactions, edit windows, and rate limiting

| | |
|---|---|
| **Feature** | `comments-annotations` |
| **Category** | Data |
| **Version** | 1.0.0 |
| **Tags** | comments, annotations, threading, mentions, reactions, polymorphic, collaboration |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/data/comments-annotations.blueprint.yaml) |
| **JSON API** | [comments-annotations.json]({{ site.baseurl }}/api/blueprints/data/comments-annotations.json) |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `comment_id` | text | Yes | Comment ID |  |
| `body` | rich_text | Yes | Comment Body | Validations: maxLength, minLength |
| `author_id` | text | Yes | Author ID |  |
| `parent_comment_id` | text | No | Parent Comment ID |  |
| `entity_type` | text | Yes | Entity Type |  |
| `entity_id` | text | Yes | Entity ID |  |
| `edited_at` | datetime | No | Last Edited At |  |
| `reactions` | json | No | Reactions |  |
| `mentions` | json | No | Mentions |  |
| `thread_depth` | number | No | Thread Depth |  |
| `is_deleted` | boolean | No | Soft Deleted |  |

## Rules

- **content:**
  - **max_length:** 10000
  - **rich_text_allowed:** true
  - **sanitize_html:** true
  - **mention_syntax:** @username
- **threading:**
  - **max_depth:** 5
  - **collapse_threshold:** 3
- **editing:**
  - **edit_window_minutes:** 15
  - **show_edit_indicator:** true
- **deletion:**
  - **soft_delete:** true
  - **author_can_delete:** true
  - **admin_can_delete:** true
- **reactions:**
  - **max_reactions_per_user_per_comment:** 5
  - **allowed_reactions:** configurable
- **rate_limiting:**
  - **max_comments_per_minute:** 5
  - **max_reactions_per_minute:** 20
- **sorting:**
  - **default_sort:** created_at_asc
  - **options:** created_at_asc, created_at_desc, reactions_count

## Outcomes

### Comment_created (Priority: 1)

**Given:**
- user submits a comment on an entity
- comment body passes validation
- user has not exceeded the rate limit

**Then:**
- **create_record** target: `comment` — Create the comment record with body, author, entity reference
- **emit_event** event: `comment.created`

**Result:** Comment created and visible on the entity

### Reply_created (Priority: 2)

**Given:**
- user submits a reply to an existing comment
- parent comment exists and is not deleted
- thread depth does not exceed the maximum

**Then:**
- **create_record** target: `comment` — Create reply with parent_comment_id set
- **emit_event** event: `comment.replied`

**Result:** Reply created and nested under the parent comment

### Comment_edited (Priority: 3)

**Given:**
- author edits their own comment
- the comment was created within the edit window (15 minutes)

**Then:**
- **set_field** target: `body` — Update comment body with new content
- **set_field** target: `edited_at` — Set to current timestamp
- **emit_event** event: `comment.edited`

**Result:** Comment updated with edited indicator

### Comment_deleted (Priority: 4)

**Given:**
- ANY: the author deletes their own comment OR an admin deletes any comment

**Then:**
- **set_field** target: `is_deleted` value: `true`
- **set_field** target: `body` — Replace body with '[deleted]' placeholder
- **emit_event** event: `comment.deleted`

**Result:** Comment soft-deleted; shows '[deleted]' but thread structure preserved

### Reaction_added (Priority: 5)

**Given:**
- user adds a reaction to a comment
- user has not already added this reaction to this comment
- user has not exceeded max reactions per comment

**Then:**
- **set_field** target: `reactions` — Append reaction to the comment's reaction array
- **emit_event** event: `comment.reacted`

**Result:** Reaction added to the comment

### Mention_detected (Priority: 6)

**Given:**
- a comment or reply body contains @username references
- the mentioned users exist

**Then:**
- **notify** to: `mentioned_users` — Send notification to each mentioned user
- **emit_event** event: `comment.mentioned`

**Result:** Mentioned users notified of the comment

### Edit_window_expired (Priority: 10) — Error: `COMMENT_EDIT_WINDOW_EXPIRED`

**Given:**
- author attempts to edit a comment
- `edit_window` (computed) eq `false`

**Result:** Error returned indicating the edit window has closed

### Rate_limited (Priority: 11) — Error: `COMMENT_RATE_LIMITED`

**Given:**
- user attempts to create a comment
- user has exceeded the rate limit

**Result:** Error returned indicating rate limit exceeded

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `COMMENT_EDIT_WINDOW_EXPIRED` | 403 | Comments can only be edited within 15 minutes of creation | No |
| `COMMENT_RATE_LIMITED` | 429 | Comment rate limit exceeded; please wait before posting again | No |
| `COMMENT_TOO_LONG` | 400 | Comment body exceeds the maximum length of 10,000 characters | No |
| `COMMENT_PARENT_NOT_FOUND` | 404 | Parent comment does not exist | No |
| `COMMENT_THREAD_DEPTH_EXCEEDED` | 400 | Maximum reply nesting depth reached | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `comment.created` | A new top-level comment was created | `comment_id`, `entity_type`, `entity_id`, `author_id` |
| `comment.replied` | A reply was created on an existing comment | `comment_id`, `parent_comment_id`, `entity_type`, `entity_id`, `author_id` |
| `comment.edited` | A comment was edited within the edit window | `comment_id`, `author_id` |
| `comment.deleted` | A comment was soft-deleted | `comment_id`, `entity_type`, `entity_id`, `deleted_by` |
| `comment.mentioned` | Users were mentioned in a comment via @username | `comment_id`, `entity_type`, `entity_id`, `mentioned_user_ids` |
| `comment.reacted` | A reaction was added to a comment | `comment_id`, `emoji`, `user_id` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| soft-delete | required | Comments use soft-delete to preserve thread structure |
| search-and-filtering | recommended | Comments should be searchable by content and author |
| audit-trail | optional | Comment edits and deletions can be tracked for moderation |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Comments Annotations Blueprint",
  "description": "Threaded comments on any entity (polymorphic) with rich text, @mentions, reactions, edit windows, and rate limiting. 11 fields. 8 outcomes. 5 error codes. rules",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "comments, annotations, threading, mentions, reactions, polymorphic, collaboration"
}
</script>
