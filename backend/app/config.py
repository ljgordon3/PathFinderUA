"""
Application configuration.

Values are read from environment variables so that no secrets or
environment-specific settings are hard-coded into the source tree.
See `.env.example` for the full list of supported variables.
"""
import os
from pathlib import Path

# Root of the backend package (backend/app/ -> backend/)
BASE_DIR = Path(__file__).resolve().parent.parent

# Where the curated JSON reference data lives. Overridable for tests
# or alternate datasets via the DATA_DIR environment variable.
DATA_DIR = Path(os.getenv("DATA_DIR", BASE_DIR / "data"))

# Comma-separated list of origins allowed to call the API from a browser.
# Defaults cover the Vite dev server used by the React client.
_default_origins = "http://127.0.0.1:5173,http://localhost:5173"
ALLOWED_ORIGINS = [
    origin.strip()
    for origin in os.getenv("ALLOWED_ORIGINS", _default_origins).split(",")
    if origin.strip()
]

# Number of ranked recommendations to return (NFR-05 / US-06).
RECOMMENDATION_COUNT = int(os.getenv("RECOMMENDATION_COUNT", "5"))
MIN_RECOMMENDATION_COUNT = int(os.getenv("MIN_RECOMMENDATION_COUNT", "3"))
