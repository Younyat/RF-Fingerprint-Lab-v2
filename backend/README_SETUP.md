## **Spectrum Lab - Complete Setup Guide**

### Prerequisites
- Python 3.10 or higher
- Node.js 18 or higher
- npm or yarn
- pip or conda
- Optional: UHD library for USRP devices
- Optional: RTL-SDR library for RTL dongles

---

## **🚀 Quick Start (Backend + Frontend)**

### 1. **Clone and Setup Project**
```bash
# Navigate to project directory
cd spectrum-lab

# Run automatic setup script
./scripts/init_project.sh
```

### 2. **Start Backend**
```bash
# Terminal 1 - Backend
cd backend
source venv/bin/activate  # Linux/Mac
# or
venv\Scripts\activate     # Windows

# Start backend server
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 3. **Start Frontend**
```bash
# Terminal 2 - Frontend
cd frontend

# Install dependencies (if not done by init script)
npm install

# Start development server
npm run dev
```

### 4. **Access Application**
- **Frontend App**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

---

## **🔧 Backend Setup (Detailed)**

### Prerequisites
- Python 3.10 or higher
- pip or conda
- Optional: UHD library for USRP devices
- Optional: RTL-SDR library for RTL dongles

### Installation

#### 1. **Create Virtual Environment**
```bash
cd backend
python -m venv venv

# Activate (Linux/Mac)
source venv/bin/activate

# Activate (Windows)
venv\Scripts\activate
```

#### 2. **Install Dependencies**
```bash
pip install -r requirements.txt
```

**Note**: Some optional dependencies may require system-level packages:
- For UHD support: Install UHD library system-wide first
- For RTL-SDR support: `pip install pyrtlsdr`
- For audio: `pip install librosa soundfile`

### Running the Backend

#### Development Mode
```bash
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

#### Production Mode
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

#### Docker
```bash
# Build image
docker build -t spectrum-lab-backend .

# Run container
docker run -p 8000:8000 spectrum-lab-backend
```

### API Documentation
Once running, visit: `http://localhost:8000/docs`

### Configuration
Edit `app/config/settings.py` to customize:
- Default device driver (uhd, rtl_sdr, mock)
- Spectrum settings (FFT size, detector mode, etc.)
- Waterfall settings (history size, colormap)
- Recording settings
- Demodulation settings

---

## **🎨 Frontend Setup (Detailed)**

### Prerequisites
- Node.js 18 or higher
- npm or yarn

### Installation

#### 1. **Navigate to Frontend Directory**
```bash
cd frontend
```

#### 2. **Install Dependencies**
```bash
npm install
```

### Running the Frontend

#### Development Mode
```bash
npm run dev
```
- Starts Vite development server
- Hot reload enabled
- API proxy configured to backend

#### Production Build
```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

#### Linting and Type Checking
```bash
# Run ESLint
npm run lint

# Run TypeScript check
npm run type-check
```

### Configuration
The frontend is configured to connect to the backend automatically:
- **Development**: Proxies API calls to `http://localhost:8000`
- **Production**: Configure the API base URL in production environment

### Project Structure
```
frontend/src/
├── main.tsx                     # Application entry point
├── app/                         # Application Layer
│   ├── App.tsx                  # Main app component
│   ├── router/                  # React Router configuration
│   ├── services/                # API and WebSocket services
│   ├── store/                   # Zustand global state
│   └── events/                  # Event system
├── domain/                      # Domain Layer
│   ├── models/                  # Domain models
│   └── valueObjects/            # Value objects
├── presentation/                # Presentation Layer
│   ├── controllers/             # UI controllers
│   ├── hooks/                   # Custom hooks
│   └── views/                   # React components
└── shared/                      # Shared utilities
    ├── types/                   # TypeScript types
    ├── constants/               # Application constants
    ├── utils/                   # Utility functions
    └── theme/                   # UI theme configuration
```

---

## **🏗️ Project Architecture**

### Clean Architecture Overview
```
Presentation Layer (React Components)
         ↕
Application Layer (Controllers, Hooks, Store)
         ↕
Domain Layer (Models, Value Objects)
         ↕
Infrastructure (API, WebSocket, DSP, Devices)
```

### Backend Structure
```
app/
├── main.py                      # FastAPI application entry
├── config/
│   ├── settings.py             # Configuration
│   ├── constants.py            # Global constants
│   └── logging_config.py       # Logging setup
├── domain/                      # Clean Architecture Domain Layer
│   ├── entities/               # Business entities
│   ├── value_objects/          # Value objects
│   ├── services/               # Domain services
│   └── repositories/           # Repository interfaces
├── application/                 # Application Layer (Use Cases)
│   ├── use_cases/              # Business logic orchestration
│   ├── dto/                    # Data Transfer Objects
│   └── interfaces/             # Abstract providers
├── infrastructure/             # Infrastructure Layer
│   ├── devices/                # Device adapters (UHD, RTL-SDR, Mock)
│   ├── dsp/                    # DSP modules (FFT, filters, demod)
│   ├── persistence/            # Data repositories (JSON-based)
│   ├── web/                    # Web layer (FastAPI routes, controllers)
│   └── di/                     # Dependency Injection container
└── tests/                       # Unit, integration, E2E tests
```

