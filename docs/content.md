# Writing blog posts

Posts are MDX files in `src/content/blog/`. The **file name is the URL**:
`src/content/blog/deploy-is-not-release.mdx` → `/blog/deploy-is-not-release`.

## Front matter

```yaml
---
title: "Deploy is not release: feature flags in practice"
description: Ship code to production switched off, turn it on when it's ready, and roll back by flipping a value.
topic: devops
tags: [feature-flags, releases]
publishedAt: 2026-10-09
updatedAt: 2026-10-20 # optional
draft: false # optional, default false
---
```

| Field         | Rules                                                            | Used for                     |
| ------------- | ---------------------------------------------------------------- | ---------------------------- |
| `title`       | 10–90 characters. Quote it if it contains `:` or starts with `[` | Page heading, search results |
| `description` | 50–160 characters (what search engines display)                  | Meta description, post cards |
| `topic`       | One of the slugs in `src/config/topics.ts`                       | Colour, topic page, filters  |
| `tags`        | Up to 5, `lowercase-with-hyphens`                                | Tag pages                    |
| `publishedAt` | A date (`YYYY-MM-DD`)                                            | Sorting, scheduling          |
| `updatedAt`   | Optional; on or after `publishedAt`                              | "Updated" label, SEO         |
| `draft`       | Optional; `true` hides the post outside local development        | Work in progress             |

The schema lives in `src/features/blog/schema.ts`. **A post that breaks a rule fails the build**
with a message naming the field, for example:

```text
blog → deploy-is-not-release data does not match collection schema.
  topic: Unknown topic. Use one of: javascript, typescript, react, devops, databases, system-design
```

## Who sees what

| Post                              | local | staging | production |
| --------------------------------- | ----- | ------- | ---------- |
| Published (`publishedAt` ≤ today) | ✅    | ✅      | ✅         |
| `draft: true`                     | ✅    | ❌      | ❌         |
| Scheduled (`publishedAt` > today) | ✅    | ❌      | ❌         |

Pages are pre-rendered at build time, so a scheduled post appears with the **next deploy** after
its date.

## Topics

Topics and their colours are defined in `src/config/topics.ts`. Adding a topic is a code change
(new slug, label and syntax colour), reviewed like any other.

## Writing style

- **Lead with the problem** the reader has, in the first two sentences.
- **Every code sample must be correct.** Run it before publishing (the `map(parseInt)` post was
  checked line by line in Node).
- Use fenced code blocks with a language (` ```js `, ` ```tsx `, ` ```bash `) for highlighting.
- Use tables for comparisons; keep paragraphs short for phone screens.
- End with a summary the reader can remember.

## Checklist before opening a PR

- [ ] Front matter passes (`npm run build`)
- [ ] Code samples run and print what the post says
- [ ] Read it at 360px width (`npm run dev`, browser dev tools)
- [ ] `npm run check` passes (Prettier also formats Markdown tables)
