from typing import List

from fastapi import APIRouter, Depends

from app.data_loader import DataStore, load_data_store
from app.prerequisites import evaluate
from app.schemas import EligibilityRequest, EligibilityResult

router = APIRouter(prefix="/eligibility", tags=["eligibility"])


@router.post("", response_model=List[EligibilityResult])
def check_eligibility(request: EligibilityRequest, store: DataStore = Depends(load_data_store)):
    """
    US-05 / FR-04: compares completed courses against prerequisite rules
    for every course in the dataset.
    """
    return [
        evaluate(course, request.completed_course_ids)
        for course in store.courses.values()
    ]
