import React from 'react';

interface MedicalEmblemRotatingProps {
  size?: 'sm' | 'md' | 'lg';
}

export const MedicalEmblemRotating: React.FC<MedicalEmblemRotatingProps> = ({ size = 'md' }) => {
  const containerDim = size === 'sm' ? 'w-36 h-36' : size === 'lg' ? 'w-56 h-56' : 'w-48 h-48';
  const innerDim = size === 'sm' ? 'w-24 h-24' : size === 'lg' ? 'w-36 h-36' : 'w-28 h-28';

  return (
    <div className={`relative ${containerDim} flex items-center justify-center select-none`}>
      
      {/* ========================================================
          OUTER CIRCULAR RING: ROTATING OUTSIDE (Counter-Clockwise / Orbiting)
          ======================================================== */}
      <div 
        className="absolute inset-0 rounded-full border-2 border-sky-400/50 border-dashed animate-[spin_28s_linear_infinite] pointer-events-none"
        style={{
          boxShadow: '0 0 25px rgba(56, 189, 248, 0.25)',
        }}
      >
        {/* Orbital Satellite Accent Spheres */}
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-cyan-400 shadow-[0_0_14px_#22d3ee] ring-2 ring-white" />
        <div className="absolute -bottom-2 left-1/3 w-3.5 h-3.5 rounded-full bg-[#0077b6] shadow-[0_0_12px_#0284c7] ring-2 ring-white" />
        <div className="absolute top-1/2 -right-2.5 w-3.5 h-3.5 rounded-full bg-teal-400 shadow-[0_0_12px_#2dd4bf] ring-2 ring-white" />
        <div className="absolute top-1/2 -left-2.5 w-3 h-3 rounded-full bg-sky-300 shadow-[0_0_10px_#38bdf8] ring-1.5 ring-white" />
        
        {/* Compass quadrant tick marks */}
        <div className="absolute top-2 right-4 w-1.5 h-1.5 rounded-full bg-sky-400/70" />
        <div className="absolute bottom-2 left-4 w-1.5 h-1.5 rounded-full bg-cyan-400/70" />
        <div className="absolute top-2 left-4 w-1.5 h-1.5 rounded-full bg-blue-400/70" />
        <div className="absolute bottom-2 right-4 w-1.5 h-1.5 rounded-full bg-teal-400/70" />
      </div>

      {/* Secondary Concentric Orbital Ring */}
      <div 
        className="absolute inset-3 rounded-full border border-sky-300/30 animate-[spin_40s_linear_infinite_reverse] pointer-events-none"
      >
        <div className="absolute top-0 right-1/4 w-2 h-2 rounded-full bg-cyan-300/80 shadow-[0_0_8px_#67e8f9]" />
        <div className="absolute bottom-0 left-1/4 w-2 h-2 rounded-full bg-blue-400/80 shadow-[0_0_8px_#60a5fa]" />
      </div>

      {/* ========================================================
          CARD SQUIRCLE HOUSING WITH CLINICAL DEPTH
          ======================================================== */}
      <div className="relative w-full h-full rounded-[2.5rem] bg-white/95 backdrop-blur-md shadow-2xl border border-sky-100 flex flex-col items-center justify-between p-4.5 overflow-hidden">
        
        {/* Subtle radial glow inside card */}
        <div className="absolute inset-0 bg-gradient-to-br from-sky-50/70 via-transparent to-cyan-50/40 pointer-events-none" />

        {/* Top Telemetry Micro-Pill */}
        <div className="z-10 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[9px] font-mono font-bold tracking-widest text-slate-500 uppercase">
            ACTIVE CADUCEUS LINK
          </span>
        </div>

        {/* ========================================================
            INNER MEDICAL IMAGE / SYMBOL: ROTATING INTO THE PAGE (Clockwise / 3D Inward Depth)
            ======================================================== */}
        <div 
          className={`relative ${innerDim} my-auto flex items-center justify-center`}
          style={{
            perspective: '800px',
          }}
        >
          {/* Inward rotating container with 3D tilt and continuous inward spin */}
          <div 
            className="relative w-full h-full flex items-center justify-center animate-[spin_18s_linear_infinite]"
            style={{
              transformStyle: 'preserve-3d',
            }}
          >
            {/* Clinical Shield / Cross Backdrop */}
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-tr from-[#005d90] via-[#0077b6] to-[#0284c7] shadow-[0_10px_25px_rgba(0,119,182,0.4)] flex items-center justify-center border-2 border-white/80">
              
              {/* Inner Medical Cross Silhouette */}
              <div className="absolute w-12 h-12 flex items-center justify-center opacity-30 pointer-events-none">
                <svg viewBox="0 0 24 24" className="w-full h-full text-white fill-current">
                  <path d="M10 4a1 1 0 011-1h2a1 1 0 011 1v5h5a1 1 0 011 1v2a1 1 0 01-1 1h-5v5a1 1 0 01-1 1h-2a1 1 0 01-1-1v-5H5a1 1 0 01-1-1v-2a1 1 0 011-1h5V4z" />
                </svg>
              </div>

              {/* High-Fidelity Medical Caduceus / Rod of Asclepius with Winged Staff & Intertwined Serpents */}
              <svg 
                viewBox="0 0 100 100" 
                className="w-16 h-16 sm:w-20 sm:h-20 drop-shadow-[0_4px_12px_rgba(255,255,255,0.7)]"
              >
                <defs>
                  <linearGradient id="caduceusGold" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ffffff" />
                    <stop offset="50%" stopColor="#e0f2fe" />
                    <stop offset="100%" stopColor="#bae6fd" />
                  </linearGradient>
                  <linearGradient id="glowCyan" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#22d3ee" />
                    <stop offset="100%" stopColor="#38bdf8" />
                  </linearGradient>
                </defs>

                {/* Central Staff / Rod */}
                <line x1="50" y1="12" x2="50" y2="88" stroke="url(#caduceusGold)" strokeWidth="3.5" strokeLinecap="round" />
                {/* Staff Top Sphere / Pommel */}
                <circle cx="50" cy="14" r="5" fill="#ffffff" stroke="#0077b6" strokeWidth="1.5" />
                {/* Staff Bottom Tip */}
                <polygon points="48,88 52,88 50,94" fill="#ffffff" />

                {/* Asclepius Angelic Wings */}
                <path
                  d="M 50,26 C 36,18 20,20 16,32 C 24,35 34,36 48,34"
                  fill="url(#caduceusGold)"
                  opacity="0.95"
                />
                <path
                  d="M 50,26 C 64,18 80,20 84,32 C 76,35 66,36 52,34"
                  fill="url(#caduceusGold)"
                  opacity="0.95"
                />
                {/* Secondary Wing Feathers */}
                <path
                  d="M 49,32 C 38,28 26,30 22,40 C 30,42 40,41 48,37"
                  fill="url(#caduceusGold)"
                  opacity="0.85"
                />
                <path
                  d="M 51,32 C 62,28 74,30 78,40 C 70,42 60,41 52,37"
                  fill="url(#caduceusGold)"
                  opacity="0.85"
                />

                {/* Left Coiled Serpent */}
                <path
                  d="M 44,78 C 30,72 32,58 48,54 C 64,50 66,36 50,30"
                  fill="none"
                  stroke="url(#glowCyan)"
                  strokeWidth="3.2"
                  strokeLinecap="round"
                />
                {/* Right Coiled Serpent */}
                <path
                  d="M 56,78 C 70,72 68,58 52,54 C 36,50 34,36 50,30"
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="3.2"
                  strokeLinecap="round"
                />

                {/* Left Serpent Head facing staff */}
                <circle cx="47" cy="27" r="3.2" fill="#22d3ee" stroke="#ffffff" strokeWidth="1" />
                {/* Right Serpent Head facing staff */}
                <circle cx="53" cy="27" r="3.2" fill="#ffffff" stroke="#0077b6" strokeWidth="1" />

                {/* Glowing Core Resonance Node */}
                <circle cx="50" cy="54" r="3.5" fill="#38bdf8" className="animate-ping opacity-75" />
                <circle cx="50" cy="54" r="2.5" fill="#ffffff" />
              </svg>
            </div>
          </div>
        </div>

        {/* Bottom Pill: DNA • TELEMETRY */}
        <div className="z-10 w-full text-center">
          <span className="inline-block px-3.5 py-1 rounded-full text-[10px] font-mono font-bold tracking-wider bg-[#0284c7] text-white shadow-xs uppercase">
            DNA • TELEMETRY
          </span>
        </div>
      </div>
    </div>
  );
};
