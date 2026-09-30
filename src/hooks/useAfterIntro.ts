import { useEffect, useState } from 'react'
import { introReady } from '@/lib/intro'

// Первый экран должен появиться как можно раньше, поэтому всё, что не влияет на него и ничего не прячет
// (параллаксы, бегущая строка), настраивается уже после того, как стартовая анимация началась и кадр отрисован.
const afterIntro = () =>
  new Promise<void>((resolve) => {
    introReady().then(() => requestAnimationFrame(() => setTimeout(resolve, 0)))
  })

let started: Promise<void> | undefined

/** false на первом кадре, true — когда первый экран уже показан. Использовать как зависимость useGSAP. */
export function useAfterIntro() {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let active = true
    ;(started ??= afterIntro()).then(() => active && setReady(true))
    return () => {
      active = false
    }
  }, [])

  return ready
}
