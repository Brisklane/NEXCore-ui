export interface FiscalCalendarDto {
  id: string;
  companyId: string;
  name: string | null;
  startDate: string;
  endDate: string;
  isActive: boolean;
  description: string | null;
  isClosed: boolean;
  hasTransactions: boolean;
}

export interface CreateFiscalCalendarDto {
  name: string;
  startDate: string;
  endDate: string;
  description?: string | null;
}

export interface UpdateFiscalCalendarDto {
  name?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  description?: string | null;
}

export interface FiscalPeriodDto {
  id: string;
  companyId: string;
  fiscalCalendarId: string;
  periodName: string | null;
  startDate: string;
  endDate: string;
  isClosed: boolean;
  description: string | null;
}

export interface CreateFiscalPeriodDto {
  fiscalCalendarId: string;
  periodName: string;
  startDate: string;
  endDate: string;
  description?: string | null;
}

export interface UpdateFiscalPeriodDto {
  periodName?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  isClosed?: boolean | null;
  description?: string | null;
}
