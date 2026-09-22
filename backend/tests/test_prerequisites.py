from app.prerequisites import courses_unlocked_by, evaluate, is_eligible, missing_prerequisites
from app.schemas import Course


def _course(course_id, prerequisites):
    return Course(
        id=course_id,
        title=course_id,
        description="",
        credit_hours=3,
        degree_category="Core",
        learning_objectives=[],
        skill_ids=[],
        catalog_year="2026-2027",
        source="test",
        prerequisites=prerequisites,
    )


def test_no_prerequisites_is_always_eligible():
    course = _course("CS100", [])
    assert is_eligible(course, []) is True
    assert is_eligible(course, ["CS999"]) is True


def test_single_and_group_requires_all_courses():
    course = _course("CS301", [["CS201", "CS150"]])
    assert is_eligible(course, ["CS201", "CS150"]) is True
    assert is_eligible(course, ["CS201"]) is False
    assert is_eligible(course, []) is False


def test_or_between_groups_requires_only_one_satisfied():
    course = _course("CS375", [["CS360"], ["CS370"]])
    assert is_eligible(course, ["CS360"]) is True
    assert is_eligible(course, ["CS370"]) is True
    assert is_eligible(course, []) is False


def test_missing_prerequisites_reports_smallest_unmet_group():
    course = _course("CS375", [["CS360"], ["CS370"]])
    assert missing_prerequisites(course, []) in (["CS360"], ["CS370"])
    assert missing_prerequisites(course, ["CS360"]) == []


def test_missing_prerequisites_prefers_the_and_group_closest_to_satisfied():
    course = _course("CS301", [["CS201", "CS150", "CS999"], ["CS201", "CS150"]])
    assert missing_prerequisites(course, ["CS201"]) == ["CS150"]


def test_evaluate_returns_eligibility_result():
    course = _course("CS301", [["CS201", "CS150"]])
    result = evaluate(course, ["CS201"])
    assert result.course_id == "CS301"
    assert result.eligible is False
    assert result.missing_prerequisites == ["CS150"]

    result = evaluate(course, ["CS201", "CS150"])
    assert result.eligible is True
    assert result.missing_prerequisites == []


def test_courses_unlocked_by_finds_dependents_across_and_or_groups():
    c100 = _course("CS100", [])
    c201 = _course("CS201", [["CS100"]])
    c375 = _course("CS375", [["CS360"], ["CS201"]])
    all_courses = [c100, c201, c375]

    assert courses_unlocked_by("CS100", all_courses) == ["CS201"]
    assert set(courses_unlocked_by("CS201", all_courses)) == {"CS375"}
    assert courses_unlocked_by("CS375", all_courses) == []
