import { useRef } from 'react'
import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { anchors, brand, contacts, copyright } from '@/data/content'
import { useLang } from '@/i18n/useLang'
import { gsap, media, padLineMasks, ScrollTrigger, SplitText, useGSAP } from '@/lib/gsap'
import { introReady } from '@/lib/intro'

const links = [
  { label: 'Instagram', href: brand.instagram.url },
  { label: 'Google Maps', href: contacts.mapUrl },
]

export function Footer() {
  const { t } = useLang()
  const root = useRef<HTMLElement>(null)
  const played = useRef(false)

  // A. Название собирается из букв. Текст фирменный и от языка не зависит, поэтому хук без зависимости от lang
  useGSAP(
    () => {
      const wordmark = root.current?.querySelector<HTMLElement>('[data-footer-wordmark]')
      if (!wordmark) return
      const mm = gsap.matchMedia()

      mm.add({ motion: media.motion, reduce: media.reduce }, (ctx) => {
        if (played.current) return
        const { reduce } = ctx.conditions as { reduce: boolean }
        let cancelled = false

        gsap.set(wordmark, { autoAlpha: 0 })

        ScrollTrigger.create({
          trigger: wordmark,
          start: 'clamp(top 90%)',
          once: true,
          onEnter: () => {
            introReady().then(() => {
              if (cancelled) return
              played.current = true

              ctx.add(() => {
                gsap.set(wordmark, { autoAlpha: 1 })
                if (reduce) {
                  gsap.from(wordmark, { opacity: 0, duration: 0.4, clearProps: 'all' })
                  return
                }
                const split = SplitText.create(wordmark, { type: 'lines,chars', mask: 'lines' })
                padLineMasks(split)
                gsap.from(split.chars, {
                  yPercent: 100,
                  duration: 0.7,
                  stagger: 0.03,
                  onComplete: () => {
                    split.revert()
                    gsap.set(wordmark, { clearProps: 'all' })
                  },
                })
                return () => split.revert()
              })
            })
          },
        })

        return () => {
          cancelled = true
        }
      })
    },
    { scope: root },
  )

  return (
    <footer ref={root} className="bg-accent-deep pt-16 pb-10 text-paper lg:pt-20">
      <Container className="flex flex-col gap-12 lg:gap-16">
        <p
          data-footer-wordmark
          className="text-[clamp(2.5rem,11.5vw,9.25rem)] leading-[0.9] font-extrabold tracking-[-0.045em] whitespace-nowrap lowercase"
        >
          {brand.wordmark}
        </p>

        <div className="flex flex-col gap-6 border-t border-paper/20 pt-6 text-sm text-paper/80 md:flex-row md:items-center md:justify-between">
          <p>
            {copyright}, {contacts.address}
          </p>
          <p className="flex gap-7">
            {links.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noreferrer"
                className="text-paper underline underline-offset-4 hover:text-paper/70"
              >
                {link.label}
              </a>
            ))}
          </p>
          <Button href={anchors.top} variant="outline-light" size="sm" className="self-start md:self-auto">
            {t.footer.toTop} ↑
          </Button>
        </div>
      </Container>
    </footer>
  )
}
