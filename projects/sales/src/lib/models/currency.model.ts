// ─── Enums ───────────────────────────────────────────────────────────────────

export enum ExchangeRateType {
  Official = 0,
  Buying = 1,
  Selling = 2,
  Custom = 3,
}

// ─── Response DTOs ────────────────────────────────────────────────────────────

/** Lightweight DTO returned by /api/core/geo/currencies — ISO 4217 reference list. */
export interface GeoCurrencyDto {
  id: string;
  code: string;
  name: string;
  symbol: string | null;
  decimalPlaces: number;
  isActive: boolean;
}

export interface CurrencyDto {
  id: string;
  code: string | null;
  name: string | null;
  symbol: string | null;
  decimalPlaces: number;
  isBaseCurrency: boolean;
  isActive: boolean;
  latestOfficialRate: number | null;
  latestRateDate: string | null;
}

export interface CurrencyRateDto {
  id: string;
  currencyId: string;
  currencyCode: string | null;
  baseCurrencyCode: string | null;
  rate: number;
  rateType: ExchangeRateType | number;
  rateName: string | null;
  effectiveDate: string;
  validUntil: string | null;
  source: string | null;
  notes: string | null;
}

export interface CurrencyConversionResultDto {
  originalAmount: number;
  fromCurrencyCode: string | null;
  toCurrencyCode: string | null;
  convertedAmount: number;
  rateUsed: number;
  rateType: ExchangeRateType | number;
  rateDate: string;
  rateSource: string | null;
}

export interface BulkConversionLineResultDto {
  reference: string | null;
  originalAmount: number;
  originalCurrencyCode: string | null;
  convertedAmount: number;
  rateUsed: number;
  rateDate: string;
}

export interface BulkConversionResultDto {
  targetCurrencyCode: string | null;
  rateType: ExchangeRateType | number;
  totalConverted: number;
  lines: BulkConversionLineResultDto[];
}

// ─── Create / Update DTOs ─────────────────────────────────────────────────────

export interface CreateCurrencyDto {
  code: string;
  name: string;
  symbol: string;
  decimalPlaces?: number;
  isBaseCurrency?: boolean;
}

export interface UpdateCurrencyDto {
  name?: string | null;
  symbol?: string | null;
  decimalPlaces?: number | null;
  isActive?: boolean | null;
}

export interface CreateCurrencyRateDto {
  currencyId: string;
  rate: number;
  rateType?: ExchangeRateType | number;
  rateName?: string | null;
  effectiveDate: string;
  validUntil?: string | null;
  source?: string | null;
  notes?: string | null;
}

export interface UpdateCurrencyRateDto {
  rate?: number | null;
  rateName?: string | null;
  validUntil?: string | null;
  source?: string | null;
  notes?: string | null;
}

export interface CurrencyConversionRequestDto {
  amount: number;
  fromCurrencyCode: string;
  toCurrencyCode?: string | null;
  rateType?: ExchangeRateType | number;
  rateName?: string | null;
  asOfDate?: string | null;
}

export interface BulkConversionLineDto {
  reference?: string | null;
  amount: number;
  currencyCode: string | null;
  documentDate?: string | null;
}

export interface BulkConversionRequestDto {
  lines: BulkConversionLineDto[];
  targetCurrencyCode: string | null;
  rateType?: ExchangeRateType | number;
  rateName?: string | null;
  asOfDate?: string | null;
}
