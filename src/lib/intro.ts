// Стартовая анимация первого экрана: hero и шапка живут в разных компонентах,
// поэтому общий момент старта и раскладка по времени лежат здесь.

/** Секунды от старта: когда вступает каждая часть (карточка 02 вайрфрейма, всего ≈ 1.8 с) */
export const INTRO = {
  photo: 0,
  title: 0.2,
  body: 0.8,
  badge: 1.0,
  header: 1.2,
}

const FONT_TIMEOUT = 1500

// Шрифты разбиты на части по алфавитам, и ждать нужно только те, что нужны тексту на экране:
// английской версии незачем качать кириллицу. Поэтому образец текста берём со страницы.
const pageText = (selector: string) =>
  Array.from(document.querySelectorAll(selector), (el) => el.textContent).join(' ') || 'Aa'

// Если таблица стилей ещё не пришла, браузер не знает про шрифты,
// и document.fonts.load() вернётся сразу и впустую — сначала ждём её.
function stylesheetsLoaded() {
  const links = Array.from(document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]'))
  return Promise.all(
    links.map((link) =>
      link.sheet
        ? Promise.resolve()
        : new Promise<void>((resolve) => {
            link.addEventListener('load', () => resolve(), { once: true })
            link.addEventListener('error', () => resolve(), { once: true })
          }),
    ),
  )
}

async function fontsLoaded() {
  await stylesheetsLoaded()
  const css = getComputedStyle(document.documentElement)
  const fonts = [
    // заголовки всех блоков — шрифтом display, текст первого экрана — основным
    { font: `500 1em ${css.getPropertyValue('--font-display')}`, text: pageText('h1, h2') },
    { font: `400 1em ${css.getPropertyValue('--font-sans')}`, text: pageText('header, #hero') },
  ]
  await Promise.all(fonts.map(({ font, text }) => document.fonts.load(font, text).catch(() => undefined)))
}

let ready: Promise<void> | undefined

/**
 * Один общий промис для hero и шапки: шрифты заголовка и текста загружены
 * (иначе SplitText разобьёт строки по запасному шрифту), но ждём не дольше 1.5 с.
 */
export function introReady(): Promise<void> {
  ready ??= Promise.race([fontsLoaded(), new Promise<void>((resolve) => setTimeout(resolve, FONT_TIMEOUT))])
  return ready
}
