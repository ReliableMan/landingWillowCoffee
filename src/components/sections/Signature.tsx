import { useRef, useState } from 'react'
import { Container } from '@/components/ui/Container'
import { Placeholder } from '@/components/ui/Placeholder'
import { SectionTitle } from '@/components/ui/SectionTitle'
import { menuLangFor, signatureDrinks } from '@/data/menu'
import { useReveal } from '@/hooks/useReveal'
import { useLang } from '@/i18n/useLang'
import { gsap, media, useGSAP } from '@/lib/gsap'

const pad = (n: number) => String(n).padStart(2, '0')
const total = signatureDrinks.length
const indexAt = (progress: number) => Math.round(progress * (total - 1)) + 1

export function Signature() {
  const { lang, t } = useLang()
  const root = useRef<HTMLElement>(null)
  const viewport = useRef<HTMLDivElement>(null)
  const bar = useRef<HTMLDivElement>(null)
  useReveal(root)
  const signature = t.signature
  const menuLang = menuLangFor(lang)
  const [current, setCurrent] = useState(1)

  // Режим свайпа: счётчик и прогресс-бар идут от горизонтальной прокрутки ленты
  const onScroll = () => {
    const el = viewport.current
    if (!el || !bar.current) return
    const max = el.scrollWidth - el.clientWidth
    const progress = max > 0 ? el.scrollLeft / max : 0
    bar.current.style.transform = `scaleX(${Math.max(progress, 1 / total)})`
    setCurrent(indexAt(progress))
  }

  // A–D. Секция закрепляется, скролл вниз двигает ленту вбок
  useGSAP(
    () => {
      const el = root.current
      if (!el) return
      const mm = gsap.matchMedia()

      // Закрепление включается только там, где для него хватает места (media.pin): широкий и не слишком низкий экран.
      // На телефонах, в альбомной ориентации и при reduced motion лента листается обычным свайпом.
      mm.add(media.pin, () => {
        const track = el.querySelector<HTMLElement>('[data-signature-track]')!
        // лента целиком помещается на экране — двигать нечего, закрепление не нужно
        if (track.scrollWidth <= el.clientWidth) return

        // Атрибут переключает вёрстку: блок на всю высоту экрана, лента без собственной прокрутки
        el.setAttribute('data-pinned', '')
        if (viewport.current) viewport.current.scrollLeft = 0

        const tl = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: {
            trigger: '[data-signature-pin]',
            pin: true,
            start: 'top top',
            // A. длина закрепления = ширина ленты
            end: () => '+=' + track.scrollWidth,
            scrub: 1,
            invalidateOnRefresh: true,
            anticipatePin: 1,
            // закрепление добавляет странице высоту — пересчитываем его раньше всех остальных триггеров
            refreshPriority: 1,
            // после пересчёта (ресайз, смена языка) счётчик должен совпадать с положением ленты
            onRefresh: (self) => setCurrent(indexAt(self.progress)),
          },
          // C. счётчик — от того же таймлайна
          onUpdate: () => setCurrent(indexAt(tl.progress())),
        })

        // B. лента едет вбок; C. прогресс-бар
        tl.to(track, { x: () => -(track.scrollWidth - el.clientWidth) }, 0).fromTo(
          bar.current,
          { scaleX: 1 / total },
          { scaleX: 1 },
          0,
        )

        // D. Фото внутри карточек слегка отстают, пока лента едет. Сдвиг идёт в том же таймлайне:
        // отдельный ScrollTrigger на каждое фото стоил бы шести лишних пересчётов
        tl.fromTo('[data-signature-media]', { xPercent: -8 }, { xPercent: 8 }, 0)

        return () => {
          el.removeAttribute('data-pinned')
          setCurrent(1)
        }
      })
    },
    { scope: root },
  )

  return (
    <section ref={root} id="signature" className="group/sig overflow-hidden bg-accent text-paper">
      {/* Закрепляется этот блок, а не сама секция: зелёный фон секции остаётся под ним на всё время закрепления */}
      <div
        data-signature-pin
        className="py-16 group-data-pinned/sig:flex group-data-pinned/sig:min-h-svh group-data-pinned/sig:flex-col group-data-pinned/sig:justify-center lg:py-24 group-data-pinned/sig:lg:py-16"
      >
        <Container className="flex items-end justify-between gap-6">
          <SectionTitle>
            {signature.title[0]} <em>{signature.title[1]}</em>
          </SectionTitle>
          <p data-signature-counter className="shrink-0 pb-1 text-xl font-medium whitespace-nowrap tabular-nums">
            {pad(current)} / {pad(total)}
          </p>
        </Container>

        <div
          ref={viewport}
          onScroll={onScroll}
          data-signature-viewport
          className="no-scrollbar mt-9 snap-x snap-mandatory overflow-x-auto group-data-pinned/sig:snap-none group-data-pinned/sig:overflow-visible"
        >
          <ul
            data-signature-track
            className="flex w-max gap-5 px-5 md:gap-6 md:px-10 xl:px-[max(5rem,calc((100%-1280px)/2+5rem))]"
          >
            {signatureDrinks.map((drink) => (
              <li
                key={drink.name.en}
                data-signature-card
                className="flex w-[78vw] max-w-85 shrink-0 snap-center flex-col gap-4 rounded-2xl bg-paper p-3 pb-5 text-ink"
              >
                {/* Фото шире рамки на 20%: запас для сдвига внутри неё */}
                <div className="h-56 overflow-hidden rounded-[10px]">
                  <Placeholder
                    data-signature-media
                    label={signature.photo}
                    className="-ml-[10%] h-full w-[120%] max-w-none"
                  />
                </div>
                <div className="flex items-start justify-between gap-3 px-2">
                  <h3 className="text-lg leading-snug font-semibold">{drink.name[menuLang]}</h3>
                  <span className="shrink-0 rounded-full border border-ink/30 px-2.5 py-1 text-[13px] tabular-nums">
                    {drink.price}
                  </span>
                </div>
                {drink.desc && <p className="px-2 text-sm leading-relaxed text-muted">{drink.desc[menuLang]}</p>}
              </li>
            ))}
          </ul>
        </div>

        <Container className="mt-9">
          <div className="h-1 overflow-hidden rounded-full bg-paper/25">
            {/* Начальная ширина — доля первой карточки; дальше её двигает скролл (свайп или закреплённая лента) */}
            <div
              ref={bar}
              data-signature-progress
              className="h-full origin-left rounded-full bg-paper"
              style={{ transform: `scaleX(${1 / total})` }}
            />
          </div>
        </Container>
      </div>
    </section>
  )
}
