---
title: "shipping next-cli, and the bugs hiding in a working scaffolder"
description: "i built next-cli to automate the repeated setup work behind production-level next.js apps. the cli looked like it worked, but testing the generated projects showed me how much correctness a scaffolder really needs."
date: "2026-06-22"
tags:
  - "next.js"
  - "cli"
  - "typescript"
  - "dx"
published: true
---

# shipping next-cli, and the bugs hiding in a working scaffolder

## why i built next-cli

i got tired of repeating the same setup work again and again: installing dependencies, configuring authentication, connecting databases, setting up environment variables, and more.
so i decided to automate the initial setup of a production-level next.js app.

## what next-cli is

next-cli is an interactive command-line tool that scaffolds a next.js application based on the options you choose.
you run the cli, select the stack you want, and it generates the project structure, dependencies, configuration files, and starter templates needed to get going faster.

```bash
npx next-cli@latest
```

## ai made it faster, but not automatic

ai tools made building the cli easier, but they did not make the project magically correct.

i still had to decide which tools to integrate, how the base templates should work, how the generated code should be structured, and how each selected option should affect the final project.

## what i expected

i expected the experience to be simple: run the cli, choose the options, start the app, and get an error-free next.js project with all the required dependencies already installed.

## what actually happened

instead, the first generated project failed before i could properly use it.

i do not remember the exact cause of that initial installation failure, so i do not want to pretend that i do. but it immediately showed me something important: building a reliable scaffolding tool is much harder than making the cli itself compile.

the cli can run perfectly and still generate a broken application.

## options are promises

one mistake i made was adding all the options early so i would not forget to build their installers later.

that sounded harmless at first. i had options for things like orms, api layers, auth providers, payments, email providers, and analytics. but the problem was that the cli accepted some of those selections even when the templates and setup logic were not ready.

so from the user’s point of view, the cli looked like it supported that stack. but behind the scenes, some options were silently skipped.

that made the generated project misleading, not just incomplete.

every option in a scaffolding tool is a promise. if the cli shows an option, selecting it should actually generate the right files, install the right dependencies, and configure the project correctly.

## the no database path

selecting “no database” should skip only the database setup and any features that depend on it.

the rest of the project should still be generated normally. a user who does not need a database should still be able to generate a clean next.js app with the other selected tools.

this kind of condition matters a lot in a scaffolder because one wrong branch can accidentally skip more than it should.

```ts
if (options.database !== "none") {
  // database-related setup
  // project creation should not accidentally depend on this branch
}
```

a database choice should control database-related setup, not the creation of the entire project.
