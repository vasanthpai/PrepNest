/**
 * Tech topics and their syntax colour. A topic keeps its colour everywhere:
 * nav, tags, blog cards, quizzes and courses. In v0.4 this list moves to the database;
 * the colour roles stay the same.
 */
export const TOPIC_COLORS = ["keyword", "function", "string", "number"] as const;

export type TopicColor = (typeof TOPIC_COLORS)[number];

export interface Topic {
  slug: string;
  label: string;
  color: TopicColor;
}

export const topics: readonly Topic[] = [
  { slug: "javascript", label: "JavaScript", color: "number" },
  { slug: "typescript", label: "TypeScript", color: "function" },
  { slug: "react", label: "React", color: "function" },
  { slug: "devops", label: "DevOps", color: "string" },
  { slug: "databases", label: "Databases", color: "string" },
  { slug: "system-design", label: "System Design", color: "keyword" },
];

/**
 * Full class names per colour. Tailwind only generates classes it can find written out in
 * full in the source, so they can't be built with string templates like `text-${color}`.
 */
export const TOPIC_CHIP_CLASSES: Record<TopicColor, string> = {
  keyword: "text-keyword bg-keyword/12",
  function: "text-function bg-function/12",
  string: "text-string bg-string/12",
  number: "text-number bg-number/12",
};

export function findTopic(slug: string): Topic | undefined {
  return topics.find((topic) => topic.slug === slug);
}
