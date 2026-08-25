/*
 * Public API Surface of @nexcore/fitness
 *
 * The Fitness app: front desk, members, memberships and billing, class timetable, personal
 * training, access control, retention, staff, facilities, compliance and reporting.
 */

export * from './lib/fitness.routes';

/* ── Models ── */
export * from './lib/models/fitness.enums';
export * from './lib/models/fitness.models';

/* ── Services ── */
export * from './lib/services/fitness-api-config';
export * from './lib/services/fitness.services';
export * from './lib/services/fitness-context.service';

/* ── Shared UI ── */
export { ClubPickerComponent } from './lib/pages/shared/club-picker';
export { PageHelpComponent, FITNESS_HELP } from './lib/pages/shared/page-help';
export * from './lib/pages/shared/validation';

/* ── Pages ── */
export { FitnessDashboardComponent } from './lib/pages/dashboard/fitness-dashboard';

/* Running the day */
export { FrontDeskComponent } from './lib/pages/front-desk/front-desk';
export { KioskComponent } from './lib/pages/kiosk/kiosk';
export { PosComponent } from './lib/pages/pos/pos';

/* Members */
export { MembersComponent } from './lib/pages/members/members';
export { Member360Component } from './lib/pages/member-360/member-360';
export { JoinComponent } from './lib/pages/join/join';
export { HouseholdsComponent } from './lib/pages/households/households';
export { AgreementsComponent } from './lib/pages/agreements/agreements';
export { AssessmentsComponent } from './lib/pages/assessments/assessments';

/* Classes */
export { TimetableComponent } from './lib/pages/timetable/timetable';
export { ClassRosterComponent } from './lib/pages/class-roster/class-roster';
export { ScheduleComponent } from './lib/pages/schedule/schedule';

/* Training */
export { AppointmentsComponent } from './lib/pages/appointments/appointments';
export { SessionsComponent } from './lib/pages/sessions/sessions';
export { ProgrammingComponent } from './lib/pages/programming/programming';
export { LeaderboardsComponent } from './lib/pages/leaderboards/leaderboards';

/* Money */
export { BillingComponent } from './lib/pages/billing/billing';
export { InvoicesComponent } from './lib/pages/invoices/invoices';
export { CollectionsComponent } from './lib/pages/collections/collections';
export { CommissionComponent } from './lib/pages/commission/commission';
export { CorporateComponent } from './lib/pages/corporate/corporate';

/* Growth */
export { LeadsComponent } from './lib/pages/leads/leads';
export { RetentionComponent } from './lib/pages/retention/retention';
export { MarketingComponent } from './lib/pages/marketing/marketing';
export { LoyaltyComponent } from './lib/pages/loyalty/loyalty';

/* The building */
export { AccessComponent } from './lib/pages/access/access';
export { FacilitiesComponent } from './lib/pages/facilities/facilities';
export { EquipmentComponent } from './lib/pages/equipment/equipment';
export { ComplianceComponent } from './lib/pages/compliance/compliance';
export { WaiversComponent } from './lib/pages/waivers/waivers';

/* Back office */
export { PlansComponent } from './lib/pages/plans/plans';
export { SetupClassesComponent } from './lib/pages/setup-classes/setup-classes';
export { ClubsComponent } from './lib/pages/clubs/clubs';
export { StaffComponent } from './lib/pages/staff/staff';
export { ReportsComponent } from './lib/pages/reports/reports';
export { SettingsComponent } from './lib/pages/settings/settings';
