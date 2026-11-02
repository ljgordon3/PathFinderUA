# Milestone 2 author-workspace QA summary

Tested application commit: `65662c0ea345ff4c10b796382e6a3265c05feb22`. No tracked application/test changes were present during the consolidated run. Later evidence/documentation commits do not alter the tested application. Recorded at 2026-11-02 UTC on Windows 11, Python 3.11.1, Node 22.22.2. Exact commands/platform/exit codes: [run-summary.json](run-summary.json).

| Check | Actual result |
|---|---|
| Backend tests (unit + API integration + security) | 50 passed |
| Frontend unit/API-boundary tests | 12 passed |
| Real browser integration/end-to-end scenarios | 6 passed |
| Additional browser stability check | All six scenarios repeated twice: 12 passed, two workers |
| Production TypeScript/Vite build | Passed |
| Backend lines / branches | 94.81% / 87.27% |
| Frontend logic/API lines / branches | 98.36% / 92.45% |
| Separate coverage targets | 80% lines / 75% branches, passed |
| Input/CORS security tests | Nine included in backend total; eight original comparison tests changed from 5 failures/3 passes to 8 passes |
| Dependency audits after updates | npm and complete Python environment scans report no known vulnerabilities |
| PR #2 archived-source backend check | 24 passed using updated environment; not a fresh full original-environment validation |
| Independent peer review / other OS | Pending |

Frontend source coverage deliberately measures api.ts, data.ts, and planning.ts. It is not whole-UI coverage. Browser tests cover UI workflows and include the mobile 390x844 scenario; that is viewport evidence, not proof of cross-platform operation. See [QA plan](../qa-plan.md) for the target justification and flow map.

The pre-proxy-change failed browser report is retained. The final six-scenario result is from one complete successful run, not combined partial reruns. Audit reports are point-in-time advisory checks, not security certification. Security tests establish bounded field inputs and browser-origin policy, not authentication, transport request limits, or complete DoS protection.

Reports are linked from README.md in this folder. Teammate review, independent platform testing, final contribution statements/PDF, and final milestone-2 publication must not be marked complete based on these author-side results.
