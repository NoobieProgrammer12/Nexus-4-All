
import React, { useState, useEffect, useMemo, createContext } from 'react';
import { User, Post, Forum, View, NexusNotification, FriendRequest, DirectMessage, Report } from './types';
import { translations } from './translations';
import { supabase, isCloudActive } from './supabase';
import LoginView from './components/LoginView';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Feed from './components/Feed';
import ProfileView from './components/ProfileView';
import SearchView from './components/SearchView';
import FriendsView from './components/FriendsView';
import DevHubView from './components/DevHubView';
import CreateForumModal from './components/CreateForumModal';
import CreatePostModal from './components/CreatePostModal';
import ReportModal from './components/ReportModal';

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

export default function App() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [usersRegistry, setUsersRegistry] = useState<User[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [forums, setForums] = useState<Forum[]>([]);
  const [notifications, setNotifications] = useState<NexusNotification[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [language, setLanguage] = useState<NexusLanguage>('en');
  const [systemToast, setSystemToast] = useState<{message: string, type: 'info' | 'error'} | null>(null);

  const cloudEnabled = isCloudActive();

  // 1. CARGA INICIAL DE DATOS (Prioriza Supabase si está disponible)
  useEffect(() => {
    const initData = async () => {
      try {
        if (cloudEnabled && supabase) {
          const { data: f } = await supabase.from('forums').select('*');
          const { data: p } = await supabase.from('posts').select('*').order('id', { ascending: false });
          const { data: u } = await supabase.from('users_registry').select('*');
          
          if (f) setForums(f);
          if (p) setPosts(p);
          if (u) setUsersRegistry(u);
        } else {
          // Fallback a LocalStorage si no hay Supabase
          const regRaw = localStorage.getItem(`${STORAGE_KEY}_registry`);
          const p = localStorage.getItem(`${STORAGE_KEY}_posts`);
          const f = localStorage.getItem(`${STORAGE_KEY}_forums`);
          if (regRaw) setUsersRegistry(JSON.parse(regRaw));
          if (f) setForums(JSON.parse(f));
          if (p) setPosts(JSON.parse(p));
        }

        // Recuperar sesión de usuario (Siempre de LocalStorage para persistencia de sesión local)
        const active = localStorage.getItem(`${STORAGE_KEY}_active_user`);
        if (active) setUser(JSON.parse(active));
        
        // Carga de metadatos sociales
        const n = localStorage.getItem(`${STORAGE_KEY}_notifications`);
        const fr = localStorage.getItem(`${STORAGE_KEY}_friend_requests`);
        const m = localStorage.getItem(`${STORAGE_KEY}_messages`);
        const r = localStorage.getItem(`${STORAGE_KEY}_reports`);
        setNotifications(n ? JSON.parse(n) : []);
        setFriendRequests(fr ? JSON.parse(fr) : []);
        setMessages(m ? JSON.parse(m) : []);
        setReports(r ? JSON.parse(r) : []);
      } catch (e) {
        console.error("Nexus Sync Error:", e);
      } finally {
        setIsLoaded(true);
      }
    };
    initData();
  }, [cloudEnabled]);

  // 2. SUSCRIPCIONES EN TIEMPO REAL (Supabase)
  useEffect(() => {
    if (!cloudEnabled || !supabase) return;

    const postSub = supabase.channel('posts-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, payload => {
        if (payload.eventType === 'INSERT') setPosts(prev => [payload.new as Post, ...prev]);
        if (payload.eventType === 'DELETE') setPosts(prev => prev.filter(p => p.id !== payload.old.id));
      }).subscribe();

    const forumSub = supabase.channel('forums-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'forums' }, payload => {
        if (payload.eventType === 'INSERT') setForums(prev => [payload.new as Forum, ...prev]);
        if (payload.eventType === 'UPDATE') setForums(prev => prev.map(f => f.id === payload.new.id ? payload.new as Forum : f));
        if (payload.eventType === 'DELETE') setForums(prev => prev.filter(f => f.id !== payload.old.id));
      }).subscribe();

    return () => {
      supabase.removeChannel(postSub);
      supabase.removeChannel(forumSub);
    };
  }, [cloudEnabled]);

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
  const [reportingPostId, setReportingPostId] = useState<string | null>(null);

  // Guardado de respaldo en LocalStorage
  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem(`${STORAGE_KEY}_active_user`, JSON.stringify(user));
    if (!cloudEnabled) {
      localStorage.setItem(`${STORAGE_KEY}_registry`, JSON.stringify(usersRegistry));
      localStorage.setItem(`${STORAGE_KEY}_posts`, JSON.stringify(posts));
      localStorage.setItem(`${STORAGE_KEY}_forums`, JSON.stringify(forums));
    }
    localStorage.setItem(`${STORAGE_KEY}_notifications`, JSON.stringify(notifications));
    localStorage.setItem(`${STORAGE_KEY}_friend_requests`, JSON.stringify(friendRequests));
    localStorage.setItem(`${STORAGE_KEY}_messages`, JSON.stringify(messages));
    localStorage.setItem(`${STORAGE_KEY}_reports`, JSON.stringify(reports));
  }, [user, usersRegistry, posts, forums, notifications, friendRequests, messages, reports, isLoaded, cloudEnabled]);

  // LOGICA DE BÚSQUEDA CORREGIDA
  const updateSearchQuery = (q: string) => {
    setSearchQuery(q);
    if (q.trim().length > 0) {
      setCurrentView('search');
    } else if (currentView === 'search') {
      setCurrentView('feed');
    }
  };

  const handleReportPost = async (postId: string, reason: string) => {
    const post = posts.find(p => p.id === postId);
    if (!post || !user) return;
    const newReport: Report = {
      id: `rep-${Date.now()}`,
      postId,
      postContent: post.content,
      authorName: post.authorName,
      reporterName: user.username,
      reason,
      timestamp: new Date().toLocaleString()
    };
    setReports([newReport, ...reports]);
    if (cloudEnabled && supabase) await supabase.from('reports').insert(newReport);
    setReportingPostId(null);
    showToast("Signal reported to Dev Hub.");
  };

  const handleBanUser = async (userId: string) => {
    if (userId === 'admin') return;
    setUsersRegistry(prev => prev.filter(u => u.id !== userId));
    setPosts(prev => prev.filter(p => p.authorId !== userId));
    if (cloudEnabled && supabase) {
      await supabase.from('users_registry').delete().eq('id', userId);
      await supabase.from('posts').delete().eq('author_id', userId);
    }
    showToast("Explorer banned and wiped from Nexus.");
  };

  const handleLogin = async (userData: Partial<User>, mode: 'login' | 'signup') => {
    let finalUser: User;

    if (mode === 'login') {
      const existing = usersRegistry.find(u => 
        (userData.id && u.id === userData.id) || 
        (userData.email && u.email?.toLowerCase() === userData.email.toLowerCase())
      );
      if (existing) {
        setUser(existing);
        showToast(`Welcome back, ${existing.username}`);
        return;
      }
      if (userData.id === 'admin') {
         finalUser = { id: 'admin', username: 'NexusAdmin', email: 'admin@nexus.com', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Admin', isGuest: false, isAdmin: true, joinedForumIds: [], createdForumIds: [], friendsCount: 0, postStreak: 0, friendIds: [] };
         setUsersRegistry(prev => [...prev, finalUser]);
         setUser(finalUser);
         if (cloudEnabled && supabase) await supabase.from('users_registry').upsert(finalUser);
         return;
      }
    }

    finalUser = {
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
    
    setUsersRegistry(prev => [...prev, finalUser]);
    setUser(finalUser);
    if (cloudEnabled && supabase && !finalUser.isGuest) await supabase.from('users_registry').insert(finalUser);
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
            setView={(v) => { setCurrentView(v); setActiveForumId(null); setTargetUserId(null); setSearchQuery(''); }} 
            joinedForums={forums.filter(f => user.joinedForumIds.includes(f.id))}
            createdForums={forums.filter(f => user.createdForumIds.includes(f.id))}
            onForumSelect={(id) => { setActiveForumId(id); setCurrentView('forum'); setSearchQuery(''); }}
            onCreateForum={() => setIsCreateForumOpen(true)}
          />
          
          <main className="flex-1 flex flex-col min-w-0">
            <Navbar 
              searchQuery={searchQuery} 
              setSearchQuery={updateSearchQuery} 
              user={user} 
              notifications={notifications}
              onNotificationClick={(n) => { setActiveForumId(n.forumId!); setCurrentView('forum'); setSearchQuery(''); }}
              onNewPost={() => setIsCreatePostOpen(true)}
              onProfileClick={() => { setTargetUserId(user.id); setCurrentView('profile'); setSearchQuery(''); }}
            />
            
            <div className="flex-1 overflow-y-auto">
              {currentView === 'feed' && (
                <Feed 
                  posts={posts} 
                  joinedForumIds={user.joinedForumIds} 
                  onUserClick={(id) => { setTargetUserId(id); setCurrentView('profile'); }} 
                  onForumClick={(id) => { setActiveForumId(id); setCurrentView('forum'); }} 
                  onUpdateForumIcon={()=>{}} 
                  onReportPost={(id) => setReportingPostId(id)}
                />
              )}

              {currentView === 'forum' && (
                <Feed 
                  posts={posts} 
                  activeForum={forums.find(f => f.id === activeForumId)}
                  isJoined={user.joinedForumIds.includes(activeForumId || '')}
                  isOwner={user.createdForumIds.includes(activeForumId || '')}
                  isAdmin={user.isAdmin}
                  onJoin={async () => {
                    if (!activeForumId) return;
                    const isNowJoined = user.joinedForumIds.includes(activeForumId);
                    const updatedUser = {
                      ...user,
                      joinedForumIds: isNowJoined 
                        ? user.joinedForumIds.filter(id => id !== activeForumId) 
                        : [...user.joinedForumIds, activeForumId]
                    };
                    setUser(updatedUser);
                    setForums(prev => prev.map(f => f.id === activeForumId ? { ...f, memberCount: f.memberCount + (isNowJoined ? -1 : 1) } : f));
                    if (cloudEnabled && supabase) {
                      await supabase.from('users_registry').update({ joinedForumIds: updatedUser.joinedForumIds }).eq('id', user.id);
                      await supabase.from('forums').update({ memberCount: (forums.find(fo=>fo.id===activeForumId)?.memberCount || 0) + (isNowJoined ? -1 : 1) }).eq('id', activeForumId);
                    }
                  }}
                  onDeleteForum={async (id) => {
                    setForums(forums.filter(f => f.id !== id));
                    if (cloudEnabled && supabase) await supabase.from('forums').delete().eq('id', id);
                    setCurrentView('feed');
                    setActiveForumId(null);
                  }}
                  onDeletePost={async (id) => {
                    setPosts(posts.filter(p => p.id !== id));
                    if (cloudEnabled && supabase) await supabase.from('posts').delete().eq('id', id);
                  }}
                  onReportPost={(id) => setReportingPostId(id)}
                  joinedForumIds={user.joinedForumIds}
                  onUserClick={(id) => { setTargetUserId(id); setCurrentView('profile'); }} 
                  onForumClick={(id) => { setActiveForumId(id); setCurrentView('forum'); }} 
                  onUpdateForumIcon={async (b) => {
                     setForums(prev => prev.map(f => f.id === activeForumId ? { ...f, icon: b } : f));
                     if (cloudEnabled && supabase && activeForumId) await supabase.from('forums').update({ icon: b }).eq('id', activeForumId);
                  }}
                />
              )}
              
              {currentView === 'search' && (
                <SearchView 
                  query={searchQuery}
                  posts={posts.filter(p => p.content.toLowerCase().includes(searchQuery.toLowerCase()) || p.forumName.toLowerCase().includes(searchQuery.toLowerCase()))}
                  forums={forums.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()))}
                  users={usersRegistry.filter(u => u.username.toLowerCase().includes(searchQuery.toLowerCase()))}
                  isAdmin={user.isAdmin}
                  onUserClick={(id) => { setTargetUserId(id); setCurrentView('profile'); setSearchQuery(''); }}
                  onForumClick={(id) => { setActiveForumId(id); setCurrentView('forum'); setSearchQuery(''); }}
                  onDeleteForum={async (id) => {
                    setForums(forums.filter(f => f.id !== id));
                    if (cloudEnabled && supabase) await supabase.from('forums').delete().eq('id', id);
                  }}
                  onDeletePost={async (id) => {
                    setPosts(posts.filter(p => p.id !== id));
                    if (cloudEnabled && supabase) await supabase.from('posts').delete().eq('id', id);
                  }}
                />
              )}

              {currentView === 'dev-hub' && user.isAdmin && (
                <DevHubView 
                  reports={reports}
                  users={usersRegistry}
                  forums={forums}
                  onDismissReport={(id) => setReports(prev => prev.filter(r => r.id !== id))}
                  onDeletePost={async (postId) => {
                    setPosts(prev => prev.filter(p => p.id !== postId));
                    if (cloudEnabled && supabase) await supabase.from('posts').delete().eq('id', postId);
                  }}
                  onDeleteForum={async (forumId) => {
                    setForums(prev => prev.filter(f => f.id !== forumId));
                    if (cloudEnabled && supabase) await supabase.from('forums').delete().eq('id', forumId);
                  }}
                  onBanUser={handleBanUser}
                />
              )}

              {currentView === 'friends' && (
                <FriendsView 
                  user={user} 
                  friends={usersRegistry.filter(u => user.friendIds.includes(u.id))}
                  requests={friendRequests.filter(r => r.toId === user.id)}
                  messages={messages}
                  onAccept={(rid) => {}} 
                  onSendMessage={(rid, text) => {}}
                />
              )}

              {currentView === 'profile' && (
                <ProfileView 
                  targetUserId={targetUserId || user.id} 
                  currentUser={user} 
                  allPosts={posts} 
                  usersRegistry={usersRegistry}
                  pendingRequests={friendRequests}
                  onUpdateAvatar={async (b) => {
                    const updatedUser = {...user, avatar: b};
                    setUser(updatedUser);
                    if (cloudEnabled && supabase) await supabase.from('users_registry').update({ avatar: b }).eq('id', user.id);
                  }}
                  onBack={() => setCurrentView('feed')}
                  onBanUser={handleBanUser}
                  onDeletePost={async (id) => {
                    setPosts(posts.filter(p => p.id !== id));
                    if (cloudEnabled && supabase) await supabase.from('posts').delete().eq('id', id);
                  }}
                  onSendFriendRequest={() => {}}
                  onUserClick={(id) => setTargetUserId(id)}
                  onForumClick={(id) => { setActiveForumId(id); setCurrentView('forum'); }}
                />
              )}

              {currentView === 'settings' && (
                <div className="p-8">
                   <h1 className="text-2xl font-orbitron text-cyan-400 mb-4">{t('settings')}</h1>
                   <div className="space-y-6">
                     <button onClick={() => {
                        localStorage.removeItem(`${STORAGE_KEY}_active_user`);
                        setUser(null);
                        setCurrentView('feed');
                     }} className="w-full bg-red-500/10 text-red-500 px-4 py-4 rounded-xl border border-red-500/20 font-bold hover:bg-red-500 hover:text-white transition-all uppercase tracking-[0.2em] font-orbitron text-[10px]">
                       {t('logout')}
                     </button>
                   </div>
                </div>
              )}
            </div>
          </main>
          {isCreateForumOpen && <CreateForumModal onClose={() => setIsCreateForumOpen(false)} onSubmit={async (n, d) => {
            const nf: Forum = { id: 'f'+Date.now(), name: n, description: d, memberCount: 1, icon: '🌐', creatorId: user.id };
            setForums([nf, ...forums]);
            const updatedUser = {...user, createdForumIds: [...user.createdForumIds, nf.id], joinedForumIds: [...user.joinedForumIds, nf.id]};
            setUser(updatedUser);
            if (cloudEnabled && supabase) {
              await supabase.from('forums').insert(nf);
              await supabase.from('users_registry').update({ createdForumIds: updatedUser.createdForumIds, joinedForumIds: updatedUser.joinedForumIds }).eq('id', user.id);
            }
            setIsCreateForumOpen(false);
          }} />}
          {isCreatePostOpen && <CreatePostModal forums={forums.filter(f => user.joinedForumIds.includes(f.id))} onClose={() => setIsCreatePostOpen(false)} onSubmit={async (c, f, i) => {
            const forum = forums.find(fo=>fo.id===f);
            const np: Post = { id: 'p'+Date.now(), authorId: user.id, authorName: user.username, authorAvatar: user.avatar, forumId: f, forumName: forum?.name || 'Nexus', content: c, imageUrl: i, timestamp: 'Just now', likes: 0, comments: 0 };
            setPosts([np, ...posts]);
            if (cloudEnabled && supabase) await supabase.from('posts').insert(np);
            setIsCreatePostOpen(false);
          }} />}
          {reportingPostId && <ReportModal onClose={() => setReportingPostId(null)} onSubmit={(reason) => handleReportPost(reportingPostId, reason)} />}
        </div>
      )}
    </LanguageContext.Provider>
  );
}
