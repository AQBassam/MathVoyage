import React, { useState } from 'react';
import { useProgress } from '../context/ProgressContext.tsx';
import { ALL_BADGES } from '../data/multiplicationData.ts';
import { BadgeMedallion } from '../components/brand/BadgeMedallion.tsx';
import { VisualGroupModel } from '../components/VisualGroupModel.tsx';
import { DailyRewardModal } from '../components/DailyRewardModal.tsx';
import { sound } from '../utils/audio.ts';
import { toEastern } from '../utils/arabicNumerals.ts';
import { Award, AlertCircle, X, Flame, Gift, Star, CheckCircle2, Lock, Filter, Sparkles, Target, Zap } from 'lucide-react';
import { GameType, Badge } from '../types/game.ts';

interface ProgressScreenProps {
  onStartGame: (gameType: GameType, tableNumber: number) => void;
}

export const ProgressScreen: React.FC<ProgressScreenProps> = ({ onStartGame }) => {
  const { progress, canClaimDailyReward } = useProgress();
  const [inspectedFact, setInspectedFact] = useState<{ a: number; b: number } | null>(null);
  const [showRewardModal, setShowRewardModal] = useState<boolean>(false);

  let masteredCount = 0;
  let practicedCount = 0;
  let totalAttempts = 0;
  let totalCorrect = 0;

  const trickyFacts: Array<{ a: number; b: number; accuracy: number; attempts: number }> = [];

  for (let a = 1; a <= 10; a++) {
    for (let b = 1; b <= 10; b++) {
      const key = `${a}x${b}`;
      const data = progress.factsMastery[key];
      if (data && data.attempts > 0) {
        practicedCount++;
        totalAttempts += data.attempts;
        totalCorrect += data.correct;
        if (data.isMastered) masteredCount++;

        const acc = Math.round((data.correct / data.attempts) * 100);
        if (data.attempts >= 2 && acc < 70) {
          trickyFacts.push({ a, b, accuracy: acc, attempts: data.attempts });
        }
      }
    }
  }

  const overallAccuracy = totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 100;

  const [selectedCategory, setSelectedCategory] = useState<'all' | 'table' | 'questions' | 'streak' | 'unlocked'>('all');
  const [inspectedBadge, setInspectedBadge] = useState<Badge | null>(null);

  const getBadgeProgress = (b: Badge) => {
    const isUnlocked = progress.unlockedBadges.includes(b.id);
    if (isUnlocked) return { current: 100, target: 100, percent: 100, text: 'مكتملة ومستحقة 🌟' };

    if (b.category === 'table' && b.targetTable) {
      let mastered = 0;
      for (let i = 1; i <= 10; i++) {
        if (progress.factsMastery[`${b.targetTable}x${i}`]?.isMastered) mastered++;
      }
      return {
        current: mastered,
        target: 8,
        percent: Math.min(100, Math.round((mastered / 8) * 100)),
        text: `${toEastern(mastered)} من ${toEastern(10)} حقائق متقنة`,
      };
    }

    if (b.category === 'questions') {
      const target = b.targetQuestions || 100;
      return {
        current: totalAttempts,
        target,
        percent: Math.min(100, Math.round((totalAttempts / target) * 100)),
        text: `${toEastern(Math.min(totalAttempts, target))} من ${toEastern(target)} مسألة`,
      };
    }

    if (b.category === 'streak' && b.targetStreak) {
      const maxStreak = Math.max(0, ...Object.values(progress.factsMastery).map((f) => f.consecutiveCorrect || 0));
      return {
        current: maxStreak,
        target: b.targetStreak,
        percent: Math.min(100, Math.round((maxStreak / b.targetStreak) * 100)),
        text: `${toEastern(maxStreak)} من ${toEastern(b.targetStreak)} متتالية`,
      };
    }

    if (b.id.startsWith('daily_streak')) {
      const streak = progress.dailyReward?.currentStreakDays || 0;
      const target = b.id === 'daily_streak_3' ? 3 : 7;
      return {
        current: streak,
        target,
        percent: Math.min(100, Math.round((streak / target) * 100)),
        text: `${toEastern(streak)} من ${toEastern(target)} أيام`,
      };
    }

    return { current: 0, target: 1, percent: 0, text: 'قيد التقدم والتدريب' };
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 text-right">
      {/* رأس الصفحة */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug">
          سجل إنجازاتي وتقدّمي في جدول الضرب
        </h1>
        <p className="text-sm sm:text-base text-slate-600 mt-1 font-normal leading-relaxed">
          استكشف شبكة المئة حقيقة (١٠ × ١٠)، وتفقد أوسمتك الرياضية، وتعرف على الحقائق الموصى بمراجعتها!
        </p>
      </div>

      {/* المؤشرات الرئيسية */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs">
          <span className="text-xs sm:text-sm font-semibold text-slate-500 uppercase tracking-wide">
            الحقائق المتقنة
          </span>
          <div className="text-3xl font-extrabold text-emerald-600 font-sans mt-1">
            {toEastern(masteredCount)} <span className="text-sm font-medium text-slate-400">/ {toEastern(100)}</span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1 font-sans">
            {toEastern(Math.round((masteredCount / 100) * 100))}٪ من مجموع الجداول
          </p>
        </div>

        <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs">
          <span className="text-xs sm:text-sm font-semibold text-slate-500 uppercase tracking-wide">
            الحقائق المتدرب عليها
          </span>
          <div className="text-3xl font-extrabold text-indigo-600 font-sans mt-1">
            {toEastern(practicedCount)} <span className="text-sm font-medium text-slate-400">/ {toEastern(100)}</span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1 font-sans">{toEastern(totalAttempts)} محاولة إجمالية</p>
        </div>

        <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs">
          <span className="text-xs sm:text-sm font-semibold text-slate-500 uppercase tracking-wide">
            نسبة الدقة والضبط
          </span>
          <div className="text-3xl font-extrabold text-teal-600 font-sans mt-1">
            {toEastern(overallAccuracy)}٪
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">الصحة الإجمالية</p>
        </div>

        <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs">
          <span className="text-xs sm:text-sm font-semibold text-slate-500 uppercase tracking-wide">
            الأوسمة المستحقة
          </span>
          <div className="text-3xl font-extrabold text-amber-500 font-sans mt-1">
            {toEastern(progress.unlockedBadges.length)} <span className="text-sm font-medium text-slate-400">/ {toEastern(ALL_BADGES.length)}</span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">شارات التميز</p>
        </div>
      </div>

      {/* بطاقة سلسلة الحضور والمكافأة اليومية */}
      <div className="bg-linear-to-r from-amber-50 via-orange-50 to-amber-100/60 border border-amber-300 rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
            <Flame className="w-6 h-6 fill-amber-200 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-black text-slate-900">سلسلة الالتزام واللعب اليومي</h3>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-200 text-amber-900 border border-amber-300 font-sans">
                {toEastern(progress.dailyReward?.currentStreakDays || 0)} أيام متتالية
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 font-medium mt-0.5">
              كل يوم تفتح فيه التطبيق وتلعب يمنحك نجوماً إضافية وشارات تميز خاصة (٣ أيام و ٧ أيام)!
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            sound.playClick();
            setShowRewardModal(true);
          }}
          className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-900 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-transform active:scale-95 cursor-pointer"
        >
          <Gift className="w-4 h-4" />
          <span>{canClaimDailyReward() ? 'استلم مكافأة اليوم! 🌟' : 'عرض جدول المكافآت'}</span>
        </button>
      </div>

      {/* شبكة المئة حقيقة (10 × 10) */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              شبكة جدول الضرب ({toEastern(10)} × {toEastern(10)})
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 font-normal leading-relaxed">
              انقر على أي مربع لاستعراض تفاصيل إتقان المسألة ورؤية تمثيلها البصري!
            </p>
          </div>

          {/* مفتاح الألوان الدلالي */}
          <div className="flex items-center gap-3 text-xs sm:text-sm font-medium text-slate-600 flex-wrap">
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded-md bg-emerald-500 inline-block" />
              <span>متقنة</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded-md bg-amber-400 inline-block" />
              <span>قيد التدريب</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded-md bg-rose-400 inline-block" />
              <span>تحتاج تركيزاً</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded-md bg-slate-100 border border-slate-200 inline-block" />
              <span>لم تُجرَّب</span>
            </div>
          </div>
        </div>

        {/* جدول الشبكة بتوجيه عربي أصيل (RTL: الأعمدة من ١ إلى ١٠ من اليمين لليسار، وعمود الصفوف في أقصى اليمين) */}
        <div className="overflow-x-auto pb-2" dir="rtl">
          <div className="inline-block min-w-[500px] w-full">
            {/* رؤوس الأعمدة (١ إلى ١٠ من اليمين إلى اليسار مع خانة × في أقصى اليمين) */}
            <div className="grid grid-cols-11 gap-1.5 mb-1.5 text-center font-sans font-bold text-xs text-slate-500">
              <div className="flex items-center justify-center text-slate-400 font-black">×</div>
              {Array.from({ length: 10 }, (_, i) => i + 1).map((col) => (
                <div key={col} className="p-1 font-extrabold text-slate-700 font-sans">
                  {toEastern(col)}
                </div>
              ))}
            </div>

            {/* الصفوف من ١ إلى ١٠: رأس الصف في أقصى اليمين تليه الخلايا من عمود ١ إلى ١٠ */}
            {Array.from({ length: 10 }, (_, rIdx) => rIdx + 1).map((row) => (
              <div key={row} className="grid grid-cols-11 gap-1.5 mb-1.5 items-center">
                <div className="text-center font-sans font-extrabold text-xs text-slate-700">
                  {toEastern(row)}
                </div>

                {Array.from({ length: 10 }, (_, cIdx) => cIdx + 1).map((col) => {
                  const key = `${row}x${col}`;
                  const data = progress.factsMastery[key];
                  const product = row * col;

                  let cellColor = 'bg-slate-100 text-slate-600 hover:bg-slate-200 border-slate-200';
                  if (data && data.attempts > 0) {
                    const acc = data.correct / data.attempts;
                    if (data.isMastered) {
                      cellColor = 'bg-emerald-500 text-white hover:bg-emerald-600 border-emerald-600 font-black';
                    } else if (data.attempts >= 2 && acc < 0.7) {
                      cellColor = 'bg-rose-400 text-white hover:bg-rose-500 border-rose-500 font-black';
                    } else {
                      cellColor = 'bg-amber-300 text-amber-950 hover:bg-amber-400 border-amber-400 font-black';
                    }
                  }

                  const isInspected = inspectedFact?.a === row && inspectedFact?.b === col;

                  return (
                    <button
                      key={col}
                      type="button"
                      onClick={() => {
                        sound.playClick();
                        setInspectedFact({ a: row, b: col });
                      }}
                      className={`h-9 sm:h-11 rounded-xl border text-xs sm:text-sm font-sans tabular-nums flex items-center justify-center transition-all cursor-pointer shadow-2xs ${cellColor} ${
                        isInspected ? 'ring-3 ring-indigo-500 scale-105 z-10' : ''
                      }`}
                      title={`${toEastern(row)} × ${toEastern(col)} = ${toEastern(product)}`}
                      aria-label={`${toEastern(row)} ضرب ${toEastern(col)} يساوي ${toEastern(product)}`}
                    >
                      {toEastern(product)}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* نافذة تفاصيل فحص الحقيقة الرياضية */}
      {inspectedFact && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 text-right">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase">فحص حقيقة الضرب</span>
                <h3 className="text-2xl font-bold text-slate-900 font-sans" dir="rtl">
                  {toEastern(inspectedFact.a)} × {toEastern(inspectedFact.b)} = {toEastern(inspectedFact.a * inspectedFact.b)}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setInspectedFact(null)}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-xl cursor-pointer"
                aria-label="إغلاق"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {(() => {
              const key = `${inspectedFact.a}x${inspectedFact.b}`;
              const data = progress.factsMastery[key];

              return (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-2 text-center p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs sm:text-sm">
                    <div>
                      <span className="text-slate-500 block font-medium">الحالة</span>
                      <span className="font-bold text-slate-800">
                        {data?.isMastered ? 'متقنة 🌟' : data ? 'قيد التدريب' : 'لم تبدأ بعد'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block font-medium">المحاولات</span>
                      <span className="font-bold text-slate-800 font-sans">
                        {toEastern(data?.attempts || 0)}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block font-medium">متتالية صحيحة</span>
                      <span className="font-bold text-slate-800 font-sans">
                        {toEastern(data?.consecutiveCorrect || 0)}
                      </span>
                    </div>
                  </div>

                  <VisualGroupModel
                    factorA={inspectedFact.a}
                    factorB={inspectedFact.b}
                    mode="groups"
                    interactive={true}
                  />

                  <button
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      const tableNum = inspectedFact.a;
                      setInspectedFact(null);
                      onStartGame('choice', tableNum);
                    }}
                    className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>تدرّب على جدول الضرب في {toEastern(inspectedFact.a)} الآن</span>
                  </button>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* توصيات المراجعة التكيفية */}
      {trickyFacts.length > 0 && (
        <div className="bg-amber-50/70 border border-amber-200 rounded-3xl p-6 shadow-xs">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-5 h-5 text-amber-600" />
            <h2 className="text-base sm:text-lg font-bold text-amber-950">
              توصيات المراجعة التكيفية الذكية ({trickyFacts.length})
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-amber-800 mb-4 font-normal leading-relaxed">
            اكتشفت خوارزمية التعلم الذكية أن هذه المسائل واجهت بعض الصعوبة مؤخراً. انقر على أي منها للتدريب الفوري!
          </p>

          <div className="flex flex-wrap gap-2.5">
            {trickyFacts.map((tf, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  sound.playClick();
                  onStartGame('equation', tf.a);
                }}
                className="px-4 py-2 bg-white border border-amber-300 rounded-xl text-amber-950 font-sans font-bold text-xs sm:text-sm hover:bg-amber-100 transition-colors shadow-2xs flex items-center gap-2 cursor-pointer"
              >
                <span dir="rtl">{toEastern(tf.a)} × {toEastern(tf.b)} = {toEastern(tf.a * tf.b)}</span>
                <span className="text-[11px] sm:text-xs text-amber-700 font-medium font-sans">(دقة {toEastern(tf.accuracy)}٪)</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* استعراض الأوسمة والشارات المعتمدة */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <Award className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">
                أوسمة وشارات التميز الرياضي
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5 font-sans">
                حصلت على {toEastern(progress.unlockedBadges.length)} من أصل {toEastern(ALL_BADGES.length)} وساماً تشجيعياً
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold bg-amber-50 text-amber-800 px-3.5 py-1.5 rounded-full border border-amber-200 self-start sm:self-auto font-sans">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>نسبة إنجاز الأوسمة: {toEastern(Math.round((progress.unlockedBadges.length / ALL_BADGES.length) * 100))}٪</span>
          </div>
        </div>

        {/* بطاقات تسليط الضوء على أبرز الشارات المطلوبة: خبير جدول 5 + أكملت 100 مسألة */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {/* 1. بطاقة مميزة: خبير جدول الضرب 5 */}
          {(() => {
            const table5Badge = ALL_BADGES.find((b) => b.id === 'table5_master') || ALL_BADGES[4];
            const isUnlocked = progress.unlockedBadges.includes(table5Badge.id);
            const pInfo = getBadgeProgress(table5Badge);

            return (
              <div
                className={`p-5 rounded-3xl border-2 transition-all flex items-center gap-4 ${
                  isUnlocked
                    ? 'bg-gradient-to-r from-emerald-50 via-teal-50/60 to-white border-emerald-300 shadow-xs'
                    : 'bg-slate-50/80 border-slate-200'
                }`}
              >
                <div
                  className="cursor-pointer shrink-0"
                  onClick={() => {
                    sound.playClick();
                    setInspectedBadge(table5Badge);
                  }}
                >
                  <BadgeMedallion badge={table5Badge} isUnlocked={isUnlocked} size="lg" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                      شارة أساسية
                    </span>
                    <span className="text-xs font-bold text-slate-500 font-sans">جدول {toEastern(5)}</span>
                  </div>

                  <h3 className="text-base sm:text-lg font-black text-slate-900 truncate">
                    {table5Badge.title}
                  </h3>
                  <p className="text-xs text-slate-600 line-clamp-2 mt-0.5">
                    {table5Badge.description}
                  </p>

                  <div className="mt-3">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 mb-1 font-sans">
                      <span>{pInfo.text}</span>
                      <span>{toEastern(pInfo.percent)}٪</span>
                    </div>
                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                        style={{ width: `${pInfo.percent}%` }}
                      />
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <span className={`text-xs font-bold ${isUnlocked ? 'text-emerald-700' : 'text-slate-500'}`}>
                      {isUnlocked ? '✨ مستحقة ومكتسبة' : '⏳ قيد التدريب'}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        sound.playClick();
                        onStartGame('choice', 5);
                      }}
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer"
                    >
                      تدرّب على جدول {toEastern(5)}
                    </button>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* 2. بطاقة مميزة: أكملت 100 مسألة */}
          {(() => {
            const q100Badge = ALL_BADGES.find((b) => b.id === 'questions_100') || ALL_BADGES[12];
            const isUnlocked = progress.unlockedBadges.includes(q100Badge.id);
            const pInfo = getBadgeProgress(q100Badge);

            return (
              <div
                className={`p-5 rounded-3xl border-2 transition-all flex items-center gap-4 ${
                  isUnlocked
                    ? 'bg-gradient-to-r from-amber-50 via-yellow-50/60 to-white border-amber-300 shadow-xs'
                    : 'bg-slate-50/80 border-slate-200'
                }`}
              >
                <div
                  className="cursor-pointer shrink-0"
                  onClick={() => {
                    sound.playClick();
                    setInspectedBadge(q100Badge);
                  }}
                >
                  <BadgeMedallion badge={q100Badge} isUnlocked={isUnlocked} size="lg" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                      إنجاز استثنائي
                    </span>
                    <span className="text-xs font-bold text-slate-500 font-sans">{toEastern(100)} مسألة</span>
                  </div>

                  <h3 className="text-base sm:text-lg font-black text-slate-900 truncate">
                    {q100Badge.title}
                  </h3>
                  <p className="text-xs text-slate-600 line-clamp-2 mt-0.5">
                    {q100Badge.description}
                  </p>

                  <div className="mt-3">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 mb-1 font-sans">
                      <span>{pInfo.text}</span>
                      <span>{toEastern(pInfo.percent)}٪</span>
                    </div>
                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-500 rounded-full transition-all duration-500"
                        style={{ width: `${pInfo.percent}%` }}
                      />
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <span className={`text-xs font-bold ${isUnlocked ? 'text-amber-700' : 'text-slate-500'}`}>
                      {isUnlocked ? '✨ وسام الشرف مكتسب' : '⏳ ثابر لتحقيق الهدف'}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        sound.playClick();
                        onStartGame('equation', 0);
                      }}
                      className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer"
                    >
                      حل مسائل الآن
                    </button>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>

        {/* تصنيفات التصفية (Filter Tabs) */}
        <div className="flex flex-wrap items-center gap-2 mb-6 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 me-2">
            <Filter className="w-3.5 h-3.5" />
            <span>تصنيف:</span>
          </div>

          {[
            { id: 'all', label: 'جميع الأوسمة', count: ALL_BADGES.length },
            { id: 'table', label: 'إتقان الجداول (١–١٠)', count: ALL_BADGES.filter((b) => b.category === 'table').length },
            { id: 'questions', label: 'إنجازات المسائل', count: ALL_BADGES.filter((b) => b.category === 'questions').length },
            { id: 'streak', label: 'التحديات والسلاسل', count: ALL_BADGES.filter((b) => b.category === 'streak' || b.category === 'explorer').length },
            { id: 'unlocked', label: 'المستحقة فقط ✨', count: progress.unlockedBadges.length },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => {
                sound.playClick();
                setSelectedCategory(cat.id as any);
              }}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span>{cat.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-sans ${
                  selectedCategory === cat.id ? 'bg-white/25 text-white' : 'bg-slate-200 text-slate-700'
                }`}
              >
                {toEastern(cat.count)}
              </span>
            </button>
          ))}
        </div>

        {/* شبكة الأوسمة المتميزة بكاملها */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-4">
          {ALL_BADGES.filter((b) => {
            if (selectedCategory === 'all') return true;
            if (selectedCategory === 'unlocked') return progress.unlockedBadges.includes(b.id);
            if (selectedCategory === 'table') return b.category === 'table';
            if (selectedCategory === 'questions') return b.category === 'questions';
            if (selectedCategory === 'streak') return b.category === 'streak' || b.category === 'explorer';
            return true;
          }).map((b) => {
            const isUnlocked = progress.unlockedBadges.includes(b.id);
            const pInfo = getBadgeProgress(b);

            return (
              <button
                key={b.id}
                type="button"
                onClick={() => {
                  sound.playClick();
                  setInspectedBadge(b);
                }}
                className={`p-4 rounded-2xl border transition-all text-center flex flex-col justify-between items-center group cursor-pointer text-right ${
                  isUnlocked
                    ? 'bg-white border-amber-200/90 hover:border-amber-400 hover:shadow-md'
                    : 'bg-slate-50/70 border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex flex-col items-center w-full">
                  <div className="mb-2">
                    <BadgeMedallion badge={b} isUnlocked={isUnlocked} size="md" />
                  </div>
                  <h3 className="font-bold text-xs sm:text-sm text-slate-900 text-center mb-1 line-clamp-1 w-full">
                    {b.title}
                  </h3>
                  <p className="text-[11px] text-slate-500 font-normal text-center leading-relaxed line-clamp-2 w-full mb-2">
                    {b.description}
                  </p>
                </div>

                <div className="w-full mt-2 pt-2 border-t border-slate-100">
                  {/* شريط مصغر للتقدم */}
                  {!isUnlocked && (
                    <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden mb-1.5">
                      <div
                        className="h-full bg-slate-400 rounded-full"
                        style={{ width: `${pInfo.percent}%` }}
                      />
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[10px] font-bold">
                    <span className={isUnlocked ? 'text-amber-700' : 'text-slate-400'}>
                      {isUnlocked ? 'مستحقة ✨' : pInfo.text}
                    </span>
                    <span className={isUnlocked ? 'text-amber-600' : 'text-slate-400'}>
                      {isUnlocked ? '100%' : `${pInfo.percent}%`}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* نافذة استعراض تفاصيل الشارة (Badge Inspector Modal) */}
      {inspectedBadge && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setInspectedBadge(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-200 text-center relative animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
            dir="rtl"
          >
            <button
              type="button"
              onClick={() => setInspectedBadge(null)}
              className="absolute top-4 left-4 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {(() => {
              const isUnlocked = progress.unlockedBadges.includes(inspectedBadge.id);
              const pInfo = getBadgeProgress(inspectedBadge);

              return (
                <div className="space-y-4">
                  <div className="flex justify-center pt-2">
                    <BadgeMedallion badge={inspectedBadge} isUnlocked={isUnlocked} size="xl" />
                  </div>

                  <div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold mb-2 bg-slate-100 text-slate-700">
                      {isUnlocked ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-800">وسام مستحق ومكتسب</span>
                        </>
                      ) : (
                        <>
                          <Lock className="w-3.5 h-3.5 text-slate-500" />
                          <span>وسام قيد الإنجاز</span>
                        </>
                      )}
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                      {inspectedBadge.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
                      {inspectedBadge.description}
                    </p>
                  </div>

                  {/* بطاقة تقدم الإنجاز نحو الشارة */}
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-right">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1.5">
                      <span>التقدم الحالي: {pInfo.text}</span>
                      <span className="tabular-nums font-black">{pInfo.percent}%</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isUnlocked ? 'bg-emerald-600' : 'bg-amber-500'
                        }`}
                        style={{ width: `${pInfo.percent}%` }}
                      />
                    </div>
                  </div>

                  {/* أزرار الإجراءات للتدريب المباشر */}
                  <div className="pt-2 flex flex-col gap-2">
                    {inspectedBadge.category === 'table' && inspectedBadge.targetTable && (
                      <button
                        type="button"
                        onClick={() => {
                          const table = inspectedBadge.targetTable!;
                          setInspectedBadge(null);
                          onStartGame('choice', table);
                        }}
                        className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs transition-colors cursor-pointer text-sm"
                      >
                        تدرّب على جدول {toEastern(inspectedBadge.targetTable)} الآن
                      </button>
                    )}

                    {inspectedBadge.category === 'questions' && (
                      <button
                        type="button"
                        onClick={() => {
                          setInspectedBadge(null);
                          onStartGame('equation', 0);
                        }}
                        className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-xs transition-colors cursor-pointer text-sm"
                      >
                        ابدأ جولة حل مسائل فوراً
                      </button>
                    )}

                    {inspectedBadge.id === 'speed_champion' && (
                      <button
                        type="button"
                        onClick={() => {
                          setInspectedBadge(null);
                          onStartGame('timechallenge', 0);
                        }}
                        className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-xs transition-colors cursor-pointer text-sm"
                      >
                        خض تحدي الزمن وتغلب على الوقت
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => setInspectedBadge(null)}
                      className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors cursor-pointer text-xs"
                    >
                      إغلاق
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* نافذة المكافأة اليومية */}
      <DailyRewardModal
        isOpen={showRewardModal}
        onClose={() => setShowRewardModal(false)}
      />
    </div>
  );
};
