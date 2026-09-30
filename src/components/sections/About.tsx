import { useRef } from 'react'
import { Container } from '@/components/ui/Container'
import { Placeholder } from '@/components/ui/Placeholder'
import { SectionTitle } from '@/components/ui/SectionTitle'
import { aboutStats } from '@/data/content'
import { useAfterIntro } from '@/hooks/useAfterIntro'
import { useReveal } from '@/hooks/useReveal'
import { useLang } from '@/i18n/useLang'
import { gsap, media, padLineMasks, SplitText, useGSAP } from '@/lib/gsap'
import { onceInView } from '@/lib/inView'
import { introReady } from '@/lib/intro'

export function About() {
  const { lang, t } = useLang()
  const root = useRef<HTMLElement>(null)
  // Заголовок выезжает один раз: смена языка после этого его не перезапускает
  const titlePlayed = useRef(false)
  const shown = useAfterIntro()
  useReveal(root)
  const about = t.about

  // A. Заголовок: строки выезжают из-под маски
  useGSAP(
    () => {
      const el = root.current
      const title = el?.querySelector<HTMLElement>('h2')
      if (!el || !title || titlePlayed.current) return
      const mm = gsap.matchMedia()

      mm.add({ motion: media.motion, reduce: media.reduce }, (ctx) => {
        if (titlePlayed.current) return
        const { reduce } = ctx.conditions as { reduce: boolean }
        let cancelled = false

        gsap.set(title, { autoAlpha: 0 })

        // Режем на строки в момент показа (верх заголовка на 75% высоты экрана) и только с готовыми шрифтами —
        // так строки совпадают с тем, что на экране
        const stop = onceInView(
          title,
          () => {
            introReady().then(() => {
              if (cancelled) return
              titlePlayed.current = true

              ctx.add(() => {
                gsap.set(title, { autoAlpha: 1 })
                if (reduce) {
                  gsap.from(title, { opacity: 0, duration: 0.4, clearProps: 'all' })
                  return
                }
                const split = SplitText.create(title, { type: 'lines', mask: 'lines' })
                padLineMasks(split)
                gsap.from(split.lines, {
                  yPercent: 110,
                  duration: 0.9,
                  stagger: 0.1,
                  onComplete: () => {
                    split.revert()
                    gsap.set(title, { clearProps: 'all' })
                  },
                })
                return () => split.revert()
              })
            })
          },
          0.75,
        )

        return () => {
          cancelled = true
          stop()
        }
      })
    },
    { scope: root, dependencies: [lang], revertOnUpdate: true },
  )

  // C, D. Фото и счётчики — от языка не зависят
  useGSAP(
    () => {
      const el = root.current
      if (!el) return
      const mm = gsap.matchMedia()
      const frame = '[data-about-photo]'

      mm.add(media.motion, () => {
        // C. Большое фото раскрывается снизу вверх
        const reveal = gsap.fromTo(
          frame,
          { clipPath: 'inset(100% 0% 0% 0%)' },
          {
            clipPath: 'inset(0% 0% 0% 0%)',
            duration: 1.2,
            ease: 'expo.out',
            clearProps: 'clipPath',
            paused: true,
          },
        )

        // D. Счётчики: от 0 до N
        const count = gsap.from('[data-counter]', {
          textContent: 0,
          duration: 1.5,
          ease: 'power1.out',
          snap: { textContent: 1 },
          paused: true,
        })

        const stops = [
          onceInView(el.querySelector(frame), () => reveal.play()),
          onceInView(el.querySelector('[data-about-stats]'), () => count.play()),
        ]
        return () => stops.forEach((stop) => stop())
      })

      mm.add(media.reduce, () => {
        const fade = gsap.from(frame, { opacity: 0, duration: 0.4, clearProps: 'opacity', paused: true })
        return onceInView(el.querySelector(frame), () => fade.play())
      })
    },
    { scope: root },
  )

  // C. Только десктоп: картинка внутри рамки уменьшается по скроллу, малое фото едет быстрее страницы.
  // Один таймлайн и один ScrollTrigger на оба движения; настраивается после показа первого экрана
  useGSAP(
    () => {
      if (!shown) return
      const mm = gsap.matchMedia()
      mm.add(`${media.desktop} and ${media.motion}`, () => {
        gsap
          .timeline({
            defaults: { ease: 'none' },
            scrollTrigger: { trigger: '[data-about-visual]', start: 'top bottom', end: 'bottom top', scrub: true },
          })
          .fromTo('[data-about-media]', { scale: 1.3 }, { scale: 1 }, 0)
          .fromTo('[data-about-small]', { yPercent: 0 }, { yPercent: -20 }, 0)
      })
    },
    { scope: root, dependencies: [shown] },
  )

  return (
    <section ref={root} id="about" className="py-20 lg:py-28">
      <Container className="grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
        <div className="flex flex-col gap-7">
          {/* key по языку: при смене языка React ставит новый заголовок, а не правит текст внутри разбитого SplitText */}
          <SectionTitle key={lang} reveal={false}>
            {about.title}
          </SectionTitle>

          <div className="flex max-w-136 flex-col gap-4 text-[17px] leading-relaxed text-muted">
            {about.paragraphs.map((p, i) => (
              <p key={i} data-reveal>
                {p}
              </p>
            ))}
          </div>

          <dl data-reveal data-about-stats className="grid max-w-lg grid-cols-3 gap-x-6 pt-2">
            {aboutStats.map((value, i) => (
              <div key={i} className="flex flex-col-reverse justify-end gap-1">
                <dt className="text-sm leading-snug text-muted">{about.stats[i]}</dt>
                <dd data-counter className="display text-6xl text-accent tabular-nums">
                  {value}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <div data-about-visual className="relative pb-7 pl-[22%]">
          {/* Рамка раскрывается через clip-path, картинка внутри неё масштабируется */}
          <div data-about-photo className="aspect-420/480 w-full overflow-hidden rounded-[18px]">
            <Placeholder data-about-media label={about.photos[0]} className="size-full" />
          </div>
          {/* Внешний блок едет параллаксом, внутренний появляется базовой анимацией — чтобы они не спорили за transform */}
          <div data-about-small className="absolute bottom-0 left-0 aspect-210/250 w-[39%]">
            <Placeholder
              data-reveal
              label={about.photos[1]}
              tone="accent"
              className="size-full rounded-[14px] ring-8 ring-paper"
            />
          </div>
        </div>
      </Container>
    </section>
  )
}
