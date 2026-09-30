import type { RefObject } from 'react'
import { gsap, media, useGSAP } from '@/lib/gsap'
import { onceInView } from '@/lib/inView'

/** Базовое появление: всё с атрибутом data-reveal внутри секции выезжает снизу с проявлением, один раз */
export function useReveal(scope: RefObject<HTMLElement | null>) {
  useGSAP(
    () => {
      const root = scope.current
      if (!root) return
      const mm = gsap.matchMedia()
      mm.add({ motion: media.motion, reduce: media.reduce }, (ctx) => {
        const { reduce } = ctx.conditions as { reduce: boolean }
        const stops = Array.from(root.querySelectorAll<HTMLElement>('[data-reveal]'), (el) => {
          // from() сразу ставит начальное состояние; сам твин ждёт, пока элемент дойдёт до 80% высоты экрана
          const tween = gsap.from(el, {
            y: reduce ? 0 : 40,
            opacity: 0,
            duration: reduce ? 0.4 : 0.8,
            paused: true,
            // после показа убираем инлайновые стили, чтобы элемент вернулся к чистой вёрстке
            clearProps: 'opacity,transform',
          })
          return onceInView(el, () => tween.play())
        })
        return () => stops.forEach((stop) => stop())
      })
    },
    { scope },
  )
}
