/*
 * Public API Surface of @nexcore/restaurant
 *
 * The Restaurant app: floor plan, order terminal, kitchen display, menus, recipes, food safety,
 * reservations, staff and reporting.
 */

export * from './lib/restaurant.routes';

/* ── Models ── */
export * from './lib/models/restaurant.enums';
export * from './lib/models/restaurant.models';
export * from './lib/models/compliance.models';

/* ── Services ── */
export * from './lib/services/restaurant-api-config';
export * from './lib/services/restaurant.services';
export * from './lib/services/compliance.service';

/* ── Shared UI ── */
export { OutletPickerComponent } from './lib/pages/shared/outlet-picker';
export { PageHelpComponent, RESTAURANT_HELP } from './lib/pages/shared/page-help';
export * from './lib/pages/shared/validation';

/* ── Pages ── */
export { RestaurantDashboardComponent } from './lib/pages/dashboard/restaurant-dashboard';
export { FloorPlanComponent } from './lib/pages/floor-plan/floor-plan';
export { OrderTerminalComponent } from './lib/pages/order-terminal/order-terminal';
export { KitchenDisplayComponent } from './lib/pages/kitchen-display/kitchen-display';
export { OrdersComponent } from './lib/pages/orders/orders';
export { ReservationsComponent } from './lib/pages/reservations/reservations';
export { MenuManagementComponent } from './lib/pages/menu/menu-management';
export { RecipesComponent } from './lib/pages/recipes/recipes';
export { KitchenSetupComponent } from './lib/pages/kitchen-setup/kitchen-setup';
export { ComplianceComponent } from './lib/pages/compliance/compliance';
export { SessionsComponent } from './lib/pages/sessions/sessions';
export { ReportsComponent } from './lib/pages/reports/reports';
export { StaffComponent } from './lib/pages/staff/staff';
export { LayoutDesignerComponent } from './lib/pages/layout-designer/layout-designer';
export { SettingsComponent } from './lib/pages/settings/settings';
