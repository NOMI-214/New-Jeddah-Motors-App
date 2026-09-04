from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session
from database import get_db
from auth import verify_password, create_token, get_current_user, add_audit_log, hash_password
import models
import schemas


def _enrich(user: models.User, db: Session) -> models.User:
    row = db.query(func.count(models.Sale.id), func.sum(models.Sale.sale_price)).filter(
        models.Sale.salesperson_id == user.id
    ).first()
    user.cars_sold = row[0] or 0
    user.revenue_generated = float(row[1] or 0)
    return user

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=schemas.UserOut, status_code=201)
def register(body: schemas.UserCreate, db: Session = Depends(get_db)):
    if body.role == "owner":
        raise HTTPException(status_code=400, detail="Cannot self-register as owner")
    existing = db.query(models.User).filter(models.User.email == body.email.lower().strip()).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    user = models.User(
        name=body.name,
        email=body.email.lower().strip(),
        phone=body.phone,
        role=body.role,
        branch=body.branch,
        address=body.address,
        hashed_password=hash_password(body.password),
        status="pending",
        join_date="",
        cars_sold=0,
        revenue_generated=0.0,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return schemas.UserOut.model_validate(user)


@router.post("/login", response_model=schemas.TokenResponse)
def login(body: schemas.LoginRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(
        models.User.email == body.email.lower().strip(),
        models.User.is_deleted == False,
    ).first()

    if not user or not verify_password(body.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    if user.status == "pending":
        raise HTTPException(status_code=403, detail="Your account is pending approval. Please wait for the owner to approve your request.")

    if user.status == "inactive":
        raise HTTPException(status_code=403, detail="Account is deactivated")

    token = create_token(user.id)

    add_audit_log(db, user.id, "logged in", "Auth", f"{user.name} logged in", "auth")
    db.commit()

    return schemas.TokenResponse(
        access_token=token,
        user=schemas.UserOut.model_validate(user),
    )


@router.get("/me", response_model=schemas.UserOut)
def get_me(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    return schemas.UserOut.model_validate(_enrich(current_user, db))


@router.put("/change-password")
def change_password(
    body: schemas.ChangePasswordRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    if not verify_password(body.current_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    if len(body.new_password) < 6:
        raise HTTPException(status_code=400, detail="New password must be at least 6 characters")
    if body.new_password != body.confirm_password:
        raise HTTPException(status_code=400, detail="New passwords do not match")
    current_user.hashed_password = hash_password(body.new_password)
    add_audit_log(db, current_user.id, "updated", "Auth", f"{current_user.name} changed their password", "update")
    db.commit()
    return {"message": "Password changed successfully"}


@router.patch("/users/{user_id}/reset-password")
def reset_user_password(
    user_id: int,
    body: schemas.ResetPasswordRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    if current_user.role not in ("owner", "admin"):
        raise HTTPException(status_code=403, detail="Only owner or admin can reset passwords")
    if len(body.new_password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")
    user = db.query(models.User).filter(models.User.id == user_id, models.User.is_deleted == False).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.hashed_password = hash_password(body.new_password)
    add_audit_log(db, current_user.id, "updated", "Auth",
                  f"Password reset for {user.name} by {current_user.name}", "update")
    db.commit()
    return {"message": f"Password reset for {user.name}"}
