"""Observable request-validation and browser-origin security controls."""
import pytest
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


@pytest.mark.parametrize("path,extra", [
    ("/eligibility", {}),
    ("/roadmap", {"career_id": "CAR-SWE"}),
    ("/recommendations", {"career_id": "CAR-SWE", "target_credit_hours": 15}),
    ("/schedule/summary", {"target_credit_hours": 15}),
])
def test_rejects_excessive_course_lists(path, extra):
    field = "course_ids" if path.startswith("/schedule") else "completed_course_ids"
    response = client.post(path, json={field: ["CS100"] * 201, **extra})
    assert response.status_code == 422
    assert any(error["type"] == "too_long" for error in response.json()["detail"])


def test_rejects_overlong_course_identifier():
    response = client.post("/eligibility", json={"completed_course_ids": ["X" * 33]})
    assert response.status_code == 422


def test_accepts_course_list_at_documented_limit():
    response = client.post("/eligibility", json={"completed_course_ids": ["CS100"] * 200})
    assert response.status_code == 200


def test_normal_request_still_works_after_rejection():
    client.post("/eligibility", json={"completed_course_ids": ["CS100"] * 201})
    response = client.post("/eligibility", json={"completed_course_ids": ["CS100"]})
    assert response.status_code == 200
    assert any(item["course_id"] == "CS101" and item["eligible"] for item in response.json())


@pytest.mark.parametrize("origin,allowed", [
    ("http://127.0.0.1:5173", True),
    ("https://untrusted.example", False),
])
def test_cors_preflight(origin, allowed):
    response = client.options("/roadmap", headers={
        "Origin": origin,
        "Access-Control-Request-Method": "POST",
        "Access-Control-Request-Headers": "content-type",
    })
    assert response.status_code == (200 if allowed else 400)
    assert response.headers.get("access-control-allow-origin") == (origin if allowed else None)
