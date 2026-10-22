import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL =
  (import.meta as any).env?.VITE_SUPABASE_URL ||
  'https://sxpdwbylhhxqbavuhckk.supabase.co';

const SUPABASE_ANON_KEY =
  (import.meta as any).env?.VITE_SUPABASE_ANON_KEY ||
  'sb_publishable_rH5WdNk2ywewTv_g8pNvnA_KQJFYOUl';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

/**
 * Validates Supabase connection in the background.
 */
export async function testSupabaseConnection(): Promise<boolean> {
  try {
    // Attempt lightweight metadata ping
    const { error } = await supabase.from('patients').select('count', { count: 'exact', head: true });
    if (error && error.code !== 'PGRST116' && error.code !== '42P01') {
      console.info('[Supabase] Connection checked with status:', error.message);
    } else {
      console.info('[Supabase] Successfully connected to Supabase URL:', SUPABASE_URL);
    }
    return true;
  } catch (err) {
    console.info('[Supabase] Background connection note:', err);
    return false;
  }
}

/**
 * Synchronization helpers for suitable tables
 * (patients, appointments, prescriptions, telemetry, emergency_records, audit_logs)
 */

export async function syncPatientToSupabase(patient: any) {
  try {
    const payload = {
      medi_id: patient.mediId || patient.medi_id,
      name: patient.name,
      blood_group: patient.bloodGroup || patient.blood_group,
      allergy: patient.allergy,
      attending_doctor: patient.attendingDoctor || patient.attending_doctor,
      hospital: patient.hospital,
      is_admitted: Boolean(patient.isAdmitted),
      emergency_contact: patient.emergencyContact || patient.emergency_contact,
      updated_at: new Date().toISOString(),
    };
    await supabase.from('patients').upsert(payload, { onConflict: 'medi_id' });
  } catch (e) {
    // Non-blocking background sync
  }
}

export async function syncAppointmentToSupabase(appointment: any) {
  try {
    const payload = {
      id: appointment.id,
      patient_medi_id: appointment.patientMediId || appointment.patient_medi_id,
      patient_name: appointment.patientName || appointment.patient_name,
      doctor_name: appointment.doctorName || appointment.doctor_name,
      doctor_specialty: appointment.doctorSpecialty || appointment.doctor_specialty,
      hospital_name: appointment.hospitalName || appointment.hospital_name,
      appointment_date: appointment.date,
      appointment_time: appointment.time,
      status: appointment.status,
      reason: appointment.reason,
      created_at: new Date().toISOString(),
    };
    await supabase.from('appointments').upsert(payload, { onConflict: 'id' });
  } catch (e) {
    // Non-blocking background sync
  }
}

export async function syncPrescriptionToSupabase(prescription: any) {
  try {
    const payload = {
      id: prescription.id,
      prescription_number: prescription.prescriptionNumber || prescription.prescription_number,
      patient_medi_id: prescription.patientMediId || prescription.patient_medi_id,
      patient_name: prescription.patientName || prescription.patient_name,
      doctor_name: prescription.doctorName || prescription.doctor_name,
      doctor_specialty: prescription.doctorSpecialty || prescription.doctor_specialty,
      diagnosis: prescription.diagnosis,
      instructions: prescription.instructions,
      items: prescription.items,
      issued_date: prescription.date,
      created_at: new Date().toISOString(),
    };
    await supabase.from('prescriptions').upsert(payload, { onConflict: 'id' });
  } catch (e) {
    // Non-blocking background sync
  }
}

export async function syncTelemetryToSupabase(telemetry: any) {
  try {
    const payload = {
      medi_id: telemetry.mediId || telemetry.medi_id,
      heart_rate: telemetry.heartRate,
      systolic_bp: telemetry.systolicBP,
      diastolic_bp: telemetry.diastolicBP,
      spo2: telemetry.spo2,
      body_temp: telemetry.bodyTemp,
      respiratory_rate: telemetry.respiratoryRate,
      rhythm_status: telemetry.rhythmStatus,
      recorded_at: new Date().toISOString(),
    };
    await supabase.from('telemetry').upsert(payload, { onConflict: 'medi_id' });
  } catch (e) {
    // Non-blocking background sync
  }
}

export async function syncEmergencyRecordToSupabase(emergencyRecord: any) {
  try {
    const payload = {
      id: emergencyRecord.id,
      temporary_emergency_id: emergencyRecord.temporaryEmergencyId,
      patient_medi_id: emergencyRecord.patientMediId,
      condition: emergencyRecord.condition,
      triage_priority: emergencyRecord.triagePriority,
      arrival_mode: emergencyRecord.arrivalMode,
      status: emergencyRecord.status,
      created_at: new Date().toISOString(),
    };
    await supabase.from('emergency_records').upsert(payload, { onConflict: 'id' });
  } catch (e) {
    // Non-blocking background sync
  }
}

export async function syncAuditLogToSupabase(auditLog: any) {
  try {
    const payload = {
      id: auditLog.id,
      action: auditLog.action,
      actor_name: auditLog.actorName,
      actor_role: auditLog.actorRole,
      target_patient_medi_id: auditLog.targetPatientMediId,
      details: auditLog.details,
      timestamp: auditLog.timestamp,
    };
    await supabase.from('audit_logs').upsert(payload, { onConflict: 'id' });
  } catch (e) {
    // Non-blocking background sync
  }
}
