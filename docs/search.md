# Search

Article search uses [Pagefind](https://pagefind.app): a search index built from the site's HTML at
build time, searched entirely in the reader's browser. No server, no third-party service, nothing
sent anywhere.

## How it works

```
npm run build
  ├─ astro build                      → dist/client/*.html
  └─ pagefind --site dist/client       → dist/client/pagefind/ (index + engine)

/search (browser)
  type "parseInt" → load /pagefind/pagefind.js (first search only)
                  → fetch the index chunks the words need
                  → render results (title, topic chip, excerpt with <mark> highlights)
```

| What                  | Where                                                                           |
| --------------------- | ------------------------------------------------------------------------------- |
| What gets indexed     | Only elements marked `data-pagefind-body`: the article on post pages            |
| Topic filter          | `data-pagefind-filter="topic:<slug>"` on the article                            |
| Not indexed           | Post footers (`data-pagefind-ignore`), home, lists, tag pages                   |
| Search page           | `src/pages/[search].astro` (built only when the `blog` flag is on)              |
| Pure helpers (tested) | `src/lib/search.ts`: query normalisation, excerpt sanitising, clean result URLs |

## Cost for a reader

Nothing loads until they type. The first search downloads about **90 KB compressed** (engine 13 KB,
WebAssembly core 72 KB, a ~6 KB index slice), cached afterwards. Each further query fetches only small
index fragments (1–2 KB). Measured in v0.2 step 6.

## Safety

Pagefind's excerpts are HTML with matches wrapped in `<mark>`. Before inserting them,
`cleanExcerpt()` removes every tag except `<mark>`/`</mark>` (tested with `<img onerror>` and
`<script>` inputs). Everything else is created with `textContent`, never `innerHTML`.

## Details

- `?q=` keeps the query in the URL, so a search can be shared or bookmarked: `/search?q=flags`.
- Results are announced to screen readers (`role="status"`, `aria-live="polite"`).
- The search page is `noindex` (search result pages shouldn't appear in Google).
- **`npm run dev` has no index** (Pagefind runs after a build). The page shows a friendly message;
  to try search locally: `npm run build && npm run preview`.
