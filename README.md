# Empire Med Service website

A static, multi-page site for Cloudflare Pages. It has 35 generated pages, no runtime framework and no npm dependencies.

## Run it locally

Requires Node.js 20 or newer.

```bash
npm run dev     # builds, then serves at http://localhost:8788
npm test        # builds, then checks links, SEO tags and the form endpoint
```

In local preview, the forms run the real validation code, but emails are printed to the terminal rather than sent.

## Edit the site

| To change | Edit |
| --- | --- |
| Phone, email, social links, domain and Google reviews link | `site.config.js` |
| Service pages | `src/content/services.js` |
| Specialty pages | `src/content/specialties.js` |
| FAQs, stat labels, case study list, blog posts | `src/content/misc.js` |
| Home, Contact, About, Team, audit and legal pages | `src/build.js` |
| Header, footer, SEO tags | `src/layout.js` |
| Colours and styles | `public/css/site.css` (variables at the top) |
| Logo and images | `public/logo/`, `public/images/` |

Run `npm run build` after any change. It writes the site to `dist/` and refreshes `PLACEHOLDERS.md`, the list of what is still to fill in. Do not edit `dist/` by hand, since each build replaces it.

## Deploy to Cloudflare Pages

**Do not use the dashboard's drag-and-drop upload.** It does not deploy the `functions/` folder, so the forms would not work. Use one of these methods instead.

**Option A: connect GitHub or GitLab (recommended)**

1. Push this folder to a repository.
2. In Cloudflare, go to Workers & Pages, create a Pages project, and connect the repository.
3. Use build command `npm run build` and build output directory `dist`.

**Option B: deploy from your computer**

Run this from the project folder, so that Wrangler can find `functions/`:

```bash
npm run build
npx wrangler pages deploy dist --project-name=empire-med-service
```

## Turn on form email

The forms post to `functions/api/contact.js`, which sends mail through [Resend](https://resend.com). Until this is set up, visitors see a message asking them to email or call instead.

1. Create a Resend account and verify `empiremedservice.com` as a sending domain.
2. In your Pages project, go to Settings > Variables and Secrets and add:
   - `RESEND_API_KEY`: your API key, stored as a secret
   - `MAIL_FROM`: for example `Empire Med Service <website@empiremedservice.com>`
   - `MAIL_TO` (optional): defaults to `info@empiremedservice.com`
3. Redeploy, then send a test message from the live site.

To use another mail service, replace `sendEmail()` in that file. The forms ask people not to send patient information, but someone may do so anyway, so ask your compliance lead how to handle that with your mail provider and inbox.

Extra spam protection: the honeypot stops simple bots. If spam gets through, add Cloudflare Turnstile or a rate-limiting rule for `/api/contact`.

## Before going live

1. Work through `PLACEHOLDERS.md`, including the logo files and the statements to confirm.
2. Check `url` in `site.config.js`. It sets canonical links and the sitemap, and assumes `https://empiremedservice.com`.
3. Add your custom domain in the Pages project. `*.pages.dev` addresses are set to `noindex` in `public/_headers`.
4. Check the logo appears correctly in the header, footer, browser tab and link previews.
5. If you add analytics or other third-party scripts, allow them in the `Content-Security-Policy` line of `public/_headers` and update the Privacy Policy.

## Update the logo

Your master artwork is in `brand-source/`, which isn't published with the site. To change the logo, replace a file there using the same name, then run:

```bash
python3 scripts/make-brand-assets.py   # needs Pillow and NumPy
node scripts/make-images.cjs           # social preview image; needs Playwright
npm run build
```

The footer logo is made from `logo-black.jpg`, recoloured solid white, because the supplied white logo file was blank.

## Folder structure

```
site.config.js      Business details
src/                Build script, layout and content
brand-source/       Master logo artwork (not published)
public/             CSS, JS, fonts, images and logo, copied as-is to dist/
functions/api/      Cloudflare Pages Function for the forms
scripts/            Local preview server and image/font generators
tests/              Automated checks
dist/               Generated site
PLACEHOLDERS.md     Generated list of items to replace
```

Fonts: Poppins and Inter are self-hosted under the SIL Open Font License.
