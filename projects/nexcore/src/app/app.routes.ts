import { Routes } from '@angular/router';
import { authGuard } from '@nexcore/core';

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
        loadChildren: () => import('@nexcore/accounting').then(m => m.accountingRoutes),
      },
      {
        path: 'inventory',
        loadChildren: () => import('@nexcore/inventory').then(m => m.inventoryRoutes),
      },
      {
        path: 'sales',
        loadChildren: () => import('@nexcore/sales').then(m => m.salesRoutes),
      },
      {
        path: 'procurement',
        loadChildren: () => import('@nexcore/procurement').then(m => m.procurementRoutes),
      },
      {
        path: 'hr',
        loadChildren: () => import('@nexcore/hr').then(m => m.hrRoutes),
      },
      {
        path: 'crm',
        loadChildren: () => import('@nexcore/crm').then(m => m.crmRoutes),
      },
      {
        path: 'manufacturing',
        loadChildren: () => import('@nexcore/manufacturing').then(m => m.manufacturingRoutes),
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