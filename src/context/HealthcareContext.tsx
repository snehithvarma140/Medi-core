import React, { createContext, useContext, useState, useEffect } from 'react';
import { db, testFirebaseConnection } from '../firebase/config';
import { doc, setDoc } from 'firebase/firestore';
import {
  testSupabaseConnection,
  syncPatientToSupabase,
  syncAppointmentToSupabase,
  syncPrescriptionToSupabase,
  syncEmergencyRecordToSupabase,
  syncAuditLogToSupabase,
} from '../supabase/client';
import {
  UserRole,
  BloodGroup,
  Vitals,
  BpRecord,
  MedicalScan,
  MedicationScheduleItem,
  Prescription,
  MedicalVisit,
  Appointment,
  Ward,
  Bed,
  HospitalFacility,
  BloodReserve,
  OrganDonorListing,
  PatientBelonging,
  EmergencyRecord,
  AuditLogEntry,
} from '../types/healthcare';

interface HealthcareContextType {
  currentUserRole: UserRole;
  isLoggedIn: boolean;
  activePatient: {
    name: string;
    mediId: string;
    bloodGroup: BloodGroup;
    allergy: string;
    attendingDoctor: string;
    hospital: string;
    isAdmitted: boolean;
    assignedWard: string;
    assignedBed: string;
    admissionDate: string;
    emergencyContact: string;
    vitals: Vitals;
    chronicConditions: string[];
    adverseReactions: string[];
    surgicalHistory: string[];
    belongings: PatientBelonging[];
  };
  medicationSchedule: MedicationScheduleItem[];
  appointments: Appointment[];
  prescriptions: Prescription[];
  medicalVisits: MedicalVisit[];
  bpRecords: BpRecord[];
  medicalScans: MedicalScan[];
  wards: Ward[];
  hospitalFacilities: HospitalFacility[];
  bloodReserves: BloodReserve[];
  organDonorListings: OrganDonorListing[];
  emergencyRecords: EmergencyRecord[];
  auditLogs: AuditLogEntry[];
  notifications: { id: string; title: string; time: string; read: boolean; type: 'info' | 'alert' | 'appointment' }[];

  // Actions
  login: (role: UserRole, identifier?: string) => void;
  logout: () => void;
  switchRole: (role: UserRole) => void;
  toggleMedicationTaken: (id: string) => void;
  toggleAdmittedStatus: () => void;
  bookAppointment: (newAppt: Omit<Appointment, 'id' | 'status' | 'relativeDays'>) => void;
  cancelAppointment: (id: string) => void;
  createPrescription: (newPrescription: Omit<Prescription, 'id' | 'prescriptionNumber' | 'date' | 'refillCount' | 'maxRefills'>) => void;
  admitPatientToBed: (bedId: string, patientMediId: string, patientName: string) => void;
  dischargeBed: (bedId: string) => void;
  updateBedStatus: (bedId: string, status: Bed['status']) => void;
  createEmergencyIntake: (intake: Omit<EmergencyRecord, 'id' | 'temporaryEmergencyId' | 'arrivalTime' | 'status'>) => string;
  linkEmergencyRecordToPatient: (emergencyId: string, mediId: string) => void;
  lookupPatientByMediId: (mediId: string) => any;
  requestPrescriptionRefill: (prescriptionId: string) => void;
  addNotification: (title: string, type?: 'info' | 'alert' | 'appointment') => void;
  clearNotification: (id: string) => void;
}

const INITIAL_VITALS: Vitals = {
  heartRate: 72,
  systolicBP: 120,
  diastolicBP: 80,
  spo2: 98,
  bodyTemp: 98.4,
  respiratoryRate: 16,
  lastUpdated: 'Today, 08:30 AM',
};

const INITIAL_BP_RECORDS: BpRecord[] = [
  { id: 'bp-1', date: '04 Oct 2026, 08:00 AM', systolic: 120, diastolic: 80, pulse: 72, status: 'NORMAL', notes: 'Continuous resting ICU telemetry', clinician: 'Dr. Anjali Rao' },
  { id: 'bp-2', date: '14 Sep 2026, 10:15 AM', systolic: 122, diastolic: 82, pulse: 74, status: 'NORMAL', notes: 'Diabetic follow-up morning clinic', clinician: 'Dr. Anjali Rao' },
  { id: 'bp-3', date: '12 Apr 2026, 11:30 AM', systolic: 126, diastolic: 84, pulse: 76, status: 'PRE-HYPERTENSION', notes: 'Cardiovascular screening post-treadmill', clinician: 'Dr. Vikram Seth' },
  { id: 'bp-4', date: '10 Nov 2025, 03:45 PM', systolic: 135, diastolic: 88, pulse: 92, status: 'STAGE 1', notes: 'Acute allergic episode reaction triage', clinician: 'Dr. Anjali Rao' },
  { id: 'bp-5', date: '18 Jun 2025, 09:00 AM', systolic: 124, diastolic: 82, pulse: 70, status: 'NORMAL', notes: 'Routine annual corporate physical', clinician: 'Dr. Sunita Kulkarni' },
  { id: 'bp-6', date: '05 Nov 2024, 10:00 AM', systolic: 128, diastolic: 85, pulse: 75, status: 'PRE-HYPERTENSION', notes: 'Initial diabetes metabolic screening', clinician: 'Dr. Sandhya Nair' },
  { id: 'bp-7', date: '14 Apr 2023, 02:30 PM', systolic: 120, diastolic: 78, pulse: 68, status: 'OPTIMAL', notes: 'Post-viral checkup recovery', clinician: 'Dr. Vikram Seth' },
  { id: 'bp-8', date: '22 Aug 2022, 11:15 AM', systolic: 122, diastolic: 80, pulse: 72, status: 'NORMAL', notes: 'Lumbar spine physical therapy evaluation', clinician: 'Dr. Rajesh Deshmukh' },
  { id: 'bp-9', date: '09 Jan 2021, 08:30 PM', systolic: 130, diastolic: 86, pulse: 84, status: 'PRE-HYPERTENSION', notes: 'Pre-operative appendectomy triage', clinician: 'Dr. Amitav Ghosh' },
  { id: 'bp-10', date: '15 Oct 2020, 09:30 AM', systolic: 118, diastolic: 76, pulse: 88, status: 'NORMAL', notes: 'Dengue recovery platelet review', clinician: 'Dr. Anjali Rao' },
  { id: 'bp-11', date: '04 Mar 2019, 04:00 PM', systolic: 120, diastolic: 78, pulse: 72, status: 'OPTIMAL', notes: 'Ankle ligament sports injury clinic', clinician: 'Dr. Rajesh Deshmukh' },
  { id: 'bp-12', date: '12 Jul 2018, 11:00 AM', systolic: 116, diastolic: 74, pulse: 82, status: 'OPTIMAL', notes: 'Post-gastroenteritis rehydration review', clinician: 'Dr. Farhan Akhtar' },
  { id: 'bp-13', date: '20 Sep 2017, 08:45 AM', systolic: 118, diastolic: 76, pulse: 70, status: 'OPTIMAL', notes: 'Executive pre-employment screening', clinician: 'Dr. Sunita Kulkarni' },
  { id: 'bp-14', date: '14 Feb 2016, 10:15 AM', systolic: 120, diastolic: 78, pulse: 78, status: 'OPTIMAL', notes: 'Influenza recovery clinic', clinician: 'Dr. Amitav Ghosh' },
];

const INITIAL_SCANS: MedicalScan[] = [
  {
    id: 'scan-1',
    type: 'CHEST_XRAY',
    title: 'Digital High-Resolution Chest X-Ray (PA View)',
    date: '04 Oct 2026',
    facility: 'ABC Hospital Network (Radiology Wing)',
    radiologist: 'Dr. Meera Iyer, DMRD, DNB Radiology',
    summary: 'Normal cardiothoracic ratio. Lung fields are completely clear without infiltrates, pleural effusion, or consolidation.',
    findings: [
      'Trachea is midline with normal caliber.',
      'Cardiothoracic ratio is 0.48 (within normal limit < 0.50).',
      'Both costophrenic angles and hemidiaphragms are sharp and clearly outlined.',
      'Bony thoracic cage and soft tissues show no focal osseous lesions.',
    ],
    impression: 'Normal study of the chest. Clear pulmonary fields.',
    svgVisualType: 'xray',
  },
  {
    id: 'scan-2',
    type: 'LUMBAR_MRI',
    title: '3-Tesla Lumbar Spine MRI with Contrast',
    date: '14 Sep 2026',
    facility: 'ABC Advanced Imaging Center',
    radiologist: 'Dr. K. S. Murthy, MD Neuro-radiology',
    summary: 'Mild L4-L5 intervertebral disc desiccation with subtle annular bulge. No significant spinal canal stenosis.',
    findings: [
      'Normal lumbar lordosis maintained.',
      'L4-L5 shows early grade 1 disc dehydration without frank herniation.',
      'Conus medullaris terminates normally at L1 level.',
      'Thecal sac and traversing nerve roots appear intact without compression.',
    ],
    impression: 'Mild early degenerative lumbar disc disease at L4-L5. Conservative posture therapy recommended.',
    svgVisualType: 'mri',
  },
  {
    id: 'scan-3',
    type: '2D_ECHO',
    title: '2D Doppler Echocardiography & Color Flow',
    date: '12 Apr 2026',
    facility: 'XYZ Superspeciality Hospital (Cardiology)',
    radiologist: 'Dr. Vikram Seth, MD, DM Cardiology',
    summary: 'Normal LV systolic function with Left Ventricular Ejection Fraction (LVEF) of 62%. Normal wall motion.',
    findings: [
      'LVEF calculated at 62% by Simpson biplane method.',
      'Aortic and mitral valves show normal leaflet mobility without regurgitation.',
      'No pericardial effusion or intracardiac thrombus visualized.',
      'Right ventricular systolic pressure within normal reference limit (24 mmHg).',
    ],
    impression: 'Normal cardiac chamber dimensions and preserved biventricular systolic performance.',
    svgVisualType: 'echo',
  },
  {
    id: 'scan-4',
    type: 'ULTRASOUND_ABDOMEN',
    title: 'High-Resolution Whole Abdominal Ultrasound',
    date: '18 Jun 2025',
    facility: 'Apollo Metro Care Diagnostics',
    radiologist: 'Dr. Ritu Sen, MD Radiodiagnosis',
    summary: 'Normal liver echo-texture. Appendix surgically absent (post-appendectomy 2021). Kidneys bilateral normal cortical thickness.',
    findings: [
      'Liver size 14.2 cm with normal homogeneous parenchymal echoes.',
      'Gallbladder well-distended with thin smooth wall; no calculus.',
      'Both kidneys demonstrate normal size and corticomedullary differentiation.',
      'Right iliac fossa shows surgical clips consistent with laparoscopic appendectomy.',
    ],
    impression: 'Unremarkable abdominal ultrasound. Normal renal and hepatic parenchyma.',
    svgVisualType: 'echo',
  },
  {
    id: 'scan-5',
    type: 'CT_ANGIO',
    title: '64-Slice Coronary CT Angiography',
    date: '10 May 2024',
    facility: 'ABC Heart & Vascular Institute',
    radiologist: 'Dr. Sanjay Kaul, MD, FACC',
    summary: 'Zero calcium score (Agatston 0). Patent coronary arteries with no significant luminal stenosis or soft plaques.',
    findings: [
      'Left Main Coronary Artery (LMCA) is patent with smooth margins.',
      'Left Anterior Descending (LAD) shows no calcified or non-calcified plaques.',
      'Circumflex and Right Coronary Artery are dominant and widely patent.',
    ],
    impression: 'Normal coronary CT angiogram. Agatston calcium score 0.',
    svgVisualType: 'echo',
  },
  {
    id: 'scan-6',
    type: 'CHEST_XRAY',
    title: 'Pre-operative Digital Thoracic Radiograph',
    date: '09 Jan 2021',
    facility: 'Apollo Metro Care Surgery Center',
    radiologist: 'Dr. Meera Iyer, DMRD',
    summary: 'Clear thoracic cavity prior to laparoscopic appendectomy under general anesthesia.',
    findings: [
      'Normal lung expansion.',
      'Normal cardiac silhouette and mediastinal contours.',
      'No acute airspace consolidation.',
    ],
    impression: 'Pre-operative pulmonary clearance granted.',
    svgVisualType: 'xray',
  },
];

