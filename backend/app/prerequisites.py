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


def prerequisite_progress(course: Course, completed_course_ids: List[str]) -> tuple[List[str], List[str]]:
    """Return completed and missing courses on one shortest remaining prerequisite path."""
    if not course.prerequisites:
        return [], []
    completed = set(completed_course_ids)
    path = min(course.prerequisites, key=lambda group: (
        len(set(group) - completed), tuple(group),
    ))
    return ([cid for cid in path if cid in completed],
            [cid for cid in path if cid not in completed])


def missing_prerequisites(course: Course, completed_course_ids: List[str]) -> List[str]:
    return prerequisite_progress(course, completed_course_ids)[1]


def evaluate(course: Course, completed_course_ids: List[str]) -> EligibilityResult:
    matched, missing = prerequisite_progress(course, completed_course_ids)
    return EligibilityResult(
        course_id=course.id,
        eligible=not missing,
        matched_prerequisites=matched,
        missing_prerequisites=missing,
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
