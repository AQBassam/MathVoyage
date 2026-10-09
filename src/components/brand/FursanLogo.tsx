import React from 'react';

export type LogoVariant = 'header' | 'primary' | 'icon' | 'badge' | 'stacked';
export type LogoSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface FursanLogoProps {
  variant?: LogoVariant;
  size?: LogoSize;
  showSubtitle?: boolean;
  subtitle?: string;
  theme?: 'dark' | 'light' | 'monochrome';
  className?: string;
  interactive?: boolean;
  onClick?: () => void;
}

/**
 * رمز «فرسان الحساب» (Math Knight Mastery Emblem)
 * درع هندسي حديث يرمز إلى القوة المعرفية والإتقان الرياضي،
 * يدمج في قلبه مصفوفة علامة الضرب الحركية (×) مع نجمة التميز الذهبية ذات الرؤوس الأربعة،
 * في تشكيل هندسي متوازن يعبر عن التحدي والاكتشاف والثقة دون أي طابع قتالي أو رسوم طفولية مفرطة.
 */
export const FursanSymbol: React.FC<{
  sizePx?: number;
  hasBackground?: boolean;
  className?: string;
}> = ({ sizePx = 36, hasBackground = false, className = '' }) => {
  return (
    <svg
      width={sizePx}
      height={sizePx}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 select-none ${className}`}
      aria-hidden="true"
    >
      <defs>
        {/* تدرجات الهوية البصرية لفرسان الحساب */}
        <linearGradient id="fursan-shield-bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0F172A" />
          <stop offset="50%" stopColor="#1E293B" />
          <stop offset="100%" stopColor="#064E3B" />
        </linearGradient>

        <linearGradient id="fursan-emerald" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#34D399" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>

        <linearGradient id="fursan-indigo" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#60A5FA" />
          <stop offset="100%" stopColor="#2563EB" />
        </linearGradient>

        <linearGradient id="fursan-gold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FDE047" />
          <stop offset="50%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>

        <linearGradient id="fursan-cyan" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="100%" stopColor="#0284C7" />
        </linearGradient>

        <linearGradient id="fursan-rim" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FDE047" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#10B981" stopOpacity="0.4" />
        </linearGradient>
      </defs>

      {/* خلفية الحاوية (في نمط الشارة أو الأيقونة المستقلة) */}
      {hasBackground && (
        <g>
          {/* إطار الشارة الناعم المستدير */}
          <rect x="2" y="2" width="96" height="96" rx="24" fill="url(#fursan-shield-bg)" />
          <rect
            x="3"
            y="3"
            width="94"
            height="94"
            rx="23"
            fill="none"
            stroke="url(#fursan-rim)"
            strokeWidth="1.5"
            opacity="0.6"
          />
        </g>
      )}

      {/* درع فارس الحساب (The Knight's Math Shield) */}
      <g id="knight-shield-group">
        {/* ظل خفيف للدرع */}
        <path
          d="M 50 9 C 71 9, 87 18, 88 36 C 88 64, 67 82, 50 92 C 33 82, 12 64, 12 36 C 13 18, 29 9, 50 9 Z"
          fill="#022C22"
          opacity={hasBackground ? '0.4' : '0.1'}
        />

        {/* جسم الدرع الرئيسي الأملس */}
        <path
          d="M 50 11 C 70 11, 85 19.5, 86 36.5 C 86 62.5, 66 80, 50 89 C 34 80, 14 62.5, 14 36.5 C 15 19.5, 30 11, 50 11 Z"
          fill={hasBackground ? '#0F172A' : '#064E3B'}
          stroke="url(#fursan-gold)"
          strokeWidth="2.2"
          strokeLinejoin="round"
        />

        {/* تاج الشرف الرياضي العلوي (The Crest Chevron) */}
        <path
          d="M 50 15 L 68 25 L 50 20 L 32 25 Z"
          fill="url(#fursan-gold)"
          opacity="0.95"
        />

        {/* مصفوفة الضرب الحركية في قلب الدرع (×) */}
        {/* أربعة أجنحة هندسية متقاطعة بزاوية 45 درجة تمثل علامة الضرب وتدفق العمليات */}
        <g transform="translate(50, 52)">
          {/* الذراع الشمالي الشرقي: زمردي صاعد */}
          <path
            d="M 3 -3 L 18 -18 C 21 -21, 25 -19, 24 -15 L 18 -5 L 3 -3 Z"
            fill="url(#fursan-emerald)"
          />
          {/* الذراع الجنوبي الشرقي: أزرق ملكي متقدم */}
          <path
            d="M 3 3 L 18 18 C 21 21, 19 25, 15 24 L 5 18 L 3 3 Z"
            fill="url(#fursan-indigo)"
          />
          {/* الذراع الجنوبي الغربي: سماوي دقيق */}
          <path
            d="M -3 3 L -18 18 C -21 21, -25 19, -24 15 L -18 5 L -3 3 Z"
            fill="url(#fursan-cyan)"
          />
          {/* الذراع الشمالي الغربي: زمردي فاتح */}
          <path
            d="M -3 -3 L -18 -18 C -21 -21, -19 -25, -15 -24 L -5 -18 L -3 -3 Z"
            fill="url(#fursan-emerald)"
          />

          {/* محاور مصفوفة التناظر الماسية */}
          <rect
            x="-4.5"
            y="-4.5"
            width="9"
            height="9"
            rx="2"
            transform="rotate(45)"
            fill="#0F172A"
            stroke="url(#fursan-gold)"
            strokeWidth="1.5"
          />

          {/* نجمة الإتقان الرياضي الذهبية (The 4-Pointed Achievement Star) */}
          <path
            d="M 0 -8.5 Q 0 0 -8.5 0 Q 0 0 0 8.5 Q 0 0 8.5 0 Q 0 0 0 -8.5 Z"
            fill="url(#fursan-gold)"
          />
          <circle cx="0" cy="0" r="1.8" fill="#FFFFFF" />
        </g>

        {/* نقطة الارتكاز الذهبية السفلية - رمز الثبات والدقة */}
        <polygon points="50,78 52.5,82 50,85 47.5,82" fill="url(#fursan-gold)" />
      </g>
    </svg>
  );
};

export const FursanLogo: React.FC<FursanLogoProps> = ({
  variant = 'header',
  size = 'md',
  showSubtitle = true,
  subtitle = 'المنصة التفاعلية لإتقان الرياضيات',
  theme = 'light',
  className = '',
  interactive = false,
  onClick,
}) => {
  // مقاسات الشعار ونسب النصوص
  const sizeMap: Record<LogoSize, { px: number; titleClass: string; subClass: string; gap: string }> = {
    xs: { px: 24, titleClass: 'text-base font-extrabold', subClass: 'text-[9.5px]', gap: 'gap-1.5' },
    sm: { px: 30, titleClass: 'text-lg font-black', subClass: 'text-[10.5px]', gap: 'gap-2' },
    md: { px: 38, titleClass: 'text-2xl font-black', subClass: 'text-[11.5px]', gap: 'gap-2.5' },
    lg: { px: 50, titleClass: 'text-3xl sm:text-4xl font-black', subClass: 'text-xs sm:text-sm', gap: 'gap-3' },
    xl: { px: 66, titleClass: 'text-4xl sm:text-5xl font-black', subClass: 'text-sm sm:text-base font-semibold', gap: 'gap-4' },
  };

  const metrics = sizeMap[size];

  // ألوان السمة (Theme)
  const isDark = theme === 'dark';
  const textColorPrimary = isDark ? 'text-white' : 'text-slate-900';
  const textHighlight = isDark ? 'text-amber-400' : 'text-emerald-700';
  const subTextColor = isDark ? 'text-slate-300' : 'text-slate-500';

  // 1. رمز الأيقونة المنفصل (Icon Only)
  if (variant === 'icon') {
    return (
      <div className={`inline-flex items-center justify-center ${className}`}>
        <FursanSymbol sizePx={metrics.px} hasBackground={false} />
      </div>
    );
  }

  // 2. شارة الأيقونة بتأطير الشعار (App Icon / Emblem Badge)
  if (variant === 'badge') {
    return (
      <div className={`inline-flex items-center justify-center ${className}`}>
        <FursanSymbol sizePx={metrics.px} hasBackground={true} />
      </div>
    );
  }

  // 3. إصدار شريط الترويسة المدمج (Compact Header Version)
  if (variant === 'header') {
    return (
      <div
        onClick={onClick}
        className={`flex items-center gap-2.5 sm:gap-3 text-right select-none ${
          interactive ? 'cursor-pointer group' : ''
        } ${className}`}
        dir="rtl"
      >
        {/* الرمز المدمج المحمي */}
        <div className="relative flex items-center justify-center transition-transform duration-200 group-hover:scale-105 drop-shadow-xs">
          <FursanSymbol sizePx={38} hasBackground={false} />
        </div>

        {/* الكلمة البصرية (Wordmark) «فرسان الحساب» بخط تجوال الحديث */}
        <div className="flex flex-col text-right leading-none">
          <div className="flex items-baseline gap-1.5">
            <span
              className={`text-xl sm:text-2xl font-black tracking-tight ${textColorPrimary} transition-colors group-hover:text-emerald-800 font-sans`}
              style={{ fontFamily: "'Tajawal', system-ui, sans-serif" }}
            >
              فُرسان
            </span>
            <span
              className={`text-xl sm:text-2xl font-black tracking-tight ${textHighlight} transition-colors group-hover:text-amber-600 font-sans`}
              style={{ fontFamily: "'Tajawal', system-ui, sans-serif" }}
            >
              الحساب
            </span>
            <span className="hidden sm:inline-flex items-center justify-center w-2 h-2 rounded-full bg-amber-400 ms-0.5" />
          </div>

          {showSubtitle && (
            <span
              className={`hidden md:block text-[11px] font-semibold ${subTextColor} mt-1 tracking-tight font-sans`}
              style={{ fontFamily: "'Tajawal', system-ui, sans-serif" }}
            >
              {subtitle}
            </span>
          )}
        </div>
      </div>
    );
  }

  // 4. التصميم العمودي المتراكب (Stacked Display للبطاقات والترحيب)
  if (variant === 'stacked') {
    return (
      <div
        onClick={onClick}
        className={`flex flex-col items-center text-center select-none ${
          interactive ? 'cursor-pointer group' : ''
        } ${className}`}
        dir="rtl"
      >
        <div className="mb-3 transition-transform duration-200 group-hover:scale-105 drop-shadow-md">
          <FursanSymbol sizePx={metrics.px} hasBackground={true} />
        </div>

        <h1
          className={`${metrics.titleClass} ${textColorPrimary} tracking-tight leading-none mb-1 font-sans`}
          style={{ fontFamily: "'Tajawal', system-ui, sans-serif" }}
        >
          <span>فُرسان </span>
          <span className={textHighlight}>الحساب</span>
        </h1>

        {showSubtitle && (
          <p
            className={`${metrics.subClass} ${subTextColor} font-semibold`}
            style={{ fontFamily: "'Tajawal', system-ui, sans-serif" }}
          >
            {subtitle}
          </p>
        )}
      </div>
    );
  }

  // 5. الشعار الرئيسي الكامل (Primary Logo Lockup)
  return (
    <div
      onClick={onClick}
      className={`flex items-center ${metrics.gap} text-right select-none ${
        interactive ? 'cursor-pointer group' : ''
      } ${className}`}
      dir="rtl"
    >
      <div className="transition-transform duration-200 group-hover:scale-105 drop-shadow-xs">
        <FursanSymbol sizePx={metrics.px} hasBackground={false} />
      </div>

      <div className="flex flex-col text-right leading-none">
        <div className="flex items-baseline gap-2">
          <span
            className={`${metrics.titleClass} ${textColorPrimary} tracking-tight font-sans`}
            style={{ fontFamily: "'Tajawal', system-ui, sans-serif" }}
          >
            <span>فُرسان </span>
            <span className={textHighlight}>الحساب</span>
          </span>
        </div>

        {showSubtitle && (
          <span
            className={`${metrics.subClass} ${subTextColor} mt-1.5 font-semibold font-sans`}
            style={{ fontFamily: "'Tajawal', system-ui, sans-serif" }}
          >
            {subtitle}
          </span>
        )}
      </div>
    </div>
  );
};
