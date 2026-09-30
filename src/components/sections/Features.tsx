import { useRef, type ReactNode } from 'react'
import { Container } from '@/components/ui/Container'
import { SectionTitle } from '@/components/ui/SectionTitle'
import { featureIcons } from '@/data/content'
import { useReveal } from '@/hooks/useReveal'
import { useLang } from '@/i18n/useLang'
import { gsap, media, ScrollTrigger, useGSAP } from '@/lib/gsap'

type IconName = (typeof featureIcons)[number]

// Линейные иконки: при появлении карточки прорисовываются через DrawSVG
const icons: Record<IconName, ReactNode> = {
  cup: (
    <>
      <path d="M5 9h11v5a5 5 0 0 1-5 5h-1a5 5 0 0 1-5-5V9z" />
      <path d="M16 10h1.5a2.5 2.5 0 0 1 0 5H16" />
      <path d="M8.5 3.5c0 1 1 1 1 2s-1 1-1 2M12.5 3.5c0 1 1 1 1 2s-1 1-1 2" />
    </>
  ),
  leaf: (
    <>
      <path d="M5 19c0-8 5-13 15-14 0 10-5 15-13 15-1 0-2-.4-2-1z" />
      <path d="M5 19c3-5 6-8 10-10" />
    </>
  ),
  plate: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="4.5" />
    </>
  ),
  sprout: (
    <>
      <path d="M12 21v-9" />
      <path d="M12 12c0-4-2.5-6.5-7-7 0 4.500 2.500 7 7 7z" />
      <path d="M12 15c0-3.500 2.500-5.500 7-6 0 3.500-2.500 6-7 6z" />
    </>
  ),
}

export function Features() {
  const { t } = useLang()
  const root = useRef<HTMLElement>(null)
  useReveal(root)
  const features = t.features

  // A. Карточки выезжают по очереди; B. иконки прорисовываются
  useGSAP(
    () => {
      const el = root.current
      if (!el) return
      const mm = gsap.matchMedia()

      mm.add({ motion: media.motion, reduce: media.reduce }, (ctx) => {
        const { reduce } = ctx.conditions as { reduce: boolean }
        const cards = gsap.utils.toArray<HTMLElement>('[data-feature-card]', el)
        const shapesOf = (card: HTMLElement) =>
          card.querySelectorAll('[data-feature-icon] path, [data-feature-icon] circle')

        gsap.set(cards, { opacity: 0, y: reduce ? 0 : 60 })
        if (!reduce) cards.forEach((card) => gsap.set(shapesOf(card), { drawSVG: '0%' }))

        // batch: карточки, вошедшие в экран одновременно, появляются по очереди
        ScrollTrigger.batch(cards, {
          start: 'clamp(top 85%)',
          once: true,
          onEnter: (batch) => {
            ctx.add(() => {
              gsap.to(batch, {
                opacity: 1,
                y: 0,
                duration: reduce ? 0.4 : 0.8,
                stagger: 0.12,
                clearProps: 'opacity,transform',
              })
              if (reduce) return
              batch.forEach((card, i) => {
                const shapes = shapesOf(card as HTMLElement)
                gsap.to(shapes, {
                  drawSVG: '100%',
                  duration: 1,
                  ease: 'power2.inOut',
                  delay: 0.2 + i * 0.12,
                  onComplete: () => gsap.set(shapes, { clearProps: 'all' }),
                })
              })
            })
          },
        })
      })
    },
    { scope: root },
  )

  return (
    <section ref={root} id="why" className="pb-20 lg:pb-28">
      <Container className="flex flex-col gap-10 lg:gap-14">
        <SectionTitle className="text-center">{features.title}</SectionTitle>

        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          {features.items.map((item, i) => (
            <li key={featureIcons[i]} data-feature-card>
              {/* Подъём по hover — на вложенном блоке: сам li двигает GSAP, и CSS-переход на нём мешал бы анимации */}
              <div className="flex h-full flex-col gap-3 rounded-2xl bg-paper-soft p-7 transition-transform duration-300 hover:-translate-y-1.5">
                <svg
                  data-feature-icon
                  viewBox="0 0 24 24"
                  className="mb-3 size-12 fill-none stroke-accent"
                  strokeWidth="1.3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  {icons[featureIcons[i]]}
                </svg>
                <h3 className="text-lg font-semibold">{item.title}</h3>
                <p className="text-[15px] leading-relaxed text-muted">{item.text}</p>
              </div>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  )
}
