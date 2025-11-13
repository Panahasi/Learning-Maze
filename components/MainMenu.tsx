import React, { useState, useMemo } from 'react';
import { GameMode, QuestionSet } from '../types';
import { GearIcon } from './icons';

interface MainMenuProps {
  onStartGame: (mode: GameMode, set: QuestionSet) => void;
  onOpenSetup: (mode: GameMode) => void;
  questionSets: QuestionSet[];
}

const MainMenu: React.FC<MainMenuProps> = ({ onStartGame, onOpenSetup, questionSets }) => {
  const [activeMode, setActiveMode] = useState<GameMode>(GameMode.Math);
  
  const { mathSets, spellingSets } = useMemo(() => ({
    mathSets: questionSets.filter(q => q.mode === GameMode.Math),
    spellingSets: questionSets.filter(q => q.mode === GameMode.Spelling),
  }), [questionSets]);

  const [selectedSetId, setSelectedSetId] = useState<string>(() => {
    const sets = activeMode === GameMode.Math ? mathSets : spellingSets;
    return sets.length > 0 ? sets[0].id : '';
  });

  const handleModeChange = (mode: GameMode) => {
    setActiveMode(mode);
    const sets = mode === GameMode.Math ? mathSets : spellingSets;
    setSelectedSetId(sets.length > 0 ? sets[0].id : '');
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

  const currentSets = activeMode === GameMode.Math ? mathSets : spellingSets;

  return (
    <div className="w-full max-w-2xl mx-auto text-center p-8 bg-white/90 rounded-3xl shadow-2xl backdrop-blur-lg border border-gray-200">
      <h1 className="text-5xl md:text-6xl font-black text-blue-600 mb-2 tracking-tighter">
        Learning Maze Adventures
      </h1>
      <p className="text-lg text-gray-600 mb-8">Choose your challenge and begin the adventure!</p>

      <div className="bg-gray-100 p-2 rounded-2xl flex mb-6">
        <button
          onClick={() => handleModeChange(GameMode.Math)}
          className={`w-1/2 p-4 rounded-xl font-bold text-2xl transition-all duration-300 ${activeMode === GameMode.Math ? 'bg-blue-500 text-white shadow-lg' : 'text-gray-600 hover:bg-white'}`}
        >
          🧮 Math
        </button>
        <button
          onClick={() => handleModeChange(GameMode.Spelling)}
          className={`w-1/2 p-4 rounded-xl font-bold text-2xl transition-all duration-300 ${activeMode === GameMode.Spelling ? 'bg-green-500 text-white shadow-lg' : 'text-gray-600 hover:bg-white'}`}
        >
           Spelling
        </button>
      </div>
      
      <div className="space-y-4">
        <div className="relative">
          <select
            value={selectedSetId}
            onChange={(e) => setSelectedSetId(e.target.value)}
            className="w-full p-4 border-2 border-gray-300 rounded-xl text-lg appearance-none focus:ring-2 focus:ring-blue-500 focus:outline-none"
            aria-label="Select a question set"
          >
            {currentSets.length > 0 ? (
              currentSets.map(s => <option key={s.id} value={s.id}>{s.name}</option>)
            ) : (
              <option value="" disabled>No sets available</option>
            )}
          </select>
          <button onClick={() => onOpenSetup(activeMode)} className="absolute top-1/2 right-4 -translate-y-1/2 text-gray-400 hover:text-blue-600 transition-colors" aria-label="Open setup for current mode">
            <GearIcon className="w-8 h-8"/>
          </button>
        </div>

        <button 
          onClick={handlePlay} 
          disabled={currentSets.length === 0}
          className="w-full bg-yellow-400 text-white font-bold py-5 rounded-xl text-2xl hover:bg-yellow-500 transition-transform hover:scale-105 shadow-lg disabled:bg-gray-300 disabled:hover:scale-100"
        >
          Play!
        </button>
      </div>
    </div>
  );
};

export default MainMenu;