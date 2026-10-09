import React, { useState, useEffect, useRef } from 'react';
import { MultiplicationFact } from '../../types/game.ts';
import { sound } from '../../utils/audio.ts';
import { toEastern } from '../../utils/arabicNumerals.ts';
import { Timer, Zap, Sparkles, Heart, Flame, ShieldAlert, Award } from 'lucide-react';

interface TimeChallengeGameProps {
  fact: MultiplicationFact;
  distractors: number[];
  questionIndex: number;
  totalQuestions: number;
  timePerQuestion?: number; // In seconds, default 12s
  onAnswer: (isCorrect: boolean, givenAnswer: number, timeSpentSeconds: number) => void;
  onTimeExpired: (givenAnswer: number) => void;
}

export const TimeChallengeGame: React.FC<TimeChallengeGameProps> = ({
  fact,
  distractors,
  questionIndex,
  totalQuestions,
  timePerQuestion = 12,
  onAnswer,
  onTimeExpired,
}) => {
  const [timeLeft, setTimeLeft] = useState<number>(timePerQuestion);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<'idle' | 'correct' | 'wrong' | 'timeout'>('idle');
  const [timeMode, setTimeMode] = useState<'relaxed' | 'standard' | 'turbo'>('standard');
  const timerRef = useRef<any>(null);
  const startTimeRef = useRef<number>(Date.now());

  // Effective seconds based on mode
  const effectiveTime =
    timeMode === 'relaxed' ? 18 : timeMode === 'turbo' ? 8 : timePerQuestion;

  // Options shuffled
  const options = React.useMemo(() => {
    const list = Array.from(new Set([fact.product, ...distractors]));
    return list.sort(() => Math.random() - 0.5);
  }, [fact, distractors]);

  // Reset timer on question change
  useEffect(() => {
    setTimeLeft(effectiveTime);
    setSelectedAnswer(null);
    setFeedback('idle');
    startTimeRef.current = Date.now();

    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [fact, effectiveTime]);

  const handleTimeout = () => {
    if (feedback !== 'idle') return;
    setFeedback('timeout');
    sound.playTryAgain();
    setTimeout(() => {
      onTimeExpired(-1);
      setFeedback('idle');
    }, 1000);
  };

  const handlePick = (ans: number) => {
    if (feedback !== 'idle') return;
    if (timerRef.current) clearInterval(timerRef.current);

    setSelectedAnswer(ans);
    const timeSpent = Math.max(1, Math.round((Date.now() - startTimeRef.current) / 1000));
    const isCorrect = ans === fact.product;

    if (isCorrect) {
      sound.playCorrect();
      setFeedback('correct');
      setTimeout(() => {
        onAnswer(true, ans, timeSpent);
        setFeedback('idle');
        setSelectedAnswer(null);
      }, 650);
    } else {
      sound.playTryAgain();
      setFeedback('wrong');
      setTimeout(() => {
        onAnswer(false, ans, timeSpent);
        setFeedback('idle');
        setSelectedAnswer(null);
      }, 850);
    }
  };

  const progressPercentage = (timeLeft / effectiveTime) * 100;
  const isUrgent = timeLeft <= 3;
  const isMedium = timeLeft <= 6 && !isUrgent;

  return (
    <div className="flex flex-col items-center justify-center max-w-lg mx-auto w-full p-4 text-right">
      {/* خيارات سرعة التحدي المشجعة */}
      <div className="w-full flex items-center justify-between mb-3 text-xs">
        <span className="font-semibold text-slate-500">مستوى السرعة والتحدي:</span>
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              setTimeMode('relaxed');
            }}
            className={`px-2.5 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
              timeMode === 'relaxed'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🌱 هادئ (١٨ ثانية)
          </button>
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              setTimeMode('standard');
            }}
            className={`px-2.5 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
              timeMode === 'standard'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ⚡ قياسي (١٢ ثانية)
          </button>
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              setTimeMode('turbo');
            }}
            className={`px-2.5 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
              timeMode === 'turbo'
                ? 'bg-white text-amber-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🚀 توربو (٨ ثوانٍ)
          </button>
        </div>
      </div>

      {/* العداد التنازلي التفاعلي المريح بصرياً */}
      <div className="w-full bg-white border border-slate-200 rounded-2xl p-4 shadow-xs mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Timer
              className={`w-5 h-5 transition-colors ${
                isUrgent ? 'text-amber-500 animate-pulse' : 'text-indigo-600'
              }`}
            />
            <span className="text-xs sm:text-sm font-bold text-slate-700">الوقت المتبقي:</span>
          </div>

          <div
            className={`text-lg sm:text-xl font-black font-sans transition-colors ${
              isUrgent ? 'text-amber-600' : isMedium ? 'text-indigo-600' : 'text-slate-900'
            }`}
          >
            {toEastern(timeLeft)} ثانية
          </div>
        </div>

        {/* شريط التقدم التنازلي الانسيابي */}
        <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-1000 ${
              isUrgent
                ? 'bg-amber-500'
                : isMedium
                ? 'bg-indigo-500'
                : 'bg-emerald-500'
            }`}
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        <p className="text-[11px] text-slate-500 font-medium text-center mt-2">
          {isUrgent
            ? '💡 رائع! اختر إجابتك بهدوء وتركيز...'
            : '✨ خذ نفساً عميقاً، فكر في حاصل الضرب واختر الإجابة!'}
        </p>
      </div>

      {/* بطاقة السؤال الرئيسية */}
      <div
        className={`w-full p-6 md:p-8 rounded-3xl border transition-all text-center mb-6 shadow-xs ${
          feedback === 'correct'
            ? 'bg-emerald-50 border-emerald-400 scale-102'
            : feedback === 'wrong'
            ? 'bg-rose-50 border-rose-300'
            : feedback === 'timeout'
            ? 'bg-amber-50 border-amber-300'
            : 'bg-white border-slate-200'
        }`}
      >
        <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-2">
          <span className="flex items-center gap-1 text-indigo-700">
            <Zap className="w-3.5 h-3.5" />
            <span>تحدي الزمن والسرعة الإيجابية</span>
          </span>
          <span>
            المسألة {toEastern(questionIndex + 1)} من {toEastern(totalQuestions)}
          </span>
        </div>

        {/* معادلة الضرب الكبيرة */}
        <div className="text-4xl md:text-5xl font-black text-slate-900 my-4" dir="rtl">
          {toEastern(fact.factorA)} × {toEastern(fact.factorB)} = <span className="text-indigo-600 font-black">؟</span>
        </div>

        {/* تلميح واقعي مشجع */}
        <div className="text-xs sm:text-sm text-slate-500 font-medium">
          {toEastern(fact.realLifeExample)}
        </div>

        {feedback === 'timeout' && (
          <div className="mt-3 text-xs sm:text-sm font-bold text-amber-800 bg-amber-100/70 py-1.5 px-3 rounded-xl inline-block animate-in fade-in">
            انتهى وقت هذه المسألة بهدوء! سننتقل للمسألة التالية لاكتساب النجوم 🌟
          </div>
        )}
      </div>

      {/* خيارات الإجابة الأربعة */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 w-full">
        {options.map((opt) => {
          let btnStyle = 'bg-white border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/50 text-slate-900';

          if (feedback === 'correct' && opt === fact.product) {
            btnStyle = 'bg-emerald-600 border-emerald-600 text-white shadow-md scale-105';
          } else if (feedback === 'wrong') {
            if (opt === selectedAnswer) {
              btnStyle = 'bg-rose-500 border-rose-500 text-white';
            } else if (opt === fact.product) {
              btnStyle = 'bg-emerald-100 border-emerald-400 text-emerald-900';
            }
          }

          return (
            <button
              key={opt}
              type="button"
              disabled={feedback !== 'idle'}
              onClick={() => handlePick(opt)}
              className={`py-4 sm:py-5 px-4 rounded-2xl border-2 text-2xl sm:text-3xl font-extrabold font-sans transition-all active:scale-95 shadow-2xs cursor-pointer flex items-center justify-center ${btnStyle}`}
            >
              {toEastern(opt)}
            </button>
          );
        })}
      </div>
    </div>
  );
};
