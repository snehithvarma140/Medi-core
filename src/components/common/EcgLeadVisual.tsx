import React, { useEffect, useRef } from 'react';

interface EcgLeadVisualProps {
  heartRate?: number;
  height?: number;
}

export const EcgLeadVisual: React.FC<EcgLeadVisualProps> = ({ heartRate = 72, height = 36 }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let offset = 0;

    const updateCanvasSize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = (height || rect.height || 36) * dpr;
      ctx.scale(dpr, dpr);
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);

    // Exact continuous ECG cardiac waveform function
    // Returns y-offset relative to center for phase 0 to 1
    const getEcgDisplacement = (phase: number, h: number): number => {
      const p = phase % 1;
      
      // Isoelectric baseline 0 to 0.18
      if (p < 0.18) {
        return 0;
      }
      // P wave: 0.18 to 0.28
      if (p < 0.28) {
        const localP = (p - 0.18) / 0.10;
        return -Math.sin(localP * Math.PI) * (h * 0.18);
      }
      // PR segment: 0.28 to 0.35
      if (p < 0.35) {
        return 0;
      }
      // Q wave (dip): 0.35 to 0.38
      if (p < 0.38) {
        const localQ = (p - 0.35) / 0.03;
        return Math.sin(localQ * Math.PI) * (h * 0.16);
      }
      // R wave (sharp tall peak): 0.38 to 0.43
      if (p < 0.43) {
        const localR = (p - 0.38) / 0.05;
        if (localR < 0.5) {
          // Ascending to sharp peak
          const t = localR / 0.5;
          return (h * 0.16) - t * (h * 1.05);
        } else {
          // Descending to deep S wave
          const t = (localR - 0.5) / 0.5;
          return -(h * 0.89) + t * (h * 1.30);
        }
      }
      // S wave return to baseline: 0.43 to 0.47
      if (p < 0.47) {
        const localS = (p - 0.43) / 0.04;
        return (h * 0.41) * (1 - localS);
      }
      // ST segment: 0.47 to 0.56
      if (p < 0.56) {
        return 0;
      }
      // T wave (rounded upward deflection): 0.56 to 0.76
      if (p < 0.76) {
        const localT = (p - 0.56) / 0.20;
        return -Math.sin(localT * Math.PI) * (h * 0.28);
      }
      // TP baseline: 0.76 to 1.0
      return 0;
    };

    const render = () => {
      const rect = canvas.getBoundingClientRect();
      const width = rect.width;
      const h = height;
      const mid = h / 2;

      ctx.clearRect(0, 0, width, h);

      // Fine clinical dots grid
      ctx.fillStyle = 'rgba(0, 180, 216, 0.08)';
      for (let x = 0; x < width; x += 18) {
        for (let y = 0; y < h; y += 9) {
          ctx.fillRect(x, y, 1, 1);
        }
      }

      // ECG wave line: Cyan as seen in Image 2
      ctx.beginPath();
      ctx.lineWidth = 2.2;
      ctx.strokeStyle = '#00B4D8';
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      ctx.shadowColor = 'rgba(0, 180, 216, 0.4)';
      ctx.shadowBlur = 3;

      const cycleWidth = 140; // width of one complete P-QRS-T cycle

      for (let x = 0; x <= width; x++) {
        // Continuous smooth flow from right to left
        const sampleX = (x + offset);
        const phase = (sampleX % cycleWidth) / cycleWidth;
        const y = mid + getEcgDisplacement(phase, h);

        if (x === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }

      ctx.stroke();

      // Smooth constant flow speed
      offset = (offset + 1.35) % 100000;
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', updateCanvasSize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [heartRate, height]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full block"
      style={{ height: `${height}px` }}
    />
  );
};
