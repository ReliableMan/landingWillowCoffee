import type { HTMLAttributes } from 'react'

type Props = HTMLAttributes<HTMLDivElement> & { label: string; tone?: 'sage' | 'accent' }

const tones = {
  sage: 'bg-sage text-accent-deep/70',
  accent: 'bg-accent text-paper/80',
}

// Заглушка фото: подпись говорит, какой кадр сюда встанет
export function Placeholder({ label, tone = 'sage', className = '', ...rest }: Props) {
  return (
    <div
      role="img"
      aria-label={label}
      className={`flex items-center justify-center overflow-hidden p-4 text-center text-sm ${tones[tone]} ${className}`}
      {...rest}
    >
      {label}
    </div>
  )
}
