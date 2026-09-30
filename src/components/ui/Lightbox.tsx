import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { Flip, gsap, media, useGSAP } from '@/lib/gsap'
import { lockScroll } from '@/lib/scrollLock'

type Props = {
  /** Превью, из которого «вылетает» фото; у него и у большого фото общий data-flip-id */
  thumb: HTMLElement
  flipId: string
  label: string
  closeLabel: string
  /** Вызывается, когда анимация закрытия закончилась — родитель убирает лайтбокс */
  onClosed: () => void
  children: ReactNode
}

const prefersReducedMotion = () => window.matchMedia(media.reduce).matches

// Фото плавно разворачивается из превью на весь экран и так же сворачивается обратно (Flip).
// Рендерится в body: у колонок галереи есть transform, и fixed-слой внутри них считался бы от колонки.
export function Lightbox({ thumb, flipId, label, closeLabel, onClosed, children }: Props) {
  const backdrop = useRef<HTMLDivElement>(null)
  const box = useRef<HTMLDivElement>(null)
  const closeButton = useRef<HTMLButtonElement>(null)
  const closing = useRef(false)
  // Те же пропорции, что у превью: тогда Flip масштабирует равномерно и картинка не искажается в полёте
  const [ratio] = useState(() => {
    const rect = thumb.getBoundingClientRect()
    return rect.width / rect.height
  })

  const { contextSafe } = useGSAP(() => {
    const state = Flip.getState(thumb)
    // превью прячем на время показа — будто оно само улетело на весь экран
    gsap.set(thumb, { visibility: 'hidden' })
    gsap.from(backdrop.current, { opacity: 0, duration: 0.3, ease: 'power1.out' })
    gsap.from(closeButton.current, { opacity: 0, duration: 0.3, delay: 0.3 })

    if (prefersReducedMotion()) gsap.from(box.current, { opacity: 0, duration: 0.3 })
    else Flip.from(state, { targets: box.current, duration: 0.6, ease: 'power3.inOut', scale: true })
  })

  const close = () => {
    if (closing.current) return
    closing.current = true
    // contextSafe: анимации закрытия попадают в контекст useGSAP и откатятся вместе с ним
    contextSafe(() => {
      gsap.to([backdrop.current, closeButton.current], { opacity: 0, duration: 0.3, overwrite: true })

      if (prefersReducedMotion()) {
        gsap.to(box.current, { opacity: 0, duration: 0.2, onComplete: onClosed })
      } else {
        Flip.killFlipsOf(box.current)
        Flip.fit(box.current, thumb, { duration: 0.5, ease: 'power3.inOut', scale: true, onComplete: onClosed })
      }
    })()
  }
  // обработчик клавиш вешается один раз, а close создаётся заново на каждом рендере
  const closeRef = useRef(close)
  useEffect(() => {
    closeRef.current = close
  })

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeRef.current()
      // внутри один фокусируемый элемент — Tab не должен уводить фокус на страницу под лайтбоксом
      if (e.key === 'Tab') e.preventDefault()
    }
    const unlock = lockScroll()
    closeButton.current?.focus({ preventScroll: true })
    window.addEventListener('keydown', onKey)
    return () => {
      unlock()
      window.removeEventListener('keydown', onKey)
      thumb.focus({ preventScroll: true })
    }
  }, [thumb])

  return createPortal(
    <div role="dialog" aria-modal aria-label={label} className="fixed inset-0 z-60 grid place-items-center p-5">
      <div ref={backdrop} onClick={close} className="absolute inset-0 bg-accent-deep/90" />
      <div
        ref={box}
        data-flip-id={flipId}
        onClick={close}
        // Ширина задана классом через переменную, а не инлайном: Flip читает ширину из style,
        // и значение вида min(...) он разобрать не может — тогда масштаб по горизонтали не считается
        className="relative w-[min(90vw,calc(85vh*var(--ratio)))] cursor-zoom-out overflow-hidden rounded-[14px]"
        style={{ '--ratio': ratio, aspectRatio: String(ratio) } as CSSProperties}
      >
        {children}
      </div>
      <button
        ref={closeButton}
        type="button"
        aria-label={closeLabel}
        onClick={close}
        className="absolute top-4 right-4 grid size-12 place-items-center rounded-full border-[1.5px] border-paper text-paper transition-colors duration-200 hover:bg-paper hover:text-accent-deep"
      >
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          aria-hidden
        >
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      </button>
    </div>,
    document.body,
  )
}
