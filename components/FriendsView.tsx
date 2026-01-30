
import React, { useState, useContext, useRef, useEffect } from 'react';
import { User, FriendRequest, DirectMessage } from '../types';
import { LanguageContext } from '../App';

interface FriendsViewProps {
  user: User;
  friends: User[];
  requests: FriendRequest[];
  messages: DirectMessage[];
  onAccept: (requestId: string) => void;
  onSendMessage: (receiverId: string, text: string) => void;
}

const FriendsView: React.FC<FriendsViewProps> = ({ user, friends, requests, messages, onAccept, onSendMessage }) => {
  const { t } = useContext(LanguageContext);
  const [selectedFriend, setSelectedFriend] = useState<User | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [activeTab, setActiveTab] = useState<'friends' | 'requests'>('friends');
  const chatEndRef = useRef<HTMLDivElement>(null);

  const filteredMessages = messages.filter(m => 
    (m.senderId === user.id && m.receiverId === selectedFriend?.id) ||
    (m.senderId === selectedFriend?.id && m.receiverId === user.id)
  );

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [filteredMessages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !selectedFriend) return;
    onSendMessage(selectedFriend.id, messageInput);
    setMessageInput('');
  };

  return (
    <div className="h-full flex flex-col md:flex-row bg-[#0b0e14]">
      {/* Sidebar de Amigos */}
      <div className="w-full md:w-80 border-r border-gray-800 flex flex-col">
        <div className="p-4 border-b border-gray-800 flex space-x-2">
          <button 
            onClick={() => setActiveTab('friends')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'friends' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30' : 'text-gray-500 hover:text-gray-300'}`}
          >
            {t('friends')} ({friends.length})
          </button>
          <button 
            onClick={() => setActiveTab('requests')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all relative ${activeTab === 'requests' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/30' : 'text-gray-500 hover:text-gray-300'}`}
          >
            {requests.length > 0 && <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-ping" />}
            Requests ({requests.length})
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {activeTab === 'friends' ? (
            friends.length === 0 ? (
              <div className="p-8 text-center text-gray-600 italic text-xs">No connections found...</div>
            ) : (
              friends.map(f => (
                <button 
                  key={f.id}
                  onClick={() => setSelectedFriend(f)}
                  className={`w-full flex items-center space-x-3 p-3 rounded-xl transition-all ${selectedFriend?.id === f.id ? 'bg-gray-800/50 border border-gray-700' : 'hover:bg-gray-800/30'}`}
                >
                  <img src={f.avatar} className="w-10 h-10 rounded-full border border-gray-700" alt={f.username} />
                  <div className="text-left flex-1 min-w-0">
                    <p className="text-white font-bold text-sm truncate">{f.username}</p>
                    <p className="text-[10px] text-gray-500 uppercase">Sector: {f.postStreak}</p>
                  </div>
                </button>
              ))
            )
          ) : (
            requests.map(r => (
              <div key={r.id} className="p-3 bg-gray-800/20 border border-gray-800 rounded-2xl space-y-3">
                <div className="flex items-center space-x-3">
                  <img src={r.fromAvatar} className="w-8 h-8 rounded-full" />
                  <p className="text-xs text-white font-bold">{r.fromName}</p>
                </div>
                <button 
                  onClick={() => onAccept(r.id)}
                  className="w-full py-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-lg text-[10px] font-bold uppercase hover:bg-emerald-500 hover:text-white transition-all"
                >
                  Accept Link
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Area de Chat */}
      <div className="flex-1 flex flex-col relative overflow-hidden">
        {selectedFriend ? (
          <>
            <div className="p-4 border-b border-gray-800 bg-[#0b0e14]/50 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <img src={selectedFriend.avatar} className="w-8 h-8 rounded-full" />
                <div>
                  <h2 className="text-sm font-bold text-white">{selectedFriend.username}</h2>
                  <p className="text-[10px] text-emerald-500 uppercase tracking-widest animate-pulse">Online</p>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]">
              {filteredMessages.map(m => {
                const isMe = m.senderId === user.id;
                return (
                  <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] p-3 rounded-2xl text-sm ${isMe ? 'bg-cyan-500 text-white rounded-tr-none shadow-lg shadow-cyan-500/20' : 'bg-gray-800 text-gray-300 rounded-tl-none border border-gray-700'}`}>
                      <p>{m.text}</p>
                      <p className={`text-[9px] mt-1 ${isMe ? 'text-cyan-100' : 'text-gray-500'}`}>{m.timestamp}</p>
                    </div>
                  </div>
                );
              })}
              <div ref={chatEndRef} />
            </div>

            <form onSubmit={handleSend} className="p-4 bg-[#151921] border-t border-gray-800 flex items-center space-x-3">
              <input 
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder="Transmit message..."
                className="flex-1 bg-black border border-gray-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500 transition-all"
              />
              <button 
                type="submit"
                className="p-3 bg-cyan-600 text-white rounded-xl hover:bg-cyan-500 transition-all shadow-lg"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                </svg>
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-12 space-y-4">
            <div className="w-20 h-20 bg-gray-800/30 rounded-full flex items-center justify-center text-3xl border border-gray-800">💬</div>
            <h2 className="text-xl font-orbitron font-bold text-gray-500 uppercase tracking-widest">Nexus Comms Hub</h2>
            <p className="text-sm text-gray-600 max-w-xs">Select an explorer from your orbit to begin encrypted transmission.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FriendsView;
