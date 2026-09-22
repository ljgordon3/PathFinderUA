from fastapi import APIRouter, Depends, HTTPException

from app.config import MIN_RECOMMENDATION_COUNT, RECOMMENDATION_COUNT
from app.data_loader import DataStore, load_data_store
from app.recommendations import recommend
from app.schemas import RecommendationRequest, RecommendationResponse

router = APIRouter(prefix="/recommendations", tags=["recommendations"])


@router.post("", response_model=RecommendationResponse)
def get_recommendations(request: RecommendationRequest, store: DataStore = Depends(load_data_store)):
    """
    US-06 / US-07 / FR-05 / FR-06: the core PathFinder UA flow. Returns
    three to five ranked, explained course recommendations for the
    student's completed courses, career interest, and credit target.
    """
    try:
        return recommend(request, store, RECOMMENDATION_COUNT, MIN_RECOMMENDATION_COUNT)
    except KeyError:
        raise HTTPException(status_code=404, detail=f"Unknown career '{request.career_id}'")
