
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

  const [showAdminEntry, setShowAdminEntry] = useState(false);
  const [adminKey, setAdminKey] = useState('');

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    const emailClean = email.trim().toLowerCase();
    const userClean = username.trim();

    if (isLogin) {
      const existingUser = usersRegistry.find(u => u.email?.toLowerCase() === emailClean);
      if (!existingUser) {
        setErrorMsg("ACCESS DENIED: Account does not exist in Nexus database.");
        setLoading(false);
        return;
      }
      setTimeout(() => {
        onLogin({
          id: existingUser.id,
          username: existingUser.username,
          email: existingUser.email,
          isGuest: false,
        }, 'login');
      }, 600);
    } else {
      const emailExists = usersRegistry.some(u => u.email?.toLowerCase() === emailClean);
      if (emailExists) {
        setErrorMsg("SIGNAL CONFLICT: This email is already registered.");
        setLoading(false);
        return;
      }
      const nameExists = usersRegistry.some(u => u.username.toLowerCase() === userClean.toLowerCase());
      if (nameExists) {
        setErrorMsg("IDENTITY CONFLICT: This username is already taken.");
        setLoading(false);
        return;
      }
      if (userClean.length < 3) {
        setErrorMsg("ERROR: Username too short.");
        setLoading(false);
        return;
      }
      setTimeout(() => {
        onLogin({
          username: userClean,
          email: emailClean,
          isGuest: false,
        }, 'signup');
      }, 800);
    }
  };

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminKey === '13155351') {
      onLogin({ id: 'admin', username: 'NexusAdmin', isAdmin: true, isGuest: false }, 'login');
    } else {
      setErrorMsg("INVALID CIPHER KEY");
      setAdminKey('');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#0b0e14] overflow-hidden relative font-inter">
      {/* Admin Terminal Access */}
      <div className="absolute top-6 right-6 z-50">
        <button onClick={() => setShowAdminEntry(!showAdminEntry)} className="px-4 py-2 bg-red-950/20 border border-red-500/30 rounded-xl text-[10px] font-orbitron font-bold text-red-400 uppercase tracking-widest hover:bg-red-500/10 transition-all">
          {showAdminEntry ? 'Close Terminal' : 'Admin Terminal'}
        </button>
        {showAdminEntry && (
          <form onSubmit={handleAdminSubmit} className="absolute right-0 mt-2 w-48 bg-[#151921] border border-red-500/50 rounded-xl p-3 shadow-2xl animate-in slide-in-from-right-2">
            <input 
              type="password" 
              placeholder="Root Access Key..." 
              value={adminKey} 
              onChange={(e) => setAdminKey(e.target.value)} 
              className="w-full bg-black border border-gray-800 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-red-500" 
              autoFocus 
            />
          </form>
        )}
      </div>

      <div className="absolute inset-0 z-0 opacity-10 pointer-events-none">
        <div className="absolute top-0 -left-20 w-[500px] h-[500px] bg-cyan-600 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-0 -right-20 w-[500px] h-[500px] bg-purple-600 rounded-full blur-[120px] animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 w-full max-w-md bg-[#151921]/90 backdrop-blur-2xl border border-gray-800 rounded-3xl shadow-2xl p-10">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-orbitron font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-white to-purple-500 uppercase tracking-tighter">Nexus 4 All</h1>
          <p className="text-cyan-400/80 font-bold tracking-[0.1em] uppercase text-[12px] mt-1 font-orbitron">The Forum Of Forums</p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-bold animate-shake flex items-center space-x-3">
            <span className="shrink-0">⚠️</span><span className="leading-tight uppercase">{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleAuthSubmit} className="space-y-5">
          {!isLogin && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5 ml-1">Username (Unique)</label>
              <input type="text" required value={username} onChange={(e) => setUsername(e.target.value)} className="w-full bg-black/40 border border-gray-800 rounded-xl px-5 py-4 focus:ring-2 focus:ring-cyan-500/50 outline-none text-white transition-all" placeholder="Explorer_Name" />
            </div>
          )}
          
          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5 ml-1">Email</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-black/40 border border-gray-800 rounded-xl px-5 py-4 focus:ring-2 focus:ring-cyan-500/50 outline-none text-white transition-all" placeholder="your@nexus.com" />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5 ml-1">Cipher Key (Password)</label>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-black/40 border border-gray-800 rounded-xl px-5 py-4 focus:ring-2 focus:ring-cyan-500/50 outline-none text-white transition-all" placeholder="••••••••" />
          </div>

          <button type="submit" disabled={loading} className="w-full py-4 bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white font-bold rounded-xl shadow-xl transition-all uppercase tracking-widest font-orbitron text-[11px] mt-2">
            {loading ? 'Validating...' : (isLogin ? 'Access Nexus 4 All' : 'Join Nexus 4 All')}
          </button>
          
          <p className="text-center text-xs text-gray-500 pt-4">
            {isLogin ? "New to the Nexus?" : "Already have an identity?"}{' '}
            <button type="button" onClick={() => { setIsLogin(!isLogin); setErrorMsg(null); }} className="text-cyan-400 hover:text-cyan-300 font-bold underline transition-colors">
              {isLogin ? 'Register' : 'Login'}
            </button>
          </p>
        </form>

        <div className="mt-10 space-y-4">
          <div className="relative"><div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-800"></div></div><div className="relative flex justify-center text-[8px] uppercase font-bold tracking-[0.5em]"><span className="bg-[#151921] px-4 text-gray-600">Restricted Access</span></div></div>
          <button onClick={() => onLogin({ isGuest: true, username: 'Guest_' + Math.floor(Math.random()*1000) }, 'login')} className="w-full py-3 bg-gray-800/20 text-gray-500 hover:text-gray-300 rounded-xl transition-all text-[10px] font-bold uppercase tracking-widest border border-gray-800/50 hover:border-gray-600">
            Guest Mode
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginView;
