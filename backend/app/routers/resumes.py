from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, BackgroundTasks, Request
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models import Resume, User, AuditLog, Job
from app.schemas import ResumeResponse, CoverLetterRequest, InterviewPrepRequest, AIResponseSuggestions
from app.auth import get_current_user, RoleChecker
from app.config import settings
from app.nlp_parser import extract_text_from_pdf, extract_text_from_docx, extract_skills
from app.background_tasks import process_resume_and_match
from app.ai_generator import generate_cover_letter, generate_interview_questions, generate_resume_suggestions
from app.vector_search import compute_cosine_similarity, score_candidate
import os
import secrets

router = APIRouter(prefix="/resumes", tags=["Resumes & AI Assistant"])

is_recruiter_or_admin = RoleChecker(["Recruiter", "Admin"])

def sanitize_filename(filename: str) -> str:
    """Sanitizes file name to prevent path traversal attacks."""
    base = os.path.basename(filename)
    name, ext = os.path.splitext(base)
    # Remove special chars from name
    clean_name = "".join(c for c in name if c.isalnum() or c in ("-", "_")).strip()
    clean_ext = "".join(c for c in ext if c.isalnum() or c == ".").strip().lower()
    # Random suffix to avoid overlap
    return f"{clean_name}_{secrets.token_hex(4)}{clean_ext}"

@router.post("/upload", response_model=ResumeResponse)
async def upload_resume(
    request: Request,
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Security check: File size
    contents = await file.read()
    if len(contents) > settings.MAX_FILE_SIZE_BYTES:
        raise HTTPException(status_code=400, detail="File size exceeds the 5MB limit.")

    # Security check: Extension
    filename = file.filename or "resume.pdf"
    ext = filename.split(".")[-1].lower()
    if ext not in settings.ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail=f"Unsupported file format. Allowed formats: {settings.ALLOWED_EXTENSIONS}")

    # Security check: Verify magic bytes (headers)
    if ext == "pdf":
        if not contents.startswith(b"%PDF"):
            raise HTTPException(status_code=400, detail="Invalid PDF file headers.")
        text_content = extract_text_from_pdf(contents)
    elif ext == "docx":
        if not contents.startswith(b"PK\x03\x04"):
            raise HTTPException(status_code=400, detail="Invalid DOCX file headers.")
        text_content = extract_text_from_docx(contents)
    else:
        raise HTTPException(status_code=400, detail="Unsupported format.")

    if not text_content.strip():
        raise HTTPException(status_code=400, detail="Could not extract text content from the uploaded file.")

    # Sanitize and write file to local disk
    clean_name = sanitize_filename(filename)
    file_path = os.path.join(settings.UPLOAD_DIR, clean_name)
    with open(file_path, "wb") as f:
        f.write(contents)

    # Insert Resume in DB
    resume = Resume(
        candidate_id=current_user.id,
        filename=filename,
        file_path=file_path,
        parsed_data={"name": current_user.full_name, "raw_text": text_content[:1000]},  # Initial placeholder
        score=0.0
    )
    db.add(resume)
    db.commit()
    db.refresh(resume)

    # Audit log
    ip = request.client.host if request.client else "127.0.0.1"
    audit = AuditLog(
        user_id=current_user.id,
        email=current_user.email,
        action="UPLOAD_RESUME",
        resource_type="resume",
        resource_id=resume.id,
        action_metadata={"filename": filename, "file_path": file_path},
        ip_address=ip
    )
    db.add(audit)
    db.commit()

    # Offload processing to FastAPI BackgroundTasks
    background_tasks.add_task(process_resume_and_match, resume.id, contents, text_content)

    return resume

