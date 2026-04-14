<!-- AUTO-GENERATED FROM popia-compliance.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Popia Compliance

> South African POPIA (Act 4 of 2013) reference — eight conditions for lawful processing, data subject rights, breach notification, direct marketing, automated decisions, transborder transfers.

**Category:** Data · **Version:** 1.0.0 · **Tags:** popia · compliance · privacy · south-africa · data-protection · regulatory · reference · act-4-of-2013

## What this does

South African POPIA (Act 4 of 2013) reference — eight conditions for lawful processing, data subject rights, breach notification, direct marketing, automated decisions, transborder transfers.

Specifies 9 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## What must be true

- **rule_01:** "Personal information" is any information relating to an identifiable, living natural person — and where applicable, an identifiable existing juristic person — including race, gender, sex, pregnancy, marital status, national/ethnic/social origin, colour, sexual orientation, age, physical or mental health, well-being, disability, religion, conscience, belief, culture, language, birth, education, medical/financial/criminal/employment history, identifying numbers (ID, passport, employee number), email, physical address, telephone, location, online identifier, biometric data, personal opinions/preferences, private correspondence, third-party views about the person, and the person's name when its disclosure would reveal other PI. (s.1 "personal information")
- **rule_02:** "Special personal information" (s.26) is a more sensitive subset that may NOT be processed without specific authorisation: religious or philosophical beliefs, race or ethnic origin, trade union membership, political persuasion, health or sex life, biometric information, and criminal behaviour.
- **rule_03:** A "child" is a natural person under 18 who is not legally competent without assistance. Processing PI of a child is PROHIBITED under s.34 unless one of the s.35 exceptions applies — primarily prior consent of a competent person.
- **rule_04:** "Consent" means voluntary, specific, and informed expression of will (s.1). Pre-ticked boxes, bundled consent, or consent buried in T&Cs do not satisfy the definition.
- **rule_05:** "Processing" is broad — collection, receipt, recording, organisation, collation, storage, updating, modification, retrieval, alteration, consultation, use, dissemination, distribution, merging, linking, restriction, degradation, erasure, or destruction. Anything you do with PI is processing. (s.1)
- **rule_06:** The responsible party MUST ensure all eight conditions are complied with at the time the purpose and means of processing are determined AND throughout the processing itself. Compliance is not a one-time check — it is a continuous obligation. (s.8)
- **rule_07:** Processing must be lawful AND conducted in a reasonable manner that does not infringe the data subject's privacy. (s.9 — Lawfulness)
- **rule_08:** Minimality (s.10): PI may only be processed if — given the purpose — it is adequate, relevant, and NOT excessive. Default to collecting the minimum necessary; every additional field must be justified by the stated purpose.
- **rule_09:** Lawful basis (s.11): processing requires AT LEAST ONE of — (a) consent of data subject or competent person, (b) necessary for contract performance, (c) legal obligation on responsible party, (d) protects a legitimate interest of the data subject, (e) public-law duty by a public body, or (f) legitimate interests of responsible party or third party.
- **rule_10:** Burden of proof for consent rests on the responsible party (s.11(2)(a)). The data subject may withdraw consent at any time; the responsible party must record consent provenance and timestamp.
- **rule_11:** Right to object (s.11(3)): data subjects may object on reasonable grounds to processing under bases (d)-(f), and may object at any time to direct marketing. On valid objection the responsible party MUST stop processing (s.11(4)).
- **rule_12:** Direct collection (s.12): PI must be collected directly from the data subject unless one of the s.12(2) exceptions applies (public record, public-by-data-subject, consent to indirect collection, law enforcement necessity, etc.).
- **rule_13:** Specific purpose (s.13): PI must be collected for a specific, explicitly defined, and lawful purpose related to a function or activity of the responsible party. "Future analytics" or "improving services" is NOT specific enough.
- **rule_14:** Retention (s.14): records must NOT be kept longer than necessary for the purpose, unless retention is required by law, by contract, by data subject consent, or for the responsible party's lawful functions. Records used to make a decision about a data subject must be retained long enough for that subject to have reasonable opportunity to request access (s.14(3)).
- **rule_15:** Destruction (s.14(4)-(5)): when retention is no longer authorised, the responsible party MUST destroy, delete, or de-identify the record AS SOON AS REASONABLY PRACTICABLE, in a manner that prevents reconstruction in intelligible form. Soft-delete alone is NOT compliant; cryptographic erasure or true deletion is required.
- **rule_16:** Restriction (s.14(6)): processing must be RESTRICTED (not deleted) when accuracy is contested, when the responsible party no longer needs the data but must keep it for proof, when processing is unlawful and the data subject opposes deletion, or when the data subject requests transmission to another system (data portability hint).
- **rule_17:** Further processing must be COMPATIBLE with the original purpose of collection. Compatibility assessment considers: relationship between purposes, nature of the data, consequences for the data subject, manner of collection, and contractual obligations. Re-using PI for a new purpose generally requires a new lawful basis. (s.15)
- **rule_18:** The responsible party must take reasonable steps to ensure PI is COMPLETE, ACCURATE, NOT MISLEADING, and UPDATED where necessary, having regard to the purpose. (s.16)
- **rule_19:** Documentation (s.17): the responsible party MUST maintain documentation of all processing operations, as required by s.14 or 51 of the Promotion of Access to Information Act (PAIA manual).
- **rule_20:** Notification at collection (s.18): the data subject must be made aware of — (a) information being collected and its source if not from the subject, (b) name and address of responsible party, (c) purpose, (d) whether supply is voluntary or mandatory, (e) consequences of failure to supply, (f) any law authorising/requiring collection, (g) intended transborder transfers and the protection level abroad, (h) categories of recipients, the right of access and correction, the right to object, and the right to lodge a complaint with the Regulator.
- **rule_21:** Notification timing (s.18(2)): notice must be given BEFORE collection if collected directly from the data subject; otherwise as soon as reasonably practicable.
- **rule_22:** Integrity & confidentiality (s.19): the responsible party MUST secure PI by taking appropriate, reasonable technical AND organisational measures to prevent loss, damage, unauthorised destruction, and unlawful access or processing. Both technical (encryption, access controls) AND organisational (policies, training) measures are required.
- **rule_23:** Risk-based safeguards (s.19(2)): the responsible party must (a) identify reasonably foreseeable internal and external risks, (b) establish and maintain appropriate safeguards, (c) regularly verify safeguards are effectively implemented, and (d) continually update safeguards in response to new risks. This implies an ongoing risk assessment process, not a one-off audit.
- **rule_24:** Industry standards (s.19(3)): the responsible party must have regard to GENERALLY ACCEPTED INFORMATION SECURITY PRACTICES (e.g., ISO 27001, NIST CSF, OWASP ASVS) and any sector-specific rules.
- **rule_25:** Operator obligations (s.20-21): operators must process PI only with the responsible party's authorisation, treat it as confidential, and the relationship MUST be governed by a written contract requiring the operator to maintain the s.19 security measures. Operator must immediately notify the responsible party of suspected unauthorised access.
- **rule_26:** Breach notification to Regulator (s.22(1)-(2)): where there are reasonable grounds to believe PI has been accessed or acquired by an unauthorised person, the responsible party MUST notify the Regulator AND the affected data subjects AS SOON AS REASONABLY POSSIBLE after discovery, taking law-enforcement needs into account.
- **rule_27:** Breach notification to data subject (s.22(4)-(5)): notice must be in writing and delivered by mail to last known physical/postal address, email, prominent website notice, news media, OR as directed by the Regulator. The notice MUST include — (a) possible consequences, (b) measures the responsible party intends or has taken, (c) recommended mitigating actions for the data subject, and (d) the identity of the unauthorised person if known.
- **rule_28:** Right of access (s.23): on adequate proof of identity and free of charge, a data subject may request confirmation of whether the responsible party holds their PI and a copy/description of that PI plus the identity of all third parties who have had access. Responses must be within a reasonable time, in a reasonable manner and format that is generally understandable.
- **rule_29:** Right of correction/deletion (s.24): a data subject may request correction or deletion of PI that is inaccurate, irrelevant, excessive, out of date, incomplete, misleading, or obtained unlawfully — OR destruction/deletion of PI no longer authorised to be retained under s.14. The responsible party must comply as soon as reasonably practicable and inform downstream recipients of the change (s.24(3)).
- **rule_30:** Special PI is PROHIBITED from processing (s.26) unless a s.27 general authorisation applies — consent of data subject, necessary for legal claim, international public-law obligation, historical/statistical/research with safeguards, deliberately made public by data subject, OR a specific Part-B authorisation (s.28-33) for that category (religion, race, trade union, political, health/sex life, criminal/biometric).
- **rule_31:** Biometric information (fingerprints, facial recognition, voice prints, retinal scans, DNA, blood typing) is special PI. Use it only when one of the s.27/s.33 grounds is satisfied AND with prior authorisation from the Regulator if processing falls under s.57(1)(b) (criminal/objectionable conduct) or s.57(1)(d) (transborder transfer).
- **rule_32:** Children's PI is PROHIBITED from processing (s.34) unless — (a) consent of a competent person, (b) necessary for legal claim, (c) international public-law obligation, (d) historical/statistical/research with safeguards, OR (e) deliberately made public by the child with competent-person consent. (s.35)
- **rule_33:** Direct marketing by electronic communication (SMS, email, automated calls, fax) is PROHIBITED unless — (a) the data subject has given consent, OR (b) the data subject is an existing customer AND was given an opportunity to object at collection AND on every subsequent communication AND the marketing is for SIMILAR products/services. Consent may be requested only ONCE per data subject and only if not previously refused. (s.69)
- **rule_34:** Every direct-marketing communication MUST contain (a) sender identity and (b) opt-out contact details. (s.69(4))
- **rule_35:** Solely-automated decisions producing legal consequences or substantially affecting the data subject (work performance, credit-worthiness, reliability, location, health, personal preferences, conduct profiling) are PROHIBITED unless — (a) taken in connection with contract conclusion/execution and either the subject's request has been met or appropriate measures protect their interests, OR (b) governed by law or code of conduct with safeguards. Appropriate measures MUST include (i) opportunity to make representations and (ii) sufficient information about the underlying logic. (s.71)
- **rule_36:** Transfer of PI outside South Africa is PROHIBITED unless — (a) the recipient is subject to a law, binding corporate rules, or binding agreement providing substantially similar protection AND including onward-transfer restrictions, (b) the data subject consents, (c) transfer is necessary for contract performance with or in the interests of the data subject, OR (d) transfer benefits the data subject and obtaining consent is not reasonably practicable but consent would likely be given. (s.72)
- **rule_37:** Transferring special PI or children's PI to a country WITHOUT adequate protection requires PRIOR AUTHORISATION from the Information Regulator under s.57(1)(d).
- **rule_38:** Every public and private body MUST have an Information Officer registered with the Regulator BEFORE the officer takes up duties (s.55(2)). For a private body the head of the body is the Information Officer by default. The Information Officer encourages compliance, deals with PAIA requests, works with the Regulator on investigations, and otherwise ensures the body's compliance. (s.55-56)
- **rule_39:** Prior authorisation from the Regulator is REQUIRED before processing if the responsible party intends to — (a) process unique identifiers for a purpose other than collection AND link them with information processed by other responsible parties, (b) process information on criminal behaviour or unlawful/objectionable conduct on behalf of third parties, (c) process information for credit reporting, OR (d) transfer special PI or children's PI to a third party in a country without adequate protection. (s.57)
- **rule_40:** A responsible party may NOT carry out the s.57 processing until the Regulator has completed its investigation or notified that no detailed investigation will be conducted (s.58(2)). Failure to notify is an offence (s.59) liable to the s.107 penalties.
- **rule_41:** Maximum penalties (s.107): for serious offences (e.g., breach of confidentiality s.101, unlawful acts re account numbers s.105/106, obstruction of Regulator) — fines up to R10 million OR imprisonment up to 10 years OR both. Less serious offences carry fines or up to 12 months imprisonment. The Regulator may also impose administrative fines under s.109.
- **rule_42:** NEVER send personal information of South African data subjects to external AI services without an explicit lawful basis AND a transborder-transfer assessment under s.72. Default behaviour for any AI-augmented feature touching PII MUST be to redact, tokenise, or refuse before any external API call.
- **rule_43:** Logging and observability MUST NOT capture personal information in plain text. Where logs reference data subjects, use opaque pseudonyms (UUIDs) and store the mapping table separately under access control.
- **rule_44:** Data subject rights endpoints (access, correction, deletion, objection, complaint) MUST be discoverable from the public privacy notice and SHOULD be machine-actionable (an authenticated self-service portal beats an email queue).

