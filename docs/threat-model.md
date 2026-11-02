# Threat model: local career-roadmap application

Scope: React browser UI, FastAPI API, browser localStorage, bundled JSON catalog, and build/runtime dependencies. No accounts, server-side student records, database, file uploads, catalog editing endpoint, or external live catalog fetch exists. Public hosting is not assessed as already secure.

## Assets and trust boundaries

- Student career preferences, name, completed-course selections, and saved interests live in browser storage. They are not transcripts and should not contain sensitive identifiers.
- Catalog/mapping integrity affects recommendation correctness; API availability affects the experience.
- Browser input crosses an HTTP boundary into FastAPI; saved localStorage is untrusted input when restored.
- JSON files and dependencies enter through the development/release process. Only repository contributors can edit reference files through the intended workflow.

Flow: user -> React -> localStorage; React -> `/api` development proxy -> FastAPI -> read-only curated JSON. Returned course data is displayed as React text. CORS is browser response-access policy, not authentication.

## Threat assessment

| Threat/entry point | Impact | Existing control/evidence | Remaining risk |
|---|---|---|---|
| Excessive lists or long course IDs in request bodies | Repeated prerequisite/scoring work and large validation inputs | Shared maximum 200 course entries and 32-character IDs; test_security.py | JSON body parsing occurs before field validation; no transport body cap, request rate limit, or complete DoS protection |
| Unapproved web origin calls API | Browser page reads API responses | Default CORS allowlist; allowed/disallowed preflight tests | Direct clients can call public endpoints; no authorization promised |
| Script-like strings in profile/catalog | Script execution if interpreted as HTML | React text rendering; code review found no dangerouslySetInnerHTML/eval sinks | Same-origin malicious scripts/extensions could still read localStorage; third-party fonts create external requests |
| Tampered browser profile | Wrong selections or unusable UI | parseProfile limits name, allowlists careers/course IDs, deduplicates, migrates old profiles; tests | Users can change their own data; shared browser users can read it |
| Broken or tampered catalog | Misleading recommendations | Pydantic loading, reference validation, catalog snapshot tests, reviewed diffs | This is not cryptographic data authenticity or a complete degree audit |
| Vulnerable tools/libraries | Developer or runtime compromise | Lockfile, dependency audit evidence, compatible patch updates | Audits are point-in-time; deployment and future advisories require reassessment |
| Unexpected input/failures | Crashes or confusing results | Validation errors, explicit unknown-resource responses, error-path tests | No comprehensive security monitoring/alerting; production error handling needs review |

Most important remaining deployment work: HTTPS, reverse-proxy request-size/rate limits, carefully scoped origins, dependency updates, operational logging without profile data, and review of any future accounts or server-side storage. No external exploitation or penetration test is claimed.
