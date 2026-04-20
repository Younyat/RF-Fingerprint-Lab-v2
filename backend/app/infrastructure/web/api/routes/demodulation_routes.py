from __future__ import annotations
from fastapi import APIRouter
from pydantic import BaseModel


class StartDemodulationBody(BaseModel):
    mode: str
    frequency_hz: float | None = None

def build_demodulation_router(controller) -> APIRouter:
    router = APIRouter(prefix="/demodulation", tags=["demodulation"])
    
    @router.post("/start")
    async def start_demodulation(body: StartDemodulationBody):
        return controller.start_demodulation(body.mode)
    
    @router.post("/stop")
    async def stop_demodulation():
        return controller.stop_demodulation()
    
    @router.get("/audio/status")
    async def get_audio_status():
        return controller.get_audio_status()
    
    return router
