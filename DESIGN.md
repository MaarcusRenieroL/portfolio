# Design system: maarcus.dev

Source of truth: `src/app/globals.css`. Copy lives in `src/lib/content.ts`.

## 1. Principles
1. Content over chrome. Every element must earn its place.
2. Type and whitespace do the work. No gradients, no shadows, no decorative imagery.
3. One accent. Green marks state and action only: live dots, the active tab, primary actions, hover, focus, selection.
4. Fast to scan. Small quiet type, hairline dividers, one column of reading.
5. Motion is purposeful and optional. It orients (entrances, reveals, filtering) and is fully off for reduced motion.
6. Keyboard first. Lists respond to vim keys; focus is always visible.

## 2. Colour (dark only, `color-scheme: dark`)
| Token | Value | Use |
|---|---|---|
| `--bg` | `#0b0b0b` | page background |
| `--hover` | `#141414` | hover and active row, input focus, image placeholders |
| `--line` | `#232323` | hairline dividers, borders |
| `--line-2` | `#333` | stronger border, hovered border, link underline |
| `--fg` | `#ededed` | primary text, headings |
| `--fg-2` | `#9a9a9a` | body and secondary text |
| `--fg-3` | `#808080` | meta, captions, section labels, placeholders |
| `--green` | `#4ade80` | the accent |
| `--green-deep` | `#22c55e` | pressed or deeper accent |
| `--green-ink` | `#052e16` | text on a green fill (selected chip, selection) |
| `--green-wash` | `rgb(74 222 128 / 0.1)` | halo behind the live dot, pointer spotlight |
| `--danger` | `#f87171` | errors only |

Rules: text is `--fg`, `--fg-2` or `--fg-3` only. Never put green on large areas. A green fill appears only on the selected chip. `--fg-3` is the lowest allowed text colour; use it for non-essential meta.

## 3. Typography
- Sans: Inter (`--font-sans`, loaded with `next/font`, `display: swap`). Mono: JetBrains Mono 400/500 (`--font-code`), used for code and `kbd`.
- Base: 14px / 1.5 on `body`, antialiased, `optimizeLegibility`.

| Role | Size | Weight | Notes |
|---|---|---|---|
| Hero title `.hero-title` | clamp(1.75rem, 5vw, 2.5rem) | 600 | line-height 1.12, tracking -0.03em, max 18em, balanced; `.hl` span is green |
| Page title `.title` | clamp(1.5rem, 4vw, 2rem) | 600 | tracking -0.035em, balanced |
| Section label `.h2` | 13px | 500 | `--fg-3`, hairline underline. Labels, not headlines |
| Lead `.lead` | 15px / 1.6 | 400 | `--fg-2`, max 38em, `text-wrap: pretty` |
| Prose `.prose` | 15px | 400 | `--fg-2`, max 40rem, h2 1.125rem and h3 15px in `--fg` |
| Row title `.name`, `.item-title`, `.pname` | 15px | 600 | tracking -0.01em |
| Meta, `.small` | 12 to 13px | 400 | `--fg-3` |
| Tags `.tags` | 12px | 400 | `--fg-3`, space-separated, no pills |

Lowercase is allowed for project names (zentro, life os). Sentence case everywhere else. Tabular numerals on dates.

## 4. Layout and spacing
- Container `.wrap`: max-width `--wide` (55rem) plus 24px gutters. Reading column `.col`: `--col` (40rem).
- Page `.page`: 40px top, 96px bottom, 48px between blocks.
- Spacing helpers: `.g8 .g16 .g24 .g40`. Row padding is 14 to 18px vertically.
- Header: brand left (7px green dot + name), Resume action right, underlined tab row below (Home, Projects, Experience, Writing, Stack, About, Contact). Footer: hairline, small text.
- Article pages at 1024px and up use a two-column grid: text column plus a 14rem sticky "On this page" list.
- Breakpoints: 560 (skill rows stack), 640/720/760 (grids collapse, tabs scroll), 1024 (article TOC). Layout must work at phone width with no horizontal scroll.
- No cards. Structure comes from hairlines and spacing; boxes are limited to inputs, buttons, chips, icon tiles and media.

## 5. Shape and elevation
Radii: 6px (buttons, inputs, tabs), 8px (media, search, icon tiles), 999px (chips), 50% (avatar, dots). One border weight: 1px. No box-shadows except the 3px green halo on the live dot. No gradients except the faint pointer spotlight (see Motion).

