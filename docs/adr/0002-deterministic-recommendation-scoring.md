# ADR 0002: Deterministic, rule-based recommendation scoring for the MVP

**Status:** Accepted — Milestone 1
**Deciders:** Logan Gordon (backend), Jylen Tate (frontend)

## Context

PathFinder UA must rank eligible courses for a student's chosen career
path and explain each recommendation (US-06, US-07, FR-05, FR-06). The
MVP Scope table explicitly excludes "LLM-generated recommendations,
individual grade predictions, and guaranteed academic outcomes" and
requires that "the same inputs and dataset produce consistent results"
(NFR-05).

## Decision

Recommendations are produced by a deterministic weighted-sum scoring
function (`app/recommendations.py`) over four explainable factors:
career-alignment relevance (from the curated course-career mapping),
academic progression (number of later courses unlocked), degree
relevance (core vs. elective bonus), and credit-hour fit against the
student's target. No machine learning model or randomness is involved.

## Alternatives Considered

1. **LLM-generated recommendations or explanations.** Explicitly out of
   scope per the project brief; also harder to make reproducible and
   auditable, which conflicts with NFR-05. A future LLM may *explain*
   already-verified results but must not change scores or interpret
   prerequisites (see MVP Scope, "Possible Later Features").
2. **Collaborative filtering / learned ranking.** Requires a large
   amount of historical student behavior data the MVP does not collect
   and is not appropriate for a small, curated, 10–25 course catalog.
   Rejected as over-engineering for this scope.

## Consequences

- **Positive:** Every score can be explained in plain language from its
  inputs, satisfying US-07 and NFR-05. The engine is fully unit-testable
  without mocking a model or an external API (see
  `backend/tests/test_recommendations.py`).
- **Negative:** Scoring weights are hand-tuned rather than learned, so
  ranking quality depends on how well the weights match real student
  priorities. Weights are isolated as named constants at the top of
  `app/recommendations.py` so they can be revisited without touching
  the ranking algorithm itself.
- **Revisit when:** the team wants to incorporate authorized historical
  course-outcome data (pass rate, workload) into scoring — the current
  function is structured so an additional weighted term can be added
  without restructuring the rest of the engine.