## Success & failure scenarios

**✅ Success paths**

- **Retention Period Expired** — when retention_until lt "now"; no s.14(1)(a)-(d) extension applies (law/contract/consent/lawful purpose), then PI destroyed/de-identified as soon as reasonably practicable after retention expiry.
- **Consent Withdrawn** — when data subject withdraws consent under s.11(2)(b); lawful basis was consent (not contract/legal obligation/legitimate interest), then Processing for the affected purpose has stopped; historical lawfulness preserved.
- **Data Subject Access Request** — when data subject submits an access request under s.23; identity_proof exists, then Data subject receives response within reasonable time, free of charge, in a generally understandable form.
- **Correction Or Deletion Request** — when data subject submits correction or deletion request under s.24; grounds in ["inaccurate","irrelevant","excessive","out_of_date","incomplete","misleading","unlawful","retention_expired"], then PI corrected or deleted as soon as reasonably practicable; downstream recipients notified.
- **Collection Compliant** — when actor is responsible party; lawful_basis in ["consent","contract","legal_obligation","data_subject_legitimate_interest","public_law_duty","responsible_party_legitimate_interest"]; data subject has been notified of all s.18 particulars before collection; collected_fields matches "minimum_necessary_for_stated_purpose", then PI lawfully collected; processing record updated; data subject has been informed of rights.

