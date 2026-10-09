// نظام تحويل وتنسيق الأرقام الهندية (المشرقية): ٠، ١، ٢، ٣، ٤، ٥، ٦، ٧، ٨، ٩
// ٠، ١، ٢، ٣، ٤، ٥، ٦، ٧، ٨، ٩

const EASTERN_ARABIC_DIGITS = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];

const WESTERN_TO_EASTERN_MAP: Record<string, string> = {
  '0': '٠',
  '1': '١',
  '2': '٢',
  '3': '٣',
  '4': '٤',
  '5': '٥',
  '6': '٦',
  '7': '٧',
  '8': '٨',
  '9': '٩',
};

const EASTERN_TO_WESTERN_MAP: Record<string, string> = {
  '٠': '0',
  '١': '1',
  '٢': '2',
  '٣': '3',
  '٤': '4',
  '٥': '5',
  '٦': '6',
  '٧': '7',
  '٨': '8',
  '٩': '9',
};

/**
 * تحويل أي رقم أو نص يحتوي على أرقام غربية (0-9) إلى أرقام هندية (٠-٩)
 * مثل: 15 -> ١٥ ، 100% -> ١٠٠٪ ، 4 × 3 = 12 -> ٤ × ٣ = ١٢
 */
export function toEastern(input: number | string | null | undefined): string {
  if (input === null || input === undefined) return '';
  const str = String(input);
  return str.replace(/[0-9]/g, (digit) => WESTERN_TO_EASTERN_MAP[digit] || digit);
}

// الاسم البديل للسهولة
export const toArabicDigits = toEastern;
export const toEasternArabicNumerals = toEastern;

/**
 * تحويل الأرقام الهندية (٠-٩) إلى أرقام غربية (0-9) للعمليات الحسابية الداخلية والتحليل
 */
export function toWestern(input: string | null | undefined): string {
  if (!input) return '';
  return input.replace(/[٠-٩]/g, (digit) => EASTERN_TO_WESTERN_MAP[digit] || digit);
}

export const toWesternDigits = toWestern;

/**
 * تنسيق مسألة ضرب بالأرقام الهندية
 * مثال: formatEquation(4, 3) -> "٤ × ٣"
 * مثال: formatEquation(4, 3, 12) -> "٤ × ٣ = ١٢"
 */
export function formatEquation(a: number | string, b: number | string, product?: number | string): string {
  const ea = toEastern(a);
  const eb = toEastern(b);
  if (product !== undefined && product !== null) {
    return `${ea} × ${eb} = ${toEastern(product)}`;
  }
  return `${ea} × ${eb}`;
}

/**
 * تنسيق الجمع المتكرر بالأرقام الهندية
 * مثال: formatRepeatedAddition(4, 3, 12) -> "٣ + ٣ + ٣ + ٣ = ١٢"
 */
export function formatRepeatedAddition(factorA: number, factorB: number, product: number): string {
  const eb = toEastern(factorB);
  const ep = toEastern(product);
  const parts = Array(factorA).fill(eb);
  return `${parts.join(' + ')} = ${ep}`;
}

/**
 * تنسيق النسبة المئوية
 * مثال: formatPercent(85) -> "٨٥٪"
 */
export function formatPercent(val: number | string): string {
  return `${toEastern(val)}٪`;
}
