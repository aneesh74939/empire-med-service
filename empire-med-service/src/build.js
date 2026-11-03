// Zero-dependency static site build: node src/build.js writes the finished site to dist/.
import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { site } from '../site.config.js';
import { AUDIT, badgeList, crumbSchema, ctaBand, esc, faqList, faqSchema, icon, isPh, markPlaceholders, page, pageHero } from './layout.js';
import { services } from './content/services.js';
import { specialties } from './content/specialties.js';
import { allFaqs, googleReviews, homeFaqs, process, whyUs } from './content/misc.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');
const pages = [];
const add = (opts) => pages.push(opts);
const tel = `tel:${site.phoneTel}`;
const mail = `mailto:${site.email}`;
const svc = (slug) => services.find((s) => s.slug === slug);

// Shared pieces
const steps = (items) => `<ol class="steps">${items.map(([t, d]) => `<li><h3>${esc(t)}</h3><p>${esc(d)}</p></li>`).join('')}</ol>`;
const secHead = (h, lede, center) => `<div class="sec-head${center ? ' center' : ''}"><h2 class="bar">${esc(h)}</h2>${lede ? `<p class="lede">${esc(lede)}</p>` : ''}</div>`;
const linkCard = ({ href, ic, title, text, more }) => `<article class="card card--link reveal">${ic ? `<span class="ico">${icon(ic)}</span>` : ''}<h3><a href="${href}">${esc(title)}</a></h3><p>${esc(text)}</p>${more ? `<span class="more">${esc(more)}</span>` : ''}</article>`;
const serviceCards = (list = services) => `<div class="grid g3">${list.map((s) => linkCard({ href: `/services/${s.slug}/`, ic: s.icon, title: s.name, text: s.short, more: `About ${s.name}` })).join('')}</div>`;
const specGrid = () => `<div class="spec-grid">${specialties.map((s) => `<a class="spec" href="/specialties/${s.slug}/"><span class="ico">${icon(s.icon)}</span>${esc(s.name)}</a>`).join('')}</div>`;

// Field helper. Error box id is tied to the field for screen readers.
function field({ form, name, label, type = 'text', required, full, auto, options, hint }) {
  const id = `${form}-${name}`;
  const attrs = `id="${id}" name="${name}" data-label="${esc(label.toLowerCase())}"${required ? ' required' : ''}${auto ? ` autocomplete="${auto}"` : ''} aria-describedby="${id}-err"`;
  let control;
  if (options) control = `<select ${attrs}><option value="">Select one</option>${options.map((o) => `<option>${esc(o)}</option>`).join('')}</select>`;
  else if (type === 'textarea') control = `<textarea ${attrs} rows="5" maxlength="3000"></textarea>`;
  else control = `<input ${attrs} type="${type}">`;
  return `<div class="field${full ? ' f-full' : ''}"><label for="${id}">${esc(label)}${required ? '<span class="req" aria-hidden="true">*</span>' : ` <span class="opt">(optional)</span>`}</label>${control}<span class="field-error" id="${id}-err" data-error-for="${name}" hidden></span></div>`;
}
const phiNote = '<p class="note phi-note"><strong>Please do not include patient information.</strong> This form is for business enquiries only, so leave out patient names, dates of birth, member IDs and any other health details.</p>';
const honeypot = '<div class="hp" aria-hidden="true"><label for="company_website">Leave this field empty</label><input id="company_website" type="text" name="company_website" tabindex="-1" autocomplete="off"></div>';
const formTag = (type, success) => `<form action="/api/contact" method="post" data-ajax data-success="${esc(success)}"><input type="hidden" name="form_type" value="${type}">${honeypot}`;
const statusBox = '<div class="form-status" tabindex="-1" hidden></div>';

