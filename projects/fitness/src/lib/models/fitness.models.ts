/**
 * The wire shapes for `@nexcore/fitness`.
 *
 * These mirror `Fitness.Application.DTOs` field for field. Optional properties are the ones the
 * server may legitimately omit; a property typed `T | null` is one the server always sends and
 * may send as null, which is a different thing and worth keeping distinct.
 */

import {
  AccessDecision, AccessDenialReason, AgreementChangeKind, AgreementStatus, AlertSeverity,
  AntiPassbackMode, AppointmentKind, AppointmentStatus, AreaKind, AssetStatus, BillingAnchor,
  BillingPeriod, BillingRunStatus, BookingChannel, BookingPaymentKind, BookingStatus,
  CashMovementKind, CashSessionStatus, CertificationStatus, ChallengeMetric, ChargeKind,
  ChurnFactorKind, ChurnRiskBand, ClassOccurrenceStatus, ClearanceStatus, ClubType,
  CommissionBasis, CommissionStatementStatus, ComplaintStatus, CorporateBillingModel,
  CredentialStatus, CredentialType, DiscountKind, DocumentKind, DunningAction,
  DunningCaseStatus, EffortZone, EligibilityProof, EntitlementKind, EntitlementLimit,
  ExerciseCategory, FacilityCheckKind, FreezeReason, Gender, GoalStatus, HouseholdRole,
  IncidentKind, IncidentSeverity, IncidentStatus, InteractionKind, InvoiceStatus,
  JourneyStepKind, JourneyTrigger, LeadActivityKind, LeadSourceKind, LeadStatus, LeaveReason,
  LedgerEntryKind, LockerSize, LockerStatus, LostPropertyStatus, LoyaltyEventKind,
  MaintenanceTrigger, MeasureDirection, MeasureType, MemberAlertKind, MemberStatus,
  MessageChannel, MessageStatus, OfflineAccessPolicy, PaymentFailureReason, PaymentMethod,
  PaymentStatus, PlanKind, PolicyOutcome, ProrationRule, RankAwardStatus, ReaderDirection,
  ReportPeriod, ResourceBookingStatus, ResourceKind, RevenueRecognitionBasis, SaveOfferKind,
  ScoreType, ScreeningAnswerKind, SessionCreditMovementKind, ShiftStatus, SignatureStatus,
  StaffRoleKind, SuspensionReason, UnitSystem, VisitKind, WorkOrderPriority, WorkOrderStatus,
  WorkoutSectionKind,
} from './fitness.enums';

/** Standard NexCore envelope. */
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface PaginatedResponse<T> {
  success: boolean;
  message?: string;
  data: T[];
  pagination?: {
    totalCount: number;
    pageNumber: number;
    pageSize: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    startIndex: number;
    endIndex: number;
  };
}

// ── Clubs and settings ──────────────────────────────────────────────────────────

export interface ClubDto {
  id: string;
  code?: string | null;
  name: string;
  clubType: ClubType;
  phone?: string | null;
  email?: string | null;
  addressLine?: string | null;
  city?: string | null;
  postCode?: string | null;
  countryCode?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  timeZoneId?: string | null;
  currencyCode: string;
  unitSystem: UnitSystem;
  warehouseId?: string | null;
  posStoreId?: string | null;
  defaultTaxGroupId?: string | null;
  defaultTaxPercent: number;
  softCapacity?: number | null;
  hardCapacity?: number | null;
  currentOccupancy: number;
  defaultBookingPolicyId?: string | null;
  defaultCancellationPolicyId?: string | null;
  defaultDunningPolicyId?: string | null;
  accessBalanceThreshold: number;
  antiPassback: AntiPassbackMode;
  antiPassbackMinutes: number;
  offlinePolicy: OfflineAccessPolicy;
  minimumAge: number;
  guardianRequiredBelowAge: number;
  requiresWaiver: boolean;
  requiresHealthScreening: boolean;
  allowsCrossClubVisits: boolean;
  crossClubVisitFee: number;
  isTemporarilyClosed: boolean;
  closureNote?: string | null;
  logoUrl?: string | null;
  receiptFooter?: string | null;
  brandCode?: string | null;
  isActive: boolean;
  description?: string | null;
  schedules: ClubScheduleDto[];
  activeMemberCount: number;
  inClubNow: number;
  classesToday: number;
  isOpenNow: boolean;
}

export interface SaveClubDto {
  code?: string | null;
  name: string;
  clubType: ClubType;
  phone?: string | null;
  email?: string | null;
  addressLine?: string | null;
  city?: string | null;
  postCode?: string | null;
  countryCode?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  timeZoneId?: string | null;
  currencyCode: string;
  unitSystem: UnitSystem;
  warehouseId?: string | null;
  posStoreId?: string | null;
  defaultTaxGroupId?: string | null;
  defaultTaxPercent: number;
  softCapacity?: number | null;
  hardCapacity?: number | null;
  defaultBookingPolicyId?: string | null;
  defaultCancellationPolicyId?: string | null;
  defaultDunningPolicyId?: string | null;
  accessBalanceThreshold: number;
  antiPassback: AntiPassbackMode;
  antiPassbackMinutes: number;
  offlinePolicy: OfflineAccessPolicy;
  minimumAge: number;
  guardianRequiredBelowAge: number;
  requiresWaiver: boolean;
  requiresHealthScreening: boolean;
  allowsCrossClubVisits: boolean;
  crossClubVisitFee: number;
  isTemporarilyClosed: boolean;
  closureNote?: string | null;
  logoUrl?: string | null;
  receiptFooter?: string | null;
  brandCode?: string | null;
  isActive: boolean;
  description?: string | null;
}

export interface ClubScheduleDto {
  id: string;
  clubId: string;
  dayOfWeek: number;
  overrideDate?: string | null;
  opensAt: string;
  closesAt: string;
  staffedFrom?: string | null;
  staffedTo?: string | null;
  isClosed: boolean;
  note?: string | null;
}

export interface ClubClosureDto {
  id: string;
  clubId: string;
  startsOn: string;
  endsOn: string;
  reason: string;
  memberNotice?: string | null;
  cancelsClasses: boolean;
  extendsAgreements: boolean;
  blocksAccess: boolean;
  /** Filled on save so a manager sees the blast radius before it happens. */
  classesAffected: number;
  bookingsAffected: number;
}

export interface ClubAreaDto {
  id: string;
  clubId: string;
  name: string;
  kind: AreaKind;
  displayOrder: number;
  capacity?: number | null;
  currentOccupancy: number;
  requiresEntitlement: boolean;
  minimumAge?: number | null;
  maxParticipantsPerStaff?: number | null;
  isOutOfService: boolean;
  outOfServiceNote?: string | null;
  isActive: boolean;
  doorCount: number;
}

export interface RoomDto {
  id: string;
  clubId: string;
  areaId?: string | null;
  areaName?: string | null;
  name: string;
  capacity: number;
  displayOrder: number;
  hasSpotMap: boolean;
  gridColumns: number;
  gridRows: number;
  equipmentNote?: string | null;
  isOutOfService: boolean;
  isActive: boolean;
  spots: RoomSpotDto[];
}

export interface RoomSpotDto {
  id: string;
  roomId: string;
  label: string;
  gridColumn: number;
  gridRow: number;
  equipmentAssetId?: string | null;
  isReserved: boolean;
  reservedNote?: string | null;
  isOutOfService: boolean;
  /** Filled by the booking screen: who has this spot for the class being viewed. */
  bookedByMemberId?: string | null;
  bookedByName?: string | null;
}

/** Saves a room and its whole spot map in one call, the way the designer edits it. */
export interface SaveRoomLayoutDto {
  roomId?: string | null;
  clubId: string;
  areaId?: string | null;
  name: string;
  capacity: number;
  hasSpotMap: boolean;
  gridColumns: number;
  gridRows: number;
  equipmentNote?: string | null;
  spots: RoomSpotDto[];
}

export interface FitnessSettingsDto {
  id: string;
  memberNumberPrefix: string;
  defaultNoticePeriodDays: number;
  defaultCoolingOffDays: number;
  maxFreezeDaysPerYear: number;
  defaultFreezeFeePerMonth: number;
  defaultBillingAnchor: BillingAnchor;
  fixedBillingDayOfMonth: number;
  defaultProration: ProrationRule;
  invoiceGraceDays: number;
  defaultLateFee: number;
  autoRunBilling: boolean;
  billingRunTime: string;
  accessCacheSeconds: number;
  captureImageOnDenial: boolean;
  absenceRiskDays: number;
  criticalAbsenceDays: number;
  autoScoreChurn: boolean;
  quietHoursFrom: string;
  quietHoursTo: string;
  respectQuietHours: boolean;
  fromEmail?: string | null;
  fromName?: string | null;
  smsSenderId?: string | null;
  leadResponseSlaMinutes: number;
  discountApprovalThresholdPercent: number;
  refundApprovalThreshold: number;
  writeOffApprovalThreshold: number;
  requirePinForOverrides: boolean;
}

// ── Members ─────────────────────────────────────────────────────────────────────

/**
 * A member in a list. Deliberately narrow — a twenty-thousand-row list must not carry the whole
 * 360 for each row, and the columns here are the ones a receptionist searches and scans by.
 */
export interface MemberSummaryDto {
  id: string;
  memberNumber: string;
  fullName: string;
  preferredName?: string | null;
  photoUrl?: string | null;
  phone?: string | null;
  email?: string | null;
  status: MemberStatus;
  homeClubId: string;
  homeClubName?: string | null;
  planName?: string | null;
  joinedOn?: string | null;
  nextBillingOn?: string | null;
  accountBalance: number;
  lastVisitOn?: string | null;
  daysSinceLastVisit: number;
  totalVisits: number;
  riskBand: ChurnRiskBand;
  hasBlockingAlert: boolean;
  alertCount: number;
  isBanned: boolean;
  isCheckedIn: boolean;
}

/**
 * The whole member record on one payload.
 * One call rather than nine because the desk opens this with a person standing in front of them:
 * nine round trips is nine chances to be slow, and the receptionist reads the alerts, the
 * balance and the plan in the same glance.
 */
export interface MemberDetailDto {
  id: string;
  memberNumber: string;
  contactId?: string | null;
  firstName: string;
  lastName: string;
  fullName: string;
  preferredName?: string | null;
  dateOfBirth?: string | null;
  age?: number | null;
  gender: Gender;
  nationalId?: string | null;
  occupation?: string | null;
  photoUrl?: string | null;
  phone?: string | null;
  alternatePhone?: string | null;
  email?: string | null;
  addressLine?: string | null;
  city?: string | null;
  postCode?: string | null;
  countryCode?: string | null;
  preferredLanguage?: string | null;
  preferredChannel: MessageChannel;
  status: MemberStatus;
  homeClubId: string;
  homeClubName?: string | null;
  joinedOn?: string | null;
  firstJoinedOn?: string | null;
  leftOn?: string | null;
  tenureDays: number;
  householdId?: string | null;
  householdName?: string | null;
  corporateAccountId?: string | null;
  corporateAccountName?: string | null;
  assignedCoachId?: string | null;
  assignedCoachName?: string | null;
  referredByMemberId?: string | null;
  referredByName?: string | null;
  leadSourceName?: string | null;
  accountBalance: number;
  creditBalance: number;
  nextBillingOn?: string | null;
  nextBillingAmount?: number | null;
  lifetimeValue: number;
  lastVisitOn?: string | null;
  daysSinceLastVisit: number;
  totalVisits: number;
  visitsThisMonth: number;
  visitFrequencyBaseline: number;
  currentStreakDays: number;
  loyaltyPoints: number;
  loyaltyTierName?: string | null;
  riskBand: ChurnRiskBand;
  riskScore: number;
  riskReasons: string[];
  waiverSigned: boolean;
  waiverSignedOn?: string | null;
  waiverCurrent: boolean;
  medicalClearance: ClearanceStatus;
  medicalSummary?: string | null;
  isBanned: boolean;
  banReason?: string | null;
  banUntil?: string | null;
  photoConsent: boolean;
  leaderboardOptIn: boolean;
  isAnonymised: boolean;
  agreements: AgreementSummaryDto[];
  alerts: MemberAlertDto[];
  emergencyContacts: EmergencyContactDto[];
  medicalFlags: MedicalFlagDto[];
  credentials: MemberCredentialDto[];
  tags: string[];
  credits: SessionCreditSummaryDto[];
  householdMembers: HouseholdMemberDto[];
  /** The next few things in their diary — classes, PT, court bookings, all in one list. */
  upcomingBookings: UpcomingBookingDto[];
  isCheckedIn: boolean;
  checkedInAt?: string | null;
}

export interface SaveMemberDto {
  firstName: string;
  lastName: string;
  preferredName?: string | null;
  dateOfBirth?: string | null;
  gender: Gender;
  nationalId?: string | null;
  occupation?: string | null;
  photoUrl?: string | null;
  phone?: string | null;
  alternatePhone?: string | null;
  email?: string | null;
  addressLine?: string | null;
  city?: string | null;
  postCode?: string | null;
  countryCode?: string | null;
  preferredLanguage?: string | null;
  preferredChannel: MessageChannel;
  homeClubId: string;
  householdId?: string | null;
  corporateAccountId?: string | null;
  assignedCoachId?: string | null;
  leadSourceId?: string | null;
  referredByMemberId?: string | null;
  medicalSummary?: string | null;
  photoConsent: boolean;
  leaderboardOptIn: boolean;
  emergencyContacts: EmergencyContactDto[];
  tags: string[];
}

/**
 * The join wizard's payload: person, plan, paperwork and payment in one transaction.
 * One call because joining is one decision. Splitting it across four endpoints creates the
 * half-joined member — signed but unbilled, or billed but with no waiver — which every club has
 * a hundred of and nobody can explain.
 */
export interface JoinMemberDto {
  member: SaveMemberDto;
  planId: string;
  clubId: string;
  startsOn: string;
  promotionRuleId?: string | null;
  promoCodeText?: string | null;
  priceOverride?: number | null;
  priceOverrideReason?: string | null;
  waiveJoiningFee: boolean;
  paymentMethod: PaymentMethod;
  paymentMethodRefId?: string | null;
  /** Collect the first payment now rather than waiting for the next billing run. */
  takeFirstPaymentNow: boolean;
  amountTendered?: number | null;
  soldByStaffId?: string | null;
  leadId?: string | null;
  waiverTemplateId?: string | null;
  signatureImageUrl?: string | null;
  guardianName?: string | null;
  guardianRelationship?: string | null;
  healthScreening?: HealthScreeningDto | null;
  credentialType?: CredentialType | null;
  credentialIdentifier?: string | null;
  consents: MemberConsentDto[];
}

/** What the join produced, so the wizard can print, hand over a fob and move on. */
export interface JoinResultDto {
  memberId: string;
  memberNumber: string;
  agreementId: string;
  agreementNumber: string;
  invoiceId?: string | null;
  amountDue: number;
  amountPaid: number;
  changeDue: number;
  firstBillingOn: string;
  recurringAmount: number;
  credentialId?: string | null;
  /** Anything still outstanding before they can actually train. */
  outstandingRequirements: string[];
}

export interface EmergencyContactDto {
  id: string;
  memberId: string;
  name: string;
  relationship: string;
  phone: string;
  alternatePhone?: string | null;
  email?: string | null;
  isPrimary: boolean;
}

export interface MedicalFlagDto {
  id: string;
  memberId: string;
  category: string;
  detail: string;
  severity: AlertSeverity;
  visibleToInstructors: boolean;
  reviewOn?: string | null;
  resolvedOn?: string | null;
}

export interface MemberNoteDto {
  id: string;
  memberId: string;
  kind: InteractionKind;
  body: string;
  occurredAt: string;
  isPrivate: boolean;
  isPinned: boolean;
  staffId?: string | null;
  authorName?: string | null;
  relatedEntityId?: string | null;
  relatedEntityType?: string | null;
}

export interface MemberAlertDto {
  id: string;
  memberId: string;
  kind: MemberAlertKind;
  severity: AlertSeverity;
  message: string;
  actionLabel?: string | null;
  actionRoute?: string | null;
  blocksAccess: boolean;
  expiresOn?: string | null;
  acknowledgedAt?: string | null;
}

export interface MemberCredentialDto {
  id: string;
  memberId: string;
  type: CredentialType;
  identifier: string;
  status: CredentialStatus;
  issuedOn: string;
  expiresOn?: string | null;
  deactivatedOn?: string | null;
  deactivationReason?: string | null;
  replacementFee: number;
  lastUsedAt?: string | null;
}

export interface IssueCredentialDto {
  memberId: string;
  type: CredentialType;
  identifier: string;
  expiresOn?: string | null;
  /** Deactivates the credential being replaced and charges the fee, in one step. */
  replacesCredentialId?: string | null;
  replacementFee: number;
  chargeReplacementFee: boolean;
}

export interface MemberConsentDto {
  id: string;
  memberId: string;
  channel: MessageChannel;
  purpose: string;
  granted: boolean;
  decidedAt: string;
  consentText?: string | null;
  capturedVia?: string | null;
}

export interface MemberDocumentDto {
  id: string;
  memberId: string;
  kind: DocumentKind;
  fileName: string;
  fileUrl: string;
  contentType?: string | null;
  sizeBytes: number;
  validFrom?: string | null;
  expiresOn?: string | null;
  isSensitive: boolean;
  createdAt: string;
}

export interface MemberStatusHistoryDto {
  id: string;
  fromStatus: MemberStatus;
  toStatus: MemberStatus;
  changedAt: string;
  reason?: string | null;
  changedByName?: string | null;
}

export interface HouseholdDto {
  id: string;
  name: string;
  primaryMemberId: string;
  primaryMemberName?: string | null;
  addressLine?: string | null;
  city?: string | null;
  postCode?: string | null;
  anyAdultMayCheckInChildren: boolean;
  combinedBalance: number;
  members: HouseholdMemberDto[];
}

export interface HouseholdMemberDto {
  id: string;
  householdId: string;
  memberId: string;
  memberName: string;
  photoUrl?: string | null;
  memberStatus: MemberStatus;
  age?: number | null;
  role: HouseholdRole;
  mayCollectChildren: boolean;
  agesOutOn?: string | null;
  agesOutSoon: boolean;
}

export interface SaveHouseholdDto {
  /** Null creates a household; set edits the one it names. */
  id?: string | null;
  name: string;
  primaryMemberId: string;
  addressLine?: string | null;
  city?: string | null;
  postCode?: string | null;
  anyAdultMayCheckInChildren: boolean;
  members: HouseholdMemberDto[];
}

export interface UpcomingBookingDto {
  id: string;
  /** Class, appointment or resource — the member does not care which table it came from. */
  bookingType: string;
  title: string;
  startsAt: string;
  endsAt: string;
  location?: string | null;
  staffName?: string | null;
  spotLabel?: string | null;
  status: BookingStatus;
  isWaitlisted: boolean;
  waitlistPosition?: number | null;
  route: string;
}

export interface SessionCreditSummaryDto {
  id: string;
  kind: EntitlementKind;
  label: string;
  remaining: number;
  held: number;
  granted: number;
  expiresOn?: string | null;
  expiringSoon: boolean;
}

export interface ChangeMemberStatusDto {
  memberId: string;
  newStatus: MemberStatus;
  reason?: string | null;
}

export interface BanMemberDto {
  memberId: string;
  isBanned: boolean;
  reason?: string | null;
  until?: string | null;
}

/**
 * Folding one duplicate member into another. Previewed before it is committed, because a merge
 * cannot be un-run and "same person joined twice" is usually only mostly true.
 */
export interface MergeMembersDto {
  /** The record that survives. */
  keepMemberId: string;
  /** The record folded in and then closed. */
  mergeMemberId: string;
  /** Field-level choices, where the two records disagree. */
  fieldChoices: Record<string, string>;
  previewOnly: boolean;
}

export interface MergePreviewDto {
  keepMemberId: string;
  mergeMemberId: string;
  /** Fields where the records disagree, with both values, so a human decides. */
  conflicts: MergeConflictDto[];
  agreementsMoved: number;
  invoicesMoved: number;
  visitsMoved: number;
  bookingsMoved: number;
  combinedBalance: number;
  warnings: string[];
}

export interface MergeConflictDto {
  field: string;
  keepValue?: string | null;
  mergeValue?: string | null;
}

/** Everything held about a member, for a data-subject access request. */
export interface MemberExportDto {
  member: MemberDetailDto;
  agreements: AgreementSummaryDto[];
  invoices: InvoiceSummaryDto[];
  ledger: MemberLedgerEntryDto[];
  visits: VisitHistoryDto[];
  notes: MemberNoteDto[];
  consents: MemberConsentDto[];
  documents: MemberDocumentDto[];
  assessments: AssessmentDto[];
  statusHistory: MemberStatusHistoryDto[];
  generatedAt: string;
}

/**
 * Erasure. Identity is replaced with a tombstone; what records law requires the club to keep —
 * financial transactions, incident reports — survives with the person's name removed.
 */
export interface AnonymiseMemberDto {
  memberId: string;
  reason: string;
  /** Confirms the operator understands it cannot be undone. */
  confirmIrreversible: boolean;
}

// ── What the club sells ─────────────────────────────────────────────────────────

