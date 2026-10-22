import React, { useState } from 'react';
import { useHealthcare } from '../../context/HealthcareContext';
import { EcgLeadVisual } from '../common/EcgLeadVisual';
import { RealtimeTelemetryHub } from './RealtimeTelemetryHub';
import { AppointmentDetailsModal } from './AppointmentDetailsModal';
import { BookDoctorModal } from './BookDoctorModal';

interface PatientDashboardProps {
  onNavigateTab: (tab: string) => void;
  onOpenAuditLedger: () => void;
}

export const PatientDashboard: React.FC<PatientDashboardProps> = ({
  onNavigateTab,
  onOpenAuditLedger,
}) => {
  const {
    activePatient,
    medicationSchedule,
    appointments,
    toggleMedicationTaken,
    toggleAdmittedStatus,
    addNotification,
  } = useHealthcare();

  const [copiedMediId, setCopiedMediId] = useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null);
  const [isBookDoctorOpen, setIsBookDoctorOpen] = useState(false);
  const [isCallingDesk, setIsCallingDesk] = useState(false);

  const handleCopyMediId = () => {
    navigator.clipboard?.writeText(activePatient.mediId);
    setCopiedMediId(true);
    setTimeout(() => setCopiedMediId(false), 2000);
  };

  const handleContactDesk = () => {
    setIsCallingDesk(true);
    addNotification('Dialing ABC Hospital Critical Care Wing nursing desk (Station ICU-07)...', 'info');
    setTimeout(() => {
      setIsCallingDesk(false);
    }, 2500);
  };

  const nextAppt = appointments.find((a) => a.patientMediId === activePatient.mediId && a.status === 'CONFIRMED') || appointments[0];

  // Calculate medication progress
  const totalMeds = medicationSchedule.length;
  const takenMeds = medicationSchedule.filter((m) => m.taken).length;
  const progressPercent = totalMeds > 0 ? Math.round((takenMeds / totalMeds) * 100) : 0;

  return (
    <div className="space-y-6 pb-12 font-['Inter']">
      
      {/* ========================================================
          HERO BANNER: Medi ID, Patient Name, Alert Badges & Connected Facility
          ======================================================== */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-2">
        {/* Left Column: FHIR badge, Greeting, Metadata Pills */}
        <div className="space-y-2">
          {/* Top verified chips */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#e0f2fe] text-[#0369a1] border border-[#bae6fd]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0284c7]"></span>
              FHIR Verified Patient Record
            </span>

            <button
              onClick={handleCopyMediId}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium bg-slate-100/90 hover:bg-slate-200/80 text-slate-700 border border-slate-200 transition-colors cursor-pointer"
            >
              <span>Medi ID:</span>
              <span className="font-semibold text-slate-900">{activePatient.mediId}</span>
              <svg className="w-3.5 h-3.5 text-slate-400 hover:text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              {copiedMediId && <span className="text-[10px] text-emerald-600 font-sans font-bold">Copied!</span>}
            </button>
          </div>

          {/* Main Title */}
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-['Plus_Jakarta_Sans'] tracking-tight">
            Good morning, Rahul
          </h1>

          {/* Clinical Attribute Badges (Image 6 Pills) */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            {/* Blood Group */}
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-sky-50 text-sky-800 border border-sky-200">
              <span className="text-sky-500">💧</span>
              <span>Blood Group:</span>
              <strong className="text-sky-950 font-bold">{activePatient.bloodGroup}</strong>
            </span>

            {/* Allergy Alert (Red/Pink highlight) */}
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#fff1f2] text-[#9f1239] border border-[#fecdd3]">
              <span className="text-rose-500">⚠️</span>
              <span>Allergy Alert:</span>
              <strong className="text-rose-900 font-bold">{activePatient.allergy}</strong>
            </span>

            {/* Attending Physician */}
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-50 text-slate-700 border border-slate-200">
              <span className="text-slate-500">🩺</span>
              <span>Attending:</span>
              <strong className="text-slate-900 font-bold">{activePatient.attendingDoctor}</strong>
            </span>
          </div>
        </div>

        {/* Right Column: CONNECTED FACILITY Card */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs flex items-center gap-4 min-w-[280px]">
          <div className="w-12 h-12 rounded-xl bg-sky-50 text-[#0077b6] border border-sky-100 flex items-center justify-center">
            {/* Facility Cross Icon */}
            <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
              <path d="M10 4a1 1 0 011-1h2a1 1 0 011 1v5h5a1 1 0 011 1v2a1 1 0 01-1 1h-5v5a1 1 0 01-1 1h-2a1 1 0 01-1-1v-5H5a1 1 0 01-1-1v-2a1 1 0 011-1h5V4z" />
            </svg>
          </div>
          <div>
            <span className="text-[10px] font-semibold tracking-wider uppercase text-slate-400">
              Connected Facility
            </span>
            <p className="text-sm font-bold text-slate-900 leading-tight mt-0.5">
              {activePatient.hospital} Network
            </p>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xs font-medium text-emerald-700">
                Live EHR Telemetry Active
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================
          REAL-TIME HEALTH TELEMETRY HUB (FIRESTORE LIVE SYNC)
          ======================================================== */}
      <RealtimeTelemetryHub />

      {/* ========================================================
          MAIN 2x2 GRID (Pixel Match to Image 6)
          Row 1: HEALTH STATUS (Left) | NEXT APPOINTMENT (Right)
          Row 2: Medicine Schedule (Left) | CURRENT HOSPITAL (Right)
          ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* ----------------------------------------------------
            CARD 1: HEALTH STATUS
            ---------------------------------------------------- */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-4">
          {/* Card Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <div>
                <h3 className="text-xs font-bold tracking-wider uppercase text-slate-500">
                  Health Status
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Last updated: {activePatient.vitals.lastUpdated}
                </p>
              </div>
            </div>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Stable
            </span>
          </div>

          {/* ECG Lead II Animated Trace */}
          <div>
            <EcgLeadVisual heartRate={activePatient.vitals.heartRate} />
          </div>

          {/* 4 Vitals Badges in a Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
            {/* Heart Rate */}
            <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-100">
              <span className="text-[11px] font-medium text-slate-500">Heart Rate</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-extrabold text-slate-900 font-mono tabular-nums">
                  {activePatient.vitals.heartRate}
                </span>
                <span className="text-xs text-slate-400 font-medium">bpm</span>
              </div>
              <p className="text-[11px] font-medium text-emerald-600 mt-1 flex items-center gap-1">
                <span>✓</span> Resting optimal
              </p>
            </div>

            {/* Blood Pressure */}
            <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-100">
              <span className="text-[11px] font-medium text-slate-500">Blood Pressure</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-xl sm:text-2xl font-extrabold text-slate-900 font-mono tabular-nums">
                  {activePatient.vitals.systolicBP}/{activePatient.vitals.diastolicBP}
                </span>
                <span className="text-[10px] text-slate-400 font-medium">mmHg</span>
              </div>
              <p className="text-[11px] font-medium text-emerald-600 mt-1 flex items-center gap-1">
                <span>✓</span> Normotensive
              </p>
            </div>

            {/* Oxygen (SpO2) */}
            <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-100">
              <span className="text-[11px] font-medium text-slate-500">Oxygen (SpO2)</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-extrabold text-slate-900 font-mono tabular-nums">
                  {activePatient.vitals.spo2}
                </span>
                <span className="text-xs text-slate-400 font-medium">%</span>
              </div>
              <p className="text-[11px] font-medium text-emerald-600 mt-1 flex items-center gap-1">
                <span>✓</span> Ambient Air
              </p>
            </div>

            {/* Body Temp */}
            <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-100">
              <span className="text-[11px] font-medium text-slate-500">Body Temp</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-extrabold text-slate-900 font-mono tabular-nums">
                  {activePatient.vitals.bodyTemp}
                </span>
                <span className="text-xs text-slate-400 font-medium">°F</span>
              </div>
              <p className="text-[11px] font-medium text-emerald-600 mt-1 flex items-center gap-1">
                <span>✓</span> Afebrile
              </p>
            </div>
          </div>

          {/* Clinical Disclaimer */}
          <div className="flex items-start gap-2 pt-2 text-[11px] text-slate-500 leading-relaxed border-t border-slate-100">
            <span className="text-slate-400 text-xs">ⓘ</span>
            <span>
              <strong>Clinical Disclaimer:</strong> This status is based on recent telemetry and clinician notes and is provided for informational tracking, not as a definitive medical diagnosis.
            </span>
          </div>
        </div>

        {/* ----------------------------------------------------
            CARD 2: NEXT APPOINTMENT
            ---------------------------------------------------- */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <h3 className="text-xs font-bold tracking-wider uppercase text-slate-500">
                  Next Appointment
                </h3>
              </div>

              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-[#e0f2fe] text-[#0369a1] border border-[#bae6fd]">
                {nextAppt ? nextAppt.relativeDays : 'In 11 Days'}
              </span>
            </div>

            {/* Doctor Profile Banner */}
            <div className="flex items-center gap-4 bg-slate-50/80 p-4 rounded-xl border border-slate-100 mt-4">
              <div className="w-12 h-12 rounded-xl bg-[#0077b6] text-white flex items-center justify-center text-lg font-bold shadow-xs">
                {/* Doctor Icon */}
                <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2a5 5 0 105 5 5 5 0 00-5-5zm0 12c-4.42 0-8 2.24-8 5v1h16v-1c0-2.76-3.58-5-8-5z" />
                </svg>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-1.5">
                  <h4 className="text-base font-bold text-slate-900">
                    {nextAppt ? nextAppt.doctorName : 'Dr. Anjali Rao'}
                  </h4>
                  <span className="w-4 h-4 rounded-full bg-sky-500 text-white flex items-center justify-center text-[10px] font-bold">
                    ✓
                  </span>
                </div>
                <p className="text-xs font-semibold text-slate-600">
                  {nextAppt ? nextAppt.doctorSpecialty : 'General Medicine'}
                </p>
                <p className="text-[11px] text-slate-400">
                  Consultant Physician • OPD Consultation
                </p>
              </div>
            </div>

            {/* Scheduled Date & Hospital Details Grid */}
            <div className="grid grid-cols-2 gap-4 pt-4 px-1">
              <div>
                <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                  Scheduled Date & Time
                </span>
                <p className="text-sm font-bold text-slate-900 mt-1">
                  {nextAppt ? nextAppt.date : '15 October'}
                </p>
                <p className="text-xs font-semibold text-[#0077b6]">
                  {nextAppt ? nextAppt.time : '10:30 AM'}
                </p>
              </div>

              <div>
                <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                  Hospital & Ward
                </span>
                <p className="text-sm font-bold text-slate-900 mt-1">
                  {nextAppt ? nextAppt.hospitalName : 'ABC Hospital'}
                </p>
                <p className="text-xs text-slate-500">
                  {nextAppt ? nextAppt.wardRoom : 'OPD Block B, Room 204'}
                </p>
              </div>
            </div>
          </div>

          {/* Action Button Row */}
          <div className="flex items-center gap-2 pt-2">
            <button
              onClick={() => setSelectedAppointmentId(nextAppt ? nextAppt.id : 'appt-1')}
              className="flex-1 py-2.5 px-4 rounded-xl bg-[#0077b6] hover:bg-[#005d90] text-white text-xs font-semibold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>View Appointment</span>
              <span>→</span>
            </button>

            <button
              onClick={() => setIsBookDoctorOpen(true)}
              className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
              title="Add / Book New Appointment"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </button>

            <button
              onClick={() => onNavigateTab('Hospitals & Blood Bank')}
              className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
              title="Hospital Map & Directions"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* ----------------------------------------------------
            CARD 3: MEDICINE SCHEDULE
            ---------------------------------------------------- */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-4">
          {/* Header with Progress */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <h3 className="text-sm font-bold text-slate-900">Medicine Schedule</h3>
              <span className="text-[10px] font-bold text-[#0077b6] bg-sky-50 px-2 py-0.5 rounded-full border border-sky-200">
                TODAY
              </span>
            </div>

            {/* Progress counter & bar */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium font-mono">
                {takenMeds} of {totalMeds} taken
              </span>
              <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
              <span className="text-xs font-semibold text-slate-700 font-mono">
                {progressPercent}%
              </span>
            </div>
          </div>

          {/* Schedule Item Rows */}
          <div className="space-y-2.5">
            {medicationSchedule.map((med) => (
              <div
                key={med.id}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50/70 hover:bg-slate-100/60 border border-slate-100 transition-colors"
              >
                {/* Time slot column */}
                <div className="w-24 shrink-0">
                  <span className="text-xs font-bold text-slate-900 block font-mono">
                    {med.timeSlot}
                  </span>
                  <span className="text-[11px] text-slate-400 block">
                    {med.periodLabel}
                  </span>
                </div>

                {/* Medicine info column */}
                <div className="flex-1 px-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">
                      {med.name}
                    </span>
                    <span className="text-[10px] font-semibold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-100">
                      {med.relationToFood}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 truncate mt-0.5">
                    {med.details}
                  </p>
                </div>

                {/* Taken Status / Action Button */}
                <div className="shrink-0">
                  {med.taken ? (
                    <button
                      onClick={() => toggleMedicationTaken(med.id)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100/70 transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <span className="text-xs">✓</span>
                      <span>Taken</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => toggleMedicationTaken(med.id)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#0077b6] hover:bg-[#005d90] text-white transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer"
                    >
                      <span className="w-2 h-2 rounded-full border border-white"></span>
                      <span>Mark as Taken</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Footer note & link */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-400">
            <span className="text-[11px]">
              * Automatic dosage notifications synchronized via SMS and app
            </span>
            <button
              onClick={() => onNavigateTab('Hospital')}
              className="text-[#0077b6] hover:text-[#005d90] font-semibold text-xs transition-colors flex items-center gap-1"
            >
              <span>Explore Hospital Pharmacy & Directives</span>
              <span>→</span>
            </button>
          </div>
        </div>

        {/* ----------------------------------------------------
            CARD 4: CURRENT HOSPITAL (Inpatient / Outpatient)
            ---------------------------------------------------- */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            {/* Header with Simulate Outpatient Toggle */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <h3 className="text-xs font-bold tracking-wider uppercase text-slate-500">
                  Current Hospital
                </h3>
              </div>

              {/* Exact Toggle Button from Image 6 */}
              <button
                onClick={toggleAdmittedStatus}
                className="px-2.5 py-1 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer"
                title="Toggle between Inpatient status and Outpatient status"
              >
                <span>⇄</span>
                <span>{activePatient.isAdmitted ? 'Simulate Outpatient' : 'Simulate Inpatient'}</span>
              </button>
            </div>

            {activePatient.isAdmitted ? (
              /* Inpatient Layout (Matching Image 6) */
              <div className="space-y-4 mt-4">
                {/* Station Tag & Admission Badge */}
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Facility Inpatient Station
                  </span>

                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#fee2e2] text-[#991b1b] border border-[#fecaca]">
                    <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
                    Currently Admitted
                  </span>
                </div>

                {/* Facility Name & Wing */}
                <div>
                  <h4 className="text-xl font-bold text-slate-900">
                    {activePatient.hospital}
                  </h4>
                  <p className="text-xs text-slate-500">
                    Main Facility • Critical Care Wing
                  </p>
                </div>

                {/* Assigned Unit & Bed Station Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-100">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                      Assigned Unit
                    </span>
                    <p className="text-sm font-bold text-slate-900 mt-0.5">
                      {activePatient.assignedWard}
                    </p>
                  </div>

                  <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-100">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                      Bed Station
                    </span>
                    <p className="text-sm font-bold text-slate-900 mt-0.5 font-mono">
                      {activePatient.assignedBed}
                    </p>
                  </div>
                </div>

                {/* Admission Date & Broadcast Info */}
                <div className="flex items-center justify-between text-xs py-1">
                  <span className="text-slate-400">Admission Date</span>
                  <span className="font-bold text-slate-800">{activePatient.admissionDate}</span>
                </div>

                <div className="flex items-center gap-2 text-xs text-sky-800 bg-sky-50/70 p-2.5 rounded-lg border border-sky-100">
                  <span className="text-sm">📡</span>
                  <span className="text-[11px] font-medium leading-tight">
                    Continuous cardiac telemetry linked to ICU nursing desk
                  </span>
                </div>
              </div>
            ) : (
              /* Outpatient Layout */
              <div className="p-6 text-center space-y-2 mt-4 bg-slate-50/60 rounded-xl border border-dashed border-slate-200">
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto text-base font-bold">
                  ✓
                </div>
                <h4 className="text-sm font-bold text-slate-900">You are currently not admitted</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Outpatient status active. All historical discharge summaries and ambulatory vitals are logged in your Medi ID record.
                </p>
              </div>
            )}
          </div>

          {/* Contact Hospital Desk Button */}
          <div className="pt-2">
            <button
              onClick={handleContactDesk}
              disabled={isCallingDesk}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-50 hover:bg-slate-100/90 text-slate-800 text-xs font-semibold border border-slate-200/90 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>🎧</span>
              <span>{isCallingDesk ? 'Connecting to ICU Desk...' : 'Contact Hospital Attending Desk'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* In-Dashboard Quick Medical Search (Organ, Blood, Hospital, Doctor) */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <span className="text-xl">🔍</span>
          <div>
            <span className="text-xs font-bold text-slate-800 block">Dashboard Medical Grid Lookup</span>
            <span className="text-[11px] text-slate-400">Search available Blood units, Organs, Hospitals, or Doctors</span>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => onNavigateTab('Hospital')}
            className="flex-1 sm:flex-initial px-3.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl border border-rose-200 transition-colors"
          >
            🩸 Find Blood (B+ Match)
          </button>
          <button
            onClick={() => onNavigateTab('Hospital')}
            className="flex-1 sm:flex-initial px-3.5 py-1.5 bg-sky-50 hover:bg-sky-100 text-[#0077b6] font-bold text-xs rounded-xl border border-sky-200 transition-colors"
          >
            🫀 Search Organs
          </button>
          <button
            onClick={() => onNavigateTab('Hospital')}
            className="flex-1 sm:flex-initial px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-colors"
          >
            🏥 Hospital Admissions
          </button>
        </div>
      </div>

      {/* ========================================================
          BOTTOM: QUICK ACTIONS (Exact 5 Cards from Image 6)
          ======================================================== */}
      <div className="pt-2 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* 4-square grid icon */}
            <svg className="w-5 h-5 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            <h2 className="text-base font-bold text-slate-900 font-['Plus_Jakarta_Sans']">
              Quick Actions
            </h2>
          </div>

          <span className="text-xs text-slate-400">
            Direct hospital services & clinical access
          </span>
        </div>

        {/* 5 Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          
          {/* Action 1: Book Doctor */}
          <div
            onClick={() => setIsBookDoctorOpen(true)}
            className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs hover:border-[#0077b6] hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center text-lg mb-3 group-hover:bg-[#0077b6] group-hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <h4 className="text-sm font-bold text-slate-900">Book Doctor</h4>
            <p className="text-[11px] text-slate-500 mt-1 leading-snug">
              Schedule in-person or tele-consultation
            </p>
          </div>

          {/* Action 2: Find Hospital */}
          <div
            onClick={() => onNavigateTab('Hospital')}
            className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs hover:border-[#0077b6] hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-700 flex items-center justify-center text-lg mb-3 group-hover:bg-cyan-600 group-hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h4 className="text-sm font-bold text-slate-900">Find Hospital</h4>
            <p className="text-[11px] text-slate-500 mt-1 leading-snug">
              Emergency trauma centers & affiliated clinics
            </p>
          </div>

          {/* Action 3: View Prescription */}
          <div
            onClick={() => onNavigateTab('Details of Patient')}
            className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs hover:border-[#0077b6] hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center text-lg mb-3 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h4 className="text-sm font-bold text-slate-900">Details & Allergies</h4>
            <p className="text-[11px] text-slate-500 mt-1 leading-snug">
              Biological data, side effects & directives
            </p>
          </div>

          {/* Action 4: View Medical History */}
          <div
            onClick={() => onNavigateTab('Medical History')}
            className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs hover:border-[#0077b6] hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center text-lg mb-3 group-hover:bg-sky-600 group-hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h4 className="text-sm font-bold text-slate-900">View Medical History</h4>
            <p className="text-[11px] text-slate-500 mt-1 leading-snug">
              Past lab tests, radiology scans & diagnoses
            </p>
          </div>

          {/* Action 5: Find Blood */}
          <div
            onClick={() => onNavigateTab('Hospital')}
            className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs hover:border-[#0077b6] hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center text-lg mb-3 group-hover:bg-rose-600 group-hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
            <div className="flex items-center gap-1.5">
              <h4 className="text-sm font-bold text-slate-900">Find Blood</h4>
              <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-1 rounded">B+ Match</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1 leading-snug">
              Live regional blood bank reserves (B+ match)
            </p>
          </div>

        </div>
      </div>

      {/* ========================================================
          FOOTER (Exact Matching Text from Image 6)
          ======================================================== */}
      <footer className="pt-8 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between text-xs text-slate-400 gap-3">
        <div className="flex items-center gap-2">
          <strong className="text-slate-700 font-semibold">medi-core</strong>
          <span>•</span>
          <span>Universal Health Network EHR Architecture</span>
          <span>•</span>
          <span>HIPAA / HL7 FHIR v4 Compliant</span>
        </div>

        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-slate-600 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            Telemetry Sync: Normal
          </span>
          <button onClick={() => addNotification('Privacy Shield: All health telemetry end-to-end encrypted under HIPAA standards.', 'info')} className="hover:text-slate-700">Privacy Shield</button>
          <button onClick={onOpenAuditLedger} className="hover:text-[#0077b6] font-semibold text-slate-600">Audit Ledger</button>
          <button onClick={() => addNotification('Emergency Protocol: Trauma code 108 activated on regional nodes.', 'alert')} className="hover:text-rose-700">Emergency Protocol</button>
        </div>
      </footer>

      {/* Modals */}
      <AppointmentDetailsModal
        isOpen={Boolean(selectedAppointmentId)}
        appointment={nextAppt}
        onClose={() => setSelectedAppointmentId(null)}
        onReschedule={() => {
          setSelectedAppointmentId(null);
          setIsBookDoctorOpen(true);
        }}
      />

      <BookDoctorModal
        isOpen={isBookDoctorOpen}
        onClose={() => setIsBookDoctorOpen(false)}
      />
    </div>
  );
};
