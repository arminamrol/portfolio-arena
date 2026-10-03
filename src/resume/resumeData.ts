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
          body: 'Focused on human–computer interaction and computer graphics. Final-year project: a browser-based tool for sketching UI flows, built with Canvas and TypeScript.',
          links: [],
        },
        {
          id: 'web-accessibility-certificate',
          title: 'Web Accessibility Specialist',
          subtitle: 'Professional certificate · 2021',
          body: 'Covered WCAG 2.1, ARIA patterns, and testing with screen readers and keyboard-only navigation.',
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
          body: 'This site: an isometric arena game where every Tower is a resume entry. Built by hand to learn Three.js from the ground up.',
          links: [{ label: 'Source', url: 'https://github.com/example/portfolio-arena' }],
        },
        {
          id: 'tiny-charts',
          title: 'tiny-charts',
          subtitle: 'Open-source library · TypeScript · SVG',
          body: 'A dependency-free charting library under 5 kB gzipped, with accessible markup and keyboard-navigable data points.',
          links: [{ label: 'GitHub', url: 'https://github.com/example/tiny-charts' }],
        },
        {
          id: 'design-tokens-cli',
          title: 'Design Tokens CLI',
          subtitle: 'Node.js · Style Dictionary',
          body: 'Turns Figma design tokens into CSS variables, TypeScript constants and native theme files from one source of truth.',
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
          body: 'Lead the checkout team’s frontend. Migrated the storefront to React Server Components, cut largest contentful paint by 40%, and built the shared component library used by five teams.',
          links: [{ label: 'Acme Commerce', url: 'https://example.com/acme' }],
        },
        {
          id: 'pixel-frontend',
          title: 'Frontend Developer',
          subtitle: 'Pixel & Co. agency · 2018–2021',
          body: 'Built marketing sites and dashboards for a dozen clients in React and Vue, and introduced visual regression testing to the agency’s workflow.',
          links: [],
        },
      ],
    },
  },

  skills: {
    Q: { name: 'React', level: 5 },
    W: { name: 'TypeScript', level: 5 },
    E: { name: 'Accessibility', level: 4 },
    R: { name: 'Three.js', level: 2 },
  },

  contactLinks: [
    { label: 'GitHub', url: 'https://github.com/example' },
    { label: 'LinkedIn', url: 'https://www.linkedin.com/in/example' },
    { label: 'Email', url: 'mailto:hello@example.com' },
    { label: 'Resume PDF', url: '/resume.pdf' },
  ],
} satisfies ResumeData