---

## **🔌 API Integration**

### REST Endpoints

#### Device Control
- `GET /api/device/status` - Get device status
- `POST /api/device/stream/start` - Start streaming
- `POST /api/device/stream/stop` - Stop streaming
- `POST /api/device/frequency` - Set center frequency
- `POST /api/device/gain` - Set gain

#### Spectrum Analysis
- `GET /api/spectrum/live` - Get live spectrum

#### Markers
- `GET /api/markers/` - List markers
- `POST /api/markers/` - Create marker
- `DELETE /api/markers/{id}` - Delete marker

#### Recording
- `GET /api/recordings/` - List recordings
- `POST /api/recordings/start` - Start recording
- `POST /api/recordings/stop` - Stop recording

#### Demodulation
- `POST /api/demodulation/start` - Start demodulation
- `POST /api/demodulation/stop` - Stop demodulation
- `GET /api/demodulation/audio/status` - Get audio status

#### Presets
- `GET /api/presets/` - List presets
- `POST /api/presets/` - Save preset
- `GET /api/presets/{id}` - Load preset

### WebSocket Events
- `spectrum_update` - Real-time spectrum data
- `waterfall_update` - Waterfall data updates
- `device_status` - Device status changes

---

## **🧪 Testing**

### Backend Tests
```bash
cd backend

# Run all tests
pytest

# Run with coverage
pytest --cov=app

# Run specific test file
pytest tests/unit/test_spectrum_metrics.py
```

### Frontend Tests
```bash
cd frontend

# Run tests (when implemented)
npm test
```

---

## **🐳 Docker Setup**

### Full Stack with Docker Compose
```bash
# From project root
docker-compose up --build
```

### Individual Services
```bash
# Backend only
cd backend
docker build -t spectrum-lab-backend .
docker run -p 8000:8000 spectrum-lab-backend

# Frontend only
cd frontend
docker build -t spectrum-lab-frontend .
docker run -p 5173:5173 spectrum-lab-frontend
```

---

## **🔧 Troubleshooting**

### Backend Issues

**Device not found**
- Check USB connection
- Verify driver installation (`lsusb` or Device Manager)
- Try mock device for testing

**Import errors**
- Ensure virtual environment is activated
- Check `pip list` shows all required packages
- Try: `pip install --upgrade --force-reinstall -r requirements.txt`

**Frequency/Gain out of range**
- Check constants.py for device limits
- Some devices have discrete gain values
- RTL-SDR gains are quantized

**Performance issues**
- Reduce FFT size or span
- Lower averaging count
- Disable waterfall history or reduce size
- Use decimation for high sample rates

### Frontend Issues

**Port conflicts**
- Backend runs on port 8000
- Frontend runs on port 5173
- Check if ports are available

**API connection errors**
- Ensure backend is running
- Check CORS settings in backend
- Verify API base URL configuration

**Build errors**
- Clear node_modules: `rm -rf node_modules && npm install`
- Clear cache: `npm run clean`
- Check Node.js version: `node --version`

---

## **📚 Development Workflow**

### Starting Development
1. Run `./scripts/init_project.sh` for initial setup
2. Start backend: `cd backend && source venv/bin/activate && python -m uvicorn app.main:app --reload`
3. Start frontend: `cd frontend && npm run dev`
4. Open browser: http://localhost:5173

### Adding New Features
1. **Backend**: Add use case in `application/use_cases/`
2. **Frontend**: Add controller in `presentation/controllers/`
3. **API**: Add route in `infrastructure/web/routes/`
4. **UI**: Add component in `presentation/views/`

### Code Quality
- Backend: Follow Clean Architecture principles
- Frontend: Use TypeScript strict mode
- Run linters: `npm run lint` (frontend), `black .` (backend)
- Add tests for new functionality

---

## **🚀 Deployment**

### Production Backend
```bash
# Using Gunicorn
pip install gunicorn
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

### Production Frontend
```bash
cd frontend
npm run build
# Serve dist/ folder with nginx or similar
```

### Environment Variables
Create `.env` files for configuration:
- Backend: Database URLs, device settings
- Frontend: API base URL, feature flags

---

## **📖 Additional Resources**

- **API Documentation**: http://localhost:8000/docs (when backend is running)
- **Frontend Storybook**: `npm run storybook` (when implemented)
- **Project Wiki**: See docs/ folder for detailed architecture docs
- **Contributing Guide**: See CONTRIBUTING.md

---

## **🎯 Quick Commands Reference**

```bash
# Full setup
./scripts/init_project.sh

# Backend only
cd backend && source venv/bin/activate && python -m uvicorn app.main:app --reload

# Frontend only
cd frontend && npm run dev

# Both services
# Terminal 1: backend command above
# Terminal 2: frontend command above

# Access URLs
# App: http://localhost:5173
# API: http://localhost:8000
# Docs: http://localhost:8000/docs
```

---

## **Contributing**
- Follow Clean Architecture principles
- Add tests for new features
- Update constants.py for new parameters
- Document new device adapters

## **License**
See LICENSE file in project root.
