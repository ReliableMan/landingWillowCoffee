import { useEffect } from 'react'
import { useLang } from '@/i18n/useLang'
import { refreshScroll } from '@/lib/gsap'

/** Держит точки старта ScrollTrigger в актуальном состоянии: шрифты, картинки и смена языка меняют высоту страницы */
export function useScrollRefresh() {
  const { lang } = useLang()

  useEffect(() => {
    let active = true
    document.fonts.ready.then(() => active && refreshScroll())

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

  useEffect(() => {
    refreshScroll()
  }, [lang])
}
