import type { Lang } from '@/i18n/config'
import raw from './menu.json'

/** Языки, на которых в menu.json есть названия и составы */
export type MenuLang = 'en' | 'sr'
type Localized = Record<MenuLang, string>

export type MenuItem = {
  name: Localized
  desc?: Localized
  price: string
  badge?: string
}

export type MenuGroup = {
  title?: Localized
  /** зелёный блок, как «Willow Special» в бумажном меню */
  highlight?: boolean
  items: MenuItem[]
}

export type MenuCategory = {
  id: string
  label: Record<Lang, string>
  groups: MenuGroup[]
}

export type Menu = {
  currency: string
  categories: MenuCategory[]
}

export const menu: Menu = raw

/** Названия позиций: на сербской версии — сербские, на русской и английской — английские */
export const menuLangFor = (lang: Lang): MenuLang => (lang === 'sr' ? 'sr' : 'en')

export const signatureDrinks = menu.categories.find((c) => c.id === 'specials')!.groups[0].items
