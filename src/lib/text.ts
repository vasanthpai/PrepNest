/**
 * "1 article", "3 articles". Returns one string so templates can't lose the space between the
 * number and the word (Astro drops whitespace between two `{…}` expressions on separate lines).
 */
export function countLabel(count: number, singular: string, plural = `${singular}s`): string {
  return `${count} ${count === 1 ? singular : plural}`;
}
