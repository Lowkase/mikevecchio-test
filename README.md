# Mike Vecchio, RMT — Website

A ground-up redesign of the Mike Vecchio RMT website: plain HTML5, modern CSS
and vanilla JavaScript. No build step, no framework, no dependencies.

## Project structure

```
index.html                 Homepage — works as a standalone conversion page
massage-therapy/index.html Massage Therapy (St. Thomas practice) landing page
mobile-rmt/index.html      Mobile RMT landing page (primary local-SEO page)
about/index.html           About Mike
contact/index.html         Contact + the Mobile RMT enquiry form + facility CTA
404.html                   Not-found page

css/styles.css             The entire design system and site styles
js/main.js                 Nav, FAQ accordion, scroll reveal, sticky CTA, footer year
js/analytics.js            Analytics abstraction (see "Analytics" below)
js/mobile-form.js          Mobile enquiry form validation + submission adapter

images/                    Placeholder imagery (see "Photography" below)
favicon.png                Placeholder favicon (reused from the previous site)
robots.txt
sitemap.xml
vercel.json                Static-hosting config (framework: none)
```

Every page repeats the same header/footer markup rather than pulling in a
templating system — this is a static site with no build step, so each HTML
file is self-contained. If you change the nav or footer, update it in all six
HTML files (a simple `grep`/`sed` across the repo works fine for this scale).

## Running locally

No build step. Serve the folder over HTTP (not `file://`, so relative paths
and `fetch()` behave correctly):

```
python3 -m http.server 8000
```

Then visit http://localhost:8000.

## Where things are configured

- **ClinicSense booking URL** — `https://mikevecchiormt.clinicsense.com/book`,
  hard-coded on every "Book an Appointment" link and in the `ReserveAction`
  JSON-LD on the homepage. It was verified live during this redesign
  (resolves with a 301 → 200). To change it, search for
  `mikevecchiormt.clinicsense.com` across the repo.
- **Phone number** — `519-859-1419` / `tel:+15198591419`, used throughout
  (nav, footer, hero, FAQ copy, JSON-LD `telephone`).
- **Email** — `hello@mikevecchiormt.ca` is a **development placeholder only**. It is not linked on public pages. Add Mike's confirmed inbox to the Contact page and all footers when available.
- **Pricing** — St. Thomas practice pricing ($70/$90/$110) and Mobile RMT
  pricing ($150 first treatment, $130 each additional back-to-back
  treatment, both including HST) appear in: the homepage pricing section,
  the "Two ways to see Mike" cards, the Mobile RMT feature section, the
  `/massage-therapy/` and `/mobile-rmt/` pricing sections, the FAQ answers,
  and the JSON-LD `Offer` entries on each page. Search for `$70`, `$110`,
  `$150`, `$130` to find every instance if prices change.
- **Service area copy** — "St. Thomas, surrounding areas, and London"
  (with White Oaks called out specifically) appears on the homepage, the
  Mobile RMT page's dedicated service-area section, and the FAQ. Travel fees
  depend on the address and are confirmed before booking. There is no
  per-city pricing table by design (see project brief: the mobile offering
  is intentionally simple while Mike gauges demand).
- **Mobile form submission adapter** — see `js/mobile-form.js`. The
  `submitMobileRequest()` function is the single seam between the form UI
  and a backend; it is disabled until `MOBILE_REQUEST_ENDPOINT` is set. The Contact page directs visitors to call or text in the meantime. A successful response from the configured endpoint is required before a success message appears.

## Content verification (needs Mike's confirmation)

The previous site and its structured data did not state whether the
$70/$90/$110 St. Thomas practice prices include HST, so **this redesign does
not claim either way** for those prices — they're shown as plain dollar
amounts. The Mobile RMT prices ($150 / $130) are stated as "including HST"
per the project brief. Before launch, confirm:

