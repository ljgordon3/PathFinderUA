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
       - credit_hours when the lighter preference is selected
"""
from typing import List

from app.data_loader import DataStore
from app.prerequisites import courses_unlocked_by, is_eligible, prerequisite_progress
from app.schemas import (
    Course,
    RecommendationExplanation,
    RecommendationItem,
    RecommendationRequest,
    RecommendationResponse,
    RoadmapRequest,
    RoadmapItem,
    RoadmapResponse,
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


def _score_course(course: Course, store: DataStore, mapping: dict, target_credit_hours: int | None = None,
                  workload_preference: str = "balanced") -> float:
    relevance = mapping["relevance"] if mapping else 0
    unlocked = len(courses_unlocked_by(course.id, store.courses.values()))
    degree_bonus = 1.0 if course.degree_category.lower() == "core" else 0.5
    credit_bonus = _credit_fit_bonus(course, target_credit_hours) if target_credit_hours is not None else 0
    # Credits are a load proxy, not an estimate of course difficulty.
    workload_bonus = -course.credit_hours if workload_preference == "lighter" else 0

    return (
        CAREER_ALIGNMENT_WEIGHT * relevance
        + PROGRESSION_WEIGHT * unlocked
        + DEGREE_WEIGHT * degree_bonus
        + CREDIT_FIT_WEIGHT * credit_bonus
        + workload_bonus
    )


def _explain(course: Course, store: DataStore, mapping: dict) -> RecommendationExplanation:
    unlocked = courses_unlocked_by(course.id, store.courses.values())
    career_skills = mapping["skill_ids"] if mapping else []
    sources = [course.source]
    if mapping:
        sources.extend(mapping.get("sources", []))
    return RecommendationExplanation(
        career_reason=mapping["explanation"] if mapping else "Builds a CS foundation or supports progression toward later courses; no direct career mapping is recorded.",
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
        score = _score_course(course, store, mapping, request.target_credit_hours,
                              request.workload_preference)

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


def build_roadmap(request: RoadmapRequest, store: DataStore) -> RoadmapResponse:
    if request.career_id not in store.careers:
        raise KeyError(request.career_id)
    completed = set(request.completed_course_ids)
    unknown = completed - store.courses.keys()
    if unknown:
        raise ValueError(f"Unknown completed courses: {', '.join(sorted(unknown))}")
    mappings = {m["course_id"]: m for m in store.mappings_for_career(request.career_id)}
    relevant = set(mappings) | {
        course.id for course in store.courses.values()
        if course.is_required or course.degree_category.lower() in {"core", "capstone"}
    }
    pending = list(relevant)
    while pending:
        course = store.courses[pending.pop()]
        if course.id in completed or is_eligible(course, request.completed_course_ids):
            continue
        for group in course.prerequisites:
            for course_id in group:
                if course_id not in relevant:
                    relevant.add(course_id)
                    pending.append(course_id)

    # Promote the foundations on a short modeled path to strongly aligned courses.
    # Readiness remains independent: a future course can still be a high priority.
    strong_foundations = set()
    pending = [cid for cid, mapping in mappings.items()
               if mapping["relevance"] >= 4 and cid not in completed]
    visited = set()
    while pending:
        course_id = pending.pop()
        if course_id in visited or course_id in completed:
            continue
        visited.add(course_id)
        missing = prerequisite_progress(store.courses[course_id], request.completed_course_ids)[1]
        strong_foundations.update(missing)
        pending.extend(missing)

    groups = {"strongly_recommended": [], "worth_considering": [], "broaden_skills": []}
    for course in store.courses.values():
        if course.id in completed or course.id not in relevant:
            continue
        if any(course.id in options and options.intersection(completed)
               for options in ({"CS100", "CS110"}, {"CS101", "CS111"})):
            continue
        mapping = mappings.get(course.id)
        relevance = mapping["relevance"] if mapping else 0
        if course.is_required:
            group = "strongly_recommended"
            reason = "An uncompleted required course in the supported CS major course set."
        elif relevance >= 4:
            group = "strongly_recommended"
            reason = "Strong direct alignment with the skills in your selected career."
        elif course.id in strong_foundations:
            group = "strongly_recommended"
            reason = "Builds a prerequisite foundation on a modeled path to strongly career-aligned courses."
        elif relevance >= 3:
            group = "worth_considering"
            reason = "Develops useful career skills that complement your highest-priority options."
        else:
            group = "broaden_skills"
            reason = "Adds supporting skills or academic foundations with a less direct recorded career connection."
        matched, missing = prerequisite_progress(course, request.completed_course_ids)
        groups[group].append(RoadmapItem(
            course=course,
            score=round(_score_course(course, store, mapping), 2),
            why_eligible=("Prerequisites still needed: complete a modeled path before considering this course."
                          if missing else "Your completed courses match a modeled CS/ECE prerequisite path; confirm full requirements with UA."),
            explanation=_explain(course, store, mapping),
            missing_prerequisites=missing,
            matched_prerequisites=matched,
            priority_reason=reason,
        ))
    for items in groups.values():
        items.sort(key=lambda item: (bool(item.missing_prerequisites), -item.score, item.course.id))
    return RoadmapResponse(career_id=request.career_id, **groups)
