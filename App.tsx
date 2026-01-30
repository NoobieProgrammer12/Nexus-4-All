
import React, { useState, useEffect, useMemo, createContext } from 'react';
import { User, Post, Forum, View, NexusNotification, FriendRequest, DirectMessage } from './types';
import { translations } from './translations';
import LoginView from './components/LoginView';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Feed from './components/Feed';
import ProfileView from './components/ProfileView';
import SearchView from './components/SearchView';
import FriendsView from './components/FriendsView';
import CreateForumModal from './components/CreateForumModal';
import CreatePostModal from './components/CreatePostModal';

const STORAGE_KEY = 'nexus_4_all_social_v1';

type NexusLanguage = 'es' | 'en' | 'pt';

interface LanguageContextType {
  language: NexusLanguage;
  t: (key: keyof typeof translations['en']) => string;
  setLanguage: (lang: NexusLanguage) => void;
}

export const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  t: (key) => translations['en'][key],
  setLanguage: () => {}
});

const INITIAL_USERS: User[] = [];

export default function App() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [usersRegistry, setUsersRegistry] = useState<User[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [forums, setForums] = useState<Forum[]>([]);
  const [notifications, setNotifications] = useState<NexusNotification[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [language, setLanguage] = useState<NexusLanguage>('en');
  const [systemToast, setSystemToast] = useState<{message: string, type: 'info' | 'error'} | null>(null);

  useEffect(() => {
    try {
      const reg = localStorage.getItem(`${STORAGE_KEY}_registry`);
      const active = localStorage.getItem(`${STORAGE_KEY}_active_user`);
      const p = localStorage.getItem(`${STORAGE_KEY}_posts`);
      const f = localStorage.getItem(`${STORAGE_KEY}_forums`);
      const n = localStorage.getItem(`${STORAGE_KEY}_notifications`);
      const fr = localStorage.getItem(`${STORAGE_KEY}_friend_requests`);
      const m = localStorage.getItem(`${STORAGE_KEY}_messages`);
      
      let loadedRegistry = reg ? JSON.parse(reg) : INITIAL_USERS;
      setUsersRegistry(loadedRegistry);

      if (active) setUser(JSON.parse(active));
      setForums(f ? JSON.parse(f) : []);
      setPosts(p ? JSON.parse(p) : []);
      setNotifications(n ? JSON.parse(n) : []);
      setFriendRequests(fr ? JSON.parse(fr) : []);
      setMessages(m ? JSON.parse(m) : []);
    } catch (e) {
      console.error("Nexus Storage Error", e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const showToast = (message: string, type: 'info' | 'error' = 'info') => {
    setSystemToast({ message, type });
    setTimeout(() => setSystemToast(null), 3000);
  };

  const t = (key: keyof typeof translations['en']) => translations[language][key] || key;

  const [currentView, setCurrentView] = useState<View>('feed');
  const [activeForumId, setActiveForumId] = useState<string | null>(null);
  const [targetUserId, setTargetUserId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateForumOpen, setIsCreateForumOpen] = useState(false);
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);

  // Persistence
  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem(`${STORAGE_KEY}_registry`, JSON.stringify(usersRegistry));
    localStorage.setItem(`${STORAGE_KEY}_active_user`, JSON.stringify(user));
    localStorage.setItem(`${STORAGE_KEY}_posts`, JSON.stringify(posts));
    localStorage.setItem(`${STORAGE_KEY}_forums`, JSON.stringify(forums));
    localStorage.setItem(`${STORAGE_KEY}_notifications`, JSON.stringify(notifications));
    localStorage.setItem(`${STORAGE_KEY}_friend_requests`, JSON.stringify(friendRequests));
    localStorage.setItem(`${STORAGE_KEY}_messages`, JSON.stringify(messages));
  }, [user, usersRegistry, posts, forums, notifications, friendRequests, messages, isLoaded]);

  // Si hay búsqueda activa, cambiar vista a search
  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      setCurrentView('search');
    } else if (currentView === 'search') {
      setCurrentView('feed');
    }
  }, [searchQuery]);

  const handleSendFriendRequest = (toId: string) => {
    if (!user) return;
    if (friendRequests.some(r => (r.fromId === user.id && r.toId === toId) || (r.fromId === toId && r.toId === user.id))) {
      showToast("Link request already pending.", "error");
      return;
    }
    const newRequest: FriendRequest = {
      id: `fr-${Date.now()}`,
      fromId: user.id,
      fromName: user.username,
      fromAvatar: user.avatar,
      toId: toId,
      status: 'pending',
      timestamp: 'Just now'
    };
    setFriendRequests([...friendRequests, newRequest]);
    showToast("Friend protocol initiated.");
  };

  const handleAcceptFriendRequest = (requestId: string) => {
    const req = friendRequests.find(r => r.id === requestId);
    if (!req || !user) return;

    const updatedUser = { ...user, friendIds: [...user.friendIds, req.fromId], friendsCount: user.friendsCount + 1 };
    setUser(updatedUser);
    
    setUsersRegistry(prev => prev.map(u => {
      if (u.id === user.id) return updatedUser;
      if (u.id === req.fromId) return { ...u, friendIds: [...u.friendIds, user.id], friendsCount: u.friendsCount + 1 };
      return u;
    }));

    setFriendRequests(prev => prev.filter(r => r.id !== requestId));
    showToast("Connection established!");
  };

  const handleSendMessage = (receiverId: string, text: string) => {
    if (!user) return;
    const newMessage: DirectMessage = {
      id: `m-${Date.now()}`,
      senderId: user.id,
      receiverId,
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages([...messages, newMessage]);
  };

  const handleLogin = (userData: Partial<User>, mode: 'login' | 'signup') => {
    if (mode === 'login' && userData.id) {
      const existing = usersRegistry.find(u => u.id === userData.id);
      if (existing) {
        setUser(existing);
        showToast(`Welcome back, ${existing.username}`);
        return;
      }
    }

    const newUser: User = {
      id: userData.id || 'u' + Date.now(),
      username: userData.username || 'Explorer',
      email: userData.email || '',
      avatar: userData.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.username || Date.now()}`,
      isGuest: userData.isGuest || false,
      isAdmin: userData.isAdmin || false,
      joinedForumIds: [],
      createdForumIds: [],
      friendsCount: 0,
      postStreak: 0,
      friendIds: []
    };
    
    setUsersRegistry(prev => [...prev, newUser]);
    setUser(newUser);
    showToast(mode === 'signup' ? "Nexus Account Established" : "Signal Synchronized");
  };

  if (!isLoaded) return <div className="min-h-screen bg-[#0b0e14] flex items-center justify-center font-orbitron text-cyan-400 text-center px-4">ESTABLISHING CONNECTION TO NEXUS...</div>;

  return (
    <LanguageContext.Provider value={{ language, t, setLanguage }}>
      {systemToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[10000] w-full max-w-sm pointer-events-none">
          <div className="mx-4 bg-[#1a1f2b]/95 backdrop-blur border border-cyan-500/50 rounded-2xl p-4 shadow-[0_0_30px_rgba(34,211,238,0.2)] animate-in fade-in slide-in-from-top-4">
            <p className="text-sm font-bold text-white uppercase font-orbitron text-center tracking-widest">{systemToast.message}</p>
          </div>
        </div>
      )}

      {!user ? (
        <LoginView onLogin={handleLogin} usersRegistry={usersRegistry} />
      ) : (
        <div className="min-h-screen bg-[#0b0e14] flex flex-col md:flex-row">
          <Sidebar 
            currentView={currentView} 
            activeForumId={activeForumId}
            isAdmin={user.isAdmin}
            setView={(v) => { setCurrentView(v); setActiveForumId(null); setTargetUserId(null); }} 
            joinedForums={forums.filter(f => user.joinedForumIds.includes(f.id))}
            createdForums={forums.filter(f => user.createdForumIds.includes(f.id))}
            onForumSelect={(id) => { setActiveForumId(id); setCurrentView('forum'); }}
            onCreateForum={() => setIsCreateForumOpen(true)}
          />
          
          <main className="flex-1 flex flex-col min-w-0">
            <Navbar 
              searchQuery={searchQuery} setSearchQuery={setSearchQuery} 
              user={user} notifications={notifications}
              onNotificationClick={(n) => { setActiveForumId(n.forumId!); setCurrentView('forum'); }}
              onNewPost={() => setIsCreatePostOpen(true)}
              onProfileClick={() => { setTargetUserId(user.id); setCurrentView('profile'); }}
            />
            
            <div className="flex-1 overflow-y-auto">
              {currentView === 'feed' && (
                <Feed 
                  posts={posts} 
                  joinedForumIds={user.joinedForumIds} 
                  onUserClick={(id) => { setTargetUserId(id); setCurrentView('profile'); }} 
                  onForumClick={(id) => { setActiveForumId(id); setCurrentView('forum'); }} 
                  onUpdateForumIcon={()=>{}} 
                />
              )}

              {currentView === 'forum' && (
                <Feed 
                  posts={posts} 
                  activeForum={forums.find(f => f.id === activeForumId)}
                  isJoined={user.joinedForumIds.includes(activeForumId || '')}
                  isOwner={user.createdForumIds.includes(activeForumId || '')}
                  isAdmin={user.isAdmin}
                  onJoin={() => {
                    if (!activeForumId) return;
                    const isJoined = user.joinedForumIds.includes(activeForumId);
                    const updatedUser = {
                      ...user,
                      joinedForumIds: isJoined 
                        ? user.joinedForumIds.filter(id => id !== activeForumId) 
                        : [...user.joinedForumIds, activeForumId]
                    };
                    setUser(updatedUser);
                    setUsersRegistry(prev => prev.map(u => u.id === user.id ? updatedUser : u));
                    setForums(prev => prev.map(f => f.id === activeForumId ? { ...f, memberCount: f.memberCount + (isJoined ? -1 : 1) } : f));
                  }}
                  onDeleteForum={(id) => {
                    setForums(forums.filter(f => f.id !== id));
                    setCurrentView('feed');
                    setActiveForumId(null);
                  }}
                  onDeletePost={(id) => setPosts(posts.filter(p => p.id !== id))}
                  joinedForumIds={user.joinedForumIds}
                  onUserClick={(id) => { setTargetUserId(id); setCurrentView('profile'); }} 
                  onForumClick={(id) => { setActiveForumId(id); setCurrentView('forum'); }} 
                  onUpdateForumIcon={(b) => setForums(prev => prev.map(f => f.id === activeForumId ? { ...f, icon: b } : f))}
                />
              )}
              
              {currentView === 'search' && (
                <SearchView 
                  query={searchQuery}
                  posts={posts.filter(p => p.content.toLowerCase().includes(searchQuery.toLowerCase()))}
                  forums={forums.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()))}
                  users={usersRegistry.filter(u => u.username.toLowerCase().includes(searchQuery.toLowerCase()))}
                  isAdmin={user.isAdmin}
                  onUserClick={(id) => { setTargetUserId(id); setCurrentView('profile'); }}
                  onForumClick={(id) => { setActiveForumId(id); setCurrentView('forum'); }}
                  onDeleteForum={(id) => setForums(forums.filter(f => f.id !== id))}
                  onDeletePost={(id) => setPosts(posts.filter(p => p.id !== id))}
                />
              )}

              {currentView === 'friends' && (
                <FriendsView 
                  user={user} 
                  friends={usersRegistry.filter(u => user.friendIds.includes(u.id))}
                  requests={friendRequests.filter(r => r.toId === user.id)}
                  messages={messages}
                  onAccept={handleAcceptFriendRequest}
                  onSendMessage={handleSendMessage}
                />
              )}

              {currentView === 'profile' && (
                <ProfileView 
                  targetUserId={targetUserId || user.id} 
                  currentUser={user} 
                  allPosts={posts} 
                  usersRegistry={usersRegistry}
                  pendingRequests={friendRequests}
                  onUpdateAvatar={(b) => {
                    const updatedUser = {...user, avatar: b};
                    setUser(updatedUser);
                    setUsersRegistry(prev => prev.map(u => u.id === user.id ? updatedUser : u));
                  }}
                  onBack={() => setCurrentView('feed')}
                  onBanUser={() => {}}
                  onDeletePost={(id) => setPosts(posts.filter(p => p.id !== id))}
                  onSendFriendRequest={handleSendFriendRequest}
                  onUserClick={(id) => setTargetUserId(id)}
                  onForumClick={(id) => { setActiveForumId(id); setCurrentView('forum'); }}
                />
              )}

              {currentView === 'settings' && (
                <div className="p-8">
                   <h1 className="text-2xl font-orbitron text-cyan-400 mb-4">{t('settings')}</h1>
                   <div className="space-y-6">
                     <div className="bg-[#151921] border border-gray-800 p-6 rounded-2xl">
                       <h2 className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-4">Communication Interface</h2>
                       <div className="flex gap-4">
                         {(['en', 'es', 'pt'] as NexusLanguage[]).map(lang => (
                           <button 
                             key={lang} 
                             onClick={() => setLanguage(lang)}
                             className={`px-4 py-2 rounded-lg font-bold border ${language === lang ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400' : 'border-gray-800 text-gray-500 hover:text-white'}`}
                           >
                             {lang.toUpperCase()}
                           </button>
                         ))}
                       </div>
                     </div>
                     <button onClick={() => {
                        localStorage.removeItem(`${STORAGE_KEY}_active_user`);
                        setUser(null);
                     }} className="w-full bg-red-500/10 text-red-500 px-4 py-4 rounded-xl border border-red-500/20 font-bold hover:bg-red-500 hover:text-white transition-all uppercase tracking-[0.2em] font-orbitron text-[10px]">
                       {t('logout')}
                     </button>
                   </div>
                </div>
              )}
            </div>
          </main>
          {isCreateForumOpen && <CreateForumModal onClose={() => setIsCreateForumOpen(false)} onSubmit={(n, d) => {
            const nf: Forum = { id: 'f'+Date.now(), name: n, description: d, memberCount: 1, icon: '🌐', creatorId: user.id };
            setForums([nf, ...forums]);
            setUser({...user, createdForumIds: [...user.createdForumIds, nf.id], joinedForumIds: [...user.joinedForumIds, nf.id]});
            setIsCreateForumOpen(false);
          }} />}
          {isCreatePostOpen && <CreatePostModal forums={forums.filter(f => user.joinedForumIds.includes(f.id))} onClose={() => setIsCreatePostOpen(false)} onSubmit={(c, f, i) => {
            const np: Post = { id: 'p'+Date.now(), authorId: user.id, authorName: user.username, authorAvatar: user.avatar, forumId: f, forumName: forums.find(fo=>fo.id===f)?.name || 'Nexus', content: c, imageUrl: i, timestamp: 'Just now', likes: 0, comments: 0 };
            setPosts([np, ...posts]);
            setIsCreatePostOpen(false);
          }} />}
        </div>
      )}
    </LanguageContext.Provider>
  );
}
