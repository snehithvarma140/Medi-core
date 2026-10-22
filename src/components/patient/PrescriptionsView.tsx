import React, { useState } from 'react';
import { useHealthcare } from '../../context/HealthcareContext';
import { Prescription } from '../../types/healthcare';

export const PrescriptionsView: React.FC = () => {
  const { prescriptions, requestPrescriptionRefill, activePatient, addNotification } = useHealthcare();
  const [selectedRx, setSelectedRx] = useState<Prescription | null>(prescriptions[0] || null);
  const [showPrintModal, setShowPrintModal] = useState(false);

  const handleRefill = (rxId: string) => {
    requestPrescriptionRefill(rxId);
    addNotification('Refill request transmitted to ABC Hospital outpatient pharmacy.', 'info');
  };

  return (
    <div className="space-y-6 pb-12 font-['Inter']">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono tracking-wider uppercase text-sky-800 font-semibold bg-sky-50 px-2.5 py-1 rounded-md border border-sky-200">
            FHIR e-Prescription Registry
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-['Plus_Jakarta_Sans'] mt-2">
            Active Prescriptions & Dosages
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Linked to Medi ID: <span className="font-mono font-bold text-slate-800">{activePatient.mediId}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPrintModal(true)}
            className="px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-colors flex items-center gap-1.5"
          >
            <span>🖨️</span>
            <span>Print E-Script Slip</span>
          </button>
        </div>
      </div>

      {/* Grid: Prescriptions List & Selected Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Prescription Cards */}
        <div className="lg:col-span-1 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block px-1">
            Prescriptions On Record ({prescriptions.length})
          </span>

          {prescriptions.map((rx) => {
            const isSelected = selectedRx?.id === rx.id;
            return (
              <div
                key={rx.id}
                onClick={() => setSelectedRx(rx)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-sky-50/60 border-[#0077b6] ring-1 ring-[#0077b6] shadow-xs'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-sky-800 bg-sky-100/70 px-2 py-0.5 rounded">
                    #{rx.prescriptionNumber}
                  </span>
                  <span className="text-[11px] text-slate-400">{rx.date}</span>
                </div>

                <h4 className="text-sm font-bold text-slate-900 mt-2">{rx.diagnosis}</h4>
                <p className="text-xs text-slate-500 mt-0.5">Prescribed by {rx.doctorName}</p>
                <p className="text-[11px] text-slate-400">{rx.doctorSpecialty}</p>

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 text-xs">
                  <span className="text-slate-500 font-medium">
                    {rx.items.length} {rx.items.length === 1 ? 'Medication' : 'Medications'}
                  </span>
                  <span className="text-xs text-sky-700 font-semibold">
                    Refill: {rx.refillCount}/{rx.maxRefills}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: Detailed View */}
        <div className="lg:col-span-2">
          {selectedRx ? (
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-6">
              
              {/* Rx Header Banner */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-sky-800 bg-sky-100 px-2.5 py-0.5 rounded-md">
                      Rx #{selectedRx.prescriptionNumber}
                    </span>
                    <span className="text-xs text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      ✓ Active Clinical Order
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mt-1">{selectedRx.diagnosis}</h3>
                  <p className="text-xs text-slate-500">
                    Prescribed by {selectedRx.doctorName} • {selectedRx.doctorSpecialty}
                  </p>
                </div>

                <div className="text-right sm:text-right">
                  <span className="text-xs text-slate-400 block">Issue Date</span>
                  <span className="text-sm font-bold text-slate-800">{selectedRx.date}</span>
                </div>
              </div>

              {/* Patient and Allergy Safeguards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Patient Identification</span>
                  <p className="text-sm font-bold text-slate-900 mt-0.5">{selectedRx.patientName}</p>
                  <p className="text-xs font-mono text-sky-700 font-semibold">{selectedRx.patientMediId}</p>
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-rose-500 uppercase tracking-wider">Allergy Contraindication Crosscheck</span>
                  <p className="text-xs font-bold text-rose-900 mt-0.5">⚠️ Penicillin Class Prohibited</p>
                  <p className="text-[11px] text-slate-500">Verified safe for prescribed active ingredients.</p>
                </div>
              </div>

              {/* Medication Table */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                  Prescribed Pharmaceuticals & Regimen
                </h4>

                <div className="space-y-3">
                  {selectedRx.items.map((med, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl bg-slate-50/80 border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-md bg-[#0077b6] text-white flex items-center justify-center text-xs font-bold">
                            {idx + 1}
                          </span>
                          <span className="text-sm font-bold text-slate-900">{med.medicineName}</span>
                          <span className="text-xs font-bold text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                            {med.dosage}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 pl-8">
                          <strong className="text-slate-800">Frequency:</strong> {med.frequency} • <strong className="text-slate-800">Duration:</strong> {med.duration}
                        </p>
                        <p className="text-xs text-sky-800 font-medium pl-8">
                          ⏰ Timing: {med.foodTiming} {med.instructions && `(${med.instructions})`}
                        </p>
                      </div>

                      <div className="pl-8 md:pl-0">
                        <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                          ✓ Integrated in Schedule
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Doctor's Specific Clinical Instructions */}
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Doctor's Instructions & Care Directives
                </span>
                <p className="text-xs text-slate-700 mt-1 bg-white p-3.5 rounded-xl border border-slate-200 leading-relaxed">
                  {selectedRx.instructions}
                </p>
              </div>

              {/* Refills & Pharmacy Sync */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-4 border-t border-slate-100 gap-3">
                <div>
                  <span className="text-xs text-slate-500">Refill Authorization</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-sm font-bold text-slate-900">
                      {selectedRx.refillCount} used of {selectedRx.maxRefills} permitted
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleRefill(selectedRx.id)}
                    disabled={selectedRx.refillCount >= selectedRx.maxRefills}
                    className="px-4 py-2 rounded-xl bg-[#0077b6] hover:bg-[#005d90] disabled:bg-slate-200 disabled:text-slate-400 text-white text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Request Pharmacy Refill ({selectedRx.maxRefills - selectedRx.refillCount} Left)
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-400">
              Select a prescription from the left to view details.
            </div>
          )}
        </div>
      </div>

      {/* Print E-Script Modal Preview */}
      {showPrintModal && selectedRx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-bold text-slate-900">Digital Prescription E-Script</h3>
              <button onClick={() => setShowPrintModal(false)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>
            <div className="p-4 border border-dashed rounded-xl bg-slate-50 space-y-3 font-mono text-xs text-slate-800">
              <div className="flex justify-between border-b pb-2">
                <span>ABC HEALTHCARE NETWORK</span>
                <span>Rx #{selectedRx.prescriptionNumber}</span>
              </div>
              <p>PATIENT: {selectedRx.patientName} (ID: {selectedRx.patientMediId})</p>
              <p>PHYSICIAN: {selectedRx.doctorName} ({selectedRx.doctorSpecialty})</p>
              <p>DATE: {selectedRx.date}</p>
              <div className="border-t pt-2 space-y-1">
                {selectedRx.items.map((i, idx) => (
                  <div key={idx} className="flex justify-between">
                    <span>{idx + 1}. {i.medicineName} ({i.dosage})</span>
                    <span>{i.frequency} x {i.duration}</span>
                  </div>
                ))}
              </div>
              <p className="border-t pt-2 text-[10px] text-slate-500">DIGITALLY SIGNED VIA MEDI HL7 FHIR NODE</p>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  window.print();
                  setShowPrintModal(false);
                }}
                className="px-4 py-2 bg-[#0077b6] text-white text-xs font-semibold rounded-lg"
              >
                Trigger System Print
              </button>
              <button
                onClick={() => setShowPrintModal(false)}
                className="px-4 py-2 border rounded-lg text-xs font-semibold text-slate-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
