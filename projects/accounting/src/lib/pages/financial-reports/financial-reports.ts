import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FinancialReportsService } from '../../services/financial-reports.service';
import { LedgerService } from '../../services/ledger.service';
import { LedgerAccountService } from '../../services/ledger-account.service';
import { DimensionService } from '../../services/dimension.service';
import { LedgerDto } from '../../models/ledger.model';

export type ReportType =
  | 'trial-balance'
  | 'general-ledger'
  | 'account-ledger'
  | 'profit-and-loss'
  | 'balance-sheet'
  | 'journal'
  | 'journal-audit'
  | 'ar-aging'
  | 'ap-aging'
  | 'customer-statement'
  | 'vendor-statement'
  | 'tax-summary'
  | 'cash-flow'
  | 'unposted-journals'
  | 'trial-balance-by-dimension'
  | 'profit-and-loss-by-dimension'
  | 'reconciliation'
  | 'daily-transactions';

interface ReportMeta {
  key: ReportType;
  label: string;
  category: string;
  needsLedger: boolean;
  needsDateRange: boolean;
  needsReportDate: boolean;
  needsAsOfDate: boolean;
  needsAccountId: boolean;
  needsCustomerCode: boolean;
  needsVendorCode: boolean;
  needsDimensionId: boolean;
}

const REPORT_CATALOG: ReportMeta[] = [
  // Core Financial Statements
  { key: 'trial-balance', label: 'Trial Balance', category: 'Financial Statements', needsLedger: true, needsDateRange: false, needsReportDate: true, needsAsOfDate: false, needsAccountId: false, needsCustomerCode: false, needsVendorCode: false, needsDimensionId: false },
  { key: 'balance-sheet', label: 'Balance Sheet', category: 'Financial Statements', needsLedger: true, needsDateRange: false, needsReportDate: true, needsAsOfDate: false, needsAccountId: false, needsCustomerCode: false, needsVendorCode: false, needsDimensionId: false },
  { key: 'profit-and-loss', label: 'Profit & Loss', category: 'Financial Statements', needsLedger: true, needsDateRange: true, needsReportDate: false, needsAsOfDate: false, needsAccountId: false, needsCustomerCode: false, needsVendorCode: false, needsDimensionId: false },
  { key: 'cash-flow', label: 'Cash Flow Statement', category: 'Financial Statements', needsLedger: true, needsDateRange: true, needsReportDate: false, needsAsOfDate: false, needsAccountId: false, needsCustomerCode: false, needsVendorCode: false, needsDimensionId: false },

  // Ledger Reports
  { key: 'general-ledger', label: 'General Ledger', category: 'Ledger Reports', needsLedger: true, needsDateRange: true, needsReportDate: false, needsAsOfDate: false, needsAccountId: false, needsCustomerCode: false, needsVendorCode: false, needsDimensionId: false },
  { key: 'account-ledger', label: 'Account Ledger', category: 'Ledger Reports', needsLedger: false, needsDateRange: true, needsReportDate: false, needsAsOfDate: false, needsAccountId: true, needsCustomerCode: false, needsVendorCode: false, needsDimensionId: false },
  { key: 'daily-transactions', label: 'Daily Transactions', category: 'Ledger Reports', needsLedger: true, needsDateRange: false, needsReportDate: true, needsAsOfDate: false, needsAccountId: false, needsCustomerCode: false, needsVendorCode: false, needsDimensionId: false },

  // Journal Reports
  { key: 'journal', label: 'Journal Report', category: 'Journal Reports', needsLedger: true, needsDateRange: true, needsReportDate: false, needsAsOfDate: false, needsAccountId: false, needsCustomerCode: false, needsVendorCode: false, needsDimensionId: false },
  { key: 'journal-audit', label: 'Journal Audit Trail', category: 'Journal Reports', needsLedger: true, needsDateRange: true, needsReportDate: false, needsAsOfDate: false, needsAccountId: false, needsCustomerCode: false, needsVendorCode: false, needsDimensionId: false },
  { key: 'unposted-journals', label: 'Unposted Journals', category: 'Journal Reports', needsLedger: true, needsDateRange: false, needsReportDate: false, needsAsOfDate: false, needsAccountId: false, needsCustomerCode: false, needsVendorCode: false, needsDimensionId: false },

  // Receivables & Payables
  { key: 'ar-aging', label: 'AR Aging', category: 'Receivables & Payables', needsLedger: false, needsDateRange: false, needsReportDate: false, needsAsOfDate: true, needsAccountId: false, needsCustomerCode: false, needsVendorCode: false, needsDimensionId: false },
  { key: 'ap-aging', label: 'AP Aging', category: 'Receivables & Payables', needsLedger: false, needsDateRange: false, needsReportDate: false, needsAsOfDate: true, needsAccountId: false, needsCustomerCode: false, needsVendorCode: false, needsDimensionId: false },
  { key: 'customer-statement', label: 'Customer Statement', category: 'Receivables & Payables', needsLedger: false, needsDateRange: true, needsReportDate: false, needsAsOfDate: false, needsAccountId: false, needsCustomerCode: true, needsVendorCode: false, needsDimensionId: false },
  { key: 'vendor-statement', label: 'Vendor Statement', category: 'Receivables & Payables', needsLedger: false, needsDateRange: true, needsReportDate: false, needsAsOfDate: false, needsAccountId: false, needsCustomerCode: false, needsVendorCode: true, needsDimensionId: false },

  // Tax & Compliance
  { key: 'tax-summary', label: 'Tax Summary', category: 'Tax & Compliance', needsLedger: true, needsDateRange: true, needsReportDate: false, needsAsOfDate: false, needsAccountId: false, needsCustomerCode: false, needsVendorCode: false, needsDimensionId: false },

  // Dimension Analysis
  { key: 'trial-balance-by-dimension', label: 'Trial Balance by Dimension', category: 'Dimension Analysis', needsLedger: true, needsDateRange: false, needsReportDate: true, needsAsOfDate: false, needsAccountId: false, needsCustomerCode: false, needsVendorCode: false, needsDimensionId: true },
  { key: 'profit-and-loss-by-dimension', label: 'P&L by Dimension', category: 'Dimension Analysis', needsLedger: true, needsDateRange: true, needsReportDate: false, needsAsOfDate: false, needsAccountId: false, needsCustomerCode: false, needsVendorCode: false, needsDimensionId: true },

  // Account Analysis
  { key: 'reconciliation', label: 'Account Reconciliation', category: 'Account Analysis', needsLedger: false, needsDateRange: false, needsReportDate: false, needsAsOfDate: true, needsAccountId: true, needsCustomerCode: false, needsVendorCode: false, needsDimensionId: false },
];

