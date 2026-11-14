# maarcus.dev

Portfolio of Maarcus Reniero L, a full stack engineer in Chennai. Next.js 16 (App Router, Turbopack), React 19, TypeScript, Tailwind CSS 4 with a handwritten token layer in `src/app/globals.css`.

## What is on it

- **Pages:** home, projects (search and filters), experience (timeline with company logos), skills (pills with search and category filter), about, resume (inline PDF), contact, blog (hidden from the nav until a post is published).
- **Theme:** dark and light, follows the system until you choose; switching plays a circular reveal (View Transitions API). Set before first paint, so it never flashes.
- **Motion:** CSS-first entrances and scroll reveals, Lenis smooth scroll, a canvas particle background, and a three-sword intro that plays once per tab. All of it is off for `prefers-reduced-motion`; content is visible without JavaScript.
- **Command palette:** `Ctrl/⌘ K` to jump to a page, open a project, switch theme or copy the email.
- **Contact form:** react-hook-form with a zod schema shared with the server action, a honeypot, Resend delivery and a per-IP and global rate limit (`src/lib/rate-limit.ts`).
- **System pages:** 404, 500, root-layout failure (`global-error`), a 503 maintenance mode (`MAINTENANCE=1`) `/api/health`, `/.well-known/security.txt`, `robots.txt`, `sitemap.xml`, a web manifest and generated Open Graph images at `/og` (rate limited).
- **Security:** CSP, HSTS, `X-Frame-Options`, `Referrer-Policy` and `Permissions-Policy` are set in `next.config.ts`.
- **Analytics:** Vercel Analytics (only reports when deployed on Vercel).

## Languages

English and German share one set of URLs. The EN/DE toggle in the header writes a `lang` cookie and reloads; `src/proxy.ts` then rewrites each request to `app/[lang]/...` for that language (English when there is no cookie). Visiting `/de/...` or `/en/...` sets the cookie and redirects to the clean URL. UI strings are in `src/lib/dict.ts`, translated content in `src/lib/content-de.ts`. The German copy is AI-written in formal "Sie" and says so in the footer; have a native speaker proofread it. The résumé print view and changelog stay English. Search engines only see English, since there is no separate German URL.

## Admin and CMS

`/admin` is private and needs Postgres (`DATABASE_URL`; `pnpm db:migrate` creates the tables). Without a database the site reads `src/lib/content.ts` as before.

- **Sign-in:** your email must equal `MY_EMAIL`, then a one-time link (opened in the same browser), a passkey and an authenticator code. Recovery codes replace the authenticator code once each. Failures all look the same, attempts are throttled in the database, sessions last 8 hours and expire after 60 idle minutes. First run: open `/admin/setup` with `SETUP_TOKEN`, register a passkey, scan the QR, save the recovery codes. Setup closes for good afterward.
- **CMS:** projects, experience, education, skills, certificates, blog posts and notes. Edits autosave as drafts, a live preview of the real page sits beside the editor, and nothing is public until you publish. Import from the files once; the files stay as the fallback.
- **German:** a button asks Gemini (`GEMINI_API_KEY`) to translate one item. It is never called per visitor, and each translation is marked as machine-written until you edit it.
- **Analytics:** first-party and cookieless. Page views, resume downloads, contact messages and clicks on social, email and project links land in `site_event`. Your own visits, bots and Do Not Track are not counted, and no address is stored (the visitor is a hash that changes daily). Charts are at `/admin/analytics`; sessions, passkeys and the audit log are at `/admin/security`.

## Content

All copy lives in `src/lib/content.ts` and is validated with zod (`src/lib/schema.ts`) when the module loads, so a typo in a project or role fails the build instead of shipping.

| To change         | Edit                                                                     |
|-------------------|--------------------------------------------------------------------------|
| A project         | `PROJECT_DATA` in `content.ts`; cover image in `public/projects/<slug>/` |
| A job or its logo | `ROLES`; logo file in `public/logos/`                                    |
| Skills            | `SKILLS_DATA`                                                            |
| Photo             | drop `public/me.jpg` (placeholder shows until then)                      |
| Resume            | replace `public/resume.pdf`                                              |

See `public/ASSETS.txt` for image sizes.

## Develop

```bash
pnpm install
pnpm dev          # http://localhost:3000
pnpm lint
pnpm type-check
pnpm test         # vitest, unit
pnpm test:e2e     # playwright, builds a dev server on :3177
```

Copy `.env.example` to `.env` and fill in the Resend values to enable the contact form. Commits follow Conventional Commits (commitlint + husky).

## Deploy

Vercel. Set `RESEND_API_KEY`, `RESEND_EMAIL` and `MY_EMAIL` in the project settings.
