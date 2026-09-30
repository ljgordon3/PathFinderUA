# PathFinder UA

A React + TypeScript interface for exploring courses, connecting career interests, and planning a semester. Built for the CS-415 PathFinder UA project.

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

The API serves the 19 curated UA CS/ECE records in [backend/data/courses.json](backend/data/courses.json), including course titles, credit hours, learning objectives, and source notes. The browser uses FastAPI for course selection, eligibility, recommendations, comparison, and schedule summaries. Career relevance is a project mapping, and no course workload estimates are available. See the [product brief and MVP scope](docs/product-brief-and-mvp.md).

The interface ranks courses listed in the UA B.S. CS major requirements first. This 19-course set does not contain every required course, and the site does not certify degree completion.

Prerequisite checks cover the CS/ECE relationships represented in this dataset. They do not check math, general education, grades, overrides, or other registration conditions. Confirm the full rules and degree applicability with the [UA catalog](https://catalog.ua.edu/undergraduate/engineering/computer-science/courses/) or an academic advisor.

If you previously used the fictional course demo, the updated course list starts a new saved browser profile. The old selections are not silently applied to courses with the same codes but different subjects.

## Verify

```sh
npm test
npm run build
npm run test:e2e
```

Playwright starts both servers automatically after backend dependencies are installed. For a step-by-step demonstration, see [VERIFICATION.md](VERIFICATION.md).
