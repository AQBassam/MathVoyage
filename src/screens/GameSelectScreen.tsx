import React, { useState } from 'react';
import { GameType } from '../types/game.ts';
import { sound } from '../utils/audio.ts';
import { toEastern } from '../utils/arabicNumerals.ts';
import {
  Sparkles,
  Layers,
  Calculator,
  CheckCircle2,
  HelpCircle,
  GitCompare,
  Box,
  Rocket,
  Shuffle,
  CheckSquare,
  Copy,
  Compass,
  Trophy,
  Search,
  Timer,
} from 'lucide-react';

interface GameSelectScreenProps {
  onStartGame: (gameType: GameType, tableNumber: number) => void;
}

interface GameDefinition {
  type: GameType;
  title: string;
  category: 'visual' | 'equation' | 'puzzle';
  description: string;
  icon: React.ReactNode;
  badge: string;
}

const ALL_GAMES: GameDefinition[] = [
  {
    type: 'visuals',
    title: '١. التعلّم بالتمثيل البصري',
    category: 'visual',
    description: 'استكشف المجموعات المتساوية، والمصفوفات، والعد القفزي، والجمع المتكرر.',
    icon: <Layers className="w-6 h-6 text-emerald-600" />,
    badge: 'تأسيس ومفاهيم',
  },
  {
    type: 'equation',
    title: '٢. أوجد حاصل الضرب',
    category: 'equation',
    description: 'حل جملة الضرب باستخدام لوحة الأرقام اللمسية مع إمكانية عرض رسوم توضيحية.',
    icon: <Calculator className="w-6 h-6 text-indigo-600" />,
    badge: 'تدريب أساسي',
  },
  {
    type: 'choice',
    title: '٣. اختر حاصل الضرب الصحيح',
    category: 'equation',
    description: 'اختر ناتج الضرب الصحيح من بين خيارات ذكية مع تغذية راجعة فورية مشجعة.',
    icon: <CheckCircle2 className="w-6 h-6 text-sky-600" />,
    badge: 'سرعة واسترجاع',
  },
  {
    type: 'missing',
    title: '٤. العدد المفقود في جملة الضرب',
    category: 'equation',
    description: 'أوجد العامل الناقص في جملة الضرب (مثل: ٦ × ؟ = ٤٢) لترسيخ الفهم العكسي.',
    icon: <HelpCircle className="w-6 h-6 text-amber-600" />,
    badge: 'العلاقة العكسية',
  },
  {
    type: 'pairs',
    title: '٥. صِل بين البطاقات المتطابقة',
    category: 'puzzle',
    description: 'اربط كل حقيقة ضرب بحاصل ضربها المطابق عبر توصيل البطاقات الملونة.',
    icon: <GitCompare className="w-6 h-6 text-purple-600" />,
    badge: 'مطابقة الأزواج',
  },
  {
    type: 'build',
    title: '٦. كوّن حاصل الضرب بالقيمة المكانية',
    category: 'visual',
    description: 'ابنِ ناتج الضرب باستخدام أعمدة العشرات ومكعبات الآحاد لربطه بالقيمة المكانية.',
    icon: <Box className="w-6 h-6 text-teal-600" />,
    badge: 'القيمة المكانية',
  },
  {
    type: 'race',
    title: '٧. سباق الصاروخ الرياضي',
    category: 'equation',
    description: 'سباق فضائي مشوق بدون توتر، يتقدم الصاروخ فيه كلما أجبت إجابة صحيحة.',
    icon: <Rocket className="w-6 h-6 text-rose-600 -scale-x-100" />,
    badge: 'سباق هادئ وممتع',
  },
  {
    type: 'mixed',
    title: '٨. التحدي الشامل والتكيفي',
    category: 'equation',
    description: 'مراجعة ذكية تدمج كل ما تعلمته مع إحضار المسائل التي تحتاج تركيزاً متكرراً.',
    icon: <Shuffle className="w-6 h-6 text-indigo-600" />,
    badge: 'إتقان تكيفي',
  },
  {
    type: 'truefalse',
    title: '٩. صواب أم خطأ؟',
    category: 'equation',
    description: 'تفكير منطقي سريع: تأكد مما إذا كانت عبارة الضرب الرياضية صائبة أم خاطئة.',
    icon: <CheckSquare className="w-6 h-6 text-emerald-600" />,
    badge: 'منطق رياضي',
  },
  {
    type: 'memory',
    title: '١٠. ذاكرة حقائق الضرب',
    category: 'puzzle',
    description: 'اقلب البطاقات واعثر على الأزواج التي تجمع جملة الضرب مع حاصل ضربها.',
    icon: <Copy className="w-6 h-6 text-violet-600" />,
    badge: 'تركيز وذاكرة',
  },
  {
    type: 'maze',
    title: '١١. متاهة مضاعفات الضرب',
    category: 'puzzle',
    description: 'سر فقط على الأعداد التي تعتبر من مضاعفات جدولك لتصل للمرمى بنجاح!',
    icon: <Compass className="w-6 h-6 text-blue-600" />,
    badge: 'مضاعفات ومسارات',
  },
  {
    type: 'bingo',
    title: '١٢. بينجو جدول الضرب',
    category: 'puzzle',
    description: 'اختم حاصل الضرب المطلوب على بطاقتك لتكوين خط فائز كامل!',
    icon: <Trophy className="w-6 h-6 text-amber-600" />,
    badge: 'لعبة البينجو',
  },
  {
    type: 'detective',
    title: '١٣. محقق الرياضيات الذكي',
    category: 'puzzle',
    description: 'ابحث عن جملة الضرب التي تحتوي على خطأ خفي واكتشفه بذكاء رياضي!',
    icon: <Search className="w-6 h-6 text-teal-600" />,
    badge: 'اكتشاف الأخطاء',
  },
  {
    type: 'timechallenge',
    title: '١٤. تحدي الزمن (السرعة والدقة)',
    category: 'equation',
    description: 'أجب عن معادلات الضرب مع عداد تنازلي لتشجيع السرعة والدقة في أجواء ممتعة ومحفزة!',
    icon: <Timer className="w-6 h-6 text-amber-500 animate-pulse" />,
    badge: 'سرعة ودقة',
  },
];

