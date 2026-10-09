import React, { useState } from 'react';
import { MultiplicationFact } from '../../types/game.ts';
import { sound } from '../../utils/audio.ts';
import { toEastern } from '../../utils/arabicNumerals.ts';
import { Check, X } from 'lucide-react';

interface TrueFalseGameProps {
  fact: MultiplicationFact;
  onAnswer: (isCorrect: boolean, givenAnswer: number) => void;
}

export const TrueFalseGame: React.FC<TrueFalseGameProps> = ({ fact, onAnswer }) => {
  const [statement] = useState<{ shownProduct: number; isTrue: boolean }>(() => {
    const isTrue = Math.random() > 0.5;
    if (isTrue) {
      return { shownProduct: fact.product, isTrue: true };
    }
    const offset = Math.random() > 0.5 ? fact.factorA : -fact.factorB;
    let falseProduct = fact.product + (offset !== 0 ? offset : 2);
    if (falseProduct <= 0) falseProduct = fact.product + 4;
    return { shownProduct: falseProduct, isTrue: false };
  });

  const [feedback, setFeedback] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const [picked, setPicked] = useState<boolean | null>(null);

  const handlePick = (choice: boolean) => {
    if (feedback !== 'idle') return;
    setPicked(choice);

    const isCorrect = choice === statement.isTrue;
    if (isCorrect) {
      sound.playCorrect();
      setFeedback('correct');
      setTimeout(() => {
        onAnswer(true, statement.shownProduct);
        setFeedback('idle');
        setPicked(null);
      }, 700);
    } else {
      sound.playTryAgain();
      setFeedback('wrong');
      setTimeout(() => {
        onAnswer(false, statement.shownProduct);
        setFeedback('idle');
        setPicked(null);
      }, 850);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center max-w-lg mx-auto w-full p-4">
      {/* بطاقة العبارة الرياضية */}
      <div className="w-full p-6 md:p-8 bg-white rounded-3xl border border-slate-200 shadow-xs text-center mb-6">
        <div className="text-xs sm:text-sm font-semibold text-slate-500 mb-2 uppercase tracking-wider">
          صواب أم خطأ؟
        </div>

        <div className="text-4xl md:text-5xl font-extrabold text-slate-900 font-sans my-3" dir="rtl">
          {toEastern(fact.factorA)} × {toEastern(fact.factorB)} = {toEastern(statement.shownProduct)}
        </div>

        <div className="text-sm sm:text-base text-slate-600 font-medium">
          هل جملة الضرب الرياضية هذه صواب أم خطأ؟
        </div>
      </div>

      {/* زرا صواب وخطأ */}
      <div className="grid grid-cols-2 gap-4 w-full">
        {/* زر صواب */}
        <button
          type="button"
          disabled={feedback !== 'idle'}
          onClick={() => {
            sound.playClick();
            handlePick(true);
          }}
          className={`h-24 rounded-3xl border-2 font-bold text-xl sm:text-2xl transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer active:scale-95 disabled:cursor-default shadow-xs ${
            picked === true
              ? feedback === 'correct'
                ? 'bg-emerald-600 border-emerald-600 text-white'
                : 'bg-rose-500 border-rose-500 text-white'
              : 'bg-white border-emerald-200 text-emerald-800 hover:bg-emerald-50'
          }`}
        >
          <Check className="w-8 h-8" />
          <span>صواب</span>
        </button>

        {/* زر خطأ */}
        <button
          type="button"
          disabled={feedback !== 'idle'}
          onClick={() => {
            sound.playClick();
            handlePick(false);
          }}
          className={`h-24 rounded-3xl border-2 font-bold text-xl sm:text-2xl transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer active:scale-95 disabled:cursor-default shadow-xs ${
            picked === false
              ? feedback === 'correct'
                ? 'bg-emerald-600 border-emerald-600 text-white'
                : 'bg-rose-500 border-rose-500 text-white'
              : 'bg-white border-rose-200 text-rose-800 hover:bg-rose-50'
          }`}
        >
          <X className="w-8 h-8" />
          <span>خطأ</span>
        </button>
      </div>
    </div>
  );
};
