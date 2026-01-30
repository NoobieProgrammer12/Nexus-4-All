
import React, { useRef, useContext, useMemo } from 'react';
import { User, Post, FriendRequest } from '../types';
import PostCard from './PostCard';
import { LanguageContext } from '../App';

interface ProfileViewProps {
  targetUserId: string;
  currentUser: User;
  allPosts: Post[];
  usersRegistry: User[];
  pendingRequests: FriendRequest[];
  onUpdateAvatar: (base64: string) => void;
  onBack: () => void;
  onBanUser: (userId: string) => void;
  onSendFriendRequest: (userId: string) => void;
  onDeletePost?: (postId: string) => void;
  onUserClick: (userId: string) => void;
  onForumClick: (forumId: string) => void;
}

const ProfileView: React.FC<ProfileViewProps> = ({ targetUserId, currentUser, allPosts, usersRegistry, pendingRequests, onUpdateAvatar, onBack, onBanUser, onSendFriendRequest, onDeletePost, onUserClick, onForumClick }) => {
  const { t } = useContext(LanguageContext);
  const isSelf = targetUserId === currentUser.id;
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const profileUser = useMemo(() => {
    const found = usersRegistry.find(u => u.id === targetUserId);
    return isSelf ? currentUser : (found || { 
      id: targetUserId, 
      username: 'NexusExplorer', 
      avatar: 'https://picsum.photos/seed/user/100/100', 
      joinedForumIds: [],
      isGuest: false,
      friendsCount: 0,
      postStreak: 0,
      isBanned: false,
      friendIds: []
    } as User);
  }, [targetUserId, usersRegistry, currentUser, isSelf]);

  const userPosts = allPosts.filter(p => p.authorId === targetUserId);
  const isFriend = currentUser.friendIds.includes(targetUserId);
  const isRequestPending = pendingRequests.some(r => r.fromId === currentUser.id && r.toId === targetUserId);

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 relative">
      <button 
        onClick={onBack}
        className="absolute top-8 left-4 z-10 p-2 bg-[#151921] border border-gray-800 rounded-xl text-gray-400 hover:text-cyan-400 hover:border-cyan-500/50 transition-all shadow-lg"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
      </button>

      <div className="bg-[#151921] border border-gray-800 rounded-3xl p-8 mb-8 text-center relative overflow-hidden">
        <div className="w-24 h-24 mx-auto mb-4 rounded-3xl border-2 border-cyan-500 p-1 relative overflow-hidden group shadow-[0_0_20px_rgba(34,211,238,0.2)]">
          <img src={profileUser.avatar} className="w-full h-full object-cover rounded-2xl" />
          {isSelf && !profileUser.isGuest && (
            <div onClick={() => fileInputRef.current?.click()} className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity">📸</div>
          )}
          <input type="file" ref={fileInputRef} className="hidden" onChange={(e) => {
             const f = e.target.files?.[0];
             if(f) { const r = new FileReader(); r.onload = () => onUpdateAvatar(r.result as string); r.readAsDataURL(f); }
          }} />
        </div>
        
        <h1 className="text-3xl font-orbitron font-bold text-white mb-2">{profileUser.username}</h1>
        
        {!isSelf && (
          <div className="flex justify-center space-x-3 mb-6">
            <button 
              onClick={() => !isFriend && !isRequestPending && onSendFriendRequest(targetUserId)}
              disabled={isFriend || isRequestPending}
              className={`px-6 py-2 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${
                isFriend ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 
                isRequestPending ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' :
                'bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-900/40'
              }`}
            >
              {isFriend ? '✓ Orbit Connected' : isRequestPending ? 'Protocol Pending...' : 'Send Friend Protocol'}
            </button>
            <button className="px-4 py-2 bg-gray-800 text-gray-400 rounded-xl border border-gray-700 hover:text-white transition-all">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </button>
          </div>
        )}

        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="bg-[#0b0e14] p-4 rounded-2xl border border-gray-800">
            <p className="text-cyan-400 font-bold text-xl">{profileUser.postStreak}</p>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest">{t('karma')}</p>
          </div>
          <div className="bg-[#0b0e14] p-4 rounded-2xl border border-gray-800">
            <p className="text-purple-400 font-bold text-xl">{profileUser.friendsCount}</p>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest">{t('friends')}</p>
          </div>
          <div className="bg-[#0b0e14] p-4 rounded-2xl border border-gray-800">
            <p className="text-emerald-400 font-bold text-xl">{profileUser.joinedForumIds.length}</p>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest">{t('joined_forums')}</p>
          </div>
        </div>
      </div>
      
      <div className="space-y-4">
        <h2 className="text-sm font-orbitron font-bold text-gray-500 uppercase tracking-[0.3em] mb-4">{t('history')}</h2>
        {userPosts.length === 0 ? (
          <p className="text-gray-600 text-center py-10 italic">No transmissions found in archives...</p>
        ) : (
          userPosts.map(post => (
            <PostCard 
              key={post.id} 
              post={post} 
              onUserClick={onUserClick} 
              onForumClick={onForumClick} 
              isAdmin={currentUser.isAdmin} 
              onDelete={onDeletePost}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default ProfileView;
