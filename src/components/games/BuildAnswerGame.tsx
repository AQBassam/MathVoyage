import React, { useState } from 'react';
import { MultiplicationFact } from '../../types/game.ts';
import { sound } from '../../utils/audio.ts';
import { toEastern } from '../../utils/arabicNumerals.ts';
import { Plus, Minus, RotateCcw } from 'lucide-react';

interface BuildAnswerGameProps {
  fact: MultiplicationFact;
  onAnswer: (isCorrect: boolean, builtValue: number) => void;
}

export const BuildAnswerGame: React.FC<BuildAnswerGameProps> = ({ fact, onAnswer }) => {
  const [tens, setTens] = useState<number>(0);
  const [ones, setOnes] = useState<number>(0);
  const [feedback, setFeedback] = useState<'idle' | 'correct' | 'wrong'>('idle');

  const currentTotal = tens * 10 + ones;

  const handleAddTen = (delta: number) => {
    sound.playClick();
    setTens((prev) => Math.max(0, Math.min(10, prev + delta)));
  };

  const handleAddOne = (delta: number) => {
    sound.playClick();
    setOnes((prev) => Math.max(0, Math.min(20, prev + delta)));
  };

  const handleReset = () => {
    sound.playClick();
    setTens(0);
    setOnes(0);
  };

  const handleSubmit = () => {
    const isCorrect = currentTotal === fact.product;
    if (isCorrect) {
      sound.playCorrect();
      setFeedback('correct');
      setTimeout(() => {
        onAnswer(true, currentTotal);
        setFeedback('idle');
        setTens(0);
        setOnes(0);
      }, 700);
    } else {
      sound.playTryAgain();
      setFeedback('wrong');
      setTimeout(() => {
        onAnswer(false, currentTotal);
        setFeedback('idle');
      }, 850);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center max-w-lg mx-auto w-full p-4">
      {/* جملة الضرب المستهدفة */}
      <div className="w-full p-6 bg-white rounded-3xl border border-slate-200 shadow-xs text-center mb-6">
        <div className="text-xs sm:text-sm font-semibold text-slate-500 mb-1 uppercase tracking-wider">
          كوّن حاصل الضرب بالقيمة المكانية (العشرات والآحاد)
        </div>

        <div className="text-4xl md:text-5xl font-extrabold text-slate-900 font-sans my-2" dir="rtl">
          {toEastern(fact.factorA)} × {toEastern(fact.factorB)} = <span className="text-emerald-600 font-bold">؟</span>
        </div>

        {/* صندوق العدد المكوّن المباشر */}
        <div className="mt-4 p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-center gap-2">
          <span className="text-sm sm:text-base font-medium text-slate-700">العدد الذي كوّنته:</span>
          <span className="text-3xl font-extrabold text-emerald-700 font-sans">
            {toEastern(currentTotal)}
          </span>
          <span className="text-xs sm:text-sm text-slate-500 font-medium font-sans">
            ({toEastern(tens)} عشرات + {toEastern(ones)} آحاد)
          </span>
        </div>
      </div>

      {/* أدوات بناء القيمة المكانية */}
      <div className="grid grid-cols-2 gap-4 w-full mb-6">
        {/* أعمدة العشرات */}
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col items-center">
          <span className="text-sm sm:text-base font-semibold text-slate-800 mb-1">أعمدة العشرات ({toEastern(10)} لكل عمود)</span>
          <div className="text-3xl font-extrabold text-indigo-600 font-sans my-2">
            {toEastern(tens)} <span className="text-xs text-slate-500 font-normal">عشرات = {toEastern(tens * 10)}</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={tens === 0}
              onClick={() => handleAddTen(-1)}
              className="w-11 h-11 rounded-xl border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
            >
              <Minus className="w-5 h-5" />
            </button>
            <button
              type="button"
              disabled={tens >= 10}
              onClick={() => handleAddTen(1)}
              className="w-11 h-11 rounded-xl bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-700 disabled:opacity-40 cursor-pointer"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* مكعبات الآحاد */}
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col items-center">
          <span className="text-sm sm:text-base font-semibold text-slate-800 mb-1">مكعبات الآحاد ({toEastern(1)} لكل مكعب)</span>
          <div className="text-3xl font-extrabold text-amber-600 font-sans my-2">
            {toEastern(ones)} <span className="text-xs text-slate-500 font-normal">آحاد = {toEastern(ones)}</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={ones === 0}
              onClick={() => handleAddOne(-1)}
              className="w-11 h-11 rounded-xl border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
            >
              <Minus className="w-5 h-5" />
            </button>
            <button
              type="button"
              disabled={ones >= 20}
              onClick={() => handleAddOne(1)}
              className="w-11 h-11 rounded-xl bg-amber-600 text-white flex items-center justify-center hover:bg-amber-700 disabled:opacity-40 cursor-pointer"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* أزرار الإجراءات */}
      <div className="flex gap-3 w-full">
        <button
          type="button"
          onClick={handleReset}
          className="py-3 px-4 rounded-2xl border border-slate-200 text-slate-700 hover:bg-slate-100 font-semibold text-xs sm:text-sm flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          <span>إعادة تعيين</span>
        </button>

        <button
          type="button"
          disabled={currentTotal === 0}
          onClick={handleSubmit}
          className={`flex-1 py-3 px-6 rounded-2xl font-bold text-sm sm:text-base text-white shadow-xs transition-colors flex items-center justify-center cursor-pointer ${
            feedback === 'correct'
              ? 'bg-emerald-600'
              : feedback === 'wrong'
              ? 'bg-rose-500'
              : 'bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50'
          }`}
        >
          <span>تأكيد العدد المكوّن</span>
        </button>
      </div>
    </div>
  );
};
