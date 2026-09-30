import { Fragment, useRef } from 'react'
import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { OpenStatus } from '@/components/ui/OpenStatus'
import { Placeholder } from '@/components/ui/Placeholder'
import { anchors, brand } from '@/data/content'
import { useAfterIntro } from '@/hooks/useAfterIntro'
import { useLang } from '@/i18n/useLang'
import { gsap, media, padLineMasks, SplitText, useGSAP } from '@/lib/gsap'
import { INTRO, introReady } from '@/lib/intro'

export function Hero() {
  const { lang, t } = useLang()
  const hero = t.hero
  const root = useRef<HTMLElement>(null)
  // Стартовый таймлайн играет один раз: смена языка или ширины экрана его не перезапускает
  const played = useRef(false)
  const shown = useAfterIntro()

  // Стартовый таймлайн, ≈ 1.8 с (карточка 02 вайрфрейма); шапка входит последней — см. Header
  useGSAP(
    () => {
      const el = root.current
      if (!el) return
      const mm = gsap.matchMedia()

      mm.add({ desktop: media.desktop, mobile: media.mobile, reduce: media.reduce }, (ctx) => {
        if (played.current) return
        const { desktop, reduce } = ctx.conditions as { desktop: boolean; reduce: boolean }
        let cancelled = false

        const q = gsap.utils.selector(el)
        const title = q('[data-hero-title]')[0] as HTMLElement
        const frame = q('[data-hero-photo]')
        const parts = [q('[data-hero-overline]'), title, q('[data-hero-item]'), frame, q('[data-hero-badge]')]

        // Прячем сразу, а играем, когда готовы шрифты: иначе SplitText разобьёт строки по запасному шрифту
        gsap.set(parts, { autoAlpha: 0 })

        introReady().then(() => {
          if (cancelled) return
          played.current = true

          ctx.add(() => {
            gsap.set(parts, { autoAlpha: 1 })

            if (reduce) {
              gsap.from(parts, { opacity: 0, duration: 0.4, stagger: 0.05, clearProps: 'all' })
              return
            }

            // Десктоп: буквы выезжают из-под маски строки; мобайл: строки целиком
            const split = SplitText.create(title, { type: desktop ? 'lines,words,chars' : 'lines', mask: 'lines' })
            padLineMasks(split)

            const tl = gsap.timeline({
              // После проигрыша возвращаем чистую разметку: обычный текст и никаких инлайновых стилей
              onComplete: () => {
                gsap.set(parts, { clearProps: 'all' })
                gsap.set(q('[data-hero-media]'), { clearProps: 'all' })
              },
            })

            tl.fromTo(
              frame,
              { clipPath: 'inset(100% 0% 0% 0%)' },
              { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.2, ease: 'expo.out' },
              INTRO.photo,
            )
              .from(q('[data-hero-media]'), { scale: 1.2, duration: 1.2, ease: 'expo.out' }, INTRO.photo)
              .from(q('[data-hero-overline]'), { y: 30, opacity: 0, duration: 0.6 }, INTRO.title)
              .from(
                desktop ? split.chars : split.lines,
                { yPercent: 110, duration: desktop ? 0.55 : 0.8, stagger: desktop ? 0.02 : 0.1 },
                INTRO.title,
              )
              // Заголовок возвращаем в обычный текст сразу, как он доехал, не дожидаясь конца таймлайна:
              // браузер считает «главный элемент страницы показан» (LCP) именно с этого момента
              .call(() => split.revert(), undefined, '>')
              .from(q('[data-hero-item]'), { y: 30, opacity: 0, duration: 0.4, stagger: 0.1 }, INTRO.body)
              .from(q('[data-hero-badge]'), { scale: 0, duration: 0.6, ease: 'back.out(1.7)' }, INTRO.badge)

            return () => split.revert()
          })
        })

        return () => {
          cancelled = true
        }
      })
    },
    { scope: root, dependencies: [lang], revertOnUpdate: true },
  )

  // Постоянные эффекты: вращение текста на бейдже и лёгкий параллакс при скролле.
  // Настраиваются после того, как первый экран показан, — чтобы не задерживать его появление
  useGSAP(
    () => {
      const el = root.current
      if (!el || !shown) return
      const mm = gsap.matchMedia()

      mm.add(media.motion, () => {
        gsap.to('[data-hero-ring]', { rotation: 360, duration: 12, ease: 'none', repeat: -1 })
      })

      // Только десктоп: фото уезжает медленнее страницы, текст — быстрее и гаснет
      mm.add(`${media.desktop} and ${media.motion}`, () => {
        gsap
          .timeline({ scrollTrigger: { trigger: el, start: 0, end: 'bottom top', scrub: 0.6 } })
          .fromTo('[data-hero-visual]', { yPercent: 0 }, { yPercent: 12, ease: 'none' }, 0)
          .fromTo('[data-hero-text]', { yPercent: 0, opacity: 1 }, { yPercent: -15, opacity: 0, ease: 'none' }, 0)
      })
    },
    { scope: root, dependencies: [shown] },
  )

  return (
    <section ref={root} id="hero" className="relative overflow-hidden lg:min-h-[calc(100svh-5rem)]">
      <Container className="grid items-center gap-12 py-10 lg:min-h-[calc(100svh-5rem)] lg:grid-cols-[minmax(0,1fr)_minmax(0,480px)] lg:py-16">
        <div data-hero-text className="flex flex-col gap-8">
          <p data-hero-overline className="text-[15px] text-muted">
            {hero.overline}
          </p>

          {/* Размер подобран так, чтобы самая длинная строка помещалась в колонку без переноса.
              key по языку: при смене языка React ставит новый элемент, а не правит текст внутри разбитого SplitText */}
          <h1
            key={lang}
            data-hero-title
            className="display text-[clamp(2.75rem,9vw,5.25rem)] lg:text-[clamp(3rem,5.6vw,5.25rem)]"
          >
            {hero.title.map((line, i) => (
              <Fragment key={i}>
                {line}
                {i < hero.title.length - 1 && (
                  <>
                    {' '}
                    <br />
                  </>
                )}
              </Fragment>
            ))}
          </h1>

          <div className="flex flex-col gap-7">
            <p data-hero-item className="max-w-120 text-lg leading-relaxed text-muted">
              {hero.subtitle}
            </p>
            <div data-hero-item className="flex flex-wrap gap-3.5">
              <Button href={anchors.menu}>{hero.primaryCta}</Button>
              <Button href={anchors.contacts} variant="outline">
                {hero.secondaryCta}
              </Button>
            </div>
            <div data-hero-item>
              <OpenStatus />
            </div>
          </div>
        </div>

        <div data-hero-visual className="relative mx-auto w-full max-w-105 lg:mr-0 lg:max-w-none lg:pl-16">
          {/* Рамка раскрывается через clip-path, картинка внутри неё уменьшается из scale 1.2 */}
          <div data-hero-photo className="aspect-460/640 w-full overflow-hidden rounded-t-[999px] rounded-b-[18px]">
            <Placeholder data-hero-media label={hero.photo} className="size-full" />
          </div>

          <div
            data-hero-badge
            aria-hidden
            className="absolute bottom-12 -left-2 grid size-32 place-items-center rounded-full border-[1.5px] border-ink bg-paper sm:-left-6 sm:size-41 lg:left-0"
          >
            {/* Вращается только текст по кругу, сердце в центре стоит */}
            <svg data-hero-ring viewBox="0 0 164 164" className="absolute inset-0 size-full">
              <defs>
                <path id="hero-badge-ring" d="M82,82 m-60,0 a60,60 0 1,1 120,0 a60,60 0 1,1 -120,0" />
              </defs>
              <text className="fill-ink text-[11.5px] font-semibold uppercase">
                <textPath href="#hero-badge-ring" textLength="372">
                  {brand.badge}
                </textPath>
              </text>
            </svg>
            <svg
              viewBox="0 0 24 24"
              className="size-8 fill-none stroke-accent"
              strokeWidth="1.6"
              strokeLinejoin="round"
            >
              <path d="M12 20s-7.5-4.6-7.5-10A4.2 4.2 0 0 1 12 7.4 4.2 4.2 0 0 1 19.5 10c0 5.4-7.5 10-7.5 10z" />
            </svg>
          </div>
        </div>
      </Container>
    </section>
  )
}
