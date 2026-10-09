import React from 'react';
import { UserProgress } from '../types/game.ts';
import { StudentProgressReport } from './StudentProgressReport.tsx';
import { sound } from '../utils/audio.ts';
import { Printer, Download, X, FileText, CheckCircle2, Sparkles, HelpCircle } from 'lucide-react';

interface StudentReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  progress: UserProgress;
  onPrint: () => void;
}

export const StudentReportModal: React.FC<StudentReportModalProps> = ({
  isOpen,
  onClose,
  progress,
  onPrint,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 no-print"
      dir="rtl"
    >
      <div className="relative w-full max-w-4xl bg-slate-100 rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden border border-slate-300">
        {/* شريط الإجراءات العلوي للنافذة */}
        <div className="bg-white px-5 py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                معاينة تقرير إتقان الطالب (نسخة PDF المطبوعة)
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                تقرير رسمي تفصيلي شامل للرسوم البيانية ومؤشرات جداول الضرب (1-10)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* زر تحميل وطباعة PDF */}
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                onPrint();
              }}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>تحميل وحفظ كـ PDF / طباعة</span>
            </button>

            {/* زر الإغلاق */}
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                onClose();
              }}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              aria-label="إغلاق النافذة"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* تنبيه إرشادي لطريقة حفظ ملف PDF */}
        <div className="bg-emerald-50/90 border-b border-emerald-200/80 px-5 py-2.5 flex items-center justify-between text-xs text-emerald-900 shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              <strong>طريقة التحميل كملف PDF:</strong> اضغط على الزر الأخضر أعلاه، ثم اختر من وجهة الطباعة (Destination) خيار <strong>«حفظ بتنسيق PDF» (Save as PDF)</strong>.
            </span>
          </div>
          <span className="hidden md:inline-block text-[11px] text-emerald-700 font-semibold">
            متوافق مع قياس A4 القياسي
          </span>
        </div>

        {/* مساحة المعاينة الورقية (ورقة A4 بيضاء مع ظلال ورقية) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-200/60">
          <div className="shadow-xl rounded-xl overflow-hidden bg-white max-w-4xl mx-auto border border-slate-300">
            <StudentProgressReport progress={progress} isPrintOnly={false} />
          </div>
        </div>

        {/* شريط سفلي للأزرار السريعة */}
        <div className="bg-white px-5 py-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <span>الطالب: <strong>{progress.playerName}</strong> · منصة فُرسان الحساب التفاعلية</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                onClose();
              }}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl cursor-pointer"
            >
              إغلاق المعاينة
            </button>
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                onPrint();
              }}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl cursor-pointer flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>طباعة / حفظ PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
