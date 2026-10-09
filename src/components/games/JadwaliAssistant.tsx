import React, { useEffect } from 'react';
import { FursanSymbol } from '../brand/FursanLogo.tsx';
import { Sparkles, X, Lightbulb, Heart } from 'lucide-react';
import { sound } from '../../utils/audio.ts';
import { toEastern } from '../../utils/arabicNumerals.ts';

interface JadwaliAssistantProps {
  factorA: number;
  factorB: number;
  isVisible: boolean;
  onDismiss: () => void;
  secondsElapsed?: number;
}

/**
 * يولّد تلميحاً تشجيعياً وبيداجوجياً ذكياً مخصصاً للمسألة المعروضة بالأرقام الهندية (المشرقية)
 */
export function getSmartAssistantHint(a: number, b: number): {
  headline: string;
  hintText: string;
  strategy: string;
} {
  const product = a * b;
  const ea = toEastern(a);
  const eb = toEastern(b);
  const ep = toEastern(product);

  // 1. مسألة 4 × 3 المذكورة في التوجيهات
  if ((a === 4 && b === 3) || (a === 3 && b === 4)) {
    return {
      headline: 'تلميح فُرسان الحساب 💡',
      hintText: 'تذكر أن ٤×٣ هي تكرار لـ ٣ أربع مرات (٣ + ٣ + ٣ + ٣ = ١٢)! خذ وقتك يا بطل.',
      strategy: 'الجمع المتكرر',
    };
  }

  // 2. الضرب في 0
  if (a === 0 || b === 0) {
    return {
      headline: 'قاعدة الصفر السحرية 🪄',
      hintText: 'تذكر أن أي عدد يُضرب في صفر يُصبح الناتج صفراً فوراً (٠)!',
      strategy: 'خاصية الضرب في صفر',
    };
  }

  // 3. الضرب في 1
  if (a === 1 || b === 1) {
    const other = a === 1 ? b : a;
    return {
      headline: 'العنصر المحايد 🥇',
      hintText: `تذكر أن الضرب في ١ لا يغير العدد أبداً، فالناتج يبقى كما هو (${toEastern(other)})!`,
      strategy: 'المحايد الضربي',
    };
  }

  // 4. جدول 2 (المضاعفة)
  if (a === 2 || b === 2) {
    const other = a === 2 ? b : a;
    const eo = toEastern(other);
    return {
      headline: 'سر جدول ٢: المضاعفة 🚲',
      hintText: `تذكر أن الضرب في ٢ يعني مجرد جمع العدد مع نفسه: ${eo} + ${eo} = ${ep}!`,
      strategy: 'مضاعفة العدد',
    };
  }

  // 5. جدول 5 (أصابع اليد)
  if (a === 5 || b === 5) {
    const other = a === 5 ? b : a;
    return {
      headline: 'جدول الخمسات الرائع 🖐️',
      hintText: `تذكر أن نواتج جدول ٥ تنتهي دائماً بـ ٠ أو ٥! فكّر فيها كـ ${toEastern(other)} قفزات بالخمسات.`,
      strategy: 'العد القفزي بالخمسات',
    };
  }

  // 6. جدول 10 (إضافة الصفر)
  if (a === 10 || b === 10) {
    const other = a === 10 ? b : a;
    return {
      headline: 'سحر جدول ١٠ 🪙',
      hintText: `الضرب في ١٠ سهل جداً، فقط ضع صفراً بجوار العدد ليصبح (${toEastern(other)}٠)!`,
      strategy: 'القيمة المكانية والعشرات',
    };
  }

  // 7. جدول 9 (حيلة الطرح من 10)
  if (a === 9 || b === 9) {
    const other = a === 9 ? b : a;
    const eo = toEastern(other);
    return {
      headline: 'حيلة جدول ٩ الذكية 🧙‍♂️',
      hintText: `اضرب في ١٠ أولاً (${eo}×١٠ = ${toEastern(other * 10)})، ثم اطرح ${eo} واحدة فقط ليصبح ${ep}!`,
      strategy: 'الضرب في ١٠ ثم الطرح',
    };
  }

  // 8. جدول 4 (المضاعفة المزدوجة)
  if (a === 4 || b === 4) {
    const other = a === 4 ? b : a;
    const half = other * 2;
    const eo = toEastern(other);
    const eh = toEastern(half);
    return {
      headline: 'المضاعفة المزدوجة لجدول ٤ 🍀',
      hintText: `ضاعف العدد أولاً (${eo} + ${eo} = ${eh})، ثم ضاعفه ثانية (${eh} + ${eh} = ${ep})!`,
      strategy: 'مضاعفة المضاعفات',
    };
  }

  // 9. الأعداد المتشابهة (المربعات)
  if (a === b) {
    return {
      headline: 'حقيقة الأعداد المتطابقة 🔲',
      hintText: `هذه مسألة مربع عدد (${ea} × ${ea})، تذكر مصفوفة شبكة ${ea} صفوف في ${ea} أعمدة!`,
      strategy: 'مصفوفة الضرب المربعة',
    };
  }

  // 10. التلميح العام بالجمع المتكرر وخاصية الإبدال
  return {
    headline: 'تلميح فُرسان الحساب 💡',
    hintText: `تذكر أن ${ea}×${eb} تعني تكرار لـ ${eb} ${ea} مرات! وتذكر أن ${ea}×${eb} هي نفسها ${eb}×${ea}.`,
    strategy: 'الجمع المتكرر والإبدال',
  };
}

