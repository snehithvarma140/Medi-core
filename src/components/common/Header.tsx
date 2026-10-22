import React, { useState } from 'react';
import { BrandLogo } from './BrandLogo';
import { useHealthcare } from '../../context/HealthcareContext';
import { UserRole } from '../../types/healthcare';

interface HeaderProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  onOpenSearch: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentTab, onTabChange, onOpenSearch }) => {
  const {
    currentUserRole,
    activePatient,
    switchRole,
    logout,
    notifications,
    clearNotification,
  } = useHealthcare();

  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [copiedMediId, setCopiedMediId] = useState(false);

  const unreadNotifs = notifications.filter((n) => !n.read).length;

  const handleCopyMediId = () => {
    navigator.clipboard?.writeText(activePatient.mediId);
    setCopiedMediId(true);
    setTimeout(() => setCopiedMediId(false), 2000);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 py-2.5 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        
        {/* Left: Brand */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => onTabChange('Dashboard')}
            className="flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0077b6] rounded-lg"
          >
            <BrandLogo size="md" />
          </button>

          {/* Center Tabs (only if Patient view) */}
          {currentUserRole === 'PATIENT' && (
            <nav className="hidden md:flex items-center gap-1.5 p-1 bg-[#f1f5f9] rounded-xl border border-slate-200/70">
              {['Dashboard', 'Details of Patient', 'Medical History', 'Hospital'].map((tab) => {
                const isActive = currentTab === tab;
                return (
                  <button
                    key={tab}
                    onClick={() => onTabChange(tab)}
                    className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                      isActive
                        ? 'bg-white text-[#005d90] shadow-xs border border-slate-200/80'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                    }`}
                  >
                    {tab}
                  </button>
                );
              })}
            </nav>
          )}

          {/* Doctor Header Title if Doctor role */}
          {currentUserRole === 'DOCTOR' && (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-200 rounded-lg">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
              <span className="text-xs font-semibold text-blue-900">Dr. Anjali Rao • Clinical EMR</span>
            </div>
          )}

          {/* Hospital Header Title if Hospital Admin role */}
          {currentUserRole === 'HOSPITAL_ADMIN' && (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-teal-50 border border-teal-200 rounded-lg">
              <span className="w-2 h-2 rounded-full bg-teal-600 animate-pulse"></span>
              <span className="text-xs font-semibold text-teal-900">ABC Hospital Management • Operations Console</span>
            </div>
          )}

          {/* Emergency Header Title if Emergency role */}
          {currentUserRole === 'EMERGENCY_STAFF' && (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-red-50 border border-red-200 rounded-lg">
              <span className="w-2 h-2 rounded-full bg-red-600 animate-ping"></span>
              <span className="text-xs font-bold text-red-900 uppercase tracking-wide">🚨 Rapid Emergency Triage Protocol</span>
            </div>
          )}
        </div>

        {/* Right Zone: Search, Notification Bell, User Profile Pill */}
        <div className="flex items-center gap-3">
          {/* Quick Search Bar */}
          <div className="relative hidden lg:block">
            <button
              onClick={onOpenSearch}
              className="flex items-center gap-2.5 w-64 px-3.5 py-1.5 text-xs text-slate-500 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-lg transition-colors text-left"
            >
              <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span className="truncate">Lookup records, rx, labs...</span>
              <kbd className="ml-auto text-[10px] font-mono bg-white px-1.5 py-0.5 rounded border border-slate-200 text-slate-400">⌘K</kbd>
            </button>
          </div>

          {/* Notification Bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotifMenu(!showNotifMenu)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors relative cursor-pointer"
              title="Notifications"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {unreadNotifs > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-cyan-500 ring-2 ring-white"></span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifMenu && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-slate-200 p-3 z-50 animate-in fade-in slide-in-from-top-1">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
                  <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">Clinical Alerts & Updates</span>
                  <span className="text-[11px] text-slate-500">{notifications.length} alerts</span>
                </div>
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {notifications.map((item) => (
                    <div
                      key={item.id}
                      className="p-2.5 rounded-lg bg-slate-50/80 hover:bg-slate-100/80 border border-slate-100 text-xs transition-colors relative group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-medium text-slate-800 leading-snug">{item.title}</p>
                        <button
                          onClick={() => clearNotification(item.id)}
                          className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-slate-600 transition-opacity"
                        >
                          ✕
                        </button>
                      </div>
                      <span className="text-[10px] text-slate-400 mt-1 inline-block">{item.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Pill (Matching Image 6) */}
          <div className="relative">
            <button
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className="flex items-center gap-2 pl-3 pr-1 py-1 rounded-xl bg-slate-50 hover:bg-slate-100/90 border border-slate-200/80 transition-all text-left cursor-pointer"
            >
              <div className="flex flex-col text-right">
                <div className="flex items-center gap-1">
                  <span className="text-xs font-bold text-slate-900">
                    {currentUserRole === 'DOCTOR'
                      ? 'Dr. Anjali Rao'
                      : currentUserRole === 'HOSPITAL_ADMIN'
                      ? 'ABC Admin'
                      : currentUserRole === 'EMERGENCY_STAFF'
                      ? 'Emergency Triage'
                      : 'Rahul'}
                  </span>
                  {currentUserRole === 'PATIENT' && (
                    <span className="text-[10px] font-bold text-sky-700 bg-sky-100 px-1 rounded">
                      B+
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-mono text-slate-500">
                  {currentUserRole === 'PATIENT' ? activePatient.mediId : currentUserRole}
                </span>
              </div>

              {/* Avatar square badge like Image 6 */}
              <div className="w-8 h-8 rounded-lg bg-[#0077b6] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                {currentUserRole === 'DOCTOR'
                  ? 'AR'
                  : currentUserRole === 'HOSPITAL_ADMIN'
                  ? 'HA'
                  : currentUserRole === 'EMERGENCY_STAFF'
                  ? 'ET'
                  : 'RK'}
              </div>
            </button>

            {/* Role & Switcher Menu */}
            {showRoleMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 p-2 z-50">
                <div className="p-2 border-b border-slate-100 mb-1">
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Active Role</p>
                  <p className="text-sm font-bold text-slate-900">
                    {currentUserRole === 'PATIENT'
                      ? 'Rahul Kumar (Patient)'
                      : currentUserRole === 'DOCTOR'
                      ? 'Dr. Anjali Rao (Doctor)'
                      : currentUserRole === 'HOSPITAL_ADMIN'
                      ? 'ABC Hospital Management'
                      : 'Emergency Response'}
                  </p>
                  {currentUserRole === 'PATIENT' && (
                    <div className="flex items-center gap-1 mt-1 text-xs text-sky-700 font-mono">
                      <span>{activePatient.mediId}</span>
                      <button onClick={handleCopyMediId} className="text-slate-400 hover:text-slate-700 ml-1">
                        {copiedMediId ? '✓ Copied' : '📋'}
                      </button>
                    </div>
                  )}
                </div>

                <div className="py-1">
                  <p className="text-[10px] font-bold text-slate-400 px-2 py-1 uppercase tracking-wider">
                    Switch Healthcare Application
                  </p>
                  
                  <button
                    onClick={() => { switchRole('PATIENT'); setShowRoleMenu(false); }}
                    className={`w-full text-left px-2.5 py-1.5 text-xs rounded-lg flex items-center justify-between ${
                      currentUserRole === 'PATIENT' ? 'bg-sky-50 text-sky-900 font-bold' : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <span>👤 Patient Website (Rahul)</span>
                    {currentUserRole === 'PATIENT' && <span className="text-sky-600">✓</span>}
                  </button>

                  <button
                    onClick={() => { switchRole('DOCTOR'); setShowRoleMenu(false); }}
                    className={`w-full text-left px-2.5 py-1.5 text-xs rounded-lg flex items-center justify-between ${
                      currentUserRole === 'DOCTOR' ? 'bg-sky-50 text-sky-900 font-bold' : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <span>👨‍⚕️ Doctor Website (Dr. Anjali)</span>
                    {currentUserRole === 'DOCTOR' && <span className="text-sky-600">✓</span>}
                  </button>

                  <button
                    onClick={() => { switchRole('HOSPITAL_ADMIN'); setShowRoleMenu(false); }}
                    className={`w-full text-left px-2.5 py-1.5 text-xs rounded-lg flex items-center justify-between ${
                      currentUserRole === 'HOSPITAL_ADMIN' ? 'bg-sky-50 text-sky-900 font-bold' : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <span>🏥 Hospital Management (ABC)</span>
                    {currentUserRole === 'HOSPITAL_ADMIN' && <span className="text-sky-600">✓</span>}
                  </button>

                  <button
                    onClick={() => { switchRole('EMERGENCY_STAFF'); setShowRoleMenu(false); }}
                    className={`w-full text-left px-2.5 py-1.5 text-xs rounded-lg flex items-center justify-between ${
                      currentUserRole === 'EMERGENCY_STAFF' ? 'bg-red-50 text-red-900 font-bold' : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <span>🚨 Emergency Triage System</span>
                    {currentUserRole === 'EMERGENCY_STAFF' && <span className="text-red-600">✓</span>}
                  </button>
                </div>

                <div className="pt-1 border-t border-slate-100 mt-1">
                  <button
                    onClick={() => { logout(); setShowRoleMenu(false); }}
                    className="w-full text-left px-2.5 py-1.5 text-xs rounded-lg text-red-600 hover:bg-red-50 font-medium flex items-center gap-1.5"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span>Log Out to Login Screen</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
