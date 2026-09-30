import { useRef } from 'react'
import { marquee } from '@/data/content'
import { useAfterIntro } from '@/hooks/useAfterIntro'
import { gsap, media, ScrollTrigger, useGSAP } from '@/lib/gsap'

// Лента повторена несколько раз и за цикл сдвигается ровно на одну копию — шва не видно.
// Четыре копии, чтобы ленты хватало и на очень широких экранах.
const COPIES = 4

function Heart() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-6 shrink-0 fill-none stroke-current opacity-70"
      strokeWidth="1.6"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M12 20s-7.5-4.6-7.5-10A4.2 4.2 0 0 1 12 7.4 4.2 4.2 0 0 1 19.5 10c0 5.4-7.5 10-7.5 10z" />
    </svg>
  )
}

export function Marquee() {
  const root = useRef<HTMLDivElement>(null)
  const shown = useAfterIntro()

  // Лента ниже первого экрана и ничего не прячет — запускаем её после того, как первый экран показан
  useGSAP(
    () => {
      const el = root.current
      if (!el || !shown) return
      const mm = gsap.matchMedia()

      mm.add({ desktop: media.desktop, mobile: media.mobile, reduce: media.reduce }, (ctx) => {
        const { desktop, reduce } = ctx.conditions as { desktop: boolean; reduce: boolean }
        // При reduced motion лента стоит на месте
        if (reduce) return

        const loop = gsap.to('[data-marquee-track]', {
          xPercent: -100 / COPIES,
          ease: 'none',
          duration: desktop ? 28 : 36, // на мобайле медленнее
          repeat: -1,
          paused: true,
        })
        // Запас времени «назад»: при обратном направлении лента не упрётся в начало
        loop.totalTime(loop.duration() * 500)

        let direction = 1
        // Когда скролл остановился, лента возвращается к обычной скорости в последнем направлении
        const calm = gsap
          .delayedCall(0.25, () => gsap.to(loop, { timeScale: direction, duration: 0.8, overwrite: true }))
          .pause()

        ScrollTrigger.create({
          trigger: el,
          start: 'top bottom',
          end: 'bottom top',
          // вне экрана лента не крутится
          onToggle: (self) => loop.paused(!self.isActive),
          // скорость — от скорости скролла; при скролле вверх лента едет в обратную сторону
          onUpdate: (self) => {
            direction = self.direction
            const boost = gsap.utils.clamp(1, 5, 1 + Math.abs(self.getVelocity()) / 400)
            gsap.to(loop, { timeScale: direction * boost, duration: 0.25, ease: 'power1.out', overwrite: true })
            calm.restart(true)
          },
        })
      })
    },
    { scope: root, dependencies: [shown] },
  )

  return (
    <div ref={root} className="overflow-hidden bg-accent py-5 text-paper md:py-7">
      <div data-marquee-track className="flex w-max">
        {Array.from({ length: COPIES }, (_, copy) => (
          <ul key={copy} aria-hidden={copy > 0} className="flex shrink-0 items-center gap-8 pr-8 md:gap-12 md:pr-12">
            {marquee.map((phrase) => (
              <li
                key={phrase}
                className="display flex items-center gap-8 text-3xl whitespace-nowrap italic md:gap-12 md:text-[2.75rem]"
              >
                {phrase}
                <Heart />
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  )
}
