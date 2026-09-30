/**
 * Блокирует прокрутку страницы, пока открыт слой поверх неё (мобильное меню, лайтбокс).
 * Полоса прокрутки при этом исчезает, и страница стала бы шире — компенсируем отступом,
 * чтобы ничего не дёрнулось вбок. Возвращает функцию, которая снимает блокировку.
 */
export function lockScroll() {
  const { body, documentElement } = document
  const scrollbarWidth = window.innerWidth - documentElement.clientWidth
  const previous = { overflow: body.style.overflow, paddingRight: body.style.paddingRight }

  body.style.overflow = 'hidden'
  if (scrollbarWidth > 0) body.style.paddingRight = `${scrollbarWidth}px`

  return () => {
    body.style.overflow = previous.overflow
    body.style.paddingRight = previous.paddingRight
  }
}