export const JadwaliAssistant: React.FC<JadwaliAssistantProps> = ({
  factorA,
  factorB,
  isVisible,
  onDismiss,
}) => {
  const hintInfo = getSmartAssistantHint(factorA, factorB);

  useEffect(() => {
    if (isVisible) {
      sound.playHint();
    }
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <aside
      aria-label="مساعد فُرسان الحساب التعليمي الذكي"
      className="fixed bottom-4 left-4 sm:bottom-6 sm:left-6 z-40 max-w-sm sm:max-w-md w-[calc(100%-2rem)] sm:w-auto animate-in fade-in slide-in-from-bottom-4 duration-300 pointer-events-auto"
      dir="rtl"
    >
      <div className="relative bg-gradient-to-br from-amber-50 via-white to-emerald-50/70 border-2 border-emerald-400/80 rounded-3xl p-4 sm:p-5 shadow-xl text-right backdrop-blur-md">
        {/* زر الإغلاق السريع */}
        <button
          type="button"
          onClick={() => {
            sound.playClick();
            onDismiss();
          }}
          className="absolute top-3 left-3 p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          title="إغلاق التلميح"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-3.5">
          {/* درع مساعد فُرسان الحساب الذكي */}
          <div className="relative shrink-0">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-indigo-900 via-slate-900 to-emerald-700 p-0.5 shadow-md flex items-center justify-center animate-bounce-subtle">
              <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center relative overflow-hidden">
                <FursanSymbol sizePx={34} hasBackground={false} />
                {/* لمعة النجمة */}
                <Sparkles className="w-3.5 h-3.5 text-amber-300 absolute top-1 right-1 animate-pulse" />
              </div>
            </div>
            {/* مؤشر الحالة */}
            <span className="absolute -bottom-1 -left-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-amber-500 items-center justify-center text-[9px] text-white font-bold">
                💡
              </span>
            </span>
          </div>

          {/* محتوى فقاعة الحديث */}
          <div className="flex-1 pe-4">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-xs font-black text-slate-900 tracking-tight">
                مساعد فُرسان الحساب
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full border border-amber-200">
                {hintInfo.strategy}
              </span>
            </div>

            <p className="text-xs sm:text-sm font-semibold text-slate-800 leading-relaxed mb-3">
              {hintInfo.hintText}
            </p>

            <div className="flex items-center justify-between pt-2 border-t border-emerald-100 text-[11px] text-slate-500 font-medium">
              <div className="flex items-center gap-1 text-emerald-700 font-bold">
                <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
                <span>أنت تستطيع يا بطل!</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  onDismiss();
                }}
                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-colors cursor-pointer shadow-xs text-xs"
              >
                فهمت، شكراً! ✨
              </button>
            </div>
          </div>
        </div>

        {/* سهم فقاعة المحادثة (Speech Bubble Arrow) */}
        <div className="absolute -bottom-2 right-8 w-4 h-4 bg-white border-r-2 border-b-2 border-emerald-400/80 transform rotate-45"></div>
      </div>
    </aside>
  );
};
