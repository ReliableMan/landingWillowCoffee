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

export default function App() {
  useScrollRefresh()
  useAnchorScroll()

  return (
    <>
      <Header />
      <main>
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
