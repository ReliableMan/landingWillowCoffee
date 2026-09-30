import type { ReactNode } from 'react'

type Props = { children: ReactNode; className?: string }

export function Container({ children, className = '' }: Props) {
  return <div className={`mx-auto w-full max-w-[1280px] px-5 md:px-10 xl:px-20 ${className}`}>{children}</div>
}
