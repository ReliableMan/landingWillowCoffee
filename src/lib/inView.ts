// «Элемент дошёл до экрана» без ScrollTrigger.
//
// Каждый ScrollTrigger при создании и при каждом пересчёте измеряет положение элемента,
// а это заставляет браузер заново раскладывать всю страницу. Для одноразовых появлений
// (их на странице десятки) это слишком дорого. IntersectionObserver сообщает то же самое
// сам, асинхронно и без принудительной раскладки.
// ScrollTrigger остаётся там, где он действительно нужен: scrub, pin, скорость скролла.

type Entry = { targets: Element[]; callback: (batch: Element[]) => void }

/** start — доля высоты экрана, до которой должен дойти верх элемента: 0.8 = «top 80%» */
type Watcher = {
  observer: IntersectionObserver
  // за одним элементом могут следить несколько подписчиков (например, появление блока и счётчики в нём)
  entries: Map<Element, Set<Entry>>
  start: number
}

const watchers = new Map<number, Watcher>()

function fire(watcher: Watcher, elements: Element[]) {
  // элементы одной группы, дошедшие одновременно, отдаём одним вызовом — чтобы их можно было показать по очереди
  const groups = new Map<Entry, Element[]>()
  for (const el of elements) {
    const entries = watcher.entries.get(el)
    if (!entries) continue
    watcher.entries.delete(el)
    watcher.observer.unobserve(el)
    for (const entry of entries) groups.set(entry, [...(groups.get(entry) ?? []), el])
  }
  for (const [entry, batch] of groups) {
    // порядок — как в разметке, а не как пришло от браузера
    entry.callback(entry.targets.filter((target) => batch.includes(target)))
  }
}

function getWatcher(start: number): Watcher {
  let watcher = watchers.get(start)
  if (watcher) return watcher

  const observer = new IntersectionObserver(
    (records) => {
      const reached = records
        // дошёл до линии или уже выше неё (страница открыта с середины)
        .filter(
          (r) => r.isIntersecting || r.boundingClientRect.top < (r.rootBounds?.bottom ?? window.innerHeight * start),
        )
        .map((r) => r.target)
      if (reached.length) fire(watcher!, reached)
    },
    // нижний край зоны поднят до линии start; по горизонтали зона безразмерна — ленты шире экрана тоже считаются
    { rootMargin: `0px 100000px -${Math.round((1 - start) * 100)}% 100000px` },
  )
  watcher = { observer, entries: new Map(), start }
  watchers.set(start, watcher)
  return watcher
}

// Элементы у самого низа страницы до линии не дотягиваются: когда страница докручена до конца, показываем всё оставшееся
function flushAtBottom() {
  if (window.innerHeight + window.scrollY < document.documentElement.scrollHeight - 2) return
  for (const watcher of watchers.values()) fire(watcher, [...watcher.entries.keys()])
}
window.addEventListener('scroll', flushAtBottom, { passive: true })

/**
 * Один раз вызывает callback, когда элементы группы доходят до линии start.
 * Дошедшие одновременно приходят одним списком. Возвращает функцию отмены.
 */
export function batchInView(targets: Element[], callback: (batch: Element[]) => void, start = 0.8) {
  const watcher = getWatcher(start)
  const entry: Entry = { targets, callback }
  for (const target of targets) {
    const entries = watcher.entries.get(target) ?? new Set()
    entries.add(entry)
    watcher.entries.set(target, entries)
    watcher.observer.observe(target)
  }
  return () => {
    for (const target of targets) {
      const entries = watcher.entries.get(target)
      if (!entries?.delete(entry) || entries.size) continue
      watcher.entries.delete(target)
      watcher.observer.unobserve(target)
    }
  }
}

/** Один раз вызывает callback, когда верх элемента доходит до линии start. Возвращает функцию отмены. */
export function onceInView(target: Element | null | undefined, callback: () => void, start = 0.8) {
  if (!target) return () => {}
  return batchInView([target], callback, start)
}

/** Следит, виден ли элемент на экране: вызывает callback при каждом входе и выходе. Возвращает функцию отмены. */
export function watchInView(target: Element, callback: (inView: boolean) => void) {
  const observer = new IntersectionObserver((records) => callback(records[records.length - 1].isIntersecting))
  observer.observe(target)
  return () => observer.disconnect()
}
