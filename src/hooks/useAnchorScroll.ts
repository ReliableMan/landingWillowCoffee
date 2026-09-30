import { scrollToAnchor } from '@/lib/anchorScroll'
import { useGSAP } from '@/lib/gsap'

/** Все ссылки вида href="#id" на странице (шапка, кнопки hero, «Наверх») скроллят плавно */
export function useAnchorScroll() {
  useGSAP((_, contextSafe) => {
    const onClick = contextSafe!((e: MouseEvent) => {
      // новая вкладка, средняя кнопка и т. п. — оставляем браузеру
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
      const link = (e.target as Element).closest<HTMLAnchorElement>('a[href^="#"]')
      const id = link?.getAttribute('href')?.slice(1)
      if (!id || !scrollToAnchor(id)) return

      e.preventDefault()
      // адрес обновляем сами: якорь в адресе остаётся, но браузер не прыгает к нему рывком
      const hash = id === 'top' ? '' : `#${id}`
      window.history.pushState(null, '', window.location.pathname + window.location.search + hash)
    })

    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  })
}
