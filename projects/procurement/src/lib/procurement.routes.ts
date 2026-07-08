import { Routes } from '@angular/router';
import { ProcurementDashboardPage } from './pages/dashboard/procurement-dashboard';
import { PurchaseOrder } from './pages/purchase-order/purchase-order';
import { SupplierList } from './pages/supplier-list/supplier-list';
import { PurchaseRequisitionPage } from './pages/purchase-requisition/purchase-requisition';
import { RequestForQuotationPage } from './pages/request-for-quotation/request-for-quotation';
import { VendorQuotationsPage } from './pages/vendor-quotations/vendor-quotations';
import { PurchaseReturnsPage } from './pages/purchase-returns/purchase-returns';
import { VendorDebitNotesPage } from './pages/vendor-debit-notes/vendor-debit-notes';
import { LandedCostsPage } from './pages/landed-costs/landed-costs';
import { GoodsReceiptPage } from './pages/goods-receipt/goods-receipt';
import { PurchaseInvoicePage } from './pages/purchase-invoice/purchase-invoice';
import { VendorPaymentPage } from './pages/vendor-payment/vendor-payment';
import { PurchaseContractPage } from './pages/purchase-contract/purchase-contract';
import { VendorCategories } from './pages/vendor-categories/vendor-categories';
import { ProcurementCategories } from './pages/procurement-categories/procurement-categories';
import { VendorDocumentsPage } from './pages/vendor-documents/vendor-documents';
import { VendorPricelistsPage } from './pages/vendor-pricelists/vendor-pricelists';
import { ApprovedVendorListPage } from './pages/approved-vendor-list/approved-vendor-list';
import { VendorPerformancePage } from './pages/vendor-performance/vendor-performance';
import { ApprovalWorkflowsPage } from './pages/approval-workflows/approval-workflows';
import { DocumentSequencesPage } from './pages/document-sequences/document-sequences';
import { ProcurementSettingsPage } from './pages/procurement-settings/procurement-settings';
import { PurchaseAnalysisReportPage } from './pages/reports/purchase-analysis/purchase-analysis-report';
import { VendorAnalysisReportPage } from './pages/reports/vendor-analysis/vendor-analysis-report';
import { ApAgingReportPage } from './pages/reports/ap-aging/ap-aging-report';
import { ThreeWayMatchReportPage } from './pages/reports/three-way-match/three-way-match-report';
import { SpendByCategoryReportPage } from './pages/reports/spend-by-category/spend-by-category-report';

export const procurementRoutes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: ProcurementDashboardPage },

  // Transactional
  { path: 'purchase-requisitions', component: PurchaseRequisitionPage },
  { path: 'request-for-quotations', component: RequestForQuotationPage },
  { path: 'rfq', component: RequestForQuotationPage },
  { path: 'vendor-quotations', component: VendorQuotationsPage },
  { path: 'purchase-order', component: PurchaseOrder },
  { path: 'purchase-orders', component: PurchaseOrder, data: { view: 'all' } },
  { path: 'purchase-orders/pending-receipt', component: PurchaseOrder, data: { view: 'pendingReceipt' } },
  { path: 'purchase-orders/to-invoice', component: PurchaseOrder, data: { view: 'toInvoice' } },
  { path: 'goods-receipts', component: GoodsReceiptPage },
  { path: 'purchase-returns', component: PurchaseReturnsPage },
  { path: 'landed-costs', component: LandedCostsPage },
  { path: 'purchase-invoices', component: PurchaseInvoicePage, data: { view: 'all' } },
  { path: 'purchase-invoices/overdue', component: PurchaseInvoicePage, data: { view: 'overdue' } },
  { path: 'purchase-invoices/pending-payment', component: PurchaseInvoicePage, data: { view: 'pendingPayment' } },
  { path: 'vendor-payments', component: VendorPaymentPage },
  { path: 'vendor-debit-notes', component: VendorDebitNotesPage },
  { path: 'purchase-contracts', component: PurchaseContractPage },

  // Master data
  { path: 'vendors', component: SupplierList },
  { path: 'supplier-list', redirectTo: 'vendors', pathMatch: 'full' },
  { path: 'vendor-categories', component: VendorCategories },
  { path: 'procurement-categories', component: ProcurementCategories },
  { path: 'categories', component: ProcurementCategories },
  { path: 'vendor-documents', component: VendorDocumentsPage },
  { path: 'vendor-documents/expiring', component: VendorDocumentsPage },
  { path: 'vendor-pricelists', component: VendorPricelistsPage },
  { path: 'approved-vendor-list', component: ApprovedVendorListPage },
  { path: 'vendor-performance', component: VendorPerformancePage },

  // Reports & Analytics
  { path: 'reports/purchase-analysis', component: PurchaseAnalysisReportPage },
  { path: 'reports/vendor-analysis', component: VendorAnalysisReportPage },
  { path: 'reports/ap-aging', component: ApAgingReportPage },
  { path: 'reports/three-way-match', component: ThreeWayMatchReportPage },
  { path: 'reports/spend-by-category', component: SpendByCategoryReportPage },

  // Configuration
  { path: 'approval-workflows', component: ApprovalWorkflowsPage },
  { path: 'document-sequences', component: DocumentSequencesPage },
  { path: 'settings', component: ProcurementSettingsPage },
];
