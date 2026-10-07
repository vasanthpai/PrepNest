# Local setup

How to get PrepNest running on a new machine.

## 1. Prerequisites

| Tool                  | Version           | Check with      |
| --------------------- | ----------------- | --------------- |
| Node.js               | 24 LTS (`.nvmrc`) | `node -v`       |
| npm                   | 11+               | `npm -v`        |
| Git                   | 2.4x+             | `git --version` |
| GitHub CLI (optional) | 2.x               | `gh --version`  |

### Install (Windows)

```powershell
winget install CoreyButler.NVMforWindows   # Node version manager
nvm install 24
nvm use 24
winget install Git.Git
winget install GitHub.cli
winget install Microsoft.VisualStudioCode
```

### Install (macOS)

```bash
brew install nvm git gh
nvm install 24 && nvm alias default 24
brew install --cask visual-studio-code
```

### Git configuration (once per machine)

```bash
git config --global user.name "Your Name"
git config --global user.email "<id>+<username>@users.noreply.github.com"
git config --global init.defaultBranch main
git config --global core.autocrlf false   # line endings are enforced by .gitattributes
gh auth login                              # GitHub.com → HTTPS → browser
```

### Recommended VS Code extensions

Astro, ESLint, Prettier, Tailwind CSS IntelliSense, GitHub Actions, Vitest.

## 2. Run the project

```bash
git clone https://github.com/vasanthpai/PrepNest.git
cd PrepNest
npm install
npm run dev        # http://localhost:4321
```

## 3. Useful scripts

| Command                | What it does                                                   |
| ---------------------- | -------------------------------------------------------------- |
| `npm run dev`          | Dev server with hot reload, running on Cloudflare's `workerd`  |
| `npm run build`        | Production build into `dist/`                                  |
| `npm run preview`      | Serve the production build locally on `workerd`                |
| `npm run lint`         | ESLint: bugs, bad patterns, accessibility (a11y) issues        |
| `npm run lint:fix`     | ESLint with auto-fix                                           |
| `npm run format`       | Prettier: rewrite all files in the project style               |
| `npm run format:check` | Prettier: fail if any file is not formatted (used in CI)       |
| `npm run typecheck`    | `astro check`: TypeScript errors in `.ts`, `.tsx` and `.astro` |

**Before every commit:** `npm run lint && npm run format:check && npm run typecheck`

## 4. Code style

- **Prettier** owns formatting (spaces, quotes, line length 100, Tailwind class order).
  VS Code formats on save using the workspace settings in `.vscode/settings.json`.
- **ESLint** owns correctness: TypeScript rules, React hooks rules, accessibility rules
  for React and Astro. `eslint-config-prettier` disables any rule that fights Prettier.
- **Line endings** are always LF, enforced by `.gitattributes`, so Windows and Linux CI agree.

## 5. How Cloudflare fits in

- The app is deployed as a **Cloudflare Worker** using `@astrojs/cloudflare`.
- `wrangler.jsonc` defines three environments:

  | Environment | Worker name           | Selected by                          |
  | ----------- | --------------------- | ------------------------------------ |
  | local       | `prepnest`            | default (`npm run dev`)              |
  | staging     | `prepnest-staging`    | `CLOUDFLARE_ENV=staging` at build    |
  | production  | `prepnest-production` | `CLOUDFLARE_ENV=production` at build |

- The environment is chosen at **build** time, not deploy time. CI builds once per environment.
- Local secrets go in `.dev.vars` (git-ignored). Deployed secrets are set with
  `npx wrangler secret put <NAME> --env <staging|production>`.

## Troubleshooting

**`node -v` shows an old version.**
You may have more than one Node install. Run `where.exe node` (Windows) or
`which -a node` (macOS/Git Bash). The first path wins.

- PowerShell uses **nvm-windows**: `nvm use 24`
- Git Bash may load a separate Unix **nvm** from `~/.bash_profile`: `nvm alias default 24`
- Fully restart VS Code (File → Exit) after changing versions; terminals keep the old PATH.

**`git` is not recognized (Windows).**
Add `C:\Program Files\Git\cmd` to your user PATH, then restart the terminal.

**`EPERM: Permission denied ... dist\client` during build (Windows).**
A dev or preview server is still running and has `dist/` open. Stop it (Ctrl+C), then rebuild.

**`prettier --check` fails on files you did not change.**
Usually CRLF line endings. Run `npm run format`, and make sure VS Code shows `LF`
(bottom-right of the status bar).
