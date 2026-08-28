/* =====================================================================================
 * Real Estate data contracts.
 *
 * Mirrors the DTOs the API returns, one interface per class. Property names are camel-cased
 * because that is what the JSON on the wire carries; nullable C# properties become optional here
 * so the compiler makes a screen deal with a missing value rather than printing "undefined" at a
 * customer.
 * ===================================================================================== */

import type {
  AccessArrangement,
  AcquisitionStageKind,
  ActivityDirection,
  ActivityKind,
  AgencyBasis,
  AlertSeverity,
  AllocationOrder,
  AllotmentStatus,
  AmenityBookingStatus,
  ApportionmentBasis,
  ApprovalKind,
  ApprovalOutcome,
  ApprovalState,
  AreaUnit,
  AssetKind,
  BallotStatus,
  BlockReason,
  BookingStatus,
  BoqLineKind,
  BuildingApplicationStatus,
  BuyingPurpose,
  CancellationTrigger,
  CertificateStatus,
  ChargeBasis,
  ChargeKind,
  ChequeState,
  ClientAccountKind,
  ClientMoneyExceptionKind,
  CommissionPlanKind,
  CommissionStatus,
  CommissionTrigger,
  ComplaintCategory,
  ComplianceCertificateKind,
  ConditionGrade,
  ContraChargeKind,
  ContractKind,
  CostAllocationBasis,
  CostBearer,
  DealPartyRole,
  DealStatus,
  DeductionBasis,
  DeductionKind,
  DefectCategory,
  DemandStatus,
  DepositScheme,
  DocumentState,
  DunningAction,
  EncumbranceKind,
  EncumbranceStatus,
  EnquiryChannel,
  EnquiryStage,
  EscalationKind,
  EscrowMovementKind,
  Facing,
  FallThroughCause,
  FeeBasis,
  FundingKind,
  FurnishingState,
  GateEntryStatus,
  GuaranteeKind,
  HoldStatus,
  IdentityKind,
  ImportBatchStatus,
  ImportEntityKind,
  InspectionKind,
  InstalmentFrequency,
  InstalmentKind,
  InstalmentStatus,
  InterestLevel,
  JvShareBasis,
  KycStatus,
  LeadRegistrationStatus,
  LeaseOptionKind,
  LedgerEntryKind,
  LegalCaseStatus,
  LineOfBusiness,
  ListingKind,
  ListingStatus,
  LoanStatus,
  MaintenanceBasis,
  ManagementService,
  MediaKind,
  MeterKind,
  MilestoneStatus,
  NocKind,
  NocStatus,
  NotificationChannel,
  OccupancyState,
  OfferConditionKind,
  OfferStatus,
  OfficeType,
  PartnerStatus,
  PartyKind,
  PartyRoleKind,
  PaymentInstrument,
  PhysicalFileState,
  PortalAudience,
  PortalPublishState,
  PossessionStatus,
  ProgressMethod,
  ProjectAccountKind,
  ProjectKind,
  ProjectNodeKind,
  ProjectStatus,
  PromiseState,
  PropertyCategory,
  PropertyCondition,
  PropertyStatus,
  PropertySubType,
  ReadingSource,
  ReceiptStatus,
  RecognitionBasis,
  ReconciliationOutcome,
  ReferencingCheckKind,
  ReferencingOutcome,
  RefundStatus,
  RentFrequency,
  ReservationStatus,
  ResidentKind,
  RetentionMovement,
  RiskRating,
  SafetySeverity,
  ServiceChargeHead,
  SignatureMethod,
  SignatureState,
  SnagSeverity,
  SnagStatus,
  SnagZone,
  SourcingChannel,
  SpecificationGrade,
  SubcontractStatus,
  SurchargeBasis,
  TaskState,
  TenancyKind,
  TenancyStatus,
  TenderStatus,
  Tenure,
  TicketPriority,
  TicketStatus,
  TitleInstrument,
  TransferKind,
  TransferStatus,
  TransportArrangement,
  TurnoverRentBasis,
  VariationOrigin,
  VariationStatus,
  VerificationVerdict,
  ViewingStatus,
  VisitorKind,
  WbsKind,
  WithholdingKind,
  WorkOrderSource,
  WorkOrderStatus,
} from './realestate.enums';

/* ── Envelopes ─────────────────────────────────────────────────────────── */

/** What every non-paged endpoint returns. */
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: string[];
}

