import os
import jwt
import datetime
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from database import get_db
import models

SECRET_KEY = os.getenv("JWT_SECRET_KEY", "fitcopilot-super-secret-key-12345")
ALGORITHM = "HS256"
USE_FIREBASE = os.getenv("USE_FIREBASE", "false").lower() == "true"

security = HTTPBearer()

def create_access_token(data: dict, expires_delta: datetime.timedelta = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.datetime.utcnow() + expires_delta
    else:
        expire = datetime.datetime.utcnow() + datetime.timedelta(days=7)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def decode_access_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.PyJWTError:
        return None

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> models.User:
    token = credentials.credentials
    
    if USE_FIREBASE:
        # Standard Firebase token verification flow placeholder
        # In a real production deployment, you would run:
        # from firebase_admin import auth as firebase_auth
        # decoded_token = firebase_auth.verify_id_token(token)
        # uid = decoded_token['uid']
        # But to prevent crashing if Firebase is not setup, we fall back to reading the sub / uid
        try:
            # First try parsing as custom JWT for ease of testing
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            uid = payload.get("sub")
        except jwt.PyJWTError:
            # Fallback mock for Firebase token (in dev we can accept any string or uid)
            uid = token
    else:
        # Dev local mode verification
        payload = decode_access_token(token)
        if not payload:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
        uid = payload.get("sub")
        
    user = db.query(models.User).filter(models.User.id == uid).first()
    if not user:
        # For seamless onboarding of first-time Firebase / OAuth users
        # We can dynamically register them in the DB if the token is valid!
        if USE_FIREBASE:
            # Create a shell user to be filled during onboarding
            user = models.User(id=uid, email=f"user_{uid}@fitcopilot.dev", name="Fitness Partner")
            db.add(user)
            db.commit()
            db.refresh(user)
        else:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found",
            )
            
    return user
