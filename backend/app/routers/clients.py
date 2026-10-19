from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from .. import crud, schemas, auth, models
from ..database import get_db

router = APIRouter()

@router.get("/", response_model=List[schemas.ClientOut])
def read_clients(
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    clients = crud.get_clients(db, skip=skip, limit=limit, search=search)
    return clients

@router.get("/{client_id}", response_model=schemas.ClientOut)
def read_client(
    client_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    client = crud.get_client(db, client_id)
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    return client

@router.post("/", response_model=schemas.ClientOut)
def create_client(
    client: schemas.ClientCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_any_role(["manager", "admin"]))
):
    return crud.create_client(db, client)

@router.put("/{client_id}", response_model=schemas.ClientOut)
def update_client(
    client_id: int,
    client: schemas.ClientUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_any_role(["manager", "admin"]))
):
    db_client = crud.update_client(db, client_id, client)
    if not db_client:
        raise HTTPException(status_code=404, detail="Client not found")
    return db_client

@router.delete("/{client_id}")
def delete_client(
    client_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_role("admin"))
):
    db_client = crud.delete_client(db, client_id)
    if not db_client:
        raise HTTPException(status_code=404, detail="Client not found")
    return {"message": "Client deleted"}