export interface MembershipPlanDto {
  id: string;
  code?: string | null;
  name: string;
  kind: PlanKind;
  marketingBlurb?: string | null;
  imageUrl?: string | null;
  colourHex?: string | null;
  displayOrder: number;
  price: number;
  currencyCode: string;
  taxPercent: number;
  priceIncludesTax: boolean;
  billingPeriod: BillingPeriod;
  billingAnchor: BillingAnchor;
  joinProration: ProrationRule;
  cancelProration: ProrationRule;
  joiningFee: number;
  adminFee: number;
  cardFee: number;
  annualMaintenanceFee: number;
  annualFeeMonth?: number | null;
  minimumTermMonths: number;
  durationMonths?: number | null;
  noticePeriodDays: number;
  autoRenews: boolean;
  earlyTerminationFee: number;
  earlyTerminationPercentOfRemaining: number;
  creditCount: number;
  validForDays: number;
  creditsTransferable: boolean;
  creditsRefundable: boolean;
  restrictedToClubId?: string | null;
  allowsCrossClubAccess: boolean;
  visitsPerPeriod: number;
  visitLimitBasis: EntitlementLimit;
  guestPassesPerPeriod: number;
  bookingWindowDays: number;
  maxConcurrentBookings: number;
  sellableFrom?: string | null;
  sellableTo?: string | null;
  sellableAtDesk: boolean;
  sellableOnline: boolean;
  sellableInApp: boolean;
  sellableAtKiosk: boolean;
  isPrivate: boolean;
  minimumAge?: number | null;
  maximumAge?: number | null;
  requiredProof: EligibilityProof;
  waiverTemplateId?: string | null;
  agreementTemplateId?: string | null;
  requiresHealthScreening: boolean;
  inventoryItemId?: string | null;
  recognitionBasis: RevenueRecognitionBasis;
  revenueAccountId?: string | null;
  deferredRevenueAccountId?: string | null;
  version: number;
  isActive: boolean;
  description?: string | null;
  clubPrices: PlanPriceDto[];
  entitlements: PlanEntitlementDto[];
  activeMemberCount: number;
  monthlyRecurringRevenue: number;
  soldLast30Days: number;
}

export interface SavePlanDto {
  code?: string | null;
  name: string;
  kind: PlanKind;
  marketingBlurb?: string | null;
  imageUrl?: string | null;
  colourHex?: string | null;
  displayOrder: number;
  price: number;
  currencyCode: string;
  taxPercent: number;
  priceIncludesTax: boolean;
  billingPeriod: BillingPeriod;
  billingAnchor: BillingAnchor;
  joinProration: ProrationRule;
  cancelProration: ProrationRule;
  joiningFee: number;
  adminFee: number;
  cardFee: number;
  annualMaintenanceFee: number;
  annualFeeMonth?: number | null;
  minimumTermMonths: number;
  durationMonths?: number | null;
  noticePeriodDays: number;
  autoRenews: boolean;
  earlyTerminationFee: number;
  earlyTerminationPercentOfRemaining: number;
  creditCount: number;
  validForDays: number;
  creditsTransferable: boolean;
  creditsRefundable: boolean;
  restrictedToClubId?: string | null;
  allowsCrossClubAccess: boolean;
  visitsPerPeriod: number;
  visitLimitBasis: EntitlementLimit;
  guestPassesPerPeriod: number;
  bookingWindowDays: number;
  maxConcurrentBookings: number;
  sellableFrom?: string | null;
  sellableTo?: string | null;
  sellableAtDesk: boolean;
  sellableOnline: boolean;
  sellableInApp: boolean;
  sellableAtKiosk: boolean;
  isPrivate: boolean;
  minimumAge?: number | null;
  maximumAge?: number | null;
  requiredProof: EligibilityProof;
  waiverTemplateId?: string | null;
  agreementTemplateId?: string | null;
  requiresHealthScreening: boolean;
  inventoryItemId?: string | null;
  recognitionBasis: RevenueRecognitionBasis;
  revenueAccountId?: string | null;
  deferredRevenueAccountId?: string | null;
  isActive: boolean;
  description?: string | null;
  clubPrices: PlanPriceDto[];
  entitlements: PlanEntitlementDto[];
  /**
   * Whether a price change applies to members already on this plan. Defaults to no, because
   * silently repricing four hundred live agreements is a decision, not a side effect.
   */
  applyPriceChangeToExisting: boolean;
}

export interface PlanPriceDto {
  id: string;
  planId: string;
  clubId: string;
  clubName?: string | null;
  price: number;
  joiningFee?: number | null;
  currencyCode?: string | null;
  effectiveFrom?: string | null;
  effectiveTo?: string | null;
  isAvailable: boolean;
}

export interface PlanEntitlementDto {
  id: string;
  planId: string;
  kind: EntitlementKind;
  targetId?: string | null;
  targetName?: string | null;
  limit: EntitlementLimit;
  quantity: number;
  overageFee: number;
  allowOverage: boolean;
  timeBands: AccessTimeBandDto[];
}

export interface AccessTimeBandDto {
  id: string;
  name: string;
  daysOfWeekMask: number;
  startsAt: string;
  endsAt: string;
}

export interface PlanChangePathDto {
  id: string;
  fromPlanId: string;
  fromPlanName?: string | null;
  toPlanId: string;
  toPlanName?: string | null;
  effectiveImmediately: boolean;
  proration: ProrationRule;
  changeFee: number;
  restartsMinimumTerm: boolean;
  requiresApproval: boolean;
}

export interface PromotionRuleDto {
  id: string;
  name: string;
  planId?: string | null;
  planName?: string | null;
  clubId?: string | null;
  discountKind: DiscountKind;
  value: number;
  periodCount: number;
  activeFrom?: string | null;
  activeTo?: string | null;
  newMembersOnly: boolean;
  maxRedemptions: number;
  redemptionCount: number;
  campaignId?: string | null;
  displayOrder: number;
  isActive: boolean;
  codes: PromoCodeDto[];
}

export interface PromoCodeDto {
  id: string;
  promotionRuleId: string;
  codeText: string;
  maxUses: number;
  useCount: number;
  onePerMember: boolean;
  expiresOn?: string | null;
  issuedToMemberId?: string | null;
  isActive: boolean;
}

/** Whether a code can be used here, and what it is worth — checked before it is applied. */
export interface PromoCodeCheckDto {
  codeText: string;
  planId?: string | null;
  clubId?: string | null;
  memberId?: string | null;
}

export interface PromoCodeResultDto {
  isValid: boolean;
  reason?: string | null;
  promotionRuleId?: string | null;
  promotionName?: string | null;
  discountKind?: DiscountKind | null;
  value?: number | null;
  periodCount: number;
  originalPrice?: number | null;
  discountedPrice?: number | null;
  savingPerPeriod?: number | null;
}

export interface AppointmentServiceDto {
  id: string;
  name: string;
  kind: AppointmentKind;
  durationMinutes: number;
  bufferMinutes: number;
  price: number;
  taxPercent: number;
  maxParticipants: number;
  requiredResourceId?: string | null;
  requiredRoomId?: string | null;
  freeCancelHours: number;
  lateCancelOutcome: PolicyOutcome;
  noShowOutcome: PolicyOutcome;
  colourHex?: string | null;
  description?: string | null;
  displayOrder: number;
  bookableOnline: boolean;
  isActive: boolean;
}

/**
 * The catalogue a join wizard or a till renders: what may be sold here, priced for this club,
 * already filtered to what the operator is allowed to offer.
 */
export interface SalesCatalogueDto {
  clubId: string;
  clubName: string;
  currencyCode: string;
  memberships: MembershipPlanDto[];
  packs: MembershipPlanDto[];
  passes: MembershipPlanDto[];
  services: AppointmentServiceDto[];
  products: RetailProductDto[];
  activePromotions: PromotionRuleDto[];
}

/** A pro-shop line resolved against Inventory, with the stock figure the till needs. */
export interface RetailProductDto {
  id: string;
  inventoryItemId?: string | null;
  name: string;
  barcode?: string | null;
  category?: string | null;
  imageUrl?: string | null;
  price: number;
  taxPercent: number;
  unitCost: number;
  stockOnHand: number;
  tracksStock: boolean;
  isActive: boolean;
}

// ── Agreements, freezes and leaving ─────────────────────────────────────────────

export interface AgreementSummaryDto {
  id: string;
  agreementNumber: string;
  memberId: string;
  memberName?: string | null;
  memberNumber?: string | null;
  planId: string;
  planName: string;
  planKind: PlanKind;
  clubId: string;
  clubName?: string | null;
  status: AgreementStatus;
  startsOn: string;
  minimumTermEndsOn?: string | null;
  endsOn?: string | null;
  cancellationEffectiveOn?: string | null;
  price: number;
  promotionalPrice?: number | null;
  promotionalPeriodsRemaining: number;
  currencyCode: string;
  billingPeriod: BillingPeriod;
  nextBillingOn?: string | null;
  nextBillingAmount?: number | null;
  creditsRemaining: number;
  creditsGranted: number;
  creditsExpireOn?: string | null;
  /** Live freeze, when one is running, so the badge on the record is accurate. */
  isFrozen: boolean;
  frozenUntil?: string | null;
  isInMinimumTerm: boolean;
  priceLocked: boolean;
}

export interface AgreementDetailDto extends AgreementSummaryDto {
  planVersion: number;
  signedOn?: string | null;
  cancelledOn?: string | null;
  coolingOffEndsOn?: string | null;
  isInCoolingOff: boolean;
  taxPercent: number;
  billingAnchor: BillingAnchor;
  billingDayOfMonth?: number | null;
  noticePeriodDays: number;
  autoRenews: boolean;
  promotionRuleId?: string | null;
  promotionName?: string | null;
  periodsBilled: number;
  totalInstalments: number;
  lastBilledOn?: string | null;
  paymentMethodRefId?: string | null;
  paymentMethodLabel?: string | null;
  payerMemberId?: string | null;
  payerName?: string | null;
  corporateAccountId?: string | null;
  corporateAccountName?: string | null;
  thirdPartyPayerId?: string | null;
  leaveReason?: LeaveReason | null;
  leaveNote?: string | null;
  earlyTerminationFeeCharged: number;
  supersedesAgreementId?: string | null;
  supersededByAgreementId?: string | null;
  soldByStaffId?: string | null;
  soldByName?: string | null;
  signatureImageUrl?: string | null;
  documentUrl?: string | null;
  amendments: AgreementAmendmentDto[];
  freezes: MembershipFreezeDto[];
  upcomingCharges: BillingScheduleDto[];
  entitlements: PlanEntitlementDto[];
  /** Total billed under this agreement so far — the number a save conversation needs. */
  lifetimeBilled: number;
  lifetimeCollected: number;
}

export interface CreateAgreementDto {
  memberId: string;
  planId: string;
  clubId: string;
  startsOn: string;
  priceOverride?: number | null;
  priceOverrideReason?: string | null;
  promotionRuleId?: string | null;
  promoCodeText?: string | null;
  waiveJoiningFee: boolean;
  paymentMethodRefId?: string | null;
  payerMemberId?: string | null;
  corporateAccountId?: string | null;
  thirdPartyPayerId?: string | null;
  billingDayOfMonth?: number | null;
  soldByStaffId?: string | null;
  leadId?: string | null;
  takeFirstPaymentNow: boolean;
  priceLocked: boolean;
}

/**
 * What a plan change will actually cost, computed before it is committed.
 * Shown to the member before they agree, because a proration they were not warned about is the
 * single most common billing complaint in this industry.
 */
export interface PlanChangePreviewDto {
  agreementId: string;
  newPlanId: string;
  newPlanName: string;
  isAllowed: boolean;
  blockReason?: string | null;
  effectiveImmediately: boolean;
  effectiveOn: string;
  currentPrice: number;
  newPrice: number;
  priceDifference: number;
  prorationCredit: number;
  prorationCharge: number;
  changeFee: number;
  dueNow: number;
  /** Plain-English arithmetic, printed under the number. */
  explanation?: string | null;
  restartsMinimumTerm: boolean;
  newMinimumTermEndsOn?: string | null;
  requiresApproval: boolean;
  nextBillingOn: string;
  nextBillingAmount: number;
}

export interface ChangePlanDto {
  agreementId: string;
  newPlanId: string;
  effectiveOn?: string | null;
  priceOverride?: number | null;
  waiveChangeFee: boolean;
  reason?: string | null;
  collectDueNow: boolean;
}

export interface AgreementAmendmentDto {
  id: string;
  agreementId: string;
  kind: AgreementChangeKind;
  effectiveOn: string;
  previousPrice?: number | null;
  newPrice?: number | null;
  previousPlanId?: string | null;
  previousPlanName?: string | null;
  newPlanId?: string | null;
  newPlanName?: string | null;
  changeFee: number;
  prorationAmount: number;
  reason?: string | null;
  approvedByName?: string | null;
  documentUrl?: string | null;
  createdAt: string;
}

export interface AgreementTemplateDto {
  id: string;
  name: string;
  version: number;
  clubId?: string | null;
  countryCode?: string | null;
  languageCode?: string | null;
  bodyHtml: string;
  effectiveFrom: string;
  effectiveTo?: string | null;
  requiresGuardianSignature: boolean;
  isPublished: boolean;
  isActive: boolean;
  signatureCount: number;
}

export interface AgreementSignatureDto {
  id: string;
  agreementId: string;
  templateId?: string | null;
  templateVersion: number;
  signerName: string;
  guardianName?: string | null;
  guardianRelationship?: string | null;
  status: SignatureStatus;
  signedAt?: string | null;
  signatureImageUrl?: string | null;
  capturedVia?: string | null;
  ipAddress?: string | null;
}

export interface SignAgreementDto {
  agreementId: string;
  templateId?: string | null;
  signerName: string;
  signatureImageUrl?: string | null;
  guardianName?: string | null;
  guardianRelationship?: string | null;
  guardianSignatureUrl?: string | null;
  capturedVia?: string | null;
}

/** Sends the agreement out to be signed remotely, rather than at the desk. */
export interface RequestRemoteSignatureDto {
  agreementId: string;
  channel: MessageChannel;
  expiryHours: number;
  message?: string | null;
}

export interface MembershipFreezeDto {
  id: string;
  agreementId: string;
  memberId: string;
  memberName?: string | null;
  startsOn: string;
  endsOn: string;
  actuallyEndedOn?: string | null;
  reason: FreezeReason;
  reasonNote?: string | null;
  feePerPeriod: number;
  totalFeeCharged: number;
  daysExtended: number;
  isMedical: boolean;
  countsAgainstAllowance: boolean;
  supportingDocumentId?: string | null;
  approvedByName?: string | null;
  approvedAt?: string | null;
  isReleased: boolean;
  isCurrentlyActive: boolean;
}

export interface RequestFreezeDto {
  agreementId: string;
  startsOn: string;
  endsOn: string;
  reason: FreezeReason;
  reasonNote?: string | null;
  isMedical: boolean;
  supportingDocumentId?: string | null;
  feeOverride?: number | null;
  waiveFee: boolean;
}

/** What a freeze will do, before it is agreed: the fee, the days added, the billing that moves. */
export interface FreezePreviewDto {
  isAllowed: boolean;
  blockReason?: string | null;
  startsOn: string;
  endsOn: string;
  freezeDays: number;
  freezeDaysUsedThisYear: number;
  freezeDaysAllowance: number;
  freezeDaysRemaining: number;
  fee: number;
  /** Charges that will be skipped, and the new dates they move to. */
  skippedCharges: BillingScheduleDto[];
  newMinimumTermEndsOn?: string | null;
  newNextBillingOn: string;
  explanation?: string | null;
}

export interface EndFreezeDto {
  freezeId: string;
  endOn?: string | null;
  reason?: string | null;
}

export interface MembershipSuspensionDto {
  id: string;
  memberId: string;
  memberName?: string | null;
  agreementId?: string | null;
  startsOn: string;
  endsOn?: string | null;
  liftedOn?: string | null;
  reason: SuspensionReason;
  reasonNote?: string | null;
  continuesBilling: boolean;
  autoLiftsWhenResolved: boolean;
  imposedByName?: string | null;
  liftedByName?: string | null;
  isCurrentlyActive: boolean;
}

export interface SuspendMemberDto {
  memberId: string;
  agreementId?: string | null;
  reason: SuspensionReason;
  reasonNote?: string | null;
  endsOn?: string | null;
  continuesBilling: boolean;
  autoLiftsWhenResolved: boolean;
}

export interface CancellationRequestDto {
  id: string;
  agreementId: string;
  agreementNumber?: string | null;
  memberId: string;
  memberName?: string | null;
  planName?: string | null;
  requestedOn: string;
  effectiveOn: string;
  reason: LeaveReason;
  reasonNote?: string | null;
  channel?: string | null;
  earlyTerminationFee: number;
  refundDue: number;
  outstandingBalance: number;
  wasSaved: boolean;
  savedOn?: string | null;
  isProcessed: boolean;
  lifetimeValue: number;
  tenureMonths: number;
  offers: SaveOfferDto[];
}

/** What cancelling will cost and when it takes effect, shown before anyone commits. */
export interface CancellationPreviewDto {
  agreementId: string;
  requestedOn: string;
  effectiveOn: string;
  noticePeriodDays: number;
  isInMinimumTerm: boolean;
  minimumTermEndsOn?: string | null;
  monthsRemainingInTerm: number;
  isInCoolingOff: boolean;
  earlyTerminationFee: number;
  finalCharge: number;
  refundDue: number;
  outstandingBalance: number;
  netDue: number;
  explanation?: string | null;
  /** Everything still booked, which is what a member is actually giving up. */
  bookingsToCancel: UpcomingBookingDto[];
  unusedCredits: number;
  unusedCreditValue: number;
  /** Offers worth making, given this member's history. */
  suggestedOffers: SaveOfferSuggestionDto[];
}

export interface SaveOfferSuggestionDto {
  kind: SaveOfferKind;
  label: string;
  rationale: string;
  value?: number | null;
  periodCount?: number | null;
  alternativePlanId?: string | null;
  /** How often this offer has actually worked for this reason, at this club. */
  historicAcceptRatePercent: number;
}

export interface RequestCancellationDto {
  agreementId: string;
  reason: LeaveReason;
  reasonNote?: string | null;
  requestedEffectiveOn?: string | null;
  channel?: string | null;
  waiveEarlyTerminationFee: boolean;
  waiverReason?: string | null;
}

export interface SaveOfferDto {
  id: string;
  cancellationRequestId: string;
  kind: SaveOfferKind;
  summary: string;
  discountValue?: number | null;
  periodCount?: number | null;
  alternativePlanId?: string | null;
  offeredAt: string;
  offeredByName?: string | null;
  wasAccepted: boolean;
  respondedAt?: string | null;
  declineNote?: string | null;
}

export interface MakeSaveOfferDto {
  cancellationRequestId: string;
  kind: SaveOfferKind;
  summary: string;
  discountValue?: number | null;
  periodCount?: number | null;
  alternativePlanId?: string | null;
}

export interface RespondToSaveOfferDto {
  saveOfferId: string;
  accepted: boolean;
  note?: string | null;
}

// ── Billing, invoices and payments ──────────────────────────────────────────────

export interface BillingScheduleDto {
  id: string;
  agreementId: string;
  memberId: string;
  memberName?: string | null;
  clubId: string;
  dueOn: string;
  periodNumber: number;
  periodStart: string;
  periodEnd: string;
  chargeKind: ChargeKind;
  amount: number;
  taxAmount: number;
  currencyCode: string;
  invoiceId?: string | null;
  isBilled: boolean;
  isSkipped: boolean;
  skipReason?: string | null;
  originalAmount?: number | null;
  adjustmentNote?: string | null;
}

export interface BillingRunDto {
  id: string;
  runNumber: string;
  billingDate: string;
  clubId?: string | null;
  clubName?: string | null;
  planId?: string | null;
  status: BillingRunStatus;
  isPreview: boolean;
  isAutomatic: boolean;
  startedAt?: string | null;
  completedAt?: string | null;
  durationSeconds?: number | null;
  totalScheduled: number;
  invoicesCreated: number;
  paymentsCollected: number;
  paymentsFailed: number;
  skipped: number;
  errors: number;
  totalBilled: number;
  totalCollected: number;
  totalFailed: number;
  /** Collected as a share of billed. The one number a manager looks at after a run. */
  collectionRatePercent: number;
  errorSummary?: string | null;
  runByName?: string | null;
}

export interface BillingRunLineDto {
  id: string;
  memberId: string;
  memberName?: string | null;
  memberNumber?: string | null;
  agreementId?: string | null;
  invoiceId?: string | null;
  amount: number;
  outcome: string;
  failureReason?: PaymentFailureReason | null;
  message?: string | null;
}

export interface StartBillingRunDto {
  billingDate: string;
  clubId?: string | null;
  planId?: string | null;
  /** Computes everything and writes nothing, so a manager can look before it fires. */
  previewOnly: boolean;
  /** Attempt collection as well as raising invoices. */
  collectPayments: boolean;
}

export interface InvoiceSummaryDto {
  id: string;
  invoiceNumber: string;
  memberId: string;
  memberName?: string | null;
  memberNumber?: string | null;
  clubId: string;
  clubName?: string | null;
  status: InvoiceStatus;
  issuedOn: string;
  dueOn: string;
  paidOn?: string | null;
  total: number;
  amountPaid: number;
  balanceDue: number;
  currencyCode: string;
  daysOverdue: number;
  hasDunningCase: boolean;
  summaryLine?: string | null;
}

export interface InvoiceDetailDto extends InvoiceSummaryDto {
  agreementId?: string | null;
  agreementNumber?: string | null;
  corporateAccountId?: string | null;
  corporateAccountName?: string | null;
  payerMemberId?: string | null;
  payerName?: string | null;
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  amountRefunded: number;
  exchangeRate: number;
  billingRunId?: string | null;
  dunningCaseId?: string | null;
  documentUrl?: string | null;
  notes?: string | null;
  remindersSuppressed: boolean;
  lines: InvoiceLineDto[];
  payments: PaymentDto[];
  creditNotes: CreditNoteDto[];
}

