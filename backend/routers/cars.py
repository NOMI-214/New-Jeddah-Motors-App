from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional
from database import get_db
from auth import get_current_user, add_audit_log
import models
import schemas

router = APIRouter(prefix="/cars", tags=["cars"])


def car_to_out(car: models.Car) -> schemas.CarOut:
    return schemas.CarOut.model_validate(car)


@router.get("", response_model=list[schemas.CarOut])
def list_cars(
    status: Optional[str] = Query(None),
    branch: Optional[str] = Query(None),
    q: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    query = db.query(models.Car).filter(models.Car.is_deleted == False)
    if status:
        query = query.filter(models.Car.status == status)
    if branch:
        query = query.filter(models.Car.branch == branch)
    if q:
        query = query.filter(
            models.Car.name.ilike(f"%{q}%") |
            models.Car.registration_number.ilike(f"%{q}%") |
            models.Car.brand.ilike(f"%{q}%")
        )
    return [car_to_out(c) for c in query.order_by(models.Car.created_at.desc()).all()]


@router.get("/{car_id}", response_model=schemas.CarOut)
def get_car(car_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    car = db.query(models.Car).filter(models.Car.id == car_id, models.Car.is_deleted == False).first()
    if not car:
        raise HTTPException(status_code=404, detail="Car not found")
    return car_to_out(car)


@router.post("", response_model=schemas.CarOut, status_code=201)
def create_car(body: schemas.CarCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    car = models.Car(**body.model_dump(), created_by=current_user.id)
    db.add(car)
    db.flush()
    add_audit_log(db, current_user.id, "created", "Cars", f"New car added: {car.name} {car.year}", "create")
    db.commit()
    db.refresh(car)
    return car_to_out(car)


@router.put("/{car_id}", response_model=schemas.CarOut)
def update_car(car_id: int, body: schemas.CarUpdate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    car = db.query(models.Car).filter(models.Car.id == car_id, models.Car.is_deleted == False).first()
    if not car:
        raise HTTPException(status_code=404, detail="Car not found")
    for field, value in body.model_dump(exclude_none=True).items():
        setattr(car, field, value)
    add_audit_log(db, current_user.id, "updated", "Cars", f"{car.name} updated", "update")
    db.commit()
    db.refresh(car)
    return car_to_out(car)


@router.patch("/{car_id}/status", response_model=schemas.CarOut)
def update_car_status(car_id: int, body: schemas.CarStatusUpdate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    car = db.query(models.Car).filter(models.Car.id == car_id, models.Car.is_deleted == False).first()
    if not car:
        raise HTTPException(status_code=404, detail="Car not found")
    old_status = car.status
    car.status = body.status
    add_audit_log(db, current_user.id, "updated", "Cars", f"{car.name} status: {old_status} → {body.status}", "update")
    db.commit()
    db.refresh(car)
    return car_to_out(car)


@router.delete("/{car_id}", status_code=204)
def delete_car(car_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    car = db.query(models.Car).filter(models.Car.id == car_id, models.Car.is_deleted == False).first()
    if not car:
        raise HTTPException(status_code=404, detail="Car not found")
    car.is_deleted = True
    add_audit_log(db, current_user.id, "deleted", "Cars", f"Car deleted: {car.name}", "delete")
    db.commit()
