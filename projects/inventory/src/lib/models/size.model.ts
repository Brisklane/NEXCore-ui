export interface SizeDto {
  id: string;
  code: string | null;
  name: string | null;
  sizeChart: string | null;
  sortOrder: number;
  isActive: boolean;
}

export interface CreateSizeDto {
  code?: string | null;
  name?: string | null;
  sizeChart?: string | null;
  sortOrder: number;
}

export interface UpdateSizeDto {
  code?: string | null;
  name?: string | null;
  sizeChart?: string | null;
  sortOrder?: number | null;
  isActive?: boolean | null;
}
