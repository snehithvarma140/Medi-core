import React, { useState } from 'react';
import { useHealthcare } from '../../context/HealthcareContext';
import { UserRole } from '../../types/healthcare';
import { EcgLeadVisual } from '../common/EcgLeadVisual';
import { MedicalPlusSquircle } from '../common/MedicalPlusSquircle';
import { EmergencyDossierModal } from '../emergency/EmergencyDossierModal';
import hospitalAtriumImg from '../../assets/images/hospital_atrium_1791135460482.jpg';

export const LoginPage: React.FC = () => {
  const { login } = useHealthcare();

  const [activeRoleTab, setActiveRoleTab] = useState<'patient' | 'doctor' | 'hospital'>('patient');
  const [identifier, setIdentifier] = useState('MED-7X29K4');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberWorkstation, setRememberWorkstation] = useState(true);

  // Emergency Triage input & modal
  const [emergencyInputId, setEmergencyInputId] = useState('MED-7X29K4');
  const [isDossierOpen, setIsDossierOpen] = useState(false);

  // Registration modal
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [regName, setRegName] = useState('');
  const [regDob, setRegDob] = useState('1994-08-14');
  const [regGender, setRegGender] = useState('MALE');
  const [regPhone, setRegPhone] = useState('+1 (555) 392-1082');
  const [regEmail, setRegEmail] = useState('rahul.kumar@health.org');
  const [regEmergencyContact, setRegEmergencyContact] = useState('Priya Kumar (+1 555 392-1082)');
  const [generatedMediId, setGeneratedMediId] = useState<string | null>(null);

  const handleRoleTabClick = (tab: 'patient' | 'doctor' | 'hospital') => {
    setActiveRoleTab(tab);
    if (tab === 'patient') {
      setIdentifier('MED-7X29K4');
    } else if (tab === 'doctor') {
      setIdentifier('DOC-AR-8812');
    } else {
      setIdentifier('HOSP-ABC-01');
    }
  };

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    const role: UserRole =
      activeRoleTab === 'patient'
        ? 'PATIENT'
        : activeRoleTab === 'doctor'
        ? 'DOCTOR'
        : 'HOSPITAL_ADMIN';
    login(role, identifier);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    const newId = `MED-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    setGeneratedMediId(newId);
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 sm:p-6 lg:p-10 bg-slate-100 font-['Inter'] overflow-x-hidden">
      
      {/* Background with blurred atrium & subtle clinical grid overlay (Image 2) */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <img
          src={hospitalAtriumImg}
          alt="Modern Hospital Atrium"
          className="w-full h-full object-cover filter blur-[5px] opacity-45 scale-105"
        />
        {/* Subtle hospital architectural grid pattern (Image 2 Match) */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(to right, rgba(0, 180, 216, 0.14) 1px, transparent 1px), linear-gradient(to bottom, rgba(0, 180, 216, 0.14) 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
          }}
        />
        <div className="absolute inset-0 bg-white/35 backdrop-blur-[1px]" />
      </div>

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        
        {/* ========================================================
            LEFT COLUMN (Image 2 Match)
            - Squircle with Blue Cross + DNA Telemetry
            - Lead II ECG card + Heart Rate Pill
            - "Your Health. One Connected Identity."
            - Stat Metrics Bar
            ======================================================== */}
        <div className="lg:col-span-7 space-y-6 sm:space-y-8 py-4">
          
          {/* Medical + Symbol with Ring rotating outside, + symbol rotating inside 45° */}
          <div className="flex items-center">
            <MedicalPlusSquircle size="md" />
          </div>

          {/* Realtime Lead II Floating Card (Image 2 Pin-to-Pin Match) */}
          <div className="max-w-md bg-white rounded-2xl py-3 px-4 shadow-lg border border-slate-200/90 flex items-center justify-between gap-3">
            <div className="flex-1 overflow-hidden">
              <EcgLeadVisual heartRate={72} height={36} />
            </div>
            <div className="shrink-0 flex flex-col items-center justify-center pl-2 border-l border-slate-100 select-none">
              <span className="text-[10px] text-[#0077b6] font-black leading-none">▲</span>
              <span className="text-[9px] font-mono font-black text-[#0077b6] tracking-wider uppercase block my-0.5 whitespace-nowrap">
                REALTIME LEAD
              </span>
              <span className="text-[11px] font-mono font-black text-[#0077b6] leading-none block">
                II
              </span>
              <span className="text-[10px] text-[#0077b6] font-black leading-none">▼</span>
            </div>
          </div>

          {/* Vitals Pill (Image 2 Pin-to-Pin Match) */}
          <div>
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold text-slate-800 bg-white/95 backdrop-blur-md border border-slate-200 shadow-sm">
              <span className="text-rose-500">❤️</span>
              <span>72 BPM</span>
              <span className="text-slate-300">•</span>
              <span>SINUS RHYTHM</span>
              <span className="text-slate-300">•</span>
              <span className="text-slate-700">NORMAL TELEMETRY</span>
            </span>
          </div>

          {/* Big Typography Header */}
          <div className="space-y-1">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 font-['Plus_Jakarta_Sans'] tracking-tight leading-[1.08]">
              Your Health.
            </h1>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#0077b6] font-['Plus_Jakarta_Sans'] tracking-tight leading-[1.08]">
              One Connected Identity.
            </h1>
          </div>

          {/* Paragraph */}
          <p className="text-sm sm:text-base text-slate-600 font-normal leading-relaxed max-w-xl">
            Unified clinical data architecture seamlessly bridging Patients, Clinicians, Hospital Networks, and Rapid First Responders with verifiable zero-trust biometric clearance.
          </p>

          {/* 4-Item Floating Stat Card (Exact match to Image 2) */}
          <div className="max-w-xl bg-white/95 backdrop-blur-md rounded-2xl p-4 sm:p-5 shadow-lg border border-slate-200/90 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <span className="text-xl sm:text-2xl font-black text-slate-900 font-mono tracking-tight block">
                4,200+
              </span>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mt-0.5">
                Hospitals
              </span>
            </div>

            <div>
              <span className="text-xl sm:text-2xl font-black text-slate-900 font-mono tracking-tight block">
                18.5k+
              </span>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mt-0.5">
                Clinics & Labs
              </span>
            </div>

            <div>
              <span className="text-xl sm:text-2xl font-black text-[#0077b6] font-mono tracking-tight block">
                99.99%
              </span>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mt-0.5">
                Uptime Sync
              </span>
            </div>

            <div>
              <span className="text-lg sm:text-xl font-black text-slate-900 font-mono tracking-tight block">
                FHIR v4.0
              </span>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mt-0.5">
                ABDM Level 3
              </span>
            </div>
          </div>
        </div>

        {/* ========================================================
            RIGHT COLUMN: The Frosted Glass Floating Card
            ======================================================== */}
        <div className="lg:col-span-5 flex justify-center">
          <div className="w-full max-w-md bg-white/75 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_25px_60px_-15px_rgba(0,119,182,0.22)] border border-white/90 ring-1 ring-sky-500/15 p-7 sm:p-8 space-y-5 relative overflow-hidden">
            
            {/* Ambient Glass Prismatic Sheen */}
            <div className="absolute -top-28 -right-28 w-56 h-56 bg-gradient-to-br from-white/60 via-sky-200/30 to-transparent rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-gradient-to-tr from-cyan-200/25 via-white/30 to-transparent rounded-full blur-xl pointer-events-none" />
            
            {/* Card Header: Brand Logo */}
            <div className="relative z-10">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-[#0077b6] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M10 4a1 1 0 011-1h2a1 1 0 011 1v5h5a1 1 0 011 1v2a1 1 0 01-1 1h-5v5a1 1 0 01-1 1h-2a1 1 0 01-1-1v-5H5a1 1 0 01-1-1v-2a1 1 0 011-1h5V4z" />
                  </svg>
                </div>
                <div className="leading-none">
                  <div className="flex items-center gap-1">
                    <span className="text-base font-bold text-slate-900 font-['Plus_Jakarta_Sans']">
                      medi-core
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#0077b6]"></span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium">
                    Universal Health Network
                  </span>
                </div>
              </div>

              {/* Title & Subtitle */}
              <div className="mt-4">
                <h2 className="text-2xl font-extrabold text-slate-900 font-['Plus_Jakarta_Sans']">
                  Welcome Back
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Authenticate with your universal Medi ID, email, or cryptographic passkey.
                </p>
              </div>
            </div>

            {/* Segmented Role Selector Pills (Glass backdrop) */}
            <div className="relative z-10 grid grid-cols-3 gap-1 p-1 bg-slate-100/70 backdrop-blur-md rounded-xl border border-white/60 text-xs">
              <button
                type="button"
                onClick={() => handleRoleTabClick('patient')}
                className={`py-2 px-2 rounded-lg font-bold transition-all text-center whitespace-nowrap cursor-pointer ${
                  activeRoleTab === 'patient'
                    ? 'bg-[#0077b6] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Patient
              </button>

              <button
                type="button"
                onClick={() => handleRoleTabClick('doctor')}
                className={`py-2 px-2 rounded-lg font-bold transition-all text-center whitespace-nowrap cursor-pointer ${
                  activeRoleTab === 'doctor'
                    ? 'bg-[#0077b6] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Doctor / Clinician
              </button>

              <button
                type="button"
                onClick={() => handleRoleTabClick('hospital')}
                className={`py-2 px-2 rounded-lg font-bold transition-all text-center whitespace-nowrap cursor-pointer ${
                  activeRoleTab === 'hospital'
                    ? 'bg-[#0077b6] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Hospital Staff
              </button>
            </div>

            {/* Sign-in Form */}
            <form onSubmit={handleSignIn} className="space-y-4">
              
              {/* Field 1: Medi ID, Email or Phone */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-700">
                    Medi ID, Email or Phone
                  </label>
                  <span className="text-[10px] font-mono font-bold text-sky-700">
                    FORMAT: MED-XXXXXX
                  </span>
                </div>

                <div className="relative flex items-center">
                  <span className="absolute left-3 text-slate-400 text-sm">🪪</span>
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="e.g. MED-7X29K4 or rahul@health.org"
                    className="w-full pl-9 pr-3.5 py-2.5 text-xs font-mono font-semibold bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0077b6]"
                  />
                </div>
              </div>

              {/* Field 2: Password / Cryptographic Passkey */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-700">
                    Password / Cryptographic Passkey
                  </label>
                  <span className="text-[10px] text-slate-400">
                    FIDO2 / Biometric
                  </span>
                </div>

                <div className="relative flex items-center">
                  <span className="absolute left-3 text-slate-400 text-sm">🔒</span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••••"
                    className="w-full pl-9 pr-9 py-2.5 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0077b6]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 text-slate-400 hover:text-slate-700 text-xs"
                  >
                    {showPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
              </div>

              {/* Remember Workstation & Forgot Passkey */}
              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-2 cursor-pointer text-slate-700 font-medium">
                  <input
                    type="checkbox"
                    checked={rememberWorkstation}
                    onChange={(e) => setRememberWorkstation(e.target.checked)}
                    className="w-4 h-4 rounded text-[#0077b6] focus:ring-[#0077b6] border-slate-300"
                  />
                  <span className="flex items-center gap-1">
                    <span className="text-slate-400">🛈</span> Remember workstation
                  </span>
                </label>

                <button
                  type="button"
                  onClick={() => alert('Password reset / biometric recovery dispatched to registered mobile.')}
                  className="text-xs font-semibold text-[#0077b6] hover:underline"
                >
                  Forgot Passkey?
                </button>
              </div>

              {/* Blue Primary Sign In Button */}
              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl bg-[#0077b6] hover:bg-[#005d90] text-white text-xs font-bold shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Sign In to medi-core</span>
                <span>→</span>
              </button>
            </form>

            {/* Registration link */}
            <div className="text-center text-xs text-slate-500">
              <span>New to medi-core Healthcare Vault? </span>
              <button
                type="button"
                onClick={() => setShowRegisterModal(true)}
                className="font-bold text-[#0077b6] hover:underline cursor-pointer"
              >
                Create Medi ID
              </button>
            </div>

            {/* ========================================================
                RED PRIORITY EMERGENCY TRIAGE CARD (Exact Image 2 Match)
                ======================================================== */}
            <div className="bg-[#fff1f2] border border-[#fecdd3] rounded-2xl p-4 space-y-2.5">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-black text-rose-900">
                  <span className="text-rose-600 text-sm">✱</span>
                  <span>Priority Emergency Triage</span>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black text-white bg-[#e11d48] uppercase tracking-wider">
                  ACTIVE ER
                </span>
              </div>

              {/* Subtext */}
              <p className="text-[11px] text-rose-800 leading-snug">
                Paramedic & ER trauma clearance for instant access to critical blood groups, life-threatening allergies & surgical alerts.
              </p>

              {/* Verify input row */}
              <div className="flex items-center gap-2 pt-1">
                <div className="relative flex-1">
                  <span className="absolute left-2.5 top-2 text-rose-500 text-xs">🪪</span>
                  <input
                    type="text"
                    value={emergencyInputId}
                    onChange={(e) => setEmergencyInputId(e.target.value)}
                    placeholder="MED-7X29K4"
                    className="w-full pl-7 pr-2 py-1.5 text-xs font-mono font-bold uppercase bg-white border border-rose-300 rounded-lg text-rose-950 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => setIsDossierOpen(true)}
                  className="px-4 py-1.5 bg-[#e11d48] hover:bg-rose-700 text-white text-xs font-bold rounded-lg shadow-xs transition-colors flex items-center gap-1 whitespace-nowrap cursor-pointer"
                >
                  <span>⚡</span>
                  <span>Verify</span>
                </button>
              </div>

              {/* Open Summary link */}
              <div className="pt-0.5 text-center">
                <button
                  type="button"
                  onClick={() => setIsDossierOpen(true)}
                  className="text-[11px] font-bold text-rose-900 hover:text-rose-950 hover:underline flex items-center justify-center gap-1 mx-auto cursor-pointer"
                >
                  <span>📄</span>
                  <span>Open Ravi Kumar (MED-7X29K4) Emergency Summary</span>
                </button>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Emergency Dossier Modal */}
      <EmergencyDossierModal
        isOpen={isDossierOpen}
        mediId={emergencyInputId}
        onClose={() => setIsDossierOpen(false)}
        onProceedToTriage={() => {
          setIsDossierOpen(false);
          login('EMERGENCY_STAFF', emergencyInputId);
        }}
      />

      {/* Registration Modal */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Create your Universal Medi ID</h3>
                <p className="text-xs text-slate-500">Nationwide connected healthcare identity record.</p>
              </div>
              <button
                onClick={() => { setShowRegisterModal(false); setGeneratedMediId(null); }}
                className="text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            {generatedMediId ? (
              <div className="p-6 text-center space-y-3 bg-emerald-50 rounded-2xl border border-emerald-200">
                <span className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto text-xl font-bold">
                  ✓
                </span>
                <h4 className="text-base font-bold text-emerald-950">Registration Complete!</h4>
                <p className="text-xs text-emerald-800">Your unique, lifetime Medi ID has been provisioned:</p>
                <div className="p-3 bg-white rounded-xl border border-emerald-300 font-mono text-xl font-black text-[#0077b6]">
                  {generatedMediId}
                </div>
                <button
                  onClick={() => {
                    setIdentifier(generatedMediId);
                    setShowRegisterModal(false);
                    login('PATIENT', generatedMediId);
                  }}
                  className="w-full py-2.5 bg-[#0077b6] text-white text-xs font-bold rounded-xl"
                >
                  Enter Patient Dashboard Now
                </button>
              </div>
            ) : (
              <form onSubmit={handleRegister} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Full Legal Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Kumar"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    className="w-full px-3 py-2 text-xs border rounded-lg"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Date of Birth</label>
                    <input
                      type="date"
                      required
                      value={regDob}
                      onChange={(e) => setRegDob(e.target.value)}
                      className="w-full px-3 py-2 text-xs border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Gender</label>
                    <select
                      value={regGender}
                      onChange={(e) => setRegGender(e.target.value)}
                      className="w-full px-3 py-2 text-xs border rounded-lg"
                    >
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Mobile Phone</label>
                    <input
                      type="tel"
                      required
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      className="w-full px-3 py-2 text-xs border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Email Address</label>
                    <input
                      type="email"
                      required
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      className="w-full px-3 py-2 text-xs border rounded-lg"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Emergency Contact (Next-of-Kin)</label>
                  <input
                    type="text"
                    required
                    value={regEmergencyContact}
                    onChange={(e) => setRegEmergencyContact(e.target.value)}
                    className="w-full px-3 py-2 text-xs border rounded-lg"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t">
                  <button
                    type="button"
                    onClick={() => setShowRegisterModal(false)}
                    className="px-4 py-2 border rounded-lg text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#0077b6] text-white text-xs font-bold rounded-lg"
                  >
                    Generate Medi ID
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
