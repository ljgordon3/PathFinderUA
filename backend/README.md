# PathFinder UA — Backend Service

FastAPI service that validates requests and provides course eligibility
checking, career-aligned recommendations, course comparison, and
schedule summaries for the PathFinder UA React client in `../src`.

## Required software and versions

- Python 3.11 or newer (3.12 recommended)
- pip (bundled with Python)
- No database server required (see `../docs/adr/0001-json-reference-data-store.md`)

## 1. Install dependencies

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

## 2. Configure environment variables

```bash
cp .env.example .env
```

No values need to change to run locally — `.env.example` documents every
variable the app reads (CORS origins, data directory, recommendation
count). No secrets, API keys, or passwords are required for the MVP.

## 3. "Seed" data

There is no database migration or seed script: the curated dataset lives
in version-controlled JSON files under `backend/data/` (courses,
careers, skills, course-career mappings, sources) and is loaded and
validated automatically when the server starts. Editing those files is
the equivalent of seeding new data.

## 4. Run the server

```bash
uvicorn app.main:app --reload
```

- API base URL: <http://127.0.0.1:8000>
- Interactive API docs (Swagger UI): <http://127.0.0.1:8000/docs>
- Health check: `GET /health` → `{"status": "ok"}`

## 5. Run the tests

```bash
pytest
```

This runs unit tests for the prerequisite engine and recommendation
engine, plus integration tests against every API endpoint using
FastAPI's `TestClient` (no separate server process needed).

## Demonstration data

No demo accounts are needed — the MVP has no authentication. Useful
IDs for manual testing (see `data/courses.json` and `data/careers.json`
for the full list):

- Career IDs: `CAR-SWE`, `CAR-DS-AI`, `CAR-ROBOTICS`
- Zero-prerequisite courses (good "completed courses" starting point):
  `CS100`, `CS150`, `CS110`

Example request:

```bash
curl -X POST http://127.0.0.1:8000/recommendations \
  -H "Content-Type: application/json" \
  -d '{
        "completed_course_ids": ["CS100", "CS150", "CS201"],
        "career_id": "CAR-SWE",
        "target_credit_hours": 15,
        "workload_preference": "balanced"
      }'
```

## Project layout

```
backend/
  app/
    main.py            FastAPI app, CORS, startup data validation
    config.py           Environment variable handling
    schemas.py           Pydantic request/response models (API contract)
    data_loader.py       Loads & validates backend/data/*.json into a DataStore
    prerequisites.py     Prerequisite rules engine (FR-04)
    recommendations.py   Deterministic recommendation scoring (FR-05, FR-06)
    routers/              One module per resource (courses, careers, eligibility,
                          recommendations, schedule)
  data/                  Curated JSON reference data
  tests/                  pytest unit + API tests
  requirements.txt
  .env.example
```
