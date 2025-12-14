import { GameMode, MathOperation, Question, MathQuestionSet, SpellingQuestionSet, QuestionSet, MathQuestion, SpellingQuestion } from '../types';
import { TOTAL_ROOMS } from '../constants';

// Utility to shuffle an array
const shuffleArray = <T,>(array: T[]): T[] => {
  return [...array].sort(() => Math.random() - 0.5);
};

// --- Math Question Generation ---
const generateMathQuestion = (operations: MathOperation[]): MathQuestion => {
  const difficulty = 2; // Corresponds to former 'Medium' difficulty
  const operation = operations[Math.floor(Math.random() * operations.length)];
  let num1: number, num2: number, question: string, correctAnswer: number;

  const maxNum = 10 + difficulty * 5;

  switch (operation) {
    case MathOperation.Addition:
      num1 = Math.floor(Math.random() * maxNum) + 1;
      num2 = Math.floor(Math.random() * maxNum) + 1;
      correctAnswer = num1 + num2;
      question = `${num1} + ${num2} = ?`;
      break;
    case MathOperation.Subtraction:
      num1 = Math.floor(Math.random() * maxNum) + 1;
      num2 = Math.floor(Math.random() * num1) + 1; // Ensure positive result
      correctAnswer = num1 - num2;
      question = `${num1} - ${num2} = ?`;
      break;
    case MathOperation.Multiplication:
      num1 = Math.floor(Math.random() * (10 + difficulty)) + 2;
      num2 = Math.floor(Math.random() * 10) + 1;
      correctAnswer = num1 * num2;
      question = `${num1} x ${num2} = ?`;
      break;
    case MathOperation.Division:
      num2 = Math.floor(Math.random() * 9) + 2; // Divisor
      const res = Math.floor(Math.random() * (9 + difficulty)) + 1;
      num1 = num2 * res; // Dividend
      correctAnswer = res;
      question = `${num1} ÷ ${num2} = ?`;
      break;
    case MathOperation.Exponentiation:
      num1 = Math.floor(Math.random() * 4) + 2; // Base (2 to 5)
      num2 = Math.floor(Math.random() * 2) + 2; // Exponent (2 to 3)
      correctAnswer = Math.pow(num1, num2);
      question = `${num1}^${num2} = ?`;
      break;
    case MathOperation.SquareRoot:
      num2 = Math.floor(Math.random() * 11) + 2; // Result (2 to 12)
      num1 = num2 * num2; // The number under the root
      correctAnswer = num2;
      question = `√${num1} = ?`;
      break;
    default:
      throw new Error("Invalid math operation");
  }

  const options = generateMathOptions(correctAnswer, maxNum * (operation === MathOperation.Multiplication ? 10 : 2));
  return { type: 'math', question, correctAnswer, options };
};

const generateMathOptions = (correctAnswer: number, max: number): number[] => {
  const options = new Set<number>([correctAnswer]);
  while (options.size < 4) {
    const wrongAnswer = correctAnswer + (Math.floor(Math.random() * 10) - 5);
    if (wrongAnswer !== correctAnswer && wrongAnswer > 0) {
      options.add(wrongAnswer);
    }
  }
  return shuffleArray(Array.from(options));
};


// --- Spelling Question Generation ---
const generateSpellingQuestion = (wordData: { correct: string; incorrect: string[] }): SpellingQuestion => {
  const { correct, incorrect } = wordData;
  const options = shuffleArray([correct, ...incorrect.slice(0, 3)]);
  return { type: 'spelling', question: `Which is the correct spelling?`, correctAnswer: correct, options };
};

// --- Main Question Generation Logic ---
export const generateQuestionsForGame = (set: QuestionSet): Question[] => {
  const questions: Question[] = [];
  
  if (set.mode === GameMode.Math) {
    const mathSet = set as MathQuestionSet;
    const availableProblems: { question: string; answer: number }[] = [...mathSet.customEquations];
    
    // Add times tables
    mathSet.timesTables.forEach(table => {
      for (let i = 1; i <= 12; i++) {
        availableProblems.push({ question: `${table} x ${i} = ?`, answer: table * i });
      }
    });

    // Add random operations if specified and not enough problems
    if (availableProblems.length < TOTAL_ROOMS && mathSet.operations.length > 0) {
        while(availableProblems.length < TOTAL_ROOMS * 2) { // generate more to pick from
            const q = generateMathQuestion(mathSet.operations);
            availableProblems.push({question: q.question, answer: q.correctAnswer});
        }
    }

    if (availableProblems.length === 0) { // Fallback if no questions configured
        for(let i = 0; i<TOTAL_ROOMS; i++){
            questions.push(generateMathQuestion([MathOperation.Addition, MathOperation.Multiplication]));
        }
        return questions;
    }

    const shuffledProblems = shuffleArray(availableProblems);
    for (let i = 0; i < TOTAL_ROOMS; i++) {
        const problem = shuffledProblems[i % shuffledProblems.length];
        questions.push({
            type: 'math',
            question: problem.question,
            correctAnswer: problem.answer,
            options: generateMathOptions(problem.answer, 100)
        });
    }

  } else if (set.mode === GameMode.Spelling) {
    const spellingSet = set as SpellingQuestionSet;
    if (spellingSet.words.length === 0) {
        // Fallback with default words
        const defaultWords = [
            {correct: 'beautiful', incorrect: ['beutiful', 'beatiful', 'beauitful']},
            {correct: 'because', incorrect: ['becuase', 'becasue', 'becouse']},
        ];
        for(let i = 0; i < TOTAL_ROOMS; i++) {
            questions.push(generateSpellingQuestion(defaultWords[i % defaultWords.length]));
        }
        return questions;
    }
    const shuffledWords = shuffleArray(spellingSet.words);
    for (let i = 0; i < TOTAL_ROOMS; i++) {
        const wordData = shuffledWords[i % shuffledWords.length];
        questions.push(generateSpellingQuestion(wordData));
    }
  }

  return questions;
};

// --- Default Question Sets ---
export const getDefaultQuestionSets = (): QuestionSet[] => [
    {
        id: 'math-default-easy',
        name: 'Easy Math Mix',
        mode: GameMode.Math,
        timesTables: [2, 5, 10],
        operations: [MathOperation.Addition, MathOperation.Subtraction],
        customEquations: []
    },
    {
        id: 'spelling-default-easy',
        name: 'Common Words',
        mode: GameMode.Spelling,
        words: [
            {correct: 'friend', incorrect: ['freind', 'frend', 'frind']},
            {correct: 'accommodate', incorrect: ['acommodate', 'accomodate', 'acomodate']},
            {correct: 'which', incorrect: ['wich', 'whitch', 'whihc']},
            {correct: 'believe', incorrect: ['beleive', 'belive', 'beleev']},
            {correct: 'separate', incorrect: ['seperate', 'seprate', 'separat']},
            {correct: 'necessary', incorrect: ['neccessary', 'necesary', 'nessasary']},
            {correct: 'tomorrow', incorrect: ['tommorow', 'tomorow', 'tommorrow']},
            {correct: 'business', incorrect: ['buisness', 'busness', 'businiss']},
            {correct: 'receive', incorrect: ['recieve', 'receeve', 'reseive']},
            {correct: 'government', incorrect: ['goverment', 'governmint', 'guvernment']},
        ]
    }
];