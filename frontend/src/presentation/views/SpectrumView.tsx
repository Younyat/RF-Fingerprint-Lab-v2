import React, { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Play, Square, RotateCcw, Target, Usb, Unplug, Radio, Trash2, SlidersHorizontal } from 'lucide-react';
import { useSpectrum } from '../hooks/useSpectrum';
import { useSpectrumController } from '../controllers/SpectrumController';
import { getLevelAtFrequency, useMarkerController } from '../controllers/MarkerController';
import { useAnalyzerSettings, useDeviceStatus, useMarkers, useSpectrumData } from '../../app/store/AppStore';
import { formatFrequency, formatPowerLevel } from '../../shared/utils';
import { cn } from '../../shared/utils';
import { DETECTOR_MODES } from '../../shared/constants';
import type { AnalyzerSettings } from '../../shared/types';

const hzToMhz = (hz: number) => Number.isFinite(hz) ? hz / 1e6 : 0;
const mhzToHz = (mhz: string) => Number(mhz) * 1e6;
const khzToHz = (khz: string) => Number(khz) * 1e3;

const formatInput = (value: number, digits = 6) => {
  if (!Number.isFinite(value)) return '';
  return Number(value.toFixed(digits)).toString();
};

export const SpectrumView: React.FC = () => {
  const { canvasRef } = useSpectrum();
  const spectrumData = useSpectrumData();
  const deviceStatus = useDeviceStatus();
  const settings = useAnalyzerSettings();
  const markers = useMarkers();
  const spectrumController = useSpectrumController();
  const markerController = useMarkerController();

  const [isStreaming, setIsStreaming] = useState(false);
  const [centerMHz, setCenterMHz] = useState(formatInput(hzToMhz(settings.centerFrequency)));
  const [spanMHz, setSpanMHz] = useState(formatInput(hzToMhz(settings.span), 3));
  const [panStepMHz, setPanStepMHz] = useState(formatInput(hzToMhz(settings.span) / 10, 3));
  const [startMHz, setStartMHz] = useState(formatInput(hzToMhz(settings.centerFrequency - settings.span / 2)));
  const [stopMHz, setStopMHz] = useState(formatInput(hzToMhz(settings.centerFrequency + settings.span / 2)));
  const [rbwKHz, setRbwKHz] = useState(formatInput(settings.rbw / 1e3, 2));
  const [vbwKHz, setVbwKHz] = useState(formatInput(settings.vbw / 1e3, 2));
  const [refLevel, setRefLevel] = useState(formatInput(settings.referenceLevel, 1));
  const [noiseOffset, setNoiseOffset] = useState(formatInput(settings.noiseFloorOffset, 1));
  const [detectorMode, setDetectorMode] = useState<AnalyzerSettings['detectorMode']>(settings.detectorMode);
  const [averaging, setAveraging] = useState(formatInput(settings.averaging, 0));
  const [gainDb, setGainDb] = useState(formatInput(deviceStatus.gain, 1));
  const [controlError, setControlError] = useState<string | null>(null);

  useEffect(() => {
    setCenterMHz(formatInput(hzToMhz(settings.centerFrequency)));
    setSpanMHz(formatInput(hzToMhz(settings.span), 3));
    setStartMHz(formatInput(hzToMhz(settings.centerFrequency - settings.span / 2)));
    setStopMHz(formatInput(hzToMhz(settings.centerFrequency + settings.span / 2)));
    setRbwKHz(formatInput(settings.rbw / 1e3, 2));
    setVbwKHz(formatInput(settings.vbw / 1e3, 2));
    setRefLevel(formatInput(settings.referenceLevel, 1));
    setNoiseOffset(formatInput(settings.noiseFloorOffset, 1));
    setDetectorMode(settings.detectorMode);
    setAveraging(formatInput(settings.averaging, 0));
  }, [
    settings.centerFrequency,
    settings.span,
    settings.rbw,
    settings.vbw,
    settings.referenceLevel,
    settings.noiseFloorOffset,
    settings.detectorMode,
    settings.averaging,
  ]);

  useEffect(() => {
    setPanStepMHz(formatInput(hzToMhz(settings.span) / 10, 3));
  }, [settings.span]);

  useEffect(() => {
    setGainDb(formatInput(deviceStatus.gain, 1));
  }, [deviceStatus.gain]);

  const markerRows = useMemo(() => {
    return markers.map((marker) => {
      const liveLevel = spectrumData
        ? getLevelAtFrequency(marker.frequency, spectrumData.frequencyArray, spectrumData.powerLevels)
        : marker.level;
      return {
        ...marker,
        level: Number.isFinite(liveLevel) ? liveLevel : marker.level,
      };
    });
  }, [markers, spectrumData]);

  const applyCenterSpan = async () => {
    const center = mhzToHz(centerMHz);
    const span = mhzToHz(spanMHz);
    if (!Number.isFinite(center) || center <= 0 || !Number.isFinite(span) || span <= 0) {
      setControlError('Center and span must be positive numeric values.');
      return;
    }
    setControlError(null);
    await spectrumController.setCenterFrequency(center);
    await spectrumController.setSpan(span);
  };

  const applyStartStop = async () => {
    const start = mhzToHz(startMHz);
    const stop = mhzToHz(stopMHz);
    if (!Number.isFinite(start) || !Number.isFinite(stop) || start <= 0 || stop <= start) {
      setControlError('Start must be positive and lower than stop.');
      return;
    }
    setControlError(null);
    await spectrumController.setStartStop(start, stop);
  };

  const panFrequencyWindow = async (direction: -1 | 1) => {
    const step = mhzToHz(panStepMHz);
    if (!Number.isFinite(step) || step <= 0) {
      setControlError('Step must be a positive numeric value.');
      return;
    }

    const nextCenter = settings.centerFrequency + direction * step;
    if (!Number.isFinite(nextCenter) || nextCenter <= 0) {
      setControlError('Center frequency must stay above 0 Hz.');
      return;
    }

    setControlError(null);
    await spectrumController.setCenterFrequency(nextCenter);
    await spectrumController.refreshSpectrum();
  };

  const applyResolution = async () => {
    const rbw = khzToHz(rbwKHz);
    const vbw = khzToHz(vbwKHz);
    const ref = Number(refLevel);
    const offset = Number(noiseOffset);
    const avg = Number(averaging);
    if (
      !Number.isFinite(rbw) || rbw <= 0 ||
      !Number.isFinite(vbw) || vbw <= 0 ||
      !Number.isFinite(ref) ||
      !Number.isFinite(offset) ||
      !Number.isFinite(avg) || avg < 1
    ) {
      setControlError('RBW, VBW and averaging must be positive. Ref and offset must be numeric.');
      return;
    }
    setControlError(null);
    await spectrumController.setRbw(rbw);
    await spectrumController.setVbw(vbw);
    await spectrumController.setReferenceLevel(ref);
    await spectrumController.setNoiseFloorOffset(offset);
    await spectrumController.setDetectorMode(detectorMode);
    await spectrumController.setAveraging(avg);
  };

  const applyGain = async () => {
    const gain = Number(gainDb);
    if (!Number.isFinite(gain)) {
      setControlError('Gain must be numeric.');
      return;
    }
    setControlError(null);
    await spectrumController.setGain(gain);
  };

  const handleStartStop = async () => {
    if (isStreaming) {
      await spectrumController.stopDeviceStream();
      setIsStreaming(false);
      return;
    }
    await spectrumController.startDeviceStream();
    setIsStreaming(true);
  };

  const handleConnectDisconnect = async () => {
    if (deviceStatus.isConnected) {
      await spectrumController.disconnectDevice();
      setIsStreaming(false);
      return;
    }
    await spectrumController.connectDevice();
  };

  const addMarkerAtCanvas = async (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const relativeX = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
    const start = settings.centerFrequency - settings.span / 2;
    const frequency = start + relativeX * settings.span;
    const level = spectrumData
      ? getLevelAtFrequency(frequency, spectrumData.frequencyArray, spectrumData.powerLevels)
      : Number.NaN;
    await markerController.createMarker(frequency, undefined, level);
  };

  return (
    <div className="h-full flex flex-col bg-slate-950 text-slate-100">
      <div className="border-b border-slate-800 bg-slate-900 px-4 py-3">
        <div className="flex flex-wrap items-end gap-3">
          <button
            onClick={handleConnectDisconnect}
            className={cn(
              'h-9 flex items-center px-3 rounded-md text-sm font-medium',
              deviceStatus.isConnected ? 'bg-slate-700 hover:bg-slate-600' : 'bg-emerald-600 hover:bg-emerald-500'
            )}
          >
            {deviceStatus.isConnected ? <Unplug className="w-4 h-4 mr-2" /> : <Usb className="w-4 h-4 mr-2" />}
            {deviceStatus.isConnected ? 'Disconnect' : 'Connect USB'}
          </button>

          <button
            onClick={handleStartStop}
            disabled={!deviceStatus.isConnected}
            className={cn(
              'h-9 flex items-center px-3 rounded-md text-sm font-medium',
              !deviceStatus.isConnected ? 'bg-slate-700 text-slate-400 cursor-not-allowed' :
              isStreaming ? 'bg-red-600 hover:bg-red-500' : 'bg-green-600 hover:bg-green-500'
            )}
          >
            {isStreaming ? <Square className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
            {isStreaming ? 'Stop' : 'Start'}
          </button>

          <button
            onClick={() => spectrumController.openWfmReceiver()}
            className="h-9 flex items-center px-3 rounded-md bg-indigo-600 hover:bg-indigo-500 text-sm font-medium"
          >
            <Radio className="w-4 h-4 mr-2" />
            WFM Receiver
          </button>

          <button
            onClick={() => spectrumController.refreshSpectrum()}
            className="h-9 flex items-center px-3 rounded-md bg-blue-600 hover:bg-blue-500 text-sm font-medium"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Refresh
          </button>

          <div className="h-9 w-px bg-slate-700 mx-1" />

          <LabeledInput label="Center MHz" value={centerMHz} onChange={setCenterMHz} onEnter={applyCenterSpan} />
          <LabeledInput label="Span MHz" value={spanMHz} onChange={setSpanMHz} onEnter={applyCenterSpan} />
          <button onClick={applyCenterSpan} className="h-9 px-3 rounded-md bg-slate-700 hover:bg-slate-600 text-sm">Apply</button>
          <LabeledInput label="Step MHz" value={panStepMHz} onChange={setPanStepMHz} onEnter={() => undefined} compact />
          <button
            onClick={() => panFrequencyWindow(-1)}
            title="Desplazar espectro hacia la izquierda"
            className="h-9 inline-flex items-center gap-1.5 rounded-md bg-cyan-700 px-3 text-sm font-semibold text-white hover:bg-cyan-600"
          >
            <ChevronLeft className="w-5 h-5" />
            Spectrum
          </button>
          <button
            onClick={() => panFrequencyWindow(1)}
            title="Desplazar espectro hacia la derecha"
            className="h-9 inline-flex items-center gap-1.5 rounded-md bg-cyan-700 px-3 text-sm font-semibold text-white hover:bg-cyan-600"
          >
            Spectrum
            <ChevronRight className="w-5 h-5" />
          </button>

          <LabeledInput label="Start MHz" value={startMHz} onChange={setStartMHz} onEnter={applyStartStop} />
          <LabeledInput label="Stop MHz" value={stopMHz} onChange={setStopMHz} onEnter={applyStartStop} />
          <button onClick={applyStartStop} className="h-9 px-3 rounded-md bg-slate-700 hover:bg-slate-600 text-sm">Set Edges</button>

          <LabeledInput label="RBW kHz" value={rbwKHz} onChange={setRbwKHz} onEnter={applyResolution} compact />
          <LabeledInput label="VBW kHz" value={vbwKHz} onChange={setVbwKHz} onEnter={applyResolution} compact />
          <LabeledInput label="Ref dB" value={refLevel} onChange={setRefLevel} onEnter={applyResolution} compact />
          <LabeledInput label="Offset dB" value={noiseOffset} onChange={setNoiseOffset} onEnter={applyResolution} compact />
          <label className="flex flex-col gap-1 text-[11px] text-slate-400">
            Detector
            <select
              value={detectorMode}
              onChange={(event) => setDetectorMode(event.target.value as AnalyzerSettings['detectorMode'])}
              className="h-9 w-28 rounded-md border border-slate-700 bg-slate-950 px-2 text-sm text-slate-100 outline-none focus:border-blue-400"
            >
              {DETECTOR_MODES.map((mode) => (
                <option key={mode.value} value={mode.value}>{mode.label}</option>
              ))}
            </select>
          </label>
          <LabeledInput label="Avg" value={averaging} onChange={setAveraging} onEnter={applyResolution} compact />
          <button onClick={applyResolution} className="h-9 px-3 rounded-md bg-slate-700 hover:bg-slate-600 text-sm">
            <SlidersHorizontal className="w-4 h-4" />
          </button>

          <LabeledInput label="Gain dB" value={gainDb} onChange={setGainDb} onEnter={applyGain} compact />
          <button onClick={applyGain} className="h-9 px-3 rounded-md bg-slate-700 hover:bg-slate-600 text-sm">Gain</button>

          <button
            onClick={() => markerController.createPeakMarker()}
            className="h-9 flex items-center px-3 rounded-md bg-purple-600 hover:bg-purple-500 text-sm font-medium"
          >
            <Target className="w-4 h-4 mr-2" />
            Peak
          </button>
          <button
            onClick={() => markerController.clearAllMarkers()}
            className="h-9 flex items-center px-3 rounded-md bg-slate-700 hover:bg-slate-600 text-sm"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
        {controlError && <div className="mt-2 text-sm text-red-300">{controlError}</div>}
        {deviceStatus.lastError && <div className="mt-2 text-sm text-red-300">{deviceStatus.lastError}</div>}
      </div>

      <div className="flex-1 grid grid-cols-[minmax(0,1fr)_320px] min-h-0">
        <div className="relative min-h-0">
          <div className="absolute left-4 top-4 z-10 flex items-center gap-2 rounded-md border border-slate-700 bg-slate-900/95 px-2 py-2 shadow-lg">
            <button
              onClick={() => panFrequencyWindow(-1)}
              title="Desplazar espectro hacia la izquierda"
              className="h-9 inline-flex items-center gap-1.5 rounded-md bg-cyan-700 px-3 text-sm font-semibold text-white hover:bg-cyan-600"
            >
              <ChevronLeft className="w-5 h-5" />
              Left
            </button>
            <LabeledInput label="Step MHz" value={panStepMHz} onChange={setPanStepMHz} onEnter={() => undefined} compact />
            <button
              onClick={() => panFrequencyWindow(1)}
              title="Desplazar espectro hacia la derecha"
              className="h-9 inline-flex items-center gap-1.5 rounded-md bg-cyan-700 px-3 text-sm font-semibold text-white hover:bg-cyan-600"
            >
              Right
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          <canvas
            ref={canvasRef}
            width={1400}
            height={720}
            className="w-full h-full cursor-crosshair bg-slate-950"
            onClick={addMarkerAtCanvas}
          />
          {markerRows.map((marker) => {
            const start = settings.centerFrequency - settings.span / 2;
            const position = ((marker.frequency - start) / settings.span) * 100;
            if (position < 0 || position > 100) return null;
            return (
              <div
                key={marker.id}
                className="absolute top-0 bottom-0 border-l border-amber-300 pointer-events-none"
                style={{ left: `${position}%` }}
              >
                <div className="ml-1 mt-2 bg-amber-300 text-slate-950 px-1.5 py-0.5 text-xs rounded-sm whitespace-nowrap">
                  {marker.label} {formatFrequency(marker.frequency)} {formatPowerLevel(marker.level)}
                </div>
              </div>
            );
          })}
        </div>

        <aside className="border-l border-slate-800 bg-slate-900 p-3 overflow-auto">
          <div className="text-xs uppercase text-slate-400 mb-2">Device Status</div>
          <StatusRow label="Status" value={deviceStatus.isConnected ? 'Connected' : 'Disconnected'} tone={deviceStatus.isConnected ? 'ok' : 'bad'} />
          <StatusRow label="Driver" value={deviceStatus.driver} />
          <StatusRow label="Center" value={formatFrequency(settings.centerFrequency)} />
          <StatusRow label="Span" value={formatFrequency(settings.span)} />
          <StatusRow label="Start" value={formatFrequency(settings.centerFrequency - settings.span / 2)} />
          <StatusRow label="Stop" value={formatFrequency(settings.centerFrequency + settings.span / 2)} />
          <StatusRow label="Sample Rate" value={formatFrequency(deviceStatus.sampleRate || settings.span) + '/s'} />
          <StatusRow label="RBW" value={formatFrequency(settings.rbw)} />
          <StatusRow label="VBW" value={formatFrequency(settings.vbw)} />
          <StatusRow label="Ref" value={formatPowerLevel(settings.referenceLevel)} />
          <StatusRow label="Offset" value={formatPowerLevel(settings.noiseFloorOffset)} />
          <StatusRow label="Detector" value={settings.detectorMode} />
          <StatusRow label="Averaging" value={`${settings.averaging}x`} />
          <StatusRow label="Gain" value={formatPowerLevel(deviceStatus.gain)} />

          <div className="mt-5 text-xs uppercase text-slate-400 mb-2">Markers</div>
          <div className="overflow-hidden rounded-md border border-slate-800">
            <table className="w-full text-sm">
              <thead className="bg-slate-800 text-slate-300">
                <tr>
                  <th className="text-left px-2 py-1">ID</th>
                  <th className="text-right px-2 py-1">Frequency</th>
                  <th className="text-right px-2 py-1">Level</th>
                </tr>
              </thead>
              <tbody>
                {markerRows.length === 0 ? (
                  <tr><td colSpan={3} className="px-2 py-3 text-slate-500">Click trace to add marker</td></tr>
                ) : markerRows.map((marker) => (
                  <tr key={marker.id} className="border-t border-slate-800">
                    <td className="px-2 py-1 text-amber-300">{marker.label}</td>
                    <td className="px-2 py-1 text-right">{formatFrequency(marker.frequency)}</td>
                    <td className="px-2 py-1 text-right">{formatPowerLevel(marker.level)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </aside>
      </div>
    </div>
  );
};

function LabeledInput({
  label,
  value,
  onChange,
  onEnter,
  compact = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onEnter: () => void;
  compact?: boolean;
}) {
  return (
    <label className="flex flex-col gap-1 text-[11px] text-slate-400">
      {label}
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter') onEnter();
        }}
        className={cn(
          'h-9 rounded-md border border-slate-700 bg-slate-950 px-2 text-sm text-slate-100 outline-none focus:border-blue-400',
          compact ? 'w-20' : 'w-28'
        )}
      />
    </label>
  );
}

function StatusRow({ label, value, tone }: { label: string; value: string; tone?: 'ok' | 'bad' }) {
  return (
    <div className="flex justify-between gap-3 border-b border-slate-800 py-1.5 text-sm">
      <span className="text-slate-400">{label}</span>
      <span className={cn('text-right font-medium', tone === 'ok' && 'text-green-300', tone === 'bad' && 'text-red-300')}>
        {value}
      </span>
    </div>
  );
}
