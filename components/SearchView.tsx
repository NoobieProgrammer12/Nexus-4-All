
import React, { useState } from 'react';
import { Post, Forum, User } from '../types';
import PostCard from './PostCard';

interface SearchViewProps {
  query: string;
  posts: Post[];
  forums: Forum[];
  users: User[];
  isAdmin?: boolean;
  onUserClick: (userId: string) => void;
  onForumClick: (forumId: string) => void;
  onDeleteForum?: (forumId: string) => void;
  onDeletePost?: (postId: string) => void;
}

type Tab = 'all' | 'posts' | 'forums' | 'explorers';

const SearchView: React.FC<SearchViewProps> = ({ query, posts, forums, users, isAdmin, onUserClick, onForumClick, onDeleteForum, onDeletePost }) => {
  const [activeTab, setActiveTab] = useState<Tab>('all');

  const TabButton = ({ id, label, count }: { id: Tab, label: string, count: number }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`px-4 py-2 text-sm font-bold transition-all border-b-2 ${
        activeTab === id 
        ? 'text-cyan-400 border-cyan-400' 
        : 'text-gray-500 border-transparent hover:text-gray-300'
      }`}
    >
      {label} <span className="ml-1 opacity-50 text-[10px]">{count}</span>
    </button>
  );

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h2 className="text-xs font-orbitron font-bold text-gray-500 uppercase tracking-[0.4em] mb-2">Scanning Nexus Results for</h2>
        <h1 className="text-3xl font-orbitron font-bold text-white">"{query}"</h1>
      </div>

      <div className="flex space-x-2 border-b border-gray-800 mb-6">
        <TabButton id="all" label="Everything" count={posts.length + forums.length + users.length} />
        <TabButton id="posts" label="Posts" count={posts.length} />
        <TabButton id="forums" label="Forums" count={forums.length} />
        <TabButton id="explorers" label="Explorers" count={users.length} />
      </div>

      <div className="space-y-8">
        {/* FORUMS SECTION */}
        {(activeTab === 'all' || activeTab === 'forums') && forums.length > 0 && (
          <section>
            <h3 className="text-[10px] font-bold text-cyan-500 uppercase tracking-widest mb-4">Established Communities</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {forums.map(forum => (
                <div 
                  key={forum.id}
                  className="bg-[#151921] border border-gray-800 rounded-2xl p-4 flex items-center space-x-4 cursor-pointer hover:border-cyan-500/50 transition-all group relative"
                >
                  <div className="flex-1 flex items-center space-x-4 min-w-0" onClick={() => onForumClick(forum.id)}>
                    <div className="w-12 h-12 bg-[#0b0e14] rounded-xl flex items-center justify-center text-2xl overflow-hidden shrink-0 border border-gray-800 group-hover:border-cyan-500/30">
                      {forum.icon.startsWith('data:') ? <img src={forum.icon} className="w-full h-full object-cover" /> : forum.icon}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-white font-bold text-sm truncate">n/{forum.name}</h4>
                      <p className="text-gray-500 text-xs truncate">{forum.memberCount} members</p>
                    </div>
                  </div>
                  {isAdmin && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); onDeleteForum?.(forum.id); }}
                      className="p-2 bg-red-600 text-white rounded-lg transition-all hover:bg-red-700 shadow-lg z-10"
                      title="Delete Forum"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* EXPLORERS SECTION */}
        {(activeTab === 'all' || activeTab === 'explorers') && users.length > 0 && (
          <section>
            <h3 className="text-[10px] font-bold text-purple-500 uppercase tracking-widest mb-4">Nexus Explorers</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {users.map(user => (
                <div 
                  key={user.id}
                  onClick={() => onUserClick(user.id)}
                  className={`bg-[#151921] border border-gray-800 rounded-2xl p-4 flex items-center space-x-4 cursor-pointer hover:border-purple-500/50 transition-all group ${user.isBanned ? 'opacity-50 grayscale' : ''}`}
                >
                  <img src={user.avatar} className="w-12 h-12 rounded-full object-cover border border-gray-800 group-hover:border-purple-500/30" />
                  <div className="min-w-0">
                    <h4 className="text-white font-bold text-sm flex items-center space-x-2">
                      <span>@{user.username}</span>
                      {user.isBanned && <span className="text-[8px] bg-red-600 px-1 rounded font-bold uppercase">Banned</span>}
                    </h4>
                    <p className="text-gray-500 text-xs">Explorer • Level {user.postStreak + 1}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* POSTS SECTION */}
        {(activeTab === 'all' || activeTab === 'posts') && posts.length > 0 && (
          <section>
            <h3 className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mb-4">Signal Transmissions</h3>
            <div className="space-y-4">
              {posts.map(post => (
                <PostCard 
                  key={post.id} 
                  post={post} 
                  onUserClick={onUserClick} 
                  onForumClick={onForumClick} 
                  isAdmin={isAdmin}
                  onDelete={onDeletePost}
                />
              ))}
            </div>
          </section>
        )}

        {/* EMPTY STATE */}
        {posts.length === 0 && forums.length === 0 && users.length === 0 && (
          <div className="text-center py-20 bg-[#151921]/30 border border-dashed border-gray-800 rounded-3xl">
            <div className="text-5xl mb-4">🛰️</div>
            <p className="text-gray-400 font-medium">No signals found in this sector.</p>
            <p className="text-gray-600 text-sm mt-1">Try different coordinates (keywords).</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchView;
