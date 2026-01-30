
import React, { useState } from 'react';
import { User } from '../types';

interface LoginViewProps {
  onLogin: (user: Partial<User>, mode: 'login' | 'signup') => void;
  usersRegistry: User[];
}

const LoginView: React.FC<LoginViewProps> = ({ onLogin, usersRegistry }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const [showVerification, setShowVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [showSystemToast, setShowSystemToast] = useState(false);

  // Admin Tester state
  const [showAdminEntry, setShowAdminEntry] = useState(false);
  const [adminKey, setAdminKey] = useState('');

  const handleInitialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const existingUser = usersRegistry.find(u => u.email?.toLowerCase() === email.trim().toLowerCase());

    if (isLogin) {
      if (!existingUser) {
        setErrorMsg("The user associated with this email does not exist. Please Sign Up.");
        return;
      }
    } else {
      if (existingUser) {
        setErrorMsg("An account with this email already exists. Please Sign In.");
        return;
      }
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedCode(code);
    setShowVerification(true);
    setShowSystemToast(true);
    setTimeout(() => setShowSystemToast(false), 10000);
  };

  const handleVerifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (verificationCode === generatedCode) {
      onLogin({
        username: username || email.split('@')[0],
        email: email.trim(),
        isGuest: false,
      }, isLogin ? 'login' : 'signup');
    } else {
      alert("Invalid verification code. Access denied.");
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
      setErrorMsg("INVALID ADMIN ACCESS KEY");
      setAdminKey('');
      setShowAdminEntry(false);
    }
  };

  const handleGuest = () => {
    onLogin({
      isGuest: true,
    }, 'login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#0b0e14] overflow-hidden relative">
      <div className="absolute top-6 right-6 z-50">
        <button 
          onClick={() => setShowAdminEntry(!showAdminEntry)}
          className="px-4 py-2 bg-cyan-900/20 border border-cyan-500/30 rounded-xl text-[10px] font-orbitron font-bold text-cyan-400 uppercase tracking-widest hover:bg-cyan-500/10 transition-all"
        >
          Admin Tester
        </button>
        {showAdminEntry && (
          <form onSubmit={handleAdminSubmit} className="absolute right-0 mt-2 w-48 bg-[#151921] border border-cyan-500/50 rounded-xl p-3 shadow-2xl animate-in fade-in slide-in-from-top-2">
            <input 
              type="password"
              placeholder="Enter Key..."
              value={adminKey}
              onChange={(e) => setAdminKey(e.target.value)}
              className="w-full bg-black border border-gray-800 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-cyan-500"
              autoFocus
            />
          </form>
        )}
      </div>

      <div className="absolute inset-0 z-0 opacity-20">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-700"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-1000"></div>
      </div>

      {showSystemToast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm">
          <div className="mx-4 bg-[#1a1f2b] border border-cyan-500/50 rounded-2xl p-4 shadow-2xl shadow-cyan-500/20 animate-bounce">
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-cyan-500/20 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-cyan-400" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-xs font-orbitron font-bold text-cyan-400 uppercase tracking-widest mb-1">Nexus System Transmission</h3>
                <p className="text-sm text-gray-300">
                  Verification code for <span className="text-white font-bold">{email}</span>:
                </p>
                <div className="mt-2 text-2xl font-mono font-bold text-white bg-black/40 p-2 rounded text-center border border-white/10">
                  {generatedCode}
                </div>
              </div>
              <button onClick={() => setShowSystemToast(false)} className="text-gray-600 hover:text-white">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {showVerification ? (
        <div className="relative z-10 w-full max-w-md bg-[#151921]/80 backdrop-blur-xl border border-cyan-500/30 rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-orbitron font-bold text-white mb-2">Nexus Verification</h1>
            <p className="text-gray-400 text-sm">Verify your access key for <span className="text-cyan-400">{email}</span></p>
          </div>

          <form onSubmit={handleVerifySubmit} className="space-y-6">
            <input
              type="text"
              maxLength={6}
              required
              autoFocus
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              className="w-full bg-[#0b0e14] border border-gray-700 rounded-lg px-4 py-4 text-center text-3xl font-mono tracking-[0.5em] focus:ring-2 focus:ring-cyan-500 outline-none transition-all text-white shadow-inner"
              placeholder="000000"
            />
            <button
              type="submit"
              className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg shadow-lg shadow-cyan-900/20 transition-all active:scale-95"
            >
              Verify Identity
            </button>
            <button
              type="button"
              onClick={() => {
                setShowVerification(false);
                setShowSystemToast(false);
              }}
              className="w-full text-sm text-gray-500 hover:text-cyan-400 transition-colors"
            >
              Back to login
            </button>
          </form>
        </div>
      ) : (
        <div className="relative z-10 w-full max-w-md bg-[#151921]/80 backdrop-blur-xl border border-gray-800 rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-orbitron font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 mb-2 uppercase">
              Nexus 4 All
            </h1>
            <p className="text-gray-400 font-bold tracking-widest uppercase text-[10px]">The Forum of Forums</p>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs font-bold animate-shake">
              ⚠️ {errorMsg}
            </div>
          )}

          <form onSubmit={handleInitialSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Username</label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-[#0b0e14] border border-gray-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-cyan-500 outline-none transition-all text-white"
                  placeholder="Explorer123"
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#0b0e14] border border-gray-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-cyan-500 outline-none transition-all text-white"
                placeholder="name@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#0b0e14] border border-gray-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-cyan-500 outline-none transition-all text-white"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white font-bold rounded-lg shadow-lg shadow-cyan-900/20 transition-all active:scale-95 uppercase tracking-widest font-orbitron text-xs"
            >
              {isLogin ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 space-y-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-800"></div>
              </div>
              <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest">
                <span className="bg-[#151921] px-2 text-gray-500">Or continue with</span>
              </div>
            </div>

            <button
              onClick={handleGuest}
              className="w-full py-2 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-lg transition-all text-xs font-bold uppercase tracking-widest"
            >
              Guest Mode
            </button>

            <p className="text-center text-xs text-gray-500">
              {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setErrorMsg(null);
                }}
                className="text-cyan-400 hover:underline font-bold"
              >
                {isLogin ? 'Sign Up' : 'Log In'}
              </button>
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginView;
