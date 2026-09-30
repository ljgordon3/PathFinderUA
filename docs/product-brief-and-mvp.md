# PathFinder UA: product brief and Milestone 1 MVP scope

PathFinder UA helps a University of Alabama computer science student explore a small, sourced set of CS/ECE courses, choose a career interest, and draft a semester plan. It supports decisions before an advising meeting; it does not certify eligibility to register or progress toward graduation.

## Current course set

The MVP serves the 19 records in `backend/data/courses.json` through `GET /courses`. They are curated UA CS/ECE courses, with required B.S. CS major courses shown first when present. The set is not the complete UA catalog or complete B.S. CS degree plan. Course titles, credits, summaries, objectives, and source notes come from the curated records. Career relevance and skills are project mappings. The displayed source note is the provenance currently available for each record; the app does not verify the current catalog automatically.

## Supported planning flow

The student selects completed courses, one of three career interests, a 1–21 credit target, and a balanced or lighter workload preference. The browser saves this profile locally. FastAPI evaluates each course's modeled prerequisites, ranks and explains recommendations, compares up to three courses, and summarizes a proposed schedule's credits and career skills. Each recommendation exposes the API's eligibility reason, degree relevance, mapped career skills, learning objectives, courses it may unlock, and source notes. The lighter preference affects scoring using credits; no course effort or historical outcome data is available.

Prerequisite checks cover only the CS/ECE relationships encoded in this curated set. Within the model, each inner list is an AND group and the groups are alternatives. Math and general education prerequisites, grades, transfer credit, overrides, scheduling availability, and some alternative paths outside this set are not checked. A result labeled eligible means only that the modeled CS/ECE path matches the student's selections. Students should confirm full prerequisites and degree applicability with the current UA catalog and an advisor.

## Outside this MVP

Accounts, DegreeWorks integration, live catalog sync, full degree audit, historical course outcomes, effort estimates, and employment listings are deferred. The browser uses API career descriptions, skills, and responsibilities, but does not yet display the backend's salary/outlook fields.
