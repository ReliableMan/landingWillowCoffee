import type { Locale } from './ru'

// Сербский — латиницей, как в меню и профиле кофейни
export const sr: Locale = {
  meta: {
    title: 'Willow We Love — coffee shop i bistro u Beogradu',
    description:
      'Willow We Love je coffee shop i bistro u Beogradu: specialty kafa, autorska pića, tartini, fokača i domaći dezerti.',
  },
  header: {
    skip: 'Preskoči na sadržaj',
    navLabel: 'Navigacija po stranici',
    openMenu: 'Otvori meni',
    closeMenu: 'Zatvori meni',
    langLabel: 'Jezik sajta',
  },
  nav: {
    about: 'O nama',
    menu: 'Meni',
    signature: 'Hitovi',
    gallery: 'Atmosfera',
    contacts: 'Kontakt',
  },
  hero: {
    overline: 'Coffee shop & bistro, Beograd',
    title: ['Dobra kafa,', 'još bolji', 'ljudi'],
    subtitle:
      'Specialty kafa, matcha i limunade po našim receptima, tartini, fokača i domaći dezerti. Svratite na doručak ili po kafu za poneti.',
    primaryCta: 'Pogledaj meni',
    secondaryCta: 'Kako do nas',
    photo: 'Foto ili video: šolja, para, ruke bariste',
  },
  about: {
    title: 'Dolazite zbog kafe, ostajete zbog ljudi',
    paragraphs: [
      'Willow We Love je coffee shop i bistro u Beogradu. Pravimo specialty kafu, pečemo dezerte i spremamo jednostavnu hranu kojoj se rado vraćate.',
      'U septembru smo napunili godinu dana. Za to vreme stekli smo stalne goste, svoja autorska pića i program lojalnosti za one koji često svraćaju.',
    ],
    stats: ['godina u Beogradu', 'autorskih pića iz bara', 'dezerata u vitrini'],
    photos: ['Foto: enterijer ili barista na poslu', 'Foto 2: zrno, detalji'],
  },
  features: {
    title: 'Zašto svraćaju kod nas',
    items: [
      {
        title: 'Specialty kafa',
        text: 'Espreso, filter, raf i espreso tonici — od klasike do tropskog sa marakujom.',
      },
      {
        title: 'Matcha i limunade',
        text: 'Matcha sa bobičastim voćem i crnom ribizlom, limunade sa lavandom, đumbirom i ruzmarinom.',
      },
      {
        title: 'Bistro kuhinja',
        text: 'Tartini, fokača, sirniki i potaž od bundeve: kod nas možete i da doručkujete i da ručate.',
      },
      {
        title: 'Ima i veganskog',
        text: 'Kolač sa jabukom, čokoladni barovi bez šećera i glutena, tartin sa gvakamoleom.',
      },
    ],
  },
  signature: {
    title: ['Willow', 'Barski Specijali'],
    photo: 'Foto pića',
  },
  menu: {
    title: 'Meni',
    fullMenu: 'Interaktivni meni',
    tabsLabel: 'Kategorije menija',
    priceNote: 'Cene su u dinarima (RSD).',
  },
  process: {
    title: 'Od zrna do šolje',
    steps: ['Zrno', 'Prženje', 'Priprema', 'Šolja'],
  },
  gallery: {
    title: 'Atmosfera',
    close: 'Zatvori fotografiju',
    photos: ['Foto: sala', 'Foto: latte art', 'Foto: dezerti', 'Foto: barista', 'Foto: detalji', 'Foto: vitrina'],
  },
  reviews: {
    title: 'Šta kažu gosti',
    rating: '[ocena] ★ Google Maps',
    text: '[Tekst recenzije — preuzimamo sa Google Maps]',
    author: '[Ime gosta]',
    stars: '5 od 5',
    prev: 'Prethodna recenzija',
    next: 'Sledeća recenzija',
  },
  contacts: {
    title: 'Kako do nas',
    address: 'Adresa',
    hours: 'Radno vreme',
    phone: 'Telefon',
    social: 'Mreže',
    days: { weekdays: 'Pon–Pet', weekend: 'Sub–Ned' },
    route: 'Prikaži rutu',
    mapTitle: 'Willow We Love na mapi',
  },
  status: {
    open: 'Otvoreno, do {time}',
    opensToday: 'Trenutno zatvoreno, otvaramo u {time}',
    opensTomorrow: 'Trenutno zatvoreno, otvaramo sutra u {time}',
    closed: 'Trenutno zatvoreno',
  },
  footer: {
    toTop: 'Na vrh',
  },
}