/** Paging metadata, exactly as the server sends it. */
export interface PaginationMetadata {
  currentPage: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

/** What every paged endpoint returns. */
export interface PaginatedResponse<T> {
  success: boolean;
  message?: string;
  data?: T[];
  pagination?: PaginationMetadata;
}


/* ── AdminDtos ─────────────────────────────────────────────── */

export interface RealEstateOfficeDto {
  id: string;
  name: string;
  code?: string;
  officeType: OfficeType;
  phone?: string;
  email?: string;
  address: AddressDto;
  timeZoneId?: string;
  currencyCode: string;
  displayAreaUnit?: AreaUnit;
  linesOfBusiness: LinesOfBusinessDto;
  workingDaysMask: number;
  opensAt?: string;
  closesAt?: string;
  isFranchise: boolean;
  franchiseRoyaltyPercent: number;
  managerName?: string;
  registrationNumber?: string;
  taxNumber?: string;
  isActive: boolean;
  agentCount: number;
  activeListingCount: number;
}

export interface GeoAreaDto {
  id: string;
  parentAreaId?: string;
  name: string;
  code?: string;
  levelLabel?: string;
  depth: number;
  path?: string;
  latitude?: number;
  longitude?: number;
  boundaryGeoJson?: string;
  averageRatePerSqFt?: number;
  propertyCount: number;
  isActive: boolean;
  children: GeoAreaDto[];
}

export interface TerritoryDto {
  id: string;
  name: string;
  code?: string;
  officeName?: string;
  categoryFilter?: PropertyCategory;
  minPrice?: number;
  maxPrice?: number;
  boundaryGeoJson?: string;
  isActive: boolean;
  areas: LookupDto[];
  assignments: TerritoryAssignmentDto[];
  leadsThisMonth: number;
}

export interface TerritoryAssignmentDto {
  id?: string;
  agentProfileId: string;
  agentName: string;
  effectiveFrom: string;
  effectiveTo?: string;
  routingWeight: number;
  isPrimary: boolean;
}

export interface AgentProfileDto {
  id: string;
  userId?: string;
  employeeId?: string;
  displayName: string;
  code?: string;
  phone?: string;
  email?: string;
  photoUrl?: string;
  jobTitle?: string;
  officeName?: string;
  teamName?: string;
  joinedOn?: string;
  leftOn?: string;
  capAnniversary?: string;
  commissionPlanName?: string;
  maxOpenLeads: number;
  maxLeadsPerDay: number;
  acceptsNewLeads: boolean;
  isOnLeave: boolean;
  coveringAgentName?: string;
  languages?: string;
  specialisations?: string;
  isActive: boolean;
  openLeads: number;
  listingsTaken: number;
  viewingsHeld: number;
  offersMade: number;
  dealsClosed: number;
  bookingsMade: number;
  bookingValue: number;
  grossCommission: number;
  netCommission: number;
  conversionPercent: number;
  averageDaysToClose: number;
  averageSpeedToLeadMinutes: number;
  currencyCode: string;
  hasExpiredLicence: boolean;
  licences: AgentLicenceDto[];
  capPosition?: AgentCapLedgerDto;
}

export interface AgentLicenceDto {
  id?: string;
  licenceType: string;
  licenceNumber: string;
  issuingAuthority?: string;
  issuedOn?: string;
  expiresOn?: string;
  daysToExpiry?: number;
  isExpired: boolean;
  documentUrl?: string;
  blocksAssignmentWhenExpired: boolean;
  isVerified: boolean;
}

export interface SalesTeamDto {
  id: string;
  name: string;
  code?: string;
  officeName?: string;
  leaderName?: string;
  leaderOverridePercent: number;
  commissionPlanName?: string;
  memberCount: number;
  teamVolume: number;
  teamDeals: number;
  members: AgentProfileDto[];
}

export interface ApprovalMatrixDto {
  id: string;
  documentType: string;
  officeName?: string;
  projectName?: string;
  minAmount: number;
  maxAmount?: number;
  level: number;
  approverRoleId?: string;
  approverRoleName?: string;
  approverUserId?: string;
  approverUserName?: string;
  autoApproveBelowMin: boolean;
  escalateAfterHours?: number;
}

export interface PortalUserDto {
  id: string;
  audience: PortalAudience;
  partyId?: string;
  landlordId?: string;
  channelPartnerId?: string;
  residentId?: string;
  loginIdentifier: string;
  displayName: string;
  email?: string;
  phone?: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  isActive: boolean;
  mustChangePassword: boolean;
  lastLoginAt?: string;
  invitedAt?: string;
  activatedAt?: string;
  isLocked: boolean;
  preferredLanguage: string;
  notifyByEmail: boolean;
  notifyBySms: boolean;
  notifyByWhatsApp: boolean;
  notifyByPush: boolean;
}

/** The customer portal's home screen — everything a buyer wants without asking anyone. */
export interface CustomerPortalHomeDto {
  customerName: string;
  currencyCode: string;
  bookings: BookingListItemDto[];
  builds: ClientBuildContractListItemDto[];
  totalInvested: number;
  totalPaid: number;
  totalOutstanding: number;
  nextDueDate?: string;
  nextDueAmount: number;
  openDemands: DemandListItemDto[];
  recentReceipts: ReceiptListItemDto[];
  documents: GeneratedDocumentDto[];
  constructionProgress: ProjectMilestoneDto[];
  progressPhotoUrls: string[];
  notices: SocietyNoticeDto[];
  unreadMessages: number;
}

/** The tenant and resident portal's home screen. */
export interface TenantPortalHomeDto {
  tenantName: string;
  currencyCode: string;
  tenancies: TenancyListItemDto[];
  rentDue: number;
  nextRentDate?: string;
  arrears: number;
  deposit?: SecurityDepositDto;
  maintenanceBills: MaintenanceBillDto[];
  openRequests: ComplaintListItemDto[];
  amenityBookings: AmenityBookingDto[];
  expectedVisitors: VisitorPassDto[];
  certificates: ComplianceCertificateDto[];
  notices: SocietyNoticeDto[];
  documents: GeneratedDocumentDto[];
}

/** The landlord portal's home screen. */
export interface OwnerPortalHomeDto {
  ownerName: string;
  currencyCode: string;
  propertyCount: number;
  monthlyRent: number;
  collectedThisMonth: number;
  arrears: number;
  currentBalance: number;
  nextPayoutAmount: number;
  nextPayoutDate?: string;
  properties: PropertyListItemDto[];
  tenancies: TenancyListItemDto[];
  statements: OwnerStatementDto[];
  workOrders: WorkOrderListItemDto[];
  awaitingMyApproval: WorkOrderListItemDto[];
  expiringCertificates: ComplianceCertificateDto[];
}

/** The channel partner portal's home screen. */
export interface PartnerPortalHomeDto {
  partnerName: string;
  tierName?: string;
  currencyCode: string;
  authorisedProjects: ProjectListItemDto[];
  activeRegistrations: number;
  expiringRegistrations: number;
  siteVisitsThisMonth: number;
  bookingsThisMonth: number;
  bookingValue: number;
  commissionEarned: number;
  commissionPaid: number;
  commissionPending: number;
  registrations: LeadRegistrationDto[];
  upcomingVisits: SiteVisitListItemDto[];
  commissionEntries: PartnerCommissionEntryDto[];
  statements: PartnerStatementDto[];
  collateral: ContentAssetDto[];
  contests: PartnerContestDto[];
}

export interface ConversationDto {
  id: string;
  partyId?: string;
  partyName?: string;
  partyPhone?: string;
  enquiryId?: string;
  channelPartnerId?: string;
  channel: NotificationChannel;
  subject?: string;
  startedAt: string;
  lastMessageAt?: string;
  messageCount: number;
  unreadCount: number;
  assignedToName?: string;
  status: string;
  snoozedUntil?: string;
  awaitingReply: boolean;
  minutesAwaitingReply?: number;
  lastMessagePreview?: string;
  messages: ConversationMessageDto[];
}

export interface ConversationMessageDto {
  id: string;
  direction: ActivityDirection;
  sentAt: string;
  body?: string;
  mediaUrl?: string;
  mediaType?: string;
  caption?: string;
  sentByName?: string;
  deliveredAt?: string;
  readAt?: string;
  failed: boolean;
  failureReason?: string;
  isAutomated: boolean;
}

export interface SendMessageDto {
  conversationId?: string;
  partyId?: string;
  enquiryId?: string;
  bookingId?: string;
  tenancyId?: string;
  channel: NotificationChannel;
  to?: string;
  messageTemplateId?: string;
  subject?: string;
  body?: string;
  mediaUrl?: string;
  attachDocumentId?: string;
  mergeValues: Record<string, string>;
}

export interface MessageTemplateDto {
  id: string;
  code: string;
  name: string;
  channel: NotificationChannel;
  languageCode: string;
  isRightToLeft: boolean;
  subject?: string;
  body: string;
  providerTemplateName?: string;
  isProviderApproved: boolean;
  mergeFields: string[];
  version: number;
  isActive: boolean;
  category?: string;
  sentCount: number;
}

export interface BroadcastRunDto {
  id: string;
  reference: string;
  name: string;
  channel: NotificationChannel;
  messageTemplateName?: string;
  subject?: string;
  body?: string;
  segmentKey: string;
  projectName?: string;
  societyName?: string;
  scheduledFor?: string;
  startedAt?: string;
  completedAt?: string;
  targetCount: number;
  sentCount: number;
  suppressedCount: number;
  deliveredCount: number;
  readCount: number;
  failedCount: number;
  optOutCount: number;
  cost?: number;
  status: string;
  runByName?: string;
  deliveryRatePercent: number;
  readRatePercent: number;
}

export interface BroadcastRequestDto {
  name: string;
  channel: NotificationChannel;
  messageTemplateId?: string;
  subject?: string;
  body?: string;
  attachmentUrl?: string;
  segmentKey: string;
  segmentFilterJson?: string;
  projectId?: string;
  societyId?: string;
  explicitPartyIds: string[];
  scheduledFor?: string;
  dryRun: boolean;
}

export interface NotificationRuleDto {
  id: string;
  ruleKey: string;
  name: string;
  isEnabled: boolean;
  severity: AlertSeverity;
  channels: NotificationChannel[];
  targetRoles: string[];
  targetUserId?: string;
  targetUserName?: string;
  leadDays?: number;
  thresholdAmount?: number;
  isDigest: boolean;
  digestSchedule?: string;
  respectQuietHours: boolean;
  escalateAfterHours?: number;
  escalateToRole?: string;
  messageTemplateId?: string;
  projectName?: string;
  firedLast30Days: number;
}

export interface NotificationDto {
  id: string;
  ruleKey: string;
  channel: NotificationChannel;
  severity: AlertSeverity;
  title: string;
  body?: string;
  deepLink?: string;
  entityType?: string;
  entityId?: string;
  queuedAt: string;
  sentAt?: string;
  readAt?: string;
  isRead: boolean;
  failed: boolean;
  isEscalation: boolean;
}

export interface ImportBatchDto {
  id: string;
  reference: string;
  entityKind: ImportEntityKind;
  status: ImportBatchStatus;
  fileName?: string;
  fileUrl?: string;
  fileSizeBytes?: number;
  projectName?: string;
  totalRows: number;
  validRows: number;
  errorRows: number;
  warningRows: number;
  importedRows: number;
  skippedRows: number;
  updatedRows: number;
  dryRunCompleted: boolean;
  dryRunAt?: string;
  startedAt?: string;
  completedAt?: string;
  runByName?: string;
  allowUpdates: boolean;
  matchKeyField?: string;
  canRollback: boolean;
  wasRolledBack: boolean;
  errorSummary?: string;
  errors: ImportBatchErrorDto[];
}

export interface ImportBatchErrorDto {
  id: string;
  rowNumber: number;
  columnName?: string;
  cellValue?: string;
  severity: string;
  message: string;
  /** What the operator should do about it, in their language not the parser's. */
  suggestion?: string;
  isResolved: boolean;
}

export interface ImportRequestDto {
  entityKind: ImportEntityKind;
  fileName?: string;
  fileUrl?: string;
  projectId?: string;
  officeId?: string;
  mappingProfileJson?: string;
  allowUpdates: boolean;
  matchKeyField?: string;
  dryRun: boolean;
  /** Rows as parsed by the client, so the server never has to own a spreadsheet parser. */
  rows: Record<string, string>[];
}

/**
 * A generic tabular report envelope. Every report in the module returns this shape so one screen,
 * one exporter and one scheduler can serve all of them.
 */
export interface ReportResultDto {
  reportKey: string;
  title: string;
  subtitle?: string;
  generatedAt: string;
  currencyCode: string;
  appliedFilters: Record<string, string>;
  columns: ReportColumnDto[];
  rows: Record<string, unknown>[];
  totals: Record<string, unknown>;
  breakdown: BreakdownSliceDto[];
  trend: TrendPointDto[];
  rowCount: number;
  isTruncated: boolean;
}

export interface ReportColumnDto {
  key: string;
  label: string;
  /** "text", "number", "money", "percent", "date", "area", "status", "link". */
  type: string;
  align?: string;
  isSortable: boolean;
  isTotalled: boolean;
  format?: string;
  width: number;
}

export interface ReportRequestDto {
  reportKey: string;
  fromDate?: string;
  toDate?: string;
  projectId?: string;
  officeId?: string;
  propertyId?: string;
  societyId?: string;
  agentId?: string;
  channelPartnerId?: string;
  landlordId?: string;
  groupBy?: string;
  parameters: Record<string, string>;
  top?: number;
}

/** The catalogue the reports screen renders its menu from. */
export interface ReportDefinitionDto {
  key: string;
  title: string;
  description?: string;
  /** "Sales", "Collections", "Brokerage", "Leasing", "Construction", "Financial", "Society", "Compliance". */
  category: string;
  lineOfBusiness?: LineOfBusiness;
  icon?: string;
  parameters: string[];
  supportsGrouping: boolean;
  supportsTrend: boolean;
  sortOrder: number;
}


/* ── BookingDtos ─────────────────────────────────────────────── */

export interface OfferListItemDto {
  id: string;
  reference: string;
  propertyId: string;
  propertyReference: string;
  addressOneLine: string;
  listingId?: string;
  buyerName: string;
  buyerPhone?: string;
  sellerName?: string;
  agentName?: string;
  amount: number;
  askingPrice?: number;
  differenceFromAsking?: number;
  differencePercent?: number;
  currencyCode: string;
  status: OfferStatus;
  submittedAt: string;
  expiresAt?: string;
  roundNumber: number;
  isBestAndFinal: boolean;
  funding: FundingKind;
  proofOfFundsProvided: boolean;
  mortgageInPrinciple: boolean;
  isChainFree: boolean;
  chainLength?: number;
  conditionCount: number;
  vendorNotified: boolean;
  /** Composite of price, funding, chain and conditions. Why a lower offer can win. */
  strengthScore: number;
}

export interface OfferDetailDto extends OfferListItemDto {
  buyerPartyId: string;
  sellerPartyId?: string;
  enquiryId?: string;
  depositAmount?: number;
  proofOfFundsUrl?: string;
  proposedCompletionDate?: string;
  decidedAt?: string;
  vendorNotifiedAt?: string;
  rejectReason?: string;
  note?: string;
  resultingDealId?: string;
  conditions: OfferConditionDto[];
  counters: OfferCounterDto[];
}

export interface OfferConditionDto {
  id?: string;
  kind: OfferConditionKind;
  detail?: string;
  satisfyByDate?: string;
  isSatisfied: boolean;
  satisfiedOn?: string;
  isOverdue: boolean;
}

export interface OfferCounterDto {
  id: string;
  roundNumber: number;
  proposedBy: string;
  amount: number;
  proposedAt: string;
  respondedAt?: string;
  outcome: OfferStatus;
  note?: string;
}

export interface OfferUpsertDto {
  id?: string;
  propertyId: string;
  listingId?: string;
  enquiryId?: string;
  buyerPartyId: string;
  sellerPartyId?: string;
  agentId?: string;
  amount: number;
  currencyCode?: string;
  expiresAt?: string;
  proposedCompletionDate?: string;
  funding: FundingKind;
  depositAmount?: number;
  proofOfFundsProvided: boolean;
  proofOfFundsUrl?: string;
  mortgageInPrinciple: boolean;
  isChainFree: boolean;
  chainLength?: number;
  isBestAndFinal: boolean;
  note?: string;
  conditions: OfferConditionDto[];
  notifyVendor: boolean;
}

export interface OfferDecisionDto {
  offerId: string;
  decision: OfferStatus;
  counterAmount?: number;
  rejectReasonCodeId?: string;
  note?: string;
  /** Accepting an offer opens a deal. Set false to accept without progressing yet. */
  createDeal: boolean;
}

export interface ExpressionOfInterestDto {
  id: string;
  reference: string;
  projectId: string;
  projectName: string;
  partyId: string;
  partyName: string;
  partyPhone?: string;
  partnerName?: string;
  categoryCode?: string;
  amount: number;
  receivedAt: string;
  priorityNumber: number;
  status: ReservationStatus;
  receiptId?: string;
  receiptNumber?: string;
  convertedBookingId?: string;
  isRefundable: boolean;
  refundedAt?: string;
}

export interface TokenReservationDto {
  id: string;
  reference: string;
  unitId: string;
  unitNumber: string;
  projectName: string;
  plotFileId?: string;
  fileNumber?: string;
  partyId: string;
  partyName: string;
  partyPhone?: string;
  partnerName?: string;
  salesExecutiveName?: string;
  amount: number;
  agreedPrice?: number;
  listPrice?: number;
  currencyCode: string;
  receivedAt: string;
  validUntil: string;
  hoursRemaining: number;
  status: ReservationStatus;
  isAdjustableAgainstPrice: boolean;
  isForfeitableOnWithdrawal: boolean;
  receiptNumber?: string;
  convertedBookingId?: string;
  agreementUrl?: string;
}

export interface TokenReservationCreateDto {
  unitId: string;
  plotFileId?: string;
  partyId?: string;
  newParty?: PartyUpsertDto;
  enquiryId?: string;
  channelPartnerId?: string;
  salesExecutiveId?: string;
  amount: number;
  agreedPrice?: number;
  validDays: number;
  isAdjustableAgainstPrice: boolean;
  isForfeitableOnWithdrawal: boolean;
  payment?: ReceiptCreateDto;
}

export interface BookingListItemDto {
  id: string;
  reference: string;
  status: BookingStatus;
  bookingDate: string;
  projectId: string;
  projectName: string;
  unitId?: string;
  unitNumber?: string;
  blockName?: string;
  fileNumber?: string;
  subType?: PropertySubType;
  area?: AreaDto;
  primaryApplicantPartyId: string;
  applicantName: string;
  applicantPhone?: string;
  fatherOrGuardianName?: string;
  sourcingChannel: SourcingChannel;
  partnerName?: string;
  salesExecutiveName?: string;
  totalConsideration: number;
  totalPaid: number;
  outstanding: number;
  overdueAmount: number;
  collectionPercent: number;
  currencyCode: string;
  nextDueDate?: string;
  nextDueAmount: number;
  daysOverdue: number;
  isDefaulting: boolean;
  isUnderLitigation: boolean;
  kycStatus: KycStatus;
}

export interface BookingDetailDto extends BookingListItemDto {
  propertyId?: string;
  plotFileId?: string;
  enquiryId?: string;
  siteVisitId?: string;
  tokenReservationId?: string;
  expressionOfInterestId?: string;
  leadRegistrationId?: string;
  campaignId?: string;
  listPrice: number;
  discountAmount: number;
  discountPercent: number;
  netSalePrice: number;
  ratePerSqFt: number;
  totalDemanded: number;
  totalSurcharge: number;
  totalWaived: number;
  paymentPlanId?: string;
  paymentPlanName?: string;
  allotmentId?: string;
  allotmentNumber?: string;
  saleAgreementId?: string;
  confirmedAt?: string;
  agreementSignedOn?: string;
  possessionOfferedOn?: string;
  possessionTakenOn?: string;
  registeredOn?: string;
  cancellationId?: string;
  transferRequestId?: string;
  previousBookingId?: string;
  dunningCaseId?: string;
  customerMortgageId?: string;
  notes?: string;
  applicants: BookingApplicantDto[];
  chargeLines: CostSheetLineDto[];
  paymentPlan?: PaymentPlanDto;
  demands: DemandListItemDto[];
  receipts: ReceiptListItemDto[];
  ledger: CustomerLedgerEntryDto[];
  documents: GeneratedDocumentDto[];
  statusHistory: BookingStatusHistoryDto[];
  timeline: TimelineEntryDto[];
  documentChecklist: ChecklistItemDto[];
  possession?: PossessionOfferDto;
  pendingApprovals: ApprovalRequestDto[];
}

export interface BookingApplicantDto {
  id?: string;
  partyId: string;
  name: string;
  fatherOrGuardianName?: string;
  phone?: string;
  identityNumber?: string;
  photoUrl?: string;
  sequenceNumber: number;
  isPrimary: boolean;
  sharePercent: number;
  role: string;
  kycStatus: KycStatus;
  addedOn: string;
  removedOn?: string;
}

export interface BookingStatusHistoryDto {
  fromStatus: BookingStatus;
  toStatus: BookingStatus;
  changedAt: string;
  changedByName?: string;
  reason?: string;
  note?: string;
}

/**
 * What the booking wizard posts. One call creates the party (if new), the booking, the charge
 * lines, the payment plan and the first receipt — because a salesperson with a customer in front
 * of them cannot make five.
 */
export interface BookingCreateDto {
  projectId: string;
  unitId?: string;
  plotFileId?: string;
  holdId?: string;
  tokenReservationId?: string;
  expressionOfInterestId?: string;
  bookingDate: string;
  /** Existing party, or a new one created in the same call. */
  primaryApplicantPartyId?: string;
  newApplicant?: PartyUpsertDto;
  coApplicants: BookingApplicantDto[];
  nomineePartyId?: string;
  sourcingChannel: SourcingChannel;
  channelPartnerId?: string;
  leadRegistrationId?: string;
  salesExecutiveId?: string;
  enquiryId?: string;
  campaignId?: string;
  siteVisitId?: string;
  priceListId?: string;
  overrideListPrice?: number;
  discountAmount: number;
  discountPercent: number;
  discountReasonCodeId?: string;
  discountNote?: string;
  /** Optional premiums the customer declined — a second parking bay, a club membership. */
  declinedOptionalCharges: ChargeKind[];
  paymentPlanTemplateId?: string;
  customPlan?: PaymentPlanCustomDto;
  bookingPayment?: ReceiptCreateDto;
  notes?: string;
  /** Skip document generation — used by the bulk importer, never by the wizard. */
  suppressDocuments: boolean;
}

/**
 * What the server says before anything is written: the price it computed, the plan it would
 * build, the approvals it will need, and anything that blocks. The wizard shows this on its last
 * step, so nobody presses Confirm and then discovers a discount needed a director.
 */
export interface BookingPreviewDto {
  costSheet: CostSheetDto;
  paymentPlan: PaymentPlanPreviewDto;
  requiresApproval: boolean;
  approvalsRequired: string[];
  gate: GateResultDto;
  commissionEstimate: number;
  partnerName?: string;
  escrowPortion: number;
  freePortion: number;
}

export interface BookingApprovalDto {
  bookingId: string;
  outcome: ApprovalOutcome;
  comment?: string;
}

export interface BookingAmendmentDto {
  id?: string;
  bookingId: string;
  amendmentType: string;
  reference?: string;
  beforeValue?: string;
  afterValue?: string;
  reason?: string;
  fee: number;
  requestedOn: string;
  requestedByName?: string;
  outcome: ApprovalOutcome;
  effectiveFrom?: string;
  newUnitId?: string;
  newUnitNumber?: string;
  priceDifference?: number;
  partyId?: string;
  partyName?: string;
}

export interface AllotmentDto {
  id: string;
  bookingId: string;
  bookingReference: string;
  allotmentNumber: string;
  status: AllotmentStatus;
  issuedOn: string;
  issuedByName?: string;
  unitNumber?: string;
  projectName: string;
  applicantName: string;
  possessionTargetDate?: string;
  documentUrl?: string;
  version: number;
  supersedesAllotmentId?: string;
  reissueReason?: string;
  isDelivered: boolean;
  deliveredOn?: string;
  deliveryReference?: string;
}

export interface BallotDto {
  id: string;
  reference: string;
  name: string;
  projectId: string;
  projectName: string;
  status: BallotStatus;
  scheduledOn?: string;
  drawnAt?: string;
  publishedAt?: string;
  entryCount: number;
  prizeCount: number;
  allocatedCount: number;
  unallocatedCount: number;
  conductedByName?: string;
  witnessNames?: string;
  videoUrl?: string;
  resultDocumentUrl?: string;
  isSupplementary: boolean;
  /** Present once drawn, so anybody can re-run the draw and get the same result. */
  randomSeed?: string;
  poolHash?: string;
  categories: BallotCategoryDto[];
}

export interface BallotCategoryDto {
  id: string;
  code: string;
  name: string;
  nominalArea: AreaDto;
  quotaType: string;
  reservedCount: number;
  entryCount: number;
  prizeCount: number;
  allocatedCount: number;
  sortOrder: number;
}

export interface BallotEntryDto {
  id: string;
  ballotCategoryId?: string;
  categoryCode?: string;
  plotFileId?: string;
  fileNumber?: string;
  bookingId?: string;
  partyId: string;
  partyName: string;
  fatherOrGuardianName?: string;
  identityNumber?: string;
  sequenceInPool: number;
  priorityNumber?: number;
  isEligible: boolean;
  ineligibilityReason?: string;
  allottedUnitId?: string;
  allottedPlotNumber?: string;
  drawOrder?: number;
  wasManuallyAssigned: boolean;
  overrideReason?: string;
  isClaimed: boolean;
  claimDeadline?: string;
}

export interface BallotCreateDto {
  projectId: string;
  name: string;
  scheduledOn?: string;
  isSupplementary: boolean;
  parentBallotId?: string;
  categories: BallotCategoryUpsertDto[];
}

export interface BallotCategoryUpsertDto {
  id?: string;
  code: string;
  name: string;
  inputAreaUnit: AreaUnit;
  nominalArea: number;
  quotaType: string;
  reservedCount: number;
  prizeUnitIds: string[];
  sortOrder: number;
}

/**
 * Running the draw. The seed is either supplied (so a public ceremony can use a number everybody
 * watched being generated) or produced by the server and recorded — either way the draw is
 * reproducible, which is the only thing that makes it defensible.
 */
export interface BallotDrawDto {
  ballotId: string;
  seed?: string;
  witnessNames?: string;
  videoUrl?: string;
  dryRun: boolean;
}

export interface BallotResultDto {
  ballotId: string;
  seed: string;
  poolHash: string;
  drawnAt: string;
  allocatedCount: number;
  unallocatedEntries: number;
  unallocatedPrizes: number;
  results: BallotEntryDto[];
}

export interface SaleAgreementDto {
  id: string;
  bookingId: string;
  agreementNumber: string;
  agreementType: string;
  executedOn?: string;
  registeredOn?: string;
  registrationNumber?: string;
  registrarOffice?: string;
  stampDuty: number;
  registrationFee: number;
  languageCode: string;
  documentUrl?: string;
  isSigned: boolean;
  isSuperseded: boolean;
  signatureSessionId?: string;
  clauses: AgreementClauseDto[];
}

export interface AgreementClauseDto {
  id?: string;
  clauseKey: string;
  heading?: string;
  body: string;
  sortOrder: number;
  isNonStandard: boolean;
  isMandatory: boolean;
}


/* ── CommonDtos ─────────────────────────────────────────────── */

/** Standard list request. Every list screen in the module posts this shape. */
export interface ListQueryDto {
  page?: number;
  pageSize?: number;
  /** Free text. Each service decides which columns it searches, and says so. */
  search?: string;
  sortBy?: string;
  sortDescending?: boolean;
  officeId?: string;
  projectId?: string;
  fromDate?: string;
  toDate?: string;
  /** Include soft-deleted rows. Only honoured for roles that may see them. */
  includeInactive?: boolean;
}

/** A minimal id-and-label pair for dropdowns, so a picker never pulls a full record. */
export interface LookupDto {
  id: string;
  label: string;
  subLabel?: string;
  code?: string;
  isActive: boolean;
}

/** A money amount with the currency it is expressed in. Never a bare decimal on the wire. */
export interface MoneyDto {
  amount: number;
  currencyCode: string;
}

/**
 * An area, sent in both the canonical unit and the operator's own.
 * The UI must never do this conversion: a Lahore office types "10 marla" and a Dubai office types
 * "2,722 sq ft" for the same plot, and the arithmetic has to be identical on both.
 */
export interface AreaDto {
  squareFeet: number;
  displayValue: number;
  displayUnit: AreaUnit;
  displayText: string;
}

export interface AddressDto {
  line1?: string;
  line2?: string;
  street?: string;
  area?: string;
  city?: string;
  postCode?: string;
  countryCode?: string;
  latitude?: number;
  longitude?: number;
  oneLine: string;
}

/** One entry on a 360 screen's timeline, whatever produced it. */
export interface TimelineEntryDto {
  id: string;
  occurredAt: string;
  /** "activity", "status", "money", "document", "task", "note". */
  kind: string;
  title: string;
  detail?: string;
  icon?: string;
  tone?: string;
  actorName?: string;
  amount?: number;
  route?: string;
}

/** A row on the dashboard's "needs attention" list, ranked by damage rather than by count. */
export interface AttentionItemDto {
  key: string;
  severity: AlertSeverity;
  title: string;
  detail?: string;
  icon?: string;
  route?: string;
  count: number;
  amount?: number;
  rank: number;
}

/** A single point on a trend strip. */
export interface TrendPointDto {
  label: string;
  date?: string;
  value: number;
  secondaryValue?: number;
}

/** A labelled slice for a breakdown chart or a legend. */
export interface BreakdownSliceDto {
  label: string;
  value: number;
  percent: number;
  count: number;
  tone?: string;
}

/**
 * The Real Estate home screen.
 * Split the way the Fitness dashboard is: what needs doing in the next five minutes, then how the
 * business is going. Every figure is arithmetic over live data rather than a stored counter, so a
 * dashboard can never disagree with the report it links to.
 */
export interface RealEstateDashboardDto {
  generatedAt: string;
  officeName?: string;
  currencyCode: string;
  /** Which lines of business are switched on. The dashboard reshapes around it. */
  brokerageEnabled: boolean;
  developmentEnabled: boolean;
  contractingEnabled: boolean;
  estateManagementEnabled: boolean;
  needsAttention: AttentionItemDto[];
  holdsExpiringToday: number;
  viewingsToday: number;
  siteVisitsToday: number;
  unansweredLeads: number;
  leadsBreachingSla: number;
  demandsDueToday: number;
  receiptsToday: number;
  collectedToday: number;
  openWorkOrders: number;
  visitorsInsideNow: number;
  totalUnits: number;
  unitsAvailable: number;
  unitsHeld: number;
  unitsBooked: number;
  unitsSold: number;
  absorptionPercent: number;
  bookingValueThisMonth: number;
  bookingValueLastMonth: number;
  bookingsThisMonth: number;
  cancellationsThisMonth: number;
  demandedThisMonth: number;
  collectedThisMonth: number;
  collectionEfficiencyPercent: number;
  totalOutstanding: number;
  overdueAmount: number;
  defaulterCount: number;
  surchargeAccrued: number;
  escrowBalance: number;
  liveListings: number;
  openEnquiries: number;
  dealsInProgress: number;
  pipelineValue: number;
  commissionEarnedThisMonth: number;
  averageSpeedToLeadMinutes: number;
  fallThroughRatePercent: number;
  activeTenancies: number;
  monthlyRentRoll: number;
  rentArrears: number;
  voidUnits: number;
  occupancyPercent: number;
  tenanciesExpiringIn90Days: number;
  complianceCertificatesExpiring: number;
  openComplaints: number;
  complaintsBreachingSla: number;
  activeConstructionProjects: number;
  averagePhysicalProgressPercent: number;
  certifiedValueThisMonth: number;
  retentionHeld: number;
  openVariations: number;
  projectsAtRiskOfDelay: number;
  collectionTrend: TrendPointDto[];
  bookingTrend: TrendPointDto[];
  inventoryByStatus: BreakdownSliceDto[];
  leadsBySource: BreakdownSliceDto[];
}

/** Which lines of business are on, and the resulting shape of the app. */
export interface LinesOfBusinessDto {
  brokerage: boolean;
  development: boolean;
  contracting: boolean;
  estateManagement: boolean;
  /** Where the sidebar sends a user who has just signed in. */
  defaultRoute: string;
}

/** The settings block the UI reads once at start-up and caches for the session. */
export interface RealEstateSettingsDto {
  id: string;
  linesOfBusiness: LinesOfBusinessDto;
  displayAreaUnit: AreaUnit;
  currencyCode: string;
  reportingCurrencyCode: string;
  currencyDecimals: number;
  defaultAllocationOrder: AllocationOrder;
  demandLeadDays: number;
  defaultHoldHours: number;
  maxHoldHoursWithoutApproval: number;
  maxDiscountPercentWithoutApproval: number;
  defaultEscrowPercent: number;
  escrowEnforced: boolean;
  requireKycBeforeCompletion: boolean;
  clientMoneySegregated: boolean;
  blockTransferOnDues: boolean;
  leadResponseSlaMinutes: number;
  partnerLeadValidityDays: number;
  defaultLanguage: string;
  brandPrimaryColor?: string;
}

/** An approval waiting on somebody, whatever it is about. */
export interface ApprovalRequestDto {
  id: string;
  documentType: string;
  entityId: string;
  entityReference?: string;
  summary?: string;
  amount: number;
  currentLevel: number;
  requiredLevels: number;
  outcome: ApprovalOutcome;
  requestedByName: string;
  requestedAt: string;
  escalatesAt?: string;
  isOverdue: boolean;
  reasonLabel?: string;
  requestNote?: string;
  route?: string;
}

export interface ApprovalDecisionDto {
  approvalRequestId: string;
  outcome: ApprovalOutcome;
  comment?: string;
  onBehalfOfUserId?: string;
}

/** A reason code as the UI needs it — the controlled list behind every override. */
export interface ReasonCodeDto {
  id: string;
  context: string;
  code: string;
  label: string;
  requiresNote: boolean;
  isSystem: boolean;
  sortOrder: number;
}

/** A document produced by the template engine, ready to print, send or archive. */
export interface GeneratedDocumentDto {
  id: string;
  documentNumber: string;
  documentType: string;
  title?: string;
  url?: string;
  generatedAt: string;
  generatedByName?: string;
  languageCode: string;
  verificationCode?: string;
  isSent: boolean;
  isSigned: boolean;
  isSuperseded: boolean;
  pageCount?: number;
}

/** A checklist item on any gated process, with why it blocks. */
export interface ChecklistItemDto {
  id: string;
  key: string;
  label: string;
  isSatisfied: boolean;
  isMandatory: boolean;
  satisfiedOn?: string;
  note?: string;
  url?: string;
  state?: DocumentState;
  wasOverridden: boolean;
  overrideReason?: string;
  sortOrder: number;
}

/** The result of a gated action the server refused, with what to do about it. */
export interface GateResultDto {
  passed: boolean;
  /** Written for the person holding the phone, not for a log file. */
  message?: string;
  failures: ChecklistItemDto[];
  /** True when an authority could override this. False when nothing can. */
  canOverride: boolean;
  overrideRole?: string;
}

/** A saved list view — filters, columns and sort — shared or private. */
export interface SavedViewDto {
  id: string;
  screenKey: string;
  name: string;
  isShared: boolean;
  isDefault: boolean;
  isMine: boolean;
  configJson: string;
}


/* ── ConstructionDtos ─────────────────────────────────────────────── */

export interface ConstructionProjectListItemDto {
  id: string;
  name: string;
  code?: string;
  projectId?: string;
  projectName?: string;
  clientBuildContractId?: string;
  status: ProjectStatus;
  startDate?: string;
  plannedCompletionDate?: string;
  forecastCompletionDate?: string;
  extensionDaysGranted: number;
  slipDays?: number;
  contractValue: number;
  approvedVariations: number;
  revisedContractValue: number;
  currencyCode: string;
  budgetCost: number;
  committedCost: number;
  actualCost: number;
  forecastFinalCost: number;
  forecastMargin: number;
  marginPercent: number;
  certifiedValue: number;
  receivedValue: number;
  retentionHeld: number;
  physicalProgressPercent: number;
  financialProgressPercent: number;
  projectManagerName?: string;
  openVariations: number;
  openDelays: number;
  isAtRisk: boolean;
}

export interface ConstructionProjectDetailDto extends ConstructionProjectListItemDto {
  propertyId?: string;
  progressMethod: ProgressMethod;
  actualCompletionDate?: string;
  invoicedValue: number;
  quantitySurveyorName?: string;
  siteEngineerName?: string;
  siteWarehouseId?: string;
  defaultRetentionPercent: number;
  retentionCapPercent: number;
  defectsPeriodMonths: number;
  wbs: WbsNodeDto[];
  billsOfQuantities: LookupDto[];
  programme: ProgrammeActivityDto[];
  subcontracts: SubcontractListItemDto[];
  variations: VariationOrderListItemDto[];
  certificates: InterimPaymentCertificateListItemDto[];
  costToComplete?: CostToCompleteDto;
}

export interface WbsNodeDto {
  id: string;
  parentNodeId?: string;
  kind: WbsKind;
  code: string;
  name: string;
  depth: number;
  sortOrder: number;
  projectNodeId?: string;
  blockName?: string;
  budgetAmount: number;
  committedAmount: number;
  actualAmount: number;
  forecastAmount: number;
  varianceAmount: number;
  earnedValue: number;
  weightPercent: number;
  progressPercent: number;
  responsibleName?: string;
  subcontractId?: string;
  subcontractorName?: string;
  children: WbsNodeDto[];
}

export interface WbsNodeUpsertDto {
  id?: string;
  constructionProjectId: string;
  parentNodeId?: string;
  kind: WbsKind;
  code: string;
  name: string;
  sortOrder: number;
  projectNodeId?: string;
  budgetAmount: number;
  weightPercent: number;
  responsibleUserId?: string;
}

export interface BillOfQuantitiesDto {
  id: string;
  reference: string;
  name: string;
  constructionProjectId: string;
  projectName?: string;
  subcontractId?: string;
  tenderId?: string;
  version: number;
  isCurrent: boolean;
  boqType: string;
  totalAmount: number;
  provisionalSumsTotal: number;
  contingencyTotal: number;
  measuredTotal: number;
  currencyCode: string;
  preparedOn?: string;
  preparedByName?: string;
  isApproved: boolean;
  documentUrl?: string;
  lineCount: number;
  overallProgressPercent: number;
  sections: BoqSectionDto[];
}

export interface BoqSectionDto {
  id: string;
  parentSectionId?: string;
  code: string;
  name: string;
  totalAmount: number;
  executedAmount: number;
  progressPercent: number;
  sortOrder: number;
  wbsNodeId?: string;
  lines: BoqLineDto[];
  children: BoqSectionDto[];
}

export interface BoqLineDto {
  id: string;
  boqSectionId?: string;
  wbsNodeId?: string;
  itemCode: string;
  description: string;
  kind: BoqLineKind;
  uom: string;
  quantity: number;
  rate: number;
  amount: number;
  remeasuredQuantity?: number;
  executedQuantity: number;
  certifiedQuantity: number;
  remainingQuantity: number;
  progressPercent: number;
  budgetCostRate: number;
  actualCost: number;
  marginPerUnit: number;
  marginPercent: number;
  rateAnalysisId?: string;
  isVariation: boolean;
  variationOrderId?: string;
  variationNumber?: string;
  sortOrder: number;
  note?: string;
}

export interface BoqLineUpsertDto {
  id?: string;
  billOfQuantitiesId: string;
  boqSectionId?: string;
  wbsNodeId?: string;
  itemCode: string;
  description: string;
  kind: BoqLineKind;
  uom: string;
  quantity: number;
  rate: number;
  budgetCostRate: number;
  rateAnalysisId?: string;
  itemId?: string;
  sortOrder: number;
  note?: string;
}

export interface RateAnalysisDto {
  id: string;
  code: string;
  description: string;
  uom: string;
  constructionProjectId?: string;
  outputQuantity: number;
  materialCost: number;
  labourCost: number;
  plantCost: number;
  subtotalCost: number;
  overheadPercent: number;
  profitPercent: number;
  finalRate: number;
  currencyCode: string;
  pricedOn?: string;
  isLibraryItem: boolean;
  isActive: boolean;
  usageCount: number;
  components: RateComponentDto[];
}

export interface RateComponentDto {
  id?: string;
  componentType: string;
  description: string;
  itemId?: string;
  uom?: string;
  quantity: number;
  rate: number;
  amount: number;
  wastagePercent: number;
  sortOrder: number;
}

export interface EstimateDto {
  id: string;
  reference: string;
  name: string;
  constructionProjectId?: string;
  clientBuildContractId?: string;
  enquiryId?: string;
  partyId?: string;
  clientName?: string;
  version: number;
  preparedOn: string;
  validUntil?: string;
  isExpired: boolean;
  directCost: number;
  overheadPercent: number;
  profitPercent: number;
  contingencyPercent: number;
  totalAmount: number;
  area?: AreaDto;
  ratePerSqFt?: number;
  currencyCode: string;
  grade?: SpecificationGrade;
  status: string;
  documentUrl?: string;
  assumptions?: string;
  exclusions?: string;
  lines: EstimateLineDto[];
}

export interface EstimateLineDto {
  id?: string;
  description: string;
  uom?: string;
  quantity: number;
  rate: number;
  amount: number;
  rateAnalysisId?: string;
  wbsNodeId?: string;
  sortOrder: number;
}

export interface SpecificationScheduleDto {
  id: string;
  name: string;
  constructionProjectId?: string;
  clientBuildContractId?: string;
  projectId?: string;
  unitTypeCode?: string;
  grade: SpecificationGrade;
  version: number;
  isFrozen: boolean;
  frozenOn?: string;
  approvedByName?: string;
  documentUrl?: string;
  itemCount: number;
  clientSelectableCount: number;
  pendingSelectionCount: number;
  items: SpecificationItemDto[];
}

export interface SpecificationItemDto {
  id?: string;
  category: string;
  location?: string;
  itemName: string;
  specification?: string;
  brand?: string;
  modelOrCode?: string;
  allowanceRate?: number;
  uom?: string;
  isClientSelectable: boolean;
  selectedOption?: string;
  upgradeCost?: number;
  clientVariationId?: string;
  isClientSupplied: boolean;
  sortOrder: number;
}

export interface ProgrammeActivityDto {
  id: string;
  wbsNodeId?: string;
  code: string;
  name: string;
  plannedStart: string;
  plannedFinish: string;
  durationDays: number;
  baselineStart?: string;
  baselineFinish?: string;
  actualStart?: string;
  actualFinish?: string;
  progressPercent: number;
  totalFloatDays?: number;
  isCritical: boolean;
  isMilestone: boolean;
  projectMilestoneId?: string;
  responsibleName?: string;
  subcontractId?: string;
  subcontractorName?: string;
  /** Planned finish against baseline. Positive is late. */
  varianceDays?: number;
  isBehindSchedule: boolean;
  sortOrder: number;
  predecessorIds: string[];
}

export interface ProgressMeasurementDto {
  id: string;
  reference: string;
  constructionProjectId: string;
  projectName?: string;
  subcontractId?: string;
  subcontractorName?: string;
  wbsNodeId?: string;
  wbsName?: string;
  periodFrom: string;
  periodTo: string;
  measuredOn: string;
  measuredByName?: string;
  periodValue: number;
  cumulativeValue: number;
  progressPercent: number;
  currencyCode: string;
  method: ProgressMethod;
  isCertified: boolean;
  certifiedByName?: string;
  certifiedOn?: string;
  interimPaymentCertificateId?: string;
  wasOffline: boolean;
  photoUrls: string[];
  note?: string;
  lines: ProgressMeasurementLineDto[];
}

export interface ProgressMeasurementLineDto {
  id?: string;
  boqLineId: string;
  itemCode: string;
  description: string;
  uom: string;
  contractQuantity: number;
  previousQuantity: number;
  thisPeriodQuantity: number;
  cumulativeQuantity: number;
  rate: number;
  thisPeriodValue: number;
  cumulativeValue: number;
  certifiedQuantity: number;
  certifiedValue: number;
  measurementNote?: string;
  location?: string;
}

/** A batch of measurements taken on site with no signal, posted when the tablet syncs. */
export interface ProgressSyncBatchDto {
  constructionProjectId: string;
  subcontractId?: string;
  periodFrom: string;
  periodTo: string;
  measuredOn: string;
  lines: ProgressMeasurementLineDto[];
  photoUrls: string[];
  note?: string;
  clientReference?: string;
}

export interface MilestoneCertificateDto {
  id: string;
  certificateNumber: string;
  projectMilestoneId: string;
  milestoneName: string;
  blockName?: string;
  certifiedOn: string;
  certifiedByName: string;
  certifierName?: string;
  certifierQualification?: string;
  progressPercent: number;
  observations?: string;
  photoUrls: string[];
  documentUrl?: string;
  demandsTriggered: boolean;
  demandValueTriggered: number;
  demandCountTriggered: number;
  isCountersigned: boolean;
}

export interface InterimPaymentCertificateListItemDto {
  id: string;
  certificateNumber: string;
  direction: string;
  sequenceNumber: number;
  constructionProjectId: string;
  projectName: string;
  subcontractId?: string;
  subcontractorName?: string;
  clientBuildContractId?: string;
  clientName?: string;
  periodFrom: string;
  periodTo: string;
  issuedOn: string;
  dueDate?: string;
  status: CertificateStatus;
  grossValueToDate: number;
  thisCertificateGross: number;
  retentionThisCertificate: number;
  advanceRecovery: number;
  contraCharges: number;
  netPayable: number;
  paidAmount: number;
  currencyCode: string;
  isOverdue: boolean;
  certifiedByName?: string;
}

export interface InterimPaymentCertificateDetailDto extends InterimPaymentCertificateListItemDto {
  workDoneToDate: number;
  variationsToDate: number;
  materialsOnSite: number;
  previouslyCertified: number;
  retentionPercent: number;
  retentionCumulative: number;
  penalties: number;
  otherDeductions: number;
  netBeforeTax: number;
  taxAmount: number;
  withholdingTax: number;
  measuredByName?: string;
  certifiedOn?: string;
  documentUrl?: string;
  note?: string;
  lines: IpcLineDto[];
  contraChargeLines: ContraChargeDto[];
  /** Every step of the arithmetic in words, which is how this document is read. */
  workings: string[];
}

export interface IpcLineDto {
  id?: string;
  boqLineId?: string;
  variationOrderId?: string;
  wbsNodeId?: string;
  description: string;
  uom?: string;
  contractQuantity: number;
  rate: number;
  previousQuantity: number;
  claimedQuantity: number;
  certifiedQuantity: number;
  certifiedValue: number;
  disallowedValue: number;
  certificationNote?: string;
  sortOrder: number;
}

export interface IpcCreateDto {
  constructionProjectId: string;
  subcontractId?: string;
  clientBuildContractId?: string;
  direction: string;
  periodFrom: string;
  periodTo: string;
  issuedOn: string;
  materialsOnSite: number;
  penalties: number;
  otherDeductions: number;
  lines: IpcLineDto[];
  contraChargeIds: string[];
  note?: string;
  dryRun: boolean;
}

export interface RetentionLedgerEntryDto {
  id: string;
  constructionProjectId: string;
  projectName?: string;
  subcontractId?: string;
  subcontractorName?: string;
  clientBuildContractId?: string;
  direction: string;
  movement: RetentionMovement;
  entryDate: string;
  interimPaymentCertificateId?: string;
  certificateNumber?: string;
  amount: number;
  runningBalance: number;
  currencyCode: string;
  dueForReleaseOn?: string;
  isDueForRelease: boolean;
  punchListId?: string;
  punchListClosed: boolean;
  bankGuaranteeId?: string;
  note?: string;
}

export interface AdvancePaymentDto {
  id: string;
  reference: string;
  constructionProjectId: string;
  subcontractId?: string;
  subcontractorName?: string;
  clientBuildContractId?: string;
  direction: string;
  amount: number;
  percentOfContract: number;
  paidOn: string;
  recoveryPercent: number;
  recoveryStartsAtProgressPercent: number;
  recoveredAmount: number;
  outstandingAmount: number;
  fullyRecoveredOn?: string;
  currencyCode: string;
  bankGuaranteeId?: string;
  guaranteeNumber?: string;
  guaranteeExpiresOn?: string;
}

export interface MaterialsOnSiteDto {
  id: string;
  constructionProjectId: string;
  subcontractId?: string;
  itemId?: string;
  description: string;
  uom?: string;
  quantity: number;
  rate: number;
  value: number;
  allowedPercent: number;
  allowedValue: number;
  deliveredOn: string;
  isInsured: boolean;
  isSecured: boolean;
  consumedQuantity: number;
  reversedValue: number;
  isFullyReversed: boolean;
  photoUrl?: string;
}

export interface CostToCompleteDto {
  id: string;
  constructionProjectId: string;
  wbsNodeId?: string;
  wbsName?: string;
  asOfDate: string;
  budgetCost: number;
  costIncurred: number;
  committedNotIncurred: number;
  estimatedRemaining: number;
  forecastFinalCost: number;
  varianceToBudget: number;
  percentComplete: number;
  earnedValue: number;
  costPerformanceIndex: number;
  schedulePerformanceIndex: number;
  currencyCode: string;
  preparedByName?: string;
  assumptions?: string;
  isOverrunning: boolean;
}

export interface TenderDto {
  id: string;
  reference: string;
  name: string;
  constructionProjectId: string;
  projectName: string;
  wbsNodeId?: string;
  packageName?: string;
  status: TenderStatus;
  scope?: string;
  estimatedValue: number;
  currencyCode: string;
  issuedOn?: string;
  submissionDeadline?: string;
  requiredStartDate?: string;
  requiredFinishDate?: string;
  earnestMoneyDeposit?: number;
  documentUrl?: string;
  bidderCount: number;
  bidCount: number;
  awardedBidId?: string;
  awardedOn?: string;
  subcontractId?: string;
  awardJustification?: string;
  isDeadlinePassed: boolean;
  bids: TenderBidDto[];
}

export interface TenderBidDto {
  id: string;
  tenderBidderId: string;
  contractorId?: string;
  bidderName: string;
  submittedAt: string;
  bidAmount: number;
  varianceFromEstimate?: number;
  variancePercent?: number;
  proposedDurationDays?: number;
  paymentTerms?: string;
  advanceRequested?: number;
  retentionOffered?: number;
  technicalScore?: number;
  commercialScore?: number;
  totalScore?: number;
  rank?: number;
  qualifications?: string;
  exclusions?: string;
  documentUrl?: string;
  negotiatedAmount?: number;
  isAwarded: boolean;
  isDisqualified: boolean;
  disqualificationReason?: string;
  isLowest: boolean;
}

export interface SubcontractListItemDto {
  id: string;
  reference: string;
  name: string;
  constructionProjectId: string;
  projectName: string;
  contractorId: string;
  contractorName: string;
  status: SubcontractStatus;
  kind: ContractKind;
  contractValue: number;
  approvedVariations: number;
  revisedValue: number;
  currencyCode: string;
  startDate: string;
  finishDate: string;
  actualFinishDate?: string;
  extensionDaysGranted: number;
  delayDays?: number;
  certifiedToDate: number;
  paidToDate: number;
  retentionHeld: number;
  retentionReleased: number;
  advanceOutstanding: number;
  progressPercent: number;
  insuranceVerified: boolean;
  licenceVerified: boolean;
  defectsPeriodEndsOn?: string;
  openClaimCount: number;
  openVariationCount: number;
  unrecoveredContraCharges: number;
}

export interface SubcontractDetailDto extends SubcontractListItemDto {
  wbsNodeId?: string;
  packageName?: string;
  tenderId?: string;
  awardedOn?: string;
  retentionPercent: number;
  retentionCapPercent: number;
  advancePercent: number;
  advancePaid: number;
  advanceRecovered: number;
  paymentTermDays: number;
  liquidatedDamagesPerDay: number;
  liquidatedDamagesCapPercent: number;
  liquidatedDamagesAccrued: number;
  defectsPeriodMonths: number;
  billOfQuantitiesId?: string;
  documentUrl?: string;
  terminationReason?: string;
  boqLines: SubcontractBoqLineDto[];
  claims: SubcontractorClaimDto[];
  variations: VariationOrderListItemDto[];
  contraCharges: ContraChargeDto[];
  retention: RetentionLedgerEntryDto[];
  compliance: ContractorComplianceDto[];
}

export interface SubcontractBoqLineDto {
  id?: string;
  boqLineId: string;
  itemCode: string;
  description: string;
  uom: string;
  awardedQuantity: number;
  awardedRate: number;
  awardedAmount: number;
  /** What we charge for the same line. The margin on the package, line by line. */
  saleRate: number;
  marginPercent: number;
  executedQuantity: number;
  certifiedQuantity: number;
  progressPercent: number;
}

export interface SubcontractCreateDto {
  id?: string;
  constructionProjectId: string;
  wbsNodeId?: string;
  tenderId?: string;
  contractorId: string;
  name: string;
  kind: ContractKind;
  contractValue: number;
  currencyCode?: string;
  startDate: string;
  finishDate: string;
  retentionPercent: number;
  retentionCapPercent: number;
  advancePercent: number;
  paymentTermDays: number;
  liquidatedDamagesPerDay: number;
  liquidatedDamagesCapPercent: number;
  defectsPeriodMonths: number;
  billOfQuantitiesId?: string;
  boqLines: SubcontractBoqLineDto[];
  documentUrl?: string;
}

export interface SubcontractorClaimDto {
  id: string;
  reference: string;
  subcontractId: string;
  subcontractReference: string;
  contractorId: string;
  contractorName: string;
  sequenceNumber: number;
  periodFrom: string;
  periodTo: string;
  submittedOn: string;
  claimedGross: number;
  certifiedGross: number;
  disallowedAmount: number;
  disallowedPercent: number;
  previouslyCertified: number;
  thisPeriodCertified: number;
  retentionDeducted: number;
  advanceRecovered: number;
  contraChargesDeducted: number;
  penaltiesDeducted: number;
  taxAmount: number;
  withholdingTax: number;
  netPayable: number;
  paidAmount: number;
  currencyCode: string;
  status: CertificateStatus;
  interimPaymentCertificateId?: string;
  dueDate?: string;
  paidOn?: string;
  isOverdue: boolean;
  claimDocumentUrl?: string;
  disallowanceReason?: string;
  isDisputed: boolean;
  certifications: ClaimCertificationDto[];
}

export interface ClaimCertificationDto {
  id?: string;
  boqLineId?: string;
  description: string;
  claimedQuantity: number;
  certifiedQuantity: number;
  rate: number;
  claimedValue: number;
  certifiedValue: number;
  disallowedValue: number;
  reason?: string;
  certifiedByName?: string;
}

export interface ContraChargeDto {
  id: string;
  reference: string;
  subcontractId: string;
  subcontractReference?: string;
  contractorId: string;
  contractorName: string;
  kind: ContraChargeKind;
  description: string;
  incurredOn: string;
  quantity: number;
  uom?: string;
  rate: number;
  amount: number;
  currencyCode: string;
  materialIssueId?: string;
  plantAllocationId?: string;
  workOrderId?: string;
  isAgreed: boolean;
  isDisputed: boolean;
  disputeNote?: string;
  isRecovered: boolean;
  evidenceUrl?: string;
}

export interface VariationOrderListItemDto {
  id: string;
  variationNumber: string;
  constructionProjectId: string;
  projectName: string;
  subcontractId?: string;
  subcontractorName?: string;
  clientBuildContractId?: string;
  clientName?: string;
  origin: VariationOrigin;
  status: VariationStatus;
  title: string;
  raisedOn: string;
  raisedByName?: string;
  additionAmount: number;
  omissionAmount: number;
  netAmount: number;
  timeImpactDays: number;
  revisedContractValue: number;
  currencyCode: string;
  quotedOn?: string;
  approvedOn?: string;
  clientApproved: boolean;
  isMeasured: boolean;
  daysOpen: number;
  isAwaitingApproval: boolean;
}

export interface VariationOrderDetailDto extends VariationOrderListItemDto {
  wbsNodeId?: string;
  description: string;
  justification?: string;
  siteInstructionId?: string;
  siteInstructionNumber?: string;
  approvedByName?: string;
  rejectionReason?: string;
  documentUrl?: string;
  signatureSessionId?: string;
  lines: VariationLineDto[];
}

export interface VariationLineDto {
  id?: string;
  boqLineId?: string;
  description: string;
  uom?: string;
  quantity: number;
  rate: number;
  amount: number;
  isOmission: boolean;
  rateAnalysisId?: string;
  isNewRate: boolean;
  sortOrder: number;
}

export interface VariationOrderUpsertDto {
  id?: string;
  constructionProjectId: string;
  subcontractId?: string;
  clientBuildContractId?: string;
  wbsNodeId?: string;
  origin: VariationOrigin;
  title: string;
  description: string;
  justification?: string;
  raisedOn: string;
  siteInstructionId?: string;
  timeImpactDays: number;
  lines: VariationLineDto[];
}

export interface SiteInstructionDto {
  id: string;
  instructionNumber: string;
  constructionProjectId: string;
  projectName?: string;
  subcontractId?: string;
  contractorName?: string;
  issuedOn: string;
  issuedByName: string;
  instruction: string;
  location?: string;
  complyBy?: string;
  isAcknowledged: boolean;
  acknowledgedOn?: string;
  hasCostImpact: boolean;
  hasTimeImpact: boolean;
  variationOrderId?: string;
  variationNumber?: string;
  photoUrls: string[];
  documentUrl?: string;
  isComplied: boolean;
  isOverdue: boolean;
}

export interface DelayEventDto {
  id: string;
  reference: string;
  constructionProjectId: string;
  projectName?: string;
  subcontractId?: string;
  subcontractorName?: string;
  programmeActivityId?: string;
  activityName?: string;
  cause: string;
  description: string;
  startedOn: string;
  endedOn?: string;
  delayDays: number;
  isExcusable: boolean;
  isCompensable: boolean;
  responsibleParty: CostBearer;
  costImpact?: number;
  affectsCriticalPath: boolean;
  extensionOfTimeId?: string;
  evidenceUrl?: string;
  isNotified: boolean;
  notifiedOn?: string;
  isOngoing: boolean;
}

export interface ExtensionOfTimeDto {
  id: string;
  reference: string;
  constructionProjectId: string;
  subcontractId?: string;
  clientBuildContractId?: string;
  claimedOn: string;
  daysClaimed: number;
  daysGranted: number;
  grounds?: string;
  originalCompletionDate: string;
  revisedCompletionDate?: string;
  status: string;
  prolongationCost?: number;
  prolongationCostGranted: boolean;
  assessedByName?: string;
  decidedOn?: string;
  decisionNote?: string;
  documentUrl?: string;
}

export interface MaterialRequisitionDto {
  id: string;
  reference: string;
  constructionProjectId: string;
  projectName: string;
  wbsNodeId?: string;
  wbsName?: string;
  requestedOn: string;
  requiredBy: string;
  requestedByName: string;
  status: string;
  purchaseRequisitionId?: string;
  purchaseOrderId?: string;
  estimatedValue: number;
  currencyCode: string;
  isUrgent: boolean;
  isOverdue: boolean;
  note?: string;
  lines: MaterialRequisitionLineDto[];
}

export interface MaterialRequisitionLineDto {
  id?: string;
  itemId?: string;
  description: string;
  uom: string;
  requestedQuantity: number;
  approvedQuantity: number;
  receivedQuantity: number;
  estimatedRate: number;
  wbsNodeId?: string;
  boqLineId?: string;
  sortOrder: number;
}

export interface MaterialIssueDto {
  id: string;
  reference: string;
  constructionProjectId: string;
  wbsNodeId?: string;
  wbsName?: string;
  boqLineId?: string;
  boqItemCode?: string;
  subcontractId?: string;
  contractorName?: string;
  issuedOn: string;
  itemId?: string;
  description: string;
  uom: string;
  quantity: number;
  rate: number;
  value: number;
  currencyCode: string;
  issuedToName?: string;
  receivedByName?: string;
  isContraChargeable: boolean;
  contraChargeId?: string;
  isReturn: boolean;
  note?: string;
}

export interface WastageRecordDto {
  id: string;
  constructionProjectId: string;
  projectName?: string;
  wbsNodeId?: string;
  wbsName?: string;
  boqLineId?: string;
  boqItemCode?: string;
  materialName: string;
  uom: string;
  periodFrom: string;
  periodTo: string;
  executedQuantity: number;
  theoreticalConsumption: number;
  actualIssued: number;
  returnedQuantity: number;
  netConsumed: number;
  wastageQuantity: number;
  wastagePercent: number;
  allowedWastagePercent: number;
  excessWastagePercent: number;
  excessValue: number;
  currencyCode: string;
  isExplained: boolean;
  explanation?: string;
  isRecovered: boolean;
  isExcessive: boolean;
}

export interface LabourRecordDto {
  id: string;
  constructionProjectId: string;
  wbsNodeId?: string;
  wbsName?: string;
  subcontractId?: string;
  contractorName?: string;
  workDate: string;
  trade: string;
  labourType: string;
  headCount: number;
  hours: number;
  overtimeHours: number;
  dailyRate: number;
  totalCost: number;
  currencyCode: string;
  workDescription?: string;
  fromGateAttendance: boolean;
  recordedByName?: string;
}

export interface PlantItemDto {
  id: string;
  name: string;
  assetCode: string;
  plantType: string;
  ownership: string;
  supplierName?: string;
  make?: string;
  registrationNumber?: string;
  capacity?: number;
  hourlyRate: number;
  dailyRate: number;
  monthlyRate: number;
  fuelConsumptionPerHour?: number;
  totalHoursRun: number;
  utilisationPercent: number;
  nextServiceDue?: string;
  status: string;
  currentProjectName?: string;
  isActive: boolean;
}

export interface PlantAllocationDto {
  id: string;
  plantItemId: string;
  plantName: string;
  constructionProjectId: string;
  projectName: string;
  wbsNodeId?: string;
  subcontractId?: string;
  contractorName?: string;
  fromDate: string;
  toDate?: string;
  hoursUsed: number;
  idleHours: number;
  rate: number;
  cost: number;
  fuelCost: number;
  currencyCode: string;
  operatorName?: string;
  isChargeable: boolean;
  contraChargeId?: string;
  utilisationPercent: number;
}

export interface SiteGateEntryDto {
  id: string;
  constructionProjectId: string;
  enteredAt: string;
  entryType: string;
  vehicleNumber?: string;
  driverName?: string;
  supplierName?: string;
  challanNumber?: string;
  purchaseOrderId?: string;
  goodsReceiptId?: string;
  materialDescription?: string;
  quantity?: number;
  uom?: string;
  grossWeight?: number;
  tareWeight?: number;
  netWeight?: number;
  recordedByName?: string;
  photoUrl?: string;
  isVerified: boolean;
  discrepancy?: string;
}

export interface SafetyIncidentDto {
  id: string;
  reference: string;
  constructionProjectId: string;
  projectName: string;
  subcontractId?: string;
  contractorName?: string;
  occurredAt: string;
  severity: SafetySeverity;
  description: string;
  location?: string;
  personsAffected: number;
  injuredPersonName?: string;
  lostTimeDays?: number;
  immediateAction?: string;
  rootCause?: string;
  correctiveAction?: string;
  reportedByName?: string;
  investigatedByName?: string;
  isReportableToAuthority: boolean;
  isReported: boolean;
  reportedOn?: string;
  authorityReference?: string;
  photoUrls: string[];
  cost?: number;
  isClosed: boolean;
}

export interface ClientBuildContractListItemDto {
  id: string;
  reference: string;
  name: string;
  clientPartyId: string;
  clientName: string;
  clientPhone?: string;
  siteAddress?: string;
  kind: ContractKind;
  grade: SpecificationGrade;
  plotArea: AreaDto;
  coveredArea: AreaDto;
  ratePerSqFt: number;
  contractValue: number;
  approvedVariations: number;
  revisedContractValue: number;
  currencyCode: string;
  status: string;
  signedOn?: string;
  startDate?: string;
  plannedCompletionDate?: string;
  forecastCompletionDate?: string;
  slipDays?: number;
  totalDemanded: number;
  totalReceived: number;
  outstanding: number;
  retentionHeldByClient: number;
  progressPercent: number;
  budgetCost: number;
  actualCost: number;
  forecastFinalCost: number;
  forecastMargin: number;
  marginPercent: number;
  projectManagerName?: string;
  openVariationCount: number;
  pendingClientDecisions: number;
  isMarginAtRisk: boolean;
}

export interface ClientBuildContractDetailDto extends ClientBuildContractListItemDto {
  coClientPartyId?: string;
  coClientName?: string;
  propertyId?: string;
  landParcelId?: string;
  sourceBookingId?: string;
  enquiryId?: string;
  estimateId?: string;
  specificationScheduleId?: string;
  constructionProjectId?: string;
  feePercent?: number;
  fixedFee?: number;
  guaranteedMaximumPrice?: number;
  actualCompletionDate?: string;
  extensionDaysGranted: number;
  liquidatedDamagesPerDay: number;
  liquidatedDamagesCapPercent: number;
  paymentPlanId?: string;
  advanceReceived: number;
  retentionPercent: number;
  retentionReleased: number;
  defectsPeriodMonths: number;
  handoverId?: string;
  snagInspectionId?: string;
  architectName?: string;
  documentUrl?: string;
  clientPortalEnabled: boolean;
  notes?: string;
  scopeItems: ContractScopeItemDto[];
  clientSuppliedMaterials: ClientSuppliedMaterialDto[];
  variations: ClientVariationDto[];
  specification?: SpecificationScheduleDto;
  paymentPlan?: PaymentPlanDto;
  certificates: InterimPaymentCertificateListItemDto[];
  drawings: DrawingRegisterDto[];
  costSheet?: ContractCostSheetDto;
  milestones: ProjectMilestoneDto[];
  timeline: TimelineEntryDto[];
}

export interface ClientBuildContractUpsertDto {
  id?: string;
  name: string;
  clientPartyId?: string;
  newClient?: PartyUpsertDto;
  coClientPartyId?: string;
  enquiryId?: string;
  estimateId?: string;
  officeId?: string;
  propertyId?: string;
  landParcelId?: string;
  sourceBookingId?: string;
  siteAddress?: string;
  inputAreaUnit: AreaUnit;
  plotArea: number;
  coveredArea: number;
  kind: ContractKind;
  grade: SpecificationGrade;
  specificationScheduleId?: string;
  ratePerSqFt: number;
  contractValue?: number;
  feePercent?: number;
  fixedFee?: number;
  guaranteedMaximumPrice?: number;
  currencyCode?: string;
  signedOn?: string;
  startDate?: string;
  plannedCompletionDate?: string;
  liquidatedDamagesPerDay: number;
  liquidatedDamagesCapPercent: number;
  retentionPercent: number;
  defectsPeriodMonths: number;
  paymentPlanTemplateId?: string;
  customPlan?: PaymentPlanCustomDto;
  scopeItems: ContractScopeItemDto[];
  clientSuppliedMaterials: ClientSuppliedMaterialDto[];
  projectManagerUserId?: string;
  architectPartyId?: string;
  clientPortalEnabled: boolean;
  notes?: string;
}

export interface ContractScopeItemDto {
  id?: string;
  category: string;
  description: string;
  isIncluded: boolean;
  value?: number;
  note?: string;
  sortOrder: number;
}

export interface ClientSuppliedMaterialDto {
  id?: string;
  itemId?: string;
  description: string;
  uom: string;
  agreedQuantity: number;
  receivedQuantity: number;
  consumedQuantity: number;
  outstandingQuantity: number;
  estimatedValue?: number;
  rateExclusionAmount: number;
  expectedBy?: string;
  lastReceivedOn?: string;
  isDelayingWork: boolean;
  isOverdue: boolean;
  note?: string;
}

export interface ClientVariationDto {
  id: string;
  reference: string;
  clientBuildContractId: string;
  contractReference?: string;
  variationOrderId?: string;
  specificationItemId?: string;
  specificationItemName?: string;
  title: string;
  description: string;
  origin: VariationOrigin;
  status: VariationStatus;
  requestedOn: string;
  requestedByName?: string;
  raisedViaPortal: boolean;
  quotedAmount: number;
  omissionCredit?: number;
  netAmount: number;
  timeImpactDays: number;
  currencyCode: string;
  quotedOn?: string;
  quoteValidUntil?: string;
  quoteExpired: boolean;
  clientApproved: boolean;
  approvedOn?: string;
  approvalEvidenceUrl?: string;
  rejectionReason?: string;
  isExecuted: boolean;
  executedOn?: string;
  isBilled: boolean;
  demandId?: string;
  beforeAfterPhotoUrls: string[];
}

export interface ClientVariationUpsertDto {
  id?: string;
  clientBuildContractId: string;
  specificationItemId?: string;
  title: string;
  description: string;
  origin: VariationOrigin;
  requestedOn: string;
  requestedByPartyId?: string;
  raisedViaPortal: boolean;
  quotedAmount: number;
  omissionCredit?: number;
  timeImpactDays: number;
  quoteValidUntil?: string;
  lines: VariationLineDto[];
}

export interface DrawingRegisterDto {
  id: string;
  drawingNumber: string;
  title: string;
  clientBuildContractId?: string;
  constructionProjectId?: string;
  projectId?: string;
  discipline: string;
  scale?: string;
  preparedByName?: string;
  currentRevision: string;
  currentRevisionDate?: string;
  status: string;
  clientApproved: boolean;
  clientApprovedOn?: string;
  isFrozen: boolean;
  currentFileUrl?: string;
  isIssuedToSite: boolean;
  issuedToSiteOn?: string;
  revisionCount: number;
  revisions: DrawingRevisionDto[];
}

export interface DrawingRevisionDto {
  id: string;
  revision: string;
  revisionDate: string;
  changeDescription?: string;
  fileUrl?: string;
  issuedByName?: string;
  issuedOn?: string;
  isSuperseded: boolean;
  hasCostImpact: boolean;
  variationOrderId?: string;
}

/**
 * Budget, committed, actual, forecast and margin for one contract, with the erosion explained by
 * cause. The screen a project manager on a client build opens first.
 */
export interface ContractCostSheetDto {
  id: string;
  clientBuildContractId: string;
  contractReference?: string;
  constructionProjectId?: string;
  asOfDate: string;
  currencyCode: string;
  contractValue: number;
  variationsApproved: number;
  revisedValue: number;
  budgetCost: number;
  committedCost: number;
  actualCost: number;
  costToComplete: number;
  forecastFinalCost: number;
  budgetMargin: number;
  forecastMargin: number;
  marginPercent: number;
  marginErosion: number;
  erosionFromVariationsAbsorbed: number;
  erosionFromWastage: number;
  erosionFromRework: number;
  erosionFromDelay: number;
  erosionFromRateIncrease: number;
  erosionOther: number;
  progressPercent: number;
  certifiedValue: number;
  collectedValue: number;
  cashPosition: number;
  preparedByName?: string;
  commentary?: string;
  lines: ContractCostLineDto[];
}

export interface ContractCostLineDto {
  id: string;
  wbsNodeId?: string;
  costHead: string;
  description?: string;
  budgetAmount: number;
  committedAmount: number;
  actualAmount: number;
  forecastAmount: number;
  varianceAmount: number;
  variancePercent: number;
  varianceExplanation?: string;
  isOverrunning: boolean;
  sortOrder: number;
}

/** One line of the bid comparison — what each bidder priced for the same BOQ item. */
export interface BidComparisonLineDto {
  boqLineId?: string;
  itemCode: string;
  description: string;
  uom?: string;
  quantity: number;
  estimateRate?: number;
  /** One entry per bidder, in the same order as the tender's bid list. */
  bids: BidComparisonCellDto[];
}

export interface BidComparisonCellDto {
  tenderBidId: string;
  bidderName: string;
  rate: number;
  amount: number;
  variancePercent?: number;
  /** Far off the estimate and the other bids — usually a misread or a loaded rate. */
  isOutlier: boolean;
  isLowest: boolean;
  note?: string;
}


/* ── CrmDtos ─────────────────────────────────────────────── */

export interface PartyListItemDto {
  id: string;
  reference: string;
  kind: PartyKind;
  displayName: string;
  fatherOrGuardianName?: string;
  primaryPhone?: string;
  primaryEmail?: string;
  city?: string;
  photoUrl?: string;
  roles: PartyRoleKind[];
  kycStatus: KycStatus;
  riskRating: RiskRating;
  isCautioned: boolean;
  totalInvested: number;
  totalOutstanding: number;
  nextDueDate?: string;
  ownerAgentName?: string;
  propertyCount: number;
}

/**
 * The Person 360. Every enquiry, viewing, booking, tenancy, receipt and message in one payload,
 * because the whole point of the screen is that nobody has to open five others.
 */
export interface PartyDetailDto {
  id: string;
  reference: string;
  kind: PartyKind;
  salutation?: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  displayName: string;
  fatherOrGuardianName?: string;
  dateOfBirth?: string;
  nationality?: string;
  residencyStatus?: string;
  occupation?: string;
  employer?: string;
  photoUrl?: string;
  signatureSpecimenUrl?: string;
  organisationName?: string;
  tradingName?: string;
  registrationNumber?: string;
  taxNumber?: string;
  incorporatedOn?: string;
  industry?: string;
  preferredChannel: NotificationChannel;
  preferredLanguage: string;
  kycStatus: KycStatus;
  riskRating: RiskRating;
  kycVerifiedOn?: string;
  kycExpiresOn?: string;
  isPoliticallyExposed: boolean;
  isCautioned: boolean;
  ownerAgentName?: string;
  notes?: string;
  roles: PartyRoleDto[];
  contacts: PartyContactDto[];
  addresses: PartyAddressDto[];
  identities: PartyIdentityDto[];
  relationships: PartyRelationshipDto[];
  consents: PartyConsentDto[];
  cautions: CautionListEntryDto[];
  money: PartyMoneySummaryDto;
  enquiries: EnquiryListItemDto[];
  bookings: BookingListItemDto[];
  tenancies: TenancyListItemDto[];
  ownedProperties: PropertyListItemDto[];
  timeline: TimelineEntryDto[];
  documents: GeneratedDocumentDto[];
}

export interface PartyMoneySummaryDto {
  currencyCode: string;
  totalInvested: number;
  totalPaid: number;
  totalOutstanding: number;
  overdueAmount: number;
  surchargeAccrued: number;
  nextDueDate?: string;
  nextDueAmount: number;
  rentPaidThisYear: number;
  rentArrears: number;
  maintenanceArrears: number;
  daysOverdue: number;
  isDefaulter: boolean;
}

export interface PartyUpsertDto {
  id?: string;
  kind: PartyKind;
  salutation?: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  fatherOrGuardianName?: string;
  dateOfBirth?: string;
  nationality?: string;
  residencyStatus?: string;
  occupation?: string;
  employer?: string;
  photoUrl?: string;
  signatureSpecimenUrl?: string;
  organisationName?: string;
  tradingName?: string;
  registrationNumber?: string;
  taxNumber?: string;
  incorporatedOn?: string;
  industry?: string;
  primaryPhone?: string;
  primaryEmail?: string;
  preferredChannel: NotificationChannel;
  preferredLanguage: string;
  ownerAgentId?: string;
  officeId?: string;
  notes?: string;
  contacts: PartyContactDto[];
  addresses: PartyAddressDto[];
  identities: PartyIdentityDto[];
  relationships: PartyRelationshipDto[];
  addRoles: PartyRoleKind[];
  acknowledgeDuplicate: boolean;
}

export interface PartyRoleDto {
  id: string;
  kind: PartyRoleKind;
  fromDate: string;
  toDate?: string;
  isActive: boolean;
  contextType?: string;
  contextId?: string;
  contextLabel?: string;
}

export interface PartyContactDto {
  id?: string;
  contactType: string;
  value: string;
  label?: string;
  isWhatsApp: boolean;
  isPrimary: boolean;
  isVerified: boolean;
  isUnreachable: boolean;
  personName?: string;
  designation?: string;
  isAuthorisedSignatory: boolean;
}

export interface PartyAddressDto {
  id?: string;
  addressType: string;
  line1?: string;
  line2?: string;
  street?: string;
  city?: string;
  state?: string;
  postCode?: string;
  countryCode?: string;
  geoAreaId?: string;
  isMailingAddress: boolean;
  isVerified: boolean;
  oneLine: string;
}

export interface PartyIdentityDto {
  id?: string;
  kind: IdentityKind;
  localLabel?: string;
  number: string;
  issuingCountry?: string;
  issuingAuthority?: string;
  issuedOn?: string;
  expiresOn?: string;
  frontImageUrl?: string;
  backImageUrl?: string;
  state: DocumentState;
  isPrimary: boolean;
  isExpired: boolean;
}

export interface PartyRelationshipDto {
  id?: string;
  relatedPartyId: string;
  relatedPartyName: string;
  relationshipType: string;
  fromDate?: string;
  toDate?: string;
  powerScope?: string;
  poaDocumentNumber?: string;
  poaValidFrom?: string;
  poaValidTo?: string;
  poaIsRegistered: boolean;
  poaIsExpired: boolean;
  documentUrl?: string;
  sharePercent?: number;
  isVerified: boolean;
}

export interface PartyConsentDto {
  id?: string;
  channel: NotificationChannel;
  purpose: string;
  isGranted: boolean;
  recordedAt: string;
  source?: string;
  withdrawnAt?: string;
}

export interface CautionListEntryDto {
  id: string;
  partyId: string;
  partyName?: string;
  category: string;
  severity: AlertSeverity;
  reason: string;
  evidenceUrl?: string;
  raisedByName?: string;
  raisedOn: string;
  expiresOn?: string;
  blocksNewBusiness: boolean;
  isActive: boolean;
}

export interface KycCaseDto {
  id: string;
  reference: string;
  partyId: string;
  partyName: string;
  status: KycStatus;
  riskRating: RiskRating;
  openedOn: string;
  completedOn?: string;
  nextReviewDue?: string;
  assignedToName?: string;
  approvedByName?: string;
  sanctionsScreeningRef?: string;
  sanctionsScreenedOn?: string;
  sanctionsHit: boolean;
  sourceOfFunds?: string;
  declaredNetWorth?: number;
  rejectionReason?: string;
  notes?: string;
  daysOpen: number;
  documents: ChecklistItemDto[];
}

export interface EnquiryListItemDto {
  id: string;
  reference: string;
  partyId?: string;
  contactName: string;
  contactPhone?: string;
  contactEmail?: string;
  stage: EnquiryStage;
  channel: EnquiryChannel;
  sourceLabel?: string;
  interest: ListingKind;
  projectName?: string;
  propertyReference?: string;
  budgetMin?: number;
  budgetMax?: number;
  currencyCode?: string;
  assignedAgentName?: string;
  receivedAt: string;
  firstContactedAt?: string;
  responseDueAt?: string;
  slaBreached: boolean;
  /** Minutes from arrival to first human contact. Null while still unanswered. */
  speedToLeadMinutes?: number;
  /** Minutes remaining on the SLA clock. Negative once breached. */
  minutesToSlaDeadline?: number;
  lastActivityAt?: string;
  nextFollowUpAt?: string;
  followUpOverdue: boolean;
  score: number;
  viewingCount: number;
  siteVisitCount: number;
  partnerName?: string;
  daysInStage: number;
}

export interface EnquiryDetailDto extends EnquiryListItemDto {
  subSource?: string;
  portalChannelId?: string;
  campaignId?: string;
  campaignName?: string;
  channelPartnerId?: string;
  referredByPartyId?: string;
  referredByName?: string;
  listingId?: string;
  propertyId?: string;
  projectId?: string;
  purpose?: BuyingPurpose;
  funding?: FundingKind;
  timeline?: string;
  message?: string;
  isQualified: boolean;
  scoreBreakdown?: string;
  requirement?: RequirementProfileDto;
  convertedBookingId?: string;
  convertedDealId?: string;
  convertedTenancyId?: string;
  closedAt?: string;
  lossReason?: string;
  lossNote?: string;
  lostToCompetitor?: string;
  activities: ActivityDto[];
  tasks: FollowUpTaskDto[];
  viewings: ViewingListItemDto[];
  siteVisits: SiteVisitListItemDto[];
  matches: MatchResultDto[];
  stageHistory: EnquiryStageHistoryDto[];
}

export interface EnquiryStageHistoryDto {
  fromStage: EnquiryStage;
  toStage: EnquiryStage;
  changedAt: string;
  changedByName?: string;
  daysInPreviousStage: number;
  note?: string;
}

export interface EnquiryUpsertDto {
  id?: string;
  partyId?: string;
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
  channel: EnquiryChannel;
  subSource?: string;
  portalChannelId?: string;
  campaignId?: string;
  channelPartnerId?: string;
  referredByPartyId?: string;
  marketingEventId?: string;
  interest: ListingKind;
  listingId?: string;
  propertyId?: string;
  projectId?: string;
  purpose?: BuyingPurpose;
  funding?: FundingKind;
  budgetMin?: number;
  budgetMax?: number;
  timeline?: string;
  message?: string;
  assignedAgentId?: string;
  officeId?: string;
  requirement?: RequirementProfileUpsertDto;
  /** Skip the router and hand it straight to the named agent. */
  skipAutoAssign: boolean;
  acknowledgeDuplicate: boolean;
}

export interface EnquiryStageChangeDto {
  enquiryId: string;
  toStage: EnquiryStage;
  lossReasonCodeId?: string;
  lossNote?: string;
  lostToCompetitor?: string;
  note?: string;
}

/** What the enquiry board draws, grouped by stage. */
export interface EnquiryBoardDto {
  columns: EnquiryBoardColumnDto[];
  totalCount: number;
  totalPipelineValue: number;
  breachingSlaCount: number;
  unassignedCount: number;
}

export interface EnquiryBoardColumnDto {
  stage: EnquiryStage;
  label: string;
  count: number;
  value: number;
  items: EnquiryListItemDto[];
  /** Set when the column is paged — a New column with four hundred leads in it. */
  hasMore: boolean;
}

export interface RequirementProfileDto {
  id: string;
  partyId: string;
  name?: string;
  interest: ListingKind;
  category?: PropertyCategory;
  subTypes: PropertySubType[];
  purpose?: BuyingPurpose;
  funding?: FundingKind;
  budgetMin?: number;
  budgetMax?: number;
  currencyCode?: string;
  minArea?: AreaDto;
  maxArea?: AreaDto;
  minBedrooms?: number;
  maxBedrooms?: number;
  minBathrooms?: number;
  minFloor?: number;
  maxFloor?: number;
  preferredFacing?: Facing;
  furnishing?: FurnishingState;
  mustHaveFeatures: string[];
  niceToHaveFeatures: string[];
  preferredAreas: LookupDto[];
  preferredAreasGeoJson?: string;
  availableFrom?: string;
  exclusions?: string;
  isActive: boolean;
  alertsEnabled: boolean;
  lastMatchedAt?: string;
  matchCount: number;
}

export interface RequirementProfileUpsertDto {
  id?: string;
  partyId?: string;
  enquiryId?: string;
  name?: string;
  interest: ListingKind;
  category?: PropertyCategory;
  subTypes: PropertySubType[];
  purpose?: BuyingPurpose;
  funding?: FundingKind;
  budgetMin?: number;
  budgetMax?: number;
  inputAreaUnit: AreaUnit;
  minArea?: number;
  maxArea?: number;
  minBedrooms?: number;
  maxBedrooms?: number;
  minBathrooms?: number;
  minFloor?: number;
  maxFloor?: number;
  preferredFacing?: Facing;
  furnishing?: FurnishingState;
  mustHaveFeatures: string[];
  niceToHaveFeatures: string[];
  preferredAreaIds: string[];
  preferredAreasGeoJson?: string;
  availableFrom?: string;
  exclusions?: string;
  alertsEnabled: boolean;
}

/** One match, with the reasoning shown. A score nobody can interrogate is worthless. */
export interface MatchResultDto {
  id: string;
  listingId?: string;
  unitId?: string;
  propertyId?: string;
  title: string;
  addressOneLine?: string;
  heroImageUrl?: string;
  price?: number;
  currencyCode?: string;
  area?: AreaDto;
  bedrooms?: number;
  subType?: PropertySubType;
  score: number;
  /** Each criterion and what it contributed. Rendered as a list under the score. */
  factors: MatchFactorDto[];
  matchedAt: string;
  wasSent: boolean;
  sentAt?: string;
  openedAt?: string;
  clickedAt?: string;
  isDismissed: boolean;
  ledToViewing: boolean;
}

export interface MatchFactorDto {
  criterion: string;
  outcome: string;
  points: number;
  isMustHave: boolean;
}

export interface SendMatchesDto {
  requirementProfileId: string;
  matchResultIds: string[];
  channel: NotificationChannel;
  message?: string;
  messageTemplateId?: string;
}

export interface ActivityDto {
  id: string;
  kind: ActivityKind;
  direction: ActivityDirection;
  occurredAt: string;
  userName?: string;
  subject?: string;
  body?: string;
  durationSeconds?: number;
  outcome?: string;
  recordingUrl?: string;
  attachmentUrl?: string;
  deliveredAt?: string;
  readAt?: string;
  deliveryFailed: boolean;
  failureReason?: string;
  isSystemGenerated: boolean;
  isPinned: boolean;
}

export interface ActivityCreateDto {
  kind: ActivityKind;
  direction: ActivityDirection;
  partyId?: string;
  enquiryId?: string;
  bookingId?: string;
  tenancyId?: string;
  dealId?: string;
  propertyId?: string;
  listingId?: string;
  channelPartnerId?: string;
  occurredAt?: string;
  subject?: string;
  body?: string;
  durationSeconds?: number;
  outcome?: string;
  outcomeReasonCodeId?: string;
  attachmentUrl?: string;
  /** Create the next follow-up in the same call. The rule is: never leave a lead without one. */
  nextFollowUp?: FollowUpTaskCreateDto;
}

export interface FollowUpTaskDto {
  id: string;
  title: string;
  note?: string;
  suggestedAction: ActivityKind;
  dueAt: string;
  priority: TicketPriority;
  state: TaskState;
  isOverdue: boolean;
  assignedToName?: string;
  isAutoGenerated: boolean;
  sourceRuleKey?: string;
  snoozeCount: number;
  partyId?: string;
  partyName?: string;
  partyPhone?: string;
  enquiryId?: string;
  bookingId?: string;
  tenancyId?: string;
  dealId?: string;
  workOrderId?: string;
  dunningCaseId?: string;
  contextLabel?: string;
  route?: string;
  amount?: number;
}

export interface FollowUpTaskCreateDto {
  title: string;
  note?: string;
  suggestedAction: ActivityKind;
  dueAt: string;
  priority: TicketPriority;
  assignedToUserId?: string;
  partyId?: string;
  enquiryId?: string;
  bookingId?: string;
  tenancyId?: string;
  dealId?: string;
  workOrderId?: string;
  dunningCaseId?: string;
}

export interface TaskCompletionDto {
  taskId: string;
  completionNote?: string;
  outcome?: string;
  nextTask?: FollowUpTaskCreateDto;
}

/**
 * The agent's day: what is overdue, what is due today, and what is booked. A to-do list rather
 * than a database — the only screen most agents open before lunch.
 */
export interface MyDayDto {
  date: string;
  agentName: string;
  overdue: FollowUpTaskDto[];
  dueToday: FollowUpTaskDto[];
  upcoming: FollowUpTaskDto[];
  viewings: ViewingListItemDto[];
  siteVisits: SiteVisitListItemDto[];
  unansweredLeads: EnquiryListItemDto[];
  awaitingMyApproval: ApprovalRequestDto[];
  completedToday: number;
  callsMadeToday: number;
  collectedToday?: number;
}


/* ── DealDtos ─────────────────────────────────────────────── */

export interface DealListItemDto {
  id: string;
  reference: string;
  status: DealStatus;
  kind: ListingKind;
  propertyId: string;
  propertyReference: string;
  addressOneLine: string;
  heroImageUrl?: string;
  buyerName: string;
  sellerName?: string;
  listingAgentName?: string;
  sellingAgentName?: string;
  agreedPrice: number;
  grossFee: number;
  currencyCode: string;
  depositReceived: boolean;
  feeInvoiced: boolean;
  feeReceived: boolean;
  agreedOn: string;
  targetExchangeDate?: string;
  targetCompletionDate?: string;
  actualCompletionDate?: string;
  daysInProgress: number;
  daysSinceLastMilestone?: number;
  /** Nothing has moved for too long. What the stalled-deal board sorts on. */
  isStalled: boolean;
  completedSteps: number;
  totalSteps: number;
  progressPercent: number;
  nextStepLabel?: string;
  nextStepDue?: string;
  nextStepOverdue: boolean;
  chainId?: string;
  chainPosition?: number;
  chainAtRisk: boolean;
}

export interface DealDetailDto extends DealListItemDto {
  listingId?: string;
  offerId?: string;
  enquiryId?: string;
  instructionId?: string;
  buyerPartyId: string;
  sellerPartyId?: string;
  depositAmount: number;
  feePercent: number;
  feeTax: number;
  listingSideFee: number;
  sellingSideFee: number;
  commissionCalculationId?: string;
  actualExchangeDate?: string;
  fallThroughRecordId?: string;
  conveyancingId?: string;
  resultingTenancyId?: string;
  notes?: string;
  parties: DealPartyDto[];
  checklist: DealChecklistItemDto[];
  milestones: DealMilestoneDto[];
  conveyancing?: ConveyancingDto;
  chain?: SalesChainDto;
  commission?: CommissionCalculationDto;
  documents: GeneratedDocumentDto[];
  timeline: TimelineEntryDto[];
}

export interface DealPartyDto {
  id?: string;
  role: DealPartyRole;
  partyId?: string;
  organisationName?: string;
  contactName?: string;
  phone?: string;
  email?: string;
  reference?: string;
  lastContactedAt?: string;
  isResponsive: boolean;
  daysSinceContact?: number;
  note?: string;
}

export interface DealChecklistItemDto {
  id: string;
  stepKey: string;
  label: string;
  sortOrder: number;
  ownerName?: string;
  responsibleParty?: DealPartyRole;
  dueDate?: string;
  completedOn?: string;
  isCompleted: boolean;
  isMandatory: boolean;
  isBlocking: boolean;
  isOverdue: boolean;
  note?: string;
}

export interface DealMilestoneDto {
  id: string;
  name: string;
  targetDate?: string;
  actualDate?: string;
  varianceDays?: number;
  delayReason?: string;
  sortOrder: number;
}

export interface DealCreateDto {
  propertyId: string;
  listingId?: string;
  offerId?: string;
  enquiryId?: string;
  instructionId?: string;
  kind: ListingKind;
  buyerPartyId: string;
  sellerPartyId?: string;
  listingAgentId?: string;
  sellingAgentId?: string;
  officeId?: string;
  agreedPrice: number;
  currencyCode?: string;
  depositAmount: number;
  agreedOn: string;
  targetExchangeDate?: string;
  targetCompletionDate?: string;
  /** Override the fee the instruction implies. Recorded as a deviation. */
  overrideFeePercent?: number;
  overrideFeeAmount?: number;
  parties: DealPartyDto[];
  notes?: string;
}

export interface DealBoardDto {
  columns: DealBoardColumnDto[];
  totalCount: number;
  totalValue: number;
  totalFee: number;
  stalledCount: number;
  chainAtRiskCount: number;
  fallThroughRatePercent: number;
  averageDaysToComplete: number;
}

export interface DealBoardColumnDto {
  status: DealStatus;
  label: string;
  count: number;
  value: number;
  fee: number;
  items: DealListItemDto[];
  hasMore: boolean;
}

export interface SalesChainDto {
  id: string;
  reference: string;
  linkCount: number;
  isComplete: boolean;
  isBroken: boolean;
  brokenOn?: string;
  brokenAtPosition?: number;
  targetCompletionDate?: string;
  links: SalesChainLinkDto[];
}

export interface SalesChainLinkDto {
  id: string;
  position: number;
  dealId?: string;
  dealReference?: string;
  addressOneLine?: string;
  externalDescription?: string;
  externalAgentName?: string;
  externalAgentPhone?: string;
  status: DealStatus;
  solicitorName?: string;
  lastUpdatedAt?: string;
  isHoldingUpChain: boolean;
  holdUpReason?: string;
  isOurs: boolean;
}

export interface FallThroughRecordDto {
  id: string;
  dealId: string;
  dealReference: string;
  propertyId: string;
  addressOneLine: string;
  cause: FallThroughCause;
  reasonLabel?: string;
  detail?: string;
  occurredOn: string;
  stageReached?: string;
  daysInProgress: number;
  costIncurred: number;
  lostFee: number;
  relistedImmediately: boolean;
  previousViewersNotified: boolean;
}

export interface ConveyancingDto {
  id: string;
  dealId?: string;
  bookingId?: string;
  propertyId: string;
  buyerSolicitorName?: string;
  sellerSolicitorName?: string;
  draftDeedOn?: string;
  deedApprovedOn?: string;
  considerationValue: number;
  governmentValue?: number;
  stampDutyRate: number;
  stampDutyAmount: number;
  registrationFee: number;
  withholdingTax: number;
  otherLevies: number;
  totalTransactionCost: number;
  currencyCode: string;
  registrationAppointmentOn?: string;
  tokenNumber?: string;
  registrarOffice?: string;
  registeredOn?: string;
  deedNumber?: string;
  deedUrl?: string;
  mutationAppliedOn?: string;
  mutationNumber?: string;
  mutationCompletedOn?: string;
  isMutationComplete: boolean;
  note?: string;
}

export interface CommissionPlanDto {
  id: string;
  name: string;
  code?: string;
  kind: CommissionPlanKind;
  trigger: CommissionTrigger;
  appliesTo: string;
  projectId?: string;
  projectName?: string;
  agentSharePercent: number;
  houseSharePercent: number;
  fixedFeePerDeal: number;
  annualCapAmount: number;
  capRollsOver: boolean;
  postCapFeePerDeal: number;
  postCapPercent: number;
  franchiseRoyaltyPercent: number;
  transactionFee: number;
  monthlyDeskFee: number;
  payProRataWithCollection: boolean;
  minimumCollectionPercent: number;
  withholdingPercent: number;
  clawBackOnCancellation: boolean;
  effectiveFrom: string;
  effectiveTo?: string;
  isActive: boolean;
  assignedCount: number;
  tiers: CommissionPlanTierDto[];
}

export interface CommissionPlanTierDto {
  id?: string;
  tierNumber: number;
  label?: string;
  fromAmount: number;
  toAmount?: number;
  fromCount?: number;
  toCount?: number;
  sharePercent: number;
  ratePerSqFt: number;
  fixedAmount: number;
  isRetrospective: boolean;
}

export interface CommissionCalculationDto {
  id: string;
  reference: string;
  dealId?: string;
  dealReference?: string;
  bookingId?: string;
  bookingReference?: string;
  tenancyId?: string;
  projectName?: string;
  trigger: CommissionTrigger;
  status: CommissionStatus;
  transactionValue: number;
  grossFee: number;
  taxOnFee: number;
  totalDeductions: number;
  netDistributable: number;
  currencyCode: string;
  calculatedOn: string;
  earnedOn?: string;
  dueOn?: string;
  collectionPercentAtCalculation: number;
  disbursementId?: string;
  isDisputed: boolean;
  disputeNote?: string;
  /** Every step of the arithmetic, in words. An agent will read it line by line. */
  calculationTrace: string[];
  splits: CommissionSplitDto[];
}

export interface CommissionSplitDto {
  id: string;
  agentProfileId?: string;
  agentName?: string;
  salesTeamId?: string;
  teamName?: string;
  channelPartnerId?: string;
  partnerName?: string;
  referrerName?: string;
  role: string;
  baseAmount: number;
  sharePercent: number;
  grossAmount: number;
  deductionTotal: number;
  withholdingAmount: number;
  netAmount: number;
  paidAmount: number;
  status: CommissionStatus;
  tierApplied?: number;
  capReached: boolean;
  capContribution: number;
  deductions: CommissionDeductionDto[];
}

export interface CommissionDeductionDto {
  id: string;
  kind: DeductionKind;
  label: string;
  percent: number;
  amount: number;
  payableToName?: string;
  note?: string;
  sortOrder: number;
}

/** The commission disbursement authorisation — exactly who gets what from this deal. */
export interface CommissionDisbursementDto {
  id: string;
  reference: string;
  commissionCalculationId: string;
  dealId?: string;
  bookingId?: string;
  subject?: string;
  issuedOn: string;
  grossFee: number;
  totalDisbursed: number;
  houseRetained: number;
  currencyCode: string;
  preparedByName?: string;
  outcome: ApprovalOutcome;
  approvedByName?: string;
  approvedAt?: string;
  documentUrl?: string;
  fromClientAccount: boolean;
  splits: CommissionSplitDto[];
}

export interface CommissionPayoutDto {
  id: string;
  reference: string;
  agentProfileId?: string;
  agentName?: string;
  channelPartnerId?: string;
  partnerName?: string;
  periodFrom: string;
  periodTo: string;
  paidOn: string;
  grossAmount: number;
  deductionAmount: number;
  withholdingAmount: number;
  advanceRecovered: number;
  clawbackAmount: number;
  netAmount: number;
  currencyCode: string;
  instrument: PaymentInstrument;
  paymentReference?: string;
  paidViaPayroll: boolean;
  statementUrl?: string;
  isPaid: boolean;
  lines: CommissionPayoutLineDto[];
}

export interface CommissionPayoutLineDto {
  id: string;
  commissionSplitId?: string;
  description: string;
  amount: number;
  isClawback: boolean;
}

/** An agent's cap position — the number they check constantly and dispute if it moves. */
export interface AgentCapLedgerDto {
  agentProfileId: string;
  agentName: string;
  periodFrom: string;
  periodTo: string;
  capAmount: number;
  contributedAmount: number;
  remainingToCap: number;
  percentToCap: number;
  capReached: boolean;
  capReachedOn?: string;
  rolledOverAmount: number;
  grossCommissionEarned: number;
  netCommissionEarned: number;
  dealCount: number;
  transactionVolume: number;
  currencyCode: string;
}

export interface ChannelPartnerListItemDto {
  id: string;
  reference: string;
  name: string;
  tradingName?: string;
  status: PartnerStatus;
  tierName?: string;
  contactName?: string;
  phone?: string;
  email?: string;
  city?: string;
  relationshipManagerName?: string;
  onboardedOn?: string;
  leadsRegistered: number;
  siteVisitsDone: number;
  bookingsMade: number;
  bookingValue: number;
  collectionContribution: number;
  cancellationCount: number;
  conversionPercent: number;
  commissionEarned: number;
  commissionPaid: number;
  commissionPending: number;
  advanceOutstanding: number;
  currencyCode: string;
  authorisedProjectCount: number;
  hasExpiredDocuments: boolean;
  licenceExpiring: boolean;
}

export interface ChannelPartnerDetailDto extends ChannelPartnerListItemDto {
  partyId?: string;
  addressLine?: string;
  registrationNumber?: string;
  licenceNumber?: string;
  licenceExpiresOn?: string;
  taxNumber?: string;
  bankName?: string;
  accountTitle?: string;
  accountNumber?: string;
  bankDetailsVerified: boolean;
  withholdingPercent: number;
  suspendedOn?: string;
  suspensionReason?: string;
  notes?: string;
  users: PartnerUserDto[];
  authorisations: PartnerAuthorisationDto[];
  documents: ChecklistItemDto[];
  recentRegistrations: LeadRegistrationDto[];
  bookings: BookingListItemDto[];
  statements: PartnerStatementDto[];
  advances: PartnerAdvanceDto[];
  timeline: TimelineEntryDto[];
}

export interface ChannelPartnerUpsertDto {
  id?: string;
  name: string;
  tradingName?: string;
  partyId?: string;
  tierId?: string;
  contactName?: string;
  phone?: string;
  email?: string;
  addressLine?: string;
  city?: string;
  geoAreaId?: string;
  registrationNumber?: string;
  licenceNumber?: string;
  licenceExpiresOn?: string;
  taxNumber?: string;
  bankName?: string;
  accountTitle?: string;
  accountNumber?: string;
  withholdingPercent: number;
  relationshipManagerUserId?: string;
  notes?: string;
  authorisations: PartnerAuthorisationDto[];
}

export interface PartnerUserDto {
  id?: string;
  userId?: string;
  name: string;
  phone?: string;
  email?: string;
  designation?: string;
  isPrimary: boolean;
  canViewCommission: boolean;
  canRegisterLeads: boolean;
  canBookVisits: boolean;
  isActive: boolean;
  lastLoginAt?: string;
  leadsRegistered: number;
  bookingsMade: number;
}

export interface PartnerAuthorisationDto {
  id?: string;
  projectId: string;
  projectName?: string;
  commissionPlanId?: string;
  commissionPlanName?: string;
  territoryId?: string;
  effectiveFrom: string;
  effectiveTo?: string;
  maxBookings?: number;
  bookingsMade: number;
  canSeePrices: boolean;
  canHoldUnits: boolean;
  isActive: boolean;
}

export interface PartnerTierDto {
  id: string;
  name: string;
  code?: string;
  level: number;
  minBookingValue: number;
  minBookingCount: number;
  commissionUpliftPercent: number;
  priorityAllocation: boolean;
  leadValidityDays: number;
  benefits?: string;
  autoPromote: boolean;
  partnerCount: number;
}

export interface LeadRegistrationDto {
  id: string;
  reference: string;
  channelPartnerId: string;
  partnerName: string;
  partnerUserName?: string;
  projectId: string;
  projectName: string;
  prospectName: string;
  prospectPhone: string;
  prospectEmail?: string;
  prospectIdentityNumber?: string;
  status: LeadRegistrationStatus;
  registeredAt: string;
  expiresAt: string;
  daysRemaining: number;
  isExpiringSoon: boolean;
  conflictsWithRegistrationId?: string;
  conflictsWithPartnerName?: string;
  rejectionReason?: string;
  enquiryId?: string;
  siteVisitId?: string;
  bookingId?: string;
  convertedOn?: string;
  extensionCount: number;
  note?: string;
}

export interface LeadRegistrationCreateDto {
  channelPartnerId: string;
  partnerUserId?: string;
  projectId: string;
  prospectName: string;
  prospectPhone: string;
  prospectEmail?: string;
  prospectIdentityNumber?: string;
  note?: string;
}

export interface PartnerCommissionRateDto {
  id?: string;
  channelPartnerId?: string;
  partnerTierId?: string;
  tierName?: string;
  projectId: string;
  projectName?: string;
  subType?: PropertySubType;
  fromValue: number;
  toValue?: number;
  commissionPercent: number;
  ratePerSqFt: number;
  flatAmount: number;
  trigger: CommissionTrigger;
  releaseAtCollectionPercent: number;
  effectiveFrom: string;
  effectiveTo?: string;
  isActive: boolean;
}

export interface PartnerCommissionEntryDto {
  id: string;
  channelPartnerId: string;
  partnerName: string;
  bookingId: string;
  bookingReference: string;
  unitNumber?: string;
  projectName: string;
  customerName: string;
  bookingValue: number;
  commissionPercent: number;
  grossCommission: number;
  collectionPercent: number;
  earnedAmount: number;
  withholdingAmount: number;
  netAmount: number;
  paidAmount: number;
  pendingAmount: number;
  clawedBackAmount: number;
  currencyCode: string;
  status: CommissionStatus;
  accruedOn: string;
  lastPaidOn?: string;
  note?: string;
}

export interface PartnerStatementDto {
  id: string;
  reference: string;
  channelPartnerId: string;
  partnerName: string;
  periodFrom: string;
  periodTo: string;
  issuedOn: string;
  openingBalance: number;
  commissionEarned: number;
  commissionPaid: number;
  withholdingDeducted: number;
  advanceRecovered: number;
  clawbackApplied: number;
  closingBalance: number;
  currencyCode: string;
  bookingCount: number;
  documentUrl?: string;
  isPublishedToPortal: boolean;
  isAcknowledged: boolean;
  entries: PartnerCommissionEntryDto[];
}

export interface PartnerAdvanceDto {
  id: string;
  reference: string;
  amount: number;
  advancedOn: string;
  purpose?: string;
  recoveryPercent: number;
  recoveredAmount: number;
  outstandingAmount: number;
  fullyRecoveredOn?: string;
  isWrittenOff: boolean;
}

export interface PartnerContestDto {
  id: string;
  name: string;
  projectId?: string;
  projectName?: string;
  startsOn: string;
  endsOn: string;
  metricKey: string;
  targetValue: number;
  prizeDescription?: string;
  prizeAmount?: number;
  isPublished: boolean;
  isClosed: boolean;
  winnerPartnerName?: string;
  rules?: string;
  leaderboard: ContestLeaderboardRowDto[];
}

export interface ContestLeaderboardRowDto {
  rank: number;
  channelPartnerId: string;
  partnerName: string;
  value: number;
  percentOfTarget: number;
  bookingCount: number;
}


/* ── ExitDtos ─────────────────────────────────────────────── */

export interface CancellationDto {
  id: string;
  reference: string;
  bookingId: string;
  bookingReference: string;
  partyId: string;
  partyName: string;
  unitNumber?: string;
  projectName: string;
  trigger: CancellationTrigger;
  reasonLabel: string;
  note?: string;
  requestedOn: string;
  effectiveOn?: string;
  totalConsideration: number;
  totalPaid: number;
  surchargeOutstanding: number;
  deductionAmount: number;
  administrativeCharge: number;
  commissionClawback: number;
  refundableAmount: number;
  currencyCode: string;
  requestedByName: string;
  outcome: ApprovalOutcome;
  approvedByName?: string;
  approvedAt?: string;
  refundRequestId?: string;
  unitReleased: boolean;
  unitReleasedOn?: string;
  customerAcknowledged: boolean;
  legalNoticeId?: string;
  deductions: DeductionLineDto[];
}

export interface DeductionLineDto {
  id?: string;
  label: string;
  amount: number;
  /** The slab or rule that produced it. A deduction nobody can explain is not collectable. */
  basis?: string;
  isWaived: boolean;
  sortOrder: number;
}

export interface CancellationRequestDto {
  bookingId: string;
  trigger: CancellationTrigger;
  reasonCodeId: string;
  note?: string;
  requestedOn: string;
  effectiveOn?: string;
  deductionPolicyId?: string;
  /** Waive part of the deduction. Needs its own approval on top of the cancellation's. */
  overrideDeductionAmount?: number;
  overrideReason?: string;
  releaseUnitImmediately: boolean;
  dryRun: boolean;
}

/** The arithmetic before anything is committed, with the working shown to the customer. */
export interface CancellationPreviewDto {
  totalConsideration: number;
  totalPaid: number;
  surchargeOutstanding: number;
  deductions: DeductionLineDto[];
  deductionTotal: number;
  refundableAmount: number;
  refundableInWords: string;
  currencyCode: string;
  monthsSinceBooking: number;
  paidPercent: number;
  slabApplied?: string;
  commissionClawback: number;
  refundOnlyAfterResale: boolean;
  refundInstalmentCount: number;
  requiresApproval: boolean;
  approvalsRequired: string[];
}

export interface DeductionPolicyDto {
  id: string;
  name: string;
  projectId?: string;
  projectName?: string;
  basis: DeductionBasis;
  flatPercent: number;
  flatAmount: number;
  administrativeCharge: number;
  forfeitAccruedSurcharge: boolean;
  clawBackCommission: boolean;
  refundOnlyAfterResale: boolean;
  refundInstalmentCount: number;
  isActive: boolean;
  slabs: DeductionSlabDto[];
}

export interface DeductionSlabDto {
  id?: string;
  fromMonth: number;
  toMonth?: number;
  fromPaidPercent?: number;
  toPaidPercent?: number;
  deductionPercent: number;
  deductionAmount: number;
  appliesToPaidAmount: boolean;
  sortOrder: number;
}

export interface RefundRequestDto {
  id: string;
  reference: string;
  partyId: string;
  partyName: string;
  bookingId?: string;
  bookingReference?: string;
  cancellationId?: string;
  tenancyId?: string;
  tokenReservationId?: string;
  status: RefundStatus;
  requestedAmount: number;
  approvedAmount: number;
  paidAmount: number;
  outstanding: number;
  currencyCode: string;
  requestedOn: string;
  requestedByName: string;
  approvedByName?: string;
  approvedAt?: string;
  secondApproverName?: string;
  payeeName?: string;
  bankName?: string;
  accountNumber?: string;
  bankDetailsVerified: boolean;
  awaitingResale: boolean;
  resaleBookingId?: string;
  rejectionReason?: string;
  schedule: RefundScheduleDto[];
}

export interface RefundScheduleDto {
  id: string;
  sequenceNumber: number;
  dueDate: string;
  amount: number;
  paidAmount: number;
  paidOn?: string;
  instrument?: PaymentInstrument;
  paymentReference?: string;
  isPaid: boolean;
  isOverdue: boolean;
}

export interface ResaleRequestDto {
  id: string;
  reference: string;
  bookingId: string;
  bookingReference: string;
  sellerPartyId: string;
  sellerName: string;
  buyerPartyId?: string;
  buyerName?: string;
  requestedOn: string;
  originalPrice: number;
  resalePrice: number;
  gainAmount: number;
  resaleFee: number;
  withholdingTax: number;
  status: TransferStatus;
  transferRequestId?: string;
  newBookingId?: string;
  note?: string;
}

export interface TransferRequestListItemDto {
  id: string;
  reference: string;
  kind: TransferKind;
  status: TransferStatus;
  requestedOn: string;
  projectId: string;
  projectName: string;
  unitNumber?: string;
  fileNumber?: string;
  bookingId?: string;
  bookingReference?: string;
  transferorName: string;
  transfereeName?: string;
  saleConsideration?: number;
  currencyCode: string;
  outstandingAtRequest: number;
  duesCleared: boolean;
  nocIssued: boolean;
  totalTransferFee: number;
  feesPaid: number;
  feesCleared: boolean;
  sessionScheduledAt?: string;
  completedOn?: string;
  blockedByLitigation: boolean;
  handledByName?: string;
  daysOpen: number;
}

export interface TransferRequestDetailDto extends TransferRequestListItemDto {
  unitId?: string;
  plotFileId?: string;
  propertyId?: string;
  requestedByPartyId: string;
  duesClearanceId?: string;
  nocIssuanceId?: string;
  feeReceiptId?: string;
  newBookingId?: string;
  newAllotmentId?: string;
  successionCertificateNumber?: string;
  powerOfAttorneyRelationshipId?: string;
  courtDecreeReference?: string;
  shareTransferredPercent?: number;
  rejectReason?: string;
  note?: string;
  parties: TransferPartyDto[];
  feeLines: TransferFeeLineDto[];
  duesClearance?: DuesClearanceDto;
  noc?: NocIssuanceDto;
  session?: TransferSessionDto;
  documentChecklist: ChecklistItemDto[];
  /** The four gates, in order, with the first unmet one flagged. */
  gates: TransferGateDto[];
}

/** One of the gates a transfer has to pass, and whether it has. */
export interface TransferGateDto {
  order: number;
  key: string;
  label: string;
  isSatisfied: boolean;
  detail?: string;
  blockingReason?: string;
  canOverride: boolean;
  overrideRole?: string;
  wasOverridden: boolean;
  route?: string;
}

export interface TransferPartyDto {
  id?: string;
  partyId: string;
  name: string;
  fatherOrGuardianName?: string;
  identityNumber?: string;
  phone?: string;
  photoUrl?: string;
  side: string;
  sharePercent: number;
  kycStatus: KycStatus;
  identityVerified: boolean;
  isPresent: boolean;
  signatureUrl?: string;
  thumbImpressionUrl?: string;
}

export interface TransferFeeLineDto {
  id?: string;
  feeType: string;
  label: string;
  basis: ChargeBasis;
  rate: number;
  amount: number;
  payableBy: string;
  isPaid: boolean;
  isWaived: boolean;
  sortOrder: number;
}

export interface TransferRequestCreateDto {
  bookingId?: string;
  unitId?: string;
  plotFileId?: string;
  propertyId?: string;
  projectId: string;
  kind: TransferKind;
  requestedOn: string;
  requestedByPartyId: string;
  saleConsideration?: number;
  shareTransferredPercent?: number;
  parties: TransferPartyDto[];
  successionCertificateNumber?: string;
  powerOfAttorneyRelationshipId?: string;
  courtDecreeReference?: string;
  note?: string;
  /** Create the buyer as a new party in the same call. */
  newTransferee?: PartyUpsertDto;
}

export interface DuesClearanceDto {
  id: string;
  reference: string;
  issuedOn: string;
  validUntil: string;
  instalmentsOutstanding: number;
  surchargeOutstanding: number;
  maintenanceOutstanding: number;
  utilityOutstanding: number;
  otherOutstanding: number;
  totalOutstanding: number;
  currencyCode: string;
  isClear: boolean;
  isExpired: boolean;
  issuedByName?: string;
  documentUrl?: string;
  note?: string;
}

export interface TransferSessionDto {
  id: string;
  transferRequestId: string;
  scheduledAt: string;
  startedAt?: string;
  completedAt?: string;
  venue?: string;
  conductedByName?: string;
  transferorPresent: boolean;
  transfereePresent: boolean;
  identitiesVerified: boolean;
  deedNumber?: string;
  sessionPhotoUrl?: string;
  videoUrl?: string;
  isCompleted: boolean;
  abortReason?: string;
  witnesses: TransferWitnessDto[];
}

export interface TransferWitnessDto {
  id?: string;
  partyId?: string;
  name: string;
  identityNumber?: string;
  phone?: string;
  address?: string;
  signatureUrl?: string;
  thumbImpressionUrl?: string;
  sequenceNumber: number;
}

export interface OwnershipChainEntryDto {
  id: string;
  sequenceNumber: number;
  partyId: string;
  ownerName: string;
  fatherOrGuardianName?: string;
  identityNumber?: string;
  sharePercent: number;
  fromDate: string;
  toDate?: string;
  acquiredBy?: TransferKind;
  consideration?: number;
  documentReference?: string;
  transferRequestId?: string;
  isCurrent: boolean;
  heldForDays?: number;
}

export interface DuplicateFileRequestDto {
  id: string;
  reference: string;
  plotFileId?: string;
  fileNumber?: string;
  bookingId?: string;
  partyId: string;
  partyName: string;
  requestedOn: string;
  lossCircumstances?: string;
  affidavitReceived: boolean;
  affidavitUrl?: string;
  policeReportReceived: boolean;
  policeReportNumber?: string;
  newspaperNoticePublished: boolean;
  noticePublishedOn?: string;
  noticeClippingUrl?: string;
  objectionWindowDays: number;
  objectionWindowEndsOn?: string;
  objectionReceived: boolean;
  indemnityBondReceived: boolean;
  indemnityBondUrl?: string;
  fee: number;
  isIssued: boolean;
  issuedOn?: string;
  duplicateFileNumber?: string;
  checklist: ChecklistItemDto[];
}

export interface PossessionOfferDto {
  id: string;
  reference: string;
  bookingId: string;
  bookingReference: string;
  unitId?: string;
  unitNumber?: string;
  projectName: string;
  partyId: string;
  partyName: string;
  partyPhone?: string;
  status: PossessionStatus;
  offeredOn?: string;
  windowFrom?: string;
  windowTo?: string;
  appointmentOn?: string;
  balanceDue: number;
  possessionChargesDue: number;
  maintenanceAdvanceDue: number;
  corpusFundDue: number;
  utilityDepositsDue: number;
  totalDueAtPossession: number;
  currencyCode: string;
  documentUrl?: string;
  handoverId?: string;
  customerDeclined: boolean;
  declineReason?: string;
  delayDays?: number;
  delayCompensation?: number;
  checklist: ChecklistItemDto[];
  isEligible: boolean;
  openCriticalSnags: number;
}

export interface HandoverDto {
  id: string;
  reference: string;
  bookingId?: string;
  unitId?: string;
  unitNumber?: string;
  clientBuildContractId?: string;
  partyId: string;
  partyName: string;
  handedOverAt: string;
  handedOverByName?: string;
  snagInspectionId?: string;
  certificateUrl?: string;
  customerSignatureUrl?: string;
  defectLiabilityStartsOn: string;
  isCompleted: boolean;
  note?: string;
  items: HandoverItemDto[];
  liabilities: DefectLiabilityDto[];
}

export interface HandoverItemDto {
  id?: string;
  itemType: string;
  label: string;
  detail?: string;
  quantity?: number;
  meterId?: string;
  meterNumber?: string;
  readingValue?: number;
  documentUrl?: string;
  isHandedOver: boolean;
  sortOrder: number;
}

export interface SnagInspectionDto {
  id: string;
  reference: string;
  unitId?: string;
  unitNumber?: string;
  projectId?: string;
  projectName?: string;
  bookingId?: string;
  clientBuildContractId?: string;
  inspectionType: string;
  inspectedAt: string;
  inspectorName?: string;
  customerPresent: boolean;
  customerName?: string;
  contractorName?: string;
  criticalCount: number;
  majorCount: number;
  minorCount: number;
  closedCount: number;
  openCount: number;
  percentClosed: number;
  blocksHandover: boolean;
  targetClosureDate?: string;
  customerSignatureUrl?: string;
  inspectorSignatureUrl?: string;
  isClosed: boolean;
  punchListId?: string;
  snags: SnagDto[];
}

export interface SnagDto {
  id: string;
  snagNumber: number;
  zone: SnagZone;
  severity: SnagSeverity;
  status: SnagStatus;
  description: string;
  location?: string;
  planX?: number;
  planY?: number;
  responsibleParty: CostBearer;
  responsibleName?: string;
  assignedToName?: string;
  workOrderId?: string;
  targetDate?: string;
  fixedOn?: string;
  verifiedOn?: string;
  verifiedByName?: string;
  estimatedCost?: number;
  actualCost?: number;
  rejectionReason?: string;
  isOverdue: boolean;
  photos: SnagPhotoDto[];
}

export interface SnagPhotoDto {
  id?: string;
  url: string;
  stage: string;
  capturedAt: string;
  caption?: string;
}

export interface SnagUpsertDto {
  id?: string;
  snagInspectionId: string;
  zone: SnagZone;
  severity: SnagSeverity;
  description: string;
  location?: string;
  planX?: number;
  planY?: number;
  responsibleParty: CostBearer;
  responsiblePartyId?: string;
  subcontractId?: string;
  assignedToUserId?: string;
  targetDate?: string;
  estimatedCost?: number;
  photos: SnagPhotoDto[];
  /** Captured on a tablet with no signal and queued. Reconciled when it syncs. */
  clientReference?: string;
}

/** A batch of snags captured offline during a walk, posted when the connection returns. */
export interface SnagSyncBatchDto {
  snagInspectionId: string;
  snags: SnagUpsertDto[];
  capturedAt: string;
}

export interface PunchListDto {
  id: string;
  reference: string;
  snagInspectionId?: string;
  unitId?: string;
  unitNumber?: string;
  subcontractId?: string;
  contractorName?: string;
  issuedOn: string;
  agreedClosureDate?: string;
  itemCount: number;
  closedCount: number;
  percentComplete: number;
  issuerSigned: boolean;
  counterpartySigned: boolean;
  documentUrl?: string;
  retentionHeldAgainst: number;
  isClosed: boolean;
  closedOn?: string;
  isOverdue: boolean;
}

export interface DefectLiabilityDto {
  id: string;
  unitId?: string;
  unitNumber?: string;
  projectId?: string;
  clientBuildContractId?: string;
  subcontractId?: string;
  category: DefectCategory;
  startsOn: string;
  durationMonths: number;
  expiresOn: string;
  daysRemaining: number;
  liableParty: CostBearer;
  liablePartyName?: string;
  responseSlaDaysCritical: number;
  responseSlaDaysMajor: number;
  responseSlaDaysMinor: number;
  expiryNoticeSent: boolean;
  isExpired: boolean;
  openClaimCount: number;
}

export interface DefectClaimDto {
  id: string;
  reference: string;
  unitId?: string;
  unitNumber?: string;
  bookingId?: string;
  partyId: string;
  partyName: string;
  partyPhone?: string;
  category: DefectCategory;
  severity: SnagSeverity;
  status: TicketStatus;
  description: string;
  reportedOn: string;
  slaDueAt?: string;
  slaBreached: boolean;
  workOrderId?: string;
  costBearer: CostBearer;
  cost?: number;
  isRejected: boolean;
  rejectionReason?: string;
  resolvedOn?: string;
  customerRating?: number;
  isInsideLiabilityPeriod: boolean;
}

export interface NocIssuanceDto {
  id: string;
  nocNumber: string;
  kind: NocKind;
  status: NocStatus;
  projectId?: string;
  projectName?: string;
  unitId?: string;
  unitNumber?: string;
  partyId: string;
  partyName: string;
  requestedOn: string;
  issuedOn?: string;
  validUntil?: string;
  isExpired: boolean;
  duesCleared: boolean;
  outstandingAtIssue: number;
  fee: number;
  feePaid: boolean;
  issuedByName?: string;
  documentUrl?: string;
  verificationCode?: string;
  addressedTo?: string;
  purpose?: string;
  rejectionReason?: string;
  isRevoked: boolean;
  revocationReason?: string;
  conditions: NocConditionDto[];
}

export interface NocConditionDto {
  id?: string;
  condition: string;
  complyByDate?: string;
  isSatisfied: boolean;
  satisfiedOn?: string;
  breachRevokesNoc: boolean;
  sortOrder: number;
}

export interface NocRequestDto {
  kind: NocKind;
  projectId?: string;
  societyId?: string;
  unitId?: string;
  propertyId?: string;
  bookingId?: string;
  partyId: string;
  transferRequestId?: string;
  buildingPlanApplicationId?: string;
  customerMortgageId?: string;
  addressedTo?: string;
  purpose?: string;
  validDays: number;
  fee?: number;
  conditions: NocConditionDto[];
}


/* ── FacilityDtos ─────────────────────────────────────────────── */

export interface WorkOrderListItemDto {
  id: string;
  orderNumber: string;
  source: WorkOrderSource;
  status: WorkOrderStatus;
  priority: TicketPriority;
  propertyId?: string;
  addressOneLine?: string;
  unitId?: string;
  unitLabel?: string;
  societyName?: string;
  locationDetail?: string;
  title: string;
  trade?: string;
  raisedAt: string;
  raisedByName?: string;
  assignedToName?: string;
  contractorName?: string;
  appointmentFrom?: string;
  appointmentTo?: string;
  responseDueAt?: string;
  completionDueAt?: string;
  slaBreached: boolean;
  hoursToSla?: number;
  estimatedCost: number;
  totalCost: number;
  currencyCode: string;
  costBearer: CostBearer;
  requiresAuthorisation: boolean;
  isAuthorised: boolean;
  occupierSignedOff: boolean;
  satisfactionRating?: number;
  ageHours: number;
}

export interface WorkOrderDetailDto extends WorkOrderListItemDto {
  projectId?: string;
  societyId?: string;
  facilityAssetId?: string;
  assetName?: string;
  description: string;
  tenancyId?: string;
  complaintId?: string;
  snagId?: string;
  defectClaimId?: string;
  ppmTaskId?: string;
  inspectionFindingId?: string;
  access?: AccessArrangement;
  keySetId?: string;
  keyLabel?: string;
  occupierNotified: boolean;
  accessNoticeId?: string;
  approvalRequestId?: string;
  authorisedByName?: string;
  authorisedAt?: string;
  isEmergencyOverride: boolean;
  landlordAuthorityLimit?: number;
  startedAt?: string;
  completedAt?: string;
  labourHours?: number;
  workDone?: string;
  signedOffAt?: string;
  signatureUrl?: string;
  labourCost: number;
  materialCost: number;
  contractorCost: number;
  isRecharged: boolean;
  note?: string;
  lines: WorkOrderLineDto[];
  photos: WorkOrderPhotoDto[];
  costShares: WorkOrderCostShareDto[];
  timeline: TimelineEntryDto[];
}

export interface WorkOrderLineDto {
  id?: string;
  description: string;
  lineType: string;
  quantity: number;
  uom?: string;
  rate: number;
  amount: number;
  itemId?: string;
  itemName?: string;
  warehouseId?: string;
  stockIssued: boolean;
  sortOrder: number;
}

export interface WorkOrderPhotoDto {
  id?: string;
  url: string;
  stage: string;
  capturedAt: string;
  caption?: string;
}

export interface WorkOrderCostShareDto {
  id?: string;
  bearer: CostBearer;
  partyId?: string;
  partyName?: string;
  amount: number;
  sharePercent: number;
  justification?: string;
  isInvoiced: boolean;
}

export interface WorkOrderCreateDto {
  id?: string;
  source: WorkOrderSource;
  priority: TicketPriority;
  propertyId?: string;
  unitId?: string;
  projectId?: string;
  societyId?: string;
  facilityAssetId?: string;
  locationDetail?: string;
  title: string;
  description: string;
  trade?: string;
  tenancyId?: string;
  complaintId?: string;
  snagId?: string;
  defectClaimId?: string;
  ppmTaskId?: string;
  inspectionFindingId?: string;
  raisedByPartyId?: string;
  assignedToUserId?: string;
  contractorId?: string;
  appointmentFrom?: string;
  appointmentTo?: string;
  access?: AccessArrangement;
  keySetId?: string;
  estimatedCost: number;
  costBearer: CostBearer;
  lines: WorkOrderLineDto[];
  photos: WorkOrderPhotoDto[];
  /** A burst main at midnight proceeds without waiting for a landlord's approval. */
  isEmergencyOverride: boolean;
  overrideReason?: string;
  notifyOccupier: boolean;
  serveAccessNotice: boolean;
  note?: string;
}

export interface WorkOrderCompletionDto {
  workOrderId: string;
  startedAt?: string;
  completedAt: string;
  labourHours?: number;
  workDone: string;
  lines: WorkOrderLineDto[];
  photos: WorkOrderPhotoDto[];
  occupierSignedOff: boolean;
  signatureUrl?: string;
  satisfactionRating?: number;
  costBearer: CostBearer;
  costShares: WorkOrderCostShareDto[];
}

export interface ContractorListItemDto {
  id: string;
  reference: string;
  name: string;
  contactName?: string;
  phone?: string;
  emergencyPhone?: string;
  email?: string;
  trades: string[];
  isApproved: boolean;
  isSuspended: boolean;
  isEmergencyContractor: boolean;
  responseSlaHours: number;
  jobsCompleted: number;
  openJobs: number;
  averageCost: number;
  averageDaysToComplete: number;
  averageRating?: number;
  reworkCount: number;
  slaBreachCount: number;
  currencyCode: string;
  /** An expired insurance blocks new work. Surfaced on the list, not buried in a tab. */
  hasExpiredCompliance: boolean;
  complianceExpiringCount: number;
}

export interface ContractorDetailDto extends ContractorListItemDto {
  partyId?: string;
  supplierId?: string;
  addressLine?: string;
  registrationNumber?: string;
  taxNumber?: string;
  approvedOn?: string;
  suspensionReason?: string;
  tradeDetails: ContractorTradeDto[];
  rates: ContractorRateDto[];
  compliance: ContractorComplianceDto[];
  recentJobs: WorkOrderListItemDto[];
}

export interface ContractorTradeDto {
  id?: string;
  trade: string;
  isPrimary: boolean;
  certification?: string;
}

export interface ContractorRateDto {
  id?: string;
  trade?: string;
  description: string;
  rateType: string;
  rate: number;
  outOfHoursRate: number;
  calloutCharge: number;
  uom?: string;
  effectiveFrom: string;
  effectiveTo?: string;
  isActive: boolean;
}

export interface ContractorComplianceDto {
  id?: string;
  complianceType: string;
  referenceNumber?: string;
  provider?: string;
  coverAmount?: number;
  issuedOn?: string;
  expiresOn: string;
  daysToExpiry: number;
  isExpired: boolean;
  documentUrl?: string;
  isMandatory: boolean;
  blocksAssignmentWhenExpired: boolean;
  isVerified: boolean;
}

export interface PpmScheduleDto {
  id: string;
  name: string;
  facilityAssetId?: string;
  assetName?: string;
  propertyId?: string;
  addressOneLine?: string;
  societyName?: string;
  trade?: string;
  taskDescription?: string;
  frequency: string;
  intervalDays: number;
  lastCompletedOn?: string;
  nextDueOn: string;
  daysToDue: number;
  isOverdue: boolean;
  generateDaysBefore: number;
  contractorName?: string;
  estimatedCost?: number;
  priority: TicketPriority;
  isStatutory: boolean;
  isActive: boolean;
  completedCount: number;
  missedCount: number;
  compliancePercent: number;
}

export interface PpmTaskDto {
  id: string;
  ppmScheduleId: string;
  scheduleName: string;
  assetName?: string;
  addressOneLine?: string;
  dueDate: string;
  completedOn?: string;
  workOrderId?: string;
  workOrderNumber?: string;
  contractorName?: string;
  cost?: number;
  status: string;
  isOverdue: boolean;
  isStatutory: boolean;
  completionNote?: string;
  certificateUrl?: string;
  skipReason?: string;
}

export interface FacilityAssetDto {
  id: string;
  name: string;
  assetCode: string;
  kind: AssetKind;
  propertyId?: string;
  addressOneLine?: string;
  societyName?: string;
  location?: string;
  make?: string;
  model?: string;
  serialNumber?: string;
  capacity?: string;
  installedOn?: string;
  warrantyExpiresOn?: string;
  warrantyActive: boolean;
  expectedLifeYears?: number;
  ageYears?: number;
  purchaseCost?: number;
  replacementCost?: number;
  serviceContractId?: string;
  serviceContractName?: string;
  lastServicedOn?: string;
  nextServiceDue?: string;
  serviceOverdue: boolean;
  operationalStatus: string;
  breakdownCount: number;
  lifetimeMaintenanceCost: number;
  currencyCode: string;
  manualUrl?: string;
  isCritical: boolean;
  isActive: boolean;
}

export interface AssetServiceRecordDto {
  id: string;
  servicedOn: string;
  serviceType: string;
  contractorName?: string;
  workOrderId?: string;
  workDone?: string;
  partsReplaced?: string;
  cost: number;
  downtimeHours?: number;
  nextServiceDue?: string;
  certificateUrl?: string;
  findings?: string;
}

export interface ServiceContractDto {
  id: string;
  reference: string;
  name: string;
  contractorName?: string;
  addressOneLine?: string;
  societyName?: string;
  scope?: string;
  annualValue: number;
  currencyCode: string;
  paymentFrequency: RentFrequency;
  startDate: string;
  endDate: string;
  daysToExpiry: number;
  isExpiringSoon: boolean;
  noticePeriodDays: number;
  coverType: string;
  responseSlaHours: number;
  visitsPerYear: number;
  visitsCompleted: number;
  documentUrl?: string;
  autoRenews: boolean;
  isActive: boolean;
  assetCount: number;
}

export interface InspectionRoundDto {
  id: string;
  reference: string;
  propertyId?: string;
  addressOneLine?: string;
  societyName?: string;
  kind: InspectionKind;
  inspectedAt: string;
  inspectorName?: string;
  areas?: string;
  score?: number;
  findingCount: number;
  openFindingCount: number;
  safetyIssueCount: number;
  summary?: string;
  reportUrl?: string;
  nextRoundDue?: string;
  findings: InspectionFindingDto[];
}

export interface InspectionFindingDto {
  id?: string;
  area: string;
  description: string;
  severity: TicketPriority;
  photoUrls: string[];
  workOrderId?: string;
  workOrderNumber?: string;
  assignedToName?: string;
  targetDate?: string;
  isResolved: boolean;
  resolvedOn?: string;
  isSafetyIssue: boolean;
  isOverdue: boolean;
}

export interface MeterDto {
  id: string;
  meterNumber: string;
  kind: MeterKind;
  propertyId?: string;
  addressOneLine?: string;
  unitId?: string;
  unitLabel?: string;
  societyName?: string;
  parentMeterId?: string;
  parentMeterNumber?: string;
  location?: string;
  make?: string;
  serialNumber?: string;
  multiplier: number;
  decimalPlaces: number;
  maxReading?: number;
  lastReading?: number;
  lastReadOn?: string;
  daysSinceLastReading?: number;
  averageConsumption?: number;
  utilityTariffId?: string;
  tariffName?: string;
  utilityAccountNumber?: string;
  securityDeposit?: number;
  isCommonArea: boolean;
  isPrepaid: boolean;
  prepaidBalance?: number;
  isFaulty: boolean;
  isActive: boolean;
  subMeterCount: number;
}

export interface MeterReadingDto {
  id: string;
  meterId: string;
  meterNumber: string;
  unitLabel?: string;
  kind: MeterKind;
  readingDate: string;
  readingValue: number;
  previousReading?: number;
  consumption: number;
  daysSinceLastReading?: number;
  source: ReadingSource;
  readByName?: string;
  photoUrl?: string;
  isImplausible: boolean;
  variancePercent?: number;
  isVerified: boolean;
  rolledOver: boolean;
  isBilled: boolean;
  note?: string;
}

/**
 * A round of readings taken on a phone. Posted as one batch when the reader gets back into signal,
 * with the implausible ones flagged rather than silently billed.
 */
export interface MeterReadingBatchDto {
  societyId?: string;
  propertyId?: string;
  readingDate: string;
  readings: MeterReadingEntryDto[];
  wasOffline: boolean;
}

export interface MeterReadingEntryDto {
  meterId: string;
  readingValue: number;
  photoUrl?: string;
  source: ReadingSource;
  note?: string;
  clientReference?: string;
}

export interface MeterReadingBatchResultDto {
  accepted: number;
  flagged: number;
  rejected: number;
  totalConsumption: number;
  implausible: MeterReadingDto[];
  errors: string[];
}

export interface UtilityTariffDto {
  id: string;
  name: string;
  kind: MeterKind;
  societyName?: string;
  ratePerUnit: number;
  fixedCharge: number;
  minimumCharge: number;
  fuelAdjustmentPerUnit: number;
  taxPercent: number;
  meterRent: number;
  administrativeMarkupPercent: number;
  effectiveFrom: string;
  effectiveTo?: string;
  isActive: boolean;
  meterCount: number;
  slabs: UtilityTariffSlabDto[];
}

export interface UtilityTariffSlabDto {
  id?: string;
  fromUnits: number;
  toUnits?: number;
  ratePerUnit: number;
  isRetrospective: boolean;
  sortOrder: number;
}

export interface UtilityBillDto {
  id: string;
  billNumber: string;
  meterId: string;
  meterNumber: string;
  kind: MeterKind;
  unitId?: string;
  unitLabel?: string;
  partyName?: string;
  periodFrom: string;
  periodTo: string;
  issuedOn: string;
  dueDate: string;
  openingReading: number;
  closingReading: number;
  consumption: number;
  commonAreaShare: number;
  energyCharge: number;
  fixedCharge: number;
  fuelAdjustment: number;
  markupAmount: number;
  taxAmount: number;
  totalAmount: number;
  paidAmount: number;
  currencyCode: string;
  status: InstalmentStatus;
  isEstimated: boolean;
  isDisputed: boolean;
  lines: UtilityBillLineDto[];
}

export interface UtilityBillLineDto {
  id: string;
  description: string;
  units: number;
  rate: number;
  amount: number;
  sortOrder: number;
}

/**
 * Bulk supply against the sum of sub-meters. The gap is common-area consumption plus loss, and
 * seeing it is how a society stops paying for a leak nobody reported.
 */
export interface UtilityReconciliationDto {
  societyId?: string;
  propertyId?: string;
  kind: MeterKind;
  periodFrom: string;
  periodTo: string;
  bulkConsumption: number;
  subMeterTotal: number;
  difference: number;
  differencePercent: number;
  commonAreaConsumption: number;
  unexplainedLoss: number;
  bulkInvoiceAmount: number;
  recoveredAmount: number;
  shortfallAmount: number;
  currencyCode: string;
  isWithinTolerance: boolean;
  outlierMeters: MeterReadingDto[];
}

export interface FuelLogDto {
  id: string;
  societyId?: string;
  facilityAssetId?: string;
  assetName?: string;
  logDate: string;
  entryType: string;
  litres: number;
  ratePerLitre?: number;
  amount: number;
  runHours?: number;
  openingStock?: number;
  closingStock?: number;
  consumptionPerHour?: number;
  expectedPerHour?: number;
  isAnomalous: boolean;
  supplierName?: string;
  invoiceReference?: string;
  recoveredAmount?: number;
  recordedByName?: string;
  note?: string;
}

export interface ParkingSlotDto {
  id: string;
  slotNumber: string;
  propertyId?: string;
  societyName?: string;
  level?: string;
  zone?: string;
  slotType: string;
  isCovered: boolean;
  hasEvCharger: boolean;
  area?: AreaDto;
  isSaleable: boolean;
  soldWithUnitId?: string;
  soldWithUnitLabel?: string;
  isAllotted: boolean;
  allottedToUnitId?: string;
  allottedToUnitLabel?: string;
  allottedToName?: string;
  vehicleNumber?: string;
  monthlyRent: number;
  isVisitorParking: boolean;
  isActive: boolean;
}

export interface ParkingAllotmentDto {
  id?: string;
  parkingSlotId: string;
  slotNumber?: string;
  unitId?: string;
  unitLabel?: string;
  partyId?: string;
  partyName?: string;
  tenancyId?: string;
  residentVehicleId?: string;
  vehicleNumber?: string;
  fromDate: string;
  toDate?: string;
  monthlyCharge: number;
  isIncludedInRent: boolean;
  isActive: boolean;
  note?: string;
}


/* ── FinanceDtos ─────────────────────────────────────────────── */

export interface JointVentureDto {
  id: string;
  reference: string;
  name: string;
  projectId: string;
  projectName: string;
  landParcelId?: string;
  basis: JvShareBasis;
  agreementDate: string;
  effectiveFrom?: string;
  expiresOn?: string;
  documentUrl?: string;
  landownerSharePercent: number;
  developerSharePercent: number;
  landownerArea?: AreaDto;
  managementFeePercent?: number;
  refundableSecurity: number;
  nonRefundableDeposit: number;
  shareOnCollection: boolean;
  totalLandownerEntitlement: number;
  totalLandownerPaid: number;
  landownerBalance: number;
  currencyCode: string;
  hasSpecialPurposeVehicle: boolean;
  spvName?: string;
  isActive: boolean;
  terms?: string;
  allocatedUnitCount: number;
  allocatedUnitValue: number;
  partners: JvPartnerDto[];
  shareTerms: JvShareTermDto[];
  allocations: LandownerAllocationDto[];
}

export interface JvPartnerDto {
  id?: string;
  partyId: string;
  partyName: string;
  phone?: string;
  role: string;
  sharePercent: number;
  contributedValue: number;
  contributionType?: string;
  bankName?: string;
  accountNumber?: string;
  withholdingPercent: number;
  entitlement: number;
  paid: number;
  balance: number;
  isActive: boolean;
}

export interface JvShareTermDto {
  id?: string;
  label: string;
  trigger: string;
  projectMilestoneId?: string;
  milestoneName?: string;
  triggerCollectionPercent?: number;
  percent: number;
  fixedAmount: number;
  entitlementAmount: number;
  paidAmount: number;
  dueDate?: string;
  isSettled: boolean;
  isTriggered: boolean;
  sortOrder: number;
}

export interface LandownerAllocationDto {
  id: string;
  jointVentureId: string;
  jvPartnerId?: string;
  partnerName?: string;
  unitId: string;
  unitNumber: string;
  blockName?: string;
  allocatedOn: string;
  area: AreaDto;
  notionalValue: number;
  status: string;
  isBoughtBack: boolean;
  buyBackPrice?: number;
  handedOverOn?: string;
  note?: string;
}

export interface LandownerLedgerEntryDto {
  id: string;
  entryDate: string;
  entryType: string;
  description: string;
  debitAmount: number;
  creditAmount: number;
  runningBalance: number;
  partnerName?: string;
  receiptNumber?: string;
}

export interface InvestorDto {
  id: string;
  reference: string;
  partyId: string;
  name: string;
  phone?: string;
  email?: string;
  projectId?: string;
  projectName?: string;
  investmentType: string;
  committedAmount: number;
  contributedAmount: number;
  undrawnAmount: number;
  distributedAmount: number;
  sharePercent: number;
  preferredReturnPercent: number;
  currencyCode: string;
  investedOn?: string;
  exitDate?: string;
  realisedIrr?: number;
  unrealisedIrr?: number;
  multipleOnInvestedCapital?: number;
  bankName?: string;
  accountNumber?: string;
  withholdingPercent: number;
  agreementUrl?: string;
  portalAccessEnabled: boolean;
  isActive: boolean;
  calls: CapitalCallDto[];
  contributions: ContributionDto[];
  distributions: DistributionDto[];
}

export interface CapitalCallDto {
  id: string;
  reference: string;
  projectId?: string;
  projectName?: string;
  investorId?: string;
  investorName?: string;
  issuedOn: string;
  dueDate: string;
  amount: number;
  receivedAmount: number;
  receivedOn?: string;
  purpose?: string;
  isDefaulted: boolean;
  defaultPenalty?: number;
  isSettled: boolean;
  isOverdue: boolean;
  noticeUrl?: string;
  currencyCode: string;
}

export interface ContributionDto {
  id: string;
  investorId: string;
  investorName?: string;
  capitalCallId?: string;
  receivedOn: string;
  amount: number;
  instrument: PaymentInstrument;
  reference?: string;
}

export interface DistributionDto {
  id: string;
  reference: string;
  investorId: string;
  investorName: string;
  projectId?: string;
  projectName?: string;
  distributedOn: string;
  distributionType: string;
  grossAmount: number;
  withholdingAmount: number;
  netAmount: number;
  waterfallTier?: number;
  paymentReference?: string;
  isPaid: boolean;
  currencyCode: string;
}

export interface ProjectBankAccountDto {
  id: string;
  projectId: string;
  projectName: string;
  kind: ProjectAccountKind;
  accountTitle: string;
  accountNumber: string;
  bankName?: string;
  branchName?: string;
  ibanOrSwift?: string;
  currencyCode: string;
  balance: number;
  totalCredited: number;
  totalWithdrawn: number;
  depositPercent: number;
  withdrawalEntitlement: number;
  withdrawnAgainstEntitlement: number;
  availableForWithdrawal: number;
  physicalProgressPercent: number;
  regulatorReference?: string;
  requiresEngineerCertificate: boolean;
  requiresArchitectCertificate: boolean;
  requiresAuditorCertificate: boolean;
  lastAuditedOn?: string;
  nextAuditDue?: string;
  auditOverdue: boolean;
  isActive: boolean;
}

export interface EscrowLedgerEntryDto {
  id: string;
  entryDate: string;
  kind: EscrowMovementKind;
  description: string;
  creditAmount: number;
  debitAmount: number;
  runningBalance: number;
  receiptNumber?: string;
  bookingReference?: string;
  customerName?: string;
  isReconciled: boolean;
  bankReference?: string;
}

export interface EscrowWithdrawalDto {
  id: string;
  reference: string;
  projectBankAccountId: string;
  projectId: string;
  projectName: string;
  requestedOn: string;
  requestedAmount: number;
  approvedAmount: number;
  purpose?: string;
  currencyCode: string;
  progressPercentAtRequest: number;
  entitlementAtRequest: number;
  alreadyWithdrawn: number;
  availableAtRequest: number;
  status: string;
  exceededEntitlement: boolean;
  requestedByName?: string;
  withdrawnOn?: string;
  bankReference?: string;
  certificates: WithdrawalCertificateDto[];
  /** Which required certificates are still missing. The gate, made explicit. */
  missingCertificates: string[];
}

export interface WithdrawalCertificateDto {
  id?: string;
  certifierType: string;
  certifierName: string;
  registrationNumber?: string;
  certifiedOn: string;
  certifiedProgressPercent: number;
  certifiedCostIncurred?: number;
  documentUrl?: string;
  isVerified: boolean;
}

export interface EscrowWithdrawalRequestDto {
  projectBankAccountId: string;
  requestedAmount: number;
  purpose?: string;
  certificates: WithdrawalCertificateDto[];
  dryRun: boolean;
}

export interface ProjectLoanDto {
  id: string;
  reference: string;
  projectId: string;
  projectName: string;
  lenderName?: string;
  status: LoanStatus;
  sanctionedAmount: number;
  drawnAmount: number;
  outstandingAmount: number;
  repaidAmount: number;
  undrawnAmount: number;
  currencyCode: string;
  interestRate: number;
  rateBasis?: string;
  accruedInterest: number;
  paidInterest: number;
  sanctionedOn?: string;
  firstDrawdownOn?: string;
  moratoriumEndsOn?: string;
  maturityDate?: string;
  tenureMonths: number;
  securityDescription?: string;
  unitsMortgaged: boolean;
  mortgagedUnitCount: number;
  covenants?: string;
  nextCovenantTestOn?: string;
  documentUrl?: string;
  drawdowns: LoanDrawdownDto[];
  repayments: LoanRepaymentDto[];
}

export interface LoanDrawdownDto {
  id: string;
  reference: string;
  requestedOn: string;
  receivedOn?: string;
  amount: number;
  progressPercentAtDrawdown: number;
  milestoneCertificateId?: string;
  purpose?: string;
  processingFee: number;
  isReceived: boolean;
}

export interface LoanRepaymentDto {
  id: string;
  instalmentNumber: number;
  dueDate: string;
  principalAmount: number;
  interestAmount: number;
  totalAmount: number;
  paidAmount: number;
  paidOn?: string;
  outstandingAfter: number;
  isPaid: boolean;
  isOverdue: boolean;
}

export interface BankGuaranteeDto {
  id: string;
  guaranteeNumber: string;
  kind: GuaranteeKind;
  direction: string;
  projectId?: string;
  projectName?: string;
  subcontractId?: string;
  counterpartyName?: string;
  issuingBank?: string;
  amount: number;
  currencyCode: string;
  issuedOn: string;
  expiresOn: string;
  claimPeriodEndsOn?: string;
  daysToExpiry: number;
  isExpiringSoon: boolean;
  commission?: number;
  marginHeld?: number;
  status: string;
  isAutoRenewing: boolean;
  releasedOn?: string;
  documentUrl?: string;
}

export interface CustomerMortgageDto {
  id: string;
  reference: string;
  bookingId: string;
  bookingReference: string;
  partyId: string;
  partyName: string;
  lenderName?: string;
  status: string;
  appliedAmount: number;
  sanctionedAmount: number;
  disbursedAmount: number;
  pendingDisbursement: number;
  interestRate: number;
  tenureYears: number;
  currencyCode: string;
  appliedOn?: string;
  sanctionedOn?: string;
  sanctionValidUntil?: string;
  sanctionExpiringSoon: boolean;
  tripartiteAgreementSigned: boolean;
  nocToMortgageId?: string;
  rejectionReason?: string;
  documentUrl?: string;
  disbursements: MortgageDisbursementDto[];
}

export interface MortgageDisbursementDto {
  id: string;
  sequenceNumber: number;
  expectedOn?: string;
  receivedOn?: string;
  amount: number;
  projectMilestoneId?: string;
  milestoneName?: string;
  demandId?: string;
  bankReference?: string;
  isReceived: boolean;
  isOverdue: boolean;
  delayReason?: string;
}

export interface RecognitionPolicyDto {
  id: string;
  projectId?: string;
  projectName?: string;
  bookingId?: string;
  clientBuildContractId?: string;
  basis: RecognitionBasis;
  overTimeMethod?: string;
  pointInTimeTrigger?: string;
  rationale: string;
  determinedOn: string;
  determinedByName?: string;
  isActive: boolean;
}

export interface RevenueRecognitionRunDto {
  id: string;
  reference: string;
  projectId?: string;
  projectName?: string;
  periodFrom: string;
  periodTo: string;
  runDate: string;
  isDryRun: boolean;
  contractCount: number;
  revenueRecognised: number;
  costRecognised: number;
  grossMargin: number;
  contractAssetTotal: number;
  contractLiabilityTotal: number;
  currencyCode: string;
  runByName?: string;
  isPosted: boolean;
  errorSummary?: string;
  entries: RecognitionEntryDto[];
}

export interface RecognitionEntryDto {
  id: string;
  bookingId?: string;
  bookingReference?: string;
  clientBuildContractId?: string;
  contractReference?: string;
  customerName?: string;
  basis: RecognitionBasis;
  periodTo: string;
  contractValue: number;
  costIncurredToDate: number;
  totalEstimatedCost: number;
  percentComplete: number;
  revenueRecognisedToDate: number;
  revenueRecognisedPreviously: number;
  revenueThisPeriod: number;
  costRecognisedThisPeriod: number;
  amountsInvoiced: number;
  amountsCollected: number;
  contractAsset: number;
  contractLiability: number;
  isLossMaking: boolean;
  provisionForLoss?: number;
}

export interface WipEntryDto {
  id: string;
  projectId: string;
  projectName?: string;
  wbsNodeId?: string;
  unitId?: string;
  entryDate: string;
  costCategory: string;
  description: string;
  debitAmount: number;
  creditAmount: number;
  runningBalance: number;
  sourceDocumentType?: string;
  isReleasedToCogs: boolean;
}

export interface UnitCostAllocationDto {
  id: string;
  unitId: string;
  unitNumber: string;
  projectId: string;
  asOfDate: string;
  landCost: number;
  constructionCost: number;
  infrastructureCost: number;
  approvalCost: number;
  financeCost: number;
  marketingCost: number;
  commissionCost: number;
  overheadCost: number;
  totalAllocatedCost: number;
  area: AreaDto;
  costPerSqFt: number;
  basis: CostAllocationBasis;
  currencyCode: string;
}

export interface UnitProfitabilityDto {
  unitId: string;
  unitNumber: string;
  blockName?: string;
  projectId: string;
  projectName: string;
  subType?: PropertySubType;
  bookingId?: string;
  asOfDate: string;
  listPrice: number;
  discountGiven: number;
  netRealisation: number;
  surchargeEarned: number;
  totalRevenue: number;
  allocatedCost: number;
  directCost: number;
  totalCost: number;
  grossMargin: number;
  marginPercent: number;
  area: AreaDto;
  realisationPerSqFt: number;
  costPerSqFt: number;
  marginPerSqFt: number;
  currencyCode: string;
}

export interface ProjectPnlDto {
  projectId: string;
  projectName: string;
  asOfDate: string;
  currencyCode: string;
  recognitionBasis: RecognitionBasis;
  totalSalesValue: number;
  revenueRecognised: number;
  revenueDeferred: number;
  collectionsToDate: number;
  costIncurred: number;
  costRecognised: number;
  wipBalance: number;
  forecastTotalCost: number;
  grossMargin: number;
  marginPercent: number;
  forecastMargin: number;
  escrowBalance: number;
  freeCashBalance: number;
  loanOutstanding: number;
  landownerLiability: number;
  unitsTotal: number;
  unitsSold: number;
  unitsAvailable: number;
  absorptionPercent: number;
  physicalProgressPercent: number;
  costBreakdown: ProjectBudgetLineDto[];
  revenueTrend: TrendPointDto[];
}

export interface TaxProfileDto {
  id: string;
  name: string;
  projectId?: string;
  projectName?: string;
  salesTaxPercent: number;
  rentTaxPercent: number;
  serviceTaxPercent: number;
  stampDutyPercent: number;
  registrationFeePercent: number;
  withholdingOnCommissionPercent: number;
  withholdingOnRentPercent: number;
  withholdingOnContractorPercent: number;
  withholdingOnPropertySalePercent: number;
  nonFilerUpliftPercent: number;
  effectiveFrom: string;
  effectiveTo?: string;
  isActive: boolean;
}

export interface WithholdingRecordDto {
  id: string;
  reference: string;
  kind: WithholdingKind;
  partyId: string;
  partyName: string;
  taxNumber?: string;
  isFiler: boolean;
  deductedOn: string;
  grossAmount: number;
  rate: number;
  withheldAmount: number;
  currencyCode: string;
  isDeposited: boolean;
  depositedOn?: string;
  challanNumber?: string;
  certificateIssued: boolean;
  certificateUrl?: string;
  returnPeriod?: string;
}

export interface LicenceRecordDto {
  id: string;
  reference: string;
  licenceType: string;
  licenceNumber: string;
  authority?: string;
  officeName?: string;
  agentName?: string;
  issuedOn: string;
  expiresOn: string;
  daysToExpiry: number;
  isExpired: boolean;
  isExpiringSoon: boolean;
  renewalFee: number;
  isMandatoryToTrade: boolean;
  documentUrl?: string;
  isCurrent: boolean;
}

export interface ComplianceCalendarEntryDto {
  id: string;
  title: string;
  category: string;
  projectId?: string;
  projectName?: string;
  propertyId?: string;
  addressOneLine?: string;
  societyName?: string;
  dueDate: string;
  daysToDue: number;
  recurrence?: string;
  ownerName?: string;
  severity: AlertSeverity;
  alertSent: boolean;
  isCompleted: boolean;
  completedOn?: string;
  evidenceUrl?: string;
  isOverdue: boolean;
  penaltyIfMissed?: number;
  route?: string;
}

export interface RegulatoryFilingDto {
  id: string;
  reference: string;
  filingType: string;
  projectId?: string;
  projectName?: string;
  authority?: string;
  periodFrom: string;
  periodTo: string;
  dueOn: string;
  filedOn?: string;
  status: string;
  version: number;
  acknowledgementNumber?: string;
  preparedByName?: string;
  documentUrl?: string;
  queryFromAuthority?: string;
  lateFilingPenalty?: number;
  isOverdue: boolean;
  daysToDue: number;
}

export interface QuarterlyProgressReportDto {
  id: string;
  reference: string;
  projectId: string;
  projectName: string;
  year: number;
  quarter: number;
  periodFrom: string;
  periodTo: string;
  totalUnits: number;
  unitsBooked: number;
  unitsBookedThisQuarter: number;
  areaBooked: AreaDto;
  totalBookingValue: number;
  amountCollected: number;
  amountCollectedThisQuarter: number;
  amountDepositedToEscrow: number;
  amountWithdrawnFromEscrow: number;
  escrowBalance: number;
  amountSpentOnConstruction: number;
  amountSpentOnLand: number;
  currencyCode: string;
  physicalProgressPercent: number;
  financialProgressPercent: number;
  originalCompletionDate?: string;
  revisedCompletionDate?: string;
  delayReason?: string;
  approvalsObtained: number;
  approvalsPending: number;
  certifiedByEngineerName?: string;
  architectCertificateUrl?: string;
  caCertificateUrl?: string;
  isFiled: boolean;
  documentUrl?: string;
  buildings: QprLineDto[];
}

export interface QprLineDto {
  id: string;
  projectNodeId?: string;
  buildingName: string;
  unitCount: number;
  bookedCount: number;
  progressPercent: number;
  currentStage?: string;
  expectedCompletion?: string;
  sortOrder: number;
}

export interface DocumentTemplateDto {
  id: string;
  name: string;
  code?: string;
  documentType: string;
  projectId?: string;
  projectName?: string;
  languageCode: string;
  isRightToLeft: boolean;
  currentVersion: number;
  isActive: boolean;
  isDefault: boolean;
  letterheadUrl?: string;
  includeQrVerification: boolean;
  includeAmountInWords: boolean;
  paperSize?: string;
  usageCount: number;
  versions: TemplateVersionDto[];
}

export interface TemplateVersionDto {
  id: string;
  version: number;
  body: string;
  headerHtml?: string;
  footerHtml?: string;
  styleCss?: string;
  mergeFields: string[];
  effectiveFrom: string;
  effectiveTo?: string;
  isPublished: boolean;
  changeNote?: string;
  createdByName?: string;
}

export interface ClauseLibraryItemDto {
  id: string;
  clauseKey: string;
  heading: string;
  body: string;
  category: string;
  languageCode: string;
  version: number;
  isMandatory: boolean;
  isNegotiable: boolean;
  projectId?: string;
  isActive: boolean;
  sortOrder: number;
}

export interface DocumentGenerationRequestDto {
  documentType: string;
  documentTemplateId?: string;
  entityId: string;
  languageCode: string;
  /** Extra merge values the caller supplies on top of what the server resolves. */
  overrides: Record<string, string>;
  sendImmediately: boolean;
  channels: NotificationChannel[];
}

export interface SignatureSessionDto {
  id: string;
  reference: string;
  generatedDocumentId?: string;
  documentType: string;
  documentTitle?: string;
  method: SignatureMethod;
  state: SignatureState;
  initiatedAt: string;
  initiatedByName?: string;
  expiresAt?: string;
  completedAt?: string;
  isSequential: boolean;
  signedDocumentUrl?: string;
  auditCertificateUrl?: string;
  declineReason?: string;
  signedCount: number;
  totalSigners: number;
  parties: SignaturePartyDto[];
}

export interface SignaturePartyDto {
  id?: string;
  partyId?: string;
  name: string;
  email?: string;
  phone?: string;
  role: string;
  signingOrder: number;
  state: SignatureState;
  sentAt?: string;
  viewedAt?: string;
  signedAt?: string;
  signatureImageUrl?: string;
  thumbImpressionUrl?: string;
  photoUrl?: string;
  otpVerified: boolean;
  declineReason?: string;
}

export interface PhysicalFileDto {
  id: string;
  fileNumber: string;
  bookingId?: string;
  bookingReference?: string;
  plotFileId?: string;
  unitId?: string;
  unitNumber?: string;
  partyName?: string;
  projectName?: string;
  state: PhysicalFileState;
  roomLocation?: string;
  rack?: string;
  cabinet?: string;
  shelf?: string;
  barcodeOrRfid?: string;
  issuedToName?: string;
  issuedOn?: string;
  dueBackOn?: string;
  isOverdue: boolean;
  documentCount: number;
  lastAuditedOn?: string;
  isMissing: boolean;
  note?: string;
  movements: PhysicalFileMovementDto[];
}

export interface PhysicalFileMovementDto {
  id: string;
  movement: string;
  occurredAt: string;
  fromName?: string;
  toName?: string;
  purpose?: string;
  dueBackOn?: string;
  recordedByName?: string;
  signatureUrl?: string;
  note?: string;
}

export interface LegalCaseDto {
  id: string;
  reference: string;
  caseNumber?: string;
  caseType: string;
  status: LegalCaseStatus;
  projectId?: string;
  projectName?: string;
  propertyId?: string;
  addressOneLine?: string;
  unitId?: string;
  unitNumber?: string;
  bookingId?: string;
  tenancyId?: string;
  subcontractId?: string;
  partyId?: string;
  partyName?: string;
  ourRole: string;
  opposingParty?: string;
  court?: string;
  jurisdiction?: string;
  filedOn: string;
  nextHearingDate?: string;
  daysToHearing?: number;
  decidedOn?: string;
  claimAmount?: number;
  exposureAmount?: number;
  legalCostsIncurred: number;
  currencyCode: string;
  advocateName?: string;
  advocateContact?: string;
  ownerName?: string;
  blocksTransaction: boolean;
  outcome?: string;
  summary?: string;
  isClosed: boolean;
  hearings: LegalHearingDto[];
}

export interface LegalHearingDto {
  id: string;
  hearingDate: string;
  purpose?: string;
  attended: boolean;
  attendedByName?: string;
  outcome?: string;
  nextDate?: string;
  nextPurpose?: string;
  orderSummary?: string;
  orderDocumentUrl?: string;
  costIncurred?: number;
  note?: string;
}


/* ── ListingDtos ─────────────────────────────────────────────── */

export interface ListingListItemDto {
  id: string;
  reference: string;
  propertyId: string;
  propertyReference?: string;
  kind: ListingKind;
  status: ListingStatus;
  headline?: string;
  addressOneLine: string;
  heroImageUrl?: string;
  subType: PropertySubType;
  area?: AreaDto;
  bedrooms?: number;
  bathrooms?: number;
  askingPrice?: number;
  priceOnApplication: boolean;
  rentFrequency?: RentFrequency;
  currencyCode: string;
  listingAgentName?: string;
  agencyBasis?: AgencyBasis;
  listedOn?: string;
  expiresOn?: string;
  daysOnMarket?: number;
  viewCount: number;
  enquiryCount: number;
  viewingCount: number;
  offerCount: number;
  lastViewingAt?: string;
  /** Days since the last viewing at the current price. The stale-listing signal. */
  daysSinceLastViewing?: number;
  publishedPortalCount: number;
  failedPortalCount: number;
  isFeatured: boolean;
}

export interface ListingDetailDto extends ListingListItemDto {
  instructionId?: string;
  officeId?: string;
  minPrice?: number;
  maxPrice?: number;
  serviceChargeAmount?: number;
  availableFrom?: string;
  vacantPossession: boolean;
  tenantInSitu: boolean;
  noticeRequiredDays?: number;
  isChainFree: boolean;
  shortDescription?: string;
  longDescription?: string;
  keyFeatures: string[];
  energyRating?: string;
  councilTaxBand?: string;
  languageCode: string;
  regulatoryPermitNumber?: string;
  allowPortalPublish: boolean;
  allowWebsitePublish: boolean;
  publishedAt?: string;
  publishedByName?: string;
  withdrawnAt?: string;
  property?: PropertyDetailDto;
  instruction?: InstructionDto;
  media: PropertyMediaDto[];
  priceHistory: ListingPriceHistoryDto[];
  publications: PortalPublicationDto[];
  viewings: ViewingListItemDto[];
  offers: OfferListItemDto[];
  /** Media and compliance gaps that block publishing. Enforced before publish, not after a fine. */
  publishChecklist: ChecklistItemDto[];
  canPublish: boolean;
}

export interface ListingUpsertDto {
  id?: string;
  propertyId: string;
  instructionId?: string;
  kind: ListingKind;
  listingAgentId?: string;
  officeId?: string;
  askingPrice?: number;
  minPrice?: number;
  maxPrice?: number;
  priceOnApplication: boolean;
  rentFrequency?: RentFrequency;
  serviceChargeAmount?: number;
  currencyCode?: string;
  availableFrom?: string;
  vacantPossession: boolean;
  tenantInSitu: boolean;
  noticeRequiredDays?: number;
  isChainFree: boolean;
  headline?: string;
  shortDescription?: string;
  longDescription?: string;
  keyFeatures: string[];
  energyRating?: string;
  councilTaxBand?: string;
  languageCode: string;
  regulatoryPermitNumber?: string;
  listedOn?: string;
  expiresOn?: string;
  isFeatured: boolean;
  allowPortalPublish: boolean;
  allowWebsitePublish: boolean;
}

export interface ListingPriceHistoryDto {
  id: string;
  fromPrice?: number;
  toPrice: number;
  changePercent: number;
  changedOn: string;
  changedByName?: string;
  reason?: string;
  note?: string;
  viewingsAtPreviousPrice: number;
}

export interface ListingPriceChangeDto {
  listingId: string;
  newPrice: number;
  reasonCodeId?: string;
  note?: string;
  /** Tell everyone whose saved search now matches. The fastest re-viewing an agency gets. */
  notifyMatchedApplicants: boolean;
}

export interface InstructionDto {
  id: string;
  reference: string;
  propertyId: string;
  propertyReference?: string;
  addressOneLine: string;
  landlordId?: string;
  ownerPartyId?: string;
  ownerName?: string;
  agentName?: string;
  basis: AgencyBasis;
  kind: ListingKind;
  instructedOn: string;
  expiresOn?: string;
  noticePeriodDays: number;
  tailPeriodDays: number;
  feeBasis: FeeBasis;
  feePercent: number;
  feeFixedAmount: number;
  minimumFee: number;
  feePeriodsOfRent?: number;
  feeIncludesTax: boolean;
  taxPercent: number;
  withdrawalFee: number;
  marketingBudget: number;
  managementService?: ManagementService;
  documentUrl?: string;
  signedOn?: string;
  isActive: boolean;
  terminatedOn?: string;
  terminationReason?: string;
  /** Days until the instruction lapses. The renewal conversation an agency forgets to have. */
  daysToExpiry?: number;
  listingCount: number;
  estimatedFee?: number;
}

export interface InstructionUpsertDto {
  id?: string;
  propertyId: string;
  landlordId?: string;
  ownerPartyId?: string;
  officeId?: string;
  agentId?: string;
  basis: AgencyBasis;
  kind: ListingKind;
  instructedOn: string;
  expiresOn?: string;
  noticePeriodDays: number;
  tailPeriodDays: number;
  feeBasis: FeeBasis;
  feePercent: number;
  feeFixedAmount: number;
  minimumFee: number;
  feePeriodsOfRent?: number;
  feeIncludesTax: boolean;
  taxPercent: number;
  withdrawalFee: number;
  marketingBudget: number;
  managementService?: ManagementService;
  documentUrl?: string;
  signedOn?: string;
}

export interface PortalChannelDto {
  id: string;
  name: string;
  code: string;
  feedFormat: string;
  feedUrl?: string;
  countryCode?: string;
  isActive: boolean;
  listingQuota: number;
  featuredQuota: number;
  currentListingCount: number;
  remainingSlots: number;
  /** Set when the firm is at or over its plan. Told before the breach, not after. */
  quotaExceeded: boolean;
  monthlyCost: number;
  contractExpiresOn?: string;
  minPhotoCount: number;
  maxPhotoCount: number;
  minPhotoWidthPx: number;
  supportsFloorPlan: boolean;
  supportsVirtualTour: boolean;
  refreshIntervalMinutes: number;
  impressions: number;
  clicks: number;
  leads: number;
  bookings: number;
  costPerLead?: number;
  failedCount: number;
}

export interface PortalPublicationDto {
  id: string;
  listingId: string;
  portalChannelId: string;
  portalName: string;
  state: PortalPublishState;
  portalListingId?: string;
  portalUrl?: string;
  publishedAt?: string;
  lastPushedAt?: string;
  isFeatured: boolean;
  lastError?: string;
  failureCount: number;
  impressions: number;
  clicks: number;
  leads: number;
}

export interface PortalPublishRequestDto {
  listingIds: string[];
  portalChannelIds: string[];
  /** "publish", "update", "withdraw", "refresh". */
  operation: string;
  asFeatured: boolean;
}

export interface PortalPublishResultDto {
  attempted: number;
  succeeded: number;
  failed: number;
  skipped: number;
  log: PortalPublishLogDto[];
}

export interface PortalPublishLogDto {
  listingId: string;
  listingReference: string;
  portalName: string;
  operation: string;
  succeeded: boolean;
  message?: string;
  attemptedAt: string;
  durationMs: number;
}

export interface PortalMappingDto {
  id?: string;
  portalChannelId: string;
  mappingKind: string;
  localValue: string;
  portalValue: string;
  portalLocationId?: string;
}

export interface ViewingListItemDto {
  id: string;
  reference: string;
  scheduledAt: string;
  durationMinutes: number;
  travelMinutes: number;
  status: ViewingStatus;
  agentName: string;
  applicantName?: string;
  applicantPhone?: string;
  enquiryId?: string;
  partyId?: string;
  propertyCount: number;
  propertySummary: string;
  firstAddress?: string;
  firstLatitude?: number;
  firstLongitude?: number;
  access: AccessArrangement;
  reminderSent: boolean;
  vendorNotified: boolean;
  feedbackReceived: boolean;
  interest?: InterestLevel;
}

export interface ViewingDetailDto extends ViewingListItemDto {
  accessNote?: string;
  keySetId?: string;
  keyLabel?: string;
  confirmedAt?: string;
  startedAt?: string;
  endedAt?: string;
  cancelReason?: string;
  cancelNote?: string;
  routeGeoJson?: string;
  properties: ViewingPropertyDto[];
  attendees: ViewingAttendeeDto[];
  feedback: ViewingFeedbackDto[];
}

export interface ViewingPropertyDto {
  id: string;
  propertyId: string;
  listingId?: string;
  unitId?: string;
  reference: string;
  addressOneLine: string;
  heroImageUrl?: string;
  askingPrice?: number;
  latitude?: number;
  longitude?: number;
  sequenceNumber: number;
  arrivedAt?: string;
  leftAt?: string;
  wasSeen: boolean;
  notSeenReason?: string;
  feedback?: ViewingFeedbackDto;
}

export interface ViewingAttendeeDto {
  id?: string;
  partyId?: string;
  name?: string;
  phone?: string;
  role: string;
  attended: boolean;
  isDecisionMaker: boolean;
}

export interface ViewingUpsertDto {
  id?: string;
  enquiryId?: string;
  partyId?: string;
  agentId: string;
  officeId?: string;
  scheduledAt: string;
  durationMinutes: number;
  travelMinutes: number;
  access: AccessArrangement;
  accessNote?: string;
  keySetId?: string;
  propertyIds: string[];
  attendees: ViewingAttendeeDto[];
  sendConfirmation: boolean;
  notifyVendor: boolean;
  /** Serve the statutory notice on a sitting tenant as part of booking the slot. */
  serveAccessNotice: boolean;
}

export interface ViewingFeedbackDto {
  id?: string;
  viewingId: string;
  viewingPropertyId?: string;
  propertyId?: string;
  propertyReference?: string;
  interest: InterestLevel;
  priceOpinion?: string;
  wouldOfferAmount?: number;
  liked?: string;
  disliked?: string;
  objectionReasonCodeId?: string;
  objectionLabel?: string;
  nextStep?: string;
  capturedAt: string;
  capturedByName?: string;
  sharedWithVendor: boolean;
  sharedAt?: string;
}

export interface SiteVisitListItemDto {
  id: string;
  reference: string;
  projectId: string;
  projectName: string;
  scheduledAt: string;
  status: ViewingStatus;
  isRevisit: boolean;
  visitNumber: number;
  guestCount: number;
  visitorName?: string;
  visitorPhone?: string;
  enquiryId?: string;
  partyId?: string;
  partnerName?: string;
  salesExecutiveName?: string;
  transport?: TransportArrangement;
  pickupAddress?: string;
  pickupAt?: string;
  driverName?: string;
  vehicleNumber?: string;
  arrivedAt?: string;
  costSheetIssued: boolean;
  resultingBookingId?: string;
  interest?: InterestLevel;
  reminderSent: boolean;
}

export interface SiteVisitDetailDto extends SiteVisitListItemDto {
  leftAt?: string;
  unitsShown?: string;
  shownUnitId?: string;
  shownUnitNumber?: string;
  brochureIssued: boolean;
  noShowReason?: string;
  feedback?: SiteVisitFeedbackDto;
}

export interface SiteVisitUpsertDto {
  id?: string;
  projectId: string;
  enquiryId?: string;
  partyId?: string;
  channelPartnerId?: string;
  salesExecutiveId?: string;
  scheduledAt: string;
  guestCount: number;
  isRevisit: boolean;
  transport: TransportArrangement;
  pickupAddress?: string;
  pickupAt?: string;
  pickupLatitude?: number;
  pickupLongitude?: number;
  driverUserId?: string;
  driverName?: string;
  driverPhone?: string;
  vehicleNumber?: string;
  transportCost?: number;
  sendConfirmation: boolean;
}

export interface SiteVisitFeedbackDto {
  id?: string;
  siteVisitId: string;
  interest: InterestLevel;
  priceOpinion?: string;
  preferredUnitType?: string;
  budgetIndicated?: number;
  liked?: string;
  objectionReasonCodeId?: string;
  objection?: string;
  nextStep?: string;
  nextStepDate?: string;
  satisfactionRating?: number;
  capturedAt: string;
  capturedByName?: string;
}

/** The diary for one agent or team on one day, with the travel gaps made visible. */
export interface DiaryDayDto {
  date: string;
  agentId?: string;
  agentName?: string;
  slots: DiarySlotDto[];
  viewingCount: number;
  siteVisitCount: number;
  conflictCount: number;
  routeGeoJson?: string;
  totalTravelMinutes: number;
}

export interface DiarySlotDto {
  id: string;
  /** "viewing", "sitevisit", "inspection", "workorder", "appointment", "block". */
  kind: string;
  startsAt: string;
  endsAt: string;
  title: string;
  subtitle?: string;
  address?: string;
  contactName?: string;
  contactPhone?: string;
  tone?: string;
  route?: string;
  /** Overlaps another slot, or the travel gap before it is impossible. */
  hasConflict: boolean;
  conflictReason?: string;
}

export interface KeySetDto {
  id: string;
  propertyId: string;
  propertyReference: string;
  addressOneLine: string;
  label: string;
  tagNumber?: string;
  keyCount: number;
  keySafeLocation?: string;
  isOut: boolean;
  currentHolderName?: string;
  outSince?: string;
  dueBackAt?: string;
  isOverdue: boolean;
  isLost: boolean;
  description?: string;
}

export interface KeyMovementDto {
  id: string;
  movement: string;
  occurredAt: string;
  holderName?: string;
  dueBackAt?: string;
  note?: string;
  viewingId?: string;
  workOrderId?: string;
}

export interface CampaignDto {
  id: string;
  name: string;
  code: string;
  channel: string;
  projectId?: string;
  projectName?: string;
  startsOn: string;
  endsOn?: string;
  budget: number;
  actualSpend: number;
  landingPageUrl?: string;
  trackingCode?: string;
  isActive: boolean;
  leadCount: number;
  visitCount: number;
  bookingCount: number;
  bookingValue: number;
  costPerLead?: number;
  costPerVisit?: number;
  costPerBooking?: number;
  returnOnAdSpend?: number;
}

export interface MarketingEventDto {
  id: string;
  name: string;
  eventType?: string;
  projectId?: string;
  projectName?: string;
  startsAt: string;
  endsAt: string;
  venue?: string;
  budget: number;
  actualSpend: number;
  registeredCount: number;
  attendedCount: number;
  walkInCount: number;
  leadCount: number;
  bookingCount: number;
  attendanceRate?: number;
}

export interface ContentAssetDto {
  id: string;
  name: string;
  assetType: string;
  projectId?: string;
  projectName?: string;
  url: string;
  thumbnailUrl?: string;
  version: number;
  validFrom?: string;
  expiresOn?: string;
  isExpired: boolean;
  isExternallyShareable: boolean;
  languageCode: string;
  downloadCount: number;
  isCurrent: boolean;
}


/* ── MoneyDtos ─────────────────────────────────────────────── */

export interface PaymentPlanTemplateDto {
  id: string;
  projectId: string;
  projectName: string;
  name: string;
  code?: string;
  version: number;
  isActive: boolean;
  isDefault: boolean;
  effectiveFrom: string;
  effectiveTo?: string;
  surchargePolicyId?: string;
  surchargePolicyName?: string;
  dunningPolicyId?: string;
  earlyPaymentRebatePercentPerMonth: number;
  lumpSumDiscountPercent: number;
  lumpSumWindowDays: number;
  note?: string;
  /** Percentages across all lines. Must reach 100 or the template is unusable. */
  totalPercent: number;
  isBalanced: boolean;
  instalmentCount: number;
  durationMonths: number;
  usageCount: number;
  lines: PaymentPlanTemplateLineDto[];
}

export interface PaymentPlanTemplateLineDto {
  id?: string;
  kind: InstalmentKind;
  label: string;
  sortOrder: number;
  percent: number;
  fixedAmount: number;
  count: number;
  frequency: InstalmentFrequency;
  startOffsetDays: number;
  startOffsetMonths: number;
  projectMilestoneId?: string;
  milestoneName?: string;
  milestoneCode?: string;
  chargeKind?: ChargeKind;
  isTaxable: boolean;
  taxPercent: number;
}

/** A plan built by hand for one booking, when the template does not fit. */
export interface PaymentPlanCustomDto {
  name?: string;
  startDate: string;
  surchargePolicyId?: string;
  dunningPolicyId?: string;
  deviationReason?: string;
  lines: PaymentPlanTemplateLineDto[];
}

export interface PaymentPlanDto {
  id: string;
  bookingId: string;
  bookingReference?: string;
  reference: string;
  version: number;
  isCurrent: boolean;
  isCustom: boolean;
  isRestructure: boolean;
  revisionReason?: string;
  supersedesPlanId?: string;
  startDate: string;
  endDate?: string;
  totalAmount: number;
  totalDemanded: number;
  totalPaid: number;
  outstanding: number;
  currencyCode: string;
  surchargePolicyName?: string;
  earlyPaymentRebateEarned: number;
  restructureFee: number;
  instalments: InstalmentDto[];
}

/** What a plan would look like before anything is written. Shown on the wizard's last step. */
export interface PaymentPlanPreviewDto {
  templateName?: string;
  startDate: string;
  endDate?: string;
  totalAmount: number;
  currencyCode: string;
  instalmentCount: number;
  durationMonths: number;
  monthlyAverage: number;
  downPayment: number;
  possessionBalance: number;
  earlyPaymentRebateAvailable: number;
  instalments: InstalmentDto[];
  /** Set when the plan departs from the template and will need approval. */
  isDeviation: boolean;
  deviationNote?: string;
}

export interface InstalmentDto {
  id: string;
  sequenceNumber: number;
  kind: InstalmentKind;
  label: string;
  dueDate?: string;
  projectMilestoneId?: string;
  milestoneName?: string;
  milestoneStatus?: MilestoneStatus;
  amount: number;
  taxAmount: number;
  totalAmount: number;
  paidAmount: number;
  waivedAmount: number;
  balance: number;
  status: InstalmentStatus;
  surchargeAccrued: number;
  surchargePaid: number;
  surchargeWaived: number;
  surchargeOutstanding: number;
  daysOverdue: number;
  demandId?: string;
  demandNumber?: string;
  firstPaidOn?: string;
  settledOn?: string;
  isOnHold: boolean;
  holdReason?: string;
  chargeKind?: ChargeKind;
}

/** Rebuilding a defaulter's remaining schedule over a longer horizon. */
export interface PlanRestructureDto {
  bookingId: string;
  newStartDate: string;
  newInstalmentCount: number;
  frequency: InstalmentFrequency;
  restructureFee: number;
  /** Roll accrued surcharge into the new schedule rather than demanding it up front. */
  capitaliseSurcharge: boolean;
  downPaymentRequired?: number;
  reasonCodeId?: string;
  note?: string;
  dryRun: boolean;
}

export interface SurchargePolicyDto {
  id: string;
  name: string;
  projectId?: string;
  projectName?: string;
  basis: SurchargeBasis;
  rate: number;
  flatAmount: number;
  graceDays: number;
  isCompounding: boolean;
  capPercent: number;
  capAmount: number;
  stopAfterDays?: number;
  waiverRequiresApproval: boolean;
  isActive: boolean;
  /** Worked example on 100,000 overdue for 30 days, so the policy can be sanity-checked. */
  exampleOn100kFor30Days: number;
}

export interface SurchargeWaiverDto {
  id: string;
  reference: string;
  bookingId: string;
  bookingReference: string;
  applicantName: string;
  instalmentId?: string;
  instalmentLabel?: string;
  requestedAmount: number;
  approvedAmount: number;
  requestedByName: string;
  requestedOn: string;
  reasonLabel: string;
  note?: string;
  outcome: ApprovalOutcome;
  approvedByName?: string;
  approvedAt?: string;
}

export interface SurchargeWaiverRequestDto {
  bookingId: string;
  instalmentId?: string;
  amount: number;
  reasonCodeId: string;
  note?: string;
}

export interface DemandListItemDto {
  id: string;
  demandNumber: string;
  bookingId: string;
  bookingReference: string;
  applicantName: string;
  applicantPhone?: string;
  unitNumber?: string;
  projectName: string;
  status: DemandStatus;
  issuedOn: string;
  dueDate: string;
  daysOverdue: number;
  principalAmount: number;
  surchargeAmount: number;
  arrearsAmount: number;
  taxAmount: number;
  totalAmount: number;
  paidAmount: number;
  balance: number;
  currencyCode: string;
  isReminder: boolean;
  reminderNumber: number;
  sentAt?: string;
  emailSent: boolean;
  smsSent: boolean;
  whatsAppSent: boolean;
  postSent: boolean;
  documentUrl?: string;
}

export interface DemandDetailDto extends DemandListItemDto {
  demandBatchId?: string;
  mailingAddress?: string;
  acknowledgedAt?: string;
  lines: DemandLineDto[];
}

export interface DemandLineDto {
  id: string;
  instalmentId?: string;
  description: string;
  dueDate?: string;
  amount: number;
  taxAmount: number;
  kind: LedgerEntryKind;
  sortOrder: number;
}

/** What the demand run is asked to do. Always previewable before it writes anything. */
export interface DemandRunRequestDto {
  projectId?: string;
  projectNodeId?: string;
  projectMilestoneId?: string;
  dueDateFrom?: string;
  dueDateTo?: string;
  /** "Scheduled", "Milestone", "Manual", "Reminder". */
  runType: string;
  isDryRun: boolean;
  /** Bookings to leave out this run — a disputed file, a customer on a promise to pay. */
  excludeBookingIds: string[];
  sendImmediately: boolean;
  channels: NotificationChannel[];
  documentTemplateId?: string;
}

export interface DemandBatchDto {
  id: string;
  reference: string;
  projectName?: string;
  milestoneName?: string;
  runDate: string;
  dueDateFrom?: string;
  dueDateTo?: string;
  runType: string;
  isDryRun: boolean;
  candidateCount: number;
  generatedCount: number;
  skippedCount: number;
  failedCount: number;
  sentCount: number;
  totalAmount: number;
  startedAt: string;
  completedAt?: string;
  runByName?: string;
  errorSummary?: string;
  isCompleted: boolean;
  preview: DemandListItemDto[];
}

export interface ReceiptListItemDto {
  id: string;
  receiptNumber: string;
  status: ReceiptStatus;
  receivedOn: string;
  partyId: string;
  partyName: string;
  bookingId?: string;
  bookingReference?: string;
  tenancyId?: string;
  maintenanceBillId?: string;
  unitNumber?: string;
  projectName?: string;
  amount: number;
  allocatedAmount: number;
  unallocatedAmount: number;
  currencyCode: string;
  instrument: PaymentInstrument;
  bankName?: string;
  instrumentNumber?: string;
  instrumentDate?: string;
  chequeState?: ChequeState;
  transactionReference?: string;
  escrowAmount: number;
  freeAmount: number;
  isClientMoney: boolean;
  receivedByName?: string;
  isPrinted: boolean;
  narration?: string;
}

export interface ReceiptDetailDto extends ReceiptListItemDto {
  branchName?: string;
  cardBrand?: string;
  cardLastFour?: string;
  authorisationCode?: string;
  exchangeRate: number;
  postedAt?: string;
  postedByName?: string;
  reversedAt?: string;
  reversalReason?: string;
  documentUrl?: string;
  cheque?: ChequeRecordDto;
  allocations: ReceiptAllocationDto[];
}

export interface ReceiptAllocationDto {
  id: string;
  instalmentId?: string;
  rentChargeId?: string;
  maintenanceBillId?: string;
  description: string;
  dueDate?: string;
  appliedTo: LedgerEntryKind;
  amount: number;
  allocatedOn: string;
  appliedRule: AllocationOrder;
  isManualOverride: boolean;
  overrideReason?: string;
  isReversed: boolean;
  sortOrder: number;
}

export interface ReceiptCreateDto {
  partyId?: string;
  bookingId?: string;
  tenancyId?: string;
  maintenanceBillId?: string;
  serviceChargeInvoiceId?: string;
  dealId?: string;
  clientBuildContractId?: string;
  projectId?: string;
  officeId?: string;
  receivedOn: string;
  amount: number;
  currencyCode?: string;
  exchangeRate: number;
  instrument: PaymentInstrument;
  bankName?: string;
  branchName?: string;
  instrumentNumber?: string;
  instrumentDate?: string;
  transactionReference?: string;
  bankAccountId?: string;
  cardBrand?: string;
  cardLastFour?: string;
  authorisationCode?: string;
  /** Post-dated. Sits on the maturity calendar rather than clearing today. */
  isPostDated: boolean;
  narration?: string;
  /** Leave empty to let the allocation engine decide; supply to override it. */
  manualAllocations: ManualAllocationDto[];
  allocationOverrideReason?: string;
  printReceipt: boolean;
}

export interface ManualAllocationDto {
  instalmentId?: string;
  rentChargeId?: string;
  maintenanceBillId?: string;
  appliedTo: LedgerEntryKind;
  amount: number;
}

/** What the allocation engine would do, shown before the cashier commits. */
export interface AllocationPreviewDto {
  amount: number;
  rule: AllocationOrder;
  allocations: ReceiptAllocationDto[];
  unallocated: number;
  escrowPortion: number;
  freePortion: number;
  surchargeCleared: number;
  principalCleared: number;
  newOutstanding: number;
  newNextDueDate?: string;
  newCollectionPercent: number;
  /** Commission that becomes payable because collection crossed a release threshold. */
  commissionReleased: number;
}

export interface ChequeRecordDto {
  id: string;
  partyId: string;
  partyName: string;
  bookingId?: string;
  bookingReference?: string;
  tenancyId?: string;
  receiptId?: string;
  receiptNumber?: string;
  chequeNumber: string;
  bankName?: string;
  branchName?: string;
  amount: number;
  currencyCode: string;
  chequeDate: string;
  receivedOn: string;
  state: ChequeState;
  isPostDated: boolean;
  daysToMaturity?: number;
  depositedOn?: string;
  clearedOn?: string;
  bouncedOn?: string;
  bounceReason?: string;
  bounceCharge: number;
  bounceChargeRecovered: boolean;
  customerNotifiedOfBounce: boolean;
  returnedOn?: string;
  replacementChequeId?: string;
  imageUrl?: string;
  note?: string;
}

export interface ChequeStateChangeDto {
  chequeRecordId: string;
  newState: ChequeState;
  onDate: string;
  bankAccountId?: string;
  bounceReason?: string;
  bounceCharge?: number;
  notifyCustomer: boolean;
  note?: string;
}

export interface CustomerLedgerEntryDto {
  id: string;
  entryDate: string;
  kind: LedgerEntryKind;
  description: string;
  debitAmount: number;
  creditAmount: number;
  runningBalance: number;
  currencyCode: string;
  documentNumber?: string;
  sourceDemandId?: string;
  sourceReceiptId?: string;
  isReversal: boolean;
}

/** The customer-facing statement of account, ready to render or print. */
export interface StatementOfAccountDto {
  bookingId: string;
  bookingReference: string;
  applicantName: string;
  fatherOrGuardianName?: string;
  unitNumber?: string;
  projectName: string;
  area?: AreaDto;
  currencyCode: string;
  statementDate: string;
  periodFrom?: string;
  periodTo?: string;
  totalConsideration: number;
  totalDemanded: number;
  totalPaid: number;
  surchargeAccrued: number;
  surchargeWaived: number;
  outstanding: number;
  overdueAmount: number;
  collectionPercent: number;
  outstandingInWords: string;
  nextDueDate?: string;
  nextDueAmount: number;
  schedule: InstalmentDto[];
  ledger: CustomerLedgerEntryDto[];
  ageing: AgeingBucketsDto;
}

export interface AgeingBucketsDto {
  current: number;
  days1To30: number;
  days31To60: number;
  days61To90: number;
  days90Plus: number;
  surchargeOutstanding: number;
  total: number;
}

/**
 * One row on the collection worklist. Sorted by recoverable amount rather than alphabetically,
 * because a collector's afternoon is finite.
 */
export interface CollectionWorklistItemDto {
  bookingId: string;
  bookingReference: string;
  partyId: string;
  customerName: string;
  phone?: string;
  hasWhatsApp: boolean;
  unitNumber?: string;
  projectName: string;
  overdueAmount: number;
  surchargeAmount: number;
  totalOutstanding: number;
  currencyCode: string;
  daysOverdue: number;
  ageingBucket: string;
  dunningCaseId?: string;
  dunningStep: number;
  dunningStepName?: string;
  nextStepDueAt?: string;
  lastContactedAt?: string;
  lastOutcome?: string;
  activePromiseId?: string;
  promisedDate?: string;
  promisedAmount?: number;
  promiseBroken: boolean;
  assignedToName?: string;
  chequeBounceCount: number;
  isUnderLitigation: boolean;
  noticesServed: number;
}

export interface CollectionWorklistDto {
  items: CollectionWorklistItemDto[];
  totalCount: number;
  totalOverdue: number;
  totalSurcharge: number;
  ageing: AgeingBucketsDto;
  promisesDueToday: number;
  brokenPromises: number;
  collectedToday: number;
  collectedThisMonth: number;
  demandedThisMonth: number;
  efficiencyPercent: number;
}

export interface PromiseToPayDto {
  id: string;
  bookingId: string;
  bookingReference?: string;
  tenancyId?: string;
  partyId: string;
  partyName: string;
  promisedAmount: number;
  promisedDate: string;
  madeAt: string;
  takenByName: string;
  takenVia: NotificationChannel;
  state: PromiseState;
  paidAmount: number;
  settledOn?: string;
  suspendsDunning: boolean;
  isDueToday: boolean;
  isOverdue: boolean;
  note?: string;
}

export interface PromiseToPayCreateDto {
  bookingId?: string;
  tenancyId?: string;
  promisedAmount: number;
  promisedDate: string;
  takenVia: NotificationChannel;
  suspendsDunning: boolean;
  note?: string;
}

export interface DunningPolicyDto {
  id: string;
  name: string;
  projectId?: string;
  projectName?: string;
  appliesTo: string;
  isActive: boolean;
  isDefault: boolean;
  minimumOverdueAmount: number;
  stepCount: number;
  activeCaseCount: number;
  steps: DunningStepDto[];
}

export interface DunningStepDto {
  id?: string;
  stepNumber: number;
  name: string;
  daysAfterDue: number;
  action: DunningAction;
  channel: NotificationChannel;
  messageTemplateId?: string;
  messageTemplateName?: string;
  documentTemplateId?: string;
  assignToRole?: string;
  feeAmount?: number;
  requiresApproval: boolean;
  stopsOnPromise: boolean;
}

export interface DunningCaseDto {
  id: string;
  reference: string;
  partyId: string;
  partyName: string;
  bookingId?: string;
  bookingReference?: string;
  tenancyId?: string;
  policyName: string;
  openedOn: string;
  currentStep: number;
  currentStepName?: string;
  nextStepDueAt?: string;
  overdueAmount: number;
  surchargeAmount: number;
  daysOverdue: number;
  assignedToName?: string;
  lastContactedAt?: string;
  isSuspended: boolean;
  suspensionReason?: string;
  isClosed: boolean;
  outcome?: string;
  events: DunningEventDto[];
}

export interface DunningEventDto {
  id: string;
  stepNumber: number;
  action: DunningAction;
  channel?: NotificationChannel;
  occurredAt: string;
  succeeded: boolean;
  failureReason?: string;
  amountAtEvent?: number;
  note?: string;
  legalNoticeId?: string;
}

export interface LegalNoticeDto {
  id: string;
  noticeNumber: string;
  noticeType: string;
  partyId: string;
  partyName: string;
  bookingId?: string;
  bookingReference?: string;
  tenancyId?: string;
  issuedOn: string;
  complyByDate?: string;
  amountDemanded: number;
  documentUrl?: string;
  servedOn?: string;
  serviceMethod?: string;
  serviceReference?: string;
  serviceEvidenceUrl?: string;
  isAcknowledged: boolean;
  isComplied: boolean;
  isWithdrawn: boolean;
  isOverdue: boolean;
  issuedByName?: string;
}

export interface WriteOffDto {
  id: string;
  reference: string;
  partyId: string;
  partyName: string;
  bookingId?: string;
  bookingReference?: string;
  tenancyId?: string;
  reasonCodeId?: string;
  principalAmount: number;
  surchargeAmount: number;
  totalAmount: number;
  writeOffDate: string;
  reasonLabel: string;
  note?: string;
  requestedByName: string;
  outcome: ApprovalOutcome;
  isProvisionOnly: boolean;
}


/* ── ProjectDtos ─────────────────────────────────────────────── */

export interface ProjectListItemDto {
  id: string;
  name: string;
  code?: string;
  kind: ProjectKind;
  status: ProjectStatus;
  city?: string;
  areaName?: string;
  heroImageUrl?: string;
  currencyCode: string;
  totalUnits: number;
  unitsAvailable: number;
  unitsBooked: number;
  unitsSold: number;
  absorptionPercent: number;
  totalSalesValue: number;
  totalCollected: number;
  outstanding: number;
  physicalProgressPercent: number;
  promisedPossessionDate?: string;
  forecastPossessionDate?: string;
  /** Forecast beyond the promise. The number a board actually asks about. */
  slipDays?: number;
  hasJointVenture: boolean;
  escrowBalance?: number;
}

export interface ProjectDetailDto extends ProjectListItemDto {
  addressLine?: string;
  latitude?: number;
  longitude?: number;
  geoAreaId?: string;
  officeId?: string;
  launchDate?: string;
  bookingOpenDate?: string;
  constructionStartDate?: string;
  plannedCompletionDate?: string;
  actualCompletionDate?: string;
  handoverToSocietyDate?: string;
  areaStatement: AreaStatementDto;
  totalBudget: number;
  escrowPercent?: number;
  recognitionBasis: RecognitionBasis;
  recognitionRationale?: string;
  costAllocationBasis: CostAllocationBasis;
  defaultPaymentPlanTemplateId?: string;
  defaultPaymentPlanName?: string;
  holdHours: number;
  transferFeePerSqFt: number;
  transferFeeFlat: number;
  registrationNumber?: string;
  registrationValidUntil?: string;
  regulatorName?: string;
  tagline?: string;
  longDescription?: string;
  uniqueSellingPoints?: string;
  locationAdvantages?: string;
  brochureUrl?: string;
  projectManagerName?: string;
  salesHeadName?: string;
  structure: ProjectNodeDto[];
  milestones: ProjectMilestoneDto[];
  team: ProjectTeamMemberDto[];
  priceLists: LookupDto[];
  sitePlans: LookupDto[];
  approvals: ApprovalRecordDto[];
}

export interface AreaStatementDto {
  totalLandArea: AreaDto;
  saleableArea: AreaDto;
  commonArea: AreaDto;
  roadsArea: AreaDto;
  parksArea: AreaDto;
  amenitiesArea: AreaDto;
  commercialReserve: AreaDto;
  utilitiesArea: AreaDto;
  saleablePercent: number;
  /** Set when the parts do not sum to the whole — a regulator-facing error. */
  unaccountedSqFt?: number;
}

export interface ProjectUpsertDto {
  id?: string;
  name: string;
  code?: string;
  kind: ProjectKind;
  status: ProjectStatus;
  officeId?: string;
  geoAreaId?: string;
  addressLine?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  currencyCode?: string;
  launchDate?: string;
  bookingOpenDate?: string;
  constructionStartDate?: string;
  plannedCompletionDate?: string;
  promisedPossessionDate?: string;
  forecastPossessionDate?: string;
  inputAreaUnit: AreaUnit;
  totalLandArea: number;
  saleableArea: number;
  commonArea: number;
  roadsArea: number;
  parksArea: number;
  amenitiesArea: number;
  commercialReserve: number;
  utilitiesArea: number;
  totalBudget: number;
  escrowPercent?: number;
  recognitionBasis: RecognitionBasis;
  recognitionRationale?: string;
  costAllocationBasis: CostAllocationBasis;
  defaultPaymentPlanTemplateId?: string;
  defaultSurchargePolicyId?: string;
  defaultDunningPolicyId?: string;
  defaultDeductionPolicyId?: string;
  holdHours: number;
  transferFeePerSqFt: number;
  transferFeeFlat: number;
  registrationNumber?: string;
  registrationValidUntil?: string;
  regulatorName?: string;
  tagline?: string;
  longDescription?: string;
  uniqueSellingPoints?: string;
  locationAdvantages?: string;
  heroImageUrl?: string;
  brochureUrl?: string;
  projectManagerUserId?: string;
  salesHeadUserId?: string;
  landParcelIds: string[];
}

/** A node in the project tree, with its children inline so the whole structure is one call. */
export interface ProjectNodeDto {
  id: string;
  parentNodeId?: string;
  kind: ProjectNodeKind;
  name: string;
  code?: string;
  sortOrder: number;
  depth: number;
  floorNumber?: number;
  area?: AreaDto;
  plannedUnitCount: number;
  actualUnitCount: number;
  status: ProjectStatus;
  plannedCompletionDate?: string;
  progressPercent: number;
  floorPlanUrl?: string;
  sitePlanUrl?: string;
  unitsAvailable: number;
  unitsBooked: number;
  unitsSold: number;
  children: ProjectNodeDto[];
}

export interface ProjectNodeUpsertDto {
  id?: string;
  projectId: string;
  parentNodeId?: string;
  kind: ProjectNodeKind;
  name: string;
  code?: string;
  sortOrder: number;
  floorNumber?: number;
  area?: number;
  inputAreaUnit: AreaUnit;
  plannedUnitCount: number;
  status: ProjectStatus;
  plannedCompletionDate?: string;
  floorPlanUrl?: string;
  sitePlanUrl?: string;
}

/**
 * Bulk creation of a tower's units — "floors 1 to 20, four units per floor, named A to D".
 * A developer setting up a 400-unit project will not type four hundred rows, and a system that
 * makes them will lose to a spreadsheet.
 */
export interface UnitGenerationDto {
  projectId: string;
  projectNodeId: string;
  fromFloor: number;
  toFloor: number;
  /** Floors to leave out — a services floor, a refuge floor, an unlucky number. */
  skipFloors: number[];
  /** Unit letters or numbers per floor: "A,B,C,D" or "01,02,03". */
  unitCodes: string[];
  /** "{floor}{code}" gives 12A; "{floor}-{code}" gives 12-A. */
  numberPattern: string;
  subType: PropertySubType;
  inputAreaUnit: AreaUnit;
  saleableArea: number;
  carpetArea?: number;
  bedrooms?: number;
  bathrooms?: number;
  parkingBays?: number;
  facing?: Facing;
  /** Unit codes that sit on a corner, so the premium is applied as they are created. */
  cornerCodes: string[];
  priceListId?: string;
  createFloorNodes: boolean;
  /** Preview only. Nothing is written and the caller sees exactly what would be. */
  dryRun: boolean;
}

export interface UnitGenerationResultDto {
  wouldCreateCount: number;
  createdCount: number;
  skippedCount: number;
  conflicts: string[];
  preview: InventoryUnitDto[];
}

/**
 * One unit as the board draws it. Kept deliberately small — a board renders five thousand of
 * these and has to stay interactive, so anything the tile does not paint is not on this row.
 */
export interface InventoryUnitDto {
  id: string;
  propertyId: string;
  unitNumber: string;
  status: PropertyStatus;
  subType: PropertySubType;
  projectNodeId?: string;
  blockName?: string;
  floorNumber?: number;
  floorLabel?: string;
  stackIndex?: number;
  areaSqFt: number;
  areaDisplay: string;
  bedrooms?: number;
  facing?: Facing;
  isCorner: boolean;
  basePrice: number;
  totalPrice: number;
  ratePerSqFt: number;
  currencyCode: string;
  holdId?: string;
  heldForName?: string;
  heldByName?: string;
  holdExpiresAt?: string;
  holdMinutesRemaining?: number;
  bookingId?: string;
  buyerName?: string;
  collectionPercent?: number;
  blockReason?: BlockReason;
  isLandownerShare: boolean;
  hasLitigation: boolean;
  isMortgaged: boolean;
  sitePlanShapeId?: string;
  planPoints?: string;
}

/** What the board asks for. Every filter here is indexed. */
export interface InventoryQueryDto {
  projectId?: string;
  projectNodeId?: string;
  statuses?: PropertyStatus[];
  subTypes?: PropertySubType[];
  minArea?: number;
  maxArea?: number;
  inputAreaUnit?: AreaUnit;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  facing?: Facing;
  cornerOnly?: boolean;
  fromFloor?: number;
  toFloor?: number;
  search?: string;
  /** "plan", "stack" or "grid". Decides what the server bothers to compute. */
  viewMode?: string;
  sitePlanId?: string;
}

/** The board's payload: the units, the legend, and the totals its header shows. */
export interface InventoryBoardDto {
  projectId: string;
  projectName: string;
  currencyCode: string;
  displayAreaUnit: AreaUnit;
  units: InventoryUnitDto[];
  blocks: ProjectNodeDto[];
  statusCounts: BreakdownSliceDto[];
  totalUnits: number;
  totalValue: number;
  availableValue: number;
  soldValue: number;
  absorptionPercent: number;
  /** Populated for the plan view only. */
  sitePlan?: SitePlanDto;
  /** Distinct floors present, so the stack view can lay out rows without scanning. */
  floors: number[];
  stackCodes: string[];
}

export interface SitePlanDto {
  id: string;
  name: string;
  imageUrl: string;
  imageWidthPx: number;
  imageHeightPx: number;
  isDefault: boolean;
  shapes: SitePlanShapeDto[];
}

export interface SitePlanShapeDto {
  id: string;
  unitId?: string;
  label?: string;
  shapeType: string;
  points: string;
  labelX?: number;
  labelY?: number;
  isDecorative: boolean;
  fillOverride?: string;
  status?: PropertyStatus;
}

/** A request to hold a unit for a named lead, with its clock. */
export interface HoldRequestDto {
  unitId: string;
  enquiryId?: string;
  partyId?: string;
  contactName?: string;
  /** Above the role's limit this needs an approval, and the server says so rather than failing. */
  hours: number;
  note?: string;
}

export interface UnitHoldDto {
  id: string;
  unitId: string;
  unitNumber: string;
  projectName?: string;
  heldForName?: string;
  heldByName: string;
  heldAt: string;
  expiresAt: string;
  minutesRemaining: number;
  status: HoldStatus;
  note?: string;
  needsApproval: boolean;
}

export interface BlockRequestDto {
  unitId: string;
  reason: BlockReason;
  note?: string;
  expectedReleaseDate?: string;
}

export interface PriceListDto {
  id: string;
  projectId: string;
  name: string;
  version: number;
  effectiveFrom: string;
  effectiveTo?: string;
  isPublished: boolean;
  publishedAt?: string;
  publishedByName?: string;
  currencyCode: string;
  note?: string;
  lineCount: number;
  unitsAffected: number;
  lines: PriceListLineDto[];
}

export interface PriceListLineDto {
  id?: string;
  unitId?: string;
  unitNumber?: string;
  projectNodeId?: string;
  blockName?: string;
  subType?: PropertySubType;
  minAreaSqFt?: number;
  maxAreaSqFt?: number;
  minFloor?: number;
  maxFloor?: number;
  ratePerSqFt: number;
  flatPrice?: number;
  specificity: number;
}

export interface PremiumChargeDto {
  id?: string;
  projectId: string;
  kind: ChargeKind;
  label: string;
  basis: ChargeBasis;
  rate: number;
  appliesFromFloor?: number;
  appliesToCornerOnly: boolean;
  appliesToParkFacingOnly: boolean;
  appliesToSubType?: PropertySubType;
  isTaxable: boolean;
  taxPercent: number;
  isPartOfSalePrice: boolean;
  isOptional: boolean;
  isAutoApplied: boolean;
  sortOrder: number;
}

/**
 * The printable quotation a buyer signs: unit, area, base price, every premium, every charge,
 * taxes, total, and the payment schedule underneath it.
 */
export interface CostSheetDto {
  unitId: string;
  unitNumber: string;
  projectName: string;
  blockName?: string;
  floorNumber?: number;
  subType: PropertySubType;
  saleableArea: AreaDto;
  carpetArea?: AreaDto;
  ratePerSqFt: number;
  currencyCode: string;
  salePriceLines: CostSheetLineDto[];
  otherChargeLines: CostSheetLineDto[];
  basePrice: number;
  premiumTotal: number;
  discountAmount: number;
  netSalePrice: number;
  otherChargesTotal: number;
  taxTotal: number;
  grandTotal: number;
  /** Printed on every document, in the document's language. */
  amountInWords: string;
  paymentPlan?: PaymentPlanPreviewDto;
  generatedOn: string;
  validUntil?: string;
  preparedByName?: string;
  terms?: string;
}

export interface CostSheetLineDto {
  kind: ChargeKind;
  label: string;
  basis: ChargeBasis;
  rate: number;
  amount: number;
  taxPercent: number;
  taxAmount: number;
  isOptional: boolean;
  isAccepted: boolean;
  sortOrder: number;
}

export interface ProjectMilestoneDto {
  id: string;
  projectId: string;
  projectNodeId?: string;
  blockName?: string;
  name: string;
  code?: string;
  sortOrder: number;
  status: MilestoneStatus;
  plannedDate?: string;
  forecastDate?: string;
  reachedOn?: string;
  certifiedOn?: string;
  certifiedByName?: string;
  certificateUrl?: string;
  weightPercent: number;
  progressPercent: number;
  demandsRaised: boolean;
  /** How much money this certification would release across live payment plans. */
  linkedDemandValue: number;
  linkedInstalmentCount: number;
  slipDays?: number;
}

export interface ProjectTeamMemberDto {
  id: string;
  role: string;
  name?: string;
  userId?: string;
  partyId?: string;
  phone?: string;
  email?: string;
  fromDate?: string;
  toDate?: string;
}

export interface ProjectBudgetLineDto {
  id: string;
  costHead: string;
  description?: string;
  budgetAmount: number;
  committedAmount: number;
  actualAmount: number;
  forecastAmount: number;
  varianceAmount: number;
  variancePercent: number;
  sortOrder: number;
}

/**
 * Projected collections against projected spend, month by month. The single number a developer's
 * board asks for, and the one no SMB tool produces.
 */
export interface ProjectCashFlowDto {
  projectId: string;
  projectName: string;
  currencyCode: string;
  fromMonth: string;
  toMonth: string;
  months: CashFlowMonthDto[];
  totalProjectedInflow: number;
  totalProjectedOutflow: number;
  netPosition: number;
  /** The worst month. What a funding conversation is actually about. */
  peakFundingGap: number;
  peakGapMonth?: string;
}

export interface CashFlowMonthDto {
  month: string;
  label: string;
  projectedCollections: number;
  actualCollections: number;
  projectedSpend: number;
  actualSpend: number;
  netMovement: number;
  closingPosition: number;
  isActual: boolean;
}

export interface PlotFileDto {
  id: string;
  projectId: string;
  projectName?: string;
  fileNumber: string;
  categoryCode: string;
  nominalArea: AreaDto;
  subType: PropertySubType;
  status: PropertyStatus;
  price: number;
  ownerName?: string;
  currentBookingId?: string;
  issuedOn: string;
  ballotId?: string;
  allottedUnitId?: string;
  allottedPlotNumber?: string;
  allottedOn?: string;
  isDuplicateIssued: boolean;
  isCancelled: boolean;
}

export interface ApprovalRecordDto {
  id: string;
  reference: string;
  kind: ApprovalKind;
  state: ApprovalState;
  authority?: string;
  applicationNumber?: string;
  approvalNumber?: string;
  appliedOn?: string;
  grantedOn?: string;
  validUntil?: string;
  totalCost: number;
  ownerName?: string;
  conditions?: string;
  documentUrl?: string;
  isBlocking: boolean;
  blocksMilestoneName?: string;
  isMandatory: boolean;
  daysToExpiry?: number;
  isOverdue: boolean;
}


/* ── PropertyDtos ─────────────────────────────────────────────── */

/** A property as it appears in a list or on a map pin. Deliberately small. */
export interface PropertyListItemDto {
  id: string;
  reference: string;
  name?: string;
  category: PropertyCategory;
  subType: PropertySubType;
  subTypeLabel: string;
  status: PropertyStatus;
  occupancy: OccupancyState;
  areaName?: string;
  city?: string;
  addressOneLine: string;
  latitude?: number;
  longitude?: number;
  saleableArea?: AreaDto;
  bedrooms?: number;
  bathrooms?: number;
  askingPrice?: number;
  monthlyRent?: number;
  currencyCode?: string;
  heroImageUrl?: string;
  projectName?: string;
  unitNumber?: string;
  ownerName?: string;
  hasLitigation: boolean;
  isMortgaged: boolean;
  liveListingCount: number;
}

/** Everything about one property, for the 360 screen. */
export interface PropertyDetailDto {
  id: string;
  reference: string;
  name?: string;
  category: PropertyCategory;
  subType: PropertySubType;
  tenure: Tenure;
  status: PropertyStatus;
  occupancy: OccupancyState;
  address: AddressDto;
  geoAreaId?: string;
  areaPath?: string;
  projectId?: string;
  projectName?: string;
  projectNodeId?: string;
  blockName?: string;
  floorNumber?: number;
  floorLabel?: string;
  unitNumber?: string;
  stackCode?: string;
  facing?: Facing;
  isCorner: boolean;
  viewDescription?: string;
  plotArea?: AreaDto;
  coveredArea?: AreaDto;
  builtUpArea?: AreaDto;
  saleableArea?: AreaDto;
  carpetArea?: AreaDto;
  terraceArea?: AreaDto;
  loadingFactorPercent?: number;
  frontageFt?: number;
  depthFt?: number;
  roadWidthFt?: number;
  bedrooms?: number;
  bathrooms?: number;
  halfBaths?: number;
  kitchens?: number;
  livingRooms?: number;
  servantRooms?: number;
  storeRooms?: number;
  parkingBays?: number;
  floorsInUnit?: number;
  furnishing?: FurnishingState;
  condition?: PropertyCondition;
  yearBuilt?: number;
  entranceDirection?: Facing;
  askingPrice?: number;
  reservePrice?: number;
  ratePerSqFt?: number;
  monthlyRent?: number;
  lastSoldPrice?: number;
  lastSoldOn?: string;
  currentValuation?: number;
  serviceChargeRatePerSqFt?: number;
  annualPropertyTax?: number;
  currencyCode: string;
  hasLitigation: boolean;
  isMortgaged: boolean;
  isLandownerShare: boolean;
  notes?: string;
  features: PropertyFeatureDto[];
  media: PropertyMediaDto[];
  owners: PropertyOwnershipDto[];
  ownershipHistory: PropertyOwnershipDto[];
  listings: ListingListItemDto[];
  documents: PropertyDocumentDto[];
  encumbrances: EncumbranceDto[];
  certificates: ComplianceCertificateDto[];
  timeline: TimelineEntryDto[];
  currentTenancyId?: string;
  currentTenantName?: string;
  currentBookingId?: string;
  currentBuyerName?: string;
  outstandingDues: number;
  openWorkOrders: number;
}

export interface PropertyUpsertDto {
  id?: string;
  reference?: string;
  name?: string;
  category: PropertyCategory;
  subType: PropertySubType;
  tenure: Tenure;
  status: PropertyStatus;
  occupancy: OccupancyState;
  addressLine1?: string;
  addressLine2?: string;
  street?: string;
  postCode?: string;
  geoAreaId?: string;
  cityId?: string;
  countryId?: string;
  latitude?: number;
  longitude?: number;
  locationCode?: string;
  projectId?: string;
  projectNodeId?: string;
  floorNumber?: number;
  floorLabel?: string;
  unitNumber?: string;
  stackCode?: string;
  facing?: Facing;
  isCorner: boolean;
  viewDescription?: string;
  /** Areas arrive in the operator's own unit; the server converts and stores square feet. */
  inputAreaUnit: AreaUnit;
  plotArea?: number;
  coveredArea?: number;
  builtUpArea?: number;
  saleableArea?: number;
  carpetArea?: number;
  terraceArea?: number;
  gardenArea?: number;
  frontageFt?: number;
  depthFt?: number;
  roadWidthFt?: number;
  ceilingHeightFt?: number;
  bedrooms?: number;
  bathrooms?: number;
  halfBaths?: number;
  kitchens?: number;
  livingRooms?: number;
  servantRooms?: number;
  storeRooms?: number;
  parkingBays?: number;
  floorsInUnit?: number;
  furnishing?: FurnishingState;
  condition?: PropertyCondition;
  yearBuilt?: number;
  entranceDirection?: Facing;
  askingPrice?: number;
  reservePrice?: number;
  monthlyRent?: number;
  serviceChargeRatePerSqFt?: number;
  propertyTaxReference?: string;
  annualPropertyTax?: number;
  currencyCode?: string;
  notes?: string;
  features: PropertyFeatureDto[];
  /** Set when the duplicate check matched and a human decided they are different. */
  acknowledgeDuplicate: boolean;
}

export interface PropertyFeatureDto {
  id?: string;
  featureKey: string;
  label?: string;
  category?: string;
  value?: string;
  isHighlight: boolean;
  sortOrder: number;
}

export interface PropertyMediaDto {
  id: string;
  kind: MediaKind;
  url: string;
  thumbnailUrl?: string;
  caption?: string;
  roomTag?: string;
  sortOrder: number;
  isHero: boolean;
  excludeFromPortals: boolean;
  widthPx?: number;
  heightPx?: number;
}

export interface PropertyOwnershipDto {
  id: string;
  partyId: string;
  ownerName: string;
  fatherOrGuardianName?: string;
  identityNumber?: string;
  phone?: string;
  sharePercent: number;
  fromDate: string;
  toDate?: string;
  acquiredBy?: TitleInstrument;
  deedNumber?: string;
  deedDate?: string;
  considerationAmount?: number;
  isPrimaryOwner: boolean;
  isCurrent: boolean;
}

export interface PropertyDocumentDto {
  id: string;
  documentType: string;
  title?: string;
  url: string;
  state: DocumentState;
  issuedOn?: string;
  expiresOn?: string;
  isExpired: boolean;
  isConfidential: boolean;
  verifiedByName?: string;
}

/** A duplicate the server found at creation time, with why it matched. */
export interface DuplicateCandidateDto {
  propertyId: string;
  reference: string;
  addressOneLine: string;
  projectName?: string;
  unitNumber?: string;
  status: PropertyStatus;
  /** "address", "geolocation", "unit number in project", "title reference". */
  matchedOn: string;
  confidencePercent: number;
}

export interface LandParcelListItemDto {
  id: string;
  reference: string;
  name?: string;
  surveyNumber?: string;
  mouza?: string;
  district?: string;
  recordArea: AreaDto;
  surveyedArea?: AreaDto;
  areaVarianceSqFt?: number;
  stage: AcquisitionStageKind;
  isAcquired: boolean;
  projectName?: string;
  agreedPrice?: number;
  totalAcquisitionCost: number;
  monthlyHoldingCost: number;
  hasEncumbrance: boolean;
  hasLitigation: boolean;
  openVerificationCount: number;
}

export interface LandParcelDetailDto extends LandParcelListItemDto {
  khasraNumber?: string;
  khewatNumber?: string;
  khatuniNumber?: string;
  village?: string;
  tehsil?: string;
  registrarOffice?: string;
  latitude?: number;
  longitude?: number;
  boundaryGeoJson?: string;
  currentLandUse?: string;
  intendedLandUse?: string;
  maxFloorAreaRatio?: number;
  maxCoveragePercent?: number;
  maxHeightFt?: number;
  titleChain: TitleChainEntryDto[];
  encumbrances: EncumbranceDto[];
  verificationItems: TitleVerificationItemDto[];
  costLines: AcquisitionCostLineDto[];
  acquisition?: LandAcquisitionDto;
}

export interface TitleChainEntryDto {
  id: string;
  sequenceNumber: number;
  instrument: TitleInstrument;
  instrumentDate: string;
  instrumentNumber?: string;
  registrarOffice?: string;
  transferorName?: string;
  transfereeName?: string;
  consideration?: number;
  documentUrl?: string;
  verdict: VerificationVerdict;
  verificationNote?: string;
}

export interface EncumbranceDto {
  id: string;
  kind: EncumbranceKind;
  status: EncumbranceStatus;
  holderName?: string;
  amount?: number;
  createdOn?: string;
  expectedClearanceDate?: string;
  clearedOn?: string;
  referenceNumber?: string;
  documentUrl?: string;
  blocksTransaction: boolean;
  note?: string;
}

export interface TitleVerificationItemDto {
  id: string;
  checkKey: string;
  label: string;
  verdict: VerificationVerdict;
  assignedToName?: string;
  dueDate?: string;
  completedOn?: string;
  evidenceUrl?: string;
  findings?: string;
  condition?: string;
  isMandatory: boolean;
  isOverdue: boolean;
  sortOrder: number;
}

export interface LandAcquisitionDto {
  id: string;
  reference: string;
  landParcelId: string;
  parcelReference?: string;
  sellerName?: string;
  stage: AcquisitionStageKind;
  startedOn?: string;
  targetCompletionDate?: string;
  completedOn?: string;
  askingPrice?: number;
  offeredPrice?: number;
  agreedPrice?: number;
  advancePaid: number;
  totalPaid: number;
  ownerName?: string;
  blockingIssue?: string;
  isAborted: boolean;
  daysInStage: number;
  stages: AcquisitionStageDto[];
}

export interface AcquisitionStageDto {
  id: string;
  kind: AcquisitionStageKind;
  targetDate?: string;
  actualDate?: string;
  ownerName?: string;
  estimatedCost?: number;
  actualCost?: number;
  note?: string;
  isOverdue: boolean;
  sortOrder: number;
}

export interface AcquisitionCostLineDto {
  id: string;
  costType: string;
  description?: string;
  budgetAmount: number;
  actualAmount: number;
  variance: number;
  incurredOn?: string;
  payeeName?: string;
  reference?: string;
  isCapitalised: boolean;
}

export interface PropertyValuationDto {
  id: string;
  propertyId: string;
  purpose: string;
  method: string;
  value: number;
  valueLow?: number;
  valueHigh?: number;
  currencyCode: string;
  valuedOn: string;
  valuerName?: string;
  reportUrl?: string;
  rationale?: string;
  annualRent?: number;
  capRatePercent?: number;
  grossYieldPercent?: number;
  netYieldPercent?: number;
  isCurrent: boolean;
  comparables: PropertyComparableDto[];
}

export interface PropertyComparableDto {
  id: string;
  comparablePropertyId?: string;
  address?: string;
  subType?: PropertySubType;
  areaSqFt?: number;
  bedrooms?: number;
  transactionPrice: number;
  transactionDate: string;
  evidenceType: string;
  source?: string;
  adjustmentPercent: number;
  adjustmentNote?: string;
  adjustedPricePerSqFt: number;
  weight: number;
  monthsAgo: number;
}

/** A price opinion with its working shown. Never presented as a certified valuation. */
export interface PriceOpinionDto {
  propertyId: string;
  suggestedPrice: number;
  lowPrice: number;
  highPrice: number;
  suggestedRatePerSqFt: number;
  currencyCode: string;
  comparableCount: number;
  basis: string;
  confidence: string;
  comparables: PropertyComparableDto[];
  /** Each adjustment, in words, so the number can be argued with rather than believed. */
  workings: string[];
}


/* ── SocietyDtos ─────────────────────────────────────────────── */

export interface SocietyListItemDto {
  id: string;
  name: string;
  code?: string;
  projectId?: string;
  projectName?: string;
  registrationNumber?: string;
  totalUnits: number;
  occupiedUnits: number;
  occupancyPercent: number;
  monthlyBillingTotal: number;
  outstandingTotal: number;
  collectionEfficiencyPercent: number;
  corpusFundBalance: number;
  currencyCode: string;
  isHandedOver: boolean;
  managedByDeveloper: boolean;
  defaulterCount: number;
  openComplaints: number;
  complaintsBreachingSla: number;
  isActive: boolean;
}

export interface SocietyDetailDto extends SocietyListItemDto {
  propertyId?: string;
  geoAreaId?: string;
  registeredOn?: string;
  registrationAuthority?: string;
  constitutionUrl?: string;
  financialYearStartMonth: number;
  totalArea: AreaDto;
  bankAccountId?: string;
  sinkingFundId?: string;
  sinkingFundBalance: number;
  handoverDate?: string;
  corpusTransferred: number;
  commonAreasTransferred: boolean;
  documentsTransferred: boolean;
  facilityManagerName?: string;
  suspendAmenitiesOnDefault: boolean;
  amenitySuspensionThreshold: number;
  committee: CommitteeMemberDto[];
  amenities: AmenityDto[];
  chargeSchemes: MaintenanceChargeSchemeDto[];
  recentNotices: SocietyNoticeDto[];
  dashboard: SocietyDashboardDto;
}

/** The society console's header: what is happening in the estate right now. */
export interface SocietyDashboardDto {
  visitorsInsideNow: number;
  visitorsToday: number;
  pendingGateApprovals: number;
  openComplaints: number;
  complaintsBreachingSla: number;
  amenityBookingsToday: number;
  pendingAmenityApprovals: number;
  moveRequestsPending: number;
  billedThisMonth: number;
  collectedThisMonth: number;
  outstandingTotal: number;
  defaulterCount: number;
  defaulterExposure: number;
  openWorkOrders: number;
  ppmOverdue: number;
  assetsFaulty: number;
  buildingApplicationsPending: number;
  violationsOpen: number;
  complaintsByCategory: BreakdownSliceDto[];
  collectionTrend: TrendPointDto[];
}

export interface SocietyUpsertDto {
  id?: string;
  name: string;
  code?: string;
  projectId?: string;
  propertyId?: string;
  geoAreaId?: string;
  registrationNumber?: string;
  registeredOn?: string;
  registrationAuthority?: string;
  constitutionUrl?: string;
  financialYearStartMonth: number;
  bankAccountId?: string;
  defaultDunningPolicyId?: string;
  facilityManagerUserId?: string;
  managedByDeveloper: boolean;
  suspendAmenitiesOnDefault: boolean;
  amenitySuspensionThreshold: number;
}

export interface CommitteeMemberDto {
  id: string;
  partyId: string;
  name: string;
  phone?: string;
  unitId?: string;
  unitLabel?: string;
  position: string;
  fromDate: string;
  toDate?: string;
  canApproveSpend: boolean;
  spendLimit: number;
  isActive: boolean;
}

export interface ResidentListItemDto {
  id: string;
  societyId: string;
  unitId?: string;
  unitLabel: string;
  blockName?: string;
  partyId: string;
  name: string;
  phone?: string;
  email?: string;
  photoUrl?: string;
  kind: ResidentKind;
  membershipNumber?: string;
  movedInOn: string;
  movedOutOn?: string;
  isPrimaryContact: boolean;
  portalAccessEnabled: boolean;
  outstandingDues: number;
  isDefaulter: boolean;
  amenitiesSuspended: boolean;
  vehicleCount: number;
  staffCount: number;
  householdSize: number;
  isActive: boolean;
}

export interface ResidentDetailDto extends ResidentListItemDto {
  propertyId: string;
  tenancyId?: string;
  householdId?: string;
  canApproveVisitors: boolean;
  canBookAmenities: boolean;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  bloodGroup?: string;
  vehicles: ResidentVehicleDto[];
  staff: DomesticStaffDto[];
  bills: MaintenanceBillDto[];
  amenityBookings: AmenityBookingDto[];
  complaints: ComplaintListItemDto[];
  recentVisitors: GateEntryDto[];
  timeline: TimelineEntryDto[];
}

export interface ResidentUpsertDto {
  id?: string;
  societyId: string;
  unitId?: string;
  propertyId: string;
  partyId?: string;
  newParty?: PartyUpsertDto;
  kind: ResidentKind;
  tenancyId?: string;
  movedInOn: string;
  membershipNumber?: string;
  isPrimaryContact: boolean;
  portalAccessEnabled: boolean;
  canApproveVisitors: boolean;
  canBookAmenities: boolean;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  bloodGroup?: string;
}

export interface ResidentVehicleDto {
  id?: string;
  registrationNumber: string;
  vehicleType?: string;
  makeModel?: string;
  colour?: string;
  parkingSlotId?: string;
  parkingSlotNumber?: string;
  stickerNumber?: string;
  stickerExpiresOn?: string;
  rfidTag?: string;
  isActive: boolean;
}

export interface DomesticStaffDto {
  id: string;
  societyId: string;
  unitId?: string;
  unitLabel?: string;
  name: string;
  phone?: string;
  photoUrl?: string;
  identityNumber?: string;
  staffType: string;
  passNumber?: string;
  passIssuedOn?: string;
  passExpiresOn?: string;
  passExpired: boolean;
  isPoliceVerified: boolean;
  verifiedOn?: string;
  worksForMultipleUnits: boolean;
  isBlacklisted: boolean;
  blacklistReason?: string;
  isActive: boolean;
  lastEntryAt?: string;
}

export interface MaintenanceChargeSchemeDto {
  id: string;
  societyId: string;
  name: string;
  basis: MaintenanceBasis;
  ratePerSqFt: number;
  flatAmount: number;
  frequency: RentFrequency;
  appliesToSubType?: PropertySubType;
  minAreaSqFt?: number;
  maxAreaSqFt?: number;
  vacantUnitPercent: number;
  isTaxable: boolean;
  taxPercent: number;
  lateFeePercent: number;
  lateFeeFlat: number;
  graceDays: number;
  earlyPaymentDiscountPercent: number;
  allowAnnualPrepayment: boolean;
  effectiveFrom: string;
  effectiveTo?: string;
  isActive: boolean;
  unitsCovered: number;
  monthlyValue: number;
  slabs: MaintenanceChargeSlabDto[];
}

export interface MaintenanceChargeSlabDto {
  id?: string;
  fromAreaSqFt: number;
  toAreaSqFt?: number;
  amount: number;
  ratePerSqFt: number;
  sortOrder: number;
}

export interface MaintenanceBillDto {
  id: string;
  billNumber: string;
  societyId: string;
  societyName?: string;
  unitId?: string;
  unitLabel: string;
  blockName?: string;
  partyId: string;
  partyName: string;
  partyPhone?: string;
  billedTo: ResidentKind;
  periodFrom: string;
  periodTo: string;
  issuedOn: string;
  dueDate: string;
  maintenanceAmount: number;
  utilityAmount: number;
  otherChargesAmount: number;
  penaltyAmount: number;
  arrearsBroughtForward: number;
  lateFeeAmount: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
  paidAmount: number;
  balance: number;
  currencyCode: string;
  status: InstalmentStatus;
  daysOverdue: number;
  isSent: boolean;
  isDisputed: boolean;
  documentUrl?: string;
  lines: MaintenanceBillLineDto[];
}

export interface MaintenanceBillLineDto {
  id: string;
  description: string;
  chargeType: string;
  quantity: number;
  rate: number;
  amount: number;
  taxAmount: number;
  meterReadingId?: string;
  sortOrder: number;
}

export interface MaintenanceBillRunDto {
  societyId: string;
  periodFrom: string;
  periodTo: string;
  dueDate: string;
  includeUtilities: boolean;
  includeArrears: boolean;
  applyLateFees: boolean;
  isDryRun: boolean;
  excludeUnitIds: string[];
  sendImmediately: boolean;
  channels: NotificationChannel[];
}

export interface MaintenanceBillRunResultDto {
  candidateCount: number;
  generatedCount: number;
  skippedCount: number;
  failedCount: number;
  totalAmount: number;
  maintenanceTotal: number;
  utilityTotal: number;
  arrearsTotal: number;
  lateFeeTotal: number;
  currencyCode: string;
  isDryRun: boolean;
  preview: MaintenanceBillDto[];
  warnings: string[];
}

export interface SocietyChargeDto {
  id?: string;
  societyId: string;
  unitId?: string;
  unitLabel?: string;
  chargeType: string;
  label: string;
  amount: number;
  frequency: RentFrequency;
  isRecurring: boolean;
  effectiveFrom: string;
  effectiveTo?: string;
  isTaxable: boolean;
  isActive: boolean;
}

export interface SocietyPenaltyDto {
  id: string;
  reference: string;
  societyId: string;
  unitId?: string;
  unitLabel?: string;
  partyId: string;
  partyName: string;
  violationType: string;
  description: string;
  observedOn: string;
  amount: number;
  imposedByName?: string;
  evidenceUrl?: string;
  noticeServed: boolean;
  noticeServedOn?: string;
  appealWindowDays: number;
  isAppealed: boolean;
  appealNote?: string;
  isWaived: boolean;
  isPaid: boolean;
  isRectified: boolean;
  rectifiedOn?: string;
}

export interface VisitorPassDto {
  id: string;
  passNumber: string;
  societyId: string;
  unitId?: string;
  unitLabel?: string;
  residentName?: string;
  visitorName: string;
  visitorPhone?: string;
  kind: VisitorKind;
  guestCount: number;
  vehicleNumber?: string;
  validFrom: string;
  validTo: string;
  isRecurring: boolean;
  recurrenceDays?: string;
  qrCode?: string;
  status: GateEntryStatus;
  usedAt?: string;
  isCancelled: boolean;
  isExpired: boolean;
  note?: string;
}

export interface VisitorPassCreateDto {
  societyId: string;
  unitId?: string;
  residentId?: string;
  visitorName: string;
  visitorPhone?: string;
  kind: VisitorKind;
  guestCount: number;
  vehicleNumber?: string;
  validFrom: string;
  validTo: string;
  isRecurring: boolean;
  recurrenceDays?: string;
  note?: string;
}

/**
 * One row on the gate log. Written from a guard's phone, so it stays small and never blocks on a
 * network round trip.
 */
export interface GateEntryDto {
  id: string;
  societyId: string;
  unitId?: string;
  unitLabel?: string;
  blockName?: string;
  residentName?: string;
  residentPhone?: string;
  personName?: string;
  kind: VisitorKind;
  purpose?: string;
  vehicleNumber?: string;
  personCount: number;
  entryPhotoUrl?: string;
  status: GateEntryStatus;
  checkedInAt?: string;
  checkedOutAt?: string;
  minutesInside?: number;
  guardName?: string;
  approvalRequested: boolean;
  approvalRequestedAt?: string;
  approvedAt?: string;
  approvalMethod?: string;
  isDenied: boolean;
  denialReason?: string;
  wasOffline: boolean;
  note?: string;
  visitorPassId?: string;
  domesticStaffId?: string;
}

export interface GateEntryCreateDto {
  societyId: string;
  gateId?: string;
  unitId?: string;
  visitorPassId?: string;
  visitorId?: string;
  domesticStaffId?: string;
  residentId?: string;
  personName?: string;
  phone?: string;
  kind: VisitorKind;
  purpose?: string;
  vehicleNumber?: string;
  personCount: number;
  entryPhotoUrl?: string;
  identityNumber?: string;
  /** Ask the flat before letting them in. The OTP or push goes out on save. */
  requestApproval: boolean;
  /** Guard let them in without waiting. Recorded as an override, never hidden. */
  guardOverride: boolean;
  overrideReason?: string;
  /** Captured with no signal, queued locally, posted when the connection returned. */
  wasOffline: boolean;
  offlineCapturedAt?: string;
  clientReference?: string;
}

export interface GateApprovalDto {
  gateEntryId: string;
  approved: boolean;
  method?: string;
  otpCode?: string;
  denialReason?: string;
}

/** A batch of gate entries captured offline, posted when the guard's phone reconnects. */
export interface GateSyncBatchDto {
  societyId: string;
  entries: GateEntryCreateDto[];
}

export interface GatePassDto {
  id: string;
  passNumber: string;
  societyId: string;
  unitId?: string;
  unitLabel?: string;
  residentName?: string;
  passType: string;
  itemDescription?: string;
  itemCount?: number;
  vehicleNumber?: string;
  carrierName?: string;
  validFrom: string;
  validTo: string;
  approvedByName?: string;
  duesCleared: boolean;
  isUsed: boolean;
  usedAt?: string;
  isCancelled: boolean;
  isExpired: boolean;
}

export interface MoveRequestDto {
  id: string;
  reference: string;
  societyId: string;
  unitId: string;
  unitLabel: string;
  partyId: string;
  partyName: string;
  phone?: string;
  direction: string;
  requestedDate: string;
  slotFrom?: string;
  slotTo?: string;
  liftBooked?: string;
  moveCharge: number;
  securityDeposit: number;
  duesCleared: boolean;
  outstandingDues: number;
  status: string;
  approvedByName?: string;
  gatePassId?: string;
  damageInspectionDone: boolean;
  damageCharge?: number;
  note?: string;
}

export interface AmenityDto {
  id: string;
  societyId: string;
  name: string;
  amenityType: string;
  capacity: number;
  location?: string;
  photoUrl?: string;
  isBookable: boolean;
  requiresApproval: boolean;
  opensAt: string;
  closesAt: string;
  slotMinutes: number;
  minAdvanceHours: number;
  maxAdvanceDays: number;
  maxBookingsPerUnitPerMonth: number;
  chargePerSlot: number;
  chargePerHour: number;
  securityDeposit: number;
  cleaningCharge: number;
  cancellationWindowHours: number;
  lateCancellationPenalty: number;
  blockedForDefaulters: boolean;
  isUnderMaintenance: boolean;
  rules?: string;
  isActive: boolean;
  bookingsThisMonth: number;
  utilisationPercent: number;
}

export interface AmenityAvailabilityDto {
  amenityId: string;
  amenityName: string;
  date: string;
  slots: AmenitySlotDto[];
}

export interface AmenitySlotDto {
  startTime: string;
  endTime: string;
  capacity: number;
  bookedCount: number;
  isAvailable: boolean;
  isBlocked: boolean;
  blockReason?: string;
  charge: number;
  bookedByUnitLabel?: string;
}

export interface AmenityBookingDto {
  id: string;
  reference: string;
  amenityId: string;
  amenityName: string;
  societyId: string;
  unitId?: string;
  unitLabel?: string;
  partyId: string;
  partyName: string;
  phone?: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  guestCount: number;
  purpose?: string;
  status: AmenityBookingStatus;
  chargeAmount: number;
  depositAmount: number;
  paidAmount: number;
  currencyCode: string;
  receiptNumber?: string;
  approvedByName?: string;
  approvedAt?: string;
  rejectionReason?: string;
  cancelledAt?: string;
  cancellationPenalty?: number;
  depositRefunded: boolean;
  damageDeduction?: number;
  postUseNote?: string;
}

export interface AmenityBookingCreateDto {
  amenityId: string;
  unitId?: string;
  residentId?: string;
  partyId?: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  guestCount: number;
  purpose?: string;
  payment?: ReceiptCreateDto;
}

export interface ComplaintListItemDto {
  id: string;
  ticketNumber: string;
  societyId: string;
  societyName?: string;
  unitId?: string;
  unitLabel?: string;
  blockName?: string;
  partyId: string;
  partyName: string;
  phone?: string;
  category: ComplaintCategory;
  priority: TicketPriority;
  status: TicketStatus;
  title: string;
  location?: string;
  raisedAt: string;
  raisedVia: NotificationChannel;
  assignedToName?: string;
  contractorName?: string;
  acknowledgedAt?: string;
  slaDueAt?: string;
  slaBreached: boolean;
  minutesToSla?: number;
  escalationLevel: number;
  workOrderId?: string;
  resolvedAt?: string;
  satisfactionRating?: number;
  wasReopened: boolean;
  ageHours: number;
}

export interface ComplaintDetailDto extends ComplaintListItemDto {
  description: string;
  photoUrls: string[];
  resolution?: string;
  closedAt?: string;
  feedbackNote?: string;
  reopenCount: number;
  updates: ComplaintUpdateDto[];
  workOrder?: WorkOrderListItemDto;
}

export interface ComplaintUpdateDto {
  id: string;
  postedAt: string;
  userName?: string;
  newStatus?: TicketStatus;
  note: string;
  photoUrls: string[];
  isVisibleToResident: boolean;
  isFromResident: boolean;
}

export interface ComplaintCreateDto {
  societyId: string;
  unitId?: string;
  residentId?: string;
  partyId?: string;
  category: ComplaintCategory;
  priority: TicketPriority;
  title: string;
  description: string;
  location?: string;
  photoUrls: string[];
  raisedVia: NotificationChannel;
}

export interface SocietyNoticeDto {
  id: string;
  societyId: string;
  title: string;
  body: string;
  noticeType: string;
  severity: AlertSeverity;
  publishedAt: string;
  expiresOn?: string;
  publishedByName?: string;
  isPinned: boolean;
  sendAsBroadcast: boolean;
  attachmentUrl?: string;
  targetBlocks?: string;
  readCount: number;
  isActive: boolean;
  isExpired: boolean;
}

export interface SocietyPollDto {
  id: string;
  societyId: string;
  question: string;
  description?: string;
  pollType: string;
  options: string[];
  opensAt: string;
  closesAt: string;
  oneVotePerUnit: boolean;
  defaultersMayVote: boolean;
  isAnonymous: boolean;
  eligibleCount: number;
  voteCount: number;
  turnoutPercent: number;
  isClosed: boolean;
  isBinding: boolean;
  hasVoted: boolean;
  results: BreakdownSliceDto[];
}

export interface BuildingPlanApplicationDto {
  id: string;
  reference: string;
  societyId: string;
  unitId?: string;
  unitLabel?: string;
  propertyId: string;
  addressOneLine?: string;
  partyId: string;
  partyName: string;
  phone?: string;
  applicationType: string;
  status: BuildingApplicationStatus;
  submittedOn: string;
  proposedCoveredArea: AreaDto;
  proposedFloors: number;
  proposedHeightFt: number;
  proposedCoveragePercent: number;
  permittedCoveragePercent?: number;
  permittedHeightFt?: number;
  permittedFloors?: number;
  /** Set where the proposal exceeds what the bye-laws allow, with the number. */
  breaches: string[];
  architectName?: string;
  architectLicence?: string;
  drawingUrl?: string;
  scrutinyFee: number;
  securityDeposit: number;
  feesPaid: boolean;
  duesCleared: boolean;
  scrutinisedByName?: string;
  decidedOn?: string;
  conditions?: string;
  rejectionReason?: string;
  approvalValidUntil?: string;
  nocIssuanceId?: string;
  isCompleted: boolean;
  inspections: BuildingInspectionDto[];
}

export interface BuildingInspectionDto {
  id: string;
  stage: string;
  inspectedOn: string;
  inspectorName?: string;
  isCompliant: boolean;
  findings?: string;
  photoUrls: string[];
  violationNoticeId?: string;
  reInspectionDue?: string;
}

export interface ViolationNoticeDto {
  id: string;
  noticeNumber: string;
  societyId: string;
  propertyId?: string;
  addressOneLine?: string;
  partyId: string;
  partyName: string;
  violationType: string;
  description: string;
  issuedOn: string;
  complyByDate: string;
  penaltyAmount: number;
  isStopWork: boolean;
  securityForfeited: boolean;
  evidenceUrl?: string;
  documentUrl?: string;
  isComplied: boolean;
  compliedOn?: string;
  referredToAuthority: boolean;
  isWithdrawn: boolean;
  isOverdue: boolean;
}


/* ── TenancyDtos ─────────────────────────────────────────────── */

export interface TenancyListItemDto {
  id: string;
  reference: string;
  kind: TenancyKind;
  status: TenancyStatus;
  propertyId: string;
  propertyReference: string;
  addressOneLine: string;
  unitNumber?: string;
  buildingName?: string;
  subType?: PropertySubType;
  area?: AreaDto;
  tenantName: string;
  tenantPhone?: string;
  landlordId?: string;
  landlordName?: string;
  managedByName?: string;
  startDate: string;
  endDate?: string;
  daysToExpiry?: number;
  isExpiringSoon: boolean;
  rent: number;
  frequency: RentFrequency;
  annualRent?: number;
  rentPerSqFt?: number;
  currencyCode: string;
  depositAmount: number;
  depositRegistered: boolean;
  depositRegistrationOverdue: boolean;
  arrearsAmount: number;
  daysInArrears: number;
  monthsInArrears: number;
  nextDueDate?: string;
  managementService: ManagementService;
  managementFeePercent: number;
  serviceChargeApplies: boolean;
  turnoverRentApplies: boolean;
  openComplianceIssues: number;
  criticalDatesDue: number;
}

export interface TenancyDetailDto extends TenancyListItemDto {
  unitId?: string;
  instructionId?: string;
  termMonths?: number;
  rollsToPeriodic: boolean;
  actualEndDate?: string;
  paymentDay: number;
  paidInAdvance: boolean;
  escalation: EscalationKind;
  escalationPercent: number;
  escalationMonths: number;
  nextEscalationDate?: string;
  advanceRentMonths: number;
  totalCharged: number;
  totalPaid: number;
  serviceChargeBasis?: ApportionmentBasis;
  serviceChargePercent: number;
  utilitiesRecharged: boolean;
  propertyTaxRecharged: boolean;
  insuranceRecharged: boolean;
  repairAuthorityLimit: number;
  petsAllowed: boolean;
  smokingAllowed: boolean;
  sublettingAllowed: boolean;
  maxOccupants?: number;
  permittedUse?: string;
  noticePeriodDaysTenant: number;
  noticePeriodDaysLandlord: number;
  agreementUrl?: string;
  signedOn?: string;
  isRegistered: boolean;
  registrationNumber?: string;
  previousTenancyId?: string;
  notes?: string;
  parties: TenancyPartyDto[];
  rentCharges: RentChargeDto[];
  options: LeaseOptionDto[];
  criticalDates: CriticalDateDto[];
  escalations: EscalationRuleDto[];
  recoveries: RecoveryChargeDto[];
  deposit?: SecurityDepositDto;
  referencing?: ReferencingCaseDto;
  turnoverRent?: TurnoverRentTermDto;
  inspections: MoveInspectionDto[];
  certificates: ComplianceCertificateDto[];
  workOrders: WorkOrderListItemDto[];
  ledger: CustomerLedgerEntryDto[];
  timeline: TimelineEntryDto[];
  ageing: AgeingBucketsDto;
}

export interface TenancyPartyDto {
  id?: string;
  partyId: string;
  name: string;
  phone?: string;
  email?: string;
  role: string;
  isLeadTenant: boolean;
  isJointlyAndSeverallyLiable: boolean;
  liabilitySharePercent: number;
  fromDate?: string;
  toDate?: string;
  kycStatus: KycStatus;
  referencingOutcome?: ReferencingOutcome;
}

export interface TenancyCreateDto {
  propertyId: string;
  unitId?: string;
  landlordId?: string;
  instructionId?: string;
  officeId?: string;
  managedByUserId?: string;
  enquiryId?: string;
  kind: TenancyKind;
  startDate: string;
  endDate?: string;
  termMonths?: number;
  rollsToPeriodic: boolean;
  rent: number;
  frequency: RentFrequency;
  currencyCode?: string;
  paymentDay: number;
  paidInAdvance: boolean;
  escalation: EscalationKind;
  escalationPercent: number;
  escalationMonths: number;
  depositAmount: number;
  depositScheme: DepositScheme;
  advanceRentMonths: number;
  managementService: ManagementService;
  managementFeePercent: number;
  repairAuthorityLimit: number;
  serviceChargeApplies: boolean;
  serviceChargeBasis?: ApportionmentBasis;
  serviceChargePercent: number;
  turnoverRentApplies: boolean;
  utilitiesRecharged: boolean;
  propertyTaxRecharged: boolean;
  insuranceRecharged: boolean;
  petsAllowed: boolean;
  smokingAllowed: boolean;
  sublettingAllowed: boolean;
  maxOccupants?: number;
  permittedUse?: string;
  noticePeriodDaysTenant: number;
  noticePeriodDaysLandlord: number;
  parties: TenancyPartyDto[];
  options: LeaseOptionDto[];
  recoveries: RecoveryChargeDto[];
  turnoverRent?: TurnoverRentTermDto;
  concessions: LeaseConcessionDto[];
  /** Generate the whole rent schedule now, so the term is visible in advance. */
  generateSchedule: boolean;
  notes?: string;
}

export interface RentChargeDto {
  id: string;
  sequenceNumber: number;
  periodFrom: string;
  periodTo: string;
  dueDate: string;
  amount: number;
  taxAmount: number;
  totalAmount: number;
  paidAmount: number;
  balance: number;
  status: InstalmentStatus;
  daysOverdue: number;
  lateFeeAccrued: number;
  isProRated: boolean;
  isRentFree: boolean;
  settledOn?: string;
}

export interface EscalationRuleDto {
  id?: string;
  kind: EscalationKind;
  effectiveFrom: string;
  percent: number;
  fixedAmount: number;
  indexName?: string;
  floorPercent?: number;
  capPercent?: number;
  intervalMonths: number;
  isCompounding: boolean;
  isApplied: boolean;
  appliedOn?: string;
  resultingRent?: number;
  sortOrder: number;
}

export interface RentReviewDto {
  id: string;
  reference: string;
  tenancyId: string;
  tenancyReference: string;
  addressOneLine?: string;
  reviewDate: string;
  noticeDeadline?: string;
  noticeServed: boolean;
  noticeServedOn?: string;
  noticeDeadlineMissed: boolean;
  currentRent: number;
  proposedRent?: number;
  counterProposedRent?: number;
  agreedRent?: number;
  upliftPercent?: number;
  agreedOn?: string;
  effectiveFrom?: string;
  outcome?: string;
  isUpwardOnly: boolean;
  memorandumUrl?: string;
  note?: string;
}

export interface LeaseOptionDto {
  id?: string;
  kind: LeaseOptionKind;
  heldBy: string;
  optionDate: string;
  noticeWindowFrom: string;
  noticeWindowTo: string;
  noticeMonths: number;
  conditions?: string;
  optionPrice?: number;
  penaltyAmount?: number;
  isExercised: boolean;
  exercisedOn?: string;
  isLapsed: boolean;
  isWindowOpen: boolean;
  daysToWindowClose?: number;
}

export interface CriticalDateDto {
  id: string;
  title: string;
  dateType: string;
  tenancyId?: string;
  tenancyReference?: string;
  propertyId?: string;
  addressOneLine?: string;
  dueDate: string;
  daysToDue: number;
  alertDaysBefore: number;
  ownerName?: string;
  severity: AlertSeverity;
  alertSent: boolean;
  isActioned: boolean;
  isOverdue: boolean;
  note?: string;
  route?: string;
}

export interface TenancyRenewalDto {
  id: string;
  reference: string;
  tenancyId: string;
  tenancyReference: string;
  addressOneLine: string;
  tenantName: string;
  expiryDate: string;
  daysToExpiry: number;
  offeredOn?: string;
  currentRent: number;
  proposedRent?: number;
  agreedRent?: number;
  upliftPercent?: number;
  proposedTermMonths?: number;
  status: string;
  respondedOn?: string;
  newTenancyId?: string;
  declineReason?: string;
  landlordApproved: boolean;
  /** Annual rent at risk if this one walks. What the renewal pipeline sorts on. */
  valueAtRisk: number;
  note?: string;
}

export interface ReferencingCaseDto {
  id: string;
  reference: string;
  partyId: string;
  partyName: string;
  tenancyId?: string;
  propertyId?: string;
  addressOneLine?: string;
  outcome: ReferencingOutcome;
  startedOn: string;
  completedOn?: string;
  assignedToName?: string;
  declaredIncome?: number;
  incomeMultiple?: number;
  guarantorRequired: boolean;
  conditions?: string;
  failureReason?: string;
  daysOpen: number;
  checks: ReferencingCheckDto[];
}

export interface ReferencingCheckDto {
  id?: string;
  kind: ReferencingCheckKind;
  outcome: ReferencingOutcome;
  requestedOn?: string;
  completedOn?: string;
  refereeName?: string;
  refereeContact?: string;
  findings?: string;
  documentUrl?: string;
  isMandatory: boolean;
  recheckDue?: string;
}

export interface SecurityDepositDto {
  id: string;
  tenancyId: string;
  tenancyReference: string;
  addressOneLine?: string;
  partyId: string;
  partyName: string;
  amount: number;
  currencyCode: string;
  receivedOn: string;
  scheme: DepositScheme;
  schemeName?: string;
  registrationReference?: string;
  registrationDeadline?: string;
  registeredOn?: string;
  isRegistered: boolean;
  /** Late registration is a multiple-of-deposit penalty in some markets. Counted down. */
  daysToRegistrationDeadline?: number;
  registrationOverdue: boolean;
  prescribedInformationServed: boolean;
  prescribedInformationServedOn?: string;
  deductionTotal: number;
  returnedToTenant: number;
  paidToLandlord: number;
  releasedOn?: string;
  isDisputed: boolean;
  disputeReference?: string;
  disputeOutcome?: string;
  deductions: DepositDeductionDto[];
}

export interface DepositDeductionDto {
  id?: string;
  category: string;
  description: string;
  proposedAmount: number;
  agreedAmount: number;
  evidenceUrl?: string;
  inspectionFindingId?: string;
  workOrderId?: string;
  tenantResponse: string;
  respondedOn?: string;
  adjudicatorNote?: string;
}

export interface MoveInspectionDto {
  id: string;
  reference: string;
  propertyId: string;
  addressOneLine?: string;
  tenancyId?: string;
  kind: InspectionKind;
  inspectedAt: string;
  inspectorName?: string;
  tenantPresent: boolean;
  landlordPresent: boolean;
  overallCondition?: string;
  cleanlinessRating?: string;
  reportUrl?: string;
  comparedToInspectionId?: string;
  tenantDisputed: boolean;
  tenantComments?: string;
  tenantResponseDeadline?: string;
  isFinalised: boolean;
  itemCount: number;
  deterioratedCount: number;
  estimatedDeductions?: number;
  items: InspectionRoomItemDto[];
}

export interface InspectionRoomItemDto {
  id?: string;
  roomName: string;
  itemName: string;
  condition: ConditionGrade;
  cleanlinessGrade?: string;
  note?: string;
  photoUrls: string[];
  previousCondition?: ConditionGrade;
  hasDeteriorated: boolean;
  isFairWearAndTear: boolean;
  estimatedCost?: number;
  sortOrder: number;
}

export interface TenancyNoticeDto {
  id: string;
  noticeNumber: string;
  tenancyId: string;
  noticeType: string;
  servedBy: string;
  servedOn: string;
  effectiveFrom: string;
  noticePeriodDays: number;
  grounds?: string;
  serviceMethod?: string;
  serviceEvidenceUrl?: string;
  isAcknowledged: boolean;
  isWithdrawn: boolean;
  isValid: boolean;
  validityNote?: string;
  documentUrl?: string;
}

export interface ComplianceCertificateDto {
  id: string;
  propertyId: string;
  addressOneLine?: string;
  tenancyId?: string;
  kind: ComplianceCertificateKind;
  certificateNumber?: string;
  issuedOn: string;
  expiresOn: string;
  daysToExpiry: number;
  isExpired: boolean;
  isExpiringSoon: boolean;
  issuerName?: string;
  issuerRegistration?: string;
  cost?: number;
  borneBy: CostBearer;
  documentUrl?: string;
  servedToTenant: boolean;
  hasFailures: boolean;
  findings?: string;
  remedialWorkOrderId?: string;
  renewalBooked: boolean;
  isCurrent: boolean;
}

/**
 * The estate manager's home screen: every unit, its tenant, its rent, its arrears and its expiry
 * in one grid that reconciles to the ledger.
 */
export interface RentRollDto {
  propertyId?: string;
  propertyName?: string;
  currencyCode: string;
  asOfDate: string;
  rows: RentRollRowDto[];
  totalUnits: number;
  occupiedUnits: number;
  vacantUnits: number;
  occupancyPercent: number;
  totalArea: AreaDto;
  occupiedArea: AreaDto;
  monthlyRent: number;
  annualRent: number;
  averageRentPerSqFt: number;
  totalArrears: number;
  totalDeposits: number;
  passingRentVsMarket: number;
  ageing: AgeingBucketsDto;
  expiryProfile: BreakdownSliceDto[];
  tenantMix: BreakdownSliceDto[];
}

export interface RentRollRowDto {
  unitId?: string;
  propertyId: string;
  unitLabel: string;
  floorLabel?: string;
  area: AreaDto;
  subType?: PropertySubType;
  tenancyId?: string;
  tenantName?: string;
  tenantCategory?: string;
  status?: TenancyStatus;
  startDate?: string;
  endDate?: string;
  monthsRemaining?: number;
  rent: number;
  frequency?: RentFrequency;
  annualRent: number;
  rentPerSqFt: number;
  serviceCharge: number;
  otherRecoveries: number;
  totalIncome: number;
  deposit: number;
  arrears: number;
  daysInArrears: number;
  escalation?: EscalationKind;
  nextReviewDate?: string;
  nextBreakDate?: string;
  isVacant: boolean;
  daysVoid?: number;
  askingRent?: number;
  turnoverRentApplies: boolean;
  lastDeclaredSales?: number;
}

export interface RentRunDto {
  id: string;
  reference: string;
  propertyName?: string;
  runDate: string;
  periodFrom: string;
  periodTo: string;
  isDryRun: boolean;
  candidateCount: number;
  chargedCount: number;
  skippedCount: number;
  failedCount: number;
  totalAmount: number;
  currencyCode: string;
  startedAt: string;
  completedAt?: string;
  runByName?: string;
  errorSummary?: string;
  isCompleted: boolean;
  lines: RentRunLineDto[];
}

export interface RentRunLineDto {
  id: string;
  tenancyId: string;
  tenancyReference: string;
  addressOneLine?: string;
  tenantName?: string;
  amount: number;
  wasSkipped: boolean;
  skipReason?: string;
  failed: boolean;
  failureReason?: string;
}

export interface RentRunRequestDto {
  propertyId?: string;
  projectId?: string;
  officeId?: string;
  periodFrom: string;
  periodTo: string;
  isDryRun: boolean;
  excludeTenancyIds: string[];
  includeRecoveries: boolean;
}

export interface ArrearsCaseDto {
  id: string;
  reference: string;
  tenancyId: string;
  tenancyReference: string;
  addressOneLine?: string;
  partyId: string;
  tenantName: string;
  phone?: string;
  openedOn: string;
  arrearsAmount: number;
  lateFeeAmount: number;
  daysInArrears: number;
  monthsInArrears: number;
  currencyCode: string;
  assignedToName?: string;
  activePromiseId?: string;
  promisedDate?: string;
  landlordNotified: boolean;
  noticeId?: string;
  referredToLegal: boolean;
  dunningStep: number;
  isClosed: boolean;
  outcome?: string;
}

export interface ServiceChargeBudgetDto {
  id: string;
  reference: string;
  propertyId?: string;
  propertyName?: string;
  societyId?: string;
  financialYear: number;
  periodFrom: string;
  periodTo: string;
  totalBudget: number;
  totalActual: number;
  totalBilled: number;
  variance: number;
  variancePercent: number;
  currencyCode: string;
  managementFeePercent: number;
  totalGrossLettableArea: AreaDto;
  occupiedArea: AreaDto;
  occupancyPercent: number;
  baseYear?: number;
  grossUpEnabled: boolean;
  grossUpToOccupancyPercent: number;
  annualCapPercent?: number;
  cumulativeCapPercent?: number;
  isApproved: boolean;
  approvedOn?: string;
  isReconciled: boolean;
  documentUrl?: string;
  lines: ServiceChargeBudgetLineDto[];
}

export interface ServiceChargeBudgetLineDto {
  id?: string;
  head: ServiceChargeHead;
  label: string;
  budgetAmount: number;
  actualAmount: number;
  varianceAmount: number;
  variancePercent: number;
  basis: ApportionmentBasis;
  isVariableCost: boolean;
  isExcludedFromRecovery: boolean;
  exclusionReason?: string;
  isCapped: boolean;
  capAmount?: number;
  grossedUpAmount: number;
  recoverableAmount: number;
  sortOrder: number;
}

/**
 * The year-end true-up with its working kept: budget, actual, gross-up, caps, exclusions, and
 * the balancing charge or credit per tenant.
 */
export interface ServiceChargeReconciliationDto {
  id: string;
  reference: string;
  serviceChargeBudgetId: string;
  propertyName?: string;
  financialYear: number;
  reconciledOn: string;
  totalBudget: number;
  totalActual: number;
  totalGrossedUp: number;
  totalExcluded: number;
  totalCapAdjustment: number;
  totalRecoverable: number;
  totalBilledOnAccount: number;
  netDifference: number;
  outcome: ReconciliationOutcome;
  currencyCode: string;
  isAudited: boolean;
  auditorName?: string;
  auditedOn?: string;
  statementUrl?: string;
  isIssuedToTenants: boolean;
  isFinalised: boolean;
  /** Each step of the calculation in words, so a tenant can challenge it line by line. */
  workings: string[];
  headBreakdown: ServiceChargeBudgetLineDto[];
  tenantLines: ReconciliationLineDto[];
}

export interface ReconciliationLineDto {
  id: string;
  tenancyId?: string;
  tenantName?: string;
  unitId?: string;
  unitLabel?: string;
  sharePercent: number;
  recoverableShare: number;
  billedOnAccount: number;
  difference: number;
  capAdjustment: number;
  outcome: ReconciliationOutcome;
  balancingInvoiceId?: string;
  creditNoteId?: string;
  isDisputed: boolean;
}

export interface ApportionmentScheduleDto {
  id: string;
  name: string;
  propertyId?: string;
  basis: ApportionmentBasis;
  appliesToHead?: ServiceChargeHead;
  effectiveFrom: string;
  effectiveTo?: string;
  isActive: boolean;
  totalPercent: number;
  isBalanced: boolean;
  lines: ApportionmentLineDto[];
}

export interface ApportionmentLineDto {
  id?: string;
  unitId?: string;
  unitLabel?: string;
  tenancyId?: string;
  tenantName?: string;
  area?: AreaDto;
  sharePercent: number;
  fixedAmount: number;
  isExempt: boolean;
  exemptionReason?: string;
}

export interface ServiceChargeInvoiceDto {
  id: string;
  invoiceNumber: string;
  tenancyId?: string;
  tenantName?: string;
  unitId?: string;
  unitLabel?: string;
  invoiceType: string;
  issuedOn: string;
  dueDate: string;
  periodFrom: string;
  periodTo: string;
  amount: number;
  taxAmount: number;
  totalAmount: number;
  paidAmount: number;
  balance: number;
  sharePercent: number;
  status: InstalmentStatus;
  isDisputed: boolean;
  documentUrl?: string;
}

export interface TurnoverRentTermDto {
  id?: string;
  tenancyId: string;
  basis: TurnoverRentBasis;
  breakpointAmount: number;
  percent: number;
  calculationPeriod: string;
  periodStartMonth: string;
  excludedSalesCategories?: string;
  requiresAuditedFigures: boolean;
  declarationDueDays: number;
  offsetBaseRent: boolean;
  isActive: boolean;
  slabs: TurnoverRentSlabDto[];
}

export interface TurnoverRentSlabDto {
  id?: string;
  fromSales: number;
  toSales?: number;
  percent: number;
  sortOrder: number;
}

export interface TenantSalesDeclarationDto {
  id: string;
  tenancyId: string;
  tenancyReference: string;
  tenantName: string;
  unitLabel?: string;
  periodFrom: string;
  periodTo: string;
  dueOn: string;
  declaredOn?: string;
  grossSales: number;
  excludedSales: number;
  netSales: number;
  transactionCount?: number;
  footfallCount?: number;
  declarationSource: string;
  isAudited: boolean;
  auditedSales?: number;
  variance?: number;
  isLate: boolean;
  latePenalty?: number;
  isEstimated: boolean;
  supportingDocumentUrl?: string;
  salesPerSqFt?: number;
}

export interface OverageInvoiceDto {
  id: string;
  invoiceNumber: string;
  tenancyId: string;
  tenantName: string;
  unitLabel?: string;
  periodFrom: string;
  periodTo: string;
  issuedOn: string;
  dueDate: string;
  declaredSales: number;
  breakpointApplied: number;
  salesAboveBreakpoint: number;
  percentApplied: number;
  grossOverage: number;
  baseRentOffset: number;
  netOverage: number;
  taxAmount: number;
  totalAmount: number;
  paidAmount: number;
  status: InstalmentStatus;
  isProvisional: boolean;
  currencyCode: string;
  documentUrl?: string;
}

export interface RecoveryChargeDto {
  id?: string;
  chargeType: string;
  label: string;
  basis: ChargeBasis;
  rate: number;
  amount: number;
  frequency: RentFrequency;
  effectiveFrom: string;
  effectiveTo?: string;
  isTaxable: boolean;
  taxPercent: number;
  includeInRentRun: boolean;
  isActive: boolean;
}

export interface LeaseConcessionDto {
  id?: string;
  concessionType: string;
  fromDate: string;
  toDate: string;
  amount: number;
  discountPercent?: number;
  isAmortised: boolean;
  amortisationMonths: number;
  monthlyAmortisation: number;
  clawbackOnEarlyBreak: boolean;
  note?: string;
}

export interface VoidRecordDto {
  id: string;
  propertyId: string;
  addressOneLine: string;
  unitId?: string;
  unitLabel?: string;
  area?: AreaDto;
  vacantFrom: string;
  letFrom?: string;
  daysVoid: number;
  askingRent: number;
  lostRent: number;
  holdingCost: number;
  currencyCode: string;
  enquiryCount: number;
  viewingCount: number;
  voidReason?: string;
  refurbishmentRequired: boolean;
  isClosed: boolean;
}

export interface TenantCategoryDto {
  id: string;
  name: string;
  code?: string;
  parentCategoryId?: string;
  targetMixPercent: number;
  currentMixPercent: number;
  variance: number;
  unitCount: number;
  area?: AreaDto;
  colourHex?: string;
  sortOrder: number;
}

export interface LandlordListItemDto {
  id: string;
  reference: string;
  partyId: string;
  name: string;
  phone?: string;
  email?: string;
  defaultService: ManagementService;
  defaultFeePercent: number;
  propertyCount: number;
  tenancyCount: number;
  monthlyRent: number;
  totalRentCollected: number;
  currentBalance: number;
  arrearsOnPortfolio: number;
  currencyCode: string;
  payoutsOnHold: boolean;
  holdReason?: string;
  isNonResident: boolean;
  withholdingPercent: number;
  managedByName?: string;
  openComplianceIssues: number;
}

export interface LandlordDetailDto extends LandlordListItemDto {
  payoutFrequency: string;
  payoutDay: number;
  bankName?: string;
  accountTitle?: string;
  accountNumber?: string;
  sortCodeOrIban?: string;
  bankDetailsVerified: boolean;
  taxExemptionReference?: string;
  exemptionValidUntil?: string;
  floatRequired: number;
  floatBalance: number;
  repairAuthorityLimit: number;
  statementChannel: NotificationChannel;
  portalAccessEnabled: boolean;
  notes?: string;
  agreements: ManagementAgreementDto[];
  properties: PropertyListItemDto[];
  tenancies: TenancyListItemDto[];
  statements: OwnerStatementDto[];
  workOrders: WorkOrderListItemDto[];
  timeline: TimelineEntryDto[];
}

export interface ManagementAgreementDto {
  id: string;
  reference: string;
  propertyId?: string;
  addressOneLine?: string;
  service: ManagementService;
  feePercent: number;
  fixedMonthlyFee: number;
  setupFee: number;
  renewalFee: number;
  tenantFindFee: number;
  startDate: string;
  endDate?: string;
  noticePeriodDays: number;
  repairAuthorityLimit: number;
  canSignTenancyOnBehalf: boolean;
  canServeNoticeOnBehalf: boolean;
  holdsDeposit: boolean;
  documentUrl?: string;
  signedOn?: string;
  isActive: boolean;
  terminatedOn?: string;
}

export interface OwnerStatementDto {
  id: string;
  reference: string;
  landlordId: string;
  landlordName: string;
  propertyId?: string;
  addressOneLine?: string;
  periodFrom: string;
  periodTo: string;
  issuedOn: string;
  openingBalance: number;
  rentCollected: number;
  otherIncome: number;
  managementFee: number;
  maintenanceCost: number;
  otherDeductions: number;
  taxWithheld: number;
  floatRetained: number;
  netPayable: number;
  closingBalance: number;
  currencyCode: string;
  documentUrl?: string;
  ownerPayoutId?: string;
  isPublishedToPortal: boolean;
  isSent: boolean;
  lines: OwnerStatementLineDto[];
}

export interface OwnerStatementLineDto {
  id: string;
  entryDate: string;
  addressOneLine?: string;
  category: string;
  description: string;
  incomeAmount: number;
  deductionAmount: number;
  workOrderId?: string;
  supportingDocumentUrl?: string;
  sortOrder: number;
}

export interface OwnerPayoutDto {
  id: string;
  reference: string;
  payoutDate: string;
  officeName?: string;
  landlordCount: number;
  totalAmount: number;
  totalWithheld: number;
  currencyCode: string;
  paymentMethod: string;
  bankFileUrl?: string;
  batchReference?: string;
  submittedAt?: string;
  submittedByName?: string;
  approvalOutcome?: ApprovalOutcome;
  isCompleted: boolean;
  failedCount: number;
  heldCount: number;
  failureSummary?: string;
  lines: OwnerPayoutLineDto[];
}

export interface OwnerPayoutLineDto {
  id: string;
  landlordId: string;
  landlordName: string;
  ownerStatementId?: string;
  grossAmount: number;
  withheldAmount: number;
  netAmount: number;
  accountNumber?: string;
  paymentReference?: string;
  isHeld: boolean;
  holdReason?: string;
  failed: boolean;
  failureReason?: string;
  isPaid: boolean;
}

export interface ClientAccountDto {
  id: string;
  name: string;
  reference: string;
  kind: ClientAccountKind;
  bankName?: string;
  accountNumber?: string;
  currencyCode: string;
  officeName?: string;
  landlordName?: string;
  balance: number;
  unallocatedBalance: number;
  isOverdrawn: boolean;
  lastReconciledOn?: string;
  reconciliationIntervalDays: number;
  reconciliationOverdue: boolean;
  openExceptionCount: number;
  isActive: boolean;
}

export interface ClientLedgerEntryDto {
  id: string;
  entryDate: string;
  entryType: string;
  description: string;
  debitAmount: number;
  creditAmount: number;
  runningBalance: number;
  partyName?: string;
  addressOneLine?: string;
  isReconciled: boolean;
  reconciledOn?: string;
  bankReference?: string;
  isCorrection: boolean;
  authorisedByName?: string;
}

/**
 * The three-way reconciliation. Bank, control account and the sum of client balances must all
 * agree, and this says plainly when they do not.
 */
export interface ClientMoneyReconciliationDto {
  id: string;
  reference: string;
  clientAccountId?: string;
  accountName?: string;
  reconciliationDate: string;
  bankStatementBalance: number;
  ledgerControlBalance: number;
  sumOfClientBalances: number;
  unpresentedPayments: number;
  undepositedReceipts: number;
  adjustedBankBalance: number;
  difference: number;
  isBalanced: boolean;
  currencyCode: string;
  exceptionCount: number;
  preparedByName?: string;
  reviewedByName?: string;
  signedOffAt?: string;
  bankStatementUrl?: string;
  notes?: string;
  isOverdue: boolean;
  exceptions: ClientMoneyExceptionDto[];
}

export interface ClientMoneyExceptionDto {
  id: string;
  kind: ClientMoneyExceptionKind;
  severity: AlertSeverity;
  description: string;
  amount?: number;
  raisedOn: string;
  partyName?: string;
  assignedToName?: string;
  isResolved: boolean;
  resolvedOn?: string;
  resolution?: string;
  requiresRegulatoryReport: boolean;
  isReported: boolean;
  daysOpen: number;
}


/* ── CoreInterfaces ─────────────────────────────────────────────── */

/** Search shape for the property list and the map. */
export interface PropertySearchDto extends ListQueryDto {
  categories?: PropertyCategory[];
  subTypes?: PropertySubType[];
  statuses?: PropertyStatus[];
  geoAreaId?: string;
  ownerPartyId?: string;
  minPrice?: number;
  maxPrice?: number;
  minArea?: number;
  maxArea?: number;
  inputAreaUnit?: AreaUnit;
  minBedrooms?: number;
  maxBedrooms?: number;
  occupancy?: OccupancyState;
  hasLitigation?: boolean;
  /** Draw-your-own-area search. Beats a list of area ids when the patch is irregular. */
  boundaryGeoJson?: string;
  nearLatitude?: number;
  nearLongitude?: number;
  radiusKm?: number;
}

export interface ListingSearchDto extends ListQueryDto {
  kinds?: ListingKind[];
  statuses?: ListingStatus[];
  agentId?: string;
  geoAreaId?: string;
  subTypes?: PropertySubType[];
  minPrice?: number;
  maxPrice?: number;
  minBedrooms?: number;
  staleOnly?: boolean;
  portalChannelId?: string;
  publishState?: PortalPublishState;
}

export interface PartySearchDto extends ListQueryDto {
  role?: PartyRoleKind;
  kind?: PartyKind;
  kycStatus?: KycStatus;
  cautionedOnly?: boolean;
  withOutstandingOnly?: boolean;
  ownerAgentId?: string;
}

export interface EnquirySearchDto extends ListQueryDto {
  stages?: EnquiryStage[];
  channels?: EnquiryChannel[];
  assignedAgentId?: string;
  channelPartnerId?: string;
  campaignId?: string;
  interest?: ListingKind;
  breachingSlaOnly?: boolean;
  unassignedOnly?: boolean;
  overdueFollowUpOnly?: boolean;
  minScore?: number;
  itemsPerColumn?: number;
}


/* ── EstateInterfaces ─────────────────────────────────────────────── */

export interface ComplaintSearchDto extends ListQueryDto {
  societyId?: string;
  unitId?: string;
  categories?: ComplaintCategory[];
  statuses?: TicketStatus[];
  priority?: TicketPriority;
  assignedToUserId?: string;
  contractorId?: string;
  breachingSlaOnly?: boolean;
}

export interface WorkOrderSearchDto extends ListQueryDto {
  statuses?: WorkOrderStatus[];
  sources?: WorkOrderSource[];
  priority?: TicketPriority;
  propertyId?: string;
  societyId?: string;
  contractorId?: string;
  assignedToUserId?: string;
  trade?: string;
  breachingSlaOnly?: boolean;
  awaitingAuthorisationOnly?: boolean;
}


/* ── OperationsInterfaces ─────────────────────────────────────────────── */

export interface BookingSearchDto extends ListQueryDto {
  statuses?: BookingStatus[];
  unitId?: string;
  partyId?: string;
  channelPartnerId?: string;
  salesExecutiveId?: string;
  sourcingChannel?: SourcingChannel;
  overdueOnly?: boolean;
  defaultingOnly?: boolean;
  minCollectionPercent?: number;
  maxCollectionPercent?: number;
}

export interface ReceiptSearchDto extends ListQueryDto {
  partyId?: string;
  bookingId?: string;
  tenancyId?: string;
  instrument?: PaymentInstrument;
  status?: ReceiptStatus;
  unallocatedOnly?: boolean;
  clientMoneyOnly?: boolean;
}

export interface CollectionQueryDto extends ListQueryDto {
  assignedToUserId?: string;
  minDaysOverdue?: number;
  minAmount?: number;
  ageingBucket?: string;
  withPromiseOnly?: boolean;
  brokenPromiseOnly?: boolean;
  dunningStep?: number;
}

export interface TenancySearchDto extends ListQueryDto {
  statuses?: TenancyStatus[];
  kinds?: TenancyKind[];
  propertyId?: string;
  landlordId?: string;
  tenantPartyId?: string;
  managedByUserId?: string;
  inArrearsOnly?: boolean;
  expiringOnly?: boolean;
  expiringWithinDays?: number;
  managementService?: ManagementService;
}

