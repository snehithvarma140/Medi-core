import React, { useState } from 'react';
import { useHealthcare } from '../../context/HealthcareContext';
import { BloodGroup } from '../../types/healthcare';

export const HospitalBloodBankView: React.FC = () => {
  const { hospitalFacilities, bloodReserves, activePatient, addNotification } = useHealthcare();
  const [activeSubTab, setActiveSubTab] = useState<'hospitals' | 'blood'>('hospitals');
  const [selectedBloodFilter, setSelectedBloodFilter] = useState<string>('All');
  const [requestBloodGroup, setRequestBloodGroup] = useState<BloodGroup | null>(null);

  const handleReserveBlood = (group: BloodGroup) => {
    addNotification(`Emergency reservation request dispatched for 1 unit of ${group} Blood to ABC Regional Blood Bank.`, 'alert');
    setRequestBloodGroup(null);
  };

  const filteredBlood = selectedBloodFilter === 'All'
    ? bloodReserves
    : bloodReserves.filter((b) => b.bloodGroup === selectedBloodFilter);

  return (
    <div className="space-y-6 pb-12 font-['Inter']">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono tracking-wider uppercase text-sky-800 font-semibold bg-sky-50 px-2.5 py-1 rounded-md border border-sky-200">
            Regional Medical Grid & Inventory
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-['Plus_Jakarta_Sans'] mt-2">
            Hospitals & Live Blood Reserves
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time verified facility telemetry, trauma centers, and blood compatibility for patient <span className="font-mono font-bold text-slate-800">{activePatient.name} ({activePatient.bloodGroup})</span>
          </p>
        </div>

        {/* Sub-Tab Switcher */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200">
          <button
            onClick={() => setActiveSubTab('hospitals')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeSubTab === 'hospitals'
                ? 'bg-white text-[#005d90] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🏥 Hospitals & Wards
          </button>
          <button
            onClick={() => setActiveSubTab('blood')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeSubTab === 'blood'
                ? 'bg-white text-rose-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🩸 Live Blood Bank
          </button>
        </div>
      </div>

      {/* Sub-Tab 1: Hospitals */}
      {activeSubTab === 'hospitals' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {hospitalFacilities.map((hosp) => (
              <div
                key={hosp.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 flex flex-col justify-between space-y-4 hover:border-slate-300 transition-all"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Accredited Trauma Level 1
                      </span>
                      <h3 className="text-lg font-bold text-slate-900 mt-0.5">{hosp.name}</h3>
                      <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                        <span>📍</span>
                        <span>{hosp.location}</span>
                      </p>
                    </div>
                    <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      ★ {hosp.rating}
                    </span>
                  </div>

                  {/* Bed Capacity Indicator */}
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 mt-4 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">Available Inpatient Beds</span>
                      <span className="font-bold text-slate-900 font-mono">
                        {hosp.availableBeds} / {hosp.totalBeds} Available
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#0077b6]"
                        style={{ width: `${Math.round(((hosp.totalBeds - hosp.availableBeds) / hosp.totalBeds) * 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Capabilities list */}
                  <div className="pt-3">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                      Key Clinical Services
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {hosp.departments.map((dept, i) => (
                        <span key={i} className="text-[11px] bg-slate-50 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                          {dept}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                  <button
                    onClick={() => addNotification(`Connecting to ${hosp.name} reception: ${hosp.contactNumber}`, 'info')}
                    className="flex-1 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-semibold border border-slate-200 transition-colors"
                  >
                    📞 Call Reception
                  </button>
                  <button
                    onClick={() => addNotification(`Admission request generated for ${hosp.name}. Triage review pending.`, 'alert')}
                    className="flex-1 py-2 rounded-xl bg-[#0077b6] hover:bg-[#005d90] text-white text-xs font-semibold transition-colors"
                  >
                    Request Bed
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sub-Tab 2: Blood Bank */}
      {activeSubTab === 'blood' && (
        <div className="space-y-6">
          {/* Patient Blood Alert Banner */}
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-rose-500 text-white flex items-center justify-center text-xl font-bold">
                🩸
              </div>
              <div>
                <span className="text-xs font-semibold text-rose-800 uppercase tracking-wider">
                  Patient Blood Group Profile
                </span>
                <h3 className="text-xl font-extrabold text-rose-950 font-mono">
                  {activePatient.bloodGroup} Rh+ (Rahul Kumar)
                </h3>
                <p className="text-xs text-rose-700 mt-0.5">
                  Compatible Donor Types: <strong>B+, B-, O+, O-</strong>
                </p>
              </div>
            </div>

            <button
              onClick={() => handleReserveBlood(activePatient.bloodGroup)}
              className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors whitespace-nowrap"
            >
              Reserve Compatible Unit ({activePatient.bloodGroup})
            </button>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <span className="text-xs font-semibold text-slate-500 mr-1">Filter Type:</span>
            {['All', 'B+', 'O+', 'O-', 'A+', 'A-', 'AB+', 'AB-', 'B-'].map((bg) => (
              <button
                key={bg}
                onClick={() => setSelectedBloodFilter(bg)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                  selectedBloodFilter === bg
                    ? 'bg-rose-600 text-white border-rose-600'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {bg}
              </button>
            ))}
          </div>

          {/* Blood Inventory Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {filteredBlood.map((reserve) => {
              const isPatientMatch = reserve.bloodGroup === activePatient.bloodGroup;
              const isCritical = reserve.status === 'CRITICAL';
              const isLow = reserve.status === 'LOW';

              return (
                <div
                  key={reserve.bloodGroup}
                  className={`bg-white rounded-2xl p-5 border shadow-xs transition-all relative ${
                    isPatientMatch
                      ? 'border-rose-400 ring-2 ring-rose-300'
                      : 'border-slate-200'
                  }`}
                >
                  {isPatientMatch && (
                    <span className="absolute -top-2.5 right-3 text-[10px] font-bold text-rose-800 bg-rose-100 border border-rose-300 px-2 py-0.5 rounded-full">
                      ★ YOUR MATCH
                    </span>
                  )}

                  <div className="flex items-start justify-between">
                    <span className="text-3xl font-extrabold text-slate-900 font-mono">
                      {reserve.bloodGroup}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                        isCritical
                          ? 'bg-rose-100 text-rose-800'
                          : isLow
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {reserve.status}
                    </span>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <span className="text-xs text-slate-400">Available Stock</span>
                    <div className="flex items-baseline gap-1 mt-0.5">
                      <span className="text-2xl font-black text-slate-800 font-mono tabular-nums">
                        {reserve.units}
                      </span>
                      <span className="text-xs text-slate-500 font-medium">Units</span>
                    </div>
                    <span className="text-[10px] text-slate-400 block mt-1">
                      Updated {reserve.lastUpdated}
                    </span>
                  </div>

                  <button
                    onClick={() => handleReserveBlood(reserve.bloodGroup)}
                    className="w-full mt-4 py-2 bg-slate-50 hover:bg-rose-50 hover:text-rose-700 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 transition-colors"
                  >
                    Reserve Unit
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
