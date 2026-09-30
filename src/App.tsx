import { About } from '@/components/sections/About'
import { Contacts } from '@/components/sections/Contacts'
import { Features } from '@/components/sections/Features'
import { Footer } from '@/components/sections/Footer'
import { Gallery } from '@/components/sections/Gallery'
import { Header } from '@/components/sections/Header'
import { Hero } from '@/components/sections/Hero'
import { Marquee } from '@/components/sections/Marquee'
import { Menu } from '@/components/sections/Menu'
import { Process } from '@/components/sections/Process'
import { Reviews } from '@/components/sections/Reviews'
import { Signature } from '@/components/sections/Signature'
import { useAnchorScroll } from '@/hooks/useAnchorScroll'
import { useScrollRefresh } from '@/hooks/useScrollRefresh'
import { useLang } from '@/i18n/useLang'

export default function App() {
  useScrollRefresh()
  useAnchorScroll()
  const { t } = useLang()

  return (
    <>
      {/* Первая остановка Tab: позволяет с клавиатуры сразу перейти к содержанию, минуя шапку */}
      <a
        href="#main"
        onClick={() => document.getElementById('main')?.focus({ preventScroll: true })}
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-70 focus:rounded-full focus:bg-ink focus:px-5 focus:py-2.5 focus:text-sm focus:font-semibold focus:text-paper"
      >
        {t.header.skip}
      </a>
      <Header />
      <main id="main" tabIndex={-1} className="outline-none">
        <Hero />
        <Marquee />
        <About />
        <Features />
        <Signature />
        <Menu />
        <Process />
        <Gallery />
        <Reviews />
        <Contacts />
      </main>
      <Footer />
    </>
  )
}
