import { useEffect } from 'react';
import { AppRouter } from './router/AppRouter';
import { ApiService, WebSocketService } from './services/ApiService';
import { useAppActions } from './store/AppStore';
import { eventEmitter } from './events/EventEmitter';

const apiService = new ApiService();
const wsService = new WebSocketService();

function App() {
  const actions = useAppActions();

  useEffect(() => {
    // Initialize WebSocket connection
    wsService.connect();

    // Set up WebSocket event listeners
    wsService.onSpectrumUpdate((data) => {
      actions.setSpectrumData(data);
    });

    wsService.onWaterfallUpdate((data) => {
      actions.addWaterfallData(data);
    });

    wsService.onDeviceStatusUpdate((status) => {
      actions.setDeviceStatus(status);
    });

    // Load initial data
    const loadInitialData = async () => {
      try {
        const [deviceStatus, recordings, sessions, presets] = await Promise.all([
          apiService.getDeviceStatus(),
          apiService.getRecordings(),
          apiService.getSessions(),
          apiService.getPresets(),
        ]);

        actions.setDeviceStatus(deviceStatus);
        recordings.forEach(recording => actions.addRecording(recording));
        sessions.forEach(session => actions.addSession(session));
        presets.forEach(preset => actions.addPreset(preset));
      } catch (error) {
        console.error('Failed to load initial data:', error);
      }
    };

    loadInitialData();

    // Cleanup
    return () => {
      wsService.disconnect();
      eventEmitter.removeAllListeners();
    };
  }, [actions]);

  return <AppRouter />;
}

export { App };