const INITIAL_BELONGINGS: PatientBelonging[] = [
  {
    id: 'bel-1',
    name: 'Smart Health Monitoring Wristband',
    category: 'MEDICAL_DEVICE',
    description: 'Continuous biometric sensor paired to ICU nursing telemetry node',
    custodyStatus: 'IN_PATIENT_POSSESSION',
    location: 'Patient Right Wrist',
    icon: '⌚',
    loggedAt: '04 Oct 2026, 07:45 AM',
  },
  {
    id: 'bel-2',
    name: 'Medical Alert Emergency Bracelet (Stainless Steel)',
    category: 'ACCESSORY',
    description: 'Permanently laser-engraved: "CRITICAL: PENICILLIN ALLERGY / B+ BLOOD / MED-7X29K4"',
    custodyStatus: 'IN_PATIENT_POSSESSION',
    location: 'Patient Left Wrist',
    icon: '🏷️',
    loggedAt: '04 Oct 2026, 07:45 AM',
  },
  {
    id: 'bel-3',
    name: 'Smartphone with ICE Medical ID Active',
    category: 'PERSONAL',
    description: 'Encrypted mobile device with lockscreen ICE contact (+1 555 392-1082)',
    custodyStatus: 'SECURED_IN_HOSPITAL_SAFE',
    location: 'ICU Ward Safe Locker #07',
    icon: '📱',
    loggedAt: '04 Oct 2026, 08:00 AM',
  },
  {
    id: 'bel-4',
    name: 'Leather Wallet & Universal Medi ID Physical Card',
    category: 'IDENTIFICATION',
    description: 'Contains Medi ID smartcard, driving license, and organ donor authorization card',
    custodyStatus: 'SECURED_IN_HOSPITAL_SAFE',
    location: 'ICU Ward Safe Locker #07',
    icon: '🪪',
    loggedAt: '04 Oct 2026, 08:00 AM',
  },
  {
    id: 'bel-5',
    name: 'Anti-Reflective Prescription Eyeglasses',
    category: 'PERSONAL',
    description: 'Titanium frame reading spectacles (-1.25 D OD/OS)',
    custodyStatus: 'IN_PATIENT_POSSESSION',
    location: 'Bedside Table ICU-07',
    icon: '👓',
    loggedAt: '04 Oct 2026, 08:15 AM',
  },
];

const INITIAL_MEDICINE_SCHEDULE: MedicationScheduleItem[] = [
  {
    id: 'med-1',
    name: 'Medicine A (Metformin ER)',
    dosage: '500mg',
    doctor: 'Dr. Anjali Rao',
    instructions: 'Take with full glass of water after breakfast',
    timeSlot: '08:00 AM',
    periodLabel: 'Morning Dose',
    relationToFood: 'Post Breakfast',
    details: 'Oral Tablet • 500mg • Dr. Anjali Rao',
    taken: true,
    takenAt: '08:15 AM',
  },
  {
    id: 'med-2',
    name: 'Medicine B (Glimepiride)',
    dosage: '1mg',
    doctor: 'Dr. Anjali Rao',
    instructions: 'Take 30 mins before noon meal for optimal absorption',
    timeSlot: '01:00 PM',
    periodLabel: 'Afternoon Dose',
    relationToFood: 'Before Lunch',
    details: 'Oral Tablet • 1mg • Pre-prandial',
    taken: false,
  },
  {
    id: 'med-3',
    name: 'Medicine A (Metformin ER)',
    dosage: '500mg',
    doctor: 'Dr. Anjali Rao',
    instructions: 'Evening dose with dinner for sustained nighttime coverage',
    timeSlot: '08:00 PM',
    periodLabel: 'Evening Dose',
    relationToFood: 'Post Dinner',
    details: 'Oral Tablet • 500mg • Sustained release',
    taken: false,
  },
];

const INITIAL_APPOINTMENTS: Appointment[] = [
  {
    id: 'appt-1',
    patientMediId: 'MED-7X29K4',
    patientName: 'Rahul Kumar',
    doctorName: 'Dr. Anjali Rao',
    doctorSpecialty: 'General Medicine & Cardiology',
    date: '15 October',
    time: '10:30 AM',
    relativeDays: 'In 11 Days',
    hospitalName: 'ABC Hospital',
    wardRoom: 'OPD Block B, Room 204',
    status: 'CONFIRMED',
    reason: 'Follow-up on diabetic profile & ECG lead telemetry review',
  },
  {
    id: 'appt-2',
    patientMediId: 'MED-8K29L2',
    patientName: 'Priya Sharma',
    doctorName: 'Dr. Anjali Rao',
    doctorSpecialty: 'General Medicine',
    date: '04 October',
    time: '11:00 AM',
    relativeDays: 'Today',
    hospitalName: 'ABC Hospital',
    wardRoom: 'OPD Block B, Room 204',
    status: 'WAITING',
    reason: 'Hypertension monitoring & dose titration',
  },
  {
    id: 'appt-3',
    patientMediId: 'MED-9L82P3',
    patientName: 'Arun Kumar',
    doctorName: 'Dr. Vikram Seth',
    doctorSpecialty: 'Cardiology',
    date: '04 October',
    time: '11:30 AM',
    relativeDays: 'Today',
    hospitalName: 'ABC Hospital',
    wardRoom: 'Cardiology Center, Room 102',
    status: 'UPCOMING',
    reason: 'Routine cardiovascular stress test review',
  },
  {
    id: 'appt-4',
    patientMediId: 'MED-4H81K9',
    patientName: 'Meera Patel',
    doctorName: 'Dr. Anjali Rao',
    doctorSpecialty: 'General Medicine',
    date: '04 October',
    time: '12:00 PM',
    relativeDays: 'Today',
    hospitalName: 'ABC Hospital',
    wardRoom: 'OPD Block B, Room 204',
    status: 'WAITING',
    reason: 'Post-op wound evaluation & antibiotics review',
  },
];

const INITIAL_PRESCRIPTIONS: Prescription[] = [
  {
    id: 'rx-1',
    prescriptionNumber: 'PR10291',
    patientMediId: 'MED-7X29K4',
    patientName: 'Rahul Kumar',
    doctorName: 'Dr. Anjali Rao',
    doctorSpecialty: 'General Medicine / Internal Care',
    date: '04 Oct 2026',
    diagnosis: 'Type II Diabetes Mellitus with Mild Sinus Tachycardia',
    instructions: 'Maintain low sodium, avoid penicillin class antibiotics. Monitor morning capillary glucose daily.',
    refillCount: 1,
    maxRefills: 3,
    items: [
      {
        medicineName: 'Medicine A (Metformin ER)',
        dosage: '500 mg',
        frequency: 'Twice daily',
        duration: '30 days',
        foodTiming: 'After food',
        instructions: 'Post breakfast and post dinner',
      },
      {
        medicineName: 'Medicine B (Glimepiride)',
        dosage: '1 mg',
        frequency: 'Once daily',
        duration: '15 days',
        foodTiming: 'Before lunch',
        instructions: '30 minutes pre-prandial',
      },
    ],
  },
  {
    id: 'rx-2',
    prescriptionNumber: 'PR09814',
    patientMediId: 'MED-7X29K4',
    patientName: 'Rahul Kumar',
    doctorName: 'Dr. Vikram Seth',
    doctorSpecialty: 'Cardiology',
    date: '12 Apr 2026',
    diagnosis: 'Prophylactic Cardiovascular Optimization',
    instructions: 'Follow dietary restrictions and light aerobic exercise.',
    refillCount: 3,
    maxRefills: 3,
    items: [
      {
        medicineName: 'Atorvastatin',
        dosage: '10 mg',
        frequency: 'Once daily',
        duration: '90 days',
        foodTiming: 'Bedtime',
        instructions: 'Lipid management',
      },
    ],
  },
  {
    id: 'rx-3',
    prescriptionNumber: 'PR07221',
    patientMediId: 'MED-7X29K4',
    patientName: 'Rahul Kumar',
    doctorName: 'Dr. Sandhya Nair',
    doctorSpecialty: 'Endocrinology',
    date: '05 Nov 2024',
    diagnosis: 'Initial Hyperglycemia & Impaired Fasting Glucose',
    instructions: 'Begin lifestyle modification, 45 minutes daily walking, reduce refined carbohydrates.',
    refillCount: 3,
    maxRefills: 3,
    items: [
      {
        medicineName: 'Metformin Hydrochloride',
        dosage: '250 mg',
        frequency: 'Once daily',
        duration: '60 days',
        foodTiming: 'With breakfast',
        instructions: 'Initial titration dose',
      },
    ],
  },
  {
    id: 'rx-4',
    prescriptionNumber: 'PR03890',
    patientMediId: 'MED-7X29K4',
    patientName: 'Rahul Kumar',
    doctorName: 'Dr. Amitav Ghosh',
    doctorSpecialty: 'General Surgery',
    date: '12 Jan 2021',
    diagnosis: 'Post-Operative Acute Appendectomy Recovery',
    instructions: 'Wound care with sterile dressings, avoid heavy lifting for 4 weeks.',
    refillCount: 0,
    maxRefills: 1,
    items: [
      {
        medicineName: 'Ciprofloxacin',
        dosage: '500 mg',
        frequency: 'Twice daily',
        duration: '7 days',
        foodTiming: 'After food',
        instructions: 'Non-penicillin fluoroquinolone antibiotic',
      },
      {
        medicineName: 'Paracetamol',
        dosage: '650 mg',
        frequency: 'Thrice daily (PRN)',
        duration: '5 days',
        foodTiming: 'After food',
        instructions: 'Analgesic for post-operative pain relief',
      },
    ],
  },
];

