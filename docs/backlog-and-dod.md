# Prioritized Backlog and Definition of Done

## Prioritization for Milestone 1

Priority reflects what is required to demonstrate one complete, working
end-to-end flow (US-02 → US-03 → US-04 → US-05 → US-06 → US-07 → US-08),
per the Milestone 1 requirement that a static mock-up alone is not
sufficient.

| Priority | ID | User Story | M1 Status |
|---|---|---|---|
| P0 | US-02 | Select completed courses | Backend: `GET/POST /eligibility`, `GET /courses` implemented |
| P0 | US-03 | Select a career interest | Backend: `GET /careers` implemented |
| P0 | US-04 | Enter credit hours and workload preference | Backend: validated in `RecommendationRequest` / `ScheduleRequest` |
| P0 | US-05 | Prerequisite checking | Backend: `app/prerequisites.py`, unit-tested |
| P0 | US-06 | Receive course recommendations | Backend: `app/recommendations.py`, `POST /recommendations` |
| P0 | US-07 | Explanation for each recommendation | Backend: `RecommendationExplanation` schema, populated per item |
| P1 | US-08 | Add/remove courses from a proposed schedule | Backend: `POST /schedule/summary` |
| P1 | US-01 | Create a local planning profile | Frontend: browser local storage (no backend account needed) |
| P1 | US-09 | Profile/schedule persist in the same browser | Frontend: browser local storage |
| P1 | US-10 | Compare up to three courses | Backend: `POST /courses/compare` |
| P1 | US-11 | View career information | Backend: `GET /careers/{id}` |
| P2 | US-12 | See which later courses a course unlocks | Backend: `GET /courses/{id}/unlocks` |
| P2 | US-13 | View historical course outcomes | Deferred — requires authorized SOI/outcome data (see MVP Scope) |
| P2 | US-14 | View employment examples | Deferred — requires USAJOBS integration (see MVP Scope) |

P0 items form the single end-to-end MVP flow required for Milestone 1.
P1 items round out the primary workflow (schedule building, comparison,
career detail) and are included in this milestone where feasible. P2
items are explicitly listed in the project brief as MVP-excluded or
later features and are intentionally deferred.

## Definition of Done

A story is done when:

- Its acceptance criteria (see the project brief, section 6) are satisfied.
- The feature works through the primary interface (API endpoint or UI screen).
- Relevant automated tests pass (`pytest` for backend logic, `Vitest`/`Playwright` for frontend, once added).
- Input validation and error states are handled (FastAPI request validation + explicit 404s for unknown IDs).
- New course or career data include a `source` field.
- No secrets, passwords, transcripts, or student IDs are committed.
- Setup and verification instructions in the relevant README are updated.
- A teammate has reviewed and approved the pull request.