export interface InvoiceLineDto {
  id: string;
  chargeKind: ChargeKind;
  lineDescription: string;
  periodStart?: string | null;
  periodEnd?: string | null;
  quantity: number;
  unitPrice: number;
  discountAmount: number;
  taxPercent: number;
  taxAmount: number;
  lineTotal: number;
  prorationExplanation?: string | null;
  planId?: string | null;
  displayOrder: number;
}

export interface PaymentDto {
  id: string;
  paymentNumber: string;
  memberId: string;
  memberName?: string | null;
  invoiceId?: string | null;
  invoiceNumber?: string | null;
  clubId: string;
  method: PaymentMethod;
  status: PaymentStatus;
  amount: number;
  refundedAmount: number;
  currencyCode: string;
  receivedOn: string;
  settledOn?: string | null;
  providerReference?: string | null;
  authorisationCode?: string | null;
  cardBrand?: string | null;
  cardLastFour?: string | null;
  mandateReference?: string | null;
  failureReason?: PaymentFailureReason | null;
  failureMessage?: string | null;
  attemptNumber: number;
  takenByName?: string | null;
  notes?: string | null;
}

/** Taking money at the desk, or recording that it arrived elsewhere. */
export interface TakePaymentDto {
  memberId: string;
  clubId: string;
  /** Null pays down the oldest outstanding balance rather than one invoice. */
  invoiceId?: string | null;
  amount: number;
  method: PaymentMethod;
  paymentMethodRefId?: string | null;
  providerReference?: string | null;
  authorisationCode?: string | null;
  cardBrand?: string | null;
  cardLastFour?: string | null;
  cashSessionId?: string | null;
  amountTendered?: number | null;
  notes?: string | null;
  /** Stops a double-tap taking the money twice. */
  idempotencyKey?: string | null;
}

export interface TakePaymentResultDto {
  paymentId: string;
  paymentNumber: string;
  amountTaken: number;
  changeDue: number;
  remainingBalance: number;
  status: PaymentStatus;
  /** Invoices this payment settled or part-settled. */
  appliedTo: InvoiceSummaryDto[];
  /** Set when paying the balance lifted a suspension, so the desk can say so. */
  accessRestored: boolean;
}

export interface PaymentMethodRefDto {
  id: string;
  memberId: string;
  method: PaymentMethod;
  providerName?: string | null;
  cardBrand?: string | null;
  cardLastFour?: string | null;
  expiryMonth?: number | null;
  expiryYear?: number | null;
  bankName?: string | null;
  accountLastFour?: string | null;
  accountHolderName?: string | null;
  isDefault: boolean;
  isActive: boolean;
  isExpiringSoon: boolean;
  isExpired: boolean;
  lastFailedOn?: string | null;
  consecutiveFailures: number;
  /** "Visa •••• 4242, expires 09/27" — what a human recognises. */
  displayLabel: string;
}

export interface SavePaymentMethodDto {
  memberId: string;
  method: PaymentMethod;
  /** Gateway token or bank mandate id. Never card data — this API refuses a PAN. */
  providerToken?: string | null;
  providerName?: string | null;
  cardBrand?: string | null;
  cardLastFour?: string | null;
  expiryMonth?: number | null;
  expiryYear?: number | null;
  bankName?: string | null;
  accountLastFour?: string | null;
  accountHolderName?: string | null;
  mandateReference?: string | null;
  makeDefault: boolean;
}

export interface DunningPolicyDto {
  id: string;
  name: string;
  clubId?: string | null;
  isDefault: boolean;
  writeOffAfterDays: number;
  suspendAccessAfterDays: number;
  isActive: boolean;
  steps: DunningStepDto[];
  openCaseCount: number;
  amountInRecovery: number;
}

export interface DunningStepDto {
  id: string;
  dunningPolicyId: string;
  stepNumber: number;
  delayDays: number;
  action: DunningAction;
  channel?: MessageChannel | null;
  messageTemplateId?: string | null;
  messageTemplateName?: string | null;
  feeAmount: number;
  skipOnTechnicalFailure: boolean;
}

export interface DunningCaseDto {
  id: string;
  caseNumber: string;
  memberId: string;
  memberName?: string | null;
  memberNumber?: string | null;
  memberPhone?: string | null;
  invoiceId?: string | null;
  invoiceNumber?: string | null;
  clubId: string;
  clubName?: string | null;
  status: DunningCaseStatus;
  openedOn: string;
  closedOn?: string | null;
  daysOpen: number;
  amountOutstanding: number;
  amountRecovered: number;
  lateFeesAdded: number;
  initialFailureReason: PaymentFailureReason;
  currentStep: number;
  totalSteps: number;
  nextAction?: string | null;
  nextStepDueOn?: string | null;
  retryAttempts: number;
  lastRetryOn?: string | null;
  isPaused: boolean;
  pauseReason?: string | null;
  assignedToStaffId?: string | null;
  assignedToName?: string | null;
  /** Whether the card on file is itself the problem, which changes what to do next. */
  hasValidPaymentMethod: boolean;
  accessSuspended: boolean;
  events: DunningEventDto[];
}

export interface DunningEventDto {
  id: string;
  stepNumber: number;
  action: DunningAction;
  occurredAt: string;
  succeeded: boolean;
  detail?: string | null;
  amountCollected?: number | null;
  performedByName?: string | null;
}

export interface DunningActionDto {
  dunningCaseId: string;
  /** Retry now, pause, resume, assign, write off, or record a promise to pay. */
  action: string;
  note?: string | null;
  assignToStaffId?: string | null;
  promiseToPayOn?: string | null;
}

export interface CreditNoteDto {
  id: string;
  creditNoteNumber: string;
  memberId: string;
  memberName?: string | null;
  invoiceId?: string | null;
  invoiceNumber?: string | null;
  amount: number;
  taxAmount: number;
  currencyCode: string;
  issuedOn: string;
  reason: string;
  appliedToBalance: boolean;
  approvedByName?: string | null;
  documentUrl?: string | null;
}

export interface IssueCreditNoteDto {
  memberId: string;
  invoiceId?: string | null;
  amount: number;
  reason: string;
  /** Credit the member's balance rather than reducing a specific invoice. */
  appliedToBalance: boolean;
}

export interface RefundDto {
  id: string;
  refundNumber: string;
  memberId: string;
  memberName?: string | null;
  paymentId?: string | null;
  invoiceId?: string | null;
  amount: number;
  currencyCode: string;
  method: PaymentMethod;
  status: PaymentStatus;
  requestedOn: string;
  processedOn?: string | null;
  reason: string;
  toOriginalMethod: boolean;
  approvedByName?: string | null;
}

export interface IssueRefundDto {
  memberId: string;
  paymentId?: string | null;
  invoiceId?: string | null;
  amount: number;
  reason: string;
  /** Back to the card, or onto the member's credit balance. */
  toOriginalMethod: boolean;
  cashSessionId?: string | null;
}

export interface WriteOffDto {
  id: string;
  memberId: string;
  memberName?: string | null;
  invoiceId?: string | null;
  dunningCaseId?: string | null;
  amount: number;
  writtenOffOn: string;
  reason: string;
  approvedByName?: string | null;
  wasRecovered: boolean;
  recoveredOn?: string | null;
  recoveredAmount: number;
}

export interface MemberLedgerEntryDto {
  id: string;
  kind: LedgerEntryKind;
  occurredAt: string;
  amount: number;
  balanceAfter: number;
  entryDescription: string;
  currencyCode: string;
  invoiceId?: string | null;
  invoiceNumber?: string | null;
  paymentId?: string | null;
  creditNoteId?: string | null;
  refundId?: string | null;
  /** Where clicking the row goes. */
  drillRoute?: string | null;
}

export interface DeferredRevenueScheduleDto {
  id: string;
  memberId: string;
  memberName?: string | null;
  agreementId?: string | null;
  invoiceId?: string | null;
  invoiceNumber?: string | null;
  basis: RevenueRecognitionBasis;
  totalAmount: number;
  recognisedAmount: number;
  remainingAmount: number;
  currencyCode: string;
  serviceStart: string;
  serviceEnd: string;
  totalUnits: number;
  consumedUnits: number;
  isClosed: boolean;
  percentRecognised: number;
}

/**
 * The roll-forward an accountant asks for: opening liability, what was added, what was earned,
 * closing liability. The report that reconciles this app's revenue with the ledger's.
 */
export interface DeferredRevenueReportDto {
  periodStart: string;
  periodEnd: string;
  currencyCode: string;
  openingBalance: number;
  additions: number;
  recognised: number;
  released: number;
  closingBalance: number;
  byCategory: DeferredRevenueLineDto[];
  byMonth: DeferredRevenueLineDto[];
}

export interface DeferredRevenueLineDto {
  label: string;
  opening: number;
  additions: number;
  recognised: number;
  closing: number;
  scheduleCount: number;
}

export interface CashSessionDto {
  id: string;
  sessionNumber: string;
  clubId: string;
  clubName?: string | null;
  openedByName?: string | null;
  closedByName?: string | null;
  status: CashSessionStatus;
  openedAt: string;
  closedAt?: string | null;
  openingFloat: number;
  cashSales: number;
  cardSales: number;
  otherSales: number;
  refunds: number;
  paidIn: number;
  paidOut: number;
  drops: number;
  expectedCash: number;
  countedCash: number;
  variance: number;
  wasBlindCount: boolean;
  transactionCount: number;
  varianceNote?: string | null;
  currencyCode: string;
  movements: CashMovementDto[];
}

export interface CashMovementDto {
  id: string;
  kind: CashMovementKind;
  occurredAt: string;
  amount: number;
  reason?: string | null;
  reference?: string | null;
  staffName?: string | null;
}

export interface OpenCashSessionDto {
  clubId: string;
  openingFloat: number;
  staffId?: string | null;
}

export interface CloseCashSessionDto {
  sessionId: string;
  countedCash: number;
  varianceNote?: string | null;
  /** Denomination breakdown, when the club counts that way. */
  denominationCounts?: Record<string, number> | null;
}

export interface CashMovementRequestDto {
  sessionId: string;
  kind: CashMovementKind;
  amount: number;
  reason?: string | null;
  reference?: string | null;
}

/** The day-end read: what was taken, by method, with the variance. */
export interface DayEndReadDto {
  clubId: string;
  clubName: string;
  forDate: string;
  isZRead: boolean;
  totalTakings: number;
  cashTakings: number;
  cardTakings: number;
  directDebitCollected: number;
  otherTakings: number;
  refunds: number;
  netTakings: number;
  expectedCash: number;
  countedCash: number;
  variance: number;
  transactionCount: number;
  joinCount: number;
  cancellationCount: number;
  visitCount: number;
  byCategory: RevenueLineDto[];
  currencyCode: string;
  generatedAt: string;
}

export interface RevenueLineDto {
  label: string;
  amount: number;
  count: number;
  percentOfTotal: number;
}

export interface GiftCardDto {
  id: string;
  cardNumber: string;
  clubId: string;
  initialValue: number;
  balance: number;
  currencyCode: string;
  issuedOn: string;
  expiresOn?: string | null;
  purchasedByMemberId?: string | null;
  purchasedByName?: string | null;
  recipientName?: string | null;
  recipientEmail?: string | null;
  message?: string | null;
  isRedeemed: boolean;
  isCancelled: boolean;
  isExpired: boolean;
}

export interface IssueGiftCardDto {
  clubId: string;
  value: number;
  cardNumber?: string | null;
  purchasedByMemberId?: string | null;
  recipientName?: string | null;
  recipientEmail?: string | null;
  message?: string | null;
  expiresOn?: string | null;
  paymentMethod: PaymentMethod;
  cashSessionId?: string | null;
}

// ── Access control and the front desk ───────────────────────────────────────────

/**
 * A credential presented at a door, a kiosk or a desk.
 * Deliberately small: this is the highest-traffic request in the product and it has a 300 ms
 * budget, so it carries an identifier and a context and nothing else.
 */
export interface AccessRequestDto {
  clubId: string;
  doorId?: string | null;
  credentialIdentifier: string;
  method: CredentialType;
  direction: ReaderDirection;
  /** Set when the panel decided this itself during an outage and is replaying it. */
  wasOfflineDecision: boolean;
  occurredAt?: string | null;
  controllerReference?: string | null;
}

/**
 * What the door does, and what the person is told.
 * The message is the point. "Access denied" makes a member queue at reception; "Your membership
 * is frozen until 3 March — see reception to restart it" sends them to the right place already
 * knowing what to ask for.
 */
export interface AccessDecisionDto {
  decision: AccessDecision;
  denialReason: AccessDenialReason;
  /** Written for the person at the door, never for the log. */
  message: string;
  memberId?: string | null;
  memberName?: string | null;
  preferredName?: string | null;
  photoUrl?: string | null;
  memberNumber?: string | null;
  memberStatus?: MemberStatus | null;
  checkInId?: string | null;
  accessEventId?: string | null;
  /** Warnings that did not block, so the kiosk can still say something useful. */
  alerts: MemberAlertDto[];
  /** What the member can do about a refusal, right now. */
  resolutionAction?: string | null;
  resolutionRoute?: string | null;
  amountDue?: number | null;
  /** Their next class or session, so the kiosk greeting is worth reading. */
  nextBooking?: UpcomingBookingDto | null;
  clubOccupancy: number;
  clubCapacity?: number | null;
  visitNumber: number;
  isMilestoneVisit: boolean;
  isBirthday: boolean;
  decisionMs: number;
}

export interface DoorDto {
  id: string;
  clubId: string;
  clubName?: string | null;
  areaId?: string | null;
  areaName?: string | null;
  name: string;
  direction: ReaderDirection;
  controllerId?: string | null;
  controllerName?: string | null;
  controllerOnline: boolean;
  readerAddress?: string | null;
  hardwareKind?: string | null;
  countsOccupancy: boolean;
  requiresClassBooking: boolean;
  classBookingWindowMinutes: number;
  staffOnly: boolean;
  antiPassbackOverride?: AntiPassbackMode | null;
  isActive: boolean;
  isHeldOpen: boolean;
  heldOpenReason?: string | null;
  entriesToday: number;
  denialsToday: number;
  lastEventAt?: string | null;
}

export interface SaveDoorDto {
  clubId: string;
  areaId?: string | null;
  name: string;
  direction: ReaderDirection;
  controllerId?: string | null;
  readerAddress?: string | null;
  hardwareKind?: string | null;
  countsOccupancy: boolean;
  requiresClassBooking: boolean;
  classBookingWindowMinutes: number;
  staffOnly: boolean;
  antiPassbackOverride?: AntiPassbackMode | null;
  isActive: boolean;
}

export interface AccessControllerDto {
  id: string;
  clubId: string;
  clubName?: string | null;
  name: string;
  vendor?: string | null;
  model?: string | null;
  firmwareVersion?: string | null;
  ipAddress?: string | null;
  serialNumber?: string | null;
  offlinePolicy: OfflineAccessPolicy;
  cacheSeconds: number;
  lastHeartbeatAt?: string | null;
  lastSyncAt?: string | null;
  pendingEventCount: number;
  isOnline: boolean;
  heartbeatTimeoutMinutes: number;
  secondsSinceHeartbeat?: number | null;
  isActive: boolean;
  doors: DoorDto[];
}

export interface SaveControllerDto {
  clubId: string;
  name: string;
  vendor?: string | null;
  model?: string | null;
  firmwareVersion?: string | null;
  ipAddress?: string | null;
  serialNumber?: string | null;
  offlinePolicy: OfflineAccessPolicy;
  cacheSeconds: number;
  heartbeatTimeoutMinutes: number;
  isActive: boolean;
}

/** The entitlement list a controller caches so it can keep working offline. */
export interface AccessCacheDto {
  controllerId: string;
  generatedAt: string;
  offlinePolicy: OfflineAccessPolicy;
  validSeconds: number;
  credentials: CachedCredentialDto[];
}

export interface CachedCredentialDto {
  identifier: string;
  memberId: string;
  isAllowed: boolean;
  /** Bit flags, Sunday = 1 … Saturday = 64, and the window inside those days. */
  daysOfWeekMask: number;
  fromTime?: string | null;
  toTime?: string | null;
  validUntil?: string | null;
  displayName?: string | null;
}

export interface AccessRuleDto {
  id: string;
  name: string;
  clubId?: string | null;
  balanceThreshold?: number | null;
  requiresWaiver: boolean;
  requiresMedicalClearance: boolean;
  respectsOccupancyCap: boolean;
  antiPassback: AntiPassbackMode;
  minimumAge?: number | null;
  requiresGuardian: boolean;
  maxVisitsPerPeriod: number;
  visitLimitBasis: EntitlementLimit;
  isDefault: boolean;
  isActive: boolean;
  windows: AccessRuleWindowDto[];
}

export interface AccessRuleWindowDto {
  id: string;
  daysOfWeekMask: number;
  startsAt: string;
  endsAt: string;
  label?: string | null;
}

export interface CheckInDto {
  id: string;
  clubId: string;
  clubName?: string | null;
  memberId?: string | null;
  memberName?: string | null;
  memberNumber?: string | null;
  photoUrl?: string | null;
  kind: VisitKind;
  checkedInAt: string;
  checkedOutAt?: string | null;
  durationMinutes?: number | null;
  autoClosed: boolean;
  method: CredentialType;
  doorId?: string | null;
  doorName?: string | null;
  areaId?: string | null;
  classBookingId?: string | null;
  className?: string | null;
  appointmentId?: string | null;
  hostMemberId?: string | null;
  hostMemberName?: string | null;
  wasManualEntry: boolean;
  checkedInByName?: string | null;
  feeCharged: number;
}

/** Manual check-in from the desk, where staff have already identified the person. */
export interface ManualCheckInDto {
  clubId: string;
  memberId: string;
  classBookingId?: string | null;
  appointmentId?: string | null;
  /** Lets a refused member in anyway. Always logged, always with a reason. */
  overrideDenial: boolean;
  overrideReason?: string | null;
}

export interface VisitHistoryDto {
  id: string;
  checkedInAt: string;
  checkedOutAt?: string | null;
  durationMinutes?: number | null;
  clubName: string;
  kind: VisitKind;
  activity?: string | null;
  method: CredentialType;
}

export interface AccessEventDto {
  id: string;
  clubId: string;
  clubName?: string | null;
  doorId?: string | null;
  doorName?: string | null;
  occurredAt: string;
  memberId?: string | null;
  memberName?: string | null;
  memberNumber?: string | null;
  staffId?: string | null;
  staffName?: string | null;
  credentialIdentifier?: string | null;
  method: CredentialType;
  decision: AccessDecision;
  denialReason: AccessDenialReason;
  decisionMessage?: string | null;
  direction: ReaderDirection;
  imageUrl?: string | null;
  wasOfflineDecision: boolean;
  replayedAt?: string | null;
  overriddenByName?: string | null;
  overrideReason?: string | null;
  decisionMs: number;
}

/** Live occupancy for the desk and for the dashboard. */
export interface OccupancyDto {
  clubId: string;
  clubName: string;
  occupancy: number;
  softCapacity?: number | null;
  hardCapacity?: number | null;
  percentFull: number;
  isOverSoftCap: boolean;
  isAtHardCap: boolean;
  asAt: string;
  areas: AreaOccupancyDto[];
  /** Everyone currently in the building, for a fire roll-call. */
  inClub: CheckInDto[];
}

export interface AreaOccupancyDto {
  areaId: string;
  areaName: string;
  kind: AreaKind;
  occupancy: number;
  capacity?: number | null;
  percentFull: number;
}

/** Occupancy over time, for the peak-hours heat map. */
export interface OccupancyTrendDto {
  clubId: string;
  from: string;
  to: string;
  points: OccupancyPointDto[];
  peakOccupancy: number;
  peakAt?: string | null;
}

export interface OccupancyPointDto {
  at: string;
  dayOfWeek: number;
  hour: number;
  occupancy: number;
  checkIns: number;
}

export interface GuestVisitDto {
  id: string;
  clubId: string;
  hostMemberId: string;
  hostMemberName?: string | null;
  guestName: string;
  guestPhone?: string | null;
  guestEmail?: string | null;
  guestDateOfBirth?: string | null;
  visitedOn: string;
  waiverSigned: boolean;
  usedHostAllowance: boolean;
  feeCharged: number;
  createdLeadId?: string | null;
}

export interface RegisterGuestDto {
  clubId: string;
  hostMemberId: string;
  guestName: string;
  guestPhone?: string | null;
  guestEmail?: string | null;
  guestDateOfBirth?: string | null;
  waiverTemplateId?: string | null;
  signatureImageUrl?: string | null;
  /** Take it from the host's allowance where there is one, otherwise charge. */
  useHostAllowance: boolean;
  feeOverride?: number | null;
  paymentMethod: PaymentMethod;
  cashSessionId?: string | null;
  /** Creates a lead so the guest is followed up, which is the entire point of guest passes. */
  createLead: boolean;
}

export interface DayPassDto {
  id: string;
  passNumber: string;
  clubId: string;
  clubName?: string | null;
  memberId?: string | null;
  visitorName: string;
  visitorPhone?: string | null;
  visitorEmail?: string | null;
  planId?: string | null;
  planName?: string | null;
  validFrom: string;
  validTo: string;
  maxEntries: number;
  entriesUsed: number;
  isExpired: boolean;
  isExhausted: boolean;
  amountPaid: number;
  waiverSigned: boolean;
  isTrial: boolean;
  createdLeadId?: string | null;
  issuedByName?: string | null;
  temporaryCredential?: string | null;
}