@Component({
  selector: 'lib-financial-reports',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './financial-reports.html',
  styleUrl: './financial-reports.css',
})
export class FinancialReportsComponent {
  reports = REPORT_CATALOG;
  categories: string[] = [];

  selectedReport: ReportMeta | null = null;
  ledgers: LedgerDto[] = [];
  dimensions: any[] = [];
  accounts: any[] = [];

  // Filter fields
  filterLedgerId = '';
  filterFromDate = '';
  filterToDate = '';
  filterReportDate = '';
  filterAsOfDate = '';
  filterAccountId = '';
  filterCustomerCode = '';
  filterVendorCode = '';
  filterDimensionId = '';

  // State
  loading = false;
  error = '';
  reportData: any[] = [];
  reportColumns: string[] = [];
  reportGenerated = false;

  constructor(
    private reportsService: FinancialReportsService,
    private ledgerService: LedgerService,
    private accountService: LedgerAccountService,
    private dimensionService: DimensionService,
    private cdr: ChangeDetectorRef,
  ) {
    this.categories = [...new Set(REPORT_CATALOG.map(r => r.category))];
  }

  selectReport(report: ReportMeta) {
    this.selectedReport = report;
    this.resetFilters();
    this.reportData = [];
    this.reportColumns = [];
    this.reportGenerated = false;
    this.error = '';

    if (report.needsLedger) {
      this.loadLedgers();
    }
    if (report.needsDimensionId) {
      this.loadDimensions();
    }
    if (report.needsAccountId) {
      this.loadAccounts();
    }
  }

  resetFilters() {
    this.filterLedgerId = '';
    this.filterFromDate = '';
    this.filterToDate = '';
    this.filterReportDate = '';
    this.filterAsOfDate = '';
    this.filterAccountId = '';
    this.filterCustomerCode = '';
    this.filterVendorCode = '';
    this.filterDimensionId = '';
  }

  private loadLedgers() {
    this.ledgerService.getAll().subscribe({
      next: (res) => {
        this.ledgers = res.data ?? [];
        this.cdr.markForCheck();
      },
    });
  }

  private loadDimensions() {
    this.dimensionService.getAll({ pageSize: 1000 }).subscribe({
      next: (res) => {
        this.dimensions = res.data ?? [];
        this.cdr.markForCheck();
      },
    });
  }

  private loadAccounts() {
    if (this.filterLedgerId) {
      this.accountService.getByLedger(this.filterLedgerId).subscribe({
        next: (res) => {
          this.accounts = res.data ?? [];
          this.cdr.markForCheck();
        },
      });
    }
  }

