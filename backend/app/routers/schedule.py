from fastapi import APIRouter, Depends, HTTPException

from app.data_loader import DataStore, load_data_store
from app.schemas import ScheduleRequest, ScheduleSummary, ScheduleWarning

router = APIRouter(prefix="/schedule", tags=["schedule"])

DEMANDING_COURSE_COUNT_THRESHOLD = 3  # placeholder heuristic until authorized
# workload data is available (see MVP scope: "Historical course information").


@router.post("/summary", response_model=ScheduleSummary)
def summarize_schedule(request: ScheduleRequest, store: DataStore = Depends(load_data_store)):
    """
    US-08 / FR-07: calculates total credit hours and career-skill coverage
    for a proposed schedule, and warns when it exceeds the student's target.
    """
    courses = []
    for course_id in request.course_ids:
        try:
            courses.append(store.course_or_404(course_id))
        except KeyError:
            raise HTTPException(status_code=404, detail=f"Unknown course '{course_id}'")

    total_credits = sum(c.credit_hours for c in courses)

    covered_skills = set()
    if request.career_id:
        if request.career_id not in store.careers:
            raise HTTPException(status_code=404, detail=f"Unknown career '{request.career_id}'")
        relevant_skills = set(store.careers[request.career_id].relevant_skill_ids)
        for c in courses:
            covered_skills |= set(c.skill_ids) & relevant_skills

    warnings = []
    if total_credits > request.target_credit_hours:
        warnings.append(
            ScheduleWarning(
                code="OVER_CREDIT_TARGET",
                message=(
                    f"Proposed schedule totals {total_credits} credit hours, "
                    f"which exceeds your target of {request.target_credit_hours}."
                ),
            )
        )
    if len(courses) >= DEMANDING_COURSE_COUNT_THRESHOLD:
        warnings.append(
            ScheduleWarning(
                code="MANY_COURSES",
                message=(
                    f"This schedule includes {len(courses)} courses. Consider "
                    "reviewing workload balance with your advisor."
                ),
            )
        )

    return ScheduleSummary(
        course_ids=[c.id for c in courses],
        total_credit_hours=total_credits,
        career_skill_ids_covered=sorted(covered_skills),
        warnings=warnings,
    )
