import { Routes } from '@angular/router';

/**
 * Every Distribution screen, lazily loaded one component at a time.
 *
 * Ordered the way the work runs rather than alphabetically: the field and the network first, then
 * the trade, then the supply chain that fulfils it, then the money, then analysis and setup.
 * Somebody following a case of stock through the business would read this list top to bottom.
 */
export const DISTRIBUTION_ROUTES: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },

  // ── Overview and the field ────────────────────────────────────────────────
  {
    path: 'dashboard',
    title: 'Distribution',
    loadComponent: () => import('./pages/dashboard/distribution-dashboard')
      .then(m => m.DistributionDashboardComponent),
  },
  {
    path: 'terminal',
    title: 'Field terminal',
    loadComponent: () => import('./pages/terminal/field-terminal')
      .then(m => m.FieldTerminalComponent),
  },
  {
    path: 'journey',
    title: 'Journey plan',
    loadComponent: () => import('./pages/journey/journey-plan')
      .then(m => m.JourneyPlanComponent),
  },

  // ── The network ───────────────────────────────────────────────────────────
  {
    path: 'routes',
    title: 'Routes & beats',
    loadComponent: () => import('./pages/routes/routes-beats')
      .then(m => m.RoutesBeatsComponent),
  },
  {
    path: 'outlets',
    title: 'Outlets',
    loadComponent: () => import('./pages/outlets/outlets')
      .then(m => m.OutletsComponent),
  },
  {
    path: 'outlets/:id',
    title: 'Outlet',
    loadComponent: () => import('./pages/outlets/outlet-360')
      .then(m => m.Outlet360Component),
  },
  {
    path: 'partners',
    title: 'Channel partners',
    loadComponent: () => import('./pages/partners/partners')
      .then(m => m.PartnersComponent),
  },
  {
    path: 'partners/:id',
    title: 'Partner',
    loadComponent: () => import('./pages/partners/partner-360')
      .then(m => m.Partner360Component),
  },

  // ── The trade ─────────────────────────────────────────────────────────────
  {
    path: 'orders',
    title: 'Orders',
    loadComponent: () => import('./pages/orders/orders')
      .then(m => m.DistributionOrdersComponent),
  },
  {
    path: 'orders/:id',
    title: 'Order',
    loadComponent: () => import('./pages/orders/order-detail')
      .then(m => m.OrderDetailComponent),
  },
  {
    path: 'schemes',
    title: 'Trade schemes',
    loadComponent: () => import('./pages/schemes/schemes')
      .then(m => m.TradeSchemesComponent),
  },
  {
    path: 'pricing',
    title: 'Pricing & margin',
    loadComponent: () => import('./pages/pricing/pricing')
      .then(m => m.PricingComponent),
  },

  // ── Fulfilment ────────────────────────────────────────────────────────────
  {
    path: 'dispatch',
    title: 'Load & dispatch',
    loadComponent: () => import('./pages/dispatch/dispatch')
      .then(m => m.DispatchDeskComponent),
  },
  {
    path: 'waves',
    title: 'Pick waves',
    loadComponent: () => import('./pages/waves/pick-waves')
      .then(m => m.PickWavesComponent),
  },
  {
    path: 'van-sales',
    title: 'Van sales',
    loadComponent: () => import('./pages/van-sales/van-sales')
      .then(m => m.VanSalesComponent),
  },
  {
    path: 'trips',
    title: 'Delivery trips',
    loadComponent: () => import('./pages/trips/trips')
      .then(m => m.TripsComponent),
  },
  {
    path: 'pod',
    title: 'Proof of delivery',
    loadComponent: () => import('./pages/pod/pod-queue')
      .then(m => m.PodQueueComponent),
  },
  {
    path: 'returns',
    title: 'Returns',
    loadComponent: () => import('./pages/returns/returns')
      .then(m => m.ReturnsComponent),
  },

  // ── Money ─────────────────────────────────────────────────────────────────
  {
    path: 'claims',
    title: 'Claims',
    loadComponent: () => import('./pages/claims/claims')
      .then(m => m.ClaimsComponent),
  },
  {
    path: 'credit',
    title: 'Credit & collections',
    loadComponent: () => import('./pages/credit/credit')
      .then(m => m.CreditComponent),
  },
  {
    path: 'settlement',
    title: 'Route settlement',
    loadComponent: () => import('./pages/settlement/settlement')
      .then(m => m.RouteSettlementComponent),
  },

  // ── Insight ───────────────────────────────────────────────────────────────
  {
    path: 'secondary',
    title: 'Secondary sales',
    loadComponent: () => import('./pages/secondary/secondary-sales')
      .then(m => m.SecondarySalesComponent),
  },
  {
    path: 'targets',
    title: 'Targets & incentives',
    loadComponent: () => import('./pages/targets/targets')
      .then(m => m.TargetsIncentivesComponent),
  },
  {
    path: 'merchandising',
    title: 'Merchandising & surveys',
    loadComponent: () => import('./pages/merchandising/merchandising')
      .then(m => m.MerchandisingComponent),
  },
  {
    path: 'assets',
    title: 'Trade assets',
    loadComponent: () => import('./pages/assets/assets')
      .then(m => m.TradeAssetsComponent),
  },
  {
    path: 'planning',
    title: 'Demand & replenishment',
    loadComponent: () => import('./pages/planning/planning')
      .then(m => m.DemandPlanningComponent),
  },
  {
    path: 'traceability',
    title: 'Batch, expiry & recall',
    loadComponent: () => import('./pages/traceability/traceability')
      .then(m => m.TraceabilityComponent),
  },
  {
    path: 'reports',
    title: 'Distribution reports',
    loadComponent: () => import('./pages/reports/reports')
      .then(m => m.DistributionReportsComponent),
  },

  // ── Administration ────────────────────────────────────────────────────────
  {
    path: 'fleet',
    title: 'Fleet & drivers',
    loadComponent: () => import('./pages/fleet/fleet')
      .then(m => m.FleetDriversComponent),
  },
  {
    path: 'team',
    title: 'Field team & devices',
    loadComponent: () => import('./pages/team/field-team')
      .then(m => m.FieldTeamComponent),
  },
  {
    path: 'settings',
    title: 'Distribution settings',
    loadComponent: () => import('./pages/settings/settings')
      .then(m => m.DistributionSettingsComponent),
  },

  { path: '**', redirectTo: 'dashboard' },
];

/** Alias matching the naming the app shell uses for every other module's route set. */
export const distributionRoutes = DISTRIBUTION_ROUTES;
