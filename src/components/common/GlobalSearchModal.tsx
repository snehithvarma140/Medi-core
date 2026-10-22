import React, { useState } from 'react';
import { useHealthcare } from '../../context/HealthcareContext';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAction: (type: string, data?: any) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectAction,
}) => {
  const { prescriptions, appointments, hospitalFacilities, medicalVisits, activePatient } = useHealthcare();
  const [query, setQuery] = useState('');

  if (!isOpen) return null;

  const q = query.trim().toLowerCase();

  const filteredVisits = q
    ? medicalVisits.filter(
        (v) =>
          v.reason.toLowerCase().includes(q) ||
          v.diagnosis.toLowerCase().includes(q) ||
          v.doctorName.toLowerCase().includes(q) ||
          v.hospitalName.toLowerCase().includes(q)
      )
    : medicalVisits.slice(0, 3);

  const filteredMeds = q
    ? prescriptions.flatMap((p) =>
        p.items
          .filter((m) => m.medicineName.toLowerCase().includes(q))
          .map((m) => ({ ...m, doctor: p.doctorName, rxNumber: p.prescriptionNumber }))
      )
    : prescriptions.flatMap((p) =>
        p.items.map((m) => ({ ...m, doctor: p.doctorName, rxNumber: p.prescriptionNumber }))
      );

  const filteredHospitals = q
    ? hospitalFacilities.filter(
        (h) => h.name.toLowerCase().includes(q) || h.location.toLowerCase().includes(q)
      )
    : hospitalFacilities;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-100">
          <svg className="w-5 h-5 text-slate-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Lookup records, medical conditions, rx, doctors, or hospitals..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="w-full text-sm text-slate-800 placeholder-slate-400 focus:outline-none bg-transparent"
          />
          <button
            onClick={onClose}
            className="text-xs font-mono bg-slate-100 text-slate-500 hover:text-slate-800 px-2 py-1 rounded"
          >
            ESC
          </button>
        </div>

        {/* Results Body */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-4">
          {/* Quick Medi ID Chip */}
          <div className="bg-sky-50/80 p-3 rounded-xl border border-sky-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-sky-500"></span>
              <span className="text-xs font-bold text-sky-900">Current Medi ID:</span>
              <span className="text-xs font-mono font-semibold text-sky-700">{activePatient.mediId}</span>
              <span className="text-xs text-slate-500">({activePatient.name} • {activePatient.bloodGroup})</span>
            </div>
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Verified
            </span>
          </div>

          {/* Section: Prescribed Medicines */}
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              Active Prescriptions & Medications
            </h4>
            <div className="space-y-1.5">
              {filteredMeds.map((med, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    onSelectAction('Prescriptions');
                    onClose();
                  }}
                  className="flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-200 cursor-pointer transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center text-xs font-bold">
                      Rx
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-900">{med.medicineName}</p>
                      <p className="text-[11px] text-slate-500">
                        {med.dosage} • {med.frequency} • Prescribed by {med.doctor}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-sky-700 font-medium">View Rx →</span>
                </div>
              ))}
            </div>
          </div>

          {/* Section: Medical Visits & Diagnoses */}
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              Clinical Encounters & Reports
            </h4>
            <div className="space-y-1.5">
              {filteredVisits.map((v) => (
                <div
                  key={v.id}
                  onClick={() => {
                    onSelectAction('Medical History');
                    onClose();
                  }}
                  className="p-2.5 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-200 cursor-pointer transition-all"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-slate-900">{v.diagnosis}</p>
                    <span className="text-[10px] text-slate-400">{v.date}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {v.hospitalName} • {v.doctorName} • {v.reason}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Section: Hospitals */}
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              Affiliated Hospital Centers
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {filteredHospitals.map((h) => (
                <div
                  key={h.id}
                  onClick={() => {
                    onSelectAction('Hospital');
                    onClose();
                  }}
                  className="p-2.5 rounded-lg bg-slate-50 hover:bg-slate-100/80 border border-slate-200/70 cursor-pointer transition-all"
                >
                  <p className="text-xs font-bold text-slate-800">{h.name}</p>
                  <p className="text-[11px] text-slate-500 truncate">{h.location}</p>
                  <div className="flex items-center gap-2 mt-1 text-[10px] text-emerald-700 font-semibold">
                    <span>{h.availableBeds} beds available</span>
                    <span>•</span>
                    <span>ICU Active</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span>Search records linked to Medi ID {activePatient.mediId}</span>
          <span>Press ESC to exit</span>
        </div>
      </div>
    </div>
  );
};
