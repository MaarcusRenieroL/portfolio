---
title: "building a launcher that never talks to the internet"
description: "design notes from nyx: a warm window, a rust search core, a local ai bridge, and a log inspector that proves nothing leaves the machine."
date: "2026-10-23"
tags:
  - "ai"
  - "security"
  - "rust"
  - "nyx"
published: false
---

# building a launcher that never talks to the internet

nyx is a local-first desktop launcher. two rules shaped everything: results should appear in microseconds, and nothing should ever be sent to a server.

## a warm window

a launcher is judged in its first hundred milliseconds. nyx keeps one window alive in memory so opening it with the global hotkey costs nothing.

## a rust core

search, system telemetry and secret scanning live in a rust core behind tauri 2. the interface on top is react 19. the repository includes a benchmark that reports a 420 µs average search over 50,000 files.

## local ai

the assistant talks to a local ollama instance, with source citations and streamed tokens. there is no hosted model in the loop.

## proving the privacy claim

saying "we don't phone home" is cheap. nyx ships a zero-egress log inspector that shows outbound network calls in real time, so the claim can be checked instead of trusted. the clipboard manager also redacts card numbers and common api keys before they are stored.

## what i would do again

treat privacy as a build constraint, not a marketing line, and design the whole set of surfaces before writing code.

> draft: confirm the benchmark numbers on your machine before publishing.
