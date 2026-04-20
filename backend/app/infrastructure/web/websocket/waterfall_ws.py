from __future__ import annotations

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.infrastructure.web.websocket.events import build_ws_event


def build_waterfall_ws_router(get_waterfall_payload) -> APIRouter:
    router = APIRouter()

    @router.websocket("/ws/waterfall")
    async def waterfall_ws(websocket: WebSocket) -> None:
        await websocket.accept()
        try:
            while True:
                payload = get_waterfall_payload()
                await websocket.send_json(build_ws_event(event_type="waterfall_frame", payload=payload))
                await websocket.receive_text()
        except WebSocketDisconnect:
            return

    return router