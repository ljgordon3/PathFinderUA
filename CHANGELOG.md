# Changelog

## Milestone 2 — unreleased

### Added
- Career/completed-course setup and `/roadmap` API with three recommendation tiers.
- Personalized and all-course views, future-course saving, persistence, migration, and export.
- Expanded 57-course curated dataset and catalog regression snapshot.
- Coverage reports/targets, API-boundary tests, security tests, browser report artifacts, QA checklist, threat model, and OWASP review.

### Changed
- Career roadmaps replace semester scheduling in the UI; sidebar is Explore courses, Career paths, and My roadmap.
- Untaken required courses are strongly recommended independently of prerequisite readiness.
- Cards explain completed/missing prerequisites and career skills; redundant explanation headings and card sources are hidden.
- Removed CS 300 in favor of CS 338 and applied requested course exclusions.

### Security
- Bounded request course lists and identifiers before downstream evaluation.
- Added CORS regression tests and dependency audit evidence; updated compatible tooling dependencies.

### Known limitations
- Modeled CS/ECE prerequisites only; not a complete degree or registration audit.
- Original scheduling API remains regression-tested, but the earlier scheduling UI was replaced.
- Independent platform verification and teammate review are pending. Evidence does not claim these occurred.

Work: [PR #2](https://github.com/ljgordon3/PathFinderUA/pull/2), [PR #3](https://github.com/ljgordon3/PathFinderUA/pull/3).

## Milestone 1 — milestone-1

- Integrated React with FastAPI for catalog, career choices, prerequisite eligibility, explained recommendations, course comparison, and schedule summaries.
- Added local profile persistence, curated reference data, automated tests, and setup/demo documentation.
- Preserved at the existing milestone-1 tag; publication of GitHub release notes may occur later than the original tag.

Work: [PR #1](https://github.com/ljgordon3/PathFinderUA/pull/1).

## Milestone 0 — milestone-0

- Initialized repository and initial planning/backlog documentation.
