/**
 * ============================================================================
 *  THE ONLY FILE YOU NEED TO EDIT.
 * ============================================================================
 *  Everything the visitor reads lives here. The game engine, the map and the
 *  UI read from this config, so you never have to touch rendering code to
 *  update your portfolio.
 *
 *  Replace every `TODO:` placeholder with your real data.
 * ============================================================================
 */

export type StationId = 'home' | 'workshop' | 'arcade' | 'tower' | 'post' | 'kiosk';

/** A single row inside a station panel (a project, a job, a skill group...). */
export interface StationEntry {
  title: string;
  /** Secondary line: role, year range, tech summary. */
  meta?: string;
  description?: string;
  /** Renders the row as a link. External links open in a new tab. */
  href?: string;
  /** Secondary link to the source code, shown under the card. */
  repo?: string;
  /** Short pills rendered under the description. */
  tags?: string[];
}

export interface Station {
  id: StationId;
  /** Sign text painted on the building. Keep it SHORT (max ~11 chars). */
  sign: string;
  /** Panel heading. */
  title: string;
  /** RPG dialog lines, typed out one after another when the panel opens. */
  dialog: string[];
  entries: StationEntry[];
  /** Optional highlighted action at the bottom of the panel. */
  cta?: { label: string; href: string };
}

export const profile = {
  /** Rendered in the HUD, so uppercase reads best. */
  name: 'EZEQUIEL RAMIREZ',
  role: 'Full Stack Developer',
  location: 'Buenos Aires, Argentina',
  email: 'ezequielram@gmail.com',
  github: 'https://github.com/Ezequiel-Ramirez',
  linkedin: 'https://www.linkedin.com/in/ezequiel-e-ramirez/',
  /**
   * Static files live in `public/` at the PROJECT ROOT (next to package.json),
   * never inside `src/`. `public/cv.pdf` is served as `/cv.pdf`.
   */
  cvUrl: '/cv.pdf',
  /** Used in the start screen subtitle. */
  tagline: 'Ecommerce and web products, end to end',
} as const;

/**
 * Prefilled mailto so visitors land on a ready-to-send email.
 * No backend, no database — the visitor's own mail client does the work.
 */
export const mailtoHref = `mailto:${profile.email}?subject=${encodeURIComponent(
  "Let's work together",
)}&body=${encodeURIComponent('Hi Ezequiel! I found your Dev Town portfolio and I would like to talk about ')}`;

