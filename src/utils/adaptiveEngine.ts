import { ALL_FACTS, getFact } from '../data/multiplicationData.ts';
import { FactMasteryData, MultiplicationFact } from '../types/game.ts';

export interface QuestionSpec {
  fact: MultiplicationFact;
  distractors: number[];
  isHardOrStruggling: boolean;
}

/**
 * محرك التوليد التكيفي للأسئلة بما يلائم مستوى الطالب
 */
export function getAdaptiveQuestions(
  tableNumber: number, // من 1 إلى 10، أو 0 للتحدي الشامل
  factsMastery: Record<string, FactMasteryData>,
  count: number = 8,
  allowedTables?: number[]
): QuestionSpec[] {
  let candidateFacts = ALL_FACTS;
  if (tableNumber >= 1 && tableNumber <= 10) {
    candidateFacts = ALL_FACTS.filter((f) => f.factorA === tableNumber);
  } else if (allowedTables && allowedTables.length > 0) {
    candidateFacts = ALL_FACTS.filter((f) => allowedTables.includes(f.factorA));
  }

  const scored = candidateFacts.map((fact) => {
    const key = `${fact.factorA}x${fact.factorB}`;
    const data = factsMastery[key];

    let priorityScore = 10;

    if (!data || data.attempts === 0) {
      priorityScore = 25;
    } else {
      const accuracy = data.correct / data.attempts;
      if (accuracy < 0.6) {
        priorityScore = 50 + (data.attempts - data.correct) * 10;
      } else if (!data.isMastered) {
        priorityScore = 30 + (3 - data.consecutiveCorrect) * 5;
      } else {
        priorityScore = 5;
      }
    }

    return {
      fact,
      score: priorityScore,
      isStruggling: data ? data.attempts >= 2 && data.correct / data.attempts < 0.7 : false,
    };
  });

  scored.sort((a, b) => b.score - a.score + (Math.random() * 15 - 7.5));
  const selected = scored.slice(0, count);

  return selected.map((item) => {
    const distractors = generateSmartDistractors(item.fact);
    return {
      fact: item.fact,
      distractors,
      isHardOrStruggling: item.isStruggling,
    };
  });
}

/**
 * توليد خيارات بديلة ذكية ومنطقية للتلاميذ (مثل مضاعفات مجاورة أو ناتج الجمع بالخطأ)
 */
export function generateSmartDistractors(fact: MultiplicationFact): number[] {
  const correct = fact.product;
  const a = fact.factorA;
  const b = fact.factorB;

  const candidates = new Set<number>();

  if (b > 1) candidates.add(a * (b - 1));
  if (b < 10) candidates.add(a * (b + 1));
  if (a > 1) candidates.add((a - 1) * b);
  if (a < 10) candidates.add((a + 1) * b);

  if (a + b !== correct && a + b > 0) candidates.add(a + b);

  if (correct + 2 > 0 && correct + 2 !== correct) candidates.add(correct + 2);
  if (correct - 2 > 0 && correct - 2 !== correct) candidates.add(correct - 2);
  if (correct + 10 !== correct) candidates.add(correct + 10);
  if (correct - 10 > 0 && correct - 10 !== correct) candidates.add(correct - 10);

  candidates.delete(correct);

  const array = Array.from(candidates).filter((n) => n > 0 && n <= 100);
  array.sort(() => Math.random() - 0.5);

  return array.slice(0, 3);
}

// عبارات التشجيع عند الإجابة الصحيحة
export const ENCOURAGING_SUCCESS_MESSAGES = [
  'أحسنت يا بطل!',
  'إجابة ممتازة وموفقة!',
  'أنت متميز في الرياضيات!',
  'بارك الله فيك، فكرة رائعة!',
  'رائع جداً، استمر هكذا!',
  'إجابة صحيحة وذكية!',
  'ما شاء الله، إتقان مذهل!',
  'عمل بطولي مميز!',
  'حاصل ضرب صحيح 100%!',
  'ذكاء رياضي رائع!',
];

// عبارات التحفيز والمساندة عند الحاجة للمراجعة
export const ENCOURAGING_MISTAKE_MESSAGES = [
  'محاولة جيدة! هيا نكتشف طريقة حلها بالرسم:',
  'لا بأس يا بطل، الأخطاء تعلمنا! انظر إلى المجموعات:',
  'أنت قريب جداً! تأمل هذا التمثيل البصري:',
  'دعنا نعدها معاً خطوة بخطوة:',
  'هيا نراجع حقيقة الضرب هذه معاً بكل متعة:',
  'انظر كيف تتكرر المجموعات لتصل للحل الصحيح:',
];

export function getRandomSuccessMessage(): string {
  return ENCOURAGING_SUCCESS_MESSAGES[Math.floor(Math.random() * ENCOURAGING_SUCCESS_MESSAGES.length)];
}

export function getRandomMistakeMessage(): string {
  return ENCOURAGING_MISTAKE_MESSAGES[Math.floor(Math.random() * ENCOURAGING_MISTAKE_MESSAGES.length)];
}