1. **HST treatment of the $70/$90/$110 practice prices** — update the
   pricing sections/JSON-LD once confirmed (search for `30 minutes`, `45
   minutes`, `60 minutes` near "$70"/"$90"/"$110").
2. **Email address** — `hello@mikevecchiormt.ca` is an internal placeholder, not a
   verified inbox. Public email links are withheld until Mike provides his real address.
3. **MYFM recognition** — the old site displayed a "myfm-spirit-award.png"
   graphic captioned "Voted best Massage Therapist." No award year,
   category, or official name could be confirmed from the source material,
   so the public recognition section is withheld until the specifics are confirmed.
4. **St. Thomas practice street address** — not published on the previous
   site or anywhere in this redesign (by design, pending Mike's
   preference); FAQ states it's "shared when you book." Add it explicitly
   if Mike wants the address public.
5. **Google Analytics property** — `G-G4RWERL1EK` was carried over from the
   previous site's `gtag.js` snippet. Confirm this is still Mike's active
   GA4 property (or replace it) before relying on it for traffic data.

## Asset list (real photography still needed)

Most imagery is placeholder. Mike's portrait was carried over from the previous site; everything else is an illustrated SVG
placeholder so the layout can be exercised without needing real photos yet.
Note: the previous site's hero/treatment-room JPEG was **not** reused here —
it framed a client mid-treatment, which isn't appropriate to feature
prominently in a redesign, so it was replaced with an illustrated stand-in.

| File | Used on | Replace with |
| --- | --- | --- |
| `images/mike-hero-placeholder.svg` | Homepage hero | Horizontal environmental photo of Mike in his treatment space. Natural expression, leave negative space on one side for the headline. Recommended ~1600×1200 or wider, will be cropped to 4:5 on desktop / ~16:10 on mobile. |
| `images/mike-treatment-room-placeholder.svg` | `/massage-therapy/` | Photo of Mike's actual St. Thomas treatment room (empty of clients). ~1280×960 (4:3). |
| `images/mike-portrait-placeholder.jpg` (real, reused) | Homepage "Meet Mike", `/about/`, social sharing | A warm, straightforward portrait. Current file is 474×600 (3:4) — keep that ratio or update the CSS `aspect-ratio` if it changes. |
| `images/mobile-setup-placeholder.svg` | Homepage Mobile RMT feature, `/mobile-rmt/` | Photo of Mike carrying/setting up his portable table. ~4:3. |
| `images/mobile-environment-placeholder.svg` | `/mobile-rmt/` "What is Mobile RMT?" | Table set up in a bright, realistic residential room. ~4:3. |
| `images/myfm-spirit-award.png` (real, unused) | Not currently shown | Use only after confirming the exact recognition details. |
| `images/og-image-placeholder.svg` | Not currently linked | A from-scratch source file for a proper 1200×630 social-sharing image. Meta tags currently point at the portrait photo instead (see below); export this SVG (or a real photo) to a 1200×630 JPG/PNG and update `og:image`/`twitter:image` across all five pages once ready. |
| `favicon.png` (real, reused) | All pages | Fine to keep, or replace with an updated mark. |

All `<img>` tags use descriptive `alt` text; placeholders are explicitly
labelled as placeholders in their alt text and/or a visible caption so
nobody mistakes them for final photography.

## Mobile enquiry form

`/contact/#mobile-request` — form is hidden until a real endpoint is configured. Once enabled it collects name, email, phone, general
location/postal code, number of people, preferred day/time, and an optional
message. Deliberately does **not** ask for medical history.

- Client-side validation with per-field, screen-reader-announced error
  messages (`role="alert"`), `aria-invalid`, and focus management on
  failed submission.
- Loading state (`data-loading="true"` on the submit button, disabled
  during submission) and a success state that hides the form and shows a
  confirmation message.
- Spam prevention: a hidden honeypot field (`website`) and a minimum
  time-on-page check before the form will submit. Neither replaces
  server-side/provider spam filtering — see the adapter notes in
  `js/mobile-form.js` once a real backend is connected.
