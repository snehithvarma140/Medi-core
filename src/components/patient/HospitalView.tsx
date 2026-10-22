import React, { useState } from 'react';
import { useHealthcare } from '../../context/HealthcareContext';
import { BloodGroup } from '../../types/healthcare';

export const HospitalView: React.FC = () => {
  const {
    hospitalFacilities,
    bloodReserves,
    organDonorListings,
    activePatient,
    bookAppointment,
    addNotification,
  } = useHealthcare();

  // Location / Place selector at top of Hospital section (As explicitly requested by user)
  const [selectedPlace, setSelectedPlace] = useState<string>('All Locations');

  const [activeTab, setActiveTab] = useState<'admissions' | 'doctors' | 'facilities' | 'resources'>('admissions');

  // Admission & Room Booking form state
  const [selectedHospital, setSelectedHospital] = useState(hospitalFacilities[0].name);
  const [selectedWardType, setSelectedWardType] = useState('Private Deluxe Room');
  const [admissionReason, setAdmissionReason] = useState('Planned inpatient evaluation & glycemic observation');
  const [admissionDate, setAdmissionDate] = useState('2026-10-12');
  const [roomBookedSuccess, setRoomBookedSuccess] = useState(false);

  // Doctor booking filter
  const [doctorSpecialtyFilter, setDoctorSpecialtyFilter] = useState('All');

  // Organ & Blood Search state
  const [resourceQuery, setResourceQuery] = useState('');

  // EXPANDED DOCTORS LIST (10+ DOCTORS ACROSS SPECIALTIES AND LOCATIONS)
  const doctorsAvailability = [
    {
      id: 'doc-1',
      name: 'Dr. Anjali Rao',
      specialty: 'General Medicine & Cardiology',
      hospital: 'ABC Hospital Network',
      region: 'Metro City Central',
      room: 'OPD Block B, Room 204',
      experience: '14 yrs exp',
      rating: 4.9,
      status: 'FREE NOW',
      nextSlot: 'Today, 04:00 PM',
      workingHours: 'Mon - Fri: 09:00 AM – 01:00 PM & 04:00 PM – 07:00 PM',
      slots: ['04:00 PM', '04:30 PM', '05:00 PM', '05:30 PM'],
    },
    {
      id: 'doc-2',
      name: 'Dr. Vikram Seth',
      specialty: 'Interventional Cardiology',
      hospital: 'ABC Hospital Network',
      region: 'Metro City Central',
      room: 'Cardiology Center, Room 102',
      experience: '18 yrs exp',
      rating: 4.8,
      status: 'FREE NOW',
      nextSlot: 'Today, 04:30 PM',
      workingHours: 'Mon, Wed, Fri: 10:00 AM – 06:00 PM',
      slots: ['04:30 PM', '05:15 PM', '06:00 PM'],
    },
    {
      id: 'doc-3',
      name: 'Dr. Sandhya Nair',
      specialty: 'Endocrinology & Diabetes',
      hospital: 'XYZ Superspeciality Hospital',
      region: 'North Tech Corridor',
      room: 'Consultation Suite 4',
      experience: '11 yrs exp',
      rating: 4.9,
      status: 'IN SURGERY / BUSY',
      nextSlot: 'Tomorrow, 10:00 AM',
      workingHours: 'Tue, Thu, Sat: 09:30 AM – 02:00 PM',
      slots: ['10:00 AM', '11:00 AM', '12:00 PM'],
    },
    {
      id: 'doc-4',
      name: 'Dr. Rajesh Deshmukh',
      specialty: 'Orthopedics & Spine Trauma',
      hospital: 'Fortis Trauma & Orthopedic Center',
      region: 'South Medical Hub',
      room: 'Orthopedics Clinic 2',
      experience: '16 yrs exp',
      rating: 4.7,
      status: 'FREE NOW',
      nextSlot: 'Today, 05:00 PM',
      workingHours: 'Mon - Sat: 02:00 PM – 07:00 PM',
      slots: ['05:00 PM', '05:45 PM', '06:30 PM'],
    },
    {
      id: 'doc-5',
      name: 'Dr. Priya Nambiar',
      specialty: 'Neurology & Stroke Care',
      hospital: 'ABC Hospital Network',
      region: 'Metro City Central',
      room: 'Neurosciences Block, Room 301',
      experience: '15 yrs exp',
      rating: 4.9,
      status: 'FREE NOW',
      nextSlot: 'Today, 03:30 PM',
      workingHours: 'Mon - Fri: 10:00 AM – 04:00 PM',
      slots: ['03:30 PM', '04:15 PM', '05:00 PM'],
    },
    {
      id: 'doc-6',
      name: 'Dr. Amitav Ghosh',
      specialty: 'General & Laparoscopic Surgery',
      hospital: 'Apollo Metro Care Institute',
      region: 'South Medical Hub',
      room: 'Surgical OPD Room 12',
      experience: '22 yrs exp',
      rating: 4.9,
      status: 'IN OPD',
      nextSlot: 'Today, 05:30 PM',
      workingHours: 'Mon, Wed, Fri: 03:00 PM – 08:00 PM',
      slots: ['05:30 PM', '06:15 PM', '07:00 PM'],
    },
    {
      id: 'doc-7',
      name: 'Dr. Sunita Kulkarni',
      specialty: 'Nephrology & Renal Transplant',
      hospital: 'Apollo Metro Care Institute',
      region: 'South Medical Hub',
      room: 'Dialysis Center OPD 1',
      experience: '13 yrs exp',
      rating: 4.8,
      status: 'FREE NOW',
      nextSlot: 'Today, 04:00 PM',
      workingHours: 'Tue, Thu, Sat: 11:00 AM – 05:00 PM',
      slots: ['04:00 PM', '04:45 PM', '05:30 PM'],
    },
    {
      id: 'doc-8',
      name: 'Dr. Farhan Akhtar',
      specialty: 'Gastroenterology & Endoscopy',
      hospital: 'St. Jude Apex Healthcare',
      region: 'East Bay Biomedical',
      room: 'Digestive Health Suite 2',
      experience: '12 yrs exp',
      rating: 4.8,
      status: 'FREE NOW',
      nextSlot: 'Today, 03:00 PM',
      workingHours: 'Mon - Fri: 09:00 AM – 03:30 PM',
      slots: ['03:00 PM', '03:45 PM', '04:30 PM'],
    },
    {
      id: 'doc-9',
      name: 'Dr. Meenakshi Sundaram',
      specialty: 'Pulmonology & Sleep Medicine',
      hospital: 'XYZ Superspeciality Hospital',
      region: 'North Tech Corridor',
      room: 'Respiratory Care Unit 3',
      experience: '10 yrs exp',
      rating: 4.7,
      status: 'FREE NOW',
      nextSlot: 'Tomorrow, 09:30 AM',
      workingHours: 'Mon - Fri: 08:30 AM – 01:30 PM',
      slots: ['09:30 AM', '10:15 AM', '11:00 AM'],
    },
    {
      id: 'doc-10',
      name: 'Dr. Evelyn Vance',
      specialty: 'Corneal & Eye Surgery',
      hospital: 'Max Life Institute of Sciences',
      region: 'West Coast Healthcare Zone',
      room: 'Ophthalmic Laser Suite',
      experience: '17 yrs exp',
      rating: 4.9,
      status: 'FREE NOW',
      nextSlot: 'Today, 04:30 PM',
      workingHours: 'Mon - Sat: 10:00 AM – 06:00 PM',
      slots: ['04:30 PM', '05:15 PM', '06:00 PM'],
    },
    {
      id: 'doc-11',
      name: 'Dr. Rohan Kulkarni',
      specialty: 'Medical Oncology & Chemotherapy',
      hospital: 'Mercy General Academic Medical Center',
      region: 'Metro City Central',
      room: 'Oncology Care Tower, Room 502',
      experience: '19 yrs exp',
      rating: 4.9,
      status: 'FREE NOW',
      nextSlot: 'Today, 03:00 PM',
      workingHours: 'Mon - Fri: 09:00 AM – 04:00 PM',
      slots: ['03:00 PM', '03:45 PM', '04:30 PM'],
    },
    {
      id: 'doc-12',
      name: 'Dr. Alisha Patel',
      specialty: 'Pediatrics & Neonatal Care',
      hospital: 'Valley Women & Children Specialty Hospital',
      region: 'North Tech Corridor',
      room: 'Pediatrics Suite 101',
      experience: '13 yrs exp',
      rating: 4.8,
      status: 'IN OPD',
      nextSlot: 'Today, 05:00 PM',
      workingHours: 'Mon - Sat: 10:00 AM – 06:00 PM',
      slots: ['05:00 PM', '05:30 PM', '06:00 PM'],
    },
    {
      id: 'doc-13',
      name: 'Dr. David Zhang',
      specialty: 'Plastic & Burn Reconstructive Surgery',
      hospital: 'Pacific Coast Trauma & Burn Institute',
      region: 'West Coast Healthcare Zone',
      room: 'Reconstruction Wing B',
      experience: '20 yrs exp',
      rating: 4.9,
      status: 'FREE NOW',
      nextSlot: 'Tomorrow, 10:00 AM',
      workingHours: 'Tue, Thu, Sat: 09:00 AM – 02:00 PM',
      slots: ['10:00 AM', '11:00 AM', '12:00 PM'],
    },
    {
      id: 'doc-14',
      name: 'Dr. Sanjay Kaul',
      specialty: 'Cardiothoracic Surgery',
      hospital: 'ABC Hospital Network',
      region: 'Metro City Central',
      room: 'Cardiothoracic OPD 1',
      experience: '24 yrs exp',
      rating: 5.0,
      status: 'IN SURGERY / BUSY',
      nextSlot: 'Tomorrow, 02:30 PM',
      workingHours: 'Mon, Wed, Fri: 02:00 PM – 06:00 PM',
      slots: ['02:30 PM', '03:15 PM', '04:00 PM'],
    },
    {
      id: 'doc-15',
      name: 'Dr. Fatima Zahra',
      specialty: 'Dermatology & Allergy Care',
      hospital: 'Suburban Memorial Community Hospital',
      region: 'East Bay Biomedical',
      room: 'Skin & Allergy Clinic 3',
      experience: '12 yrs exp',
      rating: 4.7,
      status: 'FREE NOW',
      nextSlot: 'Today, 04:00 PM',
      workingHours: 'Mon - Fri: 11:00 AM – 05:00 PM',
      slots: ['04:00 PM', '04:30 PM', '05:00 PM'],
    },
    {
      id: 'doc-16',
      name: 'Dr. Arvind Swaminathan',
      specialty: 'ENT & Otolaryngology',
      hospital: 'Global Care Regional Hospital',
      region: 'North Tech Corridor',
      room: 'ENT Suite 2',
      experience: '15 yrs exp',
      rating: 4.8,
      status: 'FREE NOW',
      nextSlot: 'Today, 03:30 PM',
      workingHours: 'Mon - Sat: 09:30 AM – 03:30 PM',
      slots: ['03:30 PM', '04:15 PM', '05:00 PM'],
    },
    {
      id: 'doc-17',
      name: 'Dr. Katherine Cole',
      specialty: 'Hematology & Bone Marrow Transplant',
      hospital: 'Max Life Institute of Sciences',
      region: 'West Coast Healthcare Zone',
      room: 'Cellular Therapy Wing 4',
      experience: '18 yrs exp',
      rating: 4.9,
      status: 'FREE NOW',
      nextSlot: 'Today, 05:30 PM',
      workingHours: 'Mon - Fri: 01:00 PM – 06:00 PM',
      slots: ['05:30 PM', '06:15 PM'],
    },
  ];

  // Filter hospitals by selected location / place
  const filteredHospitals = selectedPlace === 'All Locations'
    ? hospitalFacilities
    : hospitalFacilities.filter((h) => h.region === selectedPlace);

  // Filter doctors by location and specialty
  const filteredDoctors = doctorsAvailability.filter((doc) => {
    const matchesPlace = selectedPlace === 'All Locations' || doc.region === selectedPlace;
    const matchesSpecialty = doctorSpecialtyFilter === 'All' || doc.specialty.includes(doctorSpecialtyFilter);
    return matchesPlace && matchesSpecialty;
  });

  const handleRoomBooking = (e: React.FormEvent) => {
    e.preventDefault();
    setRoomBookedSuccess(true);
    addNotification(`Admission request confirmed for ${selectedWardType} at ${selectedHospital} for ${admissionDate}.`, 'alert');
    setTimeout(() => setRoomBookedSuccess(false), 4000);
  };

  const handleBookDoctorSlot = (doc: any, slot: string) => {
    bookAppointment({
      patientMediId: activePatient.mediId,
      patientName: activePatient.name,
      doctorName: doc.name,
      doctorSpecialty: doc.specialty,
      date: 'Today',
      time: slot,
      hospitalName: doc.hospital,
      wardRoom: doc.room,
      reason: 'Outpatient clinical consultation & evaluation',
    });
    addNotification(`Appointment booked with ${doc.name} at ${slot}`, 'appointment');
  };

  return (
    <div className="space-y-6 pb-12 font-['Inter']">
      
      {/* Top Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono tracking-wider uppercase text-sky-800 font-semibold bg-sky-50 px-2.5 py-1 rounded-md border border-sky-200">
            Universal Hospital & Regional Clinical Grid
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-['Plus_Jakarta_Sans'] mt-2">
            Hospitals, Admissions & Medical Grid
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Book hospital admissions across accredited facilities, track doctor availability, examine hospital amenities, and locate organs & blood units.
          </p>
        </div>

        {/* Sub-navigation tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-semibold overflow-x-auto">
          <button
            onClick={() => setActiveTab('admissions')}
            className={`px-3.5 py-2 rounded-lg transition-all whitespace-nowrap ${
              activeTab === 'admissions' ? 'bg-white text-[#005d90] shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🛏️ Hospital Admission
          </button>
          <button
            onClick={() => setActiveTab('doctors')}
            className={`px-3.5 py-2 rounded-lg transition-all whitespace-nowrap ${
              activeTab === 'doctors' ? 'bg-white text-[#005d90] shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            👨‍⚕️ Doctor Availability
          </button>
          <button
            onClick={() => setActiveTab('facilities')}
            className={`px-3.5 py-2 rounded-lg transition-all whitespace-nowrap ${
              activeTab === 'facilities' ? 'bg-white text-[#005d90] shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🏥 Facilities & Services
          </button>
          <button
            onClick={() => setActiveTab('resources')}
            className={`px-3.5 py-2 rounded-lg transition-all whitespace-nowrap ${
              activeTab === 'resources' ? 'bg-white text-rose-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🩸 Organ & Blood Grid
          </button>
        </div>
      </div>

      {/* ========================================================
          LOCATION / PLACE SELECTOR (As requested: "we have to be able to select place at enter of this main section as 'Hospital'")
          ======================================================== */}
      <div className="bg-gradient-to-r from-sky-50 via-white to-slate-50 p-4 sm:p-5 rounded-3xl border border-sky-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#0077b6] text-white flex items-center justify-center text-lg font-bold shadow-xs">
            📍
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-sky-700 font-bold">
              Regional Grid Filtering
            </span>
            <h3 className="text-sm sm:text-base font-bold text-slate-900">
              Select City / Healthcare Region
            </h3>
            <p className="text-xs text-slate-500">
              Filtering hospital centers, available specialist doctors, and live emergency inventories.
            </p>
          </div>
        </div>

        {/* Place Buttons */}
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            'All Locations',
            'Metro City Central',
            'South Medical Hub',
            'North Tech Corridor',
            'East Bay Biomedical',
            'West Coast Healthcare Zone',
          ].map((place) => (
            <button
              key={place}
              onClick={() => setSelectedPlace(place)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedPlace === place
                  ? 'bg-[#0077b6] text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {place}
            </button>
          ))}
        </div>
      </div>

      {/* ========================================================
          TAB 1: HOSPITAL ADMISSIONS & ROOM BOOKING
          ======================================================== */}
      {activeTab === 'admissions' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Booking Form (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-5">
            <div>
              <span className="text-xs font-mono font-bold text-[#0077b6] uppercase">
                Inpatient Admission Booking Engine
              </span>
              <h2 className="text-xl font-bold text-slate-900 mt-1">
                Book a Hospital Room or Ward
              </h2>
              <p className="text-xs text-slate-500">
                Choose any affiliated hospital in <span className="font-bold text-slate-800">{selectedPlace}</span> and reserve your bed with FHIR verification.
              </p>
            </div>

            {roomBookedSuccess && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-xs text-emerald-900 animate-in fade-in">
                <span className="text-lg font-bold">✓</span>
                <div>
                  <strong className="block font-bold">Inpatient Reservation Dispatched!</strong>
                  <span>Your admission reservation has been confirmed at {selectedHospital} for {admissionDate}. Nursing desk alerted.</span>
                </div>
              </div>
            )}

            <form onSubmit={handleRoomBooking} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Select Hospital Facility ({filteredHospitals.length} in {selectedPlace})
                </label>
                <select
                  value={selectedHospital}
                  onChange={(e) => setSelectedHospital(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs font-semibold border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-[#0077b6]"
                >
                  {filteredHospitals.map((h) => (
                    <option key={h.id} value={h.name}>
                      {h.name} ({h.region} • {h.availableBeds} beds available)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Room / Ward Type
                  </label>
                  <select
                    value={selectedWardType}
                    onChange={(e) => setSelectedWardType(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs font-semibold border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-[#0077b6]"
                  >
                    <option value="General Medical Ward">General Medical Ward (Shared, 24/7 Nursing)</option>
                    <option value="Private Deluxe Room">Private Deluxe Suite (Single Patient, Ensuite)</option>
                    <option value="Critical Care ICU">Critical Care ICU (Continuous Cardiac Telemetry)</option>
                    <option value="Daycare Ambulatory Wing">Daycare Ambulatory Wing (Same-day procedure)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Planned Admission Date
                  </label>
                  <input
                    type="date"
                    required
                    value={admissionDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setAdmissionDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs font-semibold border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-[#0077b6]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Admission Purpose / Medical Referral
                </label>
                <textarea
                  rows={3}
                  value={admissionReason}
                  onChange={(e) => setAdmissionReason(e.target.value)}
                  className="w-full p-3 text-xs border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-[#0077b6]"
                  placeholder="Reason for hospitalization, attending physician referral..."
                />
              </div>

              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 flex items-center justify-between">
                <span>Verification: <strong>Zero-Trust EHR Biometric Clearance</strong></span>
                <span className="font-bold text-emerald-700">Pre-Approved for {activePatient.name}</span>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#0077b6] hover:bg-[#005d90] text-white text-xs font-bold rounded-xl shadow-md transition-colors"
              >
                Confirm Hospital Room / Ward Booking
              </button>
            </form>
          </div>

          {/* Right: Hospitals in region (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block px-1">
              Affiliated Hospital Centers ({filteredHospitals.length})
            </span>

            {filteredHospitals.map((hosp) => (
              <div key={hosp.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-sky-700 uppercase">
                      {hosp.region}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 mt-0.5">{hosp.name}</h4>
                    <p className="text-xs text-slate-500">{hosp.location}</p>
                  </div>
                  <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    ★ {hosp.rating}
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-500">Available Beds:</span>
                    <strong className="text-slate-900">{hosp.availableBeds} of {hosp.totalBeds}</strong>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#0077b6]"
                      style={{ width: `${Math.round(((hosp.totalBeds - hosp.availableBeds) / hosp.totalBeds) * 100)}%` }}
                    />
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t text-[10px] text-slate-500">
                  <span className="bg-slate-50 px-2 py-0.5 rounded border">Emergency 24x7: {hosp.emergencyAvailable ? '✓' : '✗'}</span>
                  <span className="bg-slate-50 px-2 py-0.5 rounded border">ICU: {hosp.icuAvailable ? '✓' : '✗'}</span>
                  <span className="bg-slate-50 px-2 py-0.5 rounded border">Blood Bank: {hosp.bloodBankAvailable ? '✓' : '✗'}</span>
                  <span className="bg-slate-50 px-2 py-0.5 rounded border">Ambulance: {hosp.ambulanceAvailable ? '✓' : '✗'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 2: DOCTOR AVAILABILITY & TIMINGS (EXPANDED TO 10+ DOCTORS)
          ======================================================== */}
      {activeTab === 'doctors' && (
        <div className="space-y-4">
          {/* Specialty Filter */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <span className="text-xs font-bold text-slate-500 mr-2 whitespace-nowrap">Filter Specialty:</span>
            {['All', 'Cardiology', 'General Medicine', 'Endocrinology', 'Orthopedics', 'Neurology', 'Surgery', 'Nephrology', 'Gastroenterology', 'Pulmonology'].map((spec) => (
              <button
                key={spec}
                onClick={() => setDoctorSpecialtyFilter(spec)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all whitespace-nowrap ${
                  doctorSpecialtyFilter === spec
                    ? 'bg-[#0077b6] text-white border-[#0077b6]'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {spec}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredDoctors.map((doc) => {
              const isFree = doc.status === 'FREE NOW';
              return (
                <div key={doc.id} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-sky-100 text-[#0077b6] flex items-center justify-center text-xl font-bold shrink-0">
                          👨‍⚕️
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-base font-bold text-slate-900">{doc.name}</h4>
                            <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-1.5 rounded">
                              ★ {doc.rating}
                            </span>
                          </div>
                          <p className="text-xs font-semibold text-slate-600">{doc.specialty}</p>
                          <p className="text-[11px] text-slate-400">{doc.hospital} ({doc.room}) • <strong className="text-slate-600">{doc.region}</strong></p>
                        </div>
                      </div>

                      <span
                        className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider ${
                          isFree
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200 animate-pulse'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}
                      >
                        {doc.status}
                      </span>
                    </div>

                    {/* Working Schedule */}
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs mt-3">
                      <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">
                        Consultation Working Schedule
                      </span>
                      <p className="text-slate-800 font-medium mt-0.5">{doc.workingHours}</p>
                      <p className="text-[#0077b6] font-bold mt-1 text-[11px]">
                        ⚡ Next Available Slot: {doc.nextSlot}
                      </p>
                    </div>
                  </div>

                  {/* Immediate Booking Slots */}
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                      Immediate Booking Slots
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {doc.slots.map((slot) => (
                        <button
                          key={slot}
                          onClick={() => handleBookDoctorSlot(doc, slot)}
                          className="px-3 py-1.5 bg-slate-50 hover:bg-[#0077b6] hover:text-white border border-slate-200 rounded-lg text-xs font-semibold transition-colors"
                        >
                          Book {slot}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 3: HOSPITAL FACILITIES & SERVICES
          ======================================================== */}
      {activeTab === 'facilities' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filteredHospitals.map((hosp) => (
              <div key={hosp.id} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded">
                      {hosp.region}
                    </span>
                    <span className="text-xs text-slate-400">Est. {hosp.establishedYear}</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mt-2">{hosp.name}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">📍 {hosp.location}</p>

                  <div className="space-y-2 mt-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                      Services & Clinical Units
                    </span>
                    <div className="space-y-1.5 text-xs text-slate-700">
                      {hosp.departments.map((dept, i) => (
                        <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-100">
                          <span>✓</span>
                          <span className="font-semibold text-slate-800">{dept}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => addNotification(`Connecting to ${hosp.name} reception: ${hosp.contactNumber}`, 'info')}
                  className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-colors"
                >
                  Contact Desk ({hosp.contactNumber})
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 4: ORGAN & BLOOD SEARCH (With Donors & Organs)
          ======================================================== */}
      {activeTab === 'resources' && (
        <div className="space-y-6">
          {/* Universal Search Bar */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div>
              <span className="text-xs font-mono font-bold text-rose-700 uppercase">
                Regional Organ & Blood Matching Hub
              </span>
              <h3 className="text-xl font-bold text-slate-900 mt-1">
                Search Blood Units, Donors & Transplant Organs
              </h3>
              <p className="text-xs text-slate-500">
                Connected to state organ registries and verified voluntary donor networks. If current hospital stock is low, interconnected organizations provide immediate mutual aid.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2">
              <input
                type="text"
                value={resourceQuery}
                onChange={(e) => setResourceQuery(e.target.value)}
                placeholder="Search blood group (e.g. B+, O-, A+) or organ (Kidney, Liver, Cornea, Heart, Lungs)..."
                className="w-full px-4 py-2.5 text-xs font-semibold border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500"
              />
              <button
                onClick={() => addNotification(`Scanning state registry for "${resourceQuery || 'all'}"...`, 'info')}
                className="w-full sm:w-auto px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors whitespace-nowrap"
              >
                Scan Regional Grid
              </button>
            </div>
          </div>

          {/* Blood Inventory with Specific Donors */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Verified Blood Bank Reserves & Active Donor Registry
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {bloodReserves.map((b) => (
                <div key={b.bloodGroup} className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3">
                  <div className="flex justify-between items-start">
                    <span className="text-3xl font-black font-mono text-slate-900">{b.bloodGroup}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase bg-emerald-50 text-emerald-800">
                      {b.status}
                    </span>
                  </div>

                  <div className="text-xs">
                    <strong className="text-slate-900 font-mono text-2xl">{b.units}</strong>
                    <span className="text-slate-400 ml-1">Units available</span>
                  </div>

                  {/* Donors list preview */}
                  <div className="pt-2 border-t border-slate-100 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Active Registered Donors ({b.donors.length})
                    </span>
                    {b.donors.map((d) => (
                      <div key={d.id} className="text-[11px] text-slate-600 truncate flex items-center justify-between">
                        <span>• {d.donorName}</span>
                        <span className="text-emerald-700 font-bold">{d.unitsContributed}u</span>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => addNotification(`Reservation request generated for 1 Unit of ${b.bloodGroup} blood.`, 'alert')}
                    className="w-full py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl transition-colors"
                  >
                    Reserve Unit
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Interconnected Donor Organs */}
          <div className="space-y-3 pt-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Interconnected Organ Donor Organizations & Active Candidates
            </h4>

            <div className="space-y-3">
              {organDonorListings.map((organItem) => (
                <div key={organItem.id} className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">🫀</span>
                      <h5 className="text-sm font-bold text-slate-900">{organItem.organ}</h5>
                      <span className="text-xs font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-100">
                        {organItem.compatibility}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600">
                      <strong>Registry / Organization:</strong> {organItem.registryOrganization} ({organItem.region})
                    </p>
                    <p className="text-xs text-emerald-700 font-semibold">
                      Status: {organItem.status} ({organItem.affiliatedHospital})
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => addNotification(`Dispatching organ match inquiry to ${organItem.registryOrganization}...`, 'alert')}
                      className="px-4 py-2 bg-[#0077b6] hover:bg-[#005d90] text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
                    >
                      Inquire Match
                    </button>
                    <button
                      onClick={() => addNotification(`Dialing organ transplant hotline: ${organItem.emergencyHotline}`, 'info')}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl"
                    >
                      📞 Urgent Line
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
