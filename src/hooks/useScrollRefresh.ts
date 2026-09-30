import { useEffect, useRef } from 'react'
import { useLang } from '@/i18n/useLang'
import { refreshScroll } from '@/lib/gsap'

/** Держит точки старта ScrollTrigger в актуальном состоянии: шрифты, картинки и смена языка меняют высоту страницы */
export function useScrollRefresh() {
  const { lang } = useLang()
  const prevLang = useRef(lang)

  useEffect(() => {
    let active = true
    // ScrollTrigger сам пересчитывается по событию load. Наш пересчёт нужен, только если шрифты
    // догрузились уже после него, — лишний пересчёт на старте стоит дорого.
    document.fonts.ready.then(() => {
      if (active && document.readyState === 'complete') refreshScroll()
    })

    // load не всплывает, поэтому ловим его на фазе перехвата
    const onLoad = (e: Event) => {
      if (e.target instanceof HTMLImageElement) refreshScroll()
    }
    document.addEventListener('load', onLoad, true)

    return () => {
      active = false
      document.removeEventListener('load', onLoad, true)
    }
  }, [])

  // только при смене языка, не при первом показе
  useEffect(() => {
    if (prevLang.current === lang) return
    prevLang.current = lang
    refreshScroll()
  }, [lang])
}
