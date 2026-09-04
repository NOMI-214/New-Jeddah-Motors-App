from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func
from sqlalchemy.orm import Session
from typing import Optional
from database import get_db
from auth import get_current_user, add_audit_log, hash_password, require_roles
import models
import schemas


def _enrich_user(user: models.User, db: Session) -> models.User:
    """Overwrite stored counters with live sales-table values."""
    row = db.query(
        func.count(models.Sale.id),
        func.sum(models.Sale.sale_price),
    ).filter(models.Sale.salesperson_id == user.id).first()
    user.cars_sold = row[0] or 0
    user.revenue_generated = float(row[1] or 0)
    return user

router = APIRouter(prefix="/users", tags=["users"])


@router.get("", response_model=list[schemas.UserOut])
def list_users(
    role: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    branch: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    query = db.query(models.User).filter(models.User.is_deleted == False)
    if role:
        query = query.filter(models.User.role == role)
    if status:
        query = query.filter(models.User.status == status)
    if branch:
        query = query.filter(models.User.branch == branch)
    users = query.order_by(models.User.created_at.desc()).all()
    return [_enrich_user(u, db) for u in users]


@router.get("/{user_id}", response_model=schemas.UserOut)
def get_user(user_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    user = db.query(models.User).filter(models.User.id == user_id, models.User.is_deleted == False).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return schemas.UserOut.model_validate(_enrich_user(user, db))


@router.post("", response_model=schemas.UserOut, status_code=201)
def create_user(
    body: schemas.UserCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_roles("owner", "admin")),
):
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
        status="active",
    )
    db.add(user)
    db.flush()
    add_audit_log(db, current_user.id, "created", "Users", f"New user created: {user.name} ({user.role})", "create")
    db.commit()
    db.refresh(user)
    return schemas.UserOut.model_validate(user)


@router.put("/{user_id}", response_model=schemas.UserOut)
def update_user(
    user_id: int,
    body: schemas.UserUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    # Allow self-update or owner/admin
    if current_user.id != user_id and current_user.role not in ("owner", "admin"):
        raise HTTPException(status_code=403, detail="Not authorized")
    user = db.query(models.User).filter(models.User.id == user_id, models.User.is_deleted == False).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    for field, value in body.model_dump(exclude_none=True).items():
        if field == "password":
            user.hashed_password = hash_password(value)
        else:
            setattr(user, field, value)
    add_audit_log(db, current_user.id, "updated", "Users", f"User updated: {user.name}", "update")
    db.commit()
    db.refresh(user)
    return schemas.UserOut.model_validate(user)


@router.patch("/{user_id}/status", response_model=schemas.UserOut)
def toggle_user_status(
    user_id: int,
    body: schemas.UserStatusUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_roles("owner", "admin")),
):
    user = db.query(models.User).filter(models.User.id == user_id, models.User.is_deleted == False).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot deactivate yourself")
    user.status = body.status
    action = "activated" if body.status == "active" else "deactivated"
    add_audit_log(db, current_user.id, action, "Users", f"User {action}: {user.name}", "update")
    db.commit()
    db.refresh(user)
    return schemas.UserOut.model_validate(user)


@router.delete("/{user_id}", status_code=204)
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_roles("owner", "admin")),
):
    user = db.query(models.User).filter(models.User.id == user_id, models.User.is_deleted == False).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot delete yourself")
    user.is_deleted = True
    add_audit_log(db, current_user.id, "deleted", "Users", f"User deleted: {user.name}", "delete")
    db.commit()