export interface IssueDayPassDto {
  clubId: string;
  planId?: string | null;
  memberId?: string | null;
  visitorName: string;
  visitorPhone?: string | null;
  visitorEmail?: string | null;
  visitorDateOfBirth?: string | null;
  validFrom: string;
  validTo?: string | null;
  maxEntries: number;
  priceOverride?: number | null;
  paymentMethod: PaymentMethod;
  cashSessionId?: string | null;
  waiverTemplateId?: string | null;
  signatureImageUrl?: string | null;
  isTrial: boolean;
  createLead: boolean;
  issueTemporaryCredential: boolean;
}

/**
 * Everything the front-desk screen renders, in one call.
 * The receptionist has a queue; the screen cannot be six requests deep. Search, who is in, what
 * is on, and what needs doing all arrive together.
 */
export interface FrontDeskDto {
  clubId: string;
  clubName: string;
  generatedAt: string;
  occupancy: OccupancyDto;
  recentCheckIns: CheckInDto[];
  classesToday: ClassOccurrenceSummaryDto[];
  appointmentsToday: AppointmentSummaryDto[];
  myTasks: RetentionTaskDto[];
  urgentAlerts: MemberAlertDto[];
  announcements: AnnouncementDto[];
  openLeads: number;
  leadsBreachingSla: number;
  overdueBalances: number;
  overdueAmount: number;
  waiversOutstanding: number;
  openCashSessionId?: string | null;
  cashSessionTakings: number;
  isOpenNow: boolean;
  isStaffedNow: boolean;
  closesAt?: string | null;
}

/** A quick lookup at the desk: type three letters of a name, a phone number, or scan a fob. */
export interface MemberSearchDto {
  query: string;
  clubId?: string | null;
  includeInactive: boolean;
  limit: number;
}

// ── Classes and bookings ────────────────────────────────────────────────────────

export interface ClassTypeDto {
  id: string;
  code?: string | null;
  name: string;
  discipline?: string | null;
  marketingBlurb?: string | null;
  imageUrl?: string | null;
  colourHex?: string | null;
  displayOrder: number;
  defaultDurationMinutes: number;
  defaultCapacity: number;
  intensity: number;
  equipmentNeeded?: string | null;
  minimumAge?: number | null;
  maximumAge?: number | null;
  requiresSkillClearance: boolean;
  requiredSkillId?: string | null;
  allowsDropIn: boolean;
  dropInPrice: number;
  creditCost: number;
  bookingPolicyId?: string | null;
  bookingPolicyName?: string | null;
  cancellationPolicyId?: string | null;
  cancellationPolicyName?: string | null;
  availableToMarketplace: boolean;
  isBookable: boolean;
  isActive: boolean;
  occurrencesLast30Days: number;
  averageAttendance: number;
  averageFillPercent: number;
}

export interface SaveClassTypeDto {
  code?: string | null;
  name: string;
  discipline?: string | null;
  marketingBlurb?: string | null;
  imageUrl?: string | null;
  colourHex?: string | null;
  displayOrder: number;
  defaultDurationMinutes: number;
  defaultCapacity: number;
  intensity: number;
  equipmentNeeded?: string | null;
  minimumAge?: number | null;
  maximumAge?: number | null;
  requiresSkillClearance: boolean;
  requiredSkillId?: string | null;
  allowsDropIn: boolean;
  dropInPrice: number;
  creditCost: number;
  bookingPolicyId?: string | null;
  cancellationPolicyId?: string | null;
  availableToMarketplace: boolean;
  isBookable: boolean;
  isActive: boolean;
  description?: string | null;
}

export interface ClassScheduleDto {
  id: string;
  clubId: string;
  classTypeId: string;
  classTypeName: string;
  colourHex?: string | null;
  roomId?: string | null;
  roomName?: string | null;
  instructorStaffId?: string | null;
  instructorName?: string | null;
  daysOfWeekMask: number;
  startsAt: string;
  durationMinutes: number;
  capacity: number;
  marketplaceCapacity: number;
  effectiveFrom: string;
  effectiveTo?: string | null;
  repeatEveryWeeks: number;
  generateAheadDays: number;
  generatedThrough?: string | null;
  isPublished: boolean;
  seasonCode?: string | null;
  isActive: boolean;
  upcomingOccurrences: number;
}

export interface SaveClassScheduleDto {
  clubId: string;
  classTypeId: string;
  roomId?: string | null;
  instructorStaffId?: string | null;
  daysOfWeekMask: number;
  startsAt: string;
  durationMinutes: number;
  capacity: number;
  marketplaceCapacity: number;
  effectiveFrom: string;
  effectiveTo?: string | null;
  repeatEveryWeeks: number;
  generateAheadDays: number;
  isPublished: boolean;
  seasonCode?: string | null;
}

/**
 * What is wrong with a timetable before it is published — the instructor in two rooms, the room
 * double-booked, a class inside a closure. Caught before members can see it, not after.
 */
export interface ScheduleConflictDto {
  conflictType: string;
  message: string;
  occursAt: string;
  scheduleId?: string | null;
  occurrenceId?: string | null;
  conflictsWithId?: string | null;
  conflictsWithLabel?: string | null;
  /** A blocker stops publish; a warning does not. */
  isBlocking: boolean;
}

export interface ClassOccurrenceSummaryDto {
  id: string;
  clubId: string;
  classTypeId: string;
  classTypeName: string;
  colourHex?: string | null;
  discipline?: string | null;
  intensity: number;
  roomId?: string | null;
  roomName?: string | null;
  instructorStaffId?: string | null;
  instructorName?: string | null;
  instructorPhotoUrl?: string | null;
  hasSubstitute: boolean;
  startsAt: string;
  endsAt: string;
  durationMinutes: number;
  status: ClassOccurrenceStatus;
  capacity: number;
  bookedCount: number;
  waitlistCount: number;
  attendedCount: number;
  noShowCount: number;
  spacesLeft: number;
  fillPercent: number;
  hasSpotMap: boolean;
  allowsDropIn: boolean;
  dropInPrice: number;
  bookingOpensAt?: string | null;
  bookingClosesAt?: string | null;
  bookingIsOpen: boolean;
  cancellationReason?: string | null;
  viewerIsBooked: boolean;
  viewerIsWaitlisted: boolean;
  viewerBookingId?: string | null;
  viewerCanBook: boolean;
  viewerBlockReason?: string | null;
}

export interface ClassOccurrenceDetailDto extends ClassOccurrenceSummaryDto {
  classScheduleId?: string | null;
  substituteStaffId?: string | null;
  substituteName?: string | null;
  marketplaceCapacity: number;
  marketplaceBookedCount: number;
  spotReleaseMinutes: number;
  cancelledAt?: string | null;
  cancellationNotified: boolean;
  workoutId?: string | null;
  workoutName?: string | null;
  note?: string | null;
  bookings: ClassBookingDto[];
  waitlist: ClassBookingDto[];
  spotMap: RoomSpotDto[];
}

/** The timetable a screen renders — a date range of occurrences with its filters resolved. */
export interface TimetableDto {
  clubId: string;
  clubName: string;
  from: string;
  to: string;
  occurrences: ClassOccurrenceSummaryDto[];
  classTypes: ClassTypeDto[];
  rooms: RoomDto[];
  instructors: StaffSummaryDto[];
  totalClasses: number;
  totalCapacity: number;
  totalBooked: number;
  averageFillPercent: number;
}

export interface UpdateOccurrenceDto {
  occurrenceId: string;
  roomId?: string | null;
  instructorStaffId?: string | null;
  substituteStaffId?: string | null;
  startsAt?: string | null;
  durationMinutes?: number | null;
  capacity?: number | null;
  workoutId?: string | null;
  note?: string | null;
  /** Tells everyone booked what changed. Almost always yes. */
  notifyBookedMembers: boolean;
}

export interface CancelOccurrenceDto {
  occurrenceId: string;
  reason: string;
  notifyBookedMembers: boolean;
  /** Credits always go back when the club cancels; this is here to be explicit about it. */
  refundCredits: boolean;
}

export interface ClassBookingDto {
  id: string;
  classOccurrenceId: string;
  className?: string | null;
  classStartsAt?: string | null;
  roomName?: string | null;
  instructorName?: string | null;
  memberId?: string | null;
  memberName?: string | null;
  memberNumber?: string | null;
  photoUrl?: string | null;
  guestName?: string | null;
  status: BookingStatus;
  paymentKind: BookingPaymentKind;
  channel: BookingChannel;
  bookedAt: string;
  checkedInAt?: string | null;
  cancelledAt?: string | null;
  spotId?: string | null;
  spotLabel?: string | null;
  creditsUsed: number;
  amountPaid: number;
  penaltyCharged: number;
  creditForfeited: boolean;
  strikeIssued: boolean;
  waitlistPosition?: number | null;
  promotedAt?: string | null;
  note?: string | null;
  /** Shown on the instructor's roster so a condition is not a surprise mid-class. */
  medicalFlags: MedicalFlagDto[];
  isFirstVisit: boolean;
  visitCount: number;
}

export interface CreateBookingDto {
  classOccurrenceId: string;
  memberId?: string | null;
  /** A non-member drop-in, taken at the desk. */
  guestName?: string | null;
  guestPhone?: string | null;
  guestEmail?: string | null;
  spotId?: string | null;
  channel: BookingChannel;
  /** Joins the waitlist rather than failing when the class is full. */
  joinWaitlistIfFull: boolean;
  /** Books past an entitlement or policy block. Manager only, always logged. */
  overridePolicy: boolean;
  overrideReason?: string | null;
  paymentMethod?: PaymentMethod | null;
  cashSessionId?: string | null;
  note?: string | null;
}

/** Whether this member may book this class, worked out before the button is pressed. */
export interface BookingEligibilityDto {
  canBook: boolean;
  blockReason?: string | null;
  canWaitlist: boolean;
  waitlistPosition?: number | null;
  paymentKind: BookingPaymentKind;
  creditsRequired: number;
  creditsAvailable: number;
  amountPayable: number;
  withinBookingWindow: boolean;
  bookingOpensAt?: string | null;
  hasEntitlement: boolean;
  hasSkillClearance: boolean;
  meetsAgeRequirement: boolean;
  withinConcurrentLimit: boolean;
  isBookingBanned: boolean;
  banEndsOn?: string | null;
  availableSpots: RoomSpotDto[];
}

export interface CancelBookingDto {
  bookingId: string;
  reason?: string | null;
  /** Waives the late-cancel penalty. Manager only, always logged. */
  waivePenalty: boolean;
  waiveReason?: string | null;
}

/** What cancelling now will cost, so the member is told before they confirm. */
export interface CancelBookingPreviewDto {
  bookingId: string;
  isLate: boolean;
  hoursUntilStart: number;
  freeCancelHours: number;
  outcome: PolicyOutcome;
  creditWillBeForfeited: boolean;
  feeWillBeCharged: number;
  strikeWillBeIssued: boolean;
  currentStrikes: number;
  strikeThreshold: number;
  willTriggerBan: boolean;
  explanation: string;
  waitlistLength: number;
}

export interface MarkAttendanceDto {
  classOccurrenceId: string;
  /** Bookings to mark attended. */
  attendedBookingIds: string[];
  /** Bookings to mark no-show, which applies the policy. */
  noShowBookingIds: string[];
  /** Members who turned up without booking. */
  walkInMemberIds: string[];
  /** Closes the class, so no-show penalties fire and the roster locks. */
  completeClass: boolean;
}

export interface BookingPolicyDto {
  id: string;
  name: string;
  clubId?: string | null;
  bookingOpensDaysBefore: number;
  bookingClosesMinutesBefore: number;
  maxConcurrentBookings: number;
  maxBookingsPerDay: number;
  maxBookingsPerWeek: number;
  waitlistEnabled: boolean;
  maxWaitlistLength: number;
  holdCreditOnWaitlist: boolean;
  waitlistConfirmMinutes: number;
  preventDuplicateSameDay: boolean;
  requiresPaymentUpFront: boolean;
  isDefault: boolean;
  isActive: boolean;
}

export interface CancellationPolicyDto {
  id: string;
  name: string;
  clubId?: string | null;
  freeCancelHours: number;
  lateCancelOutcome: PolicyOutcome;
  lateCancelFee: number;
  noShowOutcome: PolicyOutcome;
  noShowFee: number;
  noShowGraceMinutes: number;
  strikeThreshold: number;
  strikeWindowDays: number;
  bookingBanDays: number;
  isDefault: boolean;
  isActive: boolean;
}

export interface LateCancelStrikeDto {
  id: string;
  memberId: string;
  memberName?: string | null;
  occurredOn: string;
  wasNoShow: boolean;
  className?: string | null;
  feeCharged: number;
  expiresOn: string;
  isWaived: boolean;
  waivedReason?: string | null;
  waivedByName?: string | null;
}

export interface CourseEnrolmentDto {
  id: string;
  clubId: string;
  memberId: string;
  memberName?: string | null;
  classScheduleId: string;
  courseName: string;
  startsOn: string;
  endsOn: string;
  totalSessions: number;
  sessionsAttended: number;
  attendancePercent: number;
  price: number;
  invoiceId?: string | null;
  isCompleted: boolean;
  isWithdrawn: boolean;
  withdrawalReason?: string | null;
}

export interface MarketplaceChannelDto {
  id: string;
  name: string;
  clubId?: string | null;
  ratePerBooking: number;
  revenueSharePercent: number;
  currencyCode: string;
  offPeakOnly: boolean;
  defaultCapacityPerClass: number;
  apiEndpoint?: string | null;
  lastSyncAt?: string | null;
  isActive: boolean;
  bookingsThisMonth: number;
  revenueThisMonth: number;
  unreconciledAmount: number;
}

// ── Programming, results and ranks ──────────────────────────────────────────────

export interface BookableStaffDto {
  id: string;
  staffId: string;
  clubId: string;
  displayName: string;
  photoUrl?: string | null;
  bio?: string | null;
  specialities?: string | null;
  hourlyRate?: number | null;
  bookableOnline: boolean;
  defaultBufferMinutes: number;
  bookingWindowDays: number;
  isContractor: boolean;
  maxClientsPerDay: number;
  acceptingNewClients: boolean;
  isActive: boolean;
  serviceIds: string[];
  availability: StaffAvailabilityDto[];
  sessionsThisWeek: number;
  availableHoursThisWeek: number;
  bookedHoursThisWeek: number;
  utilisationPercent: number;
  activeClients: number;
}

export interface StaffAvailabilityDto {
  id: string;
  bookableStaffId: string;
  clubId?: string | null;
  dayOfWeek: number;
  startsAt: string;
  endsAt: string;
  breakStartsAt?: string | null;
  breakEndsAt?: string | null;
  effectiveFrom?: string | null;
  effectiveTo?: string | null;
}

export interface StaffTimeOffDto {
  id: string;
  staffId: string;
  staffName?: string | null;
  startsAt: string;
  endsAt: string;
  reason: string;
  note?: string | null;
  isAllDay: boolean;
  isApproved: boolean;
  approvedByName?: string | null;
}

export interface AppointmentSummaryDto {
  id: string;
  appointmentNumber: string;
  clubId: string;
  serviceId: string;
  serviceName: string;
  kind: AppointmentKind;
  colourHex?: string | null;
  staffId: string;
  staffName: string;
  memberId?: string | null;
  memberName?: string | null;
  memberPhotoUrl?: string | null;
  memberPhone?: string | null;
  status: AppointmentStatus;
  startsAt: string;
  endsAt: string;
  durationMinutes: number;
  roomName?: string | null;
  resourceName?: string | null;
  checkedInAt?: string | null;
  completedAt?: string | null;
  participantCount: number;
  isFirstSession: boolean;
  isSignedOff: boolean;
  creditsUsed: number;
  amountPaid: number;
}

export interface AppointmentDetailDto extends AppointmentSummaryDto {
  channel: BookingChannel;
  roomId?: string | null;
  resourceId?: string | null;
  cancelledAt?: string | null;
  cancellationReason?: string | null;
  paymentKind: BookingPaymentKind;
  sessionPackagePurchaseId?: string | null;
  invoiceId?: string | null;
  penaltyCharged: number;
  seriesId?: string | null;
  rescheduledFromId?: string | null;
  sessionNotes?: string | null;
  planForNextSession?: string | null;
  workoutId?: string | null;
  workoutName?: string | null;
  participants: AppointmentParticipantDto[];
  medicalFlags: MedicalFlagDto[];
  goals: MemberGoalDto[];
  /** Their last three sessions with this trainer, so the coach is not starting cold. */
  recentSessions: AppointmentSummaryDto[];
  sessionsRemaining: number;
}

export interface AppointmentParticipantDto {
  id: string;
  memberId: string;
  memberName: string;
  photoUrl?: string | null;
  status: AppointmentStatus;
  checkedInAt?: string | null;
  creditsUsed: number;
  amountPaid: number;
  penaltyCharged: number;
}

export interface CreateAppointmentDto {
  clubId: string;
  serviceId: string;
  staffId: string;
  memberId?: string | null;
  startsAt: string;
  durationMinutesOverride?: number | null;
  roomId?: string | null;
  resourceId?: string | null;
  channel: BookingChannel;
  paymentKind: BookingPaymentKind;
  sessionPackagePurchaseId?: string | null;
  paymentMethod?: PaymentMethod | null;
  cashSessionId?: string | null;
  /** Extra clients on a semi-private or small-group session. */
  additionalMemberIds: string[];
  /** Creates a repeating run rather than one appointment. */
  isRecurring: boolean;
  repeatEveryWeeks: number;
  occurrenceCount: number;
  overrideConflicts: boolean;
  note?: string | null;
}

/** Open slots for a trainer or a service, which is what a booking screen actually asks for. */
export interface AvailabilitySearchDto {
  clubId: string;
  staffId?: string | null;
  serviceId: string;
  from: string;
  to: string;
  memberId?: string | null;
  /** Searches every qualified trainer rather than one, for "first available". */
  anyStaff: boolean;
}

export interface AvailabilitySlotDto {
  staffId: string;
  staffName: string;
  photoUrl?: string | null;
  startsAt: string;
  endsAt: string;
  roomId?: string | null;
  roomName?: string | null;
  price: number;
  isPreferredCoach: boolean;
}

export interface SignOffSessionDto {
  appointmentId: string;
  memberId?: string | null;
  sessionNotes?: string | null;
  planForNextSession?: string | null;
  memberSignatureUrl?: string | null;
  memberConfirmed: boolean;
  creditsConsumed: number;
}

export interface SessionPackagePurchaseDto {
  id: string;
  purchaseNumber: string;
  memberId: string;
  memberName?: string | null;
  clubId: string;
  planId?: string | null;
  planName?: string | null;
  serviceId?: string | null;
  serviceName?: string | null;
  staffId?: string | null;
  staffName?: string | null;
  purchasedOn: string;
  sessionsPurchased: number;
  sessionsUsed: number;
  sessionsRemaining: number;
  totalPrice: number;
  pricePerSession: number;
  currencyCode: string;
  expiresOn?: string | null;
  isExpired: boolean;
  expiringSoon: boolean;
  daysToExpiry?: number | null;
  invoiceId?: string | null;
  soldByName?: string | null;
  isTransferable: boolean;
  isRefundable: boolean;
  /** Unearned value still sitting on this package — the deferred-revenue liability. */
  unearnedValue: number;
}

export interface SellPackageDto {
  memberId: string;
  clubId: string;
  planId?: string | null;
  serviceId?: string | null;
  staffId?: string | null;
  sessions: number;
  priceOverride?: number | null;
  priceOverrideReason?: string | null;
  expiresOn?: string | null;
  paymentMethod: PaymentMethod;
  takePaymentNow: boolean;
  cashSessionId?: string | null;
  soldByStaffId?: string | null;
}

export interface SessionCreditDto {
  id: string;
  memberId: string;
  sessionPackagePurchaseId?: string | null;
  agreementId?: string | null;
  serviceId?: string | null;
  serviceName?: string | null;
  classTypeId?: string | null;
  classTypeName?: string | null;
  kind: EntitlementKind;
  granted: number;
  used: number;
  held: number;
  remaining: number;
  expiresOn?: string | null;
  isExpired: boolean;
  unitValue: number;
  movements: SessionCreditMovementDto[];
}

export interface SessionCreditMovementDto {
  id: string;
  kind: SessionCreditMovementKind;
  occurredAt: string;
  quantity: number;
  balanceAfter: number;
  appointmentId?: string | null;
  classBookingId?: string | null;
  note?: string | null;
  performedByName?: string | null;
  context?: string | null;
}

export interface AdjustCreditsDto {
  memberId: string;
  sessionCreditId?: string | null;
  quantity: number;
  reason: string;
  newExpiryOn?: string | null;
}

export interface CoachAssignmentDto {
  id: string;
  memberId: string;
  memberName?: string | null;
  staffId: string;
  staffName?: string | null;
  clubId: string;
  assignedOn: string;
  endedOn?: string | null;
  endReason?: string | null;
  isPrimary: boolean;
}

export interface ExerciseDto {
  id: string;
  name: string;
  category: ExerciseCategory;
  muscleGroups?: string | null;
  equipment?: string | null;
  instructions?: string | null;
  videoUrl?: string | null;
  imageUrl?: string | null;
  scalingOptions?: string | null;
  tracksPersonalRecord: boolean;
  prScoreType?: ScoreType | null;
  isSystemExercise: boolean;
  isActive: boolean;
}

