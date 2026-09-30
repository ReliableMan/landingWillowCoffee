import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { detectLang, locales, persistLang, type Lang } from './config'
import { LangContext } from './useLang'

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState(detectLang)
  const t = locales[lang]

  const setLang = useCallback((next: Lang) => {
    setLangState(next)
    persistLang(next)
  }, [])

  // <html lang>, заголовок вкладки и описание следуют за языком
  useEffect(() => {
    document.documentElement.lang = lang
    document.title = t.meta.title
    document.querySelector('meta[name="description"]')?.setAttribute('content', t.meta.description)
  }, [lang, t])

  const value = useMemo(() => ({ lang, setLang, t }), [lang, setLang, t])

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>
}
