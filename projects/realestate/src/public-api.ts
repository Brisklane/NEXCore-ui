/*
 * Public API Surface of @nexcore/realestate
 *
 * The Real Estate app. It covers four lines of business, switchable per company:
 *
 *   Brokerage      — selling and letting other people's property for a fee.
 *   Development    — your own schemes: inventory, payment plans, transfers, possession, escrow.
 *   Contracting    — building to order: bills of quantities, programme, certificates, retention.
 *   Estate         — running property afterwards: tenancies, service charge, societies, the gate.
 *
 * A company that does only one of these never sees the other three.
 */

export * from './lib/realestate.routes';

/* ── Models ── */
export * from './lib/models/realestate.enums';
export * from './lib/models/realestate.models';

/* ── Services ── */
export * from './lib/services/realestate-api-config';
export * from './lib/services/realestate.services';
export * from './lib/services/realestate-context.service';

/* ── Shared UI ── */
export * from './lib/pages/shared/ui';
export * from './lib/pages/shared/detail-page';
export * from './lib/pages/shared/detail-bits';
export * from './lib/pages/shared/list-page';
export { ProjectPickerComponent, OfficePickerComponent } from './lib/pages/shared/project-picker';
export { PageHelpComponent, REALESTATE_HELP } from './lib/pages/shared/page-help';
export * from './lib/pages/shared/validation';

