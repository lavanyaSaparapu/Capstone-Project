import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default="Candidate", nullable=False)  # Admin, Recruiter, Candidate
    full_name = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    resumes = relationship("Resume", back_populates="candidate", cascade="all, delete-orphan")
    applications = relationship("Application", back_populates="candidate", cascade="all, delete-orphan")
    jobs = relationship("Job", back_populates="recruiter")
    audit_logs = relationship("AuditLog", back_populates="user")


class Job(Base):
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False, index=True)
    department = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    requirements = Column(Text, nullable=False)  # Stored as text / comma-separated
    status = Column(String, default="Open", nullable=False)  # Open, Closed, Draft, Archived
    recruiter_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    recruiter = relationship("User", back_populates="jobs")
    applications = relationship("Application", back_populates="job", cascade="all, delete-orphan")


class Resume(Base):
    __tablename__ = "resumes"

    id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    filename = Column(String, nullable=False)
    file_path = Column(String, nullable=False)
    parsed_data = Column(JSON, nullable=True)  # JSON holding text, name, email, phone, skills, experience, education etc.
    vector_embedding = Column(JSON, nullable=True)  # JSON float array of L2 normalized embeddings
    score = Column(Float, default=0.0)  # Default resume quality score
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    candidate = relationship("User", back_populates="resumes")
    applications = relationship("Application", back_populates="resume", cascade="all, delete-orphan")


class Application(Base):
    __tablename__ = "applications"

    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer, ForeignKey("jobs.id"), nullable=False)
    candidate_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    resume_id = Column(Integer, ForeignKey("resumes.id"), nullable=False)
    status = Column(String, default="Applied", nullable=False)  # Applied, Screening, Interview, Offered, Rejected
    score = Column(Float, default=0.0)  # AI Match Score
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    job = relationship("Job", back_populates="applications")
    candidate = relationship("User", back_populates="applications")
    resume = relationship("Resume", back_populates="applications")
    interviews = relationship("Interview", back_populates="application", cascade="all, delete-orphan")


class Interview(Base):
    __tablename__ = "interviews"

    id = Column(Integer, primary_key=True, index=True)
    application_id = Column(Integer, ForeignKey("applications.id"), nullable=False)
    scheduled_at = Column(DateTime, nullable=False)
    status = Column(String, default="Scheduled", nullable=False)  # Scheduled, Completed, Cancelled
    type = Column(String, default="Technical", nullable=False)  # Technical, HR, Managerial
    notes = Column(Text, nullable=True)

    # Relationships
    application = relationship("Application", back_populates="interviews")


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)  # Can be NULL for public operations
    email = Column(String, nullable=True)
    action = Column(String, nullable=False)  # UPLOAD_RESUME, EDIT_JOB, CHANGE_STAGE, etc.
    resource_type = Column(String, nullable=False)  # resume, job, application, user
    resource_id = Column(Integer, nullable=True)
    action_metadata = Column(JSON, nullable=True)  # Additional details (renamed from metadata)
    ip_address = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="audit_logs")
