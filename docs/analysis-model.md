# Analysis Model

## Data model

```mermaid
erDiagram
    COURSE ||--o{ PREREQUISITE_GROUP : "requires (DNF)"
    COURSE ||--o{ COURSE_SKILL : has
    SKILL ||--o{ COURSE_SKILL : "referenced by"
    CAREER ||--o{ CAREER_SKILL : requires
    SKILL ||--o{ CAREER_SKILL : "referenced by"
    COURSE ||--o{ COURSE_CAREER_MAPPING : "relevant to"
    CAREER ||--o{ COURSE_CAREER_MAPPING : "relevant to"
    SOURCE ||--o{ COURSE : supports
    SOURCE ||--o{ CAREER : supports
    LOCAL_PROFILE ||--o{ COURSE : "completed / scheduled"
    LOCAL_PROFILE }o--|| CAREER : "career interest"

    COURSE {
        string id PK
        string title
        int credit_hours
        string degree_category
        string[] learning_objectives
        string catalog_year
    }
    PREREQUISITE_GROUP {
        string course_id FK
        string[] required_course_ids "AND within a group"
    }
    CAREER {
        string id PK
        string name
        int median_salary_usd
        string employment_outlook
    }
    SKILL {
        string id PK
        string name
        string category
    }
    COURSE_CAREER_MAPPING {
        string course_id FK
        string career_id FK
        int relevance
        string explanation
    }
    SOURCE {
        string id PK
        string url
        string data_quality
    }
    LOCAL_PROFILE {
        string display_name "optional"
        string[] completed_course_ids
        string career_id
        int target_credit_hours
        string workload_preference
        string[] proposed_schedule_course_ids
    }
```

`PREREQUISITE_GROUP` is represented in the JSON data as a list of
AND-groups per course (disjunctive normal form) rather than a separate
table — see `app/prerequisites.py` for the evaluation logic. `LOCAL_PROFILE`
lives entirely in browser local storage (ADR 0001) and is never
persisted by the backend.

## Behavior: recommendation request lifecycle

```mermaid
stateDiagram-v2
    [*] --> Received
    Received --> Validated: schema checks pass
    Received --> Rejected: invalid credit hours / unknown career
    Validated --> Filtering: evaluate prerequisites for every course
    Filtering --> Scoring: eligible courses only
    Scoring --> Explaining: top N by score
    Explaining --> Returned
    Rejected --> [*]
    Returned --> [*]
```

## Data flow: end-to-end MVP flow (UC-01 + UC-02)

```mermaid
flowchart LR
    A[Student input:\ncompleted courses,\ncareer, credit target] --> B[Prerequisite Engine]
    B -->|eligible courses| C[Recommendation Engine]
    D[(Course / Career /\nSkill / Mapping JSON)] --> B
    D --> C
    C -->|ranked + explained| E[React Client:\nRecommendations screen]
    E -->|selected courses| F[Schedule Summary Endpoint]
    F -->|totals + warnings| G[React Client:\nSchedule screen]
    G -->|save| H[(Browser Local Storage)]
    H -->|reload| G
```

This mirrors Figure 1 (System-Level Architecture) in the project brief:
the React client and FastAPI back end never store student data
server-side — only the curated JSON reference data is server-side and
read-only at runtime.
