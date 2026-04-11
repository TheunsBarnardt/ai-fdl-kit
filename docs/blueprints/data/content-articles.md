---
title: "Content Articles Blueprint"
layout: default
parent: "Data"
grand_parent: Blueprint Catalog
description: "Blog and news article system for advisors and portfolio managers to publish market insights, product updates, and investment articles to clients. 16 fields. 6 o"
---

# Content Articles Blueprint

> Blog and news article system for advisors and portfolio managers to publish market insights, product updates, and investment articles to clients

| | |
|---|---|
| **Feature** | `content-articles` |
| **Category** | Data |
| **Version** | 1.0.0 |
| **Tags** | blog, articles, content, news, market-insights, wealth-management |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/data/content-articles.blueprint.yaml) |
| **JSON API** | [content-articles.json]({{ site.baseurl }}/api/blueprints/data/content-articles.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `ifa` | Independent Financial Advisor | human |  |
| `portfolio_manager` | Portfolio Manager | human |  |
| `client` | Client | human |  |
| `admin` | Administrator | human |  |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `article_id` | text | Yes | Article Id | Validations: required |
| `title` | text | Yes | Title | Validations: required, maxLength |
| `slug` | text | Yes | Slug | Validations: pattern |
| `excerpt` | text | Yes | Excerpt | Validations: maxLength |
| `body` | rich_text | Yes | Body | Validations: required |
| `cover_image_url` | url | No | Cover Image Url |  |
| `author_id` | text | Yes | Author Id |  |
| `author_name` | text | Yes | Author Name |  |
| `author_role` | select | Yes | Author Role |  |
| `category` | select | Yes | Category |  |
| `tags` | json | No | Article Tags |  |
| `related_product_ids` | json | No | Related Products |  |
| `target_audience` | select | Yes | Target Audience |  |
| `status` | select | Yes | Status |  |
| `published_at` | datetime | No | Published At |  |
| `is_featured` | boolean | No | Is Featured |  |

## Rules

- **permissions:** IFA and Portfolio Manager can create, edit, and publish articles, Admin can manage all articles, Clients can only read published articles visible to them, Authors can only edit their own articles unless admin
- **visibility:** all_clients articles are visible to every authenticated client, my_clients articles are visible only to the author's assigned clients, product_holders articles are visible only to clients holding related products, Draft articles are only visible to the author and admins
- **content:** Articles support rich text with images and embedded charts, Related products link articles to investment products, Featured articles appear at top of client news feed

## Outcomes

### Create_article (Priority: 10)

**Given:**
- `user.role` (session) in `IFA,Portfolio Manager,Admin`
- `title` (input) exists
- `body` (input) exists

**Then:**
- **create_record** target: `articles`
- **set_field** target: `status` value: `draft`
- **emit_event** event: `article.created`

**Result:** Article created in draft status

### Publish_article (Priority: 20) — Error: `ARTICLE_ALREADY_PUBLISHED`

**Given:**
- `article_id` (input) exists
- `status` (db) eq `draft`
- ANY: `author_id` (db) eq `current_user_id` OR `user.role` (session) eq `Admin`

**Then:**
- **set_field** target: `status` value: `published`
- **set_field** target: `published_at` value: `now`
- **emit_event** event: `article.published`
- **notify** target: `target_clients`

**Result:** Article published and target clients notified

### List_articles_client (Priority: 30)

**Given:**
- `user.role` (session) eq `Client`

**Then:**
- **emit_event** event: `article.listed`

**Result:** Return published articles visible to this client based on audience rules

### List_articles_author (Priority: 31) — Error: `ARTICLE_UNAUTHORIZED`

**Given:**
- `user.role` (session) in `IFA,Portfolio Manager,Admin`

**Then:**
- **emit_event** event: `article.listed`

**Result:** Return all articles by this author including drafts

### Update_article (Priority: 40)

**Given:**
- `article_id` (input) exists
- ANY: `author_id` (db) eq `current_user_id` OR `user.role` (session) eq `Admin`

**Then:**
- **set_field** target: `updated_at` value: `now`
- **emit_event** event: `article.updated`

**Result:** Article updated

### Archive_article (Priority: 50)

**Given:**
- `article_id` (input) exists
- `status` (db) eq `published`
- ANY: `author_id` (db) eq `current_user_id` OR `user.role` (session) eq `Admin`

**Then:**
- **set_field** target: `status` value: `archived`
- **emit_event** event: `article.archived`

**Result:** Article archived and no longer visible to clients

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `ARTICLE_NOT_FOUND` | 404 | Article not found | No |
| `ARTICLE_UNAUTHORIZED` | 403 | You do not have permission to modify this article | No |
| `ARTICLE_ALREADY_PUBLISHED` | 400 | Article is already published | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `article.created` | Article created | `article_id`, `author_id`, `timestamp` |
| `article.published` | Article published | `article_id`, `author_id`, `target_audience`, `timestamp` |
| `article.updated` | Article updated | `article_id`, `author_id`, `timestamp` |
| `article.archived` | Article archived | `article_id`, `timestamp` |
| `article.listed` | Articles listed | `user_id`, `timestamp` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| product-configurator | recommended | Articles can be linked to specific investment products |
| in-app-notifications | recommended | Clients notified when new articles are published |
| ifa-portal | recommended | IFAs publish articles through their portal |
| portfolio-management | optional | Articles may reference portfolio strategies |

## AGI Readiness

### Goals

#### Reliable Content Articles

Blog and news article system for advisors and portfolio managers to publish market insights, product updates, and investment articles to clients

**Success Metrics:**

| Metric | Target | Measurement |
|--------|--------|-------------|
| data_accuracy | 100% | Records matching source of truth |
| duplicate_rate | 0% | Duplicate records detected post-creation |

**Constraints:**

- **performance** (non-negotiable): Data consistency must be maintained across concurrent operations

### Autonomy

**Level:** `supervised`

**Human Checkpoints:**

- before making irreversible changes

**Escalation Triggers:**

- `error_rate > 5`

### Tradeoffs

| Prefer | Over | Reason |
|--------|------|--------|
| data_integrity | performance | data consistency must be maintained across all operations |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| create_article | `supervised` | - | - |
| publish_article | `autonomous` | - | - |
| list_articles_client | `autonomous` | - | - |
| list_articles_author | `autonomous` | - | - |
| update_article | `supervised` | - | - |
| archive_article | `autonomous` | - | - |

<details>
<summary><strong>UI Hints</strong></summary>

```yaml
layout: card_grid
list_view: blog_feed
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Content Articles Blueprint",
  "description": "Blog and news article system for advisors and portfolio managers to publish market insights, product updates, and investment articles to clients. 16 fields. 6 o",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "blog, articles, content, news, market-insights, wealth-management"
}
</script>
