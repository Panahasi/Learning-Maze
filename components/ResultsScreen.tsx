import React, { useState } from 'react';
import { User, GameSession } from '../types';
import useLocalStorage from '../hooks/useLocalStorage';
import { TOTAL_ROOMS } from '../constants';
import { CheckIcon, CrossIcon, TrophyIcon } from './icons';

interface ResultsScreenProps {
  user: User;
  onExit: () => void;
}

const ResultsScreen: React.FC<ResultsScreenProps> = ({ user, onExit }) => {
  const [gameHistory] = useLocalStorage<Record<string, GameSession[]>>('gameHistory', {});
  const [selectedSession, setSelectedSession] = useState<GameSession | null>(null);

  const userHistory = gameHistory[user.id] || [];

  const formatDateTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleString([], { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };
  
  if (selectedSession) {
    return (
        <div className="w-full h-screen md:h-auto flex flex-col bg-white/90 md:rounded-2xl md:shadow-lg p-4 md:p-8">
            <div className="w-full flex justify-between items-center mb-4">
                <h2 className="text-2xl md:text-3xl font-black text-gray-800">Reviewing Session</h2>
                <button onClick={() => setSelectedSession(null)} className="text-gray-500 hover:text-gray-800 font-bold text-lg">
                    &larr; Back to History
                </button>
            </div>
            <div className="text-center mb-4">
                <p className="font-bold text-gray-600">{selectedSession.setName} ({selectedSession.mode})</p>
                <p className="text-sm text-gray-500">{formatDateTime(selectedSession.date)}</p>
            </div>
            <div className="w-full flex-grow overflow-y-auto space-y-3 pr-2 border-t pt-4">
                {selectedSession.results.map((result, index) => (
                    <div key={index} className={`p-3 rounded-lg ${result.isCorrect ? 'bg-green-50' : 'bg-red-50'}`}>
                        <p className="font-bold text-gray-700 text-md">{index + 1}. {result.question.question}</p>
                        <div className="flex items-center mt-1">
                            {result.isCorrect ? (
                                <CheckIcon className="w-5 h-5 text-green-600 mr-2" />
                            ) : (
                                <CrossIcon className="w-5 h-5 text-red-600 mr-2" />
                            )}
                            <span className={`font-semibold text-sm ${result.isCorrect ? 'text-green-800' : 'text-red-800 line-through'}`}>
                                Your answer: {result.userAnswer}
                            </span>
                        </div>
                        {!result.isCorrect && (
                             <div className="flex items-center mt-1">
                                <CheckIcon className="w-5 h-5 text-green-600 mr-2" />
                                <span className="font-semibold text-sm text-green-800">
                                    Correct answer: {result.question.correctAnswer}
                                </span>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
  }

  return (
    <div className="w-full h-screen md:h-auto md:max-w-2xl mx-auto p-4 md:p-8 bg-white/90 md:rounded-3xl md:shadow-2xl backdrop-blur-lg md:border border-gray-200 flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl md:text-4xl font-black text-blue-600 tracking-tight flex items-center gap-3">
            <TrophyIcon className="w-8 h-8" /> 
            {user.name}'s Results
        </h1>
        <button onClick={onExit} className="text-gray-500 hover:text-gray-800 font-bold">
          Back
        </button>
      </div>

      <div className="space-y-4 flex-grow overflow-y-auto pr-2">
        {userHistory.length > 0 ? (
          userHistory.map(session => (
            <div key={session.id} className="p-4 bg-gray-50 border rounded-xl hover:shadow-md hover:border-blue-300 transition-all">
              <div className="flex flex-col md:flex-row justify-between md:items-center">
                <div>
                  <h3 className="text-xl font-bold text-gray-800">{session.setName}</h3>
                  <p className="text-sm text-gray-500">{formatDateTime(session.date)}</p>
                </div>
                <div className="flex items-center gap-4 mt-2 md:mt-0">
                  <div className="text-center">
                    <div className="font-bold text-2xl text-blue-600">{session.score}/{TOTAL_ROOMS}</div>
                    <div className="text-xs text-gray-500">SCORE</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-2xl text-yellow-600">{session.time}s</div>
                    <div className="text-xs text-gray-500">TIME</div>
                  </div>
                  <button onClick={() => setSelectedSession(session)} className="bg-blue-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-600 transition">
                    Review
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-10">
            <TrophyIcon className="w-20 h-20 text-gray-300 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-600">No Games Played Yet</h3>
            <p className="text-gray-500">Complete a maze to see your results here!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultsScreen;