export interface ApiResponse<T = void> {
  success: boolean;
  message: string | null;
  data?: T;
}

export interface PaginationMeta {
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startIndex?: number;
  endIndex?: number;
}

export interface PaginatedResponse<T> {
  success: boolean;
  message: string | null;
  data?: T[];
  /** Nested pagination object returned by some backends */
  pagination?: PaginationMeta;
  /** Flat fields returned by other backends */
  totalCount?: number;
  page?: number;
  pageNumber?: number;
  pageSize?: number;
  totalPages?: number;
}

export interface PaginationParams {
  pageNumber?: number;
  pageSize?: number;
  searchTerm?: string;
  sortBy?: string;
  sortDirection?: string;
  /** Filter by active status. Omit for all, true for active only, false for inactive only. */
  isActive?: boolean;
  /** Restrict to items holding stock in this warehouse (used by the items list warehouse filter). */
  warehouseId?: string;
  /** Filter by an entity status enum value (used by procurement list status dropdowns). */
  status?: number;
}

export interface ApiErrorResponse {
  message: string | null;
  errors: string[] | null;
}
