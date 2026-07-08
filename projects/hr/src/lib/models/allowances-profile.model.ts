export interface AllowancesProfileDto {
  id: string;
  name: string | null;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  modifiedAt: string | null;
}

export interface CreateAllowancesProfileDto {
  name: string;
  description?: string | null;
}

export interface UpdateAllowancesProfileDto {
  name?: string | null;
  description?: string | null;
  isActive?: boolean | null;
}
