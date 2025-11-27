
import React from 'react';
import { SlidersHorizontal } from 'lucide-react';

interface PitchControlProps {
  pitch: number;
  onPitchChange: (pitch: number) => void;
  disabled?: boolean;
}

export const PitchControl: React.FC<PitchControlProps> = ({ pitch, onPitchChange, disabled }) => {
  // Mapping pitch values to labels for better UX
  const getLabel = (val: number) => {
    if (val === 0) return 'Natural';
    if (val < 0) return val === -2 ? 'Very Deep' : 'Deep';
    return val === 2 ? 'Very High' : 'High';
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-slate-600 uppercase tracking-wider flex items-center gap-2">
          <SlidersHorizontal size={14} />
          Pitch
        </label>
        <span className="text-xs font-medium px-2 py-1 bg-slate-100 rounded text-slate-600 min-w-[60px] text-center">
          {getLabel(pitch)}
        </span>
      </div>
      
      <div className="relative flex items-center h-8">
        {/* Track background */}
        <div className="absolute w-full h-2 bg-slate-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-orange-100 transition-all duration-300"
            style={{ width: `${((pitch + 2) / 4) * 100}%` }}
          />
        </div>

        {/* Custom Range Input */}
        <input
          type="range"
          min="-2"
          max="2"
          step="1"
          value={pitch}
          onChange={(e) => onPitchChange(parseInt(e.target.value))}
          disabled={disabled}
          className="w-full h-2 bg-transparent appearance-none cursor-pointer z-10 focus:outline-none disabled:cursor-not-allowed"
          style={{
            WebkitAppearance: 'none', 
          }}
        />
        
        {/* Custom Thumb Styles via global style injection or Tailwind classes if possible, 
            but for consistency in React inline styles or simple className often easier for range inputs */}
        <style>{`
          input[type=range]::-webkit-slider-thumb {
            -webkit-appearance: none;
            height: 20px;
            width: 20px;
            border-radius: 50%;
            background: ${disabled ? '#cbd5e1' : '#f97316'};
            border: 2px solid white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            margin-top: -6px; /* You need to specify a margin in Chrome, but in Firefox and IE it is automatic */
            transition: transform 0.1s;
          }
          input[type=range]::-webkit-slider-thumb:hover {
            transform: scale(1.1);
          }
          input[type=range]::-moz-range-thumb {
            height: 20px;
            width: 20px;
            border-radius: 50%;
            background: ${disabled ? '#cbd5e1' : '#f97316'};
            border: 2px solid white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            cursor: pointer;
          }
        `}</style>

        {/* Ticks */}
        <div className="absolute w-full flex justify-between px-1 pointer-events-none top-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <div className={`w-0.5 h-1.5 ${i === pitch + 2 ? 'bg-orange-300' : 'bg-slate-200'}`}></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
