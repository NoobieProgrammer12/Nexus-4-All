
import React, { useState, useContext } from 'react';
import { LanguageContext } from '../App';

interface CreateForumModalProps {
  onClose: () => void;
  onSubmit: (name: string, description: string) => void;
}

const CreateForumModal: React.FC<CreateForumModalProps> = ({ onClose, onSubmit }) => {
  const { t } = useContext(LanguageContext);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-[#151921] border border-gray-800 rounded-2xl w-full max-w-lg shadow-2xl">
        <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
          <h2 className="text-xl font-orbitron font-bold text-cyan-400">{t('establish_forum')}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white">✕</button>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); if(name.trim()) onSubmit(name, description); }} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">{t('forum_name')}</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-3 flex items-center text-gray-500 font-bold">n/</span>
              <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-[#0b0e14] border border-gray-800 rounded-xl pl-8 pr-4 py-2 text-white outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">{t('purpose')}</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full bg-[#0b0e14] border border-gray-800 rounded-xl px-4 py-2 text-white outline-none h-24 resize-none" />
          </div>
          <div className="pt-2 flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 py-2 text-gray-400 font-bold hover:bg-gray-800 rounded-xl">{t('abort')}</button>
            <button type="submit" className="flex-[2] py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl">{t('init_community')}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateForumModal;
