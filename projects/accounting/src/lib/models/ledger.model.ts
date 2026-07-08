export interface LedgerDto {
  id: string;
  companyId: string;
  name: string | null;
  baseCurrencyCode: string | null;
  fiscalCalendarId: string;
  isDefault: boolean;
  isActive: boolean;
  description: string | null;
  createdAt: string;
  modifiedAt: string | null;
}

export interface CreateLedgerDto {
  name: string;
  baseCurrencyCode: string;
  fiscalCalendarId: string;
  isDefault: boolean;
  description?: string | null;
}

export interface UpdateLedgerDto {
  name?: string | null;
  baseCurrencyCode?: string | null;
  fiscalCalendarId?: string | null;
  isDefault?: boolean | null;
  isActive?: boolean | null;
  description?: string | null;
}
