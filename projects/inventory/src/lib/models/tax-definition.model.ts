export interface TaxDefinitionDto {
  id: string;
  code: string | null;
  name: string | null;
  taxType: string | null;
  rate: number;
  taxAccountId: string | null;
  applyOnSales: boolean;
  applyOnPurchases: boolean;
  isInclusive: boolean;
  isActive: boolean;
}

export interface CreateTaxDefinitionDto {
  code?: string | null;
  name?: string | null;
  taxType?: string | null;
  rate: number;
  taxAccountId?: string | null;
  applyOnSales: boolean;
  applyOnPurchases: boolean;
  isInclusive: boolean;
}

export interface UpdateTaxDefinitionDto {
  code?: string | null;
  name?: string | null;
  taxType?: string | null;
  rate?: number | null;
  taxAccountId?: string | null;
  applyOnSales?: boolean | null;
  applyOnPurchases?: boolean | null;
  isInclusive?: boolean | null;
  isActive?: boolean | null;
}
