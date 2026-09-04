"""
Seed the database with the owner account only.
Run: python3 seed.py
"""
from database import SessionLocal, engine, Base
import models
from auth import hash_password

Base.metadata.create_all(bind=engine)

db = SessionLocal()

# ─── Clear all existing data ─────────────────────────────────────────────────
db.query(models.AuditLog).delete()
db.query(models.InstallmentPayment).delete()
db.query(models.Installment).delete()
db.query(models.Sale).delete()
db.query(models.Transaction).delete()
db.query(models.Expense).delete()
db.query(models.Car).delete()
db.query(models.Customer).delete()
db.query(models.User).delete()
db.commit()

# ─── Owner account ────────────────────────────────────────────────────────────
owner = models.User(
    name="Aqeel Shehzad",
    email="owner@showroom.com",
    hashed_password=hash_password("demo1234"),
    role="owner",
    branch="Islamabad",
    status="active",
    phone="",
    address="",
    join_date="",
    cars_sold=0,
    revenue_generated=0.0,
)
db.add(owner)
db.commit()

print("✅ Database ready.")
print("\nOwner account:")
print("  Email:    owner@showroom.com")
print("  Password: demo1234")
print("\nChange your password after first login.")
db.close()
