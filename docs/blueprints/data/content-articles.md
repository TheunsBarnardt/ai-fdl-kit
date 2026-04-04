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
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/claude-fdl/blob/master/blueprints/data/content-articles.blueprint.yaml) |
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
| `article_id` | text | Yes |  | Validations: required |
| `title` | text | Yes |  | Validations: required, maxLength |
| `slug` | text | Yes |  | Validations: pattern |
| `excerpt` | text | Yes |  | Validations: maxLength |
| `body` | rich_text | Yes |  | Validations: required |
| `cover_image_url` | url | No |  |  |
| `author_id` | text | Yes |  |  |
| `author_name` | text | Yes |  |  |
| `author_role` | select | Yes |  |  |
| `category` | select | Yes |  |  |
| `tags` | json | No | Article Tags |  |
| `related_product_ids` | json | No | Related Products |  |
| `target_audience` | select | Yes |  |  |
| `status` | select | Yes |  |  |
| `published_at` | datetime | No |  |  |
| `is_featured` | boolean | No |  |  |

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

### Publish_article (Priority: 20)

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

### List_articles_author (Priority: 31)

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
  "codeRepository": "https://github.com/TheunsBarnardt/claude-fdl",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "blog, articles, content, news, market-insights, wealth-management"
}
</script>
