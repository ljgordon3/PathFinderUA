# Milestone 1 Verification Guide

This describes what to run and check to verify the tagged `milestone-1`
version of PathFinder UA. It exercises the primary end-to-end MVP flow:
select completed courses → select a career → get explained
recommendations → build a proposed schedule.

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
and `/schedule/summary`.

## 3. Run the backend automated tests

```bash
# from backend/, with the virtual environment still active
pytest
```

**Check:** all tests pass, including `test_recommendations.py` (SC-04,
SC-05) and `test_api.py` (integration coverage of every endpoint).

## 4. Run the frontend

In a second terminal:

```bash
npm install
npm run dev
```

**Check:** open <http://127.0.0.1:5173> (or the address printed in the
terminal). The application loads without a console error about a
missing backend connection.

## 5. Walk the primary end-to-end flow

Using either the running frontend or the API docs at `/docs` directly:

1. Submit completed courses `CS100`, `CS150`, `CS201` and confirm
   `POST /eligibility` marks `CS301` eligible only once `CS150` is also
   included (`CS301` requires `CS201` **and** `CS150`).
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

## 6. What "passing" looks like for Milestone 1

- Backend starts without a data-validation error (proves FR-01/NFR-04).
- `pytest` passes with no failures.
- The primary flow in step 5 completes without a server error and
  produces recommendations that visibly differ by career choice.
- No `.env` file, password, transcript, student ID, or API key appears
  anywhere in the repository (`git grep` for obvious secrets is a
  reasonable spot check).

If anything in this guide fails, please open a GitHub Issue on the
repository rather than assuming the whole milestone is broken — most
likely causes are a Python/Node version mismatch (see the version
requirements in `backend/README.md` and the root `README.md`).
