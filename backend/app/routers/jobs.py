from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks, Request
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import Job, Application, Resume, User, AuditLog, Interview
from app.schemas import JobCreate, JobUpdate, JobResponse, ApplicationResponse, ApplicationUpdate, InterviewCreate, InterviewResponse
from app.auth import get_current_user, RoleChecker
from app.background_tasks import process_resume_and_match
from app.websockets import manager
from app.vector_search import score_candidate
import datetime

router = APIRouter(tags=["Jobs & Applications"])

# Route checkers
is_recruiter_or_admin = RoleChecker(["Recruiter", "Admin"])
is_admin = RoleChecker(["Admin"])

@router.post("/jobs", response_model=JobResponse, status_code=status.HTTP_201_CREATED)
def create_job(job_in: JobCreate, request: Request, current_user: User = Depends(is_recruiter_or_admin), db: Session = Depends(get_db)):
    db_job = Job(
        title=job_in.title,
        department=job_in.department,
        description=job_in.description,
        requirements=job_in.requirements,
        status=job_in.status,
        recruiter_id=current_user.id
    )
    db.add(db_job)
    db.commit()
    db.refresh(db_job)
    
    # Audit log
    ip = request.client.host if request.client else "127.0.0.1"
    audit = AuditLog(
        user_id=current_user.id,
        email=current_user.email,
        action="CREATE_JOB",
        resource_type="job",
        resource_id=db_job.id,
        action_metadata={"title": db_job.title},
        ip_address=ip
    )
    db.add(audit)
    db.commit()
    
    return db_job

@router.get("/jobs", response_model=List[JobResponse])
def list_jobs(db: Session = Depends(get_db)):
    return db.query(Job).filter(Job.status != "Archived").all()

@router.get("/jobs/{job_id}", response_model=JobResponse)
def get_job(job_id: int, db: Session = Depends(get_db)):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job

@router.put("/jobs/{job_id}", response_model=JobResponse)
def update_job(job_id: int, job_in: JobUpdate, request: Request, current_user: User = Depends(is_recruiter_or_admin), db: Session = Depends(get_db)):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    for field, value in job_in.dict(exclude_unset=True).items():
        setattr(job, field, value)
    
    db.commit()
    db.refresh(job)
    
    # Audit log
    ip = request.client.host if request.client else "127.0.0.1"
    audit = AuditLog(
        user_id=current_user.id,
        email=current_user.email,
        action="UPDATE_JOB",
        resource_type="job",
        resource_id=job.id,
        action_metadata=job_in.dict(exclude_unset=True),
        ip_address=ip
    )
    db.add(audit)
    db.commit()
    
    return job

