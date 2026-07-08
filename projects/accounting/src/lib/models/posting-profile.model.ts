export interface PostingProfileDto {
  id: string;
  companyId: string;
  moduleName: string | null;
  transactionType: string | null;
  debitAccountId: string;
  creditAccountId: string;
  taxAccountId: string | null;
  isActive: boolean;
  description: string | null;
}
