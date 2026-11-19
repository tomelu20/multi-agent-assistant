from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from uuid import UUID
from datetime import datetime
from pathlib import Path
import json
import re

# Importuri absolute, corecte pentru ruterul rulat din interiorul folderului backend
from database import get_db
from models import Workflow, UserApproval, PlannerStep, User
from schemas.schemas import WorkflowCreate, WorkflowResponse, UserApprovalResponse

router = APIRouter(prefix="/api", tags=["Chat & Workflows"])

STORE_FILE = Path(__file__).resolve().parent / "chat_history_store.json"

STOPWORDS_RO = {
    "și", "si", "sau", "dar", "însă", "insa", "că", "ca", "să", "sa", "de", "la",
    "în", "in", "pe", "cu", "din", "pentru", "prin", "spre", "către", "catre",
    "un", "o", "niște", "niste", "îmi", "imi", "îți", "iti", "își", "isi", "ne",
    "vă", "va", "le", "îl", "il", "este", "sunt", "fi", "fii", "fiind",
    "care", "ce", "cine", "unde", "când", "cand", "cum", "cât", "cat", "mai",
    "foarte", "mult", "puțin", "putin", "te", "rog", "vreau", "doresc", "poti",
    "poți", "fac", "faci", "face", "ajută", "ajuta", "rog", "fișier", "fisier", "atașat", "atasat"
}


def _load_store() -> Dict[str, Any]:
    if not STORE_FILE.exists():
        return {"chats": {}}
    try:
        with open(STORE_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)
            if isinstance(data, dict) and isinstance(data.get("chats"), dict):
                return data
    except Exception:
        pass
    return {"chats": {}}


