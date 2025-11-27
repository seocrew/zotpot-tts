import React from 'react';
import { GeneratedAudio, VoiceDisplayNames } from '../types';
import { Play, Pause, Trash2, Download, Lock } from 'lucide-react';
import { audioBufferToWav } from '../services/geminiService';

interface HistoryItemProps {
  item: GeneratedAudio;
  isPlaying: boolean;
  onPlay: (item: GeneratedAudio) => void;
  onStop: () => void;
  onDelete: (id: string) => void;
  isLoggedIn: boolean;
  onLoginRequired: () => void;
}

export const HistoryItem: React.FC<HistoryItemProps> = ({ 
  item, 
  isPlaying, 
  onPlay, 
  onStop, 
  onDelete,
  isLoggedIn,
  onLoginRequired
}) => {
  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!isLoggedIn) {
      onLoginRequired();
      return;
    }

    if (!item.audioBuffer) return;
    
    const blob = audioBufferToWav(item.audioBuffer);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `zotpot-${item.id}.wav`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`
      flex items-center justify-between p-4 rounded-xl border transition-all
      ${isPlaying ? 'bg-orange-50 border-orange-200 shadow-sm' : 'bg-white border-slate-100 hover:border-slate-200'}
    `}>
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <button
          onClick={() => isPlaying ? onStop() : onPlay(item)}
          className={`
            flex items-center justify-center w-10 h-10 rounded-full transition-colors flex-shrink-0
            ${isPlaying ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}
          `}
        >
          {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-0.5" />}
        </button>
        
        <div className="flex flex-col min-w-0">
          <p className="text-sm font-medium text-slate-900 truncate" title={item.text}>
            {item.text}
          </p>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600 font-medium">{VoiceDisplayNames[item.voice]}</span>
            <span>•</span>
            <span>{new Date(item.timestamp).toLocaleTimeString()}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1 ml-4">
        <button
          onClick={handleDownload}
          className={`p-2 rounded-lg transition-colors ${
            !isLoggedIn 
              ? 'text-slate-400 hover:text-orange-600 hover:bg-orange-50' 
              : 'text-slate-400 hover:text-blue-600 hover:bg-blue-50'
          }`}
          title={isLoggedIn ? "Download WAV" : "Login to Download"}
        >
          {isLoggedIn ? <Download size={16} /> : <Lock size={16} />}
        </button>
        <button
          onClick={() => onDelete(item.id)}
          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          title="Delete"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
};