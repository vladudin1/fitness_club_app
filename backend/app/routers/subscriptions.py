from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import crud, schemas, auth, models
from ..database import get_db

router = APIRouter()


@router.get("/", response_model=List[schemas.SubscriptionOut])
def read_subscriptions(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    subscriptions = crud.get_subscriptions(db, skip=skip, limit=limit)
    return subscriptions


@router.get("/{subscription_id}", response_model=schemas.SubscriptionOut)
def read_subscription(
    subscription_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    subscription = crud.get_subscription(db, subscription_id)
    if not subscription:
        raise HTTPException(status_code=404, detail="Subscription not found")
    return subscription


@router.post("/", response_model=schemas.SubscriptionOut)
def create_subscription(
    subscription: schemas.SubscriptionCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_any_role(["manager", "admin"]))
):
    return crud.create_subscription(db, subscription)


@router.put("/{subscription_id}", response_model=schemas.SubscriptionOut)
def update_subscription(
    subscription_id: int,
    subscription: schemas.SubscriptionUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_any_role(["manager", "admin"]))
):
    db_subscription = crud.update_subscription(db, subscription_id, subscription)
    if not db_subscription:
        raise HTTPException(status_code=404, detail="Subscription not found")
    return db_subscription


@router.delete("/{subscription_id}")
def delete_subscription(
    subscription_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_role("admin"))
):
    db_subscription = crud.delete_subscription(db, subscription_id)
    if not db_subscription:
        raise HTTPException(status_code=404, detail="Subscription not found")
    return {"message": "Subscription deleted"}