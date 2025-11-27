import React from 'react';
import { Mic, BookOpen, Feather, Megaphone, Video, Hash } from 'lucide-react';
import { TTSMode } from '../types';

export const MODES: { id: TTSMode; label: string; icon: React.ElementType; instruction: string }[] = [
  { 
    id: 'normal', 
    label: 'Natural', 
    icon: Mic, 
    instruction: '' 
  },
  { 
    id: 'story', 
    label: 'Story', 
    icon: BookOpen, 
    instruction: 'Narrate this story with deep emotion' 
  },
  { 
    id: 'poem', 
    label: 'Poem', 
    icon: Feather, 
    instruction: 'Recite this poem with rhythm and feeling' 
  },
  { 
    id: 'ad', 
    label: 'Ad', 
    icon: Megaphone, 
    instruction: 'Read this advertisement energetically and persuasively' 
  },
  { 
    id: 'vlog', 
    label: 'Vlog', 
    icon: Video, 
    instruction: 'Speak casually and engagingly like a video blogger' 
  },
  { 
    id: 'social', 
    label: 'Social', 
    icon: Hash, 
    instruction: 'Speak in a trendy and upbeat social media style' 
  },
];

interface ModeSelectorProps {
  selectedMode: TTSMode;
  onSelectMode: (mode: TTSMode) => void;
  disabled?: boolean;
}

export const ModeSelector: React.FC<ModeSelectorProps> = ({ selectedMode, onSelectMode, disabled }) => {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-semibold text-slate-600 uppercase tracking-wider">Speaking Style</label>
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {MODES.map((mode) => {
          const Icon = mode.icon;
          return (
            <button
              key={mode.id}
              onClick={() => onSelectMode(mode.id)}
              disabled={disabled}
              className={`
                flex flex-col items-center justify-center py-3 px-2 rounded-xl border transition-all duration-200 gap-2
                ${
                  selectedMode === mode.id
                    ? 'bg-orange-50 border-orange-500 text-orange-700 shadow-sm ring-1 ring-orange-500'
                    : 'bg-white border-slate-200 text-slate-600 hover:border-orange-200 hover:bg-orange-50/50'
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              <Icon size={20} className={selectedMode === mode.id ? 'text-orange-600' : 'text-slate-500'} />
              <span className="text-xs font-medium">{mode.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};