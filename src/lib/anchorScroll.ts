import { gsap, media } from '@/lib/gsap'

/** auto = страница сейчас едет к якорю сама; шапка в это время не прячется */
export const scrollState = { auto: false }

let release: gsap.core.Tween | undefined

// Флаг снимаем с небольшой задержкой: последнее обновление ScrollTrigger приходит уже после конца твина,
// и без неё шапка спряталась бы сразу по приезде
const done = () => {
  release = gsap.delayedCall(0.3, () => {
    scrollState.auto = false
  })
}

/** Плавный скролл к блоку по id (ScrollToPlugin, 1 с) с отступом на высоту шапки; id "top" — в начало страницы */
export function scrollToAnchor(id: string) {
  const target = id === 'top' ? null : document.getElementById(id)
  if (id !== 'top' && !target) return false

  const reduce = window.matchMedia(media.reduce).matches
  const headerHeight = document.querySelector('header')?.offsetHeight ?? 0

  // новый клик во время прежней поездки: отложенное снятие флага от неё больше не нужно
  release?.kill()
  scrollState.auto = true
  gsap.to(window, {
    duration: reduce ? 0 : 1,
    ease: 'power3.inOut',
    // autoKill: колесо или свайп гостя сразу перехватывают управление
    scrollTo: target ? { y: target, offsetY: headerHeight, autoKill: true } : { y: 0, autoKill: true },
    overwrite: true,
    onComplete: done,
    onInterrupt: done,
  })
  return true
}
