export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

export function parsePagination(searchParams: URLSearchParams) {
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);
  const rawSize = parseInt(searchParams.get("pageSize") ?? String(DEFAULT_PAGE_SIZE), 10) || DEFAULT_PAGE_SIZE;
  const pageSize = Math.min(MAX_PAGE_SIZE, Math.max(1, rawSize));
  const skip = (page - 1) * pageSize;
  return { page, pageSize, skip };
}

export function parseSort(searchParams: URLSearchParams, allowed: string[], defaultSort: string, defaultOrder: "asc" | "desc") {
  const sortBy = searchParams.get("sortBy") ?? defaultSort;
  const sortOrder = (searchParams.get("sortOrder") ?? defaultOrder) as "asc" | "desc";
  const validSort = allowed.includes(sortBy) ? sortBy : defaultSort;
  const validOrder = sortOrder === "asc" || sortOrder === "desc" ? sortOrder : defaultOrder;
  return { sortBy: validSort, sortOrder: validOrder };
}
