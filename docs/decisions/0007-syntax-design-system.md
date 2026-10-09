# 0007. "Syntax" design system with self-hosted fonts

- **Status:** Accepted
- **Date:** 2026-10-09
- **Ticket:** [#5](https://github.com/vasanthpai/PrepNest/issues/5)

## Context

The site needs a look that is distinctive but professional, works in light and dark, stays readable
for code and quiz answers on small screens, and loads fast on slow mobile data.

## Decision

Three directions were mocked up with real content (Blueprint, Syntax, Flashcard). We chose
**Syntax**: an ink-and-paper interface where colour only carries meaning, using code-highlighting
colours, with each tech topic owning one colour. Fonts: Bricolage Grotesque (display) and Atkinson
Hyperlegible Next (body), **self-hosted variable fonts**; code uses the device's monospace font.
Colours are semantic tokens that switch with the theme. Every text colour meets WCAG AA.
Full guide: [design-system.md](../design-system.md).

## Consequences

- Topic colours double as navigation cues across blog, quizzes and courses.
- Discipline needed: colour must not be used decoratively, or it stops meaning anything.
- 2 font files (~75 KB, cached); no third-party font requests (privacy, no extra DNS lookups).

## Alternatives considered

- **Blueprint** (engineering-drawing style): precise but could feel cold.
- **Flashcard** (index-card style): warm but playful for advanced topics.
- **Google Fonts hosted**: extra third-party requests; self-hosting is faster and private.
