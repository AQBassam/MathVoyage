import React, { useState, useEffect } from 'react';
import { MultiplicationFact } from '../../types/game.ts';
import { sound } from '../../utils/audio.ts';
import { toEastern } from '../../utils/arabicNumerals.ts';
import { Rocket, Timer, ShieldCheck } from 'lucide-react';

interface MultiplicationRaceGameProps {
  fact: MultiplicationFact;
  distractors: number[];
  currentStep: number;
  totalSteps: number;
  onAnswer: (isCorrect: boolean, givenAnswer: number) => void;
}

export const MultiplicationRaceGame: React.FC<MultiplicationRaceGameProps> = ({
  fact,
  distractors,
  currentStep,
  totalSteps,
  onAnswer,
}) => {
  const [useTimer, setUseTimer] = useState<boolean>(true);
  const [secondsLeft, setSecondsLeft] = useState<number>(15);
  const [feedback, setFeedback] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const [selectedNum, setSelectedNum] = useState<number | null>(null);

  useEffect(() => {
    if (!useTimer || feedback !== 'idle') return;
    setSecondsLeft(15);

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleAnswer(-1);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [fact, useTimer]);

  const options = React.useMemo(() => {
    const list = Array.from(new Set([fact.product, ...distractors]));
    return list.sort(() => Math.random() - 0.5);
  }, [fact, distractors]);

  const handleAnswer = (ans: number) => {
    if (feedback !== 'idle') return;
    setSelectedNum(ans);

    const isCorrect = ans === fact.product;
    if (isCorrect) {
      sound.playCorrect();
      setFeedback('correct');
      setTimeout(() => {
        onAnswer(true, ans);
        setFeedback('idle');
        setSelectedNum(null);
      }, 650);
    } else {
      sound.playTryAgain();
      setFeedback('wrong');
      setTimeout(() => {
        onAnswer(false, ans);
        setFeedback('idle');
        setSelectedNum(null);
      }, 800);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center max-w-lg mx-auto w-full p-4">
      {/* شريط تقدم سباق الصاروخ */}
      <div className="w-full bg-slate-900 rounded-3xl p-4.5 mb-5 text-white shadow-md relative overflow-hidden">
        <div className="flex items-center justify-between text-xs text-slate-300 mb-2">
          <div className="flex items-center gap-1.5 font-bold">
            <Rocket className="w-4 h-4 text-amber-400 -scale-x-100" />
            <span>سباق الصاروخ: كوكب الرياضيات</span>
          </div>

          <button
            type="button"
            onClick={() => setUseTimer(!useTimer)}
            className="text-[11px] font-bold px-2.5 py-1 rounded-xl bg-slate-800 text-slate-300 hover:text-white flex items-center gap-1 cursor-pointer"
          >
            {useTimer ? <Timer className="w-3 h-3 text-emerald-400" /> : <ShieldCheck className="w-3 h-3 text-sky-400" />}
            <span className="font-sans">{useTimer ? `${toEastern(secondsLeft)} ثانية (انقر للوضع الهادئ)` : 'وضع هادئ (بدون وقت)'}</span>
          </button>
        </div>

        {/* مسار السباق بتوجيه عربي أصيل (الانطلاق من اليمين نحو كوكب الهدف في أقصى اليسار) */}
        <div className="relative h-6 bg-slate-800 rounded-full flex items-center px-2 overflow-hidden border border-slate-700" dir="rtl">
          <div
            className="absolute right-0 top-0 bottom-0 bg-linear-to-l from-emerald-500 to-teal-400 transition-all duration-500 rounded-full"
            style={{ width: `${Math.min(100, (currentStep / totalSteps) * 100)}%` }}
          />

          <div
            className="absolute transition-all duration-500 flex items-center justify-center -mr-3"
            style={{ right: `${Math.min(94, Math.max(6, (currentStep / totalSteps) * 100))}%` }}
          >
            <span className="text-xl">🚀</span>
          </div>

          <div className="absolute left-2 text-xs font-bold text-amber-300">🪐</div>
        </div>

        <div className="flex justify-between items-center text-xs text-slate-400 mt-2 font-medium font-sans">
          <span>الانطلاق 🚀</span>
          <span>المحطة {toEastern(currentStep)} من {toEastern(totalSteps)}</span>
          <span>الهدف 🪐</span>
        </div>
      </div>

      {/* بطاقة السؤال */}
      <div className="w-full p-6 bg-white rounded-3xl border border-slate-200 shadow-xs text-center mb-6">
        <div className="text-xs sm:text-sm font-semibold text-slate-500 mb-1 uppercase tracking-wider">
          وقود الصاروخ: حاصل الضرب
        </div>

        <div className="text-4xl md:text-5xl font-extrabold text-slate-900 font-sans my-2" dir="rtl">
          {toEastern(fact.factorA)} × {toEastern(fact.factorB)} = <span className="text-emerald-600 font-bold">؟</span>
        </div>
      </div>

      {/* الخيارات */}
      <div className="grid grid-cols-2 gap-3.5 w-full">
        {options.map((opt) => {
          const isSelected = selectedNum === opt;
          const isTarget = opt === fact.product;

          let btnClass = 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50 hover:border-slate-300';
          if (isSelected) {
            if (feedback === 'correct') {
              btnClass = 'bg-emerald-600 border-emerald-600 text-white shadow-md scale-102';
            } else if (feedback === 'wrong') {
              btnClass = 'bg-rose-500 border-rose-500 text-white';
            }
          } else if (feedback === 'wrong' && isTarget) {
            btnClass = 'bg-emerald-50 border-emerald-400 text-emerald-800';
          }

          return (
            <button
              key={opt}
              type="button"
              disabled={feedback !== 'idle'}
              onClick={() => {
                sound.playClick();
                handleAnswer(opt);
              }}
              className={`h-20 rounded-2xl border-2 text-3xl font-bold font-sans transition-all flex items-center justify-center cursor-pointer shadow-xs active:scale-95 disabled:cursor-default ${btnClass}`}
            >
              {toEastern(opt)}
            </button>
          );
        })}
      </div>
    </div>
  );
};
