import { Draggable, gsap } from '@/lib/gsap'

// Хелпер бесконечной карусели из документации GSAP (seamless loop), перенесённый на TypeScript.
// Каждый элемент едет влево по xPercent и, уйдя за левый край, перескакивает в конец ленты.
// Отличие от оригинала — опция offsetLeft: точки доводки (стрелки, конец свайпа) сдвинуты вправо
// на заданное число пикселей, чтобы карточка вставала по левому краю контента, а не экрана.

type LoopConfig = {
  repeat?: number
  paused?: boolean
  /** 1 ≈ 100 px/с */
  speed?: number
  /** зазор после последнего элемента, px */
  paddingRight?: number
  draggable?: boolean
  snap?: number | false
  /** отступ точки доводки от левого края ленты, px; функция — чтобы пересчитываться при ресайзе */
  offsetLeft?: () => number
  /** лента остановилась после перетаскивания; если не задано — продолжает ехать, как ехала до него */
  onSettle?: () => void
}

export type LoopTimeline = gsap.core.Timeline & {
  toIndex: (index: number, vars?: gsap.TweenVars) => gsap.core.Tween | gsap.core.Timeline
  next: (vars?: gsap.TweenVars) => gsap.core.Tween | gsap.core.Timeline
  previous: (vars?: gsap.TweenVars) => gsap.core.Tween | gsap.core.Timeline
  current: () => number
  closestIndex: (setCurrent?: boolean) => number
  times: number[]
  draggable?: Draggable
}