export interface WorkoutDto {
  id: string;
  name: string;
  clubId?: string | null;
  summary?: string | null;
  coachNotes?: string | null;
  scoreType?: ScoreType | null;
  scoreUnit?: string | null;
  timeCapSeconds?: number | null;
  isBenchmark: boolean;
  benchmarkName?: string | null;
  estimatedMinutes?: number | null;
  isTemplate: boolean;
  isActive: boolean;
  sections: WorkoutSectionDto[];
  resultCount: number;
  lastPerformedOn?: string | null;
}

export interface WorkoutSectionDto {
  id: string;
  workoutId: string;
  title: string;
  kind: WorkoutSectionKind;
  displayOrder: number;
  rounds?: number | null;
  durationSeconds?: number | null;
  restSeconds?: number | null;
  scoreType?: ScoreType | null;
  instructions?: string | null;
  movements: WorkoutMovementDto[];
}

export interface WorkoutMovementDto {
  id: string;
  workoutSectionId: string;
  exerciseId?: string | null;
  movementName: string;
  displayOrder: number;
  sets?: number | null;
  reps?: string | null;
  loadKg?: number | null;
  loadPercentOfMax?: number | null;
  distanceMetres?: number | null;
  calories?: number | null;
  durationSeconds?: number | null;
  restSeconds?: number | null;
  tempo?: string | null;
  scalingNote?: string | null;
}

export interface ProgramTrackDto {
  id: string;
  name: string;
  clubId?: string | null;
  colourHex?: string | null;
  displayOrder: number;
  isPublic: boolean;
  startsOn?: string | null;
  endsOn?: string | null;
  isActive: boolean;
  publishedDays: number;
  nextUnpublishedOn?: string | null;
}

export interface ProgramDayDto {
  id: string;
  programTrackId: string;
  trackName?: string | null;
  trackColour?: string | null;
  workoutId?: string | null;
  workoutName?: string | null;
  scheduledOn: string;
  clubId?: string | null;
  isPublished: boolean;
  publishAt?: string | null;
  coachBrief?: string | null;
  workout?: WorkoutDto | null;
  resultCount: number;
}

/** Today's programming across every track, which is what the whiteboard screen renders. */
export interface WodBoardDto {
  clubId: string;
  clubName: string;
  forDate: string;
  tracks: ProgramDayDto[];
  todaysLeaderboard: LeaderboardEntryDto[];
}

export interface WorkoutResultDto {
  id: string;
  memberId: string;
  memberName?: string | null;
  memberPhotoUrl?: string | null;
  workoutId?: string | null;
  workoutName?: string | null;
  classOccurrenceId?: string | null;
  programTrackId?: string | null;
  trackName?: string | null;
  clubId: string;
  performedOn: string;
  scoreType: ScoreType;
  timeSeconds?: number | null;
  rounds?: number | null;
  reps?: number | null;
  loadKg?: number | null;
  distanceMetres?: number | null;
  calories?: number | null;
  points?: number | null;
  passed?: boolean | null;
  normalisedScore: number;
  /** "4:32", "12 + 8", "102.5 kg" — formatted once on the server so every screen agrees. */
  scoreDisplay: string;
  wasScaled: boolean;
  scalingNote?: string | null;
  didNotFinish: boolean;
  memberNote?: string | null;
  coachNote?: string | null;
  isPersonalRecord: boolean;
  enteredByName?: string | null;
}

export interface LogResultDto {
  memberId: string;
  workoutId?: string | null;
  classOccurrenceId?: string | null;
  appointmentId?: string | null;
  programTrackId?: string | null;
  clubId: string;
  performedOn?: string | null;
  scoreType: ScoreType;
  timeSeconds?: number | null;
  rounds?: number | null;
  reps?: number | null;
  loadKg?: number | null;
  distanceMetres?: number | null;
  calories?: number | null;
  points?: number | null;
  passed?: boolean | null;
  wasScaled: boolean;
  scalingNote?: string | null;
  didNotFinish: boolean;
  memberNote?: string | null;
}

export interface PersonalRecordDto {
  id: string;
  memberId: string;
  exerciseId?: string | null;
  workoutId?: string | null;
  recordName: string;
  scoreType: ScoreType;
  value: number;
  unit?: string | null;
  valueDisplay: string;
  repMax?: number | null;
  achievedOn: string;
  previousValue?: number | null;
  previousAchievedOn?: string | null;
  improvement?: number | null;
  improvementDisplay?: string | null;
}

export interface LeaderboardEntryDto {
  id: string;
  rank: number;
  memberId: string;
  memberDisplayName: string;
  memberPhotoUrl?: string | null;
  score: number;
  scoreDisplay: string;
  wasScaled: boolean;
  division?: string | null;
  workoutResultId?: string | null;
  achievedOn?: string | null;
}

export interface LeaderboardDto {
  title: string;
  workoutId?: string | null;
  classOccurrenceId?: string | null;
  challengeId?: string | null;
  clubId: string;
  division?: string | null;
  scoreType: ScoreType;
  from?: string | null;
  to?: string | null;
  entries: LeaderboardEntryDto[];
  viewerEntry?: LeaderboardEntryDto | null;
  totalParticipants: number;
  computedAt: string;
}

export interface EffortSessionDto {
  id: string;
  memberId: string;
  memberName?: string | null;
  memberPhotoUrl?: string | null;
  clubId: string;
  classOccurrenceId?: string | null;
  startedAt: string;
  endedAt?: string | null;
  durationMinutes: number;
  effortPoints: number;
  greyMinutes: number;
  blueMinutes: number;
  greenMinutes: number;
  yellowMinutes: number;
  redMinutes: number;
  averageHeartRate?: number | null;
  peakHeartRate?: number | null;
  caloriesBurned?: number | null;
  peakZone: EffortZone;
  deviceType?: string | null;
}

export interface AttendanceStreakDto {
  id: string;
  memberId: string;
  cadence: string;
  currentCount: number;
  longestCount: number;
  startedOn: string;
  lastQualifyingOn: string;
  brokenOn?: string | null;
  requiredPerPeriod: number;
  /** How many more visits this period keeps the streak alive. */
  visitsNeededThisPeriod: number;
  atRiskOfBreaking: boolean;
}

export interface RankLadderDto {
  id: string;
  name: string;
  clubId?: string | null;
  discipline?: string | null;
  isActive: boolean;
  levels: RankLevelDto[];
}

export interface RankLevelDto {
  id: string;
  rankLadderId: string;
  name: string;
  ordinal: number;
  colourHex?: string | null;
  badgeUrl?: string | null;
  requiredAttendances: number;
  minimumMonthsAtPrevious: number;
  requirementsNote?: string | null;
  gradingFee: number;
  minimumAge?: number | null;
  membersAtThisRank: number;
}

export interface MemberRankDto {
  id: string;
  memberId: string;
  memberName?: string | null;
  memberPhotoUrl?: string | null;
  rankLadderId: string;
  ladderName?: string | null;
  rankLevelId: string;
  rankName: string;
  colourHex?: string | null;
  badgeUrl?: string | null;
  awardedOn: string;
  awardedByName?: string | null;
  status: RankAwardStatus;
  isCurrent: boolean;
  attendancesAtRank: number;
  nextRankName?: string | null;
  attendancesRequired: number;
  monthsAtRank: number;
  monthsRequired: number;
  progressPercent: number;
  isEligibleForGrading: boolean;
  certificateUrl?: string | null;
  note?: string | null;
}

export interface GradingEventDto {
  id: string;
  clubId: string;
  rankLadderId: string;
  ladderName?: string | null;
  name: string;
  heldOn: string;
  examinerStaffId?: string | null;
  examinerName?: string | null;
  externalExaminerName?: string | null;
  candidateCount: number;
  passCount: number;
  feePerCandidate: number;
  notes?: string | null;
  isCompleted: boolean;
  candidates: MemberRankDto[];
}

export interface AwardRankDto {
  memberId: string;
  rankLadderId: string;
  rankLevelId: string;
  gradingEventId?: string | null;
  awardedOn?: string | null;
  note?: string | null;
  chargeGradingFee: boolean;
}

export interface SkillClearanceDto {
  id: string;
  memberId: string;
  memberName?: string | null;
  clubId: string;
  skillName: string;
  clearedOn: string;
  clearedByStaffId: string;
  clearedByName?: string | null;
  expiresOn?: string | null;
  isExpired: boolean;
  isRevoked: boolean;
  revokedReason?: string | null;
  note?: string | null;
}

// ── Assessments, goals and habits ───────────────────────────────────────────────

export interface AssessmentTemplateDto {
  id: string;
  name: string;
  clubId?: string | null;
  purpose?: string | null;
  displayOrder: number;
  recommendedIntervalDays: number;
  serviceId?: string | null;
  serviceName?: string | null;
  isSystemTemplate: boolean;
  isActive: boolean;
  measures: AssessmentMeasureDto[];
  usageCount: number;
}

export interface AssessmentMeasureDto {
  id: string;
  assessmentTemplateId: string;
  name: string;
  measureType: MeasureType;
  direction: MeasureDirection;
  unit: string;
  displayOrder: number;
  grouping?: string | null;
  minValue?: number | null;
  maxValue?: number | null;
  normalLow?: number | null;
  normalHigh?: number | null;
  instructions?: string | null;
  isCalculated: boolean;
  calculationNote?: string | null;
  isRequired: boolean;
  isDeviceImported: boolean;
  deviceFieldName?: string | null;
}

export interface AssessmentDto {
  id: string;
  memberId: string;
  memberName?: string | null;
  clubId: string;
  assessmentTemplateId?: string | null;
  templateName?: string | null;
  staffId?: string | null;
  staffName?: string | null;
  appointmentId?: string | null;
  performedOn: string;
  summary?: string | null;
  recommendations?: string | null;
  deviceSource?: string | null;
  nextDueOn?: string | null;
  sharedWithMember: boolean;
  reportUrl?: string | null;
  values: AssessmentValueDto[];
  /** The assessment this one is compared against. */
  previousAssessmentId?: string | null;
  previousPerformedOn?: string | null;
  daysSincePrevious?: number | null;
}

export interface AssessmentValueDto {
  id: string;
  assessmentMeasureId?: string | null;
  measureName: string;
  measureType: MeasureType;
  direction: MeasureDirection;
  unit?: string | null;
  numericValue?: number | null;
  textValue?: string | null;
  booleanValue?: boolean | null;
  /** Converted to the member's unit preference, so the chart reads in their language. */
  displayValue: string;
  previousValue?: number | null;
  change?: number | null;
  changePercent?: number | null;
  /** Whether the change is an improvement, which depends on the measure's direction. */
  isImprovement?: boolean | null;
  normBand?: string | null;
  percentile?: number | null;
  grouping?: string | null;
  note?: string | null;
  displayOrder: number;
}

export interface RecordAssessmentDto {
  memberId: string;
  clubId: string;
  assessmentTemplateId?: string | null;
  staffId?: string | null;
  appointmentId?: string | null;
  performedOn?: string | null;
  summary?: string | null;
  recommendations?: string | null;
  deviceSource?: string | null;
  deviceReference?: string | null;
  sharedWithMember: boolean;
  values: RecordMeasureValueDto[];
}

export interface RecordMeasureValueDto {
  assessmentMeasureId?: string | null;
  measureName: string;
  numericValue?: number | null;
  textValue?: string | null;
  booleanValue?: boolean | null;
  unit?: string | null;
  note?: string | null;
}

/**
 * One measure charted over time, which is the shape the progress screen actually wants — not a
 * list of assessments the client has to read down a column of.
 */
export interface ProgressSeriesDto {
  memberId: string;
  measureName: string;
  unit?: string | null;
  direction: MeasureDirection;
  points: ProgressPointDto[];
  first?: number | null;
  latest?: number | null;
  best?: number | null;
  totalChange?: number | null;
  totalChangePercent?: number | null;
  isImproving?: boolean | null;
  normalLow?: number | null;
  normalHigh?: number | null;
  goalValue?: number | null;
  goalDate?: string | null;
}

export interface ProgressPointDto {
  on: string;
  value: number;
  assessmentId?: string | null;
  note?: string | null;
}

export interface ProgressPhotoDto {
  id: string;
  memberId: string;
  assessmentId?: string | null;
  takenOn: string;
  pose: string;
  imageUrl: string;
  thumbnailUrl?: string | null;
  consentGiven: boolean;
  mayUseInMarketing: boolean;
  takenByName?: string | null;
  note?: string | null;
}

export interface MemberGoalDto {
  id: string;
  memberId: string;
  title: string;
  measureName?: string | null;
  unit?: string | null;
  startValue?: number | null;
  targetValue?: number | null;
  currentValue?: number | null;
  setOn: string;
  targetDate?: string | null;
  achievedOn?: string | null;
  status: GoalStatus;
  progressPercent: number;
  daysRemaining?: number | null;
  setByName?: string | null;
  whyItMatters?: string | null;
  isOnTrack: boolean;
}

export interface NutritionPlanDto {
  id: string;
  memberId: string;
  memberName?: string | null;
  staffId?: string | null;
  staffName?: string | null;
  clubId: string;
  name: string;
  startsOn: string;
  endsOn?: string | null;
  dailyCalories?: number | null;
  proteinGrams?: number | null;
  carbGrams?: number | null;
  fatGrams?: number | null;
  fibreGrams?: number | null;
  waterMillilitres?: number | null;
  mealGuidance?: string | null;
  restrictions?: string | null;
  supplementNotes?: string | null;
  disclaimer?: string | null;
  isActive: boolean;
}

export interface HabitTrackerDto {
  id: string;
  memberId: string;
  memberName?: string | null;
  nutritionPlanId?: string | null;
  staffId?: string | null;
  habitName: string;
  unit?: string | null;
  dailyTarget?: number | null;
  startsOn: string;
  endsOn?: string | null;
  currentStreak: number;
  longestStreak: number;
  adherencePercent: number;
  isActive: boolean;
  recentEntries: HabitEntryDto[];
  loggedToday: boolean;
}

export interface HabitEntryDto {
  id: string;
  habitTrackerId: string;
  forDate: string;
  value?: number | null;
  completed: boolean;
  note?: string | null;
  loggedAt: string;
}

export interface CoachCheckInDto {
  id: string;
  memberId: string;
  memberName?: string | null;
  memberPhotoUrl?: string | null;
  staffId: string;
  staffName?: string | null;
  clubId: string;
  periodStart: string;
  periodEnd: string;
  dueOn: string;
  memberSubmittedAt?: string | null;
  memberResponse?: string | null;
  energyRating?: number | null;
  sleepRating?: number | null;
  stressRating?: number | null;
  adherenceRating?: number | null;
  coachRepliedAt?: string | null;
  coachResponse?: string | null;
  adjustmentsMade?: string | null;
  isComplete: boolean;
  wasMissed: boolean;
  awaitingCoach: boolean;
  awaitingMember: boolean;
  isOverdue: boolean;
}

export interface WaiverTemplateDto {
  id: string;
  name: string;
  version: number;
  clubId?: string | null;
  countryCode?: string | null;
  languageCode?: string | null;
  classTypeId?: string | null;
  activityScope?: string | null;
  bodyHtml: string;
  consentClausesJson?: string | null;
  requiresGuardianSignature: boolean;
  guardianRequiredBelowAge?: number | null;
  validForDays: number;
  blocksAccess: boolean;
  effectiveFrom: string;
  effectiveTo?: string | null;
  isPublished: boolean;
  requiresResignOnNewVersion: boolean;
  isActive: boolean;
  signedCount: number;
  outstandingCount: number;
}

export interface WaiverSignatureDto {
  id: string;
  waiverTemplateId: string;
  templateName?: string | null;
  templateVersion: number;
  memberId?: string | null;
  memberName?: string | null;
  signerName?: string | null;
  signerEmail?: string | null;
  clubId: string;
  status: SignatureStatus;
  signedAt?: string | null;
  expiresOn?: string | null;
  isExpired: boolean;
  guardianName?: string | null;
  guardianRelationship?: string | null;
  signatureImageUrl?: string | null;
  documentUrl?: string | null;
  capturedVia?: string | null;
}

export interface SignWaiverDto {
  waiverTemplateId: string;
  clubId: string;
  memberId?: string | null;
  signerName?: string | null;
  signerEmail?: string | null;
  signerPhone?: string | null;
  signerDateOfBirth?: string | null;
  guestVisitId?: string | null;
  dayPassId?: string | null;
  signatureImageUrl?: string | null;
  guardianName?: string | null;
  guardianRelationship?: string | null;
  guardianSignatureUrl?: string | null;
  consentAnswersJson?: string | null;
  capturedVia?: string | null;
}

export interface HealthScreeningDto {
  id: string;
  memberId: string;
  memberName?: string | null;
  clubId: string;
  templateName: string;
  templateVersion: number;
  completedAt: string;
  expiresOn?: string | null;
  isExpired: boolean;
  requiresClearance: boolean;
  clearanceStatus: ClearanceStatus;
  riskSummary?: string | null;
  reviewedByName?: string | null;
  reviewedAt?: string | null;
  reviewNote?: string | null;
  capturedVia?: string | null;
  answers: HealthScreeningAnswerDto[];
}

export interface HealthScreeningAnswerDto {
  id: string;
  questionNumber: number;
  questionText: string;
  answerKind: ScreeningAnswerKind;
  booleanAnswer?: boolean | null;
  textAnswer?: string | null;
  numericAnswer?: number | null;
  dateAnswer?: string | null;
  isGatingQuestion: boolean;
  followUpAnswer?: string | null;
}

/** The blank form the join wizard and the app render, so the questions live server-side. */
export interface HealthScreeningFormDto {
  templateName: string;
  templateVersion: number;
  introduction?: string | null;
  gatingMessage?: string | null;
  questions: HealthScreeningAnswerDto[];
}

export interface MedicalClearanceDto {
  id: string;
  memberId: string;
  memberName?: string | null;
  clubId: string;
  healthScreeningId?: string | null;
  status: ClearanceStatus;
  requestedOn: string;
  submittedOn?: string | null;
  approvedOn?: string | null;
  expiresOn?: string | null;
  isExpired: boolean;
  practitionerName?: string | null;
  practitionerRegistration?: string | null;
  practiceName?: string | null;
  restrictions?: string | null;
  documentId?: string | null;
  documentUrl?: string | null;
  approvedByName?: string | null;
  rejectionReason?: string | null;
  blocksParticipation: boolean;
}

export interface SubmitClearanceDto {
  memberId: string;
  clearanceId?: string | null;
  practitionerName?: string | null;
  practitionerRegistration?: string | null;
  practiceName?: string | null;
  restrictions?: string | null;
  documentId?: string | null;
  expiresOn?: string | null;
}

export interface ReviewClearanceDto {
  clearanceId: string;
  approve: boolean;
  note?: string | null;
  restrictions?: string | null;
  expiresOn?: string | null;
}

// ── Leads, tours and referrals ──────────────────────────────────────────────────

export interface LeadSummaryDto {
  id: string;
  clubId: string;
  clubName?: string | null;
  firstName: string;
  lastName?: string | null;
  fullName: string;
  phone?: string | null;
  email?: string | null;
  status: LeadStatus;
  sourceName?: string | null;
  sourceKind: LeadSourceKind;
  receivedAt: string;
  firstContactedAt?: string | null;
  /** Minutes from arrival to first real contact — the number the board sorts on. */
  responseMinutes?: number | null;
  slaBreached: boolean;
  /** Minutes left before the SLA breaches, so the board can count down rather than accuse. */
  minutesToSlaBreach?: number | null;
  assignedStaffId?: string | null;
  assignedStaffName?: string | null;
  lastActivityAt?: string | null;
  nextFollowUpOn?: string | null;
  followUpOverdue: boolean;
  contactAttempts: number;
  ageDays: number;
  tourBookedFor?: string | null;
  trialEndsOn?: string | null;
  goal?: string | null;
  interestedInPlanName?: string | null;
  estimatedValue?: number | null;
}

export interface LeadDetailDto extends LeadSummaryDto {
  memberId?: string | null;
  contactId?: string | null;
  dateOfBirth?: string | null;
  leadSourceId?: string | null;
  campaignId?: string | null;
  campaignName?: string | null;
  referredByMemberId?: string | null;
  referredByName?: string | null;
  notes?: string | null;
  assignedAt?: string | null;
  touredOn?: string | null;
  trialStartedOn?: string | null;
  wonOn?: string | null;
  resultingAgreementId?: string | null;
  wonValue?: number | null;
  lostOn?: string | null;
  lossReasonId?: string | null;
  lossReasonName?: string | null;
  lossNote?: string | null;
  attributedCost?: number | null;
  activities: LeadActivityDto[];
  tours: TourDto[];
  trials: TrialPassDto[];
}

export interface SaveLeadDto {
  clubId: string;
  firstName: string;
  lastName?: string | null;
  phone?: string | null;
  email?: string | null;
  dateOfBirth?: string | null;
  leadSourceId?: string | null;
  campaignId?: string | null;
  referredByMemberId?: string | null;
  promoCodeText?: string | null;
  goal?: string | null;
  interestedInPlanId?: string | null;
  notes?: string | null;
  assignedStaffId?: string | null;
  nextFollowUpOn?: string | null;
}

/** The pipeline board: leads grouped into columns, with the counts the header shows. */
export interface LeadBoardDto {
  clubId?: string | null;
  clubName?: string | null;
  generatedAt: string;
  columns: LeadBoardColumnDto[];
  totalOpen: number;
  breachingSla: number;
  overdueFollowUps: number;
  wonThisMonth: number;
  lostThisMonth: number;
  conversionPercent: number;
  medianResponseMinutes: number;
  slaMinutes: number;
}

