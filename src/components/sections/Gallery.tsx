import { useRef, useState } from 'react'
import { Container } from '@/components/ui/Container'
import { Lightbox } from '@/components/ui/Lightbox'
import { Placeholder } from '@/components/ui/Placeholder'
import { SectionTitle } from '@/components/ui/SectionTitle'
import { brand, galleryColumns } from '@/data/content'
import { useAfterIntro } from '@/hooks/useAfterIntro'
import { useReveal } from '@/hooks/useReveal'
import { useLang } from '@/i18n/useLang'
import { gsap, media, useGSAP } from '@/lib/gsap'
import { batchInView } from '@/lib/inView'

// На мобайле две колонки: третья раскладывается в ряд под ними
const columnClasses = [
  'flex flex-col',
  'flex flex-col md:mt-12',
  'col-span-2 grid grid-cols-2 md:col-span-1 md:flex md:flex-col',
]

// A. Колонки едут с разной скоростью — эффект глубины
const COLUMN_SHIFT = [-10, 10, -15]

export function Gallery() {
  const { t } = useLang()
  const root = useRef<HTMLElement>(null)
  useReveal(root)
  const shown = useAfterIntro()
  const gallery = t.gallery
  // Открытое фото: его номер и элемент превью, из которого оно разворачивается
  const [opened, setOpened] = useState<{ index: number; thumb: HTMLElement } | null>(null)

  useGSAP(
    () => {
      const el = root.current
      if (!el) return
      const mm = gsap.matchMedia()
      const photos = gsap.utils.toArray<HTMLElement>('[data-gallery-photo]', el)

      // B. Фото раскрываются при входе в экран
      mm.add({ motion: media.motion, reduce: media.reduce }, (ctx) => {
        const { reduce } = ctx.conditions as { reduce: boolean }
        gsap.set(photos, reduce ? { opacity: 0 } : { clipPath: 'inset(100% 0% 0% 0%)' })

        // фото, вошедшие в экран одновременно, раскрываются по очереди
        return batchInView(
          photos,
          (batch) => {
            ctx.add(() => {
              gsap.to(
                batch,
                reduce
                  ? { opacity: 1, duration: 0.4, stagger: 0.1, clearProps: 'opacity' }
                  : {
                      clipPath: 'inset(0% 0% 0% 0%)',
                      duration: 1,
                      ease: 'expo.out',
                      stagger: 0.1,
                      clearProps: 'clipPath',
                    },
              )
            })
          },
          0.85,
        )
      })
    },
    { scope: root },
  )

  // A. Только десктоп: один таймлайн и один ScrollTrigger на все колонки; настраивается после показа первого экрана
  useGSAP(
    () => {
      const el = root.current
      if (!el || !shown) return
      const mm = gsap.matchMedia()
      mm.add(`${media.desktop} and ${media.motion}`, () => {
        const tl = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: { trigger: '[data-gallery-grid]', start: 'top bottom', end: 'bottom top', scrub: true },
        })
        gsap.utils.toArray<HTMLElement>('[data-gallery-col]', el).forEach((column, i) => {
          tl.fromTo(column, { yPercent: 0 }, { yPercent: COLUMN_SHIFT[i] }, 0)
        })
      })
    },
    { scope: root, dependencies: [shown] },
  )

  return (
    <section ref={root} id="gallery" className="py-20 lg:py-28">
      <Container className="flex flex-col gap-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionTitle>{gallery.title}</SectionTitle>
          <a
            data-reveal
            href={brand.instagram.url}
            target="_blank"
            rel="noreferrer"
            className="text-[15px] font-semibold underline underline-offset-4 hover:text-accent"
          >
            {brand.instagram.handle}
          </a>
        </div>

        <div data-gallery-grid className="grid grid-cols-2 items-start gap-4 md:grid-cols-3 md:gap-6">
          {galleryColumns.map((column, i) => (
            <div key={i} data-gallery-col className={`gap-4 md:gap-6 ${columnClasses[i]}`}>
              {column.map((height, j) => {
                const index = i * 2 + j
                return (
                  // C. Клик разворачивает фото на весь экран
                  <button
                    key={j}
                    type="button"
                    data-gallery-photo
                    data-flip-id={`gallery-${index}`}
                    onClick={(e) => setOpened({ index, thumb: e.currentTarget })}
                    className="block w-full cursor-zoom-in overflow-hidden rounded-[14px]"
                    style={{ height }}
                  >
                    <Placeholder label={gallery.photos[index]} className="size-full" />
                  </button>
                )
              })}
            </div>
          ))}
        </div>
      </Container>

      {opened && (
        <Lightbox
          thumb={opened.thumb}
          flipId={`gallery-${opened.index}`}
          label={gallery.photos[opened.index]}
          closeLabel={gallery.close}
          onClosed={() => setOpened(null)}
        >
          <Placeholder label={gallery.photos[opened.index]} className="size-full text-base" />
        </Lightbox>
      )}
    </section>
  )
}
