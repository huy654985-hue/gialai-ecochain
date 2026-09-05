"""Auth flow — register (first user = admin), login, me."""
import os

os.environ["DATABASE_URL"] = "sqlite:///:memory:"
os.environ["DEMO_MODE"] = "true"

from fastapi.testclient import TestClient

from app.database import init_db
from app.main import create_app


def _client():
    app = create_app()
    init_db()
    return TestClient(app)


def test_register_login_me():
    c = _client()
    r = c.post("/api/auth/register", json={"username": "admin1", "password": "secret123"})
    assert r.status_code == 201, r.text
    assert r.json()["role"] == "admin"  # first user bootstrap

    r = c.post("/api/auth/register", json={"username": "viewer1", "password": "secret123"})
    assert r.status_code == 201, r.text
    assert r.json()["role"] == "viewer"

    r = c.post("/api/auth/register", json={"username": "admin1", "password": "secret123"})
    assert r.status_code == 400  # duplicate

    r = c.post("/api/auth/login", data={"username": "admin1", "password": "wrongpass"})
    assert r.status_code == 401

    r = c.post("/api/auth/login", data={"username": "admin1", "password": "secret123"})
    assert r.status_code == 200, r.text
    token = r.json()["access_token"]

    r = c.get("/api/auth/me")
    assert r.status_code == 401  # no token
    r = c.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert r.status_code == 200, r.text
    assert r.json() == {"id": 1, "username": "admin1", "role": "admin", "is_active": True}
