import pytest

from app.data_loader import DataStore, load_data_store
from app.recommendations import recommend
from app.schemas import RecommendationRequest


@pytest.fixture(scope="module")
def store():
    return load_data_store()


def test_unknown_career_raises_key_error(store):
    request = RecommendationRequest(
        completed_course_ids=[], career_id="CAR-DOES-NOT-EXIST", target_credit_hours=15
    )
    with pytest.raises(KeyError):
        recommend(request, store, result_count=5, min_result_count=3)


def test_new_student_gets_three_to_five_recommendations(store):
    request = RecommendationRequest(
        completed_course_ids=[], career_id="CAR-SWE", target_credit_hours=15
    )
    response = recommend(request, store, result_count=5, min_result_count=3)
    assert 3 <= len(response.recommendations) <= 5


def test_recommendations_exclude_ineligible_courses(store):
    # CS301 requires both CS201 and CS200, which have not been completed.
    request = RecommendationRequest(
        completed_course_ids=[], career_id="CAR-SWE", target_credit_hours=15
    )
    response = recommend(request, store, result_count=10, min_result_count=3)
    recommended_ids = {item.course.id for item in response.recommendations}
    assert "CS301" not in recommended_ids


def test_recommendations_exclude_already_completed_courses(store):
    request = RecommendationRequest(
        completed_course_ids=["CS100", "CS201"], career_id="CAR-SWE", target_credit_hours=15
    )
    response = recommend(request, store, result_count=10, min_result_count=3)
    recommended_ids = {item.course.id for item in response.recommendations}
    assert "CS100" not in recommended_ids
    assert "CS201" not in recommended_ids


def test_recommendation_scores_are_sorted_descending(store):
    request = RecommendationRequest(
        completed_course_ids=["CS100", "CS101", "CS200", "CS201"], career_id="CAR-DS-AI", target_credit_hours=15
    )
    response = recommend(request, store, result_count=10, min_result_count=3)
    scores = [item.score for item in response.recommendations]
    assert scores == sorted(scores, reverse=True)


def test_same_inputs_produce_same_results(store):
    """NFR-05: recommendations must be deterministic and reproducible."""
    request = RecommendationRequest(
        completed_course_ids=["CS100"], career_id="CAR-ROBOTICS", target_credit_hours=15
    )
    first = recommend(request, store, result_count=5, min_result_count=3)
    second = recommend(request, store, result_count=5, min_result_count=3)
    assert [i.course.id for i in first.recommendations] == [i.course.id for i in second.recommendations]


def test_lighter_preference_favors_lower_credit_courses_when_other_factors_match(store):
    courses = {
        cid: store.courses[cid].model_copy(update={"prerequisites": [], "degree_category": "Elective"})
        for cid in ["CS100", "CS223"]
    }
    matched = DataStore(courses, store.careers, [], store.skills, store.sources)
    request = RecommendationRequest(career_id="CAR-SWE", target_credit_hours=12)
    balanced = recommend(request, matched, 5, 3)
    lighter = recommend(request.model_copy(update={"workload_preference": "lighter"}), matched, 5, 3)
    assert balanced.recommendations[0].course.id == "CS100"
    assert lighter.recommendations[0].course.id == "CS223"


def test_switching_career_changes_advanced_course_recommendations(store):
    request = RecommendationRequest(
        completed_course_ids=["CS100", "CS101", "CS200", "CS201", "CS301", "CS338", "ECE380", "ECE383"],
        career_id="CAR-SWE", target_credit_hours=12,
    )
    software = recommend(request, store, 5, 3)
    robotics = recommend(request.model_copy(update={"career_id": "CAR-ROBOTICS"}), store, 5, 3)
    assert software.recommendations[0].course.id == "CS416"
    assert robotics.recommendations[0].course.id == "CS465"


def test_credit_target_changes_fit_score(store):
    request = RecommendationRequest(career_id="CAR-SWE", target_credit_hours=3)
    small = recommend(request, store, 10, 3)
    large = recommend(request.model_copy(update={"target_credit_hours": 12}), store, 10, 3)
    score = lambda response: next(item.score for item in response.recommendations if item.course.id == "CS100")
    assert score(large) > score(small)


def test_every_recommendation_includes_required_explanation_fields(store):
    """SC-05: every recommendation must show relevance, unlocks, objectives, skills, sources."""
    request = RecommendationRequest(
        completed_course_ids=["CS100", "CS101", "CS200", "CS201"], career_id="CAR-DS-AI", target_credit_hours=15
    )
    response = recommend(request, store, result_count=5, min_result_count=3)
    assert len(response.recommendations) > 0
    for item in response.recommendations:
        assert item.explanation.degree_relevance
        assert item.explanation.learning_objectives
        assert item.explanation.sources
        assert item.why_eligible
