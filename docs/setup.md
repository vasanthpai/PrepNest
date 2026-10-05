# Local setup

How to get PrepNest running on a new machine.

## 1. Prerequisites

| Tool    | Version         | Check with        |
| ------- | --------------- | ----------------- |
| Node.js | 24 LTS (`.nvmrc`) | `node -v`       |
| npm     | 11+             | `npm -v`          |
| Git     | 2.4x+           | `git --version`   |
| GitHub CLI (optional) | 2.x | `gh --version` |

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

| Command           | What it does                         |
| ----------------- | ------------------------------------ |
| `npm run dev`     | Start the dev server with hot reload |
| `npm run build`   | Production build into `dist/`        |
| `npm run preview` | Serve the production build locally   |

## Troubleshooting

**`node -v` shows an old version.**
You may have more than one Node install. Run `where.exe node` (Windows) or
`which -a node` (macOS/Git Bash). The first path wins.

- PowerShell uses **nvm-windows**: `nvm use 24`
- Git Bash may load a separate Unix **nvm** from `~/.bash_profile`: `nvm alias default 24`
- Fully restart VS Code (File → Exit) after changing versions; terminals keep the old PATH.

**`git` is not recognized (Windows).**
Add `C:\Program Files\Git\cmd` to your user PATH, then restart the terminal.