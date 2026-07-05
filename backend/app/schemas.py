import datetime
from pydantic import BaseModel, EmailStr, Field, validator
from typing import List, Optional, Dict, Any

# Auth Schemas
class UserBase(BaseModel):
    email: EmailStr
    full_name: str

class UserCreate(UserBase):
    password: str = Field(..., min_length=6)
    role: str = "Candidate"  # Admin, Recruiter, Candidate

    @validator('role')
    def validate_role(cls, v):
        allowed = ["Admin", "Recruiter", "Candidate"]
        if v not in allowed:
            raise ValueError(f"Role must be one of {allowed}")
        return v

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(UserBase):
    id: int
    role: str
    created_at: datetime.datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

class TokenData(BaseModel):
    email: Optional[str] = None
    role: Optional[str] = None
    user_id: Optional[int] = None


# Job Schemas
class JobBase(BaseModel):
    title: str
    department: str
    description: str
    requirements: str  # Comma separated skills or free text
    status: str = "Open"  # Open, Closed, Draft, Archived

    @validator('status')
    def validate_status(cls, v):
        allowed = ["Open", "Closed", "Draft", "Archived"]
        if v not in allowed:
            raise ValueError(f"Status must be one of {allowed}")
        return v

class JobCreate(JobBase):
    pass

class JobUpdate(BaseModel):
    title: Optional[str] = None
    department: Optional[str] = None
    description: Optional[str] = None
    requirements: Optional[str] = None
    status: Optional[str] = None

class JobResponse(JobBase):
    id: int
    recruiter_id: int
    created_at: datetime.datetime

    class Config:
        from_attributes = True


# Resume Schemas
class ResumeBase(BaseModel):
    filename: str

class ResumeResponse(ResumeBase):
    id: int
    candidate_id: int
    file_path: str
    parsed_data: Optional[Dict[str, Any]] = None
    score: float
    created_at: datetime.datetime

    class Config:
        from_attributes = True


# Application Schemas
class ApplicationBase(BaseModel):
    job_id: int
    resume_id: int

class ApplicationCreate(ApplicationBase):
    pass

class ApplicationUpdate(BaseModel):
    status: str
    notes: Optional[str] = None

    @validator('status')
    def validate_status(cls, v):
        allowed = ["Applied", "Screening", "Interview", "Offered", "Rejected"]
        if v not in allowed:
            raise ValueError(f"Status must be one of {allowed}")
        return v

class ApplicationResponse(BaseModel):
    id: int
    job_id: int
    candidate_id: int
    resume_id: int
    status: str
    score: float
    notes: Optional[str] = None
    created_at: datetime.datetime

    class Config:
        from_attributes = True

class ApplicationDetailsResponse(ApplicationResponse):
    job: JobResponse
    candidate: UserResponse
    resume: ResumeResponse

    class Config:
        from_attributes = True


# Interview Schemas
class InterviewBase(BaseModel):
    application_id: int
    scheduled_at: datetime.datetime
    status: str = "Scheduled"  # Scheduled, Completed, Cancelled
    type: str = "Technical"  # Technical, HR, Managerial
    notes: Optional[str] = None

    @validator('status')
    def validate_status(cls, v):
        allowed = ["Scheduled", "Completed", "Cancelled"]
        if v not in allowed:
            raise ValueError(f"Status must be one of {allowed}")
        return v

class InterviewCreate(InterviewBase):
    pass

class InterviewResponse(InterviewBase):
    id: int

    class Config:
        from_attributes = True


# Audit Log Schemas
class AuditLogResponse(BaseModel):
    id: int
    user_id: Optional[int] = None
    email: Optional[str] = None
    action: str
    resource_type: str
    resource_id: Optional[int] = None
    action_metadata: Optional[Dict[str, Any]] = None
    ip_address: Optional[str] = None
    created_at: datetime.datetime

    class Config:
        from_attributes = True


# Helper Schemas for NLP / AI Scoring
class MatchingRecommendation(BaseModel):
    rank: int
    score: float
    matched_skills: List[str]
    missing_skills: List[str]
    experience_match: float
    recommendation: str
    confidence_score: float

class AIResponseSuggestions(BaseModel):
    ats_score: float
    grammar_score: float
    keyword_density: Dict[str, float]
    missing_skills: List[str]
    suggestions: List[str]

class CoverLetterRequest(BaseModel):
    job_id: int
    resume_id: int

class InterviewPrepRequest(BaseModel):
    job_id: int
    resume_id: int
