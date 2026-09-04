from fastapi import APIRouter, Depends, Query
from sqlalchemy import func
from sqlalchemy.orm import Session
from typing import Optional
from database import get_db
from auth import get_current_user
import models
import schemas

router = APIRouter(prefix="/reports", tags=["reports"])


@router.get("/dashboard", response_model=schemas.DashboardStats)
def dashboard_stats(
    branch: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    car_q = db.query(models.Car).filter(models.Car.is_deleted == False)
    if branch:
        car_q = car_q.filter(models.Car.branch == branch)

    total_cars = car_q.count()
    available_cars = car_q.filter(models.Car.status == "available").count()
    reserved_cars = car_q.filter(models.Car.status == "reserved").count()
    sold_cars = car_q.filter(models.Car.status == "sold").count()

    customer_q = db.query(models.Customer).filter(models.Customer.is_deleted == False)
    if branch:
        customer_q = customer_q.filter(models.Customer.branch == branch)
    total_customers = customer_q.count()

    sale_q = db.query(models.Sale)
    if branch:
        sale_q = sale_q.filter(models.Sale.branch == branch)
    total_sales = sale_q.count()
    total_revenue = sale_q.with_entities(func.sum(models.Sale.sale_price)).scalar() or 0
    total_profit = sale_q.with_entities(func.sum(models.Sale.profit)).scalar() or 0

    expense_q = db.query(models.Expense).filter(models.Expense.is_deleted == False)
    if branch:
        expense_q = expense_q.filter(models.Expense.branch == branch)
    total_expenses = expense_q.with_entities(func.sum(models.Expense.amount)).scalar() or 0

    tx_q = db.query(models.Transaction)
    if branch:
        tx_q = tx_q.filter(models.Transaction.branch == branch)
    cash_in = tx_q.filter(models.Transaction.type == "cashIn").with_entities(func.sum(models.Transaction.amount)).scalar() or 0
    cash_out = tx_q.filter(models.Transaction.type == "cashOut").with_entities(func.sum(models.Transaction.amount)).scalar() or 0

    pending_installments = db.query(models.Installment).filter(models.Installment.status == "active").count()
    outstanding_amount = db.query(
        func.sum(models.Installment.total_amount - models.Installment.paid_amount)
    ).filter(models.Installment.status == "active").scalar() or 0

    return schemas.DashboardStats(
        total_cars=total_cars,
        available_cars=available_cars,
        reserved_cars=reserved_cars,
        sold_cars=sold_cars,
        total_customers=total_customers,
        total_sales=total_sales,
        total_revenue=float(total_revenue),
        total_profit=float(total_profit),
        total_expenses=float(total_expenses),
        cash_in=float(cash_in),
        cash_out=float(cash_out),
        pending_installments=pending_installments,
        outstanding_amount=float(outstanding_amount),
        net_balance=float(cash_in) - float(cash_out) - float(total_expenses),
    )


@router.get("/sales-by-month")
def sales_by_month(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    rows = db.execute(
        """
        SELECT strftime('%Y-%m', date) as month,
               COUNT(*) as count,
               SUM(sale_price) as revenue,
               SUM(profit) as profit
        FROM sales
        GROUP BY month
        ORDER BY month DESC
        LIMIT 12
        """
    ).fetchall()
    return [{"month": r[0], "count": r[1], "revenue": r[2] or 0, "profit": r[3] or 0} for r in rows]


@router.get("/expenses-by-category")
def expenses_by_category(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    rows = db.query(
        models.Expense.category,
        func.count(models.Expense.id).label("count"),
        func.sum(models.Expense.amount).label("total"),
    ).filter(models.Expense.is_deleted == False).group_by(models.Expense.category).all()
    return [{"category": r.category, "count": r.count, "total": float(r.total or 0)} for r in rows]


@router.get("/top-salespeople")
def top_salespeople(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    # Compute from actual sales data so stats are always accurate
    rows = db.query(
        models.Sale.salesperson_id,
        func.count(models.Sale.id).label("cars_sold"),
        func.sum(models.Sale.sale_price).label("revenue_generated"),
    ).filter(models.Sale.salesperson_id.isnot(None)).group_by(models.Sale.salesperson_id).all()

    result = []
    for r in rows:
        user = db.query(models.User).filter(models.User.id == r.salesperson_id, models.User.is_deleted == False).first()
        if user:
            result.append({
                "id": user.id,
                "name": user.name,
                "role": user.role,
                "cars_sold": r.cars_sold,
                "revenue_generated": float(r.revenue_generated or 0),
            })

    result.sort(key=lambda x: x["revenue_generated"], reverse=True)
    return result[:10]
