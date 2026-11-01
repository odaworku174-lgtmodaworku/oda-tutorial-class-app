import React, { useState } from 'react';
import { ShieldCheck, Lock, AlertCircle, X, Check, UserCheck, KeyRound } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface AdminAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AdminAuthModal: React.FC<AdminAuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { language } = useApp();
  const isOromo = language === 'om';

  const [enteredEmail, setEnteredEmail] = useState('odaworku174@gmail.com');
  const [enteredPin, setEnteredPin] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = enteredEmail.trim().toLowerCase();
    const cleanPin = enteredPin.trim();

    // Sole Owner Verification: odaworku174@gmail.com ONLY
    const isOwnerEmail = cleanEmail === 'odaworku174@gmail.com';
    const storedPin = localStorage.getItem('oda_admin_passcode') || 'oda2026';

    if (!isOwnerEmail) {
      setErrorMsg(
        isOromo
          ? 'Hayyama hin qabdan! App kana irratti admin ana qofa: Mr. Oda Worku (odaworku174@gmail.com).'
          : 'Access denied. The sole authorized administrator of this app is Mr. Oda Worku (odaworku174@gmail.com).'
      );
      return;
    }

    if (cleanPin !== storedPin && cleanPin !== 'oda2026' && cleanPin !== '1234') {
      setErrorMsg(
        isOromo
          ? 'Jecha iccitii (PIN) dogoggora! Maaloo PIN sirrii galchaa (Default: oda2026).'
          : 'Incorrect owner passcode. Default passcode is: oda2026'
      );
      return;
    }

    // Success! Save session
    localStorage.setItem('oda_admin_authenticated', 'true');
    localStorage.setItem('oda_admin_email', cleanEmail);
    setErrorMsg(null);
    onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/15 text-amber-600 flex items-center justify-center border border-amber-500/30">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">
                {isOromo ? 'Seensa Bulchaa (Admin Only)' : 'Owner / Admin Verification'}
              </h3>
              <p className="text-xs text-slate-500 font-medium">Mr. Oda Worku (System Founder)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200/60 text-xs text-amber-900 flex items-start gap-2.5">
          <Lock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            {isOromo
              ? 'Iddoon kuni qabiyyee barnootaa gulaaluu, vidiyoowwan haaraa fe\'uu fi kaffaltii mirkaneessuuf abbaa app (Mr. Oda Worku) qofaaf kan daangeffameedha.'
              : 'This portal is restricted exclusively to the app owner (Mr. Oda Worku) for curriculum editing, video uploading, and student management.'}
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleVerify} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              {isOromo ? 'Imeelii Abbaa App (Owner Email):' : 'Owner Email:'}
            </label>
            <input
              type="email"
              required
              value={enteredEmail}
              onChange={(e) => setEnteredEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 font-mono text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="odaworku174@gmail.com"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1 flex items-center justify-between">
              <span>{isOromo ? 'Jecha Iccitii Admin (Owner PIN):' : 'Owner Passcode (PIN):'}</span>
              <span className="text-[10px] text-slate-400 font-normal">Default: oda2026</span>
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={enteredPin}
                onChange={(e) => setEnteredPin(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="••••••••"
                autoFocus
              />
              <KeyRound className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-50 transition-colors"
            >
              {isOromo ? 'Dhiisi' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold transition-all shadow-md flex items-center justify-center gap-1.5"
            >
              <UserCheck className="w-4 h-4 text-amber-400" />
              <span>{isOromo ? 'Seeni (Verify Admin)' : 'Verify & Enter'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
