import React, { useState, useEffect } from 'react';
import { MultiplicationFact } from '../../types/game.ts';
import { sound } from '../../utils/audio.ts';
import { toEastern } from '../../utils/arabicNumerals.ts';
import { Sparkles, Trophy } from 'lucide-react';

interface MultiplicationBingoGameProps {
  factsPool: MultiplicationFact[];
  onComplete: () => void;
}

export const MultiplicationBingoGame: React.FC<MultiplicationBingoGameProps> = ({
  factsPool,
  onComplete,
}) => {
  const [board, setBoard] = useState<number[]>([]);
  const [stampedIndices, setStampedIndices] = useState<number[]>([]);
  const [currentCallIdx, setCurrentCallIdx] = useState<number>(0);
  const [wrongIdx, setWrongIdx] = useState<number | null>(null);

  const [calls, setCalls] = useState<MultiplicationFact[]>([]);

  useEffect(() => {
    const available = [...factsPool].sort(() => Math.random() - 0.5);
    const chosen = available.slice(0, 9);
    setCalls(chosen);
    setBoard(chosen.map((f) => f.product).sort(() => Math.random() - 0.5));
    setStampedIndices([]);
    setCurrentCallIdx(0);
  }, [factsPool]);

  const currentFact = calls[currentCallIdx] || calls[0];

  const checkBingo = (stamps: number[]) => {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];

    return lines.some((line) => line.every((idx) => stamps.includes(idx)));
  };

  const handleStamp = (cellIdx: number) => {
    if (stampedIndices.includes(cellIdx)) return;

    const cellVal = board[cellIdx];
    if (cellVal === currentFact.product) {
      sound.playCorrect();
      const nextStamps = [...stampedIndices, cellIdx];
      setStampedIndices(nextStamps);

      if (checkBingo(nextStamps) || nextStamps.length >= 6) {
        sound.playCelebration();
        setTimeout(() => {
          onComplete();
        }, 900);
      } else {
        setTimeout(() => {
          setCurrentCallIdx((prev) => (prev + 1) % calls.length);
        }, 400);
      }
    } else {
      sound.playTryAgain();
      setWrongIdx(cellIdx);
      setTimeout(() => setWrongIdx(null), 800);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center max-w-lg mx-auto w-full p-4">
      <div className="text-center mb-3">
        <h3 className="text-xl font-black text-slate-900 flex items-center justify-center gap-2">
          <Trophy className="w-5 h-5 text-amber-500" />
          <span>بينجو جدول الضرب</span>
        </h3>
        <p className="text-xs text-slate-600 mt-1 font-bold">
          اختم حاصل الضرب المطلوب على بطاقتك لتكوين خط فائز!
        </p>
      </div>

      {/* صندوق النداء الحالي */}
      {currentFact && (
        <div className="w-full p-4 bg-emerald-50 border-2 border-emerald-300 rounded-3xl text-center mb-5 shadow-xs">
          <div className="text-xs sm:text-sm font-semibold text-emerald-800 uppercase tracking-wider">
            المسألة الحالية للبحث عنها
          </div>
          <div className="text-3xl md:text-4xl font-extrabold text-emerald-950 font-sans my-1" dir="rtl">
            {toEastern(currentFact.factorA)} × {toEastern(currentFact.factorB)} = <span className="text-emerald-700 font-bold">؟</span>
          </div>
          <div className="text-xs sm:text-sm text-emerald-800 font-medium">
            ابحث عن حاصل الضرب في بطاقتك أدناه واختمه الآن!
          </div>
        </div>
      )}

      {/* بطاقة 3x3 */}
      <div className="grid grid-cols-3 gap-3 p-4 bg-white border border-slate-200 rounded-3xl shadow-sm w-full max-w-xs">
        {board.map((num, idx) => {
          const isStamped = stampedIndices.includes(idx);
          const isWrong = wrongIdx === idx;

          let cardClass = 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100 hover:border-slate-300';
          if (isStamped) {
            cardClass = 'bg-amber-100 border-amber-400 text-amber-900 font-bold scale-102';
          } else if (isWrong) {
            cardClass = 'bg-rose-50 border-rose-400 text-rose-800 shake';
          }

          return (
            <button
              key={idx}
              type="button"
              disabled={isStamped}
              onClick={() => handleStamp(idx)}
              className={`h-20 rounded-2xl border-2 font-bold text-2xl font-sans flex flex-col items-center justify-center transition-all cursor-pointer shadow-xs active:scale-95 disabled:cursor-default ${cardClass}`}
            >
              <span>{toEastern(num)}</span>
              {isStamped && (
                <span className="text-xs text-amber-700 flex items-center gap-0.5 font-semibold">
                  <Sparkles className="w-3 h-3 fill-amber-400" /> ختم
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