export interface LeadBoardColumnDto {
  status: LeadStatus;
  label: string;
  count: number;
  estimatedValue: number;
  leads: LeadSummaryDto[];
}

export interface LeadActivityDto {
  id: string;
  leadId: string;
  kind: LeadActivityKind;
  occurredAt: string;
  summary?: string | null;
  outcome?: string | null;
  staffId?: string | null;
  staffName?: string | null;
  fromStatus?: LeadStatus | null;
  toStatus?: LeadStatus | null;
  wasSuccessfulContact: boolean;
  followUpOn?: string | null;
}

export interface LogLeadActivityDto {
  leadId: string;
  kind: LeadActivityKind;
  summary?: string | null;
  outcome?: string | null;
  /** Whether they were actually reached, which is what stops the SLA clock. */
  wasSuccessfulContact: boolean;
  moveToStatus?: LeadStatus | null;
  followUpOn?: string | null;
}

export interface LeadSourceDto {
  id: string;
  name: string;
  kind: LeadSourceKind;
  clubId?: string | null;
  displayOrder: number;
  monthlyCost: number;
  trackingCode?: string | null;
  isActive: boolean;
  leadsThisMonth: number;
  joinsThisMonth: number;
  conversionPercent: number;
  costPerLead: number;
  costPerAcquisition: number;
}

export interface LossReasonDto {
  id: string;
  name: string;
  displayOrder: number;
  category?: string | null;
  requiresNote: boolean;
  isActive: boolean;
  useCount: number;
}

export interface CloseLeadDto {
  leadId: string;
  won: boolean;
  lossReasonId?: string | null;
  note?: string | null;
  resultingAgreementId?: string | null;
}

export interface TourDto {
  id: string;
  leadId: string;
  leadName?: string | null;
  leadPhone?: string | null;
  clubId: string;
  staffId?: string | null;
  staffName?: string | null;
  scheduledFor: string;
  durationMinutes: number;
  arrivedAt?: string | null;
  completedAt?: string | null;
  wasNoShow: boolean;
  wasCancelled: boolean;
  cancellationReason?: string | null;
  convertedOnDay: boolean;
  notes?: string | null;
  reminderSent: boolean;
}

export interface BookTourDto {
  leadId: string;
  clubId: string;
  staffId?: string | null;
  scheduledFor: string;
  durationMinutes: number;
  notes?: string | null;
  sendConfirmation: boolean;
}

export interface TrialPassDto {
  id: string;
  leadId: string;
  leadName?: string | null;
  memberId?: string | null;
  clubId: string;
  planId?: string | null;
  planName?: string | null;
  startsOn: string;
  endsOn: string;
  visitsAllowed: number;
  visitsUsed: number;
  isExpired: boolean;
  daysRemaining?: number | null;
  price: number;
  converted: boolean;
  convertedOn?: string | null;
  issuedByName?: string | null;
}

export interface IssueTrialDto {
  leadId: string;
  clubId: string;
  planId?: string | null;
  startsOn: string;
  durationDays: number;
  visitsAllowed: number;
  price: number;
  paymentMethod?: PaymentMethod | null;
  issueCredential: boolean;
  credentialIdentifier?: string | null;
  /** Starts the conversion nudge sequence, which is why trials work at all. */
  startConversionSequence: boolean;
}

export interface ReferralDto {
  id: string;
  referrerMemberId: string;
  referrerName?: string | null;
  clubId: string;
  referredName: string;
  referredPhone?: string | null;
  referredEmail?: string | null;
  leadId?: string | null;
  referredMemberId?: string | null;
  referredOn: string;
  referralCode?: string | null;
  converted: boolean;
  convertedOn?: string | null;
  referrerRewardValue: number;
  referrerRewardPoints: number;
  referrerRewarded: boolean;
  referredRewardValue: number;
  referredRewarded: boolean;
  campaignName?: string | null;
}

export interface CreateReferralDto {
  referrerMemberId: string;
  clubId: string;
  referredName: string;
  referredPhone?: string | null;
  referredEmail?: string | null;
  referrerRewardValue: number;
  referrerRewardPoints: number;
  referredRewardValue: number;
  campaignId?: string | null;
  /** Creates the lead as well, so the referral actually gets worked. */
  createLead: boolean;
}

export interface SalesTargetDto {
  id: string;
  clubId: string;
  clubName?: string | null;
  staffId?: string | null;
  staffName?: string | null;
  photoUrl?: string | null;
  periodStart: string;
  periodEnd: string;
  metricName: string;
  targetValue: number;
  actualValue: number;
  achievementPercent: number;
  bonusOnAchievement?: number | null;
  isAchieved: boolean;
  /** Pace against the calendar — behind, on track or ahead, at this point in the period. */
  expectedByNow: number;
  isOnPace: boolean;
  rank: number;
}

export interface CorporateAccountDto {
  id: string;
  code?: string | null;
  name: string;
  clubId: string;
  clubName?: string | null;
  crmAccountId?: string | null;
  contactName?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  addressLine?: string | null;
  taxRegistrationNumber?: string | null;
  billingModel: CorporateBillingModel;
  negotiatedRate?: number | null;
  discountPercent: number;
  subsidyPerMember: number;
  subsidyPercent: number;
  defaultPlanId?: string | null;
  defaultPlanName?: string | null;
  contractStartsOn: string;
  contractEndsOn?: string | null;
  contractExpiringSoon: boolean;
  maxMembers: number;
  currentMemberCount: number;
  spacesRemaining: number;
  invoiceDayOfMonth: number;
  paymentTermsDays: number;
  receivesUsageReport: boolean;
  isActive: boolean;
  eligibilityRules: CorporateEligibilityRuleDto[];
  monthlyValue: number;
  outstandingBalance: number;
  activeUsersLast30Days: number;
  utilisationPercent: number;
}

export interface CorporateEligibilityRuleDto {
  id: string;
  corporateAccountId: string;
  proof: EligibilityProof;
  matchValue?: string | null;
  requiresManualApproval: boolean;
  revalidateEveryDays: number;
  isActive: boolean;
}

export interface CorporateMemberDto {
  id: string;
  corporateAccountId: string;
  memberId: string;
  memberName: string;
  memberNumber?: string | null;
  memberStatus: MemberStatus;
  agreementId?: string | null;
  employeeReference?: string | null;
  department?: string | null;
  joinedSchemeOn: string;
  leftSchemeOn?: string | null;
  eligibilityVerifiedOn?: string | null;
  eligibilityExpiresOn?: string | null;
  eligibilityExpired: boolean;
  employerContribution: number;
  employeeContribution: number;
  isActive: boolean;
  visitsLast30Days: number;
  lastVisitOn?: string | null;
}

export interface CorporateInvoiceDto {
  id: string;
  invoiceNumber: string;
  corporateAccountId: string;
  corporateAccountName?: string | null;
  clubId: string;
  periodStart: string;
  periodEnd: string;
  issuedOn: string;
  dueOn: string;
  paidOn?: string | null;
  status: InvoiceStatus;
  daysOverdue: number;
  memberCount: number;
  subtotal: number;
  taxTotal: number;
  total: number;
  amountPaid: number;
  balanceDue: number;
  currencyCode: string;
  breakdownUrl?: string | null;
  documentUrl?: string | null;
  purchaseOrderReference?: string | null;
  breakdown: CorporateInvoiceLineDto[];
}

export interface CorporateInvoiceLineDto {
  memberId: string;
  memberName: string;
  employeeReference?: string | null;
  planName?: string | null;
  amount: number;
  visits: number;
}

export interface ThirdPartyPayerDto {
  id: string;
  name: string;
  clubId: string;
  payerType?: string | null;
  contactName?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  paymentTermsDays: number;
  agreedRate?: number | null;
  requiresAuthorisationNumber: boolean;
  isActive: boolean;
  activeAuthorisations: number;
  outstandingValue: number;
}

export interface PayerAuthorisationDto {
  id: string;
  thirdPartyPayerId: string;
  payerName?: string | null;
  memberId: string;
  memberName?: string | null;
  authorisationNumber: string;
  validFrom: string;
  validTo: string;
  isExpired: boolean;
  approvedUnits: number;
  usedUnits: number;
  remainingUnits: number;
  ratePerUnit: number;
  approvedValue: number;
  invoicedValue: number;
  purpose?: string | null;
  referrerName?: string | null;
  isExhausted: boolean;
  isActive: boolean;
}

// ── Retention, marketing and loyalty ────────────────────────────────────────────

export interface ChurnScoreDto {
  id: string;
  memberId: string;
  memberName: string;
  memberNumber?: string | null;
  photoUrl?: string | null;
  phone?: string | null;
  email?: string | null;
  clubId: string;
  computedOn: string;
  band: ChurnRiskBand;
  score: number;
  previousBand?: ChurnRiskBand | null;
  previousScore?: number | null;
  bandWorsened: boolean;
  daysSinceLastVisit: number;
  visitsPerWeekNow: number;
  visitsPerWeekBaseline: number;
  tenureDays: number;
  hasUpcomingBooking: boolean;
  hasOutstandingBalance: boolean;
  hasFailedPayment: boolean;
  daysToContractEnd: number;
  ownerStaffId?: string | null;
  ownerStaffName?: string | null;
  isActioned: boolean;
  actionedOn?: string | null;
  monthlyValue: number;
  lifetimeValue: number;
  planName?: string | null;
  factors: ChurnFactorDto[];
  /** The single best reason to lead the call with. */
  headlineReason?: string | null;
  suggestedAction?: string | null;
}

export interface ChurnFactorDto {
  kind: ChurnFactorKind;
  weight: number;
  explanation: string;
  suggestedAction?: string | null;
}

/** The at-risk board: who to call today, why, and who owns them. */
export interface RetentionBoardDto {
  clubId?: string | null;
  clubName?: string | null;
  generatedAt: string;
  lastScoredAt?: string | null;
  healthyCount: number;
  watchCount: number;
  atRiskCount: number;
  criticalCount: number;
  valueAtRisk: number;
  currencyCode: string;
  /** Members whose band got worse at the last run — the newly urgent. */
  newlyAtRisk: number;
  members: ChurnScoreDto[];
  openTasks: RetentionTaskDto[];
  contactedThisWeek: number;
  recoveredThisMonth: number;
  savedThisMonth: number;
  saveRatePercent: number;
}

export interface RetentionTaskDto {
  id: string;
  memberId: string;
  memberName: string;
  memberPhone?: string | null;
  photoUrl?: string | null;
  clubId: string;
  assignedStaffId?: string | null;
  assignedStaffName?: string | null;
  title: string;
  detail?: string | null;
  trigger?: string | null;
  churnScoreId?: string | null;
  dueOn: string;
  priority: number;
  isOverdue: boolean;
  completedAt?: string | null;
  completedByName?: string | null;
  outcome?: string | null;
  isDismissed: boolean;
}

export interface CompleteTaskDto {
  taskId: string;
  outcome?: string | null;
  /** Logs the call on the member's timeline as well, which is where it belongs. */
  logOnMemberTimeline: boolean;
  followUpOn?: string | null;
  dismiss: boolean;
  dismissReason?: string | null;
}

export interface EngagementJourneyDto {
  id: string;
  name: string;
  clubId?: string | null;
  trigger: JourneyTrigger;
  triggerThresholdDays?: number | null;
  segmentId?: string | null;
  segmentName?: string | null;
  isActive: boolean;
  preventReEnrolment: boolean;
  reEnrolmentCooldownDays: number;
  enrolledCount: number;
  completedCount: number;
  currentlyEnrolled: number;
  successMetric?: string | null;
  successCount: number;
  successRatePercent: number;
  steps: JourneyStepDto[];
}

export interface JourneyStepDto {
  id: string;
  engagementJourneyId: string;
  stepNumber: number;
  kind: JourneyStepKind;
  delayHours: number;
  channel?: MessageChannel | null;
  messageTemplateId?: string | null;
  messageTemplateName?: string | null;
  conditionExpression?: string | null;
  onFalseStepNumber?: number | null;
  tagToApply?: string | null;
  offerPromotionRuleId?: string | null;
  loyaltyPointsToGrant: number;
  taskTitle?: string | null;
  taskAssignStaffId?: string | null;
}

export interface JourneyEnrolmentDto {
  id: string;
  engagementJourneyId: string;
  journeyName?: string | null;
  memberId: string;
  memberName?: string | null;
  enrolledAt: string;
  currentStep: number;
  totalSteps: number;
  nextStepDueAt?: string | null;
  completedAt?: string | null;
  exitedAt?: string | null;
  exitReason?: string | null;
  wasSuccessful: boolean;
  isPaused: boolean;
}

export interface CampaignDto {
  id: string;
  name: string;
  clubId?: string | null;
  channel: MessageChannel;
  messageTemplateId?: string | null;
  messageTemplateName?: string | null;
  segmentId?: string | null;
  segmentName?: string | null;
  scheduledFor?: string | null;
  sentAt?: string | null;
  recipientCount: number;
  sentCount: number;
  deliveredCount: number;
  openedCount: number;
  clickedCount: number;
  failedCount: number;
  suppressedCount: number;
  openRatePercent: number;
  clickRatePercent: number;
  cost: number;
  leadsGenerated: number;
  joinsAttributed: number;
  revenueAttributed: number;
  returnOnSpend?: number | null;
  promotionRuleId?: string | null;
  isSent: boolean;
  isCancelled: boolean;
}

export interface SendCampaignDto {
  campaignId: string;
  /** Sends to one address only, so the wording can be checked before four hundred go out. */
  testSendOnly: boolean;
  testRecipient?: string | null;
  scheduleFor?: string | null;
}

export interface MessageTemplateDto {
  id: string;
  name: string;
  clubId?: string | null;
  channel: MessageChannel;
  subject?: string | null;
  body: string;
  plainTextBody?: string | null;
  languageCode?: string | null;
  purpose?: string | null;
  isTransactional: boolean;
  isSystemTemplate: boolean;
  isActive: boolean;
  /** Merge fields this channel supports, so the editor can offer them. */
  availableMergeFields: string[];
  useCount: number;
}

export interface MessageLogDto {
  id: string;
  memberId?: string | null;
  memberName?: string | null;
  leadId?: string | null;
  clubId: string;
  channel: MessageChannel;
  status: MessageStatus;
  templateName?: string | null;
  campaignName?: string | null;
  recipient?: string | null;
  subject?: string | null;
  bodyPreview?: string | null;
  queuedAt: string;
  sentAt?: string | null;
  deliveredAt?: string | null;
  openedAt?: string | null;
  failureReason?: string | null;
  cost: number;
}

export interface SegmentDto {
  id: string;
  name: string;
  clubId?: string | null;
  definitionJson: string;
  lastCount: number;
  lastCountedAt?: string | null;
  isSystemSegment: boolean;
  isActive: boolean;
  /** Plain-English rendering of the filter, so a manager can read what it selects. */
  explanation?: string | null;
}

export interface SaveSegmentDto {
  name: string;
  clubId?: string | null;
  definitionJson: string;
  description?: string | null;
}

export interface LoyaltyAccountDto {
  id: string;
  memberId: string;
  memberName?: string | null;
  clubId: string;
  pointsBalance: number;
  lifetimePoints: number;
  pointsRedeemed: number;
  pointsExpired: number;
  tierId?: string | null;
  tierName?: string | null;
  tierColour?: string | null;
  tierAchievedOn?: string | null;
  nextTierName?: string | null;
  pointsToNextTier: number;
  nextExpiryOn?: string | null;
  pointsExpiringSoon: number;
  recentTransactions: LoyaltyTransactionDto[];
}

export interface LoyaltyTransactionDto {
  id: string;
  kind: LoyaltyEventKind;
  occurredAt: string;
  points: number;
  balanceAfter: number;
  reason: string;
  redemptionValue?: number | null;
  expiresOn?: string | null;
  awardedByName?: string | null;
}

export interface LoyaltyTierDto {
  id: string;
  name: string;
  clubId?: string | null;
  ordinal: number;
  pointsRequired: number;
  colourHex?: string | null;
  badgeUrl?: string | null;
  earnMultiplier: number;
  benefits?: string | null;
  retentionMonths: number;
  isActive: boolean;
  memberCount: number;
}

export interface AwardPointsDto {
  memberId: string;
  points: number;
  reason: string;
  kind: LoyaltyEventKind;
  expiresOn?: string | null;
}

export interface RedeemPointsDto {
  memberId: string;
  points: number;
  reason: string;
  redemptionValue: number;
  /** Applies the value to the member's account balance rather than to a specific sale. */
  applyToBalance: boolean;
  saleId?: string | null;
}

export interface ChallengeDto {
  id: string;
  name: string;
  clubId?: string | null;
  blurb?: string | null;
  imageUrl?: string | null;
  metric: ChallengeMetric;
  customMetricName?: string | null;
  unit?: string | null;
  startsOn: string;
  endsOn: string;
  isRunning: boolean;
  daysRemaining?: number | null;
  targetValue?: number | null;
  isTeamBased: boolean;
  isOpenToAll: boolean;
  segmentId?: string | null;
  entryFee?: number | null;
  prize?: string | null;
  pointsForCompletion: number;
  participantCount: number;
  completedCount: number;
  isPublished: boolean;
  isActive: boolean;
  topParticipants: ChallengeParticipantDto[];
  viewerEntry?: ChallengeParticipantDto | null;
}

export interface ChallengeParticipantDto {
  id: string;
  challengeId: string;
  memberId: string;
  memberName: string;
  photoUrl?: string | null;
  joinedAt: string;
  currentValue: number;
  valueDisplay?: string | null;
  rank?: number | null;
  teamName?: string | null;
  hasCompleted: boolean;
  completedAt?: string | null;
  progressPercent: number;
  lastProgressAt?: string | null;
}

export interface BadgeDto {
  id: string;
  name: string;
  clubId?: string | null;
  blurb?: string | null;
  iconUrl?: string | null;
  colourHex?: string | null;
  criteriaDescription?: string | null;
  pointsAwarded: number;
  displayOrder: number;
  isAutomatic: boolean;
  isActive: boolean;
  awardedCount: number;
}

export interface MemberBadgeDto {
  id: string;
  memberId: string;
  badgeId: string;
  badgeName: string;
  iconUrl?: string | null;
  colourHex?: string | null;
  earnedOn: string;
  context?: string | null;
  timesEarned: number;
}

export interface NpsResponseDto {
  id: string;
  memberId: string;
  memberName?: string | null;
  memberPhone?: string | null;
  clubId: string;
  score: number;
  band: string;
  comment?: string | null;
  trigger?: string | null;
  classOccurrenceId?: string | null;
  className?: string | null;
  staffId?: string | null;
  staffName?: string | null;
  respondedAt: string;
  followedUp: boolean;
  followedUpAt?: string | null;
  followedUpByName?: string | null;
  followUpNote?: string | null;
  needsFollowUp: boolean;
}

export interface NpsSummaryDto {
  clubId?: string | null;
  from: string;
  to: string;
  responseCount: number;
  promoters: number;
  passives: number;
  detractors: number;
  /** Promoter percentage less detractor percentage, −100 to +100. */
  nps: number;
  previousNps?: number | null;
  change?: number | null;
  averageScore: number;
  responseRatePercent: number;
  detractorsAwaitingFollowUp: number;
  recentDetractors: NpsResponseDto[];
  trend: NpsTrendPointDto[];
}

export interface NpsTrendPointDto {
  period: string;
  label: string;
  nps: number;
  responseCount: number;
}

export interface FeedbackDto {
  id: string;
  memberId?: string | null;
  memberName?: string | null;
  clubId: string;
  category?: string | null;
  body: string;
  rating?: number | null;
  submittedAt: string;
  channel?: string | null;
  isAnonymous: boolean;
  isActioned: boolean;
  actionNote?: string | null;
  actionedByName?: string | null;
}

export interface AnnouncementDto {
  id: string;
  clubId?: string | null;
  title: string;
  body: string;
  imageUrl?: string | null;
  showFrom: string;
  showUntil?: string | null;
  showOnKiosk: boolean;
  showInApp: boolean;
  showOnClubScreens: boolean;
  isUrgent: boolean;
  segmentId?: string | null;
  isPublished: boolean;
  isLive: boolean;
}

// ── Staff, rota and commission ──────────────────────────────────────────────────

export interface StaffSummaryDto {
  id: string;
  employeeId?: string | null;
  userId?: string | null;
  clubId: string;
  clubName?: string | null;
  firstName: string;
  lastName: string;
  fullName: string;
  displayName?: string | null;
  photoUrl?: string | null;
  phone?: string | null;
  email?: string | null;
  roleKind: StaffRoleKind;
  startedOn?: string | null;
  leftOn?: string | null;
  isContractor: boolean;
  isBookable: boolean;
  isActive: boolean;
  /** The worst certification state they hold, so an expiry is visible in the list. */
  certificationStatus: CertificationStatus;
  expiringCertifications: number;
  isClockedIn: boolean;
  clockedInAt?: string | null;
}

export interface StaffDetailDto extends StaffSummaryDto {
  hasPin: boolean;
  accessCredentialId?: string | null;
  accessRuleId?: string | null;
  accessRuleName?: string | null;
  canSell: boolean;
  canTrain: boolean;
  canTeach: boolean;
  canApproveOverrides: boolean;
  additionalClubIds: string[];
  certifications: StaffCertificationDto[];
  roles: StaffRoleDto[];
  bookableProfile?: BookableStaffDto | null;
  sessionsThisPeriod: number;
  classesThisPeriod: number;
  salesThisPeriod: number;
  commissionThisPeriod: number;
  hoursThisPeriod: number;
  assignedClients: number;
  clientRetentionPercent: number;
}