// HOME
const claimStages = [
  ['Eligibility', 'Coverage checked before the visit'],
  ['Coding', 'Codes that match the chart'],
  ['Submission', 'Errors scrubbed out before it goes'],
  ['Follow-up', 'Denials worked before deadlines pass'],
  ['Payment', 'Posted and checked against what was owed'],
];
add({
  path: '/',
  title: 'Empire Med Service | Medical Billing & Revenue Cycle Management',
  description: 'Medical billing, coding, AR follow-up and credentialing for U.S. practices and hospitals. HIPAA compliant, with no setup fees, in all 50 states.',
  schema: faqSchema(homeFaqs),
  body: `<section class="hero on-dark"><div class="wrap hero-grid"><div>
<h1>Get paid for the care you already deliver.</h1>
<p class="hero-sub">Empire Med Service handles billing, coding, follow-up and credentialing for U.S. practices and hospitals, so fewer claims stall between the visit and the deposit.</p>
<div class="btn-row"><a class="btn" href="/contact/">Contact Us</a><a class="btn btn--line" href="${tel}">${icon('phone')}Call ${esc(site.phoneDisplay)}</a></div>
${badgeList()}
</div>
<div class="claim-path"><h2>The path of a clean claim</h2><div class="claim-track"><ol>${claimStages.map(([a, b], i) => `<li>${i === claimStages.length - 1 ? '<span class="traveller" aria-hidden="true"></span>' : ''}<strong>${a}</strong><span>${b}</span></li>`).join('')}</ol></div></div>
</div></section>
<section class="section"><div class="wrap">${secHead('Billing support at every stage', 'Use one service to solve a specific problem, or hand us the whole cycle.')}${serviceCards()}<p class="mt"><a class="btn btn--ghost" href="/services/">See all services</a></p></div></section>
<section class="section section--tint"><div class="wrap">${secHead('Built around how your specialty gets paid', 'Payer rules, codes and common denials differ from one specialty to the next.')}${specGrid()}<p class="mt"><a href="/specialties/">See how we work with each specialty</a></p></div></section>
<section class="section"><div class="wrap">${secHead('Why practices choose Empire Med Service')}<div class="why-grid">${whyUs.map(([ic, t, d]) => `<div class="why reveal"><span class="ico">${icon(ic)}</span><div><h3>${esc(t)}</h3><p>${esc(d)}</p></div></div>`).join('')}</div></div></section>
<section class="section section--tint"><div class="wrap">${secHead('Getting started takes three steps')}${steps(process)}</div></section>
<section class="section"><div class="wrap">${secHead('What our clients say', 'Reviews shared on Google.')}<div class="google-review-summary"><strong class="google-review-rating">5.0</strong><span class="google-review-stars" aria-label="5 out of 5 stars">★★★★★</span></div><div class="grid g2">${googleReviews.map(({ name, text }) => `<figure class="card quote google-review"><span class="google-review-stars" aria-label="5 out of 5 stars">★★★★★</span><blockquote>“${esc(text)}”</blockquote><figcaption><strong>${esc(name)}</strong><span>Google review</span></figcaption></figure>`).join('')}</div><p class="mt"><a class="btn btn--ghost" href="${esc(site.googleReviewsUrl)}" target="_blank" rel="noopener noreferrer">See reviews on Google</a></p></div></section>
<section class="section section--tint"><div class="wrap">${secHead('Common questions')}${faqList(homeFaqs)}<p class="mt"><a href="/faq/">Read all FAQs</a></p></div></section>
<section class="section"><div class="wrap"><div class="cta-band on-dark"><div><h2>See where your revenue is getting stuck</h2><p>Share a few details about your practice. We will review them and call you within one business day.</p></div><div class="btn-row"><a class="btn" href="/contact/">Contact Us</a><a class="btn btn--line" href="${tel}">${icon('phone')}Call now</a></div></div></div></section>`,
});

