import * as E from './distribution.enums';

/**
 * Wire shapes for the Distribution API, mirroring `Distribution.Application.DTOs`.
 *
 * Money, tax, scheme benefit and credit are **always computed server-side**. These interfaces
 * describe what the API returns; screens display it and never recalculate it. The one exception
 * is presentation arithmetic with no commercial meaning — a bar height, a percentage of a total
 * already supplied.
 */

// ── Envelopes ────────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  errors?: string[];
}

export interface PaginationMetadata {
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

export interface PaginatedResponse<T> {
  success: boolean;
  message?: string;
  data: T[];
  pagination?: PaginationMetadata;
}

export interface PageQuery {
  pageNumber?: number;
  pageSize?: number;
  searchTerm?: string;
  sortBy?: string;
  sortDirection?: string;
}

// ── Network ──────────────────────────────────────────────────────────────────

export interface PartnerContactDto {
  id: string;
  fullName: string;
  designation?: string;
  phone?: string;
  email?: string;
  isPrimary: boolean;
  handlesClaims: boolean;
  handlesPayments: boolean;
}

export interface PartnerDocumentDto {
  id: string;
  documentType: string;
  documentNumber?: string;
  fileUrl?: string;
  issuedOn?: string;
  expiresOn?: string;
  isVerified: boolean;
  verifiedAt?: string;
  verificationNote?: string;
  daysToExpiry?: number;
}

export interface PartnerAuthorisationDto {
  id: string;
  brandId?: string;
  categoryId?: string;
  itemId?: string;
  scopeName?: string;
  effectiveFrom: string;
  effectiveTo?: string;
  isExclusive: boolean;
}

export interface PartnerDto {
  id: string;
  code?: string;
  name: string;
  tradeName?: string;
  partnerType: E.PartnerType;
  status: E.PartnerStatus;
  servicingModel: E.ServicingModel;
  parentPartnerId?: string;
  parentPartnerName?: string;
  contactPerson?: string;
  phone?: string;
  alternatePhone?: string;
  email?: string;
  addressLine?: string;
  city?: string;
  stateName?: string;
  postalCode?: string;
  countryCode?: string;
  latitude?: number;
  longitude?: number;
  taxRegistrationNumber?: string;
  secondaryTaxNumber?: string;
  territoryId?: string;
  territoryName?: string;
  servicingWarehouseId?: string;
  partnerWarehouseId?: string;
  priceListId?: string;
  crmAccountId?: string;
  currencyCode: string;
  creditLimit: number;
  creditDays: number;
  creditEnforcement: E.CreditEnforcement;
  securityDeposit: number;
  marginPercent: number;
  minimumMonthlyOfftake: number;
  appointedOn?: string;
  agreementExpiresOn?: string;
  terminatedOn?: string;
  terminationReason?: string;
  statusReason?: string;
  secondaryCaptureMode: E.SecondaryCaptureMode;
  portalUserId?: string;
  notes?: string;
  isActive: boolean;
  contacts: PartnerContactDto[];
  documents: PartnerDocumentDto[];
  authorisations: PartnerAuthorisationDto[];
  outletCount: number;
  childPartnerCount: number;
  outstandingAmount: number;
  overdueAmount: number;
  monthToDateSales: number;
  openClaimCount: number;
  expiringDocumentCount: number;
}

export type SavePartnerDto = Partial<Omit<PartnerDto,
  'id' | 'contacts' | 'documents' | 'authorisations'>> & {
  name: string;
  contacts?: PartnerContactDto[];
  authorisations?: PartnerAuthorisationDto[];
};

export interface ChangePartnerStatusDto {
  status: E.PartnerStatus;
  reason?: string;
}

export interface PartnerTreeNodeDto {
  id: string;
  code?: string;
  name: string;
  partnerType: E.PartnerType;
  status: E.PartnerStatus;
  outletCount: number;
  monthToDateSales: number;
  outstandingAmount: number;
  children: PartnerTreeNodeDto[];
}

export interface OutletContactDto {
  id: string;
  fullName: string;
  designation?: string;
  phone?: string;
  email?: string;
  isPrimary: boolean;
}

export interface OutletRouteLinkDto {
  routeId: string;
  routeName: string;
  kind: E.RouteKind;
  stopSequence: number;
  isMustVisit: boolean;
  frequency: E.VisitFrequency;
}

export interface OutletAssetDto {
  id: string;
  outletId: string;
  outletName?: string;
  kind: E.OutletAssetKind;
  assetTag: string;
  serialNumber?: string;
  model?: string;
  manufacturer?: string;
  placedOn: string;
  retrievedOn?: string;
  assetValue: number;
  depositTaken: number;
  condition: E.AssetCondition;
  lastVerifiedAt?: string;
  serviceDueOn?: string;
  photoUrl?: string;
  note?: string;
  daysSinceVerified?: number;
}

export interface OutletPhotoDto {
  id: string;
  outletId: string;
  visitId?: string;
  imageUrl: string;
  caption?: string;
  tag?: string;
  capturedAt: string;
  pairedPhotoId?: string;
}

export interface OutletNoteDto {
  id: string;
  outletId: string;
  visitId?: string;
  text: string;
  authorName?: string;
  notedAt: string;
  isPinned: boolean;
}

export interface CreditSnapshotDto {
  outletId?: string;
  partnerId?: string;
  currencyCode: string;
  creditLimit: number;
  temporaryLimit: number;
  temporaryLimitExpiresOn?: string;
  effectiveLimit: number;
  creditDays: number;
  enforcement: E.CreditEnforcement;
  outstandingAmount: number;
  overdueAmount: number;
  unbilledOrderValue: number;
  availableCredit: number;
  bucket0To30: number;
  bucket31To60: number;
  bucket61To90: number;
  bucket90Plus: number;
  oldestInvoiceDays: number;
  lastPaymentAt?: string;
  lastPaymentAmount: number;
  isBlocked: boolean;
  blockReason?: string;
  bouncedChequeCount: number;
  securityDeposit: number;
  advanceHeld: number;
  provisionedAmount: number;
  recalculatedAt?: string;
}

export interface OutletDto {
  id: string;
  code?: string;
  name: string;
  ownerName?: string;
  ownerPhone?: string;
  decisionMakerName?: string;
  alternatePhone?: string;
  email?: string;
  channel: E.OutletChannel;
  subChannel?: string;
  grade: E.OutletGrade;
  status: E.OutletStatus;
  statusReason?: string;
  chainName?: string;
  storeFormat?: string;
  shelfCount?: number;
  hasRefrigeration: boolean;
  addressLine?: string;
  landmark?: string;
  area?: string;
  city?: string;
  stateName?: string;
  postalCode?: string;
  countryCode?: string;
  latitude?: number;
  longitude?: number;
  geofenceRadiusMetres: number;
  geoNodeId?: string;
  partnerId?: string;
  partnerName?: string;
  territoryId?: string;
  territoryName?: string;
  priceListId?: string;
  schemeGroupId?: string;
  crmContactId?: string;
  currencyCode: string;
  creditLimit: number;
  creditDays: number;
  creditEnforcement: E.CreditEnforcement;
  preferredTender: E.PaymentTender;
  taxRegistrationNumber?: string;
  licenceNumber?: string;
  licenceExpiresOn?: string;
  opensAt?: string;
  closesAt?: string;
  weeklyOffDay?: number;
  preferredDeliveryFrom?: string;
  preferredDeliveryTo?: string;
  onboardedAt?: string;
  firstOrderAt?: string;
  lastVisitAt?: string;
  lastOrderAt?: string;
  lastPaymentAt?: string;
  lifetimeSales: number;
  averageMonthlyOfftake: number;
  outstandingAmount: number;
  totalVisits: number;
  productiveVisits: number;
  perfectStoreScore: number;
  photoUrl?: string;
  notes?: string;
  isApproved: boolean;
  isActive: boolean;
  routes: OutletRouteLinkDto[];
  assets: OutletAssetDto[];
  contacts: OutletContactDto[];
  daysSinceLastVisit?: number;
  credit?: CreditSnapshotDto;
}

export type SaveOutletDto = Partial<Omit<OutletDto,
  'id' | 'routes' | 'assets' | 'contacts' | 'credit'>> & {
  name: string;
  routeIds?: string[];
  contacts?: OutletContactDto[];
};

export interface OnboardOutletDto {
  name: string;
  ownerName?: string;
  ownerPhone: string;
  channel: E.OutletChannel;
  grade: E.OutletGrade;
  addressLine?: string;
  landmark?: string;
  area?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  photoUrl?: string;
  taxRegistrationNumber?: string;
  routeId?: string;
  partnerId?: string;
  fieldRepId?: string;
  note?: string;
  overrideDuplicateWarning?: boolean;
  idempotencyKey?: string;
}

export interface DuplicateCandidateDto {
  outletId: string;
  code?: string;
  name: string;
  ownerPhone?: string;
  addressLine?: string;
  matchReason: string;
  distanceMetres?: number;
}

export interface OutletItemOfftakeDto {
  itemId: string;
  itemName: string;
  itemCode?: string;
  brandName?: string;
  quantity: number;
  value: number;
  lastPurchasedAt?: string;
  peerBuyerCount: number;
  peerAverageQuantity: number;
}

export interface MerchandisingAuditSummaryDto {
  id: string;
  kind: E.AuditKind;
  auditedAt: string;
  score: number;
  shareOfShelfPercent: number;
  onShelfAvailabilityPercent: number;
  fieldRepName?: string;
}

export interface Outlet360Dto {
  outlet: OutletDto;
  credit: CreditSnapshotDto;
  recentVisits: VisitSummaryDto[];
  recentOrders: OrderSummaryDto[];
  recentCollections: CollectionSummaryDto[];
  recentReturns: ReturnSummaryDto[];
  photos: OutletPhotoDto[];
  notes: OutletNoteDto[];
  schemeHistory: SchemeApplicationDto[];
  audits: MerchandisingAuditSummaryDto[];
  topItems: OutletItemOfftakeDto[];
  gapItems: OutletItemOfftakeDto[];
  monthToDateSales: number;
  lastMonthSales: number;
  yearToDateSales: number;
  growthPercent: number;
}

// ── Geography, territories, routes ───────────────────────────────────────────

export interface GeoNodeDto {
  id: string;
  code?: string;
  name: string;
  parentId?: string;
  levelName: string;
  depth: number;
  path?: string;
  managerUserId?: string;
  latitude?: number;
  longitude?: number;
  isActive: boolean;
  children: GeoNodeDto[];
  outletCount: number;
}

export interface TerritoryDto {
  id: string;
  code?: string;
  name: string;
  parentId?: string;
  parentName?: string;
  geoNodeId?: string;
  geoNodeName?: string;
  managerFieldRepId?: string;
  managerName?: string;
  defaultPartnerId?: string;
  defaultWarehouseId?: string;
  currencyCode: string;
  isActive: boolean;
  description?: string;
  routeCount: number;
  outletCount: number;
  partnerCount: number;
  monthToDateSales: number;
  children: TerritoryDto[];
}

export type SaveTerritoryDto = Partial<Omit<TerritoryDto, 'id' | 'children'>> & { name: string };

export interface RouteStopDto {
  id: string;
  outletId: string;
  outletName: string;
  outletCode?: string;
  channel: E.OutletChannel;
  grade: E.OutletGrade;
  status: E.OutletStatus;
  addressLine?: string;
  latitude?: number;
  longitude?: number;
  stopSequence: number;
  serviceMinutes: number;
  distanceFromPreviousKm: number;
  frequencyOverride?: E.VisitFrequency;
  isMustVisit: boolean;
  outstandingAmount: number;
  lastVisitAt?: string;
}

export interface RouteDto {
  id: string;
  code?: string;
  name: string;
  kind: E.RouteKind;
  frequency: E.VisitFrequency;
  territoryId: string;
  territoryName?: string;
  partnerId?: string;
  partnerName?: string;
  fieldRepId?: string;
  fieldRepName?: string;
  vehicleId?: string;
  vanUnitId?: string;
  warehouseId?: string;
  activeDays?: string;
  activeWeeks?: string;
  startTime?: string;
  endTime?: string;
  targetCallsPerDay: number;
  minimumProductiveCalls: number;
  plannedDistanceKm: number;
  plannedDurationMinutes: number;
  outletCount: number;
  lastRunAt?: string;
  isActive: boolean;
  description?: string;
  stops: RouteStopDto[];
  coveragePercent: number;
  strikeRatePercent: number;
  monthToDateSales: number;
}

export type SaveRouteDto = Partial<Omit<RouteDto, 'id' | 'stops'>> & {
  name: string;
  territoryId: string;
};

export interface ResequenceRouteDto { routeId: string; orderedRouteOutletIds: string[] }
export interface AssignRouteDto {
  routeId: string;
  fieldRepId: string;
  effectiveFrom: string;
  effectiveTo?: string;
  isTemporary: boolean;
  reason?: string;
}
export interface AddOutletsToRouteDto { routeId: string; outletIds: string[]; markMustVisit?: boolean }

export interface JourneyPlanDayDto {
  id: string;
  planDate: string;
  routeId?: string;
  routeName?: string;
  routeKind?: E.RouteKind;
  status: E.JourneyPlanDayStatus;
  reassignedToFieldRepId?: string;
  reassignedToName?: string;
  skipReason?: string;
  plannedCalls: number;
  actualCalls: number;
  productiveCalls: number;
  fieldDayId?: string;
}

export interface JourneyPlanDto {
  id: string;
  fieldRepId: string;
  fieldRepName?: string;
  territoryId?: string;
  territoryName?: string;
  periodStart: string;
  periodEnd: string;
  name?: string;
  isPublished: boolean;
  publishedAt?: string;
  plannedCalls: number;
  actualCalls: number;
  productiveCalls: number;
  unplannedCalls: number;
  missedCalls: number;
  coveragePercent: number;
  strikeRatePercent: number;
  days: JourneyPlanDayDto[];
}

export interface GenerateJourneyPlanDto {
  fieldRepId: string;
  periodStart: string;
  periodEnd: string;
  routeIds?: string[];
  nonWorkingDays?: number[];
  holidayDates?: string[];
  overwrite?: boolean;
}

export interface UpdateJourneyPlanDayDto {
  routeId?: string;
  status?: E.JourneyPlanDayStatus;
  reassignedToFieldRepId?: string;
  skipReason?: string;
}

// ── Field force ──────────────────────────────────────────────────────────────

export interface FieldRepDto {
  id: string;
  code?: string;
  fullName: string;
  displayName?: string;
  role: E.FieldRole;
  phone?: string;
  email?: string;
  photoUrl?: string;
  userId?: string;
  employeeId?: string;
  partnerId?: string;
  partnerName?: string;
  territoryId?: string;
  territoryName?: string;
  reportsToFieldRepId?: string;
  reportsToName?: string;
  defaultVanUnitId?: string;
  defaultWarehouseId?: string;
  joinedOn?: string;
  leftOn?: string;
  cashHoldingLimit: number;
  discountAuthorityPercent: number;
  canOnboardOutlets: boolean;
  canCollectPayments: boolean;
  canAcceptReturns: boolean;
  hasPin: boolean;
  isActive: boolean;
  note?: string;
  routeCount: number;
  outletCount: number;
  todayStatus?: E.FieldDayStatus;
  monthToDateSales: number;
  coveragePercent: number;
  strikeRatePercent: number;
}

export type SaveFieldRepDto = Partial<Omit<FieldRepDto, 'id' | 'hasPin'>> & {
  fullName: string;
  pin?: string;
};

export interface FieldDeviceDto {
  id: string;
  fieldRepId?: string;
  fieldRepName?: string;
  deviceIdentifier: string;
  deviceName?: string;
  platform?: string;
  osVersion?: string;
  appVersion?: string;
  registeredAt?: string;
  lastSeenAt?: string;
  lastSyncAt?: string;
  pendingOutboxCount: number;
  isBlocked: boolean;
  blockReason?: string;
  wipeRequested: boolean;
  wipedAt?: string;
  minutesSinceSync?: number;
}

export interface FieldDayDto {
  id: string;
  fieldRepId: string;
  fieldRepName?: string;
  workDate: string;
  routeId?: string;
  routeName?: string;
  routeKind?: E.RouteKind;
  vanUnitId?: string;
  vanUnitName?: string;
  status: E.FieldDayStatus;
  startedAt?: string;
  closedAt?: string;
  startLatitude?: number;
  startLongitude?: number;
  startSelfieUrl?: string;
  distanceCoveredKm: number;
  plannedCalls: number;
  actualCalls: number;
  productiveCalls: number;
  unplannedCalls: number;
  newOutletsAdded: number;
  distinctLinesSold: number;
  orderValue: number;
  invoicedValue: number;
  collectedAmount: number;
  returnValue: number;
  cashDeclared: number;
  unsyncedCount: number;
  lastSyncAt?: string;
  forceCloseReason?: string;
  note?: string;
  coveragePercent: number;
  strikeRatePercent: number;
  linesPerCall: number;
  settlementId?: string;
  settlementStatus?: E.SettlementStatus;
}

export interface StartDayDto {
  fieldRepId: string;
  workDate: string;
  routeId?: string;
  vanUnitId?: string;
  latitude?: number;
  longitude?: number;
  selfieUrl?: string;
  deviceIdentifier?: string;
  idempotencyKey?: string;
}

export interface CloseDayDto {
  fieldDayId: string;
  cashDeclared: number;
  distanceCoveredKm: number;
  latitude?: number;
  longitude?: number;
  note?: string;
  forceClose?: boolean;
  forceCloseReason?: string;
}

export interface VisitCardDto {
  visitId?: string;
  outletId: string;
  outletName: string;
  outletCode?: string;
  channel: E.OutletChannel;
  grade: E.OutletGrade;
  outletStatus: E.OutletStatus;
  addressLine?: string;
  landmark?: string;
  ownerName?: string;
  ownerPhone?: string;
  latitude?: number;
  longitude?: number;
  geofenceRadiusMetres: number;
  stopSequence: number;
  isMustVisit: boolean;
  isPlanned: boolean;
  status: E.VisitStatus;
  checkedInAt?: string;
  checkedOutAt?: string;
  durationMinutes?: number;
  isProductive: boolean;
  orderValue: number;
  collectedAmount: number;
  outstandingAmount: number;
  overdueAmount: number;
  isCreditBlocked: boolean;
  lastVisitAt?: string;
  lastOrderAt?: string;
  averageMonthlyOfftake: number;
  openTaskCount: number;
  assetCount: number;
  hasPinnedNote: boolean;
  pinnedNote?: string;
}

export interface FocusItemDto {
  itemId: string;
  itemName: string;
  itemCode?: string;
  imageUrl?: string;
  brandName?: string;
  targetQuantityPerOutlet: number;
  schemeId?: string;
  schemeName?: string;
  spiffRatePerUnit: number;
}

export interface VanStockBalanceDto {
  id: string;
  vanUnitId: string;
  itemId: string;
  itemName: string;
  itemCode?: string;
  batchId?: string;
  batchNumber?: string;
  expiryDate?: string;
  compartment: E.VanCompartment;
  uom: string;
  quantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  unitCost: number;
  unitPrice: number;
  stockValue: number;
  lastMovementAt?: string;
  daysToExpiry?: number;
}

export interface VanStockSummaryDto {
  vanUnitId: string;
  vanUnitName?: string;
  sellableValue: number;
  returnValue: number;
  damagedValue: number;
  expiredValue: number;
  totalValue: number;
  lineCount: number;
  nearExpiryLineCount: number;
  balances: VanStockBalanceDto[];
}

export interface FieldDayBoardDto {
  day: FieldDayDto;
  stops: VisitCardDto[];
  tasks: VisitTaskDto[];
  mustSellItems: FocusItemDto[];
  surveys: SurveyFormDto[];
  vanStock?: VanStockSummaryDto;
  pendingStops: number;
  completedStops: number;
  targetValue: number;
  achievedValue: number;
  collectionTarget: number;
  collectedAmount: number;
}

export interface VisitDto {
  id: string;
  fieldDayId: string;
  outletId: string;
  outletName?: string;
  routeId?: string;
  fieldRepId: string;
  fieldRepName?: string;
  stopSequence: number;
  status: E.VisitStatus;
  isPlanned: boolean;
  checkedInAt?: string;
  checkedOutAt?: string;
  checkInLatitude?: number;
  checkInLongitude?: number;
  geoValidation: E.GeoValidation;
  distanceFromOutletMetres?: number;
  geoExceptionReason?: string;
  durationMinutes?: number;
  isProductive: boolean;
  noOrderReasonId?: string;
  noOrderReasonName?: string;
  noOrderNote?: string;
  orderId?: string;
  orderNumber?: string;
  orderValue: number;
  linesSold: number;
  collectedAmount: number;
  returnValue: number;
  mustSellSoldCount: number;
  mustSellTargetCount: number;
  surveyCompleted: boolean;
  auditCompleted: boolean;
  assetsVerified: boolean;
  note?: string;
}

export interface VisitSummaryDto {
  id: string;
  outletId: string;
  outletName?: string;
  checkedInAt?: string;
  durationMinutes?: number;
  status: E.VisitStatus;
  geoValidation: E.GeoValidation;
  isProductive: boolean;
  isPlanned: boolean;
  orderValue: number;
  collectedAmount: number;
  fieldRepName?: string;
  routeName?: string;
  noOrderReasonName?: string;
}

export interface CheckInDto {
  fieldDayId: string;
  outletId: string;
  latitude?: number;
  longitude?: number;
  geoExceptionReason?: string;
  isUnplanned?: boolean;
  idempotencyKey?: string;
}

export interface CheckOutDto {
  visitId: string;
  latitude?: number;
  longitude?: number;
  noOrderReasonId?: string;
  noOrderNote?: string;
  assetsVerified?: boolean;
  note?: string;
}

export interface VisitTaskDto {
  id: string;
  title: string;
  instructions?: string;
  outletId?: string;
  outletName?: string;
  routeId?: string;
  territoryId?: string;
  fieldRepId?: string;
  dueOn: string;
  completedAt?: string;
  requiresPhoto: boolean;
  photoUrl?: string;
  completionNote?: string;
  priority: number;
  isMandatory: boolean;
  isOverdue: boolean;
}

export type SaveVisitTaskDto = Partial<Omit<VisitTaskDto, 'id' | 'isOverdue'>> & {
  title: string;
  dueOn: string;
};

export interface CompleteVisitTaskDto {
  taskId: string;
  visitId?: string;
  photoUrl?: string;
  completionNote?: string;
}

export interface SurveyQuestionDto {
  id: string;
  text: string;
  kind: E.SurveyQuestionKind;
  displayOrder: number;
  isRequired: boolean;
  options?: string;
  minValue?: number;
  maxValue?: number;
  unit?: string;
  guidance?: string;
  showWhenQuestionId?: string;
  showWhenValue?: string;
}

export interface SurveyFormDto {
  id: string;
  name: string;
  instructions?: string;
  activeFrom?: string;
  activeTo?: string;
  applicableChannels?: string;
  territoryId?: string;
  routeId?: string;
  isMandatory: boolean;
  repeatEveryVisit: boolean;
  isActive: boolean;
  questions: SurveyQuestionDto[];
  responseCount: number;
}

export interface SurveyAnswerDto {
  questionId: string;
  textValue?: string;
  numericValue?: number;
  boolValue?: boolean;
  dateValue?: string;
  photoUrl?: string;
}

export interface SubmitSurveyDto {
  surveyFormId: string;
  outletId: string;
  visitId?: string;
  fieldRepId: string;
  latitude?: number;
  longitude?: number;
  answers: SurveyAnswerDto[];
}

export interface SurveyAnswerResultDto extends SurveyAnswerDto {
  questionText: string;
  kind: E.SurveyQuestionKind;
}

export interface SurveyResponseDto {
  id: string;
  surveyFormId: string;
  surveyName?: string;
  outletId: string;
  outletName?: string;
  visitId?: string;
  fieldRepId: string;
  fieldRepName?: string;
  submittedAt: string;
  answers: SurveyAnswerResultDto[];
}

export interface MerchandisingAuditLineDto {
  id: string;
  itemId: string;
  itemName: string;
  itemCode?: string;
  isExpectedInAssortment: boolean;
  isPresent: boolean;
  facings: number;
  expectedFacings: number;
  shelfStock: number;
  observedPrice?: number;
  mandatedPrice?: number;
  isPriceCompliant: boolean;
  isCorrectPosition: boolean;
  note?: string;
}

export interface MerchandisingAuditDto {
  id: string;
  outletId: string;
  outletName?: string;
  visitId?: string;
  fieldRepId: string;
  fieldRepName?: string;
  kind: E.AuditKind;
  auditedAt: string;
  score: number;
  maxScore: number;
  availabilityScore: number;
  visibilityScore: number;
  planogramScore: number;
  pricingScore: number;
  posmScore: number;
  shareOfShelfPercent: number;
  onShelfAvailabilityPercent: number;
  beforePhotoUrl?: string;
  afterPhotoUrl?: string;
  note?: string;
  lines: MerchandisingAuditLineDto[];
}

export interface SubmitAuditDto {
  outletId: string;
  visitId?: string;
  fieldRepId: string;
  kind: E.AuditKind;
  beforePhotoUrl?: string;
  afterPhotoUrl?: string;
  note?: string;
  lines: MerchandisingAuditLineDto[];
}

export interface CompetitorObservationDto {
  id: string;
  outletId: string;
  outletName?: string;
  visitId?: string;
  fieldRepId: string;
  fieldRepName?: string;
  competitorName: string;
  productName?: string;
  packSize?: string;
  observedPrice?: number;
  observedMrp?: number;
  schemeDescription?: string;
  visibleStock?: number;
  facings?: number;
  hasDisplay: boolean;
  hasPosm: boolean;
  photoUrl?: string;
  observedAt: string;
  note?: string;
}

export interface PosmPlacementDto {
  id: string;
  outletId: string;
  outletName?: string;
  visitId?: string;
  fieldRepId: string;
  itemId?: string;
  materialName: string;
  quantity: number;
  placedOn: string;
  expiresOn?: string;
  removedOn?: string;
  schemeId?: string;
  schemeName?: string;
  photoUrl?: string;
  position?: string;
  isVerified: boolean;
  lastVerifiedAt?: string;
  note?: string;
  isExpired: boolean;
}

// ── Orders ───────────────────────────────────────────────────────────────────

export interface DistributionOrderLineDto {
  id: string;
  displayOrder: number;
  itemId: string;
  itemName: string;
  itemCode?: string;
  imageUrl?: string;
  brandId?: string;
  brandName?: string;
  categoryId?: string;
  batchId?: string;
  batchNumber?: string;
  expiryDate?: string;
  uom: string;
  uomFactor: number;
  quantity: number;
  baseQuantity: number;
  allocatedQuantity: number;
  pickedQuantity: number;
  dispatchedQuantity: number;
  deliveredQuantity: number;
  returnedQuantity: number;
  backorderedQuantity: number;
  unitPrice: number;
  mrp: number;
  discountPercent: number;
  discountAmount: number;
  schemeDiscountAmount: number;
  taxPercent: number;
  taxAmount: number;
  lineTotal: number;
  unitCost: number;
  marginAmount: number;
  isFreeGoods: boolean;
  schemeId?: string;
  schemeName?: string;
  priceScope?: E.PriceScope;
  isPriceOverridden: boolean;
  priceOverrideReason?: string;
  isShortPicked: boolean;
  note?: string;
  availableQuantity: number;
}

export interface SaveOrderLineDto {
  id?: string;
  itemId: string;
  batchId?: string;
  uom: string;
  quantity: number;
  unitPrice?: number;
  discountPercent?: number;
  priceOverrideReason?: string;
  note?: string;
}

export interface OrderStatusEventDto {
  fromStatus: E.DistributionOrderStatus;
  toStatus: E.DistributionOrderStatus;
  occurredAt: string;
  actorName?: string;
  note?: string;
}

export interface OrderApprovalDto {
  id: string;
  stepNumber: number;
  stepName: string;
  triggerReason?: string;
  approverName?: string;
  isApproved?: boolean;
  decidedAt?: string;
  comment?: string;
  isEscalated: boolean;
}

export interface SchemeApplicationDto {
  id: string;
  schemeId: string;
  schemeName: string;
  schemeKind: E.TradeSchemeKind;
  orderId?: string;
  orderNumber?: string;
  orderLineId?: string;
  outletId?: string;
  outletName?: string;
  partnerId?: string;
  appliedAt: string;
  qualifyingQuantity: number;
  qualifyingValue: number;
  slabNumber?: number;
  freeQuantity: number;
  freeItemId?: string;
  freeItemName?: string;
  discountAmount: number;
  payoutAmount: number;
  pointsAwarded: number;
  benefitValue: number;
  settlementMode: E.SchemeSettlementMode;
  claimId?: string;
  isSettled: boolean;
  benefitDescription?: string;
  isReversed: boolean;
}

export interface NextSlabHintDto {
  schemeId: string;
  schemeName: string;
  itemId?: string;
  itemName?: string;
  uom: string;
  currentQuantity: number;
  requiredQuantity: number;
  shortfallQuantity: number;
  currentBenefit: number;
  nextBenefit: number;
  extraBenefit: number;
  message: string;
}

export interface CreditCheckResultDto {
  isAllowed: boolean;
  requiresOverride: boolean;
  enforcement: E.CreditEnforcement;
  orderValue: number;
  availableCredit: number;
  excessAmount: number;
  overdueAmount: number;
  isBlocked: boolean;
  message?: string;
  snapshot?: CreditSnapshotDto;
}

export interface OrderQuoteDto {
  outletId?: string;
  partnerId?: string;
  currencyCode: string;
  subTotal: number;
  discountAmount: number;
  schemeDiscountAmount: number;
  freeGoodsValue: number;
  taxAmount: number;
  totalAmount: number;
  marginAmount: number;
  marginPercent: number;
  lines: DistributionOrderLineDto[];
  appliedSchemes: SchemeApplicationDto[];
  nextSlabHints: NextSlabHintDto[];
  credit: CreditCheckResultDto;
  warnings: string[];
  blockers: string[];
  requiresApproval: boolean;
  approvalReason?: string;
}

export interface QuoteOrderDto {
  outletId?: string;
  partnerId?: string;
  warehouseId?: string;
  vanUnitId?: string;
  fieldRepId?: string;
  orderDate?: string;
  lines: SaveOrderLineDto[];
}

export interface DistributionOrderDto {
  id: string;
  orderNumber: string;
  source: E.OrderSource;
  kind: E.DistributionOrderKind;
  status: E.DistributionOrderStatus;
  outletId?: string;
  outletName?: string;
  outletCode?: string;
  outletChannel?: E.OutletChannel;
  partnerId?: string;
  partnerName?: string;
  customerName?: string;
  customerPhone?: string;
  visitId?: string;
  fieldDayId?: string;
  fieldRepId?: string;
  fieldRepName?: string;
  routeId?: string;
  routeName?: string;
  territoryId?: string;
  warehouseId?: string;
  vanUnitId?: string;
  tripId?: string;
  linkedPurchaseOrderId?: string;
  salesOrderId?: string;
  salesInvoiceId?: string;
  orderDate: string;
  requestedDeliveryDate?: string;
  promisedDeliveryDate?: string;
  dispatchedAt?: string;
  deliveredAt?: string;
  currencyCode: string;
  exchangeRate: number;
  subTotal: number;
  discountAmount: number;
  schemeDiscountAmount: number;
  freeGoodsValue: number;
  taxAmount: number;
  freightAmount: number;
  roundingAmount: number;
  totalAmount: number;
  paidAmount: number;
  costAmount: number;
  marginAmount: number;
  marginPercent: number;
  requiresApproval: boolean;
  approvedAt?: string;
  holdReason?: string;
  rejectionReason?: string;
  cancelNote?: string;
  hasCreditOverride: boolean;
  isBackorderParent: boolean;
  backorderOfOrderId?: string;
  lineCount: number;
  totalQuantity: number;
  fillRatePercent: number;
  externalReference?: string;
  note?: string;
  lines: DistributionOrderLineDto[];
  statusEvents: OrderStatusEventDto[];
  approvals: OrderApprovalDto[];
  appliedSchemes: SchemeApplicationDto[];
  nextSlabHints: NextSlabHintDto[];
}

export interface OrderSummaryDto {
  id: string;
  orderNumber: string;
  orderDate: string;
  status: E.DistributionOrderStatus;
  source: E.OrderSource;
  kind: E.DistributionOrderKind;
  outletId?: string;
  outletName?: string;
  partnerId?: string;
  partnerName?: string;
  fieldRepName?: string;
  routeName?: string;
  currencyCode: string;
  totalAmount: number;
  paidAmount: number;
  lineCount: number;
  fillRatePercent: number;
  promisedDeliveryDate?: string;
  requiresApproval: boolean;
  isOverdueForDelivery: boolean;
}

export interface RecordCollectionDto {
  outletId?: string;
  partnerId?: string;
  visitId?: string;
  fieldDayId?: string;
  fieldRepId?: string;
  tripId?: string;
  collectedAt?: string;
  tender: E.PaymentTender;
  currencyCode?: string;
  amount: number;
  cashDiscountAmount?: number;
  reference?: string;
  bankName?: string;
  cardLast4?: string;
  cardScheme?: string;
  latitude?: number;
  longitude?: number;
  receiptSentTo?: string;
  note?: string;
  cheque?: SaveChequeDto;
  allocations?: PaymentAllocationDto[];
  idempotencyKey?: string;
}

export interface CreateOrderDto {
  source: E.OrderSource;
  kind: E.DistributionOrderKind;
  outletId?: string;
  partnerId?: string;
  customerName?: string;
  customerPhone?: string;
  visitId?: string;
  fieldDayId?: string;
  fieldRepId?: string;
  routeId?: string;
  warehouseId?: string;
  vanUnitId?: string;
  orderDate?: string;
  requestedDeliveryDate?: string;
  currencyCode?: string;
  freightAmount?: number;
  externalReference?: string;
  note?: string;
  lines: SaveOrderLineDto[];
  submitImmediately?: boolean;
  isVanSale?: boolean;
  collection?: RecordCollectionDto;
  idempotencyKey?: string;
}

export interface UpdateOrderDto {
  requestedDeliveryDate?: string;
  promisedDeliveryDate?: string;
  warehouseId?: string;
  freightAmount?: number;
  note?: string;
  lines?: SaveOrderLineDto[];
}

export interface OrderDecisionDto { orderId: string; isApproved: boolean; comment?: string; reasonCodeId?: string }
export interface CancelOrderDto { reasonCodeId: string; note?: string }

export interface CatalogueUomDto { uom: string; factor: number; unitPrice: number; isDefault: boolean }

export interface CatalogueItemDto {
  itemId: string;
  itemName: string;
  itemCode?: string;
  barcode?: string;
  imageUrl?: string;
  brandId?: string;
  brandName?: string;
  categoryId?: string;
  categoryName?: string;
  uoms: CatalogueUomDto[];
  mrp: number;
  taxPercent: number;
  availableQuantity: number;
  isAuthorised: boolean;
  unauthorisedReason?: string;
  activeSchemes: string[];
  lastOrderedQuantity: number;
  lastOrderedAt?: string;
  suggestedQuantity: number;
  isFocusItem: boolean;
  isNeverBought: boolean;
  nearestExpiryDate?: string;
}

export interface AllocateOrderDto {
  orderId: string;
  strategy?: E.AllocationStrategy;
  warehouseId?: string;
  hardAllocate?: boolean;
}

export interface StockAllocationDto {
  id: string;
  orderId: string;
  orderLineId: string;
  itemId: string;
  itemName?: string;
  warehouseId?: string;
  binId?: string;
  batchId?: string;
  batchNumber?: string;
  expiryDate?: string;
  quantity: number;
  strategy: E.AllocationStrategy;
  isHardAllocation: boolean;
  allocatedAt: string;
  expiresAt?: string;
  isFefoOverridden: boolean;
}

// ── Van sales ────────────────────────────────────────────────────────────────

export interface VanUnitDto {
  id: string;
  code?: string;
  name: string;
  warehouseId?: string;
  homeWarehouseId?: string;
  vehicleId?: string;
  vehicleRegistration?: string;
  fieldRepId?: string;
  fieldRepName?: string;
  routeId?: string;
  routeName?: string;
  capacityWeightKg: number;
  capacityVolumeM3: number;
  isRefrigerated: boolean;
  minSafeCelsius?: number;
  maxSafeCelsius?: number;
  isMultiDay: boolean;
  lastLoadedAt?: string;
  lastSettledAt?: string;
  isActive: boolean;
  note?: string;
  stockValue: number;
  stockLineCount: number;
  utilisationPercent: number;
}

export type SaveVanUnitDto = Partial<Omit<VanUnitDto, 'id'>> & { name: string };

export interface VanLoadLineDto {
  id: string;
  displayOrder: number;
  itemId: string;
  itemName: string;
  itemCode?: string;
  batchId?: string;
  batchNumber?: string;
  expiryDate?: string;
  uom: string;
  uomFactor: number;
  suggestedQuantity: number;
  requestedQuantity: number;
  approvedQuantity: number;
  pickedQuantity: number;
  loadedQuantity: number;
  unitCost: number;
  unitPrice: number;
  lineValue: number;
  compartment: E.VanCompartment;
  varianceReason?: string;
  availableAtSource: number;
}

export interface VanLoadSheetDto {
  id: string;
  loadNumber: string;
  vanUnitId: string;
  vanUnitName?: string;
  routeId?: string;
  routeName?: string;
  fieldRepId?: string;
  fieldRepName?: string;
  fieldDayId?: string;
  sourceWarehouseId?: string;
  loadDate: string;
  status: E.VanLoadStatus;
  isSuggested: boolean;
  approvedAt?: string;
  loadedAt?: string;
  rejectionReason?: string;
  totalCostValue: number;
  totalSaleValue: number;
  totalWeightKg: number;
  varianceLineCount: number;
  note?: string;
  lines: VanLoadLineDto[];
}

export interface CreateVanLoadDto {
  vanUnitId: string;
  routeId?: string;
  fieldRepId?: string;
  fieldDayId?: string;
  sourceWarehouseId?: string;
  loadDate: string;
  note?: string;
  lines: Partial<VanLoadLineDto>[];
  autoSuggest?: boolean;
}

export interface ConfirmVanLoadDto {
  loadSheetId: string;
  lines: { lineId: string; loadedQuantity: number; varianceReason?: string }[];
  note?: string;
}

export interface VanStockMovementDto {
  id: string;
  kind: E.VanMovementKind;
  occurredAt: string;
  itemId: string;
  itemName: string;
  batchNumber?: string;
  compartment: E.VanCompartment;
  uom: string;
  quantity: number;
  balanceAfter: number;
  value: number;
  referenceType?: string;
  referenceNumber?: string;
  reason?: string;
}

export interface VanTransferDto {
  fromVanUnitId: string;
  toVanUnitId?: string;
  toWarehouseId?: string;
  lines: { itemId: string; batchId?: string; compartment: E.VanCompartment; uom: string; quantity: number }[];
  reason?: string;
}

export interface VanCycleCountLineDto {
  id: string;
  itemId: string;
  itemName: string;
  batchId?: string;
  batchNumber?: string;
  expiryDate?: string;
  compartment: E.VanCompartment;
  uom: string;
  expectedQuantity: number;
  countedQuantity: number;
  varianceQuantity: number;
  unitCost: number;
  varianceValue: number;
  reasonCodeId?: string;
  reasonCodeName?: string;
  reasonNote?: string;
  isAdjusted: boolean;
}

export interface VanCycleCountDto {
  id: string;
  countNumber: string;
  vanUnitId: string;
  vanUnitName?: string;
  fieldDayId?: string;
  fieldRepId?: string;
  countedAt: string;
  isFullCount: boolean;
  isBlind: boolean;
  lineCount: number;
  varianceLineCount: number;
  varianceValue: number;
  isApproved: boolean;
  note?: string;
  lines: VanCycleCountLineDto[];
}

export interface StartVanCountDto {
  vanUnitId: string;
  fieldDayId?: string;
  fieldRepId?: string;
  isFullCount: boolean;
  isBlind: boolean;
  itemIds?: string[];
}

export interface SubmitVanCountDto {
  countId: string;
  lines: { lineId: string; countedQuantity: number; reasonCodeId?: string; reasonNote?: string }[];
  note?: string;
}

// ── Fulfilment ───────────────────────────────────────────────────────────────

export interface PickTaskLineDto {
  id: string;
  orderId?: string;
  orderNumber?: string;
  orderLineId?: string;
  itemId: string;
  itemName: string;
  itemCode?: string;
  binId?: string;
  binCode?: string;
  nominatedBatchId?: string;
  nominatedBatchNumber?: string;
  pickedBatchId?: string;
  pickedBatchNumber?: string;
  expiryDate?: string;
  uom: string;
  requiredQuantity: number;
  pickedQuantity: number;
  pickSequence: number;
  isShort: boolean;
  isFefoOverridden: boolean;
  overrideReason?: string;
  pickedAt?: string;
}

export interface PickTaskDto {
  id: string;
  waveId: string;
  taskNumber: string;
  status: E.PickTaskStatus;
  orderId?: string;
  orderNumber?: string;
  assignedToUserId?: string;
  assignedToName?: string;
  zoneName?: string;
  startedAt?: string;
  completedAt?: string;
  lineCount: number;
  shortLineCount: number;
  lines: PickTaskLineDto[];
}

export interface PickWaveDto {
  id: string;
  waveNumber: string;
  warehouseId?: string;
  strategy: E.PickStrategy;
  releasedAt: string;
  completedAt?: string;
  routeId?: string;
  routeName?: string;
  tripId?: string;
  deliveryDate?: string;
  carrierCutOffAt?: string;
  priority: number;
  orderCount: number;
  taskCount: number;
  completedTaskCount: number;
  totalLines: number;
  pickedLines: number;
  shortLines: number;
  isClosed: boolean;
  note?: string;
  progressPercent: number;
  tasks: PickTaskDto[];
}

export interface CreatePickWaveDto {
  warehouseId?: string;
  strategy: E.PickStrategy;
  orderIds: string[];
  routeId?: string;
  tripId?: string;
  deliveryDate?: string;
  carrierCutOffAt?: string;
  priority?: number;
  note?: string;
  zones?: string[];
}

export interface ConfirmPickDto {
  taskLineId: string;
  pickedQuantity: number;
  pickedBatchId?: string;
  overrideReason?: string;
  shortReasonCodeId?: string;
}

export interface PackageContentDto {
  orderLineId?: string;
  itemId: string;
  itemName: string;
  batchId?: string;
  batchNumber?: string;
  expiryDate?: string;
  uom: string;
  quantity: number;
  serialNumbers?: string;
}

export interface PackageDto {
  id: string;
  licencePlate: string;
  kind: E.PackageKind;
  orderId?: string;
  orderNumber?: string;
  tripId?: string;
  dispatchId?: string;
  weightKg: number;
  lengthCm: number;
  widthCm: number;
  heightCm: number;
  packedAt?: string;
  loadedAt?: string;
  deliveredAt?: string;
  stagingLocation?: string;
  isSealed: boolean;
  sealNumber?: string;
  contents: PackageContentDto[];
}

export interface CreatePackageDto {
  kind: E.PackageKind;
  orderId?: string;
  waveId?: string;
  weightKg?: number;
  lengthCm?: number;
  widthCm?: number;
  heightCm?: number;
  stagingLocation?: string;
  sealNumber?: string;
  contents: PackageContentDto[];
}

export interface DispatchLineDto {
  orderId: string;
  orderNumber?: string;
  outletId?: string;
  outletName?: string;
  packageCount: number;
  value: number;
  stopSequence: number;
}

export interface DispatchDto {
  id: string;
  dispatchNumber: string;
  warehouseId?: string;
  tripId?: string;
  tripNumber?: string;
  vehicleId?: string;
  vehicleRegistration?: string;
  driverId?: string;
  driverName?: string;
  dispatchedAt: string;
  gatePassNumber?: string;
  transportDocumentNumber?: string;
  carrierName?: string;
  airwayBillNumber?: string;
  freightCost: number;
  packageCount: number;
  totalWeightKg: number;
  totalValue: number;
  driverAcknowledgement?: string;
  note?: string;
  lines: DispatchLineDto[];
}

export interface CreateDispatchDto {
  warehouseId?: string;
  tripId?: string;
  vehicleId?: string;
  driverId?: string;
  orderIds: string[];
  packageIds?: string[];
  gatePassNumber?: string;
  transportDocumentNumber?: string;
  carrierName?: string;
  airwayBillNumber?: string;
  freightCost?: number;
  note?: string;
}

export interface TripSummaryDto {
  id: string;
  tripNumber: string;
  tripDate: string;
  status: E.TripStatus;
  vehicleRegistration?: string;
  driverName?: string;
  routeName?: string;
  plannedStops: number;
  completedStops: number;
  failedStops: number;
  plannedValue: number;
  deliveredValue: number;
  collectedAmount: number;
  fillRatePercent: number;
  progressPercent: number;
}

export interface DispatchBoardDto {
  warehouseId?: string;
  asOf: string;
  pendingAllocation: number;
  awaitingPick: number;
  picking: number;
  packed: number;
  staged: number;
  dispatched: number;
  pendingValue: number;
  dispatchedValue: number;
  activeWaves: PickWaveDto[];
  urgentOrders: OrderSummaryDto[];
  todayTrips: TripSummaryDto[];
  lateOrders: OrderSummaryDto[];
}

// ── Logistics ────────────────────────────────────────────────────────────────

export interface VehicleComplianceDto {
  id: string;
  vehicleId: string;
  vehicleRegistration?: string;
  kind: E.VehicleComplianceKind;
  documentNumber?: string;
  issuer?: string;
  issuedOn?: string;
  expiresOn: string;
  cost: number;
  fileUrl?: string;
  isSuperseded: boolean;
  note?: string;
  daysToExpiry: number;
}

export interface VehicleDto {
  id: string;
  code?: string;
  registrationNumber: string;
  name?: string;
  kind: E.VehicleKind;
  ownership: E.VehicleOwnership;
  make?: string;
  model?: string;
  manufactureYear?: number;
  fuelType?: string;
  capacityWeightKg: number;
  capacityVolumeM3: number;
  isRefrigerated: boolean;
  minSafeCelsius?: number;
  maxSafeCelsius?: number;
  defaultDriverId?: string;
  defaultDriverName?: string;
  homeWarehouseId?: string;
  territoryId?: string;
  currentOdometerKm: number;
  fuelEfficiencyKmPerUnit?: number;
  isOutOfService: boolean;
  outOfServiceReason?: string;
  nextServiceDueOn?: string;
  nextServiceDueAtKm?: number;
  isActive: boolean;
  note?: string;
  complianceRecords: VehicleComplianceDto[];
  expiringComplianceCount: number;
  hasExpiredCompliance: boolean;
  earliestComplianceExpiry?: string;
}

export type SaveVehicleDto = Partial<Omit<VehicleDto, 'id'>> & { registrationNumber: string };

export interface DriverDto {
  id: string;
  code?: string;
  fullName: string;
  phone?: string;
  photoUrl?: string;
  employeeId?: string;
  fieldRepId?: string;
  partnerId?: string;
  partnerName?: string;
  licenceNumber?: string;
  licenceClass?: string;
  licenceExpiresOn?: string;
  defaultVehicleId?: string;
  defaultVehicleRegistration?: string;
  joinedOn?: string;
  leftOn?: string;
  isActive: boolean;
  note?: string;
  daysToLicenceExpiry?: number;
}

export type SaveDriverDto = Partial<Omit<DriverDto, 'id'>> & { fullName: string };

export interface TripStopDto {
  id: string;
  stopSequence: number;
  status: E.TripStopStatus;
  outletId?: string;
  outletName?: string;
  partnerId?: string;
  orderId?: string;
  orderNumber?: string;
  destinationName?: string;
  addressLine?: string;
  latitude?: number;
  longitude?: number;
  plannedArrivalAt?: string;
  arrivedAt?: string;
  departedAt?: string;
  serviceMinutes?: number;
  plannedValue: number;
  deliveredValue: number;
  collectedAmount: number;
  returnValue: number;
  failureReasonCodeId?: string;
  failureReasonName?: string;
  failureNote?: string;
  rescheduledFor?: string;
  attemptNumber: number;
  proofOfDeliveryId?: string;
  note?: string;
  isLate: boolean;
}

export interface TripExpenseDto {
  id: string;
  tripId: string;
  tripNumber?: string;
  kind: E.TripExpenseKind;
  amount: number;
  currencyCode: string;
  incurredAt: string;
  reference?: string;
  receiptUrl?: string;
  note?: string;
  isApproved: boolean;
  approvedAt?: string;
  rejectionReason?: string;
}

export interface TripDto {
  id: string;
  tripNumber: string;
  tripDate: string;
  status: E.TripStatus;
  vehicleId?: string;
  vehicleRegistration?: string;
  driverId?: string;
  driverName?: string;
  helperName?: string;
  routeId?: string;
  routeName?: string;
  warehouseId?: string;
  fieldRepId?: string;
  plannedStartAt?: string;
  plannedEndAt?: string;
  departedAt?: string;
  returnedAt?: string;
  odometerOutKm: number;
  odometerInKm: number;
  distanceKm: number;
  plannedDistanceKm: number;
  fuelIssued: number;
  plannedStops: number;
  completedStops: number;
  failedStops: number;
  plannedValue: number;
  deliveredValue: number;
  collectedAmount: number;
  returnValue: number;
  totalExpense: number;
  fillRatePercent: number;
  onTimePercent: number;
  costPerDrop: number;
  cancelReason?: string;
  note?: string;
  stops: TripStopDto[];
  expenses: TripExpenseDto[];
}

export interface CreateTripDto {
  tripDate: string;
  vehicleId?: string;
  driverId?: string;
  helperName?: string;
  routeId?: string;
  warehouseId?: string;
  fieldRepId?: string;
  plannedStartAt?: string;
  plannedEndAt?: string;
  note?: string;
  orderIds: string[];
  useRouteSequence?: boolean;
}

export interface StartTripDto { tripId: string; odometerOutKm: number; fuelIssued: number; departedAt?: string }
export interface EndTripDto { tripId: string; odometerInKm: number; returnedAt?: string; note?: string }
export interface ResequenceTripDto { tripId: string; orderedStopIds: string[] }
export interface ArriveAtStopDto { stopId: string; latitude?: number; longitude?: number; arrivedAt?: string }
export interface FailStopDto { stopId: string; reasonCodeId: string; note?: string; rescheduleFor?: string }
export interface SaveTripExpenseDto {
  tripId: string;
  kind: E.TripExpenseKind;
  amount: number;
  incurredAt: string;
  reference?: string;
  receiptUrl?: string;
  note?: string;
}

export interface PodLineDto {
  id: string;
  orderLineId?: string;
  itemId: string;
  itemName: string;
  batchId?: string;
  batchNumber?: string;
  uom: string;
  despatchedQuantity: number;
  acceptedQuantity: number;
  shortQuantity: number;
  damagedQuantity: number;
  rejectedQuantity: number;
  outcome: E.PodLineOutcome;
  unitPrice: number;
  creditValue: number;
  reasonCodeId?: string;
  reasonCodeName?: string;
  photoUrl?: string;
  note?: string;
}

export interface PodDto {
  id: string;
  podNumber: string;
  tripId?: string;
  tripNumber?: string;
  tripStopId?: string;
  orderId?: string;
  orderNumber?: string;
  outletId?: string;
  outletName?: string;
  partnerId?: string;
  visitId?: string;
  deliveredAt: string;
  receivedByName?: string;
  receivedByPhone?: string;
  signatureImageUrl?: string;
  photoUrl?: string;
  latitude?: number;
  longitude?: number;
  geoValidation: E.GeoValidation;
  otpVerified: boolean;
  deliveredValue: number;
  shortValue: number;
  damagedValue: number;
  rejectedValue: number;
  collectedAmount: number;
  creditNoteId?: string;
  isClean: boolean;
  isExceptionResolved: boolean;
  exceptionNote?: string;
  receiptSentTo?: string;
  note?: string;
  lines: PodLineDto[];
}

export interface CapturePodDto {
  tripId?: string;
  tripStopId?: string;
  orderId?: string;
  outletId?: string;
  partnerId?: string;
  visitId?: string;
  deliveredAt?: string;
  receivedByName?: string;
  receivedByPhone?: string;
  signatureImageUrl?: string;
  photoUrl?: string;
  latitude?: number;
  longitude?: number;
  otpVerified?: boolean;
  otpReference?: string;
  receiptSentTo?: string;
  note?: string;
  lines: Partial<PodLineDto>[];
  collection?: RecordCollectionDto;
  autoCreditExceptions?: boolean;
  idempotencyKey?: string;
}

// ── Returns ──────────────────────────────────────────────────────────────────

export interface ReturnLineDto {
  id: string;
  displayOrder: number;
  itemId: string;
  itemName: string;
  itemCode?: string;
  batchId?: string;
  batchNumber?: string;
  expiryDate?: string;
  uom: string;
  uomFactor: number;
  requestedQuantity: number;
  approvedQuantity: number;
  receivedQuantity: number;
  unitPrice: number;
  unitCost: number;
  lineValue: number;
  reasonCodeId?: string;
  reasonCodeName?: string;
  photoUrl?: string;
  note?: string;
}

export interface ReturnReceiptLineDto {
  id: string;
  returnLineId?: string;
  itemId: string;
  itemName: string;
  batchId?: string;
  batchNumber?: string;
  expiryDate?: string;
  uom: string;
  expectedQuantity: number;
  receivedQuantity: number;
  acceptedQuantity: number;
  rejectedQuantity: number;
  unitPrice: number;
  unitCost: number;
  lineValue: number;
  disposition: E.ReturnDispositionKind;
  putawayBinId?: string;
  reasonCodeId?: string;
  note?: string;
}

export interface ReturnReceiptDto {
  id: string;
  receiptNumber: string;
  returnId?: string;
  returnNumber?: string;
  warehouseId?: string;
  vanUnitId?: string;
  tripId?: string;
  receivedAt: string;
  inspectedAt?: string;
  totalValue: number;
  restockedValue: number;
  scrappedValue: number;
  destructionCertificateNumber?: string;
  destructionCertificateUrl?: string;
  destroyedOn?: string;
  note?: string;
  lines: ReturnReceiptLineDto[];
}

export interface ReturnDto {
  id: string;
  returnNumber: string;
  kind: E.ReturnKind;
  status: E.ReturnStatus;
  outletId?: string;
  outletName?: string;
  partnerId?: string;
  partnerName?: string;
  visitId?: string;
  fieldRepId?: string;
  fieldRepName?: string;
  routeId?: string;
  originalOrderId?: string;
  originalInvoiceId?: string;
  originalInvoiceNumber?: string;
  requestedOn: string;
  validUntil?: string;
  reasonCodeId?: string;
  reasonCodeName?: string;
  reasonNote?: string;
  valuationBasis: E.ReturnValuationBasis;
  valuationPercent: number;
  currencyCode: string;
  claimedValue: number;
  approvedValue: number;
  creditedValue: number;
  approvedAt?: string;
  rejectionReason?: string;
  collectionTripId?: string;
  collectionVanUnitId?: string;
  collectedAt?: string;
  linkedClaimId?: string;
  creditNoteId?: string;
  photoUrl?: string;
  note?: string;
  isExpired: boolean;
  lines: ReturnLineDto[];
  receipts: ReturnReceiptDto[];
}

export interface ReturnSummaryDto {
  id: string;
  returnNumber: string;
  kind: E.ReturnKind;
  status: E.ReturnStatus;
  requestedOn: string;
  outletName?: string;
  partnerName?: string;
  reasonCodeName?: string;
  claimedValue: number;
  approvedValue: number;
  currencyCode: string;
  lineCount: number;
}

export interface RequestReturnDto {
  kind: E.ReturnKind;
  outletId?: string;
  partnerId?: string;
  visitId?: string;
  fieldRepId?: string;
  routeId?: string;
  originalOrderId?: string;
  originalInvoiceId?: string;
  reasonCodeId?: string;
  reasonNote?: string;
  valuationBasis: E.ReturnValuationBasis;
  valuationPercent?: number;
  validUntil?: string;
  photoUrl?: string;
  note?: string;
  lines: Partial<ReturnLineDto>[];
  collectOnVanNow?: boolean;
  vanUnitId?: string;
  idempotencyKey?: string;
}

export interface DecideReturnDto {
  isApproved: boolean;
  lines: { lineId: string; approvedQuantity: number; note?: string }[];
  rejectionReason?: string;
}

export interface ReceiveReturnDto {
  returnId?: string;
  warehouseId?: string;
  vanUnitId?: string;
  tripId?: string;
  receivedAt?: string;
  note?: string;
  lines: Partial<ReturnReceiptLineDto>[];
}

export interface DispositionReturnDto {
  receiptLineId: string;
  kind: E.ReturnDispositionKind;
  quantity: number;
  targetBinId?: string;
  targetSupplierId?: string;
  liquidationSchemeId?: string;
  note?: string;
}

// ── Pricing ──────────────────────────────────────────────────────────────────

export interface PriceSlabDto {
  id: string;
  fromQuantity: number;
  toQuantity?: number;
  unitPrice: number;
  discountPercent: number;
  displayOrder: number;
}

export interface PriceListLineDto {
  id: string;
  itemId: string;
  itemName: string;
  itemCode?: string;
  brandId?: string;
  categoryId?: string;
  uom: string;
  uomFactor: number;
  unitPrice: number;
  mrp: number;
  minimumPrice: number;
  maxDiscountPercent: number;
  taxPercent: number;
  effectiveFrom?: string;
  effectiveTo?: string;
  slabs: PriceSlabDto[];
}

export interface PriceListDto {
  id: string;
  code?: string;
  name: string;
  scope: E.PriceScope;
  channel?: E.OutletChannel;
  territoryId?: string;
  territoryName?: string;
  partnerTier?: E.PartnerType;
  partnerId?: string;
  partnerName?: string;
  outletId?: string;
  outletName?: string;
  currencyCode: string;
  effectiveFrom: string;
  effectiveTo?: string;
  priority: number;
  isTaxInclusive: boolean;
  isApproved: boolean;
  approvedAt?: string;
  supersedesPriceListId?: string;
  isActive: boolean;
  description?: string;
  lineCount: number;
  lines: PriceListLineDto[];
}

export type SavePriceListDto = Partial<Omit<PriceListDto, 'id' | 'lines'>> & {
  name: string;
  lines: PriceListLineDto[];
};

export interface PriceCandidateDto {
  scope: E.PriceScope;
  priceListId: string;
  priceListName: string;
  unitPrice: number;
  priority: number;
  isWinner: boolean;
  skipReason?: string;
}

export interface PriceResolutionDto {
  itemId: string;
  itemName: string;
  uom: string;
  resolvedPrice: number;
  mrp: number;
  taxPercent: number;
  minimumPrice: number;
  winningScope: E.PriceScope;
  winningPriceListId?: string;
  winningPriceListName?: string;
  appliedSlabIndex?: number;
  considered: PriceCandidateDto[];
}

export interface MarginLadderDto {
  id: string;
  itemId: string;
  itemName: string;
  itemCode?: string;
  territoryId?: string;
  partnerId?: string;
  partnerName?: string;
  channel?: E.OutletChannel;
  uom: string;
  currencyCode: string;
  landedCost: number;
  priceToDistributor: number;
  priceToWholesaler: number;
  priceToRetailer: number;
  mrp: number;
  companyMarginPercent: number;
  distributorMarginPercent: number;
  wholesalerMarginPercent: number;
  retailerMarginPercent: number;
  effectiveFrom: string;
  effectiveTo?: string;
  note?: string;
}

export interface MrpRevisionDto {
  id: string;
  itemId: string;
  itemName: string;
  batchId?: string;
  batchNumber?: string;
  uom: string;
  oldMrp: number;
  newMrp: number;
  effectiveFrom: string;
  triggersPriceProtection: boolean;
  protectionPerUnit: number;
  protectionClaimWindowEnds?: string;
  reason?: string;
  approvedAt?: string;
}

// ── Schemes ──────────────────────────────────────────────────────────────────

export interface TradeSchemeSlabDto {
  id: string;
  slabNumber: number;
  fromQuantity: number;
  toQuantity?: number;
  fromValue: number;
  toValue?: number;
  freeQuantity: number;
  discountPercent: number;
  discountAmount: number;
  payoutAmount: number;
  pointsAwarded: number;
  freeItemId?: string;
  freeItemName?: string;
  label?: string;
}

export interface TradeSchemeProductDto {
  id: string;
  itemId?: string;
  itemName?: string;
  brandId?: string;
  brandName?: string;
  categoryId?: string;
  categoryName?: string;
  isQualifying: boolean;
  requiredQuantity: number;
  uom?: string;
  uomFactor: number;
  isExcluded: boolean;
}

export interface TradeSchemeScopeDto {
  id: string;
  channel?: E.OutletChannel;
  outletGrade?: E.OutletGrade;
  partnerTier?: E.PartnerType;
  territoryId?: string;
  territoryName?: string;
  routeId?: string;
  routeName?: string;
  partnerId?: string;
  partnerName?: string;
  outletId?: string;
  outletName?: string;
  isExcluded: boolean;
}

export interface TradeSchemeDto {
  id: string;
  schemeNumber: string;
  name: string;
  kind: E.TradeSchemeKind;
  status: E.SchemeStatus;
  settlementMode: E.SchemeSettlementMode;
  stacking: E.SchemeStacking;
  stackingGroup?: string;
  priority: number;
  validFrom: string;
  validTo: string;
  activeDays?: string;
  minQuantity: number;
  minValue: number;
  freeQuantity: number;
  freeItemId?: string;
  freeItemName?: string;
  freeItemUom?: string;
  discountPercent: number;
  discountAmount: number;
  maxBenefitPerOrder: number;
  maxBenefitPerOutlet: number;
  isRecurringPerBlock: boolean;
  isPeriodScheme: boolean;
  paymentWithinDays: number;
  displayDurationDays: number;
  displayPayout: number;
  requiresPhotoEvidence: boolean;
  currencyCode: string;
  budgetAmount: number;
  consumedAmount: number;
  remainingBudget: number;
  budgetUsedPercent: number;
  stopWhenBudgetExhausted: boolean;
  approvedAt?: string;
  rejectionReason?: string;
  communicationPackUrl?: string;
  termsAndConditions?: string;
  note?: string;
  applicationCount: number;
  beneficiaryOutletCount: number;
  qualifyingSalesValue: number;
  isActive: boolean;
  slabs: TradeSchemeSlabDto[];
  products: TradeSchemeProductDto[];
  scopes: TradeSchemeScopeDto[];
}

export type SaveTradeSchemeDto = Partial<Omit<TradeSchemeDto,
  'id' | 'schemeNumber' | 'slabs' | 'products' | 'scopes'>> & {
  name: string;
  validFrom: string;
  validTo: string;
  slabs: TradeSchemeSlabDto[];
  products: TradeSchemeProductDto[];
  scopes: TradeSchemeScopeDto[];
};

export interface SchemeDecisionDto { isApproved: boolean; comment?: string }

export interface SchemeSimulationSlabDto {
  slabNumber: number;
  label?: string;
  orderCount: number;
  qualifyingQuantity: number;
  benefitValue: number;
}

export interface SchemeSimulationDto {
  schemeId?: string;
  schemeName: string;
  simulatedFrom: string;
  simulatedTo: string;
  qualifyingSalesValue: number;
  qualifyingQuantity: number;
  qualifyingOrderCount: number;
  beneficiaryOutletCount: number;
  estimatedBenefitValue: number;
  estimatedFreeGoodsCost: number;
  estimatedDiscountCost: number;
  totalEstimatedCost: number;
  costAsPercentOfSales: number;
  suggestedBudget: number;
  slabBreakdown: SchemeSimulationSlabDto[];
}

export interface SchemeItemPerformanceDto {
  itemId: string;
  itemName: string;
  qualifyingQuantity: number;
  baselineQuantity: number;
  upliftPercent: number;
  benefitValue: number;
}

export interface SchemePerformanceDto {
  schemeId: string;
  schemeName: string;
  kind: E.TradeSchemeKind;
  status: E.SchemeStatus;
  validFrom: string;
  validTo: string;
  budgetAmount: number;
  consumedAmount: number;
  remainingBudget: number;
  applicationCount: number;
  beneficiaryOutletCount: number;
  eligibleOutletCount: number;
  redemptionRatePercent: number;
  qualifyingSalesValue: number;
  baselineSalesValue: number;
  upliftValue: number;
  upliftPercent: number;
  incrementalQuantity: number;
  costPerIncrementalUnit: number;
  byItem: SchemeItemPerformanceDto[];
}

export interface SchemeBudgetEntryDto {
  occurredAt: string;
  amount: number;
  balanceAfter: number;
  reason?: string;
  orderId?: string;
  claimId?: string;
}

// ── Credit & money ───────────────────────────────────────────────────────────

export interface CreditProfileDto extends CreditSnapshotDto {
  id: string;
  outletName?: string;
  partnerName?: string;
  outletCode?: string;
  channel?: E.OutletChannel;
  territoryName?: string;
  routeName?: string;
}

export interface SetCreditLimitDto {
  outletId?: string;
  partnerId?: string;
  creditLimit: number;
  creditDays: number;
  enforcement: E.CreditEnforcement;
  reason?: string;
}

export interface RequestCreditOverrideDto {
  outletId?: string;
  partnerId?: string;
  orderId?: string;
  requestedAmount: number;
  reasonCodeId?: string;
  justification?: string;
  expiresOn?: string;
}

export interface CreditOverrideDto {
  id: string;
  outletId?: string;
  outletName?: string;
  partnerId?: string;
  partnerName?: string;
  orderId?: string;
  orderNumber?: string;
  requestedAmount: number;
  approvedAmount: number;
  currencyCode: string;
  reasonCodeName?: string;
  justification?: string;
  requestedAt: string;
  approverName?: string;
  approvedAt?: string;
  isApproved?: boolean;
  decisionNote?: string;
  expiresOn?: string;
  isConsumed: boolean;
  isExpired: boolean;
}

export interface DecideCreditOverrideDto {
  isApproved: boolean;
  approvedAmount: number;
  expiresOn?: string;
  decisionNote?: string;
}

export interface PaymentAllocationDto {
  invoiceId: string;
  invoiceNumber?: string;
  invoiceDate?: string;
  invoiceAmount: number;
  outstandingBefore: number;
  allocatedAmount: number;
  outstandingAfter: number;
  ageingDays: number;
}

export interface SaveChequeDto {
  chequeNumber: string;
  bankName?: string;
  branchName?: string;
  accountName?: string;
  amount: number;
  chequeDate: string;
  note?: string;
}

export interface ChequeDto {
  id: string;
  chequeNumber: string;
  outletId?: string;
  outletName?: string;
  partnerId?: string;
  partnerName?: string;
  collectionReceiptId?: string;
  bankName?: string;
  branchName?: string;
  accountName?: string;
  amount: number;
  currencyCode: string;
  chequeDate: string;
  receivedOn: string;
  isPostDated: boolean;
  status: E.ChequeStatus;
  depositedOn?: string;
  depositBankAccount?: string;
  clearedOn?: string;
  bouncedOn?: string;
  bounceReason?: string;
  bounceCharges: number;
  triggeredCreditBlock: boolean;
  note?: string;
  daysToMaturity?: number;
}

export interface UpdateChequeStatusDto {
  status: E.ChequeStatus;
  effectiveOn?: string;
  depositBankAccount?: string;
  bounceReason?: string;
  bounceCharges?: number;
  note?: string;
}

export interface CollectionDto {
  id: string;
  receiptNumber: string;
  outletId?: string;
  outletName?: string;
  partnerId?: string;
  partnerName?: string;
  visitId?: string;
  fieldDayId?: string;
  fieldRepId?: string;
  fieldRepName?: string;
  tripId?: string;
  settlementId?: string;
  collectedAt: string;
  tender: E.PaymentTender;
  currencyCode: string;
  amount: number;
  cashDiscountAmount: number;
  cashDiscountSchemeId?: string;
  chequeId?: string;
  reference?: string;
  bankName?: string;
  cardLast4?: string;
  cardScheme?: string;
  allocatedAmount: number;
  unallocatedAmount: number;
  isDeposited: boolean;
  isReversed: boolean;
  reversalReason?: string;
  receiptSentTo?: string;
  note?: string;
  cheque?: ChequeDto;
  allocations: PaymentAllocationDto[];
}

export interface CollectionSummaryDto {
  id: string;
  receiptNumber: string;
  collectedAt: string;
  tender: E.PaymentTender;
  amount: number;
  currencyCode: string;
  outletName?: string;
  fieldRepName?: string;
  reference?: string;
  isDeposited: boolean;
  chequeStatus?: E.ChequeStatus;
}

// ── Claims ───────────────────────────────────────────────────────────────────

export interface ClaimLineDto {
  id: string;
  displayOrder: number;
  itemId?: string;
  itemName?: string;
  batchId?: string;
  batchNumber?: string;
  sourceInvoiceId?: string;
  sourceInvoiceNumber?: string;
  sourceOrderId?: string;
  schemeApplicationId?: string;
  uom: string;
  quantity: number;
  unitRate: number;
  claimedAmount: number;
  computedAmount: number;
  approvedAmount: number;
  rejectionReasonCodeId?: string;
  rejectionReasonName?: string;
  rejectionNote?: string;
  note?: string;
}

export interface ClaimDocumentDto {
  id: string;
  documentType: string;
  fileUrl: string;
  fileName?: string;
  uploadedAt: string;
  note?: string;
}

export interface ClaimStatusEventDto {
  fromStatus: E.ClaimStatus;
  toStatus: E.ClaimStatus;
  occurredAt: string;
  actorName?: string;
  note?: string;
}

export interface ClaimDto {
  id: string;
  claimNumber: string;
  kind: E.ClaimKind;
  status: E.ClaimStatus;
  partnerId?: string;
  partnerName?: string;
  outletId?: string;
  outletName?: string;
  territoryId?: string;
  territoryName?: string;
  periodStart: string;
  periodEnd: string;
  submittedOn: string;
  schemeId?: string;
  schemeName?: string;
  returnId?: string;
  returnNumber?: string;
  mrpRevisionId?: string;
  currencyCode: string;
  claimedAmount: number;
  computedAmount: number;
  varianceAmount: number;
  approvedAmount: number;
  settledAmount: number;
  isSystemGenerated: boolean;
  reviewStartedAt?: string;
  queryNote?: string;
  queriedAt?: string;
  resubmittedAt?: string;
  decidedAt?: string;
  rejectionNote?: string;
  settlementMode?: E.ClaimSettlementMode;
  settledAt?: string;
  creditNoteId?: string;
  settlementReference?: string;
  settlementDays?: number;
  ageingDays: number;
  isBreachingSla: boolean;
  note?: string;
  lines: ClaimLineDto[];
  documents: ClaimDocumentDto[];
  statusEvents: ClaimStatusEventDto[];
}

export interface ClaimSummaryDto {
  id: string;
  claimNumber: string;
  kind: E.ClaimKind;
  status: E.ClaimStatus;
  partnerName?: string;
  schemeName?: string;
  submittedOn: string;
  currencyCode: string;
  claimedAmount: number;
  computedAmount: number;
  approvedAmount: number;
  varianceAmount: number;
  ageingDays: number;
  isBreachingSla: boolean;
  isSystemGenerated: boolean;
  lineCount: number;
  documentCount: number;
}

export interface SubmitClaimDto {
  kind: E.ClaimKind;
  partnerId?: string;
  outletId?: string;
  periodStart: string;
  periodEnd: string;
  schemeId?: string;
  returnId?: string;
  mrpRevisionId?: string;
  currencyCode?: string;
  note?: string;
  lines: Partial<ClaimLineDto>[];
  documents?: Partial<ClaimDocumentDto>[];
  saveAsDraft?: boolean;
}

export interface DecideClaimDto {
  isApproved: boolean;
  lines: { lineId: string; approvedAmount: number; rejectionReasonCodeId?: string; rejectionNote?: string }[];
  rejectionReasonCodeId?: string;
  note?: string;
}

export interface QueryClaimDto { queryNote: string }

export interface SettleClaimDto {
  settlementMode: E.ClaimSettlementMode;
  settledAmount: number;
  settlementReference?: string;
  settledAt?: string;
  note?: string;
}

export interface RebateAccrualDto {
  id: string;
  agreementId: string;
  agreementName?: string;
  periodStart: string;
  periodEnd: string;
  qualifyingQuantity: number;
  qualifyingValue: number;
  accruedAmount: number;
  receivedAmount: number;
  isPosted: boolean;
  isReconciled: boolean;
  supplierCreditReference?: string;
  note?: string;
}

export interface RebateAgreementDto {
  id: string;
  agreementNumber: string;
  name: string;
  supplierId: string;
  supplierName?: string;
  validFrom: string;
  validTo: string;
  currencyCode: string;
  rebateBasis: string;
  thresholdQuantity: number;
  thresholdValue: number;
  rebatePercent: number;
  rebatePerUnit: number;
  baselineValue: number;
  brandId?: string;
  categoryId?: string;
  itemId?: string;
  accruedAmount: number;
  receivedAmount: number;
  outstandingAmount: number;
  terms?: string;
  fileUrl?: string;
  isActive: boolean;
  accruals: RebateAccrualDto[];
}

export interface ChargebackDto {
  id: string;
  chargebackNumber: string;
  supplierId?: string;
  supplierName?: string;
  contractCustomerId?: string;
  contractCustomerName?: string;
  contractReference?: string;
  itemId?: string;
  itemName?: string;
  sourceInvoiceId?: string;
  sourceInvoiceNumber?: string;
  saleDate: string;
  uom: string;
  quantity: number;
  acquisitionPrice: number;
  contractPrice: number;
  chargebackAmount: number;
  approvedAmount: number;
  settledAmount: number;
  currencyCode: string;
  status: E.ClaimStatus;
  submittedAt?: string;
  settledAt?: string;
  settlementReference?: string;
  rejectionNote?: string;
  note?: string;
}

// ── Settlement ───────────────────────────────────────────────────────────────

export interface SettlementVarianceDto {
  id: string;
  kind: E.VarianceKind;
  itemId?: string;
  itemName?: string;
  batchId?: string;
  batchNumber?: string;
  uom?: string;
  expectedQuantity: number;
  actualQuantity: number;
  varianceQuantity: number;
  expectedAmount: number;
  actualAmount: number;
  varianceAmount: number;
  reasonCodeId?: string;
  reasonCodeName?: string;
  reasonNote?: string;
  requiresApproval: boolean;
  isApproved?: boolean;
  isRecoverable: boolean;
  recoveredAmount: number;
}

export interface SettlementDto {
  id: string;
  settlementNumber: string;
  settlementDate: string;
  status: E.SettlementStatus;
  fieldRepId?: string;
  fieldRepName?: string;
  routeId?: string;
  routeName?: string;
  fieldDayId?: string;
  vanUnitId?: string;
  vanUnitName?: string;
  tripId?: string;
  partnerId?: string;
  currencyCode: string;
  invoiceCount: number;
  cashSalesValue: number;
  creditSalesValue: number;
  totalSalesValue: number;
  taxValue: number;
  discountValue: number;
  schemeValue: number;
  freeGoodsValue: number;
  returnValue: number;
  cashCollected: number;
  chequeCollected: number;
  digitalCollected: number;
  totalCollected: number;
  openingFloat: number;
  expectedCash: number;
  declaredCash: number;
  cashVariance: number;
  expenseAmount: number;
  cashToDeposit: number;
  openingStockValue: number;
  loadedStockValue: number;
  soldStockValue: number;
  returnedStockValue: number;
  expectedClosingStockValue: number;
  countedClosingStockValue: number;
  stockVarianceValue: number;
  closingCountId?: string;
  varianceCount: number;
  unexplainedVarianceCount: number;
  submittedAt?: string;
  approvedAt?: string;
  closedAt?: string;
  isPartial: boolean;
  isReversed: boolean;
  reversalReason?: string;
  isPosted: boolean;
  note?: string;
  variances: SettlementVarianceDto[];
  invoices: OrderSummaryDto[];
  collections: CollectionSummaryDto[];
  returns: ReturnSummaryDto[];
  expenses: TripExpenseDto[];
  canClose: boolean;
  blockers: string[];
}

export interface OpenSettlementDto {
  fieldDayId?: string;
  fieldRepId?: string;
  routeId?: string;
  vanUnitId?: string;
  tripId?: string;
  settlementDate?: string;
  openingFloat?: number;
  isPartial?: boolean;
}

export interface SubmitSettlementDto {
  settlementId: string;
  declaredCash: number;
  closingCountId?: string;
  note?: string;
}

export interface ExplainVarianceDto {
  varianceId: string;
  reasonCodeId: string;
  note?: string;
  isRecoverable?: boolean;
  recoveredAmount?: number;
}

export interface ApproveSettlementDto { settlementId: string; isApproved: boolean; note?: string }
export interface ReverseSettlementDto { reason: string }

export interface CashDepositDto {
  id: string;
  depositNumber: string;
  fieldRepId?: string;
  fieldRepName?: string;
  settlementId?: string;
  settlementNumber?: string;
  partnerId?: string;
  depositedOn: string;
  bankName?: string;
  bankAccount?: string;
  slipReference?: string;
  slipImageUrl?: string;
  amount: number;
  currencyCode: string;
  isReconciled: boolean;
  reconciledAt?: string;
  ageingDays: number;
  note?: string;
}

export interface RecordDepositDto {
  fieldRepId?: string;
  settlementId?: string;
  partnerId?: string;
  depositedOn: string;
  bankName?: string;
  bankAccount?: string;
  slipReference?: string;
  slipImageUrl?: string;
  amount: number;
  note?: string;
}

export interface SettlementBoardDto {
  settlementDate: string;
  openCount: number;
  submittedCount: number;
  pendingApprovalCount: number;
  closedCount: number;
  unsettledDayCount: number;
  totalSales: number;
  totalCollected: number;
  totalCashVariance: number;
  totalStockVariance: number;
  cashToDeposit: number;
  undepositedCash: number;
  settlements: SettlementDto[];
  unsettledDays: FieldDayDto[];
}

// ── Secondary sales ──────────────────────────────────────────────────────────

export interface SecondarySaleLineDto {
  id: string;
  itemId?: string;
  itemName?: string;
  itemCodeRaw?: string;
  brandId?: string;
  batchId?: string;
  batchNumber?: string;
  uom: string;
  uomFactor: number;
  quantity: number;
  baseQuantity: number;
  freeQuantity: number;
  unitPrice: number;
  discountAmount: number;
  schemeAmount: number;
  taxAmount: number;
  lineTotal: number;
  isMapped: boolean;
  mappingNote?: string;
}

export interface SecondarySaleDto {
  id: string;
  documentNumber: string;
  partnerId: string;
  partnerName?: string;
  outletId?: string;
  outletName?: string;
  outletNameRaw?: string;
  captureMode: E.SecondaryCaptureMode;
  uploadBatchId?: string;
  sourceOrderId?: string;
  saleDate: string;
  territoryId?: string;
  routeId?: string;
  currencyCode: string;
  subTotal: number;
  discountAmount: number;
  schemeAmount: number;
  taxAmount: number;
  totalAmount: number;
  returnAmount: number;
  lineCount: number;
  totalQuantity: number;
  isMapped: boolean;
  mappingNote?: string;
  isPosted: boolean;
  lines: SecondarySaleLineDto[];
}

export interface DeclareSecondaryLineDto {
  itemId?: string;
  itemCodeRaw?: string;
  outletId?: string;
  outletNameRaw?: string;
  uom: string;
  quantity: number;
  value: number;
  saleDate?: string;
}

export interface DeclareSecondarySalesDto {
  partnerId: string;
  periodStart: string;
  periodEnd: string;
  currencyCode?: string;
  lines: DeclareSecondaryLineDto[];
  note?: string;
}

export interface SecondaryUploadDto {
  id: string;
  batchNumber: string;
  partnerId: string;
  partnerName?: string;
  periodStart: string;
  periodEnd: string;
  submittedAt: string;
  dueOn?: string;
  latenessDays: number;
  status: E.UploadBatchStatus;
  fileName?: string;
  fileUrl?: string;
  mappingProfileId?: string;
  mappingProfileName?: string;
  totalRows: number;
  mappedRows: number;
  unmappedRows: number;
  rejectedRows: number;
  totalValue: number;
  mappedValue: number;
  mappingAccuracyPercent: number;
  postedAt?: string;
  rejectionReason?: string;
  validationSummary?: string;
}

export interface MappingSuggestionDto {
  itemId?: string;
  outletId?: string;
  name: string;
  code?: string;
  confidence: number;
}

export interface MappingExceptionDto {
  lineId: string;
  secondarySaleId: string;
  rawItemCode?: string;
  rawOutletName?: string;
  quantity: number;
  value: number;
  saleDate: string;
  reason?: string;
  suggestions: MappingSuggestionDto[];
}

export interface ResolveMappingDto {
  lineId: string;
  itemId?: string;
  outletId?: string;
  rememberForFuture?: boolean;
  reject?: boolean;
  note?: string;
}

export interface MappingProfileDto {
  id: string;
  name: string;
  partnerId: string;
  partnerName?: string;
  fileFormat: string;
  outletColumn?: string;
  itemColumn?: string;
  quantityColumn?: string;
  valueColumn?: string;
  dateColumn?: string;
  uomColumn?: string;
  batchColumn?: string;
  invoiceColumn?: string;
  dateFormat?: string;
  headerRowIndex: number;
  isActive: boolean;
  lastUsedAt?: string;
  mappedCodeCount: number;
}

export interface StockDeclarationLineDto {
  id: string;
  itemId?: string;
  itemName?: string;
  itemCodeRaw?: string;
  brandId?: string;
  batchId?: string;
  batchNumber?: string;
  expiryDate?: string;
  uom: string;
  uomFactor: number;
  quantity: number;
  baseQuantity: number;
  unitValue: number;
  totalValue: number;
  age0To30: number;
  age31To60: number;
  age61To90: number;
  age90Plus: number;
  nearExpiryQuantity: number;
  expiredQuantity: number;
  damagedQuantity: number;
  daysOfCover: number;
  isMapped: boolean;
  normDaysOfCover: number;
  isUnderStocked: boolean;
  isOverStocked: boolean;
}

export interface StockDeclarationDto {
  id: string;
  declarationNumber: string;
  partnerId: string;
  partnerName?: string;
  asOfDate: string;
  submittedAt: string;
  dueOn?: string;
  latenessDays: number;
  currencyCode: string;
  totalValue: number;
  nearExpiryValue: number;
  expiredValue: number;
  damagedValue: number;
  lineCount: number;
  daysOfCover: number;
  isVerified: boolean;
  note?: string;
  lines: StockDeclarationLineDto[];
}

export interface SubmitStockDeclarationDto {
  partnerId: string;
  asOfDate: string;
  currencyCode?: string;
  note?: string;
  lines: Partial<StockDeclarationLineDto>[];
}

export interface StockNormDto {
  id: string;
  partnerId: string;
  partnerName?: string;
  itemId: string;
  itemName: string;
  uom: string;
  targetDaysOfCover: number;
  minQuantity: number;
  maxQuantity: number;
  reorderQuantity: number;
  effectiveFrom: string;
  effectiveTo?: string;
  currentQuantity: number;
  currentDaysOfCover: number;
  isUnderStocked: boolean;
  isOverStocked: boolean;
  evaluatedAt?: string;
}

export interface ReconciliationDto {
  id: string;
  partnerId: string;
  partnerName?: string;
  periodStart: string;
  periodEnd: string;
  itemId?: string;
  itemName?: string;
  brandId?: string;
  uom: string;
  openingQuantity: number;
  primaryQuantity: number;
  secondaryQuantity: number;
  returnQuantity: number;
  declaredClosingQuantity: number;
  computedClosingQuantity: number;
  varianceQuantity: number;
  variancePercent: number;
  varianceValue: number;
  outcome: E.ReconciliationOutcome;
  isExplained: boolean;
  reasonCodeId?: string;
  explanationNote?: string;
  computedAt: string;
}

export interface ExplainReconciliationDto { reconciliationId: string; reasonCodeId: string; note?: string }

export interface ChannelInventoryRowDto {
  id?: string;
  name: string;
  primaryValue: number;
  secondaryValue: number;
  stockValue: number;
  daysOfCover: number;
  sellThroughPercent: number;
  nearExpiryValue: number;
  hasVariance: boolean;
}

export interface ChannelInventoryDto {
  periodStart: string;
  periodEnd: string;
  currencyCode: string;
  primarySalesValue: number;
  secondarySalesValue: number;
  channelStockValue: number;
  channelStockDaysOfCover: number;
  sellThroughPercent: number;
  nearExpiryValue: number;
  expiredValue: number;
  partnerCount: number;
  reportingPartnerCount: number;
  reportingCompliancePercent: number;
  unexplainedVarianceCount: number;
  byPartner: ChannelInventoryRowDto[];
  byBrand: ChannelInventoryRowDto[];
}

export interface PartnerDataQualityDto {
  partnerId: string;
  partnerName: string;
  captureMode: E.SecondaryCaptureMode;
  periodsExpected: number;
  periodsSubmitted: number;
  submissionRatePercent: number;
  averageLatenessDays: number;
  averageMappingAccuracyPercent: number;
  averageVariancePercent: number;
  qualityScore: number;
  lastSubmissionAt?: string;
}

// ── Targets & KPIs ───────────────────────────────────────────────────────────

export interface TargetLineDto {
  id: string;
  itemId?: string;
  itemName?: string;
  brandId?: string;
  categoryId?: string;
  weekNumber?: number;
  phaseStart?: string;
  phaseEnd?: string;
  uom: string;
  targetValue: number;
  achievedValue: number;
  achievementPercent: number;
  displayOrder: number;
}

export interface TargetDto {
  id: string;
  name: string;
  metric: E.TargetMetric;
  period: E.TargetPeriod;
  scope: E.TargetScope;
  periodStart: string;
  periodEnd: string;
  territoryId?: string;
  territoryName?: string;
  routeId?: string;
  routeName?: string;
  fieldRepId?: string;
  fieldRepName?: string;
  partnerId?: string;
  partnerName?: string;
  outletId?: string;
  currencyCode: string;
  targetValue: number;
  achievedValue: number;
  achievementPercent: number;
  proRataTarget: number;
  projectedValue: number;
  lastPeriodValue: number;
  samePeriodLastYearValue: number;
  isPublished: boolean;
  lastComputedAt?: string;
  note?: string;
  lines: TargetLineDto[];
  paceStatus: string;
}

export type SaveTargetDto = Partial<Omit<TargetDto, 'id' | 'lines' | 'paceStatus'>> & {
  name: string;
  periodStart: string;
  periodEnd: string;
  targetValue: number;
  lines?: TargetLineDto[];
};

export interface IncentiveSlabDto {
  id: string;
  slabNumber: number;
  fromAchievementPercent: number;
  toAchievementPercent?: number;
  payoutAmount: number;
  payoutPercent: number;
  label?: string;
}

export interface IncentiveSchemeDto {
  id: string;
  name: string;
  basis: E.IncentiveBasis;
  metric: E.TargetMetric;
  period: E.TargetPeriod;
  validFrom: string;
  validTo: string;
  applicableRoles?: string;
  territoryId?: string;
  gateMetric?: E.TargetMetric;
  gateThresholdPercent: number;
  minimumAchievementPercent: number;
  linearRatePercent: number;
  maxPayout: number;
  currencyCode: string;
  spiffItemId?: string;
  spiffItemName?: string;
  spiffRatePerUnit: number;
  isApproved: boolean;
  terms?: string;
  isActive: boolean;
  slabs: IncentiveSlabDto[];
}

export interface IncentivePayoutDto {
  id: string;
  schemeId: string;
  schemeName?: string;
  fieldRepId?: string;
  fieldRepName?: string;
  partnerId?: string;
  partnerName?: string;
  periodStart: string;
  periodEnd: string;
  targetValue: number;
  achievedValue: number;
  achievementPercent: number;
  gatePassed: boolean;
  gateFailureReason?: string;
  slabNumber?: number;
  payoutAmount: number;
  spiffAmount: number;
  deductionAmount: number;
  netPayout: number;
  currencyCode: string;
  isApproved: boolean;
  isPaid: boolean;
  payrollReference?: string;
  note?: string;
}

export interface KpiDto {
  snapshotDate: string;
  scope: E.TargetScope;
  fieldRepId?: string;
  fieldRepName?: string;
  routeId?: string;
  routeName?: string;
  territoryId?: string;
  territoryName?: string;
  partnerId?: string;
  partnerName?: string;
  plannedCalls: number;
  actualCalls: number;
  productiveCalls: number;
  unplannedCalls: number;
  missedCalls: number;
  coveragePercent: number;
  strikeRatePercent: number;
  linesPerCall: number;
  averageBillValue: number;
  dropSize: number;
  billCount: number;
  newOutletsAdded: number;
  activeOutlets: number;
  totalOutlets: number;
  mustSellCompliancePercent: number;
  rangeSellingPercent: number;
  timeInMarketMinutes: number;
  averageTimePerCallMinutes: number;
  firstCallAt?: string;
  lastCallAt?: string;
  distanceCoveredKm: number;
  currencyCode: string;
  salesValue: number;
  collectionValue: number;
  returnValue: number;
  overdueAmount: number;
  collectionEfficiencyPercent: number;
}

// ── Planning ─────────────────────────────────────────────────────────────────

export interface ForecastLineDto {
  id: string;
  itemId: string;
  itemName: string;
  brandId?: string;
  uom: string;
  historicAverage: number;
  computedQuantity: number;
  overrideQuantity?: number;
  overrideReason?: string;
  finalQuantity: number;
  forecastValue: number;
  actualQuantity: number;
  accuracyPercent: number;
  demandStdDeviation: number;
}

export interface ForecastDto {
  id: string;
  name: string;
  basis: E.ForecastBasis;
  periodStart: string;
  periodEnd: string;
  warehouseId?: string;
  partnerId?: string;
  partnerName?: string;
  territoryId?: string;
  historyMonths: number;
  seasonalityFactor: number;
  trendFactor: number;
  totalForecastQuantity: number;
  totalForecastValue: number;
  totalActualQuantity: number;
  accuracyPercent: number;
  isApproved: boolean;
  generatedAt: string;
  note?: string;
  lines: ForecastLineDto[];
}

export interface GenerateForecastDto {
  name: string;
  basis: E.ForecastBasis;
  periodStart: string;
  periodEnd: string;
  warehouseId?: string;
  partnerId?: string;
  territoryId?: string;
  historyMonths?: number;
  seasonalityFactor?: number;
  trendFactor?: number;
  itemIds?: string[];
  note?: string;
}

export interface OverrideForecastLineDto { lineId: string; overrideQuantity: number; overrideReason: string }

export interface ReplenishmentSuggestionDto {
  id: string;
  targetKind: E.ReplenishmentTargetKind;
  partnerId?: string;
  partnerName?: string;
  vanUnitId?: string;
  vanUnitName?: string;
  warehouseId?: string;
  sourceWarehouseId?: string;
  itemId: string;
  itemName: string;
  uom: string;
  currentStock: number;
  inTransitStock: number;
  reorderPoint: number;
  safetyStock: number;
  targetStock: number;
  suggestedQuantity: number;
  averageDailyDemand: number;
  daysOfCover: number;
  leadTimeDays: number;
  urgencyScore: number;
  estimatedValue: number;
  generatedAt: string;
  isActioned: boolean;
  isDismissed: boolean;
  dismissReason?: string;
}

export interface TransferRequestDto {
  id: string;
  transferNumber: string;
  sourceWarehouseId?: string;
  destinationWarehouseId?: string;
  destinationPartnerId?: string;
  destinationPartnerName?: string;
  destinationVanUnitId?: string;
  status: E.TransferRequestStatus;
  requestedOn: string;
  requiredBy?: string;
  dispatchedAt?: string;
  receivedAt?: string;
  tripId?: string;
  dispatchId?: string;
  totalQuantity: number;
  totalValue: number;
  lineCount: number;
  rejectionReason?: string;
  note?: string;
}

// ── Traceability ─────────────────────────────────────────────────────────────

export interface ColdChainCheckpointDto {
  id: string;
  code?: string;
  name: string;
  kind: E.ColdChainPointKind;
  warehouseId?: string;
  vehicleId?: string;
  vehicleRegistration?: string;
  vanUnitId?: string;
  outletId?: string;
  outletName?: string;
  outletAssetId?: string;
  minSafeCelsius: number;
  maxSafeCelsius: number;
  checkIntervalHours: number;
  location?: string;
  sensorIdentifier?: string;
  lastReadingAt?: string;
  lastReadingCelsius?: number;
  isInBreach: boolean;
  isActive: boolean;
  note?: string;
  isCheckOverdue: boolean;
  unresolvedExcursionCount: number;
}

export interface ColdChainLogDto {
  id: string;
  checkpointId: string;
  checkpointName?: string;
  recordedAt: string;
  readingCelsius: number;
  isOutOfRange: boolean;
  excursionMinutes?: number;
  recordedByName?: string;
  isAutomatic: boolean;
  correctiveAction?: string;
  isResolved: boolean;
  resolvedAt?: string;
  affectedStockValue: number;
  photoUrl?: string;
  note?: string;
}

export interface RecordColdChainReadingDto {
  checkpointId: string;
  readingCelsius: number;
  recordedAt?: string;
  photoUrl?: string;
  note?: string;
  correctiveAction?: string;
  affectedStockValue?: number;
}

export interface BatchTraceHopDto {
  movedAt: string;
  movementType: string;
  documentNumber?: string;
  warehouseId?: string;
  vanUnitId?: string;
  partnerId?: string;
  outletId?: string;
  outletName?: string;
  uom: string;
  quantity: number;
  value: number;
}

export interface BatchTraceDestinationDto {
  outletId?: string;
  outletName?: string;
  partnerId?: string;
  partnerName?: string;
  phone?: string;
  quantity: number;
  value: number;
  lastSuppliedAt: string;
}

export interface BatchTraceDto {
  itemId?: string;
  itemName?: string;
  batchNumber: string;
  expiryDate?: string;
  manufactureDate?: string;
  supplierLotReference?: string;
  supplierId?: string;
  supplierName?: string;
  receivedQuantity: number;
  despatchedQuantity: number;
  returnedQuantity: number;
  remainingQuantity: number;
  hops: BatchTraceHopDto[];
  destinations: BatchTraceDestinationDto[];
}

export interface RecallNoticeDto {
  id: string;
  outletId?: string;
  outletName?: string;
  partnerId?: string;
  destinationName?: string;
  phone?: string;
  suppliedQuantity: number;
  returnedQuantity: number;
  value: number;
  notifiedAt?: string;
  notificationChannel?: string;
  acknowledgedAt?: string;
  collectedAt?: string;
  returnId?: string;
  isClosed: boolean;
  note?: string;
}

export interface RecallDto {
  id: string;
  recallNumber: string;
  title: string;
  status: E.RecallStatus;
  severity: E.RecallSeverity;
  itemId: string;
  itemName: string;
  batchId?: string;
  batchNumber?: string;
  expiryDate?: string;
  supplierId?: string;
  initiatedOn: string;
  announcedAt?: string;
  completedAt?: string;
  targetCompletionOn?: string;
  reason?: string;
  regulatoryReference?: string;
  publicNotice?: string;
  despatchedQuantity: number;
  recoveredQuantity: number;
  destroyedQuantity: number;
  recoveryPercent: number;
  estimatedValue: number;
  recoveredValue: number;
  affectedOutletCount: number;
  notifiedOutletCount: number;
  respondedOutletCount: number;
  closureReport?: string;
  note?: string;
  notices: RecallNoticeDto[];
}

export interface InitiateRecallDto {
  title: string;
  severity: E.RecallSeverity;
  itemId: string;
  batchId?: string;
  batchNumber?: string;
  supplierId?: string;
  targetCompletionOn?: string;
  reason?: string;
  regulatoryReference?: string;
  publicNotice?: string;
}

export interface NearExpiryDto {
  itemId: string;
  itemName: string;
  itemCode?: string;
  batchId?: string;
  batchNumber?: string;
  expiryDate: string;
  daysToExpiry: number;
  location: string;
  warehouseId?: string;
  vanUnitId?: string;
  partnerId?: string;
  uom: string;
  quantity: number;
  value: number;
  severity: string;
  liquidationSchemeId?: string;
  liquidationSchemeName?: string;
}

// ── Admin ────────────────────────────────────────────────────────────────────

export interface ReasonCodeDto {
  id: string;
  code?: string;
  name: string;
  surface: E.ReasonSurface;
  displayOrder: number;
  requiresNote: boolean;
  requiresApproval: boolean;
  isRecoverable: boolean;
  isNegative: boolean;
  colorHex?: string;
  iconName?: string;
  isSystem: boolean;
  isActive: boolean;
  description?: string;
}

export interface DistributionSettingsDto {
  id: string;
  defaultGeofenceRadiusMetres: number;
  requireGeoOnCheckIn: boolean;
  allowOutOfFenceCheckIn: boolean;
  requireReasonOnNoOrder: boolean;
  requireStartSelfie: boolean;
  maxUnplannedVisitsPerDay: number;
  blockDayCloseWithUnsynced: boolean;
  dayStartDeadline: string;
  minimumOrderValue: number;
  discountApprovalThreshold: number;
  marginFloorPercent: number;
  allowBackorders: boolean;
  orderEditWindowMinutes: number;
  defaultAllocationStrategy: E.AllocationStrategy;
  softAllocationHoldHours: number;
  creditEnforcementAtOrder: E.CreditEnforcement;
  creditEnforcementAtDispatch: E.CreditEnforcement;
  creditEnforcementAtVanSale: E.CreditEnforcement;
  ageingBucket1Days: number;
  ageingBucket2Days: number;
  ageingBucket3Days: number;
  autoBlockOnBouncedCheque: boolean;
  chequeBounceCharge: number;
  enforceFefo: boolean;
  allowFefoOverride: boolean;
  nearExpiryWarningDays: number;
  nearExpiryCriticalDays: number;
  minimumShelfLifePercentOnDespatch: number;
  autoQuarantineExpired: boolean;
  cashVarianceTolerance: number;
  stockVarianceTolerancePercent: number;
  blockSettlementOnUnexplainedVariance: boolean;
  varianceApprovalThreshold: number;
  settlementCutOff: string;
  autoApplySchemes: boolean;
  showNextSlabPrompt: boolean;
  stopSchemeOnBudgetExhausted: boolean;
  claimSubmissionWindowDays: number;
  claimSettlementSlaDays: number;
  autoGenerateDeferredSchemeClaims: boolean;
  secondaryUploadDueDayOfMonth: number;
  minimumMappingAccuracyPercent: number;
  reconciliationTolerancePercent: number;
  baseCurrencyCode: string;
  printThermalInvoices: boolean;
  invoiceFooter?: string;
  sendDigitalReceipts: boolean;
}

export interface NotificationDto {
  id: string;
  kind: E.DistributionAlertKind;
  severity: E.AlertSeverity;
  title: string;
  body?: string;
  referenceId?: string;
  referenceType?: string;
  actionRoute?: string;
  raisedAt: string;
  readAt?: string;
  dismissedAt?: string;
  isRead: boolean;
}

// ── Reports ──────────────────────────────────────────────────────────────────

export interface DistributionReportFilter {
  from?: string;
  to?: string;
  territoryId?: string;
  routeId?: string;
  partnerId?: string;
  outletId?: string;
  fieldRepId?: string;
  warehouseId?: string;
  brandId?: string;
  categoryId?: string;
  itemId?: string;
  channel?: E.OutletChannel;
  grade?: E.OutletGrade;
  granularity?: string;
}

export interface TrendPointDto {
  bucket: string;
  label: string;
  value: number;
  secondaryValue: number;
  comparison: number;
  count: number;
}

export interface RankedRowDto {
  id?: string;
  name: string;
  subLabel?: string;
  value: number;
  quantity: number;
  sharePercent: number;
  growthPercent: number;
  rank: number;
}

export interface ExceptionRowDto {
  kind: string;
  severity: E.AlertSeverity;
  title: string;
  detail?: string;
  amount?: number;
  occurredAt?: string;
  ageingDays?: number;
  referenceId?: string;
  referenceType?: string;
  actionRoute?: string;
}

export interface DistributionDashboardDto {
  asOf: string;
  currencyCode: string;
  todaySales: number;
  todayCollections: number;
  todayOrders: number;
  todayVisits: number;
  todayProductiveVisits: number;
  todayStrikeRatePercent: number;
  monthToDateSales: number;
  monthTarget: number;
  monthAchievementPercent: number;
  monthProjectedSales: number;
  lastMonthSales: number;
  sameMonthLastYearSales: number;
  growthPercent: number;
  activeFieldReps: number;
  repsStartedToday: number;
  repsNotStarted: number;
  coveragePercent: number;
  newOutletsThisMonth: number;
  activeOutlets: number;
  totalOutlets: number;
  openOrders: number;
  openOrderValue: number;
  ordersAwaitingDispatch: number;
  tripsInProgress: number;
  fillRatePercent: number;
  onTimeDeliveryPercent: number;
  receivables: number;
  overdue: number;
  collectionEfficiencyPercent: number;
  undepositedCash: number;
  unsettledRoutes: number;
  schemeSpendMonthToDate: number;
  schemeBudgetRemaining: number;
  openClaims: number;
  openClaimValue: number;
  claimsBreachingSla: number;
  channelStockValue: number;
  sellThroughPercent: number;
  nearExpiryValue: number;
  salesTrend: TrendPointDto[];
  topTerritories: RankedRowDto[];
  topReps: RankedRowDto[];
  topItems: RankedRowDto[];
  exceptions: ExceptionRowDto[];
}

export interface ExceptionDashboardDto {
  asOf: string;
  totalCount: number;
  criticalCount: number;
  warningCount: number;
  unsettledRoutes: number;
  unexplainedVariances: number;
  creditBreaches: number;
  nearExpiryLines: number;
  unmappedSecondaryRows: number;
  overdueClaims: number;
  expiringLicences: number;
  outOfFenceVisits: number;
  failedDeliveries: number;
  coldChainExcursions: number;
  bouncedCheques: number;
  staleDevices: number;
  rows: ExceptionRowDto[];
}

export interface SalesReportDto {
  filter: DistributionReportFilter;
  currencyCode: string;
  primaryValue: number;
  secondaryValue: number;
  returnValue: number;
  netValue: number;
  quantity: number;
  orderCount: number;
  averageOrderValue: number;
  marginAmount: number;
  marginPercent: number;
  trend: TrendPointDto[];
  rows: RankedRowDto[];
}

export interface CoverageCellDto {
  date: string;
  fieldRepId?: string;
  fieldRepName?: string;
  plannedCalls: number;
  actualCalls: number;
  productiveCalls: number;
  coveragePercent: number;
  salesValue: number;
  isHoliday: boolean;
}

export interface ProductivityReportDto {
  filter: DistributionReportFilter;
  totals: KpiDto;
  rows: KpiDto[];
  heatmap: CoverageCellDto[];
}

export interface OutletAnalyticsDto {
  filter: DistributionReportFilter;
  totalOutlets: number;
  activeOutlets: number;
  billedOutlets: number;
  dormantOutlets: number;
  newOutlets: number;
  lostOutlets: number;
  churnPercent: number;
  averageOfftake: number;
  byChannel: RankedRowDto[];
  byGrade: RankedRowDto[];
  topOutlets: RankedRowDto[];
  dormantList: RankedRowDto[];
  universeTrend: TrendPointDto[];
}

export interface LogisticsReportDto {
  filter: DistributionReportFilter;
  tripCount: number;
  stopCount: number;
  completedStops: number;
  failedStops: number;
  fillRatePercent: number;
  onTimePercent: number;
  averageCycleTimeHours: number;
  totalDistanceKm: number;
  totalExpense: number;
  costPerDrop: number;
  costPerKm: number;
  deliveredValue: number;
  failureReasons: RankedRowDto[];
  byVehicle: RankedRowDto[];
  byRoute: RankedRowDto[];
  trend: TrendPointDto[];
}

export interface ReceivablesReportDto {
  filter: DistributionReportFilter;
  currencyCode: string;
  totalOutstanding: number;
  totalOverdue: number;
  bucket0To30: number;
  bucket31To60: number;
  bucket61To90: number;
  bucket90Plus: number;
  collectedInPeriod: number;
  dueInPeriod: number;
  collectionEfficiencyPercent: number;
  averageCollectionDays: number;
  blockedOutletCount: number;
  bouncedChequeCount: number;
  bouncedChequeValue: number;
  provisionedAmount: number;
  rows: CreditProfileDto[];
  trend: TrendPointDto[];
}

export interface ReturnsReportDto {
  filter: DistributionReportFilter;
  currencyCode: string;
  returnCount: number;
  returnValue: number;
  salesValue: number;
  returnRatePercent: number;
  saleableValue: number;
  damagedValue: number;
  expiredValue: number;
  scrappedValue: number;
  restockedValue: number;
  byReason: RankedRowDto[];
  byItem: RankedRowDto[];
  byOutlet: RankedRowDto[];
  byRoute: RankedRowDto[];
  trend: TrendPointDto[];
}

export interface ClaimsReportDto {
  filter: DistributionReportFilter;
  currencyCode: string;
  totalClaims: number;
  claimedValue: number;
  approvedValue: number;
  settledValue: number;
  rejectedValue: number;
  approvalRatePercent: number;
  averageSettlementDays: number;
  openClaims: number;
  openClaimValue: number;
  breachingSlaCount: number;
  bucket0To15: number;
  bucket16To30: number;
  bucket31To60: number;
  bucket60Plus: number;
  byKind: RankedRowDto[];
  byPartner: RankedRowDto[];
  rejectionReasons: RankedRowDto[];
  trend: TrendPointDto[];
}

export interface StockReportDto {
  filter: DistributionReportFilter;
  currencyCode: string;
  warehouseStockValue: number;
  vanStockValue: number;
  channelStockValue: number;
  inTransitValue: number;
  totalStockValue: number;
  nearExpiryValue: number;
  expiredValue: number;
  deadStockValue: number;
  daysOfCover: number;
  stockOutSkuCount: number;
  byLocation: RankedRowDto[];
  byBrand: RankedRowDto[];
  nearExpiryLines: NearExpiryDto[];
}
