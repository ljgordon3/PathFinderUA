"""Run local QA and preserve reports. Run from the repository root: python scripts/verify.py."""
import hashlib
import json
import os
from pathlib import Path
import platform
import shutil
import subprocess
import sys
from datetime import datetime, timezone

root = Path(__file__).resolve().parent.parent
os.chdir(root)
evidence = root / "docs/evidence"
evidence.mkdir(exist_ok=True)
python = root / "backend/.venv" / ("Scripts/python.exe" if os.name == "nt" else "bin/python")
npm = shutil.which("npm.cmd" if os.name == "nt" else "npm")
if not python.exists() or not npm:
    sys.exit("Install backend/.venv and Node.js dependencies first; see README.md.")

results = []
commands = [
    ("backend-tests", [str(python), "-m", "pytest", "-q", "backend/tests", "--cov=backend/app", "--cov-branch", "--cov-report=term-missing", "--cov-report=json:docs/evidence/backend-coverage.json", "--cov-report=html:coverage/backend", "--cov-fail-under=80"]),
    ("frontend-tests", [npm, "run", "test:coverage"]),
    ("build", [npm, "run", "build"]),
    ("browser-tests", [npm, "run", "test:e2e"]),
]
for name, command in commands:
    print(f"Running {name}...", flush=True)
    result = subprocess.run(command, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, encoding="utf-8", errors="replace")
    (evidence / f"{name}.txt").write_text(result.stdout, encoding="utf-8")
    print(result.stdout, flush=True)
    results.append({"check": name, "command": command[1:], "exit_code": result.returncode})

backend = json.loads((evidence / "backend-coverage.json").read_text(encoding="utf-8"))["totals"]
coverage_pass = backend["percent_statements_covered"] >= 80 and backend["percent_branches_covered"] >= 75
results.append({"check": "backend-separate-coverage-targets", "exit_code": 0 if coverage_pass else 1})
for source, target in [
    ("coverage/frontend/coverage-summary.json", "frontend-coverage.json"),
    ("test-results/results.json", "browser-results.json"),
]:
    if Path(source).exists():
        shutil.copyfile(source, evidence / target)
for folder, archive in [("coverage", "coverage-reports"), ("playwright-report", "browser-report")]:
    if Path(folder).exists():
        shutil.make_archive(str(evidence / archive), "zip", folder)

commit = subprocess.check_output(["git", "rev-parse", "HEAD"], text=True).strip()
diff = subprocess.check_output(["git", "diff", "HEAD", "--", "src", "backend", "scripts", "package.json", "package-lock.json", "vite.config.ts", "playwright.config.ts", "tests"])
summary = {
    "recorded_at_utc": datetime.now(timezone.utc).isoformat(),
    "commit": commit,
    "tracked_code_diff_sha256": hashlib.sha256(diff).hexdigest(),
    "tracked_code_changes": bool(diff),
    "platform": platform.platform(),
    "python": subprocess.check_output([str(python), "--version"], text=True).strip(),
    "node": subprocess.check_output(["node", "--version"], text=True).strip(),
    "results": results,
}
(evidence / "run-summary.json").write_text(json.dumps(summary, indent=2) + "\n", encoding="utf-8")
sys.exit(0 if all(result["exit_code"] == 0 for result in results) else 1)
