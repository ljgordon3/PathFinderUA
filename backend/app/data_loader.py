"""
Loads the curated JSON reference data and validates it against the
Pydantic schemas and basic referential-integrity rules (FR-01, NFR-04).

Raising ValueError here on bad data means the FastAPI app fails fast
at startup instead of serving broken recommendations.
"""
import json
from functools import lru_cache
from pathlib import Path
from typing import Dict, List

from app.config import DATA_DIR
from app.schemas import Career, Course


class DataStore:
    def __init__(self, courses: Dict[str, Course], careers: Dict[str, Career],
                 mappings: List[dict], skills: List[dict], sources: List[dict]):
        self.courses = courses
        self.careers = careers
        self.mappings = mappings
        self.skills = skills
        self.sources = sources

    def course_or_404(self, course_id: str) -> Course:
        if course_id not in self.courses:
            raise KeyError(course_id)
        return self.courses[course_id]

    def mappings_for_career(self, career_id: str) -> List[dict]:
        return [m for m in self.mappings if m["career_id"] == career_id]


def _read_json(filename: str) -> list:
    path = Path(DATA_DIR) / filename
    if not path.exists():
        raise ValueError(f"Missing required data file: {path}")
    with path.open(encoding="utf-8") as f:
        try:
            return json.load(f)
        except json.JSONDecodeError as exc:
            raise ValueError(f"Invalid JSON in {path}: {exc}") from exc


def _validate_referential_integrity(courses: Dict[str, Course], careers: Dict[str, Career],
                                     mappings: List[dict], skills: List[dict]) -> None:
    skill_ids = {s["id"] for s in skills}
    errors = []

    for course in courses.values():
        for group in course.prerequisites:
            for prereq_id in group:
                if prereq_id not in courses:
                    errors.append(
                        f"Course {course.id} references unknown prerequisite {prereq_id}"
                    )
        for skill_id in course.skill_ids:
            if skill_id not in skill_ids:
                errors.append(f"Course {course.id} references unknown skill {skill_id}")

    for career in careers.values():
        for skill_id in career.relevant_skill_ids:
            if skill_id not in skill_ids:
                errors.append(f"Career {career.id} references unknown skill {skill_id}")

    for mapping in mappings:
        if mapping["course_id"] not in courses:
            errors.append(f"Mapping references unknown course {mapping['course_id']}")
        if mapping["career_id"] not in careers:
            errors.append(f"Mapping references unknown career {mapping['career_id']}")
        for skill_id in mapping.get("skill_ids", []):
            if skill_id not in skill_ids:
                errors.append(f"Mapping for {mapping['course_id']} references unknown skill {skill_id}")

    if errors:
        raise ValueError("Data validation failed:\n" + "\n".join(errors))


@lru_cache(maxsize=1)
def load_data_store() -> DataStore:
    raw_courses = _read_json("courses.json")
    raw_careers = _read_json("careers.json")
    mappings = _read_json("course_career_mappings.json")
    skills = _read_json("skills.json")
    sources = _read_json("sources.json")

    courses = {c["id"]: Course(**c) for c in raw_courses}
    careers = {c["id"]: Career(**c) for c in raw_careers}

    _validate_referential_integrity(courses, careers, mappings, skills)

    return DataStore(courses=courses, careers=careers, mappings=mappings,
                      skills=skills, sources=sources)


def reset_cache() -> None:
    """Used by tests to force a reload after swapping DATA_DIR."""
    load_data_store.cache_clear()
