import { useRef } from 'react'
import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { OpenStatus } from '@/components/ui/OpenStatus'
import { SectionTitle } from '@/components/ui/SectionTitle'
import { brand, contacts } from '@/data/content'
import { useReveal } from '@/hooks/useReveal'
import { useLang } from '@/i18n/useLang'
import { gsap, media, useGSAP } from '@/lib/gsap'

const rowClass = 'grid grid-cols-[6.5rem_1fr] gap-4'
const termClass = 'pt-0.5 text-sm text-muted'
const linkClass = 'underline underline-offset-4 hover:text-accent'

export function Contacts() {
  const { lang, t } = useLang()
  const root = useRef<HTMLElement>(null)
  useReveal(root)
  const labels = t.contacts

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      const map = '[data-contact-map]'

      mm.add({ motion: media.motion, reduce: media.reduce }, (ctx) => {
        const { reduce } = ctx.conditions as { reduce: boolean }

        // B. Строки контактов появляются по очереди
        gsap.from('[data-contact-row]', {
          y: reduce ? 0 : 20,
          opacity: 0,
          duration: 0.6,
          stagger: 0.08,
          clearProps: 'opacity,transform',
          scrollTrigger: { trigger: '[data-contact-rows]', start: 'clamp(top 80%)', once: true },
        })

        // A. Карта раскрывается кругом из центра. 75% — радиус, при котором круг уже закрывает углы блока
        if (reduce) {
          gsap.from(map, {
            opacity: 0,
            duration: 0.4,
            clearProps: 'opacity',
            scrollTrigger: { trigger: map, start: 'clamp(top 80%)', once: true },
          })
        } else {
          gsap.fromTo(
            map,
            { clipPath: 'circle(0% at 50% 50%)' },
            {
              clipPath: 'circle(75% at 50% 50%)',
              duration: 1.2,
              ease: 'power2.inOut',
              clearProps: 'clipPath',
              scrollTrigger: { trigger: map, start: 'clamp(top 80%)', once: true },
            },
          )
        }
      })
    },
    { scope: root },
  )

  return (
    <section ref={root} id="contacts" className="py-20 lg:py-28">
      <Container className="grid items-center gap-12 lg:grid-cols-[minmax(0,440px)_minmax(0,1fr)] lg:gap-16">
        <div className="flex flex-col items-start gap-7">
          <SectionTitle>{labels.title}</SectionTitle>

          <dl data-contact-rows className="flex flex-col gap-4 text-[15px]">
            <div data-contact-row className={rowClass}>
              <dt className={termClass}>{labels.address}</dt>
              <dd>
                <a href={contacts.mapUrl} target="_blank" rel="noreferrer" className={linkClass}>
                  {contacts.address}
                </a>
              </dd>
            </div>
            <div data-contact-row className={rowClass}>
              <dt className={termClass}>{labels.hours}</dt>
              <dd className="flex flex-col gap-1 tabular-nums">
                {contacts.hours.map((h) => (
                  <span key={h.id}>
                    {labels.days[h.id]}, {h.open}–{h.close}
                  </span>
                ))}
              </dd>
            </div>
            <div data-contact-row className={rowClass}>
              <dt className={termClass}>{labels.phone}</dt>
              <dd>
                <a href={contacts.phone.href} className={`tabular-nums ${linkClass}`}>
                  {contacts.phone.label}
                </a>
              </dd>
            </div>
            <div data-contact-row className={rowClass}>
              <dt className={termClass}>{labels.social}</dt>
              <dd>
                <a href={brand.instagram.url} target="_blank" rel="noreferrer" className={linkClass}>
                  Instagram {brand.instagram.handle}
                </a>
              </dd>
            </div>
          </dl>

          <div data-reveal>
            <OpenStatus className="rounded-full bg-sage/50 px-3.5 py-2" />
          </div>

          <Button data-reveal href={contacts.routeUrl} target="_blank" rel="noreferrer">
            {labels.route}
          </Button>
        </div>

        {/* Живая карта Google: её можно двигать и приближать; точку кофейни отмечает маркер самой карты */}
        <div data-contact-map className="h-80 overflow-hidden rounded-[20px] bg-sage lg:h-124">
          <iframe
            src={contacts.mapEmbedUrl(lang)}
            title={labels.mapTitle}
            loading="lazy"
            allowFullScreen
            className="size-full border-0"
          />
        </div>
      </Container>
    </section>
  )
}
