# Milestone 1 Verification Guide

This describes what to run and check to verify the tagged `milestone-1`
version of PathFinder UA.

**Current state:** the backend and frontend are two independently
working, independently tested pieces that are not yet wired together.
The React client (`src/`) currently runs entirely on its own bundled
demo data and client-side ranking logic (`src/data.ts`, `src/planning.ts`)
and does not call the backend API. The FastAPI backend (`backend/`) is
a complete, independently verifiable implementation of the same
end-to-end flow (eligibility → recommendations → schedule) against the
real UA Computer Science curriculum. Section 5 below verifies each side
separately for that reason; wiring the client to the API is tracked as
the next integration step (see `docs/adr/0003-real-curriculum-and-scope.md`).

## 1. Clone and check out the tag

```bash
git clone https://github.com/ljgordon3/PathFinderUA.git
cd PathFinderUA
git checkout milestone-1
```

## 2. Run the backend

```bash
cd backend
python3 -m venv .venv && source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload
```

**Check:** open <http://127.0.0.1:8000/health> — expect `{"status":"ok"}`.
**Check:** open <http://127.0.0.1:8000/docs> — expect interactive API
docs listing `/courses`, `/careers`, `/eligibility`, `/recommendations`,
and `/schedule/summary`, backed by 19 real UA CS/ECE courses.

## 3. Run the backend automated tests

```bash
# from backend/, with the virtual environment still active
pytest
```

**Check:** all tests pass, including `test_recommendations.py` (SC-04,
SC-05, including the real CS 495 compound-prerequisite rule) and
`test_api.py` (integration coverage of every endpoint).

## 4. Run the frontend

In a second terminal:

```bash
npm install
npm run dev
```

**Check:** open <http://127.0.0.1:5173> (or the address printed in the
terminal). The application loads and the full profile → career →
recommendations → schedule flow works end-to-end using its own bundled
demo dataset (no backend connection is attempted yet — see the note above).

## 5. Walk the primary end-to-end flow

**Frontend (client-side demo data):** open the running app and walk
through creating a profile, selecting completed courses, choosing a
career, and reviewing recommendations and a proposed schedule.

**Backend (real UA curriculum, via the API docs at `/docs`):**

1. Submit completed courses `CS100`, `CS101` to `POST /eligibility` and
   confirm `CS200` and `CS201` are now eligible, while `CS300` is not
   (it also requires `CS201`).
2. Select the `CAR-SWE` (Software Engineering) career, a target of 15
   credit hours, and call `POST /recommendations`.
   **Check:** the response contains 3–5 recommendations, each with a
   non-empty `explanation` (degree relevance, learning objectives,
   career skills, sources) and a `why_eligible` reason.
3. Add two or three of the recommended course IDs to
   `POST /schedule/summary` with the same 15-credit target.
   **Check:** `total_credit_hours` is correct and a warning appears only
   when the total exceeds 15 or three-plus courses are included.
4. Repeat step 2 with `career_id` set to `CAR-DS-AI` or `CAR-ROBOTICS`
   and confirm the ranked list changes to reflect that career's course
   relevance.
5. Complete the full core sequence (`CS121, CS100, CS101, CS200, CS201,
   CS202, CS223, ECE380, ECE383, CS300, CS301`) plus `CS403` and `CS460`,
   then confirm `CS495` (the capstone) becomes eligible — but not if only
   `CS403` is completed, since CS495 requires a *second* 4xx course too.

## 6. What "passing" looks like for Milestone 1

- Backend starts without a data-validation error (proves FR-01/NFR-04)
  against the real 19-course UA CS/ECE dataset.
- `pytest` passes with no failures.
- The frontend flow in step 5 completes without a browser console error.
- The backend flow in step 5 completes without a server error and
  produces recommendations that visibly differ by career choice.
- No `.env` file, password, transcript, student ID, or API key appears
  anywhere in the repository (`git grep` for obvious secrets is a
  reasonable spot check).

If anything in this guide fails, please open a GitHub Issue on the
repository rather than assuming the whole milestone is broken — most
likely causes are a Python/Node version mismatch (see the version
requirements in `backend/README.md` and the root `README.md`).
