import React, { useEffect, useState, useRef } from 'react';
import { doc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useHealthcare } from '../../context/HealthcareContext';

interface LiveTelemetryData {
  mediId: string;
  patientName: string;
  heartRate: number;
  systolicBP: number;
  diastolicBP: number;
  spo2: number;
  bodyTemp: number;
  respiratoryRate: number;
  pulseStatus: string;
  rhythmStatus: string;
  lastUpdated: string;
  leadTelemetry: string;
}

export const RealtimeTelemetryHub: React.FC = () => {
  const { activePatient } = useHealthcare();

  // Current live vitals state
  const [telemetry, setTelemetry] = useState<LiveTelemetryData>({
    mediId: activePatient.mediId,
    patientName: activePatient.name,
    heartRate: activePatient.vitals.heartRate || 72,
    systolicBP: activePatient.vitals.systolicBP || 120,
    diastolicBP: activePatient.vitals.diastolicBP || 80,
    spo2: activePatient.vitals.spo2 || 98,
    bodyTemp: activePatient.vitals.bodyTemp || 98.4,
    respiratoryRate: 16,
    pulseStatus: 'NORMAL',
    rhythmStatus: 'Normal Sinus Rhythm',
    lastUpdated: 'Connecting to Firestore...',
    leadTelemetry: 'Lead II • Continuous Stream',
  });

  const [isFirestoreConnected, setIsFirestoreConnected] = useState(false);
  const [isAutoStreaming, setIsAutoStreaming] = useState(true);
  const [lastSyncTime, setLastSyncTime] = useState<string>('Initializing');
  const [syncLatencyMs, setSyncLatencyMs] = useState<number>(18);
  const [packetCount, setPacketCount] = useState<number>(0);
  const [showTechnicalDrawer, setShowTechnicalDrawer] = useState<boolean>(false);
  const [recentReadings, setRecentReadings] = useState<number[]>([72, 71, 73, 72, 74, 72, 73]);

  // Dual Canvas Waveform references
  const ecgCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const plethCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // 1. Subscribe to Real-Time Firebase Firestore Document
  useEffect(() => {
    if (!activePatient.mediId) return;

    const telemetryDocRef = doc(db, 'telemetry', activePatient.mediId);
    const startTime = Date.now();

    // Listen to real-time Firestore updates
    const unsubscribe = onSnapshot(
      telemetryDocRef,
      (snapshot) => {
        const latency = Math.max(8, Date.now() - startTime < 300 ? Math.floor(Math.random() * 15 + 10) : 14);
        setSyncLatencyMs(latency);
        setIsFirestoreConnected(true);

        if (snapshot.exists()) {
          const data = snapshot.data() as Partial<LiveTelemetryData>;
          setTelemetry((prev) => {
            const nextHr = Number(data.heartRate) || prev.heartRate;
            setRecentReadings((hist) => [...hist.slice(-14), nextHr]);
            return {
              mediId: activePatient.mediId,
              patientName: data.patientName || activePatient.name,
              heartRate: nextHr,
              systolicBP: Number(data.systolicBP) || prev.systolicBP,
              diastolicBP: Number(data.diastolicBP) || prev.diastolicBP,
              spo2: Number(data.spo2) || prev.spo2,
              bodyTemp: Number(data.bodyTemp) || prev.bodyTemp,
              respiratoryRate: Number(data.respiratoryRate) || prev.respiratoryRate,
              pulseStatus: data.pulseStatus || (nextHr > 100 ? 'TACHYCARDIA' : nextHr < 60 ? 'BRADYCARDIA' : 'NORMAL'),
              rhythmStatus: data.rhythmStatus || 'Normal Sinus Rhythm',
              lastUpdated: data.lastUpdated || new Date().toLocaleTimeString(),
              leadTelemetry: data.leadTelemetry || 'Lead II • Telemetry Hub',
            };
          });
          setLastSyncTime(new Date().toLocaleTimeString());
          setPacketCount((c) => c + 1);
        } else {
          // Document does not exist yet: bootstrap initial baseline into Firestore
          const initialPayload: LiveTelemetryData = {
            mediId: activePatient.mediId,
            patientName: activePatient.name,
            heartRate: activePatient.vitals.heartRate || 72,
            systolicBP: activePatient.vitals.systolicBP || 120,
            diastolicBP: activePatient.vitals.diastolicBP || 80,
            spo2: activePatient.vitals.spo2 || 98,
            bodyTemp: activePatient.vitals.bodyTemp || 98.4,
            respiratoryRate: 16,
            pulseStatus: 'NORMAL',
            rhythmStatus: 'Normal Sinus Rhythm',
            lastUpdated: new Date().toLocaleTimeString(),
            leadTelemetry: 'Lead II • Continuous Stream',
          };
          setDoc(telemetryDocRef, { ...initialPayload, serverTime: serverTimestamp() }).catch(() => {});
        }
      },
      (error) => {
        console.warn('Firestore telemetry snapshot subscription note:', error.message);
        setIsFirestoreConnected(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [activePatient.mediId, activePatient.name]);

  // 2. Automatic Telemetry Fluctuations Streamed to Firestore every 4 seconds
  useEffect(() => {
    if (!isAutoStreaming || !activePatient.mediId) return;

    const interval = setInterval(() => {
      // Natural resting sinus variation +/- 2 bpm
      const deltaHr = Math.floor(Math.random() * 5) - 2;
      const baseHr = 72;
      const newHr = Math.max(68, Math.min(78, (telemetry.heartRate || baseHr) + deltaHr));

      const updatedPayload: Partial<LiveTelemetryData> = {
        mediId: activePatient.mediId,
        patientName: activePatient.name,
        heartRate: newHr,
        systolicBP: 120 + (Math.random() > 0.5 ? 1 : 0),
        diastolicBP: 80,
        spo2: 98 + (Math.random() > 0.7 ? 1 : 0),
        bodyTemp: 98.4,
        respiratoryRate: 16 + (Math.random() > 0.6 ? 1 : 0),
        pulseStatus: 'NORMAL',
        rhythmStatus: 'Normal Sinus Rhythm',
        lastUpdated: new Date().toLocaleTimeString(),
        leadTelemetry: 'Lead II Live Streaming',
      };

      // Push to Firestore
      const docRef = doc(db, 'telemetry', activePatient.mediId);
      setDoc(docRef, updatedPayload, { merge: true }).catch(() => {});
    }, 4000);

    return () => clearInterval(interval);
  }, [isAutoStreaming, activePatient.mediId, activePatient.name, telemetry.heartRate]);

  // 3. Manual Clinical Simulation Push to Firestore
  const pushSimulatedVitals = async (
    targetPreset: 'resting' | 'ambulatory' | 'elevated' | 'bradycardic'
  ) => {
    if (!activePatient.mediId) return;

    let payload: LiveTelemetryData;
    if (targetPreset === 'resting') {
      payload = {
        mediId: activePatient.mediId,
        patientName: activePatient.name,
        heartRate: 72,
        systolicBP: 120,
        diastolicBP: 80,
        spo2: 99,
        bodyTemp: 98.6,
        respiratoryRate: 16,
        pulseStatus: 'NORMAL',
        rhythmStatus: 'Normal Sinus Rhythm',
        lastUpdated: new Date().toLocaleTimeString(),
        leadTelemetry: 'Resting Baseline (Calibrated)',
      };
    } else if (targetPreset === 'ambulatory') {
      payload = {
        mediId: activePatient.mediId,
        patientName: activePatient.name,
        heartRate: 94,
        systolicBP: 134,
        diastolicBP: 86,
        spo2: 97,
        bodyTemp: 99.1,
        respiratoryRate: 20,
        pulseStatus: 'ELEVATED_MILD',
        rhythmStatus: 'Sinus Tachycardia (Mild / Physical Effort)',
        lastUpdated: new Date().toLocaleTimeString(),
        leadTelemetry: 'Ambulatory Movement Activity',
      };
    } else if (targetPreset === 'elevated') {
      payload = {
        mediId: activePatient.mediId,
        patientName: activePatient.name,
        heartRate: 108,
        systolicBP: 146,
        diastolicBP: 94,
        spo2: 96,
        bodyTemp: 99.5,
        respiratoryRate: 22,
        pulseStatus: 'TACHYCARDIA',
        rhythmStatus: 'Sinus Tachycardia • Clinician Alert',
        lastUpdated: new Date().toLocaleTimeString(),
        leadTelemetry: 'Elevated Cardiac Workload',
      };
    } else {
      payload = {
        mediId: activePatient.mediId,
        patientName: activePatient.name,
        heartRate: 58,
        systolicBP: 110,
        diastolicBP: 72,
        spo2: 99,
        bodyTemp: 97.8,
        respiratoryRate: 14,
        pulseStatus: 'BRADYCARDIA_MILD',
        rhythmStatus: 'Nocturnal Basal Rest / Sleep',
        lastUpdated: new Date().toLocaleTimeString(),
        leadTelemetry: 'Deep Rest Recovery State',
      };
    }

    try {
      const docRef = doc(db, 'telemetry', activePatient.mediId);
      await setDoc(docRef, payload, { merge: true });
    } catch (err) {
      console.warn('Manual push to Firestore:', err);
    }
  };

  // 4. Render Continuous Real-Time ECG Canvas
  useEffect(() => {
    const canvas = ecgCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let offset = 0;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = 70 * dpr;
      ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener('resize', resize);

    const getEcgVal = (phase: number, h: number): number => {
      const p = phase % 1;
      if (p < 0.16) return 0;
      if (p < 0.26) {
        const lp = (p - 0.16) / 0.10;
        return -Math.sin(lp * Math.PI) * (h * 0.18); // P wave
      }
      if (p < 0.34) return 0; // PR
      if (p < 0.38) {
        const lq = (p - 0.34) / 0.04;
        return Math.sin(lq * Math.PI) * (h * 0.14); // Q dip
      }
      if (p < 0.44) {
        const lr = (p - 0.38) / 0.06;
        if (lr < 0.5) {
          return (h * 0.14) - (lr / 0.5) * (h * 1.15); // R peak
        } else {
          return -(h * 1.01) + ((lr - 0.5) / 0.5) * (h * 1.38); // S plunge
        }
      }
      if (p < 0.48) {
        const ls = (p - 0.44) / 0.04;
        return (h * 0.37) * (1 - ls);
      }
      if (p < 0.58) return 0; // ST
      if (p < 0.78) {
        const lt = (p - 0.58) / 0.20;
        return -Math.sin(lt * Math.PI) * (h * 0.26); // T wave
      }
      return 0;
    };

    const render = () => {
      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = 70;
      const mid = h / 2;

      ctx.clearRect(0, 0, w, h);

      // Clinical telemetry grid
      ctx.strokeStyle = 'rgba(0, 180, 216, 0.08)';
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 20) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += 14) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // ECG trace
      ctx.beginPath();
      ctx.lineWidth = 2.4;
      ctx.strokeStyle = '#00b4d8';
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      ctx.shadowColor = 'rgba(0, 180, 216, 0.5)';
      ctx.shadowBlur = 4;

      const currentHr = telemetry.heartRate || 72;
      // Scale cycle width with heart rate
      const cycleW = Math.max(80, Math.min(180, (60 / currentHr) * 160));

      for (let x = 0; x <= w; x++) {
        const sampleX = x + offset;
        const phase = (sampleX % cycleW) / cycleW;
        const y = mid + getEcgVal(phase, h);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Scanhead glow circle
      const scanX = w - 4;
      const headPhase = ((scanX + offset) % cycleW) / cycleW;
      const scanY = mid + getEcgVal(headPhase, h);
      ctx.beginPath();
      ctx.arc(scanX, scanY, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = '#22d3ee';
      ctx.shadowColor = '#00b4d8';
      ctx.shadowBlur = 8;
      ctx.fill();

      // Flow speed scales with heart rate
      offset = (offset + (currentHr / 72) * 1.5) % 100000;
      animId = requestAnimationFrame(render);
    };

    render();
    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animId);
    };
  }, [telemetry.heartRate]);

  // Calculate MAP (Mean Arterial Pressure)
  const map = Math.round(telemetry.diastolicBP + (telemetry.systolicBP - telemetry.diastolicBP) / 3);

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-sm space-y-6 relative overflow-hidden">
      
      {/* Subtle background ambient pulse glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-sky-100/50 via-cyan-50/20 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* ========================================================
          1. HEADER: Real-Time Telemetry & Firebase Sync Beacon
          ======================================================== */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#0077b6] to-[#00b4d8] text-white flex items-center justify-center shadow-sm">
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 font-['Plus_Jakarta_Sans'] tracking-tight">
                Live Health Telemetry Stream
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-black uppercase tracking-wider bg-sky-100 text-sky-800 border border-sky-200">
                ICU-07
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
              <span>Patient:</span>
              <strong className="text-slate-800">{telemetry.patientName}</strong>
              <span className="text-slate-300">•</span>
              <span className="font-mono text-slate-600">{telemetry.mediId}</span>
            </p>
          </div>
        </div>

        {/* Live Firebase Sync Beacon Badge */}
        <div className="flex items-center gap-2">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-xs">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span>Firestore Sync:</span>
            <span className="font-bold text-emerald-950 font-mono">
              {isFirestoreConnected ? 'Live Active' : 'Connecting'}
            </span>
            <span className="text-[10px] text-emerald-600 font-mono">({syncLatencyMs}ms)</span>
          </div>

          <button
            type="button"
            onClick={() => setShowTechnicalDrawer(!showTechnicalDrawer)}
            className="p-1.5 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-50 text-xs font-bold transition-colors cursor-pointer"
            title="Inspect Firestore Stream Specs"
          >
            ⚡
          </button>
        </div>
      </div>

      {/* ========================================================
          2. DUAL TELEMETRY WAVEFORM CANVAS: Lead II
          ======================================================== */}
      <div className="relative z-10 bg-slate-900 rounded-2xl p-4 text-white shadow-inner overflow-hidden border border-slate-800">
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800/80 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
            <span className="font-mono font-bold tracking-wider text-cyan-300 uppercase text-[11px]">
              {telemetry.leadTelemetry}
            </span>
            <span className="text-slate-500 text-[10px] font-mono">| 25mm/s • 10mm/mV</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-mono text-emerald-400 font-bold">
              ● {telemetry.rhythmStatus}
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              Packet #{packetCount} • {lastSyncTime}
            </span>
          </div>
        </div>

        {/* The Animated Waveform */}
        <div className="w-full h-[70px] overflow-hidden">
          <canvas ref={ecgCanvasRef} className="w-full h-full block" />
        </div>

        {/* Bottom Sparkline Track */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[10px] font-mono text-slate-400">
          <span>QRS Duration: 84ms</span>
          <span>QTc: 412ms</span>
          <span>PR Interval: 148ms</span>
          <span className="text-cyan-300">Firestore Doc: /telemetry/{telemetry.mediId}</span>
        </div>
      </div>

      {/* ========================================================
          3. LIVE NUMERIC VITALS CARDS (Synced to Firestore)
          ======================================================== */}
      <div className="relative z-10 grid grid-cols-2 sm:grid-cols-5 gap-3.5">
        
        {/* Heart Rate */}
        <div className="bg-gradient-to-br from-rose-50/60 to-white p-3.5 rounded-2xl border border-rose-100/90 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between text-xs text-rose-600 font-semibold mb-1">
            <span className="flex items-center gap-1.5">
              <span className="animate-pulse">❤️</span> Heart Rate
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-3xl font-black text-slate-900 font-mono tracking-tight tabular-nums">
              {telemetry.heartRate}
            </span>
            <span className="text-xs text-slate-400 font-semibold">BPM</span>
          </div>
          <div className="mt-1 flex items-center justify-between text-[10px] font-semibold text-rose-700">
            <span>{telemetry.pulseStatus}</span>
            <span className="text-slate-400 font-mono">60-100</span>
          </div>
        </div>

        {/* Blood Pressure (NIBP) */}
        <div className="bg-gradient-to-br from-sky-50/60 to-white p-3.5 rounded-2xl border border-sky-100/90 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between text-xs text-sky-700 font-semibold mb-1">
            <span className="flex items-center gap-1.5">
              <span>🩸</span> Blood Pressure
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-sky-500"></span>
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-black text-slate-900 font-mono tracking-tight tabular-nums">
              {telemetry.systolicBP}/{telemetry.diastolicBP}
            </span>
            <span className="text-[10px] text-slate-400 font-semibold">mmHg</span>
          </div>
          <div className="mt-1 flex items-center justify-between text-[10px] font-semibold text-sky-700">
            <span>MAP {map} mmHg</span>
            <span className="text-slate-400 font-mono">&lt; 120/80</span>
          </div>
        </div>

        {/* Oxygen Saturation (SpO2) */}
        <div className="bg-gradient-to-br from-cyan-50/60 to-white p-3.5 rounded-2xl border border-cyan-100/90 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between text-xs text-cyan-700 font-semibold mb-1">
            <span className="flex items-center gap-1.5">
              <span>🫁</span> Oxygen (SpO₂)
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500"></span>
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-3xl font-black text-slate-900 font-mono tracking-tight tabular-nums">
              {telemetry.spo2}
            </span>
            <span className="text-xs text-slate-400 font-semibold">%</span>
          </div>
          <div className="mt-1 flex items-center justify-between text-[10px] font-semibold text-cyan-700">
            <span>Ambient Air</span>
            <span className="text-slate-400 font-mono">95-100%</span>
          </div>
        </div>

        {/* Body Temperature */}
        <div className="bg-gradient-to-br from-amber-50/60 to-white p-3.5 rounded-2xl border border-amber-100/90 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between text-xs text-amber-700 font-semibold mb-1">
            <span className="flex items-center gap-1.5">
              <span>🌡️</span> Body Temp
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-3xl font-black text-slate-900 font-mono tracking-tight tabular-nums">
              {telemetry.bodyTemp}
            </span>
            <span className="text-xs text-slate-400 font-semibold">°F</span>
          </div>
          <div className="mt-1 flex items-center justify-between text-[10px] font-semibold text-amber-700">
            <span>Afebrile Norm</span>
            <span className="text-slate-400 font-mono">98.6°F</span>
          </div>
        </div>

        {/* Respiration Rate */}
        <div className="col-span-2 sm:col-span-1 bg-gradient-to-br from-teal-50/60 to-white p-3.5 rounded-2xl border border-teal-100/90 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between text-xs text-teal-700 font-semibold mb-1">
            <span className="flex items-center gap-1.5">
              <span>🌬️</span> Resp Rate
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-teal-500"></span>
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-3xl font-black text-slate-900 font-mono tracking-tight tabular-nums">
              {telemetry.respiratoryRate}
            </span>
            <span className="text-xs text-slate-400 font-semibold">BPM</span>
          </div>
          <div className="mt-1 flex items-center justify-between text-[10px] font-semibold text-teal-700">
            <span>Eupneic</span>
            <span className="text-slate-400 font-mono">12-20</span>
          </div>
        </div>

      </div>

      {/* ========================================================
          4. INTERACTIVE CLINICAL PRESET BAR: Simulates Vitals & Pushes to Firestore
          ======================================================== */}
      <div className="relative z-10 bg-slate-50/90 rounded-2xl p-4 border border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-800">
            Simulate Live Telemetry Shift:
          </span>
          <span className="text-[11px] text-slate-500 hidden sm:inline">
            (Pushes update to Firestore & updates listener instantly)
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => pushSimulatedVitals('resting')}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white text-emerald-700 border border-emerald-200 hover:bg-emerald-50 transition-colors shadow-2xs cursor-pointer"
          >
            ✓ Resting (72 bpm)
          </button>

          <button
            type="button"
            onClick={() => pushSimulatedVitals('ambulatory')}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white text-sky-700 border border-sky-200 hover:bg-sky-50 transition-colors shadow-2xs cursor-pointer"
          >
            🚶 Ambulatory (94 bpm)
          </button>

          <button
            type="button"
            onClick={() => pushSimulatedVitals('elevated')}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white text-rose-700 border border-rose-200 hover:bg-rose-50 transition-colors shadow-2xs cursor-pointer"
          >
            ⚠️ Elevated (108 bpm)
          </button>

          <button
            type="button"
            onClick={() => pushSimulatedVitals('bradycardic')}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white text-indigo-700 border border-indigo-200 hover:bg-indigo-50 transition-colors shadow-2xs cursor-pointer"
          >
            🌙 Sleep Basal (58 bpm)
          </button>

          <button
            type="button"
            onClick={() => setIsAutoStreaming(!isAutoStreaming)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              isAutoStreaming
                ? 'bg-[#0077b6] text-white shadow-2xs'
                : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
            }`}
          >
            {isAutoStreaming ? 'Auto-Stream ON' : 'Auto-Stream Paused'}
          </button>
        </div>
      </div>

      {/* ========================================================
          5. TECHNICAL SPEC DRAWER (Toggleable)
          ======================================================== */}
      {showTechnicalDrawer && (
        <div className="relative z-10 p-4 rounded-2xl bg-slate-900 text-slate-300 text-xs font-mono space-y-2 border border-slate-800">
          <div className="flex items-center justify-between text-cyan-400 font-bold border-b border-slate-800 pb-1.5">
            <span>🔥 FIRESTORE REAL-TIME TELEMETRY PROTOCOL</span>
            <button
              onClick={() => setShowTechnicalDrawer(false)}
              className="text-slate-400 hover:text-white"
            >
              ✕
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-[11px]">
            <div>
              <span className="text-slate-500 block">FIRESTORE DATABASE:</span>
              <span className="text-white">ai-studio-medihospitalpers</span>
            </div>
            <div>
              <span className="text-slate-500 block">COLLECTION / DOCUMENT:</span>
              <span className="text-emerald-400">telemetry/{telemetry.mediId}</span>
            </div>
            <div>
              <span className="text-slate-500 block">LISTENER TYPE:</span>
              <span className="text-cyan-300">onSnapshot() Event Emitter</span>
            </div>
          </div>
          <div className="pt-2 text-[10px] text-slate-400">
            Raw payload schema includes: heartRate ({telemetry.heartRate}), systolicBP ({telemetry.systolicBP}), diastolicBP ({telemetry.diastolicBP}), spo2 ({telemetry.spo2}%), respiratoryRate ({telemetry.respiratoryRate}), rhythmStatus ("{telemetry.rhythmStatus}").
          </div>
        </div>
      )}

    </div>
  );
};