**❌ Failure paths**

- **Security Compromise Detected** — when reasonable grounds to believe PI has been accessed or acquired by unauthorised person (s.22(1)), then Regulator and data subjects notified within statutory timeframe; incident response logged. *(error: `POPIA_SECURITY_COMPROMISE`)*
- **Direct Marketing To Non Customer** — when channel in ["email","sms","automated_call","fax"]; data_subject.consent_to_marketing neq true; data_subject.is_existing_customer neq true, then Send blocked; s.69 prohibits electronic direct marketing without consent or existing-customer exception. *(error: `POPIA_DIRECT_MARKETING_NO_CONSENT`)*
- **Automated Decision Blocked** — when decision is based SOLELY on automated processing (no human review); decision produces legal consequences or substantially affects the data subject; none of s.71(2) exceptions apply (contract necessity with safeguards, or law/code of conduct), then Decision must be reviewed by a human OR the data subject must be given representation rights and logic explanation. *(error: `POPIA_AUTOMATED_DECISION_PROHIBITED`)*
- **Transborder Transfer Blocked** — when PI is being transferred to a recipient outside the Republic; recipient country/organisation does NOT have substantially similar protection; no s.72(1)(b)-(d) exception applies (consent / contract necessity / data subject benefit), then Transfer aborted; s.72 requires adequate protection or specific lawful basis. *(error: `POPIA_TRANSBORDER_TRANSFER_PROHIBITED`)*

