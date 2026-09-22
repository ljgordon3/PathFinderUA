# Component Design

## Component design for UC-01: Receive Career-Aligned Course Recommendations

```mermaid
sequenceDiagram
    participant UI as React Client
    participant API as FastAPI Router (recommendations.py)
    participant Store as DataStore (data_loader.py)
    participant Prereq as Prerequisite Engine (prerequisites.py)
    participant Rec as Recommendation Engine (recommendations.py)

    UI->>API: POST /recommendations {completed_course_ids, career_id, target_credit_hours}
    API->>Store: load_data_store() [validated at startup, cached]
    API->>Rec: recommend(request, store, result_count, min_result_count)
    loop for each course in store.courses
        Rec->>Prereq: is_eligible(course, completed_course_ids)
        Prereq-->>Rec: eligible: bool
    end
    Rec->>Rec: score eligible courses (career alignment, progression, degree, credit fit)
    Rec->>Prereq: courses_unlocked_by(course.id, all_courses) [per recommended course]
    Rec-->>API: RecommendationResponse (ranked, explained)
    API-->>UI: 200 OK + JSON recommendations
```

**Responsibilities:**
- `recommendations.py` (router): validates the HTTP request shape via
  `RecommendationRequest`, translates a `KeyError` (unknown career) into
  a 404, otherwise delegates entirely to the engine.
- `app/recommendations.py` (engine): pure business logic, no HTTP or
  JSON-file concerns — testable in isolation (see
  `tests/test_recommendations.py`).
- `app/prerequisites.py`: single source of truth for "is this course
  eligible" and "what does this course unlock," reused by both the
  recommendation engine and the standalone `/eligibility` and
  `/courses/{id}/unlocks` endpoints (UC-03).
- `data_loader.py`: the only module that touches the filesystem/JSON;
  everything else depends on the in-memory `DataStore`.

## Component design for UC-02: Build and Validate a Proposed Semester Schedule

```mermaid
sequenceDiagram
    participant UI as React Client
    participant Storage as Browser Local Storage
    participant API as FastAPI Router (schedule.py)
    participant Store as DataStore

    UI->>API: POST /schedule/summary {course_ids, target_credit_hours, career_id?}
    API->>Store: course_or_404(id) for each course_id
    API->>API: total_credit_hours = sum(course.credit_hours)
    alt career_id provided
        API->>Store: careers[career_id].relevant_skill_ids
        API->>API: covered = union(course.skill_ids) ∩ relevant_skill_ids
    end
    API->>API: evaluate warning rules (over credit target, many courses)
    API-->>UI: 200 OK + ScheduleSummary {total_credit_hours, covered skills, warnings}
    UI->>Storage: persist current course_ids + summary (US-09)
```

**Responsibilities:**
- The backend is stateless per request — it recalculates the summary
  from the course IDs the client sends every time. This matches the
  architecture decision that student planning state lives in the
  browser (ADR 0001), not the backend.
- Warning rules are isolated as named constants/functions in
  `schedule.py` so the credit-target and course-count thresholds can be
  tuned without touching the request/response shape.
- The client owns persistence (`Storage` in the diagram); the backend
  never sees or stores a student's saved profile.
