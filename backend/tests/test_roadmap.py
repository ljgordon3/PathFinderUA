from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)
TIERS = ("strongly_recommended", "worth_considering", "broaden_skills")


def roadmap(completed=None, career="CAR-ROBOTICS"):
    response = client.post("/roadmap", json={
        "career_id": career, "completed_course_ids": completed or [],
    })
    assert response.status_code == 200
    return response.json()


def remaining(result):
    return {item["course"]["id"]: item for tier in TIERS for item in result[tier]}


def test_three_priority_tiers_are_independent_of_prerequisite_readiness():
    result = roadmap()
    assert set(result) == {"career_id", *TIERS}
    strong = {item["course"]["id"]: item for item in result["strongly_recommended"]}
    assert strong["CS100"]["missing_prerequisites"] == []
    assert set(strong["CS460"]["missing_prerequisites"]) == {"CS338", "CS301", "ECE383"}
    assert "robot" in strong["CS460"]["explanation"]["career_reason"].lower()
    assert "CS435" in {item["course"]["id"] for item in result["worth_considering"]}
    assert "CS340" in {item["course"]["id"] for item in result["broaden_skills"]}
    all_items = [item for tier in TIERS for item in result[tier]]
    assert len({item["course"]["id"] for item in all_items}) == len(all_items)
    assert all(item["priority_reason"] for item in all_items)


def test_completing_prerequisites_updates_readiness_without_demoting_the_course():
    before = roadmap()
    after = roadmap(["CS338", "CS301", "ECE383"])
    before_strong = {item["course"]["id"]: item for item in before["strongly_recommended"]}
    after_strong = {item["course"]["id"]: item for item in after["strongly_recommended"]}
    assert before_strong["CS460"]["missing_prerequisites"]
    assert not after_strong["CS460"]["missing_prerequisites"]
    assert not {"CS338", "CS301", "ECE383"}.intersection(remaining(after))


def test_foundations_for_strong_career_courses_are_prioritized():
    result = roadmap(career="CAR-SWE")
    item = next(item for item in result["strongly_recommended"] if item["course"]["id"] == "CS140")
    assert "prerequisite foundation" in item["priority_reason"]


def test_career_changes_recommendations_and_keeps_results_deterministic():
    software = roadmap(career="CAR-SWE")
    robotics = roadmap()
    assert "CS202" in {item["course"]["id"] for item in software["strongly_recommended"]}
    assert "CS202" not in remaining(robotics)
    assert roadmap() == robotics


def test_completed_courses_are_excluded_from_every_tier():
    all_ids = [course["id"] for course in client.get("/courses").json()]
    result = roadmap(all_ids)
    assert all(result[tier] == [] for tier in TIERS)


def test_unknown_career_and_course_fail_explicitly():
    assert client.post("/roadmap", json={"career_id": "unknown"}).status_code == 404
    assert client.post("/roadmap", json={"career_id": "CAR-SWE", "completed_course_ids": ["CS999"]}).status_code == 422


def test_every_uncompleted_required_course_is_strongly_recommended_for_each_career():
    required = {course["id"] for course in client.get("/courses").json() if course["is_required"]}
    assert required == {"CS100", "CS101", "CS200", "CS201", "CS301", "CS338", "CS403", "CS470", "CS495", "ECE380", "ECE383"}
    for career in ["CAR-SWE", "CAR-DS-AI", "CAR-ROBOTICS"]:
        result = roadmap(["CS100"], career)
        strong = {item["course"]["id"]: item for item in result["strongly_recommended"]}
        assert required - {"CS100"} <= strong.keys()
        assert "CS100" not in remaining(result)
        assert strong["CS495"]["missing_prerequisites"]


def test_eligibility_and_roadmap_show_completed_and_missing_parts_of_the_same_path():
    partial = client.post("/eligibility", json={"completed_course_ids": ["CS201"]}).json()
    status = next(item for item in partial if item["course_id"] == "CS338")
    item = remaining(roadmap(["CS201"], "CAR-SWE"))["CS338"]
    assert status["matched_prerequisites"] == item["matched_prerequisites"] == ["CS201"]
    assert status["missing_prerequisites"] == item["missing_prerequisites"] == ["CS200"]
    unlocked = remaining(roadmap(["CS201", "CS200"], "CAR-SWE"))["CS338"]
    assert unlocked["matched_prerequisites"] == ["CS201", "CS200"]
    assert unlocked["missing_prerequisites"] == []
