# Features

Each product feature lives in its own folder: `src/features/<name>/`.
Pages in `src/pages/` stay thin: they read the request, call a service, and render.

## Anatomy of a feature folder

```
src/features/quizzes/
├─ schema.ts          # Drizzle tables + zod validation schemas for this feature
├─ repo.ts            # Database queries only (no business rules)
├─ service.ts         # Business logic: the only thing pages and API routes call
├─ service.test.ts    # Unit tests for the service (repo and providers faked)
├─ components/        # React islands and Astro components used only by this feature
│  └─ QuizPlayer.tsx
└─ index.ts           # Public API of the feature (what other code may import)
```

## Rules

1. **Pages → service → repo.** Pages never import `repo.ts` or talk to the database directly.
2. **Features don't reach into each other's files.** Import from another feature's `index.ts` only.
3. **Outside services through providers.** Email, payments and storage go through the interfaces in
   `src/lib/providers/`, so they can be faked in tests and swapped later.
4. **New features start behind a flag** in `src/config/features.ts`.
5. **Tests live next to the code** (`service.ts` → `service.test.ts`).

## Planned features

| Folder        | Version | Purpose                                      |
| ------------- | ------- | -------------------------------------------- |
| `blog/`       | v0.2    | Post listing, topics, tags, SEO helpers      |
| `users/`      | v0.3    | User records synced from Clerk               |
| `topics/`     | v0.4    | Tech topics (JavaScript, React, DevOps…)     |
| `newsletter/` | v0.4    | Subscribers, double opt-in, free downloads   |
| `quizzes/`    | v0.5    | Questions, attempts, server-side scoring     |
| `payments/`   | v0.6    | Products, orders, enrollments, `hasAccess()` |
| `courses/`    | v0.7    | Courses, lessons, progress                   |
| `admin/`      | v0.5    | Admin-only guards and tools                  |
