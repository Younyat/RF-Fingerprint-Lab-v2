import { useEffect, useRef } from 'react';
import { useWaterfallData, useAnalyzerSettings } from '../../app/store/AppStore';
import { turboColormap } from '../../shared/utils';

export const useWaterfall = () => {
  const waterfallData = useWaterfallData();
  const settings = useAnalyzerSettings();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageDataRef = useRef<ImageData | null>(null);

  // Draw waterfall on canvas
  useEffect(() => {
    if (!canvasRef.current || waterfallData.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = canvas;
    const maxHistory = Math.min(waterfallData.length, height);

    // Create or reuse ImageData
    if (!imageDataRef.current || imageDataRef.current.width !== width || imageDataRef.current.height !== height) {
      imageDataRef.current = ctx.createImageData(width, height);
    }

    const imageData = imageDataRef.current;
    const data = imageData.data;

    // Shift existing data down
    for (let y = height - 1; y >= 1; y--) {
      for (let x = 0; x < width; x++) {
        const srcIndex = ((y - 1) * width + x) * 4;
        const dstIndex = (y * width + x) * 4;

        data[dstIndex] = data[srcIndex];     // R
        data[dstIndex + 1] = data[srcIndex + 1]; // G
        data[dstIndex + 2] = data[srcIndex + 2]; // B
        data[dstIndex + 3] = data[srcIndex + 3]; // A
      }
    }

    // Add new spectrum data at the top
    if (waterfallData.length > 0) {
      const latestData = waterfallData[waterfallData.length - 1];
      const powerLevels = latestData.data[0] || []; // Assuming single row for simplicity

      for (let x = 0; x < width; x++) {
        const powerIndex = Math.floor((x / width) * powerLevels.length);
        const powerLevel = powerLevels[powerIndex] || -100;

        // Normalize power level to 0-1 range
        const normalizedPower = Math.max(0, Math.min(1, (powerLevel + 100) / 100));

        // Get color from turbo colormap
        const [r, g, b] = turboColormap(normalizedPower);

        const index = x * 4;
        data[index] = r;     // R
        data[index + 1] = g; // G
        data[index + 2] = b; // B
        data[index + 3] = 255; // A (fully opaque)
      }
    }

    // Put the image data on the canvas
    ctx.putImageData(imageData, 0, 0);

    // Draw frequency axis labels
    ctx.fillStyle = '#ffffff';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';

    const freqRange = settings.span;
    const freqStart = settings.centerFrequency - freqRange / 2;

    for (let i = 0; i <= 10; i++) {
      const x = (i / 10) * width;
      const freq = freqStart + (i / 10) * freqRange;

      // Draw tick mark
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, height - 20);
      ctx.lineTo(x, height - 15);
      ctx.stroke();

      // Draw label
      ctx.fillText(`${(freq / 1000000).toFixed(1)}M`, x, height - 5);
    }

    // Draw time axis labels
    ctx.textAlign = 'right';
    for (let i = 0; i < maxHistory; i += Math.max(1, Math.floor(maxHistory / 5))) {
      const y = height - i - 1;
      const timeOffset = (maxHistory - i) * 0.1; // Assuming 100ms per frame

      ctx.fillText(`${timeOffset.toFixed(1)}s`, width - 5, y + 4);
    }

  }, [waterfallData, settings]);

  return {
    waterfallData,
    settings,
    canvasRef,
  };
};
