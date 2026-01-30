
import React, { useState, useContext } from 'react';
import { LanguageContext } from '../App';

interface ReportModalProps {
  onClose: () => void;
  onSubmit: (reason: string) => void;
}

const ReportModal: React.FC<ReportModalProps> = ({ onClose, onSubmit }) => {
  const { t } = useContext(LanguageContext);
  const [selectedReason, setSelectedReason] = useState('spam');

  const reasons = ['spam', 'harassment', 'hate_speech', 'misinformation', 'other'];

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-[#151921] border border-amber-500/30 rounded-3xl w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
          <h2 className="text-lg font-orbitron font-bold text-amber-500 uppercase tracking-widest">{t('report_post')}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">✕</button>
        </div>
        
        <div className="p-6 space-y-6">
          <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">{t('report_reason')}</p>
          
          <div className="space-y-2">
            {reasons.map((reason) => (
              <button
                key={reason}
                onClick={() => setSelectedReason(reason)}
                className={`w-full text-left px-4 py-3 rounded-xl border text-sm font-bold transition-all ${
                  selectedReason === reason 
                    ? 'bg-amber-500/10 border-amber-500 text-amber-500' 
                    : 'bg-black/20 border-gray-800 text-gray-500 hover:border-gray-600'
                }`}
              >
                {t(reason as any)}
              </button>
            ))}
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 py-3 text-gray-500 font-bold uppercase text-[10px] tracking-widest hover:bg-gray-800 rounded-xl transition-all"
            >
              {t('cancel')}
            </button>
            <button
              onClick={() => onSubmit(t(selectedReason as any))}
              className="flex-1 py-3 bg-amber-600 text-white font-bold uppercase text-[10px] tracking-widest rounded-xl shadow-lg shadow-amber-900/20 hover:bg-amber-500 transition-all"
            >
              Confirm Flag
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportModal;
