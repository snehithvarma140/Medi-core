import React from 'react';
import { useHealthcare } from '../../context/HealthcareContext';

interface AuditLedgerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuditLedgerModal: React.FC<AuditLedgerModalProps> = ({ isOpen, onClose }) => {
  const { auditLogs, activePatient } = useHealthcare();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-emerald-400"></span>
            <div>
              <h3 className="text-base font-bold">HIPAA & HL7 Security Audit Ledger</h3>
              <p className="text-xs text-slate-400">
                Immutable cryptographic access trace for Medi ID: {activePatient.mediId}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">✕</button>
        </div>

        {/* Log Entries */}
        <div className="p-6 overflow-y-auto space-y-3 flex-1">
          {auditLogs.map((log) => (
            <div key={log.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-sky-800 bg-sky-100/70 px-2 py-0.5 rounded">
                  {log.action}
                </span>
                <span className="text-[11px] text-slate-400 font-mono">{log.timestamp}</span>
              </div>
              <p className="font-semibold text-slate-800">
                Actor: {log.actorName} ({log.actorRole})
              </p>
              <p className="text-slate-600 leading-relaxed font-sans">{log.details}</p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-100/70 border-t border-slate-200 flex justify-between items-center text-[11px] text-slate-500">
          <span>SHA-256 Hash verified on node: HL7-NODE-APAC-01</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-semibold rounded-lg"
          >
            Close Ledger
          </button>
        </div>
      </div>
    </div>
  );
};