// EXTENSIVE 5+ YEARS OF LONGITUDINAL VISITS (2026, 2025, 2024, 2023, 2022, 2021)
const INITIAL_VISITS: MedicalVisit[] = [
  {
    id: 'visit-1',
    date: '04 Oct 2026',
    year: 2026,
    hospitalName: 'ABC Hospital Network',
    doctorName: 'Dr. Anjali Rao',
    specialty: 'Internal Medicine / Critical Care',
    reason: 'Inpatient Observation & Telemetry Setup',
    diagnosis: 'Glycemic stabilization with continuous telemetry (ICD-10: E11.9)',
    symptoms: ['Mild fatigue', 'Post-prandial blood glucose fluctuation (168 mg/dL)'],
    treatment: 'Admitted to ICU Bed ICU-07 for 24hr biometric profiling and intravenous glycemic titration.',
    durationDays: 2,
    tabletsGiven: ['Metformin ER 500mg BID', 'Glimepiride 1mg OD'],
    category: 'inpatient',
    followUpDate: '15 Oct 2026',
    reportsAttached: ['Comprehensive Metabolic Panel (CMP)', 'Digital Chest X-Ray (PA View)', '24-hr Continuous ECG Strip'],
    scansAttached: [INITIAL_SCANS[0]],
  },
  {
    id: 'visit-2',
    date: '14 Sep 2026',
    year: 2026,
    hospitalName: 'ABC Hospital Network',
    doctorName: 'Dr. Anjali Rao',
    specialty: 'General Medicine',
    reason: 'Quarterly Diabetes Glycemic Follow-up & Lumbar Back Pain',
    diagnosis: 'Type II Diabetes (Well Controlled, HbA1c 6.8%) & L4-L5 Disc Dehydration',
    symptoms: ['Routine checkup', 'Mild lower back stiffness on prolonged sitting'],
    treatment: 'Continued oral hypoglycemic therapy. Ordered 3T Lumbar MRI. Core stability physical therapy prescribed.',
    durationDays: 1,
    tabletsGiven: ['Metformin ER 500mg', 'Vitamin D3 60k IU weekly'],
    category: 'outpatient',
    followUpDate: '04 Oct 2026',
    reportsAttached: ['HbA1c Lab Report (6.8%)', 'Lipid Profile', '3T Lumbar Spine MRI'],
    scansAttached: [INITIAL_SCANS[1]],
  },
  {
    id: 'visit-3',
    date: '12 Apr 2026',
    year: 2026,
    hospitalName: 'XYZ Superspeciality Hospital',
    doctorName: 'Dr. Vikram Seth',
    specialty: 'Cardiology',
    reason: 'Annual Cardiovascular Risk Screening & Stress Echo',
    diagnosis: 'Normal sinus rhythm, mild hyperlipidemia (Total Cholesterol 210 mg/dL)',
    symptoms: ['Mild exertional shortness of breath during steep staircase climbing'],
    treatment: '2D Doppler Echocardiography completed. Normal LVEF 62%. Prescribed low-dose Atorvastatin 10mg.',
    durationDays: 1,
    tabletsGiven: ['Atorvastatin 10mg OD bedtime'],
    category: 'outpatient',
    reportsAttached: ['2D Doppler Echocardiography Report', 'Treadmill Stress Test (Bruce Protocol)'],
    scansAttached: [INITIAL_SCANS[2]],
  },
  {
    id: 'visit-4',
    date: '10 Nov 2025',
    year: 2025,
    hospitalName: 'ABC Hospital Network',
    doctorName: 'Dr. Anjali Rao',
    specialty: 'Emergency / Trauma Triage',
    reason: 'Acute Pharyngitis & Severe Drug Anaphylactoid Reaction',
    diagnosis: 'Bacterial Pharyngitis; Grade III Adverse Reaction to Penicillin (ICD-10: T88.7)',
    symptoms: ['Rapid facial urticaria', 'Bilateral periorbital angioedema', 'Wheezing following oral Amoxicillin'],
    treatment: 'Immediate intramuscular Epinephrine 0.3mg, IV Hydrocortisone, and nebulized Salbutamol. Permanent Red-Alert flag added to Medi ID.',
    durationDays: 3,
    tabletsGiven: ['Levocetirizine 5mg', 'Prednisolone tapering course (5 days)'],
    category: 'emergency',
    reportsAttached: ['Immunology Drug Hypersensitivity Panel', 'Serum Tryptase Level'],
  },
  {
    id: 'visit-5',
    date: '18 Jun 2025',
    year: 2025,
    hospitalName: 'Apollo Metro Care',
    doctorName: 'Dr. Sunita Kulkarni',
    specialty: 'Preventive Healthcare',
    reason: 'Comprehensive Annual Executive Health Checkup',
    diagnosis: 'Normal systemic examination; Normal renal ultrasound; Mild borderline blood pressure (124/82 mmHg)',
    symptoms: ['Asymptomatic routine check'],
    treatment: 'Whole abdominal ultrasound, Complete Blood Count, Renal function panel, Liver profile.',
    durationDays: 1,
    tabletsGiven: ['Multivitamin with Zinc OD (30 days)'],
    category: 'outpatient',
    reportsAttached: ['Abdominal Ultrasound Report', 'Renal Function Profile (eGFR 94 mL/min)'],
    scansAttached: [INITIAL_SCANS[3]],
  },
  {
    id: 'visit-6',
    date: '05 Nov 2024',
    year: 2024,
    hospitalName: 'ABC Hospital Network',
    doctorName: 'Dr. Sandhya Nair',
    specialty: 'Endocrinology',
    reason: 'Polydipsia, Mild Nocturia & Weight Loss',
    diagnosis: 'New Onset Type II Diabetes Mellitus (Fasting Plasma Glucose 148 mg/dL, HbA1c 7.4%)',
    symptoms: ['Increased thirst', 'Frequent urination at night', 'Mild lethargy'],
    treatment: 'Initiated oral Metformin 250mg titration with diabetic nutritional counseling and glucometer log education.',
    durationDays: 1,
    tabletsGiven: ['Metformin Hydrochloride 250mg OD'],
    category: 'outpatient',
    reportsAttached: ['Fasting & Postprandial Blood Sugar', 'HbA1c Baseline (7.4%)'],
  },
  {
    id: 'visit-7',
    date: '14 Apr 2023',
    year: 2023,
    hospitalName: 'XYZ Superspeciality Hospital',
    doctorName: 'Dr. Vikram Seth',
    specialty: 'Pulmonology & Internal Care',
    reason: 'Seasonal Viral Bronchitis & Persistent Dry Cough',
    diagnosis: 'Acute Bronchitis (Non-specific viral etiology)',
    symptoms: ['Non-productive cough for 10 days', 'Low-grade fever 99.8°F', 'Retrosternal chest soreness'],
    treatment: 'Inhaled bronchodilator therapy, steam inhalation, and oral antitussives. Chest radiograph unremarkable.',
    durationDays: 5,
    tabletsGiven: ['Dextromethorphan syrup 10ml TID', 'Paracetamol 650mg SOS'],
    category: 'outpatient',
    reportsAttached: ['Sputum Culture (Negative)', 'Serial Peak Flow Measurement'],
  },
  {
    id: 'visit-8',
    date: '22 Aug 2022',
    year: 2022,
    hospitalName: 'Fortis Trauma & Orthopedic Center',
    doctorName: 'Dr. Rajesh Deshmukh',
    specialty: 'Orthopedics & Spine Care',
    reason: 'Acute Mechanical Lumbar Strain after Heavy Furniture Lifting',
    diagnosis: 'Acute Musculoskeletal Lumbo-sacral Strain',
    symptoms: ['Sudden severe lower back spasm', 'Limited lumbar range of motion', 'No radiating radiculopathy'],
    treatment: 'Lumbar support corset brace, hot compression therapy, 21 days targeted physical rehabilitation.',
    durationDays: 21,
    tabletsGiven: ['Thiocolchicoside 4mg BID (5 days)', 'Aceclofenac 100mg BID (5 days)'],
    category: 'outpatient',
    reportsAttached: ['Lumbar Spine Digital X-Ray (AP/Lateral)'],
  },
  {
    id: 'visit-9',
    date: '09 Jan 2021',
    year: 2021,
    hospitalName: 'Apollo Metro Care',
    doctorName: 'Dr. Amitav Ghosh',
    specialty: 'Emergency General Surgery',
    reason: 'Acute Right Lower Quadrant Abdominal Pain & Fever',
    diagnosis: 'Acute Catarrhal Appendicitis with localized peritonitis (ICD-10: K35.8)',
    symptoms: ['McBurney point tenderness', 'Guarding', 'Nausea', 'Elevated WBC count 14,800/mcL'],
    treatment: 'Emergency 3-port Laparoscopic Appendectomy under general anesthesia. Uneventful surgical recovery.',
    durationDays: 4,
    tabletsGiven: ['Ciprofloxacin 500mg BID', 'Metronidazole 400mg TID', 'Paracetamol 650mg'],
    category: 'inpatient',
    followUpDate: '24 Jan 2021',
    reportsAttached: ['Histopathology Appendix Specimen Report', 'Emergency Abdominal Contrast CT'],
  },
  {
    id: 'visit-10',
    date: '15 Oct 2020',
    year: 2020,
    hospitalName: 'ABC Hospital Network',
    doctorName: 'Dr. Anjali Rao',
    specialty: 'Internal Medicine / Infectious Diseases',
    reason: 'Acute Dengue Fever & Thrombocytopenia Monitoring',
    diagnosis: 'Classical Dengue Fever with moderate thrombocytopenia (Platelets 68,000/mcL)',
    symptoms: ['High-grade fever 103°F', 'Severe retro-orbital headache', 'Myalgia', 'Petechial rash'],
    treatment: 'Admitted for IV fluid volume resuscitation, bed rest, and daily serial complete blood counts. Platelet count recovered spontaneously to 184,000/mcL.',
    durationDays: 5,
    tabletsGiven: ['Paracetamol 650mg QDS', 'IV Normal Saline', 'Oral Rehydration Salts'],
    category: 'inpatient',
    followUpDate: '28 Oct 2020',
    reportsAttached: ['Dengue NS1 Antigen (Positive)', 'Serial Complete Blood Counts'],
  },
  {
    id: 'visit-11',
    date: '04 Mar 2019',
    year: 2019,
    hospitalName: 'Fortis Trauma & Orthopedic Center',
    doctorName: 'Dr. Rajesh Deshmukh',
    specialty: 'Sports Medicine & Orthopedics',
    reason: 'Right Ankle Inversion Injury during Badminton',
    diagnosis: 'Grade II Anterior Talofibular Ligament (ATFL) Sprain',
    symptoms: ['Right lateral ankle ecchymosis', 'Inability to bear weight', 'Edema'],
    treatment: 'Air-cast stirrup ankle splint application, cryotherapy (RICE protocol), 14 days non-steroidal anti-inflammatory therapy and progressive weight-bearing physio.',
    durationDays: 14,
    tabletsGiven: ['Aceclofenac 100mg BID (7 days)', 'Trypsin-Chymotrypsin tablets TID'],
    category: 'outpatient',
    reportsAttached: ['Right Ankle Digital Radiograph (No fracture)'],
  },
  {
    id: 'visit-12',
    date: '12 Jul 2018',
    year: 2018,
    hospitalName: 'St. Jude Apex Healthcare',
    doctorName: 'Dr. Farhan Akhtar',
    specialty: 'Gastroenterology',
    reason: 'Acute Gastroenteritis & Dehydration',
    diagnosis: 'Acute Infective Enteritis with moderate dehydration',
    symptoms: ['Watery diarrhea', 'Abdominal cramping', 'Nausea and dry mucous membranes'],
    treatment: 'Daycare IV crystalloids, anti-emetic injection, and oral ciprofloxacin. Stool microscopy negative for amoebic cysts.',
    durationDays: 2,
    tabletsGiven: ['Ondansetron 4mg', 'Ciprofloxacin 500mg BID (5 days)', 'Racecadotril 100mg TID'],
    category: 'outpatient',
    reportsAttached: ['Stool Routine & Culture', 'Serum Electrolytes'],
  },
  {
    id: 'visit-13',
    date: '20 Sep 2017',
    year: 2017,
    hospitalName: 'Global Care Regional Hospital',
    doctorName: 'Dr. Sunita Kulkarni',
    specialty: 'Occupational Health',
    reason: 'Pre-Employment Health Screening & Audiometry',
    diagnosis: 'Medically Fit for Corporate Employment',
    symptoms: ['Routine pre-placement screening'],
    treatment: 'Pure tone audiometry, visual acuity (6/6 both eyes with corrective lenses), ECG rhythm strip, urine toxicology panel.',
    durationDays: 1,
    tabletsGiven: ['None required'],
    category: 'outpatient',
    reportsAttached: ['Audiogram (Normal bilaterally)', 'Occupational Fitness Certificate'],
  },
  {
    id: 'visit-14',
    date: '14 Feb 2016',
    year: 2016,
    hospitalName: 'Apollo Metro Care',
    doctorName: 'Dr. Amitav Ghosh',
    specialty: 'Internal Medicine',
    reason: 'Seasonal Influenza Like Illness (Type A H1N1 Suspect)',
    diagnosis: 'Seasonal Influenza Type A (Confirmed RT-PCR)',
    symptoms: ['Fever 102°F', 'Dry cough', 'Severe body ache and fatigue'],
    treatment: 'Oral Oseltamivir 75mg antiviral course, steam inhalation, and home isolation for 7 days.',
    durationDays: 7,
    tabletsGiven: ['Oseltamivir 75mg BID (5 days)', 'Paracetamol 650mg SOS', 'Vitamin C 500mg'],
    category: 'outpatient',
    reportsAttached: ['Nasal Swab Respiratory Viral Multiplex PCR'],
  },
];

