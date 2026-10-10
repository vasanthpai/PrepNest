import type { AppEnv } from "@/config/app-env";
import { type FeatureFlag, isFeatureEnabled } from "@/config/features";

export interface NavItem {
  label: string;
  href: string;
  /** If set, the item is only shown when this feature is enabled. */
  flag?: FeatureFlag;
}

export interface SiteConfig {
  name: string;
  tagline: string;
  description: string;
  /** BCP 47 locale: language + region for dates and numbers. */
  locale: string;
  author: { name: string; url: string };
  repoUrl: string;
  nav: readonly NavItem[];
}

/**
 * Brand and navigation, in one place. The public URL is per environment
 * and comes from env config (v0.1 step 8), not from here.
 */
export const site: SiteConfig = {
  name: "PrepNest",
  tagline: "Learn it. Quiz it. Ship it.",
  description:
    "Free tech articles, hands-on quizzes and practical courses for developers and students.",
  locale: "en-IN",
  author: { name: "Vasantha Pai", url: "https://github.com/vasanthpai" },
  repoUrl: "https://github.com/vasanthpai/PrepNest",
  nav: [
    { label: "Blog", href: "/blog", flag: "blog" },
    { label: "Quizzes", href: "/quizzes", flag: "quizzes" },
    { label: "Courses", href: "/courses", flag: "courses" },
    { label: "Search", href: "/search", flag: "blog" },
  ],
};

/** Navigation items visible in an environment (items behind a disabled flag are hidden). */
export function navFor(
  env: AppEnv,
  items: readonly NavItem[] = site.nav,
  isEnabled: (flag: FeatureFlag, env: AppEnv) => boolean = isFeatureEnabled,
): NavItem[] {
  return items.filter((item) => item.flag === undefined || isEnabled(item.flag, env));
}
