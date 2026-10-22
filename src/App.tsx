import React, { useState } from 'react';
import { HealthcareProvider, useHealthcare } from './context/HealthcareContext';
import { Header } from './components/common/Header';
import { LoginPage } from './components/auth/LoginPage';
import { PatientDashboard } from './components/patient/PatientDashboard';
import { PatientDetailsView } from './components/patient/PatientDetailsView';
import { MedicalHistoryView } from './components/patient/MedicalHistoryView';
import { HospitalView } from './components/patient/HospitalView';
import { PrescriptionsView } from './components/patient/PrescriptionsView';
import { AuditLedgerModal } from './components/patient/AuditLedgerModal';
import { GlobalSearchModal } from './components/common/GlobalSearchModal';
import { DoctorPortal } from './components/doctor/DoctorPortal';
import { HospitalPortal } from './components/hospital/HospitalPortal';
import { EmergencyPortal } from './components/emergency/EmergencyPortal';

const HealthcareMain: React.FC = () => {
  const { isLoggedIn, currentUserRole } = useHealthcare();
  const [currentTab, setCurrentTab] = useState('Dashboard');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAuditLedgerOpen, setIsAuditLedgerOpen] = useState(false);

  if (!isLoggedIn) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen bg-[#f7f9fb] flex flex-col text-[#191c1e] font-['Inter'] selection:bg-[#cde5ff] selection:text-[#001d32]">
      {/* Universal Clinical Header */}
      <Header
        currentTab={currentTab}
        onTabChange={(tab) => setCurrentTab(tab)}
        onOpenSearch={() => setIsSearchOpen(true)}
      />

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* If Patient Role */}
        {currentUserRole === 'PATIENT' && (
          <>
            {currentTab === 'Dashboard' && (
              <PatientDashboard
                onNavigateTab={(tab) => setCurrentTab(tab)}
                onOpenAuditLedger={() => setIsAuditLedgerOpen(true)}
              />
            )}
            {currentTab === 'Details of Patient' && <PatientDetailsView />}
            {currentTab === 'Medical History' && <MedicalHistoryView />}
            {currentTab === 'Hospital' && <HospitalView />}
            {currentTab === 'Prescriptions' && <PrescriptionsView />}
          </>
        )}

        {/* If Doctor Role */}
        {currentUserRole === 'DOCTOR' && <DoctorPortal />}

        {/* If Hospital Management Role */}
        {currentUserRole === 'HOSPITAL_ADMIN' && <HospitalPortal />}

        {/* If Emergency Response Role */}
        {currentUserRole === 'EMERGENCY_STAFF' && <EmergencyPortal />}
      </main>

      {/* Modals */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectAction={(tab) => setCurrentTab(tab)}
      />

      <AuditLedgerModal
        isOpen={isAuditLedgerOpen}
        onClose={() => setIsAuditLedgerOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <HealthcareProvider>
      <HealthcareMain />
    </HealthcareProvider>
  );
}
