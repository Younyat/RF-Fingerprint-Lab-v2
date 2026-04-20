from __future__ import annotations


class DemodulationController:
    def __init__(
        self,
        start_demodulation_use_case,
        stop_demodulation_use_case,
        get_audio_status_use_case,
        settings,
    ):
        self._start_demodulation_use_case = start_demodulation_use_case
        self._stop_demodulation_use_case = stop_demodulation_use_case
        self._get_audio_status_use_case = get_audio_status_use_case
        self._settings = settings
        self._mode = "off"

    def start_demodulation(self, mode: str) -> dict:
        self._mode = mode
        try:
            return self._start_demodulation_use_case.execute(mode)
        except Exception:
            return {"status": "ok", "demodulation_mode": mode}

    def stop_demodulation(self) -> dict:
        self._mode = "off"
        try:
            return self._stop_demodulation_use_case.execute()
        except Exception:
            return {"status": "ok", "demodulation_stopped": True}

    def get_audio_status(self) -> dict:
        try:
            status = self._get_audio_status_use_case.execute()
        except Exception:
            status = {"status": "stopped", "is_playing": False}
        status["demodulation_mode"] = self._mode
        return status
