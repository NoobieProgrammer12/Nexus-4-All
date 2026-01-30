
import React, { useContext } from 'react';
import { View, Forum } from '../types';
import { LanguageContext } from '../App';
import { isCloudActive } from '../supabase';

interface SidebarProps {
  currentView: View;
  activeForumId: string | null;
  setView: (view: View) => void;
  joinedForums: Forum[];
  createdForums: Forum[];
  onForumSelect: (forumId: string) => void;
  onCreateForum: () => void;
  isAdmin?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, activeForumId, setView, joinedForums, createdForums, onForumSelect, onCreateForum, isAdmin }) => {
  const { t } = useContext(LanguageContext);
  const cloudEnabled = isCloudActive();

  const NavItem = ({ icon, label, id, active, color }: { icon: string, label: string, id: View, active: boolean, color?: string }) => (
    <button
      onClick={() => setView(id)}
      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
        active 
          ? `${color || 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'}` 
          : 'text-gray-400 hover:bg-gray-800'
      }`}
    >
      <span className="text-xl">{icon}</span>
      <span className="font-medium">{label}</span>
    </button>
  );

  const ForumList = ({ title, list, colorClass }: { title: string, list: Forum[], colorClass: string }) => (
    <div className="mb-6">
      {title && (
        <div className="flex items-center justify-between px-2 mb-2">
          <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{title}</h3>
        </div>
      )}
      <div className="space-y-1">
        {list.length === 0 ? (
          <p className="text-[10px] text-gray-700 px-4 italic">...</p>
        ) : (
          list.map(forum => {
            const isActive = currentView === 'forum' && activeForumId === forum.id;
            return (
              <button
                key={forum.id}
                onClick={() => onForumSelect(forum.id)}
                className={`w-full flex items-center space-x-3 px-4 py-2 rounded-lg transition-all text-sm group ${
                  isActive ? `${colorClass}/10 ${colorClass} border ${colorClass}/20` : 'text-gray-400 hover:bg-gray-800'
                }`}
              >
                <span className={`w-6 h-6 flex items-center justify-center text-lg overflow-hidden rounded-md shrink-0`}>
                  {forum.icon.startsWith('data:') ? (
                    <img src={forum.icon} alt={forum.name} className="w-full h-full object-cover" />
                  ) : (
                    forum.icon
                  )}
                </span>
                <span className="truncate flex-1 text-left">{forum.name}</span>
                <span className={`text-[10px] ${isActive ? colorClass : 'text-gray-600'}`}>
                  {forum.memberCount}
                </span>
              </button>
            );
          })
        )}
      </div>
    </div>
  );

  return (
    <aside className="w-full md:w-64 bg-[#0b0e14] border-r border-gray-800 flex flex-col h-screen sticky top-0 overflow-hidden">
      <div className="p-6">
        <h2 className="text-xl font-orbitron font-bold text-cyan-400 tracking-tighter uppercase">Nexus 4 All</h2>
      </div>

      <div className="flex-1 overflow-y-auto px-4 scrollbar-hide">
        <div className="pb-4 border-b border-gray-800/50 mb-4 space-y-1">
          <NavItem icon="🏠" label={t('home')} id="feed" active={currentView === 'feed'} />
          <NavItem icon="👥" label={t('friends')} id="friends" active={currentView === 'friends'} />
          <NavItem icon="👤" label={t('profile')} id="profile" active={currentView === 'profile'} />
          <NavItem icon="⚙️" label={t('settings')} id="settings" active={currentView === 'settings'} />
          
          {isAdmin && (
            <div className="pt-2 border-t border-red-500/20 mt-2">
               <NavItem 
                icon="🛠️" 
                label={t('dev_hub')} 
                id="dev-hub" 
                active={currentView === 'dev-hub'} 
                color="bg-red-500/10 text-red-400 border border-red-500/20"
              />
            </div>
          )}
        </div>

        <ForumList title={t('my_joined')} list={joinedForums} colorClass="text-purple-400" />
        
        <div className="mb-6">
          <div className="flex items-center justify-between px-2 mb-2">
            <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{t('created_forums')}</h3>
            <button onClick={onCreateForum} className="p-1 hover:bg-gray-800 rounded-full text-cyan-400 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          <ForumList title="" list={createdForums} colorClass="text-cyan-400" />
        </div>
      </div>

      <div className="p-4 mt-auto border-t border-gray-800/50 space-y-3">
        <div className="flex items-center space-x-2 px-2">
          <div className={`w-2 h-2 rounded-full animate-pulse ${cloudEnabled ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
          <span className="text-[9px] text-gray-500 uppercase font-bold tracking-widest">
            {cloudEnabled ? 'Cloud Sync Active' : 'Local Storage Mode'}
          </span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
