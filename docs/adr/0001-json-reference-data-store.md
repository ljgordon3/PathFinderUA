# ADR 0001: Store reference data as version-controlled JSON files, not a database

**Status:** Accepted — Milestone 1
**Deciders:** Logan Gordon (backend), Jylen Tate (frontend)

## Context

PathFinder UA needs a place to store course, prerequisite, career, skill,
course-career mapping, and source-attribution data. The MVP dataset is
small (10–25 courses, 3 career paths) and is curated by the team rather
than written to by end users. Students' own planning data (completed
courses, career interest, workload preference, proposed schedule) is a
separate concern already scoped to browser local storage (see MVP Scope,
section 5 of the project brief).

## Decision

Reference data is stored as validated, version-controlled JSON files
under `backend/data/`, loaded and validated once at FastAPI startup
(`app/data_loader.py`). No database server (Postgres, SQLite, etc.) is
introduced for the MVP.

## Alternatives Considered

1. **SQLite / a relational database.** Would add a migration and seeding
   step, a new dependency, and operational surface (file location,
   schema versioning) with little benefit at this data volume. Rejected
   for the MVP; listed as a "possible later feature" if the dataset
   grows past what JSON can comfortably support.
2. **A hosted/managed database.** Adds cost, network dependency, and
   credentials to manage — directly conflicting with NFR-03 (privacy)
   and NFR-06 (must run without a separate database server). Rejected.
3. **Hard-coding data in Python/TypeScript source.** Would mix curated
   content with application logic, making it harder for a non-engineer
   (or a TA) to review the dataset, and harder to validate independently
   of the application. Rejected.

## Consequences

- **Positive:** Zero setup cost for a TA (`git clone` + `npm install` +
  `pip install` is sufficient — no database to install or migrate).
  Data changes are reviewable in pull requests as plain diffs. Startup
  validation (`app/data_loader.py`) catches malformed or inconsistent
  data before the API serves a single request (NFR-04).
- **Negative:** No concurrent-write support and no query language — not
  a concern here because reference data is read-only at runtime and is
  edited by the team, not by students.
- **Revisit when:** the dataset grows beyond ~25–50 courses, or the team
  wants non-technical contributors to edit data through a UI rather than
  a pull request, at which point a lightweight database (SQLite) is the
  natural next step (see MVP Scope: "Possible Later Features").
