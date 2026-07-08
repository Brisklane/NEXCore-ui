export interface JournalLineDto {
  id: string;
  ledgerAccountId: string;
  debitAmount: number;
  creditAmount: number;
  lineNumber: number;
  description?: string | null;
}

export interface JournalEntryDto {
  id: string;
  companyId: string;
  journalNumber: string | null;
  referenceNumber: string | null;
  documentType: string | null;
  postingDate: string;
  documentDate: string;
  description: string | null;
  currencyCode: string | null;
  totalDebit: number;
  totalCredit: number;
  status: string | null;
  lines?: JournalLineDto[];
}

export interface CreateJournalEntryDto {
  ledgerId: string;
  documentType: string;
  postingDate: string;
  documentDate: string;
  description: string;
  currencyCode: string;
  referenceNumber?: string | null;
  lines?: CreateJournalLineDto[] | null;
}

export interface CreateJournalLineDto {
  ledgerAccountId: string;
  debitAmount: number;
  creditAmount: number;
  currencyCode: string;
  description?: string | null;
  lineNumber: number;
}

export interface UpdateJournalEntryDto {
  description?: string | null;
  referenceNumber?: string | null;
  postingDate?: string | null;
  lines?: CreateJournalLineDto[] | null;
}

export enum JournalEntryStatus {
  Draft = 1,
  Submitted = 2,
  Approved = 3,
  Posted = 4,
  Rejected = 5,
  Reversed = 6,
  Cancelled = 7,
  PendingApproval = 8,
  PartiallyPosted = 9,
  Voided = 10,
}

export const JournalEntryStatusLabels: Record<number, string> = {
  [JournalEntryStatus.Draft]: 'Draft',
  [JournalEntryStatus.Submitted]: 'Submitted',
  [JournalEntryStatus.Approved]: 'Approved',
  [JournalEntryStatus.Posted]: 'Posted',
  [JournalEntryStatus.Rejected]: 'Rejected',
  [JournalEntryStatus.Reversed]: 'Reversed',
  [JournalEntryStatus.Cancelled]: 'Cancelled',
  [JournalEntryStatus.PendingApproval]: 'Pending Approval',
  [JournalEntryStatus.PartiallyPosted]: 'Partially Posted',
  [JournalEntryStatus.Voided]: 'Voided',
};