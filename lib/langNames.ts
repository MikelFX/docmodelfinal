export const LANG_NAMES: Record<string, string> = {
  cs: 'Czech', sk: 'Slovak', en: 'English', de: 'German',
  fr: 'French', es: 'Spanish', it: 'Italian', pl: 'Polish',
  nl: 'Dutch', pt: 'Portuguese', ro: 'Romanian', hu: 'Hungarian',
  sv: 'Swedish', da: 'Danish', fi: 'Finnish', el: 'Greek',
  hr: 'Croatian', bg: 'Bulgarian', sl: 'Slovenian', et: 'Estonian',
  lv: 'Latvian', lt: 'Lithuanian', mt: 'Maltese', ga: 'Irish',
}

export function langInstruction(lang: string): string {
  const name = LANG_NAMES[lang] ?? 'English'
  return `Respond in ${name}.`
}
