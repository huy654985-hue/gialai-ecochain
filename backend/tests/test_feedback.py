"""Feedback flow — public submit, admin list/resolve."""
import os

os.environ["DATABASE_URL"] = "sqlite:///:memory:"
os.environ["DEMO_MODE"] = "true"

from fastapi.testclient import TestClient

from app.database import Base, engine, init_db
from app.main import create_app
from tests.helpers import auth_headers


def setup():
    Base.metadata.drop_all(bind=engine)
    app = create_app()
    init_db()
    return TestClient(app)


def test_feedback_submit_and_triage():
    c = setup()
    # too short → 422
    assert c.post("/api/feedback", json={"message": "abc"}).status_code == 422
    # valid submit, unknown category normalized to bug
    r = c.post("/api/feedback", json={"category": "zzz", "message": "Nút THEO DÕI bấm không hiện gì",
                                      "page_url": "/map", "contact": "a@b.c"})
    assert r.status_code == 201, r.text
    fid = r.json()["id"]
    assert r.json()["status"] == "OPEN"
    # list requires admin
    assert c.get("/api/feedback").status_code in (401, 403)
    h = auth_headers(c)
    rows = c.get("/api/feedback", headers=h).json()
    assert any(x["id"] == fid and x["category"] == "bug" for x in rows)
    # resolve
    r = c.post(f"/api/feedback/{fid}/resolve", headers=h)
    assert r.status_code == 200 and r.json()["status"] == "RESOLVED"
    # resolve missing → 404
    assert c.post("/api/feedback/999999/resolve", headers=h).status_code == 404
