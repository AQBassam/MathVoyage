import React, { useState } from 'react';
import { MultiplicationFact } from '../../types/game.ts';
import { VisualGroupModel } from '../VisualGroupModel.tsx';
import { sound } from '../../utils/audio.ts';
import { toEastern } from '../../utils/arabicNumerals.ts';
import { ArrowRight, ArrowLeft, Layers, Grid, ListOrdered, Check } from 'lucide-react';

interface VisualLearningGameProps {
  fact: MultiplicationFact;
  onNextFact?: () => void;
  onPrevFact?: () => void;
  onMasteredThisFact?: () => void;
}

export const VisualLearningGame: React.FC<VisualLearningGameProps> = ({
  fact,
  onNextFact,
  onPrevFact,
  onMasteredThisFact,
}) => {
  const [viewMode, setViewMode] = useState<'groups' | 'array'>('groups');

  const skipCountList = React.useMemo(() => {
    const list: number[] = [];
    for (let i = 1; i <= fact.factorA; i++) {
      list.push(i * fact.factorB);
    }
    return list;
  }, [fact]);

  return (
    <div className="flex flex-col items-center max-w-2xl mx-auto w-full p-4">
      {/* أدوات التحكم العلوية: التبديل بين المجموعات والمصفوفات */}
      <div className="flex items-center justify-between w-full mb-4">
        {onPrevFact ? (
          <button
            type="button"
            onClick={onPrevFact}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 cursor-pointer"
          >
            <ArrowRight className="w-3.5 h-3.5" />
            <span>السابق</span>
          </button>
        ) : <div />}

        {/* أزرار التبديل البصرية */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-2xl">
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              setViewMode('groups');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl transition-colors cursor-pointer ${
              viewMode === 'groups'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-emerald-600" />
            <span>المجموعات المتساوية</span>
          </button>

          <button
            type="button"
            onClick={() => {
              sound.playClick();
              setViewMode('array');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl transition-colors cursor-pointer ${
              viewMode === 'array'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Grid className="w-3.5 h-3.5 text-indigo-600" />
            <span>المصفوفة (الصفوف والأعمدة)</span>
          </button>
        </div>

        {onNextFact ? (
          <button
            type="button"
            onClick={onNextFact}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 cursor-pointer"
          >
            <span>التالي</span>
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>
        ) : <div />}
      </div>

      {/* لوحة التمثيل البصري الرئيسية */}
      <div className="w-full bg-white rounded-3xl border border-slate-200 shadow-xs p-6 mb-5">
        <VisualGroupModel
          factorA={fact.factorA}
          factorB={fact.factorB}
          mode={viewMode}
          interactive={true}
          showEquation={true}
        />

        {/* خط الأعداد والعد القفزي */}
        <div className="mt-5 pt-4 border-t border-slate-100">
          <div className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-800 mb-2">
            <ListOrdered className="w-4 h-4 text-emerald-600" />
            <span>العد القفزي بالـ {toEastern(fact.factorB)} ({toEastern(fact.factorA)} قفزات متساوية):</span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto py-2" dir="rtl">
            <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 text-xs sm:text-sm font-semibold flex items-center justify-center shrink-0 font-sans">
              {toEastern(0)}
            </div>
            {skipCountList.map((num, i) => (
              <React.Fragment key={i}>
                <span className="text-slate-300 font-bold text-xs">←</span>
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold font-sans shrink-0 ${
                    i === skipCountList.length - 1
                      ? 'bg-emerald-600 text-white shadow-xs ring-2 ring-emerald-300'
                      : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  }`}
                >
                  {toEastern(num)}
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* قصة رياضية من واقع الحياة */}
        {fact.realLifeExample && (
          <div className="mt-4 p-3.5 bg-amber-50/70 border border-amber-200/80 rounded-2xl text-amber-950 text-xs sm:text-sm leading-relaxed font-normal">
            <span className="font-bold">قصة رياضية شيقة: </span>
            <span>{fact.realLifeExample}</span>
          </div>
        )}
      </div>

      {/* زر تأكيد الفهم */}
      <div className="w-full p-4 bg-slate-50 border border-slate-200 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="text-xs sm:text-sm text-slate-600 font-medium">
          انقر على العناصر لعدها بنفسك! هل أصبحت هذه الحقيقة واضحة وسهلة؟
        </div>
        <button
          type="button"
          onClick={() => {
            sound.playStar();
            if (onMasteredThisFact) onMasteredThisFact();
          }}
          className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Check className="w-4 h-4" />
          <span>أتقنت وفهمت هذه الحقيقة!</span>
        </button>
      </div>
    </div>
  );
};
