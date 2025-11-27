
import React from 'react';
import { Globe } from 'lucide-react';

export interface Language {
  code: string;
  name: string;
  defaultText: string;
}

export const LANGUAGES: Language[] = [
  { 
    code: 'bn-BD', 
    name: 'Bangla (BD)', 
    defaultText: 'ক্যাফে ঝটপট — আপনার প্রিয় টেস্ট, সবসময় ফ্রেশ!' 
  },
  { 
    code: 'en-US', 
    name: 'English', 
    defaultText: 'Experience fresh and natural text-to-speech with Zotpot.' 
  },
  { 
    code: 'es-ES', 
    name: 'Spanish', 
    defaultText: 'La inteligencia artificial generativa está transformando el mundo.' 
  },
  { 
    code: 'fr-FR', 
    name: 'French', 
    defaultText: 'L\'intelligence artificielle générative transforme le monde.' 
  },
  { 
    code: 'hi-IN', 
    name: 'Hindi', 
    defaultText: 'जनरेटिव एआई दुनिया को बदल रहा है।' 
  },
  { 
    code: 'ja-JP', 
    name: 'Japanese', 
    defaultText: '生成AIは世界を変えています。' 
  }
];

interface LanguageSelectorProps {
  selectedLanguage: string;
  onSelect: (langCode: string) => void;
  disabled?: boolean;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({ selectedLanguage, onSelect, disabled }) => {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-semibold text-slate-600 uppercase tracking-wider flex items-center gap-2">
        <Globe size={14} />
        Language
      </label>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
        {LANGUAGES.map((lang) => (
          <button
            key={lang.code}
            onClick={() => onSelect(lang.code)}
            disabled={disabled}
            className={`
              relative flex items-center justify-center py-2 px-3 rounded-lg border transition-all duration-200
              ${
                selectedLanguage === lang.code
                  ? 'bg-slate-800 border-slate-900 text-white shadow-md ring-2 ring-slate-800 ring-offset-2'
                  : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
            title={lang.name}
          >
            <span className="font-medium text-sm truncate">{lang.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
