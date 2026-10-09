import React, { useState } from 'react';
import { useProgress } from '../context/ProgressContext.tsx';
import { sound } from '../utils/audio.ts';
import { FursanLogo } from '../components/brand/FursanLogo.tsx';
import { User, Cloud, LogIn, LogOut, RotateCcw, Volume2, VolumeX, Sparkles, Smile, Trophy, CheckCircle2 } from 'lucide-react';

export const SettingsScreen: React.FC = () => {
  const {
    progress,
    updateSettings,
    currentUser,
    signInWithGoogle,
    signOutUser,
    resetProgress,
  } = useProgress();

  const [nameInput, setNameInput] = useState<string>(progress.playerName);
  const [showConfirmReset, setShowConfirmReset] = useState<boolean>(false);
  const [saveToast, setSaveToast] = useState<boolean>(false);
  const [audioFeedbackText, setAudioFeedbackText] = useState<string | null>(null);

  const handleSaveName = () => {
    sound.playClick();
    if (nameInput.trim()) {
      updateSettings({ playerName: nameInput.trim() });
      setSaveToast(true);
      setTimeout(() => setSaveToast(false), 1500);
    }
  };

  const handleToggleSound = () => {
    const next = !progress.soundEnabled;
    updateSettings({ soundEnabled: next });
    sound.setEnabled(next);
    if (next) {
      sound.playClick();
      setAudioFeedbackText('تم تفعيل المؤثرات الصوتية بنجاح 🔊');
    } else {
      setAudioFeedbackText('تم كتم المؤثرات الصوتية 🔇');
    }
    setTimeout(() => setAudioFeedbackText(null), 2000);
  };

  const handleVolumeChange = (vol: number, label: string) => {
    updateSettings({ soundVolume: vol });
    sound.setVolume(vol);
    if (progress.soundEnabled) {
      sound.playClick();
      setAudioFeedbackText(`تم ضبط مستوى الصوت: ${label}`);
      setTimeout(() => setAudioFeedbackText(null), 1800);
    }
  };

  const handleTestCorrectSound = () => {
    sound.unlock();
    if (!progress.soundEnabled) {
      // Temporarily enable for test or notify
      sound.setEnabled(true);
      sound.playCorrect();
      setTimeout(() => sound.setEnabled(progress.soundEnabled), 500);
    } else {
      sound.playCorrect();
    }
    setAudioFeedbackText('🌟 نغمة الإجابة الصحيحة: لحن تشجيعي مبهج ومحفز!');
    setTimeout(() => setAudioFeedbackText(null), 2500);
  };

  const handleTestWrongSound = () => {
    sound.unlock();
    if (!progress.soundEnabled) {
      sound.setEnabled(true);
      sound.playTryAgain();
      setTimeout(() => sound.setEnabled(progress.soundEnabled), 500);
    } else {
      sound.playTryAgain();
    }
    setAudioFeedbackText('💡 نغمة الخطأ الهادئة: صوت دافئ ومريح يدعو للتفكير دون إحباط');
    setTimeout(() => setAudioFeedbackText(null), 2500);
  };

  const handleTestCelebrationSound = () => {
    sound.unlock();
    if (!progress.soundEnabled) {
      sound.setEnabled(true);
      sound.playCelebration();
      setTimeout(() => sound.setEnabled(progress.soundEnabled), 700);
    } else {
      sound.playCelebration();
    }
    setAudioFeedbackText('🏆 نغمة الفوز: لحن احتفالي لإتقان الحقائق والنجوم!');
    setTimeout(() => setAudioFeedbackText(null), 2500);
  };

  const handleToggleReducedMotion = () => {
    sound.playClick();
    updateSettings({ reducedMotion: !progress.reducedMotion });
  };

  const handleReset = async () => {
    sound.playClick();
    await resetProgress();
    setShowConfirmReset(false);
  };

  const currentVol = progress.soundVolume ?? 0.8;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6 text-right">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug">
          الإعدادات والتفضيلات
        </h1>
        <p className="text-sm sm:text-base text-slate-600 mt-1 font-normal leading-relaxed">
          تخصيص ملف الطالب الرياضي، والمؤثرات الصوتية، وسهولة الوصول، والمزامنة السحابية.
        </p>
      </div>

      {/* بطاقة تعريف هوية التطبيق فُرسان الحساب */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-emerald-950 border border-amber-400/40 rounded-3xl p-6 shadow-md flex items-center justify-between text-white">
        <FursanLogo
          variant="primary"
          size="md"
          theme="dark"
          subtitle="المنصة التعليمية التفاعلية لإتقان الرياضيات وحقائق جدول الضرب"
        />
      </div>

      {/* بطاقة اسم الطالب */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 text-slate-900">
          <User className="w-5 h-5 text-emerald-600" />
          <h2 className="text-base sm:text-lg font-bold">اسم الطالب أو البطل</h2>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            placeholder="اسم الطالب (مثل: حمد، سارة، فيصل)"
            maxLength={25}
            className="flex-1 px-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50 text-slate-900 text-sm font-semibold focus:outline-emerald-500"
          />

          <button
            type="button"
            onClick={handleSaveName}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            حفظ الاسم
          </button>
        </div>

        {saveToast && (
          <span className="text-xs sm:text-sm text-emerald-700 font-semibold block">
            ✓ تم حفظ اسم الطالب بنجاح!
          </span>
        )}
      </div>

      {/* بطاقة نظام الصوتيات والمؤثرات التعليمية */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5 text-slate-900">
            <div className={`p-2 rounded-2xl ${progress.soundEnabled ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
              {progress.soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">نظام المؤثرات الصوتية والأنغام</h2>
              <p className="text-xs sm:text-sm text-slate-500 font-normal">
                مؤثرات تشجيعية عند الإجابة الصحيحة وأصوات هادئة مريحة عند الخطأ
              </p>
            </div>
          </div>

          {/* شارة حالة الصوت الحالية */}
          <span
            className={`text-xs font-bold px-3 py-1 rounded-full ${
              progress.soundEnabled
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-slate-100 text-slate-600'
            }`}
          >
            {progress.soundEnabled ? 'مُفعّل 🔊' : 'مكتوم 🔇'}
          </span>
        </div>

        {/* رسالة التفاعل اللحظية عند تغيير الصوت أو اختباره */}
        {audioFeedbackText && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-semibold rounded-2xl flex items-center gap-2 transition-all">
            <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{audioFeedbackText}</span>
          </div>
        )}

        {/* زر التحكم الرئيسي في الصوت (تشغيل / كتم) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
          <div>
            <div className="text-sm sm:text-base font-bold text-slate-900">
              زر تشغيل / كتم الصوت
            </div>
            <p className="text-xs sm:text-sm text-slate-600 font-normal mt-0.5">
              {progress.soundEnabled
                ? 'المؤثرات الصوتية تعمل الآن في جميع ألعاب وأنشطة جدول الضرب.'
                : 'تم كتم الصوت. لن تصدر أية نغمات أثناء حل المسائل أو التدريب.'}
            </p>
          </div>

          <button
            type="button"
            onClick={handleToggleSound}
            aria-label={progress.soundEnabled ? 'كتم الصوت' : 'تشغيل الصوت'}
            className={`px-5 py-2.5 rounded-2xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs ${
              progress.soundEnabled
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
            }`}
          >
            {progress.soundEnabled ? (
              <>
                <VolumeX className="w-4 h-4" />
                <span>كتم الصوت</span>
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4" />
                <span>تشغيل الصوت</span>
              </>
            )}
          </button>
        </div>

        {/* ضبط مستوى الصوت (درجة العلو) */}
        <div className="space-y-2.5">
          <label className="text-xs sm:text-sm font-bold text-slate-800 block">
            مستوى علو الصوت (مناسب لبيئة الصف أو المنزل):
          </label>
          <div className="grid grid-cols-3 gap-2.5">
            <button
              type="button"
              onClick={() => handleVolumeChange(0.35, 'هادئ وخافت')}
              className={`py-2 px-3 rounded-2xl text-xs sm:text-sm font-bold border transition-all cursor-pointer ${
                Math.abs(currentVol - 0.35) < 0.1
                  ? 'bg-emerald-50 border-emerald-500 text-emerald-800 ring-1 ring-emerald-400'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              🔉 هادئ (للصف)
            </button>
            <button
              type="button"
              onClick={() => handleVolumeChange(0.75, 'معتدل ومتوازن')}
              className={`py-2 px-3 rounded-2xl text-xs sm:text-sm font-bold border transition-all cursor-pointer ${
                Math.abs(currentVol - 0.75) < 0.1
                  ? 'bg-emerald-50 border-emerald-500 text-emerald-800 ring-1 ring-emerald-400'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              🔊 معتدل (افتراضي)
            </button>
            <button
              type="button"
              onClick={() => handleVolumeChange(1.0, 'واضح ونشيط')}
              className={`py-2 px-3 rounded-2xl text-xs sm:text-sm font-bold border transition-all cursor-pointer ${
                Math.abs(currentVol - 1.0) < 0.1
                  ? 'bg-emerald-50 border-emerald-500 text-emerald-800 ring-1 ring-emerald-400'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              📢 واضح ونشيط
            </button>
          </div>
        </div>

        {/* أزرار تجربة واختبار الأصوات فورياً */}
        <div className="pt-2 border-t border-slate-100 space-y-3">
          <div className="text-xs sm:text-sm font-bold text-slate-800">
            تجربة المؤثرات الصوتية (انقر للاستماع والمقارنة):
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {/* زر تجربة الإجابة الصحيحة */}
            <button
              type="button"
              onClick={handleTestCorrectSound}
              className="p-3 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 text-emerald-900 rounded-2xl text-xs sm:text-sm font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
            >
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>الإجابة الصحيحة 🌟</span>
            </button>

            {/* زر تجربة الخطأ الهادئ */}
            <button
              type="button"
              onClick={handleTestWrongSound}
              className="p-3 bg-indigo-50 hover:bg-indigo-100/80 border border-indigo-200 text-indigo-900 rounded-2xl text-xs sm:text-sm font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
            >
              <Smile className="w-4 h-4 text-indigo-600" />
              <span>خطأ هادئ للتفكير 💡</span>
            </button>

            {/* زر تجربة الاحتفال والفوز */}
            <button
              type="button"
              onClick={handleTestCelebrationSound}
              className="p-3 bg-amber-50 hover:bg-amber-100/80 border border-amber-200 text-amber-900 rounded-2xl text-xs sm:text-sm font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
            >
              <Trophy className="w-4 h-4 text-amber-600" />
              <span>نغمة الفوز والتألق 🏆</span>
            </button>
          </div>

          <p className="text-[11px] sm:text-xs text-slate-500 font-normal leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
            💡 ملاحظة تربوية: تم تصميم النغمات خصيصاً لتناسب المتعلمين في المرحلة الابتدائية؛ فنغمة الإجابة الصحيحة تحفّز الطفل بنغمات مبهجة، ونغمة الخطأ هادئة تماماً ولا تُصدر أي ضجيج منفر أو عقابي لحماية ثقة الطالب بنفسه أثناء التعلّم.
          </p>
        </div>
      </div>

      {/* بطاقة سهولة الوصول وتقليل الحركة */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
        <h2 className="text-base sm:text-lg font-bold text-slate-900">سهولة الوصول والراحة البصرية</h2>

        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm sm:text-base font-bold text-slate-900">تقليل الحركة (حركة هادئة)</div>
            <p className="text-xs sm:text-sm text-slate-500 font-normal mt-0.5">
              تقليل المؤثرات المتحركة والقفزات لراحة بصرية للأطفال ذوي الحساسية.
            </p>
          </div>

          <button
            type="button"
            onClick={handleToggleReducedMotion}
            aria-label={progress.reducedMotion ? 'تعطيل تقليل الحركة' : 'تفعيل تقليل الحركة'}
            className={`w-14 h-8 rounded-full transition-colors relative cursor-pointer ${
              progress.reducedMotion ? 'bg-indigo-600' : 'bg-slate-300'
            }`}
          >
            <div
              className={`w-6 h-6 rounded-full bg-white absolute top-1 transition-transform ${
                progress.reducedMotion ? 'left-1' : 'right-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* المزامنة السحابية وقاعدة البيانات */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 text-slate-900">
          <Cloud className="w-5 h-5 text-indigo-600" />
          <h2 className="text-base sm:text-lg font-bold">المزامنة السحابية وقاعدة بيانات PostgreSQL</h2>
        </div>

        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
          يتم حفظ تقدّمك تلقائياً على هذا الجهاز. سجّل الدخول عبر Google لمزامنة حقائق الضرب المتقنة والنجوم في قاعدة البيانات السحابية PostgreSQL عبر مختلف الأجهزة بأمان.
        </p>

        {currentUser ? (
          <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-2xl border border-emerald-200">
            <div>
              <span className="text-xs font-semibold text-emerald-800 uppercase block">مسجّل الدخول حالياً</span>
              <span className="text-sm sm:text-base font-bold text-slate-900">{currentUser.displayName || currentUser.email}</span>
            </div>

            <button
              type="button"
              onClick={signOutUser}
              className="px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs sm:text-sm font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>تسجيل الخروج</span>
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={signInWithGoogle}
            className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <LogIn className="w-4 h-4" />
            <span>تسجيل الدخول عبر Google للمزامنة السحابية</span>
          </button>
        )}
      </div>

      {/* إعادة تعيين التقدم */}
      <div className="bg-rose-50/50 border border-rose-200 rounded-3xl p-6 shadow-xs space-y-3">
        <div className="flex items-center gap-2 text-rose-900">
          <RotateCcw className="w-4 h-4 text-rose-600" />
          <h3 className="font-bold text-sm sm:text-base">إعادة تعيين تقدّم التعلّم</h3>
        </div>

        <p className="text-xs sm:text-sm text-rose-700 font-normal">
          يؤدي هذا الإجراء إلى تصفير النجوم والمستويات وسجل الإتقان للبدء من جديد.
        </p>

        {showConfirmReset ? (
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs sm:text-sm rounded-xl cursor-pointer"
            >
              نعم، أعد التعيين الآن
            </button>
            <button
              type="button"
              onClick={() => setShowConfirmReset(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs sm:text-sm rounded-xl cursor-pointer"
            >
              إلغاء
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowConfirmReset(true)}
            className="px-4 py-2 bg-white border border-rose-300 text-rose-700 hover:bg-rose-100 rounded-xl text-xs sm:text-sm font-semibold cursor-pointer"
          >
            إعادة تعيين التقدم...
          </button>
        )}
      </div>
    </div>
  );
};
