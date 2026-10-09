import { MultiplicationFact, StageInfo, Badge } from '../types/game.ts';

// معلومات ومفاهيم كل جدول بما يتوافق مع أحدث المعايير التربوية التفاعلية
export const TABLE_METADATA: Record<number, { title: string; theme: string; itemEmoji: string; themeColor: string; description: string }> = {
  1: {
    title: 'جدول الضرب في 1 (العنصر المحايد)',
    theme: 'نجوم السماء الساطعة',
    itemEmoji: '⭐',
    themeColor: 'amber',
    description: 'ضرب أي عدد في 1 يعطي العدد نفسه دون أي تغيير!',
  },
  2: {
    title: 'جدول الضرب في 2 (المضاعفة)',
    theme: 'أزواج الأشياء وعجلات الدراجات',
    itemEmoji: '🚲',
    themeColor: 'sky',
    description: 'الضرب في 2 هو مضاعفة العدد! نقفز باثنينات: 2، 4، 6، 8...',
  },
  3: {
    title: 'جدول الضرب في 3 (المجموعات الثلاثية)',
    theme: 'تمرات الضيافة وأضلاع المثلث',
    itemEmoji: '🌴',
    themeColor: 'emerald',
    description: 'العد القفزي بالثلاثات: 3، 6، 9، 12! مثل تقديم 3 تمرات شهية في كل طبق.',
  },
  4: {
    title: 'جدول الضرب في 4 (مضاعفة المضاعف)',
    theme: 'أرجل الخيل الأصيل',
    itemEmoji: '🐎',
    themeColor: 'teal',
    description: 'ضاعف الناتج مرتين! 4 × 3 هو ضعف ناتج (2 × 3).',
  },
  5: {
    title: 'جدول الضرب في 5 (نمط الخمسات)',
    theme: 'أصابع اليد والأنماط الخماسية',
    itemEmoji: '🖐️',
    themeColor: 'blue',
    description: 'كل حاصل ضرب في 5 ينتهي برقم آحاد إما 0 أو 5 دائماً!',
  },
  6: {
    title: 'جدول الضرب في 6 (أرجل النحل النشيط)',
    theme: 'أرجل النحل وخلايا العسل الجبلي',
    itemEmoji: '🐝',
    themeColor: 'indigo',
    description: 'للنحلة 6 أرجل، ونمط مضاعفات الستة يتكرر بانتظام ممتع.',
  },
  7: {
    title: 'جدول الضرب في 7 (أيام الأسبوع)',
    theme: 'أيام الأسبوع وألوان قوس قزح',
    itemEmoji: '🌈',
    themeColor: 'purple',
    description: 'في الأسبوع الواحد 7 أيام؛ أسبوعان 14 يوماً، وثلاثة أسابيع 21 يوماً!',
  },
  8: {
    title: 'جدول الضرب في 8 (أذرع الأخطبوط)',
    theme: 'أذرع الأخطبوط العجيب',
    itemEmoji: '🐙',
    themeColor: 'pink',
    description: 'للأخطبوط في أعماق البحار 8 أذرع مرنة! ضاعف العدد ثلاث مرات متتالية.',
  },
  9: {
    title: 'جدول الضرب في 9 (النمط السحري)',
    theme: 'لغز التسعة العبقري',
    itemEmoji: '✨',
    themeColor: 'rose',
    description: 'مجموع أرقام منزلتَي أي ناتج في جدول 9 يساوي دائماً 9! (18: 1+8=9)',
  },
  10: {
    title: 'جدول الضرب في 10 (قوة العشرات)',
    theme: 'حزم العشرات وقوة المنازل',
    itemEmoji: '🪙',
    themeColor: 'yellow',
    description: 'نضع صفراً في منزلة الآحاد فيصبح العدد أكبر بعشر مرات بسرعة وسهولة!',
  },
};

