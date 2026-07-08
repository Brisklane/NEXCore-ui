export interface LedgerAccountDto {
  id: string;
  companyId: string;
  accountNumber: string | null;
  accountName: string | null;
  categoryId: string;
  categoryName?: string | null;
  parentAccountId: string | null;
  isPostingAllowed: boolean;
  isControlAccount: boolean;
  currencyCode: string | null;
  allowManualEntry: boolean;
  isActive: boolean;
  description: string | null;
}

export interface CreateLedgerAccountDto {
  ledgerId: string;
  accountNumber: string;
  accountName: string;
  categoryId: string;
  parentAccountId?: string | null;
  isPostingAllowed: boolean;
  isControlAccount: boolean;
  currencyCode?: string | null;
  allowManualEntry: boolean;
  isSubledgerAccount: boolean;
  subledgerMasterAccountId?: string | null;
  description?: string | null;
}

export interface UpdateLedgerAccountDto {
  accountName?: string | null;
  categoryId?: string | null;
  categoryTypeName?: string | null;
  parentAccountId?: string | null;
  currencyCode?: string | null;
  isPostingAllowed?: boolean;
  isControlAccount?: boolean;
  allowManualEntry?: boolean;
  isActive?: boolean;
  description?: string | null;
}