// SERVICES
add({
  path: '/services/', title: 'Medical Billing and RCM Services',
  description: 'Physician and hospital billing, medical coding, AR management, credentialing, coverage discovery and full revenue cycle management.',
  schema: crumbSchema([['Services']]),
  body: `${pageHero({ crumbs: [['Services']], h1: 'Medical billing and revenue cycle services', lede: 'Each service can stand alone or work with the others, so you only hand over what you need.' })}
<section class="section"><div class="wrap">${serviceCards()}</div></section>
<section class="section section--tint"><div class="wrap">${secHead('Not sure where to start?', 'Most providers come to us with a symptom rather than a service name.')}<div class="grid g3">
${[['Too many denials', 'Coding and billing review usually comes first, so the causes are fixed before the next claims go out.', 'medical-coding', 'Medical Coding'], ['Old claims keep piling up', 'A focused AR project can sort and work your older balances without changing your daily billing.', 'ar-management', 'AR Management'], ['New provider joining', 'Starting enrollment early helps you avoid a gap between a start date and billable visits.', 'credentialing', 'Credentialing']].map(([t, d, s, n]) => linkCard({ href: `/services/${s}/`, title: t, text: d, more: `Go to ${n}` })).join('')}
</div></div></section>${ctaBand(undefined, undefined, true).replace('cta-wrap', 'cta-wrap section-top')}`,
});
for (const s of services) {
  const showServiceCta = !['healthcare-rcm', 'medical-coding'].includes(s.slug);
  add({
    path: `/services/${s.slug}/`, title: s.title, description: s.meta,
    schema: [...crumbSchema([['Services', '/services/'], [s.name]]), { '@context': 'https://schema.org', '@type': 'Service', name: s.title, description: s.meta, serviceType: s.name, provider: { '@id': `${site.url}/#org` }, areaServed: { '@type': 'Country', name: 'United States' } }],
    body: `${pageHero({ crumbs: [['Services', '/services/'], [s.name]], h1: s.title, lede: s.intro, extra: `<div class="btn-row"><a class="btn" href="/contact/">Contact Us</a><a class="btn btn--line" href="${tel}">${icon('phone')}Call us</a></div>` })}
<section class="section"><div class="wrap split"><div><h2 class="bar">${esc(s.leakHeading)}</h2><div class="leaks mt">${s.leaks.map(([t, d]) => `<div><h3>${esc(t)}</h3><p>${esc(d)}</p></div>`).join('')}</div></div>
<div class="card"><h2>What is included</h2><ul class="ticks mt">${s.includes.map((i) => `<li>${esc(i)}</li>`).join('')}</ul><p class="small muted mt">Scope is confirmed for each client during the assessment.</p></div></div></section>
<section class="section section--tint"><div class="wrap">${secHead('How we work')}${steps(s.steps)}</div></section>
${showServiceCta ? ctaBand(`Talk to us about ${s.name}`, undefined, true) : ''}`,
  });
}

// SPECIALTIES
add({
  path: '/specialties/', title: 'Medical Billing by Specialty',
  description: 'Specialty-focused billing and coding for primary care, cardiology, dermatology, mental health, oncology and radiology practices.',
  schema: crumbSchema([['Specialties']]),
  body: `${pageHero({ crumbs: [['Specialties']], h1: 'Billing that fits your specialty', lede: 'A therapist and an oncology group face very different billing problems. We start from the rules and denials common in your field.' })}
<section class="section"><div class="wrap"><div class="grid g3">${specialties.map((s) => linkCard({ href: `/specialties/${s.slug}/`, ic: s.icon, title: s.name, text: s.short, more: `Billing for ${s.name.toLowerCase()}` })).join('')}</div>
<p class="note mt">Don't see your specialty? <a href="/contact/">Tell us about your practice</a> and we will let you know whether we can help.</p></div></section>${ctaBand(undefined, undefined, true)}`,
});
for (const s of specialties) {
  const list = s.services.map(svc);
  add({
    path: `/specialties/${s.slug}/`, title: `${s.name} Billing Services`, description: s.meta,
    schema: crumbSchema([['Specialties', '/specialties/'], [s.name]]),
    body: `${pageHero({ crumbs: [['Specialties', '/specialties/'], [s.name]], h1: `${s.name} billing and coding`, lede: s.intro, extra: `<div class="btn-row"><a class="btn" href="/contact/">Contact Us</a><a class="btn btn--line" href="${tel}">${icon('phone')}Call us</a></div>` })}
<section class="section"><div class="wrap">${secHead(`Billing challenges in ${s.name.toLowerCase()}`)}<div class="grid g2">${s.challenges.map(([t, d]) => `<div class="card reveal"><h3>${esc(t)}</h3><p>${esc(d)}</p></div>`).join('')}</div></div></section>
<section class="section section--tint"><div class="wrap split"><div><h2 class="bar">Codes we commonly review</h2><p class="muted mt">These are examples, not a full list. Coverage and coding rules vary by payer, so each claim is checked against the current rules and your documentation.</p></div><ul class="ticks">${s.codes.map((c) => `<li>${esc(c)}</li>`).join('')}</ul></div></section>
<section class="section"><div class="wrap">${secHead('Services that often help')}${serviceCards(list)}</div></section>
${ctaBand(`Get a second look at your ${s.name.toLowerCase()} billing`, undefined, true)}`,
  });
}

