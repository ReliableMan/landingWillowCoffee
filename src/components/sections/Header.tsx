import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { LangSwitcher } from '@/components/ui/LangSwitcher'
import { Logo } from '@/components/ui/Logo'
import { anchors } from '@/data/content'
import { useLang } from '@/i18n/useLang'
import { scrollState } from '@/lib/anchorScroll'
import { gsap, media, useGSAP } from '@/lib/gsap'
import { INTRO, introReady } from '@/lib/intro'
import { lockScroll } from '@/lib/scrollLock'

const navKeys = ['about', 'menu', 'signature', 'gallery', 'contacts'] as const
/** Шапка начинает прятаться, когда страница прокручена дальше этой отметки (примерно две высоты шапки), px */
const HIDE_AFTER = 160

export function Header() {
  const { t } = useLang()
  const [open, setOpen] = useState(false)
  const header = useRef<HTMLElement>(null)
  const overlay = useRef<HTMLDivElement>(null)
  // Свежее значение open для обработчика скролла, который создаётся один раз
  const openRef = useRef(open)
  // Вход шапки играет один раз, даже если условия matchMedia поменяются
  const entered = useRef(false)

  useEffect(() => {
    openRef.current = open
    if (!open) return
    const unlock = lockScroll()
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => {
      unlock()
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  // Вход в конце стартового таймлайна hero, затем smart-sticky: вниз — прячется, вверх — возвращается
  useGSAP(() => {
    const el = header.current
    if (!el) return
    const mm = gsap.matchMedia()

    mm.add({ motion: media.motion, reduce: media.reduce }, (ctx) => {
      const { reduce } = ctx.conditions as { reduce: boolean }
      let cancelled = false
      // smart-sticky включается после входа шапки; при reduced motion шапка просто остаётся на месте
      let sticky = false
      let hidden = false
      const setHidden = (next: boolean) => {
        if (next === hidden) return
        hidden = next
        ctx.add(() => {
          gsap.to(el, { yPercent: next ? -100 : 0, duration: 0.3, ease: 'power2.out', overwrite: true })
        })
      }

      // Обычный слушатель скролла вместо ScrollTrigger: здесь нужны только положение и направление,
      // а каждый лишний ScrollTrigger удорожает пересчёт всей страницы
      let lastY = 0
      let frame = 0
      const update = () => {
        frame = 0
        const y = window.scrollY
        // линия под шапкой появляется, как только страница сдвинулась с самого верха
        el.toggleAttribute('data-scrolled', y > 8)
        if (sticky && !openRef.current) {
          // во время плавного скролла к якорю и при движении вверх шапка видна
          if (scrollState.auto || y < lastY) setHidden(false)
          else if (y > lastY && y > HIDE_AFTER) setHidden(true)
        }
        lastY = y
      }
      const onScroll = () => {
        frame ||= requestAnimationFrame(update)
      }
      window.addEventListener('scroll', onScroll, { passive: true })
      onScroll()

      // Спрятанная шапка возвращается, когда в неё попадает фокус с клавиатуры
      const onFocus = () => setHidden(false)
      el.addEventListener('focusin', onFocus)

      const enableSticky = () => {
        sticky = !reduce
      }

      if (entered.current) {
        enableSticky()
      } else {
        // Начальное состояние ставим сразу, саму анимацию — когда готовы шрифты (вместе с hero)
        gsap.set(el, reduce ? { autoAlpha: 0 } : { yPercent: -100 })
        introReady().then(() => {
          if (cancelled) return
          entered.current = true
          ctx.add(() => {
            gsap.to(el, {
              ...(reduce ? { autoAlpha: 1, duration: 0.4 } : { yPercent: 0, duration: 0.6 }),
              delay: INTRO.header,
              onComplete: enableSticky,
            })
          })
        })
      }

      return () => {
        cancelled = true
        cancelAnimationFrame(frame)
        window.removeEventListener('scroll', onScroll)
        el.removeEventListener('focusin', onFocus)
        el.removeAttribute('data-scrolled')
      }
    })
  })

  // Мобильное меню: пункты выезжают по очереди
  useGSAP(
    () => {
      const el = overlay.current
      if (!open || !el) return
      const mm = gsap.matchMedia()
      mm.add({ motion: media.motion, reduce: media.reduce }, (ctx) => {
        const { reduce } = ctx.conditions as { reduce: boolean }
        gsap.from(el, { opacity: 0, duration: 0.25, ease: 'power1.out' })
        gsap.from(el.querySelectorAll('[data-menu-link], [data-menu-cta]'), {
          y: reduce ? 0 : 30,
          opacity: 0,
          duration: 0.5,
          stagger: 0.06,
          delay: 0.05,
        })
      })
    },
    // revertOnUpdate: при закрытии меню анимации и matchMedia снимаются, а не остаются висеть на удалённых элементах
    { dependencies: [open], revertOnUpdate: true },
  )

  return (
    <>
      <header
        ref={header}
        id="top"
        className="sticky top-0 z-50 border-b border-transparent bg-paper transition-colors duration-300 data-scrolled:border-line"
      >
        <Container className="flex h-16 items-center justify-between gap-4 lg:h-20">
          <a href={anchors.top} onClick={() => setOpen(false)}>
            <Logo />
          </a>

          <nav aria-label={t.header.navLabel} className="hidden gap-7 text-[15px] font-medium lg:flex xl:gap-9">
            {navKeys.map((key) => (
              <a key={key} href={anchors[key]} className="transition-colors hover:text-accent">
                {t.nav[key]}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2 lg:gap-4">
            <LangSwitcher />

            <div className="hidden lg:block">
              <Button href={anchors.contacts} variant="outline" size="sm">
                {t.hero.secondaryCta}
              </Button>
            </div>

            <button
              type="button"
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? t.header.closeMenu : t.header.openMenu}
              onClick={() => setOpen((v) => !v)}
              className="-mr-2 grid size-11 place-items-center lg:hidden"
            >
              <svg
                width="26"
                height="26"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                aria-hidden
              >
                {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 8h16M4 16h16" />}
              </svg>
            </button>
          </div>
        </Container>
      </header>

      {/* Меню лежит рядом с шапкой, а не внутри: у шапки есть transform, и fixed-потомок считался бы от неё, а не от экрана */}
      {open && (
        <div
          ref={overlay}
          id="mobile-menu"
          className="fixed inset-x-0 top-16 bottom-0 z-40 overflow-y-auto bg-paper lg:hidden"
        >
          <Container className="flex min-h-full flex-col justify-between gap-10 pt-8 pb-10">
            <nav aria-label={t.header.navLabel} className="flex flex-col gap-5">
              {navKeys.map((key) => (
                <a
                  key={key}
                  href={anchors[key]}
                  data-menu-link
                  onClick={() => setOpen(false)}
                  className="display text-5xl"
                >
                  {t.nav[key]}
                </a>
              ))}
            </nav>
            <Button data-menu-cta href={anchors.contacts} onClick={() => setOpen(false)}>
              {t.hero.secondaryCta}
            </Button>
          </Container>
        </div>
      )}
    </>
  )
}
