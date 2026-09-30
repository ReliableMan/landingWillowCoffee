// Данные, которые не зависят от языка: ссылки, контакты, часы, размеры.
// Переводимые тексты — в src/i18n/locales.

export const brand = {
  name: 'Willow We Love',
  tagline: 'Coffee shop & bistro',
  wordmark: 'willow we love',
  /** Текст по кругу на бейдже в hero */
  badge: 'willow we love • coffee shop & bistro • ',
  instagram: { handle: '@willow.we.love', url: 'https://www.instagram.com/willow.we.love/' },
}

export const anchors = {
  about: '#about',
  menu: '#menu',
  signature: '#signature',
  gallery: '#gallery',
  contacts: '#contacts',
  top: '#top',
}

// Слоганы с афиши и из профиля кофейни — фирменные, не переводятся
export const marquee = [
  'Specialty coffee',
  'Good coffee, better people, always',
  'Signature gourmet specialties',
  'Same place, more good times',
]

// Черновые цифры для блока «О нас»; подписи — в локалях, в том же порядке
export const aboutStats = [1, 6, 8]

export const featureIcons = ['cup', 'leaf', 'plate', 'sprout'] as const

/** Полное меню с фото и заказом — отдельный сайт кофейни */
export const fullMenuUrl = 'https://qr-code-sooty-two.vercel.app/willow'

// Три колонки галереи по два фото; подписи заглушек — в локалях, в том же порядке
export const galleryColumns = [
  [300, 190],
  [200, 242],
  [250, 240],
]

/** Сколько карточек-заглушек в отзывах, пока нет настоящих */
export const reviewCount = 5

export type OpeningHours = {
  id: 'weekdays' | 'weekend'
  /** 0 — воскресенье … 6 — суббота */
  days: number[]
  open: string
  close: string
}

// Точка кофейни на Google Maps
const coords = { lat: 44.8163, lng: 20.4598 }
const point = `${coords.lat},${coords.lng}`

export const contacts = {
  address: 'Main Street 12, City Centre',
  phone: { label: '+381 11 000 0000', href: 'tel:+381110000000' },
  timeZone: 'Europe/Belgrade',
  // Часы из профиля Instagram — проверить перед запуском
  hours: [
    { id: 'weekdays', days: [1, 2, 3, 4, 5], open: '09:00', close: '20:00' },
    { id: 'weekend', days: [6, 0], open: '10:00', close: '20:00' },
  ] satisfies OpeningHours[],
  coords,
  /** Карта в блоке: живая, с маркером Google в точке кофейни (маркер едет вместе с картой) */
  mapEmbedUrl: (lang: string) => `https://www.google.com/maps?q=${point}&z=17&hl=${lang}&output=embed`,
  /** Карточка «Willow coffee shop» в Google Maps: название, отзывы, часы */
  mapUrl: 'https://www.google.com/maps',
  routeUrl: `https://www.google.com/maps/dir/?api=1&destination=${point}`,
}

export const copyright = `© ${new Date().getFullYear()} ${brand.name}`
