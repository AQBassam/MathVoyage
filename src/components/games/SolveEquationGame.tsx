import React, { useState } from 'react';
import { MultiplicationFact } from '../../types/game.ts';
import { Keypad } from '../Keypad.tsx';
import { VisualGroupModel } from '../VisualGroupModel.tsx';
import { sound } from '../../utils/audio.ts';
import { toEastern, toWestern } from '../../utils/arabicNumerals.ts';
import { Eye, EyeOff } from 'lucide-react';

interface SolveEquationGameProps {
  fact: MultiplicationFact;
  onAnswer: (isCorrect: boolean, givenAnswer: number) => void;
}

export const SolveEquationGame: React.FC<SolveEquationGameProps> = ({ fact, onAnswer }) => {
  const [input, setInput] = useState<string>('');
  const [showHint, setShowHint] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<'idle' | 'correct' | 'wrong'>('idle');

  const handleSubmit = () => {
    const val = parseInt(toWestern(input), 10);
    if (isNaN(val)) return;

    const isCorrect = val === fact.product;
    if (isCorrect) {
      sound.playCorrect();
      setFeedback('correct');
      setTimeout(() => {
        onAnswer(true, val);
        setInput('');
        setFeedback('idle');
        setShowHint(false);
      }, 700);
    } else {
      sound.playTryAgain();
      setFeedback('wrong');
      setTimeout(() => {
        onAnswer(false, val);
        setInput('');
        setFeedback('idle');
      }, 800);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center max-w-lg mx-auto w-full p-4">
      {/* بطاقة جملة الضرب الكبيرة */}
      <div
        className={`w-full p-6 md:p-8 rounded-3xl border transition-all text-center mb-6 shadow-xs ${
          feedback === 'correct'
            ? 'bg-emerald-50 border-emerald-400 scale-102'
            : feedback === 'wrong'
            ? 'bg-rose-50 border-rose-400 shake'
            : 'bg-white border-slate-200'
        }`}
      >
        <div className="text-xs sm:text-sm font-semibold text-slate-500 mb-2 uppercase tracking-wider">
          أوجد حاصل الضرب
        </div>

        <div className="flex items-center justify-center gap-3 text-4xl md:text-5xl font-extrabold text-slate-900 my-2" dir="rtl">
          <span>{toEastern(fact.factorA)}</span>
          <span className="text-emerald-600">×</span>
          <span>{toEastern(fact.factorB)}</span>
          <span>=</span>
          <div
            className={`min-w-[70px] h-14 md:h-16 px-3 border-2 rounded-2xl flex items-center justify-center text-3xl md:text-4xl font-sans ${
              input
                ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50 font-bold'
                : 'border-dashed border-slate-300 text-slate-400 font-normal'
            }`}
          >
            {input ? toEastern(input) : '؟'}
          </div>
        </div>

        {/* زر التلميح البصري */}
        <div className="mt-4">
          <button
            type="button"
            onClick={() => setShowHint(!showHint)}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3.5 py-1.5 rounded-xl transition-colors cursor-pointer"
          >
            {showHint ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span>{showHint ? 'إخفاء الرسم التوضيحي' : 'إظهار الرسم التوضيحي'}</span>
          </button>
        </div>

        {/* التمثيل البصري الموسع عند الطلب */}
        {showHint && (
          <div className="mt-4 animate-in fade-in duration-200">
            <VisualGroupModel
              factorA={fact.factorA}
              factorB={fact.factorB}
              mode="groups"
              showEquation={false}
              className="py-3 bg-white"
            />
          </div>
        )}
      </div>

      {/* لوحة الأرقام اللمسية */}
      <Keypad
        value={input}
        onChange={setInput}
        onSubmit={handleSubmit}
        disabled={feedback !== 'idle'}
      />
    </div>
  );
};
