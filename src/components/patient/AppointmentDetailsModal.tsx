import React, { useState } from 'react';
import { useHealthcare } from '../../context/HealthcareContext';
import { Appointment } from '../../types/healthcare';

interface AppointmentDetailsModalProps {
  isOpen: boolean;
  appointment?: Appointment;
  onClose: () => void;
  onReschedule?: () => void;
}

export const AppointmentDetailsModal: React.FC<AppointmentDetailsModalProps> = ({
  isOpen,
  appointment,
  onClose,
  onReschedule,
}) => {
  const { cancelAppointment } = useHealthcare();
  const [copiedLocation, setCopiedLocation] = useState(false);

  if (!isOpen || !appointment) return null;

  const handleCopyLocation = () => {
    navigator.clipboard?.writeText(`${appointment.hospitalName}, ${appointment.wardRoom}`);
    setCopiedLocation(true);
    setTimeout(() => setCopiedLocation(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-sky-900 text-white p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono tracking-widest text-sky-200 uppercase font-semibold">
              Appointment Encounter Details
            </span>
            <button onClick={onClose} className="text-sky-300 hover:text-white transition-colors">
              ✕
            </button>
          </div>
          <h3 className="text-xl font-bold mt-2">{appointment.doctorName}</h3>
          <p className="text-sm text-sky-200">{appointment.doctorSpecialty} • Consultant Physician</p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Status Chip */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <span className="text-xs text-slate-500">Status</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span className="text-sm font-bold text-slate-900">{appointment.status}</span>
                <span className="text-xs text-slate-400">({appointment.relativeDays})</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-500">Patient Identifier</span>
              <p className="text-xs font-mono font-bold text-sky-800">{appointment.patientMediId}</p>
            </div>
          </div>

          {/* Time & Location Grid */}
          <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Date & Time</span>
              <p className="text-base font-bold text-slate-900 mt-0.5">{appointment.date}</p>
              <p className="text-sm font-semibold text-[#0077b6]">{appointment.time}</p>
            </div>
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Hospital Facility</span>
              <p className="text-sm font-bold text-slate-900 mt-0.5">{appointment.hospitalName}</p>
              <p className="text-xs text-slate-600">{appointment.wardRoom}</p>
              <button
                onClick={handleCopyLocation}
                className="text-[11px] text-sky-700 hover:text-sky-900 font-medium mt-1 flex items-center gap-1"
              >
                {copiedLocation ? '✓ Address Copied' : '📍 Copy Location'}
              </button>
            </div>
          </div>

          {/* Clinical Reason */}
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Clinical Reason / Referral</span>
            <p className="text-sm text-slate-800 mt-1 bg-white p-3 rounded-lg border border-slate-200 leading-relaxed">
              {appointment.reason || 'Bi-annual longitudinal follow-up, continuous telemetry review, and prescription adjustment.'}
            </p>
          </div>

          {/* Preparation Instructions */}
          <div className="bg-amber-50/70 border border-amber-200/80 p-3 rounded-xl text-xs text-amber-900 space-y-1">
            <p className="font-semibold flex items-center gap-1.5">
              <span>⚠️</span> Patient Preparation Directive
            </p>
            <p className="text-amber-800 leading-snug">
              Please maintain 8 hours overnight fasting for routine fasting blood glucose profiling. Bring your active Medi ID card or barcode for express check-in.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
          <button
            onClick={() => {
              cancelAppointment(appointment.id);
              onClose();
            }}
            className="px-3.5 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            Cancel Appointment
          </button>
          <div className="flex items-center gap-2">
            {onReschedule && (
              <button
                onClick={onReschedule}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200/70 bg-white border border-slate-200 rounded-lg transition-colors"
              >
                Reschedule
              </button>
            )}
            <button
              onClick={onClose}
              className="px-5 py-2 text-xs font-semibold text-white bg-[#0077b6] hover:bg-[#005d90] rounded-lg transition-colors shadow-xs"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
