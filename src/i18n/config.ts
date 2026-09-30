import { en } from './locales/en'
import { ru, type Locale } from './locales/ru'
import { sr } from './locales/sr'

// Порядок — как в переключателе
export const LANGS = ['sr', 'ru', 'en'] as const
export type Lang = (typeof LANGS)[number]

export const locales: Record<Lang, Locale> = { sr, ru, en }

/** Названия языков на самих языках — для подсказок и скринридеров */
export const LANG_NAMES: Record<Lang, string> = { sr: 'Srpski', ru: 'Русский', en: 'English' }

const FALLBACK: Lang = 'en'
const STORAGE_KEY = 'willow-lang'
const URL_PARAM = 'lang'

const isLang = (value: unknown): value is Lang => LANGS.includes(value as Lang)

// Хорватский, боснийский и черногорский браузер тоже получает сербскую версию
const BROWSER_ALIASES: Record<string, Lang> = { hr: 'sr', bs: 'sr', sh: 'sr', cnr: 'sr' }

/** Язык при первом показе: ?lang= в адресе → прошлый выбор → язык браузера → английский */
export function detectLang(): Lang {
  const fromUrl = new URLSearchParams(window.location.search).get(URL_PARAM)
  if (isLang(fromUrl)) return fromUrl

  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (isLang(saved)) return saved
  } catch {
    // хранилище может быть недоступно (приватный режим) — идём дальше
  }

  for (const tag of navigator.languages ?? [navigator.language]) {
    const code = tag.toLowerCase().split('-')[0]
    if (isLang(code)) return code
    if (code in BROWSER_ALIASES) return BROWSER_ALIASES[code]
  }
  return FALLBACK
}

export function persistLang(lang: Lang) {
  try {
    localStorage.setItem(STORAGE_KEY, lang)
  } catch {
    // без хранилища выбор живёт до перезагрузки
  }
  // Если язык был задан в адресе, обновляем его там же — иначе после перезагрузки вернётся старый
  const url = new URL(window.location.href)
  if (url.searchParams.has(URL_PARAM)) {
    url.searchParams.set(URL_PARAM, lang)
    window.history.replaceState(null, '', url)
  }
}

export const fill = (template: string, values: Record<string, string>) =>
  template.replace(/\{(\w+)\}/g, (_, key: string) => values[key] ?? '')
