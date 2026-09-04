from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from auth import get_current_user, add_audit_log
import models
import schemas

router = APIRouter(prefix="/installments", tags=["installments"])


def installment_to_out(inst: models.Installment, db: Session) -> schemas.InstallmentOut:
    payments = db.query(models.InstallmentPayment).filter(
        models.InstallmentPayment.installment_id == inst.id
    ).order_by(models.InstallmentPayment.payment_date.desc()).all()

    out = schemas.InstallmentOut.model_validate(inst)
    out.remaining_amount = inst.total_amount - inst.paid_amount
    out.payments = [schemas.InstallmentPaymentOut.model_validate(p) for p in payments]

    customer = db.query(models.Customer).filter(models.Customer.id == inst.customer_id).first()
    out.customer_name = customer.name if customer else ""

    sale = db.query(models.Sale).filter(models.Sale.id == inst.sale_id).first()
    if sale:
        car = db.query(models.Car).filter(models.Car.id == sale.car_id).first()
        out.car_name = f"{car.name} {car.year}" if car else ""
    else:
        out.car_name = ""

    return out


@router.get("", response_model=list[schemas.InstallmentOut])
def list_installments(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    installments = db.query(models.Installment).order_by(models.Installment.next_due_date).all()
    return [installment_to_out(i, db) for i in installments]


@router.get("/{installment_id}", response_model=schemas.InstallmentOut)
def get_installment(installment_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    inst = db.query(models.Installment).filter(models.Installment.id == installment_id).first()
    if not inst:
        raise HTTPException(status_code=404, detail="Installment not found")
    return installment_to_out(inst, db)


@router.post("/{installment_id}/payments", response_model=schemas.InstallmentPaymentOut, status_code=201)
def record_payment(
    installment_id: int,
    body: schemas.InstallmentPaymentCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    inst = db.query(models.Installment).filter(models.Installment.id == installment_id).first()
    if not inst:
        raise HTTPException(status_code=404, detail="Installment not found")
    if inst.status == "completed":
        raise HTTPException(status_code=400, detail="Installment already completed")

    payment = models.InstallmentPayment(
        installment_id=installment_id,
        amount=body.amount,
        payment_date=body.payment_date,
        recorded_by=current_user.id,
    )
    db.add(payment)

    inst.paid_amount = inst.paid_amount + body.amount
    if inst.paid_amount >= inst.total_amount:
        inst.status = "completed"
    else:
        if body.next_due_date:
            inst.next_due_date = body.next_due_date
        if body.next_installment_amount:
            inst.next_installment_amount = body.next_installment_amount

    add_audit_log(db, current_user.id, "created", "Installments",
                  f"Payment of Rs {body.amount:,.0f} recorded for installment #{installment_id}", "create")
    db.commit()
    db.refresh(payment)
    return schemas.InstallmentPaymentOut.model_validate(payment)


@router.patch("/{installment_id}", response_model=schemas.InstallmentOut)
def update_installment(
    installment_id: int,
    body: schemas.InstallmentUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    inst = db.query(models.Installment).filter(models.Installment.id == installment_id).first()
    if not inst:
        raise HTTPException(status_code=404, detail="Installment not found")
    for field, value in body.model_dump(exclude_none=True).items():
        setattr(inst, field, value)
    add_audit_log(db, current_user.id, "updated", "Installments", f"Installment #{installment_id} updated", "update")
    db.commit()
    db.refresh(inst)
    return installment_to_out(inst, db)
