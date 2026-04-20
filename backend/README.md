# README
# Spectrum Lab Backend

Backend service for Spectrum Lab.

## Current status

The project structure, core domain entities, DTOs, use cases, controllers, routes, and dependency container are in place.

The backend currently supports:

- analyzer settings model
- device state model
- spectrum and waterfall entities
- marker entities
- session and preset persistence using JSON repositories
- FastAPI routing skeleton
- mock SDR adapter
- initial UHD adapter
- initial DSP utility modules

## Run

```bash
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000






---

## `backend/app/config/constants.py`

```python id="96818"
APP_NAME = "Spectrum Lab"
DEFAULT_AUDIO_SAMPLE_RATE_HZ = 48_000
DEFAULT_FFT_SIZE = 4096
DEFAULT_WATERFALL_HISTORY = 400

SUPPORTED_DETECTOR_MODES = ("sample", "average", "peak", "min")
SUPPORTED_TRACE_MODES = ("clear_write", "average", "max_hold", "min_hold")
SUPPORTED_DEMODULATION_MODES = ("off", "am", "fm", "wfm", "usb", "lsb", "cw")
SUPPORTED_WINDOW_TYPES = ("rectangular", "hann", "hamming", "blackman")
SUPPORTED_FILTER_TYPES = ("off", "low_pass", "high_pass", "band_pass", "band_stop", "notch")