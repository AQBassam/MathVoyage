import React, { useState } from 'react';
import { TABLE_METADATA, getFact } from '../data/multiplicationData.ts';
import { VisualGroupModel } from '../components/VisualGroupModel.tsx';
import { sound } from '../utils/audio.ts';
import { toEastern } from '../utils/arabicNumerals.ts';
import { GameType, ScreenType } from '../types/game.ts';
import { Layers, Grid, ChevronLeft, Play, Sparkles } from 'lucide-react';

interface LearnScreenProps {
  onStartGame: (gameType: GameType, tableNumber: number) => void;
  onNavigate: (screen: ScreenType) => void;
}

export const LearnScreen: React.FC<LearnScreenProps> = ({ onStartGame, onNavigate }) => {
  const [selectedTable, setSelectedTable] = useState<number>(2);
  const [selectedMultiplier, setSelectedMultiplier] = useState<number>(3);
  const [displayMode, setDisplayMode] = useState<'groups' | 'array'>('groups');

  const currentFact = getFact(selectedTable, selectedMultiplier);
  const meta = TABLE_METADATA[selectedTable] || TABLE_METADATA[1];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6 text-right">
      {/* العنوان */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug">
          المختبر البصري لجدول الضرب
        </h1>
        <p className="text-sm sm:text-base text-slate-600 mt-1 font-normal leading-relaxed">
          اكتشف لماذا تنجح عملية الضرب عبر تمثيل المجموعات المتساوية، ومصفوفات الصفوف والأعمدة، والجمع المتكرر!
        </p>
      </div>

      {/* شريط اختيار الجدول من 1 إلى 10 */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {Array.from({ length: 10 }, (_, i) => i + 1).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => {
              sound.playClick();
              setSelectedTable(t);
            }}
            className={`px-4 py-2.5 rounded-xl border text-sm whitespace-nowrap transition-all cursor-pointer ${
              selectedTable === t
                ? 'bg-emerald-600 border-emerald-600 text-white font-bold shadow-xs scale-105'
                : 'bg-white border-slate-200 text-slate-700 font-medium hover:bg-slate-50'
            }`}
          >
            جدول {toEastern(t)}
          </button>
        ))}
      </div>

      {/* مساحة الاستكشاف التفاعلية */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs">
        {/* لافتة الجدول والقصة */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-3xl">{meta.itemEmoji}</span>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                {meta.title}
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 font-normal leading-relaxed">{meta.description}</p>
          </div>

          {/* محول النمط البصري */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-2xl self-start sm:self-auto">
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                setDisplayMode('groups');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm rounded-xl transition-colors cursor-pointer ${
                displayMode === 'groups'
                  ? 'bg-white text-slate-900 font-bold shadow-xs'
                  : 'text-slate-600 font-medium hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-emerald-600" />
              <span>المجموعات المتساوية</span>
            </button>

            <button
              type="button"
              onClick={() => {
                sound.playClick();
                setDisplayMode('array');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm rounded-xl transition-colors cursor-pointer ${
                displayMode === 'array'
                  ? 'bg-white text-slate-900 font-bold shadow-xs'
                  : 'text-slate-600 font-medium hover:text-slate-900'
              }`}
            >
              <Grid className="w-3.5 h-3.5 text-indigo-600" />
              <span>المصفوفة (الصفوف والأعمدة)</span>
            </button>
          </div>
        </div>

        {/* منتقي عدد المجموعات (1 إلى 10) */}
        <div className="my-6">
          <div className="flex items-center justify-between text-xs sm:text-sm font-semibold text-slate-600 mb-2.5">
            <span>اختر عدد المجموعات أو العناصر:</span>
            <span className="text-emerald-700 text-sm sm:text-base font-bold font-sans">
              {toEastern(selectedTable)} × {toEastern(selectedMultiplier)}
            </span>
          </div>

          <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5" dir="rtl">
            {Array.from({ length: 10 }, (_, i) => i + 1).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => {
                  sound.playClick();
                  setSelectedMultiplier(m);
                }}
                className={`py-2 rounded-xl border text-sm font-semibold font-sans transition-all cursor-pointer ${
                  selectedMultiplier === m
                    ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs scale-105'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                × {toEastern(m)}
              </button>
            ))}
          </div>
        </div>

        {/* اللوحة البصرية النموذجية */}
        <div className="my-4">
          <VisualGroupModel
            factorA={selectedTable}
            factorB={selectedMultiplier}
            mode={displayMode}
            interactive={true}
          />
        </div>

        {/* قصة رياضية واقعية */}
        {currentFact.realLifeExample && (
          <div className="mt-6 p-4 bg-amber-50/70 border border-amber-200/80 rounded-2xl flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <span className="text-xs font-semibold text-amber-900 uppercase tracking-wide">
                قصة رياضية من واقع حياتنا اليومية
              </span>
              <p className="text-sm sm:text-base text-amber-950 mt-1 leading-relaxed font-medium">
                {currentFact.realLifeExample}
              </p>
            </div>
          </div>
        )}

        {/* الانتقال للتمرين واللعب */}
        <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs sm:text-sm text-slate-600 font-medium">
            جاهز لاختبار فهمك وممارسة الألعاب على جدول {toEastern(selectedTable)}؟
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                onStartGame('equation', selectedTable);
              }}
              className="flex-1 sm:flex-none px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-white -scale-x-100" />
              <span>تدرّب على جدول {toEastern(selectedTable)}</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigate('game_select')}
              className="flex-1 sm:flex-none px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs sm:text-sm rounded-xl transition-colors flex items-center justify-center gap-1 cursor-pointer"
            >
              <span>جميع الألعاب</span>
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
