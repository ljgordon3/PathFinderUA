"""
Prerequisite rules engine.

A course's `prerequisites` field is a list of AND-groups in disjunctive
normal form: the course is eligible if *any one* of the groups is fully
satisfied by the student's completed courses.

    "prerequisites": [["CS360"], ["CS370"]]
    -> eligible if CS360 is completed OR CS370 is completed

    "prerequisites": [["CS201", "CS150"]]
    -> eligible if CS201 AND CS150 are both completed

An empty list means the course has no prerequisites and is always
eligible.
"""
from typing import List

from app.schemas import Course, EligibilityResult


def is_eligible(course: Course, completed_course_ids: List[str]) -> bool:
    if not course.prerequisites:
        return True
    completed = set(completed_course_ids)
    return any(set(group).issubset(completed) for group in course.prerequisites)


def missing_prerequisites(course: Course, completed_course_ids: List[str]) -> List[str]:
    """
    Returns the smallest unmet AND-group (fewest missing courses) so the
    student sees the most achievable path to eligibility, per US-05.
    """
    if not course.prerequisites:
        return []
    completed = set(completed_course_ids)
    best_missing: List[str] = []
    for group in course.prerequisites:
        missing = [c for c in group if c not in completed]
        if not best_missing or len(missing) < len(best_missing):
            best_missing = missing
        if not missing:
            return []  # a fully satisfied group exists; not actually missing anything
    return best_missing


def evaluate(course: Course, completed_course_ids: List[str]) -> EligibilityResult:
    eligible = is_eligible(course, completed_course_ids)
    return EligibilityResult(
        course_id=course.id,
        eligible=eligible,
        missing_prerequisites=[] if eligible else missing_prerequisites(course, completed_course_ids),
    )


def courses_unlocked_by(course_id: str, all_courses) -> List[str]:
    """Later courses for which `course_id` appears in at least one AND-group (US-12)."""
    unlocked = []
    for other in all_courses:
        if other.id == course_id:
            continue
        if any(course_id in group for group in other.prerequisites):
            unlocked.append(other.id)
    return unlocked
