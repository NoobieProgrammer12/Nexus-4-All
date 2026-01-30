
import React, { useState, useEffect } from 'react';
import { User } from '../types';

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
  const [generatedCode, setGeneratedCode] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showSystemAlert, setShowSystemAlert] = useState(false);

  // Admin Portal logic
  const [showAdminEntry, setShowAdminEntry] = useState(false);
  const [adminKey, setAdminKey] = useState('');

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    setTimeout(() => {
      const existingUser = usersRegistry.find(u => u.email?.toLowerCase() === email.trim().toLowerCase());

      if (isLogin) {
        if (!existingUser) {
          setErrorMsg("Account not detected in Nexus archives.");
          setLoading(false);
          return;
        }
        // Proceed to MFA
        initiateMFA();
      } else {
        if (existingUser) {
          setErrorMsg("This communication signal is already registered.");
          setLoading(false);
          return;
        }
        if (!username.trim()) {
          setErrorMsg("Explorer handle is required for registration.");
          setLoading(false);
          return;
        }
        // Proceed to MFA
        initiateMFA();
      }
      setLoading(false);
    }, 1200);
  };

  const initiateMFA = () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedCode(code);
    setStep('mfa');
    setShowSystemAlert(true);
    // Auto-hide alert after 8 seconds
    setTimeout(() => setShowSystemAlert(false), 8000);
  };

  const handleMfaChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newCode = [...mfaCode];
    newCode[index] = value;
    setMfaCode(newCode);

    // Auto-focus next
    if (value && index < 5) {
      const nextInput = document.getElementById(`mfa-${index + 1}`);
      nextInput?.focus();
    }
  };

  const verifyMFA = () => {
    const entered = mfaCode.join('');
    if (entered === generatedCode) {
      setLoading(true);
      setTimeout(() => {
        onLogin({
          username: isLogin ? usersRegistry.find(u => u.email === email)?.username : username.trim(),
          email: email.trim(),
          isGuest: false,
        }, isLogin ? 'login' : 'signup');
      }, 1000);
    } else {
      setErrorMsg("INVALID ACCESS CODE. RETRY HANDSHAKE.");
      setMfaCode(['', '', '', '', '', '']);
      document.getElementById('mfa-0')?.focus();
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
      setErrorMsg("SECURITY BREACH DETECTED: INVALID ADMIN KEY");
      setAdminKey('');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#0b0e14] overflow-hidden relative font-inter">
      {/* Admin Door */}
      <div className="absolute top-6 right-6 z-50">
        <button 
          onClick={() => setShowAdminEntry(!showAdminEntry)}
          className="px-4 py-2 bg-cyan-950/20 border border-cyan-500/30 rounded-xl text-[10px] font-orbitron font-bold text-cyan-400 uppercase tracking-widest hover:bg-cyan-500/10 transition-all"
        >
          {showAdminEntry ? 'Close Terminal' : 'Admin Terminal'}
        </button>
        {showAdminEntry && (
          <form onSubmit={handleAdminSubmit} className="absolute right-0 mt-2 w-48 bg-[#151921] border border-cyan-500/50 rounded-xl p-3 shadow-2xl animate-in fade-in slide-in-from-top-2">
            <input 
              type="password"
              placeholder="System Passphrase..."
              value={adminKey}
              onChange={(e) => setAdminKey(e.target.value)}
              className="w-full bg-black border border-gray-800 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-cyan-500"
              autoFocus
            />
          </form>
        )}
      </div>

      {/* 2FA CODE NOTIFICATION SIMULATION */}
      {showSystemAlert && (
        <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[100] w-full max-w-sm animate-in slide-in-from-top-10 duration-500">
          <div className="mx-4 bg-[#1a1f2b] border-l-4 border-cyan-500 p-4 rounded-r-xl shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-cyan-500/20 rounded-full flex items-center justify-center text-cyan-400 animate-pulse">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"></path></svg>
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-orbitron font-bold text-cyan-400 uppercase tracking-tighter">Secure Link Established</p>
                <p className="text-xs text-white">Your access code is: <span className="font-mono font-bold text-lg tracking-widest bg-cyan-500/10 px-2 rounded">{generatedCode}</span></p>
              </div>
              <button onClick={() => setShowSystemAlert(false)} className="text-gray-500 hover:text-white">✕</button>
            </div>
          </div>
        </div>
      )}

      {/* Decorative Background */}
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
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5 ml-1">Quantum Address</label>
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
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5 ml-1">Primary Cipher</label>
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
              {isLogin ? "No signal detected?" : "Signal already established?"}{' '}
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
              <p className="text-xs text-gray-500">Please enter the 6-digit cipher sent to your device.</p>
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
              {loading ? 'Verifying...' : 'Authorize Access'}
            </button>

            <button 
              onClick={() => { setStep('auth'); setErrorMsg(null); }}
              className="w-full mt-4 py-2 text-gray-600 hover:text-gray-400 text-[10px] font-bold uppercase tracking-widest transition-colors"
            >
              Back to credentials
            </button>
          </div>
        )}

        <div className="mt-10 space-y-4">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-800"></div>
            </div>
            <div className="relative flex justify-center text-[8px] uppercase font-bold tracking-[0.5em]">
              <span className="bg-[#151921] px-4 text-gray-600">Auxiliary Entry</span>
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
            Enter as Anonymous Explorer
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginView;
