
import React, { useState, useMemo, useEffect } from 'react';
import { GameMode, QuestionSet, User, Achievement } from '../types';
import { TrophyIcon, LogoutIcon, MedalIcon, StarIcon, FireIcon, LightningIcon, ScrollIcon } from './icons';
import { ACHIEVEMENTS } from '../services/achievementService';

interface MainMenuProps {
  currentUser: User | null;
  onStartGame: (mode: GameMode, set: QuestionSet) => void;
  onLogout: () => void;
  onViewResults: () => void;
  questionSets: QuestionSet[];
  achievements: string[];
  customAchievements: Achievement[];
}

const MainMenu: React.FC<MainMenuProps> = ({ currentUser, onStartGame, onLogout, onViewResults, questionSets, achievements, customAchievements }) => {
  const [activeMode, setActiveMode] = useState<GameMode>(GameMode.Math);
  const [showAchievements, setShowAchievements] = useState(false);
  
  const { mathSets, spellingSets } = useMemo(() => ({
    mathSets: questionSets.filter(q => q.mode === GameMode.Math),
    spellingSets: questionSets.filter(q => q.mode === GameMode.Spelling),
  }), [questionSets]);

  const [selectedSetId, setSelectedSetId] = useState<string>('');
  
  const allAchievements = useMemo(() => [...ACHIEVEMENTS, ...customAchievements], [customAchievements]);

  useEffect(() => {
    const sets = activeMode === GameMode.Math ? mathSets : spellingSets;
    if (sets.length > 0) {
      setSelectedSetId(sets[0].id);
    } else {
      setSelectedSetId('');
    }
  }, [activeMode, mathSets, spellingSets]);


  const handleModeChange = (mode: GameMode) => {
    setActiveMode(mode);
  };

  const handlePlay = () => {
    const sets = activeMode === GameMode.Math ? mathSets : spellingSets;
    const setToPlay = sets.find(s => s.id === selectedSetId);
    
    if (setToPlay) {
      onStartGame(activeMode, setToPlay);
    } else {
      alert(`No question sets available for ${activeMode} mode. Please create one first!`);
    }
  };

  const renderAchievementIcon = (type: Achievement['icon'], className: string) => {
      switch (type) {
          case 'trophy': return <TrophyIcon className={className} />;
          case 'star': return <StarIcon className={className} />;
          case 'medal': return <MedalIcon className={className} />;
          case 'fire': return <FireIcon className={className} />;
          case 'lightning': return <LightningIcon className={className} />;
          case 'scroll': return <ScrollIcon className={className} />;
          default: return <MedalIcon className={className} />;
      }
  };

  const currentSets = activeMode === GameMode.Math ? mathSets : spellingSets;

  return (
    <div className="w-full glass-panel rounded-xl md:rounded-3xl shadow-xl md:shadow-2xl p-6 md:p-12 flex flex-col justify-center animate-fade-in-scale border border-white/10 relative">
       
       {/* Achievements Modal */}
       {showAchievements && (
           <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in-scale">
               <div className="bg-[#1a202c] w-full max-w-3xl rounded-2xl md:rounded-3xl border border-yellow-500/30 shadow-2xl p-4 md:p-8 max-h-[85vh] overflow-y-auto">
                   <div className="flex justify-between items-center mb-6 sticky top-0 bg-[#1a202c] z-20 py-2">
                       <div className="flex items-center gap-3">
                           <MedalIcon className="w-8 h-8 md:w-10 md:h-10 text-yellow-400" />
                           <h2 className="text-2xl md:text-3xl font-black text-white">Your Badges</h2>
                       </div>
                       <button onClick={() => setShowAchievements(false)} className="text-gray-400 hover:text-white text-3xl font-bold leading-none p-2">&times;</button>
                   </div>
                   
                   <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4">
                       {allAchievements.map(ach => {
                           const isUnlocked = achievements.includes(ach.id);
                           return (
                               <div key={ach.id} className={`relative p-3 md:p-4 rounded-2xl border-2 flex flex-col items-center text-center transition-all ${isUnlocked ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-yellow-500/50 shadow-[0_0_20px_rgba(234,179,8,0.2)]' : 'bg-gray-900/50 border-gray-700 grayscale opacity-60'}`}>
                                   {isUnlocked && <div className="animate-shine rounded-2xl z-0 pointer-events-none"></div>}
                                   <div className={`w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center mb-3 z-10 ${isUnlocked ? 'bg-yellow-500/20 text-yellow-400' : 'bg-gray-800 text-gray-600'}`}>
                                       {renderAchievementIcon(ach.icon, "w-6 h-6 md:w-8 md:h-8")}
                                   </div>
                                   <h3 className={`font-bold text-sm md:text-lg mb-1 z-10 leading-tight ${isUnlocked ? 'text-white' : 'text-gray-500'}`}>{ach.title}</h3>
                                   <p className="text-[10px] md:text-xs text-gray-400 z-10 leading-tight">{ach.description}</p>
                                   {isUnlocked && <div className="absolute top-2 right-2 md:top-3 md:right-3 text-yellow-500 z-10"><StarIcon className="w-3 h-3 md:w-4 md:h-4"/></div>}
                               </div>
                           );
                       })}
                   </div>
               </div>
           </div>
       )}

       <div className="flex justify-between items-center mb-6 md:mb-8">
        <div className="flex items-center gap-2 md:gap-3">
            <div className="bg-blue-600 text-white font-bold w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center text-lg md:text-2xl shadow-lg border-2 border-blue-400">
                {currentUser?.name.charAt(0).toUpperCase()}
            </div>
            <div>
                <p className="text-gray-300 text-[10px] md:text-sm font-semibold uppercase tracking-wide">Adventurer</p>
                <h2 className="text-lg md:text-2xl font-black text-white shadow-black drop-shadow-md leading-none">
                    {currentUser?.name}
                </h2>
            </div>
        </div>
        <button onClick={onLogout} className="flex items-center gap-2 text-gray-300 hover:text-white font-bold transition-colors bg-white/10 hover:bg-red-500/80 px-3 py-1.5 md:px-4 md:py-2 rounded-full shadow-sm hover:shadow-md border border-white/10 text-sm md:text-base">
          <LogoutIcon className="w-4 h-4 md:w-5 md:h-5"/>
          <span className="hidden sm:inline">Log Out</span>
        </button>
      </div>

      <div className="text-center mb-8 md:mb-12">
        <h1 className="text-4xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 mb-2 md:mb-4 tracking-tighter drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)] filter brightness-125">
            DUNGEON<br/>MAZE
        </h1>
        <p className="text-sm md:text-xl font-bold text-gray-400 uppercase tracking-widest">Knowledge is the Key</p>
      </div>

      <div className="bg-black/40 p-1.5 md:p-2 rounded-2xl flex mb-6 md:mb-8 shadow-inner border border-white/5">
        <button
          onClick={() => handleModeChange(GameMode.Math)}
          className={`flex-1 p-3 md:p-4 rounded-xl font-black text-lg md:text-2xl transition-all duration-300 flex items-center justify-center gap-2 md:gap-3 ${activeMode === GameMode.Math ? 'bg-blue-600 text-white shadow-lg scale-105 transform border border-blue-400' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
        >
          <span>🧮</span> Math
        </button>
        <button
          onClick={() => handleModeChange(GameMode.Spelling)}
          className={`flex-1 p-3 md:p-4 rounded-xl font-black text-lg md:text-2xl transition-all duration-300 flex items-center justify-center gap-2 md:gap-3 ${activeMode === GameMode.Spelling ? 'bg-emerald-600 text-white shadow-lg scale-105 transform border border-emerald-400' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
        >
           <span>✍️</span> Spelling
        </button>
      </div>
      
      <div className="space-y-4 md:space-y-6">
        <div className="relative group">
            <label className="block text-xs font-bold text-blue-300 mb-1 md:mb-2 uppercase tracking-wide ml-2">Select Quest</label>
            <select
                value={selectedSetId}
                onChange={(e) => setSelectedSetId(e.target.value)}
                className="w-full p-4 md:p-5 border-2 border-blue-500/30 bg-gray-900/80 rounded-xl md:rounded-2xl text-lg md:text-xl font-bold text-white appearance-none focus:ring-4 focus:ring-blue-500/50 focus:border-blue-500 focus:outline-none shadow-lg cursor-pointer transition-all hover:border-blue-400 hover:bg-gray-800"
                aria-label="Select a question set"
            >
                {currentSets.length > 0 ? (
                currentSets.map(s => <option key={s.id} value={s.id} className="bg-gray-900">{s.name}</option>)
                ) : (
                <option value="" disabled className="bg-gray-900">No quests available</option>
                )}
            </select>
            <div className="absolute bottom-5 right-5 pointer-events-none text-blue-400 group-hover:text-blue-200 transition-colors">
                <svg className="w-6 h-6 fill-current" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
            </div>
        </div>

        <div className="flex flex-col md:flex-row gap-3 md:gap-4 mt-6 md:mt-8">
            <div className="flex gap-3 md:flex-1">
                <button 
                    onClick={() => setShowAchievements(true)} 
                    className="flex-1 bg-gray-700/50 text-gray-200 font-black py-3 md:py-5 rounded-xl md:rounded-2xl text-lg md:text-xl hover:bg-gray-700 transition-all hover:-translate-y-1 shadow-lg border-2 border-gray-600 flex items-center justify-center gap-2"
                    aria-label="View my achievements"
                >
                    <MedalIcon className="w-5 h-5 md:w-6 md:h-6 text-purple-400"/>
                    <span className="hidden sm:inline">Badges</span>
                    <span className="sm:hidden">Badges</span>
                </button>
                <button 
                    onClick={onViewResults} 
                    className="flex-1 bg-gray-700/50 text-gray-200 font-black py-3 md:py-5 rounded-xl md:rounded-2xl text-lg md:text-xl hover:bg-gray-700 transition-all hover:-translate-y-1 shadow-lg border-2 border-gray-600 flex items-center justify-center gap-2"
                    aria-label="View my results"
                >
                    <TrophyIcon className="w-5 h-5 md:w-6 md:h-6 text-yellow-400"/>
                    <span className="hidden sm:inline">Scores</span>
                    <span className="sm:hidden">Scores</span>
                </button>
            </div>
            <button 
            onClick={handlePlay} 
            disabled={currentSets.length === 0}
            className="w-full md:flex-[2] bg-gradient-to-b from-yellow-400 to-orange-600 text-white font-black py-4 md:py-5 rounded-xl md:rounded-2xl text-2xl md:text-3xl hover:brightness-110 transition-all hover:-translate-y-1 shadow-[0_6px_0_rgb(124,45,18)] active:shadow-none active:translate-y-[6px] disabled:grayscale disabled:shadow-none disabled:translate-y-0 flex items-center justify-center gap-3 border-t border-yellow-300"
            >
             <span>⚔️</span> ENTER MAZE
            </button>
        </div>
      </div>
    </div>
  );
};

export default MainMenu;