@router.delete("/jobs/{job_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_job(job_id: int, request: Request, current_user: User = Depends(is_admin), db: Session = Depends(get_db)):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    # Soft delete: archive
    job.status = "Archived"
    db.commit()
    
    # Audit log
    ip = request.client.host if request.client else "127.0.0.1"
    audit = AuditLog(
        user_id=current_user.id,
        email=current_user.email,
        action="ARCHIVE_JOB",
        resource_type="job",
        resource_id=job.id,
        action_metadata={"title": job.title},
        ip_address=ip
    )
    db.add(audit)
    db.commit()
    
    return None

@router.post("/jobs/{job_id}/apply", response_model=ApplicationResponse)
def apply_to_job(job_id: int, resume_id: int, request: Request, background_tasks: BackgroundTasks, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
        
    resume = db.query(Resume).filter(Resume.id == resume_id, Resume.candidate_id == current_user.id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found or does not belong to you")
        
    # Check duplicate application
    dup = db.query(Application).filter(Application.job_id == job_id, Application.candidate_id == current_user.id).first()
    if dup:
        raise HTTPException(status_code=400, detail="You have already applied for this job.")
        
    app = Application(
        job_id=job_id,
        candidate_id=current_user.id,
        resume_id=resume_id,
        status="Applied",
        score=0.0
    )
    db.add(app)
    db.commit()
    db.refresh(app)
    
    # Audit Log
    ip = request.client.host if request.client else "127.0.0.1"
    audit = AuditLog(
        user_id=current_user.id,
        email=current_user.email,
        action="APPLY_JOB",
        resource_type="application",
        resource_id=app.id,
        action_metadata={"job_title": job.title, "resume_name": resume.filename},
        ip_address=ip
    )
    db.add(audit)
    db.commit()
    
    # Parse text and match in background
    raw_text = resume.parsed_data.get("raw_text", "") if resume.parsed_data else ""
    if raw_text:
        background_tasks.add_task(process_resume_and_match, resume.id, b"", raw_text)
    
    # Notify recruiter about new applicant
    async def notify():
        await manager.broadcast({
            "type": "NEW_APPLICANT",
            "job_title": job.title,
            "candidate_name": current_user.full_name,
            "message": f"New application received for {job.title} from {current_user.full_name}!"
        })
    background_tasks.add_task(notify)
        
    return app

@router.get("/jobs/{job_id}/applicants")
def list_job_applicants(job_id: int, current_user: User = Depends(is_recruiter_or_admin), db: Session = Depends(get_db)):
    apps = db.query(Application).filter(Application.job_id == job_id).all()
    results = []
    for app in apps:
        candidate = db.query(User).filter(User.id == app.candidate_id).first()
        resume = db.query(Resume).filter(Resume.id == app.resume_id).first()
        results.append({
            "application_id": app.id,
            "status": app.status,
            "score": app.score,
            "created_at": app.created_at,
            "candidate": {
                "id": candidate.id,
                "full_name": candidate.full_name,
                "email": candidate.email
            },
            "resume": {
                "id": resume.id,
                "filename": resume.filename,
                "parsed_data": resume.parsed_data
            }
        })
    # Sort by ATS Match Score descending
    results.sort(key=lambda x: x["score"], reverse=True)
    return results

@router.put("/applications/{application_id}/stage", response_model=ApplicationResponse)
def change_application_stage(application_id: int, update_in: ApplicationUpdate, request: Request, background_tasks: BackgroundTasks, current_user: User = Depends(is_recruiter_or_admin), db: Session = Depends(get_db)):
    app = db.query(Application).filter(Application.id == application_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
        
    old_status = app.status
    app.status = update_in.status
    if update_in.notes:
        app.notes = update_in.notes
        
    db.commit()
    db.refresh(app)
    
    # Audit log
    ip = request.client.host if request.client else "127.0.0.1"
    audit = AuditLog(
        user_id=current_user.id,
        email=current_user.email,
        action="CHANGE_APPLICATION_STAGE",
        resource_type="application",
        resource_id=app.id,
        action_metadata={"old_status": old_status, "new_status": app.status, "notes": update_in.notes},
        ip_address=ip
    )
    db.add(audit)
    db.commit()
    
    # Send WebSocket alert to Candidate
    async def notify():
        job = db.query(Job).filter(Job.id == app.job_id).first()
        await manager.send_personal_message({
            "type": "APPLICATION_STAGE_CHANGED",
            "application_id": app.id,
            "job_title": job.title if job else "Job",
            "new_status": app.status,
            "message": f"Your application status for '{job.title if job else 'Job'}' has been updated to {app.status}!"
        }, app.candidate_id)
    background_tasks.add_task(notify)
    
    return app

@router.post("/applications/{application_id}/interviews", response_model=InterviewResponse)
def schedule_interview(application_id: int, interview_in: InterviewCreate, request: Request, background_tasks: BackgroundTasks, current_user: User = Depends(is_recruiter_or_admin), db: Session = Depends(get_db)):
    app = db.query(Application).filter(Application.id == application_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
        
    db_interview = Interview(
        application_id=application_id,
        scheduled_at=interview_in.scheduled_at,
        status=interview_in.status,
        type=interview_in.type,
        notes=interview_in.notes
    )
    db.add(db_interview)
    # Automatically move application stage to Interview
    app.status = "Interview"
    db.commit()
    db.refresh(db_interview)
    
    # Audit log
    ip = request.client.host if request.client else "127.0.0.1"
    audit = AuditLog(
        user_id=current_user.id,
        email=current_user.email,
        action="SCHEDULE_INTERVIEW",
        resource_type="interview",
        resource_id=db_interview.id,
        action_metadata={"scheduled_at": str(db_interview.scheduled_at), "type": db_interview.type},
        ip_address=ip
    )
    db.add(audit)
    db.commit()
    
    # Send WebSocket notification to candidate
    async def notify():
        job = db.query(Job).filter(Job.id == app.job_id).first()
        await manager.send_personal_message({
            "type": "INTERVIEW_SCHEDULED",
            "application_id": app.id,
            "job_title": job.title if job else "Job",
            "scheduled_at": str(db_interview.scheduled_at),
            "interview_type": db_interview.type,
            "message": f"Great news! A {db_interview.type} Interview has been scheduled for your application to '{job.title if job else 'Job'}' on {db_interview.scheduled_at}."
        }, app.candidate_id)
    background_tasks.add_task(notify)
    
    return db_interview

@router.get("/jobs/applications/me")
def get_my_applications(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    apps = db.query(Application).filter(Application.candidate_id == current_user.id).all()
    results = []
    for app in apps:
        job = db.query(Job).filter(Job.id == app.job_id).first()
        if job:
            results.append({
                "job_title": job.title,
                "company": job.department,
                "stage": app.status,
                "date": app.created_at.strftime("%B %d, %Y") if app.created_at else "Recent",
                "score": round(app.score, 1)
            })
    return results
