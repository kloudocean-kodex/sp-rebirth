export const SITE = {
  name: 'Sana Patel Real Estate',
  url: 'https://www.sanapatel.com.au/',
  phone: {
    display: '0416 977 990',
    e164: '+61416977990',
    schema: '+61 416 977 990',
  },
  email: 'sana@sanapatel.com.au',
  areaServed: 'Melbourne, Victoria, Australia',
  logo: 'https://www.sanapatel.com.au/wp-content/uploads/2025/07/Sana-Patel-Logo.webp',
  favicon: 'https://www.sanapatel.com.au/wp-content/uploads/2025/07/favicon.jpg',
  defaultOgImage: 'https://www.sanapatel.com.au/wp-content/uploads/2025/07/home-interior_413970226.webp',
  founder: {
    name: 'Sana Patel',
    profileUrl: 'https://www.sanapatel.com.au/about/',
    image: 'https://www.sanapatel.com.au/wp-content/uploads/2025/07/Sana-headshot.webp',
  },
  profiles: {
    business: ['https://www.realestate.com.au/agency/sana-patel-real-estate-KRFFJV'],
    founder: ['https://www.realestate.com.au/agent/sana-patel-3829096', 'https://au.linkedin.com/in/sana-p-726457138'],
  },
} as const;

/**
 * Search/retrieval crawlers used by the AI products the business has chosen to support.
 * These are deliberately separate from model-training crawler policy.
 */
export const AI_DISCOVERY_USER_AGENTS = ['OAI-SearchBot', 'Claude-SearchBot', 'Claude-User'] as const;

/**
 * Explicit production crawl surface. Keep this curated: adding a page here is an SEO decision,
 * not an automatic consequence of creating a route.
 */
export const INDEXED_PATHS = [
  '/',
  '/about/',
  '/lease/',
  '/for-renters/',
  '/sale/',
  '/contact/',
  '/rental-providers/',
  '/rental-appraisal/',
  '/switch-property-managers/',
  '/property-management-visibility-check/',
  '/rental-position-check/',
  '/resources/',
  '/resources/victoria-rental-minimum-standards/',
  '/resources/routine-inspections-victoria/',
  '/resources/changing-property-managers-victoria/',
  '/resources/forms-and-guidance/',
] as const;

export const INTERNAL_PATH_PREFIXES = ['/api/', '/preview/'] as const;
