
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GameMode, QuestionSet, Question, Result, User, GameSession, Achievement } from '../types';
import { TOTAL_ROOMS } from '../constants';
import { generateQuestionsForGame } from '../services/questionService';
import { ArrowIcon, DoorIcon, CheckIcon, CrossIcon, SpeakerIcon, PauseIcon, PlayIcon, StarIcon, TrophyIcon, MedalIcon, FireIcon, LightningIcon, ScrollIcon } from './icons';
import { generateSpeech } from '../services/geminiService';
import { ACHIEVEMENTS, checkAchievements } from '../services/achievementService';

interface GameScreenProps {
  mode: GameMode;
  set: QuestionSet;
  currentUser: User;
  onExit: () => void;
  gameHistory: Record<string, GameSession[]>;
  setGameHistory: (history: Record<string, GameSession[]>) => void;
  userAchievements: string[];
  onUnlockAchievements: (newIds: string[]) => void;
}

// Helper functions for audio decoding
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}


const GameScreen: React.FC<GameScreenProps> = ({ mode, set, currentUser, onExit, gameHistory, setGameHistory, userAchievements, onUnlockAchievements }) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentRoom, setCurrentRoom] = useState(0);
  const [timer, setTimer] = useState(0);
  const [questionTimer, setQuestionTimer] = useState<number | null>(null);
  const [isGameRunning, setIsGameRunning] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [results, setResults] = useState<Result[]>([]);
  const [showReview, setShowReview] = useState(false);
  const [sessionSaved, setSessionSaved] = useState(false);
  const [newlyUnlockedBadges, setNewlyUnlockedBadges] = useState<string[]>([]);
  const [showBadgeOverlay, setShowBadgeOverlay] = useState(false);
  
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSpeechPaused, setIsSpeechPaused] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);

  const correctAnswers = results.filter(r => r.isCorrect).length;
  const isFinished = !isGameRunning && currentRoom >= TOTAL_ROOMS - 1;

  useEffect(() => {
    setQuestions(generateQuestionsForGame(set));
    setIsGameRunning(true);
    setCurrentRoom(0);
    setTimer(0);
    setResults([]);
    setShowReview(false);
    setSessionSaved(false);
    setIsPaused(false);
    setNewlyUnlockedBadges([]);
    setShowBadgeOverlay(false);
  }, [set]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (isGameRunning && !isPaused) {
      interval = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isGameRunning, isPaused]);

  // Handle overall game pause/resume for audio
  useEffect(() => {
    if (audioContextRef.current) {
      if (isPaused) {
        audioContextRef.current.suspend();
      } else if (!isSpeechPaused) { // Only resume if speech wasn't paused independently
        audioContextRef.current.resume();
      }
    }
  }, [isPaused, isSpeechPaused]);

  // Cleanup audio on component unmount
  useEffect(() => {
    return () => {
      if (audioSourceRef.current) {
        audioSourceRef.current.onended = null;
        audioSourceRef.current.stop();
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(console.error);
      }
    };
  }, []);

  // Stop audio when game finishes
  useEffect(() => {
    if (!isGameRunning) {
      if (audioSourceRef.current) {
        audioSourceRef.current.onended = null;
        audioSourceRef.current.stop();
        audioSourceRef.current = null;
        setIsSpeaking(false);
        setIsSpeechPaused(false);
      }
    }
  }, [isGameRunning]);


  const playTextAsSpeech = useCallback(async (text: string) => {
    if (!text) return;

    if (audioSourceRef.current) {
      audioSourceRef.current.onended = null;
      audioSourceRef.current.stop();
      audioSourceRef.current = null;
    }
    
    setIsSpeaking(true);
    setIsSpeechPaused(false);

    try {
      const base64Audio = await generateSpeech(text);
      if (base64Audio) {
          if (!audioContextRef.current) {
              audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
          }
          const ctx = audioContextRef.current;
          if (ctx.state === 'suspended') {
            await ctx.resume();
          }
          
          const audioBytes = decode(base64Audio);
          const audioBuffer = await decodeAudioData(audioBytes, ctx, 24000, 1);

          const source = ctx.createBufferSource();
          source.buffer = audioBuffer;
          source.connect(ctx.destination);
          source.onended = () => {
              setIsSpeaking(false);
              setIsSpeechPaused(false);
              audioSourceRef.current = null;
          };
          source.start();
          audioSourceRef.current = source;
      } else {
          setIsSpeaking(false);
          setIsSpeechPaused(false);
      }
    } catch (error) {
        console.error("Failed to play audio:", error);
        setIsSpeaking(false);
        setIsSpeechPaused(false);
    }
  }, []);

  const handlePauseSpeech = () => {
    if (audioContextRef.current && audioContextRef.current.state === 'running') {
      audioContextRef.current.suspend();
      setIsSpeechPaused(true);
    }
  };

  const handleResumeSpeech = () => {
    if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
      setIsSpeechPaused(false);
    }
  };

  const handleAnswer = useCallback((answer: string | number) => {
    if (feedback || isPaused || isFinished) return; // Prevent multiple clicks
    
    const currentQuestion = questions[currentRoom];
    if (!currentQuestion) return;

    const isCorrect = answer !== 'TIME_UP' && answer === currentQuestion.correctAnswer;
    setResults(prev => [...prev, { question: currentQuestion, userAnswer: answer === 'TIME_UP' ? 'Timed Out' : answer, isCorrect }]);

    const advanceToNextRoom = () => {
        if (currentRoom + 1 >= TOTAL_ROOMS) {
            setIsGameRunning(false);
        } else {
            setCurrentRoom(prev => prev + 1);
        }
        setFeedback(null);
    };
    
    if (isCorrect) {
      setFeedback('correct');
      setTimeout(advanceToNextRoom, 700);
    } else {
      setFeedback('incorrect');
      const requireCorrect = set.requireCorrectAnswer ?? true; // Default to true
      
      if (requireCorrect) {
        // Stay on the same room, reset feedback and timer
        setTimeout(() => {
            setFeedback(null);
            if (set.countdownSeconds && set.countdownSeconds > 0) {
              setQuestionTimer(set.countdownSeconds);
            }
        }, 700);
      } else {
        // Advance even if incorrect
        setTimeout(advanceToNextRoom, 700);
      }
    }
  }, [feedback, isPaused, isFinished, questions, currentRoom, set.requireCorrectAnswer, set.countdownSeconds]);

  const handleReadAloud = useCallback(() => {
    const textToRead = mode === GameMode.Spelling 
      ? questions[currentRoom]?.correctAnswer as string
      : questions[currentRoom]?.question;
      
    if (textToRead) {
      playTextAsSpeech(textToRead);
    }
  }, [questions, currentRoom, mode, playTextAsSpeech]);
  
  // Automatically speak the word for spelling questions
  useEffect(() => {
    if (isGameRunning && mode === GameMode.Spelling && questions[currentRoom]) {
      const wordToSpeak = questions[currentRoom].correctAnswer as string;
      // Delay to allow the UI to animate in and not startle the user
      const timerId = setTimeout(() => {
        playTextAsSpeech(wordToSpeak);
      }, 700);

      return () => clearTimeout(timerId);
    }
  }, [currentRoom, isGameRunning, mode, playTextAsSpeech, questions]);


  // Question countdown timer effect
  useEffect(() => {
    if (isGameRunning && !isPaused && questionTimer !== null && questionTimer > 0) {
        const interval = setInterval(() => {
            setQuestionTimer(prev => (prev !== null ? prev - 1 : null));
        }, 1000);
        return () => clearInterval(interval);
    } else if (isGameRunning && questionTimer === 0) {
        handleAnswer('TIME_UP');
    }
  }, [isGameRunning, isPaused, questionTimer, handleAnswer]);

  // Reset question timer on new room
  useEffect(() => {
      if (set.countdownSeconds && set.countdownSeconds > 0) {
          setQuestionTimer(set.countdownSeconds);
      } else {
          setQuestionTimer(null);
      }
  }, [currentRoom, set.countdownSeconds]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if (isPaused || isFinished || feedback || showReview || showBadgeOverlay) return;

        let answer: string | number | undefined;
        const currentOptions = questions[currentRoom]?.options;
        if (!currentOptions) return;

        switch (e.key) {
            case 'ArrowUp':
                answer = currentOptions[0];
                break;
            case 'ArrowRight':
                answer = currentOptions[1];
                break;
            case 'ArrowDown':
                answer = currentOptions[2];
                break;
            case 'ArrowLeft':
                answer = currentOptions[3];
                break;
            default:
                return;
        }

        if (answer !== undefined) {
            e.preventDefault();
            handleAnswer(answer);
        }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
        window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isPaused, isFinished, feedback, showReview, showBadgeOverlay, questions, currentRoom, handleAnswer]);


  useEffect(() => {
    if (isFinished && !sessionSaved) {
        const newSession: GameSession = {
            id: `session-${Date.now()}`,
            date: new Date().toISOString(),
            setName: set.name,
            mode: mode,
            results: results,
            score: correctAnswers,
            time: timer,
        };

        const userHistory = gameHistory[currentUser.id] || [];
        const updatedHistory = [newSession, ...userHistory];
        const updatedHistoryMap = {
            ...gameHistory,
            [currentUser.id]: updatedHistory,
        };
        setGameHistory(updatedHistoryMap);
        setSessionSaved(true);

        // Check achievements
        const unlockedIds = checkAchievements(newSession, updatedHistory, userAchievements);
        if (unlockedIds.length > 0) {
            onUnlockAchievements(unlockedIds);
            setNewlyUnlockedBadges(unlockedIds);
            setShowBadgeOverlay(true);
        }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFinished, sessionSaved]);

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

  if (isFinished) {
    if(showReview){
      return(
        <div className="w-full h-screen md:h-auto flex flex-col glass-panel md:rounded-2xl md:shadow-lg p-4 md:p-8 animate-fade-in-scale text-white">
            <h2 className="text-2xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 mb-4 md:mb-6 text-center drop-shadow-md">Review Answers</h2>
            <div className="w-full flex-grow overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                {results.map((result, index) => (
                    <div key={index} className={`p-3 md:p-4 rounded-xl border-2 bg-opacity-20 backdrop-blur-sm ${result.isCorrect ? 'bg-green-900 border-green-500' : 'bg-red-900 border-red-500'}`}>
                        <p className="font-bold text-gray-100 text-base md:text-lg">{index + 1}. {result.question.question}</p>
                        <div className="flex items-center mt-2 text-sm md:text-base">
                            {result.isCorrect ? (
                                <CheckIcon className="w-5 h-5 md:w-6 md:h-6 text-green-400 mr-2" />
                            ) : (
                                <CrossIcon className="w-5 h-5 md:w-6 md:h-6 text-red-400 mr-2" />
                            )}
                            <span className={`font-semibold ${result.isCorrect ? 'text-green-300' : 'text-red-300'}`}>
                                Your answer: <span className={!result.isCorrect ? 'line-through' : ''}>{result.userAnswer}</span>
                            </span>
                        </div>
                        {!result.isCorrect && (
                             <div className="flex items-center mt-1 text-sm md:text-base">
                                <CheckIcon className="w-5 h-5 md:w-6 md:h-6 text-green-400 mr-2" />
                                <span className="font-semibold text-green-300">
                                    Correct answer: {result.question.correctAnswer}
                                </span>
                            </div>
                        )}
                    </div>
                ))}
            </div>
            <button onClick={() => setShowReview(false)} className="mt-4 md:mt-6 w-full md:w-auto md:mx-auto bg-gray-600 text-white font-bold py-3 px-8 rounded-xl text-lg hover:bg-gray-500 transition-transform hover:scale-105 shadow-lg border border-gray-500">
                Back to Summary
            </button>
        </div>
      );
    }

    return (
      <div className="w-full h-screen md:h-auto flex flex-col items-center justify-center glass-panel md:rounded-2xl md:shadow-2xl p-4 md:p-8 text-center animate-fade-in-scale relative overflow-hidden">
        
        {/* Achievement Overlay */}
        {showBadgeOverlay && newlyUnlockedBadges.length > 0 && (
             <div className="absolute inset-0 z-50 bg-black/90 flex flex-col items-center justify-center animate-fade-in-scale p-6 md:p-8 backdrop-blur-md">
                 <h2 className="text-3xl md:text-5xl font-black text-yellow-400 mb-6 md:mb-8 drop-shadow-lg animate-pop-in">Badge Unlocked!</h2>
                 <div className="grid grid-cols-1 gap-6">
                     {newlyUnlockedBadges.map(id => {
                         const badge = ACHIEVEMENTS.find(a => a.id === id);
                         if (!badge) return null;
                         return (
                             <div key={id} className="flex flex-col items-center animate-pop-in" style={{ animationDelay: '0.2s' }}>
                                 <div className="w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(250,204,21,0.6)] mb-4 animate-float relative overflow-hidden border-4 border-white">
                                     <div className="animate-shine w-full h-full absolute top-0 left-0"></div>
                                     {renderAchievementIcon(badge.icon, "w-12 h-12 md:w-16 md:h-16 text-white drop-shadow-md")}
                                 </div>
                                 <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">{badge.title}</h3>
                                 <p className="text-gray-300 text-sm md:text-base">{badge.description}</p>
                             </div>
                         );
                     })}
                 </div>
                 <button 
                    onClick={() => setShowBadgeOverlay(false)} 
                    className="mt-8 md:mt-10 bg-white text-gray-900 font-black py-3 px-8 md:py-4 md:px-10 rounded-full text-lg md:text-xl hover:scale-105 transition-transform shadow-xl"
                 >
                     Awesome!
                 </button>
             </div>
        )}

        <div className="mb-4 md:mb-6 relative">
             <TrophyIcon className="w-24 h-24 md:w-32 md:h-32 text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)] animate-float" />
             <div className="absolute -top-4 -right-4 text-yellow-200 animate-pop-in delay-300">
                <StarIcon className="w-10 h-10 md:w-12 md:h-12 drop-shadow-lg" />
             </div>
        </div>
        <h2 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 mb-2 md:mb-4 tracking-tighter drop-shadow-sm">Maze Complete!</h2>
        
        <div className="grid grid-cols-2 gap-4 md:gap-8 w-full max-w-md mb-6 md:mb-8">
            <div className="bg-black/30 p-3 md:p-4 rounded-2xl border border-white/10">
                 <p className="text-xs md:text-sm font-bold text-gray-400 uppercase tracking-wider">Total Time</p>
                 <p className="text-2xl md:text-4xl font-black text-gray-100">{timer}<span className="text-sm md:text-lg text-gray-400 font-normal ml-1">s</span></p>
            </div>
            <div className="bg-black/30 p-3 md:p-4 rounded-2xl border border-white/10">
                 <p className="text-xs md:text-sm font-bold text-gray-400 uppercase tracking-wider">Score</p>
                 <p className="text-2xl md:text-4xl font-black text-gray-100">{correctAnswers} <span className="text-sm md:text-lg text-gray-400 font-normal">/ {TOTAL_ROOMS}</span></p>
            </div>
        </div>

        <p className="text-lg md:text-xl text-gray-300 font-bold mb-6 md:mb-8">Great job navigating the dungeon, {currentUser.name}!</p>
        <div className="flex gap-3 md:gap-4 w-full max-w-md">
          <button onClick={onExit} className="flex-1 bg-blue-600 text-white font-bold py-3 px-4 md:py-4 md:px-6 rounded-2xl text-base md:text-lg hover:bg-blue-500 transition-transform hover:scale-105 shadow-lg border-b-4 border-blue-800 active:border-b-0 active:translate-y-1">
            Main Menu
          </button>
          <button onClick={() => setShowReview(true)} className="flex-1 bg-yellow-500 text-white font-bold py-3 px-4 md:py-4 md:px-6 rounded-2xl text-base md:text-lg hover:bg-yellow-400 transition-transform hover:scale-105 shadow-lg border-b-4 border-yellow-700 active:border-b-0 active:translate-y-1">
            Review
          </button>
        </div>
      </div>
    );
  }
  
  if (!questions[currentRoom]) {
    return <div className="w-full h-64 flex items-center justify-center text-center text-xl md:text-2xl font-bold text-white animate-pulse">Summoning Dungeon...</div>;
  }
  const currentQuestion = questions[currentRoom];
  const doorPositions = ['top', 'right', 'bottom', 'left'];

  const getOptionTextStyle = (option: string | number) => {
    const text = String(option);
    if (text.length > 9) {
      return 'text-[10px] md:text-sm px-1 leading-tight';
    }
    if (text.length > 6) {
      return 'text-xs md:text-base leading-tight';
    }
    return 'text-sm md:text-xl';
  };

  return (
    <div className="w-full h-full flex flex-col justify-center relative max-w-3xl mx-auto">
        {/* HUD */}
      <div className="mb-2 md:mb-4 bg-gray-900/90 backdrop-blur-md rounded-xl md:rounded-2xl border border-gray-600 shadow-2xl text-white z-30 relative overflow-hidden flex flex-col shrink-0">
        <div className="flex items-center justify-between px-3 py-2 md:px-4 md:py-3 relative">
            <div className="flex items-center gap-2">
                <div className="bg-blue-700 px-2 py-0.5 md:px-3 md:py-1 rounded-lg text-xs md:text-sm font-bold shadow-inner border border-blue-500">ROOM</div>
                <span className="font-mono text-lg md:text-xl font-bold text-blue-100 shadow-black drop-shadow-sm leading-none">{currentRoom + 1} <span className="text-gray-500">/</span> {TOTAL_ROOMS}</span>
            </div>
            
            <div className="absolute left-1/2 transform -translate-x-1/2 top-1/2 -translate-y-1/2 pointer-events-none">
                {questionTimer !== null && (
                    <div className={`px-2 py-0.5 md:px-4 md:py-1 rounded-full font-bold transition-colors duration-300 flex items-center gap-1 md:gap-2 border text-sm md:text-base ${questionTimer <= 5 ? 'bg-red-900/80 border-red-500 text-red-100 animate-pulse shadow-[0_0_15px_rgba(220,38,38,0.7)]' : 'bg-gray-800 border-gray-600 text-yellow-400'}`}>
                        <span>⏳</span> {questionTimer}s
                    </div>
                )}
            </div>

            <div className="flex items-center gap-2 md:gap-4">
                <div className="hidden sm:flex items-center gap-2 bg-gray-800 px-3 py-1 rounded-lg border border-gray-700">
                    <span className="text-xs text-gray-400 font-bold uppercase">Time</span>
                    <span className="font-mono text-lg md:text-xl font-bold text-yellow-400">{timer}s</span>
                </div>
                <button onClick={() => setIsPaused(true)} className="p-1.5 md:p-2 rounded-full bg-gray-700 hover:bg-gray-600 transition text-white border border-gray-600 hover:border-gray-500 shadow-lg" aria-label="Pause game">
                    <PauseIcon className="w-4 h-4 md:w-5 md:h-5" />
                </button>
            </div>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full h-1 md:h-1.5 flex bg-gray-800">
            {Array.from({ length: TOTAL_ROOMS }).map((_, i) => {
                 let colorClass = "bg-gray-700";
                 if (i < currentRoom) colorClass = "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]";
                 else if (i === currentRoom) colorClass = "bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.8)] animate-pulse";

                 return (
                     <div key={i} className={`flex-1 border-r border-gray-900/30 last:border-0 transition-all duration-500 ${colorClass}`}></div>
                 );
            })}
        </div>
      </div>


      {/* Game Area Container - Constrained dimensions to prevent collapse */}
      <div className="relative w-full max-w-3xl aspect-square max-h-[75vh] wall-pattern border-4 md:border-8 border-[#2d3748] rounded-xl overflow-hidden flex items-center justify-center shadow-[0_0_50px_rgba(0,0,0,0.8)] mx-auto shrink-0">
        {/* Vignette & Lighting */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,rgba(0,0,0,0.85)_100%)] pointer-events-none z-0"></div>

        {/* Pause Overlay */}
        {isPaused && (
            <div className="absolute inset-0 bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center z-50 animate-fade-in-scale p-4 text-center">
            <h2 className="text-4xl md:text-6xl font-black text-white mb-6 md:mb-8 tracking-tighter drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">PAUSED</h2>
            <div className="flex flex-col gap-3 md:gap-4 w-full max-w-xs">
                <button 
                onClick={() => setIsPaused(false)}
                className="flex items-center justify-center gap-3 w-full bg-green-600 text-white font-bold py-3 md:py-4 rounded-xl text-lg md:text-xl hover:bg-green-500 transition-transform hover:scale-105 shadow-lg border-b-4 border-green-800 active:border-b-0 active:translate-y-1"
                >
                <PlayIcon className="w-5 h-5 md:w-6 md:h-6"/>
                Resume
                </button>
                <button 
                onClick={onExit}
                className="w-full bg-red-600 text-white font-bold py-3 md:py-4 rounded-xl text-lg md:text-xl hover:bg-red-500 transition-transform hover:scale-105 shadow-lg border-b-4 border-red-800 active:border-b-0 active:translate-y-1"
                >
                Exit to Menu
                </button>
            </div>
            </div>
        )}
        
        {/* Feedback Overlay */}
        {feedback && (
             <div className="absolute inset-0 flex items-center justify-center z-40 pointer-events-none">
                {feedback === 'correct' ? (
                    <div className="animate-pop-in bg-green-500 text-white p-6 md:p-8 rounded-full shadow-[0_0_50px_rgba(34,197,94,0.6)] border-4 border-white backdrop-blur-sm bg-opacity-90">
                         <CheckIcon className="w-16 h-16 md:w-32 md:h-32 drop-shadow-md" />
                    </div>
                ) : (
                    <div className="animate-shake bg-red-500 text-white p-6 md:p-8 rounded-full shadow-[0_0_50px_rgba(239,68,68,0.6)] border-4 border-white backdrop-blur-sm bg-opacity-90">
                         <CrossIcon className="w-16 h-16 md:w-32 md:h-32 drop-shadow-md" />
                    </div>
                )}
            </div>
        )}

        {/* Question Area - Parchment */}
        <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
          <div key={currentRoom} className="parchment p-4 md:p-8 rounded-sm shadow-[0_10px_30px_rgba(0,0,0,0.6)] text-center max-w-[70%] md:max-w-[65%] animate-fade-in-scale pointer-events-auto transform hover:scale-105 transition-transform duration-300 rotate-1">
             {/* Nails/Pins */}
             <div className="absolute top-1 left-1 md:top-2 md:left-2 w-2 h-2 md:w-3 md:h-3 rounded-full bg-gray-800 shadow-sm"></div>
             <div className="absolute top-1 right-1 md:top-2 md:right-2 w-2 h-2 md:w-3 md:h-3 rounded-full bg-gray-800 shadow-sm"></div>
             <div className="absolute bottom-1 left-1 md:bottom-2 md:left-2 w-2 h-2 md:w-3 md:h-3 rounded-full bg-gray-800 shadow-sm"></div>
             <div className="absolute bottom-1 right-1 md:bottom-2 md:right-2 w-2 h-2 md:w-3 md:h-3 rounded-full bg-gray-800 shadow-sm"></div>

             <div className="flex flex-col items-center gap-2 md:gap-4">
                <h3 className="text-xl sm:text-2xl md:text-5xl font-black tracking-tight text-[#4a3228] drop-shadow-sm leading-tight font-serif break-words w-full">
                    {currentQuestion.question}
                </h3>
                <div className="mt-0 md:mt-1">
                    {isSpeaking && !isSpeechPaused ? (
                        <button
                            onClick={handlePauseSpeech}
                            disabled={isPaused}
                            className="p-2 md:p-3 rounded-full bg-[#d6c4a0] text-[#5d4037] hover:bg-[#c2b08e] transition-colors shadow-inner border border-[#bcaaa4]"
                            title="Pause speech"
                        >
                            <PauseIcon className="w-4 h-4 md:w-8 md:h-8" />
                        </button>
                    ) : isSpeaking && isSpeechPaused ? (
                        <button
                            onClick={handleResumeSpeech}
                            disabled={isPaused}
                            className="p-2 md:p-3 rounded-full bg-[#d6c4a0] text-[#5d4037] hover:bg-[#c2b08e] transition-colors shadow-inner border border-[#bcaaa4]"
                            title="Resume speech"
                        >
                            <PlayIcon className="w-4 h-4 md:w-8 md:h-8" />
                        </button>
                    ) : (
                        <button
                            onClick={handleReadAloud}
                            disabled={isSpeaking || isPaused}
                            className="p-2 md:p-3 rounded-full bg-transparent text-[#8d6e63] hover:text-[#5d4037] hover:bg-[#e6d5b8] transition-colors"
                            title="Read aloud"
                        >
                            <SpeakerIcon className="w-4 h-4 md:w-8 md:h-8" />
                        </button>
                    )}
                </div>
             </div>
          </div>
        </div>

        {/* Doors */}
        {currentQuestion.options.map((option, index) => {
          const position = doorPositions[index];
          let posClass = '';
          let rotation = '';
          
          if (position === 'top') { posClass = 'top-[-2%] left-1/2 -translate-x-1/2'; }
          if (position === 'bottom') { posClass = 'bottom-[-2%] left-1/2 -translate-x-1/2'; rotation='rotate-180'; }
          if (position === 'left') { posClass = 'left-[-2%] top-1/2 -translate-y-1/2 origin-center'; rotation='-rotate-90'; }
          if (position === 'right') { posClass = 'right-[-2%] top-1/2 -translate-y-1/2 origin-center'; rotation='rotate-90'; }

          return (
            <button
              key={`${currentRoom}-${index}`}
              onClick={() => handleAnswer(option)}
              className={`absolute w-20 h-20 sm:w-24 sm:h-24 md:w-40 md:h-40 group animate-door-pop z-10 ${posClass} touch-manipulation`}
              style={{ animationDelay: `${100 + index * 50}ms` }}
            >
                <div className={`relative w-full h-full flex items-center justify-center transition-transform duration-300 group-hover:scale-105 ${rotation}`}>
                    <DoorIcon className="w-full h-full drop-shadow-2xl filter brightness-90 group-hover:brightness-110 transition-all" />
                    
                    {/* Option Text on Door - Signplate */}
                    <div className={`absolute inset-0 flex items-center justify-center pt-4 md:pt-8 ${rotation === 'rotate-180' ? 'rotate-180 pb-8 md:pb-12 pt-0' : ''} ${rotation === '-rotate-90' ? 'rotate-90' : ''} ${rotation === 'rotate-90' ? '-rotate-90' : ''}`}>
                        <div className="bg-[#2D3748] px-1.5 py-0.5 md:px-3 md:py-1 rounded border border-[#4A5568] shadow-md min-w-[60%] text-center transform -translate-y-1 md:-translate-y-2">
                            <span className={`block text-[#F6E05E] font-black font-mono tracking-wide ${getOptionTextStyle(option)}`}>
                                {option}
                            </span>
                        </div>
                    </div>
                </div>
            </button>
          );
        })}
      </div>

      {/* On-screen Controls (Mobile) */}
      <div className="mt-2 md:mt-6 flex justify-center lg:hidden shrink-0">
        <div className="grid grid-cols-3 gap-2 w-48 md:w-56">
          <div></div>
          <button onClick={() => handleAnswer(currentQuestion.options[0])} disabled={isPaused} className="bg-gray-700 rounded-xl p-3 hover:bg-gray-600 active:bg-gray-800 shadow-lg border border-gray-600 disabled:opacity-50 active:scale-95 transition-transform"><ArrowIcon direction="up" className="w-5 h-5 md:w-6 md:h-6 mx-auto text-gray-300" /></button>
          <div></div>
          <button onClick={() => handleAnswer(currentQuestion.options[3])} disabled={isPaused} className="bg-gray-700 rounded-xl p-3 hover:bg-gray-600 active:bg-gray-800 shadow-lg border border-gray-600 disabled:opacity-50 active:scale-95 transition-transform"><ArrowIcon direction="left" className="w-5 h-5 md:w-6 md:h-6 mx-auto text-gray-300" /></button>
          <button onClick={() => handleAnswer(currentQuestion.options[2])} disabled={isPaused} className="bg-gray-700 rounded-xl p-3 hover:bg-gray-600 active:bg-gray-800 shadow-lg border border-gray-600 disabled:opacity-50 active:scale-95 transition-transform"><ArrowIcon direction="down" className="w-5 h-5 md:w-6 md:h-6 mx-auto text-gray-300" /></button>
          <button onClick={() => handleAnswer(currentQuestion.options[1])} disabled={isPaused} className="bg-gray-700 rounded-xl p-3 hover:bg-gray-600 active:bg-gray-800 shadow-lg border border-gray-600 disabled:opacity-50 active:scale-95 transition-transform"><ArrowIcon direction="right" className="w-5 h-5 md:w-6 md:h-6 mx-auto text-gray-300" /></button>
        </div>
      </div>
       <button onClick={onExit} className="mt-4 mx-auto block text-gray-400 hover:text-white font-bold underline opacity-80 hover:opacity-100 transition text-sm md:text-base">
          Exit to Main Menu
        </button>
    </div>
  );
};

export default GameScreen;
