import type { ReactNode } from 'react'

type Props = {
  children: ReactNode
  className?: string
  /** false — у заголовка своя анимация, базовое появление не нужно */
  reveal?: boolean
}

export function SectionTitle({ children, className = '', reveal = true }: Props) {
  return (
    <h2 data-reveal={reveal ? '' : undefined} className={`display text-[clamp(2.5rem,5vw,4rem)] ${className}`}>
      {children}
    </h2>
  )
}