- The submission adapter (`submitMobileRequest()`) is intentionally the only
  function that would talk to a network endpoint, so swapping in Formspree,
  Netlify Forms, or a custom endpoint is a one-function change.

## Analytics

`js/analytics.js` exposes `window.mvAnalytics.track(name, data)` and sends events to the GA4 `gtag` function already loaded by the pages. It also keeps a local event queue for debugging (see the comment
block at the top of the file for a GA4 example). Elements can also be
wired up declaratively with `data-analytics-event="..."` plus optional
`data-analytics-*` context attributes, handled automatically via event
delegation.

Events currently fired around the site:

| Event | Fired when |
| --- | --- |
| `booking_click` | Any "Book an Appointment" link is clicked (nav, hero, pricing, sticky bar, etc.) |
| `mobile_service_view` | The `/mobile-rmt/` page loads |
| `mobile_cta_click` | Any "Explore/Request Mobile..." link is clicked |
| `mobile_form_start` | The visitor starts typing into the mobile enquiry form |
| `mobile_form_submit` | The mobile enquiry form successfully submits |
| `phone_click` | A `tel:` link is clicked |
| `email_click` | Reserved for confirmed email links once added |
| `practice_service_click` | The practice service link is clicked |
| `facility_cta_click` | A "Talk to Mike" (groups/facilities) link is clicked |

Every tracked element carries `data-analytics-location` for context (e.g.
`hero`, `nav`, `sticky_bar`, `pricing`). No medical or otherwise sensitive
form content is ever included in an analytics event.

## SEO & structured data

- Unique `<title>`, meta description, and canonical URL per page.
- Open Graph + Twitter Card metadata per page.
- JSON-LD: `HealthAndBeautyBusiness` + `Person` + `WebSite` on the homepage;
  `Service` + `BreadcrumbList` on each service/secondary page;
  `FAQPage` on the homepage (full FAQ) and `/mobile-rmt/` (mobile-specific
  subset) — both mirror FAQ content that's actually visible on the page.
- No invented ratings, reviews, opening hours, coordinates, or unverifiable
  claims anywhere in the structured data.
- `robots.txt` and `sitemap.xml` at the repo root.
- FAQ lives primarily on the homepage (so the homepage stands alone as a
  full conversion page per the project brief), with a shorter, page-specific
  FAQ also on `/massage-therapy/` and `/mobile-rmt/` for long-tail search
  intent. There is no separate `/faq/` page — the nav's "FAQ" link points to
  `/#faq`.

## Accessibility

Skip-to-content link, semantic landmarks, logical heading order (verified
with Lighthouse — see below), visible focus states, accessible
nav/FAQ/form patterns, `prefers-reduced-motion` support (scroll-reveal and
transitions are disabled/instant for users who request it), and minimum
44px tap targets on icon-only controls. Color tokens in `css/styles.css`
were chosen and checked to meet WCAG AA contrast on their intended
backgrounds.

## Performance

No JS framework, no icon font, minimal JS (a few small, focused files),
`fetchpriority="high"` + `preload` on the hero image, `loading="lazy"` on
below-the-fold images, explicit width/height (or `aspect-ratio`) on every
image to avoid layout shift, and a single web font family (Fraunces,
headings only) loaded with `font-display: swap` and a solid serif fallback
stack — body text uses the system font stack, so no body-text web font is
fetched at all.

Lighthouse (desktop, this build): 100 Accessibility / 100 Best Practices /
100 SEO on every page.

## Deployment

Configured the same way as the previous site: `vercel.json` sets the
framework preset to "Other" with empty install/build commands and
`outputDirectory: "."`, so the repository root is served as-is. This will
work unmodified on any static host (Netlify, GitHub Pages, S3 + CloudFront,
etc.) — there's nothing Vercel-specific about the actual site.
