import React, { useState } from 'react';
import { X, User, Store, KeyRound } from 'lucide-react';
import { api, setStoredToken } from '../lib/api';
import type { UserProfile, UserRole } from '../types';

interface AuthModalProps {
  defaultRole: UserRole;
  onSuccess: (user: UserProfile, favouriteMessIds: number[]) => void;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  defaultRole,
  onSuccess,
  onClose,
}) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [role, setRole] = useState<UserRole>(defaultRole);
  const [name, setName] = useState('');
  const [email, setEmail] = useState(
    defaultRole === 'owner' ? 'annapurna@messowner.in' : 'arjun.patil@student.edu'
  );
  const [phone, setPhone] = useState('');
  const [collegeOrMess, setCollegeOrMess] = useState('');
  const [password, setPassword] = useState(
    defaultRole === 'owner' ? 'Owner@123' : 'Student@123'
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleRoleSwitch = (nextRole: UserRole) => {
    setRole(nextRole);
    setError('');
    if (mode === 'login') {
      if (nextRole === 'owner') {
        setEmail('annapurna@messowner.in');
        setPassword('Owner@123');
      } else {
        setEmail('arjun.patil@student.edu');
        setPassword('Student@123');
      }
    }
  };

  const fillDemoAccount = (demoEmail: string, demoPass: string, demoRole: UserRole) => {
    setMode('login');
    setRole(demoRole);
    setEmail(demoEmail);
    setPassword(demoPass);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      if (mode === 'login') {
        const res = await api.login(email, password);
        setStoredToken(res.token);
        onSuccess(res.user, res.favouriteMessIds);
      } else {
        const res = await api.register({
          name,
          email,
          phone,
          password,
          role,
          collegeOrMess,
        });
        setStoredToken(res.token);
        onSuccess(res.user, res.favouriteMessIds);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-[#FFF4E3] text-[#191919] w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-[#191919]/15"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-[#191919] text-[#FFF4E3] px-6 py-4 flex items-center justify-between border-b-2 border-[#FFD400]">
          <div>
            <h2 className="text-lg font-extrabold text-white">
              {mode === 'login' ? 'Sign In to Mess Finding System' : 'Create Your Account'}
            </h2>
            <p className="text-xs text-[#FFF4E3]/70">
              {role === 'owner'
                ? 'Mess Owner Portal — Manage Menus, Photos & Enquiries'
                : 'Student Portal — Save Messes, Review & Enquire'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close sign in dialog"
            className="w-8 h-8 rounded-lg bg-white/10 text-white hover:bg-white/20 flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Role Switcher */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-[#191919]/10 rounded-xl">
            <button
              type="button"
              onClick={() => handleRoleSwitch('student')}
              className={`py-2 px-3 rounded-lg text-xs font-extrabold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                role === 'student'
                  ? 'bg-[#F0442B] text-white shadow-xs'
                  : 'text-[#191919]/75 hover:text-[#191919]'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Student</span>
            </button>
            <button
              type="button"
              onClick={() => handleRoleSwitch('owner')}
              className={`py-2 px-3 rounded-lg text-xs font-extrabold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                role === 'owner'
                  ? 'bg-[#FFD400] text-[#191919] shadow-xs'
                  : 'text-[#191919]/75 hover:text-[#191919]'
              }`}
            >
              <Store className="w-3.5 h-3.5" />
              <span>Mess Owner</span>
            </button>
          </div>

          {/* Login / Register Mode Switch */}
          <div className="flex items-center gap-4 border-b border-[#191919]/10 pb-2 text-sm">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError('');
              }}
              className={`font-extrabold pb-1 cursor-pointer ${
                mode === 'login'
                  ? 'text-[#F0442B] border-b-2 border-[#F0442B]'
                  : 'text-[#6B6860] hover:text-[#191919]'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setEmail('');
                setPassword('');
                setError('');
              }}
              className={`font-extrabold pb-1 cursor-pointer ${
                mode === 'register'
                  ? 'text-[#F0442B] border-b-2 border-[#F0442B]'
                  : 'text-[#6B6860] hover:text-[#191919]'
              }`}
            >
              Create Account
            </button>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-[#F0442B]/10 border border-[#F0442B]/30 text-xs font-bold text-[#F0442B]">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {mode === 'register' && (
              <>
                <div>
                  <label className="block text-xs font-bold text-[#191919] mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={role === 'owner' ? 'Shri. Ramesh Kulkarni' : 'Priya Jadhav'}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#191919]/20 text-sm focus:outline-2 focus:outline-[#F0442B]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#191919] mb-1">
                      Mobile Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="9890123456"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#191919]/20 text-sm focus:outline-2 focus:outline-[#F0442B]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#191919] mb-1">
                      {role === 'owner' ? 'Mess Name *' : 'College / Hostel *'}
                    </label>
                    <input
                      type="text"
                      required
                      value={collegeOrMess}
                      onChange={(e) => setCollegeOrMess(e.target.value)}
                      placeholder={role === 'owner' ? 'Shree Datta Mess' : 'DYPCET Kasba Bawda'}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#191919]/20 text-sm focus:outline-2 focus:outline-[#F0442B]"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-bold text-[#191919] mb-1">Email Address *</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#191919]/20 text-sm focus:outline-2 focus:outline-[#F0442B]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#191919] mb-1">Password *</label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#191919]/20 text-sm focus:outline-2 focus:outline-[#F0442B]"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className={`w-full py-3 px-5 rounded-xl font-extrabold text-sm transition-colors cursor-pointer ${
                role === 'owner'
                  ? 'bg-[#FFD400] hover:bg-[#ffe033] text-[#191919]'
                  : 'bg-[#F0442B] hover:bg-[#d93820] text-white'
              }`}
            >
              {submitting
                ? 'Please wait...'
                : mode === 'login'
                ? role === 'owner'
                  ? 'Sign In to Owner Dashboard'
                  : 'Sign In as Student'
                : 'Create Account'}
            </button>
          </form>

          {/* Quick Demo Credentials for College Viva Demonstration */}
          <div className="pt-3 border-t border-[#191919]/10 space-y-2">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#6B6860]">
              <KeyRound className="w-3.5 h-3.5 text-[#304FFE]" />
              <span>QUICK DEMO ACCOUNTS (CLICK TO AUTO-FILL):</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => fillDemoAccount('arjun.patil@student.edu', 'Student@123', 'student')}
                className="p-2 rounded-lg bg-white border border-[#191919]/15 hover:border-[#F0442B] text-left cursor-pointer"
              >
                <div className="text-[11px] font-extrabold text-[#191919]">Student Demo</div>
                <div className="text-[10px] text-[#6B6860] truncate">Arjun Patil</div>
              </button>
              <button
                type="button"
                onClick={() => fillDemoAccount('annapurna@messowner.in', 'Owner@123', 'owner')}
                className="p-2 rounded-lg bg-white border border-[#191919]/15 hover:border-[#FFD400] text-left cursor-pointer"
              >
                <div className="text-[11px] font-extrabold text-[#191919]">Annapurna</div>
                <div className="text-[10px] text-[#6B6860] truncate">Owner Login</div>
              </button>
              <button
                type="button"
                onClick={() => fillDemoAccount('randive@messowner.in', 'Owner@123', 'owner')}
                className="p-2 rounded-lg bg-white border border-[#191919]/15 hover:border-[#304FFE] text-left cursor-pointer"
              >
                <div className="text-[11px] font-extrabold text-[#191919]">Randive Mess</div>
                <div className="text-[10px] text-[#6B6860] truncate">Owner Login</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
