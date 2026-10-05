import type { ResumeData } from './types'

// All resume content. Edit this file to change the resume; the map, Towers,
// Abilities, Inventory and Shop are generated from it.
export const resumeData = {
  hero: {
    name: 'Armin Amrollahian',
    title: 'Senior Software Engineer',
    summary:
      'Hi, I’m Armin Amrollahian, a full-stack engineer who started freelancing in 2016 and has since worked with teams of all sizes, from early-stage startups to large companies. I enjoy turning messy problems into simple, maintainable solutions, and I care as much about code quality and team communication as I do about shipping fast. Take a look at my work below, or get in touch if you’d like to work together.',
  },

  lanes: {
    // Where it started, oldest first: school, then the first jobs.
    top: {
      label: 'Beginnings',
      entries: [
        {
          id: 'mazust',
          kind: 'education',
          title: 'Mazust',
          subtitle: 'Software engineering courses',
          description: 'Completed software engineering courses at the University of Science and Technology of Mazandaran.',
          highlights: [],
          links: [],
        },
        {
          id: 'freelance',
          kind: 'experience',
          started: '2016',
          title: 'Freelance Software Engineer',
          subtitle: 'Self-employed · 2016–2023',
          description: 'Built web and mobile apps for clients as an independent engineer.',
          highlights: [],
          links: [],
        },
        {
          id: 'roomak',
          kind: 'experience',
          started: '2019-03',
          title: 'Frontend Developer',
          subtitle: 'Roomak · Mar 2019–Apr 2020',
          description: 'Roomak is a software company building custom solutions tailored to client companies across many industries.',
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
          kind: 'project',
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
          id: 'ecommerce-webapp',
          kind: 'project',
          title: 'eCommerce Webapp',
          subtitle: 'Next.js · Nest.js · MongoDB · Docker',
          description: 'An online store built in Next.js on a Nest.js and MongoDB backend, deployed with Docker behind Nginx.',
          highlights: [],
          links: [],
        },
        {
          id: 'rah-ahan-mobile-app',
          kind: 'project',
          title: 'Rah Ahan Mobile App',
          subtitle: 'React Native · Jest',
          description: 'A mobile app for Rah Ahan, Iran’s national railway, built in React Native for iOS and Android.',
          highlights: ['Covered the app with unit tests in Jest'],
          links: [],
        },
        {
          id: 'restaurant-app',
          kind: 'project',
          title: 'Restaurant App',
          subtitle: 'React Native · React · Redux',
          description: 'A restaurant app for iOS and Android built in React Native, with a companion React web app.',
          highlights: [],
          links: [],
        },
      ],
    },

    // Newest first.
    bottom: {
      label: 'Experience',
      entries: [
        {
          id: 'digikala',
          kind: 'experience',
          started: '2024-06',
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
          kind: 'experience',
          started: '2023-07',
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

  languages: ['English', 'Persian'],

  contactLinks: [
    { label: 'GitHub', url: 'https://github.com/arminamrol/' },
    { label: 'LinkedIn', url: 'https://www.linkedin.com/in/armin-amrollahian/' },
    { label: 'Email', url: 'mailto:arminamrol@gmail.com' },
    {
      label: 'Resume PDF',
      url: 'https://github.com/arminamrol/portfolio-arena/releases/latest/download/Armin-Amrollahian-Resume.pdf',
    },
  ],
} satisfies ResumeData
