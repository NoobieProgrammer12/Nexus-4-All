
import React, { useState, useContext } from 'react';
import { Report, User, Forum } from '../types';
import { LanguageContext } from '../App';

interface DevHubViewProps {
  reports: Report[];
  users: User[];
  forums: Forum[];
  onDismissReport: (reportId: string) => void;
  onDeletePost: (postId: string) => void;
  onDeleteForum: (forumId: string) => void;
  onBanUser: (userId: string) => void;
}

type Tab = 'reports' | 'users' | 'forums';

const DevHubView: React.FC<DevHubViewProps> = ({ reports, users, forums, onDismissReport, onDeletePost, onDeleteForum, onBanUser }) => {
  const { t } = useContext(LanguageContext);
  const [activeTab, setActiveTab] = useState<Tab>('reports');

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 font-mono">
      <div className="mb-10 p-6 bg-red-500/5 border border-red-500/20 rounded-3xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 blur-[60px]"></div>
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-orbitron font-bold text-red-500 uppercase tracking-tighter">Dev Hub Terminal</h1>
            <p className="text-gray-500 text-xs mt-1 uppercase tracking-widest font-bold">Nexus Administration Interface v2.5.0</p>
          </div>
          <div className="text-right">
            <div className="inline-block px-3 py-1 bg-red-500/20 text-red-400 border border-red-500/40 rounded-full text-[10px] font-bold animate-pulse">SYSTEM ROOT ACTIVE</div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-8">
          <div className="bg-black/40 border border-gray-800 p-4 rounded-2xl">
            <p className="text-2xl font-bold text-white">{reports.length}</p>
            <p className="text-[10px] text-gray-600 uppercase font-bold">Active Signals Flags</p>
          </div>
          <div className="bg-black/40 border border-gray-800 p-4 rounded-2xl">
            <p className="text-2xl font-bold text-white">{users.length}</p>
            <p className="text-[10px] text-gray-600 uppercase font-bold">Registered Explorers</p>
          </div>
          <div className="bg-black/40 border border-gray-800 p-4 rounded-2xl">
            <p className="text-2xl font-bold text-white">{forums.length}</p>
            <p className="text-[10px] text-gray-600 uppercase font-bold">Active Sectors</p>
          </div>
        </div>
      </div>

      <div className="flex space-x-2 border-b border-gray-800 mb-8 px-2">
        {(['reports', 'users', 'forums'] as Tab[]).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 text-[10px] font-bold uppercase tracking-[0.2em] transition-all border-b-2 ${
              activeTab === tab ? 'text-red-500 border-red-500' : 'text-gray-600 border-transparent hover:text-gray-400'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {activeTab === 'reports' && (
          <>
            {reports.length === 0 ? (
              <div className="p-20 text-center bg-black/20 border border-dashed border-gray-800 rounded-3xl text-gray-600 italic">No incoming reports detected in this cycle.</div>
            ) : (
              reports.map(report => (
                <div key={report.id} className="bg-[#151921] border border-red-500/20 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-red-500/[0.02] transition-colors">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center space-x-3">
                      <span className="bg-red-500/20 text-red-400 text-[9px] font-bold px-2 py-0.5 rounded uppercase border border-red-500/30">FLAG: {report.reason}</span>
                      <span className="text-gray-600 text-[10px] uppercase font-bold">{report.timestamp}</span>
                    </div>
                    <p className="text-white text-sm font-bold">Author: {report.authorName} | Reporter: {report.reporterName}</p>
                    <p className="text-gray-400 text-xs italic bg-black/40 p-3 rounded-xl border border-gray-800">"{report.postContent}"</p>
                  </div>
                  <div className="flex space-x-3">
                    <button onClick={() => onDismissReport(report.id)} className="px-4 py-2 bg-gray-800 text-gray-400 rounded-xl text-[10px] font-bold uppercase border border-gray-700 hover:text-white transition-all">Dismiss</button>
                    <button onClick={() => onDeletePost(report.postId)} className="px-4 py-2 bg-red-600 text-white rounded-xl text-[10px] font-bold uppercase shadow-lg shadow-red-900/20 hover:bg-red-500 transition-all">Wipe Signal</button>
                  </div>
                </div>
              ))
            )}
          </>
        )}

        {activeTab === 'users' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {users.map(u => (
              <div key={u.id} className="bg-[#151921] border border-gray-800 rounded-2xl p-4 flex items-center justify-between group">
                <div className="flex items-center space-x-4">
                  <img src={u.avatar} className="w-10 h-10 rounded-full border border-gray-800" />
                  <div>
                    <p className="text-white font-bold text-sm">@{u.username} {u.isAdmin && <span className="text-cyan-400 ml-1 text-[10px]">[STAFF]</span>}</p>
                    <p className="text-gray-600 text-[10px] uppercase">{u.email}</p>
                  </div>
                </div>
                {!u.isAdmin && (
                  <button onClick={() => onBanUser(u.id)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7a4 4 0 11-8 0 4 4 0 018 0zM9 14a6 6 0 00-6 6v1h12v-1a6 6 0 00-6-6zM21 12h-6" /></svg>
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {activeTab === 'forums' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {forums.map(f => (
              <div key={f.id} className="bg-[#151921] border border-gray-800 rounded-2xl p-4 flex items-center justify-between group">
                <div className="flex items-center space-x-4 min-w-0">
                  <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center text-xl shrink-0">
                    {f.icon.startsWith('data:') ? <img src={f.icon} className="w-full h-full object-cover rounded" /> : f.icon}
                  </div>
                  <div className="min-w-0">
                    <p className="text-white font-bold text-sm truncate">n/{f.name}</p>
                    <p className="text-gray-600 text-[10px] uppercase">{f.memberCount} Explorers</p>
                  </div>
                </div>
                <button onClick={() => onDeleteForum(f.id)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DevHubView;
