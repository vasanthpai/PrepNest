export interface Page<T> {
  items: T[];
  /** 1-based page number. */
  page: number;
  totalPages: number;
  totalItems: number;
  hasPrev: boolean;
  hasNext: boolean;
}

/**
 * Split a list into pages. Always returns at least one page (empty lists get one empty page,
 * so list pages can show an empty state instead of disappearing).
 */
export function paginate<T>(items: readonly T[], pageSize: number, page: number): Page<T> {
  if (!Number.isInteger(pageSize) || pageSize < 1) {
    throw new RangeError(`pageSize must be a positive integer, got ${pageSize}`);
  }
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  if (!Number.isInteger(page) || page < 1 || page > totalPages) {
    throw new RangeError(`page must be 1–${totalPages}, got ${page}`);
  }
  const start = (page - 1) * pageSize;
  return {
    items: items.slice(start, start + pageSize),
    page,
    totalPages,
    totalItems: items.length,
    hasPrev: page > 1,
    hasNext: page < totalPages,
  };
}

/** All pages of a list, for generating static routes. */
export function allPages<T>(items: readonly T[], pageSize: number): Page<T>[] {
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  return Array.from({ length: totalPages }, (_, i) => paginate(items, pageSize, i + 1));
}
