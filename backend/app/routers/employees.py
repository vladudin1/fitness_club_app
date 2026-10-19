from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import crud, schemas, auth, models
from ..database import get_db

router = APIRouter()

@router.get("/", response_model=List[schemas.EmployeeOut])
def read_employees(
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    employees = crud.get_employees(db, skip=skip, limit=limit, search=search)
    return employees

@router.get("/{employee_id}", response_model=schemas.EmployeeOut)
def read_employee(employee_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    employee = crud.get_employee(db, employee_id)
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    return employee

@router.post("/", response_model=schemas.EmployeeOut)
def create_employee(employee: schemas.EmployeeCreate, db: Session = Depends(get_db), current_user: models.User = Depends(auth.require_any_role(["manager", "admin"]))):
    return crud.create_employee(db, employee)

@router.put("/{employee_id}", response_model=schemas.EmployeeOut)
def update_employee(employee_id: int, employee: schemas.EmployeeUpdate, db: Session = Depends(get_db), current_user: models.User = Depends(auth.require_any_role(["manager", "admin"]))):
    db_employee = crud.update_employee(db, employee_id, employee)
    if not db_employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    return db_employee

@router.delete("/{employee_id}")
def delete_employee(employee_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(auth.require_role("admin"))):
    db_employee = crud.delete_employee(db, employee_id)
    if not db_employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    return {"message": "Employee deleted"}