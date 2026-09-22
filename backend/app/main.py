"""
PathFinder UA backend service.

Run with: uvicorn app.main:app --reload
Interactive API docs: http://127.0.0.1:8000/docs
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import ALLOWED_ORIGINS
from app.data_loader import load_data_store
from app.routers import careers, courses, eligibility, recommendations, schedule

app = FastAPI(
    title="PathFinder UA API",
    description=(
        "Academic decision-support API for University of Alabama Computer "
        "Science students. Supports, but does not replace, DegreeWorks, "
        "the University catalog, or an academic advisor."
    ),
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


@app.on_event("startup")
def validate_data_on_startup() -> None:
    """FR-01 / NFR-04: fail fast if the curated JSON dataset is invalid."""
    load_data_store()


@app.get("/health", tags=["health"])
def health_check():
    return {"status": "ok"}


app.include_router(courses.router)
app.include_router(careers.router)
app.include_router(eligibility.router)
app.include_router(recommendations.router)
app.include_router(schedule.router)
