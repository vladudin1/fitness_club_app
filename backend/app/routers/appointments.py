from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import crud, schemas, auth, models
from ..database import get_db

router = APIRouter()


@router.get("/", response_model=List[schemas.AppointmentOut])
def read_appointments(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    appointments = crud.get_appointments(db, skip=skip, limit=limit)
    return appointments


@router.get("/{appointment_id}", response_model=schemas.AppointmentOut)
def read_appointment(
    appointment_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    appointment = crud.get_appointment(db, appointment_id)
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    return appointment


@router.post("/", response_model=schemas.AppointmentOut)
def create_appointment(
    appointment: schemas.AppointmentCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_any_role(["client", "manager", "admin"]))
):
    return crud.create_appointment(db, appointment)


@router.put("/{appointment_id}", response_model=schemas.AppointmentOut)
def update_appointment(
    appointment_id: int,
    appointment: schemas.AppointmentUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_any_role(["manager", "admin"]))
):
    db_appointment = crud.update_appointment(db, appointment_id, appointment)
    if not db_appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    return db_appointment


@router.delete("/{appointment_id}")
def delete_appointment(
    appointment_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_role("admin"))
):
    db_appointment = crud.delete_appointment(db, appointment_id)
    if not db_appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    return {"message": "Appointment deleted"}