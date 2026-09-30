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
// По букве из латиницы, кириллицы и сербской латиницы — чтобы подгрузились нужные части шрифта
const SAMPLE = 'AaБбŠš'

// Таблица стилей со шрифтами подключена ссылкой и может прийти позже скрипта.
// Пока её нет, браузер не знает про шрифты, и document.fonts.load() вернётся сразу и впустую.
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
  const fonts = [`500 1em ${css.getPropertyValue('--font-display')}`, `400 1em ${css.getPropertyValue('--font-sans')}`]
  await Promise.all(fonts.map((font) => document.fonts.load(font, SAMPLE).catch(() => undefined)))
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
