import { publicPath } from "@/lib/seo";

/** Longest query we send to the index; longer input is cut. */
export const MAX_QUERY_LENGTH = 100;

/** Trim, collapse whitespace, cap the length. Empty string means "no search". */
export function normalizeQuery(raw: string | null | undefined): string {
  return (raw ?? "").replace(/\s+/g, " ").trim().slice(0, MAX_QUERY_LENGTH);
}

const HIGHLIGHT_MARKER = /(<\/?mark>)/;

/**
 * Pagefind excerpts are HTML with matches wrapped in <mark>. Make them safe for innerHTML:
 * split on the exact "<mark>" / "</mark>" markers, escape every "<" and ">" in everything else,
 * and join the pieces back.
 *
 * Escaping instead of deleting tags matters: deleting can be tricked ("<<b>script>" becomes
 * "<script>" once "<b>" is removed; CodeQL js/incomplete-multi-character-sanitization). After
 * escaping, nothing except a bare <mark> or </mark> can ever be markup.
 */
export function cleanExcerpt(html: string): string {
  return html
    .split(HIGHLIGHT_MARKER)
    .map((part) =>
      part === "<mark>" || part === "</mark>"
        ? part
        : part.replaceAll("<", "&lt;").replaceAll(">", "&gt;"),
    )
    .join("");
}

/** Pagefind reports file URLs ("/blog/my-post.html"); link to the public URL instead. */
export function resultUrl(pagefindUrl: string): string {
  return publicPath(pagefindUrl);
}

/** "1 result", "3 results" for the live status message. */
export function resultsMessage(count: number, query: string): string {
  if (!query) return "";
  if (count === 0) return `No articles match “${query}”. Try a shorter or different word.`;
  return `${count} ${count === 1 ? "result" : "results"} for “${query}”`;
}
