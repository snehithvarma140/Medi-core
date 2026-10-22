import React, { useState } from 'react';
import { useHealthcare } from '../../context/HealthcareContext';
import { Bed } from '../../types/healthcare';

export const HospitalPortal: React.FC = () => {
  const {
    wards,
    admitPatientToBed,
    dischargeBed,
    updateBedStatus,
    activePatient,
    addNotification,
  } = useHealthcare();

  const [activeWardId, setActiveWardId] = useState<string>('ward-icu');
  const [selectedBed, setSelectedBed] = useState<Bed | null>(null);

  // Quick Admit Modal state
  const [showAdmitModal, setShowAdmitModal] = useState(false);
  const [admitMediId, setAdmitMediId] = useState('MED-7X29K4');
  const [admitPatientName, setAdmitPatientName] = useState('Rahul Kumar');
  const [targetBedId, setTargetBedId] = useState('');

  const currentWard = wards.find((w) => w.id === activeWardId) || wards[0];

  const handleBedClick = (bed: Bed) => {
    setSelectedBed(bed);
  };

  const handleQuickAdmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetBedId) return;

    admitPatientToBed(targetBedId, admitMediId, admitPatientName);
    addNotification(`Admitted ${admitPatientName} (${admitMediId}) to bed ${targetBedId}.`, 'info');
    setShowAdmitModal(false);
  };

  return (
    <div className="space-y-6 pb-12 font-['Inter']">
      
      {/* Hospital Top Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-teal-600 text-white flex items-center justify-center text-2xl font-bold shadow-xs">
            🏥
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-slate-900 font-['Plus_Jakarta_Sans']">
                ABC Hospital Operations Center
              </h1>
              <span className="text-xs font-bold text-teal-800 bg-teal-50 border border-teal-200 px-2.5 py-0.5 rounded-full">
                Live EHR Node
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Trauma Level 1 Facility • Central Medical Corridor • Wards & Bed Grid Console
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const availableBed = currentWard.beds.find((b) => b.status === 'AVAILABLE');
              if (availableBed) setTargetBedId(availableBed.id);
              setShowAdmitModal(true);
            }}
            className="px-5 py-2.5 bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-2"
          >
            <span>➕</span>
            <span>Admit Patient to Bed</span>
          </button>
        </div>
      </div>

      {/* Operational KPIs (Specification 31) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">Today's Patients</span>
          <span className="text-2xl font-extrabold text-slate-900 font-mono mt-1 block">247</span>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-blue-200 bg-blue-50/20 shadow-xs">
          <span className="text-[11px] font-medium text-blue-700 uppercase tracking-wider block">Admissions</span>
          <span className="text-2xl font-extrabold text-blue-900 font-mono mt-1 block">18</span>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/20 shadow-xs">
          <span className="text-[11px] font-medium text-emerald-700 uppercase tracking-wider block">Discharges</span>
          <span className="text-2xl font-extrabold text-emerald-900 font-mono mt-1 block">12</span>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-teal-200 bg-teal-50/20 shadow-xs">
          <span className="text-[11px] font-medium text-teal-700 uppercase tracking-wider block">Available Beds</span>
          <span className="text-2xl font-extrabold text-teal-900 font-mono mt-1 block">34</span>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-rose-200 bg-rose-50/20 shadow-xs">
          <span className="text-[11px] font-medium text-rose-700 uppercase tracking-wider block">Emergency Cases</span>
          <span className="text-2xl font-extrabold text-rose-900 font-mono mt-1 block">7</span>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">Doctors On Duty</span>
          <span className="text-2xl font-extrabold text-slate-900 font-mono mt-1 block">28</span>
        </div>
      </div>

      {/* Ward Selector Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-bold text-slate-900 font-['Plus_Jakarta_Sans']">
            Visual Bed & Ward Grid
          </h2>
          <span className="text-xs text-slate-400">Click any bed station to manage assignment</span>
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200">
          {wards.map((ward) => (
            <button
              key={ward.id}
              onClick={() => setActiveWardId(ward.id)}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeWardId === ward.id
                  ? 'bg-white text-teal-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {ward.name}
            </button>
          ))}
        </div>
      </div>

      {/* Bed Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {currentWard.beds.map((bed) => {
          const isOccupied = bed.status === 'OCCUPIED';
          const isAvailable = bed.status === 'AVAILABLE';
          const isCleaning = bed.status === 'CLEANING';
          const isMaintenance = bed.status === 'MAINTENANCE';
          const isSelected = selectedBed?.id === bed.id;
          const isPatientRahul = bed.assignedPatientMediId === activePatient.mediId;

          return (
            <div
              key={bed.id}
              onClick={() => handleBedClick(bed)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer relative flex flex-col justify-between min-h-[140px] ${
                isPatientRahul
                  ? 'bg-rose-50/70 border-rose-300 ring-2 ring-rose-400'
                  : isOccupied
                  ? 'bg-slate-50 border-slate-200 hover:border-slate-300'
                  : isAvailable
                  ? 'bg-emerald-50/40 border-emerald-200 hover:border-emerald-300'
                  : 'bg-amber-50/40 border-amber-200'
              } ${isSelected ? 'ring-2 ring-teal-500' : ''}`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-black text-slate-900">
                    {bed.bedNumber}
                  </span>
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      isOccupied
                        ? 'bg-rose-500'
                        : isAvailable
                        ? 'bg-emerald-500'
                        : 'bg-amber-500'
                    }`}
                  ></span>
                </div>

                <div className="mt-2">
                  {isOccupied ? (
                    <div>
                      <p className="text-xs font-bold text-slate-900 truncate">
                        {bed.assignedPatientName || 'Admitted Patient'}
                      </p>
                      <p className="text-[10px] font-mono text-slate-500">
                        {bed.assignedPatientMediId || 'EHR Assigned'}
                      </p>
                    </div>
                  ) : isAvailable ? (
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded">
                      Available
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-100/70 px-2 py-0.5 rounded uppercase">
                      {bed.status}
                    </span>
                  )}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200/50 flex items-center justify-between text-[10px] text-slate-400">
                <span>{bed.wardType}</span>
                <span className="text-teal-700 font-semibold">Manage →</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bed Action Drawer/Modal */}
      {selectedBed && (
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4 animate-in fade-in">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold bg-teal-100 text-teal-800 px-2 py-0.5 rounded">
                Bed Station: {selectedBed.bedNumber}
              </span>
              <span className="text-xs font-bold text-slate-900">{selectedBed.wardName}</span>
              <span className="text-xs text-slate-500">({selectedBed.status})</span>
            </div>
            {selectedBed.assignedPatientName && (
              <p className="text-sm font-semibold text-slate-800 mt-1">
                Occupied by: <strong>{selectedBed.assignedPatientName}</strong> (ID: {selectedBed.assignedPatientMediId || 'Verified'})
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            {selectedBed.status === 'OCCUPIED' ? (
              <>
                <button
                  onClick={() => {
                    dischargeBed(selectedBed.id);
                    setSelectedBed(null);
                    addNotification(`Discharged patient from ${selectedBed.bedNumber}. Station marked Available.`, 'info');
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl"
                >
                  Discharge Patient
                </button>
                <button
                  onClick={() => {
                    updateBedStatus(selectedBed.id, 'CLEANING');
                    setSelectedBed(null);
                  }}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl"
                >
                  Mark Cleaning
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    setTargetBedId(selectedBed.id);
                    setShowAdmitModal(true);
                  }}
                  className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold rounded-xl"
                >
                  Admit New Patient Here
                </button>
                <button
                  onClick={() => {
                    updateBedStatus(selectedBed.id, 'MAINTENANCE');
                    setSelectedBed(null);
                  }}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-xl"
                >
                  Set Maintenance
                </button>
              </>
            )}
            <button
              onClick={() => setSelectedBed(null)}
              className="p-2 text-slate-400 hover:text-slate-600"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Quick Admit Modal */}
      {showAdmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-bold text-slate-900">Bed Admission Form</h3>
              <button onClick={() => setShowAdmitModal(false)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>

            <form onSubmit={handleQuickAdmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Target Bed</label>
                <select
                  value={targetBedId}
                  onChange={(e) => setTargetBedId(e.target.value)}
                  className="w-full px-3 py-2 text-xs border rounded-lg"
                >
                  {currentWard.beds.filter(b => b.status === 'AVAILABLE').map(b => (
                    <option key={b.id} value={b.id}>{b.bedNumber} ({b.wardName})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Patient Medi ID</label>
                <input
                  type="text"
                  required
                  value={admitMediId}
                  onChange={(e) => setAdmitMediId(e.target.value)}
                  className="w-full px-3 py-2 text-xs border rounded-lg font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Patient Full Name</label>
                <input
                  type="text"
                  required
                  value={admitPatientName}
                  onChange={(e) => setAdmitPatientName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowAdmitModal(false)}
                  className="px-4 py-2 border rounded-lg text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-700 text-white text-xs font-bold rounded-lg"
                >
                  Confirm Bed Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
