export interface UnitDto {
  id: string;
  code: string | null;
  name: string | null;
  description: string | null;
  isActive: boolean;
  displayOrder: number;
}

export interface CreateUnitDto {
  code?: string | null;
  name?: string | null;
  description?: string | null;
  displayOrder: number;
}

export interface UpdateUnitDto {
  code?: string | null;
  name?: string | null;
  description?: string | null;
  isActive?: boolean | null;
  displayOrder?: number | null;
}

export interface ItemUomConversionDto {
  id: string;
  itemId: string;
  fromUnitId: string;
  fromUnitCode: string | null;
  toUnitId: string;
  toUnitCode: string | null;
  conversionFactor: number;
  isActive: boolean;
}

export interface CreateItemUomConversionDto {
  fromUnitId: string;
  toUnitId: string;
  conversionFactor: number;
}

export interface UpdateItemUomConversionDto {
  conversionFactor?: number | null;
  isActive?: boolean | null;
}
