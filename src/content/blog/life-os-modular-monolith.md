---
title: "why life os is one process, not eleven services"
description: "a personal operating system with eleven modules, one spring boot process and one gateway, and why i chose that over microservices."
date: "2026-10-23"
tags:
  - "cloud"
  - "security"
  - "architecture"
  - "life os"
published: false
---

# why life os is one process, not eleven services

life os is my personal operating system: passwords, money, jobs, habits, notes, tasks, calendar and workouts, with web, phone and desktop clients. it has eleven backend modules. they all run in **one** spring boot process.

## the temptation

eleven domains look like eleven services. but i am the only developer, the only operator and the only user. every extra process would be one more thing to deploy, monitor, back up and debug at the worst possible time.

## what i did instead

each module is a plain library jar under `services/`. it has its own routes, its own migrations and its own postgres schema with its own history table. a single `app` module assembles them into one runnable spring boot application, and nginx sits in front as the only gateway.

modules talk to each other through in-process spring events and share an in-process cache, so there is no message broker to run.

## what the boundaries buy me

- a module owns its tables. nothing reaches into another module's schema.
- if one module ever needs to scale on its own, it is already a library with its own migrations. splitting it out is a packaging change, not a rewrite.
- one `mvn test` runs every module, and one docker image ships everything.

## the lesson

module boundaries matter more than process boundaries. get the first right and the second stays a decision you can make later.

> draft: check every claim against the repository before publishing.
