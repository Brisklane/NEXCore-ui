export interface DimensionDto {
  id: string;
  companyId: string;
  code: string | null;
  name: string | null;
  isActive: boolean;
  description: string | null;
}

export interface CreateDimensionDto {
  code: string;
  name: string;
  description?: string | null;
}

export interface UpdateDimensionDto {
  name?: string | null;
  isActive?: boolean | null;
  description?: string | null;
}

export interface DimensionValueDto {
  id: string;
  companyId: string;
  dimensionId: string;
  valueCode: string | null;
  valueName: string | null;
  isActive: boolean;
  description: string | null;
}
