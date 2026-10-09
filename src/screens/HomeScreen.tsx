import React, { useState } from 'react';
import { ScreenType, GameType } from '../types/game.ts';
import { useProgress } from '../context/ProgressContext.tsx';
import { STAGES, ALL_BADGES } from '../data/multiplicationData.ts';
import { sound } from '../utils/audio.ts';
import { DailyRewardModal } from '../components/DailyRewardModal.tsx';
import { FursanSymbol } from '../components/brand/FursanLogo.tsx';
import { toEastern } from '../utils/arabicNumerals.ts';
import {
  Play,
  BookOpen,
  Compass,
  Trophy,
  Star,
  CheckCircle,
  Lock,
  Sparkles,
  Award,
  Zap,
  Gift,
  Flame,
  Timer,
} from 'lucide-react';

interface HomeScreenProps {
  onNavigate: (screen: ScreenType) => void;
  onStartGame: (gameType: GameType, tableNumber: number) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onNavigate, onStartGame }) => {
  const { progress, canClaimDailyReward } = useProgress();
  const [showRewardModal, setShowRewardModal] = useState<boolean>(false);

  const isRewardReady = canClaimDailyReward();
  const streak = progress.dailyReward?.currentStreakDays || 0;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 text-right">
      {/* لافتة الترحيب الرئيسية */}
      <section className="bg-linear-to-br from-emerald-600 via-teal-700 to-indigo-800 rounded-3xl p-6 sm:p-10 text-white shadow-md relative overflow-hidden">
        <div className="absolute top-0 left-0 w-80 h-80 bg-white/10 rounded-full blur-2xl pointer-events-none -ml-20 -mt-20" />
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-emerald-400/20 rounded-full blur-xl pointer-events-none -mr-20 -mb-20" />

        <div className="relative z-10">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 mb-3 bg-white/15 backdrop-blur-xs px-3.5 py-1.5 rounded-full border border-white/20 text-emerald-50 text-xs sm:text-sm font-semibold">
              <FursanSymbol sizePx={22} />
              <span className="font-black text-white">فُرسان الحساب</span>
              <span className="text-white/60">·</span>
              <span>منصة أبطال الرياضيات وحقائق الضرب التفاعلية</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-3 text-white">
              مرحباً بك يا بطل، {progress.playerName}!
            </h1>

            <p className="text-emerald-50 text-base sm:text-lg mb-6 leading-relaxed font-normal">
              أتقن جداول الضرب من ١ إلى ١٠ عبر الفهم بالمجموعات المتساوية والمصفوفات و١٤ لعبة تعليمية وتحديات السرعة والدقة المشوقة!
            </p>
          </div>

          {/* أزرار الانطلاق السريع - مجموعة موحدة */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 max-w-4xl">
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                onStartGame('choice', 2);
              }}
              className="h-12 px-4 bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold text-sm sm:text-base rounded-2xl shadow-sm transition-transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
            >
              <Play className="w-5 h-5 fill-slate-900 -scale-x-100 shrink-0" />
              <span>اللعب السريع</span>
            </button>

            <button
              type="button"
              onClick={() => {
                sound.playClick();
                onStartGame('timechallenge', 2);
              }}
              className="h-12 px-4 bg-orange-500 hover:bg-orange-400 text-white font-bold text-sm sm:text-base rounded-2xl shadow-sm transition-transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
            >
              <Timer className="w-5 h-5 shrink-0" />
              <span>تحدي الزمن</span>
            </button>

            <button
              type="button"
              onClick={() => {
                sound.playClick();
                onNavigate('learn');
              }}
              className="h-12 px-4 bg-white/15 hover:bg-white/25 text-white font-bold text-sm sm:text-base rounded-2xl border border-white/20 backdrop-blur-xs transition-colors flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
            >
              <BookOpen className="w-5 h-5 shrink-0" />
              <span>المختبر البصري</span>
            </button>

            <button
              type="button"
              onClick={() => {
                sound.playClick();
                onNavigate('table_select');
              }}
              className="h-12 px-4 bg-white/15 hover:bg-white/25 text-white font-bold text-sm sm:text-base rounded-2xl border border-white/20 backdrop-blur-xs transition-colors flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
            >
              <Compass className="w-5 h-5 shrink-0" />
              <span>اختر جدولاً</span>
            </button>
          </div>
        </div>
      </section>

      {/* شريط المكافأة اليومية وسلسلة الحضور */}
      <section className="bg-linear-to-r from-amber-50 via-orange-50 to-amber-100/70 border-2 border-amber-300/80 rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-14 h-14 rounded-2xl bg-linear-to-tr from-amber-500 to-yellow-400 text-white flex items-center justify-center shadow-md shadow-amber-500/25">
              <Gift className="w-7 h-7" />
            </div>
            {isRewardReady && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 text-[10px] text-white font-bold items-center justify-center">
                  !
                </span>
              </span>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-black text-slate-900">
                مكافأة الحضور واللعب اليومي 🎁
              </h2>
              {streak > 0 && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-200/80 text-amber-900 border border-amber-300">
                  <Flame className="w-3.5 h-3.5 text-orange-600 fill-orange-500" />
                  <span>{toEastern(streak)} أيام متتالية</span>
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-slate-600 font-medium mt-0.5">
              {isRewardReady
                ? 'لديك نجوم إضافية بانتظارك اليوم! اضغط للاستلام ودعم تقدمك.'
                : 'أحسنت! استلمت هدية اليوم. عد غداً لمواصلة سلسلتك ونيل المزيد من النجوم!'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            sound.playClick();
            setShowRewardModal(true);
          }}
          className={`w-full sm:w-auto px-6 py-3.5 rounded-2xl font-black text-sm transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 cursor-pointer ${
            isRewardReady
              ? 'bg-amber-400 hover:bg-amber-300 text-slate-900 ring-4 ring-amber-300/40 animate-pulse'
              : 'bg-white hover:bg-amber-50 text-slate-800 border border-amber-300'
          }`}
        >
          <Gift className="w-4 h-4" />
          <span>{isRewardReady ? 'افتح هديتك اليوم! 🌟' : 'عرض جدول المكافآت'}</span>
        </button>
      </section>

      {/* لوحة إحصائيات وأهداف اليوم */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* بطاقة هدف اليوم */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              هدف اليوم في الرياضيات
            </span>
            <Zap className="w-4 h-4 text-amber-500" />
          </div>

          <div>
            <div className="text-2xl font-extrabold text-slate-900 mb-1 font-sans">
              {toEastern(progress.dailyGoal.completedQuestions)} / {toEastern(progress.dailyGoal.targetQuestions)} مسألة
            </div>
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden mb-2">
              <div
                className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(
                    100,
                    (progress.dailyGoal.completedQuestions / progress.dailyGoal.targetQuestions) * 100
                  )}%`,
                }}
              />
            </div>
            <p className="text-xs text-slate-600 font-medium">
              {progress.dailyGoal.completedQuestions >= progress.dailyGoal.targetQuestions
                ? '🌟 حققت هدف اليوم بالكامل! بطل حقيقي!'
                : `بقي ${toEastern(progress.dailyGoal.targetQuestions - progress.dailyGoal.completedQuestions)} مسألة لإتمام هدف اليوم!`}
            </p>
          </div>
        </div>

        {/* بطاقة رتبة الطالب والنجوم */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              رتبة فارس الرياضيات
            </span>
            <Trophy className="w-4 h-4 text-emerald-600" />
          </div>

          <div>
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-2xl font-extrabold text-slate-900">المستوى {toEastern(progress.level)}</span>
              <span className="text-sm font-bold text-slate-500 font-sans">
                · {toEastern(progress.stars)} نجمة
              </span>
            </div>
            <p className="text-xs text-slate-600 font-medium">
              المستوى التالي بعد {toEastern(15 - (progress.stars % 15))} نجوم جديدة! استمر في التعلم واللعب.
            </p>
          </div>
        </div>

        {/* بطاقة حقائق الضرب المتقنة */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              حقائق الضرب المتقنة
            </span>
            <CheckCircle className="w-4 h-4 text-indigo-600" />
          </div>

          <div>
            {(() => {
              const mastered = Object.values(progress.factsMastery).filter((f) => f.isMastered).length;
              return (
                <>
                  <div className="text-2xl font-extrabold text-slate-900 mb-1 font-sans">
                    {toEastern(mastered)} / {toEastern(100)} حقيقة
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden mb-2">
                    <div
                      className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${(mastered / 100) * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-600 font-medium">
                    من جدول ١ إلى ١٠. أجب عن كل حقيقة ٣ مرات متتالية بإتقان!
                  </p>
                </>
              );
            })()}
          </div>
        </div>
      </section>

      {/* خارطة طريق المراحل الست لتعلم جدول الضرب */}
      <section className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              مسار المراحل الست لتعلم جدول الضرب
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1">
              افهم بالمجموعات ← تدرّب بالألعاب ← أتقن بالسرعة ← راجع بانتظام!
            </p>
          </div>

          <button
            type="button"
            onClick={() => onNavigate('table_select')}
            className="text-xs sm:text-sm font-bold text-emerald-700 hover:text-emerald-800 cursor-pointer"
          >
            عرض الجداول ←
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {STAGES.map((stg) => {
            const isUnlocked = progress.unlockedStages.includes(stg.stageNumber);

            return (
              <div
                key={stg.stageNumber}
                className={`p-5 rounded-2xl border-2 transition-all flex flex-col justify-between ${
                  isUnlocked
                    ? 'bg-slate-50/70 border-emerald-200 text-slate-900 shadow-xs'
                    : 'bg-slate-50/40 border-slate-200 text-slate-400'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase text-slate-500">
                      المرحلة {toEastern(stg.stageNumber)}
                    </span>

                    {isUnlocked ? (
                      <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>مفتوحة</span>
                      </span>
                    ) : (
                      <span className="text-xs font-medium text-slate-400 flex items-center gap-1 font-sans">
                        <Lock className="w-3.5 h-3.5" />
                        <span>{toEastern(stg.minStarsToUnlock)} نجوم للفتح</span>
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-lg text-slate-900 mb-1">{stg.subtitle}</h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4 font-normal">{toEastern(stg.description)}</p>
                </div>

                <div className="pt-3 border-t border-slate-200/60 flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-600 font-sans">
                    الجداول: {stg.tables.map((t) => toEastern(t)).join('، ')}
                  </span>

                  {isUnlocked && (
                    <button
                      type="button"
                      onClick={() => {
                        sound.playClick();
                        onStartGame('choice', stg.tables[0]);
                      }}
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs cursor-pointer"
                    >
                      تدرّب الآن
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* استعراض الأوسمة والشارات */}
      <section className="bg-slate-50 border border-slate-200 rounded-3xl p-6 sm:p-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" />
            <h2 className="text-lg font-bold text-slate-900">الأوسمة والشارات المستحقة</h2>
          </div>

          <button
            type="button"
            onClick={() => onNavigate('progress')}
            className="text-xs sm:text-sm font-bold text-emerald-700 hover:text-emerald-800 cursor-pointer"
          >
            جميع الأوسمة ({progress.unlockedBadges.length}/{ALL_BADGES.length}) ←
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
          {ALL_BADGES.slice(0, 6).map((badge) => {
            const isUnlocked = progress.unlockedBadges.includes(badge.id);
            return (
              <div
                key={badge.id}
                className={`p-3.5 rounded-2xl border text-center transition-all ${
                  isUnlocked
                    ? 'bg-white border-amber-200 shadow-xs'
                    : 'bg-slate-100/60 border-slate-200 opacity-50 grayscale'
                }`}
              >
                <div className="text-3xl mb-1">{badge.icon}</div>
                <div className="text-xs sm:text-sm font-semibold text-slate-900 truncate">{badge.title}</div>
                <div className="text-xs text-slate-500 font-normal truncate mt-0.5">{badge.description}</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* نافذة المكافأة اليومية */}
      <DailyRewardModal
        isOpen={showRewardModal}
        onClose={() => setShowRewardModal(false)}
      />
    </div>
  );
};
