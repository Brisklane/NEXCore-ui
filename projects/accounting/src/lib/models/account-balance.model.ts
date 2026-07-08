export interface AccountBalanceDto {
  id: string;
  companyId: string;
  ledgerAccountId: string;
  fiscalPeriodId: string;
  openingBalance: number;
  debitTotal: number;
  creditTotal: number;
  closingBalance: number;
  balanceType: string | null;
}
