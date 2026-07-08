import { HttpParams } from '@angular/common/http';
import { PaginationParams } from '@nexcore/core';

/**
 * Convert a PaginationParams object into the PascalCase query string the
 * backend PaginationParams binder expects (PageNumber, PageSize, SearchTerm,
 * SortBy, SortDirection, Status). Omitted/empty values are left off so the
 * backend applies its defaults. Shared by every procurement list service.
 */
export function buildPaginationParams(pagination?: PaginationParams): HttpParams {
  let params = new HttpParams();
  if (!pagination) return params;
  if (pagination.pageNumber != null) params = params.set('PageNumber', pagination.pageNumber);
  if (pagination.pageSize != null) params = params.set('PageSize', pagination.pageSize);
  if (pagination.searchTerm) params = params.set('SearchTerm', pagination.searchTerm);
  if (pagination.sortBy) params = params.set('SortBy', pagination.sortBy);
  if (pagination.sortDirection) params = params.set('SortDirection', pagination.sortDirection);
  if (pagination.status != null) params = params.set('Status', pagination.status);
  return params;
}
