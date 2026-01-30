
import React, { useState } from 'react';
import { Post } from '../types';

interface PostCardProps {
  post: Post;
  onUserClick: (userId: string) => void;
  onForumClick: (forumId: string) => void;
  isAdmin?: boolean;
  onDelete?: (postId: string) => void;
  onReport?: (postId: string) => void;
}

const PostCard: React.FC<PostCardProps> = ({ post, onUserClick, onForumClick, isAdmin, onDelete, onReport }) => {
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes);
  const [copied, setCopied] = useState(false);

  const toggleLike = () => {
    setLiked(!liked);
    setLikesCount(liked ? likesCount - 1 : likesCount + 1);
  };

  const handleShare = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-[#151921] border border-gray-800 hover:border-cyan-500/30 rounded-2xl p-4 transition-all group shadow-sm hover:shadow-cyan-500/5 relative">
      <div className="absolute top-4 right-4 flex space-x-2 z-10">
        <button 
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onReport?.(post.id); }}
          className="p-2 text-gray-600 hover:text-amber-500 transition-all"
          title="Report Post"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
          </svg>
        </button>
        {isAdmin && (
          <button 
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete?.(post.id); }}
            className="p-2 bg-red-600/20 text-red-500 rounded-lg hover:bg-red-600 hover:text-white transition-all border border-red-500/30"
            title="Admin: Delete Post"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        )}
      </div>

      <div className="flex items-start space-x-3">
        <img 
          src={post.authorAvatar} 
          alt={post.authorName} 
          onClick={() => onUserClick(post.authorId)}
          className="w-10 h-10 rounded-full border border-gray-800 cursor-pointer hover:border-cyan-500 transition-all object-cover"
        />
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <span 
              onClick={() => onUserClick(post.authorId)}
              className="font-bold text-sm text-white hover:text-cyan-400 cursor-pointer truncate transition-colors"
            >
              {post.authorName}
            </span>
            <span className="text-gray-600 text-xs">•</span>
            <span 
              onClick={() => onForumClick(post.forumId)}
              className="text-cyan-500 text-xs font-bold hover:underline cursor-pointer"
            >
              n/{post.forumName}
            </span>
            <span className="text-gray-600 text-xs">•</span>
            <span className="text-gray-500 text-[10px] uppercase font-bold tracking-tighter">{post.timestamp}</span>
          </div>

          <p className="text-gray-300 text-sm leading-relaxed mb-4 whitespace-pre-wrap pr-8">
            {post.content}
          </p>

          {post.imageUrl && (
            <div className="rounded-xl overflow-hidden border border-gray-800 mb-4 bg-black/20">
              <img 
                src={post.imageUrl} 
                alt="Post content" 
                className="w-full h-auto object-cover max-h-96 group-hover:scale-[1.01] transition-transform duration-500"
              />
            </div>
          )}

          <div className="flex items-center space-x-6">
            <button 
              onClick={toggleLike}
              className={`flex items-center space-x-2 text-xs transition-all ${liked ? 'text-pink-500 scale-110' : 'text-gray-500 hover:text-pink-400'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${liked ? 'fill-current' : 'none'}`} fill={liked ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span className="font-bold">{likesCount}</span>
            </button>

            <button className="flex items-center space-x-2 text-gray-500 hover:text-cyan-400 text-xs transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span className="font-bold">{post.comments}</span>
            </button>

            <div className="relative">
              <button 
                onClick={handleShare}
                className={`flex items-center space-x-2 text-xs transition-all ${copied ? 'text-emerald-400' : 'text-gray-500 hover:text-emerald-400'} ml-auto`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                {copied && <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-[10px] px-2 py-1 rounded-md animate-bounce">LINK COPIED</span>}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostCard;
