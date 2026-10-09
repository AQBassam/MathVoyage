import React, { useState } from 'react';
import { GameType, ScreenType } from '../types/game.ts';
import { VisualGroupModel } from '../components/VisualGroupModel.tsx';
import { sound } from '../utils/audio.ts';
import { toEastern } from '../utils/arabicNumerals.ts';
import { Star, RotateCcw, Home, Sparkles, BookOpen } from 'lucide-react';

interface ResultsScreenProps {
  result: {
    gameType: GameType;
    tableNumber: number;
    score: number;
    totalQuestions: number;
    starsEarned: number;
    accuracyPercent: number;
    mistakes: Array<{
      factorA: number;
      factorB: number;
      givenAnswer: number;
      correctAnswer: number;
    }>;
  };
  onPlayAgain: () => void;
  onNavigate: (screen: ScreenType) => void;
}

export const ResultsScreen: React.FC<ResultsScreenProps> = ({
  result,
  onPlayAgain,
  onNavigate,
}) => {
  const [expandedMistake, setExpandedMistake] = useState<number | null>(null);

  const { score, totalQuestions, starsEarned, accuracyPercent, mistakes, tableNumber } = result;

  React.useEffect(() => {
    sound.playCelebration();
  }, []);

  let praise = 'أحسنت يا بطل، مجهود مبارك!';
  if (accuracyPercent === 100) praise = `درجة كاملة ${toEastern(100)}٪! بطل جدول الضرب المتألق!`;
  else if (accuracyPercent >= 80) praise = 'عمل رائع ومتميز! أنت تتقن هذا الجدول بجدارة!';
  else if (accuracyPercent >= 60) praise = 'محاولة طيبة! بالتدريب المستمر يترسخ الإتقان!';

  return (
    <div className="max-w-xl mx-auto px-4 py-8 space-y-6 text-right">
      {/* بطاقة الاحتفال والنجوم */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs text-center">
        {/* عرض النجوم */}
        <div className="flex items-center justify-center gap-3 mb-4">
          {[1, 2, 3].map((starIdx) => (
            <div
              key={starIdx}
              className={`transition-all duration-300 transform ${
                starIdx <= starsEarned
                  ? 'scale-110 text-amber-400 drop-shadow-sm'
                  : 'scale-90 text-slate-200'
              }`}
            >
              <Star
                className={`w-12 h-12 ${
                  starIdx <= starsEarned ? 'fill-amber-400' : 'fill-slate-200'
                }`}
              />
            </div>
          ))}
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-2 leading-snug">
          {praise}
        </h1>

        <p className="text-sm sm:text-base text-slate-600 mb-6 font-medium">
          حصلت على <span className="text-amber-600 font-bold">+{toEastern(starsEarned)} نجوم</span> في رحلتك التعليمية!
        </p>

        {/* إحصائيات الجولة */}
        <div className="grid grid-cols-3 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
          <div>
            <div className="text-xs sm:text-sm font-semibold text-slate-500">الدرجة</div>
            <div className="text-xl sm:text-2xl font-extrabold text-slate-900 font-sans mt-0.5">
              {toEastern(score)} / {toEastern(totalQuestions)}
            </div>
          </div>

          <div>
            <div className="text-xs sm:text-sm font-semibold text-slate-500">الدقة والضبط</div>
            <div className="text-xl sm:text-2xl font-extrabold text-emerald-600 font-sans mt-0.5">
              {toEastern(accuracyPercent)}٪
            </div>
          </div>

          <div>
            <div className="text-xs sm:text-sm font-semibold text-slate-500">الجدول</div>
            <div className="text-xl sm:text-2xl font-extrabold text-indigo-600 mt-0.5 font-sans">
              {tableNumber === 0 ? 'شامل' : `جدول ${toEastern(tableNumber)}`}
            </div>
          </div>
        </div>
      </div>

      {/* مراجعة المسائل التي حدث فيها خطأ مع التمثيل البصري */}
      {mistakes.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              حقائق تحتاج لمراجعتها وتثبيتها ({toEastern(mistakes.length)})
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 mb-4 font-normal">
            انقر على أي مسألة أدناه لتشاهد رسم المجموعات المتساوية الذي يوضح حلها:
          </p>

          <div className="space-y-3">
            {mistakes.map((m, idx) => {
              const isExpanded = expandedMistake === idx;

              return (
                <div
                  key={idx}
                  className="border border-slate-200 rounded-2xl overflow-hidden transition-all"
                >
                  <button
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      setExpandedMistake(isExpanded ? null : idx);
                    }}
                    className="w-full p-3.5 bg-slate-50 hover:bg-slate-100/80 flex items-center justify-between text-right cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-slate-900 text-lg font-sans">
                        {toEastern(m.factorA)} × {toEastern(m.factorB)}
                      </span>
                      <span className="text-xs sm:text-sm text-slate-600 font-medium">
                        حاصل الضرب الصحيح: <span className="text-emerald-700 font-bold font-sans">{toEastern(m.correctAnswer)}</span>
                        {m.givenAnswer > 0 && (
                          <span className="text-slate-400 line-through ms-2 font-sans">
                            {toEastern(m.givenAnswer)}
                          </span>
                        )}
                      </span>
                    </div>

                    <span className="text-xs sm:text-sm font-bold text-indigo-700">
                      {isExpanded ? 'إخفاء الرسم' : 'شاهد الرسم التوضيحي'}
                    </span>
                  </button>

                  {isExpanded && (
                    <div className="p-4 bg-white border-t border-slate-100">
                      <VisualGroupModel
                        factorA={m.factorA}
                        factorB={m.factorB}
                        mode="groups"
                        interactive={false}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* أزرار الإجراءات بعد انتهاء الجلسة */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <button
          type="button"
          onClick={() => {
            sound.playClick();
            onPlayAgain();
          }}
          className="w-full sm:flex-1 py-3.5 px-5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm sm:text-base rounded-2xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          <span>العب مرة أخرى</span>
        </button>

        <button
          type="button"
          onClick={() => {
            sound.playClick();
            onNavigate('game_select');
          }}
          className="w-full sm:flex-1 py-3.5 px-5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm sm:text-base rounded-2xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
        >
          <BookOpen className="w-4 h-4" />
          <span>اختر لعبة أخرى</span>
        </button>

        <button
          type="button"
          onClick={() => {
            sound.playClick();
            onNavigate('home');
          }}
          className="w-full sm:w-auto p-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl transition-colors flex items-center justify-center cursor-pointer"
          aria-label="العودة للصفحة الرئيسية"
          title="العودة للصفحة الرئيسية"
        >
          <Home className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
