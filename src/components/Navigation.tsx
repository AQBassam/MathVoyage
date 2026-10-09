import React, { useState } from 'react';
import { ScreenType } from '../types/game.ts';
import { useProgress } from '../context/ProgressContext.tsx';
import { sound } from '../utils/audio.ts';
import { toEastern } from '../utils/arabicNumerals.ts';
import { DailyRewardModal } from './DailyRewardModal.tsx';
import { FursanLogo } from './brand/FursanLogo.tsx';
import { Volume2, VolumeX, Star, LogIn, User, Gift, Flame } from 'lucide-react';

interface NavigationProps {
  currentScreen: ScreenType;
  onNavigate: (screen: ScreenType) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ currentScreen, onNavigate }) => {
  const { progress, updateSettings, currentUser, signInWithGoogle, signOutUser, canClaimDailyReward } = useProgress();
  const [showRewardModal, setShowRewardModal] = useState<boolean>(false);

  const isRewardReady = canClaimDailyReward();
  const streak = progress.dailyReward?.currentStreakDays || 0;

  const toggleSound = () => {
    const next = !progress.soundEnabled;
    updateSettings({ soundEnabled: next });
    sound.setEnabled(next);
    if (next) sound.playClick();
  };

  const navLinks: Array<{ label: string; screen: ScreenType }> = [
    { label: 'الرئيسية', screen: 'home' },
    { label: 'المختبر البصري', screen: 'learn' },
    { label: 'جداول الضرب', screen: 'table_select' },
    { label: 'ألعاب الضرب', screen: 'game_select' },
    { label: 'إنجازاتي وتقدّمي', screen: 'progress' },
    { label: 'لوحة المعلم والأسرة', screen: 'dashboard' },
  ];

  return (
    <header className="w-full bg-white border-b border-slate-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* المنطقة 1: شعار التطبيق الرسمي (فُرسان الحساب) */}
        <button
          type="button"
          onClick={() => onNavigate('home')}
          className="cursor-pointer text-right transition-opacity hover:opacity-90 focus:outline-hidden"
          aria-label="الصفحة الرئيسية - فُرسان الحساب"
        >
          <FursanLogo variant="header" size="md" interactive={false} />
        </button>

        {/* المنطقة 2: روابط التصفح الصريحة والأنيقة */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-semibold text-slate-600">
          {navLinks.map((item) => (
            <button
              key={item.screen}
              type="button"
              onClick={() => onNavigate(item.screen)}
              className={`transition-colors cursor-pointer whitespace-nowrap py-1 ${
                currentScreen === item.screen
                  ? 'text-emerald-700 font-bold border-b-2 border-emerald-600 pb-0.5'
                  : 'hover:text-slate-900 font-medium'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* المنطقة 3: الإجراءات الأساسية */}
        <div className="flex items-center gap-2.5">
          {/* زر الصوت */}
          <button
            type="button"
            onClick={toggleSound}
            aria-label={progress.soundEnabled ? 'كتم المؤثرات الصوتية' : 'تشغيل المؤثرات الصوتية'}
            title={progress.soundEnabled ? 'كتم الصوت' : 'تشغيل الصوت'}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            {progress.soundEnabled ? (
              <Volume2 className="w-5 h-5 text-emerald-600" />
            ) : (
              <VolumeX className="w-5 h-5 text-slate-400" />
            )}
          </button>

          {/* زر المكافأة اليومية */}
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              setShowRewardModal(true);
            }}
            className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs ${
              isRewardReady
                ? 'bg-amber-400 hover:bg-amber-300 text-slate-900 ring-2 ring-amber-300'
                : 'bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200'
            }`}
            title="مكافأة الحضور اليومي وسلسلة اللعب"
          >
            <Gift className={`w-4 h-4 ${isRewardReady ? 'animate-bounce' : 'text-amber-700'}`} />
            <span className="hidden sm:inline">{isRewardReady ? 'مكافأة اليوم!' : 'المكافأة'}</span>
            {streak > 0 && (
              <span className="flex items-center gap-0.5 text-[11px] font-extrabold text-orange-600 bg-white/70 px-1.5 py-0.2 rounded-md font-sans">
                <Flame className="w-3 h-3 fill-orange-500" />
                <span>{toEastern(streak)}</span>
              </span>
            )}
            {isRewardReady && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
              </span>
            )}
          </button>

          {/* عداد النجوم */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs sm:text-sm font-bold font-sans">
            <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
            <span>{toEastern(progress.stars)}</span>
            <span className="text-[11px] font-medium text-amber-700 hidden sm:inline">نجمة</span>
          </div>

          {/* حفظ الحساب / تسجيل الدخول */}
          {currentUser ? (
            <button
              type="button"
              onClick={signOutUser}
              title={`مسجّل باسم: ${currentUser.displayName || currentUser.email}. انقر لتسجيل الخروج.`}
              className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 border border-slate-200 rounded-xl px-3 py-1.5 hover:bg-slate-50 cursor-pointer whitespace-nowrap"
            >
              <User className="w-3.5 h-3.5 text-emerald-600" />
              <span className="truncate max-w-[100px]">{currentUser.displayName || 'البطل'}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={signInWithGoogle}
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors cursor-pointer whitespace-nowrap shadow-xs"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>حفظ في السحابة</span>
            </button>
          )}

          {/* الإعدادات للجوال */}
          <button
            type="button"
            onClick={() => onNavigate('settings')}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            aria-label="الإعدادات والتفضيلات"
            title="الإعدادات والتفضيلات"
          >
            ⚙️
          </button>
        </div>
      </div>

      {/* شريط التصفح السفلي للهواتف الذكية */}
      <div className="flex lg:hidden overflow-x-auto border-t border-slate-100 px-3 py-2 gap-4 text-xs font-semibold text-slate-600 scrollbar-none">
        {navLinks.map((item) => (
          <button
            key={item.screen}
            type="button"
            onClick={() => onNavigate(item.screen)}
            className={`whitespace-nowrap py-1 cursor-pointer ${
              currentScreen === item.screen ? 'text-emerald-700 font-bold border-b-2 border-emerald-600' : 'font-medium'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* نافذة المكافأة اليومية */}
      <DailyRewardModal
        isOpen={showRewardModal}
        onClose={() => setShowRewardModal(false)}
      />
    </header>
  );
};
