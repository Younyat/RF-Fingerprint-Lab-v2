from __future__ import annotations

from datetime import datetime, timezone
from typing import Any


def utc_now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def build_ws_event(event_type: str, payload: dict[str, Any]) -> dict[str, Any]:
    if not event_type.strip():
        raise ValueError("event_type must not be empty")

    return {
        "event_type": event_type,
        "timestamp_utc": utc_now_iso(),
        "payload": payload,
    }