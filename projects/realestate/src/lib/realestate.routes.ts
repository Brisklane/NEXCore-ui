import { Routes } from '@angular/router';

/**
 * Real Estate app routes.
 *
 * Ordered the way a property business is actually staffed rather than alphabetically: what runs
 * the day first, then sales and money, then delivery, then the back office. Every screen is lazy,
 * so a guard's tablet on the gate downloads the gate and nothing else, and a site engineer's phone
 * never fetches the revenue recognition engine.
 *
 * Four lines of business share these routes. A screen that belongs to only one of them is still
 * routable — deep links from an email must not break — but the sidebar hides it, so a letting
 * agency is never shown an escrow account and a plot developer is never shown a rent roll.
 */
export const realEstateRoutes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },

  // ── Overview ──────────────────────────────────────────────────────────
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./pages/dashboard/realestate-dashboard').then(m => m.RealEstateDashboardComponent),
  },
  {
    path: 'portfolio',
    loadComponent: () => import('./pages/portfolio/portfolio').then(m => m.PortfolioComponent),
  },
  {
    path: 'reports',
    loadComponent: () => import('./pages/reports/reports').then(m => m.ReportsComponent),
  },

  // ── Property and land ─────────────────────────────────────────────────
  {
    path: 'properties',
    loadComponent: () => import('./pages/properties/properties').then(m => m.PropertiesComponent),
  },
  {
    path: 'properties/:id',
    loadComponent: () =>
      import('./pages/property-detail/property-detail').then(m => m.PropertyDetailComponent),
  },
  {
    path: 'land/parcels',
    loadComponent: () => import('./pages/parcels/parcels').then(m => m.ParcelsComponent),
  },
  {
    path: 'land/parcels/:id',
    loadComponent: () =>
      import('./pages/parcel-detail/parcel-detail').then(m => m.ParcelDetailComponent),
  },
  {
    path: 'land/acquisitions',
    loadComponent: () =>
      import('./pages/acquisitions/acquisitions').then(m => m.AcquisitionsComponent),
  },

  // ── Projects and inventory ────────────────────────────────────────────
  {
    path: 'projects',
    loadComponent: () => import('./pages/projects/projects').then(m => m.ProjectsComponent),
  },
  {
    path: 'projects/:id',
    loadComponent: () =>
      import('./pages/project-detail/project-detail').then(m => m.ProjectDetailComponent),
  },
  {
    path: 'inventory',
    loadComponent: () => import('./pages/inventory/inventory').then(m => m.InventoryComponent),
  },
  {
    path: 'inventory/holds',
    loadComponent: () => import('./pages/holds/holds').then(m => m.HoldsComponent),
  },
  {
    path: 'inventory/pricing',
    loadComponent: () => import('./pages/pricing/pricing').then(m => m.PricingComponent),
  },
  {
    path: 'inventory/units/:id',
    loadComponent: () => import('./pages/unit-detail/unit-detail').then(m => m.UnitDetailComponent),
  },
  {
    path: 'plot-files',
    loadComponent: () => import('./pages/plot-files/plot-files').then(m => m.PlotFilesComponent),
  },

  // ── Listings and marketing ────────────────────────────────────────────
  {
    path: 'listings',
    loadComponent: () => import('./pages/listings/listings').then(m => m.ListingsComponent),
  },
  {
    path: 'listings/:id',
    loadComponent: () =>
      import('./pages/listing-detail/listing-detail').then(m => m.ListingDetailComponent),
  },
  {
    path: 'instructions',
    loadComponent: () =>
      import('./pages/instructions/instructions').then(m => m.InstructionsComponent),
  },
  {
    path: 'portals',
    loadComponent: () => import('./pages/portals/portals').then(m => m.PortalsComponent),
  },
  {
    path: 'marketing',
    loadComponent: () => import('./pages/marketing/marketing').then(m => m.MarketingComponent),
  },

  // ── People and pipeline ───────────────────────────────────────────────
  {
    path: 'my-day',
    loadComponent: () => import('./pages/my-day/my-day').then(m => m.MyDayComponent),
  },
  {
    path: 'contacts',
    loadComponent: () => import('./pages/contacts/contacts').then(m => m.ContactsComponent),
  },
  {
    path: 'contacts/:id',
    loadComponent: () =>
      import('./pages/contact-detail/contact-detail').then(m => m.ContactDetailComponent),
  },
  {
    path: 'kyc',
    loadComponent: () => import('./pages/kyc/kyc').then(m => m.KycComponent),
  },
  {
    path: 'caution-list',
    loadComponent: () =>
      import('./pages/caution-list/caution-list').then(m => m.CautionListComponent),
  },
  {
    path: 'enquiries',
    loadComponent: () => import('./pages/enquiries/enquiries').then(m => m.EnquiriesComponent),
  },
  {
    path: 'enquiries/:id',
    loadComponent: () =>
      import('./pages/enquiry-detail/enquiry-detail').then(m => m.EnquiryDetailComponent),
  },
  {
    path: 'matching',
    loadComponent: () => import('./pages/matching/matching').then(m => m.MatchingComponent),
  },
  {
    path: 'viewings',
    loadComponent: () => import('./pages/viewings/viewings').then(m => m.ViewingsComponent),
  },
  {
    path: 'site-visits',
    loadComponent: () => import('./pages/site-visits/site-visits').then(m => m.SiteVisitsComponent),
  },
  {
    path: 'keys',
    loadComponent: () => import('./pages/keys/keys').then(m => m.KeysComponent),
  },

  // ── Sales ─────────────────────────────────────────────────────────────
  {
    path: 'offers',
    loadComponent: () => import('./pages/offers/offers').then(m => m.OffersComponent),
  },
  {
    path: 'reservations',
    loadComponent: () =>
      import('./pages/reservations/reservations').then(m => m.ReservationsComponent),
  },
  {
    path: 'bookings',
    loadComponent: () => import('./pages/bookings/bookings').then(m => m.BookingsComponent),
  },
  {
    path: 'bookings/new',
    loadComponent: () => import('./pages/new-booking/new-booking').then(m => m.NewBookingComponent),
  },
  {
    path: 'bookings/:id',
    loadComponent: () =>
      import('./pages/booking-detail/booking-detail').then(m => m.BookingDetailComponent),
  },
  {
    path: 'allotments',
    loadComponent: () => import('./pages/allotments/allotments').then(m => m.AllotmentsComponent),
  },
  {
    path: 'ballots',
    loadComponent: () => import('./pages/ballots/ballots').then(m => m.BallotsComponent),
  },

  // ── Money ─────────────────────────────────────────────────────────────
  {
    path: 'money/plans',
    loadComponent: () =>
      import('./pages/payment-plans/payment-plans').then(m => m.PaymentPlansComponent),
  },
  {
    path: 'money/demands',
    loadComponent: () => import('./pages/demands/demands').then(m => m.DemandsComponent),
  },
  {
    path: 'money/receipts',
    loadComponent: () => import('./pages/receipts/receipts').then(m => m.ReceiptsComponent),
  },
  {
    path: 'money/cheques',
    loadComponent: () => import('./pages/cheques/cheques').then(m => m.ChequesComponent),
  },
  {
    path: 'money/collections',
    loadComponent: () =>
      import('./pages/collections/collections').then(m => m.CollectionsComponent),
  },
  {
    path: 'money/dunning',
    loadComponent: () => import('./pages/dunning/dunning').then(m => m.DunningComponent),
  },
  {
    path: 'money/surcharge',
    loadComponent: () => import('./pages/surcharge/surcharge').then(m => m.SurchargeComponent),
  },
  {
    path: 'money/ledger',
    loadComponent: () => import('./pages/ledger/ledger').then(m => m.LedgerComponent),
  },

  // ── Exit, possession and handover ─────────────────────────────────────
  {
    path: 'exit/cancellations',
    loadComponent: () =>
      import('./pages/cancellations/cancellations').then(m => m.CancellationsComponent),
  },
  {
    path: 'exit/refunds',
    loadComponent: () => import('./pages/refunds/refunds').then(m => m.RefundsComponent),
  },
  {
    path: 'exit/transfers',
    loadComponent: () => import('./pages/transfers/transfers').then(m => m.TransfersComponent),
  },
  {
    path: 'exit/transfers/:id',
    loadComponent: () =>
      import('./pages/transfer-detail/transfer-detail').then(m => m.TransferDetailComponent),
  },
  {
    path: 'exit/possession',
    loadComponent: () => import('./pages/possession/possession').then(m => m.PossessionComponent),
  },
  {
    path: 'exit/snagging',
    loadComponent: () => import('./pages/snagging/snagging').then(m => m.SnaggingComponent),
  },
  {
    path: 'exit/snagging/:id',
    loadComponent: () =>
      import('./pages/snag-inspection/snag-inspection').then(m => m.SnagInspectionComponent),
  },
  {
    path: 'exit/defects',
    loadComponent: () => import('./pages/defects/defects').then(m => m.DefectsComponent),
  },
  {
    path: 'exit/nocs',
    loadComponent: () => import('./pages/nocs/nocs').then(m => m.NocsComponent),
  },

  // ── Brokerage ─────────────────────────────────────────────────────────
  {
    path: 'brokerage/deals',
    loadComponent: () => import('./pages/deals/deals').then(m => m.DealsComponent),
  },
  {
    path: 'brokerage/deals/:id',
    loadComponent: () =>
      import('./pages/deal-detail/deal-detail').then(m => m.DealDetailComponent),
  },
  {
    path: 'brokerage/chains',
    loadComponent: () => import('./pages/chains/chains').then(m => m.ChainsComponent),
  },
  {
    path: 'brokerage/commission',
    loadComponent: () => import('./pages/commission/commission').then(m => m.CommissionComponent),
  },
  {
    path: 'brokerage/commission-plans',
    loadComponent: () =>
      import('./pages/commission-plans/commission-plans').then(m => m.CommissionPlansComponent),
  },
  {
    path: 'brokerage/partners',
    loadComponent: () => import('./pages/partners/partners').then(m => m.PartnersComponent),
  },
  {
    path: 'brokerage/partners/:id',
    loadComponent: () =>
      import('./pages/partner-detail/partner-detail').then(m => m.PartnerDetailComponent),
  },
  {
    path: 'brokerage/registrations',
    loadComponent: () =>
      import('./pages/registrations/registrations').then(m => m.RegistrationsComponent),
  },

  // ── Leasing and estate management ─────────────────────────────────────
  {
    path: 'leasing/tenancies',
    loadComponent: () => import('./pages/tenancies/tenancies').then(m => m.TenanciesComponent),
  },
  {
    path: 'leasing/tenancies/:id',
    loadComponent: () =>
      import('./pages/tenancy-detail/tenancy-detail').then(m => m.TenancyDetailComponent),
  },
  {
    path: 'leasing/deposits',
    loadComponent: () => import('./pages/deposits/deposits').then(m => m.DepositsComponent),
  },
  {
    path: 'leasing/inspections',
    loadComponent: () =>
      import('./pages/move-inspections/move-inspections').then(m => m.MoveInspectionsComponent),
  },
  {
    path: 'leasing/renewals',
    loadComponent: () => import('./pages/renewals/renewals').then(m => m.RenewalsComponent),
  },
  {
    path: 'leasing/critical-dates',
    loadComponent: () =>
      import('./pages/critical-dates/critical-dates').then(m => m.CriticalDatesComponent),
  },
  {
    path: 'leasing/compliance',
    loadComponent: () =>
      import('./pages/certificates/certificates').then(m => m.CertificatesComponent),
  },
  {
    path: 'leasing/rent-roll',
    loadComponent: () => import('./pages/rent-roll/rent-roll').then(m => m.RentRollComponent),
  },
  {
    path: 'leasing/rent-runs',
    loadComponent: () => import('./pages/rent-runs/rent-runs').then(m => m.RentRunsComponent),
  },
  {
    path: 'leasing/arrears',
    loadComponent: () => import('./pages/arrears/arrears').then(m => m.ArrearsComponent),
  },
  {
    path: 'leasing/voids',
    loadComponent: () => import('./pages/voids/voids').then(m => m.VoidsComponent),
  },
  {
    path: 'leasing/service-charge',
    loadComponent: () =>
      import('./pages/service-charge/service-charge').then(m => m.ServiceChargeComponent),
  },
  {
    path: 'leasing/turnover',
    loadComponent: () => import('./pages/turnover/turnover').then(m => m.TurnoverComponent),
  },
  {
    path: 'leasing/landlords',
    loadComponent: () => import('./pages/landlords/landlords').then(m => m.LandlordsComponent),
  },
  {
    path: 'leasing/landlords/:id',
    loadComponent: () =>
      import('./pages/landlord-detail/landlord-detail').then(m => m.LandlordDetailComponent),
  },
  {
    path: 'leasing/client-money',
    loadComponent: () =>
      import('./pages/client-money/client-money').then(m => m.ClientMoneyComponent),
  },

  // ── Societies and facilities ──────────────────────────────────────────
  {
    path: 'society',
    loadComponent: () => import('./pages/societies/societies').then(m => m.SocietiesComponent),
  },
  {
    path: 'society/:id',
    loadComponent: () =>
      import('./pages/society-detail/society-detail').then(m => m.SocietyDetailComponent),
  },
  {
    path: 'society/:id/residents',
    loadComponent: () => import('./pages/residents/residents').then(m => m.ResidentsComponent),
  },
  {
    path: 'society/:id/billing',
    loadComponent: () =>
      import('./pages/society-billing/society-billing').then(m => m.SocietyBillingComponent),
  },
  {
    path: 'society/:id/gate',
    loadComponent: () => import('./pages/gate/gate').then(m => m.GateComponent),
  },
  {
    path: 'society/:id/amenities',
    loadComponent: () => import('./pages/amenities/amenities').then(m => m.AmenitiesComponent),
  },
  {
    path: 'society/:id/complaints',
    loadComponent: () => import('./pages/complaints/complaints').then(m => m.ComplaintsComponent),
  },
  {
    path: 'society/:id/notices',
    loadComponent: () =>
      import('./pages/society-notices/society-notices').then(m => m.SocietyNoticesComponent),
  },
  {
    path: 'society/:id/building-control',
    loadComponent: () =>
      import('./pages/building-control/building-control').then(m => m.BuildingControlComponent),
  },
  {
    path: 'facility/work-orders',
    loadComponent: () =>
      import('./pages/work-orders/work-orders').then(m => m.WorkOrdersComponent),
  },
  {
    path: 'facility/contractors',
    loadComponent: () => import('./pages/contractors/contractors').then(m => m.ContractorsComponent),
  },
  {
    path: 'facility/ppm',
    loadComponent: () => import('./pages/ppm/ppm').then(m => m.PpmComponent),
  },
  {
    path: 'facility/assets',
    loadComponent: () => import('./pages/assets/assets').then(m => m.AssetsComponent),
  },
  {
    path: 'facility/meters',
    loadComponent: () => import('./pages/meters/meters').then(m => m.MetersComponent),
  },
  {
    path: 'facility/utilities',
    loadComponent: () => import('./pages/utilities/utilities').then(m => m.UtilitiesComponent),
  },
  {
    path: 'facility/parking',
    loadComponent: () => import('./pages/parking/parking').then(m => m.ParkingComponent),
  },

  // ── Construction ──────────────────────────────────────────────────────
  {
    path: 'construction',
    loadComponent: () =>
      import('./pages/construction/construction').then(m => m.ConstructionComponent),
  },
  {
    path: 'construction/:id',
    loadComponent: () =>
      import('./pages/construction-detail/construction-detail')
        .then(m => m.ConstructionDetailComponent),
  },
  {
    path: 'construction/:id/boq',
    loadComponent: () => import('./pages/boq/boq').then(m => m.BoqComponent),
  },
  {
    path: 'construction/:id/programme',
    loadComponent: () => import('./pages/programme/programme').then(m => m.ProgrammeComponent),
  },
  {
    path: 'construction/:id/progress',
    loadComponent: () => import('./pages/progress/progress').then(m => m.ProgressComponent),
  },
  {
    path: 'build/certificates',
    loadComponent: () => import('./pages/ipcs/ipcs').then(m => m.IpcsComponent),
  },
  {
    path: 'build/retention',
    loadComponent: () => import('./pages/retention/retention').then(m => m.RetentionComponent),
  },
  {
    path: 'build/tenders',
    loadComponent: () => import('./pages/tenders/tenders').then(m => m.TendersComponent),
  },
  {
    path: 'build/subcontracts',
    loadComponent: () =>
      import('./pages/subcontracts/subcontracts').then(m => m.SubcontractsComponent),
  },
  {
    path: 'build/claims',
    loadComponent: () => import('./pages/claims/claims').then(m => m.ClaimsComponent),
  },
  {
    path: 'build/variations',
    loadComponent: () => import('./pages/variations/variations').then(m => m.VariationsComponent),
  },
  {
    path: 'build/delays',
    loadComponent: () => import('./pages/delays/delays').then(m => m.DelaysComponent),
  },
  {
    path: 'build/materials',
    loadComponent: () => import('./pages/materials/materials').then(m => m.MaterialsComponent),
  },
  {
    path: 'build/site-diary',
    loadComponent: () => import('./pages/site-diary/site-diary').then(m => m.SiteDiaryComponent),
  },
  {
    path: 'build/safety',
    loadComponent: () => import('./pages/safety/safety').then(m => m.SafetyComponent),
  },
  {
    path: 'build/rates',
    loadComponent: () => import('./pages/rates/rates').then(m => m.RatesComponent),
  },
  {
    path: 'build/specifications',
    loadComponent: () =>
      import('./pages/specifications/specifications').then(m => m.SpecificationsComponent),
  },
  {
    path: 'build/drawings',
    loadComponent: () => import('./pages/drawings/drawings').then(m => m.DrawingsComponent),
  },
  {
    path: 'client-builds',
    loadComponent: () =>
      import('./pages/client-builds/client-builds').then(m => m.ClientBuildsComponent),
  },
  {
    path: 'client-builds/:id',
    loadComponent: () =>
      import('./pages/client-build-detail/client-build-detail')
        .then(m => m.ClientBuildDetailComponent),
  },

  // ── Project finance ───────────────────────────────────────────────────
  {
    path: 'finance/ventures',
    loadComponent: () => import('./pages/ventures/ventures').then(m => m.VenturesComponent),
  },
  {
    path: 'finance/investors',
    loadComponent: () => import('./pages/investors/investors').then(m => m.InvestorsComponent),
  },
  {
    path: 'finance/escrow',
    loadComponent: () => import('./pages/escrow/escrow').then(m => m.EscrowComponent),
  },
  {
    path: 'finance/loans',
    loadComponent: () => import('./pages/loans/loans').then(m => m.LoansComponent),
  },
  {
    path: 'finance/guarantees',
    loadComponent: () => import('./pages/guarantees/guarantees').then(m => m.GuaranteesComponent),
  },
  {
    path: 'finance/mortgages',
    loadComponent: () => import('./pages/mortgages/mortgages').then(m => m.MortgagesComponent),
  },
  {
    path: 'finance/recognition',
    loadComponent: () => import('./pages/recognition/recognition').then(m => m.RecognitionComponent),
  },
  {
    path: 'finance/profitability',
    loadComponent: () =>
      import('./pages/profitability/profitability').then(m => m.ProfitabilityComponent),
  },
  {
    path: 'finance/pnl',
    loadComponent: () => import('./pages/project-pnl/project-pnl').then(m => m.ProjectPnlComponent),
  },
  {
    path: 'finance/tax',
    loadComponent: () => import('./pages/tax/tax').then(m => m.TaxComponent),
  },

  // ── Compliance, documents and records ─────────────────────────────────
  {
    path: 'compliance/approvals',
    loadComponent: () =>
      import('./pages/statutory-approvals/statutory-approvals')
        .then(m => m.StatutoryApprovalsComponent),
  },
  {
    path: 'compliance/licences',
    loadComponent: () => import('./pages/licences/licences').then(m => m.LicencesComponent),
  },
  {
    path: 'compliance/calendar',
    loadComponent: () =>
      import('./pages/compliance-calendar/compliance-calendar')
        .then(m => m.ComplianceCalendarComponent),
  },
  {
    path: 'compliance/filings',
    loadComponent: () => import('./pages/filings/filings').then(m => m.FilingsComponent),
  },
  {
    path: 'compliance/qpr',
    loadComponent: () => import('./pages/qpr/qpr').then(m => m.QprComponent),
  },
  {
    path: 'documents',
    loadComponent: () => import('./pages/documents/documents').then(m => m.DocumentsComponent),
  },
  {
    path: 'documents/templates',
    loadComponent: () => import('./pages/templates/templates').then(m => m.TemplatesComponent),
  },
  {
    path: 'documents/signatures',
    loadComponent: () => import('./pages/signatures/signatures').then(m => m.SignaturesComponent),
  },
  {
    path: 'records/files',
    loadComponent: () =>
      import('./pages/physical-files/physical-files').then(m => m.PhysicalFilesComponent),
  },
  {
    path: 'legal/cases',
    loadComponent: () => import('./pages/legal-cases/legal-cases').then(m => m.LegalCasesComponent),
  },

  // ── Communication and portals ─────────────────────────────────────────
  {
    path: 'inbox',
    loadComponent: () => import('./pages/inbox/inbox').then(m => m.InboxComponent),
  },
  {
    path: 'broadcasts',
    loadComponent: () => import('./pages/broadcasts/broadcasts').then(m => m.BroadcastsComponent),
  },
  {
    path: 'message-templates',
    loadComponent: () =>
      import('./pages/message-templates/message-templates').then(m => m.MessageTemplatesComponent),
  },
  {
    path: 'portal-users',
    loadComponent: () => import('./pages/portal-users/portal-users').then(m => m.PortalUsersComponent),
  },
  {
    path: 'notifications',
    loadComponent: () =>
      import('./pages/notification-rules/notification-rules').then(m => m.NotificationRulesComponent),
  },

  // ── Setup ─────────────────────────────────────────────────────────────
  {
    path: 'setup/settings',
    loadComponent: () => import('./pages/settings/settings').then(m => m.SettingsComponent),
  },
  {
    path: 'setup/offices',
    loadComponent: () => import('./pages/offices/offices').then(m => m.OfficesComponent),
  },
  {
    path: 'setup/geography',
    loadComponent: () => import('./pages/geography/geography').then(m => m.GeographyComponent),
  },
  {
    path: 'setup/agents',
    loadComponent: () => import('./pages/agents/agents').then(m => m.AgentsComponent),
  },
  {
    path: 'setup/reason-codes',
    loadComponent: () =>
      import('./pages/reason-codes/reason-codes').then(m => m.ReasonCodesComponent),
  },
  {
    path: 'setup/approvals',
    loadComponent: () =>
      import('./pages/approval-setup/approval-setup').then(m => m.ApprovalSetupComponent),
  },
  {
    path: 'setup/approval-inbox',
    loadComponent: () =>
      import('./pages/approval-inbox/approval-inbox').then(m => m.ApprovalInboxComponent),
  },
  {
    path: 'setup/imports',
    loadComponent: () => import('./pages/imports/imports').then(m => m.ImportsComponent),
  },

  { path: '**', redirectTo: 'dashboard' },
];