/* ── Screens ── */
export { RealEstateDashboardComponent } from './lib/pages/dashboard/realestate-dashboard';
export { PortfolioComponent } from './lib/pages/portfolio/portfolio';
export { ReportsComponent } from './lib/pages/reports/reports';
export { PropertiesComponent } from './lib/pages/properties/properties';
export { PropertyDetailComponent } from './lib/pages/property-detail/property-detail';
export { ParcelsComponent } from './lib/pages/parcels/parcels';
export { ParcelDetailComponent } from './lib/pages/parcel-detail/parcel-detail';
export { AcquisitionsComponent } from './lib/pages/acquisitions/acquisitions';
export { ProjectsComponent } from './lib/pages/projects/projects';
export { ProjectDetailComponent } from './lib/pages/project-detail/project-detail';
export { InventoryComponent } from './lib/pages/inventory/inventory';
export { HoldsComponent } from './lib/pages/holds/holds';
export { PricingComponent } from './lib/pages/pricing/pricing';
export { UnitDetailComponent } from './lib/pages/unit-detail/unit-detail';
export { PlotFilesComponent } from './lib/pages/plot-files/plot-files';
export { ListingsComponent } from './lib/pages/listings/listings';
export { ListingDetailComponent } from './lib/pages/listing-detail/listing-detail';
export { InstructionsComponent } from './lib/pages/instructions/instructions';
export { PortalsComponent } from './lib/pages/portals/portals';
export { MarketingComponent } from './lib/pages/marketing/marketing';
export { MyDayComponent } from './lib/pages/my-day/my-day';
export { ContactsComponent } from './lib/pages/contacts/contacts';
export { ContactDetailComponent } from './lib/pages/contact-detail/contact-detail';
export { KycComponent } from './lib/pages/kyc/kyc';
export { CautionListComponent } from './lib/pages/caution-list/caution-list';
export { EnquiriesComponent } from './lib/pages/enquiries/enquiries';
export { EnquiryDetailComponent } from './lib/pages/enquiry-detail/enquiry-detail';
export { MatchingComponent } from './lib/pages/matching/matching';
export { ViewingsComponent } from './lib/pages/viewings/viewings';
export { SiteVisitsComponent } from './lib/pages/site-visits/site-visits';
export { KeysComponent } from './lib/pages/keys/keys';
export { OffersComponent } from './lib/pages/offers/offers';
export { ReservationsComponent } from './lib/pages/reservations/reservations';
export { BookingsComponent } from './lib/pages/bookings/bookings';
export { NewBookingComponent } from './lib/pages/new-booking/new-booking';
export { BookingDetailComponent } from './lib/pages/booking-detail/booking-detail';
export { AllotmentsComponent } from './lib/pages/allotments/allotments';
export { BallotsComponent } from './lib/pages/ballots/ballots';
export { PaymentPlansComponent } from './lib/pages/payment-plans/payment-plans';
export { DemandsComponent } from './lib/pages/demands/demands';
export { ReceiptsComponent } from './lib/pages/receipts/receipts';
export { ChequesComponent } from './lib/pages/cheques/cheques';
export { CollectionsComponent } from './lib/pages/collections/collections';
export { DunningComponent } from './lib/pages/dunning/dunning';
export { SurchargeComponent } from './lib/pages/surcharge/surcharge';
export { LedgerComponent } from './lib/pages/ledger/ledger';
export { CancellationsComponent } from './lib/pages/cancellations/cancellations';
export { RefundsComponent } from './lib/pages/refunds/refunds';
export { TransfersComponent } from './lib/pages/transfers/transfers';
export { TransferDetailComponent } from './lib/pages/transfer-detail/transfer-detail';
export { PossessionComponent } from './lib/pages/possession/possession';
export { SnaggingComponent } from './lib/pages/snagging/snagging';
export { SnagInspectionComponent } from './lib/pages/snag-inspection/snag-inspection';
export { DefectsComponent } from './lib/pages/defects/defects';
export { NocsComponent } from './lib/pages/nocs/nocs';
export { DealsComponent } from './lib/pages/deals/deals';
export { DealDetailComponent } from './lib/pages/deal-detail/deal-detail';
export { ChainsComponent } from './lib/pages/chains/chains';
export { CommissionComponent } from './lib/pages/commission/commission';
export { CommissionPlansComponent } from './lib/pages/commission-plans/commission-plans';
export { PartnersComponent } from './lib/pages/partners/partners';
export { PartnerDetailComponent } from './lib/pages/partner-detail/partner-detail';
export { RegistrationsComponent } from './lib/pages/registrations/registrations';
export { TenanciesComponent } from './lib/pages/tenancies/tenancies';
export { TenancyDetailComponent } from './lib/pages/tenancy-detail/tenancy-detail';
export { DepositsComponent } from './lib/pages/deposits/deposits';
export { MoveInspectionsComponent } from './lib/pages/move-inspections/move-inspections';
export { RenewalsComponent } from './lib/pages/renewals/renewals';
export { CriticalDatesComponent } from './lib/pages/critical-dates/critical-dates';
export { CertificatesComponent } from './lib/pages/certificates/certificates';
export { RentRollComponent } from './lib/pages/rent-roll/rent-roll';
export { RentRunsComponent } from './lib/pages/rent-runs/rent-runs';
export { ArrearsComponent } from './lib/pages/arrears/arrears';
export { VoidsComponent } from './lib/pages/voids/voids';
export { ServiceChargeComponent } from './lib/pages/service-charge/service-charge';
export { TurnoverComponent } from './lib/pages/turnover/turnover';
export { LandlordsComponent } from './lib/pages/landlords/landlords';
export { LandlordDetailComponent } from './lib/pages/landlord-detail/landlord-detail';
export { ClientMoneyComponent } from './lib/pages/client-money/client-money';
export { SocietiesComponent } from './lib/pages/societies/societies';
export { SocietyDetailComponent } from './lib/pages/society-detail/society-detail';
export { ResidentsComponent } from './lib/pages/residents/residents';
export { SocietyBillingComponent } from './lib/pages/society-billing/society-billing';
export { GateComponent } from './lib/pages/gate/gate';
export { AmenitiesComponent } from './lib/pages/amenities/amenities';
export { ComplaintsComponent } from './lib/pages/complaints/complaints';
export { SocietyNoticesComponent } from './lib/pages/society-notices/society-notices';
export { BuildingControlComponent } from './lib/pages/building-control/building-control';
export { WorkOrdersComponent } from './lib/pages/work-orders/work-orders';
export { ContractorsComponent } from './lib/pages/contractors/contractors';
export { PpmComponent } from './lib/pages/ppm/ppm';
export { AssetsComponent } from './lib/pages/assets/assets';
export { MetersComponent } from './lib/pages/meters/meters';
export { UtilitiesComponent } from './lib/pages/utilities/utilities';
export { ParkingComponent } from './lib/pages/parking/parking';
export { ConstructionComponent } from './lib/pages/construction/construction';
export { ConstructionDetailComponent } from './lib/pages/construction-detail/construction-detail';
export { BoqComponent } from './lib/pages/boq/boq';
export { ProgrammeComponent } from './lib/pages/programme/programme';
export { ProgressComponent } from './lib/pages/progress/progress';
export { IpcsComponent } from './lib/pages/ipcs/ipcs';
export { RetentionComponent } from './lib/pages/retention/retention';
export { TendersComponent } from './lib/pages/tenders/tenders';
export { SubcontractsComponent } from './lib/pages/subcontracts/subcontracts';
export { ClaimsComponent } from './lib/pages/claims/claims';
export { VariationsComponent } from './lib/pages/variations/variations';
export { DelaysComponent } from './lib/pages/delays/delays';
export { MaterialsComponent } from './lib/pages/materials/materials';
export { SiteDiaryComponent } from './lib/pages/site-diary/site-diary';
export { SafetyComponent } from './lib/pages/safety/safety';
export { RatesComponent } from './lib/pages/rates/rates';
export { SpecificationsComponent } from './lib/pages/specifications/specifications';
export { DrawingsComponent } from './lib/pages/drawings/drawings';
export { ClientBuildsComponent } from './lib/pages/client-builds/client-builds';
export { ClientBuildDetailComponent } from './lib/pages/client-build-detail/client-build-detail';
export { VenturesComponent } from './lib/pages/ventures/ventures';
export { InvestorsComponent } from './lib/pages/investors/investors';
export { EscrowComponent } from './lib/pages/escrow/escrow';
export { LoansComponent } from './lib/pages/loans/loans';
export { GuaranteesComponent } from './lib/pages/guarantees/guarantees';
export { MortgagesComponent } from './lib/pages/mortgages/mortgages';
export { RecognitionComponent } from './lib/pages/recognition/recognition';
export { ProfitabilityComponent } from './lib/pages/profitability/profitability';
export { ProjectPnlComponent } from './lib/pages/project-pnl/project-pnl';
export { TaxComponent } from './lib/pages/tax/tax';
export { StatutoryApprovalsComponent } from './lib/pages/statutory-approvals/statutory-approvals';
export { LicencesComponent } from './lib/pages/licences/licences';
export { ComplianceCalendarComponent } from './lib/pages/compliance-calendar/compliance-calendar';
export { FilingsComponent } from './lib/pages/filings/filings';
export { QprComponent } from './lib/pages/qpr/qpr';
export { DocumentsComponent } from './lib/pages/documents/documents';
export { TemplatesComponent } from './lib/pages/templates/templates';
export { SignaturesComponent } from './lib/pages/signatures/signatures';
export { PhysicalFilesComponent } from './lib/pages/physical-files/physical-files';
export { LegalCasesComponent } from './lib/pages/legal-cases/legal-cases';
export { InboxComponent } from './lib/pages/inbox/inbox';
export { BroadcastsComponent } from './lib/pages/broadcasts/broadcasts';
export { MessageTemplatesComponent } from './lib/pages/message-templates/message-templates';
export { PortalUsersComponent } from './lib/pages/portal-users/portal-users';
export { NotificationRulesComponent } from './lib/pages/notification-rules/notification-rules';
export { SettingsComponent } from './lib/pages/settings/settings';
export { OfficesComponent } from './lib/pages/offices/offices';
export { GeographyComponent } from './lib/pages/geography/geography';
export { AgentsComponent } from './lib/pages/agents/agents';
export { ReasonCodesComponent } from './lib/pages/reason-codes/reason-codes';
export { ApprovalSetupComponent } from './lib/pages/approval-setup/approval-setup';
export { ApprovalInboxComponent } from './lib/pages/approval-inbox/approval-inbox';
export { ImportsComponent } from './lib/pages/imports/imports';
