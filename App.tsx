import React, { useState, useCallback } from 'react';
import { GameMode, QuestionSet } from './types';
import useLocalStorage from './hooks/useLocalStorage';
import MainMenu from './components/MainMenu';
import GameScreen from './components/GameScreen';
import SetupScreen from './components/SetupScreen';
import { getDefaultQuestionSets } from './services/questionService';

type Screen = 'menu' | 'game' | 'setup';

const App: React.FC = () => {
  const [screen, setScreen] = useState<Screen>('menu');
  const [gameConfig, setGameConfig] = useState<{ mode: GameMode; set: QuestionSet; } | null>(null);
  const [setupMode, setSetupMode] = useState<GameMode>(GameMode.Math);
  
  const [questionSets, setQuestionSets] = useLocalStorage<QuestionSet[]>('questionSets', getDefaultQuestionSets());

  const handleStartGame = useCallback((mode: GameMode, set: QuestionSet) => {
    setGameConfig({ mode, set });
    setScreen('game');
  }, []);

  const handleOpenSetup = useCallback((mode: GameMode) => {
    setSetupMode(mode);
    setScreen('setup');
  }, []);

  const handleExitGame = useCallback(() => {
    setGameConfig(null);
    setScreen('menu');
  }, []);
  
  const handleExitSetup = useCallback(() => {
    setScreen('menu');
  }, []);


  const renderScreen = () => {
    switch (screen) {
      case 'game':
        if (!gameConfig) {
          setScreen('menu'); // Should not happen, but as a fallback
          return null;
        }
        return <GameScreen {...gameConfig} onExit={handleExitGame} />;
      case 'setup':
        return <SetupScreen mode={setupMode} questionSets={questionSets} setQuestionSets={setQuestionSets} onExit={handleExitSetup} />;
      case 'menu':
      default:
        return <MainMenu onStartGame={handleStartGame} onOpenSetup={handleOpenSetup} questionSets={questionSets} />;
    }
  };

  return (
    <div className="bg-[#FFFBEB] min-h-screen w-full flex flex-col items-center justify-center text-gray-800 p-4" style={{ fontFamily: "'Nunito', sans-serif" }}>
      <div className="w-full max-w-4xl mx-auto">
        {renderScreen()}
      </div>
    </div>
  );
};

export default App;