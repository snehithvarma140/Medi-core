import React, { useState } from 'react';
import { useHealthcare } from '../../context/HealthcareContext';

interface BookDoctorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BookDoctorModal: React.FC<BookDoctorModalProps> = ({ isOpen, onClose }) => {
  const { bookAppointment, activePatient } = useHealthcare();

  const [selectedSpecialty, setSelectedSpecialty] = useState('All');
  const [selectedDoctor, setSelectedDoctor] = useState('Dr. Anjali Rao');
  const [selectedDate, setSelectedDate] = useState('2026-10-18');
  const [selectedSlot, setSelectedSlot] = useState('11:00 AM');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const doctorsList = [
    {
      name: 'Dr. Anjali Rao',
      specialty: 'General Medicine',
      subspecialty: 'Internal Medicine & Diabetes Care',
      hospital: 'ABC Hospital',
      room: 'OPD Block B, Room 204',
      experience: '14+ yrs exp',
      rating: 4.9,
      slotsToday: ['04:00 PM', '04:30 PM', '05:30 PM'],
      slotsTomorrow: ['10:00 AM', '11:00 AM', '11:30 AM'],
    },
    {
      name: 'Dr. Vikram Seth',
      specialty: 'Cardiology',
      subspecialty: 'Interventional Cardiology & Telemetry',
      hospital: 'ABC Hospital',
      room: 'Cardiology Center, Room 102',
      experience: '18+ yrs exp',
      rating: 4.8,
      slotsToday: ['03:30 PM', '05:00 PM'],
      slotsTomorrow: ['09:30 AM', '10:30 AM', '02:00 PM'],
    },
    {
      name: 'Dr. Sandhya Nair',
      specialty: 'Endocrinology',
      subspecialty: 'Metabolic & Thyroid Specialist',
      hospital: 'XYZ Superspeciality Hospital',
      room: 'Consultation Suite 4',
      experience: '11+ yrs exp',
      rating: 4.9,
      slotsToday: ['02:00 PM', '03:00 PM'],
      slotsTomorrow: ['10:00 AM', '12:00 PM'],
    },
  ];

  const filteredDoctors = selectedSpecialty === 'All'
    ? doctorsList
    : doctorsList.filter((d) => d.specialty === selectedSpecialty);

  const activeDoc = doctorsList.find((d) => d.name === selectedDoctor) || doctorsList[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      bookAppointment({
        patientMediId: activePatient.mediId,
        patientName: activePatient.name,
        doctorName: activeDoc.name,
        doctorSpecialty: activeDoc.specialty,
        date: selectedDate,
        time: selectedSlot,
        hospitalName: activeDoc.hospital,
        wardRoom: activeDoc.room,
        reason: reason || 'Routine clinical consultation & follow-up',
      });
      setIsSubmitting(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-[#0077b6] text-white p-5 flex items-center justify-between">
          <div>
            <span className="text-xs font-mono tracking-wider uppercase text-sky-200">
              Outpatient Booking Engine
            </span>
            <h3 className="text-xl font-bold mt-1">Schedule Doctor Consultation</h3>
          </div>
          <button onClick={onClose} className="text-sky-200 hover:text-white transition-colors text-lg">
            ✕
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Specialty Filter */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Filter by Specialty
            </label>
            <div className="flex flex-wrap gap-1.5">
              {['All', 'General Medicine', 'Cardiology', 'Endocrinology'].map((spec) => (
                <button
                  type="button"
                  key={spec}
                  onClick={() => setSelectedSpecialty(spec)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                    selectedSpecialty === spec
                      ? 'bg-sky-50 border-[#0077b6] text-[#005d90] font-semibold'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {spec}
                </button>
              ))}
            </div>
          </div>

          {/* Doctor Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Select Physician
            </label>
            <div className="space-y-2">
              {filteredDoctors.map((doc) => {
                const isSelected = selectedDoctor === doc.name;
                return (
                  <div
                    key={doc.name}
                    onClick={() => setSelectedDoctor(doc.name)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'border-[#0077b6] bg-sky-50/50 ring-1 ring-[#0077b6]'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-sky-100 text-[#0077b6] flex items-center justify-center font-bold text-sm">
                        👨‍⚕️
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-slate-900">{doc.name}</p>
                          <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 rounded">
                            ★ {doc.rating}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600">{doc.specialty} • {doc.experience}</p>
                        <p className="text-[11px] text-slate-400">{doc.hospital} ({doc.room})</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`w-5 h-5 rounded-full border flex items-center justify-center text-xs ${
                        isSelected ? 'border-[#0077b6] bg-[#0077b6] text-white' : 'border-slate-300'
                      }`}>
                        {isSelected && '✓'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Date & Time Slot Picker */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Consultation Date
              </label>
              <input
                type="date"
                required
                value={selectedDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0077b6]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Available Slots
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {['09:30 AM', '10:30 AM', '11:00 AM', '03:30 PM', '04:30 PM', '05:30 PM'].map((slot) => (
                  <button
                    type="button"
                    key={slot}
                    onClick={() => setSelectedSlot(slot)}
                    className={`py-2 text-xs font-semibold rounded-lg border text-center transition-all ${
                      selectedSlot === slot
                        ? 'bg-[#0077b6] text-white border-[#0077b6]'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Reason / Chief Complaint */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Chief Symptoms / Consultation Purpose
            </label>
            <textarea
              rows={2}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Routine 6-month diabetes follow-up, reviewing recent blood work and prescription refill..."
              className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0077b6]"
            />
          </div>

          {/* Medi ID Note */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
            <div>
              <span className="font-semibold text-slate-800">Booking for Medi ID:</span> {activePatient.mediId}
              <p className="text-[11px] text-slate-400">Allergy records & past visits will be pre-shared with attending doctor.</p>
            </div>
            <span className="font-bold text-[#0077b6]">FHIR v4 Synchronized</span>
          </div>

          {/* Submit */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 text-xs font-semibold text-white bg-[#0077b6] hover:bg-[#005d90] rounded-lg shadow-sm transition-all flex items-center gap-2"
            >
              {isSubmitting ? 'Synchronizing Slot...' : 'Confirm Appointment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
