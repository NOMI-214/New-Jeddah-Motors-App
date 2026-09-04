from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional
from database import get_db
from auth import get_current_user, require_roles
import models
import schemas

router = APIRouter(prefix="/audit-logs", tags=["audit-logs"])


def log_to_out(log: models.AuditLog, db: Session) -> schemas.AuditLogOut:
    out = schemas.AuditLogOut.model_validate(log)
    user = db.query(models.User).filter(models.User.id == log.user_id).first()
    out.user_name = user.name if user else "System"
    return out


@router.get("", response_model=list[schemas.AuditLogOut])
def list_audit_logs(
    module: Optional[str] = Query(None),
    type: Optional[str] = Query(None),
    q: Optional[str] = Query(None),
    limit: int = Query(200, le=1000),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_roles("owner", "admin", "manager")),
):
    query = db.query(models.AuditLog)
    if module:
        query = query.filter(models.AuditLog.module == module)
    if type:
        query = query.filter(models.AuditLog.type == type)
    if q:
        query = query.filter(models.AuditLog.description.ilike(f"%{q}%"))
    logs = query.order_by(models.AuditLog.created_at.desc()).limit(limit).all()
    return [log_to_out(l, db) for l in logs]
