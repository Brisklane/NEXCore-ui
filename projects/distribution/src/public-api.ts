/*
 * Public API Surface of @nexcore/distribution
 *
 * The Distribution app: route-to-market for companies that sell through a channel — field force,
 * journey plans, van sales, trade schemes, claims, route settlement and secondary sales.
 */

export * from './lib/distribution.routes';

/* ── Models ── */
export * from './lib/models/distribution.enums';
export * from './lib/models/distribution.models';

/* ── Services ── */
export * from './lib/services/distribution-api-config';
export * from './lib/services/distribution.services';
export * from './lib/services/distribution-context.service';

/* ── Shared UI ── */
export { PageHelpComponent, DISTRIBUTION_HELP } from './lib/pages/shared/page-help';
export { ScopeBarComponent } from './lib/pages/shared/scope-bar';
export { OrderSheetComponent } from './lib/pages/shared/order-sheet';
export { CollectionSheetComponent } from './lib/pages/shared/collection-sheet';
export {
  StatusPillComponent, PagerComponent, EmptyStateComponent,
  ConfirmDialogComponent, SkeletonRowsComponent, toneClass,
} from './lib/pages/shared/ui-bits';
export * from './lib/pages/shared/validation';

/* ── Pages: overview and the field ── */
export { DistributionDashboardComponent } from './lib/pages/dashboard/distribution-dashboard';
export { FieldTerminalComponent } from './lib/pages/terminal/field-terminal';
export { JourneyPlanComponent } from './lib/pages/journey/journey-plan';

/* ── Pages: the network ── */
export { RoutesBeatsComponent } from './lib/pages/routes/routes-beats';
export { OutletsComponent } from './lib/pages/outlets/outlets';
export { Outlet360Component } from './lib/pages/outlets/outlet-360';
export { PartnersComponent } from './lib/pages/partners/partners';
export { Partner360Component } from './lib/pages/partners/partner-360';

/* ── Pages: the trade ── */
export { DistributionOrdersComponent } from './lib/pages/orders/orders';
export { OrderDetailComponent } from './lib/pages/orders/order-detail';
export { TradeSchemesComponent } from './lib/pages/schemes/schemes';
export { PricingComponent } from './lib/pages/pricing/pricing';

/* ── Pages: fulfilment ── */
export { DispatchDeskComponent } from './lib/pages/dispatch/dispatch';
export { PickWavesComponent } from './lib/pages/waves/pick-waves';
export { VanSalesComponent } from './lib/pages/van-sales/van-sales';
export { TripsComponent } from './lib/pages/trips/trips';
export { PodQueueComponent } from './lib/pages/pod/pod-queue';
export { ReturnsComponent } from './lib/pages/returns/returns';

/* ── Pages: money ── */
export { ClaimsComponent } from './lib/pages/claims/claims';
export { CreditComponent } from './lib/pages/credit/credit';
export { RouteSettlementComponent } from './lib/pages/settlement/settlement';

/* ── Pages: insight ── */
export { SecondarySalesComponent } from './lib/pages/secondary/secondary-sales';
export { TargetsIncentivesComponent } from './lib/pages/targets/targets';
export { MerchandisingComponent } from './lib/pages/merchandising/merchandising';
export { TradeAssetsComponent } from './lib/pages/assets/assets';
export { DemandPlanningComponent } from './lib/pages/planning/planning';
export { TraceabilityComponent } from './lib/pages/traceability/traceability';
export { DistributionReportsComponent } from './lib/pages/reports/reports';

/* ── Pages: administration ── */
export { FleetDriversComponent } from './lib/pages/fleet/fleet';
export { FieldTeamComponent } from './lib/pages/team/field-team';
export { DistributionSettingsComponent } from './lib/pages/settings/settings';
