import React, { useState } from 'react';
import { useProgress } from '../context/ProgressContext.tsx';
import { ALL_FACTS } from '../data/multiplicationData.ts';
import { sound } from '../utils/audio.ts';
import { toEastern } from '../utils/arabicNumerals.ts';
import { StudentProgressReport } from '../components/StudentProgressReport.tsx';
import { StudentReportModal } from '../components/StudentReportModal.tsx';
import {
  Printer,
  GraduationCap,
  Clock,
  Award,
  BarChart3,
  FileText,
  Download,
  Eye,
  Sparkles,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';

export const TeacherDashboardScreen: React.FC = () => {
  const { progress } = useProgress();
  const [worksheetTable, setWorksheetTable] = useState<number>(0);
  const [showAnswerKey, setShowAnswerKey] = useState<boolean>(false);
  const [printMode, setPrintMode] = useState<'worksheet' | 'report'>('report');
  const [showReportModal, setShowReportModal] = useState<boolean>(false);

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
    return {
      tableNum,
      mastered,
      attempts,
      accuracy,
      percentMastered: Math.round((mastered / 10) * 100),
    };
  });

  const hardestFacts = Object.values(progress.factsMastery)
    .filter((f) => f.attempts >= 2)
    .map((f) => ({
      fact: `${f.factorA} × ${f.factorB}`,
      product: f.factorA * f.factorB,
      attempts: f.attempts,
      correct: f.correct,
      accuracy: Math.round((f.correct / f.attempts) * 100),
      mistakes: f.commonMistakes || [],
    }))
    .sort((a, b) => a.accuracy - b.accuracy)
    .slice(0, 5);

  const totalSessions = progress.recentSessions.length;
  const approxMinutes = Math.round(totalSessions * 2.5);

  const handlePrintReport = () => {
    setPrintMode('report');
    setTimeout(() => {
      window.print();
    }, 120);
  };

  const handlePrintWorksheet = () => {
    setPrintMode('worksheet');
    setTimeout(() => {
      window.print();
    }, 120);
  };

  const worksheetQuestions = React.useMemo(() => {
    const pool = worksheetTable > 0
      ? ALL_FACTS.filter((f) => f.factorA === worksheetTable)
      : ALL_FACTS;

    const list = [...pool].sort(() => Math.random() - 0.5);
    const duplicated = [...list, ...list, ...list];
    return duplicated.slice(0, 20);
  }, [worksheetTable]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 text-right">
      {/* 1. تصميم طباعة تقرير الإنجاز الشامل بصيغة PDF (مع الرسوم البيانية) */}
      {printMode === 'report' && (
        <div className="hidden print:block text-slate-900 bg-white">
          <StudentProgressReport progress={progress} isPrintOnly={true} />
        </div>
      )}

      {/* 2. تصميم طباعة ورقة العمل التدريبية */}
      {printMode === 'worksheet' && (
        <div className="hidden print:block p-8 bg-white text-slate-900 font-sans text-right" dir="rtl">
          <div className="text-center pb-4 border-b-2 border-slate-800 mb-6">
            <div className="flex items-center justify-between mb-1.5 text-xs text-slate-600 font-bold">
              <span>ورقة تدريبية للإتقان الذاتي والتقييم</span>
              <span className="text-emerald-900 font-black">منصة فُرسان الحساب التفاعلية</span>
            </div>
            <h1 className="text-2xl font-black">ورقة عمل تدريبية على جدول الضرب</h1>
            <p className="text-xs text-slate-700 mt-2">
              اسم الطالب: ___________________________ · الصف: _______ · الجدول: {worksheetTable === 0 ? 'جميع الجداول (١-١٠)' : `جدول ${toEastern(worksheetTable)}`} · التاريخ: ___________________
            </p>
          </div>

          <div className="grid grid-cols-2 gap-y-6 gap-x-12 text-lg font-sans">
            {worksheetQuestions.map((q, idx) => (
              <div key={idx} className="flex items-center justify-between border-b border-dashed border-slate-300 pb-2" dir="rtl">
                <span className="font-bold">{toEastern(idx + 1)}. {toEastern(q.factorA)} × {toEastern(q.factorB)} =</span>
                <span className="font-black text-emerald-800">{showAnswerKey ? toEastern(q.product) : '_______'}</span>
              </div>
            ))}
          </div>

          <div className="mt-12 pt-4 border-t border-slate-300 flex justify-between text-xs text-slate-500 font-sans">
            <span>الدرجة: ______ / {toEastern(20)}</span>
            <span>توقيع ولي الأمر / المعلم: ___________________</span>
          </div>
        </div>
      )}

      {/* العرض على الشاشة */}
      <div className="print:hidden space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <GraduationCap className="w-6 h-6 text-emerald-600" />
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug">
                لوحة المعلم وولي الأمر
              </h1>
            </div>
            <p className="text-sm sm:text-base text-slate-600 font-normal leading-relaxed">
              تقرير تربوي شامل، ومخططات إتقان جداول الضرب، وتحميل تقرير PDF المعتمد لطلبة الحلقة الأولى.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                setShowReportModal(true);
              }}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>تحميل تقرير التقدّم (PDF)</span>
            </button>
          </div>
        </div>

        {/* المؤشرات العامة الرئيسية */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs sm:text-sm font-semibold uppercase tracking-wide">جلسات التدريب المنجزة</span>
              <BarChart3 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-3xl font-extrabold text-slate-900 font-sans">
              {toEastern(totalSessions)}
            </div>
            <p className="text-xs text-slate-500 font-medium mt-1">أنشطة وألعاب مكتملة</p>
          </div>

          <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs sm:text-sm font-semibold uppercase tracking-wide">الوقت التقديري للتعلم</span>
              <Clock className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="text-3xl font-extrabold text-slate-900 font-sans">
              ~{toEastern(approxMinutes)} دقيقة
            </div>
            <p className="text-xs text-slate-500 font-medium mt-1">تفاعل تعليمي مستمر</p>
          </div>

          <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs sm:text-sm font-semibold uppercase tracking-wide">اسم الطالب الحالي</span>
              <Award className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-xl font-extrabold text-slate-900 truncate">
              {progress.playerName}
            </div>
            <p className="text-xs text-slate-500 font-medium mt-1 font-sans">المستوى {toEastern(progress.level)} · {toEastern(progress.stars)} نجمة</p>
          </div>
        </div>

        {/* قسم تقرير التقدّم الشامل كـ PDF مع الرسوم البيانية */}
        <section className="bg-gradient-to-r from-emerald-50 via-teal-50 to-indigo-50 border-2 border-emerald-300/80 rounded-3xl p-6 sm:p-7 shadow-xs">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2.5 max-w-2xl">
              <div className="inline-flex items-center gap-2 bg-emerald-100/90 text-emerald-900 px-3 py-1 rounded-full text-xs font-bold border border-emerald-300">
                <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                <span>ميزة جديدة: تقرير الإتقان المطبوع (PDF Report)</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                تحميل تقرير تقدم الطالب في جدول الضرب (PDF مع الرسوم البيانية)
              </h2>
              <p className="text-xs sm:text-sm text-slate-700 font-normal leading-relaxed">
                استخرج تقريراً تربوياً رسمياً منسقاً لقياس A4 جاهزاً للتحميل والطباعة، يتضمن المخطط البياني لإتقان الجداول من ١ إلى ١٠، ومعدل الدقة، وتشخيص الأخطاء، والتوصيات التربوية المعتمدة وتوقيعات المتابعة.
              </p>

              {/* مزايا التقرير المطبوع */}
              <div className="flex flex-wrap items-center gap-2.5 pt-1 text-xs font-semibold text-slate-700">
                <span className="flex items-center gap-1.5 bg-white/85 px-3 py-1.5 rounded-xl border border-slate-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  مخطط بياني دقيق لكل جدول
                </span>
                <span className="flex items-center gap-1.5 bg-white/85 px-3 py-1.5 rounded-xl border border-slate-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  مؤشرات الدقة والإتقان
                </span>
                <span className="flex items-center gap-1.5 bg-white/85 px-3 py-1.5 rounded-xl border border-slate-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  تشخيص وتوصيات تربوية
                </span>
                <span className="flex items-center gap-1.5 bg-white/85 px-3 py-1.5 rounded-xl border border-slate-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  مساحة للتوقيع والملاحظات
                </span>
              </div>
            </div>

            {/* أزرار الإجراء السريع */}
            <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setShowReportModal(true);
                }}
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Eye className="w-4 h-4" />
                <span>معاينة وتحميل التقرير (PDF)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  handlePrintReport();
                }}
                className="px-6 py-2.5 bg-white hover:bg-slate-50 text-emerald-900 border border-emerald-300 font-bold text-xs sm:text-sm rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Printer className="w-4 h-4 text-emerald-700" />
                <span>طباعة مباشرة كـ PDF</span>
              </button>
            </div>
          </div>
        </section>

        {/* تحليل الإتقان لكل جدول */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-1">
            تحليل الإتقان حسب كل جدول ضرب
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mb-6 font-normal leading-relaxed">
            متابعة نسبة إتقان حقائق الضرب ونسبة الدقة لكل جدول من جداول الضرب (1 إلى 10).
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
            {tableAnalytics.map((t) => (
              <div
                key={t.tableNum}
                className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-sm sm:text-base text-slate-900 font-sans">
                      جدول {toEastern(t.tableNum)}
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-emerald-600 font-sans">
                      {toEastern(t.percentMastered)}٪
                    </span>
                  </div>

                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mb-3">
                    <div
                      className="bg-emerald-600 h-full rounded-full transition-all"
                      style={{ width: `${t.percentMastered}%` }}
                    />
                  </div>
                </div>

                <div className="text-xs text-slate-600 space-y-1 font-medium font-sans">
                  <div className="flex justify-between">
                    <span>الحقائق المتقنة:</span>
                    <span className="font-bold text-slate-800">{toEastern(t.mastered)} / {toEastern(10)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>نسبة الدقة:</span>
                    <span className="font-bold text-slate-800">{toEastern(t.accuracy)}٪</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* التشخيص التربوي للحقائق التي تحتاج لمزيد من التثبيت */}
        {hardestFacts.length > 0 && (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-1">
              التشخيص التربوي: حقائق ضرب تحتاج لمزيد من التثبيت
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mb-4 font-normal leading-relaxed">
              حُدّدت بناءً على تكرار الأخطاء السابقة؛ يوصى بمراجعتها بالرسم البصري والمجموعات المتساوية.
            </p>

            <div className="space-y-2.5">
              {hardestFacts.map((f, i) => (
                <div
                  key={i}
                  className="p-3.5 bg-rose-50/60 border border-rose-200 rounded-2xl flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-slate-900 text-lg font-sans" dir="rtl">
                      {toEastern(f.fact)} = {toEastern(f.product)}
                    </span>
                    <span className="text-xs sm:text-sm text-slate-600 font-medium font-sans">
                      {toEastern(f.correct)} إجابة صحيحة من أصل {toEastern(f.attempts)} محاولة
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 bg-rose-100 text-rose-800 text-xs sm:text-sm font-bold rounded-lg font-sans">
                      دقة {toEastern(f.accuracy)}٪
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* مولّد أوراق العمل المطبوعة */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                  مولّد أوراق العمل للطباعة والواجبات المنزلية
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 font-normal leading-relaxed">
                إنشاء ورقة عمل تحوي 20 مسألة لتدريب الطالب بالورقة والقلم في المنزل أو الصف المدرسي.
              </p>
            </div>

            <button
              type="button"
              onClick={handlePrintWorksheet}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer self-start sm:self-auto"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة ورقة العمل</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm font-medium text-slate-700">
            <div className="flex items-center gap-2">
              <span className="font-semibold">اختر جدول الضرب:</span>
              <select
                value={worksheetTable}
                onChange={(e) => setWorksheetTable(parseInt(e.target.value, 10))}
                className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 font-semibold font-sans"
              >
                <option value={0}>جميع الجداول معاً (١ إلى ١٠)</option>
                {Array.from({ length: 10 }, (_, i) => i + 1).map((t) => (
                  <option key={t} value={t}>
                    جدول الضرب في {toEastern(t)}
                  </option>
                ))}
              </select>
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showAnswerKey}
                onChange={(e) => setShowAnswerKey(e.target.checked)}
                className="rounded-md text-emerald-600 w-4 h-4"
              />
              <span>تضمين مفتاح الإجابات للنموذج المطبوع</span>
            </label>
          </div>
        </div>
      </div>

      {/* نافذة معاينة وتحميل تقرير التقدّم (PDF) */}
      <StudentReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        progress={progress}
        onPrint={handlePrintReport}
      />
    </div>
  );
};
