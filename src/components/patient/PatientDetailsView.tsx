import React, { useState } from 'react';
import { useHealthcare } from '../../context/HealthcareContext';
import { PatientBelonging } from '../../types/healthcare';

export const PatientDetailsView: React.FC = () => {
  const { activePatient, addNotification } = useHealthcare();

  const [patientPic, setPatientPic] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(activePatient.name);
  const [emergencyContact, setEmergencyContact] = useState(activePatient.emergencyContact);
  const [belongingsList, setBelongingsList] = useState<PatientBelonging[]>(activePatient.belongings);

  // Modal to inspect belonging
  const [selectedBelonging, setSelectedBelonging] = useState<PatientBelonging | null>(null);

  const handlePicUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        setPatientPic(uploadEvent.target?.result as string);
        addNotification(`Patient biometric photo updated and cryptographically hashed into Medi ID ${activePatient.mediId}`, 'info');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveDetails = (e: React.FormEvent) => {
    e.preventDefault();
    setIsEditing(false);
    addNotification('Patient personal healthcare profile updated successfully.', 'info');
  };

  return (
    <div className="space-y-6 pb-12 font-['Inter']">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono tracking-wider uppercase text-sky-800 font-semibold bg-sky-50 px-2.5 py-1 rounded-md border border-sky-200">
            FHIR Comprehensive Patient Resource (v4.0.1)
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-['Plus_Jakarta_Sans'] mt-2">
            Details of Patient & Clinical Directives
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Complete physiological profile, biometric credentials, adverse reactions, belonging inventory & next-of-kin directives.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <span>{isEditing ? '✓ Done Editing' : '✏️ Edit Profile'}</span>
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Digital Medi ID Card & Photo (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-gradient-to-br from-[#005d90] via-[#0077b6] to-[#0284c7] text-white rounded-3xl p-6 shadow-xl relative overflow-hidden space-y-4">
            
            {/* Background watermark */}
            <div className="absolute -right-8 -bottom-8 w-40 h-40 rounded-full bg-white/10 blur-xl pointer-events-none" />

            {/* Top Row: National ID Logo & Chip */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-md flex items-center justify-center font-bold">
                  ➕
                </div>
                <span className="font-bold tracking-tight text-sm font-['Plus_Jakarta_Sans']">
                  Universal Medi ID Card
                </span>
              </div>
              <span className="text-[10px] font-mono font-bold bg-white/20 px-2 py-0.5 rounded-full">
                EMR ACTIVE
              </span>
            </div>

            {/* Photo & Biometric Face Area */}
            <div className="flex items-center gap-4 pt-2">
              <div className="relative group w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-md border-2 border-white/40 flex items-center justify-center overflow-hidden shadow-inner shrink-0">
                {patientPic ? (
                  <img src={patientPic} alt="Patient Biometric" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl font-black text-white/90">RK</span>
                )}
                
                {/* Upload overlay */}
                <label className="absolute inset-0 bg-black/50 text-white text-[10px] font-bold flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-center px-1">
                  <span>📷 Upload Pic</span>
                  <input type="file" accept="image/*" onChange={handlePicUpload} className="hidden" />
                </label>
              </div>

              <div>
                <h3 className="text-xl font-bold leading-tight">{name}</h3>
                <p className="text-xs text-sky-200 mt-0.5 font-mono">{activePatient.mediId}</p>
                <div className="flex items-center gap-1.5 mt-2">
                  <span className="text-xs font-bold text-white bg-white/25 px-2 py-0.5 rounded-md">
                    B+ Rh+
                  </span>
                  <span className="text-xs text-sky-100">32 yrs • Male</span>
                </div>
              </div>
            </div>

            {/* Bottom Bar: Facility & Barcode */}
            <div className="pt-4 border-t border-white/20 space-y-2">
              <div className="flex justify-between text-[11px] text-sky-100">
                <span>Facility: {activePatient.hospital}</span>
                <span>Ward: {activePatient.assignedWard}</span>
              </div>
              <div className="h-6 w-full bg-white/20 backdrop-blur-xs rounded flex items-center justify-center text-[10px] font-mono tracking-widest text-sky-100">
                ||| || ||||| ||| |||| || |||| ||||
              </div>
            </div>
          </div>

          {/* Quick Photo Upload Trigger */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs text-center space-y-2">
            <span className="text-xs font-bold text-slate-800 block">Hospital Management Photo Attachment</span>
            <p className="text-[11px] text-slate-500">
              Hospital staff or patient can add or update their official photo on the Medi ID vault.
            </p>
            <label className="inline-block px-4 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 cursor-pointer transition-colors">
              <span>📷 Select Photo to Attach</span>
              <input type="file" accept="image/*" onChange={handlePicUpload} className="hidden" />
            </label>
          </div>

          {/* Organ Donor Verified Card */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-xs text-emerald-950 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-emerald-800">
              <span>🫀</span>
              <span>Registered Organ Donor</span>
            </div>
            <p className="text-emerald-900 leading-snug">
              Consent recorded on National NOTTO Registry: Corneas, Kidneys, and Liver graft authorized in event of brain death.
            </p>
          </div>
        </div>

        {/* Right Area: Detailed Medical Data (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Demographic & Biological Metrics */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900 font-['Plus_Jakarta_Sans']">
              Personal & Physiological Attributes
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Age & DOB</span>
                <span className="text-sm font-bold text-slate-900 mt-1 block">32 Years</span>
                <span className="text-[11px] text-slate-500 font-mono">14 Aug 1994</span>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Gender</span>
                <span className="text-sm font-bold text-slate-900 mt-1 block">Male</span>
                <span className="text-[11px] text-slate-500">Cisgender</span>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Height / Weight</span>
                <span className="text-sm font-bold text-slate-900 mt-1 block">178 cm / 74 kg</span>
                <span className="text-[11px] text-emerald-700 font-medium">BMI 23.4 (Normal)</span>
              </div>

              <div className="bg-rose-50 p-3.5 rounded-2xl border border-rose-100">
                <span className="text-[10px] font-semibold text-rose-700 uppercase tracking-wider block">Blood Group</span>
                <span className="text-xl font-black text-rose-900 mt-0.5 font-mono block">B+</span>
                <span className="text-[10px] text-rose-600">Rh Positive</span>
              </div>
            </div>

            {/* Editable Contact Fields */}
            {isEditing && (
              <form onSubmit={handleSaveDetails} className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-3 border-t border-slate-100">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Full Legal Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 text-xs border rounded-lg bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Emergency Contact</label>
                  <input
                    type="text"
                    value={emergencyContact}
                    onChange={(e) => setEmergencyContact(e.target.value)}
                    className="w-full px-3 py-2 text-xs border rounded-lg bg-white"
                  />
                </div>
                <div className="sm:col-span-2 flex justify-end">
                  <button type="submit" className="px-4 py-2 bg-[#0077b6] text-white text-xs font-bold rounded-lg">
                    Save Changes
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* ========================================================
              PATIENT BELONGINGS GALLERY (Requested feature)
              ======================================================== */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg">🎒</span>
                  <h3 className="text-base font-bold text-slate-900 font-['Plus_Jakarta_Sans']">
                    Patient Belongings & Personal Item Chain of Custody
                  </h3>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Verified photographic inventory of belongings secured with nursing desk or in patient possession.
                </p>
              </div>

              <span className="text-xs font-mono font-bold text-[#0077b6] bg-sky-50 px-2.5 py-1 rounded-md border border-sky-100">
                {belongingsList.length} Items Logged
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {belongingsList.map((item) => {
                const isSecured = item.custodyStatus === 'SECURED_IN_HOSPITAL_SAFE';
                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedBelonging(item)}
                    className="p-3.5 rounded-2xl border border-slate-200/90 bg-slate-50/70 hover:bg-white hover:border-[#0077b6] transition-all cursor-pointer space-y-2 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between">
                        <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-xl shadow-xs">
                          {item.icon}
                        </div>
                        <span
                          className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                            isSecured
                              ? 'bg-amber-100 text-amber-900 border border-amber-200'
                              : 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                          }`}
                        >
                          {isSecured ? 'In Safe' : 'With Patient'}
                        </span>
                      </div>

                      <h4 className="text-xs font-bold text-slate-900 mt-2 line-clamp-1">{item.name}</h4>
                      <p className="text-[11px] text-slate-500 leading-snug line-clamp-2 mt-0.5">
                        {item.description}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-slate-400">
                      <span>{item.location}</span>
                      <span className="text-[#0077b6] font-bold">View Pic →</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Side Effects & Adverse Drug Reactions (ADR) */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-lg">⚠️</span>
              <h3 className="text-base font-bold text-slate-900 font-['Plus_Jakarta_Sans']">
                Documented Drug Side Effects & Severe Allergies
              </h3>
            </div>

            <div className="space-y-3">
              {/* Penicillin alert */}
              <div className="p-4 rounded-2xl bg-[#fff1f2] border border-[#fecdd3] space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-[#9f1239] uppercase tracking-wider">
                    Fatal Anaphylactic Hypersensitivity: Penicillin & Ampicillin
                  </span>
                  <span className="text-[10px] font-black text-rose-700 bg-rose-100 px-2 py-0.5 rounded uppercase">
                    Grade III Critical
                  </span>
                </div>
                <p className="text-xs text-rose-950 font-medium">
                  Documented Reaction: Acute facial angioedema, urticaria, bronchospasm observed within 20 minutes of oral Amoxicillin ingestion (Nov 2025).
                </p>
                <p className="text-[11px] text-rose-800">
                  Clinical Directive: Strict prohibition of all beta-lactams, cephalosporins with similar side-chains, and aminopenicillins.
                </p>
              </div>

              {/* Sulfa Drugs Warning */}
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                    Mild Sensitivity: Sulfonamides (Bactrim / Septra)
                  </span>
                  <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                    Observation
                  </span>
                </div>
                <p className="text-xs text-amber-900">
                  Mild gastric nausea and localized cutaneous maculopapular rash reported in 2021.
                </p>
              </div>
            </div>
          </div>

          {/* ========================================================
              EXPANDED: OTHER MEDICAL CONDITIONS AND CHRONIC HEALTH EFFECTS
              ======================================================== */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 font-['Plus_Jakarta_Sans']">
                Other Medical Conditions & Chronic Health Effects
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Longitudinal chronic condition surveillance with organ risk stratification.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Condition 1: Type II Diabetes */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">Type II Diabetes Mellitus</span>
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                    Controlled (HbA1c 6.8%)
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Controlled glycemic status. Monitored via Metformin ER 500mg and Glimepiride. Fasting plasma glucose average 104 mg/dL. Microalbuminuria screening negative.
                </p>
                <div className="flex justify-between items-center text-[10px] text-slate-400 pt-1 border-t border-slate-200/60 font-mono">
                  <span>ICD-10: E11.9</span>
                  <span>Onset: Nov 2024</span>
                </div>
              </div>

              {/* Condition 2: Essential Hypertension */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">Essential Hypertension (Borderline)</span>
                  <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                    Resting 120/80 mmHg
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Mild pre-hypertension tendencies under physical exertion. Managed conservatively with dietary DASH sodium restriction and telemetry tracking.
                </p>
                <div className="flex justify-between items-center text-[10px] text-slate-400 pt-1 border-t border-slate-200/60 font-mono">
                  <span>ICD-10: I10</span>
                  <span>Echocardiogram: LVEF 62%</span>
                </div>
              </div>

              {/* Condition 3: Sinus Tachycardia */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">Mild Transient Sinus Tachycardia</span>
                  <span className="text-[10px] font-bold text-sky-800 bg-sky-100 px-2 py-0.5 rounded">
                    Lead II Monitored
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Intermittent elevated resting heart rates (72-88 bpm). Continuous ICU Lead II telemetry verifies regular sinus rhythm without ischemic ST changes.
                </p>
                <div className="flex justify-between items-center text-[10px] text-slate-400 pt-1 border-t border-slate-200/60 font-mono">
                  <span>ICD-10: R00.0</span>
                  <span>Holter: Unremarkable</span>
                </div>
              </div>

              {/* Condition 4: Lumbar Spine Disc Desiccation */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">L4-L5 Lumbar Disc Desiccation</span>
                  <span className="text-[10px] font-bold text-slate-700 bg-slate-200 px-2 py-0.5 rounded">
                    MRI Confirmed
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Degenerative disc change from mechanical strain (2022). Controlled with core stabilization physiotherapy. No radiating motor nerve deficit.
                </p>
                <div className="flex justify-between items-center text-[10px] text-slate-400 pt-1 border-t border-slate-200/60 font-mono">
                  <span>ICD-10: M51.36</span>
                  <span>3T MRI: Clear thecal sac</span>
                </div>
              </div>

              {/* Condition 5: Surgical History (Appendectomy) */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">Post-Laparoscopic Appendectomy</span>
                  <span className="text-[10px] font-bold text-purple-800 bg-purple-100 px-2 py-0.5 rounded">
                    Surgically Resolved
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Emergency 3-port appendectomy performed at Apollo Metro Care (Jan 2021) by Dr. Amitav Ghosh for acute catarrhal appendicitis. Well-healed scar.
                </p>
                <div className="flex justify-between items-center text-[10px] text-slate-400 pt-1 border-t border-slate-200/60 font-mono">
                  <span>Surgeon: Dr. A. Ghosh</span>
                  <span>Hospitalized: 4 Days</span>
                </div>
              </div>

              {/* Condition 6: Renal & Metabolic Biomarkers */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">Renal & Hepatic Baseline Profile</span>
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                    eGFR 94 mL/min
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Kidney function intact with Serum Creatinine 0.9 mg/dL. Liver enzymes ALT 24 U/L, AST 21 U/L within normal limits. Fasting lipids within target.
                </p>
                <div className="flex justify-between items-center text-[10px] text-slate-400 pt-1 border-t border-slate-200/60 font-mono">
                  <span>Ultrasound: Normal</span>
                  <span>Last CMP: Oct 2026</span>
                </div>
              </div>

            </div>
          </div>

          {/* Emergency Directives & Next of Kin */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-3">
            <h3 className="text-base font-bold text-slate-900 font-['Plus_Jakarta_Sans']">
              Emergency Directives & Next-of-Kin Contacts
            </h3>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div>
                <span className="font-bold text-slate-900 text-sm">Priya Kumar (Spouse)</span>
                <p className="text-slate-500">{emergencyContact}</p>
                <p className="text-[11px] text-slate-400">Primary legal surrogate for emergency clinical authorization</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => addNotification('Simulating phone dial to Priya Kumar...', 'info')}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl"
                >
                  📞 Call Contact
                </button>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Belonging Picture Modal */}
      {selectedBelonging && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{selectedBelonging.icon}</span>
                <h3 className="text-base font-bold text-slate-900">{selectedBelonging.name}</h3>
              </div>
              <button onClick={() => setSelectedBelonging(null)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>

            {/* Belonging photo preview frame */}
            <div className="w-full h-48 rounded-2xl bg-gradient-to-tr from-slate-100 to-sky-50 border border-slate-200 flex flex-col items-center justify-center p-4 text-center">
              <div className="w-20 h-20 rounded-2xl bg-white shadow-md flex items-center justify-center text-4xl mb-2">
                {selectedBelonging.icon}
              </div>
              <span className="text-xs font-mono font-bold text-slate-800">
                BELONGING ITEM #{selectedBelonging.id.toUpperCase()}
              </span>
              <span className="text-[10px] text-slate-500 mt-0.5">
                Custody Vault Logged: {selectedBelonging.loggedAt}
              </span>
            </div>

            <div className="space-y-1.5 text-xs text-slate-700">
              <p><strong>Description:</strong> {selectedBelonging.description}</p>
              <p><strong>Custody Status:</strong> <span className="font-bold text-[#0077b6]">{selectedBelonging.custodyStatus.replace(/_/g, ' ')}</span></p>
              <p><strong>Location:</strong> {selectedBelonging.location}</p>
            </div>

            <div className="flex justify-end pt-2 border-t">
              <button
                onClick={() => setSelectedBelonging(null)}
                className="px-5 py-2 bg-slate-800 text-white text-xs font-bold rounded-xl"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
