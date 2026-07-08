import { environment } from '@env';
const BASE_URL = environment.apiBaseUrl;

export const ACCOUNTING_API = {
  // Ledger — Full CRUD
  ledger: {
    getAll: `${BASE_URL}/api/v1/Ledger`,
    getById: (id: string) => `${BASE_URL}/api/v1/Ledger/${id}`,
    create: `${BASE_URL}/api/v1/Ledger`,
    update: (id: string) => `${BASE_URL}/api/v1/Ledger/${id}`,
    delete: (id: string) => `${BASE_URL}/api/v1/Ledger/${id}`,
  },
  // LedgerAccount — Full CRUD + actions
  ledgerAccount: {
    create: `${BASE_URL}/api/v1/LedgerAccount`,
    chartOfAccounts: (ledgerId: string) => `${BASE_URL}/api/v1/LedgerAccount/by-ledger/${ledgerId}`,
    getById: (id: string) => `${BASE_URL}/api/v1/LedgerAccount/${id}`,
    getByLedger: (ledgerId: string) => `${BASE_URL}/api/v1/LedgerAccount/by-ledger/${ledgerId}`,
    update: (id: string) => `${BASE_URL}/api/v1/LedgerAccount/${id}`,
    delete: (id: string) => `${BASE_URL}/api/v1/LedgerAccount/${id}`,
    getByNumber: (ledgerId: string, accountNumber: string) =>
      `${BASE_URL}/api/v1/LedgerAccount/${ledgerId}/by-number/${accountNumber}`,
    getByCategory: (ledgerId: string, categoryId: string) =>
      `${BASE_URL}/api/v1/LedgerAccount/${ledgerId}/category/${categoryId}`,
    getSubledger: (ledgerId: string, masterAccountId: string) =>
      `${BASE_URL}/api/v1/LedgerAccount/${ledgerId}/master/${masterAccountId}/subledger`,
    activate: (id: string) => `${BASE_URL}/api/v1/LedgerAccount/${id}/activate`,
    deactivate: (id: string) => `${BASE_URL}/api/v1/LedgerAccount/${id}/deactivate`,
  },
  // JournalEntry — Create / Read / Update + actions (no delete)
  journalEntry: {
    create: `${BASE_URL}/api/v1/JournalEntry`,
    getById: (id: string) => `${BASE_URL}/api/v1/JournalEntry/${id}`,
    update: (id: string) => `${BASE_URL}/api/v1/JournalEntry/${id}`,
    delete: (id: string) => `${BASE_URL}/api/v1/JournalEntry/${id}`,
    getByLedger: (ledgerId: string) => `${BASE_URL}/api/v1/JournalEntry/ledger/${ledgerId}`,
    getByDateRange: `${BASE_URL}/api/v1/JournalEntry/by-date-range`,
    getByStatus: (status: number) => `${BASE_URL}/api/v1/JournalEntry/status/${status}`,
    submit: (id: string) => `${BASE_URL}/api/v1/JournalEntry/${id}/submit`,
    post: (id: string) => `${BASE_URL}/api/v1/JournalEntry/${id}/post`,
    reverse: (id: string) => `${BASE_URL}/api/v1/JournalEntry/${id}/reverse`,
  },
  // FiscalCalendar — Full CRUD + close/reopen
  fiscalCalendar: {
    getAll: `${BASE_URL}/api/v1/FiscalCalendar`,
    getById: (id: string) => `${BASE_URL}/api/v1/FiscalCalendar/${id}`,
    getPeriods: (calendarId: string) => `${BASE_URL}/api/v1/FiscalCalendar/${calendarId}/periods`,
    create: `${BASE_URL}/api/v1/FiscalCalendar`,
    update: (id: string) => `${BASE_URL}/api/v1/FiscalCalendar/${id}`,
    delete: (id: string) => `${BASE_URL}/api/v1/FiscalCalendar/${id}`,
    close: (id: string) => `${BASE_URL}/api/v1/FiscalCalendar/${id}/close`,
    reopen: (id: string) => `${BASE_URL}/api/v1/FiscalCalendar/${id}/reopen`,
  },
  // FiscalPeriod — Full CRUD + close (separate controller)
  fiscalPeriod: {
    getAll: `${BASE_URL}/api/v1/FiscalPeriod`,
    getById: (id: string) => `${BASE_URL}/api/v1/FiscalPeriod/${id}`,
    getByCalendar: (calendarId: string) => `${BASE_URL}/api/v1/FiscalPeriod/calendar/${calendarId}`,
    create: `${BASE_URL}/api/v1/FiscalPeriod`,
    update: (id: string) => `${BASE_URL}/api/v1/FiscalPeriod/${id}`,
    delete: (id: string) => `${BASE_URL}/api/v1/FiscalPeriod/${id}`,
    close: (id: string) => `${BASE_URL}/api/v1/FiscalPeriod/${id}/close`,
  },
  // AccountCategory — Read-only
  accountCategory: {
    getAll: `${BASE_URL}/api/v1/AccountCategory`,
    getById: (id: string) => `${BASE_URL}/api/v1/AccountCategory/${id}`,
  },
  // AccountBalance — Read-only
  accountBalance: {
    getByAccountAndPeriod: (accountId: string, periodId: string) =>
      `${BASE_URL}/api/v1/AccountBalance/account/${accountId}/period/${periodId}`,
    getByPeriod: (periodId: string) => `${BASE_URL}/api/v1/AccountBalance/period/${periodId}`,
    getByAccount: (accountId: string) => `${BASE_URL}/api/v1/AccountBalance/account/${accountId}`,
  },
  // Dimension — Full CRUD for dimensions; values are read-only
  dimension: {
    getAll: `${BASE_URL}/api/v1/Dimension`,
    getById: (id: string) => `${BASE_URL}/api/v1/Dimension/${id}`,
    getByCode: (code: string) => `${BASE_URL}/api/v1/Dimension/code/${code}`,
    create: `${BASE_URL}/api/v1/Dimension`,
    update: (id: string) => `${BASE_URL}/api/v1/Dimension/${id}`,
    delete: (id: string) => `${BASE_URL}/api/v1/Dimension/${id}`,
    getValues: (dimensionId: string) => `${BASE_URL}/api/v1/Dimension/${dimensionId}/values`,
  },
  // TaxCode — Read-only
  taxCode: {
    getAll: `${BASE_URL}/api/v1/TaxCode`,
    getByCode: (code: string) => `${BASE_URL}/api/v1/TaxCode/${code}`,
  },
  // PostingProfile — Read-only
  postingProfile: {
    getByModuleAndType: (moduleName: string, transactionType: string) =>
      `${BASE_URL}/api/v1/PostingProfile/module/${moduleName}/type/${transactionType}`,
    getByModule: (moduleName: string) => `${BASE_URL}/api/v1/PostingProfile/module/${moduleName}`,
  },
  // Geo — Read-only reference data
  geo: {
    currencies: `${BASE_URL}/api/core/geo/currencies`,
  },
  // FinancialReports — Read-only report endpoints
  financialReports: {
    trialBalance: `${BASE_URL}/api/v1/reports/trial-balance`,
    generalLedger: `${BASE_URL}/api/v1/reports/general-ledger`,
    accountLedger: (accountId: string) => `${BASE_URL}/api/v1/reports/account-ledger/${accountId}`,
    profitAndLoss: `${BASE_URL}/api/v1/reports/profit-and-loss`,
    balanceSheet: `${BASE_URL}/api/v1/reports/balance-sheet`,
    journal: `${BASE_URL}/api/v1/reports/journal`,
    journalAudit: `${BASE_URL}/api/v1/reports/journal-audit`,
    arAging: `${BASE_URL}/api/v1/reports/ar-aging`,
    apAging: `${BASE_URL}/api/v1/reports/ap-aging`,
    customerStatement: (customerCode: string) => `${BASE_URL}/api/v1/reports/customer-statement/${customerCode}`,
    vendorStatement: (vendorCode: string) => `${BASE_URL}/api/v1/reports/vendor-statement/${vendorCode}`,
    taxSummary: `${BASE_URL}/api/v1/reports/tax-summary`,
    cashFlow: `${BASE_URL}/api/v1/reports/cash-flow`,
    unpostedJournals: `${BASE_URL}/api/v1/reports/unposted-journals`,
    trialBalanceByDimension: (dimensionId: string) => `${BASE_URL}/api/v1/reports/trial-balance-by-dimension/${dimensionId}`,
    profitAndLossByDimension: (dimensionId: string) => `${BASE_URL}/api/v1/reports/profit-and-loss-by-dimension/${dimensionId}`,
    reconciliation: (accountId: string) => `${BASE_URL}/api/v1/reports/reconciliation/${accountId}`,
    dailyTransactions: `${BASE_URL}/api/v1/reports/daily-transactions`,
  },
};