const INITIAL_WARDS: Ward[] = [
  {
    id: 'ward-icu',
    name: 'Critical Care Wing (ICU)',
    type: 'ICU',
    totalBeds: 12,
    occupiedBeds: 10,
    beds: [
      { id: 'b-icu-1', bedNumber: 'ICU-01', wardType: 'ICU', wardName: 'Critical Care Wing', status: 'OCCUPIED', assignedPatientMediId: 'MED-11029', assignedPatientName: 'Kavita Menon' },
      { id: 'b-icu-2', bedNumber: 'ICU-02', wardType: 'ICU', wardName: 'Critical Care Wing', status: 'OCCUPIED', assignedPatientMediId: 'MED-99214', assignedPatientName: 'David Chen' },
      { id: 'b-icu-3', bedNumber: 'ICU-03', wardType: 'ICU', wardName: 'Critical Care Wing', status: 'AVAILABLE' },
      { id: 'b-icu-4', bedNumber: 'ICU-04', wardType: 'ICU', wardName: 'Critical Care Wing', status: 'OCCUPIED', assignedPatientMediId: 'MED-55102', assignedPatientName: 'Rajesh Shah' },
      { id: 'b-icu-5', bedNumber: 'ICU-05', wardType: 'ICU', wardName: 'Critical Care Wing', status: 'MAINTENANCE' },
      { id: 'b-icu-6', bedNumber: 'ICU-06', wardType: 'ICU', wardName: 'Critical Care Wing', status: 'OCCUPIED', assignedPatientMediId: 'MED-33910', assignedPatientName: 'Farhan Ali' },
      { id: 'b-icu-7', bedNumber: 'ICU-07', wardType: 'ICU', wardName: 'Critical Care Wing', status: 'OCCUPIED', assignedPatientMediId: 'MED-7X29K4', assignedPatientName: 'Rahul Kumar', admissionDate: '04 Oct 2026' },
      { id: 'b-icu-8', bedNumber: 'ICU-08', wardType: 'ICU', wardName: 'Critical Care Wing', status: 'OCCUPIED', assignedPatientMediId: 'MED-77123', assignedPatientName: 'Sunita Rao' },
      { id: 'b-icu-9', bedNumber: 'ICU-09', wardType: 'ICU', wardName: 'Critical Care Wing', status: 'OCCUPIED', assignedPatientMediId: 'MED-88192', assignedPatientName: 'Ramesh Verma' },
      { id: 'b-icu-10', bedNumber: 'ICU-10', wardType: 'ICU', wardName: 'Critical Care Wing', status: 'AVAILABLE' },
      { id: 'b-icu-11', bedNumber: 'ICU-11', wardType: 'ICU', wardName: 'Critical Care Wing', status: 'OCCUPIED', assignedPatientMediId: 'MED-66124', assignedPatientName: 'John Doe (EMR)' },
      { id: 'b-icu-12', bedNumber: 'ICU-12', wardType: 'ICU', wardName: 'Critical Care Wing', status: 'OCCUPIED', assignedPatientMediId: 'MED-22019', assignedPatientName: 'Fatima Sayed' },
    ],
  },
  {
    id: 'ward-gen',
    name: 'General Medical Ward (Ward A)',
    type: 'GENERAL',
    totalBeds: 20,
    occupiedBeds: 14,
    beds: Array.from({ length: 20 }, (_, i) => ({
      id: `b-gen-${i + 1}`,
      bedNumber: `GEN-${(i + 1).toString().padStart(2, '0')}`,
      wardType: 'GENERAL' as const,
      wardName: 'General Medical Ward',
      status: i < 14 ? 'OCCUPIED' : (i === 14 ? 'CLEANING' : 'AVAILABLE'),
      assignedPatientName: i < 14 ? `Patient ${i + 101}` : undefined,
    })),
  },
  {
    id: 'ward-priv',
    name: 'Private Deluxe Suites',
    type: 'PRIVATE',
    totalBeds: 10,
    occupiedBeds: 8,
    beds: Array.from({ length: 10 }, (_, i) => ({
      id: `b-priv-${i + 1}`,
      bedNumber: `PVT-${(i + 1).toString().padStart(2, '0')}`,
      wardType: 'PRIVATE' as const,
      wardName: 'Private Deluxe Suites',
      status: i < 8 ? 'OCCUPIED' : 'AVAILABLE',
      assignedPatientName: i < 8 ? `Private Suite Patient ${i + 1}` : undefined,
    })),
  },
];

