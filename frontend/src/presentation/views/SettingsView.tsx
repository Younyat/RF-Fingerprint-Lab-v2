import React, { useState } from 'react';
import { Save, RotateCcw } from 'lucide-react';
import { useSpectrumController } from '../controllers/SpectrumController';
import { useAnalyzerSettings, useDeviceStatus } from '../../app/store/AppStore';
import { DETECTOR_MODES } from '../../shared/constants';
import { cn } from '../../shared/utils';

export const SettingsView: React.FC = () => {
  const settings = useAnalyzerSettings();
  const deviceStatus = useDeviceStatus();
  const spectrumController = useSpectrumController();

  const [localSettings, setLocalSettings] = useState(settings);

  const handleSettingChange = (key: keyof typeof localSettings, value: any) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    try {
      // Update all settings
      await spectrumController.setCenterFrequency(localSettings.centerFrequency);
      await spectrumController.setSpan(localSettings.span);
      await spectrumController.setRbw(localSettings.rbw);
      await spectrumController.setVbw(localSettings.vbw);
      await spectrumController.setReferenceLevel(localSettings.referenceLevel);
      await spectrumController.setNoiseFloorOffset(localSettings.noiseFloorOffset);
      await spectrumController.setDetectorMode(localSettings.detectorMode);
      await spectrumController.setAveraging(localSettings.averaging);
      await spectrumController.setGain(localSettings.smoothing); // Note: reusing gain for smoothing

      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Failed to save settings:', error);
      alert('Failed to save settings');
    }
  };

  const handleReset = () => {
    setLocalSettings(settings);
  };

  return (
    <div className="h-full overflow-auto">
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-900">Analyzer Settings</h2>
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleReset}
                  className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset
                </button>
                <button
                  onClick={handleSave}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </button>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Frequency Settings */}
            <div>
              <h3 className="text-md font-medium text-gray-900 mb-4">Frequency Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Center Frequency (Hz)
                  </label>
                  <input
                    type="number"
                    value={localSettings.centerFrequency}
                    onChange={(e) => handleSettingChange('centerFrequency', Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Span (Hz)
                  </label>
                  <input
                    type="number"
                    value={localSettings.span}
                    onChange={(e) => handleSettingChange('span', Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Resolution Settings */}
            <div>
              <h3 className="text-md font-medium text-gray-900 mb-4">Resolution Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    RBW (Hz)
                  </label>
                  <input
                    type="number"
                    value={localSettings.rbw}
                    onChange={(e) => handleSettingChange('rbw', Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    VBW (Hz)
                  </label>
                  <input
                    type="number"
                    value={localSettings.vbw}
                    onChange={(e) => handleSettingChange('vbw', Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Display Settings */}
            <div>
              <h3 className="text-md font-medium text-gray-900 mb-4">Display Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reference Level (dBm)
                  </label>
                  <input
                    type="number"
                    value={localSettings.referenceLevel}
                    onChange={(e) => handleSettingChange('referenceLevel', Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Noise Floor Offset (dB)
                  </label>
                  <input
                    type="number"
                    value={localSettings.noiseFloorOffset}
                    onChange={(e) => handleSettingChange('noiseFloorOffset', Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Processing Settings */}
            <div>
              <h3 className="text-md font-medium text-gray-900 mb-4">Processing Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Detector Mode
                  </label>
                  <select
                    value={localSettings.detectorMode}
                    onChange={(e) => handleSettingChange('detectorMode', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {DETECTOR_MODES.map((mode) => (
                      <option key={mode.value} value={mode.value}>
                        {mode.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Averaging
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={localSettings.averaging}
                    onChange={(e) => handleSettingChange('averaging', Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Smoothing
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="1"
                    step="0.1"
                    value={localSettings.smoothing}
                    onChange={(e) => handleSettingChange('smoothing', Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Device Status */}
            <div>
              <h3 className="text-md font-medium text-gray-900 mb-4">Device Status</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Status:</span>
                    <span className={cn(
                      "ml-2",
                      deviceStatus.isConnected ? "text-green-600" : "text-red-600"
                    )}>
                      {deviceStatus.isConnected ? 'Connected' : 'Disconnected'}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Driver:</span>
                    <span className="ml-2 text-gray-900">{deviceStatus.driver}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Sample Rate:</span>
                    <span className="ml-2 text-gray-900">{(deviceStatus.sampleRate / 1000000).toFixed(1)} MS/s</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Gain:</span>
                    <span className="ml-2 text-gray-900">{deviceStatus.gain.toFixed(1)} dB</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
