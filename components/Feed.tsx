
import React, { useRef, useState, useMemo, useContext } from 'react';
import { Post, Forum } from '../types';
import PostCard from './PostCard';
import { LanguageContext } from '../App';

interface FeedProps {
  posts: Post[];
  activeForum?: Forum | null;
  isJoined?: boolean;
  isOwner?: boolean;
  isAdmin?: boolean;
  onDeletePost?: (postId: string) => void;
  onDeleteForum?: (forumId: string) => void;
  onReportPost?: (postId: string) => void;
  joinedForumIds: string[];
  onJoin?: () => void;
  onUserClick: (userId: string) => void;
  onForumClick: (forumId: string) => void;
  onUpdateForumIcon: (base64: string) => void;
}

type FeedFilter = 'hot' | 'latest' | 'fyp';

const Feed: React.FC<FeedProps> = ({ 
  posts, 
  activeForum, 
  isJoined, 
  isOwner, 
  isAdmin,
  onDeletePost,
  onDeleteForum,
  onReportPost,
  joinedForumIds,
  onJoin, 
  onUserClick, 
  onForumClick, 
  onUpdateForumIcon 
}) => {
  const { t } = useContext(LanguageContext);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [filter, setFilter] = useState<FeedFilter>('fyp');

  const filteredAndSortedPosts = useMemo(() => {
    let result = [...posts];
    if (!activeForum) {
      if (filter === 'fyp') {
        const joinedPosts = result.filter(p => joinedForumIds.includes(p.forumId));
        result = joinedPosts.length > 0 ? joinedPosts : result;
        result.sort((a, b) => (b.likes + b.comments * 2) - (a.likes + a.comments * 2));
      } else if (filter === 'hot') {
        result.sort((a, b) => (b.likes + b.comments) - (a.likes + a.comments));
      } else if (filter === 'latest') {
        result.sort((a, b) => b.id.localeCompare(a.id));
      }
    } else {
      result = result.filter(p => p.forumId === activeForum.id);
      result.sort((a, b) => b.id.localeCompare(a.id));
    }
    return result;
  }, [posts, filter, activeForum, joinedForumIds]);

  return (
    <div className="max-w-2xl mx-auto py-6 px-4">
      {activeForum ? (
        <div className="mb-8 bg-[#151921] border border-gray-800 rounded-2xl overflow-hidden relative">
          {(isAdmin || isOwner) && (
            <button 
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDeleteForum?.(activeForum.id); }}
              className="absolute top-4 right-4 z-[999] px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-orbitron font-bold text-[10px] uppercase shadow-2xl border-2 border-red-500/50 cursor-pointer"
            >
              Terminate Sector
            </button>
          )}
          <div className="h-24 bg-gradient-to-r from-purple-900/40 to-cyan-900/40 relative">
            <div onClick={() => isOwner && fileInputRef.current?.click()} className="absolute -bottom-6 left-6 w-20 h-20 bg-[#151921] rounded-2xl border border-gray-800 flex items-center justify-center text-3xl overflow-hidden shadow-lg cursor-pointer hover:border-cyan-500 transition-all">
              {activeForum.icon.startsWith('data:') ? <img src={activeForum.icon} className="w-full h-full object-cover" /> : activeForum.icon}
              <input type="file" ref={fileInputRef} className="hidden" onChange={(e) => {
                const f = e.target.files?.[0];
                if(f){
                   const r = new FileReader();
                   r.onload = () => onUpdateForumIcon(r.result as string);
                   r.readAsDataURL(f);
                }
              }} />
            </div>
          </div>
          <div className="pt-8 pb-6 px-6">
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-2xl font-orbitron font-bold text-white tracking-tight">n/{activeForum.name}</h1>
              <button onClick={onJoin} className={`px-6 py-2 font-bold rounded-full text-sm transition-all ${isJoined ? 'bg-gray-800 text-gray-400 border border-gray-700' : 'bg-white text-black'}`}>
                {isJoined ? t('joined') : t('join_nexus')}
              </button>
            </div>
            <p className="text-gray-400 text-sm mb-4">{activeForum.description}</p>
            <div className="flex items-center space-x-6">
              <div className="flex flex-col">
                <span className="text-white font-bold text-sm">{activeForum.memberCount}</span>
                <span className="text-gray-600 text-[10px] uppercase font-bold tracking-widest">{t('members')}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-emerald-400 font-bold text-sm">{Math.floor(activeForum.memberCount * 0.1) + 1}</span>
                <span className="text-gray-600 text-[10px] uppercase font-bold tracking-widest">{t('online')}</span>
              </div>
              {isOwner && <span className="text-[10px] text-cyan-400 font-bold uppercase border border-cyan-400/30 px-2 py-0.5 rounded">{t('founder')}</span>}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-orbitron font-bold text-white">{t('hyperfeed')}</h1>
          <div className="flex bg-[#151921] rounded-lg p-1 border border-gray-800">
            {['fyp', 'hot', 'latest'].map((f) => (
              <button key={f} onClick={() => setFilter(f as FeedFilter)} className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${filter === f ? 'bg-cyan-500/20 text-cyan-400' : 'text-gray-500 hover:text-white'}`}>
                {t(f as any).toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      )}

      {filteredAndSortedPosts.length === 0 ? (
        <div className="text-center py-20 bg-[#151921]/50 border border-dashed border-gray-800 rounded-2xl">
          <p className="text-gray-400 font-medium">{t('empty_sector')}</p>
          <p className="text-gray-600 text-sm mt-1">{t('first_signal')}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAndSortedPosts.map(post => (
            <PostCard 
              key={post.id} 
              post={post} 
              onUserClick={onUserClick} 
              onForumClick={onForumClick} 
              isAdmin={isAdmin} 
              onDelete={onDeletePost}
              onReport={onReportPost}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Feed;