  onLedgerChange() {
    if (this.selectedReport?.needsAccountId) {
      this.loadAccounts();
    }
  }

  generateReport() {
    if (!this.selectedReport) return;

    this.loading = true;
    this.error = '';
    this.reportData = [];
    this.reportColumns = [];
    this.reportGenerated = false;

    const obs = this.getReportObservable(this.selectedReport.key);
    if (!obs) {
      this.error = 'Report not implemented';
      this.loading = false;
      return;
    }

    obs.subscribe({
      next: (res) => {
        const data = res.data;
        if (Array.isArray(data) && data.length > 0) {
          this.reportData = data;
          this.reportColumns = Object.keys(data[0]);
        } else if (data && typeof data === 'object') {
          this.reportData = [data];
          this.reportColumns = Object.keys(data);
        } else {
          this.reportData = [];
          this.reportColumns = [];
        }
        this.reportGenerated = true;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.error = err?.error?.message || err?.message || 'Failed to generate report';
        this.loading = false;
        this.cdr.markForCheck();
      },
    });
  }

  private getReportObservable(key: ReportType) {
    const q = {
      ledgerId: this.filterLedgerId || undefined,
      fromDate: this.filterFromDate || undefined,
      toDate: this.filterToDate || undefined,
      reportDate: this.filterReportDate || undefined,
      asOfDate: this.filterAsOfDate || undefined,
    };

    switch (key) {
      case 'trial-balance':
        return this.reportsService.trialBalance({ ledgerId: q.ledgerId, reportDate: q.reportDate });
      case 'balance-sheet':
        return this.reportsService.balanceSheet({ ledgerId: q.ledgerId, reportDate: q.reportDate });
      case 'profit-and-loss':
        return this.reportsService.profitAndLoss({ ledgerId: q.ledgerId, fromDate: q.fromDate, toDate: q.toDate });
      case 'cash-flow':
        return this.reportsService.cashFlow({ ledgerId: q.ledgerId, fromDate: q.fromDate, toDate: q.toDate });
      case 'general-ledger':
        return this.reportsService.generalLedger({ ledgerId: q.ledgerId, fromDate: q.fromDate, toDate: q.toDate });
      case 'account-ledger':
        return this.reportsService.accountLedger(this.filterAccountId, { fromDate: q.fromDate, toDate: q.toDate });
      case 'daily-transactions':
        return this.reportsService.dailyTransactions({ ledgerId: q.ledgerId, reportDate: q.reportDate });
      case 'journal':
        return this.reportsService.journal({ ledgerId: q.ledgerId, fromDate: q.fromDate, toDate: q.toDate });
      case 'journal-audit':
        return this.reportsService.journalAudit({ ledgerId: q.ledgerId, fromDate: q.fromDate, toDate: q.toDate });
      case 'unposted-journals':
        return this.reportsService.unpostedJournals(q.ledgerId);
      case 'ar-aging':
        return this.reportsService.arAging(q.asOfDate);
      case 'ap-aging':
        return this.reportsService.apAging(q.asOfDate);
      case 'customer-statement':
        return this.reportsService.customerStatement(this.filterCustomerCode, { fromDate: q.fromDate, toDate: q.toDate });
      case 'vendor-statement':
        return this.reportsService.vendorStatement(this.filterVendorCode, { fromDate: q.fromDate, toDate: q.toDate });
      case 'tax-summary':
        return this.reportsService.taxSummary({ ledgerId: q.ledgerId, fromDate: q.fromDate, toDate: q.toDate });
      case 'trial-balance-by-dimension':
        return this.reportsService.trialBalanceByDimension(this.filterDimensionId, { ledgerId: q.ledgerId, reportDate: q.reportDate });
      case 'profit-and-loss-by-dimension':
        return this.reportsService.profitAndLossByDimension(this.filterDimensionId, { ledgerId: q.ledgerId, fromDate: q.fromDate, toDate: q.toDate });
      case 'reconciliation':
        return this.reportsService.reconciliation(this.filterAccountId, q.asOfDate);
      default:
        return null;
    }
  }

  formatColumnHeader(col: string): string {
    return col
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, s => s.toUpperCase())
      .trim();
  }

  formatCellValue(value: unknown): string {
    if (value === null || value === undefined) return '—';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (typeof value === 'number') return value.toLocaleString();
    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) {
      return new Date(value).toLocaleDateString();
    }
    return String(value);
  }

  getReportsByCategory(category: string): ReportMeta[] {
    return this.reports.filter(r => r.category === category);
  }
}
