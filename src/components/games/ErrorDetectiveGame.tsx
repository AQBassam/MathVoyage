import React, { useState, useEffect } from 'react';
import { MultiplicationFact } from '../../types/game.ts';
import { sound } from '../../utils/audio.ts';
import { toEastern } from '../../utils/arabicNumerals.ts';
import { Search, CheckCircle, AlertTriangle } from 'lucide-react';

interface DetectiveQuestion {
  factorA: number;
  factorB: number;
  shownProduct: number;
  isBugged: boolean;
  trueProduct: number;
}

interface ErrorDetectiveGameProps {
  factsPool: MultiplicationFact[];
  onAnswer: (isCorrect: boolean) => void;
}

export const ErrorDetectiveGame: React.FC<ErrorDetectiveGameProps> = ({ factsPool, onAnswer }) => {
  const [items, setItems] = useState<DetectiveQuestion[]>([]);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<'idle' | 'correct' | 'wrong'>('idle');

  useEffect(() => {
    const chosen = [...factsPool].sort(() => Math.random() - 0.5).slice(0, 3);
    const bugIdx = Math.floor(Math.random() * 3);

    const questions: DetectiveQuestion[] = chosen.map((f, idx) => {
      if (idx === bugIdx) {
        const offset = Math.random() > 0.5 ? f.factorA : -f.factorB;
        let fake = f.product + (offset !== 0 ? offset : 3);
        if (fake <= 0) fake = f.product + 5;
        return {
          factorA: f.factorA,
          factorB: f.factorB,
          shownProduct: fake,
          isBugged: true,
          trueProduct: f.product,
        };
      }
      return {
        factorA: f.factorA,
        factorB: f.factorB,
        shownProduct: f.product,
        isBugged: false,
        trueProduct: f.product,
      };
    });

    setItems(questions);
    setSelectedIdx(null);
    setFeedback('idle');
  }, [factsPool]);

  const handlePick = (idx: number) => {
    if (feedback !== 'idle') return;
    setSelectedIdx(idx);

    const target = items[idx];
    if (target.isBugged) {
      sound.playCorrect();
      setFeedback('correct');
      setTimeout(() => {
        onAnswer(true);
        setFeedback('idle');
        setSelectedIdx(null);
      }, 750);
    } else {
      sound.playTryAgain();
      setFeedback('wrong');
      setTimeout(() => {
        onAnswer(false);
        setFeedback('idle');
        setSelectedIdx(null);
      }, 900);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center max-w-lg mx-auto w-full p-4">
      <div className="text-center mb-6">
        <h3 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center justify-center gap-2">
          <Search className="w-5 h-5 text-indigo-600" />
          <span>محقق الرياضيات الذكي: اكتشف الخطأ!</span>
        </h3>
        <p className="text-xs sm:text-sm text-slate-600 mt-1 font-normal leading-relaxed">
          اثنتان من هذه الجمل صحيحة تماماً، ولكن توجد جملة واحدة بها خطأ خفي. انقر على الخطأ لتصلحه!
        </p>
      </div>

      <div className="flex flex-col gap-3.5 w-full">
        {items.map((item, idx) => {
          const isSelected = selectedIdx === idx;

          let cardStyle = 'bg-white border-slate-200 text-slate-900 hover:border-slate-300 hover:bg-slate-50';
          if (isSelected) {
            if (feedback === 'correct') {
              cardStyle = 'bg-emerald-50 border-emerald-500 text-emerald-950 ring-2 ring-emerald-500/20';
            } else if (feedback === 'wrong') {
              cardStyle = 'bg-rose-50 border-rose-400 text-rose-950 shake';
            }
          }

          return (
            <button
              key={idx}
              type="button"
              disabled={feedback !== 'idle'}
              onClick={() => {
                sound.playClick();
                handlePick(idx);
              }}
              className={`p-5 rounded-3xl border-2 flex items-center justify-between transition-all cursor-pointer shadow-xs active:scale-98 disabled:cursor-default ${cardStyle}`}
            >
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs sm:text-sm font-bold text-slate-700 font-sans">
                  {toEastern(idx + 1)}
                </span>
                <span className="text-2xl sm:text-3xl font-bold font-sans" dir="rtl">
                  {toEastern(item.factorA)} × {toEastern(item.factorB)} = {toEastern(item.shownProduct)}
                </span>
              </div>

              {isSelected && feedback === 'correct' && (
                <div className="flex items-center gap-1 text-emerald-700 text-xs sm:text-sm font-semibold">
                  <CheckCircle className="w-4 h-4" />
                  <span>أحسنت! هذا هو الخطأ</span>
                </div>
              )}

              {isSelected && feedback === 'wrong' && (
                <div className="flex items-center gap-1 text-rose-600 text-xs sm:text-sm font-semibold">
                  <AlertTriangle className="w-4 h-4" />
                  <span>هذه الجملة صحيحة!</span>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