// ABOUT and TEAM
add({
  path: '/about/', title: 'About Us',
  description: 'Empire Med Service is a U.S. medical billing and revenue cycle management company supporting practices and hospitals in all 50 states.',
  schema: crumbSchema([['About']]),
  body: `${pageHero({ crumbs: [['About']], h1: 'About Empire Med Service', lede: 'We take on the billing work that pulls healthcare teams away from patients, and we explain it clearly along the way.' })}
<section class="section"><div class="wrap split"><div><h2 class="bar">Why we do this work</h2><div class="mt"><p>Providers should not have to become payer-rule experts to be paid fairly for the care they deliver. Yet a small error at the front desk or a missed deadline in follow-up can cost a practice real money.</p><p>We work through those details for you, then report back in plain language so you always know where your revenue stands.</p><h2 class="bar mt">Our Story</h2><div class="mt"><p>Founded in 2024 by Anooj Madhusoodanan, Empire Med Service was established with a vision to simplify healthcare operations and help medical practices achieve financial stability through reliable, efficient, and affordable Revenue Cycle Management (RCM) solutions.</p></div></div></div>
<img class="icon-artwork" src="/images/icon-colour.jpg" alt="Empire Med Service icon" width="900" height="900" loading="lazy" decoding="async"></div></section>
<section class="section section--tint"><div class="wrap">${secHead('How we work')}<div class="why-grid">${whyUs.slice(0, 4).map(([ic, t, d]) => `<div class="why"><span class="ico">${icon(ic)}</span><div><h3>${esc(t)}</h3><p>${esc(d)}</p></div></div>`).join('')}</div></div></section>
${ctaBand(undefined, undefined, true)}`,
});
add({
  path: '/team/', title: 'Our Team',
  description: 'Meet the Empire Med Service team behind our medical billing, coding, credentialing and accounts receivable work.',
  schema: crumbSchema([['About', '/about/'], ['Team']]),
  body: `${pageHero({ crumbs: [['About', '/about/'], ['Team']], h1: 'Meet the team', lede: 'The people who look after your claims and answer your questions.' })}
<section class="section"><div class="wrap"><div class="grid g2"><article class="card person"><img class="team-photo" src="/images/anooj_photo.jpeg" alt="Anooj Madhusoodanan, Founder" width="1155" height="1253" loading="lazy" decoding="async"><h2>Anooj Madhusoodanan</h2><p>Founder</p></article><article class="card person"><img class="team-photo" src="/images/jagadeesh_photo.jpeg" alt="Jagatheswaran, Operations Manager" width="1103" height="1426" loading="lazy" decoding="async"><h2>Jagatheswaran</h2><p>Operations Manager</p></article></div></div></section>${ctaBand('Work with our team', undefined, true)}`,
});

// FAQ
add({
  path: '/faq/', title: 'Frequently Asked Questions',
  description: 'Answers about Empire Med Service: how to get started, contracts and fees, patient data, and working with our billing team.',
  schema: [...crumbSchema([['FAQ']]), ...faqSchema(allFaqs.flatMap((g) => g.items))],
  body: `${pageHero({ crumbs: [['FAQ']], h1: 'Frequently asked questions', lede: 'What practice owners and administrators usually ask us first.' })}
<section class="section"><div class="wrap">${allFaqs.map((g) => `<div class="faq-group"><h2>${esc(g.group)}</h2>${faqList(g.items)}</div>`).join('')}</div></section>${ctaBand('Still have a question?', 'Ask us directly. We review every message and reply within one business day.', true)}`,
});

