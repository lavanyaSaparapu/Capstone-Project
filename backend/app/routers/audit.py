from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models import AuditLog, User
from app.schemas import AuditLogResponse
from app.auth import RoleChecker

router = APIRouter(prefix="/audit", tags=["System Auditing"])

# Admin Only Dependency
is_admin = RoleChecker(["Admin"])

@router.get("", response_model=List[AuditLogResponse])
def get_audit_logs(
    action: Optional[str] = Query(None),
    resource_type: Optional[str] = Query(None),
    email: Optional[str] = Query(None),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    current_user: User = Depends(is_admin),
    db: Session = Depends(get_db)
):
    query = db.query(AuditLog)
    
    if action:
        query = query.filter(AuditLog.action == action)
    if resource_type:
        query = query.filter(AuditLog.resource_type == resource_type)
    if email:
        query = query.filter(AuditLog.email.contains(email))
        
    # Order by newest first
    logs = query.order_by(AuditLog.created_at.desc()).offset(offset).limit(limit).all()
    return logs
