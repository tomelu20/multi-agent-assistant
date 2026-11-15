import os
import random
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from dotenv import load_dotenv
from fastapi import APIRouter, Depends, HTTPException, status
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from database import get_db
from models import User
from schemas.schemas import EmailRequest, UserCreate, UserResponse, VerifyCodeRequest

load_dotenv()  # Încarcă variabilele din .env[cite: 3]

router = APIRouter(prefix="/auth", tags=["Register"])

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Dicționar temporar în memorie pentru stocarea codurilor de verificare (email -> cod)
verification_codes = {}


def get_password_hash(password):
    return pwd_context.hash(password)


def send_verification_email(to_email: str, code: str):
    sender_email = os.getenv("EMAIL_SENDER", "multiagent.assistant@gmail.com")
    sender_password = os.getenv("EMAIL_PASSWORD")

    message = MIMEMultipart("alternative")
    message["Subject"] = "Codul tău de verificare pentru Productivity Assistant"
    message["From"] = sender_email
    message["To"] = to_email

    text = f"Salut,\n\nCodul tău de verificare este: {code}\n\nAcest cod este valabil pentru înregistrarea contului tău."
    html = f"""\
    <html>
      <body>
        <p>Salut,<br>
           Codul tău de verificare este: <b>{code}</b><br>
           Acest cod este valabil pentru înregistrarea contului tău.
        </p>
      </body>
    </html>
    """

    message.attach(MIMEText(text, "plain"))
    message.attach(MIMEText(html, "html"))

    try:
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(sender_email, sender_password)
            server.sendmail(sender_email, to_email, message.as_string())
    except Exception as e:
        print(f"Erore la trimiterea emailului: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Nu s-a putut trimite emailul de verificare. Verifică configurația SMTP.",
        )


@router.post("/send-code")
def send_code(payload: EmailRequest, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == payload.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Un utilizator cu acest email există deja.",
        )

    code = f"{random.randint(100000, 999999)}"
    verification_codes[payload.email] = code

    send_verification_email(payload.email, code)

    return {"message": "Codul de verificare a fost trimis cu succes pe email."}


@router.post("/verify-code")
def verify_code(payload: VerifyCodeRequest):
    stored_code = verification_codes.get(payload.email)
    if not stored_code or stored_code != payload.code:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Codul de verificare este incorect sau a expirat.",
        )
    return {"message": "Email verificat cu succes."}


@router.post(
    "/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED
)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Un utilizator cu acest email există deja.",
        )

    if len(user_data.phone_number) > 10:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Numărul de telefon poate avea maximum 10 cifre.",
        )

    hashed_password = get_password_hash(user_data.password)

    new_user = User(
        name=user_data.name,
        surname=user_data.surname,
        email=user_data.email,
        phone_number=user_data.phone_number,
        password_hash=hashed_password,
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    if user_data.email in verification_codes:
        del verification_codes[user_data.email]

    return new_user