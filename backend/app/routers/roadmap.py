from fastapi import APIRouter, Depends, HTTPException

from app.data_loader import DataStore, load_data_store
from app.recommendations import build_roadmap
from app.schemas import RoadmapRequest, RoadmapResponse

router = APIRouter(prefix="/roadmap", tags=["roadmap"])


@router.post("", response_model=RoadmapResponse)
def get_roadmap(request: RoadmapRequest, store: DataStore = Depends(load_data_store)):
    try:
        return build_roadmap(request, store)
    except KeyError:
        raise HTTPException(status_code=404, detail=f"Unknown career '{request.career_id}'")
    except ValueError as error:
        raise HTTPException(status_code=422, detail=str(error))
