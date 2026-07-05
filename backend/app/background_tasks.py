import os
import time
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models import Resume, Application, Job, AuditLog, User
from app.nlp_parser import parse_resume_content
from app.vector_search import score_candidate, compute_embedding
from app.websockets import manager
import asyncio

# Helper to run async functions from synchronous background threads
def run_async(coro):
    try:
        loop = asyncio.get_event_loop()
    except RuntimeError:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
    if loop.is_running():
        # If the event loop is already running (e.g. FastAPI uvicorn), run in current loop
        asyncio.run_coroutine_threadsafe(coro, loop)
    else:
        loop.run_until_complete(coro)

def process_resume_and_match(resume_id: int, file_bytes: bytes, text_content: str):
    """
    Background worker task to:
    1. Parse resume text content into structural JSON (NLP Parsing).
    2. Compute L2 normalized vector embeddings.
    3. Audit log the transaction.
    4. Auto-update matches for active job applications associated with this candidate.
    5. Send WebSocket notifications to candidate/recruiters.
    """
    db = SessionLocal()
    try:
        resume = db.query(Resume).filter(Resume.id == resume_id).first()
        if not resume:
            print(f"Resume {resume_id} not found in background processor.")
            return

        print(f"Background processing started for Resume ID: {resume_id} ({resume.filename})")

        # Step 1: Execute NLP text parsing
        parsed = parse_resume_content(text_content, resume.filename)
        resume.parsed_data = parsed
        
        # Step 2: Compute L2-normalized Vector Embedding
        resume_emb = compute_embedding(text_content)
        resume.vector_embedding = resume_emb
        resume.score = parsed.get("resume_quality_score", 65.0)
        
        # Save parsed details
        db.commit()

        # Create audit log
        candidate = db.query(User).filter(User.id == resume.candidate_id).first()
        audit = AuditLog(
            user_id=resume.candidate_id,
            email=candidate.email if candidate else "system",
            action="PROCESS_RESUME",
            resource_type="resume",
            resource_id=resume.id,
            action_metadata={"filename": resume.filename, "score": resume.score},
            ip_address="127.0.0.1"
        )
        db.add(audit)
        db.commit()

        # Step 3: Trigger real-time WebSocket notification to candidate
        run_async(manager.send_personal_message(
            {
                "type": "RESUME_PROCESSED",
                "resume_id": resume.id,
                "filename": resume.filename,
                "score": resume.score,
                "message": f"Resume '{resume.filename}' processed successfully. Score: {resume.score}%"
            },
            resume.candidate_id
        ))

        # Step 4: Scan and re-rank job applications associated with this candidate
        applications = db.query(Application).filter(Application.resume_id == resume.id).all()
        for app in applications:
            job = db.query(Job).filter(Job.id == app.job_id).first()
            if job:
                # Compute semantic matching score
                match_score = score_candidate(text_content, job.description, job.requirements)
                app.score = match_score
                db.commit()

                # Audit match scoring update
                match_audit = AuditLog(
                    user_id=None,
                    email="system-ai",
                    action="CALCULATE_ATS_MATCH",
                    resource_type="application",
                    resource_id=app.id,
                    action_metadata={"job_id": job.id, "resume_id": resume.id, "match_score": match_score},
                    ip_address="127.0.0.1"
                )
                db.add(match_audit)
                db.commit()

                # Notify recruiters of new applicant score
                run_async(manager.broadcast({
                    "type": "NEW_APPLICATION_SCORED",
                    "application_id": app.id,
                    "job_id": job.id,
                    "candidate_id": app.candidate_id,
                    "score": match_score,
                    "message": f"Candidate {parsed.get('name', 'Applicant')} parsed. ATS Score: {match_score}% for Job: {job.title}"
                }))

        print(f"Background processing finished for Resume ID: {resume_id}")

    except Exception as e:
        db.rollback()
        print(f"Error in background task for resume {resume_id}: {e}")
    finally:
        db.close()
