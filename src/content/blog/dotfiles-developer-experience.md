---
title: "the 10x developer environment: neovim, tmux & automated dotfiles"
description: "why maintaining reproducible lua configs, zsh aliases, and keybindings compounded into the highest roi investment in my daily engineering workflow."
date: "2026-09-05"
tags:
  - "tooling"
  - "neovim"
  - "linux"
  - "dx"
  - "macos"
published: true
---

# the 10x developer environment: neovim, tmux & automated dotfiles

developer tools compound. the friction you eliminate today on keyboard navigation, git branching, and terminal session multiplexing pays dividends every single day you sit down to write software.

for years, my dev environment was a chaotic patchwork of vs code extensions and random zsh plugins. whenever i switched machines, half my workflow vanished.

here is how turning my personal setup into a versioned **dotfiles repository** reshaped how i build software.

## the triad: neovim, tmux, zsh

```text
[ terminal session: ghostty / wezterm ]
  └── tmux (session multiplexer)
        ├── window 1: neovim (lua, lsp, treesitter)
        ├── window 2: next dev / pnpm test runner
        └── window 3: postgres cli / curl testing
```

### 1. modal editing with neovim & lua

switching from vscode to modern neovim (v0.10+) configured in clean lua modules cut my memory footprint from 2.5gb to 80mb while delivering instantaneous file navigation:

- **telescope.nvim**: instant fuzzy finder across thousands of repository files.
- **nvim-treesitter**: ast-aware syntax highlighting and indentation.
- **mason.nvim**: automated language server management for typescript, rust, and java.

### 2. persistent workspaces with tmux

with `tmux-resurrect` and session scripts, my active branches, terminal splits, and running servers persist across laptop restarts. running `ta -t portfolio` immediately drops me back into my exact workspace layout.

### 3. single-command bootstrap

on a fresh macos or debian machine, bootstrapping my entire workstation takes a single command:

```bash
git clone git@github.com:maarcusrenierol/dotfiles.git ~/.dotfiles
cd ~/.dotfiles && ./install.sh
```

## final thoughts

your editor and shell are your primary craft instruments. investing the time to understand their configuration files from the ground up transforms your daily development from wrestling tools into effortless flow state.
