# Spectrum Lab Frontend

React TypeScript frontend for the Spectrum Lab RF signal analyzer.

## Features

- **Real-time Spectrum Display** - Canvas-based spectrum visualization
- **Waterfall Display** - Time-frequency representation
- **Interactive Markers** - Peak detection and frequency markers
- **Recording Management** - IQ and audio recording controls
- **Device Control** - Start/stop streaming, frequency/gain adjustment
- **Settings Panel** - Comprehensive analyzer configuration

## Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **Axios** - HTTP client
- **Socket.IO** - Real-time communication

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
cd frontend
npm install
```

### Development

```bash
npm run dev
```

The development server will start on `http://localhost:5173`

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
src/
├── app/                    # Application layer
│   ├── App.tsx            # Main app component
│   ├── router/            # React Router setup
│   ├── services/          # API and WebSocket services
│   ├── store/             # Zustand state management
│   └── events/            # Event system
├── domain/                 # Domain layer
│   ├── models/            # Domain models
│   └── valueObjects/      # Value objects
├── presentation/           # Presentation layer
│   ├── controllers/       # UI controllers
│   ├── hooks/             # Custom React hooks
│   └── views/             # React components
└── shared/                 # Shared utilities
    ├── constants/         # App constants
    ├── types/             # TypeScript types
    ├── utils/             # Utility functions
    └── theme/             # Theme configuration
```

## Architecture

Follows Clean Architecture principles:

- **Presentation Layer**: React components, controllers, hooks
- **Application Layer**: Use cases, services, state management
- **Domain Layer**: Business logic, models, value objects
- **Infrastructure Layer**: API calls, WebSocket connections (in backend)

## Key Components

### Spectrum View
- Real-time spectrum display with canvas rendering
- Interactive marker placement
- Device control buttons
- Status indicators

### Waterfall View
- Time-frequency visualization
- Turbo colormap
- Frequency and time axis labels

### Recordings View
- Session management
- Recording controls (IQ/Audio)
- File listing and download

### Settings View
- Comprehensive analyzer configuration
- Device status display
- Real-time parameter adjustment

## API Integration

Communicates with the FastAPI backend via:

- **REST API**: Device control, settings, recordings
- **WebSocket**: Real-time spectrum/waterfall data

## Development Notes

- Uses Zustand for state management
- Canvas-based rendering for performance
- Responsive design with Tailwind CSS
- TypeScript for type safety
- ESLint for code quality
