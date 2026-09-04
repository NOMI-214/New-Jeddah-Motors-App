from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional
from database import get_db
from auth import get_current_user, add_audit_log
import models
import schemas

router = APIRouter(prefix="/sales", tags=["sales"])


def sale_to_out(sale: models.Sale, db: Session) -> schemas.SaleOut:
    out = schemas.SaleOut.model_validate(sale)
    car = db.query(models.Car).filter(models.Car.id == sale.car_id).first()
    customer = db.query(models.Customer).filter(models.Customer.id == sale.customer_id).first()
    salesperson = db.query(models.User).filter(models.User.id == sale.salesperson_id).first()
    out.car_name = f"{car.name} {car.year}" if car else ""
    out.customer_name = customer.name if customer else ""
    out.salesperson_name = salesperson.name if salesperson else ""
    return out


@router.get("", response_model=list[schemas.SaleOut])
def list_sales(
    status: Optional[str] = Query(None),
    branch: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    query = db.query(models.Sale)
    if status:
        query = query.filter(models.Sale.status == status)
    if branch:
        query = query.filter(models.Sale.branch == branch)
    sales = query.order_by(models.Sale.date.desc()).all()
    return [sale_to_out(s, db) for s in sales]


@router.get("/{sale_id}", response_model=schemas.SaleOut)
def get_sale(sale_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    sale = db.query(models.Sale).filter(models.Sale.id == sale_id).first()
    if not sale:
        raise HTTPException(status_code=404, detail="Sale not found")
    return sale_to_out(sale, db)


@router.post("", response_model=schemas.SaleOut, status_code=201)
def create_sale(body: schemas.SaleCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    car = db.query(models.Car).filter(models.Car.id == body.car_id, models.Car.is_deleted == False).first()
    if not car:
        raise HTTPException(status_code=404, detail="Car not found")
    if car.status == "sold":
        raise HTTPException(status_code=400, detail="Car is already sold")

    customer = db.query(models.Customer).filter(models.Customer.id == body.customer_id, models.Customer.is_deleted == False).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    profit = body.sale_price - car.purchase_price
    sale = models.Sale(
        car_id=body.car_id,
        customer_id=body.customer_id,
        sale_price=body.sale_price,
        purchase_price=car.purchase_price,
        profit=profit,
        payment_type=body.payment_type,
        status="completed",
        notes=body.notes,
        salesperson_id=current_user.id,
        branch=body.branch or car.branch,
    )
    db.add(sale)
    db.flush()

    car.status = "sold"

    # Update salesperson stats
    salesperson = db.query(models.User).filter(models.User.id == current_user.id).first()
    if salesperson:
        salesperson.cars_sold = (salesperson.cars_sold or 0) + 1
        salesperson.revenue_generated = (salesperson.revenue_generated or 0) + body.sale_price

    # If installment, create an installment record
    if body.payment_type == "installment" and body.installment_data:
        inst = models.Installment(
            sale_id=sale.id,
            customer_id=body.customer_id,
            total_amount=body.sale_price,
            paid_amount=body.installment_data.get("down_payment", 0),
            next_due_date=body.installment_data.get("next_due_date"),
            next_installment_amount=body.installment_data.get("monthly_amount", 0),
            status="active",
        )
        db.add(inst)

    add_audit_log(db, current_user.id, "created", "Sales",
                  f"Sale recorded: {car.name} {car.year} for Rs {body.sale_price:,.0f}", "create")
    db.commit()
    db.refresh(sale)
    return sale_to_out(sale, db)