export interface SaveStaffDto {
  employeeId?: string | null;
  userId?: string | null;
  clubId: string;
  firstName: string;
  lastName: string;
  displayName?: string | null;
  phone?: string | null;
  email?: string | null;
  photoUrl?: string | null;
  roleKind: StaffRoleKind;
  /** Plain PIN, hashed on the way in and never stored or logged in the clear. */
  pin?: string | null;
  startedOn?: string | null;
  leftOn?: string | null;
  isContractor: boolean;
  accessRuleId?: string | null;
  canSell: boolean;
  canTrain: boolean;
  canTeach: boolean;
  canApproveOverrides: boolean;
  isBookable: boolean;
  additionalClubIds: string[];
  roleIds: string[];
  isActive: boolean;
}

export interface StaffRoleDto {
  id: string;
  name: string;
  clubId?: string | null;
  baseKind: StaffRoleKind;
  permissions: string[];
  discountLimitPercent?: number | null;
  refundLimit?: number | null;
  writeOffLimit?: number | null;
  canOverridePolicies: boolean;
  canViewMedicalData: boolean;
  canExportMemberData: boolean;
  isSystemRole: boolean;
  isActive: boolean;
  staffCount: number;
}

export interface StaffCertificationDto {
  id: string;
  staffId: string;
  staffName?: string | null;
  name: string;
  category?: string | null;
  issuingBody?: string | null;
  referenceNumber?: string | null;
  issuedOn?: string | null;
  expiresOn?: string | null;
  status: CertificationStatus;
  daysToExpiry?: number | null;
  documentUrl?: string | null;
  blocksWorkOnExpiry: boolean;
}

/** A staff member signing in on a shared terminal with their PIN. */
export interface StaffPinLoginDto {
  clubId: string;
  pin: string;
}

export interface StaffPinResultDto {
  success: boolean;
  message?: string | null;
  staff?: StaffSummaryDto | null;
  permissions: string[];
}

/** A manager authorising something above someone else's limit. */
export interface ManagerOverrideDto {
  clubId: string;
  pin: string;
  /** What is being authorised, so the audit entry says something useful. */
  action: string;
  reason?: string | null;
  amount?: number | null;
  entityId?: string | null;
  entityType?: string | null;
}

export interface ShiftDto {
  id: string;
  clubId: string;
  clubName?: string | null;
  title?: string | null;
  position?: string | null;
  startsAt: string;
  endsAt: string;
  breakMinutes: number;
  hours: number;
  status: ShiftStatus;
  requiredHeadcount: number;
  assignedHeadcount: number;
  isUnderStaffed: boolean;
  requiredCertification?: string | null;
  isPublished: boolean;
  note?: string | null;
  assignments: ShiftAssignmentDto[];
}

export interface ShiftAssignmentDto {
  id: string;
  shiftId: string;
  staffId: string;
  staffName: string;
  photoUrl?: string | null;
  status: ShiftStatus;
  confirmedAt?: string | null;
  clockedInAt?: string | null;
  clockedOutAt?: string | null;
  wasNoShow: boolean;
  wasLate: boolean;
  lateMinutes?: number | null;
  note?: string | null;
}

export interface SaveShiftDto {
  clubId: string;
  title?: string | null;
  position?: string | null;
  startsAt: string;
  endsAt: string;
  breakMinutes: number;
  requiredHeadcount: number;
  requiredCertification?: string | null;
  note?: string | null;
  staffIds: string[];
}

/** The rota grid: a date range of shifts by staff member, with the coverage warnings. */
export interface RotaDto {
  clubId: string;
  clubName: string;
  from: string;
  to: string;
  shifts: ShiftDto[];
  staff: StaffSummaryDto[];
  timeOff: StaffTimeOffDto[];
  totalHours: number;
  estimatedCost: number;
  unassignedShifts: number;
  openSwapRequests: number;
  /** Hours the club is open with nobody rostered, which is the point of the screen. */
  coverageGaps: CoverageGapDto[];
}

export interface CoverageGapDto {
  from: string;
  to: string;
  position?: string | null;
  message: string;
  isCritical: boolean;
}

export interface ShiftSwapRequestDto {
  id: string;
  shiftAssignmentId: string;
  shiftId: string;
  shiftStartsAt: string;
  shiftEndsAt: string;
  shiftPosition?: string | null;
  requestedByStaffId: string;
  requestedByName?: string | null;
  offeredToStaffId?: string | null;
  offeredToName?: string | null;
  acceptedByStaffId?: string | null;
  acceptedByName?: string | null;
  requestedAt: string;
  respondedAt?: string | null;
  reason?: string | null;
  isApproved: boolean;
  isCancelled: boolean;
  isOpenToAll: boolean;
}

export interface TimeClockEntryDto {
  id: string;
  staffId: string;
  staffName: string;
  clubId: string;
  shiftAssignmentId?: string | null;
  clockedInAt: string;
  clockedOutAt?: string | null;
  breakMinutes: number;
  workedMinutes?: number | null;
  workedHours?: number | null;
  device?: string | null;
  geofencePassed: boolean;
  isApproved: boolean;
  approvedByName?: string | null;
  wasEdited: boolean;
  editNote?: string | null;
  /** Difference against the rostered shift, which is what a manager reviews. */
  varianceMinutes?: number | null;
}

export interface ClockDto {
  staffId: string;
  clubId: string;
  device?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  breakMinutes?: number | null;
}

export interface TimesheetDto {
  staffId: string;
  staffName: string;
  clubId: string;
  periodStart: string;
  periodEnd: string;
  totalHours: number;
  rosteredHours: number;
  varianceHours: number;
  lateCount: number;
  noShowCount: number;
  isApproved: boolean;
  entries: TimeClockEntryDto[];
}

export interface CommissionRuleDto {
  id: string;
  name: string;
  clubId?: string | null;
  staffId?: string | null;
  staffName?: string | null;
  appliesToRole?: StaffRoleKind | null;
  basis: CommissionBasis;
  ratePerUnit: number;
  percentage: number;
  threshold: number;
  acceleratedRate: number;
  periodCap: number;
  serviceId?: string | null;
  serviceName?: string | null;
  classTypeId?: string | null;
  classTypeName?: string | null;
  planId?: string | null;
  planName?: string | null;
  effectiveFrom: string;
  effectiveTo?: string | null;
  priority: number;
  isActive: boolean;
  /** Plain-English rendering, because a commission rule nobody can read is a dispute waiting to happen. */
  explanation?: string | null;
}

export interface CommissionAccrualDto {
  id: string;
  staffId: string;
  staffName?: string | null;
  clubId: string;
  commissionRuleId?: string | null;
  ruleName?: string | null;
  basis: CommissionBasis;
  earnedOn: string;
  amount: number;
  currencyCode: string;
  baseValue: number;
  quantity: number;
  narrative?: string | null;
  memberId?: string | null;
  memberName?: string | null;
  sourceEntityId?: string | null;
  sourceEntityType?: string | null;
  drillRoute?: string | null;
  isReversed: boolean;
  reversalReason?: string | null;
}

export interface CommissionStatementDto {
  id: string;
  statementNumber: string;
  staffId: string;
  staffName: string;
  photoUrl?: string | null;
  clubId: string;
  clubName?: string | null;
  periodStart: string;
  periodEnd: string;
  status: CommissionStatementStatus;
  sessionCommission: number;
  classCommission: number;
  salesCommission: number;
  retailCommission: number;
  bonus: number;
  adjustments: number;
  total: number;
  currencyCode: string;
  sessionsDelivered: number;
  classesTaught: number;
  membershipsSold: number;
  packagesSold: number;
  submittedAt?: string | null;
  approvedAt?: string | null;
  approvedByName?: string | null;
  rejectionNote?: string | null;
  exportedAt?: string | null;
  payrollReference?: string | null;
  accruals: CommissionAccrualDto[];
}

export interface GenerateCommissionDto {
  clubId: string;
  periodStart: string;
  periodEnd: string;
  staffIds: string[];
  previewOnly: boolean;
}

export interface ApproveStatementDto {
  statementId: string;
  approve: boolean;
  note?: string | null;
  adjustmentAmount?: number | null;
  adjustmentReason?: string | null;
}

export interface StaffTargetDto {
  id: string;
  staffId: string;
  staffName?: string | null;
  clubId: string;
  periodStart: string;
  periodEnd: string;
  metricName: string;
  targetValue: number;
  actualValue: number;
  achievementPercent: number;
  bonus?: number | null;
  isAchieved: boolean;
  bonusPaid: boolean;
}

/** The trainer's own screen: today's diary, their clients and what they have earned. */
export interface TrainerDayDto {
  staffId: string;
  staffName: string;
  clubId: string;
  forDate: string;
  appointments: AppointmentSummaryDto[];
  classes: ClassOccurrenceSummaryDto[];
  dueCheckIns: CoachCheckInDto[];
  tasks: RetentionTaskDto[];
  sessionsToday: number;
  sessionsCompleted: number;
  hoursBooked: number;
  commissionThisPeriod: number;
  activeClients: number;
  clientsAtRisk: number;
  isClockedIn: boolean;
  currentShift?: ShiftDto | null;
}

// ── Lockers, resources and equipment ────────────────────────────────────────────

export interface LockerBankDto {
  id: string;
  clubId: string;
  name: string;
  location?: string | null;
  areaId?: string | null;
  totalLockers: number;
  rentedCount: number;
  freeCount: number;
  outOfOrderCount: number;
  occupancyPercent: number;
  supportsRental: boolean;
  supportsDayUse: boolean;
  isActive: boolean;
  lockers: LockerDto[];
  monthlyRentalRevenue: number;
  expiringThisMonth: number;
}

export interface LockerDto {
  id: string;
  lockerBankId: string;
  bankName?: string | null;
  clubId: string;
  number: string;
  size: LockerSize;
  status: LockerStatus;
  lockType?: string | null;
  keyNumber?: string | null;
  monthlyRate: number;
  annualRate: number;
  deposit: number;
  outOfOrderNote?: string | null;
  lastCleanedOn?: string | null;
  currentAssignmentId?: string | null;
  rentedByMemberId?: string | null;
  rentedByName?: string | null;
  rentalEndsOn?: string | null;
  rentalExpired: boolean;
  rentalExpiringSoon: boolean;
}

export interface LockerAssignmentDto {
  id: string;
  lockerId: string;
  lockerNumber?: string | null;
  bankName?: string | null;
  memberId: string;
  memberName?: string | null;
  memberPhone?: string | null;
  clubId: string;
  startsOn: string;
  endsOn?: string | null;
  releasedOn?: string | null;
  isDayUse: boolean;
  isExpired: boolean;
  daysToExpiry?: number | null;
  rate: number;
  depositHeld: number;
  depositReturned: number;
  autoRenews: boolean;
  nextBillingOn?: string | null;
  expiryNoticeSent: boolean;
  wasReclaimed: boolean;
  keyIssued?: string | null;
  keyReturned: boolean;
}

export interface AssignLockerDto {
  lockerId: string;
  memberId: string;
  startsOn: string;
  endsOn?: string | null;
  isDayUse: boolean;
  rateOverride?: number | null;
  deposit: number;
  autoRenews: boolean;
  keyIssued?: string | null;
  chargeNow: boolean;
  paymentMethod?: PaymentMethod | null;
}

export interface ReleaseLockerDto {
  assignmentId: string;
  keyReturned: boolean;
  depositReturned: number;
  wasReclaimed: boolean;
  note?: string | null;
}

export interface BookableResourceDto {
  id: string;
  clubId: string;
  areaId?: string | null;
  areaName?: string | null;
  name: string;
  kind: ResourceKind;
  capacity: number;
  displayOrder: number;
  colourHex?: string | null;
  slotMinutes: number;
  bufferMinutes: number;
  memberRate: number;
  nonMemberRate: number;
  peakSurcharge: number;
  bookingWindowDays: number;
  maxConcurrentBookingsPerMember: number;
  freeCancelHours: number;
  lateCancelOutcome: PolicyOutcome;
  noShowOutcome: PolicyOutcome;
  linkedDoorId?: string | null;
  equipmentAssetId?: string | null;
  bookableOnline: boolean;
  isOutOfService: boolean;
  outOfServiceNote?: string | null;
  isActive: boolean;
  slotRules: ResourceSlotRuleDto[];
  bookingsThisWeek: number;
  utilisationPercent: number;
  revenueThisMonth: number;
}

export interface ResourceSlotRuleDto {
  id: string;
  bookableResourceId: string;
  daysOfWeekMask: number;
  startsAt: string;
  endsAt: string;
  isPeak: boolean;
  rateOverride?: number | null;
  isBlocked: boolean;
  blockReason?: string | null;
  effectiveFrom?: string | null;
  effectiveTo?: string | null;
}

export interface ResourceBookingDto {
  id: string;
  bookingNumber: string;
  bookableResourceId: string;
  resourceName: string;
  resourceKind: ResourceKind;
  colourHex?: string | null;
  clubId: string;
  memberId?: string | null;
  memberName?: string | null;
  memberPhone?: string | null;
  guestName?: string | null;
  startsAt: string;
  endsAt: string;
  durationMinutes: number;
  status: ResourceBookingStatus;
  channel: BookingChannel;
  participantCount: number;
  participantNames: string[];
  amount: number;
  penaltyCharged: number;
  checkedInAt?: string | null;
  cancelledAt?: string | null;
  cancellationReason?: string | null;
  bookedByName?: string | null;
  note?: string | null;
}

export interface CreateResourceBookingDto {
  bookableResourceId: string;
  clubId: string;
  memberId?: string | null;
  guestName?: string | null;
  guestPhone?: string | null;
  startsAt: string;
  durationMinutes?: number | null;
  participantCount: number;
  participantMemberIds: string[];
  channel: BookingChannel;
  paymentMethod?: PaymentMethod | null;
  cashSessionId?: string | null;
  priceOverride?: number | null;
  overrideConflicts: boolean;
  note?: string | null;
}

/**
 * The court grid: one row per resource, one column per slot, for one day. Exactly the
 * interaction a leisure-centre desk expects, and nothing like a list of bookings.
 */
export interface ResourceGridDto {
  clubId: string;
  clubName: string;
  forDate: string;
  filterKind?: ResourceKind | null;
  opensAt: string;
  closesAt: string;
  slotMinutes: number;
  rows: ResourceGridRowDto[];
  totalSlots: number;
  bookedSlots: number;
  utilisationPercent: number;
  revenueToday: number;
}

export interface ResourceGridRowDto {
  resourceId: string;
  resourceName: string;
  kind: ResourceKind;
  colourHex?: string | null;
  isOutOfService: boolean;
  slots: ResourceGridSlotDto[];
}

export interface ResourceGridSlotDto {
  startsAt: string;
  endsAt: string;
  /** Free, booked, blocked, peak or past — which is what colours the cell. */
  state: string;
  bookingId?: string | null;
  bookedByName?: string | null;
  isPeak: boolean;
  rate: number;
  blockReason?: string | null;
}

export interface EquipmentAssetDto {
  id: string;
  code?: string | null;
  clubId: string;
  clubName?: string | null;
  areaId?: string | null;
  areaName?: string | null;
  name: string;
  category?: string | null;
  manufacturer?: string | null;
  model?: string | null;
  serialNumber?: string | null;
  assetTag?: string | null;
  status: AssetStatus;
  purchasedOn?: string | null;
  purchaseCost: number;
  supplierId?: string | null;
  warrantyEndsOn?: string | null;
  inWarranty: boolean;
  serviceContractReference?: string | null;
  serviceContractEndsOn?: string | null;
  installedOn?: string | null;
  retiredOn?: string | null;
  ageMonths?: number | null;
  usageHours: number;
  usageReadOn?: string | null;
  lastServicedOn?: string | null;
  nextServiceDueOn?: string | null;
  serviceOverdue: boolean;
  totalMaintenanceCost: number;
  totalDowntimeHours: number;
  /** Purchase plus lifetime maintenance, which is the number that decides replacement. */
  costOfOwnership: number;
  qrCode?: string | null;
  outOfServiceNote?: string | null;
  outOfServiceSince?: string | null;
  daysOutOfService?: number | null;
  isActive: boolean;
  openWorkOrders: number;
  faultsLast90Days: number;
}

export interface SaveEquipmentDto {
  code?: string | null;
  clubId: string;
  areaId?: string | null;
  name: string;
  category?: string | null;
  manufacturer?: string | null;
  model?: string | null;
  serialNumber?: string | null;
  assetTag?: string | null;
  status: AssetStatus;
  purchasedOn?: string | null;
  purchaseCost: number;
  supplierId?: string | null;
  warrantyEndsOn?: string | null;
  serviceContractReference?: string | null;
  serviceContractEndsOn?: string | null;
  installedOn?: string | null;
  usageHours: number;
  description?: string | null;
  isActive: boolean;
}

export interface MaintenanceScheduleDto {
  id: string;
  equipmentAssetId?: string | null;
  equipmentName?: string | null;
  clubId: string;
  appliesToCategory?: string | null;
  taskName: string;
  instructions?: string | null;
  trigger: MaintenanceTrigger;
  intervalDays: number;
  intervalUsageHours: number;
  lastPerformedOn?: string | null;
  nextDueOn?: string | null;
  isOverdue: boolean;
  daysUntilDue?: number | null;
  estimatedMinutes: number;
  defaultAssigneeStaffId?: string | null;
  defaultAssigneeName?: string | null;
  autoCreateWorkOrder: boolean;
  isActive: boolean;
}

export interface WorkOrderDto {
  id: string;
  workOrderNumber: string;
  clubId: string;
  clubName?: string | null;
  equipmentAssetId?: string | null;
  equipmentName?: string | null;
  areaName?: string | null;
  maintenanceScheduleId?: string | null;
  faultReportId?: string | null;
  title: string;
  detail?: string | null;
  status: WorkOrderStatus;
  priority: WorkOrderPriority;
  raisedOn: string;
  dueOn?: string | null;
  startedOn?: string | null;
  completedOn?: string | null;
  isOverdue: boolean;
  ageDays: number;
  assignedStaffId?: string | null;
  assignedStaffName?: string | null;
  contractorName?: string | null;
  contractorReference?: string | null;
  labourCost: number;
  partsCost: number;
  totalCost: number;
  partsUsed?: string | null;
  downtimeHours: number;
  resolutionNote?: string | null;
  photoUrls: string[];
  purchaseRequestId?: string | null;
}

export interface SaveWorkOrderDto {
  clubId: string;
  equipmentAssetId?: string | null;
  faultReportId?: string | null;
  title: string;
  detail?: string | null;
  priority: WorkOrderPriority;
  dueOn?: string | null;
  assignedStaffId?: string | null;
  contractorName?: string | null;
  contractorReference?: string | null;
}

export interface CompleteWorkOrderDto {
  workOrderId: string;
  resolutionNote?: string | null;
  labourCost: number;
  partsCost: number;
  partsUsed?: string | null;
  downtimeHours: number;
  /** Puts the machine back into service, and back into the spot map. */
  returnToService: boolean;
  photoUrls: string[];
}

export interface FaultReportDto {
  id: string;
  clubId: string;
  equipmentAssetId?: string | null;
  equipmentName?: string | null;
  areaId?: string | null;
  areaName?: string | null;
  faultDescription: string;
  severity: WorkOrderPriority;
  reportedAt: string;
  reportedByStaffId?: string | null;
  reportedByName?: string | null;
  reportedByMemberId?: string | null;
  photoUrl?: string | null;
  takenOutOfService: boolean;
  signPrinted: boolean;
  workOrderId?: string | null;
  workOrderNumber?: string | null;
  isResolved: boolean;
  resolvedOn?: string | null;
}

export interface ReportFaultDto {
  clubId: string;
  equipmentAssetId?: string | null;
  /** Scanned from the sticker on the machine, which is how staff actually report faults. */
  qrCode?: string | null;
  areaId?: string | null;
  faultDescription: string;
  severity: WorkOrderPriority;
  photoUrl?: string | null;
  /** Marks the machine unavailable immediately, including in every spot map that uses it. */
  takeOutOfService: boolean;
  createWorkOrder: boolean;
  reportedByMemberId?: string | null;
}

export interface EquipmentUsageLogDto {
  id: string;
  equipmentAssetId: string;
  equipmentName?: string | null;
  readOn: string;
  cumulativeHours: number;
  hoursSinceLastRead: number;
  distanceKm?: number | null;
  sessionCount?: number | null;
  source?: string | null;
}

// ── Compliance, incidents and the till ──────────────────────────────────────────

export interface IncidentDto {
  id: string;
  incidentNumber: string;
  clubId: string;
  clubName?: string | null;
  areaId?: string | null;
  areaName?: string | null;
  equipmentAssetId?: string | null;
  equipmentName?: string | null;
  kind: IncidentKind;
  severity: IncidentSeverity;
  status: IncidentStatus;
  occurredAt: string;
  reportedAt: string;
  /** Gap between the two. A long one is itself a finding. */
  reportingDelayMinutes: number;
  memberId?: string | null;
  memberName?: string | null;
  involvedPersonName?: string | null;
  involvedPersonPhone?: string | null;
  reportedByStaffId?: string | null;
  reportedByName?: string | null;
  summary: string;
  detail?: string | null;
  witnessNames?: string | null;
  witnessStatements?: string | null;
  firstAidGiven: boolean;
  firstAiderName?: string | null;
  aedUsed: boolean;
  ambulanceCalled: boolean;
  hospitalAttended: boolean;
  immediateAction?: string | null;
  photoUrls: string[];
  ownerStaffId?: string | null;
  ownerName?: string | null;
  reviewDueOn?: string | null;
  closedOn?: string | null;
  rootCause?: string | null;
  preventiveAction?: string | null;
  isReportable: boolean;
  wasReported: boolean;
  reportedToAuthorityOn?: string | null;
  authorityReference?: string | null;
  insurerNotified: boolean;
  insurerReference?: string | null;
  estimatedCost?: number | null;
  actions: IncidentActionDto[];
  openActions: number;
  isOverdue: boolean;
}

