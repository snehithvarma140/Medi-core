import React, { useState } from 'react';
import { useHealthcare } from '../../context/HealthcareContext';
import { BloodGroup } from '../../types/healthcare';
import { EcgLeadVisual } from '../common/EcgLeadVisual';

export const EmergencyPortal: React.FC = () => {
  const {
    activePatient,
    emergencyRecords,
    createEmergencyIntake,
    linkEmergencyRecordToPatient,
    lookupPatientByMediId,
    addNotification,
  } = useHealthcare();

  // Rapid Scan Lookup State
  const [searchMediId, setSearchMediId] = useState('MED-7X29K4');
  const [foundPatient, setFoundPatient] = useState<any>(activePatient);
  const [showCallAlert, setShowCallAlert] = useState(false);
  const [selectedScanDetail, setSelectedScanDetail] = useState<string | null>(null);

  // Unidentified Patient Rapid Intake Form (Integrated in Single Dashboard)
  const [showIntakeForm, setShowIntakeForm] = useState(false);
  const [approxAge, setApproxAge] = useState('30 - 40');
  const [gender, setGender] = useState<'MALE' | 'FEMALE' | 'OTHER' | 'UNKNOWN'>('MALE');
  const [bloodGroup, setBloodGroup] = useState<BloodGroup>('UNKNOWN');
  const [arrivalMode, setArrivalMode] = useState<'Ambulance 108' | 'Private Vehicle' | 'Police Escort' | 'Walk-in'>('Ambulance 108');
  const [ambulanceId, setAmbulanceId] = useState('AMB-108-BRAVO');
  const [condition, setCondition] = useState<'CRITICAL' | 'UNCONSCIOUS' | 'STABLE' | 'OBSERVATION'>('UNCONSCIOUS');
  const [visibleTrauma, setVisibleTrauma] = useState('Multiple lacerations, vehicular blunt force impact to chest and limb');
  const [belongingsText, setBelongingsText] = useState('Wallet (no ID card), Cracked smartphone, Vehicle keys on carabiner, Silver wrist watch');

  // Linking state
  const [linkingRecordId, setLinkingRecordId] = useState<string | null>(null);
  const [linkingMediId, setLinkingMediId] = useState('MED-7X29K4');

  const handleSearchMediId = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const res = lookupPatientByMediId(searchMediId);
    if (res) {
      setFoundPatient(res);
      addNotification(`Critical emergency profile retrieved for Medi ID ${res.mediId}`, 'alert');
    } else {
      addNotification(`No matching Medi ID found for "${searchMediId}". Temporary emergency ID recommended.`, 'alert');
    }
  };

  const handleCreateIntake = (e: React.FormEvent) => {
    e.preventDefault();
    const belongings = belongingsText.split(',').map((b) => ({
      item: b.trim(),
      quantity: 1,
      condition: 'Secured in trauma custody pack',
      custodyStatus: 'SECURED' as const,
    }));

    const tempId = createEmergencyIntake({
      approxAge,
      gender,
      bloodGroup,
      arrivalMode,
      ambulanceId,
      condition,
      visibleTrauma,
      broughtBy: 'Paramedics & Highway Patrol Unit 4',
      belongings,
      triageNotes: 'Immediate trauma resuscitation protocol active. Crossmatch requested.',
    });

    addNotification(`Created Emergency Case ${tempId}`, 'alert');
    setShowIntakeForm(false);
  };

  const handleLinkRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkingRecordId) return;

    linkEmergencyRecordToPatient(linkingRecordId, linkingMediId);
    setLinkingRecordId(null);
  };

  return (
    <div className="space-y-6 pb-12 font-['Inter']">
      
      {/* ========================================================
          SINGLE UNIFIED DASHBOARD: "Medi ID Rapid Scan"
          ======================================================== */}
      
      {/* Emergency Header Banner */}
      <div className="bg-red-600 text-white rounded-3xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 border border-red-700">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white text-red-600 flex items-center justify-center text-3xl font-black shadow-md shrink-0">
            🚨
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black font-['Plus_Jakarta_Sans'] uppercase tracking-wide">
                Medi ID Rapid Scan
              </h1>
              <span className="text-xs font-bold text-red-900 bg-red-100 px-3 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
                Trauma Code Red Active
              </span>
            </div>
            <p className="text-xs text-red-100 mt-1 max-w-2xl">
              Zero-latency emergency medical triage dossier. Instant blood compatibility, anaphylaxis warnings, complete past medical history & uncompromised next-of-kin directives.
            </p>
          </div>
        </div>

        {/* Quick action button for intake */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowIntakeForm(!showIntakeForm)}
            className="px-4 py-2 bg-red-800 hover:bg-red-900 text-white text-xs font-bold rounded-xl border border-red-400 transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            <span>{showIntakeForm ? '✕ Close Intake Form' : '📝 Log Unidentified Patient (Temp ID)'}</span>
          </button>
        </div>
      </div>

      {/* ========================================================
          RAPID SCAN BAR WITH SAMPLE SHORTCUTS
          ======================================================== */}
      <div className="bg-white rounded-3xl p-6 border-2 border-red-300 shadow-md space-y-4">
        <form onSubmit={handleSearchMediId} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
              🔍
            </span>
            <input
              type="text"
              value={searchMediId}
              onChange={(e) => setSearchMediId(e.target.value)}
              placeholder="Enter Patient Medi ID (e.g. MED-7X29K4, MED-8K29L2) or scan optical barcode..."
              className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-2 border-slate-200 focus:border-red-500 rounded-2xl text-sm font-mono font-bold text-slate-900 focus:outline-none transition-colors"
            />
          </div>

          <button
            type="submit"
            className="px-8 py-3.5 bg-red-600 hover:bg-red-700 text-white font-bold text-sm rounded-2xl shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer shrink-0"
          >
            <span>⚡ Retrieve Emergency Profile</span>
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs text-slate-500 font-medium">Quick Emergency Demos:</span>
          <button
            onClick={() => {
              setSearchMediId('MED-7X29K4');
              const res = lookupPatientByMediId('MED-7X29K4');
              if (res) setFoundPatient(res);
            }}
            className="px-3 py-1 bg-red-50 hover:bg-red-100 text-red-700 font-mono text-xs font-bold rounded-lg border border-red-200 transition-colors"
          >
            MED-7X29K4 (Rahul Kumar • B+ • Penicillin Anaphylaxis)
          </button>
          <button
            onClick={() => {
              setSearchMediId('MED-8K29L2');
              const res = lookupPatientByMediId('MED-8K29L2');
              if (res) setFoundPatient(res);
            }}
            className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono text-xs font-bold rounded-lg border border-slate-300 transition-colors"
          >
            MED-8K29L2 (Priya Sharma • O+ • Sulfa Allergy)
          </button>
        </div>
      </div>

      {/* ========================================================
          OPTIONAL: UNIDENTIFIED PATIENT RAPID INTAKE FORM (IN-LINE)
          ======================================================== */}
      {showIntakeForm && (
        <div className="bg-amber-50/70 border-2 border-amber-300 rounded-3xl p-6 shadow-md space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between pb-3 border-b border-amber-200">
            <div className="flex items-center gap-2">
              <span className="text-xl">🚑</span>
              <div>
                <h3 className="text-base font-extrabold text-amber-950 font-['Plus_Jakarta_Sans']">
                  Rapid Intake for Unconscious or Unidentified Patient
                </h3>
                <p className="text-xs text-amber-800">
                  Instantly provisions a Temporary Trauma ID (`TEMP-EMR-XXXX`) and tracks belongings chain-of-custody.
                </p>
              </div>
            </div>
            <button onClick={() => setShowIntakeForm(false)} className="text-amber-700 hover:text-amber-950 font-bold text-sm">✕</button>
          </div>

          <form onSubmit={handleCreateIntake} className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-bold text-amber-900 mb-1">Estimated Age Bracket</label>
              <input
                type="text"
                value={approxAge}
                onChange={(e) => setApproxAge(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-amber-300 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-bold text-amber-900 mb-1">Apparent Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as any)}
                className="w-full px-3 py-2 bg-white border border-amber-300 rounded-xl"
              >
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="UNKNOWN">Unidentified / Unknown</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-amber-900 mb-1">Blood Group (If field-tested)</label>
              <select
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value as any)}
                className="w-full px-3 py-2 bg-white border border-amber-300 rounded-xl"
              >
                <option value="UNKNOWN">UNKNOWN (Pending Crossmatch)</option>
                <option value="O-">O Negative (Universal Emergency PRBC)</option>
                <option value="O+">O Positive</option>
                <option value="A+">A Positive</option>
                <option value="A-">A Negative</option>
                <option value="B+">B Positive</option>
                <option value="B-">B Negative</option>
                <option value="AB+">AB Positive</option>
                <option value="AB-">AB Negative</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-amber-900 mb-1">Arrival Mode</label>
              <select
                value={arrivalMode}
                onChange={(e) => setArrivalMode(e.target.value as any)}
                className="w-full px-3 py-2 bg-white border border-amber-300 rounded-xl"
              >
                <option value="Ambulance 108">Ambulance 108</option>
                <option value="Police Escort">Police Highway Escort</option>
                <option value="Private Vehicle">Private Vehicle Good Samaritan</option>
                <option value="Walk-in">Walk-in Triage</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-amber-900 mb-1">Ambulance / Dispatch ID</label>
              <input
                type="text"
                value={ambulanceId}
                onChange={(e) => setAmbulanceId(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-amber-300 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-bold text-amber-900 mb-1">Triage Condition Level</label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value as any)}
                className="w-full px-3 py-2 bg-white border border-amber-300 rounded-xl"
              >
                <option value="CRITICAL">CRITICAL (Code Red)</option>
                <option value="UNCONSCIOUS">UNCONSCIOUS (GCS &lt; 8)</option>
                <option value="STABLE">STABLE</option>
                <option value="OBSERVATION">OBSERVATION</option>
              </select>
            </div>

            <div className="sm:col-span-3">
              <label className="block font-bold text-amber-900 mb-1">Visible Trauma & Paramedic Notes</label>
              <input
                type="text"
                value={visibleTrauma}
                onChange={(e) => setVisibleTrauma(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-amber-300 rounded-xl"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block font-bold text-amber-900 mb-1">Patient Belongings (Chain-of-Custody logged into safe)</label>
              <input
                type="text"
                value={belongingsText}
                onChange={(e) => setBelongingsText(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-amber-300 rounded-xl font-mono"
              />
            </div>

            <div className="sm:col-span-3 flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowIntakeForm(false)}
                className="px-4 py-2 bg-white border border-amber-300 text-amber-900 font-bold rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-xs"
              >
                Generate Temporary EMR & Activate Code Red
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================
          PATIENT DOSSIER: COMPLETE EMERGENCY HEALTH SUMMARY
          ======================================================== */}
      {foundPatient && (
        <div className="space-y-6">
          
          {/* Top Urgent Metrics (Blood Group, Allergies, Next of Kin, Telemetry) */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            
            {/* Left 4 cols: Blood Group & Next of Kin Directives */}
            <div className="md:col-span-5 space-y-4">
              
              {/* Massive Blood Group & Crossmatch Card */}
              <div className="bg-gradient-to-br from-rose-600 via-rose-700 to-red-800 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden space-y-4">
                <div className="absolute -right-6 -bottom-6 w-36 h-36 rounded-full bg-white/10 blur-xl pointer-events-none" />
                
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold bg-white/20 px-3 py-1 rounded-full uppercase tracking-wider">
                    VERIFIED IMMUNOHISTOLOGY
                  </span>
                  <span className="text-xs font-mono text-rose-200">
                    ID: {foundPatient.mediId}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div>
                    <span className="text-xs uppercase text-rose-200 font-semibold block tracking-wider">
                      ABO & Rh Blood Type
                    </span>
                    <div className="text-5xl font-black font-mono tracking-tight text-white mt-1">
                      {foundPatient.bloodGroup}
                    </div>
                    <span className="text-xs text-rose-100 font-medium mt-1 block">
                      Rh Positive • D-Antigen Reactive
                    </span>
                  </div>

                  <div className="text-right space-y-1 text-xs">
                    <div className="bg-white/15 px-3 py-1.5 rounded-xl text-right">
                      <span className="text-[10px] text-rose-200 block uppercase font-bold">RBC Transfusion</span>
                      <span className="font-bold text-white">Can Receive B+, B-, O+, O-</span>
                    </div>
                    <div className="bg-white/15 px-3 py-1.5 rounded-xl text-right">
                      <span className="text-[10px] text-rose-200 block uppercase font-bold">Plasma Match</span>
                      <span className="font-bold text-white">Can Receive B, AB</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-rose-500/50 flex items-center justify-between text-xs text-rose-100">
                  <span>Emergency Universal PRBC: <strong>O-Negative</strong></span>
                  <span>Crossmatch Status: <strong>Pre-Cleared</strong></span>
                </div>
              </div>

              {/* Next of Kin Emergency Contact Direct Dial */}
              <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">📞</span>
                    <h3 className="text-sm font-bold text-slate-900 font-['Plus_Jakarta_Sans']">
                      Next-of-Kin Emergency Proxy
                    </h3>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                    Verified Surrogate
                  </span>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between gap-3">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{foundPatient.emergencyContact || 'Priya Kumar (Spouse)'}</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">Primary legal surrogate for emergency surgical consent</p>
                  </div>
                  
                  <button
                    onClick={() => {
                      setShowCallAlert(true);
                      setTimeout(() => setShowCallAlert(false), 4000);
                      addNotification('Connecting encrypted trauma hotline to next-of-kin proxy...', 'info');
                    }}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors shrink-0"
                  >
                    Direct Dial
                  </button>
                </div>

                {showCallAlert && (
                  <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-xs text-emerald-950 flex items-center justify-between animate-in fade-in">
                    <span>📡 Dialing Next-of-Kin Proxy (+1 555 392-1082)...</span>
                    <span className="font-mono font-bold text-emerald-700">RINGING</span>
                  </div>
                )}
              </div>

              {/* Attending Hospital & Physician */}
              <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs text-xs space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Current Inpatient Station
                </span>
                <div className="flex justify-between items-center text-slate-800 font-semibold">
                  <span>Hospital:</span>
                  <span className="text-[#0077b6] font-bold">{foundPatient.hospital || 'ABC Hospital Network'}</span>
                </div>
                <div className="flex justify-between items-center text-slate-800">
                  <span>Assigned Unit:</span>
                  <span className="font-mono font-bold bg-slate-100 px-2 py-0.5 rounded">{foundPatient.assignedWard || 'Ward: ICU'} • {foundPatient.assignedBed || 'Bed: ICU-07'}</span>
                </div>
                <div className="flex justify-between items-center text-slate-800">
                  <span>Attending Physician:</span>
                  <span className="font-semibold">{foundPatient.attendingDoctor || 'Dr. Anjali Rao'}</span>
                </div>
              </div>
            </div>

            {/* Right 7 cols: Fatal Anaphylaxis Alert, Vitals, and Realtime ECG */}
            <div className="md:col-span-7 space-y-4">
              
              {/* FATAL ALLERGY ALERT BANNER */}
              <div className="bg-[#fff1f2] border-2 border-red-400 rounded-3xl p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-rose-800">
                    <span className="text-2xl">⚠️</span>
                    <h3 className="text-sm font-black uppercase tracking-wider text-rose-950 font-['Plus_Jakarta_Sans']">
                      FATAL ALLERGY: PENICILLIN & BETA-LACTAMS
                    </h3>
                  </div>
                  <span className="text-[11px] font-black text-white bg-rose-700 px-3 py-1 rounded-full uppercase tracking-wider animate-pulse">
                    CRITICAL CONTRAINDICATION
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-rose-950 leading-relaxed font-medium">
                  <p>
                    <strong>Anaphylaxis History:</strong> Severe Grade III anaphylaxis documented. Rapid bronchospasm, laryngeal edema, and cutaneous urticaria within 20 minutes of beta-lactam exposure.
                  </p>
                  <p className="text-rose-900 bg-rose-100/80 p-2.5 rounded-xl border border-rose-200">
                    🚫 <strong>PROHIBITED DRUGS:</strong> Amoxicillin, Ampicillin, Piperacillin/Tazobactam (Zosyn), Augmentin, Penicillin G/VK, Cephalexin.
                  </p>
                  <p className="text-emerald-900 bg-emerald-50 p-2 rounded-xl border border-emerald-200">
                    ✓ <strong>SAFE ANTIMICROBIAL ALTERNATIVES:</strong> Fluoroquinolones (Ciprofloxacin, Levofloxacin), Macrolides (Azithromycin), Vancomycin, Aminoglycosides.
                  </p>
                </div>
              </div>

              {/* Vitals Telemetry Box */}
              <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-base">🫀</span>
                    <h3 className="text-sm font-bold text-slate-900 font-['Plus_Jakarta_Sans']">
                      Objective Hemodynamic Vitals
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full font-bold">
                    Telemetry Stream Synchronized
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Heart Rate</span>
                    <span className="text-2xl font-black text-slate-900 font-mono mt-0.5 block">
                      {foundPatient.vitals?.heartRate || 72}
                    </span>
                    <span className="text-[10px] text-emerald-700 font-semibold">Normal Sinus</span>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">BP (mmHg)</span>
                    <span className="text-xl font-black text-slate-900 font-mono mt-0.5 block">
                      {foundPatient.vitals?.systolicBP || 120} / {foundPatient.vitals?.diastolicBP || 80}
                    </span>
                    <span className="text-[10px] text-emerald-700 font-semibold">Normotensive</span>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">SpO2</span>
                    <span className="text-2xl font-black text-slate-900 font-mono mt-0.5 block">
                      {foundPatient.vitals?.spo2 || 98}%
                    </span>
                    <span className="text-[10px] text-emerald-700 font-semibold">Ambient Air</span>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Body Temp</span>
                    <span className="text-2xl font-black text-slate-900 font-mono mt-0.5 block">
                      {foundPatient.vitals?.bodyTemp || 98.4}°F
                    </span>
                    <span className="text-[10px] text-emerald-700 font-semibold">Normothermic</span>
                  </div>
                </div>

                {/* Continuous ECG Trace */}
                <div className="pt-2 border-t border-slate-100">
                  <div className="flex justify-between items-center text-[10px] text-slate-400 mb-1.5 font-mono">
                    <span>CONTINUOUS LEAD II TELEMETRY</span>
                    <span className="text-sky-600 font-bold">25 mm/s • 10 mm/mV</span>
                  </div>
                  <div className="rounded-xl overflow-hidden border border-slate-200">
                    <EcgLeadVisual heartRate={foundPatient.vitals?.heartRate || 72} height={40} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================
              FULL MEDICAL HISTORY & PAST 5+ YEARS OF CLINICAL DATA
              ======================================================== */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b">
              <div>
                <span className="text-xs font-mono font-bold text-sky-800 uppercase tracking-wider">
                  Longitudinal Clinical Dossier (5+ Years Records)
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-1 font-['Plus_Jakarta_Sans']">
                  Complete Past Medical History, Hospital Visits & Past Treatments
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Detailed chronicle of past admissions, diagnoses, prescribed tablets, and surgical interventions.
                </p>
              </div>

              <span className="text-xs font-mono font-bold text-[#0077b6] bg-sky-50 px-3 py-1 rounded-lg border border-sky-100">
                {foundPatient.medicalVisits?.length || 9} Total Encounters
              </span>
            </div>

            {/* Chronic Conditions & Past Surgeries Chips */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="font-bold text-slate-800 block text-xs mb-1.5">Chronic Health Diagnoses:</span>
                <ul className="space-y-1 text-slate-600 list-disc list-inside">
                  <li>Type II Diabetes Mellitus (Controlled, HbA1c 6.8%)</li>
                  <li>Essential Hypertension (Borderline 120-126/80-84 mmHg)</li>
                  <li>Mild Sinus Tachycardia (Stress induced)</li>
                  <li>L4-L5 Lumbar Disc Desiccation</li>
                </ul>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="font-bold text-slate-800 block text-xs mb-1.5">Surgical & Trauma History:</span>
                <ul className="space-y-1 text-slate-600 list-disc list-inside">
                  <li>Emergency Laparoscopic Appendectomy (Jan 2021, Apollo Metro Care, Dr. Amitav Ghosh)</li>
                  <li>Acute Lumbar Strain Rehabilitation (Aug 2022, Fortis)</li>
                  <li>Penicillin Anaphylaxis Resuscitation (Nov 2025, ABC Hospital)</li>
                </ul>
              </div>
            </div>

            {/* Longitudinal Past Visits Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px] font-bold">
                    <th className="py-2.5 px-3">Date / Year</th>
                    <th className="py-2.5 px-3">Hospital Facility</th>
                    <th className="py-2.5 px-3">Encounter Reason & Diagnosis</th>
                    <th className="py-2.5 px-3">Attending Doctor</th>
                    <th className="py-2.5 px-3">Tablets & Treatment Given</th>
                    <th className="py-2.5 px-3">Stay</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(foundPatient.medicalVisits || []).map((v: any) => (
                    <tr key={v.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3 font-mono font-bold text-slate-800 whitespace-nowrap">
                        {v.date}
                        <span className="block text-[10px] text-slate-400 font-sans">{v.category.toUpperCase()}</span>
                      </td>
                      <td className="py-3 px-3 font-semibold text-slate-900">{v.hospitalName}</td>
                      <td className="py-3 px-3">
                        <span className="font-bold text-slate-800 block">{v.reason}</span>
                        <span className="text-slate-500 text-[11px]">{v.diagnosis}</span>
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="font-semibold text-slate-800">{v.doctorName}</span>
                        <span className="block text-[10px] text-slate-400">{v.specialty}</span>
                      </td>
                      <td className="py-3 px-3 text-slate-700">
                        <div className="flex flex-wrap gap-1">
                          {v.tabletsGiven?.map((tab: string, idx: number) => (
                            <span key={idx} className="bg-sky-50 text-[#005d90] border border-sky-100 px-2 py-0.5 rounded text-[10px] font-mono font-medium">
                              {tab}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-600 whitespace-nowrap">
                        {v.durationDays} day{v.durationDays > 1 ? 's' : ''}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Diagnostic Scans and BP Records Quick View */}
            <div className="pt-4 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                  🩻 Diagnostic Imaging Scans in Medi ID Vault
                </span>
                <div className="space-y-1.5 text-xs text-slate-700">
                  <div className="flex justify-between items-center p-2 bg-white rounded-lg border border-slate-200">
                    <span>Thoracic Chest X-Ray (PA View - 2026)</span>
                    <span className="text-emerald-700 font-bold font-mono">Clear Fields</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-white rounded-lg border border-slate-200">
                    <span>2D Echocardiogram Doppler (2026)</span>
                    <span className="text-emerald-700 font-bold font-mono">LVEF 62%</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-white rounded-lg border border-slate-200">
                    <span>Lumbar Spine 3T Sagittal MRI (2022)</span>
                    <span className="text-amber-700 font-bold font-mono">L4-L5 Desiccation</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-white rounded-lg border border-slate-200">
                    <span>Whole Abdomen Ultrasound (2025)</span>
                    <span className="text-emerald-700 font-bold font-mono">Normal Organs</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                  💊 Active Medications Schedule
                </span>
                <div className="space-y-1.5 text-xs text-slate-700">
                  <div className="flex justify-between items-center p-2 bg-white rounded-lg border border-slate-200">
                    <div>
                      <span className="font-bold text-slate-900">Medicine A (Metformin ER 500mg)</span>
                      <p className="text-[10px] text-slate-400">Twice daily (08:00 AM & 08:00 PM) post meals</p>
                    </div>
                    <span className="text-[#0077b6] font-bold font-mono">ACTIVE</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-white rounded-lg border border-slate-200">
                    <div>
                      <span className="font-bold text-slate-900">Medicine B (Glimepiride 1mg)</span>
                      <p className="text-[10px] text-slate-400">Once daily (01:00 PM) before lunch</p>
                    </div>
                    <span className="text-[#0077b6] font-bold font-mono">ACTIVE</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-white rounded-lg border border-slate-200">
                    <div>
                      <span className="font-bold text-slate-900">Atorvastatin 10mg</span>
                      <p className="text-[10px] text-slate-400">Once daily bedtime (Cardioprotective)</p>
                    </div>
                    <span className="text-slate-500 font-bold font-mono">ONGOING</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          ACTIVE EMERGENCY CASES REGISTRY & LINKING ON SAME DASHBOARD
          ======================================================== */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">📋</span>
            <div>
              <h3 className="text-base font-bold text-slate-900 font-['Plus_Jakarta_Sans']">
                Active Emergency & Trauma Triage Cases
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Real-time registry of all admitted temporary trauma cases and linked verified Medi IDs.
              </p>
            </div>
          </div>
          <span className="text-xs font-mono font-bold text-red-700 bg-red-50 border border-red-200 px-3 py-1 rounded-lg">
            {emergencyRecords.length} Active Records
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px] font-bold">
                <th className="py-2.5 px-3">Emergency Case ID</th>
                <th className="py-2.5 px-3">Patient Identity</th>
                <th className="py-2.5 px-3">Arrival Mode & Time</th>
                <th className="py-2.5 px-3">Triage Condition</th>
                <th className="py-2.5 px-3">Blood Group</th>
                <th className="py-2.5 px-3">Belongings Logged</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {emergencyRecords.map((rec) => {
                const isLinked = !!rec.patientMediId;
                return (
                  <tr key={rec.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-red-700">
                      {rec.temporaryEmergencyId}
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-900">
                      {isLinked ? (
                        <div>
                          <span>{rec.patientName}</span>
                          <span className="block text-[10px] font-mono text-sky-700">{rec.patientMediId}</span>
                        </div>
                      ) : (
                        <div>
                          <span className="text-amber-800 font-bold">UNIDENTIFIED</span>
                          <span className="block text-[10px] text-slate-400">{rec.gender} • {rec.approxAge} yrs</span>
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-3 text-slate-600">
                      <span>{rec.arrivalMode}</span>
                      <span className="block text-[10px] text-slate-400">{rec.arrivalTime} • {rec.ambulanceId}</span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800 border border-red-200">
                        {rec.condition}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono font-bold">
                      <span className={`px-2 py-0.5 rounded text-[10px] ${rec.bloodGroup === 'UNKNOWN' ? 'bg-amber-100 text-amber-900' : 'bg-rose-100 text-rose-900'}`}>
                        {rec.bloodGroup}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-500">
                      {rec.belongings.length} items secured in safe
                    </td>
                    <td className="py-3 px-3 text-right">
                      {isLinked ? (
                        <span className="text-xs font-bold text-emerald-700">✓ Linked</span>
                      ) : (
                        <button
                          onClick={() => setLinkingRecordId(rec.id)}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-[11px] transition-colors"
                        >
                          Link to Medi ID
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Linking Modal */}
      {linkingRecordId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900 font-['Plus_Jakarta_Sans']">
              Link Temporary Emergency Case to Verified Medi ID
            </h3>
            <p className="text-xs text-slate-500">
              Once patient is identified, link case {linkingRecordId} to merge forensic belongings and trauma notes into their permanent medical vault.
            </p>

            <form onSubmit={handleLinkRecord} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Target Patient Medi ID</label>
                <input
                  type="text"
                  required
                  value={linkingMediId}
                  onChange={(e) => setLinkingMediId(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono font-bold border border-slate-300 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setLinkingRecordId(null)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs"
                >
                  Confirm & Merge Records
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
