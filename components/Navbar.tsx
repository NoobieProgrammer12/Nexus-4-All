
import React, { useState, useContext, useRef, useEffect } from 'react';
import { User, NexusNotification } from '../types';
import { LanguageContext } from '../App';

interface NavbarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  user: User;
  notifications: NexusNotification[];
  onNotificationClick: (notif: NexusNotification) => void;
  onNewPost: () => void;
  onProfileClick: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ searchQuery, setSearchQuery, user, notifications, onNotificationClick, onNewPost, onProfileClick }) => {
  const { t } = useContext(LanguageContext);
  const [showNotifs, setShowNotifs] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const unreadCount = notifications.filter(n => !n.read).length;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowNotifs(false);
      }
    };
    if (showNotifs) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifs]);

  return (
    <nav className="sticky top-0 z-20 bg-[#0b0e14]/80 backdrop-blur-md border-b border-gray-800 px-4 md:px-8 py-4 flex items-center justify-between gap-4">
      <div className="flex-1 max-w-2xl relative group">
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-500 group-focus-within:text-cyan-400 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t('search_placeholder')}
          className="w-full bg-[#151921] border border-gray-800 rounded-full pl-10 pr-10 py-2 text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/20 transition-all text-white"
        />
      </div>

      <div className="flex items-center space-x-4">
        <button 
          onClick={onNewPost} 
          className="nexus-glow hidden md:flex items-center space-x-2 bg-gradient-to-r from-cyan-600 to-cyan-500 text-white px-5 py-2.5 rounded-full font-bold text-sm transition-all shadow-lg active:scale-95 border border-cyan-400/20"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          <span className="font-orbitron tracking-tight text-[11px] uppercase">{t('post')}</span>
        </button>

        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setShowNotifs(!showNotifs)} 
            className={`p-2 transition-colors relative rounded-lg ${showNotifs ? 'bg-cyan-500/10 text-cyan-400' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-[10px] font-bold text-white flex items-center justify-center rounded-full border-2 border-[#0b0e14]">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {showNotifs && (
            <div className="absolute right-0 mt-3 w-80 bg-[#151921] border border-gray-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="px-4 py-3 border-b border-gray-800 bg-[#1a1f2b] flex items-center justify-between">
                <h3 className="text-xs font-orbitron font-bold text-cyan-400 uppercase tracking-widest">{t('signals_received')}</h3>
                <span className="text-[10px] text-gray-500 font-mono">{notifications.length} TOTAL</span>
              </div>
              <div className="max-h-[400px] overflow-y-auto scrollbar-hide">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center">
                    <p className="text-gray-600 text-xs italic">No transmissions detected...</p>
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div 
                      key={notif.id}
                      onClick={() => {
                        onNotificationClick(notif);
                        setShowNotifs(false);
                      }}
                      className={`p-4 border-b border-gray-800/50 hover:bg-gray-800/30 cursor-pointer transition-colors flex items-start space-x-3 group ${!notif.read ? 'bg-cyan-500/5' : ''}`}
                    >
                      <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${!notif.read ? 'bg-cyan-400 animate-pulse' : 'bg-transparent'}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-300 leading-relaxed">
                          <span className="text-white font-bold">{notif.authorName}</span> transmitted a signal in <span className="text-cyan-400 font-medium">n/{notif.forumName}</span>
                        </p>
                        <p className="text-[10px] text-gray-600 mt-1 uppercase font-bold tracking-tighter group-hover:text-gray-400 transition-colors">
                          {notif.timestamp}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div onClick={onProfileClick} className="flex items-center space-x-3 pl-4 border-l border-gray-800 cursor-pointer group">
          <div className="hidden lg:block text-right">
            <p className="text-xs font-bold text-white leading-tight group-hover:text-cyan-400 transition-colors">{user.username}</p>
            <p className="text-[10px] text-gray-500 uppercase tracking-tighter">{t('view_orbit')}</p>
          </div>
          <img src={user.avatar} className="w-10 h-10 rounded-xl border border-gray-700 group-hover:border-cyan-500 group-hover:nexus-glow transition-all object-cover" />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