@router.get("", response_model=List[ResumeResponse])
def get_resumes(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Recruiters/Admins see all; Candidates see only theirs
    if current_user.role in ["Recruiter", "Admin"]:
        return db.query(Resume).all()
    return db.query(Resume).filter(Resume.candidate_id == current_user.id).all()

@router.delete("/{resume_id}", status_code=204)
def delete_resume(resume_id: int, request: Request, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    query = db.query(Resume).filter(Resume.id == resume_id)
    if current_user.role not in ["Recruiter", "Admin"]:
        query = query.filter(Resume.candidate_id == current_user.id)
    resume = query.first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")

    # Delete physical file
    if os.path.exists(resume.file_path):
        try:
            os.remove(resume.file_path)
        except Exception:
            pass

    db.delete(resume)
    db.commit()

    # Audit log
    ip = request.client.host if request.client else "127.0.0.1"
    audit = AuditLog(
        user_id=current_user.id,
        email=current_user.email,
        action="DELETE_RESUME",
        resource_type="resume",
        resource_id=resume_id,
        action_metadata={"filename": resume.filename},
        ip_address=ip
    )
    db.add(audit)
    db.commit()

    return None

@router.post("/compare")
def compare_resumes(resume_id_1: int, resume_id_2: int, current_user: User = Depends(is_recruiter_or_admin), db: Session = Depends(get_db)):
    r1 = db.query(Resume).filter(Resume.id == resume_id_1).first()
    r2 = db.query(Resume).filter(Resume.id == resume_id_2).first()
    
    if not r1 or not r2:
        raise HTTPException(status_code=404, detail="One or both resumes not found")

    if not r1.vector_embedding or not r2.vector_embedding:
        raise HTTPException(status_code=400, detail="One or both resumes have not finished processing embeddings yet.")

    # Calculate L2-normalized cosine similarity
    similarity = compute_cosine_similarity(r1.vector_embedding, r2.vector_embedding)
    
    skills1 = set(r1.parsed_data.get("skills", []) if r1.parsed_data else [])
    skills2 = set(r2.parsed_data.get("skills", []) if r2.parsed_data else [])
    
    common_skills = list(skills1.intersection(skills2))
    diff_r1 = list(skills1.difference(skills2))
    diff_r2 = list(skills2.difference(skills1))

    return {
        "semantic_similarity_percentage": round(similarity * 100, 2),
        "candidate_1": {
            "name": r1.parsed_data.get("name", "Candidate 1") if r1.parsed_data else "Candidate 1",
            "skills_count": len(skills1),
            "unique_skills": diff_r1,
            "quality_score": r1.score
        },
        "candidate_2": {
            "name": r2.parsed_data.get("name", "Candidate 2") if r2.parsed_data else "Candidate 2",
            "skills_count": len(skills2),
            "unique_skills": diff_r2,
            "quality_score": r2.score
        },
        "overlapping_skills": common_skills
    }

# AI assistant routes
@router.post("/generate-cover-letter")
def build_cover_letter(req: CoverLetterRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    resume = db.query(Resume).filter(Resume.id == req.resume_id).first()
    job = db.query(Job).filter(Job.id == req.job_id).first()
    
    if not resume or not job:
        raise HTTPException(status_code=404, detail="Resume or Job not found")
        
    if current_user.role not in ["Recruiter", "Admin"] and resume.candidate_id != current_user.id:
        raise HTTPException(status_code=403, detail="Unauthorized access to resume")

    name = resume.parsed_data.get("name", current_user.full_name) if resume.parsed_data else current_user.full_name
    skills = resume.parsed_data.get("skills", []) if resume.parsed_data else []
    
    letter = generate_cover_letter(name, skills, job.title, "your organization")
    return {"cover_letter": letter}

@router.post("/generate-interview-prep")
def build_interview_prep(req: InterviewPrepRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    resume = db.query(Resume).filter(Resume.id == req.resume_id).first()
    job = db.query(Job).filter(Job.id == req.job_id).first()
    
    if not resume or not job:
        raise HTTPException(status_code=404, detail="Resume or Job not found")

    if current_user.role not in ["Recruiter", "Admin"] and resume.candidate_id != current_user.id:
        raise HTTPException(status_code=403, detail="Unauthorized access to resume")

    name = resume.parsed_data.get("name", current_user.full_name) if resume.parsed_data else current_user.full_name
    skills = resume.parsed_data.get("skills", []) if resume.parsed_data else []
    
    questions = generate_interview_questions(name, skills, job.title, job.description)
    return {"questions": questions}

@router.post("/optimize-suggestions", response_model=AIResponseSuggestions)
def build_resume_suggestions(resume_id: int, job_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    resume = db.query(Resume).filter(Resume.id == resume_id).first()
    job = db.query(Job).filter(Job.id == job_id).first()
    
    if not resume or not job:
        raise HTTPException(status_code=404, detail="Resume or Job not found")

    if current_user.role not in ["Recruiter", "Admin"] and resume.candidate_id != current_user.id:
        raise HTTPException(status_code=403, detail="Unauthorized access to resume")

    resume_text = resume.parsed_data.get("raw_text", "") if resume.parsed_data else ""
    skills = set(resume.parsed_data.get("skills", []) if resume.parsed_data else [])
    
    # Extract job skills
    job_skills = set(extract_skills(f"{job.title} {job.description} {job.requirements}"))
    missing_skills = list(job_skills.difference(skills))
    
    result = generate_resume_suggestions(resume_text, job.title, job.description, missing_skills)
    
    # Map back structure
    return {
        "ats_score": resume.score,
        "grammar_score": resume.parsed_data.get("grammar_score", 90.0) if resume.parsed_data else 90.0,
        "keyword_density": resume.parsed_data.get("keyword_density", {}) if resume.parsed_data else {},
        "missing_skills": missing_skills,
        "suggestions": result.get("suggestions", [])
    }
