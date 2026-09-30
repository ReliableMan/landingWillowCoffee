import { useRef } from 'react'
import { useOpenStatus } from '@/hooks/useOpenStatus'
import { fill } from '@/i18n/config'
import { useLang } from '@/i18n/useLang'
import { gsap, media, useGSAP } from '@/lib/gsap'

export function OpenStatus({ className = '' }: { className?: string }) {
  const { t } = useLang()
  const { isOpen, kind, time } = useOpenStatus()
  const dot = useRef<HTMLSpanElement>(null)

  // Пока кофейня открыта, точка мягко пульсирует
  useGSAP(
    () => {
      if (!isOpen) return
      const mm = gsap.matchMedia()
      mm.add(media.motion, () => {
        gsap.to(dot.current, { scale: 0.55, opacity: 0.5, duration: 0.9, ease: 'sine.inOut', yoyo: true, repeat: -1 })
      })
    },
    { dependencies: [isOpen], revertOnUpdate: true },
  )

  return (
    <p className={`flex items-center gap-2.5 text-sm ${className}`}>
      <span
        ref={dot}
        data-status-dot
        aria-hidden
        className={`size-2.5 rounded-full ${isOpen ? 'bg-accent' : 'bg-muted/50'}`}
      />
      {fill(t.status[kind], { time })}
    </p>
  )
}
