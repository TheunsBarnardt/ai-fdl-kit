---
title: "Popia Compliance Blueprint"
layout: default
parent: "Data"
grand_parent: Blueprint Catalog
description: "South African POPIA (Act 4 of 2013) reference — eight conditions for lawful processing, data subject rights, breach notification, direct marketing, automated de"
---

# Popia Compliance Blueprint

> South African POPIA (Act 4 of 2013) reference — eight conditions for lawful processing, data subject rights, breach notification, direct marketing, automated decisions, transborder transfers.

| | |
|---|---|
| **Feature** | `popia-compliance` |
| **Category** | Data |
| **Version** | 1.0.0 |
| **Tags** | popia, compliance, privacy, south-africa, data-protection, regulatory, reference, act-4-of-2013 |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/data/popia-compliance.blueprint.yaml) |
| **JSON API** | [popia-compliance.json]({{ site.baseurl }}/api/blueprints/data/popia-compliance.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `data_subject` | Data Subject | human | The natural or juristic person to whom personal information relates (POPIA s.1) |
| `responsible_party` | Responsible Party | external | Public or private body that determines the purpose and means of processing (POPIA s.1) |
| `operator` | Operator | system | Person processing PI for a responsible party under contract, without direct authority (POPIA s.1) |
| `information_officer` | Information Officer | human | Designated individual responsible for POPIA compliance within a body; head of private body by default (s.55-56) |
| `information_regulator` | Information Regulator | external | Independent juristic person established under s.39; receives breach notifications, complaints, prior-authorisation requests |
| `competent_person` | Competent Person | human | Person legally competent to consent on behalf of a child (s.1) |

## Rules

- **rule_01:** "Personal information" is any information relating to an identifiable, living natural person — and where applicable,
an identifiable existing juristic person — including race, gender, sex, pregnancy, marital status, national/ethnic/social
origin, colour, sexual orientation, age, physical or mental health, well-being, disability, religion, conscience,
belief, culture, language, birth, education, medical/financial/criminal/employment history, identifying numbers
(ID, passport, employee number), email, physical address, telephone, location, online identifier, biometric data,
personal opinions/preferences, private correspondence, third-party views about the person, and the person's name
when its disclosure would reveal other PI. (s.1 "personal information")

- **rule_02:** "Special personal information" (s.26) is a more sensitive subset that may NOT be processed without specific
authorisation: religious or philosophical beliefs, race or ethnic origin, trade union membership, political persuasion,
health or sex life, biometric information, and criminal behaviour.

- **rule_03:** A "child" is a natural person under 18 who is not legally competent without assistance. Processing PI of a child is
PROHIBITED under s.34 unless one of the s.35 exceptions applies — primarily prior consent of a competent person.

- **rule_04:** "Consent" means voluntary, specific, and informed expression of will (s.1). Pre-ticked boxes, bundled consent, or
consent buried in T&Cs do not satisfy the definition.

- **rule_05:** "Processing" is broad — collection, receipt, recording, organisation, collation, storage, updating, modification,
retrieval, alteration, consultation, use, dissemination, distribution, merging, linking, restriction, degradation,
erasure, or destruction. Anything you do with PI is processing. (s.1)

- **rule_06:** The responsible party MUST ensure all eight conditions are complied with at the time the purpose and means of
processing are determined AND throughout the processing itself. Compliance is not a one-time check — it is a
continuous obligation. (s.8)

- **rule_07:** Processing must be lawful AND conducted in a reasonable manner that does not infringe the data subject's privacy.
(s.9 — Lawfulness)

- **rule_08:** Minimality (s.10): PI may only be processed if — given the purpose — it is adequate, relevant, and NOT excessive.
Default to collecting the minimum necessary; every additional field must be justified by the stated purpose.

- **rule_09:** Lawful basis (s.11): processing requires AT LEAST ONE of — (a) consent of data subject or competent person,
(b) necessary for contract performance, (c) legal obligation on responsible party, (d) protects a legitimate
interest of the data subject, (e) public-law duty by a public body, or (f) legitimate interests of responsible
party or third party.

- **rule_10:** Burden of proof for consent rests on the responsible party (s.11(2)(a)). The data subject may withdraw consent
at any time; the responsible party must record consent provenance and timestamp.

- **rule_11:** Right to object (s.11(3)): data subjects may object on reasonable grounds to processing under bases (d)-(f), and
may object at any time to direct marketing. On valid objection the responsible party MUST stop processing (s.11(4)).

- **rule_12:** Direct collection (s.12): PI must be collected directly from the data subject unless one of the s.12(2) exceptions
applies (public record, public-by-data-subject, consent to indirect collection, law enforcement necessity, etc.).

- **rule_13:** Specific purpose (s.13): PI must be collected for a specific, explicitly defined, and lawful purpose related to
a function or activity of the responsible party. "Future analytics" or "improving services" is NOT specific enough.

- **rule_14:** Retention (s.14): records must NOT be kept longer than necessary for the purpose, unless retention is required by
law, by contract, by data subject consent, or for the responsible party's lawful functions. Records used to make
a decision about a data subject must be retained long enough for that subject to have reasonable opportunity to
request access (s.14(3)).

- **rule_15:** Destruction (s.14(4)-(5)): when retention is no longer authorised, the responsible party MUST destroy, delete, or
de-identify the record AS SOON AS REASONABLY PRACTICABLE, in a manner that prevents reconstruction in intelligible
form. Soft-delete alone is NOT compliant; cryptographic erasure or true deletion is required.

- **rule_16:** Restriction (s.14(6)): processing must be RESTRICTED (not deleted) when accuracy is contested, when the responsible
party no longer needs the data but must keep it for proof, when processing is unlawful and the data subject opposes
deletion, or when the data subject requests transmission to another system (data portability hint).

- **rule_17:** Further processing must be COMPATIBLE with the original purpose of collection. Compatibility assessment considers:
relationship between purposes, nature of the data, consequences for the data subject, manner of collection, and
contractual obligations. Re-using PI for a new purpose generally requires a new lawful basis. (s.15)

- **rule_18:** The responsible party must take reasonable steps to ensure PI is COMPLETE, ACCURATE, NOT MISLEADING, and UPDATED
where necessary, having regard to the purpose. (s.16)

- **rule_19:** Documentation (s.17): the responsible party MUST maintain documentation of all processing operations, as required
by s.14 or 51 of the Promotion of Access to Information Act (PAIA manual).

- **rule_20:** Notification at collection (s.18): the data subject must be made aware of — (a) information being collected and
its source if not from the subject, (b) name and address of responsible party, (c) purpose, (d) whether supply is
voluntary or mandatory, (e) consequences of failure to supply, (f) any law authorising/requiring collection,
(g) intended transborder transfers and the protection level abroad, (h) categories of recipients, the right of
access and correction, the right to object, and the right to lodge a complaint with the Regulator.

- **rule_21:** Notification timing (s.18(2)): notice must be given BEFORE collection if collected directly from the data subject;
otherwise as soon as reasonably practicable.

- **rule_22:** Integrity & confidentiality (s.19): the responsible party MUST secure PI by taking appropriate, reasonable
technical AND organisational measures to prevent loss, damage, unauthorised destruction, and unlawful access or
processing. Both technical (encryption, access controls) AND organisational (policies, training) measures are required.

- **rule_23:** Risk-based safeguards (s.19(2)): the responsible party must (a) identify reasonably foreseeable internal and
external risks, (b) establish and maintain appropriate safeguards, (c) regularly verify safeguards are effectively
implemented, and (d) continually update safeguards in response to new risks. This implies an ongoing risk
assessment process, not a one-off audit.

- **rule_24:** Industry standards (s.19(3)): the responsible party must have regard to GENERALLY ACCEPTED INFORMATION SECURITY
PRACTICES (e.g., ISO 27001, NIST CSF, OWASP ASVS) and any sector-specific rules.

- **rule_25:** Operator obligations (s.20-21): operators must process PI only with the responsible party's authorisation, treat
it as confidential, and the relationship MUST be governed by a written contract requiring the operator to maintain
the s.19 security measures. Operator must immediately notify the responsible party of suspected unauthorised access.

- **rule_26:** Breach notification to Regulator (s.22(1)-(2)): where there are reasonable grounds to believe PI has been accessed
or acquired by an unauthorised person, the responsible party MUST notify the Regulator AND the affected data subjects
AS SOON AS REASONABLY POSSIBLE after discovery, taking law-enforcement needs into account.

- **rule_27:** Breach notification to data subject (s.22(4)-(5)): notice must be in writing and delivered by mail to last known
physical/postal address, email, prominent website notice, news media, OR as directed by the Regulator. The notice
MUST include — (a) possible consequences, (b) measures the responsible party intends or has taken, (c) recommended
mitigating actions for the data subject, and (d) the identity of the unauthorised person if known.

- **rule_28:** Right of access (s.23): on adequate proof of identity and free of charge, a data subject may request confirmation
of whether the responsible party holds their PI and a copy/description of that PI plus the identity of all third
parties who have had access. Responses must be within a reasonable time, in a reasonable manner and format that
is generally understandable.

- **rule_29:** Right of correction/deletion (s.24): a data subject may request correction or deletion of PI that is inaccurate,
irrelevant, excessive, out of date, incomplete, misleading, or obtained unlawfully — OR destruction/deletion of
PI no longer authorised to be retained under s.14. The responsible party must comply as soon as reasonably
practicable and inform downstream recipients of the change (s.24(3)).

- **rule_30:** Special PI is PROHIBITED from processing (s.26) unless a s.27 general authorisation applies — consent of data
subject, necessary for legal claim, international public-law obligation, historical/statistical/research with
safeguards, deliberately made public by data subject, OR a specific Part-B authorisation (s.28-33) for that category
(religion, race, trade union, political, health/sex life, criminal/biometric).

- **rule_31:** Biometric information (fingerprints, facial recognition, voice prints, retinal scans, DNA, blood typing) is special
PI. Use it only when one of the s.27/s.33 grounds is satisfied AND with prior authorisation from the Regulator if
processing falls under s.57(1)(b) (criminal/objectionable conduct) or s.57(1)(d) (transborder transfer).

- **rule_32:** Children's PI is PROHIBITED from processing (s.34) unless — (a) consent of a competent person, (b) necessary for
legal claim, (c) international public-law obligation, (d) historical/statistical/research with safeguards, OR
(e) deliberately made public by the child with competent-person consent. (s.35)

- **rule_33:** Direct marketing by electronic communication (SMS, email, automated calls, fax) is PROHIBITED unless — (a) the
data subject has given consent, OR (b) the data subject is an existing customer AND was given an opportunity to
object at collection AND on every subsequent communication AND the marketing is for SIMILAR products/services.
Consent may be requested only ONCE per data subject and only if not previously refused. (s.69)

- **rule_34:** Every direct-marketing communication MUST contain (a) sender identity and (b) opt-out contact details. (s.69(4))

- **rule_35:** Solely-automated decisions producing legal consequences or substantially affecting the data subject (work
performance, credit-worthiness, reliability, location, health, personal preferences, conduct profiling) are
PROHIBITED unless — (a) taken in connection with contract conclusion/execution and either the subject's request
has been met or appropriate measures protect their interests, OR (b) governed by law or code of conduct with
safeguards. Appropriate measures MUST include (i) opportunity to make representations and (ii) sufficient
information about the underlying logic. (s.71)

- **rule_36:** Transfer of PI outside South Africa is PROHIBITED unless — (a) the recipient is subject to a law, binding corporate
rules, or binding agreement providing substantially similar protection AND including onward-transfer restrictions,
(b) the data subject consents, (c) transfer is necessary for contract performance with or in the interests of the
data subject, OR (d) transfer benefits the data subject and obtaining consent is not reasonably practicable but
consent would likely be given. (s.72)

- **rule_37:** Transferring special PI or children's PI to a country WITHOUT adequate protection requires PRIOR AUTHORISATION
from the Information Regulator under s.57(1)(d).

- **rule_38:** Every public and private body MUST have an Information Officer registered with the Regulator BEFORE the officer
takes up duties (s.55(2)). For a private body the head of the body is the Information Officer by default. The
Information Officer encourages compliance, deals with PAIA requests, works with the Regulator on investigations,
and otherwise ensures the body's compliance. (s.55-56)

- **rule_39:** Prior authorisation from the Regulator is REQUIRED before processing if the responsible party intends to —
(a) process unique identifiers for a purpose other than collection AND link them with information processed by
other responsible parties, (b) process information on criminal behaviour or unlawful/objectionable conduct on
behalf of third parties, (c) process information for credit reporting, OR (d) transfer special PI or children's
PI to a third party in a country without adequate protection. (s.57)

- **rule_40:** A responsible party may NOT carry out the s.57 processing until the Regulator has completed its investigation or
notified that no detailed investigation will be conducted (s.58(2)). Failure to notify is an offence (s.59) liable
to the s.107 penalties.

- **rule_41:** Maximum penalties (s.107): for serious offences (e.g., breach of confidentiality s.101, unlawful acts re account
numbers s.105/106, obstruction of Regulator) — fines up to R10 million OR imprisonment up to 10 years OR both.
Less serious offences carry fines or up to 12 months imprisonment. The Regulator may also impose administrative
fines under s.109.

- **rule_42:** NEVER send personal information of South African data subjects to external AI services without an explicit lawful
basis AND a transborder-transfer assessment under s.72. Default behaviour for any AI-augmented feature touching
PII MUST be to redact, tokenise, or refuse before any external API call.

- **rule_43:** Logging and observability MUST NOT capture personal information in plain text. Where logs reference data subjects,
use opaque pseudonyms (UUIDs) and store the mapping table separately under access control.

- **rule_44:** Data subject rights endpoints (access, correction, deletion, objection, complaint) MUST be discoverable from the
public privacy notice and SHOULD be machine-actionable (an authenticated self-service portal beats an email queue).


## SLA

| Scope | Max Duration | Escalation |
|-------|-------------|------------|
| breach_notification_to_regulator | as_soon_as_reasonably_possible |  |
| data_subject_access_response | reasonable_time |  |
| prior_authorisation_investigation | 13_weeks |  |

## Outcomes

### Security_compromise_detected (Priority: 1) — Error: `POPIA_SECURITY_COMPROMISE` | Transaction: atomic

**Given:**
- reasonable grounds to believe PI has been accessed or acquired by unauthorised person (s.22(1))

**Then:**
- **notify** target: `information_regulator` — Notification to Regulator as soon as reasonably possible after discovery (s.22(2))
- **notify** target: `affected_data_subjects` — Written notice via mail/email/website/news including consequences, measures taken, mitigation steps, and identity of unauthorised person if known (s.22(4)-(5))
- **emit_event** event: `popia.breach.notified`

**Result:** Regulator and data subjects notified within statutory timeframe; incident response logged

### Direct_marketing_to_non_customer (Priority: 5) — Error: `POPIA_DIRECT_MARKETING_NO_CONSENT`

**Given:**
- `channel` (input) in `email,sms,automated_call,fax`
- `data_subject.consent_to_marketing` (db) neq `true`
- `data_subject.is_existing_customer` (db) neq `true`

**Then:**
- **emit_event** event: `popia.direct_marketing.blocked`

**Result:** Send blocked; s.69 prohibits electronic direct marketing without consent or existing-customer exception

### Automated_decision_blocked (Priority: 5) — Error: `POPIA_AUTOMATED_DECISION_PROHIBITED`

**Given:**
- decision is based SOLELY on automated processing (no human review)
- decision produces legal consequences or substantially affects the data subject
- none of s.71(2) exceptions apply (contract necessity with safeguards, or law/code of conduct)

**Then:**
- **emit_event** event: `popia.automated_decision.blocked`

**Result:** Decision must be reviewed by a human OR the data subject must be given representation rights and logic explanation

### Transborder_transfer_blocked (Priority: 5) — Error: `POPIA_TRANSBORDER_TRANSFER_PROHIBITED`

**Given:**
- PI is being transferred to a recipient outside the Republic
- recipient country/organisation does NOT have substantially similar protection
- no s.72(1)(b)-(d) exception applies (consent / contract necessity / data subject benefit)

**Then:**
- **emit_event** event: `popia.transfer.blocked`

**Result:** Transfer aborted; s.72 requires adequate protection or specific lawful basis

### Retention_period_expired (Priority: 8) | Transaction: atomic

**Given:**
- `retention_until` (db) lt `now`
- no s.14(1)(a)-(d) extension applies (law/contract/consent/lawful purpose)

**Then:**
- **delete_record** target: `pii_record` — Destruction in a manner that prevents reconstruction in intelligible form (s.14(5))
- **emit_event** event: `popia.retention.purged`

**Result:** PI destroyed/de-identified as soon as reasonably practicable after retention expiry

### Consent_withdrawn (Priority: 9)

**Given:**
- data subject withdraws consent under s.11(2)(b)
- lawful basis was consent (not contract/legal obligation/legitimate interest)

**Then:**
- **transition_state** field: `processing_status` from: `active` to: `stopped`
- **emit_event** event: `popia.consent.withdrawn`
- **notify** target: `information_officer` — Information Officer notified to verify all downstream processing has stopped

**Result:** Processing for the affected purpose has stopped; historical lawfulness preserved

### Data_subject_access_request (Priority: 9)

**Given:**
- data subject submits an access request under s.23
- `identity_proof` (input) exists

**Then:**
- **call_service** target: `pii_aggregator` — Aggregate all PI held about the data subject across all systems
- **create_record** target: `subject_access_response` — Response includes copy/description of PI plus identities of all third-party recipients
- **emit_event** event: `popia.access.fulfilled`

**Result:** Data subject receives response within reasonable time, free of charge, in a generally understandable form

### Correction_or_deletion_request (Priority: 9) | Transaction: atomic

**Given:**
- data subject submits correction or deletion request under s.24
- `grounds` (input) in `inaccurate,irrelevant,excessive,out_of_date,incomplete,misleading,unlawful,retention_expired`

**Then:**
- **set_field** target: `pii_record` value: `corrected_or_deleted`
- **notify** target: `downstream_recipients` — Each third party that received the PI must be informed of the change (s.24(3))
- **emit_event** event: `popia.correction.applied`

**Result:** PI corrected or deleted as soon as reasonably practicable; downstream recipients notified

### Collection_compliant (Priority: 10)

**Given:**
- actor is responsible party
- `lawful_basis` (input) in `consent,contract,legal_obligation,data_subject_legitimate_interest,public_law_duty,responsible_party_legitimate_interest`
- data subject has been notified of all s.18 particulars before collection
- `collected_fields` (input) matches `minimum_necessary_for_stated_purpose`

**Then:**
- **create_record** target: `processing_activity_log` — Record of processing entry created (s.17 documentation obligation)
- **emit_event** event: `popia.collection.recorded`

**Result:** PI lawfully collected; processing record updated; data subject has been informed of rights

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `POPIA_LAWFUL_BASIS_MISSING` | 403 | This processing activity has no documented lawful basis under s.11. Processing cannot proceed. | No |
| `POPIA_NOTICE_NOT_GIVEN` | 403 | The data subject has not been notified of the s.18 particulars; processing cannot proceed. | No |
| `POPIA_SECURITY_COMPROMISE` | 500 | A security compromise affecting personal information has been detected; statutory notifications required. | No |
| `POPIA_RETENTION_EXCEEDED` | 410 | This record has exceeded its retention period and must be destroyed under s.14. | No |
| `POPIA_DIRECT_MARKETING_NO_CONSENT` | 403 | Electronic direct marketing requires explicit consent or the existing-customer exception under s.69. | No |
| `POPIA_AUTOMATED_DECISION_PROHIBITED` | 403 | Solely-automated decisions affecting data subjects are prohibited under s.71 without safeguards. | No |
| `POPIA_TRANSBORDER_TRANSFER_PROHIBITED` | 403 | This transfer fails the s.72 adequacy test; transfer cannot proceed. | No |
| `POPIA_SPECIAL_PI_PROHIBITED` | 403 | Processing of special personal information is prohibited under s.26 without specific authorisation. | No |
| `POPIA_CHILD_PI_PROHIBITED` | 403 | Processing of a child's personal information requires consent of a competent person under s.35. | No |
| `POPIA_PRIOR_AUTHORISATION_REQUIRED` | 403 | This processing requires prior authorisation from the Information Regulator under s.57. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `popia.collection.recorded` | PI lawfully collected and processing activity logged (s.17) | `data_subject_id`, `lawful_basis`, `purpose`, `fields_collected`, `notice_version`, `timestamp` |
| `popia.consent.withdrawn` | Data subject withdrew consent under s.11(2)(b) | `data_subject_id`, `withdrawn_at`, `affected_processing_activities` |
| `popia.access.fulfilled` | Data subject access request (s.23) fulfilled | `data_subject_id`, `request_id`, `response_format`, `fulfilled_at` |
| `popia.correction.applied` | Correction or deletion request (s.24) applied | `data_subject_id`, `record_id`, `action_taken`, `downstream_notified_count`, `timestamp` |
| `popia.retention.purged` | Record destroyed after retention expiry (s.14) | `record_id`, `data_subject_id`, `retention_basis`, `destroyed_at` |
| `popia.breach.notified` | Security compromise notification sent to Regulator and data subjects (s.22) | `incident_id`, `subjects_affected_count`, `regulator_notified_at`, `subjects_notified_at`, `data_categories_affected` |
| `popia.direct_marketing.blocked` | Direct-marketing send blocked for lack of consent (s.69) | `data_subject_id`, `channel`, `blocked_at` |
| `popia.automated_decision.blocked` | Solely-automated decision blocked under s.71 | `decision_id`, `data_subject_id`, `blocked_at` |
| `popia.transfer.blocked` | Transborder transfer blocked under s.72 | `data_subject_id`, `destination_country`, `blocked_at` |
| `popia.objection.received` | Data subject objected to processing under s.11(3) | `data_subject_id`, `objection_grounds`, `received_at` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| gdpr-data-export | recommended | GDPR portability mechanism satisfies POPIA s.23 access and s.14(6)(d) data-portability hint |
| data-retention-policies | required | POPIA s.14 retention/destruction obligation requires automated purge of expired records |
| encrypted-attachment-storage | recommended | POPIA s.19 security safeguards expect encryption at rest for sensitive PI |
| legal-hold | recommended | Retention extension for legal proceedings is a s.14(1)(a) law-based exception |
| audit-logging | required | Documentation obligation (s.17) and breach forensics (s.22) require an immutable processing log |
| security-baseline | recommended | POPIA s.19(3) requires generally accepted information security practices (capability planned in todo.md) |

## AGI Readiness

### Goals

#### Popia Compliant Processing

All processing of personal information of South African data subjects satisfies the eight conditions and respects data subject rights, with auditable evidence at every step.

**Success Metrics:**

| Metric | Target | Measurement |
|--------|--------|-------------|
| processing_activities_with_documented_lawful_basis | 100% | Count of processing activities in the s.17 register with a non-null lawful basis |
| data_subject_request_response_within_30_days | 100% | Count of access/correction/deletion requests resolved within 30 calendar days |
| breach_notification_within_72_hours | 100% | Count of confirmed compromises where Regulator and subjects were notified within 72 hours of discovery |
| retention_expiry_purge_lag | <= 24h | Time between retention expiry and irreversible destruction |

**Constraints:**

- **regulatory** (non-negotiable): No processing without a documented s.11 lawful basis; no exceptions
- **regulatory** (non-negotiable): No transborder transfer without s.72 adequacy or specific lawful basis
- **regulatory** (non-negotiable): No solely-automated decisions affecting data subjects without s.71 safeguards

### Autonomy

**Level:** `human_in_loop`

**Human Checkpoints:**

- before notifying the Information Regulator of a security compromise
- before refusing a data subject access or correction request
- before processing special personal information or children's PI
- before initiating a transborder transfer to a country without adequacy

**Escalation Triggers:**

- `special_pi_processing_attempted_without_authorisation`
- `childrens_pi_processing_attempted_without_competent_person_consent`
- `breach_affecting_more_than_100_data_subjects`
- `regulator_inquiry_received`

### Tradeoffs

| Prefer | Over | Reason |
|--------|------|--------|
| data_subject_rights | operational_convenience | POPIA is a constitutional-privacy statute; data subject rights are non-negotiable |
| minimisation | feature_richness | s.10 minimality requires the smallest data set that satisfies the stated purpose |
| deletion | indefinite_retention | s.14 imposes a default duty to destroy after the purpose is fulfilled |

### Coordination

**Protocol:** `orchestrated`

**Consumes:**

| Capability | From | Fallback |
|------------|------|----------|
| `audit_logging` | audit-logging | fail |
| `encryption_at_rest` | encrypted-attachment-storage | fail |
| `retention_purge` | data-retention-policies | fail |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| collection_compliant | `autonomous` | - | - |
| consent_withdrawn | `autonomous` | - | - |
| data_subject_access_request | `autonomous` | - | - |
| correction_or_deletion_request | `supervised` | - | - |
| retention_period_expired | `autonomous` | - | - |
| security_compromise_detected | `human_required` | - | - |
| direct_marketing_to_non_customer | `autonomous` | - | - |
| automated_decision_blocked | `autonomous` | - | - |
| transborder_transfer_blocked | `autonomous` | - | - |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
source:
  statute: Protection of Personal Information Act, No. 4 of 2013
  jurisdiction: Republic of South Africa
  gazette: Government Gazette No. 37067, Vol 581, No 912
  assented: 2013-11-19
  commenced: 2020-07-01
  enforcement_effective: 2021-07-01
  regulator: Information Regulator (South Africa) — https://inforegulator.org.za
use_in_fdl:
  - Any blueprint that handles SA personal information MUST list
    popia-compliance in `related` with type `required`.
  - The validator's secret-pattern scan already blocks SA ID numbers, banking
    details, and credentials in blueprint values.
  - When extracting blueprints from codebases that touch SA PII, retain the
    structural patterns but strip vendor and PII samples per CLAUDE.md "Data
    Protection & POPIA Compliance" rules.
cross_reference:
  gdpr_equivalents:
    - popia_condition: accountability
      gdpr_article: Article 5(2)
    - popia_condition: processing_limitation
      gdpr_article: Article 6 + Article 5(1)(a)
    - popia_condition: purpose_specification
      gdpr_article: Article 5(1)(b)
    - popia_condition: minimality
      gdpr_article: Article 5(1)(c)
    - popia_condition: information_quality
      gdpr_article: Article 5(1)(d)
    - popia_condition: openness
      gdpr_article: Articles 13-14
    - popia_condition: security_safeguards
      gdpr_article: Article 32
    - popia_condition: data_subject_participation
      gdpr_article: Articles 15-22
    - popia_section: s.22 breach notification
      gdpr_article: Articles 33-34
    - popia_section: s.71 automated decisions
      gdpr_article: Article 22
    - popia_section: s.72 transborder
      gdpr_article: Chapter V
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Popia Compliance Blueprint",
  "description": "South African POPIA (Act 4 of 2013) reference — eight conditions for lawful processing, data subject rights, breach notification, direct marketing, automated de",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "popia, compliance, privacy, south-africa, data-protection, regulatory, reference, act-4-of-2013"
}
</script>
