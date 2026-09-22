"""
Pydantic schemas shared by the API routers.

These models are the source of truth for FastAPI's request validation
and the auto-generated OpenAPI docs (see docs/api-contract.md for the
human-readable version of the same contract).
"""
from typing import List, Optional
from pydantic import BaseModel, Field


class Course(BaseModel):
    id: str
    title: str
    description: str
    credit_hours: int
    degree_category: str
    learning_objectives: List[str]
    skill_ids: List[str]
    catalog_year: str
    source: str
    prerequisites: List[List[str]] = Field(default_factory=list)


class Career(BaseModel):
    id: str
    name: str
    description: str
    responsibilities: List[str]
    relevant_skill_ids: List[str]
    typical_education: str
    median_salary_usd: int
    employment_outlook: str
    occupational_code: str
    source: str
    source_url: str
    data_date: str


class EligibilityRequest(BaseModel):
    completed_course_ids: List[str] = Field(default_factory=list)


class EligibilityResult(BaseModel):
    course_id: str
    eligible: bool
    missing_prerequisites: List[str] = Field(
        default_factory=list,
        description="The smallest unmet AND-group of prerequisite course IDs, if any.",
    )


class RecommendationRequest(BaseModel):
    completed_course_ids: List[str] = Field(default_factory=list)
    career_id: str
    target_credit_hours: int = Field(gt=0, le=21)
    workload_preference: str = Field(
        default="balanced", pattern="^(lighter|balanced|demanding)$"
    )


class RecommendationExplanation(BaseModel):
    degree_relevance: str
    unlocks_course_ids: List[str]
    learning_objectives: List[str]
    career_skills: List[str]
    sources: List[str]


class RecommendationItem(BaseModel):
    course: Course
    score: float
    why_eligible: str
    explanation: RecommendationExplanation


class RecommendationResponse(BaseModel):
    career_id: str
    recommendations: List[RecommendationItem]


class CompareRequest(BaseModel):
    course_ids: List[str] = Field(min_length=1, max_length=3)


class ScheduleRequest(BaseModel):
    course_ids: List[str] = Field(default_factory=list)
    target_credit_hours: int = Field(gt=0, le=21)
    career_id: Optional[str] = None


class ScheduleWarning(BaseModel):
    code: str
    message: str


class ScheduleSummary(BaseModel):
    course_ids: List[str]
    total_credit_hours: int
    career_skill_ids_covered: List[str]
    warnings: List[ScheduleWarning]
