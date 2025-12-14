
import React, { useState, useCallback } from 'react';
import { GameMode, QuestionSet, User, GameSession, Achievement } from './types';
import useLocalStorage from './hooks/useLocalStorage';
import MainMenu from './components/MainMenu';
import GameScreen from './components/GameScreen';
import SetupScreen from './components/SetupScreen';
import UserSelectionScreen from './components/UserSelectionScreen';
import ResultsScreen from './components/ResultsScreen';
import TeacherDashboard from './components/TeacherDashboard';
import { getDefaultQuestionSets } from './services/questionService';

type Screen = 'user-select' | 'menu' | 'game' | 'setup' | 'results' | 'teacher-dashboard';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useLocalStorage<User | null>('currentUser', null);
  const [screen, setScreen] = useState<Screen>(currentUser ? (currentUser.role === 'teacher' ? 'teacher-dashboard' : 'menu') : 'user-select');
  const [gameConfig, setGameConfig] = useState<{ mode: GameMode; set: QuestionSet; } | null>(null);
  const [setupMode, setSetupMode] = useState<GameMode>(GameMode.Math);
  
  const [users, setUsers] = useLocalStorage<User[]>('users', []);
  const [gameHistory, setGameHistory] = useLocalStorage<Record<string, GameSession[]>>('gameHistory', {});
  const [questionSets, setQuestionSets] = useLocalStorage<QuestionSet[]>('questionSets', getDefaultQuestionSets());
  const [userAchievements, setUserAchievements] = useLocalStorage<Record<string, string[]>>('userAchievements', {});
  const [customAchievements, setCustomAchievements] = useLocalStorage<Achievement[]>('customAchievements', []);

  const handleUserSelect = useCallback((user: User) => {
    setCurrentUser(user);
    if (user.role === 'teacher') {
        setScreen('teacher-dashboard');
    } else {
        setScreen('menu');
    }
  }, [setCurrentUser]);
  
  const handleLogout = useCallback(() => {
    setCurrentUser(null);
    setScreen('user-select');
  }, [setCurrentUser]);

  const handleViewResults = useCallback(() => {
    setScreen('results');
  }, []);

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
  
  const handleBackToMenu = useCallback(() => {
    setScreen('menu');
  }, []);
  
  const handleBackToDashboard = useCallback(() => {
    setScreen('teacher-dashboard');
  }, []);

  const handleUnlockAchievements = useCallback((newIds: string[]) => {
    if (!currentUser) return;
    setUserAchievements(prev => ({
        ...prev,
        [currentUser.id]: [...(prev[currentUser.id] || []), ...newIds]
    }));
  }, [currentUser, setUserAchievements]);


  const renderScreen = () => {
    switch (screen) {
      case 'user-select':
        return <UserSelectionScreen onUserSelect={handleUserSelect} users={users} setUsers={setUsers} />;
      case 'teacher-dashboard':
        if (!currentUser || currentUser.role !== 'teacher') {
            setScreen('user-select');
            return null;
        }
        return <TeacherDashboard 
            allUsers={users} 
            gameHistory={gameHistory} 
            onLogout={handleLogout} 
            onUpdateUsers={setUsers}
            onUpdateGameHistory={setGameHistory}
            onManageSets={handleOpenSetup}
            userAchievements={userAchievements}
            onUpdateAchievements={setUserAchievements}
            customAchievements={customAchievements}
            onUpdateCustomAchievements={setCustomAchievements}
        />;
      case 'game':
        if (!gameConfig || !currentUser) {
          setScreen('menu'); 
          return null;
        }
        return <GameScreen 
            {...gameConfig} 
            currentUser={currentUser} 
            onExit={handleExitGame} 
            gameHistory={gameHistory}
            setGameHistory={setGameHistory}
            userAchievements={userAchievements[currentUser.id] || []}
            onUnlockAchievements={handleUnlockAchievements}
        />;
      case 'setup':
        return <SetupScreen mode={setupMode} questionSets={questionSets} setQuestionSets={setQuestionSets} onExit={handleBackToDashboard} />;
      case 'results':
        if (!currentUser) {
           setScreen('user-select');
           return null;
        }
        return <ResultsScreen user={currentUser} onExit={handleBackToMenu} />;
      case 'menu':
      default:
        if (!currentUser || currentUser.role !== 'student') {
          setScreen('user-select');
          return null;
        }
        return <MainMenu 
            currentUser={currentUser}
            onStartGame={handleStartGame} 
            questionSets={questionSets}
            onLogout={handleLogout}
            onViewResults={handleViewResults}
            achievements={userAchievements[currentUser.id] || []}
            customAchievements={customAchievements}
        />;
    }
  };

  return (
    <div className="dungeon-bg min-h-screen w-full flex flex-col items-center justify-center text-gray-800 p-2 md:p-4 overflow-x-hidden" style={{ fontFamily: "'Nunito', sans-serif" }}>
      <div className="w-full max-w-4xl mx-auto h-full">
        {renderScreen()}
      </div>
    </div>
  );
};

export default App;
