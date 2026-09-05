"""JWT auth helpers — bcrypt passwords (via `bcrypt` pkg), HS256 tokens (via `python-jose`).

Additive module: existing routes are NOT force-protected yet, so current
tests/clients keep working. Protect routes explicitly with
`Depends(get_current_user)` / `Depends(require_role("admin"))`.
"""
from datetime import datetime, timedelta
from typing import Optional

import bcrypt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.database import get_db

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(password: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(password.encode("utf-8"), hashed.encode("utf-8"))
    except (ValueError, TypeError):
        return False


def create_access_token(subject: str, expires_minutes: Optional[int] = None) -> str:
    s = get_settings()
    expire = datetime.utcnow() + timedelta(
        minutes=expires_minutes if expires_minutes is not None else s.access_token_expire_minutes
    )
    return jwt.encode(
        {"sub": subject, "exp": expire},
        s.secret_key,
        algorithm=s.auth_algorithm,
    )


def get_current_user(
    token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)
):
    from app.models.user import User

    cred_exc = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Not authenticated",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(
            token, get_settings().secret_key, algorithms=[get_settings().auth_algorithm]
        )
        username: Optional[str] = payload.get("sub")
    except JWTError:
        raise cred_exc
    if not username:
        raise cred_exc
    user = db.query(User).filter(User.username == username).first()
    if not user or not user.is_active:
        raise cred_exc
    return user


def require_role(role: str):
    def checker(user=Depends(get_current_user)):
        if user.role != role and user.role != "admin":
            raise HTTPException(status_code=403, detail="Forbidden: insufficient role")
        return user

    return checker
