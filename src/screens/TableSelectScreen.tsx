import React from 'react';
import { TABLE_METADATA, STAGES } from '../data/multiplicationData.ts';
import { useProgress } from '../context/ProgressContext.tsx';
import { GameType, ScreenType } from '../types/game.ts';
import { sound } from '../utils/audio.ts';
import { toEastern } from '../utils/arabicNumerals.ts';
import { CheckCircle2, Lock, Play, BookOpen, Sparkles } from 'lucide-react';

interface TableSelectScreenProps {
  onStartGame: (gameType: GameType, tableNumber: number) => void;
  onNavigate: (screen: ScreenType) => void;
}

export const TableSelectScreen: React.FC<TableSelectScreenProps> = ({
  onStartGame,
  onNavigate,
}) => {
  const { progress } = useProgress();

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 text-right">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug">
          اختر جدول الضرب المطلوب
        </h1>
        <p className="text-sm sm:text-base text-slate-600 mt-1 font-normal leading-relaxed">
          اختر أي جدول من ١ إلى ١٠ أو اختبر طلاقتك الذهنية في فضاء التحدي الشامل لجميع الجداول!
        </p>
      </div>

      {/* شبكة الجداول من 1 إلى 10 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {Array.from({ length: 10 }, (_, i) => i + 1).map((tableNum) => {
          const meta = TABLE_METADATA[tableNum];

          let masteredCount = 0;
          for (let j = 1; j <= 10; j++) {
            const key = `${tableNum}x${j}`;
            if (progress.factsMastery[key]?.isMastered) {
              masteredCount++;
            }
          }
          const percent = Math.round((masteredCount / 10) * 100);

          const stage = STAGES.find((s) => s.tables.includes(tableNum)) || STAGES[0];
          const isUnlocked = progress.unlockedStages.includes(stage.stageNumber);

          return (
            <div
              key={tableNum}
              className={`p-6 rounded-3xl border-2 transition-all flex flex-col justify-between ${
                isUnlocked
                  ? 'bg-white border-slate-200 shadow-xs hover:border-emerald-300'
                  : 'bg-slate-50/70 border-slate-200 opacity-60'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="text-3xl">{meta.itemEmoji}</span>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900">
                        جدول الضرب في {toEastern(tableNum)}
                      </h3>
                      <span className="text-xs sm:text-sm font-medium text-slate-500 font-sans">
                        المرحلة {toEastern(stage.stageNumber)} · {meta.theme}
                      </span>
                    </div>
                  </div>

                  {masteredCount === 10 ? (
                    <span className="text-xs sm:text-sm font-bold text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>متقن!</span>
                    </span>
                  ) : !isUnlocked ? (
                    <span className="text-xs font-medium text-slate-400 flex items-center gap-1">
                      <Lock className="w-3.5 h-3.5" />
                      <span>مغلق</span>
                    </span>
                  ) : null}
                </div>

                <p className="text-xs sm:text-sm text-slate-600 mb-4 leading-relaxed font-normal">
                  {toEastern(meta.description)}
                </p>

                {/* شريط الإتقان */}
                <div className="mb-4">
                  <div className="flex justify-between text-xs sm:text-sm font-semibold text-slate-600 mb-1">
                    <span>نسبة الإتقان:</span>
                    <span className="font-bold font-sans">{toEastern(masteredCount)} من {toEastern(10)} حقائق ({toEastern(percent)}٪)</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-600 h-full rounded-full transition-all duration-300"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* أزرار الإجراء */}
              <div className="pt-4 border-t border-slate-100 flex items-center gap-2">
                <button
                  type="button"
                  disabled={!isUnlocked}
                  onClick={() => {
                    sound.playClick();
                    onStartGame('choice', tableNum);
                  }}
                  className="flex-1 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-white -scale-x-100" />
                  <span>العب الآن</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    onNavigate('learn');
                  }}
                  className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs sm:text-sm rounded-xl transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  title="استكشف التمثيل البصري لهذا الجدول"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>الرسم البصري</span>
                </button>
              </div>
            </div>
          );
        })}

        {/* بطاقة التحدي الشامل لجميع الجداول */}
        <div className="p-6 rounded-3xl border-2 border-indigo-300 bg-linear-to-br from-indigo-50 to-purple-50 flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-3xl">🌌</span>
              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  فضاء التحدي الشامل
                </h3>
                <span className="text-xs sm:text-sm font-semibold text-indigo-700">
                  الطلاقة لجميع الجداول (من ١ إلى ١٠)
                </span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 mb-4 leading-relaxed font-normal">
              تحدَّ نفسك في جميع الجداول مجتمعة! يوفر محرك الذكاء التكيفي مراجعة مخصصة للحقائق التي تحتاج لمزيد من التدريب.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              sound.playClick();
              onStartGame('mixed', 0);
            }}
            className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>انطلق في التحدي الشامل</span>
          </button>
        </div>
      </div>
    </div>
  );
};
