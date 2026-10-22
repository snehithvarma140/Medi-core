import React from 'react';
import { useHealthcare } from '../../context/HealthcareContext';

interface EmergencyDossierModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProceedToTriage: () => void;
  mediId?: string;
}

export const EmergencyDossierModal: React.FC<EmergencyDossierModalProps> = ({
  isOpen,
  onClose,
  onProceedToTriage,
  mediId = 'MED-7X29K4',
}) => {
  const { activePatient, medicalVisits, prescriptions, addNotification } = useHealthcare();

  if (!isOpen) return null;

  const handleCallEmergencyContact = () => {
    addNotification('Dialing next-of-kin emergency contact Priya Kumar (+1 555 392-1082)...', 'alert');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl border-2 border-rose-500 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Urgent Header */}
        <div className="bg-gradient-to-r from-rose-700 via-red-600 to-rose-700 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white text-rose-600 flex items-center justify-center text-xl font-black shadow-md animate-pulse">
              🚨
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono tracking-widest uppercase bg-rose-900/60 px-2 py-0.5 rounded font-bold">
                  Zero-Latency ER Clearance
                </span>
                <span className="text-xs font-mono font-bold bg-white/20 px-2 py-0.5 rounded">
                  {mediId}
                </span>
              </div>
              <h2 className="text-xl font-black font-['Plus_Jakarta_Sans'] mt-0.5">
                Ravi / Rahul Kumar • Emergency Clinical Dossier
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center text-sm font-bold transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Top High-Alert Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-rose-50 border-2 border-rose-300 p-3.5 rounded-2xl">
              <span className="text-[10px] font-extrabold text-rose-800 uppercase tracking-wider block">
                🩸 Verified Blood Group
              </span>
              <p className="text-3xl font-black text-rose-950 font-mono mt-0.5">
                B+ <span className="text-xs font-sans font-bold text-rose-700">Rh Positive</span>
              </p>
              <p className="text-[10px] text-rose-600 mt-1">Crossmatch compatible: B+, B-, O+, O-</p>
            </div>

            <div className="bg-red-100 border-2 border-red-500 p-3.5 rounded-2xl">
              <span className="text-[10px] font-extrabold text-red-900 uppercase tracking-wider block">
                ⚠️ Fatal Allergy Warning
              </span>
              <p className="text-xl font-black text-red-950 mt-0.5">
                Penicillin
              </p>
              <p className="text-[10px] font-bold text-red-800 mt-1 uppercase">
                Anaphylaxis Risk • Avoid Beta-Lactams
              </p>
            </div>

            <div className="bg-amber-50 border-2 border-amber-300 p-3.5 rounded-2xl">
              <span className="text-[10px] font-extrabold text-amber-800 uppercase tracking-wider block">
                ⚠️ Key Medical Conditions
              </span>
              <p className="text-base font-black text-amber-950 mt-0.5">
                Type II Diabetes
              </p>
              <p className="text-[10px] text-amber-700 mt-1">HbA1c: 6.8% • Metformin ER active</p>
            </div>
          </div>

          {/* Quick Demographics & Emergency Contacts */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Age & Gender</span>
              <span className="font-bold text-slate-900">32 yrs • Male</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Organ Donor</span>
              <span className="font-bold text-emerald-700">✓ Registered Donor</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Attending Doctor</span>
              <span className="font-bold text-slate-900">Dr. Anjali Rao (ABC Hospital)</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Next of Kin</span>
              <button
                onClick={handleCallEmergencyContact}
                className="font-bold text-rose-700 hover:underline flex items-center gap-1"
              >
                <span>📞 Call Priya Kumar</span>
              </button>
            </div>
          </div>

          {/* Active Pharmaceuticals (What tablets they are taking) */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Active Prescribed Medications (Current Daily Regimen)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {prescriptions[0]?.items.map((item, idx) => (
                <div key={idx} className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-900">{item.medicineName}</span>
                    <p className="text-slate-500 text-[11px]">{item.dosage} • {item.frequency} ({item.foodTiming})</p>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Active
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Past Months Medical & Hospital History Timeline */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Past Months Hospital Encounters & Treatment History
            </h3>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {medicalVisits.map((visit) => (
                <div key={visit.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
                  <div className="flex items-center justify-between font-bold">
                    <span className="text-slate-900">{visit.hospitalName} — {visit.diagnosis}</span>
                    <span className="text-slate-500 font-mono text-[11px]">{visit.date}</span>
                  </div>
                  <p className="text-slate-600 text-[11px]">
                    <strong className="text-slate-700">Reason:</strong> {visit.reason} • <strong className="text-slate-700">Doctor:</strong> {visit.doctorName}
                  </p>
                  <p className="text-slate-500 text-[11px]">
                    <strong className="text-slate-700">Treatment Given:</strong> {visit.treatment}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Action Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[11px] text-slate-500 text-center sm:text-left">
            Immediate trauma bypass protocol approved for clinical emergency staff under HIPAA §164.512.
          </p>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200/70 rounded-xl border border-slate-200 w-full sm:w-auto"
            >
              Close Summary
            </button>
            <button
              onClick={() => {
                onClose();
                onProceedToTriage();
              }}
              className="px-6 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 whitespace-nowrap w-full sm:w-auto"
            >
              <span>⚡ Enter Full Emergency Triage Console</span>
              <span>→</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
