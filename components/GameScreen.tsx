import React, { useState, useEffect } from 'react';
import { GameMode, QuestionSet, Question, Result } from '../types';
import { TOTAL_ROOMS } from '../constants';
import { generateQuestionsForGame } from '../services/questionService';
import { ArrowIcon, PlayerIcon, DoorIcon, CheckIcon, CrossIcon } from './icons';

interface GameScreenProps {
  mode: GameMode;
  set: QuestionSet;
  onExit: () => void;
}

const GameScreen: React.FC<GameScreenProps> = ({ mode, set, onExit }) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentRoom, setCurrentRoom] = useState(0);
  const [timer, setTimer] = useState(0);
  const [isGameRunning, setIsGameRunning] = useState(true);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [results, setResults] = useState<Result[]>([]);
  const [showReview, setShowReview] = useState(false);

  useEffect(() => {
    setQuestions(generateQuestionsForGame(set));
    setIsGameRunning(true);
    setCurrentRoom(0);
    setTimer(0);
    setResults([]);
    setShowReview(false);
  }, [set]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (isGameRunning) {
      interval = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isGameRunning]);
  
  const handleAnswer = (answer: string | number) => {
    if (feedback) return; // Prevent multiple clicks during feedback
    
    const currentQuestion = questions[currentRoom];
    if (!currentQuestion) return;

    const isCorrect = answer === currentQuestion.correctAnswer;
    setResults(prev => [...prev, { question: currentQuestion, userAnswer: answer, isCorrect }]);

    if (isCorrect) {
      setFeedback('correct');
      setTimeout(() => {
        if (currentRoom + 1 >= TOTAL_ROOMS) {
          setIsGameRunning(false);
        } else {
          setCurrentRoom(prev => prev + 1);
        }
        setFeedback(null);
      }, 700);
    } else {
      setFeedback('incorrect');
      setTimeout(() => {
        setFeedback(null);
      }, 700);
    }
  };

  const currentQuestion = questions[currentRoom];
  const correctAnswers = results.filter(r => r.isCorrect).length;
  const isFinished = !isGameRunning && currentRoom >= TOTAL_ROOMS -1;

  if (isFinished) {
    if(showReview){
      return(
        <div className="w-full h-full flex flex-col items-center justify-center bg-white/90 rounded-2xl shadow-lg p-8">
            <h2 className="text-4xl font-black text-gray-800 mb-6">Review Answers</h2>
            <div className="w-full max-h-[60vh] overflow-y-auto space-y-3 pr-2">
                {results.map((result, index) => (
                    <div key={index} className={`p-4 rounded-lg ${result.isCorrect ? 'bg-green-50' : 'bg-red-50'}`}>
                        <p className="font-bold text-gray-700 text-lg">{index + 1}. {result.question.question}</p>
                        <div className="flex items-center mt-2">
                            {result.isCorrect ? (
                                <CheckIcon className="w-6 h-6 text-green-600 mr-2" />
                            ) : (
                                <CrossIcon className="w-6 h-6 text-red-600 mr-2" />
                            )}
                            <span className={`font-semibold ${result.isCorrect ? 'text-green-800' : 'text-red-800 line-through'}`}>
                                Your answer: {result.userAnswer}
                            </span>
                        </div>
                        {!result.isCorrect && (
                             <div className="flex items-center mt-1">
                                <CheckIcon className="w-6 h-6 text-green-600 mr-2" />
                                <span className="font-semibold text-green-800">
                                    Correct answer: {result.question.correctAnswer}
                                </span>
                            </div>
                        )}
                    </div>
                ))}
            </div>
            <button onClick={() => setShowReview(false)} className="mt-6 bg-gray-500 text-white font-bold py-3 px-6 rounded-lg text-lg hover:bg-gray-600 transition-transform hover:scale-105">
                Back to Summary
            </button>
        </div>
      );
    }

    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-white/90 rounded-2xl shadow-lg p-8 text-center">
        <h2 className="text-5xl font-black text-yellow-500 mb-4 tracking-tighter">Maze Complete!</h2>
        <p className="text-2xl text-gray-700 mb-2">Total Time: <span className="font-bold">{timer}</span> seconds</p>
        <p className="text-2xl text-gray-700 mb-6">Score: <span className="font-bold">{correctAnswers} / {TOTAL_ROOMS}</span></p>
        <p className="text-xl text-gray-600 mb-8">Great job navigating the maze!</p>
        <div className="flex gap-4">
          <button onClick={onExit} className="bg-blue-500 text-white font-bold py-3 px-6 rounded-lg text-lg hover:bg-blue-600 transition-transform hover:scale-105">
            Main Menu
          </button>
          <button onClick={() => setShowReview(true)} className="bg-yellow-400 text-white font-bold py-3 px-6 rounded-lg text-lg hover:bg-yellow-500 transition-transform hover:scale-105">
            Review Answers
          </button>
        </div>
      </div>
    );
  }
  
  if (!currentQuestion) {
    return <div className="text-center text-2xl font-bold">Loading questions...</div>;
  }

  const doorPositions = ['top', 'right', 'bottom', 'left'];

  return (
    <div className={`w-full max-w-3xl mx-auto p-4 bg-white/80 rounded-2xl shadow-lg transition-colors duration-300 ${feedback === 'incorrect' ? 'bg-red-200' : ''}`}>
      <div className="flex justify-between items-center mb-4 text-xl font-bold">
        <div className="bg-blue-200 px-4 py-1 rounded-full text-blue-800">Room: {currentRoom + 1} / {TOTAL_ROOMS}</div>
        <div className="bg-yellow-200 px-4 py-1 rounded-full text-yellow-800">Time: {timer}s</div>
      </div>

      <div className="relative w-full aspect-square bg-[#f7f2e9] border-8 border-gray-700 rounded-lg overflow-hidden flex items-center justify-center shadow-inner">
        {/* Player Sprite */}
        <div className={`transition-all duration-500 ease-in-out ${feedback === 'correct' ? 'scale-150 opacity-0' : 'scale-100 opacity-100'}`}>
            <PlayerIcon className="w-16 h-16 text-orange-600" />
        </div>

        {/* Question Area */}
        <div className="absolute inset-0 flex items-center justify-center p-10">
          <div className="bg-white/80 p-6 rounded-xl shadow-md text-center">
            <h3 className="text-2xl md:text-4xl font-black tracking-tight">{currentQuestion.question}</h3>
          </div>
        </div>

        {/* Doors */}
        {currentQuestion.options.map((option, index) => {
          const position = doorPositions[index];
          let posClass = '';
          if (position === 'top') posClass = 'top-0 left-1/2 -translate-x-1/2 -translate-y-2';
          if (position === 'bottom') posClass = 'bottom-0 left-1/2 -translate-x-1/2 translate-y-2';
          if (position === 'left') posClass = 'left-0 top-1/2 -translate-y-1/2 -translate-x-2';
          if (position === 'right') posClass = 'right-0 top-1/2 -translate-y-1/2 translate-x-2';

          return (
            <button
              key={index}
              onClick={() => handleAnswer(option)}
              className={`absolute flex items-center justify-center w-24 h-24 md:w-32 md:h-32 transform transition-transform hover:scale-110 group ${posClass}`}
            >
              <DoorIcon className="w-full h-full absolute" />
              <span className="relative z-10 text-white text-2xl md:text-3xl font-bold drop-shadow-lg group-hover:text-yellow-300">{option}</span>
            </button>
          );
        })}
      </div>

      {/* On-screen Controls */}
      <div className="mt-6 flex justify-center lg:hidden">
        <div className="grid grid-cols-3 gap-2 w-48">
          <div></div>
          <button onClick={() => handleAnswer(currentQuestion.options[0])} className="bg-gray-300 rounded-lg p-3 hover:bg-gray-400"><ArrowIcon direction="up" className="w-8 h-8 mx-auto" /></button>
          <div></div>
          <button onClick={() => handleAnswer(currentQuestion.options[3])} className="bg-gray-300 rounded-lg p-3 hover:bg-gray-400"><ArrowIcon direction="left" className="w-8 h-8 mx-auto" /></button>
          <button onClick={() => handleAnswer(currentQuestion.options[2])} className="bg-gray-300 rounded-lg p-3 hover:bg-gray-400"><ArrowIcon direction="down" className="w-8 h-8 mx-auto" /></button>
          <button onClick={() => handleAnswer(currentQuestion.options[1])} className="bg-gray-300 rounded-lg p-3 hover:bg-gray-400"><ArrowIcon direction="right" className="w-8 h-8 mx-auto" /></button>
        </div>
      </div>
       <button onClick={onExit} className="mt-4 mx-auto block text-gray-500 hover:text-gray-800 font-bold">
          Exit to Main Menu
        </button>
    </div>
  );
};

export default GameScreen;