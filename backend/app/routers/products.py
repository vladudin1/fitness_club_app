from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from .. import crud, schemas, auth, models
from ..database import get_db

router = APIRouter()


@router.get("/", response_model=List[schemas.ProductOut])
def read_products(
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    products = crud.get_products(db, skip=skip, limit=limit, search=search)
    return products


@router.get("/{product_id}", response_model=schemas.ProductOut)
def read_product(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    product = crud.get_product(db, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


@router.post("/", response_model=schemas.ProductOut)
def create_product(
    product: schemas.ProductCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_any_role(["manager", "admin"]))
):
    return crud.create_product(db, product)


@router.put("/{product_id}", response_model=schemas.ProductOut)
def update_product(
    product_id: int,
    product: schemas.ProductUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_any_role(["manager", "admin"]))
):
    db_product = crud.update_product(db, product_id, product)
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")
    return db_product


@router.delete("/{product_id}")
def delete_product(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_role("admin"))
):
    db_product = crud.delete_product(db, product_id)
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"message": "Product deleted"}