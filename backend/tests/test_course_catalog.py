import json
from pathlib import Path

import pytest

from app.data_loader import load_data_store, _validate_referential_integrity
from app.recommendations import build_roadmap
from app.schemas import RoadmapRequest
from app.prerequisites import is_eligible


def test_catalog_contains_every_requested_course_with_official_title_and_credits():
    snapshot = json.loads((Path(__file__).parent / "fixtures/cs-catalog-2026-11-01.json").read_text(encoding="utf-8"))
    store = load_data_store()
    expected = {course["id"] for course in snapshot["courses"]}
    assert len(expected) == 54
    assert set(store.courses) == expected | {"CS121", "ECE380", "ECE383"}
    excluded = {f"CS{number}" for number in [499, 494, 493, 492, 491, 391, 385, 312, 305, 302, 285, 206, 112, 106, 102]}
    assert not excluded.intersection(store.courses)
    for course in snapshot["courses"]:
        actual = store.courses[course["id"]]
        assert actual.title == course["title"]
        assert actual.credit_hours == course["credit_hours"]


def test_new_honors_and_networking_paths_unlock_supported_courses():
    courses = load_data_store().courses
    assert is_eligible(courses["CS101"], ["CS110"])
    assert is_eligible(courses["CS200"], ["CS111"])
    assert is_eligible(courses["CS201"], ["CS111"])
    assert is_eligible(courses["CS338"], ["CS201", "CS240"])
    assert is_eligible(courses["CS460"], ["CS338", "CS301", "ECE383"])
    assert "CS300" not in courses
    assert all("CS300" not in group for course in courses.values() for group in course.prerequisites)
    assert is_eligible(courses["CS464"], ["CS338", "CS301", "ECE383"])
    assert is_eligible(courses["CS495"], ["CS403", "CS483"])


def test_no_remaining_course_depends_on_an_excluded_course():
    store = load_data_store()
    for course in store.courses.values():
        for group in course.prerequisites:
            assert set(group).issubset(store.courses)


def test_unknown_prerequisites_still_fail_validation():
    store = load_data_store()
    courses = dict(store.courses)
    courses["CS100"] = courses["CS100"].model_copy(update={"prerequisites": [["CS999"]]})
    with pytest.raises(ValueError, match="unknown prerequisite CS999"):
        _validate_referential_integrity(courses, store.careers, store.mappings, store.skills)


def test_completed_standard_foundations_do_not_recommend_honors_duplicates():
    store = load_data_store()
    result = build_roadmap(RoadmapRequest(career_id="CAR-SWE", completed_course_ids=["CS100", "CS101"]), store)
    suggested = {item.course.id for item in result.strongly_recommended + result.worth_considering + result.broaden_skills}
    assert not {"CS110", "CS111", "CS223"}.intersection(suggested)


def test_new_ai_and_robotics_courses_have_explained_career_mappings():
    store = load_data_store()
    result = build_roadmap(RoadmapRequest(career_id="CAR-ROBOTICS", completed_course_ids=["CS338", "CS301", "ECE383"]), store)
    next_courses = {item.course.id: item for item in result.strongly_recommended}
    assert {"CS463", "CS464", "CS465", "CS483", "CS484"}.issubset(next_courses)
    assert next_courses["CS484"].explanation.career_skills
    assert "Project mapping" in next_courses["CS484"].explanation.career_reason