export const stations: Station[] = [
  {
    id: 'home',
    sign: 'HOME',
    title: 'About me',
    dialog: [
      "Hey! I'm Ezequiel, a full stack developer.",
      'Welcome to my neighborhood. Walk around and visit every building to find my work, my stack and how to reach me.',
    ],
    entries: [
      {
        title: 'Who I am',
        meta: profile.location,
        description:
          "Full stack developer. I build and maintain La Nación's ecommerce site, and before that I spent almost two years doing front end for client-facing products. I have been taking freelance work since 2019.",
      },
      {
        title: 'How I work',
        description:
          'I adapt fast to a team and I like owning a feature end to end. Most of what I build is responsive web: it has to hold up on a phone exactly as well as it does on a desktop.',
        tags: ['Responsive web', 'UX / UI', 'Functional QA'],
      },
      {
        title: 'Currently',
        meta: 'La Nación',
        description:
          'Working full stack on the company ecommerce. Open to new opportunities and interesting collaborations.',
      },
    ],
  },

  {
    id: 'workshop',
    sign: 'WORKSHOP',
    title: 'Stack & skills',
    dialog: [
      'This is the workshop. Every tool in the rack is something I use in production.',
    ],
    entries: [
      {
        title: 'Frontend',
        description: 'Interfaces that hold up on any screen size.',
        tags: ['React', 'React Native', 'Next.js', 'JavaScript', 'HTML', 'CSS3', 'SASS'],
      },
      {
        title: 'Backend & data',
        description: 'APIs and the data behind them.',
        tags: ['Node.js', 'Express', 'GraphQL', 'PostgreSQL', 'MongoDB'],
      },
      {
        title: 'Design & QA',
        description: 'I design the interface and I test it before it ships.',
        tags: ['UX / UI design', 'Functional QA testing', 'Photoshop'],
      },
      {
        title: 'Tooling',
        description: 'The everyday kit.',
        tags: ['Git', 'npm', 'Bootstrap', 'jQuery', 'WordPress', 'Android Studio'],
      },
    ],
  },

  {
    id: 'arcade',
    sign: 'ARCADE',
    title: 'Projects',
    dialog: [
      'Welcome to the arcade!',
      'Each cabinet is a project I built. Insert a coin — the links are live.',
    ],
    // Ordered strongest first: a live product with paying users beats a
    // course exercise, and most visitors only read the first two cabinets.
    entries: [
      {
        title: 'EduGestio',
        meta: 'Live product · edugestio.com.ar',
        description:
          'Classroom management for teachers: grades with configurable scales, one-tap attendance, assignments to create and correct, and direct messaging with students and tutors. Runs in the browser and installs on a phone like a native app. In production, with a free trial and paid plans for individual teachers and schools.',
        href: 'https://www.edugestio.com.ar',
        tags: ['Next.js', 'Node.js', 'PostgreSQL', 'PWA'],
      },
      {
        title: 'Pausa Serena',
        meta: 'Booking system · live',
        description:
          'Site and booking system for a massage studio. Clients pick a slot themselves and get the confirmation on WhatsApp; the offered slots are built from the professional\'s own Google Calendar, with her busy time subtracted automatically, so she never has to keep two calendars in sync. Behind a login she can also edit her availability day by day.',
        href: 'https://landing-calendar.vercel.app/',
        tags: ['Next.js', 'React 19', 'TypeScript', 'Turso', 'Google Calendar API', 'WhatsApp Cloud API'],
      },
      {
        title: 'LoveByLore',
        meta: 'Ecommerce · live',
        description:
          'Online store for a family lingerie business: catalogue with filters by garment type, size picker, cart, favourites persisted in local storage and checkout. Products and orders are managed from Firebase.',
        href: 'https://ecommerce-lore.vercel.app/',
        repo: 'https://github.com/Ezequiel-Ramirez/ecommerce-lore',
        tags: ['React', 'Firebase', 'React Router', 'Bootstrap'],
      },
      {
        title: 'Multiproject Games',
        meta: 'Arcade collection · live',
        description:
          'Several small games behind a single menu, dressed in an 8-bit NES theme. Same instinct that turned this portfolio into a town.',
        href: 'https://multiproject-games.vercel.app',
        repo: 'https://github.com/Ezequiel-Ramirez/multiproject-games',
        tags: ['React', 'TypeScript', 'Vite', 'React Router'],
      },
      {
        title: 'Dev Town',
        meta: 'This portfolio',
        description:
          'The town you are standing in. No image assets: every sprite is a matrix of characters mapped to a palette and every tile is drawn with rectangles on canvas. The engine owns the game loop and React only renders these panels.',
        // The repo is private, and a private repo returns a 404 to every
        // visitor. Uncomment this the moment you make it public — a link that
        // fails is worse than no link at all.
        // repo: 'https://github.com/Ezequiel-Ramirez/dev-town',
        tags: ['React', 'TypeScript', 'Canvas', 'Vite'],
      },

      /*
       * Left out on purpose: calendar-react-expert and heroes-app-react-expert.
       * Both are exercises from Fernando Herrera's React course, so they look
       * identical in every repo of everyone who took it — a reviewer learns
       * nothing about you from them. They stay on your GitHub as proof you
       * studied; they do not take a cabinet a recruiter actually reads.
       */
    ],
    cta: { label: 'See all repositories', href: profile.github },
  },

  {
    id: 'tower',
    sign: 'OFFICE',
    title: 'Experience',
    dialog: ['The office tower. One floor per stop in my career.'],
    entries: [
      {
        title: 'La Nación',
        meta: 'Full Stack Developer · June 2023 — Present',
        description:
          "Development and maintenance of the company's ecommerce site.",
        // TODO: add the stack you actually use there, and a number if you have
        // one (traffic, conversion, load time). Numbers are what recruiters read.
      },
      {
        title: 'Global Solutions',
        meta: 'Front End Developer Jr · October 2021 — June 2023',
        description: 'Front end development and maintenance for client companies.',
      },
      {
        // TODO: confirm the company name — the CV reads "Alpha Web Development".
        title: 'Freelance',
        meta: 'Web Developer · November 2019 — Present',
        description: 'Design and development of websites for different purposes.',
      },
      {
        title: 'Coder House',
        meta: 'Front End Development career',
        description:
          'Website development, best practices with HTML, CSS and JS, React, React Native, functional QA testing and backend.',
      },
      {
        title: 'Educación IT',
        meta: 'Web Design career',
        description: 'UX/UI design, Photoshop, WordPress and Bootstrap.',
      },
      {
        title: 'Languages',
        description: 'Spanish (native) · English (intermediate)',
      },
    ],
  },

  {
    id: 'post',
    sign: 'POST',
    title: 'Contact',
    dialog: [
      'The post office. This is where you find me.',
      'Pick a channel — I answer all of them.',
    ],
    entries: [
      {
        title: 'Email',
        meta: profile.email,
        description: 'Best for project proposals and job offers.',
        href: mailtoHref,
      },
      {
        title: 'GitHub',
        meta: '@' + profile.github.split('/').filter(Boolean).pop(),
        description: 'Code, side projects and contributions.',
        href: profile.github,
      },
      {
        title: 'LinkedIn',
        meta: 'in/ezequiel-e-ramirez',
        description: 'Full career history and recommendations.',
        href: profile.linkedin,
      },
    ],
    cta: { label: 'Send me an email', href: mailtoHref },
  },

  {
    id: 'kiosk',
    sign: 'NEWS',
    title: 'Résumé',
    dialog: ['The newsstand. Grab a copy of my CV before you leave.'],
    entries: [
      {
        title: 'Download my CV',
        meta: 'PDF · opens in a new tab',
        description: 'The complete version: experience, stack and education.',
        href: profile.cvUrl,
      },
      {
        title: 'Thanks for playing',
        description:
          'This whole town is a static site — no database, no tracking. The source is on GitHub if you want to see how it works.',
        href: profile.github,
      },
    ],
  },
];

export const stationById = new Map<StationId, Station>(stations.map((s) => [s.id, s]));