def _save_store(data: Dict[str, Any]) -> None:
    try:
        with open(STORE_FILE, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
    except Exception:
        pass


def _normalize_file(raw_file: Any) -> Optional[Dict[str, Any]]:
    if not isinstance(raw_file, dict):
        return None
    name = (raw_file.get("name") or "").strip()
    if not name:
        return None
    ext = (raw_file.get("ext") or "").strip().upper()
    if not ext and "." in name:
        ext = name.rsplit(".", 1)[-1].upper()
    if not ext:
        ext = "FILE"
    return {
        "name": name,
        "ext": ext,
        "size": raw_file.get("size", 0),
        "source": raw_file.get("source") or "local"
    }


def generate_topic_title(text: str) -> str:
    """Generează un titlu scurt pe baza subiectului/mesajului, evitând primele cuvinte banale."""
    cleaned = re.sub(r"[^\w\săâîșțĂÂÎȘȚ.-]", " ", text or "", flags=re.UNICODE).strip()
    if not cleaned:
        return "Conversație nouă"

    if re.fullmatch(r"[\w\-]+\.[A-Za-z0-9]{1,8}", cleaned):
        stem = cleaned.rsplit(".", 1)[0].replace("_", " ").replace("-", " ").strip()
        if stem:
            title = stem.capitalize()
            return title[:45] + ("..." if len(title) > 45 else "")

    words = [w for w in cleaned.replace(".", " ").split() if w]
    meaningful = [w for w in words if w.lower() not in STOPWORDS_RO and len(w) > 2]

    if len(meaningful) >= 2:
        topic_words = meaningful[:4]
    elif len(words) > 3:
        topic_words = words[1:4]
    else:
        topic_words = words

    title = " ".join(topic_words).capitalize()
    return title[:45] + ("..." if len(title) > 45 else "")


def _has_user_activity(workflow: Workflow, store: Dict[str, Any]) -> bool:
    """Verifică dacă în chat s-a scris cel puțin un mesaj sau s-a atașat un fișier."""
    chat_key = str(workflow.id)
    record = (store.get("chats") or {}).get(chat_key)
    if record:
        msgs = record.get("messages") or []
        if any(
                m.get("sender") == "user" and ((m.get("text") or "").strip() or _normalize_file(m.get("file")))
                for m in msgs
        ):
            return True
    raw = (workflow.raw_request or "").strip()
    if raw and raw != "Chat Nou":
        return True
    steps = getattr(workflow, "planner_steps", []) or []
    return len(steps) > 0


def _ensure_chat_record(workflow: Workflow, store: Dict[str, Any]) -> Dict[str, Any]:
    chat_key = str(workflow.id)
    chats_map = store.setdefault("chats", {})
    if chat_key not in chats_map:
        initial_title = (
            "Chat Nou"
            if not workflow.raw_request or workflow.raw_request.strip() == "Chat Nou"
            else generate_topic_title(workflow.raw_request)
        )
        initial_messages: List[Dict[str, Any]] = []
        if workflow.raw_request and workflow.raw_request.strip() not in ("", "Chat Nou"):
            initial_messages.append({"sender": "user", "text": workflow.raw_request, "file": None})
            steps = sorted(
                getattr(workflow, "planner_steps", []) or [],
                key=lambda s: getattr(s, "step_number", 0) or 0
            )
            for _ in steps:
                initial_messages.append({
                    "sender": "assistant",
                    "text": "[Planner Master] Am preluat cererea, am descompus-o în pași și am validat acțiunile.",
                    "file": None
                })
            for approval in (getattr(workflow, "approvals", []) or []):
                if getattr(approval, "status", None) == "approved":
                    initial_messages.append({
                        "sender": "assistant",
                        "text": "✅ Aprobare umană confirmată. Acțiunile externe au fost executate cu succes!",
                        "file": None
                    })

        chats_map[chat_key] = {
            "id": chat_key,
            "user_id": str(workflow.user_id),
            "title": initial_title,
            "created_at": workflow.created_at.isoformat() if getattr(workflow, "created_at", None) else datetime.utcnow().isoformat(),
            "messages": initial_messages
        }
        _save_store(store)
    return chats_map[chat_key]


def _get_workflow_title(workflow: Workflow, store: Optional[Dict[str, Any]] = None) -> str:
    data = store if store is not None else _load_store()
    record = _ensure_chat_record(workflow, data)
    if record.get("title"):
        return record["title"]
    if workflow.raw_request and workflow.raw_request != "Chat Nou":
        return generate_topic_title(workflow.raw_request)
    return "Chat Nou"


def _build_chat_messages(workflow: Workflow, store: Optional[Dict[str, Any]] = None) -> List[dict]:
    """Returnează mesajele și fișierele salvate, păstrând obiectul file intact pentru randarea cardului."""
    data = store if store is not None else _load_store()
    record = _ensure_chat_record(workflow, data)
    clean_msgs = []
    for m in (record.get("messages") or []):
        if not isinstance(m, dict):
            continue
        norm_file = _normalize_file(m.get("file"))
        txt = (m.get("text") or "").strip()

        # Dacă mesajul a fost salvat accidental ca text de tip "Fișier atașat: nume.ext" fără file, îl convertim în file
        if not norm_file and txt.lower().startswith("fișier atașat:"):
            fname = txt.split(":", 1)[1].strip()
            if fname:
                norm_file = _normalize_file({"name": fname, "source": "local"})
                txt = ""

        if txt or norm_file:
            clean_msgs.append({
                "sender": m.get("sender") or "user",
                "text": txt,
                "file": norm_file
            })
    return clean_msgs


@router.get("/chats")
def get_chats(user_id: Optional[UUID] = None, db: Session = Depends(get_db)):
    """Returnează doar chat-urile în care există activitate (mesaje sau fișiere)."""
    store = _load_store()
    query = db.query(Workflow)
    if user_id:
        query = query.filter(Workflow.user_id == user_id)
    chats = query.order_by(Workflow.created_at.desc()).all()

    if not chats:
        chats = db.query(Workflow).order_by(Workflow.created_at.desc()).all()

    result = []
    for chat in chats:
        if not _has_user_activity(chat, store):
            continue
        title = _get_workflow_title(chat, store)
        result.append({
            "id": str(chat.id),
            "user_id": str(chat.user_id),
            "raw_request": chat.raw_request,
            "title": title,
            "status": getattr(chat, "status", "pending"),
            "created_at": chat.created_at.isoformat() if getattr(chat, "created_at", None) else None
        })
    return result


@router.get("/chats/{chat_id}/messages")
def get_chat_messages(chat_id: UUID, db: Session = Depends(get_db)):
    """Returnează istoricul complet al mesajelor/fișierelor și starea de aprobare pentru un chat existent."""
    workflow = db.query(Workflow).filter(Workflow.id == chat_id).first()
    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow-ul nu a fost găsit.")

    store = _load_store()
    msgs = _build_chat_messages(workflow, store)
    has_file_only_last = bool(msgs) and msgs[-1].get("sender") == "user" and msgs[-1].get("file") and not msgs[-1].get("text")
    approvals = getattr(workflow, "approvals", []) or []
    pending_approval = (not has_file_only_last) and any(getattr(a, "status", None) == "pending_approval" for a in approvals)

    return {
        "chat_id": str(workflow.id),
        "title": _get_workflow_title(workflow, store),
        "messages": msgs,
        "requiresApproval": pending_approval
    }


@router.post("/chats")
def create_chat(user_id: Optional[UUID] = None, payload: WorkflowCreate = ..., db: Session = Depends(get_db)):
    """Creează un nou workflow (chat session) asociat unui utilizator."""
    user = None
    if user_id:
        user = db.query(User).filter(User.id == user_id).first()
    if not user:
        user = db.query(User).first()
    if not user:
        raise HTTPException(status_code=404, detail="Utilizatorul nu a fost găsit.")

    payload_dict = payload.model_dump() if hasattr(payload, "model_dump") else payload.dict()
    clean_file = _normalize_file(payload_dict.get("file"))

    topic_source = (
        clean_file["name"]
        if clean_file and (not payload.raw_request or not payload.raw_request.strip())
        else payload.raw_request
    )

    initial_title = (
        "Chat Nou"
        if not topic_source or topic_source.strip() == "Chat Nou"
        else generate_topic_title(topic_source)
    )

    new_workflow = Workflow(
        user_id=user.id,
        raw_request=topic_source or "Chat Nou",
        status="pending"
    )

    db.add(new_workflow)
    db.commit()
    db.refresh(new_workflow)

    store = _load_store()
    record = _ensure_chat_record(new_workflow, store)
    record["title"] = initial_title

    if clean_file or (payload.raw_request and payload.raw_request.strip() not in ("", "Chat Nou")):
        record["messages"] = [{
            "sender": "user",
            "text": (payload.raw_request or "").strip(),
            "file": clean_file
        }]
    _save_store(store)

    return {
        "id": str(new_workflow.id),
        "user_id": str(new_workflow.user_id),
        "raw_request": new_workflow.raw_request,
        "title": initial_title,
        "status": getattr(new_workflow, "status", "pending"),
        "created_at": new_workflow.created_at.isoformat() if getattr(new_workflow, "created_at", None) else None
    }


@router.post("/chats/{chat_id}/messages")
def send_message(chat_id: UUID, payload: WorkflowCreate, db: Session = Depends(get_db)):
    """Salvează mesajul / fișierul în istoric; dacă este doar fișier fără LLM configurat, nu generează răspuns automat."""
    workflow = db.query(Workflow).filter(Workflow.id == chat_id).first()
    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow-ul nu a fost găsit.")

    payload_dict = payload.model_dump() if hasattr(payload, "model_dump") else payload.dict()
    clean_file = _normalize_file(payload_dict.get("file"))
    text_clean = (payload.raw_request or "").strip()

    store = _load_store()
    record = _ensure_chat_record(workflow, store)
    existing_messages = record.get("messages") or []

    user_has_sent_before = any(m.get("sender") == "user" for m in existing_messages)
    topic_source = text_clean or (clean_file["name"] if clean_file else "")

    is_first_message = (not user_has_sent_before) and bool(topic_source)
    if is_first_message:
        workflow.raw_request = topic_source
        generated_title = generate_topic_title(topic_source)
        record["title"] = generated_title
    else:
        generated_title = None

    already_added_on_create = (
            len(existing_messages) == 1
            and existing_messages[0].get("sender") == "user"
            and (existing_messages[0].get("text") or "") == text_clean
            and _normalize_file(existing_messages[0].get("file")) == clean_file
    )

    if not already_added_on_create and (text_clean or clean_file):
        existing_messages.append({
            "sender": "user",
            "text": text_clean,
            "file": clean_file
        })

    # Dacă s-a trimis un fișier fără text, nu generăm răspuns de la asistent (LLM neconfigurat)
    if clean_file and not text_clean:
        record["messages"] = existing_messages
        _save_store(store)
        db.commit()
        return {
            "success": True,
            "newTitle": generated_title,
            "reply": None,
            "requiresApproval": False
        }

    assistant_reply = "[Planner Master] Am preluat cererea, am descompus-o în pași și am validat acțiunile."
    existing_messages.append({"sender": "assistant", "text": assistant_reply, "file": None})
    record["messages"] = existing_messages
    _save_store(store)

    existing_steps = getattr(workflow, "planner_steps", []) or []
    next_step_number = len(existing_steps) + 1

    step = PlannerStep(
        workflow_id=workflow.id,
        step_number=next_step_number,
        description=f"Analiză obiectiv: {text_clean}",
        assigned_role="Planner Master",
        status="pending"
    )
    db.add(step)

    approval = UserApproval(
        workflow_id=workflow.id,
        action_type="Write Action",
        action_payload=f"Executare scriere/modificare pentru: {text_clean}",
        status="pending_approval"
    )
    db.add(approval)
    db.commit()

    return {
        "success": True,
        "newTitle": generated_title,
        "reply": assistant_reply,
        "requiresApproval": True
    }


@router.post("/chats/{chat_id}/approve")
def approve_action(chat_id: UUID, db: Session = Depends(get_db)):
    """Confirmă aprobarea umană (Human-in-the-Loop) și actualizează starea în baza de date."""
    approval = db.query(UserApproval).filter(
        UserApproval.workflow_id == chat_id,
        UserApproval.status == "pending_approval"
    ).first()

    if approval:
        approval.status = "approved"
        approval.decided_at = datetime.utcnow()
        db.commit()

    workflow = db.query(Workflow).filter(Workflow.id == chat_id).first()
    if workflow:
        workflow.status = "completed"
        db.commit()

    confirm_msg = "✅ Aprobare umană confirmată. Acțiunile externe au fost executate cu succes!"

    store = _load_store()
    chat_key = str(chat_id)
    if chat_key in store.get("chats", {}):
        msgs = store["chats"][chat_key].get("messages") or []
        msgs.append({"sender": "assistant", "text": confirm_msg, "file": None})
        store["chats"][chat_key]["messages"] = msgs
        _save_store(store)

    return {
        "success": True,
        "message": confirm_msg
    }


@router.get("/chats/{chat_id}/logs")
def get_logs(chat_id: UUID, db: Session = Depends(get_db)):
    """Returnează jurnalele de execuție asociate unui workflow."""
    workflow = db.query(Workflow).filter(Workflow.id == chat_id).first()
    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow-ul nu a fost găsit.")

    logs = [
        {
            "agent_name": log.agent_name,
            "tool_name": log.tool_name,
            "success": log.success,
            "timestamp": log.timestamp
        }
        for log in workflow.execution_logs
    ]
    return logs