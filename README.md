# Ankit Satapathy — Portfolio

A static, dependency-free portfolio site with a 3D hero (Three.js), dark/light themes, project modals and a serverless contact form. No build step: upload the folder and it runs.

## Before you deploy: add two files

| File | Put it at | Why |
|---|---|---|
| Your profile photo | `assets/profile-photo.jpg` | Used in the hero frame and the About section. Portrait (4:5) works best, about 800×1000 px, compressed under 200 KB. Until it exists, an "AS" monogram shows instead. |
| Your resume | `assets/Ankit_Satapathy_Resume.pdf` | Every "Download Resume" button points here. |

Optional: `apple-touch-icon.png` (180×180) in the root, and real project screenshots in `assets/project-images/` (list them in `screenshots` inside `assets/js/data.js`).

## Editing content

All text for skills, projects, experience, education, certifications, achievements and languages lives in **`assets/js/data.js`**. Edit it and reload; nothing else needs to change.

- Career Guidance System: set `github` and `demo` once they exist, and fill `tech` with the verified stack.
- Internship: add verified responsibilities to `details`.
- Certifications: put a verification URL in `url` and the card shows a "Verify credential" link.

The hero, About text and contact details are in `index.html`. Colours, type and spacing are tokens at the top of `assets/css/site.css`.

## Deploy on Vercel (recommended)

1. Push this folder to a GitHub repository.
2. In Vercel: **Add New → Project**, import the repo. Framework preset: **Other**. No build command, output directory `.`.
3. After the first deploy, replace `https://ankit-satapathy.vercel.app` with your real URL in `index.html` (canonical and Open Graph tags), `robots.txt` and `sitemap.xml`.

### Turn on the contact form

The form posts to `/api/contact`, a serverless function that sends email through [Resend](https://resend.com) (free tier is enough).

1. Create a Resend account and an API key.
2. In Vercel → Project → Settings → Environment Variables add:
   - `RESEND_API_KEY` = your key
   - `CONTACT_TO_EMAIL` = `ankitsatapathy2006@gmail.com`
   - optional `CONTACT_FROM_EMAIL` = a sender on a domain you verified in Resend. Without it Resend's test sender is used, which only delivers to the email you signed up to Resend with, so sign up with the inbox you want messages in.
3. Redeploy.

Until those variables are set the function returns "not configured", and the form tells visitors to email you directly. It never shows a fake success message. The key stays on the server; nothing secret is in the frontend.

Spam protection: hidden honeypot field, a minimum time on page before sending, server-side validation and a per-IP rate limit.

## Deploy on Netlify

Drag the folder into Netlify, or connect the repo with publish directory `.`. `netlify.toml` routes `/api/contact` to `netlify/functions/contact.js`; set the same environment variables under Site configuration → Environment variables.

## What's inside

```
index.html              page markup, SEO and Open Graph tags
404.html
assets/css/site.css     theme tokens (dark + light) and all styles
assets/js/data.js       all section content
assets/js/main.js       rendering, theme toggle, nav, animations, modal, form
assets/js/scene.js      Three.js hero scene (loaded lazily after first paint)
assets/og-image.png     social sharing image (1200×630)
api/contact.js          Vercel serverless function (Resend)
netlify/functions/      Netlify wrapper for the same function
favicon.svg, robots.txt, sitemap.xml, vercel.json, netlify.toml
```

## Behaviour notes

- Theme: follows the OS on first visit, then remembers the visitor's choice in `localStorage`. A tiny inline script in `<head>` applies it before paint, so there is no flash of the wrong theme.
- 3D: Three.js r128 loads from cdnjs only after the page is idle, renders at a capped pixel ratio, uses fewer particles on phones and low-memory devices, pauses when the hero is off-screen or the tab is hidden, and falls back to static gradients when WebGL isn't available.
- Reduced motion: with `prefers-reduced-motion`, the loader, character reveals, scroll reveals, tilt, magnetic buttons and 3D animation are disabled; the 3D scene renders one still frame.
- The custom cursor ring and tilt effects only run on devices with a fine pointer (mouse/trackpad).
