// ─── Enums ───────────────────────────────────────────────────────────────────

export enum DocumentType {
  Quotation = 0,
  SalesOrder = 1,
  Invoice = 2,
  CreditNote = 3,
  Payment = 4,
  Delivery = 5,
  SalesReturn = 6,
  PosSession = 7,
  PosTransaction = 8,
  RiderAssignment = 9,
}

export enum SequenceYearFormat {
  Full = 0,
  Short = 1,
}

export enum SequenceResetPeriod {
  Never = 0,
  Yearly = 1,
  Monthly = 2,
  Daily = 3,
}

// ─── Response DTO ─────────────────────────────────────────────────────────────

export interface DocumentSequenceDto {
  id: string;
  documentType: DocumentType | number;
  description: string | null;
  prefix: string | null;
  suffix: string | null;
  separator: string | null;
  includeYear: boolean;
  yearFormat: SequenceYearFormat | number;
  includeMonth: boolean;
  includeDay: boolean;
  sequencePadding: number;
  resetOn: SequenceResetPeriod | number;
  nextSequenceNumber: number;
  lastResetYear: number | null;
  lastResetMonth: number | null;
  lastResetDay: number | null;
  isActive: boolean;
  nextNumberPreview: string | null;
  nextCodeIntPreview: number;
}

export interface PreviewSequenceFormatResultDto {
  preview: string | null;
  pattern: string | null;
  codeIntPreview: number;
}

// ─── Create / Update DTOs ─────────────────────────────────────────────────────

export interface CreateDocumentSequenceDto {
  documentType: DocumentType | number;
  description?: string | null;
  prefix?: string | null;
  suffix?: string | null;
  separator?: string | null;
  includeYear?: boolean;
  yearFormat?: SequenceYearFormat | number;
  includeMonth?: boolean;
  includeDay?: boolean;
  sequencePadding?: number;
  resetOn?: SequenceResetPeriod | number;
  startFrom?: number;
}

export interface UpdateDocumentSequenceDto {
  description?: string | null;
  prefix?: string | null;
  suffix?: string | null;
  separator?: string | null;
  includeYear?: boolean | null;
  yearFormat?: SequenceYearFormat | number;
  includeMonth?: boolean | null;
  includeDay?: boolean | null;
  sequencePadding?: number | null;
  resetOn?: SequenceResetPeriod | number;
  isActive?: boolean | null;
}

export interface ResetSequenceDto {
  resetTo: number;
}

export interface PreviewSequenceFormatDto {
  prefix?: string | null;
  suffix?: string | null;
  separator?: string | null;
  includeYear?: boolean;
  yearFormat?: SequenceYearFormat | number;
  includeMonth?: boolean;
  includeDay?: boolean;
  sequencePadding?: number;
  sampleNumber?: number;
}
