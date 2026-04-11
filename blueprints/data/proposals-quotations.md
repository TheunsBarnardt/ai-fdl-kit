<!-- AUTO-GENERATED FROM proposals-quotations.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Proposals Quotations

> Creation, management, and approval workflow for investment proposals and quotations delivered to clients

**Category:** Data · **Version:** 1.0.0 · **Tags:** proposals · quotations · document-generation · client-communication

## What this does

Creation, management, and approval workflow for investment proposals and quotations delivered to clients

Specifies 18 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **proposal_id** *(number, required)* — Proposal Id
- **crm_number** *(text, required)* — Crm Number
- **proposal_name** *(text, required)* — Proposal Name
- **client_id** *(text, required)* — Client Id
- **first_name** *(text, required)* — First Name
- **last_name** *(text, required)* — Last Name
- **email** *(email, required)* — Email
- **mobile_phone** *(phone, required)* — Mobile Phone
- **identification_number** *(text, required)* — Identification Number
- **passport_number** *(text, optional)* — Passport Number
- **portfolio_manager_id** *(text, required)* — Portfolio Manager Id
- **portfolio_manager_name** *(text, required)* — Portfolio Manager Name
- **relationship_team_id** *(text, required)* — Relationship Team Id
- **product_id** *(number, required)* — Product Id
- **product_name** *(text, required)* — Product Name
- **asset_manager_id** *(number, required)* — Asset Manager Id
- **document_id** *(text, required)* — Document Id
- **document_name** *(text, required)* — Document Name
- **status** *(select, required)* — Status
- **client_comment** *(rich_text, optional)* — Client Comment
- **created_at** *(datetime, required)* — Created At

## What must be true

- **validation:** Client email must be valid, Client ID required, Product and asset manager must exist, Document required
- **permissions:** Client views their proposals, PM creates and manages proposals, PM Assistant supports proposal creation, Client accepts or declines

## Success & failure scenarios

**✅ Success paths**

- **Accept Proposal** — when proposal_id exists; status eq "pending"; client.role eq "Client", then Proposal accepted.
- **Decline Proposal** — when proposal_id exists; status eq "pending"; client.role eq "Client", then Proposal declined.
- **Get Current Proposal** — when client.role eq "Client", then Returns latest proposal.
- **Get Client Proposals** — when client.role eq "Client", then Returns all client proposals.
- **Get Proposals For Review** — when client.role eq "Client"; status eq "pending", then Returns pending proposals.
- **Get Proposal With Document** — when proposal_id exists; client.role eq "Client", then Returns proposal with document.
- **Get Proposal Document** — when proposal_id exists; document_id exists; client.role eq "Client", then Returns PDF document.
- **Generate Mandate Pdf** — when onboarding_id exists; client.role eq "Client", then Returns mandate PDF.
- **Complete Onboarding Workflow** — when onboarding_id exists; status in ["approved","waiting_signature"]; client.role eq "Client", then eSignature service signing initiated.
- **Handle Mandate Signed** — when onboarding_id exists; envelope_status eq "completed", then Mandate signed.
- **Create Proposal** — when document_file exists; client_information.identification_number exists; mandate_details.product_id exists; client.role in ["Portfolio Manager","PM Assistant"], then Validation performed.
- **Create Proposal Success** — when document_file exists; client_information exists; mandate_details exists; client_information.identification_number not_exists; client.role in ["Portfolio Manager","PM Assistant"], then Proposal created.
- **Get Pm Proposals** — when client.role in ["Portfolio Manager","PM Assistant"], then Returns PM proposals.
- **Get Proposal By Id** — when proposal_id exists; client.role in ["Portfolio Manager","PM Assistant"], then Returns proposal details.
- **Update Proposal** — when proposal_id exists; status in ["pending"]; client.role in ["Portfolio Manager","PM Assistant"], then Proposal updated.
- **Create Direct Onboarding** — when client_information exists; mandate_details exists; client.role in ["Portfolio Manager","PM Assistant"], then Onboarding created.
- **Start Onboarding For Proposal** — when proposal_id exists; status eq "accepted"; client.role in ["Portfolio Manager","PM Assistant"], then Onboarding from proposal.
- **Get Pm Onboardings** — when client.role in ["Portfolio Manager","PM Assistant"], then Returns PM onboardings.

## Errors it can return

- `PROPOSAL_NOT_FOUND` — Proposal not found
- `INVALID_STATUS_TRANSITION` — Invalid status transition
- `DUPLICATE_CLIENT` — Client already exists
- `MISSING_CLIENT_INFO` — Client information missing
- `DOCUMENT_UPLOAD_FAILED` — Document upload failed
- `DOCUMENT_NOT_FOUND` — Document not found
- `INVALID_EMAIL` — Invalid email
- `INVALID_PHONE` — Invalid phone
- `UNAUTHORIZED_ACCESS` — Unauthorized
- `PDF_GENERATION_FAILED` — PDF generation failed
- `DOCU_SIGN_INTEGRATION_ERROR` — eSignature service error

## Connects to

- **client-onboarding** *(required)*
- **advisor-onboarding** *(optional)*
- **user-auth** *(required)*

## Quality fitness 🟢 80/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `████████░░` | 8/10 |
| Outcomes | `██████████████████████░░░` | 22/25 |
| Structured conditions | `██████████` | 10/10 |
| Error binding | `██░░░░░░░░` | 2/10 |
| Field validation | `██████████` | 10/10 |
| Relationships | `███████░░░` | 7/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `██░░░` | 2/5 |
| Simplicity | `████░` | 4/5 |

📈 **+3** since baseline (77 → 80)

**Recent auto-improvements** *(via autoresearch-style keep-or-reset loop — applied only because they raised the fitness score)*

- `T3` **auto-field-labels** — added labels to 21 fields

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/data/proposals-quotations/) · **Spec source:** [`proposals-quotations.blueprint.yaml`](./proposals-quotations.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
