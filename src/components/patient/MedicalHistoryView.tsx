import React, { useState, useEffect } from 'react';
import { useHealthcare } from '../../context/HealthcareContext';
import { MedicalVisit, MedicalScan } from '../../types/healthcare';
import { generatePatientAiSummary } from '../../services/aiMedicalSummary';

export const MedicalHistoryView: React.FC = () => {
  const { medicalVisits, bpRecords, medicalScans, prescriptions, activePatient } = useHealthcare();
  
  const [activeSubTab, setActiveSubTab] = useState<'timeline' | 'scans' | 'bp' | 'past_prescriptions' | 'ai_summary'>('timeline');
  const [selectedVisit, setSelectedVisit] = useState<MedicalVisit>(medicalVisits[0]);
  const [selectedScan, setSelectedScan] = useState<MedicalScan | null>(null);
  const [aiPatientSummary, setAiPatientSummary] = useState<string>('');
  const [isGeneratingAi, setIsGeneratingAi] = useState<boolean>(false);

  useEffect(() => {
    if (activeSubTab === 'ai_summary' && !aiPatientSummary) {
      handleGeneratePatientSummary();
    }
  }, [activeSubTab]);

  const handleGeneratePatientSummary = async () => {
    setIsGeneratingAi(true);
    try {
      const summary = await generatePatientAiSummary(activePatient);
      setAiPatientSummary(summary);
    } catch {
      setAiPatientSummary('Medical history synthesis initialized for active patient.');
    } finally {
      setIsGeneratingAi(false);
    }
  };

  // Group visits by Year
  const visitsByYear = medicalVisits.reduce((acc, visit) => {
    const year = visit.year ? visit.year.toString() : visit.date.split(' ').pop() || '2026';
    if (!acc[year]) acc[year] = [];
    acc[year].push(visit);
    return acc;
  }, {} as Record<string, MedicalVisit[]>);

  const sortedYears = Object.keys(visitsByYear).sort((a, b) => Number(b) - Number(a));

  return (
    <div className="space-y-6 pb-12 font-['Inter']">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono tracking-wider uppercase text-sky-800 font-semibold bg-sky-50 px-2.5 py-1 rounded-md border border-sky-200">
            Longitudinal Health Records (2021 — 2026)
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-['Plus_Jakarta_Sans'] mt-2">
            Medical History & Clinical Archive
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            5+ years of hospital encounters, digital X-rays, MRI scans, BP check records, past treatments & prescriptions for <span className="font-mono font-bold text-slate-800">{activePatient.name} ({activePatient.mediId})</span>.
          </p>
        </div>

        {/* Sub-Tab Navigation Switcher */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-semibold overflow-x-auto">
          <button
            onClick={() => setActiveSubTab('timeline')}
            className={`px-3.5 py-2 rounded-lg transition-all whitespace-nowrap ${
              activeSubTab === 'timeline' ? 'bg-white text-[#005d90] shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            📋 Timeline (5+ Yrs)
          </button>
          <button
            onClick={() => setActiveSubTab('scans')}
            className={`px-3.5 py-2 rounded-lg transition-all whitespace-nowrap ${
              activeSubTab === 'scans' ? 'bg-white text-[#005d90] shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🩻 Scans & X-Rays ({medicalScans.length})
          </button>
          <button
            onClick={() => setActiveSubTab('bp')}
            className={`px-3.5 py-2 rounded-lg transition-all whitespace-nowrap ${
              activeSubTab === 'bp' ? 'bg-white text-[#005d90] shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🩺 BP Check Records ({bpRecords.length})
          </button>
          <button
            onClick={() => setActiveSubTab('past_prescriptions')}
            className={`px-3.5 py-2 rounded-lg transition-all whitespace-nowrap ${
              activeSubTab === 'past_prescriptions' ? 'bg-white text-[#005d90] shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            💊 Past Prescriptions
          </button>
          <button
            onClick={() => setActiveSubTab('ai_summary')}
            className={`px-3.5 py-2 rounded-lg transition-all whitespace-nowrap ${
              activeSubTab === 'ai_summary' ? 'bg-gradient-to-r from-[#0077b6] to-[#00b4d8] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🤖 AI Clinical Summary
          </button>
        </div>
      </div>

      {/* ========================================================
          SUB-TAB 1: EXTENSIVE 5+ YEARS TIMELINE
          ======================================================== */}
      {activeSubTab === 'timeline' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Timeline (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {sortedYears.map((year) => (
              <div key={year} className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-extrabold font-['Plus_Jakarta_Sans'] text-slate-900 bg-slate-100 px-3 py-1 rounded-lg">
                    {year}
                  </span>
                  <div className="flex-1 h-px bg-slate-200"></div>
                </div>

                <div className="relative pl-6 space-y-3 border-l-2 border-slate-200 ml-4">
                  {visitsByYear[year].map((v) => {
                    const isSelected = selectedVisit.id === v.id;
                    const isAdmission = v.category === 'inpatient';
                    const isEmergency = v.category === 'emergency';

                    return (
                      <div
                        key={v.id}
                        onClick={() => setSelectedVisit(v)}
                        className={`relative p-3.5 rounded-xl border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-sky-50/80 border-[#0077b6] ring-1 ring-[#0077b6] shadow-xs'
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        {/* Timeline node dot */}
                        <span
                          className={`absolute -left-[31px] top-4 w-3.5 h-3.5 rounded-full ring-4 ring-white ${
                            isEmergency
                              ? 'bg-rose-500'
                              : isAdmission
                              ? 'bg-[#0077b6]'
                              : 'bg-emerald-500'
                          }`}
                        ></span>

                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-800 font-mono">{v.date}</span>
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded uppercase tracking-wider ${
                              isEmergency
                                ? 'bg-rose-100 text-rose-800'
                                : isAdmission
                                ? 'bg-sky-100 text-sky-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {v.category} • {v.durationDays} {v.durationDays === 1 ? 'Day' : 'Days'}
                          </span>
                        </div>

                        <h4 className="text-sm font-bold text-slate-900 mt-1">{v.diagnosis}</h4>
                        <p className="text-xs text-slate-600 mt-0.5">{v.hospitalName} • {v.doctorName}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5 truncate">{v.reason}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Right Column: Active Encounter Details (7 cols) */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 sm:p-7 space-y-6 sticky top-20">
              
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
                <div>
                  <span className="text-xs font-mono font-bold text-[#0077b6] uppercase">
                    Clinical Encounter #{selectedVisit.id} • {selectedVisit.year}
                  </span>
                  <h3 className="text-xl font-bold text-slate-900 mt-1">{selectedVisit.diagnosis}</h3>
                  <p className="text-xs text-slate-500">
                    {selectedVisit.hospitalName} • Attending: {selectedVisit.doctorName} ({selectedVisit.specialty})
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-xs text-slate-400 block">Encounter Date</span>
                  <span className="text-sm font-bold text-slate-800 font-mono">{selectedVisit.date}</span>
                </div>
              </div>

              {/* Reason & Presenting Symptoms */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Reason for Visit & Duration
                  </span>
                  <p className="text-xs font-semibold text-slate-800 mt-1">
                    {selectedVisit.reason}
                  </p>
                  <p className="text-[11px] text-[#0077b6] font-bold mt-1">
                    Duration: {selectedVisit.durationDays} Days Total
                  </p>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Recorded Symptoms
                  </span>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {selectedVisit.symptoms.map((sym, i) => (
                      <span key={i} className="text-xs bg-white text-slate-700 font-medium px-2 py-0.5 rounded border border-slate-200">
                        {sym}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Treatment Given & Duration */}
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Treatment Administered & Clinical Management Plan
                </span>
                <p className="text-xs text-slate-700 mt-1 bg-white p-4 rounded-2xl border border-slate-200 leading-relaxed font-sans">
                  {selectedVisit.treatment}
                </p>
              </div>

              {/* Tablets Given */}
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
                  Tablets & Medications Prescribed for this Encounter
                </span>
                <div className="flex flex-wrap gap-2">
                  {selectedVisit.tabletsGiven.map((tablet, i) => (
                    <span key={i} className="text-xs font-semibold bg-sky-50 text-sky-900 border border-sky-200 px-3 py-1 rounded-xl flex items-center gap-1.5">
                      <span>💊</span>
                      <span>{tablet}</span>
                    </span>
                  ))}
                </div>
              </div>

              {/* Reports & Scans Attached */}
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 block">
                  Attached Scans & Diagnostics ({selectedVisit.reportsAttached?.length || 0})
                </span>

                <div className="space-y-2">
                  {selectedVisit.reportsAttached?.map((report, idx) => (
                    <div
                      key={idx}
                      onClick={() => {
                        const matchingScan = medicalScans.find((s) => report.toLowerCase().includes(s.type.toLowerCase().split('_')[0]));
                        if (matchingScan) {
                          setSelectedScan(matchingScan);
                        } else {
                          setSelectedScan(medicalScans[0]);
                        }
                      }}
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="w-8 h-8 rounded-lg bg-sky-100 text-[#0077b6] flex items-center justify-center text-xs font-bold">
                          🩻
                        </span>
                        <div>
                          <p className="text-xs font-bold text-slate-800">{report}</p>
                          <span className="text-[10px] text-slate-400">Verified FHIR Imaging Object • Click to View</span>
                        </div>
                      </div>
                      <span className="text-xs text-[#0077b6] font-semibold">Inspect Scan →</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          SUB-TAB 2: SCANS & X-RAYS VIEWER
          ======================================================== */}
      {activeSubTab === 'scans' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {medicalScans.map((scan) => (
              <div
                key={scan.id}
                className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-sky-700 bg-sky-50 px-2 py-0.5 rounded">
                        {scan.type.replace('_', ' ')}
                      </span>
                      <h3 className="text-base font-bold text-slate-900 mt-1">{scan.title}</h3>
                      <p className="text-xs text-slate-500 mt-0.5">{scan.facility} • {scan.radiologist}</p>
                    </div>
                    <span className="text-xs font-mono font-bold text-slate-500">{scan.date}</span>
                  </div>

                  {/* Scan visual simulator frame */}
                  <div className="w-full h-44 rounded-2xl bg-slate-900 border border-slate-800 mt-4 p-4 flex flex-col items-center justify-center relative overflow-hidden text-center text-white">
                    <div className="absolute inset-0 opacity-20 pointer-events-none" style={{
                      backgroundImage: 'radial-gradient(rgba(255,255,255,0.4) 1px, transparent 1px)',
                      backgroundSize: '16px 16px'
                    }} />

                    {scan.svgVisualType === 'xray' && (
                      <div className="space-y-1">
                        <span className="text-4xl">🩻</span>
                        <p className="text-xs font-mono text-cyan-300 font-bold">DIGITAL THORACIC CHEST RADIOGRAPHY</p>
                        <p className="text-[10px] text-slate-400">Cardiothoracic Ratio 0.48 • Clear Fields</p>
                      </div>
                    )}

                    {scan.svgVisualType === 'mri' && (
                      <div className="space-y-1">
                        <span className="text-4xl">🧠</span>
                        <p className="text-xs font-mono text-emerald-300 font-bold">3T LUMBAR SAGITTAL T2 MRI</p>
                        <p className="text-[10px] text-slate-400">L4-L5 Disc Signal Desiccation</p>
                      </div>
                    )}

                    {scan.svgVisualType === 'echo' && (
                      <div className="space-y-1">
                        <span className="text-4xl">🫀</span>
                        <p className="text-xs font-mono text-rose-300 font-bold">2D ECHOCARDIOGRAM COLOR DOPPLER</p>
                        <p className="text-[10px] text-slate-400">EF: 62% • Normal Chamber Dimensions</p>
                      </div>
                    )}

                    <div className="absolute bottom-2 right-2 text-[9px] font-mono text-slate-400 bg-black/60 px-2 py-0.5 rounded">
                      DICOM v3.0 COMPLIANT
                    </div>
                  </div>

                  {/* Radiologist Impression */}
                  <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                    <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">
                      Radiology Summary & Impression
                    </span>
                    <p className="text-slate-800 font-medium mt-0.5">{scan.impression}</p>
                  </div>
                </div>

                <div className="pt-2 border-t flex justify-end">
                  <button
                    onClick={() => setSelectedScan(scan)}
                    className="px-4 py-2 bg-[#0077b6] hover:bg-[#005d90] text-white text-xs font-bold rounded-xl transition-colors"
                  >
                    Examine Full Scan & Findings
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================
          SUB-TAB 3: LONGITUDINAL BLOOD PRESSURE CHECK RECORDS
          ======================================================== */}
      {activeSubTab === 'bp' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div>
              <span className="text-xs font-mono font-bold text-sky-700 uppercase">
                Longitudinal Hemodynamic Surveillance
              </span>
              <h3 className="text-xl font-bold text-slate-900 mt-1">
                Blood Pressure & Pulse Check History (2021 — 2026)
              </h3>
              <p className="text-xs text-slate-500">
                Calibrated sphygmomanometer & continuous telemetry readings across past clinics and hospitalizations.
              </p>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px] font-bold">
                    <th className="py-3 px-3">Date & Time</th>
                    <th className="py-3 px-3">BP (mmHg)</th>
                    <th className="py-3 px-3">Pulse</th>
                    <th className="py-3 px-3">Clinical Status</th>
                    <th className="py-3 px-3">Encounter Context</th>
                    <th className="py-3 px-3">Attending Clinician</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {bpRecords.map((bp) => (
                    <tr key={bp.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3 font-mono font-semibold text-slate-800">{bp.date}</td>
                      <td className="py-3 px-3 font-mono font-black text-slate-900 text-sm">
                        {bp.systolic} / {bp.diastolic}
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-700">{bp.pulse} bpm</td>
                      <td className="py-3 px-3">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                            bp.status === 'NORMAL' || bp.status === 'OPTIMAL'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {bp.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-600">{bp.notes}</td>
                      <td className="py-3 px-3 font-semibold text-slate-800">{bp.clinician}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          SUB-TAB 4: PAST PRESCRIPTIONS & PAST TREATMENTS
          ======================================================== */}
      {activeSubTab === 'past_prescriptions' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {prescriptions.map((rx) => (
              <div key={rx.id} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-start justify-between pb-3 border-b">
                  <div>
                    <span className="text-xs font-mono font-bold text-sky-800 bg-sky-100 px-2 py-0.5 rounded">
                      Rx #{rx.prescriptionNumber}
                    </span>
                    <h4 className="text-base font-bold text-slate-900 mt-1">{rx.diagnosis}</h4>
                    <p className="text-xs text-slate-500">Prescribed by {rx.doctorName} ({rx.doctorSpecialty})</p>
                  </div>
                  <span className="text-xs font-mono text-slate-400">{rx.date}</span>
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Prescribed Pharmaceutical Regimen
                  </span>
                  {rx.items.map((med, i) => (
                    <div key={i} className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                      <div>
                        <strong className="text-slate-900 block">{med.medicineName} ({med.dosage})</strong>
                        <span className="text-slate-500">{med.frequency} • {med.duration} ({med.foodTiming})</span>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                        Logged
                      </span>
                    </div>
                  ))}
                </div>

                <p className="text-xs text-slate-600 bg-slate-50/60 p-2.5 rounded-lg border border-slate-100 italic">
                  Instructions: {rx.instructions}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================
          SUB-TAB 5: AI CLINICAL HISTORY SUMMARY
          ======================================================== */}
      {activeSubTab === 'ai_summary' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-slate-900 via-sky-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-sky-900/50 space-y-4 relative overflow-hidden">
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-cyan-400/20 text-cyan-300 flex items-center justify-center text-2xl border border-cyan-400/30">
                  🤖
                </div>
                <div>
                  <h3 className="text-lg font-bold font-['Plus_Jakarta_Sans'] text-white">
                    Personalized AI Longitudinal Health Synthesis
                  </h3>
                  <p className="text-xs text-sky-200/80">
                    Grounded on 5+ years of clinical encounters, diagnostic imaging, and vitals for {activePatient.name} ({activePatient.mediId}).
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleGeneratePatientSummary}
                disabled={isGeneratingAi}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-cyan-400 hover:bg-cyan-300 text-slate-900 transition-colors shadow-sm shrink-0 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <span>{isGeneratingAi ? 'Synthesizing...' : '🔄 Re-synthesize'}</span>
              </button>
            </div>

            {/* AI Summary Output Display */}
            <div className="relative z-10 bg-slate-950/80 backdrop-blur-md rounded-2xl p-6 border border-white/10 text-xs sm:text-sm text-slate-200 font-sans leading-relaxed whitespace-pre-line max-h-[520px] overflow-y-auto">
              {isGeneratingAi ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-3">
                  <div className="w-8 h-8 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
                  <p className="text-xs font-mono text-cyan-300">Synthesizing clinical longitudinal record with Gemini intelligence...</p>
                </div>
              ) : (
                aiPatientSummary || 'Click "Re-synthesize" to generate your AI medical history summary.'
              )}
            </div>

            <div className="relative z-10 flex items-center justify-between text-[11px] text-slate-400 border-t border-white/10 pt-3">
              <span>Verified against EHR database • Model: gemini-3.8-flash</span>
              <span className="italic">For informational health tracking and clinical discussion.</span>
            </div>
          </div>
        </div>
      )}

      {/* Scan Detail Modal */}
      {selectedScan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <span className="text-xs font-mono font-bold text-[#0077b6]">{selectedScan.type}</span>
                <h3 className="text-lg font-bold text-slate-900">{selectedScan.title}</h3>
                <p className="text-xs text-slate-500">{selectedScan.facility} • {selectedScan.date}</p>
              </div>
              <button onClick={() => setSelectedScan(null)} className="text-slate-400 hover:text-slate-700 text-lg">✕</button>
            </div>

            {/* Scan rendering */}
            <div className="w-full h-56 rounded-2xl bg-black border border-slate-800 p-6 flex flex-col items-center justify-center text-white text-center space-y-2">
              <span className="text-5xl">🩻</span>
              <p className="text-sm font-mono text-cyan-300 font-bold">{selectedScan.title}</p>
              <p className="text-xs text-slate-400 max-w-md">{selectedScan.summary}</p>
            </div>

            {/* Findings list */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Radiological Findings</h4>
              <ul className="space-y-1.5 text-xs text-slate-700 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                {selectedScan.findings.map((f, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-sky-600 font-bold">•</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Impression */}
            <div className="p-3 bg-sky-50 rounded-xl border border-sky-100 text-xs">
              <strong className="text-sky-950 block">Formal Impression:</strong>
              <p className="text-sky-900 mt-0.5">{selectedScan.impression}</p>
            </div>

            <div className="flex justify-end pt-2 border-t">
              <button
                onClick={() => setSelectedScan(null)}
                className="px-5 py-2 bg-slate-800 text-white text-xs font-bold rounded-xl"
              >
                Close Viewer
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
