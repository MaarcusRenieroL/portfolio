---
title: "Shipping next-cli, and the bugs hiding in a 'working' scaffolder"
description: "I set out to finish next-cli, my one-command Next.js scaffolder. It looked done — but almost nothing it generated actually built. Here's the tool, the bugs, and what I took away."
date: "2026-06-22"
tags: ["next.js", "cli", "typescript", "dx"]
published: true
---

## What next-cli is

[next-cli](https://github.com/MaarcusRenieroL/next-cli) is an interactive command-line tool that scaffolds a production-ready Next.js app in one command. You run it, answer a few prompts — database, ORM, auth, API layer, payments, email, analytics — and it generates a typed, configured project you can run immediately.

```bash
npx next-cli@latest
```

Think of it as a personal, opinionated take on `create-t3-app`: pick your stack, and the right files, dependencies, and environment variables get wired together for you.

It supports a fairly wide menu:

- **Auth** — NextAuth, Clerk, Kinde
- **Database** — PostgreSQL, MySQL, SQLite, MongoDB
- **ORM** — Prisma, Drizzle
- **API** — tRPC, GraphQL, Hono, REST
- **Payments** — Stripe, Paypal, Lemon Squeezy, Razorpay
- **Email** — Resend, SendGrid, Mailgun, Postmark
- **Analytics** — Vercel, Google

That list is the happy story. The reality, when I sat down to "finish" it, was messier — and more interesting.

## The state I found it in

On paper the CLI was mostly built. The prompts were all there, the architecture was clean (a registry of installers, each copying a template and adding dependencies), and it compiled. So I did the thing you should always do before trusting a generator: I actually generated a project and tried to build it.

It didn't build. None of the combinations did. And the reasons turned out to be a great tour of how software can look finished while being quietly broken.

## The bug that set the tone

The very first thing I checked was the "No Database" path. Here's roughly what `init` looked like:

```ts
if (options.database !== "none") {
  // ...assemble packages...
  await createProject({ ...options, packages });
}

removeTsNoCheck(options.projectDir);
```

Spot it? **The entire project only got created when you picked a database.** Choose "No Database" and the CLI cheerfully ran through every prompt, then generated nothing — and immediately tried to post-process a directory that didn't exist. Moving `createProject` out of that branch was a one-line fix, but it told me everything about how much had actually been run end-to-end.

It got better. A bunch of prompts were pure decoration — you could select Drizzle, GraphQL, Stripe, or NextAuth (the *default* auth option!) and the CLI would happily skip them, because nothing mapped those choices into the installer set. And one installer was registered like this:

```ts
resend: {
  inUse: packages.includes("resend"),
  installer: () => resendInstaller, // returns the function instead of running it
}
```

So even when you picked Resend, the installer never actually executed.

## The @ts-nocheck trap

This is the one I'll remember. Every template file started with `// @ts-nocheck`, which made me assume generated code was intentionally exempt from type checking. But there was a post-processing step:

```ts
// strips "// @ts-nocheck" from every generated file
removeTsNoCheck(projectDir);
```

So the generated project **was** fully type-checked by `next build` — under `strict` *and* `noUncheckedIndexedAccess`. The `@ts-nocheck` comments were a false sense of safety; they were deleted before the user ever ran a build. That meant a pile of latent type errors in templates that had never been compiled:

```ts
const i = items.findIndex((x) => x.id === id);
items[i].name = name; // Object is possibly 'undefined'
```

The lesson landed hard: **if you strip the escape hatch, you own the type errors.**

## Death by a thousand missing dependencies

Several templates imported packages the installers never added:

- the generated `env/index.ts` imported `dotenv-expand` — not installed
- the `cn()` helper imported `clsx` and `tailwind-merge` — not installed
- the tRPC templates imported `superjson` — not installed

Each one was an instant "Module not found" on first build. Individually trivial; collectively, the difference between a tool that works and one that doesn't.

## The swapped arguments

My favourite bug. The Hono installer:

```ts
fs.writeFileSync(honoClientSrc, honoClientDest);
```

The arguments are backwards. Instead of *copying* the client template into the project, it **wrote the destination path string into the template file itself** — corrupting the package's own source — and never created the client in the user's app. `copySync(src, dest)` is what it wanted.

## The alias that only worked half the time

The CLI offers a `src/` directory or a root `app/` layout. But the generated `tsconfig.json` hardcoded:

```json
"paths": { "@/*": ["./src/*"] }
```

Pick the no-`src` layout and every `@/...` import broke, because they all resolved into a `src/` folder that didn't exist. The env bootstrap had the same hardcoded assumption. Both needed to become layout-aware.

## How I actually verified it

The thing that surfaced all of this was a simple discipline: **don't trust that the CLI builds — build what it produces.** I scaffolded three very different projects and ran a real `next build` on each:

1. a `src/` app with Prisma + tRPC + NextAuth + Stripe
2. a no-`src` app with Drizzle + GraphQL + SendGrid
3. a database-less app with Kinde + REST + Razorpay

Every failure above came from one of those builds, not from the CLI's own test suite (which was green the whole time). A generator's tests are worthless if they don't compile the output.

## What I took away

- **Generators must build their output in CI.** Unit-testing the generator proves nothing about the project it emits.
- **Don't suppress type checking you intend to keep.** `@ts-nocheck` plus a step that removes it is the worst of both worlds.
- **Pin and test dependency lists.** A template that imports a package the installer forgot is a guaranteed first-run failure.
- **Every prompt is a promise.** If you ask the user to choose, the choice has to do something.
- **"It compiles" and "it works" are different claims.** The CLI compiled from day one. It just didn't work.

next-cli now scaffolds and *builds* across every combination I throw at it. If you want to try it:

```bash
npx next-cli@latest
```

Source and issues live on [GitHub](https://github.com/MaarcusRenieroL/next-cli). If you find a combination that doesn't build — now you know exactly the kind of bug I'd want to hear about.