export interface SaveIncidentDto {
  clubId: string;
  areaId?: string | null;
  equipmentAssetId?: string | null;
  kind: IncidentKind;
  severity: IncidentSeverity;
  occurredAt: string;
  memberId?: string | null;
  involvedPersonName?: string | null;
  involvedPersonPhone?: string | null;
  summary: string;
  detail?: string | null;
  witnessNames?: string | null;
  witnessStatements?: string | null;
  firstAidGiven: boolean;
  firstAiderName?: string | null;
  aedUsed: boolean;
  ambulanceCalled: boolean;
  hospitalAttended: boolean;
  immediateAction?: string | null;
  photoUrls: string[];
  ownerStaffId?: string | null;
  reviewDueOn?: string | null;
  isReportable: boolean;
  insurerNotified: boolean;
  estimatedCost?: number | null;
  /** Takes the machine out of service in the same action, for an equipment incident. */
  takeEquipmentOutOfService: boolean;
}

export interface IncidentActionDto {
  id: string;
  incidentId: string;
  action: string;
  assignedStaffId?: string | null;
  assignedStaffName?: string | null;
  raisedOn: string;
  dueOn?: string | null;
  completedOn?: string | null;
  completionNote?: string | null;
  isOverdue: boolean;
}

export interface ComplaintDto {
  id: string;
  complaintNumber: string;
  clubId: string;
  clubName?: string | null;
  memberId?: string | null;
  memberName?: string | null;
  complainantName?: string | null;
  complainantContact?: string | null;
  category: string;
  summary: string;
  detail?: string | null;
  status: ComplaintStatus;
  priority: number;
  raisedOn: string;
  acknowledgedOn?: string | null;
  targetResolutionOn?: string | null;
  resolvedOn?: string | null;
  ageDays: number;
  isOverdue: boolean;
  resolutionDays?: number | null;
  ownerStaffId?: string | null;
  ownerName?: string | null;
  resolution?: string | null;
  compensationValue?: number | null;
  compensationNote?: string | null;
  complainantSatisfied?: boolean | null;
  channel?: string | null;
}

export interface SaveComplaintDto {
  clubId: string;
  memberId?: string | null;
  complainantName?: string | null;
  complainantContact?: string | null;
  category: string;
  summary: string;
  detail?: string | null;
  priority: number;
  ownerStaffId?: string | null;
  targetResolutionOn?: string | null;
  channel?: string | null;
}

export interface ResolveComplaintDto {
  complaintId: string;
  resolution: string;
  compensationValue?: number | null;
  compensationNote?: string | null;
  complainantSatisfied?: boolean | null;
  /** Puts the goodwill on the member's account rather than leaving it as a note. */
  issueCredit: boolean;
}

export interface LostPropertyItemDto {
  id: string;
  clubId: string;
  itemDescription: string;
  category?: string | null;
  photoUrl?: string | null;
  foundOn: string;
  foundLocation?: string | null;
  foundByName?: string | null;
  storageLocation?: string | null;
  status: LostPropertyStatus;
  claimedByMemberId?: string | null;
  claimedByName?: string | null;
  claimedOn?: string | null;
  releasedByName?: string | null;
  disposeAfter?: string | null;
  readyForDisposal: boolean;
  disposedOn?: string | null;
  disposalNote?: string | null;
  daysHeld: number;
}

export interface SaveLostPropertyDto {
  clubId: string;
  itemDescription: string;
  category?: string | null;
  photoUrl?: string | null;
  foundOn?: string | null;
  foundLocation?: string | null;
  storageLocation?: string | null;
  holdDays: number;
}

export interface ClaimLostPropertyDto {
  itemId: string;
  claimedByMemberId?: string | null;
  claimedByName?: string | null;
  note?: string | null;
}

export interface FacilityCheckDto {
  id: string;
  clubId: string;
  areaId?: string | null;
  areaName?: string | null;
  name: string;
  kind: FacilityCheckKind;
  daysOfWeekMask: number;
  dueAt: string;
  timesPerDay: number;
  defaultAssigneeRoleId?: string | null;
  alertOnMissed: boolean;
  missedAfterMinutes: number;
  requiresSignature: boolean;
  isActive: boolean;
  items: FacilityCheckItemDto[];
  dueToday: boolean;
  completedToday: boolean;
  isOverdue: boolean;
  lastCompletedAt?: string | null;
  lastCompletedByName?: string | null;
  failedItemCount: number;
}

export interface FacilityCheckItemDto {
  id: string;
  facilityCheckId: string;
  itemDescription: string;
  displayOrder: number;
  answerKind: ScreeningAnswerKind;
  unit?: string | null;
  acceptableLow?: number | null;
  acceptableHigh?: number | null;
  isCritical: boolean;
  requiresPhoto: boolean;
  lastCompletedAt?: string | null;
  lastCompletedByName?: string | null;
  lastPassed?: boolean | null;
  lastValue?: number | null;
  lastNote?: string | null;
  outOfRange: boolean;
}

export interface SubmitFacilityCheckDto {
  facilityCheckId: string;
  clubId: string;
  items: SubmitCheckItemDto[];
  signatureUrl?: string | null;
  note?: string | null;
}

export interface SubmitCheckItemDto {
  itemId: string;
  passed?: boolean | null;
  value?: number | null;
  note?: string | null;
  photoUrl?: string | null;
}

export interface ShiftHandoverDto {
  id: string;
  clubId: string;
  shiftEndedAt: string;
  fromStaffId?: string | null;
  fromStaffName?: string | null;
  toStaffId?: string | null;
  toStaffName?: string | null;
  notes: string;
  outstandingItems?: string | null;
  hasUrgentItems: boolean;
  acknowledgedAt?: string | null;
  acknowledgedByName?: string | null;
}

export interface FitnessSaleDto {
  id: string;
  saleNumber: string;
  clubId: string;
  clubName?: string | null;
  memberId?: string | null;
  memberName?: string | null;
  memberNumber?: string | null;
  soldAt: string;
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  total: number;
  currencyCode: string;
  paymentMethod: PaymentMethod;
  isHouseAccountCharge: boolean;
  cashSessionId?: string | null;
  soldByName?: string | null;
  isReturn: boolean;
  returnsSaleId?: string | null;
  returnReason?: string | null;
  stockDepleted: boolean;
  discountReason?: string | null;
  discountApprovedByName?: string | null;
  lines: FitnessSaleLineDto[];
  /** Sale value less line cost, which is the number a pro shop is judged on. */
  grossMargin: number;
}

export interface FitnessSaleLineDto {
  id: string;
  inventoryItemId?: string | null;
  planId?: string | null;
  itemName: string;
  barcode?: string | null;
  quantity: number;
  unitPrice: number;
  discountAmount: number;
  taxPercent: number;
  taxAmount: number;
  lineTotal: number;
  unitCost: number;
  modifiers?: string | null;
  displayOrder: number;
}

export interface CreateSaleDto {
  clubId: string;
  memberId?: string | null;
  lines: CreateSaleLineDto[];
  paymentMethod: PaymentMethod;
  amountTendered?: number | null;
  cashSessionId?: string | null;
  /** Puts it on the member's account instead of taking payment now. */
  chargeToHouseAccount: boolean;
  discountTotal: number;
  discountReason?: string | null;
  discountApprovedByUserId?: string | null;
  soldByStaffId?: string | null;
  idempotencyKey?: string | null;
}

export interface CreateSaleLineDto {
  inventoryItemId?: string | null;
  planId?: string | null;
  itemName: string;
  barcode?: string | null;
  quantity: number;
  unitPrice: number;
  discountAmount: number;
  taxPercent: number;
  modifiers?: string | null;
}

export interface HouseAccountChargeDto {
  id: string;
  memberId: string;
  memberName?: string | null;
  clubId: string;
  saleId?: string | null;
  saleNumber?: string | null;
  chargedOn: string;
  amount: number;
  chargeDescription: string;
  settledInvoiceId?: string | null;
  isSettled: boolean;
  settledOn?: string | null;
  authorisedByName?: string | null;
}

export interface VendingRevenueEntryDto {
  id: string;
  clubId: string;
  clubName?: string | null;
  periodStart: string;
  periodEnd: string;
  revenueSource: string;
  machineReference?: string | null;
  grossRevenue: number;
  commissionPaid: number;
  netRevenue: number;
  currencyCode: string;
  transactionCount?: number | null;
  enteredByName?: string | null;
  note?: string | null;
}

export interface AuditEntryDto {
  id: string;
  clubId?: string | null;
  occurredAt: string;
  actorUserId?: string | null;
  actorName?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  memberId?: string | null;
  memberName?: string | null;
  changeSummary?: string | null;
  isSensitiveAccess: boolean;
  reason?: string | null;
  ipAddress?: string | null;
}

// ── Reporting ───────────────────────────────────────────────────────────────────

/**
 * The owner's home screen.
 * Split into "right now" and "this month" deliberately. The live block is for acting in the next
 * five minutes — a lead breaching its SLA, a door offline, a class about to run empty. The
 * monthly block is for judging the business. Mixing them produces a screen that is urgent about
 * everything and therefore about nothing.
 */
export interface FitnessDashboardDto {
  clubId?: string | null;
  clubName: string;
  currencyCode: string;
  generatedAt: string;
  inClubNow: number;
  clubCapacity?: number | null;
  occupancyPercent: number;
  checkInsToday: number;
  classesToday: number;
  classesRemainingToday: number;
  appointmentsToday: number;
  leadsBreachingSla: number;
  tasksDueToday: number;
  doorsOffline: number;
  equipmentOutOfService: number;
  openIncidents: number;
  /** Classes starting soon with places nobody has taken — still fixable today. */
  underFilledClassesToday: number;
  takingsToday: number;
  activeMembers: number;
  activeMembersLastMonth: number;
  joinsThisMonth: number;
  cancellationsThisMonth: number;
  netGrowth: number;
  churnRatePercent: number;
  churnRateLastMonth: number;
  frozenMembers: number;
  pastDueMembers: number;
  trialMembers: number;
  monthlyRecurringRevenue: number;
  mrrLastMonth: number;
  mrrChangePercent: number;
  revenueThisMonth: number;
  revenueLastMonth: number;
  revenueChangePercent: number;
  collectedThisMonth: number;
  billedThisMonth: number;
  collectionRatePercent: number;
  outstandingBalance: number;
  membersInArrears: number;
  averageRevenuePerMember: number;
  atRiskMembers: number;
  criticalRiskMembers: number;
  valueAtRisk: number;
  nps: number;
  openLeads: number;
  leadsThisMonth: number;
  toursThisMonth: number;
  leadConversionPercent: number;
  medianResponseMinutes: number;
  memberTrend: TrendPointDto[];
  revenueTrend: TrendPointDto[];
  visitsByHour: HourlyVisitDto[];
  revenueByStream: RevenueLineDto[];
  nextClasses: ClassOccurrenceSummaryDto[];
  needsAttention: AttentionItemDto[];
}

/** Something wrong that a person can fix, with the route that fixes it. */
export interface AttentionItemDto {
  kind: string;
  title: string;
  detail?: string | null;
  count: number;
  value?: number | null;
  /** Info, warning or critical — and never colour alone in the UI. */
  severity: string;
  icon?: string | null;
  route?: string | null;
}

export interface TrendPointDto {
  period: string;
  label: string;
  value: number;
  secondaryValue?: number | null;
  count: number;
}

export interface HourlyVisitDto {
  hour: number;
  visits: number;
  peakOccupancy: number;
}

export interface MembershipReportDto {
  clubId?: string | null;
  from: string;
  to: string;
  openingActive: number;
  joins: number;
  rejoins: number;
  cancellations: number;
  expiries: number;
  closingActive: number;
  netGrowth: number;
  /** Leavers over average active. The number the whole industry benchmarks on. */
  grossChurnPercent: number;
  /** Churn less rejoins, which is what actually moved the member count. */
  netChurnPercent: number;
  frozen: number;
  freezeDaysTaken: number;
  suspended: number;
  upgrades: number;
  downgrades: number;
  averageTenureMonths: number;
  averageLifetimeValue: number;
  planMix: PlanMixLineDto[];
  leaveReasons: LeaveReasonLineDto[];
  tenureDistribution: TenureBandDto[];
  trend: TrendPointDto[];
}

export interface PlanMixLineDto {
  planId: string;
  planName: string;
  kind: PlanKind;
  memberCount: number;
  percentOfBase: number;
  monthlyRevenue: number;
  averagePrice: number;
  joinsInPeriod: number;
  cancellationsInPeriod: number;
  churnPercent: number;
}

export interface LeaveReasonLineDto {
  reason: LeaveReason;
  label: string;
  count: number;
  percentOfTotal: number;
  valueLost: number;
  savedCount: number;
  saveRatePercent: number;
}

export interface TenureBandDto {
  band: string;
  memberCount: number;
  percentOfBase: number;
  churnPercent: number;
}

/**
 * Retention by join month: of everyone who joined in March, how many were still here at month
 * one, three, six, twelve. The report that tells an owner which channel brings members who stay.
 */
export interface CohortRetentionDto {
  clubId?: string | null;
  groupedBy: string;
  from: string;
  to: string;
  cohorts: CohortRowDto[];
  periods: number[];
}

export interface CohortRowDto {
  label: string;
  cohortStart: string;
  initialSize: number;
  /** Retained percentage at each period offset, aligned to the Periods list. */
  retentionPercent: number[];
  retainedCount: number[];
  averageLifetimeValue: number;
}

export interface RevenueReportDto {
  clubId?: string | null;
  from: string;
  to: string;
  currencyCode: string;
  totalBilled: number;
  totalCollected: number;
  totalRefunded: number;
  totalWrittenOff: number;
  netRevenue: number;
  taxCollected: number;
  recognisedRevenue: number;
  deferredBalance: number;
  byStream: RevenueLineDto[];
  byPaymentMethod: RevenueLineDto[];
  byClub: RevenueLineDto[];
  trend: TrendPointDto[];
  averageRevenuePerMember: number;
  averageTransactionValue: number;
}

/** Monthly recurring revenue and what moved it, which is the shape a subscription business reads. */
export interface MrrMovementDto {
  clubId?: string | null;
  periodStart: string;
  periodEnd: string;
  currencyCode: string;
  openingMrr: number;
  newMrr: number;
  expansionMrr: number;
  contractionMrr: number;
  churnedMrr: number;
  reactivationMrr: number;
  closingMrr: number;
  netChange: number;
  netChangePercent: number;
  trend: TrendPointDto[];
}

export interface ArrearsReportDto {
  clubId?: string | null;
  asAt: string;
  currencyCode: string;
  totalOutstanding: number;
  memberCount: number;
  current: number;
  days1To30: number;
  days31To60: number;
  days61To90: number;
  over90Days: number;
  openDunningCases: number;
  inRecovery: number;
  recoveredThisMonth: number;
  recoveryRatePercent: number;
  members: ArrearsLineDto[];
  byFailureReason: RevenueLineDto[];
}

export interface ArrearsLineDto {
  memberId: string;
  memberName: string;
  memberNumber?: string | null;
  phone?: string | null;
  outstanding: number;
  daysOverdue: number;
  ageBand: string;
  lastFailureReason?: PaymentFailureReason | null;
  hasValidPaymentMethod: boolean;
  accessSuspended: boolean;
  dunningCaseId?: string | null;
  dunningStep: number;
}

export interface AttendanceReportDto {
  clubId?: string | null;
  from: string;
  to: string;
  totalVisits: number;
  uniqueMembers: number;
  visitsPerMember: number;
  averageVisitMinutes: number;
  peakOccupancy: number;
  peakAt?: string | null;
  /** Members who paid and never came, which is a churn cohort waiting to happen. */
  zeroVisitMembers: number;
  lowUsageMembers: number;
  heatmap: HeatmapCellDto[];
  trend: TrendPointDto[];
  byVisitKind: RevenueLineDto[];
  byCheckInMethod: RevenueLineDto[];
}

export interface HeatmapCellDto {
  dayOfWeek: number;
  hour: number;
  visits: number;
  averageOccupancy: number;
  intensity: number;
}

export interface ClassPerformanceReportDto {
  clubId?: string | null;
  from: string;
  to: string;
  totalClasses: number;
  cancelledClasses: number;
  totalCapacity: number;
  totalBooked: number;
  totalAttended: number;
  noShows: number;
  lateCancels: number;
  averageFillPercent: number;
  noShowRatePercent: number;
  waitlistDemand: number;
  byClassType: ClassPerformanceLineDto[];
  byInstructor: ClassPerformanceLineDto[];
  byTimeSlot: ClassPerformanceLineDto[];
  /** Classes worth adding, because they fill and then waitlist. */
  highDemand: ClassPerformanceLineDto[];
  /** Classes worth cutting, because they cost an instructor and run near-empty. */
  underPerforming: ClassPerformanceLineDto[];
}

export interface ClassPerformanceLineDto {
  id?: string | null;
  label: string;
  occurrences: number;
  capacity: number;
  booked: number;
  attended: number;
  noShows: number;
  waitlistTotal: number;
  fillPercent: number;
  noShowPercent: number;
  revenue: number;
  instructorCost: number;
  contribution: number;
  revenuePerHead: number;
}

export interface SalesReportDto {
  clubId?: string | null;
  from: string;
  to: string;
  totalLeads: number;
  tours: number;
  trials: number;
  joins: number;
  joinValue: number;
  leadToTourPercent: number;
  tourToJoinPercent: number;
  trialToJoinPercent: number;
  overallConversionPercent: number;
  medianResponseMinutes: number;
  slaBreaches: number;
  tourNoShows: number;
  marketingSpend: number;
  costPerLead: number;
  costPerAcquisition: number;
  funnel: SalesFunnelStageDto[];
  bySource: LeadSourceDto[];
  byStaff: SalesPerformerDto[];
  lossReasons: LossReasonDto[];
  trend: TrendPointDto[];
}

export interface SalesFunnelStageDto {
  stage: string;
  count: number;
  conversionFromPreviousPercent: number;
  conversionFromTopPercent: number;
  averageDaysInStage: number;
}

export interface SalesPerformerDto {
  staffId: string;
  staffName: string;
  photoUrl?: string | null;
  leadsAssigned: number;
  tours: number;
  joins: number;
  value: number;
  conversionPercent: number;
  medianResponseMinutes: number;
  targetValue: number;
  achievementPercent: number;
  rank: number;
}

export interface StaffPerformanceReportDto {
  clubId?: string | null;
  from: string;
  to: string;
  staff: StaffPerformanceLineDto[];
  totalSessionsDelivered: number;
  totalClassesTaught: number;
  totalCommission: number;
  totalHours: number;
  averageUtilisationPercent: number;
}

export interface StaffPerformanceLineDto {
  staffId: string;
  staffName: string;
  photoUrl?: string | null;
  roleKind: StaffRoleKind;
  sessionsDelivered: number;
  classesTaught: number;
  classAttendance: number;
  averageClassFillPercent: number;
  hoursWorked: number;
  hoursAvailable: number;
  utilisationPercent: number;
  membershipsSold: number;
  packagesSold: number;
  salesValue: number;
  commission: number;
  assignedClients: number;
  clientsRetained: number;
  clientRetentionPercent: number;
  nps?: number | null;
  lateCount: number;
  noShowCount: number;
  expiringCertifications: number;
}

export interface OperationsReportDto {
  clubId?: string | null;
  from: string;
  to: string;
  incidents: number;
  reportableIncidents: number;
  openIncidents: number;
  incidentCost: number;
  complaints: number;
  complaintsResolved: number;
  averageResolutionDays: number;
  compensationPaid: number;
  workOrders: number;
  openWorkOrders: number;
  maintenanceCost: number;
  equipmentDowntimeHours: number;
  assetsOutOfService: number;
  facilityChecksDue: number;
  facilityChecksCompleted: number;
  complianceRatePercent: number;
  accessDenials: number;
  manualOverrides: number;
  controllerOutages: number;
  lostPropertyHeld: number;
  incidentsByKind: RevenueLineDto[];
  denialsByReason: RevenueLineDto[];
  complaintsByCategory: RevenueLineDto[];
}

/** The filter every report takes, so the toolbars look and behave the same everywhere. */
export interface ReportFilterDto {
  clubId?: string | null;
  period: ReportPeriod;
  from?: string | null;
  to?: string | null;
  planId?: string | null;
  staffId?: string | null;
  classTypeId?: string | null;
  groupBy?: string | null;
  compareToPreviousPeriod: boolean;
}

/** A report emailed on a schedule, so a manager does not have to remember to open it. */
export interface ReportSubscriptionDto {
  id: string;
  clubId?: string | null;
  reportKey: string;
  reportName: string;
  /** Daily, weekly or monthly, plus the day it lands on. */
  cadence: string;
  dayOfWeek?: number | null;
  dayOfMonth?: number | null;
  sendAt: string;
  recipients: string[];
  format: string;
  filterJson?: string | null;
  lastSentAt?: string | null;
  nextSendAt?: string | null;
  isActive: boolean;
}
