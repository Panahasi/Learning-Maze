import React, { useState } from 'react';
import { GameMode, MathOperation, QuestionSet, MathQuestionSet, SpellingQuestionSet } from '../types';
import { generateMisspellings } from '../services/geminiService';

interface SetupScreenProps {
  mode: GameMode;
  questionSets: QuestionSet[];
  setQuestionSets: (sets: QuestionSet[]) => void;
  onExit: () => void;
}

const SetupScreen: React.FC<SetupScreenProps> = ({ mode, questionSets, setQuestionSets, onExit }) => {
  const [selectedSetId, setSelectedSetId] = useState<string | 'new'>('new');
  const [isGenerating, setIsGenerating] = useState(false);

  // Form state
  const [setName, setSetName] = useState('');
  
  // Math form state
  const [timesTables, setTimesTables] = useState<number[]>([]);
  const [operations, setOperations] = useState<MathOperation[]>([]);
  const [customEquations, setCustomEquations] = useState('');

  // Spelling form state
  const [wordList, setWordList] = useState('');
  const [spellingWords, setSpellingWords] = useState<{ correct: string; incorrect: string[] }[]>([]);

  const loadSetData = (id: string) => {
    const set = questionSets.find(s => s.id === id);
    if (!set || set.mode !== mode) return;

    setSetName(set.name);
    if (set.mode === GameMode.Math) {
      const mathSet = set as MathQuestionSet;
      setTimesTables(mathSet.timesTables);
      setOperations(mathSet.operations);
      setCustomEquations(mathSet.customEquations.map(eq => `${eq.question}=${eq.answer}`).join('\n'));
    } else {
      const spellingSet = set as SpellingQuestionSet;
      setSpellingWords(spellingSet.words);
      setWordList(spellingSet.words.map(w => w.correct).join('\n'));
    }
  };

  const handleSetSelection = (id: string) => {
    setSelectedSetId(id);
    if (id === 'new') {
      resetForm();
    } else {
      loadSetData(id);
    }
  };
  
  const resetForm = () => {
    setSetName('');
    setTimesTables([]);
    setOperations([]);
    setCustomEquations('');
    setWordList('');
    setSpellingWords([]);
  };

  const handleSaveSet = () => {
    if (!setName.trim()) {
      alert('Please enter a name for the question set.');
      return;
    }
    const id = selectedSetId === 'new' ? `custom-${Date.now()}` : selectedSetId;
    let newSet: QuestionSet;

    if (mode === GameMode.Math) {
      const parsedEquations = customEquations.split('\n').map(line => {
        const parts = line.split('=');
        const question = parts[0]?.trim();
        const answer = parseInt(parts[1]?.trim(), 10);
        return { question, answer };
      }).filter(eq => eq.question && !isNaN(eq.answer));

      newSet = { id, name: setName, mode: GameMode.Math, timesTables, operations, customEquations: parsedEquations } as MathQuestionSet;
    } else {
      if (spellingWords.length === 0 && wordList.trim() !== '') {
        alert('Please generate misspellings before saving.');
        return;
      }
      newSet = { id, name: setName, mode: GameMode.Spelling, words: spellingWords } as SpellingQuestionSet;
    }

    const otherSets = questionSets.filter(s => s.id !== id);
    setQuestionSets([...otherSets, newSet]);
    alert('Set saved successfully!');
    resetForm();
    setSelectedSetId('new');
  };

  const handleDeleteSet = () => {
    if (selectedSetId === 'new' || !window.confirm('Are you sure you want to delete this set?')) {
        return;
    }
    setQuestionSets(questionSets.filter(s => s.id !== selectedSetId));
    resetForm();
    setSelectedSetId('new');
  }

  const handleGenerateMisspellings = async () => {
    const words = wordList.split('\n').map(w => w.trim()).filter(Boolean);
    if (words.length === 0) {
      alert('Please enter at least one word.');
      return;
    }
    setIsGenerating(true);
    try {
        const newSpellingWords = await Promise.all(words.map(async (word) => {
            const misspellings = await generateMisspellings(word);
            return { correct: word, incorrect: misspellings };
        }));
        setSpellingWords(newSpellingWords);
    } catch (error) {
        console.error("Failed to generate misspellings:", error);
        alert("There was an error generating misspellings. Please try again.");
    } finally {
        setIsGenerating(false);
    }
  };
  
  const handleTimesTableToggle = (table: number) => {
    setTimesTables(prev => prev.includes(table) ? prev.filter(t => t !== table) : [...prev, table]);
  };
  
  const handleOperationToggle = (op: MathOperation) => {
    setOperations(prev => prev.includes(op) ? prev.filter(o => o !== op) : [...prev, op]);
  };


  const renderMathForm = () => (
    <>
      <div className="mb-4">
        <label className="block font-bold mb-2 text-gray-700">Times Tables (2-12)</label>
        <div className="grid grid-cols-6 gap-2">
            {[...Array(11)].map((_, i) => i + 2).map(table => (
                <button key={table} onClick={() => handleTimesTableToggle(table)} className={`p-2 rounded-lg font-semibold transition-all ${timesTables.includes(table) ? 'bg-blue-500 text-white shadow' : 'bg-gray-200 hover:bg-gray-300'}`}>
                    {table}x
                </button>
            ))}
        </div>
      </div>
      <div className="mb-4">
        <label className="block font-bold mb-2 text-gray-700">Operations</label>
        <div className="flex gap-2">
            {Object.values(MathOperation).map(op => (
                <button key={op} onClick={() => handleOperationToggle(op)} className={`p-2 rounded-lg w-12 text-xl font-bold transition-all ${operations.includes(op) ? 'bg-blue-500 text-white shadow' : 'bg-gray-200 hover:bg-gray-300'}`}>
                    {op}
                </button>
            ))}
        </div>
      </div>
      <div>
        <label className="block font-bold mb-2 text-gray-700">Custom Equations (e.g., 15 + 8 = 23)</label>
        <textarea value={customEquations} onChange={e => setCustomEquations(e.target.value)} rows={5} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400" placeholder="One equation per line..."></textarea>
      </div>
    </>
  );

  const renderSpellingForm = () => (
    <>
      <div className="mb-4">
        <label className="block font-bold mb-2 text-gray-700">Word List (one word per line)</label>
        <textarea value={wordList} onChange={e => setWordList(e.target.value)} rows={5} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-400" placeholder="beautiful\nbecause\nfriend..."></textarea>
      </div>
      <button onClick={handleGenerateMisspellings} disabled={isGenerating} className="bg-green-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-600 transition disabled:bg-gray-400">
        {isGenerating ? 'Generating with AI...' : 'Generate Misspellings'}
      </button>
      {spellingWords.length > 0 && <div className="mt-4 p-3 bg-gray-100 rounded-lg max-h-48 overflow-y-auto border">
        <h4 className="font-bold mb-2 text-gray-800">Generated Words:</h4>
        <ul className="space-y-1">
          {spellingWords.map(w => (
            <li key={w.correct} className="text-sm text-gray-700"><b className="text-black">{w.correct}</b>: {w.incorrect.join(', ')}</li>
          ))}
        </ul>
      </div>}
    </>
  );

  const setsForCurrentMode = questionSets.filter(s => s.mode === mode);

  return (
    <div className="p-6 bg-white rounded-2xl shadow-xl w-full max-w-2xl mx-auto border border-gray-200">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-black text-gray-800 tracking-tight">{mode} Mode Setup</h2>
        <button onClick={onExit} className="text-gray-400 hover:text-gray-800 text-2xl font-bold">&times;</button>
      </div>

      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <div className="md:col-span-1">
          <label className="block font-bold mb-2 text-gray-700">Load or Create</label>
          <select value={selectedSetId} onChange={e => handleSetSelection(e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400">
            <option value="new">-- Create New Set --</option>
            {setsForCurrentMode.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div className="md:col-span-2">
          <label className="block font-bold mb-2 text-gray-700">Set Name</label>
          <input type="text" value={setName} onChange={e => setSetName(e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400" placeholder="e.g., Week 1 Spelling"/>
        </div>
      </div>
      
      <div className="bg-gray-50 p-4 rounded-lg border">
        {mode === GameMode.Math ? renderMathForm() : renderSpellingForm()}
      </div>

      <div className="flex justify-between mt-6">
        <button onClick={handleSaveSet} className="bg-blue-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-600 transition shadow">
          Save Set
        </button>
        {selectedSetId !== 'new' && (
             <button onClick={handleDeleteSet} className="bg-red-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-red-600 transition shadow">
                Delete Set
            </button>
        )}
      </div>
    </div>
  );
};

export default SetupScreen;