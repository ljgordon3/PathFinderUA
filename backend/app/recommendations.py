"""
Deterministic recommendation engine.

Scoring is intentionally simple, explainable, and reproducible (NFR-05):
the same inputs and dataset always produce the same ranked list. No
machine learning or randomness is involved in the MVP, matching the
"Deterministic course recommendations" MVP scope decision.

score = (career_alignment_weight  * mapping_relevance)
       + (progression_weight      * courses_unlocked)
       + (degree_weight           * core_category_bonus)
       + (fit_weight              * credit_fit_bonus)
"""
from typing import List

from app.data_loader import DataStore
from app.prerequisites import courses_unlocked_by, is_eligible
from app.schemas import (
    Course,
    RecommendationExplanation,
    RecommendationItem,
    RecommendationRequest,
    RecommendationResponse,
)

CAREER_ALIGNMENT_WEIGHT = 2.0
PROGRESSION_WEIGHT = 1.0
DEGREE_WEIGHT = 1.5
CREDIT_FIT_WEIGHT = 1.0


def _credit_fit_bonus(course: Course, target_credit_hours: int) -> float:
    """Small bonus for courses that fit comfortably within the target load."""
    if course.credit_hours <= target_credit_hours:
        return 1.0
    return 0.0


def _score_course(course: Course, store: DataStore, mapping: dict, target_credit_hours: int) -> float:
    relevance = mapping["relevance"] if mapping else 0
    unlocked = len(courses_unlocked_by(course.id, store.courses.values()))
    degree_bonus = 1.0 if course.degree_category.lower() == "core" else 0.5
    credit_bonus = _credit_fit_bonus(course, target_credit_hours)

    return (
        CAREER_ALIGNMENT_WEIGHT * relevance
        + PROGRESSION_WEIGHT * unlocked
        + DEGREE_WEIGHT * degree_bonus
        + CREDIT_FIT_WEIGHT * credit_bonus
    )


def _explain(course: Course, store: DataStore, mapping: dict) -> RecommendationExplanation:
    unlocked = courses_unlocked_by(course.id, store.courses.values())
    career_skills = mapping["skill_ids"] if mapping else []
    sources = [course.source]
    if mapping:
        sources.extend(mapping.get("sources", []))
    return RecommendationExplanation(
        degree_relevance=f"Counts toward the {course.degree_category} category.",
        unlocks_course_ids=unlocked,
        learning_objectives=course.learning_objectives,
        career_skills=career_skills,
        sources=sorted(set(sources)),
    )


def recommend(request: RecommendationRequest, store: DataStore,
              result_count: int, min_result_count: int) -> RecommendationResponse:
    if request.career_id not in store.careers:
        raise KeyError(request.career_id)

    mappings_by_course = {
        m["course_id"]: m for m in store.mappings_for_career(request.career_id)
    }

    scored: List[RecommendationItem] = []
    for course in store.courses.values():
        if course.id in request.completed_course_ids:
            continue  # already taken
        if not is_eligible(course, request.completed_course_ids):
            continue  # FR-04: excluded from primary recommendations

        mapping = mappings_by_course.get(course.id)
        score = _score_course(course, store, mapping, request.target_credit_hours)

        scored.append(
            RecommendationItem(
                course=course,
                score=round(score, 2),
                why_eligible=(
                    "No prerequisites required."
                    if not course.prerequisites
                    else "All prerequisites in at least one required group are completed."
                ),
                explanation=_explain(course, store, mapping),
            )
        )

    scored.sort(key=lambda item: item.score, reverse=True)

    # US-06: return three to five recommendations when the eligible pool
    # supports it; otherwise return whatever is available.
    if len(scored) >= min_result_count:
        top = scored[: min(result_count, len(scored))]
    else:
        top = scored

    return RecommendationResponse(career_id=request.career_id, recommendations=top)
