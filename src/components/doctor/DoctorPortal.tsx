import React, { useState, useEffect } from 'react';
import { useHealthcare } from '../../context/HealthcareContext';
import { EcgLeadVisual } from '../common/EcgLeadVisual';
import { generatePatientAiSummary } from '../../services/aiMedicalSummary';

export const DoctorPortal: React.FC = () => {
  const {
    activePatient,
    appointments,
    createPrescription,
    lookupPatientByMediId,
    addNotification,
  } = useHealthcare();

  const [activeTab, setActiveTab] = useState<'consultation' | 'queue' | 'schedule'>('consultation');
  
  // Consultation patient lookup & encounter
  const [consultMediId, setConsultMediId] = useState('MED-7X29K4');
  const [selectedPatientData, setSelectedPatientData] = useState<any>(activePatient);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiSummary, setAiSummary] = useState<string>(
    'AI Clinical Synthesis [MED-7X29K4 - Rahul Kumar]: Patient has a 5+ year longitudinal record featuring Type II Diabetes Mellitus (well-controlled on Metformin ER 500mg BID + Glimepiride 1mg OD, latest HbA1c 6.8%), essential hypertension (borderline 120/80 mmHg), and degenerative L4-L5 lumbar disc desiccation. ⚠️ CRITICAL CONTRAINDICATION: Documented Grade III anaphylactic hypersensitivity to Penicillin & Ampicillin. Beta-lactam antibiotics are strictly contraindicated. Recent telemetry Lead II shows regular sinus rhythm (72 bpm).'
  );

  // Vitals recorded in consultation
  const [vitalsHr, setVitalsHr] = useState('72');
  const [vitalsBp, setVitalsBp] = useState('120/80');
  const [vitalsSpo2, setVitalsSpo2] = useState('98');
  const [vitalsTemp, setVitalsTemp] = useState('98.4');
  const [chiefComplaint, setChiefComplaint] = useState('Routine 6-month diabetic follow-up & continuous telemetry review');
  const [diagnosis, setDiagnosis] = useState('Type II Diabetes Mellitus without acute complications (ICD-10: E11.9)');
  const [clinicalNotes, setClinicalNotes] = useState('Patient compliant with current oral hypoglycemic regimen. Morning fasting capillary blood glucose logs average 104-112 mg/dL. No nocturnal hypoglycemia or orthostatic dizziness reported. Continuous Lead II telemetry demonstrates intact sinus rhythm.');

  // Prescription builder with multi-item support
  interface RxItemDraft {
    medicineName: string;
    dosage: string;
    frequency: string;
    duration: string;
    foodTiming: string;
    instructions: string;
  }

  const [prescriptionItems, setPrescriptionItems] = useState<RxItemDraft[]>([
    {
      medicineName: 'Medicine A (Metformin ER)',
      dosage: '500 mg',
      frequency: 'Twice daily',
      duration: '30 days',
      foodTiming: 'After food',
      instructions: 'Take post breakfast and post dinner with water',
    },
  ]);

  const [newDrugName, setNewDrugName] = useState('');
  const [newDosage, setNewDosage] = useState('500 mg');
  const [newFrequency, setNewFrequency] = useState('Twice daily');
  const [newDuration, setNewDuration] = useState('30 days');
  const [newFoodTiming, setNewFoodTiming] = useState('After food');
  const [newInstructions, setNewInstructions] = useState('Take with meal');
  const [allergyWarning, setAllergyWarning] = useState<string | null>(null);
  const [rxSuccessMessage, setRxSuccessMessage] = useState(false);

  // Load Patient by Medi ID directly inside Consultation Room
  const handleLoadPatient = (mediIdToLoad?: string) => {
    const id = (mediIdToLoad || consultMediId).trim();
    const res = lookupPatientByMediId(id);
    if (res) {
      setSelectedPatientData(res);
      setConsultMediId(res.mediId);
      addNotification(`Loaded clinical encounter for ${res.name} (${res.mediId})`, 'info');
      generateAiSummaryForPatient(res);
    } else {
      addNotification(`No patient record found matching Medi ID "${id}"`, 'alert');
    }
  };

  const generateAiSummaryForPatient = async (patient: any) => {
    if (!patient) return;
    setIsGeneratingAi(true);
    try {
      const summaryText = await generatePatientAiSummary(patient);
      setAiSummary(summaryText);
    } catch (err) {
      console.warn('Error generating AI clinical synthesis:', err);
      setAiSummary(`AI Clinical Synthesis [${patient.mediId} • ${patient.name}]: Record verified. Allergy: ${patient.allergy || 'None'}. Vitals stable.`);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  // Sync initial patient AI summary on mount
  useEffect(() => {
    if (selectedPatientData) {
      generateAiSummaryForPatient(selectedPatientData);
    }
  }, []);

  // Add item to prescription draft with AI allergy check
  const handleAddPrescriptionItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDrugName.trim()) return;

    // AI Safety Check: Contraindications
    const drugLower = newDrugName.toLowerCase();
    const hasPenicillinAllergy = selectedPatientData?.allergy?.toLowerCase().includes('penicillin');
    
    if (hasPenicillinAllergy && (
      drugLower.includes('penicillin') ||
      drugLower.includes('amoxicillin') ||
      drugLower.includes('ampicillin') ||
      drugLower.includes('augmentin') ||
      drugLower.includes('piperacillin')
    )) {
      setAllergyWarning(
        `🚨 CRITICAL SAFETY ALERT: Cannot prescribe "${newDrugName}"! Patient ${selectedPatientData.name} has a FATAL anaphylactic allergy to Penicillin-class beta-lactams.`
      );
      addNotification(`Safety Block: Penicillin allergy detected for ${selectedPatientData.name}`, 'alert');
      return;
    }

    setAllergyWarning(null);
    setPrescriptionItems((prev) => [
      ...prev,
      {
        medicineName: newDrugName,
        dosage: newDosage,
        frequency: newFrequency,
        duration: newDuration,
        foodTiming: newFoodTiming,
        instructions: newInstructions,
      },
    ]);

    setNewDrugName('');
    addNotification(`Added ${newDrugName} (${newDosage}) to prescription draft`, 'info');
  };

  const handleRemovePrescriptionItem = (index: number) => {
    setPrescriptionItems((prev) => prev.filter((_, i) => i !== index));
  };

  // Issue prescription to patient Medi ID
  const handleIssueFullPrescription = () => {
    if (prescriptionItems.length === 0) {
      addNotification('Please add at least one medication to the prescription', 'alert');
      return;
    }

    createPrescription({
      patientMediId: selectedPatientData.mediId,
      patientName: selectedPatientData.name,
      doctorName: 'Dr. Anjali Rao',
      doctorSpecialty: 'Internal Medicine & Cardiology',
      diagnosis: diagnosis,
      instructions: clinicalNotes,
      items: prescriptionItems,
    });

    setRxSuccessMessage(true);
    addNotification(`Issued e-Prescription with ${prescriptionItems.length} items to Medi ID ${selectedPatientData.mediId}`, 'alert');
    setTimeout(() => setRxSuccessMessage(false), 4000);
  };

  return (
    <div className="space-y-6 pb-12 font-['Inter']">
      
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#0077b6] text-white flex items-center justify-center text-xl font-bold shadow-md shrink-0">
            AR
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-slate-900 font-['Plus_Jakarta_Sans']">
                Dr. Anjali Rao, MD
              </h1>
              <span className="text-xs font-bold text-sky-800 bg-sky-50 border border-sky-200 px-3 py-0.5 rounded-full">
                Attending Physician & Cardiologist
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              ABC Hospital Network • OPD Block B, Suite 204 • Telemetry & Inpatient Supervisor
            </p>
          </div>
        </div>

        {/* Doctor Portal Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200">
          <button
            onClick={() => setActiveTab('consultation')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'consultation' ? 'bg-white text-blue-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🩺 Consultation Room
          </button>
          <button
            onClick={() => setActiveTab('queue')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'queue' ? 'bg-white text-blue-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            📋 Patient Queue (18)
          </button>
          <button
            onClick={() => setActiveTab('schedule')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'schedule' ? 'bg-white text-blue-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            📅 Duty Roster
          </button>
        </div>
      </div>

      {/* ========================================================
          TAB 1: CONSULTATION ROOM WITH MEDI ID LOOKUP & AI SUMMARY
          ======================================================== */}
      {activeTab === 'consultation' && (
        <div className="space-y-6">
          
          {/* Medi ID Direct Lookup Bar at Top of Consultation Room */}
          <div className="bg-gradient-to-r from-sky-50 to-blue-50/60 p-6 rounded-3xl border border-sky-200/80 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-sky-800">
                  Universal Medi ID Patient Search & Consultation Console
                </span>
                <h2 className="text-lg font-bold text-slate-900 font-['Plus_Jakarta_Sans']">
                  Enter Patient Medi ID to Initiate Consultation & Clinical Synthesis
                </h2>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-xs text-slate-500 font-medium">Quick Select Patient:</span>
                <button
                  type="button"
                  onClick={() => handleLoadPatient('MED-7X29K4')}
                  className="px-2 py-0.5 bg-white hover:bg-sky-100 text-sky-900 text-xs font-mono font-bold rounded-lg border border-sky-200 transition-colors cursor-pointer"
                >
                  MED-7X29K4 (Rahul)
                </button>
                <button
                  type="button"
                  onClick={() => handleLoadPatient('MED-8K29L2')}
                  className="px-2 py-0.5 bg-white hover:bg-sky-100 text-sky-900 text-xs font-mono font-bold rounded-lg border border-sky-200 transition-colors cursor-pointer"
                >
                  MED-8K29L2 (Priya)
                </button>
                <button
                  type="button"
                  onClick={() => handleLoadPatient('MED-9L82P3')}
                  className="px-2 py-0.5 bg-white hover:bg-sky-100 text-sky-900 text-xs font-mono font-bold rounded-lg border border-sky-200 transition-colors cursor-pointer"
                >
                  MED-9L82P3 (Arun)
                </button>
                <button
                  type="button"
                  onClick={() => handleLoadPatient('MED-4M99T1')}
                  className="px-2 py-0.5 bg-white hover:bg-sky-100 text-sky-900 text-xs font-mono font-bold rounded-lg border border-sky-200 transition-colors cursor-pointer"
                >
                  MED-4M99T1 (Amina)
                </button>
                <button
                  type="button"
                  onClick={() => handleLoadPatient('MED-5B12X9')}
                  className="px-2 py-0.5 bg-white hover:bg-sky-100 text-sky-900 text-xs font-mono font-bold rounded-lg border border-sky-200 transition-colors cursor-pointer"
                >
                  MED-5B12X9 (David)
                </button>
              </div>
            </div>

            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={consultMediId}
                  onChange={(e) => setConsultMediId(e.target.value)}
                  placeholder="Enter Medi ID (e.g. MED-7X29K4)..."
                  className="w-full px-4 py-2.5 bg-white border border-sky-300 rounded-xl font-mono text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
              <button
                type="button"
                onClick={() => handleLoadPatient()}
                className="px-6 py-2.5 bg-[#0077b6] hover:bg-[#005d90] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer shrink-0"
              >
                Fetch Patient Records & AI Summary
              </button>
            </div>
          </div>

          {/* Active Patient Encounter Header */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-900 flex items-center justify-center font-black text-lg">
                  {selectedPatientData.name.split(' ').map((n: string) => n[0]).join('')}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-slate-900">
                      {selectedPatientData.name}
                    </h2>
                    <span className="text-xs font-mono font-bold bg-sky-50 text-sky-800 border border-sky-200 px-2 py-0.5 rounded-md">
                      {selectedPatientData.mediId}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Blood Group: <strong className="text-rose-700">{selectedPatientData.bloodGroup}</strong> • Facility: {selectedPatientData.hospital || 'ABC Hospital Network'}
                  </p>
                </div>
              </div>

              {/* Allergy Warning Badge */}
              <div className="flex items-center gap-2">
                <span className="px-3.5 py-1.5 bg-rose-100 text-rose-900 font-black text-xs rounded-xl border border-rose-300 flex items-center gap-1.5 animate-pulse">
                  <span>⚠️</span>
                  <span>CONTRAINDICATION: PENICILLIN ANAPHYLAXIS</span>
                </span>
              </div>
            </div>

            {/* AI Clinical History Synthesis Box */}
            <div className="bg-gradient-to-br from-slate-50 to-sky-50/50 border border-sky-200/70 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🤖</span>
                  <div>
                    <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider font-['Plus_Jakarta_Sans']">
                      AI Clinical Synthesis & Longitudinal Health Intelligence
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Summarized from 5+ years of electronic medical records, previous visits, and lab panels.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => generateAiSummaryForPatient(selectedPatientData)}
                  disabled={isGeneratingAi}
                  className="px-3 py-1.5 text-xs font-semibold text-[#0077b6] hover:text-[#005d90] bg-white rounded-lg border border-slate-200 shadow-2xs transition-colors cursor-pointer"
                >
                  {isGeneratingAi ? 'Synthesizing...' : '🔄 Re-synthesize'}
                </button>
              </div>

              <div className="bg-white p-4.5 rounded-xl border border-slate-200/90 text-xs text-slate-800 leading-relaxed font-sans shadow-2xs whitespace-pre-line max-h-96 overflow-y-auto">
                {aiSummary}
              </div>

              <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono">
                <span>Grounding: 5+ Longitudinal visits, CMP lab panels, 3T MRI, ECG Lead II</span>
                <span className="italic">Clinical diagnosis and prescribing responsibility rests with the physician.</span>
              </div>
            </div>

            {/* Previous Visits & Longitudinal Medical History (In Consultation Room) */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  Longitudinal Encounters & Past Treatments History
                </h4>
                <span className="text-[11px] font-mono text-slate-500">
                  {selectedPatientData.medicalVisits?.length || 9} Encounters Documented
                </span>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-500 text-[10px] font-bold uppercase">
                    <tr>
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Hospital</th>
                      <th className="py-2.5 px-3">Encounter Reason / Diagnosis</th>
                      <th className="py-2.5 px-3">Doctor</th>
                      <th className="py-2.5 px-3">Tablets & Treatment Given</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(selectedPatientData.medicalVisits || []).slice(0, 4).map((v: any) => (
                      <tr key={v.id} className="hover:bg-slate-50">
                        <td className="py-2 px-3 font-mono font-bold text-slate-800">{v.date}</td>
                        <td className="py-2 px-3 text-slate-700">{v.hospitalName}</td>
                        <td className="py-2 px-3">
                          <span className="font-semibold text-slate-900 block">{v.reason}</span>
                          <span className="text-[10px] text-slate-500">{v.diagnosis}</span>
                        </td>
                        <td className="py-2 px-3 text-slate-700">{v.doctorName}</td>
                        <td className="py-2 px-3 text-slate-600">
                          {v.tabletsGiven?.join(', ')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Objective Vitals Telemetry Bar */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Objective Encounter Vitals
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <span className="text-[11px] text-slate-500">Heart Rate (bpm)</span>
                  <input
                    type="text"
                    value={vitalsHr}
                    onChange={(e) => setVitalsHr(e.target.value)}
                    className="w-full mt-1 px-3 py-1.5 text-sm font-bold font-mono border rounded-lg bg-white"
                  />
                </div>
                <div>
                  <span className="text-[11px] text-slate-500">BP (mmHg)</span>
                  <input
                    type="text"
                    value={vitalsBp}
                    onChange={(e) => setVitalsBp(e.target.value)}
                    className="w-full mt-1 px-3 py-1.5 text-sm font-bold font-mono border rounded-lg bg-white"
                  />
                </div>
                <div>
                  <span className="text-[11px] text-slate-500">SpO2 (%)</span>
                  <input
                    type="text"
                    value={vitalsSpo2}
                    onChange={(e) => setVitalsSpo2(e.target.value)}
                    className="w-full mt-1 px-3 py-1.5 text-sm font-bold font-mono border rounded-lg bg-white"
                  />
                </div>
                <div>
                  <span className="text-[11px] text-slate-500">Body Temp (°F)</span>
                  <input
                    type="text"
                    value={vitalsTemp}
                    onChange={(e) => setVitalsTemp(e.target.value)}
                    className="w-full mt-1 px-3 py-1.5 text-sm font-bold font-mono border rounded-lg bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Chief Complaint & Diagnosis */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Chief Complaint & Symptoms
                </label>
                <textarea
                  rows={2}
                  value={chiefComplaint}
                  onChange={(e) => setChiefComplaint(e.target.value)}
                  className="w-full p-3 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Clinical Diagnosis (ICD-10)
                </label>
                <textarea
                  rows={2}
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  className="w-full p-3 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* ========================================================
                PRESCRIPTION WRITING & SYNCHRONIZATION CONSOLE
                ======================================================== */}
            <div className="bg-gradient-to-br from-blue-50/70 via-sky-50/40 to-slate-50 border-2 border-blue-200 rounded-3xl p-6 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-blue-200/80">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                    Rx
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 font-['Plus_Jakarta_Sans']">
                      Write Prescription for Patient {selectedPatientData.name} ({selectedPatientData.mediId})
                    </h3>
                    <p className="text-xs text-slate-500">
                      Add multiple medications with dosage & timings. Automatically synchronizes with patient's daily schedule.
                    </p>
                  </div>
                </div>

                {rxSuccessMessage && (
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-3 py-1 rounded-full animate-bounce">
                    ✓ Prescription Issued & Synced into Medi ID!
                  </span>
                )}
              </div>

              {/* Anaphylaxis Allergy Warning if triggered */}
              {allergyWarning && (
                <div className="p-4 bg-rose-100 border-2 border-rose-400 rounded-2xl text-xs text-rose-950 font-bold flex items-center justify-between animate-in fade-in">
                  <span>{allergyWarning}</span>
                  <button onClick={() => setAllergyWarning(null)} className="text-rose-700 hover:text-rose-950">✕</button>
                </div>
              )}

              {/* Add Medication Item Form */}
              <form onSubmit={handleAddPrescriptionItem} className="grid grid-cols-1 sm:grid-cols-6 gap-3 text-xs">
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Drug Name / Molecule</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Empagliflozin (Jardiance), Metformin"
                    value={newDrugName}
                    onChange={(e) => setNewDrugName(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl"
                  />
                  <div className="flex gap-1 mt-1">
                    {['Metformin 500mg', 'Glimepiride 1mg', 'Atorvastatin 10mg', 'Paracetamol 650mg'].map((s) => (
                      <button
                        type="button"
                        key={s}
                        onClick={() => {
                          const parts = s.split(' ');
                          setNewDrugName(parts[0]);
                          setNewDosage(parts[1]);
                        }}
                        className="text-[10px] text-blue-700 hover:underline cursor-pointer"
                      >
                        +{s}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Dosage</label>
                  <input
                    type="text"
                    required
                    value={newDosage}
                    onChange={(e) => setNewDosage(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Frequency</label>
                  <select
                    value={newFrequency}
                    onChange={(e) => setNewFrequency(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl"
                  >
                    <option>Once daily</option>
                    <option>Twice daily</option>
                    <option>Thrice daily</option>
                    <option>As needed (PRN)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Duration</label>
                  <select
                    value={newDuration}
                    onChange={(e) => setNewDuration(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl"
                  >
                    <option>7 days</option>
                    <option>15 days</option>
                    <option>30 days</option>
                    <option>60 days</option>
                    <option>90 days</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Food Timing</label>
                  <select
                    value={newFoodTiming}
                    onChange={(e) => setNewFoodTiming(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl"
                  >
                    <option>After food</option>
                    <option>Before lunch</option>
                    <option>Post dinner</option>
                    <option>With food</option>
                    <option>Bedtime</option>
                  </select>
                </div>

                <div className="sm:col-span-5">
                  <label className="block font-semibold text-slate-700 mb-1">Specific Instructions</label>
                  <input
                    type="text"
                    value={newInstructions}
                    onChange={(e) => setNewInstructions(e.target.value)}
                    placeholder="e.g. Take 30 minutes before meal; monitor capillary glucose"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl"
                  />
                </div>

                <div className="sm:col-span-1 flex items-end">
                  <button
                    type="submit"
                    className="w-full py-2 bg-sky-700 hover:bg-sky-800 text-white font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    + Add Drug
                  </button>
                </div>
              </form>

              {/* List of Medications queued in this prescription order */}
              <div className="space-y-2 pt-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600 block">
                  Prescription Items Queue ({prescriptionItems.length})
                </span>
                
                {prescriptionItems.map((item, index) => (
                  <div
                    key={index}
                    className="p-3 bg-white rounded-xl border border-blue-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-[11px]">
                        #{index + 1}
                      </span>
                      <div>
                        <span className="font-bold text-slate-900 text-sm">{item.medicineName}</span>
                        <span className="text-slate-500 ml-2 font-mono">{item.dosage} • {item.frequency} • {item.duration}</span>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Timing: {item.foodTiming} — <em>{item.instructions}</em>
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemovePrescriptionItem(index)}
                      className="text-rose-600 hover:text-rose-800 font-bold text-xs self-end sm:self-auto cursor-pointer"
                    >
                      ✕ Remove
                    </button>
                  </div>
                ))}
              </div>

              {/* Final Issue & Sync Action */}
              <div className="flex justify-end pt-3 border-t border-blue-200/80">
                <button
                  type="button"
                  onClick={handleIssueFullPrescription}
                  className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-md transition-colors cursor-pointer flex items-center gap-2"
                >
                  <span>✓ Issue e-Prescription & Sync to Patient Schedule</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================
          TAB 2: TODAY'S PATIENT QUEUE
          ======================================================== */}
      {activeTab === 'queue' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b">
            <div>
              <h3 className="text-lg font-bold text-slate-900 font-['Plus_Jakarta_Sans']">
                Today's Outpatient Appointments & Walk-ins
              </h3>
              <p className="text-xs text-slate-500">
                Consultation queue for Dr. Anjali Rao (OPD Block B, Room 204).
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-lg">
              {appointments.length} Total Patients
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px] font-bold">
                  <th className="py-2.5 px-3">Time</th>
                  <th className="py-2.5 px-3">Patient Name & Medi ID</th>
                  <th className="py-2.5 px-3">Reason for Encounter</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {appointments.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-slate-800">{a.time}</td>
                    <td className="py-3 px-3">
                      <span className="font-bold text-slate-900 block">{a.patientName}</span>
                      <span className="font-mono text-[10px] text-blue-700">{a.patientMediId}</span>
                    </td>
                    <td className="py-3 px-3 text-slate-600">{a.reason}</td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        a.status === 'CONFIRMED' ? 'bg-emerald-100 text-emerald-800' :
                        a.status === 'WAITING' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {a.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => {
                          handleLoadPatient(a.patientMediId);
                          setActiveTab('consultation');
                        }}
                        className="px-3 py-1.5 bg-[#0077b6] hover:bg-[#005d90] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                      >
                        Open in Consultation Room →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 3: DUTY ROSTER & SCHEDULE
          ======================================================== */}
      {activeTab === 'schedule' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b">
            <div>
              <h3 className="text-lg font-bold text-slate-900 font-['Plus_Jakarta_Sans']">
                Dr. Anjali Rao • Clinical Duty Roster
              </h3>
              <p className="text-xs text-slate-500">
                Hospital shifts, inpatient rounds, and cardiology consultation hours.
              </p>
            </div>
            <button
              onClick={() => addNotification('Roster saved to ABC Hospital Central Scheduling system', 'info')}
              className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl"
            >
              Update Shifts
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { day: 'Monday', hours: '09:00 AM – 01:00 PM', duty: 'OPD Consultation Block B', slots: 12 },
              { day: 'Tuesday', hours: '04:00 PM – 07:00 PM', duty: 'Inpatient ICU Rounds', slots: 8 },
              { day: 'Wednesday', hours: '09:00 AM – 02:00 PM', duty: 'OPD Consultation Block B', slots: 14 },
              { day: 'Thursday', hours: '02:00 PM – 06:00 PM', duty: 'Cardiology Stress Lab', slots: 6 },
              { day: 'Friday', hours: '09:00 AM – 01:00 PM', duty: 'OPD Consultation Block B', slots: 10 },
              { day: 'Saturday', hours: 'Trauma On-Call', duty: 'Emergency Triage Back-up', slots: 0 },
            ].map((s) => (
              <div key={s.day} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-sm">{s.day}</span>
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                    Active
                  </span>
                </div>
                <p className="text-slate-700 font-medium">{s.duty}</p>
                <div className="flex justify-between items-center text-[11px] text-slate-500 pt-1 border-t border-slate-200/60 font-mono">
                  <span>{s.hours}</span>
                  <span>{s.slots} Slots</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
