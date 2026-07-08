import { Routes } from '@angular/router';
import { SalesDashboardPage } from './pages/sales-dashboard/sales-dashboard';
import { SalesOrder } from './pages/sales-order/sales-order';
import { QuotationsComponent } from './pages/quotations/quotations';
import { DeliveriesComponent } from './pages/deliveries/deliveries';
import { SalesInvoicesComponent } from './pages/sales-invoices/sales-invoices';
import { SalesPaymentsComponent } from './pages/sales-payments/sales-payments';
import { PriceListsComponent } from './pages/price-lists/price-lists';
import { CouponsComponent } from './pages/coupons/coupons';
import { RidersComponent } from './pages/riders/riders';
import { PosStoresComponent } from './pages/pos-stores/pos-stores';
import { PosCashiersComponent } from './pages/pos-cashiers/pos-cashiers';
import { PosTerminalComponent } from './pages/pos-terminal/pos-terminal';
import { PosTerminalsMgmtComponent } from './pages/pos-terminals-mgmt/pos-terminals-mgmt';
import { CustomerPortalComponent } from './pages/customer-portal/customer-portal';
import { PromotionsComponent } from './pages/promotions/promotions';
import { StoreOffersComponent } from './pages/store-offers/store-offers';
import { PosDashboardComponent } from './pages/pos-dashboard/pos-dashboard';
import { PosReceiptTemplatesComponent } from './pages/pos-receipt-templates/pos-receipt-templates';
import { DocumentSequencesComponent } from './pages/document-sequences/document-sequences';
import { PosSettingsComponent } from './pages/pos-settings/pos-settings';

export const salesRoutes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: SalesDashboardPage },
  { path: 'orders', component: SalesOrder },
  { path: 'quotations', component: QuotationsComponent },
  { path: 'deliveries', component: DeliveriesComponent },
  { path: 'invoices', component: SalesInvoicesComponent },
  { path: 'payments', component: SalesPaymentsComponent },
  { path: 'price-lists', component: PriceListsComponent },
  { path: 'coupons', component: CouponsComponent },
  { path: 'promotions', component: PromotionsComponent },
  { path: 'riders', component: RidersComponent },
  { path: 'pos-stores', component: PosStoresComponent },
  { path: 'pos-cashiers', component: PosCashiersComponent },
  { path: 'pos-terminals', component: PosTerminalsMgmtComponent },
  { path: 'pos', component: PosTerminalComponent },
  { path: 'customer-portal', component: CustomerPortalComponent },
  { path: 'store-offers', component: StoreOffersComponent },
  { path: 'pos-dashboard', component: PosDashboardComponent },
  { path: 'pos-settings', component: PosSettingsComponent },
  // Kept routable for deep links; surfaced as tabs inside POS Settings.
  { path: 'receipt-templates', component: PosReceiptTemplatesComponent },
  { path: 'document-sequences', component: DocumentSequencesComponent },
];