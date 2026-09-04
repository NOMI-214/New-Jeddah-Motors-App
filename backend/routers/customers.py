from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional
from database import get_db
from auth import get_current_user, add_audit_log
import models
import schemas

router = APIRouter(prefix="/customers", tags=["customers"])


def customer_to_out(customer: models.Customer, db: Session) -> schemas.CustomerOut:
    sales_count = db.query(models.Sale).filter(models.Sale.customer_id == customer.id).count()
    # Outstanding = sum of installment remaining amounts for this customer
    installments = db.query(models.Installment).filter(
        models.Installment.customer_id == customer.id,
        models.Installment.status != "completed"
    ).all()
    outstanding = sum(i.total_amount - i.paid_amount for i in installments)
    data = schemas.CustomerOut.model_validate(customer)
    data.cars_purchased = sales_count
    data.outstanding_amount = outstanding
    return data


@router.get("", response_model=list[schemas.CustomerOut])
def list_customers(
    q: Optional[str] = Query(None),
    branch: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    query = db.query(models.Customer).filter(models.Customer.is_deleted == False)
    if branch:
        query = query.filter(models.Customer.branch == branch)
    if q:
        query = query.filter(
            models.Customer.name.ilike(f"%{q}%") |
            models.Customer.phone.ilike(f"%{q}%") |
            models.Customer.cnic.ilike(f"%{q}%")
        )
    customers = query.order_by(models.Customer.created_at.desc()).all()
    return [customer_to_out(c, db) for c in customers]


@router.get("/{customer_id}", response_model=schemas.CustomerOut)
def get_customer(customer_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    customer = db.query(models.Customer).filter(models.Customer.id == customer_id, models.Customer.is_deleted == False).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    return customer_to_out(customer, db)


@router.post("", response_model=schemas.CustomerOut, status_code=201)
def create_customer(body: schemas.CustomerCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    customer = models.Customer(**body.model_dump(), created_by=current_user.id)
    db.add(customer)
    db.flush()
    add_audit_log(db, current_user.id, "created", "Customers", f"New customer: {customer.name}", "create")
    db.commit()
    db.refresh(customer)
    return customer_to_out(customer, db)


@router.put("/{customer_id}", response_model=schemas.CustomerOut)
def update_customer(customer_id: int, body: schemas.CustomerUpdate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    customer = db.query(models.Customer).filter(models.Customer.id == customer_id, models.Customer.is_deleted == False).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    for field, value in body.model_dump(exclude_none=True).items():
        setattr(customer, field, value)
    add_audit_log(db, current_user.id, "updated", "Customers", f"Customer updated: {customer.name}", "update")
    db.commit()
    db.refresh(customer)
    return customer_to_out(customer, db)


@router.delete("/{customer_id}", status_code=204)
def delete_customer(customer_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    customer = db.query(models.Customer).filter(models.Customer.id == customer_id, models.Customer.is_deleted == False).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    customer.is_deleted = True
    add_audit_log(db, current_user.id, "deleted", "Customers", f"Customer deleted: {customer.name}", "delete")
    db.commit()
