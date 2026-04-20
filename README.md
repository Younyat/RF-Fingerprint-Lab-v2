# **Spectrum Lab** - RF Signal Analyzer

Advanced RF spectrum analyzer with real-time visualization, signal demodulation, and recording capabilities. Built with Python (FastAPI) backend and React (TypeScript) frontend using Clean Architecture.

## ✨ Features

### Core Analysis
- **Live Spectrum** - Real-time FFT-based spectrum analysis
- **Waterfall Display** - Scrolling frequency-time representation
- **Markers & Measurements** - Peak detection, frequency markers
- **Configurable Resolution** - RBW, VBW, averaging, smoothing
- **Multiple Detector Modes** - Sample, Average, Peak, Min hold

### Device Support
- **USRP Devices** (UHD library) - Professional SDR
- **RTL-SDR Dongles** (pyrtlsdr) - Low-cost USB receiver
- **Mock Device** - Software testing without hardware

### Signal Processing
- **Demodulation** - AM, FM (NFM), WFM, SSB (USB/LSB)
- **Filtering** - FIR/IIR filters (lowpass, bandpass, notch)
- **Digital Windowing** - Hann, Hamming, Blackman, Bartlett
- **Audio Output** - Real-time audio from demodulated signals

### Recording & Storage
- **IQ Recording** - Raw complex64 samples
- **Audio Recording** - PCM WAV format
- **Sessions** - Group related captures
- **Presets** - Save/load configurations
- **Metadata** - Auto-stored with captures

### Visualization
- **Canvas-based Rendering** - High-performance spectrum/waterfall
- **Interactive Controls** - Zoom, pan, frequency navigation
- **Configurable Colormaps** - Turbo, Viridis, Plasma, Inferno
- **Real-time Updates** - WebSocket streaming

## 🏗️ Architecture

**Clean Architecture** + **SOLID Principles**

```
Presentation (React/TypeScript)
         ↕
Application Layer (Use Cases, DTOs)
         ↕
Domain Layer (Entities, Services)
         ↕
Infrastructure (Devices, DSP, Persistence)
```

## 📦 Tech Stack

| Component | Technology |
|-----------|-----------|
| **Backend** | FastAPI, Python 3.10+ |
| **Frontend** | React 18, TypeScript, Vite |
| **DSP** | NumPy, SciPy, Librosa |
| **SDR** | UHD, pyrtlsdr |
| **Storage** | JSON (extensible to SQL) |
| **Streaming** | WebSockets |

## 🚀 Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+
- SDR hardware (optional, mock device available)

### Automated Setup
```bash
# One-command setup for both backend and frontend
./scripts/init_project.sh
```

### Manual Setup

#### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python -m uvicorn app.main:app --reload
```
**API**: `http://localhost:8000`

#### Frontend
```bash
cd frontend
npm install
npm run dev
```
**App**: `http://localhost:5173`

## 📖 Usage

### Basic Operation
1. Start both backend and frontend
2. Select device (Mock for testing, UHD for USRP, RTL-SDR for dongles)
3. Click "Start" to begin spectrum streaming
4. Adjust center frequency, span, and other settings
5. Add markers by clicking on the spectrum
6. Use "Peak" button for automatic peak detection

### Recording
1. Create a new session or select existing
2. Choose recording type (IQ Data or Audio)
3. Click "Start Recording"
4. Stop when finished
5. View recordings in the Recordings tab

### Demodulation
1. Set center frequency to target signal
2. Select demodulation mode (AM, FM, WFM, SSB)
3. Start demodulation to hear audio

## 🔧 Configuration

Edit `backend/app/config/settings.py`:
```python
default_device.driver = "mock"  # "uhd", "rtl_sdr", "mock"
default_spectrum.fft_size = 4096
default_spectrum.detector_mode = "sample"
```

## 📁 Project Structure

```
spectrum-lab/
├── backend/                 # FastAPI backend
│   ├── app/
│   │   ├── config/         # Settings, constants
│   │   ├── domain/         # Entities, services
│   │   ├── application/    # Use cases, DTOs
│   │   └── infrastructure/ # Devices, DSP, web
│   └── requirements.txt
├── frontend/                # React frontend
│   ├── src/
│   │   ├── app/            # State, services, router
│   │   ├── domain/         # Models, value objects
│   │   ├── presentation/   # Components, hooks
│   │   └── shared/         # Utils, types, theme
│   └── package.json
└── scripts/
    └── init_project.sh     # Automated setup
```

## 🎯 Key Features

### Real-time Performance
- 10 FPS spectrum updates
- WebSocket streaming
- Canvas-based rendering
- Optimized FFT processing

### Professional UI
- Clean, modern interface
- Responsive design
- Dark/light theme support
- Intuitive controls

### Comprehensive Analysis
- Multiple detector modes
- Configurable resolution
- Interactive markers
- Peak detection

### Flexible Recording
- IQ data for analysis
- Audio for listening
- Session organization
- Metadata storage

## 🔌 API Reference

### REST Endpoints
- `GET /api/device/status` - Device connection status
- `POST /api/device/stream/start` - Start spectrum streaming
- `GET /api/spectrum/live` - Get current spectrum data
- `POST /api/markers` - Create frequency marker
- `POST /api/recordings/start` - Start IQ/audio recording

### WebSocket Events
- `spectrum_update` - Real-time spectrum data
- `waterfall_update` - Real-time waterfall data
- `device_status` - Device status changes

Full API documentation at `http://localhost:8000/docs`

## 🛠️ Development

### Backend Development
```bash
cd backend
source venv/bin/activate
python -m uvicorn app.main:app --reload --host 0.0.0.0
```

### Frontend Development
```bash
cd frontend
npm run dev -- --host 0.0.0.0
```

### Testing
```bash
# Backend tests
cd backend && python -m pytest

# Frontend tests (when implemented)
cd frontend && npm test
```

## 📚 Documentation

- [Backend Setup Guide](backend/README_SETUP.md)
- [API Documentation](http://localhost:8000/docs)
- [Architecture Overview](docs/architecture/)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Built with FastAPI, React, and modern web technologies
- SDR support via UHD and pyrtlsdr libraries
- Signal processing powered by NumPy and SciPy

## 🔧 Configuration

Edit `backend/app/config/settings.py`:
```python
default_device.driver = "mock"  # "uhd", "rtl_sdr", "mock"
default_spectrum.fft_size = 4096
default_spectrum.detector_mode = "sample"
```

## 📋 Development Roadmap

- ✅ Phase 1: Core analyzer, spectrum, waterfall, markers, IQ recording
- 🔄 Phase 2: Demodulation (AM/FM/WFM), audio, filters
- ⏳ Phase 3: Advanced measurements, RBW/VBW, peak detection
- ⏳ Phase 4: Multi-trace, max/min hold, offline playback

## 🧪 Testing

```bash
cd backend
pytest tests/  # Unit tests
pytest --cov  # With coverage
```

## 📚 Documentation

- [Architecture](docs/architecture/) - Design details
- [API Reference](backend/README_SETUP.md#api-endpoints) - REST endpoints
- [Troubleshooting](backend/README_SETUP.md#troubleshooting) - Common issues

## 🤝 Contributing

1. Follow Clean Architecture
2. Add tests for features
3. Update documentation
4. Submit PR

## 📄 License

MIT License

## ❓ Support

- 📖 Read [docs/architecture/system_overview.md](docs/architecture/system_overview.md)
- 🐛 Check existing issues
- 💬 Open a discussion

---

**Spectrum Lab** v0.1.0 - Professional RF Analysis Tool
