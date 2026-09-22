from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_list_courses_returns_all_courses():
    response = client.get("/courses")
    assert response.status_code == 200
    courses = response.json()
    assert len(courses) >= 10
    assert any(c["id"] == "CS100" for c in courses)


def test_get_course_detail():
    response = client.get("/courses/CS100")
    assert response.status_code == 200
    assert response.json()["id"] == "CS100"


def test_get_unknown_course_returns_404():
    response = client.get("/courses/CS999")
    assert response.status_code == 404


def test_list_careers_returns_three_paths():
    response = client.get("/careers")
    assert response.status_code == 200
    assert len(response.json()) == 3


def test_eligibility_endpoint_flags_missing_prerequisites():
    response = client.post("/eligibility", json={"completed_course_ids": []})
    assert response.status_code == 200
    results = {r["course_id"]: r for r in response.json()}
    assert results["CS100"]["eligible"] is True
    assert results["CS201"]["eligible"] is False
    assert results["CS201"]["missing_prerequisites"] == ["CS100"]


def test_recommendations_endpoint_returns_explained_courses():
    response = client.post(
        "/recommendations",
        json={
            "completed_course_ids": ["CS100", "CS201", "CS150"],
            "career_id": "CAR-SWE",
            "target_credit_hours": 15,
            "workload_preference": "balanced",
        },
    )
    assert response.status_code == 200
    body = response.json()
    assert body["career_id"] == "CAR-SWE"
    assert 1 <= len(body["recommendations"]) <= 5
    first = body["recommendations"][0]
    assert "explanation" in first
    assert first["explanation"]["learning_objectives"]


def test_recommendations_endpoint_rejects_unknown_career():
    response = client.post(
        "/recommendations",
        json={
            "completed_course_ids": [],
            "career_id": "CAR-NOPE",
            "target_credit_hours": 15,
        },
    )
    assert response.status_code == 404


def test_compare_endpoint_returns_requested_courses_in_order():
    response = client.post("/courses/compare", json={"course_ids": ["CS100", "CS150"]})
    assert response.status_code == 200
    ids = [c["id"] for c in response.json()]
    assert ids == ["CS100", "CS150"]


def test_schedule_summary_warns_when_over_credit_target():
    response = client.post(
        "/schedule/summary",
        json={
            "course_ids": ["CS100", "CS150", "CS110"],
            "target_credit_hours": 6,
            "career_id": "CAR-SWE",
        },
    )
    assert response.status_code == 200
    body = response.json()
    assert body["total_credit_hours"] == 9
    codes = [w["code"] for w in body["warnings"]]
    assert "OVER_CREDIT_TARGET" in codes
