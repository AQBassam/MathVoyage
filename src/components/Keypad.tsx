import React, { useEffect } from 'react';
import { Delete, CornerDownLeft, RotateCcw } from 'lucide-react';
import { sound } from '../utils/audio.ts';
import { toWestern } from '../utils/arabicNumerals.ts';

interface KeypadProps {
  value: string;
  onChange: (val: string) => void;
  onSubmit: () => void;
  maxDigits?: number;
  disabled?: boolean;
}

const DIGIT_KEYS = [
  { val: '1', label: '١' },
  { val: '2', label: '٢' },
  { val: '3', label: '٣' },
  { val: '4', label: '٤' },
  { val: '5', label: '٥' },
  { val: '6', label: '٦' },
  { val: '7', label: '٧' },
  { val: '8', label: '٨' },
  { val: '9', label: '٩' },
];

export const Keypad: React.FC<KeypadProps> = ({
  value,
  onChange,
  onSubmit,
  maxDigits = 3,
  disabled = false,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (disabled) return;
      const western = toWestern(e.key);
      if (western >= '0' && western <= '9') {
        if (value.length < maxDigits) {
          sound.playClick();
          onChange(value + western);
        }
      } else if (e.key === 'Backspace') {
        sound.playClick();
        onChange(value.slice(0, -1));
      } else if (e.key === 'Enter') {
        if (value.length > 0) {
          onSubmit();
        }
      } else if (e.key === 'Escape' || e.key === 'c' || e.key === 'C') {
        sound.playClick();
        onChange('');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [value, onChange, onSubmit, maxDigits, disabled]);

  const handleDigit = (digit: string) => {
    if (disabled || value.length >= maxDigits) return;
    sound.playClick();
    onChange(value + digit);
  };

  const handleDelete = () => {
    if (disabled || value.length === 0) return;
    sound.playClick();
    onChange(value.slice(0, -1));
  };

  const handleClear = () => {
    if (disabled || value.length === 0) return;
    sound.playClick();
    onChange('');
  };

  return (
    <div className="w-full max-w-xs mx-auto" dir="rtl">
      <div className="grid grid-cols-3 gap-2.5">
        {DIGIT_KEYS.map(({ val, label }) => (
          <button
            key={val}
            type="button"
            disabled={disabled}
            onClick={() => handleDigit(val)}
            className="h-14 md:h-16 rounded-2xl bg-white border border-slate-200 text-slate-900 text-2xl font-bold shadow-xs hover:bg-slate-50 active:scale-95 transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center font-sans"
            aria-label={`الرقم ${label}`}
          >
            {label}
          </button>
        ))}

        {/* زر مسح الكل */}
        <button
          type="button"
          disabled={disabled || value.length === 0}
          onClick={handleClear}
          className="h-14 md:h-16 rounded-2xl bg-slate-100 border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-200 active:scale-95 transition-all disabled:opacity-40 cursor-pointer flex items-center justify-center gap-1"
          aria-label="مسح الإجابة"
        >
          <RotateCcw className="w-4 h-4" />
          <span>مسح</span>
        </button>

        {/* الصفر */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => handleDigit('0')}
          className="h-14 md:h-16 rounded-2xl bg-white border border-slate-200 text-slate-900 text-2xl font-bold shadow-xs hover:bg-slate-50 active:scale-95 transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center font-sans"
          aria-label="الرقم صفر"
        >
          ٠
        </button>

        {/* زر حذف رقم واحد */}
        <button
          type="button"
          disabled={disabled || value.length === 0}
          onClick={handleDelete}
          className="h-14 md:h-16 rounded-2xl bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200 active:scale-95 transition-all disabled:opacity-40 cursor-pointer flex items-center justify-center"
          aria-label="حذف خانة"
        >
          <Delete className="w-6 h-6 rotate-180" />
        </button>
      </div>

      {/* زر التحقق من الإجابة */}
      <button
        type="button"
        disabled={disabled || value.length === 0}
        onClick={() => {
          sound.playClick();
          onSubmit();
        }}
        className="w-full mt-3 h-14 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base sm:text-lg shadow-sm active:scale-98 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
        aria-label="تأكيد الإجابة"
      >
        <span>تحقق من الإجابة</span>
        <CornerDownLeft className="w-5 h-5 -scale-x-100" />
      </button>
    </div>
  );
};
