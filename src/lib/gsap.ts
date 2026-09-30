import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { ScrollToPlugin } from 'gsap/ScrollToPlugin'
import { Flip } from 'gsap/Flip'
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin'
import { useGSAP } from '@gsap/react'

// Draggable и InertiaPlugin нужны только карусели отзывов — они регистрируются в lib/horizontalLoop.ts,
// который подгружается отдельным файлом после показа первого экрана
gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText, ScrollToPlugin, Flip, DrawSVGPlugin)
gsap.defaults({ duration: 0.8, ease: 'power3.out' })

// Маркеры ScrollTrigger для отладки: только в dev и только с ?markers в адресе,
// чтобы не засорять страницу при обычном просмотре. В prod не попадают никогда.
const debugMarkers = import.meta.env.DEV && new URLSearchParams(window.location.search).has('markers')
ScrollTrigger.defaults({ markers: debugMarkers })

/** Условия для gsap.matchMedia(): на мобайле нет pin и параллакса, при reduce — только opacity */
export const media = {
  desktop: '(min-width: 768px)',
  mobile: '(max-width: 767px)',
  motion: '(prefers-reduced-motion: no-preference)',
  reduce: '(prefers-reduced-motion: reduce)',
  /** Закрепление секции «Хиты»: широкий и не слишком низкий экран, движение разрешено */
  pin: '(min-width: 768px) and (min-height: 640px) and (prefers-reduced-motion: no-preference)',
}

let refreshTimer: ReturnType<typeof setTimeout> | undefined

/** Пересчитать точки старта после изменения высоты страницы (шрифты, картинки, язык, вкладки меню) */
export function refreshScroll() {
  clearTimeout(refreshTimer)
  refreshTimer = setTimeout(() => ScrollTrigger.refresh(), 100)
}

/**
 * Маска строки SplitText режет текст ровно по высоте строки и срезает «й», «ё» и нижние выносные.
 * Расширяем маску на запас сверху и снизу так, чтобы вёрстка не сдвинулась: нижний отступ
 * съедает добавленную высоту (одной стороной — иначе соседние отступы схлопнутся), top возвращает строку на место.
 */
export function padLineMasks(split: SplitText, em = 0.14) {
  gsap.set(split.masks, {
    paddingBlock: `${em}em`,
    marginBottom: `${-2 * em}em`,
    position: 'relative',
    top: `${-em}em`,
  })
}

export { gsap, ScrollTrigger, SplitText, Flip, useGSAP }
