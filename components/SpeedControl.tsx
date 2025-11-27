
import React from 'react';
import { Gauge } from 'lucide-react';

interface SpeedControlProps {
  speed: number;
  onSpeedChange: (speed: number) => void;
  disabled?: boolean;
}

export const SpeedControl: React.FC<SpeedControlProps> = ({ speed, onSpeedChange, disabled }) => {
  // Mapping speed values to labels for better UX
  const getLabel = (val: number) => {
    if (val === 0) return 'Normal';
    if (val < 0) return val === -2 ? 'Very Slow' : 'Slow';
    return val === 2 ? 'Very Fast' : 'Fast';
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-slate-600 uppercase tracking-wider flex items-center gap-2">
          <Gauge size={14} />
          Speed
        </label>
        <span className="text-xs font-medium px-2 py-1 bg-slate-100 rounded text-slate-600 min-w-[60px] text-center">
          {getLabel(speed)}
        </span>
      </div>
      
      <div className="relative flex items-center h-8">
        {/* Track background */}
        <div className="absolute w-full h-2 bg-slate-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-blue-100 transition-all duration-300"
            style={{ width: `${((speed + 2) / 4) * 100}%` }}
          />
        </div>

        {/* Custom Range Input */}
        <input
          type="range"
          min="-2"
          max="2"
          step="1"
          value={speed}
          onChange={(e) => onSpeedChange(parseInt(e.target.value))}
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
            background: ${disabled ? '#cbd5e1' : '#3b82f6'};
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
            background: ${disabled ? '#cbd5e1' : '#3b82f6'};
            border: 2px solid white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            cursor: pointer;
          }
        `}</style>

        {/* Ticks */}
        <div className="absolute w-full flex justify-between px-1 pointer-events-none top-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <div className={`w-0.5 h-1.5 ${i === speed + 2 ? 'bg-blue-300' : 'bg-slate-200'}`}></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
