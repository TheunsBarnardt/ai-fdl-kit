<!-- AUTO-GENERATED FROM tagging-categorization.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Tagging Categorization

> Tags, labels, and hierarchical categories for organizing entities with tag groups, colors, slug auto-generation, and category depth limits

**Category:** Data · **Version:** 1.0.0 · **Tags:** tagging · categorization · labels · taxonomy · hierarchy · organization

## What this does

Tags, labels, and hierarchical categories for organizing entities with tag groups, colors, slug auto-generation, and category depth limits

Specifies 7 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **tag_name** *(text, required)* — Tag Name
- **tag_slug** *(text, optional)* — Tag Slug
- **tag_color** *(text, optional)* — Tag Color
- **tag_group** *(text, optional)* — Tag Group
- **category_path** *(text, optional)* — Category Path
- **parent_category_id** *(text, optional)* — Parent Category ID
- **category_name** *(text, optional)* — Category Name
- **category_slug** *(text, optional)* — Category Slug
- **category_depth** *(number, optional)* — Category Depth
- **entity_type** *(text, required)* — Entity Type
- **entity_id** *(text, required)* — Entity ID

## What must be true

- **tags → max_tags_per_entity:** 50
- **tags → unique_within_scope:** true
- **tags → case_insensitive_matching:** true
- **tags → slug_auto_generation:** true
- **tags → slug_format:** kebab-case
- **tag_groups → predefined_groups_optional:** true
- **tag_groups → max_groups:** 100
- **categories → max_depth:** 5
- **categories → unique_name_within_parent:** true
- **categories → path_auto_generation:** true
- **categories → path_separator:** /
- **categories → prevent_circular_reference:** true
- **deletion → tag_deletion:** remove_associations
- **deletion → category_deletion:** restrict_if_has_children

## Success & failure scenarios

**✅ Success paths**

- **Tag Applied** — when user applies a tag to an entity; the tag exists or is being created inline; the entity has fewer than the maximum allowed tags; the tag is not already applied to this entity, then Tag applied to the entity.
- **Tag Removed** — when user removes a tag from an entity; the tag is currently applied to the entity, then Tag removed from the entity.
- **Category Assigned** — when user assigns an entity to a category; the category exists, then Entity assigned to the category.
- **Category Created** — when user creates a new category; the category name is unique within the parent; the depth does not exceed the maximum, then New category created in the hierarchy.

**❌ Failure paths**

- **Tag Limit Exceeded** — when user tries to apply a tag to an entity; the entity already has the maximum number of tags, then Error returned indicating tag limit reached. *(error: `TAG_LIMIT_EXCEEDED`)*
- **Category Depth Exceeded** — when user tries to create a subcategory; the parent category is already at the maximum depth, then Error returned indicating category depth limit reached. *(error: `CATEGORY_DEPTH_EXCEEDED`)*
- **Duplicate Tag** — when user tries to apply a tag that is already on the entity, then Error returned indicating the tag is already applied. *(error: `TAG_ALREADY_APPLIED`)*

## Errors it can return

- `TAG_LIMIT_EXCEEDED` — Maximum number of tags per entity reached
- `CATEGORY_DEPTH_EXCEEDED` — Category hierarchy cannot exceed the maximum depth
- `TAG_ALREADY_APPLIED` — This tag is already applied to the entity
- `CATEGORY_HAS_CHILDREN` — Cannot delete a category that has subcategories
- `CATEGORY_NAME_DUPLICATE` — A category with this name already exists under the same parent

## Connects to

- **search-and-filtering** *(required)* — Tags and categories are primary facets for filtering and searching entities
- **audit-trail** *(optional)* — Tag and category changes can be tracked for compliance

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/data/tagging-categorization/) · **Spec source:** [`tagging-categorization.blueprint.yaml`](./tagging-categorization.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
