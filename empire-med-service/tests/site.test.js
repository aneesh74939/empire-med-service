import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const dist = fileURLToPath(new URL('../dist/', import.meta.url));
const walk = (d) => readdirSync(d).flatMap((f) => { const p = join(d, f); return statSync(p).isDirectory() ? walk(p) : [p]; });
const htmlFiles = walk(dist).filter((f) => f.endsWith('.html'));
const pages = htmlFiles.map((f) => ({ f: f.replace(dist, '/'), html: readFileSync(f, 'utf8') }));

test('every page has unique title, description and canonical', () => {
  for (const key of [/<title>(.*?)<\/title>/, /name="description" content="(.*?)"/, /rel="canonical" href="(.*?)"/]) {
    const vals = pages.map((p) => { const m = p.html.match(key); assert.ok(m, `${p.f} missing ${key}`); return m[1]; });
    assert.equal(new Set(vals).size, vals.length, `duplicate for ${key}`);
  }
});
test('footer shows the fixed 2024 copyright year', () => {
  for (const p of pages) assert.ok(p.html.includes('© 2024 Empire Med Service. All rights reserved.'), `${p.f} has incorrect copyright text`);
});
test('footer includes Facebook, Instagram, and LinkedIn links', () => {
  for (const p of pages) {
    assert.ok(p.html.includes('aria-label="Empire Med Service on Facebook (opens in a new tab)"'), `${p.f} missing Facebook link`);
    assert.ok(p.html.includes('aria-label="Empire Med Service on Instagram (opens in a new tab)"'), `${p.f} missing Instagram link`);
    assert.ok(p.html.includes('href="https://www.linkedin.com/company/empire-med-service/"'), `${p.f} missing LinkedIn link`);
    assert.ok(p.html.includes('aria-label="Empire Med Service on LinkedIn (opens in a new tab)"'), `${p.f} missing LinkedIn accessible label`);
  }
});
test('every page has SEO, social and structured data tags', () => {
  for (const p of pages) for (const t of ['og:title', 'og:description', 'og:image', 'og:url', 'twitter:card', 'twitter:image', 'application/ld+json', 'lang="en-US"'])
    assert.ok(p.html.includes(t), `${p.f} missing ${t}`);
});
test('JSON-LD parses and contains no placeholders', () => {
  for (const p of pages) for (const m of p.html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)) {
    JSON.parse(m[1]); assert.ok(!m[1].includes('[ADD'), `${p.f} placeholder in JSON-LD`);
  }
});
test('no placeholders in head or attributes', () => {
  for (const p of pages) {
    assert.ok(!p.html.slice(0, p.html.indexOf('<body>')).includes('[ADD'), `${p.f} head`);
    for (const m of p.html.matchAll(/<[^>]+>/g)) assert.ok(!m[0].includes('[ADD'), `${p.f} attr ${m[0]}`);
  }
});
test('one h1, skip link, main landmark and alt text on every page', () => {
  for (const p of pages) {
    assert.equal((p.html.match(/<h1[ >]/g) || []).length, 1, `${p.f} h1`);
    assert.ok(p.html.includes('href="#main"') && p.html.includes('id="main"'), `${p.f} skip`);
    for (const m of p.html.matchAll(/<img [^>]*>/g)) assert.match(m[0], /alt="[^"]+"/, `${p.f} ${m[0]}`);
  }
});
test('homepage shows Google reviews and links to the listing', () => {
  const home = pages.find((p) => p.f === '/index.html');
  assert.ok(home, 'homepage exists');
  assert.ok(home.html.includes('<a class="btn head-cta" href="/contact/">Contact Us</a>'), 'homepage header CTA is not Contact Us');
  assert.ok(home.html.includes('<a class="btn" href="/contact/">Contact Us</a>'), 'homepage hero or lower CTA is not Contact Us');
  assert.ok(!home.html.includes('Get a Free Assessment'), 'homepage still has a Free Assessment button');
  assert.ok(!home.html.includes('Results we can show you'), 'homepage still shows results section');
  for (const text of ['What our clients say', 'Ciara Ward', 'John Thach', 'Empire Med Service has truly transformed my private practice.', 'One stop shop for everything from credentialing to billing/denial work.', '5.0', 'See reviews on Google'])
    assert.ok(home.html.includes(text), `homepage missing ${text}`);
  for (const text of ['Abhi RC', 'Good service', 'joshna john', '3 Google reviews'])
    assert.ok(!home.html.includes(text), `homepage still includes old review ${text}`);
  assert.ok(home.html.includes('href="https://share.google/u5lIuwctT7Sc54EKP"'));
});
test('clean-claim path connector and endpoint stay aligned to their nodes', () => {
  const home = pages.find((p) => p.f === '/index.html');
  assert.ok(home, 'homepage exists');
  assert.match(home.html, /<li><span class="traveller" aria-hidden="true"><\/span><strong>Payment<\/strong>/, 'endpoint marker is not anchored to the final node');
});
test('office location and working hours are removed from site pages', () => {
  for (const p of pages) {
    assert.ok(!p.html.includes('Office location'), `${p.f} shows office location`);
    assert.ok(!p.html.includes('openingHours'), `${p.f} includes hours in structured data`);
    assert.ok(!p.html.includes('LocalBusiness'), `${p.f} identifies a local office`);
  }
  const contact = pages.find((p) => p.f === '/contact/index.html');
  assert.ok(contact, 'contact page exists');
  for (const text of ['Our Office', '>Office<', '>Address<', '>Hours<', 'Get Directions', 'Map showing the Empire Med Service office'])
    assert.ok(!contact.html.includes(text), `contact page still has ${text}`);
  assert.ok(contact.html.includes('>Phone<'), 'contact page retains phone details');
  assert.ok(contact.html.includes('>Email<'), 'contact page retains email details');
  assert.ok(!contact.html.includes('Practices we work with'), 'contact page still shows practices section');
});
test('about page omits credentials and memberships section', () => {
  const about = pages.find((p) => p.f === '/about/index.html');
  assert.ok(about, 'about page exists');
  assert.ok(!about.html.includes('Credentials and memberships'), 'about page still shows credentials and memberships');
  assert.ok(about.html.includes('<h2 class="bar mt">Our Story</h2><div class="mt"><p>Founded in 2024'), 'about story paragraph spacing does not match the previous section');
  assert.ok(about.html.includes('Founded in 2024 by Anooj Madhusoodanan'), 'about page is missing the company story');
});
test('privacy policy omits requested placeholders, sections, and disclaimer', () => {
  const privacy = pages.find((p) => p.f === '/privacy-policy/index.html');
  assert.ok(privacy, 'privacy policy exists');
  for (const text of ['[ADD ANY MARKETING USE]', '[ADD SERVICE PROVIDER LIST]', '[CONFIRM WITH COUNSEL]', 'Cookies and analytics', 'Retention and your choices', 'Placeholder text. Have a qualified attorney review'])
    assert.ok(!privacy.html.includes(text), `privacy policy still contains ${text}`);
});
test('terms page omits requested fields and uses Contact Us CTAs', () => {
  const terms = pages.find((p) => p.f === '/terms-of-service/index.html');
  assert.ok(terms, 'terms page exists');
  for (const text of ['Effective date:', '[ADD EFFECTIVE DATE]', 'Placeholder text. Have a qualified attorney review', 'Limitation of liability', '[ADD LIMITATION OF LIABILITY LANGUAGE FROM COUNSEL]', 'Governing law', '[ADD GOVERNING LAW AND VENUE]', 'Get a Free Assessment'])
    assert.ok(!terms.html.includes(text), `terms page still includes ${text}`);
  assert.ok(terms.html.includes('<a class="btn head-cta" href="/contact/">Contact Us</a>'), 'terms header CTA is not Contact Us');
  assert.ok(terms.html.includes('<a class="btn" href="/contact/">Contact Us</a>'), 'terms footer CTA is not Contact Us');
});
test('FAQ omits the requested questions and pricing group', () => {
  const faq = pages.find((p) => p.f === '/faq/index.html');
  assert.ok(faq, 'FAQ page exists');
  for (const text of ['How long does it take to get started?', 'Which software do you work with?', 'How will I know how billing is going?', 'Who will I talk to?', 'Pricing and contracts'])
    assert.ok(!faq.html.includes(text), `FAQ still includes ${text}`);
  assert.ok(faq.html.includes('<a class="btn head-cta" href="/contact/">Contact Us</a>'), 'FAQ header CTA is not Contact Us');
  assert.ok(faq.html.includes('<a class="btn" href="/contact/">Contact Us</a>'), 'FAQ page CTA is not Contact Us');
  assert.ok(!faq.html.includes('Get a Free Assessment'), 'FAQ still has a Free Assessment button');
});
test('Free Assessment page header and footer CTAs link to Contact Us', () => {
  const assessment = pages.find((p) => p.f === '/request-free-audit/index.html');
  assert.ok(assessment, 'Free Assessment page exists');
  assert.ok(assessment.html.includes('<a class="btn head-cta" href="/contact/">Contact Us</a>'), 'assessment header CTA is not Contact Us');
  assert.ok(assessment.html.includes('<a class="btn" href="/contact/">Contact Us</a>'), 'assessment footer CTA is not Contact Us');
  assert.ok(!assessment.html.includes('Get a Free Assessment'), 'assessment page still has a Free Assessment button');
  assert.ok(assessment.html.includes('Request My Free Audit'), 'assessment form submit button was changed');
});
test('requested pages use Contact Us calls to action', () => {
  for (const route of ['/services/index.html', '/specialties/index.html', '/contact/index.html', '/about/index.html']) {
    const page = pages.find((p) => p.f === route);
    assert.ok(page, `${route} exists`);
    assert.ok(page.html.includes('href="/contact/">Contact Us</a>'), `${route} missing Contact Us link`);
    assert.ok(!page.html.includes('Get a Free Assessment'), `${route} still has a Free Assessment button`);
  }
  for (const route of ['/about/index.html', '/contact/index.html']) {
    const page = pages.find((p) => p.f === route);
    assert.ok(page.html.includes('src="/images/icon-colour.jpg"'), `${route} missing icon-colour image`);
    assert.ok(!page.html.includes('src="/images/brand-artwork.jpg"'), `${route} still uses brand artwork`);
  }
  const contact = pages.find((p) => p.f === '/contact/index.html');
  assert.ok(contact.html.includes('href="#contact-form">Contact Us</a>'), 'contact hero button does not jump to the form');
});
test('case study section and pages are removed', () => {
  assert.ok(!pages.some((p) => p.f === '/case-studies/index.html' || p.f.startsWith('/case-studies/')), 'case study page was generated');
  for (const p of pages) {
    assert.ok(!p.html.includes('href="/case-studies/'), `${p.f} links to case studies`);
    assert.ok(!p.html.includes('>Case Studies</a>'), `${p.f} shows case studies navigation`);
  }
  assert.ok(!readFileSync(join(dist, 'sitemap.xml'), 'utf8').includes('/case-studies/'), 'sitemap still lists case studies');
});
test('service and specialty detail pages use Contact Us calls to action', () => {
  const detailPages = pages.filter((p) => /^\/(services|specialties)\/[^/]+\/index\.html$/.test(p.f));
  assert.ok(detailPages.length > 0, 'service and specialty detail pages exist');
  for (const p of detailPages) {
    assert.ok(p.html.includes('href="/contact/">Contact Us</a>'), `${p.f} missing Contact Us CTA`);
    assert.ok(!p.html.includes('Get a Free Assessment'), `${p.f} still has a Free Assessment button`);
  }
});
test('all service detail pages omit the service FAQ section and related specialties', () => {
  const servicePages = pages.filter((p) => /^\/services\/[^/]+\/index\.html$/.test(p.f));
  assert.equal(servicePages.length, 8, 'all eight service detail pages exist');
  for (const p of servicePages) {
    const main = p.html.slice(p.html.indexOf('<main'), p.html.indexOf('</main>'));
    for (const text of ['Questions about this service', 'Related specialties'])
      assert.ok(!main.includes(text), `${p.f} still includes ${text}`);
    assert.ok(!p.html.includes('"@type":"FAQPage"'), `${p.f} still has FAQ structured data`);
    assert.ok(p.html.includes('src="/logo/logo-white.png"'), `${p.f} is missing the shared footer`);
  }
});
test('blog pages and navigation are removed', () => {
  assert.ok(!pages.some((p) => p.f === '/blog/index.html' || p.f.startsWith('/blog/')), 'blog page was generated');
  for (const p of pages) assert.ok(!p.html.includes('href="/blog/'), `${p.f} links to the blog`);
  assert.ok(!readFileSync(join(dist, 'sitemap.xml'), 'utf8').includes('/blog/'), 'sitemap still lists blog pages');
});
test('team page lists the named team members with their photos and is in navigation', () => {
  const team = pages.find((p) => p.f === '/team/index.html');
  assert.ok(team, 'team page exists');
  for (const text of ['Anooj Madhusoodanan', 'Founder', 'Jagatheswaran', 'Operations Manager', 'src="/images/anooj_photo.jpeg"', 'src="/images/jagadeesh_photo.jpeg"'])
    assert.ok(team.html.includes(text), `team page missing ${text}`);
  assert.ok(team.html.includes('<a class="btn head-cta" href="/contact/">Contact Us</a>'), 'team header CTA is not Contact Us');
  assert.ok(team.html.includes('<a class="btn" href="/contact/">Contact Us</a>'), 'team page CTA is not Contact Us');
  assert.ok(!team.html.includes('Get a Free Assessment'), 'team page still has a Free Assessment button');
  const styles = readFileSync(join(dist, 'css/site.css'), 'utf8');
  assert.match(styles, /\.team-photo\{[^}]*aspect-ratio:1155\/1253[^}]*object-fit:contain/);
  assert.doesNotMatch(styles, /\.team-photo\{[^}]*object-fit:cover/);
  assert.ok(!team.html.includes('[ADD TEAM MEMBER'), 'team page still has member placeholders');
  for (const p of pages) assert.ok(p.html.includes('>Meet The Team</a>'), `${p.f} is missing the team navigation link`);
});
test('dental billing appears in services and has a service page', () => {
  const listing = pages.find((p) => p.f === '/services/index.html');
  const dental = pages.find((p) => p.f === '/services/dental-billing/index.html');
  assert.ok(listing?.html.includes('Dental Billing'), 'services list includes Dental Billing');
  assert.ok(listing?.html.includes('href="/services/dental-billing/"'), 'services list links to dental billing');
  assert.ok(dental, 'dental billing page exists');
  for (const text of ['Dental Billing Services', 'CDT code and claim detail review', 'Denial review and follow-up'])
    assert.ok(dental.html.includes(text), `dental billing page missing ${text}`);
});
test('all internal links and assets resolve', () => {
  const bad = [];
  for (const p of pages) for (const m of p.html.matchAll(/(?:href|src)="(\/[^"#?]*)/g)) {
    const u = m[1];
    if (!(existsSync(join(dist, u)) && (statSync(join(dist, u)).isFile() || existsSync(join(dist, u, 'index.html'))))) bad.push(`${p.f} -> ${u}`);
  }
  assert.deepEqual(bad, []);
});
test('no inline styles or scripts that the CSP would block', () => {
  for (const p of pages) {
    assert.ok(!/\sstyle="/.test(p.html), `${p.f} inline style`);
    assert.ok(!/<style/.test(p.html), `${p.f} style tag`);
    assert.ok(!/<script(?![^>]*(src=|application\/ld\+json))/.test(p.html), `${p.f} inline script`);
    assert.ok(!/\son\w+="/.test(p.html), `${p.f} handler`);
  }
});
test('sitemap and robots are present; noindex pages are excluded', () => {
  const sm = readFileSync(join(dist, 'sitemap.xml'), 'utf8');
  assert.ok(readFileSync(join(dist, 'robots.txt'), 'utf8').includes('Sitemap:'));
  for (const p of pages) {
    const url = p.html.match(/rel="canonical" href="(.*?)"/)[1];
    assert.equal(sm.includes(`<loc>${url}</loc>`), !p.html.includes('content="noindex"'), p.f);
  }
});
