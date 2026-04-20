import { AppEvent } from '../../shared/types';

type EventCallback<T extends AppEvent> = (event: T) => void;

class EventEmitter {
  private listeners: Map<string, EventCallback<any>[]> = new Map();

  on<T extends AppEvent>(eventType: T['type'], callback: EventCallback<T>) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }
    this.listeners.get(eventType)!.push(callback);
  }

  off<T extends AppEvent>(eventType: T['type'], callback: EventCallback<T>) {
    const listeners = this.listeners.get(eventType);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index !== -1) {
        listeners.splice(index, 1);
      }
    }
  }

  emit(event: AppEvent) {
    const listeners = this.listeners.get(event.type);
    if (listeners) {
      listeners.forEach(callback => callback(event));
    }
  }

  removeAllListeners(eventType?: string) {
    if (eventType) {
      this.listeners.delete(eventType);
    } else {
      this.listeners.clear();
    }
  }
}

export const eventEmitter = new EventEmitter();

// Convenience functions for common events
export const emitSpectrumUpdate = (data: any) => {
  eventEmitter.emit({
    type: 'spectrum_update',
    data,
  });
};

export const emitWaterfallUpdate = (data: any) => {
  eventEmitter.emit({
    type: 'waterfall_update',
    data,
  });
};

export const emitDeviceStatusUpdate = (data: any) => {
  eventEmitter.emit({
    type: 'device_status',
    data,
  });
};