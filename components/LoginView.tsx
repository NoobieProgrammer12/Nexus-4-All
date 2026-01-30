
import React, { useState } from 'react';
import { User } from '../types';
import { supabase } from '../supabase';

interface LoginViewProps {
  onLogin: (user: Partial<User>, mode: 'login' | 'signup') => void;
  usersRegistry: User[];
}

const LoginView: React.FC<LoginViewProps> = ({ onLogin, usersRegistry }) => {
  const [step, setStep] = useState<'auth' | 'mfa'>('auth');
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [mfaCode, setMfaCode] = useState(['', '', '', '', '', '']);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Admin Portal logic
  const [showAdminEntry, setShowAdminEntry] = useState(false);
  const [adminKey, setAdminKey] = useState('');

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    // Initial registry check
    const existingUser = usersRegistry.find(u => u.email?.toLowerCase() === email.trim().toLowerCase());

    if (isLogin && !existingUser) {
      setErrorMsg("NEXUS ERROR: Account not found in database.");
      setLoading(false);
      return;
    }

    if (!isLogin && existingUser) {
      setErrorMsg("SIGNAL CONFLICT: This email address is already registered.");
      setLoading(false);
      return;
    }

    if (!isLogin && !username.trim()) {
      setErrorMsg("IDENTITY REQUIRED: Please provide an explorer handle.");
      setLoading(false);
      return;
    }

    // Trigger Real Email OTP
    if (!supabase) {
      setErrorMsg("NEXUS CLOUD OFFLINE: Please configure Supabase keys in environment.");
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          shouldCreateUser: !isLogin,
        },
      });

      if (error) throw error;

      // Move to verification step
      setStep('mfa');
    } catch (err: any) {
      setErrorMsg(`HANDSHAKE FAILED: ${err.message || 'System protocol error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleMfaChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newCode = [...mfaCode];
    newCode[index] = value;
    setMfaCode(newCode);

    // Auto-focus next digit slot
    if (value && index < 5) {
      const nextInput = document.getElementById(`mfa-${index + 1}`);
      nextInput?.focus();
    }
  };

  const verifyMFA = async () => {
    const entered = mfaCode.join('');
    if (entered.length < 6) return;
    
    setLoading(true);
    setErrorMsg(null);

    if (!supabase) {
      setErrorMsg("NEXUS CLOUD DISCONNECTED.");
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token: entered,
        type: 'email',
      });

      if (error) throw error;

      // Successful Handshake
      const existingUser = usersRegistry.find(u => u.email === email.trim());
      onLogin({
        username: isLogin && existingUser ? existingUser.username : username.trim(),
        email: email.trim(),
        isGuest: false,
      }, isLogin ? 'login' : 'signup');

    } catch (err: any) {
      setErrorMsg("INVALID CIPHER: Please check your Gmail for the correct code.");
      setMfaCode(['', '', '', '', '', '']);
      document.getElementById('mfa-0')?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminKey === '13155351') {
      onLogin({
        id: 'nexus-admin-01',
        username: 'NexusAdmin',
        avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Admin',
        isGuest: false,
        isAdmin: true,
        friendsCount: 0,
        postStreak: 0,
        joinedForumIds: [],
        createdForumIds: [],
        friendIds: []
      }, 'login');
    } else {
      setErrorMsg("SECURITY BREACH: ACCESS DENIED");
      setAdminKey('');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#0b0e14] overflow-hidden relative font-inter">
      {/* System Admin Port */}
      <div className="absolute top-6 right-6 z-50">
        <button 
          onClick={() => setShowAdminEntry(!showAdminEntry)}
          className="px-4 py-2 bg-cyan-950/20 border border-cyan-500/30 rounded-xl text-[10px] font-orbitron font-bold text-cyan-400 uppercase tracking-widest hover:bg-cyan-500/10 transition-all"
        >
          {showAdminEntry ? 'Abort Link' : 'Admin Terminal'}
        </button>
        {showAdminEntry && (
          <form onSubmit={handleAdminSubmit} className="absolute right-0 mt-2 w-48 bg-[#151921] border border-cyan-500/50 rounded-xl p-3 shadow-2xl animate-in fade-in slide-in-from-top-2">
            <input 
              type="password"
              placeholder="System Cipher..."
              value={adminKey}
              onChange={(e) => setAdminKey(e.target.value)}
              className="w-full bg-black border border-gray-800 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-cyan-500"
              autoFocus
            />
          </form>
        )}
      </div>

      {/* Kinetic Background Elements */}
      <div className="absolute inset-0 z-0 opacity-10 pointer-events-none">
        <div className="absolute top-0 -left-20 w-[500px] h-[500px] bg-cyan-600 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-0 -right-20 w-[500px] h-[500px] bg-purple-600 rounded-full blur-[120px] animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 w-full max-w-md bg-[#151921]/90 backdrop-blur-2xl border border-gray-800 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.4)] p-10">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-orbitron font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-white to-purple-500 mb-2 uppercase tracking-tighter">
            Nexus 4 All
          </h1>
          <p className="text-gray-500 font-bold tracking-[0.3em] uppercase text-[10px]">Secure Gateway Authorization</p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-bold animate-shake flex items-center space-x-3">
            <span className="text-lg">🚨</span>
            <span className="leading-tight uppercase tracking-tight">{errorMsg}</span>
          </div>
        )}

        {step === 'auth' ? (
          <form onSubmit={handleAuthSubmit} className="space-y-5">
            {!isLogin && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5 ml-1">Identity Handle</label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-black/40 border border-gray-800 rounded-xl px-5 py-4 focus:ring-2 focus:ring-cyan-500/50 outline-none transition-all text-white placeholder-gray-700"
                  placeholder="Ex: Cyber_Explorer_01"
                />
              </div>
            )}
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5 ml-1">GMAIL</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-black/40 border border-gray-800 rounded-xl px-5 py-4 focus:ring-2 focus:ring-cyan-500/50 outline-none transition-all text-white placeholder-gray-700"
                placeholder="identity@nexus.com"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5 ml-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black/40 border border-gray-800 rounded-xl px-5 py-4 focus:ring-2 focus:ring-cyan-500/50 outline-none transition-all text-white placeholder-gray-700"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white font-bold rounded-xl shadow-xl shadow-cyan-900/20 transition-all active:scale-[0.98] uppercase tracking-widest font-orbitron text-[11px] flex items-center justify-center space-x-3 border border-cyan-400/20"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path></svg>
                  <span>{isLogin ? 'Initialize Link' : 'Register Signal'}</span>
                </>
              )}
            </button>
            
            <p className="text-center text-xs text-gray-500 pt-4">
              {isLogin ? "New to the Nexus?" : "Signal already established?"}{' '}
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setErrorMsg(null);
                }}
                className="text-cyan-400 hover:text-cyan-300 font-bold underline underline-offset-4 decoration-cyan-500/30 transition-colors"
              >
                {isLogin ? 'Create Account' : 'Return to Login'}
              </button>
            </p>
          </form>
        ) : (
          <div className="animate-in fade-in zoom-in-95 duration-500">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-cyan-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-cyan-500/30 shadow-[0_0_20px_rgba(34,211,238,0.1)]">
                <svg className="w-8 h-8 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
              </div>
              <h2 className="text-lg font-orbitron font-bold text-white mb-1 uppercase">2-Step Verification</h2>
              <p className="text-xs text-gray-500">A security cipher has been transmitted to your Gmail inbox. Enter it below.</p>
            </div>

            <div className="grid grid-cols-6 gap-2 mb-8">
              {mfaCode.map((digit, i) => (
                <input
                  key={i}
                  id={`mfa-${i}`}
                  type="text"
                  maxLength={1}
                  value={digit}
                  autoFocus={i === 0}
                  onChange={(e) => handleMfaChange(i, e.target.value)}
                  className="w-full aspect-square bg-black/40 border-2 border-gray-800 rounded-xl text-center text-xl font-bold text-cyan-400 focus:border-cyan-500 outline-none transition-all shadow-inner"
                />
              ))}
            </div>

            <button
              onClick={verifyMFA}
              disabled={loading || mfaCode.some(d => !d)}
              className="w-full py-4 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 disabled:grayscale text-white font-bold rounded-xl shadow-lg transition-all uppercase tracking-widest font-orbitron text-[11px]"
            >
              {loading ? 'Validating...' : 'Authorize Access'}
            </button>

            <button 
              onClick={() => { setStep('auth'); setErrorMsg(null); }}
              className="w-full mt-4 py-2 text-gray-600 hover:text-gray-400 text-[10px] font-bold uppercase tracking-widest transition-colors"
            >
              Return to Credentials
            </button>
          </div>
        )}

        <div className="mt-10 space-y-4">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-800"></div>
            </div>
            <div className="relative flex justify-center text-[8px] uppercase font-bold tracking-[0.5em]">
              <span className="bg-[#151921] px-4 text-gray-600">Bypass Protocol</span>
            </div>
          </div>

          <button
            onClick={() => {
               onLogin({
                isGuest: true,
                username: 'Guest_Explorer',
                avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Guest'
              }, 'login');
            }}
            className="w-full py-3 bg-gray-800/20 hover:bg-gray-800/50 text-gray-500 hover:text-gray-300 rounded-xl transition-all text-[10px] font-bold uppercase tracking-widest border border-gray-800/50"
          >
            Enter In Guest Mode
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginView;
