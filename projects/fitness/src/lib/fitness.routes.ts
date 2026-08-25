import { Routes } from '@angular/router';

/**
 * Fitness app routes.
 *
 * Ordered the way a club is staffed rather than alphabetically: the screens that run the day
 * first, then sales and money, then the back office. Every screen is lazy so a tablet on the
 * barrier only downloads the kiosk, not the reporting suite.
 */
export const fitnessRoutes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },

  {
    path: 'dashboard',
    loadComponent: () =>
      import('./pages/dashboard/fitness-dashboard').then(m => m.FitnessDashboardComponent),
  },

  // ── Running the day ───────────────────────────────────────────────────
  {
    path: 'front-desk',
    loadComponent: () => import('./pages/front-desk/front-desk').then(m => m.FrontDeskComponent),
  },
  {
    path: 'kiosk',
    loadComponent: () => import('./pages/kiosk/kiosk').then(m => m.KioskComponent),
  },
  {
    path: 'pos',
    loadComponent: () => import('./pages/pos/pos').then(m => m.PosComponent),
  },

  // ── Members ───────────────────────────────────────────────────────────
  {
    path: 'members',
    loadComponent: () => import('./pages/members/members').then(m => m.MembersComponent),
  },
  {
    path: 'members/:id',
    loadComponent: () => import('./pages/member-360/member-360').then(m => m.Member360Component),
  },
  {
    path: 'join',
    loadComponent: () => import('./pages/join/join').then(m => m.JoinComponent),
  },
  {
    path: 'households',
    loadComponent: () => import('./pages/households/households').then(m => m.HouseholdsComponent),
  },
  {
    path: 'agreements',
    loadComponent: () => import('./pages/agreements/agreements').then(m => m.AgreementsComponent),
  },
  {
    path: 'assessments',
    loadComponent: () => import('./pages/assessments/assessments').then(m => m.AssessmentsComponent),
  },

  // ── Classes ───────────────────────────────────────────────────────────
  {
    path: 'timetable',
    loadComponent: () => import('./pages/timetable/timetable').then(m => m.TimetableComponent),
  },
  {
    path: 'classes/:id',
    loadComponent: () =>
      import('./pages/class-roster/class-roster').then(m => m.ClassRosterComponent),
  },
  {
    path: 'schedule',
    loadComponent: () => import('./pages/schedule/schedule').then(m => m.ScheduleComponent),
  },

  // ── Training ──────────────────────────────────────────────────────────
  {
    path: 'appointments',
    loadComponent: () =>
      import('./pages/appointments/appointments').then(m => m.AppointmentsComponent),
  },
  {
    path: 'sessions',
    loadComponent: () => import('./pages/sessions/sessions').then(m => m.SessionsComponent),
  },
  {
    path: 'programming',
    loadComponent: () => import('./pages/programming/programming').then(m => m.ProgrammingComponent),
  },
  {
    path: 'leaderboards',
    loadComponent: () =>
      import('./pages/leaderboards/leaderboards').then(m => m.LeaderboardsComponent),
  },

  // ── Money ─────────────────────────────────────────────────────────────
  {
    path: 'billing',
    loadComponent: () => import('./pages/billing/billing').then(m => m.BillingComponent),
  },
  {
    path: 'invoices',
    loadComponent: () => import('./pages/invoices/invoices').then(m => m.InvoicesComponent),
  },
  {
    path: 'collections',
    loadComponent: () => import('./pages/collections/collections').then(m => m.CollectionsComponent),
  },
  {
    path: 'commission',
    loadComponent: () => import('./pages/commission/commission').then(m => m.CommissionComponent),
  },
  {
    path: 'corporate',
    loadComponent: () => import('./pages/corporate/corporate').then(m => m.CorporateComponent),
  },

  // ── Growth ────────────────────────────────────────────────────────────
  {
    path: 'leads',
    loadComponent: () => import('./pages/leads/leads').then(m => m.LeadsComponent),
  },
  {
    path: 'retention',
    loadComponent: () => import('./pages/retention/retention').then(m => m.RetentionComponent),
  },
  {
    path: 'marketing',
    loadComponent: () => import('./pages/marketing/marketing').then(m => m.MarketingComponent),
  },
  {
    path: 'loyalty',
    loadComponent: () => import('./pages/loyalty/loyalty').then(m => m.LoyaltyComponent),
  },

  // ── The building ──────────────────────────────────────────────────────
  {
    path: 'access',
    loadComponent: () => import('./pages/access/access').then(m => m.AccessComponent),
  },
  {
    path: 'facilities',
    loadComponent: () => import('./pages/facilities/facilities').then(m => m.FacilitiesComponent),
  },
  {
    path: 'equipment',
    loadComponent: () => import('./pages/equipment/equipment').then(m => m.EquipmentComponent),
  },
  {
    path: 'compliance',
    loadComponent: () => import('./pages/compliance/compliance').then(m => m.ComplianceComponent),
  },
  {
    path: 'waivers',
    loadComponent: () => import('./pages/waivers/waivers').then(m => m.WaiversComponent),
  },

  // ── Back office ───────────────────────────────────────────────────────
  {
    path: 'plans',
    loadComponent: () => import('./pages/plans/plans').then(m => m.PlansComponent),
  },
  {
    path: 'setup/classes',
    loadComponent: () =>
      import('./pages/setup-classes/setup-classes').then(m => m.SetupClassesComponent),
  },
  {
    path: 'clubs',
    loadComponent: () => import('./pages/clubs/clubs').then(m => m.ClubsComponent),
  },
  {
    path: 'staff',
    loadComponent: () => import('./pages/staff/staff').then(m => m.StaffComponent),
  },
  {
    path: 'reports',
    loadComponent: () => import('./pages/reports/reports').then(m => m.ReportsComponent),
  },
  {
    path: 'settings',
    loadComponent: () => import('./pages/settings/settings').then(m => m.SettingsComponent),
  },

  // Anything else lands on the dashboard rather than a dead end.
  { path: '**', redirectTo: 'dashboard' },
];
