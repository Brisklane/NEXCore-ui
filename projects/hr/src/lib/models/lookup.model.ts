export interface LookupTypeDto {
  id: string;
  code?: string;
  name?: string;
  description?: string;
  moduleName?: string;
  entityName?: string;
  sortOrder?: number;
  isActive?: boolean;
  createdAt: string;
}

export interface CreateLookupTypeDto {
  code?: string;
  name?: string;
  description?: string;
  moduleName?: string;
  entityName?: string;
  sortOrder?: number;
}

export interface LookupValueDto {
  id: string;
  lookupTypeId?: string;
  code?: string;
  name?: string;
  description?: string;
  sortOrder?: number;
  isActive?: boolean;
  createdAt: string;
}

export interface CreateLookupValueDto {
  lookupTypeId: string;
  code?: string;
  name?: string;
  description?: string;
  sortOrder?: number;
}
