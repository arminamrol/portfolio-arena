import type { ResumeData } from './types'

// All resume content. Edit this file to change the resume; the map, Towers,
// Abilities, Inventory and Shop are generated from it.
export const resumeData = {
  hero: {
    name: 'Armin Amrollahian',
    title: 'Senior Frontend Engineer',
    summary:
      'Senior frontend engineer shipping for the web since 2016. At Digikala I build for one of Iran’s largest e-commerce platforms, serving over 40 million customers. My reach goes past the frontend into Nest.js, Docker and Postgres. Based in Tehran; I work in English and Persian.',
  },

  lanes: {
    top: {
      label: 'Education',
      entries: [
        {
          id: 'mazust',
          title: 'Mazust',
          subtitle: 'Software engineering courses',
          description: 'Completed software engineering courses at the University of Science and Technology of Mazandaran.',
          highlights: [],
          links: [],
        },
      ],
    },

    mid: {
      label: 'Projects',
      entries: [
        {
          id: 'online-marketplace',
          title: 'Online Marketplace',
          subtitle: 'Next.js · Nest.js · Docker · Postgres',
          description: 'An online marketplace where users buy, sell and trade goods and services.',
          highlights: [
            'Built the app in Next.js, with a React dashboard styled in Tailwind CSS and MUI',
            'Wrote the Nest.js backend on Postgres, deployed with Docker behind Nginx',
          ],
          links: [],
        },
        {
          id: 'rah-ahan-mobile-app',
          title: 'Rah Ahan Mobile App',
          subtitle: 'React Native · Jest',
          description: 'A mobile app for Rah Ahan, Iran’s national railway, built in React Native for iOS and Android.',
          highlights: ['Covered the app with unit tests in Jest'],
          links: [],
        },
        {
          id: 'restaurant-app',
          title: 'Restaurant App',
          subtitle: 'React Native · React · Redux',
          description: 'A restaurant app for iOS and Android built in React Native, with a companion React web app.',
          highlights: [],
          links: [],
        },
      ],
    },

    bottom: {
      label: 'Experience',
      entries: [
        {
          id: 'digikala',
          title: 'Senior Software Engineer, Frontend',
          subtitle: 'Digikala · Tehran · Jun 2024–present',
          description: 'Digikala is Iran’s leading e-commerce platform, serving over 40 million customers.',
          highlights: [
            'Led the end-to-end frontend rebuild of a major product line, from ambiguous requirements to launch in about 9 months, moving it off legacy infrastructure; it reached 34K new users and 58K sessions on launch day',
            'Built and shipped two high-traffic features that now generate a combined 4,500–6,500 orders per day',
            'Migrated a core project’s build pipeline to Vite, cutting build time by over 90% and CI/CD time from about 10 minutes to under 2',
            'Set up production monitoring and fixed critical platform-wide bugs, improving reliability and user experience',
            'Served as the main point of contact between teams for cross-platform issues, clearing blockers outside the team’s own scope',
          ],
          links: [{ label: 'Digikala', url: 'https://www.digikala.com' }],
        },
        {
          id: 'nexu',
          title: 'Senior Frontend Developer',
          subtitle: 'Nexu (MH Holding) · Remote, Spain · Jul 2023–Jul 2024',
          description: 'Nexu is a health app offering online video calls and chats with doctors.',
          highlights: [
            'Made the site 25% faster',
            'Improved video calls with doctors, raising successful, issue-free calls by 70%',
            'Boosted customer engagement by 30% through better SEO and site performance',
            'Mentored the other frontend developers, helping them grow their skills and productivity',
          ],
          links: [],
        },
        {
          id: 'freelance',
          title: 'Freelance Software Engineer',
          subtitle: 'Self-employed · 2016–2019, 2021–2023',
          description: 'Built web and mobile apps for clients as an independent engineer.',
          highlights: [],
          links: [],
        },
        {
          id: 'roomak',
          title: 'Frontend Developer',
          subtitle: 'Roomak · Mar 2019–Apr 2020',
          description: 'Roomak is a software company building custom solutions tailored to client companies across many industries.',
          highlights: [],
          links: [],
        },
      ],
    },
  },

  skills: {
    Q: {
      name: 'React & Next.js',
      level: 5,
      description: 'Building with React since 2016, from freelance apps to Digikala, serving over 40 million customers.',
    },
    W: {
      name: 'TypeScript',
      level: 5,
      description: 'Typed end to end, from React components to Nest.js services.',
    },
    E: {
      name: 'Web Performance',
      level: 4,
      description: 'Made Nexu’s site 25% faster and lifted engagement by 30% through SEO and performance work.',
    },
    R: {
      name: 'Node.js & Nest.js',
      level: 4,
      description: 'Nest.js backends on Postgres and MongoDB, shipped with Docker and Nginx.',
    },
  },

  inventory: [
    {
      label: 'Frontend',
      tools: ['TypeScript', 'JavaScript', 'React', 'React Native', 'Next.js', 'Redux', 'Zustand', 'Tailwind', 'Framer Motion'],
    },
    {
      label: 'Backend & Data',
      tools: ['Node.js', 'Nest.js', 'SQL databases', 'MongoDB', 'Redis', 'Elasticsearch', 'RabbitMQ', 'S3'],
    },
    {
      label: 'DevOps & Tooling',
      tools: ['Docker', 'Nginx', 'Grafana', 'Jest', 'Webpack', 'Vite', 'Clean Architecture'],
    },
  ],

  contactLinks: [
    { label: 'GitHub', url: 'https://github.com/arminamrol/' },
    { label: 'LinkedIn', url: 'https://www.linkedin.com/in/armin-amrollahian/' },
    { label: 'Email', url: 'mailto:arminamrol@gmail.com' },
    {
      label: 'Resume PDF',
      url: 'https://github.com/arminamrol/portfolio-arena/releases/latest/download/Armin-Amrollahian.pdf',
    },
  ],
} satisfies ResumeData
