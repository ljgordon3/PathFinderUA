# Security controls and before/after evidence

## Request input bounds: implemented Milestone 2 fix

Baseline application commit: `484ef98`. Before modifying schemas, the new `backend/tests/test_security.py` was run against that implementation. It expected oversized lists and IDs to be rejected but five cases failed because the API accepted them. The captured output is [security-before.txt](evidence/security-before.txt): 5 failed, 3 passed. Evidence text is normalized to UTF-8/LF with trailing whitespace removed; assertions and results are unchanged. A separate local probe also confirmed 1,000 repeated completed-course entries were accepted by eligibility and roadmap.

This is an input-resource hardening gap, not evidence of a successfully demonstrated service outage. No vulnerability was deliberately introduced. Milestone 1 did not need an earlier security fix to make this comparison valid.

Fix: `CourseIds` now limits eligibility, roadmap, legacy recommendation, and schedule lists to 200 entries. `CourseId` limits supplied IDs to 1–32 characters, including comparison IDs. 200 leaves growth room beyond the 57-record catalog while bounding downstream repeated processing. Existing compare-list maximum remains three. Pydantic rejects invalid requests with HTTP 422 before those endpoints execute scoring/prerequisite loops. It does not prevent JSON parsing cost or enforce transport-level request-size/rate limits.

The same eight baseline tests after the fix passed: [security-after.txt](evidence/security-after.txt). The final suite adds a ninth test proving the documented 200-entry boundary is accepted. Tests also verify a normal request succeeds after rejection, and allowed/disallowed CORS preflights. Reproduce with:

```powershell
.\backend\.venv\Scripts\python.exe -m pytest -q backend/tests/test_security.py
```

For an observable live demonstration, POST to `/eligibility` with `{"completed_course_ids":["CS100"]}`: expect 200. Send 201 repeated entries or an ID longer than 32 characters: expect 422. The full security test performs this without needing to manually construct a large request.

## Existing CORS control

`backend/app/main.py` uses `ALLOWED_ORIGINS` from config. The default development origins are localhost and 127.0.0.1 on port 5173. Credentials are disabled and allowed methods are GET/POST. Security tests assert allowed POST preflight succeeds with an allow-origin response; an unapproved origin receives a rejected preflight without that permission. This does not authenticate users or block direct non-browser API requests.

## Dependency evidence

`npm-audit-before.json` and `npm-audit-after.json` record the dependency audit before/after updates (five affected npm packages to zero reported). The before scan includes the newly added coverage provider, so it is not claimed as an untouched Milestone 1 dependency inventory. The application-input baseline above is separate. Patched versions are recorded in package-lock.json. `python-audit.json` records an initial full virtual-environment scan, including developer tools; findings must be distinguished from runtime exposure and some advisory records are duplicated by the scanner. `python-audit-after.json` reports no known vulnerabilities after framework/runtime/tool updates. Backend versions are pinned in requirements.txt; fresh environments should also update pip/setuptools. An audit is time-sensitive and cannot prove absence of vulnerabilities.

## Evidence interpretation

Outputs are local author-side tests, not independent peer review, penetration testing, or an OWASP certification. See [threat model](threat-model.md), [OWASP review](owasp-review.md), and [QA plan](qa-plan.md) for limitations and outstanding work. The final PR commit contains the fix; before/after files preserve the actual comparison. Do not replace a failed baseline with a later passing run.
