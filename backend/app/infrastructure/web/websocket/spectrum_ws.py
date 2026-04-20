from __future__ import annotations

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.infrastructure.web.websocket.events import build_ws_event


def build_spectrum_ws_router(get_spectrum_payload) -> APIRouter:
    router = APIRouter()

    @router.websocket("/ws/spectrum")
    async def spectrum_ws(websocket: WebSocket) -> None:
        await websocket.accept()
        try:
            while True:
                payload = get_spectrum_payload()
                await websocket.send_json(build_ws_event(event_type="spectrum_frame", payload=payload))
                await websocket.receive_text()
        except WebSocketDisconnect:
            return

    return router