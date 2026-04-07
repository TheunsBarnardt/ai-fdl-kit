---
title: "Tagging Categorization Blueprint"
layout: default
parent: "Data"
grand_parent: Blueprint Catalog
description: "Tags, labels, and hierarchical categories for organizing entities with tag groups, colors, slug auto-generation, and category depth limits. 11 fields. 7 outcome"
---

# Tagging Categorization Blueprint

> Tags, labels, and hierarchical categories for organizing entities with tag groups, colors, slug auto-generation, and category depth limits

| | |
|---|---|
| **Feature** | `tagging-categorization` |
| **Category** | Data |
| **Version** | 1.0.0 |
| **Tags** | tagging, categorization, labels, taxonomy, hierarchy, organization |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/data/tagging-categorization.blueprint.yaml) |
| **JSON API** | [tagging-categorization.json]({{ site.baseurl }}/api/blueprints/data/tagging-categorization.json) |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `tag_name` | text | Yes | Tag Name | Validations: minLength, maxLength |
| `tag_slug` | text | No | Tag Slug |  |
| `tag_color` | text | No | Tag Color | Validations: pattern |
| `tag_group` | text | No | Tag Group |  |
| `category_path` | text | No | Category Path |  |
| `parent_category_id` | text | No | Parent Category ID |  |
| `category_name` | text | No | Category Name | Validations: maxLength |
| `category_slug` | text | No | Category Slug |  |
| `category_depth` | number | No | Category Depth |  |
| `entity_type` | text | Yes | Entity Type |  |
| `entity_id` | text | Yes | Entity ID |  |

## Rules

- **tags:**
  - **max_tags_per_entity:** 50
  - **unique_within_scope:** true
  - **case_insensitive_matching:** true
  - **slug_auto_generation:** true
  - **slug_format:** kebab-case
- **tag_groups:**
  - **predefined_groups_optional:** true
  - **max_groups:** 100
- **categories:**
  - **max_depth:** 5
  - **unique_name_within_parent:** true
  - **path_auto_generation:** true
  - **path_separator:** /
  - **prevent_circular_reference:** true
- **deletion:**
  - **tag_deletion:** remove_associations
  - **category_deletion:** restrict_if_has_children

## Outcomes

### Tag_applied (Priority: 1)

**Given:**
- user applies a tag to an entity
- the tag exists or is being created inline
- the entity has fewer than the maximum allowed tags
- the tag is not already applied to this entity

**Then:**
- **create_record** target: `entity_tag` — Create association between entity and tag
- **emit_event** event: `tag.applied`

**Result:** Tag applied to the entity

### Tag_removed (Priority: 2)

**Given:**
- user removes a tag from an entity
- the tag is currently applied to the entity

**Then:**
- **delete_record** — Remove association between entity and tag
- **emit_event** event: `tag.removed`

**Result:** Tag removed from the entity

### Category_assigned (Priority: 3)

**Given:**
- user assigns an entity to a category
- the category exists

**Then:**
- **set_field** target: `entity_category` — Set the entity's category to the specified category
- **emit_event** event: `category.assigned`

**Result:** Entity assigned to the category

### Category_created (Priority: 4)

**Given:**
- user creates a new category
- the category name is unique within the parent
- the depth does not exceed the maximum

**Then:**
- **create_record** target: `category` — Create category with auto-generated slug and path
- **emit_event** event: `category.created`

**Result:** New category created in the hierarchy

### Tag_limit_exceeded (Priority: 10) — Error: `TAG_LIMIT_EXCEEDED`

**Given:**
- user tries to apply a tag to an entity
- the entity already has the maximum number of tags

**Result:** Error returned indicating tag limit reached

### Category_depth_exceeded (Priority: 11) — Error: `CATEGORY_DEPTH_EXCEEDED`

**Given:**
- user tries to create a subcategory
- the parent category is already at the maximum depth

**Result:** Error returned indicating category depth limit reached

### Duplicate_tag (Priority: 12) — Error: `TAG_ALREADY_APPLIED`

**Given:**
- user tries to apply a tag that is already on the entity

**Result:** Error returned indicating the tag is already applied

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `TAG_LIMIT_EXCEEDED` | 400 | Maximum number of tags per entity reached | No |
| `CATEGORY_DEPTH_EXCEEDED` | 400 | Category hierarchy cannot exceed the maximum depth | No |
| `TAG_ALREADY_APPLIED` | 409 | This tag is already applied to the entity | No |
| `CATEGORY_HAS_CHILDREN` | 409 | Cannot delete a category that has subcategories | No |
| `CATEGORY_NAME_DUPLICATE` | 409 | A category with this name already exists under the same parent | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `tag.applied` | A tag was applied to an entity | `tag_name`, `tag_group`, `entity_type`, `entity_id` |
| `tag.removed` | A tag was removed from an entity | `tag_name`, `tag_group`, `entity_type`, `entity_id` |
| `category.created` | A new category was created in the hierarchy | `category_name`, `category_path`, `parent_category_id` |
| `category.assigned` | An entity was assigned to a category | `category_path`, `entity_type`, `entity_id` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| search-and-filtering | required | Tags and categories are primary facets for filtering and searching entities |
| audit-trail | optional | Tag and category changes can be tracked for compliance |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Tagging Categorization Blueprint",
  "description": "Tags, labels, and hierarchical categories for organizing entities with tag groups, colors, slug auto-generation, and category depth limits. 11 fields. 7 outcome",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "tagging, categorization, labels, taxonomy, hierarchy, organization"
}
</script>
