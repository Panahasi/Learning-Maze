
export enum GameMode {
  Math = 'Math',
  Spelling = 'Spelling',
}

export enum MathOperation {
  Addition = '+',
  Subtraction = '-',
  Multiplication = 'x',
  Division = '÷',
  Exponentiation = '^',
  SquareRoot = '√',
}

export interface MathQuestion {
  type: 'math';
  question: string;
  correctAnswer: number;
  options: number[];
}

export interface SpellingQuestion {
  type: 'spelling';
  question: string; // The correctly spelled word
  correctAnswer: string;
  options: string[]; // Includes the correct word and misspellings
}

export type Question = MathQuestion | SpellingQuestion;

export interface Result {
  question: Question;
  userAnswer: string | number;
  isCorrect: boolean;
}

export interface User {
  id: string;
  name:string;
  role: 'student' | 'teacher';
  password?: string;
  email?: string;
}

export interface GameSession {
    id: string;
    date: string;
    setName: string;
    mode: GameMode;
    results: Result[];
    score: number;
    time: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: 'trophy' | 'star' | 'medal' | 'fire' | 'lightning' | 'scroll';
}

interface BaseQuestionSet {
  id: string;
  name: string;
  mode: GameMode;
  countdownSeconds?: number;
  requireCorrectAnswer?: boolean;
}

export interface MathQuestionSet extends BaseQuestionSet {
  mode: GameMode.Math;
  timesTables: number[];
  operations: MathOperation[];
  customEquations: { question: string; answer: number }[];
}

export interface SpellingQuestionSet extends BaseQuestionSet {
  mode: GameMode.Spelling;
  words: { correct: string; incorrect: string[] }[];
}

export type QuestionSet = MathQuestionSet | SpellingQuestionSet;