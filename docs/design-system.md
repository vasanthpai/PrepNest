# Design system: Syntax

Chosen in v0.1 step 10 from three directions (Blueprint, Syntax, Flashcard).

**Idea:** the interface is ink and paper; **colour only carries meaning**. Colours come from code
syntax highlighting, and each tech topic owns one colour everywhere it appears.

## Colour tokens

Use the Tailwind utilities on the left. They switch between light and dark automatically.

| Utility (`bg-`, `text-`, `border-`) | Role                                  | Light     | Dark      |
| ----------------------------------- | ------------------------------------- | --------- | --------- |
| `bg`                                | Page background                       | `#f4f5f7` | `#121419` |
| `surface`                           | Cards, panels                         | `#ffffff` | `#1b1e25` |
| `fg`                                | Main text, primary buttons            | `#15171c` | `#eceef2` |
| `muted`                             | Secondary text                        | `#5a606d` | `#a3a9b6` |
| `line`                              | Borders, dividers                     | `#dfe2e8` | `#2c3039` |
| `code`                              | Code block background                 | `#eef0f4` | `#0e1015` |
| `keyword`                           | Topic colour; "Quiz"; selection       | `#6d3df2` | `#b39bff` |
| `function`                          | Topic colour; "Learn"; links on hover | `#0a6fc2` | `#6cb6ff` |
| `string`                            | Topic colour; "Ship"; success         | `#12784a` | `#5fd39a` |
| `number`                            | Topic colour; timers; env banner      | `#b05000` | `#ffb26b` |
| `comment`                           | Code comments                         | `#666c78` | `#858c9a` |

All text colours meet **WCAG AA (4.5:1)** on `bg` and `surface` in both themes.
Opacity works too: `bg-keyword/12` is a 12% tint for chips and selected states.

### Rules

1. **Colour means something.** Use the four syntax colours for topics and for states (selected,
   timer, success). Buttons, headings and layout stay ink (`fg`) and paper (`bg`/`surface`).
2. **One topic, one colour.** Topic colours are defined in `src/config/topics.ts` and used through
   `<TopicChip>` (or `TOPIC_CHIP_CLASSES`). Never pick a topic colour ad hoc.
3. **Prefer tokens over `dark:`.** Tokens already switch themes. `dark:` is only for things tokens
   can't express (e.g. swapping the sun and moon icons).
4. **Write class names in full.** Tailwind only generates classes it finds written out in full in
   the source: `text-keyword` works, `` `text-${color}` `` does not.

## Typography

| Role    | Font                       | Utility        | Use for                      |
| ------- | -------------------------- | -------------- | ---------------------------- |
| Display | Bricolage Grotesque        | `font-display` | Headings (applied to h1–h3)  |
| Body    | Atkinson Hyperlegible Next | `font-sans`    | Everything else (default)    |
| Code    | Device monospace font      | `font-mono`    | Code, tags, timers, metadata |

- **Atkinson Hyperlegible** was designed for readers with low vision: look-alike characters
  (`I l 1`, `O 0`) are clearly different, which matters for code and quiz answers.
- Both fonts are **self-hosted variable fonts** (`@fontsource-variable/*`): one file per font
  covers every weight. English pages download only the Latin subset: **2 files, ~75 KB total**.
- Code uses the device's own monospace font: zero download.

## Components

| Component     | File                               | Notes                                                 |
| ------------- | ---------------------------------- | ----------------------------------------------------- |
| `BaseLayout`  | `src/layouts/BaseLayout.astro`     | Meta tags, theme script, skip link, header, footer    |
| `SiteHeader`  | `src/components/SiteHeader.astro`  | Logo, flag-aware nav (`navFor`), GitHub, theme toggle |
| `SiteFooter`  | `src/components/SiteFooter.astro`  | Author, source link, version, environment             |
| `ThemeToggle` | `src/components/ThemeToggle.astro` | Light/dark switch, saved per device, `aria-pressed`   |
| `EnvBanner`   | `src/components/EnvBanner.astro`   | Shown on local and staging, never in production       |
| `TopicChip`   | `src/components/TopicChip.astro`   | Topic label in its syntax colour                      |
| `Logo`        | `src/components/Logo.astro`        | `prep{nest}` wordmark; screen readers hear "PrepNest" |
| `.btn`        | `src/styles/global.css`            | `.btn-primary` (ink) and `.btn-ghost` (outlined)      |

## Light and dark mode

```
 first visit ──► follow the OS (prefers-color-scheme)
 click toggle ─► <html data-theme="dark|light"> + saved in localStorage
 next visit ───► tiny inline script in <head> applies the saved theme before first paint (no flash)
```

## Logo and favicon

- **Wordmark:** `prep{nest}`: the braces are the nest.
- **Favicon** (`public/favicon.svg`): braces holding a blue dot (the "egg": what you're learning).

## Performance budget (home page)

| Asset      | Size (gzip)                                |
| ---------- | ------------------------------------------ |
| HTML       | ~3 KB                                      |
| CSS        | ~5 KB                                      |
| JavaScript | ~0.5 KB (theme toggle, inline)             |
| Fonts      | ~75 KB (2 files, cached after first visit) |

React is only loaded on pages that contain an interactive island (e.g. the quiz player in v0.5).
