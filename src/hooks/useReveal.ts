import type { RefObject } from 'react'
import { gsap, media, useGSAP } from '@/lib/gsap'

/** Базовое появление: всё с атрибутом data-reveal внутри секции выезжает снизу с проявлением, один раз */
export function useReveal(scope: RefObject<HTMLElement | null>) {
  useGSAP(
    () => {
      const root = scope.current
      if (!root) return
      const mm = gsap.matchMedia()
      mm.add({ motion: media.motion, reduce: media.reduce }, (ctx) => {
        const { reduce } = ctx.conditions as { reduce: boolean }
        root.querySelectorAll<HTMLElement>('[data-reveal]').forEach((el) => {
          gsap.from(el, {
            y: reduce ? 0 : 40,
            opacity: 0,
            duration: reduce ? 0.4 : 0.8,
            // после показа убираем инлайновые стили, чтобы элемент вернулся к чистой вёрстке
            clearProps: 'opacity,transform',
            // clamp: элементы у самого низа страницы не дотягиваются до 80% экрана —
            // без него они остались бы невидимыми
            scrollTrigger: { trigger: el, start: 'clamp(top 80%)', once: true },
          })
        })
      })
    },
    { scope },
  )
}
