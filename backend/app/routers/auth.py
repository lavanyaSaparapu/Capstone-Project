from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordRequestForm
from app.database import get_db
from app.models import User, AuditLog
from app.schemas import UserCreate, UserResponse, Token, UserLogin
from app.auth import get_password_hash, verify_password, create_access_token, get_current_user
import datetime

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    # Check if user exists
    email_lower = user_in.email.lower().strip()
    db_user = db.query(User).filter(User.email == email_lower).first()
    if db_user:
        raise HTTPException(
            status_code=400,
            detail="A user with this email is already registered."
        )
    
    # Hash password
    hashed_pwd = get_password_hash(user_in.password)
    db_user = User(
        email=email_lower,
        hashed_password=hashed_pwd,
        role=user_in.role,
        full_name=user_in.full_name
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    # Audit log
    audit = AuditLog(
        user_id=db_user.id,
        email=db_user.email,
        action="REGISTER_USER",
        resource_type="user",
        resource_id=db_user.id,
        action_metadata={"role": db_user.role},
        ip_address="127.0.0.1"
    )
    db.add(audit)
    db.commit()
    
    return db_user

@router.post("/login", response_model=Token)
def login(request: Request, form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    email_lower = form_data.username.lower().strip()
    user = db.query(User).filter(User.email == email_lower).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create Access Token
    access_token = create_access_token(data={"sub": user.email, "role": user.role})
    
    # Audit log
    ip = request.client.host if request.client else "127.0.0.1"
    audit = AuditLog(
        user_id=user.id,
        email=user.email,
        action="LOGIN_USER",
        resource_type="user",
        resource_id=user.id,
        action_metadata={},
        ip_address=ip
    )
    db.add(audit)
    db.commit()
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }

@router.post("/otp/send")
def send_otp(email: str):
    # Simulated OTP sending endpoint (for verification demonstration)
    print(f"Simulating sending verification OTP to email: {email}")
    return {"status": "success", "message": "Verification code sent successfully (simulated)."}

@router.post("/otp/verify")
def verify_otp(email: str, code: str):
    # Mock OTP verification
    if code == "123456" or len(code) == 6:
        return {"status": "success", "message": "Email verified successfully."}
    raise HTTPException(status_code=400, detail="Invalid verification code.")

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user