// مسار التعلم المرحلي لإتقان مهارات وحقائق الضرب
export const STAGES: StageInfo[] = [
  {
    stageNumber: 1,
    title: 'المرحلة 1: المجموعات المتساوية والجمع المتكرر',
    subtitle: 'أساسيات مفهوم عملية الضرب',
    tables: [1, 2],
    description: 'استكشاف الضرب كمجموعات متساوية متكررة وعد قفزي منتظم.',
    minStarsToUnlock: 0,
  },
  {
    stageNumber: 2,
    title: 'المرحلة 2: جداول الضرب (1 و 2 و 3)',
    subtitle: 'حقائق الضرب الأساسية والمضاعفة',
    tables: [1, 2, 3],
    description: 'تدريب ممتع على مضاعفة الأعداد والعد القفزي بالثلاثات بالمصفوفات.',
    minStarsToUnlock: 5,
  },
  {
    stageNumber: 3,
    title: 'المرحلة 3: جداول الضرب (4 و 5)',
    subtitle: 'مضاعفة المضاعف ونمط الخمسات',
    tables: [4, 5],
    description: 'إتقان مضاعفة المضاعف لجدول 4 وقراءة نمط 5 المشابه لعقارب الساعة.',
    minStarsToUnlock: 20,
  },
  {
    stageNumber: 4,
    title: 'المرحلة 4: جداول الضرب (6 و 7)',
    subtitle: 'أرجل النحل وأيام الأسبوع',
    tables: [6, 7],
    description: 'توظيف خاصية التوزيع لتسهيل حقائق الضرب في 6 و 7 (مثل: 7×6 = 5×6 + 2×6).',
    minStarsToUnlock: 45,
  },
  {
    stageNumber: 5,
    title: 'المرحلة 5: جداول الضرب (8 و 9 و 10)',
    subtitle: 'أذرع الأخطبوط وسحر التسعة والعشرات',
    tables: [8, 9, 10],
    description: 'إتقان حقائق 8 وحيلة أصابع اليد لجدول 9، وسرعة جدول 10 الفائقة!',
    minStarsToUnlock: 75,
  },
  {
    stageNumber: 6,
    title: 'المرحلة 6: فضاء الإتقان الشامل',
    subtitle: 'تحدي جميع جداول الضرب والطلاقة الرياضية',
    tables: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    description: 'مراجعة تكيفية ذكية وشاملة لجميع حقائق الضرب من 1 إلى 10.',
    minStarsToUnlock: 110,
  },
];

// قاعدة بيانات حقائق الضرب المئة كاملة
export const ALL_FACTS: MultiplicationFact[] = [];

for (let a = 1; a <= 10; a++) {
  for (let b = 1; b <= 10; b++) {
    const product = a * b;
    const additions = Array(a).fill(b).join(' + ');
    const repeatedAddition = a === 1 ? `${b}` : `${additions} = ${product}`;

    let realLife = `${a} مجموعات في كل منها ${b} عناصر تعطي حاصل ضرب ${product}.`;
    if (a === 1) realLife = `مجموعة واحدة بها ${b} عناصر يبقى الناتج ${product}.`;
    else if (a === 2) realLife = `زوجان من ${b} يعطيان إجمالاً ${product}.`;
    else if (b === 2) realLife = `${a} دراجات هوائية في كل منها عجلتان بها ${product} عجلات في المجموع!`;
    else if (b === 3) realLife = `${a} أطباق ضيافة في كل منها 3 تمرات تحوي ${product} تمرة!`;
    else if (b === 4) realLife = `${a} خيول أصيلة لها إجمالاً ${product} حوافر وأرجل!`;
    else if (b === 5) realLife = `${a} أيادٍ بأصابعها الخمسة فيها معاً ${product} أصابع!`;
    else if (b === 6) realLife = `${a} نحلات في خلايا العسل لها معاً ${product} أرجلاً!`;
    else if (b === 7) realLife = `${a} أسابيع كاملة تحتوي على ${product} يوماً!`;
    else if (b === 8) realLife = `${a} أخطبوطات في أعماق البحار لها ${product} أذرع!`;
    else if (b === 10) realLife = `${a} مجموعات في كل منها 10 نقاط ذهبية تساوي ${product} نقطة!`;

    ALL_FACTS.push({
      factorA: a,
      factorB: b,
      product,
      repeatedAddition,
      realLifeExample: realLife,
    });
  }
}

