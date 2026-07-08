export interface ColorDto {
  id: string;
  code: string | null;
  name: string | null;
  hexCode: string | null;
  r: number | null;
  g: number | null;
  b: number | null;
  colorFamily: string | null;
  swatchImageUrl: string | null;
  displayOrder: number;
  isActive: boolean;
}

export interface CreateColorDto {
  code?: string | null;
  name?: string | null;
  hexCode?: string | null;
  r?: number | null;
  g?: number | null;
  b?: number | null;
  colorFamily?: string | null;
  swatchImageUrl?: string | null;
  displayOrder: number;
}

export interface UpdateColorDto {
  code?: string | null;
  name?: string | null;
  hexCode?: string | null;
  r?: number | null;
  g?: number | null;
  b?: number | null;
  colorFamily?: string | null;
  swatchImageUrl?: string | null;
  displayOrder?: number | null;
  isActive?: boolean | null;
}
