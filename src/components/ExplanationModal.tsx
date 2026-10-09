import React from 'react';
import { VisualGroupModel } from './VisualGroupModel.tsx';
import { getFact } from '../data/multiplicationData.ts';
import { Sparkles, ArrowLeft } from 'lucide-react';
import { getRandomMistakeMessage } from '../utils/adaptiveEngine.ts';
import { toEastern } from '../utils/arabicNumerals.ts';

interface ExplanationModalProps {
  factorA: number;
  factorB: number;
  givenAnswer?: number;
  onContinue: () => void;
}

export const ExplanationModal: React.FC<ExplanationModalProps> = ({
  factorA,
  factorB,
  givenAnswer,
  onContinue,
}) => {
  const fact = getFact(factorA, factorB);
  const encouragement = React.useMemo(() => getRandomMistakeMessage(), [factorA, factorB]);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150 text-right">
        <div className="flex items-center gap-2 text-amber-700 font-semibold text-sm sm:text-base mb-1.5">
          <Sparkles className="w-5 h-5 text-amber-500 shrink-0" />
          <span>{encouragement}</span>
        </div>

        <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2 font-sans" dir="rtl">
          هيا نستكشف حقيقة الضرب: {toEastern(factorA)} × {toEastern(factorB)}
        </h3>

        {givenAnswer !== undefined && (
          <div className="mb-4 text-xs sm:text-sm text-slate-600 font-normal font-sans">
            اخترت سابقاً: <span className="line-through text-rose-500 font-semibold">{toEastern(givenAnswer)}</span> · حاصل الضرب الصحيح هو: <span className="font-bold text-emerald-700 text-base">{toEastern(fact.product)}</span>
          </div>
        )}

        {/* التمثيل البصري بالمجموعات المتساوية */}
        <VisualGroupModel factorA={factorA} factorB={factorB} mode="groups" interactive={true} />

        {/* مثال توضيحي من واقع الحياة */}
        {fact.realLifeExample && (
          <div className="mt-4 p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-700 text-xs sm:text-sm leading-relaxed font-normal">
            <span className="font-bold text-slate-900">مثال من واقع الحياة: </span>
            <span>{toEastern(fact.realLifeExample)}</span>
          </div>
        )}

        <button
          type="button"
          onClick={onContinue}
          className="w-full mt-5 py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm sm:text-base rounded-2xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>فهمت الفكرة! هيا نواصل المغامرة</span>
          <ArrowLeft className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