// FREE AUDIT
const auditSpecialties = [...specialties.map((s) => s.name), 'Hospital or health system', 'Other'];
const f = (o) => field({ form: 'audit', ...o });
add({
  path: AUDIT, title: 'Request a Free Audit',
  description: 'Request a free billing assessment from Empire Med Service. Tell us about your practice and we will call you within one business day.',
  schema: crumbSchema([['Request Free Audit']]),
  body: `${pageHero({ crumbs: [['Request Free Audit']], h1: 'Request your free audit', lede: 'Tell us about your practice and your billing challenges. There is no setup fee and no long-term contract.', extra: badgeList() })}
<section class="section"><div class="wrap split"><div class="form-card"><h2>Tell us about your practice</h2><p class="muted small">Fields marked with * are required.</p>
${formTag('audit', 'Thanks. Your request has been sent, and we will call you within one business day.')}
<div class="form-grid">
${f({ name: 'name', label: 'Name', required: true, auto: 'name' })}${f({ name: 'practice', label: 'Practice name', required: true, auto: 'organization' })}
${f({ name: 'email', label: 'Email', type: 'email', required: true, auto: 'email' })}${f({ name: 'phone', label: 'Phone', type: 'tel', required: true, auto: 'tel' })}
${f({ name: 'specialty', label: 'Specialty', required: true, options: auditSpecialties })}${f({ name: 'volume', label: 'Monthly claim volume', required: true, options: ['Under 500', '500–1,000', '1,001–5,000', '5,001–10,000', 'Over 10,000', 'Not sure'] })}
${f({ name: 'message', label: 'Message', type: 'textarea', full: true })}
</div>${phiNote}<div class="form-foot"><button class="btn" type="submit"><span class="btn-label">Request My Free Audit</span></button></div>${statusBox}</form></div>
<div><h2 class="bar">What happens next</h2><div class="mt">${steps(process.slice(1)).replace('class="steps"', 'class="steps steps--stack"')}</div><p class="mt muted">Prefer to talk? Call <a href="${tel}">${esc(site.phoneDisplay)}</a> or email <a href="${mail}">${esc(site.email)}</a>.</p></div></div></section>`,
});

// CONTACT
const c = (o) => field({ form: 'contact', ...o });
add({
  path: '/contact/', title: 'Contact Us',
  description: 'Contact Empire Med Service by phone, email or online form. Tell us about your billing challenges and we will call within one business day.',
  schema: crumbSchema([['Contact']]),
  body: `${pageHero({ crumbs: [['Contact']], eyebrow: 'Get In Touch', h1: 'Contact Empire Med Service', lede: 'Have a question about billing, coding or credentialing? Reach out and a member of our team will get back to you.', extra: `<div class="btn-row"><a class="btn" href="#contact-form">Contact Us</a><a class="phone-link" href="${tel}">${icon('phone')}${esc(site.phoneDisplay)}</a></div>${badgeList()}` })}
<section class="section"><div class="wrap split"><div><h2 class="bar">Send a Message</h2><p class="mt">Tell us a little about your practice and what you need. You do not need to have the details worked out, and there is no obligation to go further.</p>
<ul class="contact-list"><li><span class="ico">${icon('mail')}</span><a href="${mail}">${esc(site.email)}</a></li><li><span class="ico">${icon('phone')}</span><a href="${tel}">${esc(site.phoneDisplay)}</a></li></ul>
<div class="media"><img src="/images/icon-colour.jpg" alt="Empire Med Service icon" width="900" height="900" loading="lazy" decoding="async"><span class="badge-float">${icon('check')}No setup fees</span></div></div>
<div class="form-card" id="contact-form"><h2>Send us a message</h2><p class="muted small">Fields marked with * are required.</p>
${formTag('contact', 'Thanks. Your message has been sent, and we will reply within one business day.')}
<div class="form-grid">${c({ name: 'name', label: 'Name', required: true, auto: 'name', full: true })}${c({ name: 'email', label: 'Email', type: 'email', required: true, auto: 'email' })}${c({ name: 'phone', label: 'Phone', type: 'tel', auto: 'tel' })}${c({ name: 'message', label: 'Message', type: 'textarea', required: true, full: true })}</div>
${phiNote}<div class="form-foot"><button class="btn" type="submit"><span class="btn-label">Send</span></button><p class="small muted">HIPAA-compliant · No setup fee · No long-term contract</p></div>${statusBox}</form></div></div></section>
<section class="section section--tint"><div class="wrap"><div class="grid g3">
<div class="card info-card"><span class="ico">${icon('mail')}</span><h2 class="h3like">Email</h2><p><a href="${mail}">${esc(site.email)}</a></p><p class="small muted">We reply within one business day.</p></div>
<div class="card info-card"><span class="ico">${icon('phone')}</span><h2 class="h3like">Phone</h2><p><a href="${tel}">${esc(site.phoneDisplay)}</a></p></div>
</div></div></section>
<section class="section"><div class="wrap">${secHead('After you reach out')}${steps([['We review your details', 'We read your message and look at what you have told us about your practice.'], ['We call within one business day', 'We talk through your billing setup and answer your questions.'], ['We send a written summary', 'You receive a recap of the conversation and our suggested next steps.']])}</div></section>
`,
});

