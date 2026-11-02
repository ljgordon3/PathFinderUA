# PathFinder UA

A React + TypeScript interface that helps UA CS students identify courses worth considering before graduation, based on career interests and completed coursework. Built for the CS-415 PathFinder UA project.

## Run locally

Install Node.js 22.12+ and Python 3.11+. Start the API first:

```powershell
cd backend
python -m venv .venv
.venv\Scripts\python.exe -m pip install -r requirements.txt
.venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

On macOS/Linux, use `python3 -m venv .venv`, `.venv/bin/python -m pip install -r requirements.txt`, and `.venv/bin/python -m uvicorn app.main:app --host 127.0.0.1 --port 8000`. In a second terminal at the project root:

```sh
npm install
npm run dev
```

Open **http://127.0.0.1:5173** (or the address printed in the terminal). Press **Ctrl+C** to stop the application.

On Windows PowerShell, use `npm.cmd install` and `npm.cmd run dev` if `npm` is blocked. Both servers are required for planning; no database or API keys are needed.

Run `npm install` from the **project root** (the folder containing `package.json`) once after cloning and again after pulling changes that touch `package.json`. If `npm run dev` reports `Cannot find package '@vitejs/plugin-react'`, dependencies are not installed there.

### Windows with Cygwin or Git Bash

Use the Windows installs of Python 3.11+ and Node.js 22.12+, not Cygwin's own packages (the backend's compiled dependencies do not build on Cygwin). Cygwin does not include the `py` launcher, so call Python by its full path (find it with `cmd.exe /c "where python"`; the default install is under `AppData/Local/Programs/Python/Python312/`):

```sh
PY="/cygdrive/c/Users/<you>/AppData/Local/Programs/Python/Python312/python.exe"
cd backend
"$PY" -m venv .venv
.venv/Scripts/python.exe -m pip install -r requirements.txt
.venv/Scripts/python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

In a second terminal at the project root, run `npm install` and `npm run dev` (use `npm.cmd` if `npm` fails). Check <http://127.0.0.1:8000/health> before opening the app.

The API serves the 57 curated UA CS/ECE records in [backend/data/courses.json](backend/data/courses.json). The browser uses FastAPI for course selection, prerequisite checks, career course roadmaps, and comparison. Career relevance and objectives are project interpretations. See the [revised scope](docs/product-brief-and-mvp.md).

The course catalog lists courses identified as UA B.S. CS major requirements first. Personalized recommendations use the scoring described below. This 57-course set does not contain every required course, and the site does not certify degree completion.

New users start directly with an inline career-interest and completed-course form, then see **Strongly recommended**, **Worth considering**, and **Broaden your skills**. Future courses show missing prerequisites for one modeled path. Save any uncompleted course to **My roadmap**, compare options, and export your interests for advising. Credit targets, workload preferences, and semester scheduling are no longer part of setup. Existing semester selections become saved roadmap interests; completed courses and career preferences are retained. Explore courses opens **Recommended for you** after setup, with three priority levels covering both immediate and future options. Switch to **All courses** to browse the entire curated catalog. Search and eligibility filters apply to either view; editing preferences refreshes the personalized view.

The CS dataset was expanded against the current UA catalog on November 1, 2026, adding 39 courses and honoring the requested exclusions. The two ECE records retain their October 30 audit. CS 121 remains identified as a historical record. CS 300 has been removed; modeled prerequisites and saved profile selections now use CS 338. See [the course audit](docs/course-catalog-audit.md) for verification details and prerequisite limitations. Learning objectives are project summaries rather than official catalog outcomes.

Prerequisite checks cover the CS/ECE relationships represented in this dataset. They do not check math, general education, grades, overrides, or other registration conditions. Confirm the full rules and degree applicability with the [UA catalog](https://catalog.ua.edu/undergraduate/engineering/computer-science/courses/) or an academic advisor.

If you previously used the fictional course demo, the updated course list starts a new saved browser profile. The old selections are not silently applied to courses with the same codes but different subjects.

## Verify

For the complete Milestone 2 QA run and saved reports, run `python scripts/verify.py` from the repository root after installing dependencies. It uses `backend/.venv`, runs coverage gates, build, and browser tests, and saves reports under `docs/evidence`. Stop manually running servers first when you want Playwright to start fresh servers for the tested code. The frontend coverage metric covers logic and API modules, not React rendering. See [QA plan](docs/qa-plan.md), [security evidence](docs/security-evidence.md), [threat model](docs/threat-model.md), [OWASP review](docs/owasp-review.md), and [changelog](CHANGELOG.md).

Coverage targets are 80% lines and 75% branches for each documented scope. Run `npm run test:coverage` for frontend coverage alone. HTML reports are generated under `coverage/`; submitted report archives and exact run metadata are in `docs/evidence/`.

```sh
npm test
npm run build
npm run test:e2e
```

Playwright starts both servers automatically after backend dependencies are installed. For a step-by-step demonstration, see [VERIFICATION.md](VERIFICATION.md).

The current CS catalog is included except CS 102, 106, 112, 206, 285, 302, 305, 312, 385, 391, 491, 492, 493, 494, and 499. Honors alternatives and CS 338 prerequisite paths are modeled; math, grades, and concurrent enrollment remain outside the completed-course model.

Untaken courses marked required in the supported course dataset always appear in Strongly recommended, regardless of career interest or prerequisite readiness. Required status comes from the same course record used for UI labels. Cards show career skills and explain eligibility using completed prerequisites or a remaining modeled path. Expanded objectives and source notes remain in course details.
