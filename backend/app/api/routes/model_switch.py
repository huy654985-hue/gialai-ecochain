from fastapi import APIRouter, Depends
from typing import Optional
from app.services.model_switcher import list_models, switch, get_mode
from app.core.config import get_settings
from app.core.security import require_role

router=APIRouter(tags=["ModelSwitch"])

_mode_override=None

@router.get("/models/switch/list")
def list_switch():
    return list_models()

@router.post("/models/switch")
def do_switch(body:dict, admin=Depends(require_role("admin"))):
    agent=body.get("agent"); version=body.get("version")
    if not agent or not version: return {"error":"agent and version required"}
    v=switch(agent, version)
    return {"agent": agent, "active": v, "status":"switched"}

@router.get("/mode")
def get_mode_api():
    global _mode_override
    mode=_mode_override or get_mode()
    return {"mode": mode, "demo": mode=="DEMO"}

@router.post("/mode")
def set_mode_api(body:dict, admin=Depends(require_role("admin"))):
    global _mode_override
    mode=body.get("mode","DEMO")
    _mode_override=mode
    # also try to set env for future get_settings? we keep in-memory
    return {"mode": _mode_override, "status":"switched, reload frontend to apply"}