// LEGAL
add({
  path: '/privacy-policy/', title: 'Privacy Policy',
  description: 'How Empire Med Service handles information submitted through this website.',
  schema: crumbSchema([['Privacy Policy']]),
  body: `${pageHero({ crumbs: [['Privacy Policy']], h1: 'Privacy Policy' })}
<section class="section"><div class="wrap prose">
<h2>Who we are</h2><p>This website is operated by Empire Med Service. You can contact us at <a href="${mail}">${esc(site.email)}</a>.</p>
<h2>Information we collect</h2><p>When you use our forms, we collect what you enter, such as your name, practice name, email address, phone number, specialty, claim volume and message. Our hosting provider may process standard technical data such as IP addresses to deliver and protect the site.</p>
<h2>Please do not send patient information</h2><p>Our website forms are not intended for protected health information. Do not submit patient names, dates of birth, member IDs or health details through this site.</p>
<h2>How we use information</h2><p>We use your details to respond to your enquiry, prepare any assessment you request, and run our business.</p>
<h2>Who we share it with</h2><p>We use service providers to host this website and deliver form messages by email. We do not sell your information.</p>
<h2>Changes</h2><p>We may update this policy and will post the new version here.</p></div></section>`,
});
add({
  path: '/terms-of-service/', title: 'Terms of Service',
  description: 'The terms that apply to your use of the Empire Med Service website.',
  schema: crumbSchema([['Terms of Service']]),
  body: `${pageHero({ crumbs: [['Terms of Service']], h1: 'Terms of Service' })}
<section class="section"><div class="wrap prose">
<h2>Using this website</h2><p>This website is operated by Empire Med Service. By using it, you agree to these terms.</p>
<h2>Information only</h2><p>Content on this site is general information. It is not legal, medical, coding or financial advice, and payer rules change and vary.</p>
<h2>No client relationship</h2><p>Using this site or sending a form does not create a client relationship. Services are provided only under a separate written agreement.</p>
<h2>No results promised</h2><p>Any examples on this site do not guarantee a particular outcome for your practice.</p>
<h2>Website content</h2><p>Site content belongs to Empire Med Service or its licensors, and may not be copied for commercial use without permission.</p></div></section>`,
});

// THANKS (no-JS form fallback) and 404
add({
  path: '/thanks/', title: 'Message Sent', noindex: true,
  description: 'Your message has been sent to Empire Med Service.',
  body: `${pageHero({ h1: 'Your message has been sent', lede: 'We will reply within one business day.', extra: '<div class="btn-row"><a class="btn" href="/">Back to home</a></div>' })}<div class="section"></div>`,
});
add({
  path: '/404.html', title: 'Page Not Found', noindex: true,
  description: 'The page you were looking for could not be found.',
  body: `${pageHero({ h1: 'We could not find that page', lede: 'The link may be out of date, or the address may have a typo.', extra: '<div class="btn-row"><a class="btn" href="/">Go to home</a><a class="btn btn--line" href="/contact/">Contact us</a></div>' })}<div class="section"></div>`,
});