export function getFact(a: number, b: number): MultiplicationFact {
  const found = ALL_FACTS.find((f) => f.factorA === a && f.factorB === b);
  if (found) return found;
  const product = a * b;
  return {
    factorA: a,
    factorB: b,
    product,
    repeatedAddition: `${Array(a).fill(b).join(' + ')} = ${product}`,
    realLifeExample: `${a} مجموعات في كل منها ${b} عناصر تساوي ${product}`,
  };
}

export function getTableFacts(tableNumber: number): MultiplicationFact[] {
  return ALL_FACTS.filter((f) => f.factorA === tableNumber);
}

// الأوسمة والشارات التشجيعية المعتمدة في منصة فُرسان الحساب
export const ALL_BADGES: Badge[] = [
  // --- شارات إتقان الجداول الفردية (1 إلى 10) ---
  {
    id: 'table1_master',
    title: 'خبير جدول الضرب 1',
    description: 'أتقنت جميع حقائق جدول الضرب في 1 وفهمت خاصية العنصر المحايد!',
    icon: '🥇',
    category: 'table',
    targetTable: 1,
    colorTheme: 'emerald',
  },
  {
    id: 'table2_master',
    title: 'خبير جدول الضرب 2',
    description: 'أتقنت حقائق جدول الضرب في 2 واستوعبت استراتيجية المضاعفة!',
    icon: '🚲',
    category: 'table',
    targetTable: 2,
    colorTheme: 'teal',
  },
  {
    id: 'table3_master',
    title: 'خبير جدول الضرب 3',
    description: 'أتقنت حقائق جدول الضرب في 3 والعد التجاوزي بالثلاثات!',
    icon: '📐',
    category: 'table',
    targetTable: 3,
    colorTheme: 'blue',
  },
  {
    id: 'table4_master',
    title: 'خبير جدول الضرب 4',
    description: 'أتقنت جدول 4 بمهارة مضاعفة المضاعفات!',
    icon: '🍀',
    category: 'table',
    targetTable: 4,
    colorTheme: 'emerald',
  },
  {
    id: 'table5_master',
    title: 'خبير جدول الضرب 5',
    description: 'أتقنت جميع حقائق جدول الضرب في 5 ببراعة باهرة وسرعة فائقة!',
    icon: '🖐️',
    category: 'table',
    targetTable: 5,
    colorTheme: 'gold',
  },
  {
    id: 'table6_master',
    title: 'خبير جدول الضرب 6',
    description: 'أتقنت حقائق جدول الضرب في 6 وربطته بجدول 3 بذكاء!',
    icon: '🎲',
    category: 'table',
    targetTable: 6,
    colorTheme: 'purple',
  },
  {
    id: 'table7_master',
    title: 'خبير جدول الضرب 7',
    description: 'اجتزت تحدي جدول 7 الصعب وأثبتت تفوقك الرياضي!',
    icon: '🛡️',
    category: 'table',
    targetTable: 7,
    colorTheme: 'amber',
  },
  {
    id: 'table8_master',
    title: 'خبير جدول الضرب 8',
    description: 'أتقنت جدول الضرب في 8 باستخدام مضاعفة جدول 4!',
    icon: '🐙',
    category: 'table',
    targetTable: 8,
    colorTheme: 'rose',
  },
  {
    id: 'table9_master',
    title: 'خبير جدول الضرب 9',
    description: 'أتقنت لغز جدول الضرب السحري في 9 واستراتيجية الطرح من 10!',
    icon: '🧙‍♂️',
    category: 'table',
    targetTable: 9,
    colorTheme: 'purple',
  },
  {
    id: 'table10_master',
    title: 'خبير جدول الضرب 10',
    description: 'أتقنت الضرب في 10 ووضع الصفر في خانة الآحاد بلمح البصر!',
    icon: '🪙',
    category: 'table',
    targetTable: 10,
    colorTheme: 'gold',
  },

  // --- شارات إنجازات عدد المسائل المحلولة ---
  {
    id: 'questions_10',
    title: 'انطلاقة الأبطال (10 مسائل)',
    description: 'أجبت عن أول 10 مسائل ضرب بنجاح في التطبيق!',
    icon: '🌱',
    category: 'questions',
    targetQuestions: 10,
    colorTheme: 'teal',
  },
  {
    id: 'questions_50',
    title: 'فارس التدريب (50 مسألة)',
    description: 'ثابرت وحللت 50 مسألة ضرب في رحلتك التعليمية!',
    icon: '⚔️',
    category: 'questions',
    targetQuestions: 50,
    colorTheme: 'blue',
  },
  {
    id: 'questions_100',
    title: 'أكملت 100 مسألة',
    description: 'إنجاز استثنائي كبير! أتممت بنجاح حل 100 مسألة ضرب في فُرسان الحساب!',
    icon: '💯',
    category: 'questions',
    targetQuestions: 100,
    colorTheme: 'gold',
  },
  {
    id: 'questions_250',
    title: 'عبقري الرياضيات (250 مسألة)',
    description: 'تفوق واحتراف حقيقي! حللت 250 مسألة ضرب وتستحق لقب العبقري!',
    icon: '💎',
    category: 'questions',
    targetQuestions: 250,
    colorTheme: 'purple',
  },

  // --- شارات التحديات والسرعة والاستكشاف ---
  {
    id: 'speed_champion',
    title: 'بطل تحدي الزمن',
    description: 'أكملت جولة كاملة في تحدي الزمن بنجاح وتغلبت على عقارب الساعة!',
    icon: '⏱️',
    category: 'explorer',
    colorTheme: 'amber',
  },
  {
    id: 'streak_5',
    title: 'الذهن الوقّاد',
    description: 'أجبت عن 5 مسائل متتالية إجابة صحيحة دون أي تردد!',
    icon: '⚡',
    category: 'streak',
    targetStreak: 5,
    colorTheme: 'amber',
  },
  {
    id: 'streak_15',
    title: 'صاروخ الرياضيات',
    description: 'أجبت عن 15 مسألة متتالية بدون أي خطأ.. تركيز فولاذي!',
    icon: '🚀',
    category: 'streak',
    targetStreak: 15,
    colorTheme: 'rose',
  },
  {
    id: 'detective_pro',
    title: 'المحقق الذكي',
    description: 'اكتشفت الأخطاء الخفية في تحدي محقق الرياضيات وأصلحتها!',
    icon: '🔍',
    category: 'explorer',
    colorTheme: 'blue',
  },
  {
    id: 'bingo_winner',
    title: 'بطل بينجو الضرب',
    description: 'أكملت خطاً كاملاً وفزت في لعبة بينجو الضرب التفاعلية!',
    icon: '🎯',
    category: 'explorer',
    colorTheme: 'emerald',
  },
  {
    id: 'first_star',
    title: 'نجمة البداية',
    description: 'حصلت على أول نجمة ذهبية في رحلتك مع فُرسان الحساب!',
    icon: '✨',
    category: 'explorer',
    colorTheme: 'gold',
  },
  {
    id: 'stage1_clear',
    title: 'بطل المجموعات المتساوية',
    description: 'أتممت المرحلة الأولى: المجموعات المتساوية والجمع المتكرر بنجاح!',
    icon: '🏆',
    category: 'mastery',
    colorTheme: 'emerald',
  },
  {
    id: 'table_grandmaster',
    title: 'فارس الحساب الأكبر',
    description: 'المجد التام! أتقنت جميع حقائق الضرب المئة من 1×1 إلى 10×10!',
    icon: '👑',
    category: 'mastery',
    colorTheme: 'gold',
  },
  {
    id: 'daily_streak_3',
    title: 'المثابر النشيط (3 أيام)',
    description: 'تدربت في التطبيق لـ 3 أيام متتالية، أحسنت!',
    icon: '🔥',
    category: 'streak',
    colorTheme: 'rose',
  },
  {
    id: 'daily_streak_7',
    title: 'تاج الالتزام الأسبوعي (7 أيام)',
    description: 'استمرارية مذهلة لمدة أسبوع كامل في منصة فُرسان الحساب.. أحسنت يا بطل!',
    icon: '🌟',
    category: 'streak',
    colorTheme: 'gold',
  },
];
