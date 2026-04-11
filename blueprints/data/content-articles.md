<!-- AUTO-GENERATED FROM content-articles.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Content Articles

> Blog and news article system for advisors and portfolio managers to publish market insights, product updates, and investment articles to clients

**Category:** Data · **Version:** 1.0.0 · **Tags:** blog · articles · content · news · market-insights · wealth-management

## What this does

Blog and news article system for advisors and portfolio managers to publish market insights, product updates, and investment articles to clients

Specifies 6 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **article_id** *(text, required)*
- **title** *(text, required)*
- **slug** *(text, required)*
- **excerpt** *(text, required)*
- **body** *(rich_text, required)*
- **cover_image_url** *(url, optional)*
- **author_id** *(text, required)*
- **author_name** *(text, required)*
- **author_role** *(select, required)*
- **category** *(select, required)*
- **tags** *(json, optional)* — Article Tags
- **related_product_ids** *(json, optional)* — Related Products
- **target_audience** *(select, required)*
- **status** *(select, required)*
- **published_at** *(datetime, optional)*
- **is_featured** *(boolean, optional)*

## What must be true

- **permissions:** IFA and Portfolio Manager can create, edit, and publish articles, Admin can manage all articles, Clients can only read published articles visible to them, Authors can only edit their own articles unless admin
- **visibility:** all_clients articles are visible to every authenticated client, my_clients articles are visible only to the author's assigned clients, product_holders articles are visible only to clients holding related products, Draft articles are only visible to the author and admins
- **content:** Articles support rich text with images and embedded charts, Related products link articles to investment products, Featured articles appear at top of client news feed

## Success & failure scenarios

**✅ Success paths**

- **Create Article** — when user.role in ["IFA","Portfolio Manager","Admin"]; title exists; body exists, then Article created in draft status.
- **Publish Article** — when article_id exists; status eq "draft"; author_id eq "current_user_id" OR user.role eq "Admin", then Article published and target clients notified.
- **List Articles Client** — when user.role eq "Client", then Return published articles visible to this client based on audience rules.
- **List Articles Author** — when user.role in ["IFA","Portfolio Manager","Admin"], then Return all articles by this author including drafts.
- **Update Article** — when article_id exists; author_id eq "current_user_id" OR user.role eq "Admin", then Article updated.
- **Archive Article** — when article_id exists; status eq "published"; author_id eq "current_user_id" OR user.role eq "Admin", then Article archived and no longer visible to clients.

## Errors it can return

- `ARTICLE_NOT_FOUND` — Article not found
- `ARTICLE_UNAUTHORIZED` — You do not have permission to modify this article
- `ARTICLE_ALREADY_PUBLISHED` — Article is already published

## Connects to

- **product-configurator** *(recommended)* — Articles can be linked to specific investment products
- **in-app-notifications** *(recommended)* — Clients notified when new articles are published
- **ifa-portal** *(recommended)* — IFAs publish articles through their portal
- **portfolio-management** *(optional)* — Articles may reference portfolio strategies

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/data/content-articles/) · **Spec source:** [`content-articles.blueprint.yaml`](./content-articles.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
