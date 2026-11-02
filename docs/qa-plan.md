# Milestone 2 QA plan and evidence

## Scope and acceptance

Verify the career-roadmap revision against its current acceptance criteria, while retaining API regression tests for the original recommendation and schedule-summary endpoints. The old semester-building UI was intentionally replaced; passing old API tests does not establish that the old UI workflow is preserved. Confirm this scope change with the instructor before submission.

For every significant PR: run relevant tests, build, inspect changed user flows, document failures, link evidence, and obtain a teammate review. A merged PR or author-side testing is not peer approval. See the PR template and [review record](review-evidence.md).

## Repeatable checks

Install dependencies using README.md, then run `python scripts/verify.py` from the repository root. It runs backend coverage, frontend coverage, build, and Playwright. The script returns a failing exit code if any check or coverage gate fails, and records the commit, tracked code diff, platform, commands, and results in `evidence/run-summary.json`. Reports are overwritten on each run: preserve a meaningful baseline separately when investigating a regression.

| Check | Pass condition | Evidence |
|---|---|---|
| Backend tests | All API, prerequisite, roadmap, catalog, and security tests pass | evidence/backend-tests.txt |
| Frontend tests | Mapping, persistence/migration, error handling, and API boundary tests pass | evidence/frontend-tests.txt |
| Coverage | Separate line >=80% and branch >=75% targets reached | evidence/backend-coverage.json; evidence/frontend-coverage.json |
| Build | TypeScript and production bundling succeed | evidence/build.txt |
| Main browser flows | All six scenarios pass, with real requests through the Vite proxy | evidence/browser-tests.txt; evidence/browser-results.json |
| Security regression | Oversized lists/IDs rejected; normal requests still work; CORS allowlist behaves as configured | evidence/security-before.txt; evidence/security-after.txt |
| Dependency review | Review current scan results and document unresolved findings | evidence/*audit*.json |
| Independent platform | Teammate runs fresh setup and tests on another OS | Pending; deliberately deferred |
| Peer approval | Teammate submits review identifying tested commit | Pending; must be performed by teammate |

## Coverage target and limitations

Team target: at least 80% line and 75% branch coverage, independently measured for Python application code and frontend logic/API modules. Frontend statement/function thresholds are also 80%. These are project targets, not claimed course-mandated percentages. Prerequisite and ranking mistakes can mislead students, so these decision paths require direct assertions including locked/ready transitions and career changes. An aggregate percentage alone is insufficient.

Backend scope is all `backend/app` Python modules, excluding tests/dependencies by source selection. Frontend scope is `src/api.ts`, `src/data.ts`, and `src/planning.ts`; React rendering (`App.tsx`, entry point), CSS, and JSON data are not included in this unit-coverage percentage. Playwright covers UI workflows but does not produce UI source coverage. Do not label this metric whole-frontend coverage. No production logic is excluded merely because it is difficult to test.

80/75 provides a practical regression floor for this small project while allowing some startup/configuration and exceptional paths to remain uncovered. Review uncovered branches after each substantive change. Add tests based on risk, rather than assertions that merely execute lines. Coverage does not prove security or correctness.

## Main-flow evidence map

| User flow | Automated evidence in tests/planning.spec.ts |
|---|---|
| Select career/completed courses, see tiers, compare, save, reload, export, delete | setup, compare, save a roadmap, persist, export, and delete a profile |
| Save future course; complete prerequisites; see unlocked status; complete course | high-priority future courses stay in their tier as readiness changes |
| Navigation/forms/dialogs/search at 390x844 without horizontal overflow | mobile navigation, search, and dialogs work without overflow |
| Old fictional profiles do not contaminate current records | old fictional course selections are not reused |
| Career/completed-course edits issue updated API payload and persist | saving preferences refreshes recommendations and persists the new profile |
| Switch personalized/all catalog views and verify career-specific results | Explore courses switches between personalized suggestions and the complete catalog |

HTML reports are archived in `evidence/browser-report.zip` and `evidence/coverage-reports.zip`. Extract the browser archive and use `npx playwright show-report <extracted-folder>`; coverage HTML can be opened directly. Failed browser tests retain screenshots/traces. Successful reports contain assertions/results, not fabricated failure screenshots. Logs from earlier failed runs remain disclosed in PR history; a newer pass does not prove their root cause was fixed.

## Manual review still required

- [ ] Teammate checks setup and demo against the reviewed commit.
- [ ] Teammate records expected/actual behavior and any defects.
- [ ] Teammate submits a GitHub review and links it in review-evidence.md.
- [ ] Independent OS/platform run is recorded with machine, OS, browser, commit, and output.
- [ ] Milestone PDF links the tested version, reports, security evidence, contributions, and releases.
