import React from 'react';
import { UserProgress } from '../types/game.ts';
import { FursanSymbol, FursanLogo } from './brand/FursanLogo.tsx';
import { toEastern } from '../utils/arabicNumerals.ts';
import { CheckCircle2, AlertCircle, Clock, Star, Trophy, Award, Flame, BookOpen } from 'lucide-react';

interface StudentProgressReportProps {
  progress: UserProgress;
  generatedDate?: string;
  isPrintOnly?: boolean;
}

export const StudentProgressReport: React.FC<StudentProgressReportProps> = ({
  progress,
  generatedDate,
  isPrintOnly = false,
}) => {
  const currentDate = generatedDate || new Date().toLocaleDateString('ar-OM', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Calculate analytics for each table (1 to 10)
  const tableAnalytics = Array.from({ length: 10 }, (_, i) => i + 1).map((tableNum) => {
    let mastered = 0;
    let attempts = 0;
    let correct = 0;

    for (let b = 1; b <= 10; b++) {
      const key = `${tableNum}x${b}`;
      const data = progress.factsMastery[key];
      if (data) {
        attempts += data.attempts;
        correct += data.correct;
        if (data.isMastered) mastered++;
      }
    }

    const accuracy = attempts > 0 ? Math.round((correct / attempts) * 100) : 0;
    const percentMastered = Math.round((mastered / 10) * 100);

    let statusLabel = 'يحتاج لمزيد من التدريب';
    let statusColor = 'text-amber-800 bg-amber-50 border-amber-200';
    if (percentMastered === 100) {
      statusLabel = 'إتقان تام (مكتمل)';
      statusColor = 'text-emerald-800 bg-emerald-50 border-emerald-200';
    } else if (percentMastered >= 70) {
      statusLabel = 'متقدم ومستقر';
      statusColor = 'text-teal-800 bg-teal-50 border-teal-200';
    } else if (percentMastered >= 40) {
      statusLabel = 'قيد التطور والتدريب';
      statusColor = 'text-blue-800 bg-blue-50 border-blue-200';
    }

    return {
      tableNum,
      mastered,
      attempts,
      correct,
      accuracy,
      percentMastered,
      statusLabel,
      statusColor,
    };
  });

  // Overall calculations
  const totalMasteredFacts = tableAnalytics.reduce((acc, t) => acc + t.mastered, 0);
  const totalAttempts = tableAnalytics.reduce((acc, t) => acc + t.attempts, 0);
  const totalCorrect = tableAnalytics.reduce((acc, t) => acc + t.correct, 0);
  const overallAccuracy = totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0;
  const overallMasteryRate = Math.round((totalMasteredFacts / 100) * 100);

  const totalSessions = progress.recentSessions.length;
  const approxMinutes = Math.round(totalSessions * 2.5);
  const streak = progress.dailyReward?.currentStreakDays || 0;

  // Hardest facts diagnostic
  const hardestFacts = Object.values(progress.factsMastery)
    .filter((f) => f.attempts >= 2 && !f.isMastered)
    .map((f) => ({
      fact: `${f.factorA} × ${f.factorB}`,
      product: f.factorA * f.factorB,
      attempts: f.attempts,
      correct: f.correct,
      accuracy: Math.round((f.correct / f.attempts) * 100),
      mistakes: f.commonMistakes || [],
      tip: f.factorA === 9 || f.factorB === 9
        ? 'استراتيجية الضرب في 9 (الضرب في 10 وطرح العدد مرة واحدة).'
        : f.factorA === 8 || f.factorB === 8
        ? 'استراتيجية مضاعفة المضاعفات (الضرب في 2 ثم 2 ثم 2).'
        : f.factorA === 7 || f.factorB === 7
        ? 'الاستفادة من خاصية الإبدال والربط بالمصفوفة البصرية 7x=.'
        : 'التمثيل بالمجموعات المتساوية والعد التكراري لتثبيت الناتج.',
    }))
    .sort((a, b) => a.accuracy - b.accuracy)
    .slice(0, 4);

  // SVG Chart dimensions & math
  // Canvas width: 620, height: 210
  const chartW = 620;
  const chartH = 190;
  const chartPadLeft = 40;
  const chartPadRight = 30;
  const chartPadBottom = 35;
  const chartPadTop = 25;
  const plotW = chartW - chartPadLeft - chartPadRight;
  const plotH = chartH - chartPadTop - chartPadBottom;
  const colW = 34;
  const colSpacing = (plotW - 10 * colW) / 9;

  return (
    <div
      className={`bg-white text-slate-900 font-sans text-right ${
        isPrintOnly ? '' : 'p-6 sm:p-10 max-w-4xl mx-auto shadow-md rounded-2xl border border-slate-200'
      }`}
      dir="rtl"
    >
      {/* 1. الترويسة الرسمية لمنصة فُرسان الحساب */}
      <div className="border-b-2 border-slate-800 pb-5 mb-6">
        <div className="flex items-center justify-between gap-4">
          {/* الجانب الأيمن: شعار فُرسان الحساب والهوية */}
          <div className="flex items-center gap-3">
            <FursanSymbol sizePx={46} hasBackground={true} />
            <div>
              <span className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight block">
                فُرسان الحساب
              </span>
              <span className="text-xs font-bold text-emerald-800 block">
                منصة إتقان الرياضيات وحقائق الضرب
              </span>
            </div>
          </div>

          {/* الوسط: عنوان التقرير */}
          <div className="text-center">
            <h1 className="text-lg sm:text-2xl font-black text-slate-900 mb-0.5">
              تقرير التقدّم والإتقان الرياضي
            </h1>
            <p className="text-xs sm:text-sm font-semibold text-slate-600">
              سجل المهارات والحقائق الرياضية التفاعلية
            </p>
          </div>

          {/* الجانب الأيسر: المنصة وتاريخ الإصدار */}
          <div className="text-left text-xs font-semibold text-slate-600 space-y-0.5">
            <div className="font-bold text-slate-900">فُرسان الحساب</div>
            <div className="text-emerald-700">سجل الإنجاز والاعتماد</div>
            <div className="text-[11px] text-slate-500 font-mono mt-1" dir="ltr">
              {currentDate}
            </div>
          </div>
        </div>
      </div>

      {/* 2. بطاقة بيانات الطالب وملخص المؤشرات العامة */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl mb-6 avoid-break">
        <div>
          <span className="text-[11px] font-bold text-slate-500 uppercase block">اسم الطالب</span>
          <span className="text-base sm:text-lg font-black text-slate-900 truncate block">
            {progress.playerName}
          </span>
          <span className="text-[11px] text-emerald-700 font-semibold block mt-0.5 font-sans">
            المستوى التحصيلي {toEastern(progress.level)}
          </span>
        </div>

        <div>
          <span className="text-[11px] font-bold text-slate-500 uppercase block">الحقائق المتقنة</span>
          <div className="flex items-baseline gap-1 mt-0.5 font-sans">
            <span className="text-xl sm:text-2xl font-black text-emerald-700">
              {toEastern(totalMasteredFacts)}
            </span>
            <span className="text-xs text-slate-600 font-bold">/ {toEastern(100)} حقيقة</span>
          </div>
          <span className="text-[11px] text-slate-500 font-medium block font-sans">
            نسبة الإتقان الكلية: {toEastern(overallMasteryRate)}٪
          </span>
        </div>

        <div>
          <span className="text-[11px] font-bold text-slate-500 uppercase block">دقة الإجابات</span>
          <div className="flex items-baseline gap-1 mt-0.5 font-sans">
            <span className="text-xl sm:text-2xl font-black text-indigo-700">
              {toEastern(overallAccuracy)}٪
            </span>
          </div>
          <span className="text-[11px] text-slate-500 font-medium block font-sans">
            إجمالي المحاولات: {toEastern(totalAttempts)}
          </span>
        </div>

        <div>
          <span className="text-[11px] font-bold text-slate-500 uppercase block">التحفيز والاستمرارية</span>
          <div className="flex items-center gap-1.5 mt-0.5 font-sans">
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span className="text-lg font-black text-slate-900 font-sans">
              {toEastern(progress.stars)}
            </span>
            <span className="text-xs text-slate-500 font-semibold">نجمة</span>
          </div>
          <span className="text-[11px] text-amber-700 font-semibold block mt-0.5 font-sans">
            سلسلة الحضور: {toEastern(streak)} أيام متتالية 🔥
          </span>
        </div>
      </div>

      {/* 3. الرسم البياني لمستوى إتقان جداول الضرب (Mastery Charts) */}
      <div className="border border-slate-200 rounded-xl p-4 sm:p-5 mb-6 avoid-break bg-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div>
            <h2 className="text-base sm:text-lg font-black text-slate-900">
              المخطط البياني لإتقان جداول الضرب (من {toEastern(1)} إلى {toEastern(10)})
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              مقارنة نسبة إتقان الحقائق ونسبة الدقة لكل جدول مقابل معيار الإتقان المستهدف ({toEastern(80)}٪).
            </p>
          </div>

          {/* مفتاح الرسم البياني */}
          <div className="flex items-center gap-4 text-xs font-semibold text-slate-600 shrink-0">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-emerald-600 rounded-xs inline-block" />
              <span>نسبة الإتقان ٪</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-indigo-600 rounded-full inline-block" />
              <span>نسبة الدقة ٪</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-4 border-b-2 border-dashed border-rose-500 inline-block" />
              <span>حد الإتقان ({toEastern(80)}٪)</span>
            </div>
          </div>
        </div>

        {/* SVG Bar Chart (RTL: من جدول ١ في أقصى اليمين حتى جدول ١٠ في أقصى اليسار) */}
        <div className="w-full overflow-x-auto">
          <svg
            viewBox={`0 0 ${chartW} ${chartH}`}
            className="w-full h-auto max-h-56 select-none"
            aria-label="رسم بياني يوضح نسبة إتقان كل جدول ضرب من ١ إلى ١٠"
          >
            {/* Grid horizontal lines */}
            {[0, 25, 50, 75, 100].map((val) => {
              const y = chartPadTop + plotH - (val / 100) * plotH;
              return (
                <g key={val}>
                  <line
                    x1={chartPadLeft}
                    y1={y}
                    x2={chartW - chartPadRight}
                    y2={y}
                    stroke="#E2E8F0"
                    strokeWidth="1"
                  />
                  {/* تسمية المحور الرأسي في اليمين بما يناسب الاتجاه العربي */}
                  <text
                    x={chartW - chartPadRight + 8}
                    y={y + 3}
                    fontSize="9"
                    fill="#64748B"
                    fontWeight="700"
                    textAnchor="start"
                    className="font-sans"
                  >
                    {toEastern(val)}٪
                  </text>
                </g>
              );
            })}

            {/* Target line at 80% */}
            {(() => {
              const y80 = chartPadTop + plotH - (80 / 100) * plotH;
              return (
                <line
                  x1={chartPadLeft}
                  y1={y80}
                  x2={chartW - chartPadRight}
                  y2={y80}
                  stroke="#F43F5E"
                  strokeWidth="1.5"
                  strokeDasharray="4 3"
                />
              );
            })()}

            {/* أعمدة الجداول من جدول ١ (أقصى اليمين) إلى جدول ١٠ (أقصى اليسار) */}
            {tableAnalytics.map((t, idx) => {
              // لحساب الموضع العربي من اليمين إلى اليسار:
              // جدول 1 (idx = 0) يقع عند أقصى يمين منطقة الرسم
              const x = chartW - chartPadRight - (idx + 1) * colW - idx * colSpacing;
              const barHeight = Math.max((t.percentMastered / 100) * plotH, t.percentMastered > 0 ? 4 : 0);
              const barY = chartPadTop + plotH - barHeight;

              // Color based on mastery
              let fillColor = '#059669'; // Emerald for >= 80%
              if (t.percentMastered === 0) fillColor = '#E2E8F0';
              else if (t.percentMastered < 50) fillColor = '#F59E0B'; // Amber
              else if (t.percentMastered < 80) fillColor = '#0D9488'; // Teal

              // Accuracy marker position
              const accY = chartPadTop + plotH - (t.accuracy / 100) * plotH;

              return (
                <g key={t.tableNum}>
                  {/* Background track */}
                  <rect
                    x={x}
                    y={chartPadTop}
                    width={colW}
                    height={plotH}
                    rx="4"
                    fill="#F8FAFC"
                  />

                  {/* Main Mastery Bar */}
                  <rect
                    x={x}
                    y={barY}
                    width={colW}
                    height={barHeight}
                    rx="4"
                    fill={fillColor}
                  />

                  {/* Percentage text above bar */}
                  <text
                    x={x + colW / 2}
                    y={barY - 4}
                    fontSize="9"
                    fontWeight="700"
                    fill={t.percentMastered >= 80 ? '#047857' : '#334155'}
                    textAnchor="middle"
                    className="font-sans"
                  >
                    {toEastern(t.percentMastered)}٪
                  </text>

                  {/* Accuracy dot marker */}
                  {t.attempts > 0 && (
                    <circle
                      cx={x + colW / 2}
                      cy={accY}
                      r="3.5"
                      fill="#4F46E5"
                      stroke="#FFFFFF"
                      strokeWidth="1.5"
                    />
                  )}

                  {/* X Axis Label */}
                  <text
                    x={x + colW / 2}
                    y={chartPadTop + plotH + 16}
                    fontSize="10"
                    fontWeight="800"
                    fill="#1E293B"
                    textAnchor="middle"
                    className="font-sans"
                  >
                    جدول {toEastern(t.tableNum)}
                  </text>
                  <text
                    x={x + colW / 2}
                    y={chartPadTop + plotH + 28}
                    fontSize="8.5"
                    fontWeight="600"
                    fill="#64748B"
                    textAnchor="middle"
                    className="font-sans"
                  >
                    {toEastern(t.mastered)}/{toEastern(10)}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* 4. جدول التحليل التفصيلي لإتقان الجداول (Table Breakdown) */}
      <div className="border border-slate-200 rounded-xl overflow-hidden mb-6 avoid-break bg-white">
        <div className="bg-slate-100 px-4 py-2.5 border-b border-slate-200 flex justify-between items-center">
          <h3 className="font-bold text-xs sm:text-sm text-slate-800">
            مؤشرات الإتقان التفصيلية لكل جدول ضرب
          </h3>
          <span className="text-[11px] text-slate-500 font-medium">
            100 حقيقة أساسية (1×1 حتى 10×10)
          </span>
        </div>

        <table className="w-full text-right text-xs">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-bold">
              <th className="py-2 px-3">الجدول</th>
              <th className="py-2 px-3 text-center">الحقائق المتقنة</th>
              <th className="py-2 px-3">مستوى الإتقان</th>
              <th className="py-2 px-3 text-center">نسبة الدقة</th>
              <th className="py-2 px-3">التقييم التربوي</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
            {tableAnalytics.map((t) => (
              <tr key={t.tableNum} className="hover:bg-slate-50/50">
                <td className="py-1.5 px-3 font-bold text-slate-900 font-sans">
                  جدول {toEastern(t.tableNum)}
                </td>
                <td className="py-1.5 px-3 text-center font-bold font-sans">
                  {toEastern(t.mastered)} / {toEastern(10)}
                </td>
                <td className="py-1.5 px-3 w-44">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          t.percentMastered >= 80
                            ? 'bg-emerald-600'
                            : t.percentMastered >= 50
                            ? 'bg-teal-600'
                            : 'bg-amber-500'
                        }`}
                        style={{ width: `${t.percentMastered}%` }}
                      />
                    </div>
                    <span className="text-[11px] font-bold font-sans w-8">
                      {toEastern(t.percentMastered)}٪
                    </span>
                  </div>
                </td>
                <td className="py-1.5 px-3 text-center font-bold font-sans">
                  {toEastern(t.accuracy)}٪
                </td>
                <td className="py-1.5 px-3">
                  <span
                    className={`inline-block px-2 py-0.5 rounded-sm text-[10.5px] font-bold border ${t.statusColor}`}
                  >
                    {t.statusLabel}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 5. التشخيص التربوي وحقائق تحتاج لتثبيت (Diagnostic Findings) */}
      {hardestFacts.length > 0 && (
        <div className="border border-rose-200 bg-rose-50/30 rounded-xl p-4 mb-6 avoid-break">
          <div className="flex items-center gap-2 text-rose-900 font-bold text-sm mb-2">
            <AlertCircle className="w-4 h-4 text-rose-600" />
            <h3>التشخيص التربوي: حقائق ضرب تتطلب دعماً ومراجعة موجهة</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
            {hardestFacts.map((f, i) => (
              <div
                key={i}
                className="p-2.5 bg-white border border-rose-200/80 rounded-lg flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-black text-slate-900 text-sm font-sans" dir="rtl">
                    {toEastern(f.fact)} = {toEastern(f.product)}
                  </span>
                  <span className="px-2 py-0.5 bg-rose-100 text-rose-800 text-[10px] font-bold rounded-sm font-sans">
                    دقة {toEastern(f.accuracy)}٪ ({toEastern(f.correct)}/{toEastern(f.attempts)})
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed font-normal">
                  💡 <span className="font-semibold text-slate-700">التوجيه المقترح:</span> {f.tip}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. التوجيهات والتوصيات لولي الأمر والمعلم */}
      <div className="border border-slate-200 rounded-xl p-4 mb-6 avoid-break bg-slate-50/50 text-xs">
        <h3 className="font-bold text-slate-900 text-xs sm:text-sm mb-2 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-indigo-600" />
          <span>توصيات تربوية لتعزيز الاستيعاب المنزلي والمدرسي:</span>
        </h3>
        <ul className="space-y-1.5 text-slate-700 font-normal pr-4 list-disc leading-relaxed">
          <li>
            <strong className="text-slate-900">الربط البصري قبل الحفظ الآلي:</strong> تدريب الطالب على رسم المصفوفات ($Rows \times Columns$) ونماذج المجموعات المتساوية عبر 'المختبر البصري' في المنصة.
          </li>
          <li>
            <strong className="text-slate-900">جلسات قصيرة يومية (تحدي الزمن):</strong> ممارسة لعبة 'تحدي الزمن' لمدة 5 إلى 10 دقائق يومياً لرفع سرعة الاستدعاء التلقائي دون ضغط.
          </li>
          <li>
            <strong className="text-slate-900">استثمار أوراق العمل المطبوعة:</strong> حل ورقة تدريبية أسبوعية بالورقة والقلم لربط التعلم الرقمي بالكتابة اليدوية.
          </li>
        </ul>
      </div>

      {/* 7. خانة التوقيعات والاعتماد الرسمي */}
      <div className="border-t-2 border-slate-800 pt-4 mt-6 avoid-break">
        <div className="mb-4">
          <span className="text-xs font-bold text-slate-700 block mb-1">
            ملاحظات المعلم / ولي الأمر:
          </span>
          <div className="border-b border-dashed border-slate-400 h-6 mb-2" />
          <div className="border-b border-dashed border-slate-400 h-6" />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 text-xs text-slate-700 pt-2 font-medium">
          <div>
            <span className="font-bold block text-slate-900">توقيع معلم/معلمة الرياضيات:</span>
            <div className="mt-6 border-t border-slate-400 pt-1 text-[11px] text-slate-500">
              التاريخ: ____ / ____ / 2026م
            </div>
          </div>

          <div>
            <span className="font-bold block text-slate-900">توقيع ولي الأمر للمتابعة:</span>
            <div className="mt-6 border-t border-slate-400 pt-1 text-[11px] text-slate-500">
              التاريخ: ____ / ____ / 2026م
            </div>
          </div>

          <div className="col-span-2 sm:col-span-1 text-center sm:text-left flex flex-col justify-end">
            <span className="text-[11px] text-emerald-800 font-bold block">
              منصة فُرسان الحساب التعليمية المعتمدة
            </span>
            <span className="text-[10px] text-slate-500 block">
              وثيقة إتقان ومتابعة مطبوعة
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
