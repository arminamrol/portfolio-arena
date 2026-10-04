import type { ResumeData } from './types'

// All resume content. Edit this file to change the resume; the map, Towers,
// Abilities and Shop are generated from it. Placeholder content for now.
export const resumeData = {
  hero: {
    name: 'Sam Rivera',
    title: 'Frontend Developer',
    summary:
      'Frontend developer with six years of experience building fast, accessible web apps in React and TypeScript, with a soft spot for design systems and the occasional WebGL experiment.',
  },

  lanes: {
    top: {
      label: 'Education',
      entries: [
        {
          id: 'bsc-computer-science',
          title: 'BSc Computer Science',
          subtitle: 'University of Example · 2014–2018',
          description: 'Focused on human–computer interaction and computer graphics. Final-year project: a browser-based tool for sketching UI flows, built with Canvas and TypeScript.',
          highlights: [
            'Graduated with first-class honours',
            'Final-year project won the department’s best HCI project award',
          ],
          links: [],
        },
        {
          id: 'web-accessibility-certificate',
          title: 'Web Accessibility Specialist',
          subtitle: 'Professional certificate · 2021',
          description: 'Covered WCAG 2.1, ARIA patterns, and testing with screen readers and keyboard-only navigation.',
          highlights: [],
          links: [{ label: 'Certificate', url: 'https://example.com/certificate' }],
        },
      ],
    },

    mid: {
      label: 'Projects',
      entries: [
        {
          id: 'portfolio-arena',
          title: 'Portfolio Arena',
          subtitle: 'React · Three.js · React Three Fiber',
          description: 'This site: an isometric arena game where every Tower is a resume entry. Built by hand to learn Three.js from the ground up.',
          highlights: [
            'Hand-built isometric scene, render loop and click-to-move with no game engine',
            'Plain Resume fallback opens without downloading the 3D engine',
          ],
          links: [{ label: 'Source', url: 'https://github.com/example/portfolio-arena' }],
        },
        {
          id: 'tiny-charts',
          title: 'tiny-charts',
          subtitle: 'Open-source library · TypeScript · SVG',
          description: 'A dependency-free charting library under 5 kB gzipped, with accessible markup and keyboard-navigable data points.',
          highlights: [
            'Under 5 kB gzipped with zero dependencies',
            'Every data point reachable by keyboard and announced by screen readers',
            '1,200+ GitHub stars',
          ],
          links: [{ label: 'GitHub', url: 'https://github.com/example/tiny-charts' }],
        },
        {
          id: 'design-tokens-cli',
          title: 'Design Tokens CLI',
          subtitle: 'Node.js · Style Dictionary',
          description: 'Turns Figma design tokens into CSS variables, TypeScript constants and native theme files from one source of truth.',
          highlights: [
            'One token source feeds web, iOS and Android themes',
            'Cut theme update time from a day to a single command',
          ],
          links: [{ label: 'GitHub', url: 'https://github.com/example/design-tokens-cli' }],
        },
      ],
    },

    bottom: {
      label: 'Experience',
      entries: [
        {
          id: 'acme-senior-frontend',
          title: 'Senior Frontend Developer',
          subtitle: 'Acme Commerce · 2021–present',
          description: 'Lead the checkout team’s frontend.',
          highlights: [
            'Cut largest contentful paint by 40% by migrating the storefront to React Server Components',
            'Built the shared component library now used by five teams',
            'Raised checkout conversion by 6% through a redesigned payment step',
            'Mentored four developers into mid-level and senior roles',
            'Brought the checkout flow to WCAG 2.1 AA',
          ],
          links: [{ label: 'Acme Commerce', url: 'https://example.com/acme' }],
        },
        {
          id: 'pixel-frontend',
          title: 'Frontend Developer',
          subtitle: 'Pixel & Co. agency · 2018–2021',
          description: 'Built marketing sites and dashboards in React and Vue.',
          highlights: [
            'Delivered projects for a dozen clients, from launch sites to analytics dashboards',
            'Introduced visual regression testing, catching layout bugs before every release',
          ],
          links: [],
        },
      ],
    },
  },

  skills: {
    Q: {
      name: 'React',
      level: 5,
      description: 'Six years of component architecture, from hooks-era SPAs to Server Components at scale.',
    },
    W: {
      name: 'TypeScript',
      level: 5,
      description: 'Types as design: modelling domains so that invalid states fail to compile.',
    },
    E: {
      name: 'Accessibility',
      level: 4,
      description: 'WCAG audits, ARIA patterns and screen-reader testing baked into every release.',
    },
    R: {
      name: 'Three.js',
      level: 2,
      description: 'Learning in public: this arena is hand-built scene graph, render loop and all.',
    },
  },

  contactLinks: [
    { label: 'GitHub', url: 'https://github.com/example' },
    { label: 'LinkedIn', url: 'https://www.linkedin.com/in/example' },
    { label: 'Email', url: 'mailto:hello@example.com' },
    { label: 'Resume PDF', url: '/resume.pdf' },
  ],
} satisfies ResumeData