export const GameSelectScreen: React.FC<GameSelectScreenProps> = ({ onStartGame }) => {
  const [selectedTable, setSelectedTable] = useState<number>(2);
  const [filter, setFilter] = useState<'all' | 'visual' | 'equation' | 'puzzle'>('all');

  const filteredGames = ALL_GAMES.filter((g) => filter === 'all' || g.category === filter);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6 text-right">
      {/* رأس الصفحة */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug">
          صالات ألعاب الضرب ({toEastern(14)} نشاطاً تعليمياً)
        </h1>
        <p className="text-sm sm:text-base text-slate-600 mt-1 font-normal leading-relaxed">
          اختر جدول الضرب المطلوب أولاً، ثم حدد لعبتك المفضلة لتثبيت المفاهيم والاستمتاع بالرياضيات!
        </p>
      </div>

      {/* منتقي الجدول المخصص للتدريب */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
        <div className="text-xs sm:text-sm font-semibold text-slate-700 uppercase tracking-wide mb-2.5">
          الجدول المختار للتدريب في اللعبة:
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              setSelectedTable(0);
            }}
            className={`px-3.5 py-2 rounded-xl border text-xs sm:text-sm whitespace-nowrap cursor-pointer transition-all ${
              selectedTable === 0
                ? 'bg-indigo-600 border-indigo-600 text-white font-bold shadow-xs'
                : 'bg-slate-50 border-slate-200 text-slate-700 font-medium hover:bg-slate-100'
            }`}
          >
            🌌 جميع الجداول معاً (١–١٠)
          </button>

          {Array.from({ length: 10 }, (_, i) => i + 1).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => {
                sound.playClick();
                setSelectedTable(t);
              }}
              className={`px-3.5 py-2 rounded-xl border text-xs sm:text-sm whitespace-nowrap cursor-pointer transition-all ${
                selectedTable === t
                  ? 'bg-emerald-600 border-emerald-600 text-white font-bold shadow-xs'
                  : 'bg-slate-50 border-slate-200 text-slate-700 font-medium hover:bg-slate-100'
              }`}
            >
              جدول {toEastern(t)}
            </button>
          ))}
        </div>
      </div>

      {/* تصفية الألعاب */}
      <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-2xl self-start max-w-lg">
        {(
          [
            { id: 'all', label: `جميع الألعاب (${toEastern(14)})` },
            { id: 'visual', label: 'التمثيل البصري والمفاهيم' },
            { id: 'equation', label: 'المسائل والتطبيق' },
            { id: 'puzzle', label: 'الألغاز والذكاء' },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => {
              sound.playClick();
              setFilter(tab.id);
            }}
            className={`flex-1 py-1.5 px-3 text-xs sm:text-sm rounded-xl transition-colors cursor-pointer whitespace-nowrap ${
              filter === tab.id
                ? 'bg-white text-slate-900 font-bold shadow-xs'
                : 'text-slate-600 font-medium hover:text-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* شبكة الألعاب */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredGames.map((game) => (
          <div
            key={game.type}
            className="p-5 bg-white border border-slate-200 rounded-3xl shadow-xs hover:border-emerald-300 hover:shadow-sm transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-2.5">
                <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-2xl">
                  {game.icon}
                </div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  {game.badge}
                </span>
              </div>

              <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-1">
                {game.title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4 font-normal">
                {game.description}
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                sound.playClick();
                onStartGame(game.type, selectedTable);
              }}
              className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>
                العب الآن بـ {selectedTable === 0 ? 'جميع الجداول' : `جدول ${toEastern(selectedTable)}`}
              </span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
