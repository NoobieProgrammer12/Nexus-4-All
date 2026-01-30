
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
  const [loading, setLoading] = useState(false);

  // Admin Tester state
  const [showAdminEntry, setShowAdminEntry] = useState(false);
  const [adminKey, setAdminKey] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    // Simulate network delay for realism
    setTimeout(() => {
      const existingUser = usersRegistry.find(u => u.email?.toLowerCase() === email.trim().toLowerCase());

      if (isLogin) {
        if (!existingUser) {
          setErrorMsg("Account not found. Please verify your credentials or Sign Up.");
          setLoading(false);
          return;
        }
        // In a real app, we'd verify the password here.
        onLogin(existingUser, 'login');
      } else {
        if (existingUser) {
          setErrorMsg("This email is already registered in the Nexus.");
          setLoading(false);
          return;
        }
        if (!username.trim()) {
          setErrorMsg("Please choose a valid Explorer handle.");
          setLoading(false);
          return;
        }
        onLogin({
          username: username.trim(),
          email: email.trim(),
          isGuest: false,
        }, 'signup');
      }
    }, 800);
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
      username: 'Guest_Explorer',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Guest'
    }, 'login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#0b0e14] overflow-hidden relative">
      {/* Admin Access Portal */}
      <div className="absolute top-6 right-6 z-50">
        <button 
          onClick={() => setShowAdminEntry(!showAdminEntry)}
          className="px-4 py-2 bg-cyan-950/20 border border-cyan-500/30 rounded-xl text-[10px] font-orbitron font-bold text-cyan-400 uppercase tracking-widest hover:bg-cyan-500/10 transition-all"
        >
          {showAdminEntry ? 'Close Portal' : 'Admin Entry'}
        </button>
        {showAdminEntry && (
          <form onSubmit={handleAdminSubmit} className="absolute right-0 mt-2 w-48 bg-[#151921] border border-cyan-500/50 rounded-xl p-3 shadow-2xl animate-in fade-in slide-in-from-top-2">
            <input 
              type="password"
              placeholder="System Key..."
              value={adminKey}
              onChange={(e) => setAdminKey(e.target.value)}
              className="w-full bg-black border border-gray-800 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-cyan-500"
              autoFocus
            />
          </form>
        )}
      </div>

      {/* Decorative background elements */}
      <div className="absolute inset-0 z-0 opacity-20">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-700"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 w-full max-w-md bg-[#151921]/80 backdrop-blur-xl border border-gray-800 rounded-2xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-orbitron font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 mb-2 uppercase tracking-tighter">
            Nexus 4 All
          </h1>
          <p className="text-gray-400 font-bold tracking-widest uppercase text-[10px]">Accessing the Forum of Forums</p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs font-bold animate-shake flex items-center space-x-2">
            <span>⚠️</span>
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="animate-in fade-in slide-in-from-top-2">
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Explorer Handle</label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-[#0b0e14] border border-gray-700 rounded-lg px-4 py-3 focus:ring-2 focus:ring-cyan-500 outline-none transition-all text-white placeholder-gray-700"
                placeholder="Ex: Neo_Explorer"
              />
            </div>
          )}
          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Quantum Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#0b0e14] border border-gray-700 rounded-lg px-4 py-3 focus:ring-2 focus:ring-cyan-500 outline-none transition-all text-white placeholder-gray-700"
              placeholder="user@nexus.com"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Access Cipher</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#0b0e14] border border-gray-700 rounded-lg px-4 py-3 focus:ring-2 focus:ring-cyan-500 outline-none transition-all text-white placeholder-gray-700"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white font-bold rounded-lg shadow-lg shadow-cyan-900/20 transition-all active:scale-[0.98] uppercase tracking-widest font-orbitron text-[11px] flex items-center justify-center space-x-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
            ) : (
              <span>{isLogin ? 'Initiate Link' : 'Register Signal'}</span>
            )}
          </button>
        </form>

        <div className="mt-8 space-y-4">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-800"></div>
            </div>
            <div className="relative flex justify-center text-[9px] uppercase font-bold tracking-[0.3em]">
              <span className="bg-[#151921] px-3 text-gray-500">Alternative Access</span>
            </div>
          </div>

          <button
            onClick={handleGuest}
            className="w-full py-3 bg-gray-800/50 hover:bg-gray-700 text-gray-400 hover:text-white rounded-lg transition-all text-[10px] font-bold uppercase tracking-widest border border-gray-700/50"
          >
            Enter as Guest Explorer
          </button>

          <p className="text-center text-xs text-gray-500 mt-6">
            {isLogin ? "No signal detected?" : "Signal already established?"}{' '}
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setErrorMsg(null);
              }}
              className="text-cyan-400 hover:text-cyan-300 font-bold underline underline-offset-4 decoration-cyan-500/30"
            >
              {isLogin ? 'Create Account' : 'Return to Login'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginView;
