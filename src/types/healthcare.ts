export type UserRole = 'PATIENT' | 'DOCTOR' | 'HOSPITAL_ADMIN' | 'EMERGENCY_STAFF';

export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-' | 'UNKNOWN';

export interface Vitals {
  heartRate: number; // bpm
  systolicBP: number; // mmHg
  diastolicBP: number; // mmHg
  spo2: number; // %
  bodyTemp: number; // °F
  respiratoryRate?: number;
  lastUpdated: string;
}

export interface BpRecord {
  id: string;
  date: string;
  systolic: number;
  diastolic: number;
  pulse: number;
  status: 'OPTIMAL' | 'NORMAL' | 'PRE-HYPERTENSION' | 'STAGE 1';
  notes: string;
  clinician: string;
}

export interface MedicalScan {
  id: string;
  type: 'CHEST_XRAY' | 'LUMBAR_MRI' | '2D_ECHO' | 'CT_ANGIO' | 'ULTRASOUND_ABDOMEN';
  title: string;
  date: string;
  facility: string;
  radiologist: string;
  summary: string;
  findings: string[];
  impression: string;
  imageUrl?: string;
  svgVisualType: 'xray' | 'mri' | 'echo' | 'ecg';
}

export interface MedicationScheduleItem {
  id: string;
  name: string;
  dosage: string;
  doctor: string;
  instructions: string;
  timeSlot: string; // e.g. "08:00 AM"
  periodLabel: string; // "Morning Dose", "Afternoon Dose", "Evening Dose"
  relationToFood: 'Post Breakfast' | 'Before Lunch' | 'Post Dinner' | 'With Food' | 'Anytime';
  details: string; // e.g. "Oral Tablet • 500mg • Dr. Anjali Rao"
  taken: boolean;
  takenAt?: string;
}

export interface Prescription {
  id: string;
  prescriptionNumber: string;
  patientMediId: string;
  patientName: string;
  doctorName: string;
  doctorSpecialty: string;
  date: string;
  diagnosis: string;
  instructions: string;
  items: {
    medicineName: string;
    dosage: string;
    frequency: string;
    duration: string;
    foodTiming: string;
    instructions?: string;
  }[];
  refillCount: number;
  maxRefills: number;
}

export interface MedicalVisit {
  id: string;
  date: string;
  year: number;
  hospitalName: string;
  doctorName: string;
  specialty: string;
  reason: string;
  diagnosis: string;
  symptoms: string[];
  treatment: string;
  durationDays: number;
  tabletsGiven: string[];
  vitalsRecorded?: Partial<Vitals>;
  followUpDate?: string;
  category: 'inpatient' | 'outpatient' | 'emergency' | 'telehealth';
  reportsAttached?: string[];
  scansAttached?: MedicalScan[];
}

export interface Appointment {
  id: string;
  patientMediId: string;
  patientName: string;
  doctorName: string;
  doctorSpecialty: string;
  doctorIcon?: string;
  date: string;
  time: string;
  relativeDays: string; // e.g. "In 11 Days"
  hospitalName: string;
  wardRoom: string;
  status: 'CONFIRMED' | 'WAITING' | 'UPCOMING' | 'COMPLETED' | 'CANCELLED';
  reason: string;
  chiefComplaint?: string;
}

export interface Bed {
  id: string;
  bedNumber: string; // e.g. "ICU-07"
  wardType: 'ICU' | 'GENERAL' | 'PRIVATE' | 'EMERGENCY';
  wardName: string; // "Critical Care Wing", "General Ward A"
  status: 'OCCUPIED' | 'AVAILABLE' | 'MAINTENANCE' | 'CLEANING';
  assignedPatientMediId?: string;
  assignedPatientName?: string;
  admissionDate?: string;
}

export interface Ward {
  id: string;
  name: string;
  type: 'ICU' | 'GENERAL' | 'PRIVATE' | 'EMERGENCY';
  totalBeds: number;
  occupiedBeds: number;
  beds: Bed[];
}

export interface HospitalFacility {
  id: string;
  name: string;
  region: 'Metro City Central' | 'South Medical Hub' | 'North Tech Corridor' | 'East Bay Biomedical' | 'West Coast Healthcare Zone';
  location: string;
  rating: number;
  contactNumber: string;
  emergencyAvailable: boolean;
  icuAvailable: boolean;
  ambulanceAvailable: boolean;
  bloodBankAvailable: boolean;
  totalBeds: number;
  availableBeds: number;
  departments: string[];
  establishedYear?: number;
}

export interface BloodDonor {
  id: string;
  donorName: string;
  bloodGroup: BloodGroup;
  unitsContributed: number;
  lastDonationDate: string;
  contactVerified: boolean;
  donorClub: string;
  location: string;
}

export interface BloodReserve {
  bloodGroup: BloodGroup;
  units: number;
  status: 'SUFFICIENT' | 'LOW' | 'CRITICAL';
  lastUpdated: string;
  donors: BloodDonor[];
}

export interface OrganDonorListing {
  id: string;
  organ: string;
  compatibility: string;
  donorType: 'Living Donor' | 'Cadaveric Donor' | 'Split-graft' | 'Tissue Bank';
  registryOrganization: string;
  status: string;
  region: string;
  affiliatedHospital: string;
  emergencyHotline: string;
}

export interface PatientBelonging {
  id: string;
  name: string;
  category: 'MEDICAL_DEVICE' | 'IDENTIFICATION' | 'PERSONAL' | 'ACCESSORY';
  description: string;
  custodyStatus: 'IN_PATIENT_POSSESSION' | 'SECURED_IN_HOSPITAL_SAFE' | 'RETURNED_TO_FAMILY';
  location: string;
  icon: string;
  photoUrl?: string;
  loggedAt: string;
}

export interface EmergencyRecord {
  id: string;
  temporaryEmergencyId: string; // "TEMP-EMR-10042"
  patientMediId?: string;
  patientName?: string;
  arrivalTime: string;
  arrivalMode: 'Ambulance 108' | 'Private Vehicle' | 'Police Escort' | 'Walk-in';
  ambulanceId?: string;
  approxAge: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER' | 'UNKNOWN';
  bloodGroup: BloodGroup;
  condition: 'CRITICAL' | 'UNCONSCIOUS' | 'STABLE' | 'OBSERVATION';
  visibleTrauma: string;
  broughtBy: string;
  belongings: {
    item: string;
    quantity: number;
    condition: string;
    custodyStatus: 'SECURED' | 'RETURNED';
  }[];
  triageNotes: string;
  status: 'ACTIVE_TRIAGE' | 'ADMITTED' | 'TRANSFERRED' | 'DISCHARGED';
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actorName: string;
  actorRole: UserRole;
  action: string;
  targetPatientMediId: string;
  details: string;
}
