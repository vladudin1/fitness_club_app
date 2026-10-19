from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import crud, schemas, auth, models
from ..database import get_db

router = APIRouter()


@router.get("/", response_model=List[schemas.OrderOut])
def read_orders(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    orders = crud.get_orders(db, skip=skip, limit=limit)
    return orders


@router.get("/{order_id}", response_model=schemas.OrderOut)
def read_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    order = crud.get_order(db, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order


@router.post("/", response_model=schemas.OrderOut)
def create_order(
    order: schemas.OrderCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_any_role(["client", "manager", "admin"]))
):
    # Если клиент создаёт заказ, подставляем client_id автоматически
    # (в реальном приложении заказы создаются через другую логику, но пока так)
    return crud.create_order(db, order)


@router.put("/{order_id}", response_model=schemas.OrderOut)
def update_order(
    order_id: int,
    order: schemas.OrderUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_any_role(["manager", "admin"]))
):
    db_order = crud.update_order(db, order_id, order)
    if not db_order:
        raise HTTPException(status_code=404, detail="Order not found")
    return db_order


@router.delete("/{order_id}")
def delete_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_role("admin"))
):
    db_order = crud.delete_order(db, order_id)
    if not db_order:
        raise HTTPException(status_code=404, detail="Order not found")
    return {"message": "Order deleted"}