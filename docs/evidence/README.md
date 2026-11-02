# Evidence index

These are actual author-workspace outputs. `run-summary.json` identifies the tested commit, platform, commands, exit codes, and whether tracked application/test changes existed. Dates are UTC in the metadata; the local workstation uses America/Chicago. Pending reviewer/platform work is not represented as completed.

- `backend-tests.txt`, `frontend-tests.txt`, `build.txt`: latest consolidated QA output.
- `backend-coverage.json`, `frontend-coverage.json`: measured source coverage. Frontend scope is logic/API modules only; see ../qa-plan.md.
- `coverage-reports.zip`: extract and open backend/index.html or frontend/index.html.
- `browser-tests.txt`, `browser-results.json`, `browser-report.zip`: integration/end-to-end results. Extract the archive and run `npx playwright show-report <folder>`. Failed cases retain traces/screenshots when generated.
- `browser-before.txt`, `browser-before.zip`, `run-before.json`: preserved failed consolidated run before the development proxy socket change. The trace captured a connection reset; compare with the final passing run rather than claiming the initial run passed.
- `browser-stability.txt`, `browser-stability.json`: additional repeated browser scenarios at the same tested application commit; inspect the recorded results rather than assuming success.
- `security-before.txt`: new regression tests against the unmodified application at 484ef98, before schema bounds; 5 failed, 3 passed.
- `security-after.txt`: the same eight tests after the bounds; 8 passed. The final backend suite adds a boundary acceptance test, bringing security tests to nine.
- `npm-audit-before.json`, `npm-audit-after.json`: initial/updated dependency scan; five affected npm packages -> zero reported.
- `python-audit.json`, `python-audit-after.json`: initial/updated full virtual-environment scan, including tooling. Initial scanner output contains duplicate advisory entries; do not interpret the count as distinct exploits. Updated scan reports none known.
- `catalog-audit-backend-tests.txt`: 24 backend tests against archived PR #2 source at 14a1c92, using the current updated virtualenv. This does not claim a fresh full browser/build run on that branch or its original dependency environment.

Regenerate main QA with `python scripts/verify.py`. Dependency scans are separate, online, time-sensitive checks:

```powershell
npm.cmd audit --json
.\backend\.venv\Scripts\python.exe -m pip install pip-audit==2.10.1
.\backend\.venv\Scripts\python.exe -m pip_audit --format=json --progress-spinner=off
```

Update pip/setuptools in a fresh virtualenv before comparing a whole-environment scan. Audit tools are not application features and are not automatically run by verify.py. No secret-bearing request or credential output belongs in these artifacts. Archives intentionally preserve generated reports for the course submission; normal generated folders remain ignored.
