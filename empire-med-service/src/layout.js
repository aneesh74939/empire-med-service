import { site } from '../site.config.js';
import { services } from './content/services.js';
import { specialties } from './content/specialties.js';

export const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
export const isPh = (s) => /\[ADD /.test(String(s));
export const AUDIT = '/request-free-audit/';

const paths = {
  stethoscope: '<path d="M6 3H4v6a5 5 0 0 0 10 0V3h-2"/><path d="M9 14v2a5 5 0 0 0 10 0v-2"/><circle cx="19" cy="12" r="2"/>',
  tooth: '<path d="M12 3c-2.2 0-3.8 1.1-5.3 1.1C4 4.1 3 6.4 3 8.8c0 3.8 1.6 6.4 2.4 8.7.7 2 1.3 5.5 3.1 5.5 1.3 0 1.5-2.7 2.3-4.1.3-.6.7-.9 1.2-.9s.9.3 1.2.9c.8 1.4 1 4.1 2.3 4.1 1.8 0 2.4-3.5 3.1-5.5C19.4 15.2 21 12.6 21 8.8c0-2.4-1-4.7-3.7-4.7C15.8 4.1 14.2 3 12 3z"/>',
  hospital: '<rect x="4" y="3" width="16" height="18" rx="3"/><path d="M12 7v6M9 10h6M10 21v-4h4v4"/>',
  code: '<path d="M6 3h9l4 4v14H6z"/><path d="M14 3v5h5M10.5 12 8 14.5l2.5 2.5M14.5 12l2.5 2.5-2.5 2.5"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/>',
  badge: '<circle cx="12" cy="9" r="6"/><path d="m9.5 9 1.8 1.8L15 7.5M8.5 14l-1.5 7 5-2.5 5 2.5-1.500-7"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4M8.500 11h5M11 8.500v5"/>',
  cycle: '<path d="M20 11a8 8 0 0 0-14-4.500L4 9M4 4v5h5M4 13a8 8 0 0 0 14 4.500L20 15M20 20v-5h-5"/>',
  heart: '<path d="M12 20s-8-4.800-8-11a4.500 4.500 0 0 1 8-2.800A4.500 4.500 0 0 1 20 9c0 6.200-8 11-8 11z"/>',
  pulse: '<path d="M3 12h4l2.500-6 4 12 2.500-6h5"/>',
  drop: '<path d="M12 3s6.500 6.500 6.500 11a6.500 6.500 0 0 1-13 0C5.500 9.500 12 3 12 3z"/><path d="M9 14.500a3 3 0 0 0 3 3"/>',
  brain: '<path d="M9.500 4A3 3 0 0 0 6.500 7a3 3 0 0 0-2 5 3 3 0 0 0 2 5 3 3 0 0 0 5.500 1.500V5.500A2.500 2.500 0 0 0 9.500 4zM14.500 4a3 3 0 0 1 3 3 3 3 0 0 1 2 5 3 3 0 0 1-2 5 3 3 0 0 1-5.500 1.500"/>',
  ribbon: '<path d="M12 3a4 4 0 0 0-4 4c0 3 4 7 4 7s4-4 4-7a4 4 0 0 0-4-4z"/><path d="M9.500 11 6 20l3-1 1.500 2.500L14.500 11.500M14.500 11 18 20l-3-1-1.500 2.500"/>',
  scan: '<path d="M4 8V6a2 2 0 0 1 2-2h2M16 4h2a2 2 0 0 1 2 2v2M20 16v2a2 2 0 0 1-2 2h-2M8 20H6a2 2 0 0 1-2-2v-2"/><circle cx="12" cy="12" r="3.500"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="3"/><path d="m4 8 8 5.500L20 8"/>',
  phone: '<path d="M6.500 3.500h2.800l1.400 4-2 1.700a12 12 0 0 0 6.100 6.100l1.700-2 4 1.400v2.800a2 2 0 0 1-2.200 2A16.500 16.500 0 0 1 4.500 5.700a2 2 0 0 1 2-2.200z"/>',
  pin: '<path d="M12 21s-7-6.200-7-11.500a7 7 0 0 1 14 0C19 14.800 12 21 12 21z"/><circle cx="12" cy="9.500" r="2.500"/>',
  shield: '<path d="M12 3 5 6v5.500c0 4.400 3 7.700 7 9.500 4-1.800 7-5.100 7-9.500V6z"/><path d="m9 12 2.200 2.200L15.200 10"/>',
  check: '<circle cx="12" cy="12" r="9"/><path d="m8 12.500 2.800 2.800L16 9.500"/>',
  doc: '<path d="M7 3h7l4 4v14H7z"/><path d="M14 3v5h4M10 13h5M10 17h5"/>',
  chart: '<path d="M4 4v16h16"/><path d="m8 15 3.500-4 3 2.500L19 8"/>',
  users: '<circle cx="9" cy="8" r="3.500"/><path d="M3 20c0-3.500 2.500-6 6-6s6 2.500 6 6M16 4.800a3.500 3.500 0 0 1 0 6.400M18 14.500c2 .8 3 2.800 3 5.500"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4.500 21c0-4.200 3.300-7 7.500-7s7.500 2.800 7.500 7"/>',
  calendar: '<rect x="4" y="5" width="16" height="16" rx="3"/><path d="M4 10h16M8 3v4M16 3v4"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  close: '<path d="m6 6 12 12M18 6 6 18"/>',
};
export const icon = (name, cls = '') => `<svg ${cls ? `class="${cls}" ` : ''}viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.800" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${paths[name] || ''}</svg>`;
const fb = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false"><path d="M14 8.500V6.800c0-.8.500-1 1-1h2V2.500h-2.800C11 2.500 10 4.500 10 6.500v2H7.500V12H10v9.500h4V12h2.700l.4-3.500z"/></svg>';
const ig = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.900" aria-hidden="true" focusable="false"><rect x="3.500" y="3.500" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17" cy="7" r=".9" fill="currentColor"/></svg>';
const li = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false"><path d="M5.2 3.5a1.7 1.7 0 1 0 0 3.4 1.7 1.7 0 0 0 0-3.4ZM3.7 8.3h3v12h-3zM9 8.3h2.9v1.6h.1c.4-.8 1.5-2 3.5-2 3.7 0 4.4 2.4 4.4 5.5v6.9h-3v-6.1c0-1.5 0-3.4-2.1-3.4s-2.5 1.6-2.5 3.3v6.2h-3z"/></svg>';

export const trustBadges = ['HIPAA compliant', 'No setup fees', 'All 50 states'];
export const badgeList = (items = trustBadges) => `<ul class="badges">${items.map((b) => `<li>${icon('shield')}${esc(b)}</li>`).join('')}</ul>`;

const NAV = [['Services', '/services/'], ['Specialties', '/specialties/'], ['Meet The Team', '/team/'], ['Contact', '/contact/'], ['About', '/about/']];
const contactCtaPaths = new Set(['/', '/services/', '/specialties/', '/team/', '/contact/', '/about/', '/terms-of-service/', '/request-free-audit/', '/faq/']);
const ctaLink = (path, cls = 'btn') => contactCtaPaths.has(path) || path.startsWith('/services/') || path.startsWith('/specialties/')
  ? `<a class="${cls}" href="/contact/">Contact Us</a>`
  : `<a class="${cls}" href="${AUDIT}">Get a Free Assessment</a>`;

const header = (path) => `<header class="site-header"><div class="wrap head-in">
<a class="brand" href="/" aria-label="Empire Med Service home"><img src="/logo/logo.png" alt="Empire Med Service" width="480" height="179"></a>
<button class="nav-toggle" type="button" aria-expanded="false" aria-controls="site-menu" aria-label="Open menu">${icon('menu', 'i-open')}${icon('close', 'i-close')}</button>
<nav id="site-menu" aria-label="Main">
<ul class="nav-links">${NAV.map(([l, h]) => `<li><a href="${h}"${path.startsWith(h) ? ' aria-current="page"' : ''}>${l}</a></li>`).join('')}</ul>
${ctaLink(path, 'btn head-cta')}
</nav></div></header>`;

const column = (title, links) => `<div><h2>${title}</h2><ul>${links.map(([l, h]) => `<li><a href="${h}">${esc(l)}</a></li>`).join('')}</ul></div>`;

const footer = (path) => `<footer class="site-footer on-dark"><div class="wrap">
<div class="foot-top">
<div><img class="foot-logo" src="/logo/logo-white.png" alt="Empire Med Service" width="480" height="179" loading="lazy"><p class="foot-tag">Medical billing and revenue cycle management for U.S. practices and hospitals.</p>${badgeList()}</div>
<div class="foot-cta"><h2>Ready to recover more revenue?</h2>${ctaLink(path)}
<ul class="foot-contact"><li><a href="tel:${site.phoneTel}">${icon('phone')}${esc(site.phoneDisplay)}</a></li><li><a href="mailto:${site.email}">${icon('mail')}${esc(site.email)}</a></li></ul>
<div class="social"><a href="${esc(site.facebook)}" target="_blank" rel="noopener noreferrer" aria-label="Empire Med Service on Facebook (opens in a new tab)">${fb}</a><a href="${esc(site.instagram)}" target="_blank" rel="noopener noreferrer" aria-label="Empire Med Service on Instagram (opens in a new tab)">${ig}</a><a href="${esc(site.linkedin)}" target="_blank" rel="noopener noreferrer" aria-label="Empire Med Service on LinkedIn (opens in a new tab)">${li}</a></div></div>
</div>
<div class="foot-cols">
${column('Services', services.map((s) => [s.name, `/services/${s.slug}/`]))}
${column('Specialties', specialties.map((s) => [s.name, `/specialties/${s.slug}/`]))}
${column('Company', [['About Us', '/about/'], ['Team', '/team/'], ['Contact Us', '/contact/'], ['Free Assessment', AUDIT], ['FAQ', '/faq/']])}
</div>
<div class="foot-base"><span>© 2024 Empire Med Service. All rights reserved.</span><ul><li><a href="/privacy-policy/">Privacy Policy</a></li><li><a href="/terms-of-service/">Terms of Service</a></li></ul></div>
</div></footer>`;

const actionBar = () => `<nav class="action-bar" aria-label="Quick actions"><a href="mailto:${site.email}">${icon('mail')}Email Us</a><a href="tel:${site.phoneTel}">${icon('phone')}Call Now</a><a class="primary" href="${AUDIT}">${icon('doc')}Free Audit</a></nav>`;

export function orgSchema() {
  const o = {
    '@context': 'https://schema.org', '@type': 'Organization', '@id': `${site.url}/#org`,
    name: site.name, url: `${site.url}/`, description: site.description, email: site.email, telephone: site.phoneTel,
    logo: `${site.url}/logo/logo.png`, image: `${site.url}/images/og-image.jpg`, areaServed: { '@type': 'Country', name: 'United States' },
    sameAs: [site.facebook, site.instagram, site.linkedin],
  };
  return o;
}

const jsonLd = (obj) => `<script type="application/ld+json">${JSON.stringify(obj).replace(/</g, '\\u003c')}</script>`;

export function page({ path, title, description, body, schema = [], noindex = false, ogType = 'website' }) {
  if (isPh(title) || isPh(description)) throw new Error(`Placeholder in metadata for ${path}`);
  const url = site.url + path;
  const fullTitle = path === '/' ? title : `${title} | ${site.name}`;
  const og = `${site.url}/images/og-image.jpg`;
  return `<!doctype html>
<html lang="en-US">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(fullTitle)}</title>
<meta name="description" content="${esc(description)}">
${noindex ? '<meta name="robots" content="noindex">\n' : ''}<link rel="canonical" href="${url}">
<meta property="og:type" content="${ogType}">
<meta property="og:site_name" content="${site.name}">
<meta property="og:title" content="${esc(fullTitle)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${og}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="Empire Med Service: medical billing and revenue cycle management">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(fullTitle)}">
<meta name="twitter:description" content="${esc(description)}">
<meta name="twitter:image" content="${og}">
<meta name="theme-color" content="#254C9C">
<link rel="icon" href="/images/favicon-32.png" sizes="32x32" type="image/png">
<link rel="apple-touch-icon" href="/images/apple-touch-icon.png">
<link rel="preload" href="/fonts/poppins-700.woff" as="font" type="font/woff" crossorigin>
<link rel="preload" href="/fonts/inter-400.woff" as="font" type="font/woff" crossorigin>
<link rel="stylesheet" href="/css/site.css">
${[orgSchema(), ...schema].map(jsonLd).join('\n')}
<script src="/js/site.js" defer></script>
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
${header(path)}
<main id="main" tabindex="-1">
${body}
</main>
${footer(path)}
${actionBar()}
</body>
</html>
`;
}

// Text-only: wraps [ADD ...] in a highlight, never touching tags, attributes, scripts or the head.
export function markPlaceholders(html) {
  const i = html.indexOf('<body>');
  const head = html.slice(0, i); const rest = html.slice(i);
  return head + rest.split(/(<[^>]+>)/).map((part) => (part.startsWith('<') ? part : part.replace(/\[(?:ADD|CONFIRM) [^\]]*\]/g, (m) => `<mark class="ph">${m}</mark>`))).join('');
}

