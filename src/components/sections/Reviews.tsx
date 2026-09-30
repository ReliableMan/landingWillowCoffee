import { useRef } from 'react'
import { Container } from '@/components/ui/Container'
import { SectionTitle } from '@/components/ui/SectionTitle'
import { reviewCount } from '@/data/content'
import { useAfterIntro } from '@/hooks/useAfterIntro'
import { useReveal } from '@/hooks/useReveal'
import { useLang } from '@/i18n/useLang'
import { gsap, media, useGSAP } from '@/lib/gsap'
import type { LoopTimeline } from '@/lib/horizontalLoop'
import { onceInView, watchInView } from '@/lib/inView'

// Лента повторена дважды: так её хватает на бесшовный цикл и на широких экранах
const COPIES = 2

export function Reviews() {
  const { t } = useLang()
  const root = useRef<HTMLElement>(null)
  const track = useRef<HTMLUListElement>(null)
  const loop = useRef<LoopTimeline | null>(null)
  // Пересчитывает, должна ли лента сейчас ехать сама (зависит от наведения, видимости и настроек)
  const sync = useRef(() => {})
  useReveal(root)
  const shown = useAfterIntro()
  const reviews = t.reviews

  // C. Появление блока: карточки по очереди
  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add({ motion: media.motion, reduce: media.reduce }, (ctx) => {
        const { reduce } = ctx.conditions as { reduce: boolean }
        const reveal = gsap.from('[data-review-inner]', {
          y: reduce ? 0 : 40,
          opacity: 0,
          duration: 0.8,
          stagger: 0.1,
          clearProps: 'opacity,transform',
          paused: true,
        })
        return onceInView(track.current, () => reveal.play())
      })
    },
    { scope: root },
  )

  // Карусель измеряет каждую карточку — настраиваем её после того, как первый экран показан
  const { contextSafe } = useGSAP(
    () => {
      const el = root.current
      const list = track.current
      if (!el || !list || !shown) return
      const title = el.querySelector('h2')!
      const items = gsap.utils.toArray<HTMLElement>('[data-review-card]', list)
      const mm = gsap.matchMedia()

      mm.add({ mouse: '(hover: hover) and (pointer: fine)', motion: media.motion, reduce: media.reduce }, (ctx) => {
        const { mouse, reduce } = ctx.conditions as { mouse: boolean; reduce: boolean }
        // Сама лента едет только там, где её можно остановить наведением; на телефоне — только свайп
        const autoplay = mouse && !reduce
        let hovered = false
        let inView = false
        let cancelled = false
        let cleanup = () => {}

        // Код карусели (вместе с Draggable) лежит в отдельном файле и подгружается только сейчас
        import('@/lib/horizontalLoop').then(({ horizontalLoop }) => {
          if (cancelled) return
          ctx.add(() => {
            // A. Бесконечная карусель; B. свайп и перетаскивание мышью (Draggable внутри хелпера)
            const tl = horizontalLoop(items, {
              repeat: -1,
              speed: 0.4,
              paused: true,
              draggable: true,
              paddingRight: parseFloat(getComputedStyle(list).columnGap) || 0,
              // карточки встают по левому краю заголовка, а не экрана
              offsetLeft: () => title.getBoundingClientRect().left,
              onSettle: () => sync.current(),
            })
            tl.toIndex(0, { duration: 0 })
            loop.current = tl

            sync.current = () => {
              if (autoplay && inView && !hovered) tl.play()
              else tl.pause()
            }

            // пауза при наведении
            const onEnter = () => {
              hovered = true
              sync.current()
            }
            const onLeave = () => {
              hovered = false
              sync.current()
            }
            list.addEventListener('mouseenter', onEnter)
            list.addEventListener('mouseleave', onLeave)

            // вне экрана лента не крутится
            const stopWatching = watchInView(list, (visible) => {
              inView = visible
              sync.current()
            })

            cleanup = () => {
              stopWatching()
              list.removeEventListener('mouseenter', onEnter)
              list.removeEventListener('mouseleave', onLeave)
              loop.current = null
              sync.current = () => {}
            }
          })
        })

        return () => {
          cancelled = true
          cleanup()
        }
      })
    },
    { scope: root, dependencies: [shown] },
  )

  // B. Стрелки листают на одну карточку
  const go = (direction: 1 | -1) => {
    const tl = loop.current
    if (!tl) return
    const reduce = window.matchMedia(media.reduce).matches
    const vars = { duration: reduce ? 0 : 0.6, ease: 'power3.inOut', onComplete: () => sync.current() }
    // contextSafe: твин, созданный по клику, попадает в контекст useGSAP и откатится вместе с ним
    contextSafe(() => {
      if (direction === 1) tl.next(vars)
      else tl.previous(vars)
    })()
    if (reduce) sync.current()
  }

  return (
    <section ref={root} id="reviews" className="overflow-hidden bg-paper-soft py-20 lg:py-28">
      <Container className="flex flex-wrap items-end justify-between gap-6">
        <SectionTitle>{reviews.title}</SectionTitle>
        <div data-reveal className="flex items-center gap-5">
          <p className="text-sm text-muted">{reviews.rating}</p>
          <div className="flex gap-2.5">
            {([-1, 1] as const).map((direction) => (
              <button
                key={direction}
                type="button"
                aria-label={direction === -1 ? reviews.prev : reviews.next}
                onClick={() => go(direction)}
                className="grid size-12 place-items-center rounded-full border-[1.5px] border-ink transition-colors duration-200 hover:bg-ink hover:text-paper"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  <path d={direction === -1 ? 'M15 6l-6 6 6 6' : 'M9 6l6 6-6 6'} />
                </svg>
              </button>
            ))}
          </div>
        </div>
      </Container>

      {/* Лента во всю ширину экрана и без отступов: карточки уходят за левый край и возвращаются справа */}
      <ul
        ref={track}
        data-reviews-track
        className="mt-10 flex cursor-grab gap-5 select-none active:cursor-grabbing md:gap-6"
      >
        {Array.from({ length: reviewCount * COPIES }, (_, i) => (
          // li двигает карусель, вложенный блок появляется своей анимацией — чтобы они не спорили за transform
          <li key={i} data-review-card aria-hidden={i >= reviewCount} className="w-[82vw] max-w-91 shrink-0">
            <div data-review-inner className="flex h-full min-h-56 flex-col gap-4 rounded-2xl bg-paper p-6">
              <p aria-label={reviews.stars} className="tracking-[3px] text-accent">
                ★★★★★
              </p>
              <p className="leading-relaxed">{reviews.text}</p>
              <p className="mt-auto flex items-center gap-3 text-sm">
                <span aria-hidden className="size-9 rounded-full bg-sage" />
                <span className="font-semibold">{reviews.author}</span>
                <span className="ml-auto text-muted">Google</span>
              </p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
