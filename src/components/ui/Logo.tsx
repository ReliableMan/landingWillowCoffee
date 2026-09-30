import { brand } from '@/data/content'

// Текстовая заглушка логотипа — заменим на SVG, когда будет файл
export function Logo({ className = '' }: { className?: string }) {
  return (
    <span
      aria-label={brand.name}
      className={`inline-block text-[22px] leading-[0.82] font-extrabold tracking-[-0.04em] lowercase ${className}`}
    >
      <span aria-hidden className="block">
        willow
      </span>
      <span aria-hidden className="block">
        we <span className="text-accent">love</span>
      </span>
    </span>
  )
}
