# 0001. Record architecture decisions

- **Status:** Accepted
- **Date:** 2026-10-09
- **Ticket:** [#6](https://github.com/vasanthpai/PrepNest/issues/6)

## Context

PrepNest is built in public over many versions. Code shows _what_ was built but not _why_.
Without a record, past trade-offs get forgotten and good decisions get undone by accident.

## Decision

Record every significant decision as a numbered Markdown file in `docs/decisions/`, using the
template in the [index](README.md). Accepted ADRs are not edited; a new ADR supersedes an old one.

## Consequences

- Reviewers and interviewers can follow the reasoning behind the architecture.
- A small writing cost per major decision.

## Alternatives considered

- **Wiki or GitHub Discussions**: separate from the code, so they drift out of date.
- **Code comments only**: good for local reasoning, bad for decisions spanning many files.
