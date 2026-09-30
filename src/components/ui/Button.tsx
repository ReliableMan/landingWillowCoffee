import type { AnchorHTMLAttributes, ReactNode } from 'react'

type Variant = 'solid' | 'outline' | 'outline-light'

type Props = AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string
  variant?: Variant
  size?: 'md' | 'sm'
  children: ReactNode
}

const variants: Record<Variant, string> = {
  solid: 'border-accent bg-accent text-paper hover:border-accent-deep hover:bg-accent-deep',
  outline: 'border-ink text-ink hover:bg-ink hover:text-paper',
  'outline-light': 'border-paper text-paper hover:bg-paper hover:text-accent-deep',
}

const sizes = {
  md: 'px-6 py-3.5 text-[15px]',
  sm: 'px-5 py-2.5 text-sm',
}

// Все кнопки на странице ведут к якорям или внешним ссылкам, поэтому это <a>
export function Button({ href, variant = 'solid', size = 'md', className = '', children, ...rest }: Props) {
  return (
    <a
      href={href}
      className={`inline-flex items-center justify-center rounded-full border-[1.5px] font-semibold whitespace-nowrap transition-colors duration-200 ${variants[variant]} ${sizes[size]} ${className}`}
      {...rest}
    >
      {children}
    </a>
  )
}