## Errors it can return

- `POPIA_LAWFUL_BASIS_MISSING` — This processing activity has no documented lawful basis under s.11. Processing cannot proceed.
- `POPIA_NOTICE_NOT_GIVEN` — The data subject has not been notified of the s.18 particulars; processing cannot proceed.
- `POPIA_SECURITY_COMPROMISE` — A security compromise affecting personal information has been detected; statutory notifications required.
- `POPIA_RETENTION_EXCEEDED` — This record has exceeded its retention period and must be destroyed under s.14.
- `POPIA_DIRECT_MARKETING_NO_CONSENT` — Electronic direct marketing requires explicit consent or the existing-customer exception under s.69.
- `POPIA_AUTOMATED_DECISION_PROHIBITED` — Solely-automated decisions affecting data subjects are prohibited under s.71 without safeguards.
- `POPIA_TRANSBORDER_TRANSFER_PROHIBITED` — This transfer fails the s.72 adequacy test; transfer cannot proceed.
- `POPIA_SPECIAL_PI_PROHIBITED` — Processing of special personal information is prohibited under s.26 without specific authorisation.
- `POPIA_CHILD_PI_PROHIBITED` — Processing of a child's personal information requires consent of a competent person under s.35.
- `POPIA_PRIOR_AUTHORISATION_REQUIRED` — This processing requires prior authorisation from the Information Regulator under s.57.

