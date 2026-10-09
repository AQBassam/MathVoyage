import React, { useState } from 'react';
import { MultiplicationFact } from '../../types/game.ts';
import { sound } from '../../utils/audio.ts';
import { toEastern } from '../../utils/arabicNumerals.ts';

interface ChooseAnswerGameProps {
  fact: MultiplicationFact;
  distractors: number[];
  onAnswer: (isCorrect: boolean, givenAnswer: number) => void;
}

export const ChooseAnswerGame: React.FC<ChooseAnswerGameProps> = ({
  fact,
  distractors,
  onAnswer,
}) => {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<'idle' | 'correct' | 'wrong'>('idle');

  const options = React.useMemo(() => {
    const list = Array.from(new Set([fact.product, ...distractors]));
    return list.sort(() => Math.random() - 0.5);
  }, [fact, distractors]);

  const handlePick = (ans: number) => {
    if (feedback !== 'idle') return;
    setSelectedAnswer(ans);

    const isCorrect = ans === fact.product;
    if (isCorrect) {
      sound.playCorrect();
      setFeedback('correct');
      setTimeout(() => {
        onAnswer(true, ans);
        setFeedback('idle');
        setSelectedAnswer(null);
      }, 700);
    } else {
      sound.playTryAgain();
      setFeedback('wrong');
      setTimeout(() => {
        onAnswer(false, ans);
        setFeedback('idle');
        setSelectedAnswer(null);
      }, 850);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center max-w-lg mx-auto w-full p-4">
      {/* بطاقة السؤال */}
      <div className="w-full p-6 md:p-8 bg-white rounded-3xl border border-slate-200 shadow-xs text-center mb-6">
        <div className="text-xs sm:text-sm font-semibold text-slate-500 mb-2 uppercase tracking-wider">
          اختر حاصل الضرب الصحيح
        </div>

        <div className="text-4xl md:text-5xl font-extrabold text-slate-900 my-3" dir="rtl">
          {toEastern(fact.factorA)} × {toEastern(fact.factorB)} = <span className="text-emerald-600 font-bold">؟</span>
        </div>

        <div className="text-sm sm:text-base text-slate-600 font-medium">
          أي عدد يمثل حاصل ضرب {toEastern(fact.factorA)} في {toEastern(fact.factorB)}؟
        </div>
      </div>

      {/* شبكة الخيارات الأربعة */}
      <div className="grid grid-cols-2 gap-3.5 w-full">
        {options.map((opt) => {
          const isSelected = selectedAnswer === opt;
          const isTargetCorrect = opt === fact.product;

          let btnClass = 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50 hover:border-slate-300';
          if (isSelected) {
            if (feedback === 'correct') {
              btnClass = 'bg-emerald-600 border-emerald-600 text-white shadow-md scale-102';
            } else if (feedback === 'wrong') {
              btnClass = 'bg-rose-500 border-rose-500 text-white';
            }
          } else if (feedback === 'wrong' && isTargetCorrect) {
            btnClass = 'bg-emerald-50 border-emerald-400 text-emerald-800 ring-2 ring-emerald-500/30';
          }

          return (
            <button
              key={opt}
              type="button"
              disabled={feedback !== 'idle'}
              onClick={() => {
                sound.playClick();
                handlePick(opt);
              }}
              className={`h-20 rounded-2xl border-2 text-3xl font-bold font-sans transition-all flex items-center justify-center cursor-pointer shadow-xs active:scale-95 disabled:cursor-default ${btnClass}`}
              aria-label={`الخيار ${toEastern(opt)}`}
            >
              {toEastern(opt)}
            </button>
          );
        })}
      </div>
    </div>
  );
};
