
import React, { useState, useRef } from 'react';
import { Forum } from '../types';

interface CreatePostModalProps {
  forums: Forum[];
  onClose: () => void;
  onSubmit: (content: string, forumId: string, imageUrl?: string) => void;
}

const CreatePostModal: React.FC<CreatePostModalProps> = ({ forums, onClose, onSubmit }) => {
  const [content, setContent] = useState('');
  const [selectedForum, setSelectedForum] = useState(forums[0]?.id || '');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim() && selectedForum) {
      onSubmit(content, selectedForum, imagePreview || undefined);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-[#151921] border border-gray-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
          <h2 className="text-xl font-orbitron font-bold text-cyan-400">Broadcast Signal</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Target Forum</label>
            <select
              value={selectedForum}
              onChange={(e) => setSelectedForum(e.target.value)}
              className="w-full bg-[#0b0e14] border border-gray-800 rounded-xl px-4 py-2 focus:ring-1 focus:ring-cyan-500 outline-none transition-all"
            >
              {forums.map(f => (
                <option key={f.id} value={f.id}>{f.icon.length > 2 ? '🌐' : f.icon} n/{f.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Your Message</label>
            <textarea
              autoFocus
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full bg-[#0b0e14] border border-gray-800 rounded-xl px-4 py-3 focus:ring-1 focus:ring-cyan-500 outline-none transition-all h-32 resize-none text-gray-200"
              placeholder="What's happening in the Nexus?"
            />
          </div>

          {imagePreview && (
            <div className="relative group rounded-xl overflow-hidden border border-gray-800 h-40">
              <img src={imagePreview} className="w-full h-full object-cover" alt="Preview" />
              <button 
                type="button"
                onClick={() => setImagePreview(null)}
                className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full hover:bg-black transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          )}

          <div className="flex items-center space-x-4 px-2 py-2 text-gray-500">
            <button 
              type="button" 
              onClick={() => fileInputRef.current?.click()}
              className="hover:text-cyan-400 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </button>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
            
            <button type="button" className="hover:text-cyan-400 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
            <span className="text-[10px] uppercase font-bold tracking-widest ml-auto">
              {content.length} characters
            </span>
          </div>

          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 text-gray-400 font-bold hover:bg-gray-800 rounded-xl transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!content.trim()}
              className="flex-[2] py-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-lg shadow-cyan-900/20 transition-all"
            >
              Transmit Signal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePostModal;
