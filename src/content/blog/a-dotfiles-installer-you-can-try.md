---
title: "a dotfiles installer you can actually try safely"
description: "dry runs, backups and an uninstall: the three features that made me comfortable running my own installer."
date: "2026-11-04"
tags:
  - "tooling"
  - "macos"
  - "shell"
  - "dx"
featured: true
published: false
---

most dotfiles repos are a pile of symlinks and a prayer. mine installs a whole macos setup, so the installer had to be safe to run on a machine i care about.

## three safety features

- **dry run.** `./install.sh --dry-run` prints every action and changes nothing.
- **backups.** anything the installer would replace moves to `~/.dotfiles-backup/<timestamp>/` first. nothing is overwritten silently.
- **uninstall.** `./uninstall.sh` removes the symlinks and restores the originals from the latest backup.

## install only what you want

`--minimal` gives shell, git and editor. `--only tmux` installs one tool. `--skip wm` skips the window manager, which needs system permissions, and the installer prints which ones before it asks.

## three linking rules

gui and launchd services do not inherit your shell environment, so one linking strategy does not fit everything:

| what | how | why |
|---|---|---|
| `.zshrc`, `.tmux.conf`, `.gitconfig` | gnu stow into `$HOME` | these tools only read from `$HOME` |
| nvim, starship, lazygit, bat | read in place through `XDG_CONFIG_HOME` | set once in `.zshenv` |
| yabai, skhd, borders, sketchybar, ghostty | symlinked into `~/.config/<app>` | services cannot see shell variables |

## secrets stay local

api keys and the git identity live in gitignored files created from templates, so the repo can be public.

## the result

`make doctor` checks links, tools, fonts and services after every install. it is idempotent, so re-running is the normal way to update.
