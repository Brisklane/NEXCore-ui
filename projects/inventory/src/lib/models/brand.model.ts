export interface BrandDto {
  id: string;
  code: string | null;
  name: string | null;
  description: string | null;
  logoUrl: string | null;
  website: string | null;
  isActive: boolean;
}

export interface CreateBrandDto {
  code?: string | null;
  name?: string | null;
  description?: string | null;
  logoUrl?: string | null;
  website?: string | null;
}

export interface UpdateBrandDto {
  code?: string | null;
  name?: string | null;
  description?: string | null;
  logoUrl?: string | null;
  website?: string | null;
  isActive?: boolean | null;
}
