import { Routes } from '@angular/router';
import { AccountingDashboardPage } from './pages/dashboard/accounting-dashboard';
import { ChartOfAccounts } from './pages/chart-of-accounts/chart-of-accounts';
import { JournalEntry } from './pages/journal-entry/journal-entry';
import { Ledger } from './pages/ledger/ledger';
import { FiscalCalendar } from './pages/fiscal-calendar/fiscal-calendar';
import { AccountCategoryComponent } from './pages/account-category/account-category';
import { AccountBalanceComponent } from './pages/account-balance/account-balance';
import { DimensionComponent } from './pages/dimension/dimension';
import { TaxCodeComponent } from './pages/tax-code/tax-code';
import { PostingProfileComponent } from './pages/posting-profile/posting-profile';
import { FinancialReportsComponent } from './pages/financial-reports/financial-reports';

export const accountingRoutes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: AccountingDashboardPage },
  { path: 'ledger', component: Ledger },
  { path: 'chart-of-accounts', component: ChartOfAccounts },
  { path: 'journal-entry', component: JournalEntry },
  { path: 'fiscal-calendar', component: FiscalCalendar },
  { path: 'account-categories', component: AccountCategoryComponent },
  { path: 'account-balances', component: AccountBalanceComponent },
  { path: 'dimensions', component: DimensionComponent },
  { path: 'tax-codes', component: TaxCodeComponent },
  { path: 'posting-profiles', component: PostingProfileComponent },
  { path: 'financial-reports', component: FinancialReportsComponent },
];