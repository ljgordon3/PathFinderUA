import pytest

from app.data_loader import load_data_store
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
    # CS301 requires CS201 + CS150, which have not been completed.
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
        completed_course_ids=["CS100", "CS201", "CS150"], career_id="CAR-DS-AI", target_credit_hours=15
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


def test_every_recommendation_includes_required_explanation_fields(store):
    """SC-05: every recommendation must show relevance, unlocks, objectives, skills, sources."""
    request = RecommendationRequest(
        completed_course_ids=["CS100", "CS201", "CS150"], career_id="CAR-DS-AI", target_credit_hours=15
    )
    response = recommend(request, store, result_count=5, min_result_count=3)
    assert len(response.recommendations) > 0
    for item in response.recommendations:
        assert item.explanation.degree_relevance
        assert item.explanation.learning_objectives
        assert item.explanation.sources
        assert item.why_eligible
