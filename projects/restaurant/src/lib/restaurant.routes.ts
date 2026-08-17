import { Routes } from '@angular/router';

/**
 * Restaurant app routes.
 *
 * Ordered the way a restaurant is staffed rather than alphabetically: the three screens that run
 * service first, then front of house, then the back office. Every screen is lazy so a waiter's
 * handheld only downloads the order pad, not the reporting suite.
 */
export const restaurantRoutes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },

  {
    path: 'dashboard',
    loadComponent: () =>
      import('./pages/dashboard/restaurant-dashboard').then(m => m.RestaurantDashboardComponent),
  },

  // ── Service ───────────────────────────────────────────────────────────
  {
    path: 'floor',
    loadComponent: () => import('./pages/floor-plan/floor-plan').then(m => m.FloorPlanComponent),
  },
  {
    path: 'order',
    loadComponent: () =>
      import('./pages/order-terminal/order-terminal').then(m => m.OrderTerminalComponent),
  },
  {
    path: 'kitchen',
    loadComponent: () =>
      import('./pages/kitchen-display/kitchen-display').then(m => m.KitchenDisplayComponent),
  },
  {
    path: 'orders',
    loadComponent: () => import('./pages/orders/orders').then(m => m.OrdersComponent),
  },

  // ── Front of house ────────────────────────────────────────────────────
  {
    path: 'reservations',
    loadComponent: () =>
      import('./pages/reservations/reservations').then(m => m.ReservationsComponent),
  },

  // ── Menu ──────────────────────────────────────────────────────────────
  {
    path: 'menu',
    loadComponent: () => import('./pages/menu/menu-management').then(m => m.MenuManagementComponent),
  },
  {
    path: 'availability',
    loadComponent: () => import('./pages/menu/menu-management').then(m => m.MenuManagementComponent),
    data: { tab: 'availability' },
  },

  // ── Kitchen & cost ────────────────────────────────────────────────────
  {
    path: 'recipes',
    loadComponent: () => import('./pages/recipes/recipes').then(m => m.RecipesComponent),
  },
  {
    path: 'stations',
    loadComponent: () =>
      import('./pages/kitchen-setup/kitchen-setup').then(m => m.KitchenSetupComponent),
  },
  {
    path: 'compliance',
    loadComponent: () => import('./pages/compliance/compliance').then(m => m.ComplianceComponent),
  },

  // ── Money & day-end ───────────────────────────────────────────────────
  {
    path: 'sessions',
    loadComponent: () => import('./pages/sessions/sessions').then(m => m.SessionsComponent),
  },
  {
    path: 'reports',
    loadComponent: () => import('./pages/reports/reports').then(m => m.ReportsComponent),
  },

  // ── Setup ─────────────────────────────────────────────────────────────
  {
    path: 'staff',
    loadComponent: () => import('./pages/staff/staff').then(m => m.StaffComponent),
  },
  {
    path: 'layout',
    loadComponent: () =>
      import('./pages/layout-designer/layout-designer').then(m => m.LayoutDesignerComponent),
  },
  {
    path: 'settings',
    loadComponent: () => import('./pages/settings/settings').then(m => m.SettingsComponent),
  },
];
