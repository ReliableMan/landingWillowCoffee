import { media, ScrollTrigger } from '@/lib/gsap'

// Когда окно переходит через порог, на котором включается или выключается закрепление «Хитов»,
// пересчёт ScrollTrigger сбрасывает страницу в самое начало. Поэтому всё время помним, какой блок
// у гостя на экране, и после такого перехода возвращаем его к этому блоку.
//
// Модуль подключается в main.tsx до компонентов: браузер оповещает слушателей media-запросов
// в порядке их создания, и наш должен сработать раньше, чем GSAP начнёт перестраивать анимации.

type Anchor = { block: Element; ratio: number }

/** Отступ от верха экрана, по которому определяем «текущий» блок (ниже шапки) */
const PROBE = 120

/** Где гость был, когда страница в последний раз спокойно стояла */
let current: Anchor | null = null
/** Место, к которому нужно вернуться после перестройки; пока оно задано, текущее положение не отслеживаем */
let pending: Anchor | null = null
let trackTimer: ReturnType<typeof setTimeout> | undefined
let restoreTimer: ReturnType<typeof setTimeout> | undefined

function findAnchor(): Anchor | null {
  for (const block of document.querySelectorAll('main > *, footer')) {
    const rect = block.getBoundingClientRect()
    // доля высоты блока, на которой сейчас находится гость
    if (rect.bottom > PROBE && rect.height > 0) return { block, ratio: Math.max(0, (PROBE - rect.top) / rect.height) }
  }
  return null
}

// Положение запоминаем, когда прокрутка остановилась: во время неё лишние измерения не нужны
function track() {
  clearTimeout(trackTimer)
  trackTimer = setTimeout(() => {
    if (!pending) current = findAnchor()
  }, 120)
}

function restore() {
  const anchor = pending
  pending = null
  if (!anchor || !anchor.block.isConnected) return
  const rect = anchor.block.getBoundingClientRect()
  window.scrollTo(0, window.scrollY + rect.top + anchor.ratio * rect.height - PROBE)
  ScrollTrigger.update()
}

// Пересчётов при смене порога несколько подряд — возвращаемся после последнего
function scheduleRestore() {
  if (!pending) return
  clearTimeout(restoreTimer)
  restoreTimer = setTimeout(restore, 150)
}

function onBreakpoint() {
  pending ??= current
  scheduleRestore()
}

window.addEventListener('scroll', track, { passive: true })
window.addEventListener('load', track)
for (const query of [media.pin, media.desktop]) {
  window.matchMedia(query).addEventListener('change', onBreakpoint)
}
ScrollTrigger.addEventListener('refresh', scheduleRestore)
