# Career roadmap setup, verification, and demonstration

Use the branch or commit under review. Teammate approval and independent-machine verification must be recorded separately. The milestone-1 tag preserves the earlier semester-planning version; this guide describes the Milestone 2 roadmap revision.

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

On Windows, follow the "Windows with Cygwin" or "Windows with Git Bash" steps in the [README](README.md). The two shells use different paths to the same Python: `/cygdrive/c/...` in Cygwin and `/c/...` in Git Bash. Use `.venv/Scripts/python.exe` for backend commands in both. Run `npm install` from the repository root before `npm run dev`, `npm test`, or `npm run test:e2e`; skipping it causes `Cannot find package '@vitejs/plugin-react'`.

On a fresh machine, also install the browser used by the end-to-end tests once: `npx playwright install chromium`.

## Automated verification

Milestone 2 evidence: run `python scripts/verify.py` at the repository root. See [QA plan](docs/qa-plan.md) for scope/targets and evidence interpretation. For the security demonstration run `backend/.venv/Scripts/python.exe -m pytest -q backend/tests/test_security.py` on Windows, or `backend/.venv/bin/python -m pytest -q backend/tests/test_security.py` on macOS/Linux. The tests show excessive course lists rejected with 422, ordinary requests accepted, and CORS preflights allowed/rejected by origin. The initial failing security baseline is preserved separately. See [security evidence](docs/security-evidence.md).

From `backend`, run `.venv\Scripts\python.exe -m pytest -q`. From the repository root, run:

```powershell
npm.cmd test
npm.cmd run build
npm.cmd run test:e2e
```

Playwright starts both the API and website. On macOS/Linux, use `.venv/bin/python` and `npm`. The browser tests cover setup, API requests, visible recommendation explanations, comparison, future-course saving and progress transitions, persistence, export, deletion, mobile layout, and legacy profile handling.

## Live working demonstration

Recorded walkthrough: https://drive.google.com/file/d/1qFKDaulPsH8DVgPciqOcNboeZi2AhEyM/view?usp=drive_link

Open two terminals. In the first, run `cd backend` and `.venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000`. In the second, from the root, run `npm.cmd run dev -- --port 5173`. Check <http://127.0.0.1:8000/health> for `{"status":"ok"}`, then open <http://127.0.0.1:5173>.

1. The app opens on **Explore courses**. The sidebar contains only **Explore courses**, **Career paths**, and **My roadmap**. The inline form appears immediately for new users. Choose Robotics, continue to completed courses, and select **Show my recommendations**. Returning users can use **Edit my preferences**.
2. Inspect Strongly recommended, Worth considering, and Broaden your skills. CS 460 is Strongly recommended for Robotics, with missing CS 338, CS 301, and ECE 383 prerequisites shown independently of its tier.
3. Save CS 460 despite unmet prerequisites. Open **My roadmap**, export the saved interest, reload, and verify persistence.
4. Mark CS 338, CS 301, and ECE 383 completed. CS 460 stays Strongly recommended and now matches the modeled prerequisites. Mark CS 460 completed: it leaves saved interests and all recommendation tiers; its completed status remains visible in All courses.
5. Compare courses, change career interests, and delete the profile. Inspect category labels and source limitations.
6. Show requests to `/api/courses`, `/api/careers`, `/api/eligibility`, `/api/roadmap`, and `/api/courses/compare`. API docs: <http://127.0.0.1:8000/docs>.

The 57-course set is a curated subset, not a degree audit. Math/general education prerequisites, grades, overrides, alternate paths outside the set, and availability are not checked. Confirm current requirements with UA.

## Independent verification record

Second computer / verifier: **Pending**. Record the machine/OS, commit SHA, date, test results, demo result, and any issues in `docs/review-evidence.md` after the teammate performs the run. Do not mark that record complete based on this workspace's tests.

## Required course and simplified-card check

With any career selected, confirm that uncompleted required courses, including CS 403, CS 470, and CS 495, are in Strongly recommended even when their prerequisites are missing. Cards show career skills and an Eligibility line. Mark CS 201 complete: CS 338 should say to take CS 200, with CS 201 already completed. Mark CS 200 complete too: CS 338 should name CS 201 and CS 200 as the courses that unlocked it. The removed explanation headings do not appear on cards.
