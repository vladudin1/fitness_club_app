from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import crud, schemas, auth, models
from ..database import get_db

router = APIRouter()


@router.get("/", response_model=List[schemas.ServiceOut])
def read_services(
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    services = crud.get_services(db, skip=skip, limit=limit, search=search)
    return services


@router.get("/{service_id}", response_model=schemas.ServiceOut)
def read_service(
    service_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    service = crud.get_service(db, service_id)
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    return service


@router.post("/", response_model=schemas.ServiceOut)
def create_service(
    service: schemas.ServiceCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_any_role(["manager", "admin"]))
):
    return crud.create_service(db, service)


@router.put("/{service_id}", response_model=schemas.ServiceOut)
def update_service(
    service_id: int,
    service: schemas.ServiceUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_any_role(["manager", "admin"]))
):
    db_service = crud.update_service(db, service_id, service)
    if not db_service:
        raise HTTPException(status_code=404, detail="Service not found")
    return db_service


@router.delete("/{service_id}")
def delete_service(
    service_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_role("admin"))
):
    db_service = crud.delete_service(db, service_id)
    if not db_service:
        raise HTTPException(status_code=404, detail="Service not found")
    return {"message": "Service deleted"}