## 6. Components
- **Action (`.action`)**: ghost button, 30px high, 12px text, 1px `--line` border; hover lifts to `--hover` with `--line-2` border and `--fg` text. There is no filled primary button; emphasis comes from the selected chip.
- **Row (`.leader`, `.job`, `.item`)**: hairline-separated list rows. Name left, meta right, description below in `--fg-3`. Hover or active: name turns green, description to `--fg-2`.
- **Project row (`.prow`)**: 36px icon tile, name + kind/status, description, tags, and links (Live, Code, Case study) with 14px line icons.
- **Project icon (`ProjectIcon`)**: one 24px line glyph per project at 1.6 stroke, round caps. Tile border and glyph turn green when the row is active.
- **Search (`.search`)**: 38px field with magnifier and a `/` kbd hint; border turns green on focus.
- **Chip (`.chip`)**: 26px pill filter; `aria-pressed` selected = green fill with `--green-ink` text.
- **Input (`.input`)**: transparent, 1px border, green border and `--hover` fill on focus, red border for invalid; errors in `.err`, hints in `.help`.
- **Tabs (`.tabs`)**: 13px, `--fg-3`; the current page is `--fg` with a green underline that slides in.
- **Timeline (`.tl`)**: experience list with date column, logo, org, bullets, tags; company renames are minor steps.
- **Facts, stats, pager**: key/value grid for case-study meta, count-up numbers, previous/next links.
- **Status dot (`.dot`)**: 6px green dot with halo and a slow 3s opacity pulse; the only looping animation.
- **Logo and avatar fallbacks (`Pic`)**: while an image is missing, a neutral tile with initials is shown.
- **TOC (`Toc`)**: sticky list; the current heading is green with a left rule.
- **Code**: `.prose pre` on `--hover` with highlight.js colours; inline code in a subtle tile.
- **Resume viewer (`.pdf`)**: embedded PDF in a bordered 8px frame.

## 7. Motion
- Easing: `cubic-bezier(0.16, 1, 0.3, 1)` (`--ease`). Durations: 160ms (colour), 280ms (transforms), 520ms (large). Entrances 0.65 to 0.7s.
- Smooth scrolling: Lenis (lerp 0.09, anchors on).
- Page: each route fades in (`app/template.tsx`). The first screen (header content, hero) rises 16px in a 70ms stagger. Everything below (headings, rows, jobs, stats, timeline, skills, screenshots, pager) fades up 20px as it enters view (`components/site/motion.tsx`).
- Lists: rows on Projects and Writing stagger in and reflow when filtered (motion `layout`, `AnimatePresence`).
- Pointer: a faint green spotlight follows the cursor; screenshot tiles tilt a few degrees on fine pointers; numbers count up (`components/site/life.tsx`).
- Scroll progress: a 2px green bar at the top, driven by scroll-timeline where supported.
- Reduced motion: Lenis, entrances, reveals, tilt and spotlight are skipped; content is visible without JavaScript.
- Banned: parallax, cursor hacks, auto-playing loops (other than the live dot), loaders.

## 8. Interaction and keyboard
- Lists (Projects, Writing): `j`/`k` or arrows move, `gg` first, `G` last, `Enter` or `o` opens, `/` focuses search, `Esc` clears or blurs. The active row gets the `--hover` fill and a green name. A hint line shows only on pointer devices.
- Focus: `:focus-visible` is a 1px green outline with a 2px offset. Skip link at the top. Selection colour is green on `--green-ink`.
- Tap targets: chips and buttons are 26 to 30px; use at least 44px where touch is the primary input.

## 9. Content patterns
- Voice: plain, first person, specific. No claims without a number or a source. Placeholders stay in `[brackets]` until real.
- Project: one-line description, three to five skills, Live and Code links when they exist, a case study only when it has real content.
- Case study: TL;DR and role first, then problem, approach, key decisions, outcome, what I learned, next. Short; deep process is for interviews.
- Posts: `title`, `description`, `date`, `tags`, `featured`, `published` in frontmatter (`src/content/blog/_template.md`). Lowercase headings; tags drive filters and related posts.

## 10. Accessibility
Contrast on `--fg-2` and `--fg` meets AA; `--fg-3` is for non-essential text only. Semantic landmarks (header, nav, main, footer), `aria-current`, `aria-pressed`, `aria-live` on filtered lists, labelled icon links, alt text on screenshots, `lang="en"`.

## 11. Assets
Images live in `/public` (logos in `/logos`, screenshots in `/projects/<slug>/` as WebP, desktop plus mobile). Missing files fall back to styled placeholders. Favicon is `src/app/icon.svg`; OG images are generated at `/og`.

## 12. Known gaps and drift
- Dark only; there is no light theme or token layer beyond `:root`.
- Tokens are plain CSS variables; spacing and radius values are mostly literals, not tokens.
- `.swords` and a few leftover selectors in `globals.css` are unused.
- The palette differs from the dotfiles theme ("Zoro": navy base, emerald accent). This site is neutral near-black with green; reconcile them before sharing one theme across projects.
