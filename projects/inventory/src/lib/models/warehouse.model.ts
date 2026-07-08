export interface BinDto {
  id: string;
  warehouseId: string;
  code: string | null;
  name: string | null;
  aisle: string | null;
  rack: string | null;
  level: string | null;
  position: string | null;
  capacity: number | null;
  isActive: boolean;
}

export interface WarehouseDto {
  id: string;
  code: string | null;
  name: string | null;
  address: string | null;
  city: string | null;
  region: string | null;
  postalCode: string | null;
  country: string | null;
  isActive: boolean;
  warehouseType: string | null;
}

export interface CreateWarehouseDto {
  code?: string | null;
  name?: string | null;
  address?: string | null;
  city?: string | null;
  region?: string | null;
  postalCode?: string | null;
  country?: string | null;
  warehouseType?: string | null;
}

export interface UpdateWarehouseDto {
  code?: string | null;
  name?: string | null;
  address?: string | null;
  city?: string | null;
  region?: string | null;
  postalCode?: string | null;
  country?: string | null;
  isActive?: boolean | null;
  warehouseType?: string | null;
}

export interface CreateBinDto {
  warehouseId: string;
  code?: string | null;
  name?: string | null;
  aisle?: string | null;
  rack?: string | null;
  level?: string | null;
  position?: string | null;
  capacity?: number | null;
}

export interface UpdateBinDto {
  code?: string | null;
  name?: string | null;
  aisle?: string | null;
  rack?: string | null;
  level?: string | null;
  position?: string | null;
  capacity?: number | null;
  isActive?: boolean | null;
}
