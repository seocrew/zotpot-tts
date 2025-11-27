import React from 'react';
import { VoiceName, VoiceDisplayNames } from '../types';

interface VoiceSelectorProps {
  selectedVoice: VoiceName;
  onSelectVoice: (voice: VoiceName) => void;
  disabled?: boolean;
}

const voices = Object.values(VoiceName);

export const VoiceSelector: React.FC<VoiceSelectorProps> = ({ selectedVoice, onSelectVoice, disabled }) => {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-semibold text-slate-600 uppercase tracking-wider">Voice Persona</label>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {voices.map((voice) => (
          <button
            key={voice}
            onClick={() => onSelectVoice(voice)}
            disabled={disabled}
            className={`
              relative flex items-center justify-center py-3 px-4 rounded-xl border transition-all duration-200
              ${
                selectedVoice === voice
                  ? 'bg-orange-500 border-orange-600 text-white shadow-md scale-105'
                  : 'bg-white border-slate-200 text-slate-600 hover:border-orange-300 hover:bg-orange-50'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            <span className="font-medium">{VoiceDisplayNames[voice]}</span>
            {selectedVoice === voice && (
              <span className="absolute -top-2 -right-2 flex h-5 w-5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-5 w-5 bg-orange-600 text-xs items-center justify-center text-white">✓</span>
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};