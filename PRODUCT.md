# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users
Recruiters and hiring managers evaluating a software engineer for full-time remote roles (Germany), roles in Bangalore, and freelance work; secondarily, peer engineers judging craft. They arrive from a resume link, GitHub or LinkedIn, skim fast, and want to know who this is, what was built, and how to get in touch.

## Product Purpose
Personal portfolio of Maarcus Reniero L (Chennai, IN). It shows four projects (nyx, next-kit, dotfiles, this site), the experience and resume, a searchable skills page, and a way to make contact. Success: a visitor understands the work within seconds and reaches out.

## Capabilities and Constraints
- Next.js app. Routes: home, projects, experience, skills, about, resume, contact, blog (hidden until a post exists). `/stack` redirects to `/skills`.
- Copy lives in `src/lib/content.ts` and is schema-validated at import.
- Content is edited in a private `/admin` CMS backed by Postgres, with the files as fallback. Blog posts and notes have a heading navigation.
- Case studies were removed on purpose; a different format is planned. A rich-text editor, GitHub sync and a notes graph are not built.
- A GitHub-driven project list is under discussion and not built.
- Interactive extras kept: command palette (`Ctrl/⌘ K`), vim-style keys on lists, theme switch animation, particles and the intro loader (all off for reduced motion).

## Brand Commitments
Minimal and fast. Name, domain (maarcus.dev) and existing copy stay. The accent is green; the intro nods to the "Zoro" theme used in the dotfiles.

## Product Principles
- Content over chrome: every element must earn its place.
- Fast to scan, easy to contact.
- Motion orients and delights, but is never required and never blocks reading.

## Design
Tokens, type, components and motion are documented in `DESIGN.md`.
