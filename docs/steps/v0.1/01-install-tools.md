# v0.1 step 1: Install and verify tools

**Ticket:** — (before ticketing started) · **Branch:** none yet

## Goal

A working toolchain: Node.js 24 LTS, npm 11, Git, GitHub CLI, VS Code with extensions.

## What changed

Machine setup only, no project files. Documented in [docs/setup.md](../../setup.md).

## Issues hit and fixes

| Problem                                    | Cause                                                   | Fix                                    |
| ------------------------------------------ | ------------------------------------------------------- | -------------------------------------- |
| `node -v` showed v20 (end of life)         | An old installer copy came first on the PATH            | Removed it; `nvm use 24` (nvm-windows) |
| VS Code terminal still showed v20          | VS Code keeps the environment it started with           | Full restart (File → Exit)             |
| Git Bash showed v20, PowerShell showed v24 | Git Bash loads a separate Unix nvm whose default was 20 | `nvm alias default 24` in Git Bash     |
| `git` not recognized in PowerShell         | `C:\Program Files\Git\cmd` missing from PATH            | Added to the user PATH                 |

## Validation

- [x] `node -v` → v24.21.0 in PowerShell, VS Code terminal and Git Bash
- [x] `git --version` → 2.56, `gh auth status` → logged in
