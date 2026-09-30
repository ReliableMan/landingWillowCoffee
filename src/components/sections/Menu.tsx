import { useRef, useState, type KeyboardEvent } from 'react'
import { Container } from '@/components/ui/Container'
import { SectionTitle } from '@/components/ui/SectionTitle'
import { fullMenuUrl } from '@/data/content'
import { menu, menuLangFor, type MenuGroup, type MenuLang } from '@/data/menu'
import { useReveal } from '@/hooks/useReveal'
import { useLang } from '@/i18n/useLang'
import { Flip, gsap, media, refreshScroll, useGSAP } from '@/lib/gsap'
import { onceInView } from '@/lib/inView'

const prefersReducedMotion = () => window.matchMedia(media.reduce).matches

function Group({ group, menuLang }: { group: MenuGroup; menuLang: MenuLang }) {
  const onGreen = group.highlight

  return (
    <div className={onGreen ? 'rounded-2xl bg-accent px-5 py-7 text-paper md:px-9 md:py-9' : ''}>
      {group.title && (
        <h3 data-menu-row className="display mb-6 text-[2rem]">
          {group.title[menuLang]}
        </h3>
      )}

      <ul className="grid gap-x-16 gap-y-6 md:grid-cols-2">
        {group.items.map((item) => (
          <li key={item.name.en} data-menu-row className="flex flex-col gap-1">
            <div className="flex items-baseline gap-3">
              <span className="text-[17px] font-semibold">
                {item.name[menuLang]}
                {item.badge && (
                  <span className="ml-2 rounded-full bg-accent px-2 py-0.5 align-middle text-[11px] font-medium text-paper">
                    {item.badge}
                  </span>
                )}
              </span>
              <span
                aria-hidden
                className={`min-w-6 grow border-b-[1.5px] border-dotted ${onGreen ? 'border-paper/50' : 'border-ink/45'}`}
              />
              <span className="shrink-0 text-[15px] tabular-nums">{item.price}</span>
            </div>
            {item.desc && (
              <p className={`max-w-[85%] text-sm leading-relaxed ${onGreen ? 'text-paper/75' : 'text-muted'}`}>
                {item.desc[menuLang]}
              </p>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

export function Menu() {
  const { lang, t } = useLang()
  const root = useRef<HTMLElement>(null)
  const panel = useRef<HTMLDivElement>(null)
  useReveal(root)
  const menuLang = menuLangFor(lang)

  // Две «активные» вкладки: подсветка переезжает сразу по клику (activeId),
  // а позиции меняются после того, как старые погасли (shownId)
  const [activeId, setActiveId] = useState(menu.categories[0].id)
  const [shownId, setShownId] = useState(activeId)
  const shown = menu.categories.find((c) => c.id === shownId)!
  // Положение подсветки до клика — из него Flip анимирует переезд
  const flipState = useRef<Flip.FlipState | null>(null)
  const prevShownId = useRef(shownId)

  // Стрелки, Home и End переключают вкладки с клавиатуры
  const onTabKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const step = { ArrowRight: 1, ArrowLeft: -1 }[e.key]
    if (step === undefined && e.key !== 'Home' && e.key !== 'End') return
    e.preventDefault()
    const tabs = Array.from(e.currentTarget.querySelectorAll<HTMLButtonElement>('[role="tab"]'))
    const index = tabs.findIndex((tab) => tab.getAttribute('aria-selected') === 'true')
    const next = e.key === 'Home' ? 0 : e.key === 'End' ? tabs.length - 1 : (index + step! + tabs.length) % tabs.length
    tabs[next].focus()
    tabs[next].click()
  }

  // C. Первый показ блока: строки меню появляются по очереди сверху вниз
  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add({ motion: media.motion, reduce: media.reduce }, (ctx) => {
        const { reduce } = ctx.conditions as { reduce: boolean }
        const rows = gsap.from('[data-menu-row]', {
          y: reduce ? 0 : 16,
          opacity: 0,
          duration: 0.5,
          stagger: 0.05,
          clearProps: 'opacity,transform',
          paused: true,
        })
        return onceInView(panel.current, () => rows.play())
      })
    },
    { scope: root },
  )

  // A. Подсветка плавно переезжает на выбранную вкладку; старые позиции гаснут
  useGSAP(
    () => {
      const state = flipState.current
      if (!state) return
      flipState.current = null

      Flip.from(state, {
        targets: root.current!.querySelector('[data-menu-highlight]'),
        duration: prefersReducedMotion() ? 0 : 0.45,
        ease: 'power3.inOut',
      })

      if (activeId !== shownId) {
        gsap.to(panel.current, {
          opacity: 0,
          duration: 0.2,
          ease: 'power1.in',
          overwrite: true,
          onComplete: () => setShownId(activeId),
        })
      } else {
        // вернулись на вкладку, которая ещё не успела погаснуть
        gsap.to(panel.current, { opacity: 1, duration: 0.2, overwrite: true })
      }
    },
    { scope: root, dependencies: [activeId] },
  )

  // B. Новые позиции выезжают по очереди
  useGSAP(
    () => {
      if (prevShownId.current === shownId) return
      prevShownId.current = shownId
      // у вкладок разная высота — блоки ниже сдвигаются, точки старта анимаций нужно пересчитать
      refreshScroll()
      gsap.to(panel.current, { opacity: 1, duration: 0.25, overwrite: true, clearProps: 'opacity' })
      gsap.from('[data-menu-row]', {
        y: prefersReducedMotion() ? 0 : 16,
        opacity: 0,
        duration: 0.4,
        stagger: 0.04,
        clearProps: 'opacity,transform',
      })
    },
    { scope: root, dependencies: [shownId] },
  )

  return (
    <section ref={root} id="menu" className="py-20 lg:py-28">
      <Container className="flex flex-col gap-9">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionTitle>{t.menu.title}</SectionTitle>
          <a
            data-reveal
            href={fullMenuUrl}
            target="_blank"
            rel="noreferrer"
            className="text-[15px] font-semibold underline underline-offset-4 hover:text-accent"
          >
            {t.menu.fullMenu}
          </a>
        </div>

        <div
          data-reveal
          role="tablist"
          aria-label={t.menu.tabsLabel}
          onKeyDown={onTabKey}
          // isolate + свой фон: текст вкладок смешивается (mix-blend-difference) только с тем, что внутри списка
          className="no-scrollbar isolate -mx-5 flex gap-2.5 overflow-x-auto bg-paper px-5 py-0.5 md:mx-0 md:px-0"
        >
          {menu.categories.map((category) => {
            const selected = category.id === activeId
            return (
              <button
                key={category.id}
                type="button"
                role="tab"
                id={`menu-tab-${category.id}`}
                aria-selected={selected}
                aria-controls="menu-panel"
                // фокус с Tab попадает только на выбранную вкладку, между вкладками — стрелки
                tabIndex={selected ? 0 : -1}
                data-menu-tab
                onClick={(e) => {
                  if (selected) return
                  flipState.current = Flip.getState(root.current!.querySelector('[data-menu-highlight]'))
                  setActiveId(category.id)
                  // на мобайле вкладки листаются — выбранная не должна остаться за краем
                  e.currentTarget.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' })
                }}
                className={`relative shrink-0 rounded-full border-[1.5px] border-ink px-5 py-2.5 text-[15px] font-medium transition-colors duration-200 ${
                  selected ? '' : 'hover:bg-ink/10'
                }`}
              >
                {/* Подсветка — отдельный элемент внутри выбранной вкладки; Flip связывает старое и новое место по data-flip-id.
                    Отрицательный z-index кладёт её под текст всех вкладок, а не только своей */}
                {selected && (
                  <span
                    data-menu-highlight
                    data-flip-id="menu-highlight"
                    aria-hidden
                    className="absolute inset-[-1.5px] -z-10 rounded-full bg-ink"
                  />
                )}
                {/* Текст сам инвертируется там, где под ним проезжает подсветка: тёмный на кремовом, светлый на тёмном */}
                <span className="relative text-white mix-blend-difference">{category.label[lang]}</span>
              </button>
            )
          })}
        </div>

        <div
          ref={panel}
          id="menu-panel"
          role="tabpanel"
          tabIndex={0}
          aria-labelledby={`menu-tab-${shown.id}`}
          className="flex flex-col gap-10"
        >
          {shown.groups.map((group, i) => (
            <Group key={group.title?.en ?? i} group={group} menuLang={menuLang} />
          ))}
        </div>

        <p data-reveal className="text-sm text-muted">
          {t.menu.priceNote}
        </p>
      </Container>
    </section>
  )
}
