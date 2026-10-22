import React from 'react';

interface MedicalPlusSquircleProps {
  size?: 'sm' | 'md' | 'lg';
}

export const MedicalPlusSquircle: React.FC<MedicalPlusSquircleProps> = ({ size = 'md' }) => {
  const containerDim = size === 'sm' ? 'w-44 h-44' : size === 'lg' ? 'w-56 h-56' : 'w-48 h-48 sm:w-52 sm:h-52';

  // Slices for realistic 3D volumetric extrusion along Z-axis
  const depthSlices = [
    { z: -14, bg: '#001e33', opacity: 0.95 },
    { z: -12, bg: '#002842', opacity: 0.95 },
    { z: -10, bg: '#003352', opacity: 0.95 },
    { z: -8, bg: '#003e63', opacity: 0.95 },
    { z: -6, bg: '#004a75', opacity: 0.95 },
    { z: -4, bg: '#005585', opacity: 0.95 },
    { z: -2, bg: '#006296', opacity: 0.95 },
    { z: 0, bg: '#006ea8', opacity: 0.95 },
    { z: 2, bg: '#007ab8', opacity: 0.95 },
    { z: 4, bg: '#0085c7', opacity: 0.95 },
    { z: 6, bg: '#0090d4', opacity: 0.95 },
    { z: 8, bg: '#009de0', opacity: 0.95 },
    { z: 10, bg: '#00a8eb', opacity: 0.95 },
    { z: 12, bg: '#00b4d8', opacity: 0.95 },
  ];

  return (
    <div className={`relative ${containerDim} flex items-center justify-center select-none`}>
      
      {/* ========================================================
          1. OUTER DASHED ORBITAL RING: ROTATES OUTSIDE (Image 2)
          ======================================================== */}
      <div 
        className="absolute -inset-4 sm:-inset-6 rounded-full border-2 border-sky-400/60 border-dashed animate-[spin_24s_linear_infinite] pointer-events-none"
        style={{
          boxShadow: '0 0 24px rgba(56, 189, 248, 0.22)',
        }}
      >
        {/* Top satellite telemetry node (cyan glowing orb with white center) */}
        <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 flex items-center justify-center">
          <div className="w-5 h-5 rounded-full bg-cyan-400 shadow-[0_0_14px_#22d3ee] ring-2 ring-white flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-white shadow-xs" />
          </div>
        </div>

        {/* Bottom-left telemetry node (deep ocean blue with ring) */}
        <div className="absolute -bottom-2 left-1/3 flex items-center justify-center">
          <div className="w-4 h-4 rounded-full bg-[#0077b6] shadow-[0_0_10px_#0284c7] ring-2 ring-white" />
        </div>

        {/* Right telemetry node with radial cyan glow */}
        <div className="absolute top-1/2 -right-2.5 flex items-center justify-center">
          <div className="w-4 h-4 rounded-full bg-cyan-400 shadow-[0_0_12px_#22d3ee] ring-2 ring-white" />
        </div>

        {/* Left telemetry dot */}
        <div className="absolute top-1/2 -left-2 flex items-center justify-center">
          <div className="w-3 h-3 rounded-full bg-sky-300 shadow-[0_0_8px_#38bdf8] ring-1.5 ring-white" />
        </div>

        {/* Orbital telemetry accent ticks */}
        <div className="absolute top-3 right-6 w-1.5 h-1.5 rounded-full bg-sky-400/80" />
        <div className="absolute bottom-4 left-6 w-1.5 h-1.5 rounded-full bg-cyan-400/80" />
        <div className="absolute top-4 left-6 w-1.5 h-1.5 rounded-full bg-blue-400/80" />
        <div className="absolute bottom-3 right-6 w-1.5 h-1.5 rounded-full bg-teal-400/80" />
      </div>

      {/* ========================================================
          2. SQUIRCLE CARD (PURE WHITE CARD AS IN IMAGE 2)
          ======================================================== */}
      <div className="relative w-full h-full rounded-[2.5rem] bg-white shadow-xl border border-sky-100/90 flex flex-col items-center justify-between p-4 sm:p-4.5 overflow-hidden">
        
        {/* Soft cyan gradient highlight in background */}
        <div className="absolute inset-0 bg-gradient-to-b from-sky-50/50 via-white to-transparent pointer-events-none" />

        {/* Subtle grid pattern inside squircle card */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage: `radial-gradient(#0077b6 0.75px, transparent 0.75px)`,
            backgroundSize: '12px 12px',
          }}
        />

        {/* ========================================================
            3. TRUE 3D VOLUMETRIC + SYMBOL
            Rotates inward in 45 degrees with physical depth & perspective
            ======================================================== */}
        <div 
          className="relative my-auto w-28 h-28 sm:w-32 sm:h-32 flex items-center justify-center"
          style={{
            perspective: '1000px',
          }}
        >
          {/* 3D Rotational Stage (Continuous spin tilted at 45° with 3D perspective) */}
          <div 
            className="relative w-full h-full flex items-center justify-center animate-[spin-inside-45_12s_linear_infinite]"
            style={{
              transformStyle: 'preserve-3d',
            }}
          >
            {/* 3D Extruded Block Cross Assembly */}
            <div 
              className="relative w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center"
              style={{
                transformStyle: 'preserve-3d',
              }}
            >
              
              {/* --- CAST AMBIENT 3D SHADOW ON BASE (Z: -20px) --- */}
              <div 
                className="absolute inset-0 flex items-center justify-center opacity-30 filter blur-[6px] pointer-events-none"
                style={{
                  transform: 'translateZ(-20px)',
                }}
              >
                <div className="absolute w-20 sm:w-24 h-7 sm:h-8 rounded-full bg-slate-900" />
                <div className="absolute h-20 sm:h-24 w-7 sm:w-8 rounded-full bg-slate-900" />
              </div>

              {/* --- VOLUMETRIC EXTRUSION SLICES (Stacking from Z: -14px to +12px) --- */}
              {depthSlices.map((slice, i) => (
                <div 
                  key={i}
                  className="absolute inset-0 flex items-center justify-center pointer-events-none"
                  style={{
                    transform: `translateZ(${slice.z}px)`,
                  }}
                >
                  {/* Horizontal Bar Slice */}
                  <div 
                    className="absolute w-20 sm:w-24 h-7 sm:h-8 rounded-full"
                    style={{
                      backgroundColor: slice.bg,
                      boxShadow: i === 0 ? '0 0 10px rgba(0, 30, 50, 0.8)' : undefined,
                    }}
                  />
                  {/* Vertical Bar Slice */}
                  <div 
                    className="absolute h-20 sm:h-24 w-7 sm:w-8 rounded-full"
                    style={{
                      backgroundColor: slice.bg,
                      boxShadow: i === 0 ? '0 0 10px rgba(0, 30, 50, 0.8)' : undefined,
                    }}
                  />
                </div>
              ))}

              {/* --- FRONT 3D CAP WITH METALLIC BEVEL & SPECULAR HIGHLIGHTS (Z: +13px) --- */}
              <div 
                className="absolute inset-0 flex items-center justify-center"
                style={{
                  transform: 'translateZ(13px)',
                  transformStyle: 'preserve-3d',
                }}
              >
                {/* Horizontal Arm Front Face */}
                <div 
                  className="absolute w-20 sm:w-24 h-7 sm:h-8 rounded-full bg-gradient-to-r from-[#005d90] via-[#0077b6] to-[#00b4d8] border border-white/50 overflow-hidden"
                  style={{
                    boxShadow: 'inset 0 2.5px 5px rgba(255,255,255,0.7), inset 0 -2.5px 5px rgba(0,0,0,0.35), 0 4px 14px rgba(0,119,182,0.45)',
                  }}
                >
                  {/* Specular Glare Sheen Slice */}
                  <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/45 to-transparent rounded-t-full pointer-events-none" />
                </div>

                {/* Vertical Arm Front Face */}
                <div 
                  className="absolute h-20 sm:h-24 w-7 sm:w-8 rounded-full bg-gradient-to-b from-[#00b4d8] via-[#0077b6] to-[#005d90] border border-white/50 overflow-hidden"
                  style={{
                    boxShadow: 'inset 2.5px 0 5px rgba(255,255,255,0.7), inset -2.5px 0 5px rgba(0,0,0,0.35), 0 4px 14px rgba(0,119,182,0.45)',
                  }}
                >
                  {/* Specular Glare Sheen Slice */}
                  <div className="absolute top-0 left-0 bottom-0 w-1/2 bg-gradient-to-r from-white/45 to-transparent rounded-l-full pointer-events-none" />
                </div>
              </div>

              {/* --- 3D MOLECULAR DNA RING & GLOWING NODES (Z: +18px) --- */}
              <div 
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
                style={{
                  transform: 'translateZ(18px)',
                  transformStyle: 'preserve-3d',
                }}
              >
                <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_4px_12px_rgba(255,255,255,0.95)]">
                  <defs>
                    <linearGradient id="ring3DWhite" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#ffffff" />
                      <stop offset="35%" stopColor="#e0f2fe" />
                      <stop offset="70%" stopColor="#bae6fd" />
                      <stop offset="100%" stopColor="#7dd3fc" />
                    </linearGradient>
                    <radialGradient id="sphereCyan" cx="30%" cy="30%" r="70%">
                      <stop offset="0%" stopColor="#ffffff" />
                      <stop offset="30%" stopColor="#67e8f9" />
                      <stop offset="70%" stopColor="#00b4d8" />
                      <stop offset="100%" stopColor="#0077b6" />
                    </radialGradient>
                    <radialGradient id="sphereWhite" cx="30%" cy="30%" r="70%">
                      <stop offset="0%" stopColor="#ffffff" />
                      <stop offset="50%" stopColor="#f0f9ff" />
                      <stop offset="85%" stopColor="#bae6fd" />
                      <stop offset="100%" stopColor="#0284c7" />
                    </radialGradient>
                  </defs>

                  {/* Elliptical 3D Ring wrapping around the cross intersection */}
                  <ellipse
                    cx="50"
                    cy="50"
                    rx="34"
                    ry="15"
                    fill="none"
                    stroke="url(#ring3DWhite)"
                    strokeWidth="3.6"
                    strokeLinecap="round"
                    transform="rotate(-18 50 50)"
                  />

                  {/* Horizontal 3D Molecular Connector Bar */}
                  <line
                    x1="22"
                    y1="50"
                    x2="78"
                    y2="50"
                    stroke="#ffffff"
                    strokeWidth="3.2"
                    strokeLinecap="round"
                  />

                  {/* Diagonal Crossing DNA Strands */}
                  <line x1="36" y1="30" x2="64" y2="70" stroke="#ffffff" strokeWidth="2.8" strokeLinecap="round" opacity="0.95" />
                  <line x1="64" y1="30" x2="36" y2="70" stroke="#ffffff" strokeWidth="2.8" strokeLinecap="round" opacity="0.95" />

                  {/* Outer Left 3D Spherical Node */}
                  <circle cx="18" cy="46" r="5.2" fill="url(#sphereCyan)" stroke="#ffffff" strokeWidth="1.8" />
                  {/* Outer Right 3D Spherical Node */}
                  <circle cx="82" cy="54" r="5.2" fill="url(#sphereCyan)" stroke="#ffffff" strokeWidth="1.8" />
                  
                  {/* Inner Horizontal Base Nodes */}
                  <circle cx="38" cy="50" r="3.8" fill="url(#sphereWhite)" stroke="#0077b6" strokeWidth="1.5" />
                  <circle cx="50" cy="50" r="4.8" fill="url(#sphereWhite)" stroke="#0284c7" strokeWidth="1.8" />
                  <circle cx="62" cy="50" r="3.8" fill="url(#sphereWhite)" stroke="#0077b6" strokeWidth="1.5" />

                  {/* Upper & Lower Helical Nodes */}
                  <circle cx="36" cy="30" r="3.5" fill="url(#sphereWhite)" stroke="#0077b6" strokeWidth="1.4" />
                  <circle cx="64" cy="30" r="3.5" fill="url(#sphereWhite)" stroke="#0077b6" strokeWidth="1.4" />
                  <circle cx="36" cy="70" r="3.5" fill="url(#sphereWhite)" stroke="#0077b6" strokeWidth="1.4" />
                  <circle cx="64" cy="70" r="3.5" fill="url(#sphereWhite)" stroke="#0077b6" strokeWidth="1.4" />
                </svg>
              </div>

            </div>
          </div>
        </div>

        {/* ========================================================
            4. BOTTOM PILL: DNA • TELEMETRY (Image 2 Match)
            ======================================================== */}
        <div className="z-10 w-full text-center">
          <span className="inline-block px-3.5 py-1 rounded-full text-[10px] font-mono font-bold tracking-wider bg-[#0284c7] text-white shadow-xs uppercase">
            DNA • TELEMETRY
          </span>
        </div>

      </div>

    </div>
  );
};