// EXPANDED HOSPITALS LIST WITH REGIONS / PLACES
const INITIAL_FACILITIES: HospitalFacility[] = [
  {
    id: 'hosp-1',
    name: 'ABC Hospital Network',
    region: 'Metro City Central',
    location: 'Central Medical Corridor, Sector 4, Metro City',
    rating: 4.9,
    contactNumber: '+1 (800) 555-0199',
    emergencyAvailable: true,
    icuAvailable: true,
    ambulanceAvailable: true,
    bloodBankAvailable: true,
    totalBeds: 320,
    availableBeds: 34,
    departments: ['Emergency Trauma Level 1', 'Cardiology & Telemetry', 'Internal Medicine', 'ICU Critical Care', 'Neurology', 'Organ Transplant Wing'],
    establishedYear: 1998,
  },
  {
    id: 'hosp-2',
    name: 'XYZ Superspeciality Hospital',
    region: 'North Tech Corridor',
    location: 'North Avenue Park, Sector 12, Metro City',
    rating: 4.8,
    contactNumber: '+1 (800) 555-0244',
    emergencyAvailable: true,
    icuAvailable: true,
    ambulanceAvailable: true,
    bloodBankAvailable: true,
    totalBeds: 250,
    availableBeds: 18,
    departments: ['Cardiovascular Surgery', 'Orthopedics', 'Pediatrics', 'Radiology 3T MRI', 'Pulmonology'],
    establishedYear: 2005,
  },
  {
    id: 'hosp-3',
    name: 'St. Jude Apex Healthcare',
    region: 'East Bay Biomedical',
    location: 'Bay Area Biomedical Campus, Harbor View Road',
    rating: 4.7,
    contactNumber: '+1 (800) 555-0811',
    emergencyAvailable: true,
    icuAvailable: true,
    ambulanceAvailable: false,
    bloodBankAvailable: true,
    totalBeds: 180,
    availableBeds: 22,
    departments: ['Endocrinology & Diabetes', 'Gastroenterology', 'Dermatology', 'Dialysis Center'],
    establishedYear: 2012,
  },
  {
    id: 'hosp-4',
    name: 'Apollo Metro Care Institute',
    region: 'South Medical Hub',
    location: 'South Boulevard Extension, Phase 2',
    rating: 4.9,
    contactNumber: '+1 (800) 555-0333',
    emergencyAvailable: true,
    icuAvailable: true,
    ambulanceAvailable: true,
    bloodBankAvailable: true,
    totalBeds: 400,
    availableBeds: 45,
    departments: ['Trauma Care Level 1', 'Laparoscopic Surgery', 'Nephrology & Renal Dialysis', 'Oncology Radiation', 'Blood Bank'],
    establishedYear: 1994,
  },
  {
    id: 'hosp-5',
    name: 'Fortis Trauma & Orthopedic Center',
    region: 'South Medical Hub',
    location: 'Highway Bypass Junction 8, South Hub',
    rating: 4.8,
    contactNumber: '+1 (800) 555-0455',
    emergencyAvailable: true,
    icuAvailable: true,
    ambulanceAvailable: true,
    bloodBankAvailable: false,
    totalBeds: 210,
    availableBeds: 29,
    departments: ['Orthopedic Spine Surgery', 'Joint Replacement', 'Trauma Resuscitation', 'Sports Medicine'],
    establishedYear: 2008,
  },
  {
    id: 'hosp-6',
    name: 'Max Life Institute of Sciences',
    region: 'West Coast Healthcare Zone',
    location: 'Coastal Ocean Drive, Biomedical Zone West',
    rating: 4.8,
    contactNumber: '+1 (800) 555-0677',
    emergencyAvailable: true,
    icuAvailable: true,
    ambulanceAvailable: true,
    bloodBankAvailable: true,
    totalBeds: 280,
    availableBeds: 31,
    departments: ['Cardiac Surgery', 'Neuro-critical ICU', 'Robotic Surgery', 'Corneal Eye Bank'],
    establishedYear: 2016,
  },
  {
    id: 'hosp-7',
    name: 'Global Care Regional Hospital',
    region: 'North Tech Corridor',
    location: 'Silicon Valley Highway, Tech Zone 4',
    rating: 4.6,
    contactNumber: '+1 (800) 555-0912',
    emergencyAvailable: true,
    icuAvailable: false,
    ambulanceAvailable: true,
    bloodBankAvailable: true,
    totalBeds: 150,
    availableBeds: 26,
    departments: ['General Medicine', 'Daycare Ambulatory', 'Preventive Diagnostics', 'ENT'],
    establishedYear: 2019,
  },
  {
    id: 'hosp-8',
    name: 'Mercy General Academic Medical Center',
    region: 'Metro City Central',
    location: 'University Avenue, Medical Quadrangle 5',
    rating: 4.9,
    contactNumber: '+1 (800) 555-0722',
    emergencyAvailable: true,
    icuAvailable: true,
    ambulanceAvailable: true,
    bloodBankAvailable: true,
    totalBeds: 520,
    availableBeds: 62,
    departments: ['Cardiothoracic Surgery', 'Hematology-Oncology', 'Neonatal ICU', 'Organ Transplant', 'Trauma Level 1'],
    establishedYear: 1985,
  },
  {
    id: 'hosp-9',
    name: 'Valley Women & Children Specialty Hospital',
    region: 'North Tech Corridor',
    location: 'Innovation Boulevard, Parkview Sector',
    rating: 4.8,
    contactNumber: '+1 (800) 555-0344',
    emergencyAvailable: true,
    icuAvailable: true,
    ambulanceAvailable: true,
    bloodBankAvailable: true,
    totalBeds: 200,
    availableBeds: 38,
    departments: ['Pediatric Critical Care', 'Obstetrics & Gynecology', 'Fetal Medicine', 'Pediatric Surgery'],
    establishedYear: 2015,
  },
  {
    id: 'hosp-10',
    name: 'Pacific Coast Trauma & Burn Institute',
    region: 'West Coast Healthcare Zone',
    location: 'Coastal Ocean Highway, Marina Sector',
    rating: 4.9,
    contactNumber: '+1 (800) 555-0899',
    emergencyAvailable: true,
    icuAvailable: true,
    ambulanceAvailable: true,
    bloodBankAvailable: true,
    totalBeds: 340,
    availableBeds: 41,
    departments: ['Comprehensive Burn ICU', 'Disaster Triage', 'Plastic & Reconstructive Surgery', 'Hyperbaric Medicine'],
    establishedYear: 2009,
  },
  {
    id: 'hosp-11',
    name: 'Suburban Memorial Community Hospital',
    region: 'East Bay Biomedical',
    location: 'Evergreen Parkway, Sector 9',
    rating: 4.7,
    contactNumber: '+1 (800) 555-0422',
    emergencyAvailable: true,
    icuAvailable: true,
    ambulanceAvailable: true,
    bloodBankAvailable: false,
    totalBeds: 160,
    availableBeds: 24,
    departments: ['Family Medicine', 'Geriatric Care', 'Physical Rehabilitation', 'Orthopedics'],
    establishedYear: 2003,
  },
];

// EXPANDED BLOOD RESERVES WITH SPECIFIC DONOR PROFILES
const INITIAL_BLOOD_RESERVES: BloodReserve[] = [
  {
    bloodGroup: 'B+',
    units: 36,
    status: 'SUFFICIENT',
    lastUpdated: '10 mins ago',
    donors: [
      { id: 'd-1', donorName: 'Ramesh K. (Voluntary Regular)', bloodGroup: 'B+', unitsContributed: 4, lastDonationDate: '12 Aug 2026', contactVerified: true, donorClub: 'Red Cross Life Donors', location: 'Metro City Central' },
      { id: 'd-2', donorName: 'Sneha Patel', bloodGroup: 'B+', unitsContributed: 2, lastDonationDate: '01 Sep 2026', contactVerified: true, donorClub: 'Apex Corporate Blood Drive', location: 'South Medical Hub' },
      { id: 'd-3', donorName: 'Vikrant Roy', bloodGroup: 'B+', unitsContributed: 6, lastDonationDate: '20 Jul 2026', contactVerified: true, donorClub: 'Police Voluntary Brigade', location: 'East Bay' },
    ],
  },
  {
    bloodGroup: 'O+',
    units: 52,
    status: 'SUFFICIENT',
    lastUpdated: '15 mins ago',
    donors: [
      { id: 'd-4', donorName: 'Amit Saxena', bloodGroup: 'O+', unitsContributed: 8, lastDonationDate: '18 Aug 2026', contactVerified: true, donorClub: 'Universal Donor Network', location: 'North Corridor' },
      { id: 'd-5', donorName: 'Priya Joshi', bloodGroup: 'O+', unitsContributed: 3, lastDonationDate: '05 Sep 2026', contactVerified: true, donorClub: 'Metro Red Cross', location: 'Metro Central' },
    ],
  },
  {
    bloodGroup: 'O-',
    units: 7,
    status: 'CRITICAL',
    lastUpdated: '5 mins ago',
    donors: [
      { id: 'd-6', donorName: 'Carlos Mendez (On-Call Universal)', bloodGroup: 'O-', unitsContributed: 12, lastDonationDate: '15 Jun 2026', contactVerified: true, donorClub: 'Emergency O- Negative Shield', location: 'South Hub' },
    ],
  },
  {
    bloodGroup: 'A+',
    units: 41,
    status: 'SUFFICIENT',
    lastUpdated: '25 mins ago',
    donors: [
      { id: 'd-7', donorName: 'Deepak Sharma', bloodGroup: 'A+', unitsContributed: 5, lastDonationDate: '10 Sep 2026', contactVerified: true, donorClub: 'Tech City Blood Network', location: 'North Tech' },
    ],
  },
  {
    bloodGroup: 'A-',
    units: 11,
    status: 'LOW',
    lastUpdated: '1 hour ago',
    donors: [
      { id: 'd-8', donorName: 'Ananya Roy', bloodGroup: 'A-', unitsContributed: 3, lastDonationDate: '02 Jul 2026', contactVerified: true, donorClub: 'Red Cross A- Club', location: 'West Coast' },
    ],
  },
  {
    bloodGroup: 'AB+',
    units: 18,
    status: 'SUFFICIENT',
    lastUpdated: '30 mins ago',
    donors: [
      { id: 'd-9', donorName: 'Harish Mehta', bloodGroup: 'AB+', unitsContributed: 4, lastDonationDate: '14 Aug 2026', contactVerified: true, donorClub: 'Universal Plasma Donor Wing', location: 'East Bay' },
    ],
  },
  {
    bloodGroup: 'AB-',
    units: 4,
    status: 'CRITICAL',
    lastUpdated: '10 mins ago',
    donors: [
      { id: 'd-10', donorName: 'Evelyn Reed (Emergency Reserve)', bloodGroup: 'AB-', unitsContributed: 2, lastDonationDate: '11 May 2026', contactVerified: true, donorClub: 'Rare Blood Group Registry', location: 'Metro Central' },
    ],
  },
  {
    bloodGroup: 'B-',
    units: 9,
    status: 'LOW',
    lastUpdated: '45 mins ago',
    donors: [
      { id: 'd-11', donorName: 'Kunal Sen', bloodGroup: 'B-', unitsContributed: 4, lastDonationDate: '28 Jul 2026', contactVerified: true, donorClub: 'B- Negative Care Club', location: 'South Hub' },
    ],
  },
];

