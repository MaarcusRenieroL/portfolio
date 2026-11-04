---
title: "one json file runs every project on my mac"
description: "how gateway puts one nginx and one cloudflare tunnel in front of every project i build, and why generating config beat editing it."
date: "2026-11-04"
tags:
  - "devops"
  - "nginx"
  - "docker"
  - "dx"
featured: true
published: false
---

i run several projects on one mac. for a while each one meant a new port to remember, a hand-written nginx block and another round of tunnel setup. gateway replaces all of that with one file.

## the idea

`projects.json` is the only file i edit. `./gw gen` turns it into the nginx config, the compose files and the tunnel config. every app is then reachable at `localhost/<name>/`, and the public ones at `<name>.maarcus.dev` through a single cloudflare tunnel.

```
browser  -> http://localhost/<project>/ -> gw-nginx -> your app
internet -> <project>.maarcus.dev -> cloudflare -> tunnel -> gw-nginx -> your app
```

## generated config does not drift

the config used to be edited by hand, so it slowly stopped matching reality. now nginx, compose and tunnel files are outputs. if one is wrong, i fix `projects.json` and regenerate.

## three kinds of project

a `tunnel` project runs on this mac. a `vercel` project is only linked from the portal. a local copy of a vercel project runs next to production so i can compare them.

## deploys that fail safely

`gw deploy` builds, restarts, reloads and waits until the app answers. while it builds, a tunnel project shows an upgrading page, and it stays on that page if the build fails. visitors never see a broken app.

## a control api that only i can reach

the portal talks to a small python api. it listens on loopback, answers only for this machine's host, needs a custom header on every post and sends no cors headers. another device on the network, or another website in my browser, cannot start or stop anything.

## what i learned

- an app that ignores its base path breaks behind a gateway. the fix belongs in the app, so the gateway exports `NEXT_PUBLIC_BASE_PATH` to it.
- a `doctor` command that prints a fix for every failure saves more time than any amount of documentation.
