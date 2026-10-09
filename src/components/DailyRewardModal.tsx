import React, { useState } from 'react';
import { useProgress } from '../context/ProgressContext.tsx';
import { sound } from '../utils/audio.ts';
import { toEastern } from '../utils/arabicNumerals.ts';
import { Sparkles, Calendar, Flame, Gift, Check, Clock, Star, Trophy, Award } from 'lucide-react';

interface DailyRewardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DailyRewardModal: React.FC<DailyRewardModalProps> = ({ isOpen, onClose }) => {
  const { progress, claimDailyReward, canClaimDailyReward } = useProgress();
  const [isClaiming, setIsClaiming] = useState(false);
  const [claimedReward, setClaimedReward] = useState<{ starsAdded: number; streak: number } | null>(null);

  if (!isOpen) return null;

  const currentStreak = progress.dailyReward?.currentStreakDays || 0;
  const isClaimable = canClaimDailyReward();

  // Streak days preview (Day 1 to 7)
  const days = [
    { day: 1, stars: 3, label: 'اليوم ١', perk: 'نقطة الانطلاق 🚀' },
    { day: 2, stars: 4, label: 'اليوم ٢', perk: 'حماس متواصل ⚡' },
    { day: 3, stars: 5, label: 'اليوم ٣', perk: 'وسام المثابر 🔥' },
    { day: 4, stars: 6, label: 'اليوم ٤', perk: 'قوة العقل 💡' },
    { day: 5, stars: 7, label: 'اليوم ٥', perk: 'نجم الحساب ✨' },
    { day: 6, stars: 8, label: 'اليوم ٦', perk: 'قريب من التاج 🏆' },
    { day: 7, stars: 10, label: 'اليوم ٧', perk: 'صندوق الكنز الكبير 👑' },
  ];

  // Active day index in 7-day cycle (0 to 6)
  const activeCycleIndex = isClaimable ? currentStreak % 7 : Math.max(0, (currentStreak - 1) % 7);

  const handleClaim = async () => {
    if (!isClaimable || isClaiming) return;
    setIsClaiming(true);
    try {
      const res = await claimDailyReward();
      setClaimedReward(res);
      sound.playCelebration();
    } catch (e) {
      console.error(e);
    } finally {
      setIsClaiming(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-amber-200 relative overflow-hidden text-right"
        dir="rtl"
      >
        {/* Decorative backdrop gradients */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-amber-100 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-100 rounded-full blur-3xl pointer-events-none -ml-16 -mb-16" />

        {/* Header */}
        <div className="relative z-10 flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-linear-to-tr from-amber-500 to-yellow-400 text-white flex items-center justify-center shadow-md shadow-amber-500/20">
              <Gift className="w-6 h-6 animate-bounce" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
                <span>مكافأة الحضور اليومي</span>
                <Sparkles className="w-5 h-5 text-amber-500" />
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                افتح التطبيق يومياً واحصل على نجوم إضافية لتعزيز تميزك!
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
            aria-label="إغلاق"
          >
            ✕
          </button>
        </div>

        {/* Current streak badge banner */}
        <div className="relative z-10 mt-5 p-4 rounded-2xl bg-linear-to-r from-amber-50 via-orange-50 to-amber-100/60 border border-amber-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500 text-white shadow-xs">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-amber-800">سلسلة الاستمرارية واللعب</div>
              <div className="text-lg font-black text-slate-900 tabular-nums">
                {currentStreak > 0 ? `${toEastern(currentStreak)} أيام متتالية!` : 'ابدأ أول يوم اليوم!'}
              </div>
            </div>
          </div>

          <div className="text-left">
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-white/80 border border-amber-300 rounded-full text-xs font-bold text-amber-900 shadow-xs">
              <Award className="w-3.5 h-3.5 text-amber-600" />
              <span>إجمالي الهدايا: {toEastern(progress.dailyReward?.totalDailyClaims || 0)}</span>
            </span>
          </div>
        </div>

        {/* 7-Days Visual Track */}
        <div className="relative z-10 mt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-700">جدول مكافآت الأيام السبعة:</span>
            <span className="text-xs font-semibold text-emerald-600">
              {isClaimable ? '✨ هديتك اليوم جاهزة للاستلام!' : '✅ تم استلام هدية اليوم'}
            </span>
          </div>

          <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
            {days.map((item, idx) => {
              const isPast = !isClaimable && idx < activeCycleIndex;
              const isToday = idx === activeCycleIndex;
              const isSpecial = item.day === 7;

              return (
                <div
                  key={item.day}
                  className={`relative p-2 rounded-xl border text-center flex flex-col items-center justify-between transition-all ${
                    isToday
                      ? isClaimable
                        ? 'bg-amber-100 border-amber-400 ring-2 ring-amber-300 shadow-sm scale-105'
                        : 'bg-emerald-50 border-emerald-300 shadow-xs'
                      : isPast
                      ? 'bg-slate-100/80 border-slate-200 text-slate-400'
                      : isSpecial
                      ? 'bg-linear-to-b from-amber-50 to-yellow-100 border-amber-300'
                      : 'bg-white border-slate-200 text-slate-700'
                  }`}
                >
                  <span className="text-[10px] font-bold text-slate-500 mb-1">{item.label}</span>

                  <div className="my-1">
                    {isPast ? (
                      <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs shadow-xs mx-auto">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <Star
                          className={`w-5 h-5 ${
                            isToday || isSpecial
                              ? 'fill-amber-400 text-amber-500'
                              : 'fill-slate-200 text-slate-300'
                          }`}
                        />
                        <span className="text-xs font-black text-slate-800 tabular-nums">
                          +{toEastern(item.stars)}
                        </span>
                      </div>
                    )}
                  </div>

                  {isToday && isClaimable && (
                    <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500" />
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Claimed feedback success message */}
        {claimedReward && (
          <div className="relative z-10 mt-5 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 animate-in zoom-in-95 duration-200 flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500 text-white rounded-xl shadow-xs">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <div className="text-sm font-black">تهانينا يا بطل! 🎉</div>
              <div className="text-xs font-semibold text-emerald-800">
                أضيفت +{toEastern(claimedReward.starsAdded)} نجوم إلى رصيدك! بلغت سلسلتك {toEastern(claimedReward.streak)} أيام متتالية!
              </div>
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="relative z-10 mt-6 pt-4 border-t border-slate-100 flex items-center gap-3">
          {isClaimable ? (
            <button
              type="button"
              onClick={handleClaim}
              disabled={isClaiming}
              className="flex-1 py-3.5 px-6 rounded-2xl bg-linear-to-r from-amber-500 via-amber-400 to-yellow-400 hover:from-amber-600 hover:to-amber-500 text-slate-900 font-black text-base shadow-lg shadow-amber-500/25 transition-transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              <Gift className="w-5 h-5 fill-slate-900" />
              <span>{isClaiming ? 'جاري الاستلام...' : 'استلم نجوم اليوم الآن! 🌟'}</span>
            </button>
          ) : (
            <div className="flex-1 py-3 px-4 rounded-2xl bg-slate-100 border border-slate-200 text-slate-600 flex items-center justify-center gap-2 text-sm font-bold">
              <Clock className="w-4 h-4 text-slate-500" />
              <span>عد غداً لمتابعة سلسلتك وكسب نجوم إضافية! 👏</span>
            </div>
          )}

          <button
            type="button"
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="py-3.5 px-5 rounded-2xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-sm transition-colors cursor-pointer"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
