<!-- AUTO-GENERATED FROM legal-hold.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Legal Hold

> Preservation order that suspends automated deletion of specific communications, files, and user data pending litigation, regulatory investigation, or legal request, overriding any data retention...

**Category:** Data · **Version:** 1.0.0 · **Tags:** legal-hold · ediscovery · litigation · preservation · compliance · regulatory

## What this does

Preservation order that suspends automated deletion of specific communications, files, and user data pending litigation, regulatory investigation, or legal request, overriding any data retention...

Specifies 5 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **hold_id** *(hidden, required)* — Unique identifier for this legal hold
- **name** *(text, required)* — Human-readable label describing the legal matter
- **custodian_user_ids** *(json, required)* — Array of user IDs whose content is subject to preservation
- **channel_ids** *(json, optional)* — Optional array of channel IDs to scope the hold; empty means all channels for th
- **start_at** *(datetime, optional)* — Earliest message timestamp covered by this hold (inclusive)
- **end_at** *(datetime, optional)* — Latest message timestamp covered by this hold (inclusive); null means ongoing
- **include_files** *(boolean, required)* — Whether file attachments sent by custodians are also preserved
- **export_path** *(text, optional)* — Storage destination where preserved content is archived for legal review

## What must be true

- **rule_01:** An active legal hold overrides any data retention policy; covered content must not be deleted regardless of its age.
- **rule_02:** Content covered by a hold is determined by the intersection of custodian identities, channel scope, and date range.
- **rule_03:** When the hold is released, covered content immediately becomes subject to the applicable retention policy; content already past the retention window must be evaluated for immediate deletion.
- **rule_04:** A hold does not affect the users' ability to continue messaging; they are not notified that a hold exists unless required by law.
- **rule_05:** Holds are logged in the audit trail with the identity of the legal administrator who created or released them.
- **rule_06:** Multiple holds may overlap; content is preserved as long as at least one active hold covers it.
- **rule_07:** File attachments are included only when include_files is true; the hold is independently configurable for messages and files.
- **rule_08:** The hold preservation archive is stored in a separate, access-controlled location independent of the primary message store.
- **rule_09:** Releasing a hold should trigger a review to determine whether retained content must be deleted to comply with data retention obligations.

## Success & failure scenarios

**✅ Success paths**

- **Deletion Blocked By Hold** — when retention job or administrator attempts to delete content; content is within the date range and custodian scope of at least one active hold, then Deletion skipped for held content; other non-held content proceeds normally.
- **Overlapping Hold Maintained** — when one hold covering content is released; at least one other active hold still covers the same content, then Content remains preserved because the remaining hold is still active.
- **Hold Created** — when actor is legal administrator; custodian_user_ids are valid active users; name is provided, then All covered content is immediately protected from any automated or manual deletion.
- **Hold Content Exported** — when legal administrator requests export of held content; hold is active, then Archive of held content available for legal review.
- **Hold Released** — when legal administrator releases the hold; legal matter is resolved, then Content previously held is now subject to normal retention policies.

## Errors it can return

- `LEGAL_HOLD_NOT_FOUND` — Legal hold not found.
- `LEGAL_HOLD_INVALID_CUSTODIAN` — One or more specified users do not exist.
- `LEGAL_HOLD_ALREADY_RELEASED` — This hold has already been released.
- `LEGAL_HOLD_NOT_LICENSED` — Legal hold requires an enterprise compliance license.

## Events

**`legal_hold.created`** — A new legal hold was placed
  Payload: `hold_id`, `name`, `custodian_count`, `channel_count`, `actor_id`, `timestamp`

**`legal_hold.released`** — A legal hold was lifted
  Payload: `hold_id`, `actor_id`, `timestamp`

**`legal_hold.deletion_blocked`** — Retention deletion was skipped because content is under a legal hold
  Payload: `hold_id`, `content_id`, `content_type`, `timestamp`

**`legal_hold.exported`** — Held content packaged into an export archive for legal review
  Payload: `hold_id`, `export_path`, `record_count`, `actor_id`, `timestamp`

## Connects to

- **data-retention-policies** *(required)* — Legal holds override retention deletion; the two systems must coordinate
- **compliance-exports** *(recommended)* — Held content can be exported in compliance formats for eDiscovery
- **audit-logging** *(required)* — All hold creation, release, and export operations are recorded in the audit log

## Quality fitness 🟡 71/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `██████░░░░` | 6/10 |
| Outcomes | `███████████████████████░░` | 23/25 |
| Structured conditions | `████░░░░░░` | 4/10 |
| Error binding | `██░░░░░░░░` | 2/10 |
| Field validation | `██████░░░░` | 6/10 |
| Relationships | `█████████░` | 9/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `██░░░` | 2/5 |
| Simplicity | `████░` | 4/5 |

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/data/legal-hold/) · **Spec source:** [`legal-hold.blueprint.yaml`](./legal-hold.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
