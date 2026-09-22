from typing import List

from fastapi import APIRouter, Depends, HTTPException

from app.data_loader import DataStore, load_data_store
from app.prerequisites import courses_unlocked_by
from app.schemas import CompareRequest, Course

router = APIRouter(prefix="/courses", tags=["courses"])


@router.get("", response_model=List[Course])
def list_courses(store: DataStore = Depends(load_data_store)):
    return list(store.courses.values())


@router.get("/{course_id}", response_model=Course)
def get_course(course_id: str, store: DataStore = Depends(load_data_store)):
    try:
        return store.course_or_404(course_id)
    except KeyError:
        raise HTTPException(status_code=404, detail=f"Unknown course '{course_id}'")


@router.get("/{course_id}/unlocks", response_model=List[str])
def get_unlocks(course_id: str, store: DataStore = Depends(load_data_store)):
    """US-12: which later courses this course is a prerequisite for."""
    if course_id not in store.courses:
        raise HTTPException(status_code=404, detail=f"Unknown course '{course_id}'")
    return courses_unlocked_by(course_id, store.courses.values())


@router.post("/compare", response_model=List[Course])
def compare_courses(request: CompareRequest, store: DataStore = Depends(load_data_store)):
    """US-10: compare up to three courses side by side."""
    result = []
    for course_id in request.course_ids:
        try:
            result.append(store.course_or_404(course_id))
        except KeyError:
            raise HTTPException(status_code=404, detail=f"Unknown course '{course_id}'")
    return result
