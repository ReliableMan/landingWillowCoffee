import { useRef } from 'react'
import { Container } from '@/components/ui/Container'
import { SectionTitle } from '@/components/ui/SectionTitle'
import { useReveal } from '@/hooks/useReveal'
import { useLang } from '@/i18n/useLang'
import { gsap, media, SplitText, useGSAP } from '@/lib/gsap'

// Тайминги цепочки «цифра → полоса → цифра», секунды (PLAN.md, «Блок 08»)
const STEP = 1.2 // от одной цифры до следующей
const SEG_DELAY = 0.4 // полоса стартует после цифры
const SEG_DURATION = 0.8 // и приходит ровно к следующей цифре
const TEXT_DELAY = 0.12

// В разметке все шаги «горят» — это конечное состояние: его видят без JS и при reduced motion.
// GSAP ставит начальные состояния и один раз проигрывает цепочку.
export function Process() {
  const { lang, t } = useLang()
  const root = useRef<HTMLElement>(null)
  // Цепочка играет один раз: смена языка или ширины экрана после старта её не перезапускает
  const played = useRef(false)
  useReveal(root)
  const process = t.process
  const steps = process.steps.map((title, i) => ({ n: i + 1, title }))

  useGSAP(
    () => {
      const el = root.current
      if (!el) return
      const mm = gsap.matchMedia()

      mm.add({ desktop: media.desktop, mobile: media.mobile, reduce: media.reduce }, (ctx) => {
        const { desktop, reduce } = ctx.conditions as { desktop: boolean; reduce: boolean }
        if (reduce || played.current) return

        const circles = el.querySelectorAll<HTMLElement>('[data-step-circle]')
        const fills = el.querySelectorAll<HTMLElement>('[data-step-fill]')
        const nums = el.querySelectorAll<HTMLElement>('[data-step-num]')
        const segs = el.querySelectorAll<HTMLElement>('[data-step-seg]')
        // words + chars: буквы остаются внутри слова, и оно не рвётся посередине при переносе
        const splits = Array.from(el.querySelectorAll<HTMLElement>('[data-step-title]')).map((title) =>
          SplitText.create(title, { type: 'words,chars' }),
        )
        const muted = getComputedStyle(el).getPropertyValue('--color-muted').trim()

        // На десктопе полоса растёт слева направо, на мобайле — сверху вниз
        gsap.set(segs, { transformOrigin: desktop ? 'left center' : 'center top' })
        splits.forEach((s) => gsap.set(s.chars, { transformPerspective: 500, transformOrigin: '50% 100%' }))

        const tl = gsap.timeline({
          scrollTrigger: { trigger: el, start: 'top 65%', once: true },
          onStart: () => {
            played.current = true
          },
          // После проигрыша возвращаем чистую разметку: обычный текст и никаких инлайновых стилей
          onComplete: () => {
            splits.forEach((s) => s.revert())
            gsap.set([circles, fills, nums, segs], { clearProps: 'all' })
          },
        })

        // from(): конечные значения берутся из разметки, начальные выставляются сразу
        steps.forEach((_, i) => {
          const at = i * STEP
          tl.from(fills[i], { opacity: 0, duration: 0.5, ease: 'power1.out' }, at)
            .from(nums[i], { color: muted, duration: 0.5 }, at)
            .from(circles[i], { scale: 0.9, duration: 0.5, ease: 'back.out(2)' }, at)
            .from(
              splits[i].chars,
              { rotationX: -100, opacity: 0, duration: 0.6, ease: 'back.out(1.7)', stagger: 0.03 },
              at + TEXT_DELAY,
            )
          if (segs[i]) {
            tl.from(
              segs[i],
              { [desktop ? 'scaleX' : 'scaleY']: 0, duration: SEG_DURATION, ease: 'power2.inOut' },
              at + SEG_DELAY,
            )
          }
        })

        return () => splits.forEach((s) => s.revert())
      })
    },
    { scope: root, dependencies: [lang], revertOnUpdate: true },
  )

  return (
    <section ref={root} id="process" className="bg-paper-soft py-20 lg:py-28">
      <Container>
        <SectionTitle>{process.title}</SectionTitle>

        <div className="relative mt-12 md:mt-16">
          {/* пунктирная дорожка: вертикальная на мобайле, горизонтальная с md */}
          <div
            aria-hidden
            className="absolute top-9 bottom-9 left-[35px] border-l-2 border-dashed border-ink/20 md:hidden"
          />
          <div
            aria-hidden
            className="absolute inset-x-[12.5%] top-[35px] hidden border-t-2 border-dashed border-ink/20 md:block"
          />

          {/* md:gap-0 важен: колонки ровно по 25%, и полоса шириной в колонку попадает от центра круга до центра следующего */}
          <ol className="grid gap-10 md:grid-cols-4 md:gap-0">
            {steps.map((s, i) => (
              <li key={s.n} className="relative flex items-center gap-5 md:flex-col md:gap-6">
                {/* Полоса к следующему шагу: на мобайле вниз (высота шага + зазор), на десктопе вправо */}
                {i < steps.length - 1 && (
                  <div
                    data-step-seg
                    aria-hidden
                    className="absolute top-9 left-[34px] h-[calc(100%+2.5rem)] w-1 rounded bg-accent md:top-[34px] md:left-1/2 md:h-1 md:w-full"
                  />
                )}
                <div
                  data-step-circle
                  className="relative grid size-[72px] shrink-0 place-items-center rounded-full border-2 border-ink/15 bg-paper-soft"
                >
                  <span
                    data-step-fill
                    aria-hidden
                    className="absolute -inset-0.5 rounded-full bg-accent shadow-[0_0_0_10px_rgb(1_90_46/0.14)]"
                  />
                  <span data-step-num className="relative text-2xl font-bold text-white">
                    {s.n}
                  </span>
                </div>
                {/* key по языку: при смене языка React ставит новый элемент, а не правит текст внутри разбитого SplitText */}
                <h3 key={lang} data-step-title className="text-2xl font-semibold">
                  {s.title}
                </h3>
              </li>
            ))}
          </ol>
        </div>
      </Container>
    </section>
  )
}
