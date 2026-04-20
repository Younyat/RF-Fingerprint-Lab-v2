// Domain Types
export interface SpectrumData {
  timestamp: number;
  centerFrequency: number;
  span: number;
  frequencyArray: number[];
  powerLevels: number[];
}

export interface WaterfallData {
  timestamp: number;
  centerFrequency: number;
  span: number;
  data: number[][];
}

export interface Marker {
  id: string;
  label: string;
  frequency: number;
  level: number;
  type: 'normal' | 'delta' | 'noise' | 'peak';
  enabled: boolean;
}

export interface DeviceStatus {
  isConnected: boolean;
  driver: string;
  centerFrequency: number;
  sampleRate: number;
  gain: number;
  antenna?: string;
  lastError?: string | null;
}

export interface AnalyzerSettings {
  centerFrequency: number;
  span: number;
  rbw: number;
  vbw: number;
  referenceLevel: number;
  noiseFloorOffset: number;
  detectorMode: 'sample' | 'average' | 'peak' | 'min_hold';
  averaging: number;
  smoothing: number;
}

export interface Recording {
  id: string;
  sessionId: string;
  timestamp: number;
  duration: number;
  filePath: string;
  size: number;
  type: 'iq' | 'audio';
}

export interface Session {
  id: string;
  name: string;
  createdAt: number;
  recordings: Recording[];
  notes?: string;
}

export interface Preset {
  id: string;
  name: string;
  settings: AnalyzerSettings;
  createdAt: number;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

// Form Types
export interface FrequencyInput {
  value: number;
  unit: 'Hz' | 'kHz' | 'MHz' | 'GHz';
}

export interface GainInput {
  value: number;
  mode: 'auto' | 'manual';
}

// UI State Types
export interface UiState {
  theme: 'light' | 'dark';
  sidebarCollapsed: boolean;
  activeTab: 'spectrum' | 'waterfall' | 'recordings' | 'settings';
}

// Event Types
export interface SpectrumUpdateEvent {
  type: 'spectrum_update';
  data: SpectrumData;
}

export interface WaterfallUpdateEvent {
  type: 'waterfall_update';
  data: WaterfallData;
}

export interface DeviceStatusEvent {
  type: 'device_status';
  data: DeviceStatus;
}

export type AppEvent = SpectrumUpdateEvent | WaterfallUpdateEvent | DeviceStatusEvent;
