import React, { useState, useRef, useEffect, useCallback } from 'react';
import { VoiceName, GeneratedAudio, TTSMode, User } from './types';
import { generateSpeech } from './services/geminiService';
import { initializeAuth, authenticate, verifyAndChangePassword } from './services/authService';
import { VoiceSelector } from './components/VoiceSelector';
import { Visualizer } from './components/Visualizer';
import { HistoryItem } from './components/HistoryItem';
import { LanguageSelector, LANGUAGES } from './components/LanguageSelector';
import { ModeSelector, MODES } from './components/ModeSelector';
import { PitchControl } from './components/PitchControl';
import { SpeedControl } from './components/SpeedControl';
import { LoginModal } from './components/LoginModal';
import { ChangePasswordModal } from './components/ChangePasswordModal';
import { AdminDashboard } from './components/AdminDashboard';
import { Loader2, Sparkles, AlertCircle, Volume2, User as UserIcon, LogOut, LogIn, LayoutDashboard, Key } from 'lucide-react';

const App: React.FC = () => {
  const [selectedLangCode, setSelectedLangCode] = useState<string>(LANGUAGES[0].code);
  const [text, setText] = useState(LANGUAGES[0].defaultText);
  const [selectedVoice, setSelectedVoice] = useState<VoiceName>(VoiceName.Puck);
  const [selectedMode, setSelectedMode] = useState<TTSMode>('normal');
  const [pitch, setPitch] = useState<number>(0); // -2 to 2
  const [speed, setSpeed] = useState<number>(0); // -2 to 2
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<GeneratedAudio[]>([]);
  const [currentlyPlayingId, setCurrentlyPlayingId] = useState<string | null>(null);
  
  // User & View State
  const [user, setUser] = useState<User | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isChangePwModalOpen, setIsChangePwModalOpen] = useState(false);
  const [currentView, setCurrentView] = useState<'generator' | 'admin'>('generator');

  // Audio Context Refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  
  // Initialize AudioContext and Auth
  useEffect(() => {
    // Audio Init
    const initAudio = () => {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({
            sampleRate: 24000
        });
        analyserRef.current = audioContextRef.current.createAnalyser();
        analyserRef.current.fftSize = 2048;
      }
    };
    initAudio();

    // Auth Init
    initializeAuth();
    
    return () => {
      audioContextRef.current?.close();
    };
  }, []);

  const stopAudio = useCallback(() => {
    if (sourceNodeRef.current) {
      sourceNodeRef.current.stop();
      sourceNodeRef.current.disconnect();
      sourceNodeRef.current = null;
    }
    setCurrentlyPlayingId(null);
  }, []);

  const playAudio = useCallback(async (item: GeneratedAudio) => {
    if (!audioContextRef.current || !item.audioBuffer || !analyserRef.current) return;

    // Resume context if suspended (browser policy)
    if (audioContextRef.current.state === 'suspended') {
      await audioContextRef.current.resume();
    }

    stopAudio();

    const source = audioContextRef.current.createBufferSource();
    source.buffer = item.audioBuffer;
    
    // Connect source -> Analyser -> Destination
    source.connect(analyserRef.current);
    analyserRef.current.connect(audioContextRef.current.destination);
    
    source.onended = () => {
      setCurrentlyPlayingId(null);
    };

    source.start();
    sourceNodeRef.current = source;
    setCurrentlyPlayingId(item.id);
  }, [stopAudio]);

  const handleGenerate = async () => {
    if (!text.trim()) return;
    
    setIsGenerating(true);
    setError(null);
    stopAudio(); // Stop any currently playing audio

    try {
      if (!audioContextRef.current) throw new Error("Audio Context not initialized");

      // Construct prompt based on mode, language, pitch, and speed
      let promptInstruction = MODES.find(m => m.id === selectedMode)?.instruction || "";
      
      // Pitch instructions
      let pitchInstruction = "";
      if (pitch === -2) pitchInstruction = "with a very deep and low pitch";
      else if (pitch === -1) pitchInstruction = "with a deep pitch";
      else if (pitch === 1) pitchInstruction = "with a high pitch";
      else if (pitch === 2) pitchInstruction = "with a very high pitch";

      // Speed instructions
      let speedInstruction = "";
      if (speed === -2) speedInstruction = "speaking very slowly";
      else if (speed === -1) speedInstruction = "speaking slowly";
      else if (speed === 1) speedInstruction = "speaking fast";
      else if (speed === 2) speedInstruction = "speaking very fast";

      // Combine instructions
      const parts = [];
      if (promptInstruction) parts.push(promptInstruction);
      if (pitchInstruction) parts.push(pitchInstruction);
      if (speedInstruction) parts.push(speedInstruction);
      
      // Add specific instructions for Bangla to ensure natural Bangladeshi accent
      if (selectedLangCode === 'bn-BD') {
        parts.push("in a natural Bangladeshi accent");
      }

      let finalInstruction = parts.join(", ");
      // Ensure "Speak" is at the start if there are instructions but no explicit verb
      if (finalInstruction && !finalInstruction.toLowerCase().startsWith('speak') && !finalInstruction.toLowerCase().startsWith('narrate') && !finalInstruction.toLowerCase().startsWith('read') && !finalInstruction.toLowerCase().startsWith('recite')) {
          finalInstruction = `Speak ${finalInstruction}`;
      }

      const finalPrompt = finalInstruction ? `${finalInstruction}: ${text}` : text;
      
      const buffer = await generateSpeech(finalPrompt, selectedVoice, audioContextRef.current);
      
      const newItem: GeneratedAudio = {
        id: Date.now().toString(),
        text: text, // Store original text for display
        voice: selectedVoice,
        timestamp: Date.now(),
        audioBuffer: buffer,
        mode: selectedMode,
      };

      setHistory(prev => [newItem, ...prev]);
      playAudio(newItem);
    } catch (err: any) {
      setError(err.message || "Failed to generate speech. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDelete = (id: string) => {
    if (currentlyPlayingId === id) {
      stopAudio();
    }
    setHistory(prev => prev.filter(item => item.id !== id));
  };

  const handleLanguageSelect = (code: string) => {
    setSelectedLangCode(code);
    const lang = LANGUAGES.find(l => l.code === code);
    if (lang) {
      setText(lang.defaultText);
    }
  };

  const handleLogin = async (username: string, password: string): Promise<boolean> => {
    const authenticatedUser = authenticate(username, password);
    if (authenticatedUser) {
      setUser(authenticatedUser);
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentView('generator'); // Reset view on logout
  };
  
  const handleChangePassword = (oldPass: string, newPass: string) => {
    if (!user) return false;
    return verifyAndChangePassword(user.username, oldPass, newPass);
  };

  // Render Admin Dashboard
  if (currentView === 'admin' && user?.role === 'admin') {
    return <AdminDashboard currentUser={user} onClose={() => setCurrentView('generator')} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center py-12 px-4 sm:px-6 relative transition-colors duration-500">
      <LoginModal 
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLogin={handleLogin}
      />
      
      {user && (
        <ChangePasswordModal 
          isOpen={isChangePwModalOpen}
          onClose={() => setIsChangePwModalOpen(false)}
          username={user.username}
          onChangePassword={handleChangePassword}
        />
      )}

      {/* User Controls */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-10 flex gap-3">
        {user ? (
          <>
            {user.role === 'admin' && (
              <button
                onClick={() => setCurrentView('admin')}
                className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-1.5 rounded-full shadow-sm shadow-indigo-200 hover:bg-indigo-700 transition-all text-sm font-medium"
              >
                <LayoutDashboard size={16} />
                Admin
              </button>
            )}
            <div className="flex items-center gap-1 bg-white pl-4 pr-1.5 py-1.5 rounded-full shadow-sm border border-slate-200">
              <span className="text-sm font-medium text-slate-700 flex items-center gap-2 mr-3">
                <UserIcon size={16} className="text-orange-500" />
                {user.username}
              </span>
              <button
                onClick={() => setIsChangePwModalOpen(true)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                title="Change Password"
              >
                <Key size={16} />
              </button>
              <button 
                onClick={handleLogout}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-red-500 transition-colors"
                title="Logout"
              >
                <LogOut size={16} />
              </button>
            </div>
          </>
        ) : (
          <button 
            onClick={() => setIsLoginModalOpen(true)}
            className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-slate-200 text-sm font-medium text-slate-700 hover:text-orange-600 hover:border-orange-200 transition-all"
          >
            <LogIn size={16} />
            Login
          </button>
        )}
      </div>

      <div className="max-w-3xl w-full space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center p-3 bg-orange-100 rounded-full mb-4">
             <Volume2 className="w-8 h-8 text-orange-600" />
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
            Zotpot <span className="text-orange-600">TTS</span>
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Transform text into lifelike speech using Gemini's latest Flash 2.5 TTS model. 
            Perfect for content creation, accessibility, and more.
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
          
          {/* Top Section: Visualizer */}
          <div className="bg-slate-900 p-6 relative">
             <div className="absolute top-4 left-4 text-xs font-mono text-slate-400 flex items-center gap-2">
               <span className={`w-2 h-2 rounded-full ${currentlyPlayingId ? 'bg-green-500 animate-pulse' : 'bg-slate-600'}`}></span>
               {currentlyPlayingId ? 'PLAYING AUDIO' : 'READY'}
             </div>
             <Visualizer analyser={analyserRef.current} isPlaying={!!currentlyPlayingId} />
          </div>

          <div className="p-6 md:p-8 space-y-8">
            
            {/* Controls Section */}
            <div className="space-y-6">
              
              <LanguageSelector 
                selectedLanguage={selectedLangCode}
                onSelect={handleLanguageSelect}
                disabled={isGenerating}
              />

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-600 uppercase tracking-wider">Input Text</label>
                <div className="relative">
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Type something to convert to speech..."
                    className="w-full p-4 text-lg bg-white text-slate-900 border-2 border-slate-200 rounded-xl focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all min-h-[120px] resize-y placeholder:text-slate-400"
                    disabled={isGenerating}
                  />
                  <div className="absolute bottom-3 right-3 text-xs text-slate-400 font-medium">
                    {text.length} chars
                  </div>
                </div>
              </div>

              <ModeSelector 
                selectedMode={selectedMode}
                onSelectMode={setSelectedMode}
                disabled={isGenerating}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <PitchControl 
                  pitch={pitch}
                  onPitchChange={setPitch}
                  disabled={isGenerating}
                />
                
                <SpeedControl 
                  speed={speed}
                  onSpeedChange={setSpeed}
                  disabled={isGenerating}
                />
              </div>

              <VoiceSelector 
                selectedVoice={selectedVoice} 
                onSelectVoice={setSelectedVoice} 
                disabled={isGenerating}
              />

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700 animate-fadeIn">
                  <AlertCircle size={20} />
                  <p>{error}</p>
                </div>
              )}

              <button
                onClick={handleGenerate}
                disabled={isGenerating || !text.trim()}
                className={`
                  w-full py-4 px-6 rounded-xl flex items-center justify-center gap-3 text-lg font-bold text-white shadow-lg
                  transition-all duration-300 transform active:scale-[0.98]
                  ${isGenerating 
                    ? 'bg-slate-400 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 shadow-orange-500/25'}
                `}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="animate-spin" size={24} />
                    <span>Generating Audio...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={24} />
                    <span>Generate Speech</span>
                  </>
                )}
              </button>
            </div>

            {/* History Section */}
            {history.length > 0 && (
              <div className="border-t border-slate-100 pt-8 space-y-4">
                 <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Recent Generations</h3>
                 <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                   {history.map((item) => (
                     <HistoryItem 
                       key={item.id}
                       item={item}
                       isPlaying={currentlyPlayingId === item.id}
                       onPlay={playAudio}
                       onStop={stopAudio}
                       onDelete={handleDelete}
                       isLoggedIn={!!user}
                       onLoginRequired={() => setIsLoginModalOpen(true)}
                     />
                   ))}
                 </div>
              </div>
            )}
            
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-slate-400">
          <p>Powered by Google Gemini 2.5 Flash TTS</p>
        </div>
      </div>
    </div>
  );
};

export default App;