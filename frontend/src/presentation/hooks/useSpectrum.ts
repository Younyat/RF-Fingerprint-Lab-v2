import { useEffect, useRef, useState } from 'react';
import { useAppStore, useDeviceStatus, useSpectrumData, useAnalyzerSettings } from '../../app/store/AppStore';
import { ApiService } from '../../app/services/ApiService';

const apiService = new ApiService();

export const useSpectrum = () => {
  const spectrumData = useSpectrumData();
  const settings = useAnalyzerSettings();
  const deviceStatus = useDeviceStatus();
  const setSpectrumData = useAppStore((state) => state.setSpectrumData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Draw spectrum on canvas
  useEffect(() => {
    if (!canvasRef.current || !spectrumData) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const drawSpectrum = () => {
      const { width, height } = canvas;

      // Clear canvas
      ctx.clearRect(0, 0, width, height);

      // Set up coordinate system
      const padding = 40;
      const plotWidth = width - 2 * padding;
      const plotHeight = height - 2 * padding;

      // Draw grid
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 1;

      // Vertical grid lines (frequency)
      const freqRange = settings.span;
      const freqStart = settings.centerFrequency - freqRange / 2;

      for (let i = 0; i <= 10; i++) {
        const x = padding + (i / 10) * plotWidth;
        ctx.beginPath();
        ctx.moveTo(x, padding);
        ctx.lineTo(x, height - padding);
        ctx.stroke();

        // Frequency labels
        const freq = freqStart + (i / 10) * freqRange;
        ctx.fillStyle = '#64748b';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`${(freq / 1000000).toFixed(1)}M`, x, height - 10);
      }

      // Horizontal grid lines (power)
      const powerRange = 100; // dB
      const powerStart = settings.referenceLevel - powerRange;

      for (let i = 0; i <= 10; i++) {
        const y = padding + (i / 10) * plotHeight;
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(width - padding, y);
        ctx.stroke();

        // Power labels
        const power = powerStart + (9 - i) * (powerRange / 9); // Inverted Y axis
        ctx.fillStyle = '#64748b';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText(`${power.toFixed(0)}`, padding - 5, y + 4);
      }

      // Draw spectrum trace
      if (spectrumData.powerLevels.length > 0) {
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 2;
        ctx.beginPath();

        spectrumData.powerLevels.forEach((level, index) => {
          const x = padding + (index / spectrumData.powerLevels.length) * plotWidth;
          const normalizedLevel = (level - powerStart) / powerRange;
          const y = padding + (1 - normalizedLevel) * plotHeight;

          if (index === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        });

        ctx.stroke();
      }
    };

    drawSpectrum();
  }, [spectrumData, settings]);

  // Auto-refresh spectrum
  useEffect(() => {
    let cancelled = false;

    const refresh = async () => {
      if (!deviceStatus.isConnected) {
        return;
      }

      try {
        setIsLoading(true);
        const data = await apiService.getLiveSpectrum();
        if (!cancelled) {
          setSpectrumData(data);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to refresh spectrum');
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    refresh();
    const interval = setInterval(refresh, 200);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [deviceStatus.isConnected, setSpectrumData]);

  return {
    spectrumData,
    settings,
    isLoading,
    error,
    canvasRef,
  };
};
