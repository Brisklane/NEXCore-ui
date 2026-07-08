// Matches CurrencyDto / CreateCurrencyDto / UpdateCurrencyDto from backend Swagger schema
export interface CurrencyDto {
  id: string;
  companyId?: string;
  currencyCode?: string;
  currencyName?: string;
  symbol?: string;
  isActive: boolean;
  createdAt: string;
  modifiedAt?: string;
}

export interface CreateCurrencyDto {
  currencyCode?: string;
  currencyName?: string;
  symbol?: string;
}

export interface UpdateCurrencyDto {
  currencyName?: string;
  symbol?: string;
  isActive?: boolean;
}
