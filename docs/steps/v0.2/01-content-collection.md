# v0.2 step 1: Blog content collection, helpers and sample posts

**Ticket:** [#22](https://github.com/vasanthpai/PrepNest/issues/22) · **Branch:** `feature/v0.2-blog` ·
**Commit:** `feat: add blog content collection, helpers and sample posts`

## Goal

Posts as MDX files validated by a schema, the blog's logic in a tested service, and three real
sample posts.

## What changed

| File                                    | Change                                                                              |
| --------------------------------------- | ----------------------------------------------------------------------------------- |
| `astro.config.mjs`, `package.json`      | `@astrojs/mdx` integration                                                          |
| `src/content.config.ts`                 | New: `blog` collection (glob loader over `src/content/blog`)                        |
| `src/features/blog/schema.ts`           | New: front matter rules (title, description, topic, tags, dates, draft)             |
| `src/features/blog/service.ts`          | New: visibility per env, newest first, by topic/tag, tag counts, reading time, URLs |
| `src/features/blog/repo.ts`, `index.ts` | New: reads the collection; public API of the feature                                |
| `src/features/blog/*.test.ts`           | New: 24 tests (108 total)                                                           |
| `src/content/blog/*.mdx`                | New: 3 posts (React, JavaScript, DevOps)                                            |
| `src/config/features.ts`                | `blog` flag on for `local`                                                          |
| `docs/content.md`                       | New: how to write a post, rules, who sees what, checklist                           |

## Why

- **Schema = build-time safety:** a bad topic, date or description length can't reach production.
- **Drafts and scheduled posts** are visible locally only, so writers can preview safely.
- **Pure service + thin repo:** the logic is unit-tested without Astro; only `repo.ts` touches
  `astro:content`. This is the feature-folder pattern from `src/features/README.md`.
- **Description 50–160 characters** matches what search engines display (sets up step 4, SEO).

## Content accuracy

Every JavaScript claim in the `map(parseInt)` post was run in Node 24 before committing:
`["1","7","11"].map(parseInt)` → `[1, NaN, 3]`; the `Number` vs `parseInt` table (5 rows) matches.

## Proof it works

| Test                     | Result                                                                                       |
| ------------------------ | -------------------------------------------------------------------------------------------- |
| Build                    | 3 posts loaded into the content store                                                        |
| Post with `topic: cobol` | ❌ build fails: `topic: Unknown topic. Use one of: javascript, typescript, react, …`         |
| Unit tests               | Drafts/scheduled per env, sorting with ties, filters, tag counts, reading time, schema rules |

## Validation

- [x] Build validates all posts; a bad topic fails with a clear message
- [x] Unit tests cover visibility, sorting, filters, reading time, schema
- [x] lint, format, typecheck, tests pass
