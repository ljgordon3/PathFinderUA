# OWASP Top 10 review

Edition: [OWASP Top 10:2025](https://top10.owasp.org/2025/). This is a scoped developer review of the local application, not certification or a penetration test. Inspection covers src/App.tsx, planning.ts, api.ts, backend schemas/routers/config/data_loader, package manifests, and regression tests. Reassess before public deployment or adding accounts/storage.

| Category | Applicability and review | Evidence / remaining work |
|---|---|---|
| A01 Broken Access Control | API intentionally exposes public reference data and calculations; no private server records or privileged operations exist. CORS is not authorization. | CORS tests document browser policy only. Add authorization if private records or editing endpoints are introduced. |
| A02 Security Misconfiguration | Default local origins are allowlisted; credentials disabled; development server binds loopback. | CORS tests; config.py/main.py. Production proxy, HTTPS, origins, and debug/API-doc exposure require deployment review. |
| A03 Software Supply Chain Failures | Python packages and npm tooling are part of the trust boundary. | Dependency scans in evidence; npm lockfile and exact backend requirements. Review residual findings and update tools; scans cannot prove supply-chain safety. |
| A04 Cryptographic Failures | No passwords/tokens or encryption features implemented. Profile lives unencrypted in localStorage. | Do not store sensitive identifiers; HTTPS required for hosted API/UI. No claim of secure sensitive-record storage. |
| A05 Injection | Reviewed UI uses React text interpolation; no unsafe HTML/eval or shell/SQL execution found in application request paths. | Static inspection and controlled API validation tests. This is not an exhaustive XSS payload suite; reassess if HTML content is added. |
| A06 Insecure Design | Unbounded request lists were accepted before scoring. Added field limits, with known transport/rate limitations. | Security before/after tests; threat-model residual risks. No complete DoS defense claimed. |
| A07 Authentication Failures | No account login/session system exists. The optional name is not an authenticated identity. | No authentication claim. Local browser access exposes local profile; reassess if accounts are introduced. |
| A08 Software or Data Integrity Failures | Read-only catalog and mappings are loaded from repository files; startup validates references. Stored profiles are parsed against known IDs. | Catalog tests, data_loader.py, planning.test.ts. No digital signature or automatic upstream catalog verification. |
| A09 Security Logging and Alerting Failures | No security event monitoring/alert pipeline exists. | Gap documented. Hosted service needs privacy-conscious validation/error monitoring; do not log completed-course profiles or secrets. |
| A10 Mishandling of Exceptional Conditions | Invalid request shapes use validation errors; unknown resources and API failures have explicit paths. | API tests, security tests, api.test.ts. Broader infrastructure/timeouts and deployment exception behavior remain to assess. |

Security fixes and reproduction: [security-evidence.md](security-evidence.md). Threats and boundaries: [threat-model.md](threat-model.md).
