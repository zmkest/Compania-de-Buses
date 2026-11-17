export type SortOrder = 'asc' | 'desc';

export interface PaginatedResponse<T> {
  items: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export function paginate<T>(items: T[], total: number, page: number, limit: number): PaginatedResponse<T> {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  return {
    items,
    meta: { total, page, limit, totalPages, hasNext: page < totalPages, hasPrev: page > 1 },
  };
}
export function pageWindow(page: number, totalPages: number, size = 5): number[] {
  const length = Math.min(size, totalPages);
  const start = Math.min(Math.max(1, page - Math.floor(size / 2)), totalPages - length + 1);
  return Array.from({ length }, (_, index) => start + index);
}