## Events

**`popia.collection.recorded`** — PI lawfully collected and processing activity logged (s.17)
  Payload: `data_subject_id`, `lawful_basis`, `purpose`, `fields_collected`, `notice_version`, `timestamp`

**`popia.consent.withdrawn`** — Data subject withdrew consent under s.11(2)(b)
  Payload: `data_subject_id`, `withdrawn_at`, `affected_processing_activities`

**`popia.access.fulfilled`** — Data subject access request (s.23) fulfilled
  Payload: `data_subject_id`, `request_id`, `response_format`, `fulfilled_at`

**`popia.correction.applied`** — Correction or deletion request (s.24) applied
  Payload: `data_subject_id`, `record_id`, `action_taken`, `downstream_notified_count`, `timestamp`

**`popia.retention.purged`** — Record destroyed after retention expiry (s.14)
  Payload: `record_id`, `data_subject_id`, `retention_basis`, `destroyed_at`

**`popia.breach.notified`** — Security compromise notification sent to Regulator and data subjects (s.22)
  Payload: `incident_id`, `subjects_affected_count`, `regulator_notified_at`, `subjects_notified_at`, `data_categories_affected`

**`popia.direct_marketing.blocked`** — Direct-marketing send blocked for lack of consent (s.69)
  Payload: `data_subject_id`, `channel`, `blocked_at`

**`popia.automated_decision.blocked`** — Solely-automated decision blocked under s.71
  Payload: `decision_id`, `data_subject_id`, `blocked_at`

**`popia.transfer.blocked`** — Transborder transfer blocked under s.72
  Payload: `data_subject_id`, `destination_country`, `blocked_at`

**`popia.objection.received`** — Data subject objected to processing under s.11(3)
  Payload: `data_subject_id`, `objection_grounds`, `received_at`

## Connects to

- **gdpr-data-export** *(recommended)* — GDPR portability mechanism satisfies POPIA s.23 access and s.14(6)(d) data-portability hint
- **data-retention-policies** *(required)* — POPIA s.14 retention/destruction obligation requires automated purge of expired records
- **encrypted-attachment-storage** *(recommended)* — POPIA s.19 security safeguards expect encryption at rest for sensitive PI
- **legal-hold** *(recommended)* — Retention extension for legal proceedings is a s.14(1)(a) law-based exception
- **audit-logging** *(required)* — Documentation obligation (s.17) and breach forensics (s.22) require an immutable processing log
- **security-baseline** *(recommended)* — POPIA s.19(3) requires generally accepted information security practices (capability planned in todo.md)

## Quality fitness 🟢 81/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `██████░░░░` | 6/10 |
| Outcomes | `██████████████████████░░░` | 22/25 |
| Structured conditions | `███████░░░` | 7/10 |
| Error binding | `█████░░░░░` | 5/10 |
| Field validation | `██████████` | 10/10 |
| Relationships | `██████████` | 10/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `██░░░` | 2/5 |
| Simplicity | `████░` | 4/5 |

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/data/popia-compliance/) · **Spec source:** [`popia-compliance.blueprint.yaml`](./popia-compliance.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
