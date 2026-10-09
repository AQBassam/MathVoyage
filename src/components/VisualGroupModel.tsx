import React, { useState } from 'react';
import { TABLE_METADATA } from '../data/multiplicationData.ts';
import { toEastern } from '../utils/arabicNumerals.ts';

interface VisualGroupModelProps {
  factorA: number; // عدد المجموعات أو الصفوف
  factorB: number; // عدد العناصر في كل مجموعة أو الأعمدة
  mode?: 'groups' | 'array';
  showEquation?: boolean;
  interactive?: boolean;
  onCountItem?: (count: number) => void;
  className?: string;
}

export const VisualGroupModel: React.FC<VisualGroupModelProps> = ({
  factorA,
  factorB,
  mode = 'groups',
  showEquation = true,
  interactive = false,
  className = '',
}) => {
  const [tappedItems, setTappedItems] = useState<number[]>([]);
  const product = factorA * factorB;
  const meta = TABLE_METADATA[factorA] || TABLE_METADATA[2];
  const itemEmoji = meta.itemEmoji || '⭐';

  const toggleItem = (idx: number) => {
    if (!interactive) return;
    setTappedItems((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };

  return (
    <div className={`p-4 md:p-6 bg-slate-50 border border-slate-200 rounded-3xl flex flex-col items-center justify-center ${className}`}>
      {/* عنوان النموذج الرياضي البصري */}
      <div className="text-center mb-4">
        <div className="text-sm sm:text-base font-medium text-slate-700">
          {toEastern(factorA)} مجموعات متساوية في كل منها {toEastern(factorB)} عناصر
        </div>
        {showEquation && (
          <div className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-wide mt-1 tabular-nums font-sans">
            <span>{toEastern(factorA)}</span>
            <span className="text-emerald-600 mx-2">×</span>
            <span>{toEastern(factorB)}</span>
            <span className="mx-2">=</span>
            <span className="text-emerald-700 font-extrabold">{toEastern(product)}</span>
          </div>
        )}
      </div>

      {/* العرض البصري: المجموعات المتساوية أو المصفوفة */}
      {mode === 'groups' ? (
        <div className="flex flex-wrap justify-center gap-3.5 max-w-xl my-2">
          {Array.from({ length: factorA }).map((_, groupIdx) => (
            <div
              key={groupIdx}
              className="p-3 bg-white border border-slate-200 rounded-2xl shadow-xs flex flex-col items-center min-w-[80px]"
            >
              <span className="text-xs font-medium text-slate-600 mb-1">
                المجموعة {toEastern(groupIdx + 1)}
              </span>
              <div className="flex flex-wrap justify-center gap-1.5 max-w-[120px]">
                {Array.from({ length: factorB }).map((_, itemIdx) => {
                  const globalIdx = groupIdx * factorB + itemIdx;
                  const isTapped = tappedItems.includes(globalIdx);
                  return (
                    <button
                      key={itemIdx}
                      type="button"
                      onClick={() => toggleItem(globalIdx)}
                      className={`text-xl md:text-2xl transition-transform active:scale-90 ${
                        interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'
                      } ${isTapped ? 'opacity-40 scale-95' : 'opacity-100'}`}
                      title={`عنصر ${toEastern(itemIdx + 1)} في المجموعة ${toEastern(groupIdx + 1)}`}
                      aria-label={`المجموعة ${toEastern(groupIdx + 1)} العنصر ${toEastern(itemIdx + 1)}`}
                    >
                      {itemEmoji}
                    </button>
                  );
                })}
              </div>
              <span className="text-xs font-semibold text-slate-500 mt-1 tabular-nums font-sans">
                ({toEastern(factorB)})
              </span>
            </div>
          ))}
        </div>
      ) : (
        /* شبكة المصفوفة: صفوف × أعمدة */
        <div className="my-2 p-4 bg-white border border-slate-200 rounded-2xl shadow-xs overflow-x-auto max-w-full">
          <div
            className="grid gap-2 justify-center items-center"
            style={{
              gridTemplateColumns: `repeat(${factorB}, minmax(32px, 40px))`,
            }}
          >
            {Array.from({ length: factorA }).map((_, rowIdx) =>
              Array.from({ length: factorB }).map((_, colIdx) => {
                const globalIdx = rowIdx * factorB + colIdx;
                const isTapped = tappedItems.includes(globalIdx);
                return (
                  <button
                    key={`${rowIdx}-${colIdx}`}
                    type="button"
                    onClick={() => toggleItem(globalIdx)}
                    className={`h-9 w-9 md:h-10 md:w-10 flex items-center justify-center text-lg md:text-xl rounded-xl transition-transform ${
                      interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'
                    } ${isTapped ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-50'}`}
                    aria-label={`الصف ${toEastern(rowIdx + 1)}، العمود ${toEastern(colIdx + 1)}`}
                  >
                    {itemEmoji}
                  </button>
                );
              })
            )}
          </div>
          <div className="text-center text-xs sm:text-sm text-slate-600 mt-3 font-medium">
            {toEastern(factorA)} صفوف × {toEastern(factorB)} أعمدة
          </div>
        </div>
      )}

      {/* تمثيل الجمع المتكرر المعتمد في تأسيس مفهوم الضرب */}
      <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-sm sm:text-base font-semibold text-center max-w-md w-full">
        <span>الجمع المتكرر: </span>
        <span className="tabular-nums font-bold font-sans">
          {Array(factorA).fill(toEastern(factorB)).join(' + ')} = {toEastern(product)}
        </span>
      </div>
    </div>
  );
};
