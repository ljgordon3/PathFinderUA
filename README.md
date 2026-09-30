# PathFinder UA

A React + TypeScript interface for exploring courses, connecting career interests, and planning a semester. Built for the CS-415 PathFinder UA project.

## Run locally

Install Node.js 22.12+ (includes npm), then run these commands in the project folder:

```sh
npm install
npm run dev
```

Open **http://127.0.0.1:5173** (or the address printed in the terminal). Press **Ctrl+C** to stop the application.

On Windows PowerShell, use `npm.cmd install` and `npm.cmd run dev` if `npm` is blocked. No backend, database, or API keys are needed.

The course list now uses the 19 curated UA CS/ECE records in [backend/data/courses.json](backend/data/courses.json), including course titles, credit hours, learning objectives, and source notes. The browser and API use the same records. Career relevance is a project mapping, and no course workload estimates are available.

The interface ranks courses listed in the UA B.S. CS major requirements first. This 19-course set does not contain every required course, and the site does not certify degree completion.

Prerequisite checks cover the CS/ECE relationships represented in this dataset. They do not check math, general education, grades, overrides, or other registration conditions. Confirm the full rules and degree applicability with the [UA catalog](https://catalog.ua.edu/undergraduate/engineering/computer-science/courses/) or an academic advisor.

If you previously used the fictional course demo, the updated course list starts a new saved browser profile. The old selections are not silently applied to courses with the same codes but different subjects.

## Verify

```sh
npm test
npm run build
npm run test:e2e
```

The frontend runs without starting the API. To run and test the API separately, see [backend/README.md](backend/README.md).
