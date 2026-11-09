import uuid
import requests
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from passlib.context import CryptContext

from database import get_db
from models import User
from auth_routes import create_access_token
from config import settings

router = APIRouter(prefix="/auth/google", tags=["Google Authentication"])

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password):
    return pwd_context.hash(password)

@router.post("/token")
def google_auth(payload: dict, db: Session = Depends(get_db)):
    token = payload.get("token")
    if not token:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Lipsește token-ul Google."
        )

    # Validare ID Token direct la Google
    google_url = f"https://oauth2.googleapis.com/tokeninfo?id_token={token}"
    response = requests.get(google_url)

    if response.status_code != 200:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token Google invalid sau expirat."
        )

    user_info = response.json()

    # Verificare securizată a Client ID-ului (Audience)
    token_audience = user_info.get("aud")
    if token_audience != settings.GOOGLE_CLIENT_ID:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token-ul Google nu aparține acestei aplicații (Client ID invalid)."
        )

    email = user_info.get("email")
    name = user_info.get("given_name", "Google")
    surname = user_info.get("family_name", "User")

    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Nu s-a putut obține email-ul din contul Google."
        )

    user = db.query(User).filter(User.email == email).first()

    if not user:
        dummy_password_hash = get_password_hash(str(uuid.uuid4()))

        user = User(
            name=name,
            surname=surname,
            email=email,
            phone_number="0000000000",
            password_hash=dummy_password_hash
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    access_token = create_access_token(data={"sub": str(user.id)})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_id": str(user.id),
        "name": user.name,
        "surname": user.surname
    }