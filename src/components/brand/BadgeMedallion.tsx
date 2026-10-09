import React from 'react';
import { Badge } from '../../types/game.ts';
import { Lock } from 'lucide-react';
import { toEastern } from '../../utils/arabicNumerals.ts';

interface BadgeMedallionProps {
  badge: Badge;
  isUnlocked: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showLabel?: boolean;
  className?: string;
}

export const BadgeMedallion: React.FC<BadgeMedallionProps> = ({
  badge,
  isUnlocked,
  size = 'md',
  showLabel = false,
  className = '',
}) => {
  const sizeConfig = {
    sm: { px: 48, viewBox: 80, textClass: 'text-[10px]' },
    md: { px: 76, viewBox: 80, textClass: 'text-xs' },
    lg: { px: 96, viewBox: 80, textClass: 'text-sm' },
    xl: { px: 120, viewBox: 80, textClass: 'text-base' },
  }[size];

  // Specific theme gradients
  const theme = badge.colorTheme || (badge.category === 'table' ? 'emerald' : badge.category === 'questions' ? 'gold' : 'amber');

  const gradients = {
    gold: {
      outer: ['#F59E0B', '#D97706', '#78350F'],
      rim: '#FDE68A',
      inner: ['#FEF3C7', '#FDE68A'],
      glow: '#F59E0B',
      accent: '#B45309',
    },
    emerald: {
      outer: ['#10B981', '#059669', '#064E3B'],
      rim: '#A7F3D0',
      inner: ['#D1FAE5', '#A7F3D0'],
      glow: '#10B981',
      accent: '#047857',
    },
    teal: {
      outer: ['#14B8A6', '#0D9488', '#134E4A'],
      rim: '#99F6E4',
      inner: ['#CCFBF1', '#99F6E4'],
      glow: '#14B8A6',
      accent: '#0F766E',
    },
    blue: {
      outer: ['#3B82F6', '#2563EB', '#1E3A8A'],
      rim: '#BFDBFE',
      inner: ['#DBEAFE', '#BFDBFE'],
      glow: '#3B82F6',
      accent: '#1D4ED8',
    },
    purple: {
      outer: ['#8B5CF6', '#7C3AED', '#4C1D95'],
      rim: '#DDD6FE',
      inner: ['#EDE9FE', '#DDD6FE'],
      glow: '#8B5CF6',
      accent: '#6D28D9',
    },
    rose: {
      outer: ['#F43F5E', '#E11D48', '#881337'],
      rim: '#FECDD3',
      inner: ['#FFE4E6', '#FECDD3'],
      glow: '#F43F5E',
      accent: '#BE123C',
    },
    amber: {
      outer: ['#F59E0B', '#D97706', '#78350F'],
      rim: '#FDE68A',
      inner: ['#FEF3C7', '#FDE68A'],
      glow: '#F59E0B',
      accent: '#B45309',
    },
  }[theme];

  const renderBadgeCenterGraphic = () => {
    // 1. Table 5 Expert ('خبير جدول الضرب 5')
    if (badge.id === 'table5_master' || badge.id === 'table5_expert') {
      return (
        <g>
          {/* خلفية شمسية مشعة */}
          <circle cx="40" cy="40" r="22" fill={isUnlocked ? '#FEF3C7' : '#E2E8F0'} />
          {/* إكليل الغار */}
          <path
            d="M 23,46 C 21,38 25,28 32,24 M 57,46 C 59,38 55,28 48,24"
            stroke={isUnlocked ? '#D97706' : '#94A3B8'}
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
          />
          {/* رمز ٥× المتميز */}
          <text
            x="40"
            y="43"
            textAnchor="middle"
            dominantBaseline="central"
            fontSize="18"
            fontWeight="900"
            fontFamily="Tajawal, sans-serif"
            fill={isUnlocked ? '#B45309' : '#64748B'}
          >
            ٥×
          </text>
          {/* خمس نجوم مصغرة */}
          {[0, 1, 2, 3, 4].map((i) => {
            const angle = (i * 72 - 90) * (Math.PI / 180);
            const cx = 40 + 26 * Math.cos(angle);
            const cy = 40 + 26 * Math.sin(angle);
            return (
              <circle
                key={i}
                cx={cx}
                cy={cy}
                r="2.2"
                fill={isUnlocked ? '#F59E0B' : '#94A3B8'}
              />
            );
          })}
        </g>
      );
    }

    // 2. Questions 100 ('أكملت 100 مسألة')
    if (badge.id === 'questions_100') {
      return (
        <g>
          {/* درع أو قرص مئوي */}
          <circle cx="40" cy="40" r="22" fill={isUnlocked ? '#FEF3C7' : '#E2E8F0'} />
          {/* إكليل النصر المزدوج */}
          <path
            d="M 21,48 C 19,34 25,22 36,18 M 59,48 C 61,34 55,22 44,18"
            stroke={isUnlocked ? '#D97706' : '#94A3B8'}
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />
          {/* نص ١٠٠ */}
          <text
            x="40"
            y="37"
            textAnchor="middle"
            dominantBaseline="central"
            fontSize="14"
            fontWeight="900"
            fontFamily="Tajawal, sans-serif"
            fill={isUnlocked ? '#92400E' : '#64748B'}
          >
            ١٠٠
          </text>
          {/* شريط الإنجاز الصغير أسفل 100 */}
          <rect
            x="28"
            y="46"
            width="24"
            height="7"
            rx="3.5"
            fill={isUnlocked ? '#D97706' : '#94A3B8'}
          />
          <text
            x="40"
            y="50.5"
            textAnchor="middle"
            dominantBaseline="central"
            fontSize="5.5"
            fontWeight="800"
            fontFamily="Tajawal, sans-serif"
            fill="#FFFFFF"
          >
            مسألة
          </text>
        </g>
      );
    }

    // 3. Questions 10 / 50 / 250
    if (badge.category === 'questions') {
      const qNum = badge.targetQuestions || (badge.id === 'questions_10' ? 10 : badge.id === 'questions_50' ? 50 : 250);
      return (
        <g>
          <circle cx="40" cy="40" r="22" fill={isUnlocked ? '#EEF2FF' : '#E2E8F0'} />
          <path
            d="M 23,45 C 22,34 27,24 35,21 M 57,45 C 58,34 53,24 45,21"
            stroke={isUnlocked ? gradients.accent : '#94A3B8'}
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />
          <text
            x="40"
            y="38"
            textAnchor="middle"
            dominantBaseline="central"
            fontSize="14"
            fontWeight="900"
            fontFamily="Tajawal, sans-serif"
            fill={isUnlocked ? gradients.accent : '#64748B'}
          >
            {toEastern(qNum)}
          </text>
          <text
            x="40"
            y="49"
            textAnchor="middle"
            dominantBaseline="central"
            fontSize="7"
            fontWeight="700"
            fontFamily="Tajawal, sans-serif"
            fill={isUnlocked ? '#64748B' : '#94A3B8'}
          >
            مسألة
          </text>
        </g>
      );
    }

    // 4. Other Table Expert badges (Table 1 through 10)
    if (badge.category === 'table' && badge.targetTable) {
      const tbl = badge.targetTable;
      return (
        <g>
          <circle cx="40" cy="40" r="22" fill={isUnlocked ? '#F0FDF4' : '#E2E8F0'} />
          <path
            d="M 23,46 C 21,37 26,27 34,23 M 57,46 C 59,37 54,27 46,23"
            stroke={isUnlocked ? gradients.accent : '#94A3B8'}
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
          />
          <text
            x="40"
            y="42"
            textAnchor="middle"
            dominantBaseline="central"
            fontSize="17"
            fontWeight="900"
            fontFamily="Tajawal, sans-serif"
            fill={isUnlocked ? gradients.accent : '#64748B'}
          >
            {toEastern(tbl)}×
          </text>
        </g>
      );
    }

    // 5. Grandmaster Crown
    if (badge.id === 'table_grandmaster') {
      return (
        <g>
          <circle cx="40" cy="40" r="22" fill={isUnlocked ? '#FEF3C7' : '#E2E8F0'} />
          {/* تاج ملكي فاخر */}
          <path
            d="M 24,48 L 26,33 L 33,40 L 40,26 L 47,40 L 54,33 L 56,48 Z"
            fill={isUnlocked ? '#F59E0B' : '#94A3B8'}
            stroke={isUnlocked ? '#B45309' : '#64748B'}
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <circle cx="40" cy="24" r="2.5" fill={isUnlocked ? '#EF4444' : '#64748B'} />
          <circle cx="26" cy="31" r="2" fill={isUnlocked ? '#10B981' : '#64748B'} />
          <circle cx="54" cy="31" r="2" fill={isUnlocked ? '#10B981' : '#64748B'} />
          {/* لآلئ قاعدة التاج */}
          <rect x="24" y="48" width="32" height="4" rx="2" fill={isUnlocked ? '#B45309' : '#64748B'} />
        </g>
      );
    }

    // 6. Speed Champion (تحدي الزمن)
    if (badge.id === 'speed_champion') {
      return (
        <g>
          <circle cx="40" cy="40" r="22" fill={isUnlocked ? '#FFFBEB' : '#E2E8F0'} />
          {/* ساعة إيقاف ذات أجنحة */}
          <circle
            cx="40"
            cy="41"
            r="12"
            stroke={isUnlocked ? '#D97706' : '#64748B'}
            strokeWidth="2.5"
            fill="none"
          />
          {/* زر التوقيت */}
          <path d="M 38,26 L 42,26 L 42,29 L 38,29 Z" fill={isUnlocked ? '#D97706' : '#64748B'} />
          {/* عقارب الساعة تشير للسرعة */}
          <line
            x1="40"
            y1="41"
            x2="40"
            y2="34"
            stroke={isUnlocked ? '#B45309' : '#64748B'}
            strokeWidth="2"
            strokeLinecap="round"
          />
          <line
            x1="40"
            y1="41"
            x2="45"
            y2="41"
            stroke={isUnlocked ? '#EF4444' : '#64748B'}
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          {/* خطوط السرعة */}
          <path
            d="M 22,35 L 26,37 M 20,41 L 25,41 M 22,47 L 26,45"
            stroke={isUnlocked ? '#F59E0B' : '#94A3B8'}
            strokeWidth="2"
            strokeLinecap="round"
          />
        </g>
      );
    }

    // 7. Streak Badges (البرق والصاروخ)
    if (badge.id === 'streak_5') {
      return (
        <g>
          <circle cx="40" cy="40" r="22" fill={isUnlocked ? '#FEF3C7' : '#E2E8F0'} />
          {/* صاعقة برق مزدوجة */}
          <path
            d="M 43,24 L 30,39 L 39,39 L 35,56 L 50,38 L 41,38 Z"
            fill={isUnlocked ? '#F59E0B' : '#94A3B8'}
            stroke={isUnlocked ? '#D97706' : '#64748B'}
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </g>
      );
    }

    if (badge.id === 'streak_15') {
      return (
        <g>
          <circle cx="40" cy="40" r="22" fill={isUnlocked ? '#FFE4E6' : '#E2E8F0'} />
          {/* صاروخ متجه للأعلى */}
          <path
            d="M 40,24 C 44,28 47,35 46,44 L 40,41 L 34,44 C 33,35 36,28 40,24 Z"
            fill={isUnlocked ? '#E11D48' : '#94A3B8'}
          />
          {/* أجنحة الصاروخ */}
          <path d="M 34,39 L 28,45 L 34,43 Z" fill={isUnlocked ? '#FB7185' : '#94A3B8'} />
          <path d="M 46,39 L 52,45 L 46,43 Z" fill={isUnlocked ? '#FB7185' : '#94A3B8'} />
          {/* نافورة النار */}
          <path d="M 38,44 L 40,53 L 42,44 Z" fill={isUnlocked ? '#F59E0B' : '#CBD5E1'} />
          <circle cx="40" cy="33" r="2.5" fill="#FFFFFF" />
        </g>
      );
    }

    // 8. Daily Streak Badges (الشعلة)
    if (badge.id.startsWith('daily_streak')) {
      return (
        <g>
          <circle cx="40" cy="40" r="22" fill={isUnlocked ? '#FEF2F2' : '#E2E8F0'} />
          {/* شعلة الاستمرارية */}
          <path
            d="M 40,24 C 44,28 49,34 49,42 C 49,48 45,54 40,54 C 35,54 31,48 31,42 C 31,34 37,28 40,24 Z"
            fill={isUnlocked ? '#EF4444' : '#94A3B8'}
          />
          <path
            d="M 40,34 C 42,37 44,41 44,45 C 44,49 42,51 40,51 C 38,51 36,49 36,45 C 36,41 38,37 40,34 Z"
            fill={isUnlocked ? '#FBBF24' : '#E2E8F0'}
          />
        </g>
      );
    }

    // 9. Generic Fallback with the Badge Emoji cleanly rendered
    return (
      <g>
        <circle cx="40" cy="40" r="22" fill={isUnlocked ? gradients.inner[0] : '#E2E8F0'} />
        <text
          x="40"
          y="42"
          textAnchor="middle"
          dominantBaseline="central"
          fontSize="22"
        >
          {badge.icon}
        </text>
      </g>
    );
  };

  const gradId = `medallion-${badge.id}-${isUnlocked ? 'active' : 'locked'}`;

  return (
    <div className={`inline-flex flex-col items-center ${className}`}>
      <div
        className="relative transition-transform duration-300 hover:scale-105 select-none"
        style={{ width: sizeConfig.px, height: sizeConfig.px }}
      >
        <svg
          viewBox="0 0 80 80"
          width={sizeConfig.px}
          height={sizeConfig.px}
          className="drop-shadow-sm w-full h-full"
        >
          <defs>
            <linearGradient id={`${gradId}-outer`} x1="0%" y1="0%" x2="100%" y2="100%">
              {isUnlocked ? (
                <>
                  <stop offset="0%" stopColor={gradients.outer[0]} />
                  <stop offset="50%" stopColor={gradients.outer[1]} />
                  <stop offset="100%" stopColor={gradients.outer[2]} />
                </>
              ) : (
                <>
                  <stop offset="0%" stopColor="#94A3B8" />
                  <stop offset="100%" stopColor="#475569" />
                </>
              )}
            </linearGradient>

            <linearGradient id={`${gradId}-inner`} x1="0%" y1="0%" x2="100%" y2="100%">
              {isUnlocked ? (
                <>
                  <stop offset="0%" stopColor={gradients.inner[0]} />
                  <stop offset="100%" stopColor={gradients.inner[1]} />
                </>
              ) : (
                <>
                  <stop offset="0%" stopColor="#F1F5F9" />
                  <stop offset="100%" stopColor="#CBD5E1" />
                </>
              )}
            </linearGradient>
          </defs>

          {/* 1. الحافة الخارجية المسننة أو الدائرية الفاخرة */}
          <circle
            cx="40"
            cy="40"
            r="38"
            fill={`url(#${gradId}-outer)`}
            stroke={isUnlocked ? gradients.rim : '#CBD5E1'}
            strokeWidth="1.5"
          />

          {/* 2. الحلقة الداخلية المزخرفة بنقاط هندسية */}
          <circle
            cx="40"
            cy="40"
            r="32"
            fill="none"
            stroke={isUnlocked ? '#FFFFFF' : '#94A3B8'}
            strokeWidth="1"
            strokeDasharray="2.5 2.5"
            opacity={isUnlocked ? 0.8 : 0.4}
          />

          {/* 3. القرص الداخلي الأساسي */}
          <circle
            cx="40"
            cy="40"
            r="29"
            fill={`url(#${gradId}-inner)`}
          />

          {/* 4. الرسم والرمز التعبيري الفريد للشارة */}
          {renderBadgeCenterGraphic()}

          {/* 5. طبقة القفل إذا كانت الشارة مقفلة */}
          {!isUnlocked && (
            <g>
              <circle cx="40" cy="40" r="29" fill="#0F172A" opacity="0.4" />
              <circle cx="40" cy="40" r="14" fill="#1E293B" opacity="0.85" />
            </g>
          )}

          {/* 6. لمعة زجاجية خفيفة في الأعلى */}
          {isUnlocked && (
            <path
              d="M 20,25 C 26,16 54,16 60,25 C 50,22 30,22 20,25 Z"
              fill="#FFFFFF"
              opacity="0.35"
            />
          )}
        </svg>

        {/* أيقونة القفل الحقيقية إذا كانت مقفلة */}
        {!isUnlocked && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Lock className="w-5 h-5 text-amber-300 drop-shadow-md" />
          </div>
        )}
      </div>

      {showLabel && (
        <span
          className={`mt-1 font-bold text-center truncate max-w-[100px] ${sizeConfig.textClass} ${
            isUnlocked ? 'text-slate-900' : 'text-slate-400'
          }`}
        >
          {badge.title}
        </span>
      )}
    </div>
  );
};
