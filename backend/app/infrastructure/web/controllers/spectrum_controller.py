from __future__ import annotations

from app.infrastructure.sdr.real_spectrum_stream import real_spectrum_stream


class SpectrumController:
    def __init__(
        self,
        get_live_spectrum_use_case,
        get_live_waterfall_use_case,
        set_span_use_case,
        set_rbw_use_case,
        set_vbw_use_case,
        set_noise_floor_offset_use_case,
        set_reference_level_use_case,
        set_detector_mode_use_case,
        set_averaging_use_case,
        settings,
    ):
        self._get_live_spectrum_use_case = get_live_spectrum_use_case
        self._get_live_waterfall_use_case = get_live_waterfall_use_case
        self._set_span_use_case = set_span_use_case
        self._set_rbw_use_case = set_rbw_use_case
        self._set_vbw_use_case = set_vbw_use_case
        self._set_noise_floor_offset_use_case = set_noise_floor_offset_use_case
        self._set_reference_level_use_case = set_reference_level_use_case
        self._set_detector_mode_use_case = set_detector_mode_use_case
        self._set_averaging_use_case = set_averaging_use_case
        self._settings = settings

    def get_spectrum(self, settings=None) -> dict:
        active_settings = settings or self._settings
        return real_spectrum_stream.get_latest(active_settings)

    def set_span(self, span_hz: float) -> dict:
        if span_hz <= 0:
            raise ValueError("span_hz must be > 0")
        self._settings.set_span(span_hz)
        self._settings.set_sample_rate(span_hz)
        real_spectrum_stream.stop()
        return {"status": "ok", "span_hz": span_hz}

    def set_center_frequency(self, frequency_hz: float) -> dict:
        if frequency_hz <= 0:
            raise ValueError("center_frequency_hz must be > 0")
        self._settings.set_center_frequency(frequency_hz)
        real_spectrum_stream.stop()
        return {
            "status": "ok",
            "center_frequency_hz": self._settings.frequency.center_frequency_hz,
            "start_frequency_hz": self._settings.frequency.start_frequency_hz,
            "stop_frequency_hz": self._settings.frequency.stop_frequency_hz,
        }

    def set_start_stop(self, start_frequency_hz: float, stop_frequency_hz: float) -> dict:
        if start_frequency_hz <= 0:
            raise ValueError("start_frequency_hz must be > 0")
        if stop_frequency_hz <= start_frequency_hz:
            raise ValueError("stop_frequency_hz must be greater than start_frequency_hz")

        span_hz = stop_frequency_hz - start_frequency_hz
        center_frequency_hz = start_frequency_hz + span_hz / 2.0
        self._settings.set_center_frequency(center_frequency_hz)
        self._settings.set_span(span_hz)
        self._settings.set_sample_rate(span_hz)
        real_spectrum_stream.stop()
        return {
            "status": "ok",
            "center_frequency_hz": center_frequency_hz,
            "span_hz": span_hz,
            "start_frequency_hz": start_frequency_hz,
            "stop_frequency_hz": stop_frequency_hz,
        }

    def set_rbw(self, rbw_hz: float) -> dict:
        self._settings.set_rbw(rbw_hz)
        return {"status": "ok", "rbw_hz": rbw_hz}

    def set_vbw(self, vbw_hz: float) -> dict:
        self._settings.set_vbw(vbw_hz)
        return {"status": "ok", "vbw_hz": vbw_hz}

    def set_noise_floor_offset(self, noise_floor_offset_db: float) -> dict:
        self._settings.set_noise_floor_offset(noise_floor_offset_db)
        return {"status": "ok", "noise_floor_offset_db": noise_floor_offset_db}

    def set_reference_level(self, reference_level_db: float) -> dict:
        self._settings.set_reference_level(reference_level_db)
        return {"status": "ok", "reference_level_db": reference_level_db}

    def set_detector_mode(self, detector_mode: str) -> dict:
        allowed_modes = {"sample", "average", "peak", "min", "min_hold"}
        if detector_mode not in allowed_modes:
            raise ValueError(f"detector_mode must be one of {sorted(allowed_modes)}")
        self._settings.set_detector_mode(detector_mode)
        return {"status": "ok", "detector_mode": detector_mode}

    def set_averaging(self, enabled: bool, averaging_factor: float | None = None) -> dict:
        self._settings.trace.averaging_enabled = enabled
        if averaging_factor is not None:
            if averaging_factor <= 0:
                raise ValueError("averaging_factor must be > 0")
            self._settings.trace.averaging_factor = averaging_factor
        return {"status": "ok", "averaging_enabled": enabled, "averaging_factor": averaging_factor}
