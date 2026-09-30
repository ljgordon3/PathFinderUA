# Milestone 1 setup, verification, and demonstration

This guide is ready for a teammate to run on a second computer. An independent-machine run and teammate approval must be recorded separately before calling the Definition of Done complete. Use the commit under review; create the `milestone-1` tag after review and final verification.

## Setup from a fresh clone

Install Git, Python 3.11+, and Node.js 22.12+. Then run:

```powershell
git clone https://github.com/ljgordon3/PathFinderUA.git
cd PathFinderUA
cd backend
python -m venv .venv
.venv\Scripts\python.exe -m pip install -r requirements.txt
cd ..
npm.cmd install
```

On macOS/Linux, use `python3 -m venv .venv`, `.venv/bin/python -m pip install -r requirements.txt`, and `npm install`. No `.env` file or database is needed with the default settings.

## Automated verification

From `backend`, run `.venv\Scripts\python.exe -m pytest -q`. From the repository root, run:

```powershell
npm.cmd test
npm.cmd run build
npm.cmd run test:e2e
```

Playwright starts both the API and website. On macOS/Linux, use `.venv/bin/python` and `npm`. The browser tests cover setup, API requests, visible recommendation explanations, comparison, schedule warnings, persistence, export, deletion, mobile layout, and legacy profile handling.

## Live working demonstration

Open two terminals. In the first, run `cd backend` and `.venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000`. In the second, from the root, run `npm.cmd run dev -- --port 5173`. Check <http://127.0.0.1:8000/health> for `{"status":"ok"}`, then open <http://127.0.0.1:5173>.

1. Select **Find my starting point**, choose Software engineering, mark `CS 100` and `CS 101` complete, and set a 3-credit target. Save the profile.
2. Show the recommendations' eligibility, degree relevance, career skills, learning objectives, later courses, and source notes.
3. Add `CS 200` and `CS 201` to comparison and the semester. Show the comparison table and 8-credit total with a 5-credit-over-target warning.
4. Export the plan, reload to show local persistence, change career interest to show reranking, then delete the profile.
5. In the browser Network panel, show requests to `/api/courses`, `/api/careers`, `/api/eligibility`, `/api/recommendations`, `/api/courses/compare`, and `/api/schedule/summary`. API docs are at <http://127.0.0.1:8000/docs>.

The 19-course set is a curated subset, not a degree audit. Math/general education prerequisites, grades, overrides, alternate paths outside the set, and availability are not checked. Confirm current requirements with UA.

## Independent verification record

Second computer / verifier: **Pending**. Record the machine/OS, commit SHA, date, test results, demo result, and any issues in `docs/review-evidence.md` after the teammate performs the run. Do not mark that record complete based on this workspace's tests.
