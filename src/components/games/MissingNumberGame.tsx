import React, { useState } from 'react';
import { MultiplicationFact } from '../../types/game.ts';
import { sound } from '../../utils/audio.ts';
import { toEastern } from '../../utils/arabicNumerals.ts';

interface MissingNumberGameProps {
  fact: MultiplicationFact;
  onAnswer: (isCorrect: boolean, givenAnswer: number) => void;
}

export const MissingNumberGame: React.FC<MissingNumberGameProps> = ({ fact, onAnswer }) => {
  const [missingSlot] = useState<0 | 1>(() => (Math.random() > 0.5 ? 0 : 1));
  const [feedback, setFeedback] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const [selectedNum, setSelectedNum] = useState<number | null>(null);

  const missingTarget = missingSlot === 0 ? fact.factorA : fact.factorB;

  const options = React.useMemo(() => {
    const list = new Set<number>([missingTarget]);
    if (missingTarget > 1) list.add(missingTarget - 1);
    if (missingTarget < 10) list.add(missingTarget + 1);
    while (list.size < 4) {
      const rand = Math.floor(Math.random() * 10) + 1;
      list.add(rand);
    }
    return Array.from(list).sort(() => Math.random() - 0.5);
  }, [missingTarget]);

  const handlePick = (num: number) => {
    if (feedback !== 'idle') return;
    setSelectedNum(num);

    const isCorrect = num === missingTarget;
    if (isCorrect) {
      sound.playCorrect();
      setFeedback('correct');
      setTimeout(() => {
        onAnswer(true, num);
        setFeedback('idle');
        setSelectedNum(null);
      }, 700);
    } else {
      sound.playTryAgain();
      setFeedback('wrong');
      setTimeout(() => {
        onAnswer(false, num);
        setFeedback('idle');
        setSelectedNum(null);
      }, 850);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center max-w-lg mx-auto w-full p-4">
      {/* بطاقة السؤال */}
      <div className="w-full p-6 md:p-8 bg-white rounded-3xl border border-slate-200 shadow-xs text-center mb-6">
        <div className="text-xs sm:text-sm font-semibold text-slate-500 mb-2 uppercase tracking-wider">
          أوجد العدد المفقود في حقيقة الضرب
        </div>

        <div className="flex items-center justify-center gap-2.5 text-4xl md:text-5xl font-extrabold text-slate-900 my-3" dir="rtl">
          {missingSlot === 0 ? (
            <div className="min-w-[64px] h-14 md:h-16 px-3 border-2 border-dashed border-emerald-500 bg-emerald-50 text-emerald-700 rounded-2xl flex items-center justify-center font-bold font-sans">
              {feedback !== 'idle' && selectedNum !== null ? toEastern(selectedNum) : '؟'}
            </div>
          ) : (
            <span>{toEastern(fact.factorA)}</span>
          )}

          <span className="text-emerald-600">×</span>

          {missingSlot === 1 ? (
            <div className="min-w-[64px] h-14 md:h-16 px-3 border-2 border-dashed border-emerald-500 bg-emerald-50 text-emerald-700 rounded-2xl flex items-center justify-center font-bold font-sans">
              {feedback !== 'idle' && selectedNum !== null ? toEastern(selectedNum) : '؟'}
            </div>
          ) : (
            <span>{toEastern(fact.factorB)}</span>
          )}

          <span>=</span>
          <span>{toEastern(fact.product)}</span>
        </div>

        <div className="text-sm sm:text-base text-slate-600 font-medium">
          {missingSlot === 0
            ? `كم مجموعة في كل منها ${toEastern(fact.factorB)} تعطي حاصل ضرب ${toEastern(fact.product)}؟`
            : `${toEastern(fact.factorA)} مجموعات في كل منها كم عنصر ليكون الناتج ${toEastern(fact.product)}؟`}
        </div>
      </div>

      {/* 4 خيارات */}
      <div className="grid grid-cols-2 gap-3.5 w-full">
        {options.map((opt) => {
          const isSelected = selectedNum === opt;
          const isTarget = opt === missingTarget;

          let btnClass = 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50 hover:border-slate-300';
          if (isSelected) {
            if (feedback === 'correct') {
              btnClass = 'bg-emerald-600 border-emerald-600 text-white shadow-md scale-102';
            } else if (feedback === 'wrong') {
              btnClass = 'bg-rose-500 border-rose-500 text-white';
            }
          } else if (feedback === 'wrong' && isTarget) {
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
              aria-label={`العدد ${toEastern(opt)}`}
            >
              {toEastern(opt)}
            </button>
          );
        })}
      </div>
    </div>
  );
};
