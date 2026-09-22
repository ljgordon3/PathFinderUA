from typing import List

from fastapi import APIRouter, Depends, HTTPException

from app.data_loader import DataStore, load_data_store
from app.schemas import Career

router = APIRouter(prefix="/careers", tags=["careers"])


@router.get("", response_model=List[Career])
def list_careers(store: DataStore = Depends(load_data_store)):
    """US-11: view career responsibilities, skills, salary, and outlook."""
    return list(store.careers.values())


@router.get("/{career_id}", response_model=Career)
def get_career(career_id: str, store: DataStore = Depends(load_data_store)):
    if career_id not in store.careers:
        raise HTTPException(status_code=404, detail=f"Unknown career '{career_id}'")
    return store.careers[career_id]
