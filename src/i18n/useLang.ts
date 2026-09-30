import { createContext, useContext } from 'react'
import type { Lang } from './config'
import type { Locale } from './locales/ru'

export type LangContextValue = {
  lang: Lang
  setLang: (lang: Lang) => void
  /** Тексты на текущем языке */
  t: Locale
}

export const LangContext = createContext<LangContextValue | null>(null)

export function useLang() {
  const value = useContext(LangContext)
  if (!value) throw new Error('useLang: компонент должен быть внутри <LangProvider>')
  return value
}
