import { LANG_NAMES, LANGS } from '@/i18n/config'
import { useLang } from '@/i18n/useLang'

export function LangSwitcher({ className = '' }: { className?: string }) {
  const { lang, setLang, t } = useLang()

  return (
    <div
      role="group"
      aria-label={t.header.langLabel}
      className={`flex rounded-full border border-ink/25 p-0.5 text-[13px] font-semibold ${className}`}
    >
      {LANGS.map((code) => {
        const active = code === lang
        return (
          <button
            key={code}
            type="button"
            lang={code}
            title={LANG_NAMES[code]}
            // в имени для скринридера есть и видимая надпись (RU), и полное название языка
            aria-label={`${code.toUpperCase()}, ${LANG_NAMES[code]}`}
            aria-pressed={active}
            data-lang-option
            onClick={() => setLang(code)}
            className={`rounded-full px-2.5 py-1.5 leading-none uppercase transition-colors duration-200 ${
              active ? 'bg-ink text-paper' : 'text-muted hover:text-ink'
            }`}
          >
            {code}
          </button>
        )
      })}
    </div>
  )
}