// EXPANDED ORGAN DONATION DIRECTORY
const INITIAL_ORGAN_DONORS: OrganDonorListing[] = [
  {
    id: 'org-1',
    organ: 'Kidney (Living & Deceased Candidate)',
    compatibility: 'B+ & O+ Compatible',
    donorType: 'Living Donor',
    registryOrganization: 'National Organ & Tissue Transplant Organization (NOTTO)',
    status: '3 Pre-Cleared Donors in Region',
    region: 'Metro City Central',
    affiliatedHospital: 'ABC Hospital Network (Renal Wing)',
    emergencyHotline: '+1 (800) 555-NOTTO',
  },
  {
    id: 'org-2',
    organ: 'Corneal Graft Tissue (Pair Available)',
    compatibility: 'Universal HLA Match',
    donorType: 'Tissue Bank',
    registryOrganization: 'Apex Eye Bank & Vision Restoration Society',
    status: '4 Viable Corneas Preserved in Cold Storage (72 hr)',
    region: 'North Tech Corridor',
    affiliatedHospital: 'XYZ Superspeciality Hospital',
    emergencyHotline: '+1 (800) 555-EYEBANK',
  },
  {
    id: 'org-3',
    organ: 'Liver (Split-graft donor available)',
    compatibility: 'B+ Match Required',
    donorType: 'Split-graft',
    registryOrganization: 'State Organ Sharing Network (SOSN)',
    status: 'Priority Waiting Queue Position #2',
    region: 'South Medical Hub',
    affiliatedHospital: 'Apollo Metro Care Institute',
    emergencyHotline: '+1 (800) 555-LIVER',
  },
  {
    id: 'org-4',
    organ: 'Heart (Transplant Program)',
    compatibility: 'B+ / Weight 70-80 kg matched',
    donorType: 'Cadaveric Donor',
    registryOrganization: 'Interstate Heart Sharing Network (IHSN)',
    status: 'On Active Emergency Green-Corridor Alert',
    region: 'Metro City Central',
    affiliatedHospital: 'ABC Hospital Network (Cardiothoracic Wing)',
    emergencyHotline: '+1 (800) 555-HEART',
  },
  {
    id: 'org-5',
    organ: 'Double Lungs (Transplant Candidate Pool)',
    compatibility: 'Height 175-180cm / B+ / O+',
    donorType: 'Cadaveric Donor',
    registryOrganization: 'Pulmonary Transplant Registry',
    status: 'Candidate Profile Registered & Grounded',
    region: 'South Medical Hub',
    affiliatedHospital: 'Apollo Metro Care Institute',
    emergencyHotline: '+1 (800) 555-LUNGS',
  },
  {
    id: 'org-6',
    organ: 'Bone Marrow & Peripheral Blood Stem Cells (HPC)',
    compatibility: '10/10 HLA Matched Donor Active',
    donorType: 'Living Donor',
    registryOrganization: 'DATRI Blood Stem Cell Donors Registry',
    status: 'Verified Match Ready for Stem Cell Harvest',
    region: 'West Coast Healthcare Zone',
    affiliatedHospital: 'Max Life Institute of Sciences',
    emergencyHotline: '+1 (800) 555-MARROW',
  },
  {
    id: 'org-7',
    organ: 'Pancreas & Islet Cell Graft',
    compatibility: 'B+ / Fasting C-peptide negative matched',
    donorType: 'Cadaveric Donor',
    registryOrganization: 'National Pancreas Transplant Network',
    status: 'Donor Allocation Review Active',
    region: 'Metro City Central',
    affiliatedHospital: 'Mercy General Academic Medical Center',
    emergencyHotline: '+1 (800) 555-PANCREAS',
  },
  {
    id: 'org-8',
    organ: 'Cryopreserved Heart Valve Allograft (Aortic & Pulmonary)',
    compatibility: 'Universal Blood Compatibility',
    donorType: 'Tissue Bank',
    registryOrganization: 'Cardiovascular Tissue Processing Center',
    status: '5 Cryopreserved Valves Available in Nitrogen Vapor (-196°C)',
    region: 'Metro City Central',
    affiliatedHospital: 'ABC Hospital Network (Cardiothoracic Wing)',
    emergencyHotline: '+1 (800) 555-VALVES',
  },
  {
    id: 'org-9',
    organ: 'Acellular Dermal Matrix & Burn Skin Graft',
    compatibility: 'Universal Biological Allograft',
    donorType: 'Tissue Bank',
    registryOrganization: 'Pacific Skin & Tissue Bank',
    status: 'Ready for Immediate Trauma Burn Dispatch',
    region: 'West Coast Healthcare Zone',
    affiliatedHospital: 'Pacific Coast Trauma & Burn Institute',
    emergencyHotline: '+1 (800) 555-SKINGRAFT',
  },
];

const INITIAL_EMERGENCY_RECORDS: EmergencyRecord[] = [
  {
    id: 'emr-1',
    temporaryEmergencyId: 'TEMP-EMR-10042',
    arrivalTime: 'Today, 07:45 AM',
    arrivalMode: 'Ambulance 108',
    ambulanceId: 'AMB-108-ALPHA',
    approxAge: '35 - 40',
    gender: 'MALE',
    bloodGroup: 'UNKNOWN',
    condition: 'UNCONSCIOUS',
    visibleTrauma: 'Head laceration, blunt chest impact from highway collision. Intubated on route.',
    broughtBy: 'Paramedic Dave & Officer Miller',
    belongings: [
      { item: 'Black leather wallet (No photo ID found)', quantity: 1, condition: 'Intact', custodyStatus: 'SECURED' },
      { item: 'Smartphone (Locked, cracked glass)', quantity: 1, condition: 'Battery active', custodyStatus: 'SECURED' },
      { item: 'Silver wrist watch', quantity: 1, condition: 'Scratched', custodyStatus: 'SECURED' },
      { item: 'Vehicle keys on carabiner', quantity: 1, condition: 'Intact', custodyStatus: 'SECURED' },
    ],
    triageNotes: 'Immediate CT scan ordered. Trauma code blue activated. Crossmatch pending blood group verification.',
    status: 'ACTIVE_TRIAGE',
  },
];

const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'log-1',
    timestamp: '04 Oct 2026, 08:30:12',
    actorName: 'Dr. Anjali Rao',
    actorRole: 'DOCTOR',
    action: 'RECORD_ACCESS',
    targetPatientMediId: 'MED-7X29K4',
    details: 'Reviewed 24-hr continuous telemetry Lead II and issued morning vital sign chart sign-off.',
  },
  {
    id: 'log-2',
    timestamp: '04 Oct 2026, 08:15:00',
    actorName: 'Staff Nurse Jenkins',
    actorRole: 'HOSPITAL_ADMIN',
    action: 'MEDICATION_ADMINISTERED',
    targetPatientMediId: 'MED-7X29K4',
    details: 'Logged morning oral tablet Medicine A (Metformin ER 500mg) administered post breakfast.',
  },
  {
    id: 'log-3',
    timestamp: '04 Oct 2026, 07:50:22',
    actorName: 'Triage Desk EMT',
    actorRole: 'EMERGENCY_STAFF',
    action: 'EMERGENCY_INTAKE',
    targetPatientMediId: 'TEMP-EMR-10042',
    details: 'Provisioned temporary emergency identifier for unconscious highway trauma patient brought by Ambulance 108.',
  },
];

const HealthcareContext = createContext<HealthcareContextType | undefined>(undefined);