// WRITE OUTPUT
rmSync(dist, { recursive: true, force: true });
cpSync(join(root, 'public'), dist, { recursive: true });
const tokens = new Map();
for (const p of pages) {
  const html = markPlaceholders(page(p));
  const file = p.path.endsWith('.html') ? join(dist, p.path) : join(dist, p.path, 'index.html');
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, html);
  for (const m of html.slice(html.indexOf('<body>')).matchAll(/\[(?:ADD|CONFIRM) [^\]]*\]/g)) {
    if (!tokens.has(m[0])) tokens.set(m[0], new Set());
    tokens.get(m[0]).add(p.path);
  }
}
const indexable = pages.filter((p) => !p.noindex);
const today = new Date().toISOString().slice(0, 10);
writeFileSync(join(dist, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${indexable.map((p) => `  <url><loc>${site.url}${p.path}</loc><lastmod>${today}</lastmod></url>`).join('\n')}\n</urlset>\n`);
writeFileSync(join(dist, 'robots.txt'), `User-agent: *\nAllow: /\nDisallow: /api/\n\nSitemap: ${site.url}/sitemap.xml\n`);

// PLACEHOLDERS.md is regenerated on every build, so it always reflects what is left to do.
const where = (t) => {
  if (/TESTIMONIAL|CLIENT NAME, ROLE/.test(t)) return '`src/build.js` (Home)';
  return 'Search for this text in `src/`';
};
const rows = [...tokens.entries()].sort((a, b) => b[1].size - a[1].size).map(([t, set]) => {
  const list = [...set];
  const shown = list.length > 4 ? `All ${list.length} pages` === `All ${pages.length} pages` ? `Every page (${list.length})` : `${list.length} pages, incl. ${list.slice(0, 3).join(', ')}` : list.join(', ');
  return `| ${t.replace(/\|/g, '\\|')} | ${where(t)} | ${shown} |`;
});
writeFileSync(join(root, 'PLACEHOLDERS.md'), `# Placeholders to replace

Generated by \`npm run build\`, so re-run the build to see what is left. In the browser, unfinished text appears in yellow.

## Text placeholders (${tokens.size} distinct items)

| Placeholder | Where to edit | Used on |
| --- | --- | --- |
${rows.join('\n')}

## Files to replace

| File | What it is now | What it needs |
| --- | --- | --- |
| Team page avatars | Generic icon | Real team photos, if wanted |

The logo, icon, favicons, social preview image and brand artwork are all in place. To replace them, see "Update the logo" in the README.

## Details that switch on automatically

## Case study pages

Case study detail pages are set to \`noindex\` and left out of the sitemap. Once one has real content, remove \`noindex: true\` from the case study block in \`src/build.js\`.

## Statements to confirm

These came from your brief or describe how the service works. They are not marked as placeholders, but you are responsible for them being true:

- From your brief: HIPAA compliant, no setup fees, all 50 states, no long-term contract, call within one business day, written summary after the call.
- Added by me, please confirm or remove (\`src/content/misc.js\`): you sign a BAA before accessing PHI; client payments go to the client's own accounts and you do not hold funds; you set up a secure channel before records are exchanged; email replies within one business day.
- The "What is included" lists and FAQ answers on service pages (\`src/content/services.js\`) describe typical scope for each service. Check that each one matches what you offer.
- Specialty code examples are general industry information written for this site. Have a certified coder or compliance lead review them before publishing.
`);
console.log(`Built ${pages.length} pages to dist/ (${indexable.length} in sitemap). ${tokens.size} distinct placeholders remain.`);
if (!existsSync(join(dist, 'images/og-image.jpg'))) console.warn('Warning: og-image.jpg is missing');
