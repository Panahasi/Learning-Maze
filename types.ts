export enum GameMode {
  Math = 'Math',
  Spelling = 'Spelling',
}

export enum MathOperation {
  Addition = '+',
  Subtraction = '-',
  Multiplication = 'x',
  Division = '÷',
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

interface BaseQuestionSet {
  id: string;
  name: string;
  mode: GameMode;
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