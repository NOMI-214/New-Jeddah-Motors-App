from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional
from database import get_db
from auth import get_current_user, add_audit_log
import models
import schemas

router = APIRouter(prefix="/transactions", tags=["transactions"])


def tx_to_out(tx: models.Transaction) -> schemas.TransactionOut:
    out = schemas.TransactionOut.model_validate(tx)
    out.creator_name = tx.creator.name if tx.creator else ""
    return out


@router.get("", response_model=list[schemas.TransactionOut])
def list_transactions(
    type: Optional[str] = Query(None),
    branch: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    query = db.query(models.Transaction)
    if type:
        query = query.filter(models.Transaction.type == type)
    if branch:
        query = query.filter(models.Transaction.branch == branch)
    txs = query.order_by(models.Transaction.date.desc()).all()
    return [tx_to_out(t) for t in txs]


@router.post("", response_model=schemas.TransactionOut, status_code=201)
def create_transaction(body: schemas.TransactionCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    tx = models.Transaction(**body.model_dump(), created_by=current_user.id)
    db.add(tx)
    db.flush()
    label = "Cash in" if tx.type == "cashIn" else "Cash out"
    add_audit_log(db, current_user.id, "created", "Transactions",
                  f"{label} of Rs {tx.amount:,.0f} recorded under {tx.category}", "create")
    db.commit()
    db.refresh(tx)
    return tx_to_out(tx)
