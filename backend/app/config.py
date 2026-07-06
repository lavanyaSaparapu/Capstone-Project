import os
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List

class Settings(BaseSettings):
    PROJECT_NAME: str = "NextGen ATS"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = "supersecretkeychangeinproduction1234567890"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours
    
    # Database
    DATABASE_URL: str = "sqlite:///./nextgen_ats.db"  # Fallback to SQLite locally
    
    # Security
    ALLOWED_ORIGINS: List[str] = ["http://localhost:5173", "http://127.0.0.1:5173"]
    
    @field_validator("ALLOWED_ORIGINS", mode="before")
    @classmethod
    def parse_allowed_origins(cls, v):
        if isinstance(v, str):
            import json
            try:
                parsed = json.loads(v)
                if isinstance(parsed, list):
                    return parsed
            except Exception:
                pass
            return [origin.strip() for origin in v.split(",") if origin.strip()]
        return v

    RATE_LIMIT_PER_MINUTE: int = 60
    
    # Uploads
    UPLOAD_DIR: str = "uploads"
    MAX_FILE_SIZE_BYTES: int = 5 * 1024 * 1024  # 5MB
    ALLOWED_EXTENSIONS: List[str] = ["pdf", "docx"]
    
    # AI and Vectors
    EMBEDDING_MODEL_NAME: str = "all-MiniLM-L6-v2"
    SPACY_MODEL: str = "en_core_web_sm"
    
    # Background Tasks Engine ("background_tasks" or "celery")
    TASK_ENGINE: str = "background_tasks"
    
    # Optional API Keys for Live LLM fallback
    OPENAI_API_KEY: str = ""
    GEMINI_API_KEY: str = ""
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()

# Ensure uploads directory exists
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