export function horizontalLoop(elements: HTMLElement[], config: LoopConfig = {}): LoopTimeline {
  const items = elements
  let timeline!: LoopTimeline

  // Контекст нужен, чтобы при вызове внутри gsap.matchMedia()/useGSAP всё корректно откатывалось
  gsap.context(() => {
    const tl = gsap.timeline({
      repeat: config.repeat,
      paused: config.paused,
      defaults: { ease: 'none' },
      onReverseComplete: () => {
        tl.totalTime(tl.rawTime() + tl.duration() * 100)
      },
    }) as LoopTimeline

    const length = items.length
    const startX = items[0].offsetLeft
    const times: number[] = []
    const widths: number[] = []
    const spaceBefore: number[] = []
    const xPercents: number[] = []
    const pixelsPerSecond = (config.speed || 1) * 100
    // Браузеры могут сдвигать flex-элементы на пиксель; округление xPercent делает движение ровным
    const snap = config.snap === false ? (v: number) => v : gsap.utils.snap(config.snap || 1)
    const container = items[0].parentNode as HTMLElement
    let curIndex = 0
    let indexIsDirty = false
    let totalWidth = 0
    let timeWrap: (time: number) => number = (time) => time
    let proxy: HTMLDivElement | undefined

    const scaleX = (el: HTMLElement) => gsap.getProperty(el, 'scaleX') as number

    const getTotalWidth = () =>
      items[length - 1].offsetLeft +
      (xPercents[length - 1] / 100) * widths[length - 1] -
      startX +
      spaceBefore[0] +
      items[length - 1].offsetWidth * scaleX(items[length - 1]) +
      (config.paddingRight || 0)

    const populateWidths = () => {
      let b1 = container.getBoundingClientRect()
      items.forEach((el, i) => {
        widths[i] = parseFloat(gsap.getProperty(el, 'width', 'px') as string)
        xPercents[i] = snap(
          (parseFloat(gsap.getProperty(el, 'x', 'px') as string) / widths[i]) * 100 +
            (gsap.getProperty(el, 'xPercent') as number),
        )
        const b2 = el.getBoundingClientRect()
        spaceBefore[i] = b2.left - (i ? b1.right : b1.left)
        b1 = b2
      })
      // x → xPercent: лента остаётся корректной при изменении ширины карточек
      gsap.set(items, { xPercent: (i: number) => xPercents[i] })
      totalWidth = getTotalWidth()
    }

    const populateTimeline = () => {
      tl.clear()
      for (let i = 0; i < length; i++) {
        const item = items[i]
        const curX = (xPercents[i] / 100) * widths[i]
        const distanceToStart = item.offsetLeft + curX - startX + spaceBefore[0]
        const distanceToLoop = distanceToStart + widths[i] * scaleX(item)
        tl.to(
          item,
          { xPercent: snap(((curX - distanceToLoop) / widths[i]) * 100), duration: distanceToLoop / pixelsPerSecond },
          0,
        )
          .fromTo(
            item,
            { xPercent: snap(((curX - distanceToLoop + totalWidth) / widths[i]) * 100) },
            {
              xPercent: xPercents[i],
              duration: (curX - distanceToLoop + totalWidth - curX) / pixelsPerSecond,
              immediateRender: false,
            },
            distanceToLoop / pixelsPerSecond,
          )
          .add('label' + i, distanceToStart / pixelsPerSecond)
        times[i] = distanceToStart / pixelsPerSecond
      }
      timeWrap = gsap.utils.wrap(0, tl.duration())
    }

    // Точки доводки: карточка встаёт не к левому краю ленты, а на offsetLeft правее
    const populateOffsets = () => {
      const offset = config.offsetLeft ? config.offsetLeft() : 0
      if (!offset) return
      times.forEach((_, i) => {
        times[i] = timeWrap(tl.labels['label' + i] - offset / pixelsPerSecond)
      })
    }

    const getClosest = (values: number[], value: number, wrap: number) => {
      let i = values.length
      let closest = 1e10
      let index = 0
      while (i--) {
        let d = Math.abs(values[i] - value)
        if (d > wrap / 2) d = wrap - d
        if (d < closest) {
          closest = d
          index = i
        }
      }
      return index
    }

    const refresh = (deep?: boolean) => {
      const progress = tl.progress()
      tl.progress(0, true)
      populateWidths()
      if (deep) populateTimeline()
      populateOffsets()
      if (deep && tl.draggable && tl.paused()) tl.time(times[curIndex], true)
      else tl.progress(progress, true)
    }
    const onResize = () => refresh(true)

    gsap.set(items, { x: 0 })
    populateWidths()
    populateTimeline()
    populateOffsets()
    window.addEventListener('resize', onResize)

    const toIndex = (index: number, vars: gsap.TweenVars = {}) => {
      // всегда едем кратчайшим путём
      if (Math.abs(index - curIndex) > length / 2) index += index > curIndex ? -length : length
      const newIndex = gsap.utils.wrap(0, length, index)
      let time = times[newIndex]
      // если точка воспроизведения переходит через конец цикла — поправляем время
      if (time > tl.time() !== index > curIndex && index !== curIndex) {
        time += tl.duration() * (index > curIndex ? 1 : -1)
      }
      if (time < 0 || time > tl.duration()) vars.modifiers = { time: timeWrap }
      curIndex = newIndex
      vars.overwrite = true
      if (proxy) gsap.killTweensOf(proxy)
      return vars.duration === 0 ? tl.time(timeWrap(time)) : tl.tweenTo(time, vars)
    }

    tl.toIndex = toIndex
    tl.closestIndex = (setCurrent) => {
      const index = getClosest(times, tl.time(), tl.duration())
      if (setCurrent) {
        curIndex = index
        indexIsDirty = false
      }
      return index
    }
    tl.current = () => (indexIsDirty ? tl.closestIndex(true) : curIndex)
    tl.next = (vars) => toIndex(tl.current() + 1, vars)
    tl.previous = (vars) => toIndex(tl.current() - 1, vars)
    tl.times = times
    tl.progress(1, true).progress(0, true) // прогоняем один раз заранее — дальше без рывка на первом кадре

    if (config.draggable) {
      const dragProxy = document.createElement('div')
      proxy = dragProxy
      const wrap = gsap.utils.wrap(0, 1)
      let ratio = 0
      let startProgress = 0
      let lastSnap = 0
      let initChangeX = 0
      let wasPlaying = false
      const align = () => tl.progress(wrap(startProgress + (draggable.startX - draggable.x) * ratio))
      const syncIndex = () => tl.closestIndex(true)

      const draggable: Draggable = Draggable.create(dragProxy, {
        trigger: container,
        type: 'x',
        onPressInit() {
          const x = (this as Draggable).x
          gsap.killTweensOf(tl)
          wasPlaying = !tl.paused()
          tl.pause()
          startProgress = tl.progress()
          refresh()
          ratio = 1 / totalWidth
          initChangeX = startProgress / -ratio - x
          gsap.set(dragProxy, { x: startProgress / -ratio })
        },
        onDrag: align,
        onThrowUpdate: align,
        overshootTolerance: 0,
        inertia: true,
        snap(value: number) {
          // если отпустили посреди броска, скорость может быть огромной — в этом случае возвращаем прошлую точку
          if (Math.abs(startProgress / -ratio - (this as unknown as Draggable).x) < 10) return lastSnap + initChangeX
          const time = -(value * ratio) * tl.duration()
          const wrappedTime = timeWrap(time)
          const snapTime = times[getClosest(times, wrappedTime, tl.duration())]
          let dif = snapTime - wrappedTime
          if (Math.abs(dif) > tl.duration() / 2) dif += dif < 0 ? tl.duration() : -tl.duration()
          lastSnap = (time + dif) / tl.duration() / -ratio
          return lastSnap
        },
        onRelease() {
          syncIndex()
          if (draggable.isThrowing) indexIsDirty = true
        },
        onThrowComplete: () => {
          syncIndex()
          if (config.onSettle) config.onSettle()
          else if (wasPlaying) tl.play()
        },
      })[0]
      tl.draggable = draggable
    }

    tl.closestIndex(true)
    timeline = tl

    return () => {
      window.removeEventListener('resize', onResize)
      tl.draggable?.kill()
    }
  })

  return timeline
}
