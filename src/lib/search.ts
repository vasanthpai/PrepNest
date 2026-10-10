import { publicPath } from "@/lib/seo";

/** Longest query we send to the index; longer input is cut. */
export const MAX_QUERY_LENGTH = 100;

/** Trim, collapse whitespace, cap the length. Empty string means "no search". */
export function normalizeQuery(raw: string | null | undefined): string {
  return (raw ?? "").replace(/\s+/g, " ").trim().slice(0, MAX_QUERY_LENGTH);
}

/**
 * Pagefind excerpts are HTML with matches wrapped in <mark>. Keep only <mark>/</mark> and drop any
 * other tag, so an excerpt can be inserted with innerHTML without risking markup injection.
 */
export function cleanExcerpt(html: string): string {
  return html.replace(/<(?!\/?mark>)[^>]*>/gi, "");
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
