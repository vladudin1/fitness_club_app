from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from .. import schemas, crud, auth, models
from ..database import get_db

router = APIRouter()

@router.post("/token")
def login_for_access_token(db: Session = Depends(get_db), form_data: OAuth2PasswordRequestForm = Depends()):
    user = crud.get_user_by_username(db, username=form_data.username)
    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = auth.create_access_token(data={"sub": user.username, "role": user.role})
    return {"access_token": access_token, "token_type": "bearer", "role": user.role, "username": user.username}

@router.post("/register")
def register_user(username: str, password: str, role: str = "client", db: Session = Depends(get_db)):
    existing_user = crud.get_user_by_username(db, username=username)
    if existing_user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Username already exists")
    hashed_password = auth.get_password_hash(password)
    user = crud.create_user(db, username=username, hashed_password=hashed_password, role=role)
    return {"message": "User created", "username": user.username, "role": user.role}

@router.get("/me", response_model=schemas.UserOut)
def read_current_user(current_user: models.User = Depends(auth.get_current_user)):
    return current_user