export const HealthcareProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUserRole, setCurrentUserRole] = useState<UserRole>('PATIENT');
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(true);

  const [activePatient, setActivePatient] = useState({
    name: 'Rahul Kumar',
    mediId: 'MED-7X29K4',
    bloodGroup: 'B+' as BloodGroup,
    allergy: 'Penicillin',
    attendingDoctor: 'Dr. Anjali Rao',
    hospital: 'ABC Hospital Network',
    isAdmitted: true,
    assignedWard: 'Ward: ICU',
    assignedBed: 'Bed: ICU-07',
    admissionDate: '04 Oct 2026',
    emergencyContact: '+1 (555) 392-1082 (Spouse: Priya Kumar)',
    vitals: INITIAL_VITALS,
    chronicConditions: [
      'Type II Diabetes Mellitus (Controlled, HbA1c 6.8%)',
      'Mild Sinus Tachycardia (Transient with physical/mental stress)',
      'Essential Hypertension (Borderline controlled, 120-126/80-84 mmHg)',
      'Mild Sleep Disordered Breathing (Snoring index monitored)',
      'Early L4-L5 Lumbar Disc Desiccation',
    ],
    adverseReactions: [
      'Grade III Anaphylactoid Reaction to Penicillin & Amoxicillin (Severe Facial Angioedema & Urticaria)',
      'Mild Cutaneous Sensitivity to Sulfonamide Antibiotics',
    ],
    surgicalHistory: [
      'Emergency Laparoscopic Appendectomy (09 Jan 2021, Apollo Metro Care, Dr. Amitav Ghosh)',
    ],
    belongings: INITIAL_BELONGINGS,
  });

  const [medicationSchedule, setMedicationSchedule] = useState<MedicationScheduleItem[]>(INITIAL_MEDICINE_SCHEDULE);
  const [appointments, setAppointments] = useState<Appointment[]>(INITIAL_APPOINTMENTS);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>(INITIAL_PRESCRIPTIONS);
  const [medicalVisits, setMedicalVisits] = useState<MedicalVisit[]>(INITIAL_VISITS);
  const [bpRecords] = useState<BpRecord[]>(INITIAL_BP_RECORDS);
  const [medicalScans] = useState<MedicalScan[]>(INITIAL_SCANS);
  const [wards, setWards] = useState<Ward[]>(INITIAL_WARDS);
  const [hospitalFacilities] = useState<HospitalFacility[]>(INITIAL_FACILITIES);
  const [bloodReserves, setBloodReserves] = useState<BloodReserve[]>(INITIAL_BLOOD_RESERVES);
  const [organDonorListings] = useState<OrganDonorListing[]>(INITIAL_ORGAN_DONORS);
  const [emergencyRecords, setEmergencyRecords] = useState<EmergencyRecord[]>(INITIAL_EMERGENCY_RECORDS);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(INITIAL_AUDIT_LOGS);
  const [notifications, setNotifications] = useState([
    { id: 'notif-1', title: 'Telemetry Sync Normal: Lead II streaming to ICU nursing station', time: '10m ago', read: false, type: 'info' as const },
    { id: 'notif-2', title: 'Upcoming Medicine: Medicine B scheduled for 01:00 PM (Before Lunch)', time: '45m ago', read: false, type: 'alert' as const },
    { id: 'notif-3', title: 'Appointment Confirmed with Dr. Anjali Rao for Oct 15 at 10:30 AM', time: '2h ago', read: true, type: 'appointment' as const },
  ]);

  // Subtle real-time heart rate variation (resting 70-74 bpm)
  useEffect(() => {
    const interval = setInterval(() => {
      setActivePatient((prev) => ({
        ...prev,
        vitals: {
          ...prev.vitals,
          heartRate: 70 + Math.floor(Math.random() * 5),
        },
      }));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Validate Firestore and Supabase connection on boot
  useEffect(() => {
    testFirebaseConnection()
      .then((connected) => {
        if (connected) {
          console.info('[Firebase] Firestore connected and verified with provisioned database.');
        }
      })
      .catch((err) => {
        console.warn('[Firebase] Connection verification warning:', err);
      });

    // Background connection test to Supabase
    testSupabaseConnection()
      .then((ok) => {
        if (ok) {
          syncPatientToSupabase(activePatient);
        }
      })
      .catch((err) => {
        console.info('[Supabase] Initial background sync status:', err);
      });
  }, []);

  const login = (role: UserRole, _identifier?: string) => {
    setCurrentUserRole(role);
    setIsLoggedIn(true);
    addAuditLogEntry('USER_LOGIN', `Authenticated successfully with role ${role}`);
  };

  const logout = () => {
    setIsLoggedIn(false);
  };

  const switchRole = (role: UserRole) => {
    setCurrentUserRole(role);
    setIsLoggedIn(true);
    addAuditLogEntry('ROLE_SWITCH', `Switched application context to ${role}`);
  };

  const addAuditLogEntry = (action: string, details: string) => {
    const newLog: AuditLogEntry = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleString('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      }),
      actorName: currentUserRole === 'DOCTOR' ? 'Dr. Anjali Rao' : currentUserRole === 'HOSPITAL_ADMIN' ? 'ABC Admin' : currentUserRole === 'EMERGENCY_STAFF' ? 'Triage Officer' : activePatient.name,
      actorRole: currentUserRole,
      action,
      targetPatientMediId: activePatient.mediId,
      details,
    };
    setAuditLogs((prev) => [newLog, ...prev]);
    syncAuditLogToSupabase(newLog);
  };

  const toggleMedicationTaken = (id: string) => {
    setMedicationSchedule((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const updatedTaken = !item.taken;
          const updatedItem = {
            ...item,
            taken: updatedTaken,
            takenAt: updatedTaken ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : undefined,
          };
          addAuditLogEntry(
            updatedTaken ? 'MEDICATION_TAKEN' : 'MEDICATION_UNMARKED',
            `Patient marked ${item.name} (${item.dosage}) as ${updatedTaken ? 'TAKEN' : 'UNTAKEN'}`
          );
          return updatedItem;
        }
        return item;
      })
    );
  };

  const toggleAdmittedStatus = () => {
    setActivePatient((prev) => {
      const nextAdmitted = !prev.isAdmitted;
      addAuditLogEntry(
        nextAdmitted ? 'ADMISSION_SIMULATION' : 'DISCHARGE_SIMULATION',
        `Inpatient status changed to ${nextAdmitted ? 'Currently Admitted (ICU Bed 07)' : 'Discharged / Outpatient'}`
      );
      return {
        ...prev,
        isAdmitted: nextAdmitted,
      };
    });
  };

  const bookAppointment = (newApptData: Omit<Appointment, 'id' | 'status' | 'relativeDays'>) => {
    const newAppt: Appointment = {
      ...newApptData,
      id: `appt-${Date.now()}`,
      status: 'CONFIRMED',
      relativeDays: 'Upcoming',
    };
    setAppointments((prev) => [newAppt, ...prev]);
    addNotification(`Appointment booked with ${newAppt.doctorName} for ${newAppt.date} at ${newAppt.time}`, 'appointment');
    addAuditLogEntry('APPOINTMENT_SCHEDULED', `Booked appointment with ${newAppt.doctorName} at ${newAppt.hospitalName}`);

    // Synchronize to Firestore
    try {
      const apptDoc = doc(db, 'appointments', newAppt.id);
      setDoc(apptDoc, {
        id: newAppt.id,
        patientId: newAppt.patientMediId || activePatient.mediId,
        patientName: newAppt.patientName || activePatient.name,
        doctorId: newAppt.doctorName,
        doctorName: newAppt.doctorName,
        department: newAppt.doctorSpecialty || 'General Medicine',
        hospitalName: newAppt.hospitalName,
        date: newAppt.date,
        time: newAppt.time,
        status: newAppt.status,
        reason: newAppt.reason || 'Consultation',
      }).catch((e) => console.info('Firestore appointment sync notice:', e));
    } catch (e) {
      console.info('Firestore appt err:', e);
    }

    // Synchronize to Supabase appointments table
    syncAppointmentToSupabase(newAppt);
  };

  const cancelAppointment = (id: string) => {
    setAppointments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: 'CANCELLED' } : a))
    );
    addNotification('Appointment was cancelled successfully', 'info');
    addAuditLogEntry('APPOINTMENT_CANCELLED', `Cancelled appointment ID ${id}`);

    try {
      const apptDoc = doc(db, 'appointments', id);
      setDoc(apptDoc, { status: 'CANCELLED' }, { merge: true }).catch(() => {});
    } catch {
      // offline fallback
    }

    // Synchronize cancellation to Supabase
    syncAppointmentToSupabase({ id, status: 'CANCELLED' });
  };

  const createPrescription = (newRxData: Omit<Prescription, 'id' | 'prescriptionNumber' | 'date' | 'refillCount' | 'maxRefills'>) => {
    const newRxNumber = `PR${Math.floor(10000 + Math.random() * 90000)}`;
    const newRx: Prescription = {
      ...newRxData,
      id: `rx-${Date.now()}`,
      prescriptionNumber: newRxNumber,
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      refillCount: 0,
      maxRefills: 3,
    };
    setPrescriptions((prev) => [newRx, ...prev]);

    // Automatically synchronize into active patient medication schedule
    if (newRxData.items && newRxData.items.length > 0) {
      const newScheduleItems: MedicationScheduleItem[] = newRxData.items.map((med, idx) => ({
        id: `med-dyn-${Date.now()}-${idx}`,
        name: med.medicineName,
        dosage: med.dosage,
        doctor: newRxData.doctorName,
        instructions: med.instructions || 'Take as prescribed',
        timeSlot: idx === 0 ? '08:00 AM' : idx === 1 ? '01:00 PM' : '08:00 PM',
        periodLabel: idx === 0 ? 'Morning Dose' : idx === 1 ? 'Afternoon Dose' : 'Evening Dose',
        relationToFood: med.foodTiming.toLowerCase().includes('before') ? 'Before Lunch' : 'Post Dinner',
        details: `Oral Tablet • ${med.dosage} • ${newRxData.doctorName}`,
        taken: false,
      }));
      setMedicationSchedule((prev) => [...prev, ...newScheduleItems]);
    }

    addNotification(`New prescription #${newRxNumber} issued by ${newRxData.doctorName}`, 'alert');
    addAuditLogEntry('PRESCRIPTION_ISSUED', `Doctor ${newRxData.doctorName} prescribed ${newRx.items.length} items to ${newRx.patientName}`);

    // Synchronize to Firestore
    try {
      const rxDoc = doc(db, 'prescriptions', newRx.id);
      setDoc(rxDoc, {
        id: newRx.id,
        patientId: newRx.patientMediId || activePatient.mediId,
        patientName: newRx.patientName || activePatient.name,
        doctorName: newRx.doctorName,
        hospitalName: activePatient.hospital || 'ABC Multispeciality Hospital',
        date: newRx.date,
        diagnosis: newRx.diagnosis || 'Clinical consultation',
        status: 'Active',
        createdAt: new Date().toISOString(),
      }).catch((e) => console.info('Firestore rx sync notice:', e));
    } catch (e) {
      console.info('Firestore rx err:', e);
    }

    // Synchronize to Supabase prescriptions table
    syncPrescriptionToSupabase(newRx);
  };

  const admitPatientToBed = (bedId: string, patientMediId: string, patientName: string) => {
    setWards((prev) =>
      prev.map((ward) => ({
        ...ward,
        beds: ward.beds.map((bed) => {
          if (bed.id === bedId) {
            return {
              ...bed,
              status: 'OCCUPIED',
              assignedPatientMediId: patientMediId,
              assignedPatientName: patientName,
              admissionDate: 'Today',
            };
          }
          return bed;
        }),
      }))
    );
    addAuditLogEntry('BED_ASSIGNMENT', `Patient ${patientName} (${patientMediId}) admitted to bed ${bedId}`);
  };

  const dischargeBed = (bedId: string) => {
    setWards((prev) =>
      prev.map((ward) => ({
        ...ward,
        beds: ward.beds.map((bed) => {
          if (bed.id === bedId) {
            return {
              ...bed,
              status: 'AVAILABLE',
              assignedPatientMediId: undefined,
              assignedPatientName: undefined,
              admissionDate: undefined,
            };
          }
          return bed;
        }),
      }))
    );
    addAuditLogEntry('BED_DISCHARGE', `Discharged patient from bed ${bedId}`);
  };

  const updateBedStatus = (bedId: string, status: Bed['status']) => {
    setWards((prev) =>
      prev.map((ward) => ({
        ...ward,
        beds: ward.beds.map((bed) => (bed.id === bedId ? { ...bed, status } : bed)),
      }))
    );
  };

  const createEmergencyIntake = (intakeData: Omit<EmergencyRecord, 'id' | 'temporaryEmergencyId' | 'arrivalTime' | 'status'>) => {
    const tempId = `TEMP-EMR-${Math.floor(10000 + Math.random() * 90000)}`;
    const newRecord: EmergencyRecord = {
      ...intakeData,
      id: `emr-${Date.now()}`,
      temporaryEmergencyId: tempId,
      arrivalTime: 'Just now',
      status: 'ACTIVE_TRIAGE',
    };
    setEmergencyRecords((prev) => [newRecord, ...prev]);
    addNotification(`🚨 Emergency Trauma Intake registered: ${tempId} (${newRecord.condition})`, 'alert');
    addAuditLogEntry('EMERGENCY_INTAKE', `Created emergency intake ${tempId} for condition ${newRecord.condition}`);
    return tempId;
  };

  const linkEmergencyRecordToPatient = (emergencyId: string, mediId: string) => {
    const foundPatient = (mediId.toUpperCase() === 'MED-7X29K4' || mediId.toLowerCase().includes('rahul')) ? activePatient : null;
    setEmergencyRecords((prev) =>
      prev.map((rec) => {
        if (rec.id === emergencyId || rec.temporaryEmergencyId === emergencyId) {
          return {
            ...rec,
            patientMediId: mediId,
            patientName: foundPatient ? foundPatient.name : 'Verified Patient',
            bloodGroup: foundPatient ? foundPatient.bloodGroup : rec.bloodGroup,
          };
        }
        return rec;
      })
    );
    addNotification(`Emergency case linked to Medi ID: ${mediId}`, 'info');
    addAuditLogEntry('EMERGENCY_LINKED', `Linked temporary emergency case ${emergencyId} to Medi ID ${mediId}`);
  };

  const lookupPatientByMediId = (mediId: string) => {
    const cleanId = mediId.trim().toUpperCase();

    if (cleanId === 'MED-7X29K4' || mediId.toLowerCase().includes('rahul') || mediId.toLowerCase().includes('ravi')) {
      return {
        ...activePatient,
        prescriptions,
        medicalVisits,
        medicationSchedule,
        bpRecords,
        medicalScans,
      };
    }

    if (cleanId === 'MED-8K29L2' || mediId.toLowerCase().includes('priya')) {
      return {
        name: 'Priya Sharma',
        mediId: 'MED-8K29L2',
        bloodGroup: 'O+' as BloodGroup,
        allergy: 'Sulfa Drugs',
        attendingDoctor: 'Dr. Anjali Rao',
        hospital: 'ABC Multispeciality Hospital',
        isAdmitted: false,
        assignedWard: 'Outpatient Clinic',
        assignedBed: 'Ambulatory Room 102',
        admissionDate: 'None',
        emergencyContact: 'Rajesh Sharma (+1 555 991-0021)',
        vitals: { heartRate: 84, systolicBP: 142, diastolicBP: 92, spo2: 99, bodyTemp: 98.6, lastUpdated: 'Today, 09:15 AM' },
        chronicConditions: ['Essential Hypertension Stage 1', 'Chronic Episodic Migraine'],
        adverseReactions: ['Sulfa drug rash & angioedema'],
        surgicalHistory: ['Tonsillectomy (2012)'],
        prescriptions: [
          {
            id: 'rx-ps-1',
            prescriptionNumber: 'PR88201',
            patientMediId: 'MED-8K29L2',
            patientName: 'Priya Sharma',
            doctorName: 'Dr. Anjali Rao',
            doctorSpecialty: 'Internal Medicine',
            date: '12 Sep 2026',
            diagnosis: 'Hypertension Stage 1, Episodic Migraine',
            instructions: 'Monitor BP weekly; stay well hydrated',
            items: [
              { medicineName: 'Telmisartan', dosage: '40 mg', frequency: 'Once daily', duration: '90 days', foodTiming: 'Morning' },
              { medicineName: 'Rizatriptan', dosage: '10 mg', frequency: 'PRN', duration: 'As needed', foodTiming: 'Onset of migraine' },
            ],
            refillCount: 1,
            maxRefills: 4,
          },
        ],
        medicalVisits: [
          {
            id: 'vis-ps-1',
            date: '12 Sep 2026',
            year: 2026,
            hospitalName: 'ABC Multispeciality Hospital',
            doctorName: 'Dr. Anjali Rao',
            specialty: 'Internal Medicine',
            reason: 'Hypertension surveillance & migraine review',
            diagnosis: 'Essential Hypertension Stage 1 without target organ damage',
            symptoms: ['Occipital headache', 'Mild fatigue'],
            treatment: 'Lifestyle modification, initiated Telmisartan 40mg',
            durationDays: 0,
            tabletsGiven: ['Telmisartan 40mg', 'Rizatriptan 10mg'],
            category: 'outpatient' as const,
          },
        ],
        belongings: [],
      };
    }

    if (cleanId === 'MED-9L82P3' || mediId.toLowerCase().includes('arun')) {
      return {
        name: 'Arun Kumar',
        mediId: 'MED-9L82P3',
        bloodGroup: 'A+' as BloodGroup,
        allergy: 'Aspirin & NSAIDs (Severe bronchospasm)',
        attendingDoctor: 'Dr. Vikram Seth',
        hospital: 'Mercy General Academic Medical Center',
        isAdmitted: false,
        assignedWard: 'Cardiology Ambulatory Wing',
        assignedBed: 'Room 312',
        admissionDate: 'None',
        emergencyContact: 'Sunita Kumar (+1 555 481-9923)',
        vitals: { heartRate: 68, systolicBP: 124, diastolicBP: 78, spo2: 98, bodyTemp: 98.2, lastUpdated: 'Today, 10:45 AM' },
        chronicConditions: ['Coronary Artery Disease (CAD)', 'Status-post PTCA Stenting (LAD 2024)', 'Mixed Dyslipidemia'],
        adverseReactions: ['Aspirin-induced asthma / Bronchospasm', 'Ibuprofen facial angioedema'],
        surgicalHistory: ['Percutaneous Coronary Intervention / Drug Eluting Stent (2024)'],
        prescriptions: [
          {
            id: 'rx-ak-1',
            prescriptionNumber: 'PR77192',
            patientMediId: 'MED-9L82P3',
            patientName: 'Arun Kumar',
            doctorName: 'Dr. Vikram Seth',
            doctorSpecialty: 'Cardiology',
            date: '02 Aug 2026',
            diagnosis: 'Ischemic Heart Disease s/p DES LAD stenting',
            instructions: 'Do not discontinue Clopidogrel without consulting cardiologist',
            items: [
              { medicineName: 'Clopidogrel (Plavix)', dosage: '75 mg', frequency: 'Once daily', duration: '180 days', foodTiming: 'Morning' },
              { medicineName: 'Atorvastatin', dosage: '40 mg', frequency: 'Once daily', duration: '180 days', foodTiming: 'Bedtime' },
            ],
            refillCount: 2,
            maxRefills: 5,
          },
        ],
        medicalVisits: [
          {
            id: 'vis-ak-1',
            date: '14 Jun 2024',
            year: 2024,
            hospitalName: 'Mercy General Academic Medical Center',
            doctorName: 'Dr. Vikram Seth',
            specialty: 'Interventional Cardiology',
            reason: 'Acute NSTEMI chest pain',
            diagnosis: 'Acute Coronary Syndrome, 85% mid-LAD occlusion',
            symptoms: ['Substernal pressure', 'Diaphoresis'],
            treatment: 'Emergent Cardiac Cath with 3.0x18mm DES placement',
            durationDays: 3,
            tabletsGiven: ['Clopidogrel 300mg load then 75mg', 'Atorvastatin 80mg', 'Metoprolol 25mg'],
            category: 'inpatient' as const,
          },
        ],
        belongings: [],
      };
    }

    if (cleanId === 'MED-4M99T1' || mediId.toLowerCase().includes('amina')) {
      return {
        name: 'Amina Khan',
        mediId: 'MED-4M99T1',
        bloodGroup: 'B-' as BloodGroup,
        allergy: 'Codeine & Synthetic Opioids (Severe anaphylactoid reaction)',
        attendingDoctor: 'Dr. Sarah Jenkins',
        hospital: 'Valley Children & Women Specialty Hospital',
        isAdmitted: false,
        assignedWard: 'Rheumatology Clinic',
        assignedBed: 'Ambulatory Suite 4B',
        admissionDate: 'None',
        emergencyContact: 'Tariq Khan (+1 555 771-4412)',
        vitals: { heartRate: 76, systolicBP: 114, diastolicBP: 74, spo2: 99, bodyTemp: 98.7, lastUpdated: 'Today, 08:30 AM' },
        chronicConditions: ['Systemic Lupus Erythematosus (SLE)', 'Class II Lupus Nephritis (Quiescent)', "Secondary Raynaud's Phenomenon"],
        adverseReactions: ['Codeine histamine crash & hypotension', 'Tramadol severe emesis'],
        surgicalHistory: ['Renal Biopsy (2022)'],
        prescriptions: [
          {
            id: 'rx-ak2-1',
            prescriptionNumber: 'PR99401',
            patientMediId: 'MED-4M99T1',
            patientName: 'Amina Khan',
            doctorName: 'Dr. Sarah Jenkins',
            doctorSpecialty: 'Rheumatology',
            date: '18 Jul 2026',
            diagnosis: 'Quiescent Systemic Lupus Erythematosus',
            instructions: 'Annual ophthalmology retinal screen mandatory',
            items: [
              { medicineName: 'Hydroxychloroquine (Plaquenil)', dosage: '200 mg', frequency: 'Once daily', duration: '90 days', foodTiming: 'With lunch' },
              { medicineName: 'Prednisone', dosage: '5 mg', frequency: 'Once daily', duration: '30 days', foodTiming: 'Morning' },
            ],
            refillCount: 2,
            maxRefills: 4,
          },
        ],
        medicalVisits: [],
        belongings: [],
      };
    }

    if (cleanId === 'MED-5B12X9' || mediId.toLowerCase().includes('david')) {
      return {
        name: 'David Miller',
        mediId: 'MED-5B12X9',
        bloodGroup: 'AB+' as BloodGroup,
        allergy: 'ACE-Inhibitors (Lisinopril/Enalapril - Severe Angioedema)',
        attendingDoctor: 'Dr. Richard Vance',
        hospital: 'Suburban Memorial Community Hospital',
        isAdmitted: false,
        assignedWard: 'Pulmonary / Cardiac Care',
        assignedBed: 'Outpatient Bed 14',
        admissionDate: 'None',
        emergencyContact: 'Karen Miller (+1 555 332-8819)',
        vitals: { heartRate: 82, systolicBP: 128, diastolicBP: 82, spo2: 95, bodyTemp: 98.3, lastUpdated: 'Today, 11:20 AM' },
        chronicConditions: ['COPD GOLD Stage 2', 'Persistent Atrial Fibrillation (AFib)', 'History of Smoking (35 pack-years)'],
        adverseReactions: ['Lisinopril-induced laryngeal angioedema (2021)'],
        surgicalHistory: ['Elective DC Cardioversion (2024)'],
        prescriptions: [],
        medicalVisits: [],
        belongings: [],
      };
    }

    // Dynamic Fallback for any newly created or custom Medi ID
    return {
      name: `Patient (${cleanId})`,
      mediId: cleanId,
      bloodGroup: 'O+' as BloodGroup,
      allergy: 'None on primary file',
      attendingDoctor: 'Dr. Anjali Rao',
      hospital: 'ABC Multispeciality Hospital',
      isAdmitted: false,
      emergencyContact: 'Emergency Kin (+1 555 000-1122)',
      vitals: { heartRate: 72, systolicBP: 120, diastolicBP: 80, spo2: 98, bodyTemp: 98.4, lastUpdated: 'Today' },
      chronicConditions: ['Preventive Surveillance'],
      adverseReactions: [],
      surgicalHistory: [],
      prescriptions: [],
      medicalVisits: [],
      belongings: [],
    };
  };

  const requestPrescriptionRefill = (prescriptionId: string) => {
    setPrescriptions((prev) =>
      prev.map((p) => {
        if (p.id === prescriptionId && p.refillCount < p.maxRefills) {
          return { ...p, refillCount: p.refillCount + 1 };
        }
        return p;
      })
    );
    addNotification('Refill request transmitted to ABC Hospital Clinical Pharmacy.', 'info');
    addAuditLogEntry('PRESCRIPTION_REFILL_REQUEST', `Patient requested refill for Rx #${prescriptionId}`);
  };

  const addNotification = (title: string, type: 'info' | 'alert' | 'appointment' = 'info') => {
    setNotifications((prev) => [
      { id: `notif-${Date.now()}`, title, time: 'Just now', read: false, type },
      ...prev,
    ]);
  };

  const clearNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <HealthcareContext.Provider
      value={{
        currentUserRole,
        isLoggedIn,
        activePatient,
        medicationSchedule,
        appointments,
        prescriptions,
        medicalVisits,
        bpRecords,
        medicalScans,
        wards,
        hospitalFacilities,
        bloodReserves,
        organDonorListings,
        emergencyRecords,
        auditLogs,
        notifications,
        login,
        logout,
        switchRole,
        toggleMedicationTaken,
        toggleAdmittedStatus,
        bookAppointment,
        cancelAppointment,
        createPrescription,
        admitPatientToBed,
        dischargeBed,
        updateBedStatus,
        createEmergencyIntake,
        linkEmergencyRecordToPatient,
        lookupPatientByMediId,
        requestPrescriptionRefill,
        addNotification,
        clearNotification,
      }}
    >
      {children}
    </HealthcareContext.Provider>
  );
};

export const useHealthcare = () => {
  const context = useContext(HealthcareContext);
  if (!context) {
    throw new Error('useHealthcare must be used within a HealthcareProvider');
  }
  return context;
};
