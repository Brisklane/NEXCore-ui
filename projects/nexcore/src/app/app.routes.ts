import { Routes } from '@angular/router';
import { authGuard, appInstalledGuard } from '@nexcore/core';

export const routes: Routes = [
  // PUBLIC
  {
    path: 'login',
    loadComponent: () => import('./auth/login/login').then(m => m.Login),
  },
  {
    path: 'register',
    loadComponent: () => import('./auth/register/register').then(m => m.Register),
  },

  // PROTECTED
  {
    path: '',
    canMatch: [authGuard],
    loadComponent: () =>
      import('./layout/main-layout/main-layout').then(m => m.MainLayout),

    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },

      {
        path: 'dashboard',
        loadComponent: () => import('./dashboard/dashboard').then(m => m.Dashboard),
      },

      {
        path: 'apps',
        loadComponent: () => import('./apps/apps').then(m => m.Apps),
      },

      {
        path: 'accounting',
        canMatch: [appInstalledGuard],
        loadChildren: () => import('@nexcore/accounting').then(m => m.accountingRoutes),
      },
      {
        path: 'inventory',
        canMatch: [appInstalledGuard],
        loadChildren: () => import('@nexcore/inventory').then(m => m.inventoryRoutes),
      },
      {
        path: 'sales',
        canMatch: [appInstalledGuard],
        loadChildren: () => import('@nexcore/sales').then(m => m.salesRoutes),
      },
      {
        path: 'procurement',
        canMatch: [appInstalledGuard],
        loadChildren: () => import('@nexcore/procurement').then(m => m.procurementRoutes),
      },
      {
        path: 'hr',
        canMatch: [appInstalledGuard],
        loadChildren: () => import('@nexcore/hr').then(m => m.hrRoutes),
      },
      {
        path: 'crm',
        canMatch: [appInstalledGuard],
        loadChildren: () => import('@nexcore/crm').then(m => m.crmRoutes),
      },
      {
        path: 'manufacturing',
        canMatch: [appInstalledGuard],
        loadChildren: () => import('@nexcore/manufacturing').then(m => m.manufacturingRoutes),
      },
      {
        path: 'restaurant',
        canMatch: [appInstalledGuard],
        loadChildren: () => import('@nexcore/restaurant').then(m => m.restaurantRoutes),
      },
      {
        path: 'fitness',
        canMatch: [appInstalledGuard],
        loadChildren: () => import('@nexcore/fitness').then(m => m.fitnessRoutes),
      },
      {
        path: 'distribution',
        canMatch: [appInstalledGuard],
        loadChildren: () => import('@nexcore/distribution').then(m => m.distributionRoutes),
      },
      {
        path: 'realestate',
        canMatch: [appInstalledGuard],
        loadChildren: () => import('@nexcore/realestate').then(m => m.realEstateRoutes),
      },

      /**
       * POS Back Office.
       *
       * These are the same screens the ERP modules own, mounted under a `/pos-office`
       * prefix. The sidebar decides which app you are "in" by matching the URL against
       * its menu, and Inventory is declared before Point Of Sale — so linking a POS user
       * straight at `/inventory/products` would throw them out of the POS app and into
       * the Inventory sidebar mid-task. Owning the URL keeps the POS context intact.
       *
       * Only what a shop actually runs on is mounted here. Chart of accounts, fiscal
       * calendars and posting profiles stay in Accounting where they belong: this is a
       * shopkeeper's back office, not a second copy of the ERP.
       */
      {
        path: 'pos-office',
        canMatch: [appInstalledGuard],
        children: [
          // Sales screens the POS app also offers. They need their own URL for the same
          // reason as the Inventory ones: a route listed under two menus lights up in
          // both, so `/sales/price-lists` highlighted Sales *and* Point of Sale at once.
          { path: 'price-lists', loadComponent: () => import('@nexcore/sales').then(m => m.PriceListsComponent) },
          { path: 'promotions', loadComponent: () => import('@nexcore/sales').then(m => m.PromotionsComponent) },
          { path: 'coupons', loadComponent: () => import('@nexcore/sales').then(m => m.CouponsComponent) },
          { path: 'orders', loadComponent: () => import('@nexcore/sales').then(m => m.SalesOrder) },
          { path: 'invoices', loadComponent: () => import('@nexcore/sales').then(m => m.SalesInvoicesComponent) },
          { path: 'payments', loadComponent: () => import('@nexcore/sales').then(m => m.SalesPaymentsComponent) },
          { path: 'deliveries', loadComponent: () => import('@nexcore/sales').then(m => m.DeliveriesComponent) },

          // Products & pricing
          { path: 'products', loadComponent: () => import('@nexcore/inventory').then(m => m.ItemsPage) },
          { path: 'categories', loadComponent: () => import('@nexcore/inventory').then(m => m.ItemCategoriesPage) },
          { path: 'brands', loadComponent: () => import('@nexcore/inventory').then(m => m.BrandsPage) },
          { path: 'units', loadComponent: () => import('@nexcore/inventory').then(m => m.UnitsPage) },
          { path: 'tax-rates', loadComponent: () => import('@nexcore/inventory').then(m => m.TaxDefinitionsPage) },
          { path: 'labels', loadComponent: () => import('@nexcore/inventory').then(m => m.PriceTagDesignerComponent) },

          // Stock
          { path: 'stock-on-hand', loadComponent: () => import('@nexcore/inventory').then(m => m.StockList) },
          { path: 'stock-valuation', loadComponent: () => import('@nexcore/inventory').then(m => m.InventoryBalancePage) },
          { path: 'adjustments', loadComponent: () => import('@nexcore/inventory').then(m => m.InventoryAdjustment) },
          { path: 'documents', loadComponent: () => import('@nexcore/inventory').then(m => m.InventoryDocumentsPage) },
          { path: 'warehouses', loadComponent: () => import('@nexcore/inventory').then(m => m.WarehousesPage) },

          // Purchasing
          { path: 'suppliers', loadComponent: () => import('@nexcore/procurement').then(m => m.SupplierList) },
          { path: 'purchase-orders', loadComponent: () => import('@nexcore/procurement').then(m => m.PurchaseOrder), data: { view: 'all' } },
          { path: 'purchase-invoices', loadComponent: () => import('@nexcore/procurement').then(m => m.PurchaseInvoicePage), data: { view: 'all' } },
          { path: 'supplier-payments', loadComponent: () => import('@nexcore/procurement').then(m => m.VendorPaymentPage) },
        ],
      },

      // Administration
      {
        path: 'administration/manage-company',
        loadComponent: () =>
          import('./administration/manage-company/manage-company')
            .then(m => m.ManageCompany)
      },
      {
        path: 'administration/users',
        loadComponent: () =>
          import('./administration/users/users')
            .then(m => m.AdminUsers)
      },
      {
        path: 'administration/subscription-details',
        loadComponent: () =>
          import('./administration/subscription-details/subscription-details')
            .then(m => m.SubscriptionDetails)
      },
      {
        path: 'administration/settings',
        loadComponent: () =>
          import('./administration/settings/settings')
            .then(m => m.AdminSettings)
      },
    ],
  },

  // fallback
  { path: '**', redirectTo: 'login' },
];