export const pageHero = ({ crumbs = [], eyebrow, h1, lede, extra = '' }) => `<section class="page-hero on-dark"><div class="wrap">
${crumbs.length ? `<nav class="crumbs" aria-label="Breadcrumb"><ol><li><a href="/">Home</a></li>${crumbs.map(([l, h]) => `<li>${h ? `<a href="${h}">${esc(l)}</a>` : `<span aria-current="page">${esc(l)}</span>`}</li>`).join('')}</ol></nav>` : ''}
${eyebrow ? `<p class="eyebrow">${esc(eyebrow)}</p>` : ''}
<h1>${esc(h1)}</h1>
${lede ? `<p class="lede">${esc(lede)}</p>` : ''}${extra}
</div></section>`;

export const ctaBand = (h = 'See where your revenue is getting stuck', p = 'Share a few details about your practice. We will review them and call you within one business day.', contact = false) => `<section class="cta-wrap"><div class="wrap"><div class="cta-band on-dark"><div><h2>${esc(h)}</h2><p>${esc(p)}</p></div><div class="btn-row">${contact ? '<a class="btn" href="/contact/">Contact Us</a>' : `<a class="btn" href="${AUDIT}">Get a Free Assessment</a>`}<a class="btn btn--line" href="tel:${site.phoneTel}">${icon('phone')}Call ${esc(site.phoneDisplay)}</a></div></div></div></section>`;

export const faqList = (items, center = false) => `<div class="faq${center ? ' center' : ''}">${items.map(([q, a]) => `<details><summary>${esc(q)}</summary><div class="a"><p>${esc(a)}</p></div></details>`).join('')}</div>`;

export const faqSchema = (items) => {
  const real = items.filter(([, a]) => !isPh(a));
  return real.length ? [{ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: real.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) }] : [];
};

export const crumbSchema = (crumbs) => [{ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [['Home', '/'], ...crumbs].map(([name, p], i) => ({ '@type': 'ListItem', position: i + 1, name, ...(p ? { item: site.url + p } : {}) })) }];
