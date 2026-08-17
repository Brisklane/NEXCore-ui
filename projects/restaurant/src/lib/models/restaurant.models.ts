import {
  CashMovementType, CheckStatus, ComboComponentMode, CourseType, DeliveryStatus, DiscountKind,
  FloorFixtureKind, KitchenTicketStatus, MenuDaypart, MenuEngineeringClass, ModifierSelectionMode,
  OrderChannel, OrderLineStatus, OrderType, PriceScope, ReservationStatus, RestaurantOrderStatus,
  RoutingMatchType, ServiceChargeBasis, ServiceStyle, SessionStatus, ShiftStatus, SpiceLevel,
  SplitMethod, StaffRole, StationType, TableShape, TableState, TenderType, TipDistributionBasis,
  WaitlistStatus, WastageReason,
} from './restaurant.enums';

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

// ── Venue ────────────────────────────────────────────────────────────────────

export interface OutletDto {
  id: string;
  code?: string | null;
  name: string;
  serviceStyle: ServiceStyle;
  cuisineType?: string | null;
  phone?: string | null;
  email?: string | null;
  addressLine?: string | null;
  city?: string | null;
  countryCode?: string | null;
  timeZoneId?: string | null;
  currencyCode: string;
  warehouseId?: string | null;
  posStoreId?: string | null;
  defaultMenuId?: string | null;
  defaultTaxGroupId?: string | null;
  defaultTaxPercent: number;
  takeawayTaxPercent: number;
  serviceChargeRuleId?: string | null;
  seatingCapacity: number;
  averageDiningMinutes: number;
  acceptsReservations: boolean;
  acceptsDelivery: boolean;
  acceptsTakeaway: boolean;
  hasDriveThru: boolean;
  qrOrderingEnabled: boolean;
  isTemporarilyClosed: boolean;
  closureNote?: string | null;
  logoUrl?: string | null;
  receiptFooter?: string | null;
  isActive: boolean;
  description?: string | null;
  schedules: OutletScheduleDto[];
  tableCount: number;
  openOrderCount: number;
  occupiedTableCount: number;
}

export type SaveOutletDto = Omit<
  OutletDto,
  'id' | 'schedules' | 'tableCount' | 'openOrderCount' | 'occupiedTableCount' | 'seatingCapacity'
>;

export interface OutletScheduleDto {
  id: string;
  outletId: string;
  dayOfWeek: number;
  overrideDate?: string | null;
  opensAt: string;
  closesAt: string;
  isClosed: boolean;
  note?: string | null;
}

export interface FloorDto {
  id: string;
  outletId: string;
  name: string;
  displayOrder: number;
  canvasWidth: number;
  canvasHeight: number;
  backgroundImageUrl?: string | null;
  isActive: boolean;
  sections: SectionDto[];
  tables: TableDto[];
  fixtures: FixtureDto[];
}

export interface SaveFloorDto {
  outletId: string;
  name: string;
  displayOrder: number;
  canvasWidth: number;
  canvasHeight: number;
  backgroundImageUrl?: string | null;
  isActive: boolean;
}

export interface SectionDto {
  id: string;
  floorId: string;
  name: string;
  displayOrder: number;
  colorHex?: string | null;
  isSmoking: boolean;
  isOutdoor: boolean;
  isPrivate: boolean;
  minimumSpend?: number | null;
  isActive: boolean;
  tableCount: number;
  seatCount: number;
}

export type SaveSectionDto = Omit<SectionDto, 'id' | 'tableCount' | 'seatCount'>;

export interface TableDto {
  id: string;
  outletId: string;
  floorId: string;
  sectionId?: string | null;
  sectionName?: string | null;
  sectionColorHex?: string | null;
  tableNumber: string;
  shape: TableShape;
  seats: number;
  minPartySize?: number | null;
  maxPartySize?: number | null;
  positionX: number;
  positionY: number;
  width: number;
  height: number;
  rotation: number;
  state: TableState;
  currentOrderId?: string | null;
  currentOrderNumber?: string | null;
  assignedWaiterId?: string | null;
  assignedWaiterName?: string | null;
  currentGuestCount: number;
  seatedAt?: string | null;
  stateChangedAt?: string | null;
  mergedIntoTableId?: string | null;
  qrToken?: string | null;
  note?: string | null;
  isActive: boolean;
  currentOrderTotal: number;
  minutesInState: number;
  needsAttention: boolean;
  nextReservationAt?: string | null;
}

export interface SaveTableDto {
  id: string;
  outletId: string;
  floorId: string;
  sectionId?: string | null;
  tableNumber: string;
  shape: TableShape;
  seats: number;
  minPartySize?: number | null;
  maxPartySize?: number | null;
  positionX: number;
  positionY: number;
  width: number;
  height: number;
  rotation: number;
  isActive: boolean;
  note?: string | null;
}

export interface FixtureDto {
  id: string;
  floorId: string;
  kind: FloorFixtureKind;
  label?: string | null;
  positionX: number;
  positionY: number;
  width: number;
  height: number;
  rotation: number;
  colorHex?: string | null;
}

export interface SaveLayoutDto {
  floorId: string;
  canvasWidth: number;
  canvasHeight: number;
  backgroundImageUrl?: string | null;
  tables: SaveTableDto[];
  fixtures: FixtureDto[];
  deletedTableIds: string[];
  deletedFixtureIds: string[];
}

export interface FloorPlanViewDto {
  outletId: string;
  outletName: string;
  floors: FloorDto[];
  totalTables: number;
  freeTables: number;
  occupiedTables: number;
  reservedTables: number;
  needsCleaning: number;
  totalSeats: number;
  seatedGuests: number;
  openOrderValue: number;
  attentionCount: number;
}

export interface SeatGuestsDto {
  tableId: string;
  guestCount: number;
  waiterId?: string | null;
  reservationId?: string | null;
  waitlistEntryId?: string | null;
  guestProfileId?: string | null;
  createOrder: boolean;
}

export interface TransferTableDto { fromTableId: string; toTableId: string; reason?: string | null; }
export interface MergeTablesDto { primaryTableId: string; tableIds: string[]; guestCount?: number | null; }
export interface ChangeTableStateDto { tableId: string; state: TableState; note?: string | null; }
export interface AssignWaiterDto { tableId: string; waiterId: string; }

// ── Menu ─────────────────────────────────────────────────────────────────────

export interface MenuCardDto {
  id: string;
  outletId?: string | null;
  name: string;
  daypart: MenuDaypart;
  availableFrom?: string | null;
  availableTo?: string | null;
  activeDays?: string | null;
  effectiveFrom?: string | null;
  effectiveTo?: string | null;
  displayOrder: number;
  isDefault: boolean;
  isActive: boolean;
  description?: string | null;
  categoryCount: number;
  itemCount: number;
  isCurrentlyActive: boolean;
}

export type SaveMenuCardDto = Omit<
  MenuCardDto, 'id' | 'categoryCount' | 'itemCount' | 'isCurrentlyActive'
>;

export interface MenuCategoryDto {
  id: string;
  menuId: string;
  parentCategoryId?: string | null;
  name: string;
  displayOrder: number;
  colorHex?: string | null;
  iconName?: string | null;
  imageUrl?: string | null;
  defaultStationId?: string | null;
  isActive: boolean;
  description?: string | null;
  itemCount: number;
}

export type SaveMenuCategoryDto = Omit<MenuCategoryDto, 'id' | 'itemCount'>;

export interface MenuItemDto {
  id: string;
  code?: string | null;
  categoryId: string;
  categoryName?: string | null;
  menuId?: string | null;
  name: string;
  shortName?: string | null;
  imageUrl?: string | null;
  description?: string | null;
  displayOrder: number;
  basePrice: number;
  standardCost: number;
  taxGroupId?: string | null;
  taxPercent: number;
  inventoryItemId?: string | null;
  stationId?: string | null;
  stationName?: string | null;
  defaultCourse: CourseType;
  prepTimeMinutes: number;
  isVegetarian: boolean;
  isVegan: boolean;
  isHalal: boolean;
  isGlutenFree: boolean;
  containsNuts: boolean;
  containsDairy: boolean;
  containsShellfish: boolean;
  spiceLevel: SpiceLevel;
  calories?: number | null;
  allergens?: string | null;
  isAlcohol: boolean;
  isSoldByWeight: boolean;
  isOpenPrice: boolean;
  isFeatured: boolean;
  isCombo: boolean;
  isAvailable: boolean;
  isActive: boolean;
  kitchenNote?: string | null;
  barcode?: string | null;
  foodCostPercent: number;
  contributionMargin: number;
  unavailableReason?: string | null;
  variants: MenuItemVariantDto[];
  prices: MenuItemPriceDto[];
  modifierGroups: ItemModifierGroupDto[];
  hasRecipe: boolean;
}

export interface SaveMenuItemDto {
  code?: string | null;
  categoryId: string;
  name: string;
  shortName?: string | null;
  imageUrl?: string | null;
  description?: string | null;
  displayOrder: number;
  basePrice: number;
  standardCost: number;
  taxGroupId?: string | null;
  taxPercent: number;
  inventoryItemId?: string | null;
  stationId?: string | null;
  defaultCourse: CourseType;
  prepTimeMinutes: number;
  isVegetarian: boolean;
  isVegan: boolean;
  isHalal: boolean;
  isGlutenFree: boolean;
  containsNuts: boolean;
  containsDairy: boolean;
  containsShellfish: boolean;
  spiceLevel: SpiceLevel;
  calories?: number | null;
  allergens?: string | null;
  isAlcohol: boolean;
  isSoldByWeight: boolean;
  isOpenPrice: boolean;
  isFeatured: boolean;
  isActive: boolean;
  kitchenNote?: string | null;
  barcode?: string | null;
  variants: MenuItemVariantDto[];
  prices: MenuItemPriceDto[];
  modifierGroupIds: string[];
}

export interface MenuItemVariantDto {
  id: string;
  menuItemId: string;
  name: string;
  displayOrder: number;
  price: number;
  standardCost: number;
  isDefault: boolean;
  barcode?: string | null;
  inventoryItemId?: string | null;
  isAvailable: boolean;
  isActive: boolean;
}

export interface MenuItemPriceDto {
  id: string;
  menuItemId: string;
  variantId?: string | null;
  outletId?: string | null;
  scope: PriceScope;
  price: number;
}

export interface ModifierGroupDto {
  id: string;
  name: string;
  promptText?: string | null;
  selectionMode: ModifierSelectionMode;
  isRequired: boolean;
  minSelections: number;
  maxSelections: number;
  freeSelections: number;
  displayOrder: number;
  isActive: boolean;
  description?: string | null;
  modifiers: ModifierDto[];
  usedByItemCount: number;
}

export type SaveModifierGroupDto = Omit<ModifierGroupDto, 'id' | 'usedByItemCount'>;

export interface ModifierDto {
  id: string;
  modifierGroupId: string;
  name: string;
  priceDelta: number;
  costDelta: number;
  displayOrder: number;
  isDefault: boolean;
  isAvailable: boolean;
  isRemoval: boolean;
  inventoryItemId?: string | null;
  consumptionQuantity: number;
  consumptionUom?: string | null;
  isActive: boolean;
}

export interface ItemModifierGroupDto {
  id: string;
  modifierGroupId: string;
  name: string;
  promptText?: string | null;
  selectionMode: ModifierSelectionMode;
  isRequired: boolean;
  minSelections: number;
  maxSelections: number;
  freeSelections: number;
  displayOrder: number;
  modifiers: ModifierDto[];
}

export interface ComboMealDto {
  id: string;
  code?: string | null;
  outletId?: string | null;
  menuItemId?: string | null;
  name: string;
  imageUrl?: string | null;
  description?: string | null;
  price: number;
  standardCost: number;
  taxGroupId?: string | null;
  displayOrder: number;
  isAvailable: boolean;
  isActive: boolean;
  components: ComboComponentDto[];
  aLaCarteTotal: number;
  savingAmount: number;
}

export interface ComboComponentDto {
  id: string;
  comboMealId: string;
  name: string;
  mode: ComboComponentMode;
  quantity: number;
  minChoices: number;
  maxChoices: number;
  displayOrder: number;
  options: ComboOptionDto[];
}

export interface ComboOptionDto {
  id: string;
  comboComponentId: string;
  menuItemId: string;
  menuItemName?: string | null;
  variantId?: string | null;
  variantName?: string | null;
  upchargeAmount: number;
  isDefault: boolean;
  displayOrder: number;
}

export interface AvailabilityDto {
  id: string;
  outletId: string;
  menuItemId: string;
  menuItemName?: string | null;
  categoryName?: string | null;
  variantId?: string | null;
  variantName?: string | null;
  isAvailable: boolean;
  reason?: string | null;
  isAutomatic: boolean;
  availableAgainAt?: string | null;
  markedAt: string;
  markedByStaffId?: string | null;
  markedByStaffName?: string | null;
}

export interface Set86Dto {
  outletId: string;
  menuItemId: string;
  variantId?: string | null;
  isAvailable: boolean;
  reason?: string | null;
  availableAgainAt?: string | null;
  staffId?: string | null;
}

export interface HappyHourRuleDto {
  id: string;
  outletId?: string | null;
  name: string;
  startTime: string;
  endTime: string;
  activeDays?: string | null;
  effectiveFrom?: string | null;
  effectiveTo?: string | null;
  discountKind: DiscountKind;
  discountValue: number;
  categoryId?: string | null;
  categoryName?: string | null;
  menuItemId?: string | null;
  menuItemName?: string | null;
  applicableOrderTypes?: string | null;
  priority: number;
  isActive: boolean;
  isCurrentlyActive: boolean;
}

export interface OrderPadCatalogDto {
  outletId: string;
  resolvedAt: string;
  orderType: OrderType;
  currencyCode: string;
  pricesIncludeTax: boolean;
  menus: MenuCardDto[];
  categories: MenuCategoryDto[];
  items: MenuItemDto[];
  modifierGroups: ModifierGroupDto[];
  combos: ComboMealDto[];
  unavailableItemIds: string[];
}

// ── Kitchen ──────────────────────────────────────────────────────────────────

export interface KitchenStationDto {
  id: string;
  outletId: string;
  name: string;
  stationType: StationType;
  displayOrder: number;
  colorHex?: string | null;
  isExpo: boolean;
  slaMinutes: number;
  maxConcurrentTickets: number;
  printsTickets: boolean;
  printerProfileId?: string | null;
  isActive: boolean;
  description?: string | null;
  openTicketCount: number;
  overdueTicketCount: number;
  averagePrepSeconds: number;
  routingRules: StationRoutingRuleDto[];
}

export type SaveKitchenStationDto = Omit<
  KitchenStationDto, 'id' | 'openTicketCount' | 'overdueTicketCount' | 'averagePrepSeconds' | 'routingRules'
>;

export interface StationRoutingRuleDto {
  id: string;
  stationId: string;
  stationName?: string | null;
  outletId: string;
  matchType: RoutingMatchType;
  categoryId?: string | null;
  categoryName?: string | null;
  menuItemId?: string | null;
  menuItemName?: string | null;
  orderType?: OrderType | null;
  priority: number;
  isAdditional: boolean;
  isActive: boolean;
}

export interface KitchenTicketDto {
  id: string;
  outletId: string;
  stationId: string;
  stationName?: string | null;
  stationColorHex?: string | null;
  orderId: string;
  orderNumber?: string | null;
  ticketNumber: string;
  status: KitchenTicketStatus;
  course: CourseType;
  orderType: OrderType;
  tableNumber?: string | null;
  waiterName?: string | null;
  guestCount: number;
  isPriority: boolean;
  isRemake: boolean;
  firedAt: string;
  acknowledgedAt?: string | null;
  startedAt?: string | null;
  readyAt?: string | null;
  bumpedAt?: string | null;
  prepSeconds?: number | null;
  recallCount: number;
  note?: string | null;
  ageSeconds: number;
  urgencyLevel: 'ok' | 'warning' | 'overdue';
  lines: KitchenTicketLineDto[];
}

export interface KitchenTicketLineDto {
  id: string;
  ticketId: string;
  orderLineId: string;
  menuItemId: string;
  itemName: string;
  variantName?: string | null;
  quantity: number;
  modifierSummary?: string | null;
  specialInstructions?: string | null;
  allergenWarning?: string | null;
  seatNumber?: number | null;
  status: OrderLineStatus;
  readyAt?: string | null;
  displayOrder: number;
}

export interface KitchenDisplayDto {
  outletId: string;
  stationId?: string | null;
  stationName?: string | null;
  isExpo: boolean;
  serverTime: string;
  tickets: KitchenTicketDto[];
  allDayCounts: AllDayCountDto[];
  newCount: number;
  inProgressCount: number;
  readyCount: number;
  overdueCount: number;
  averagePrepSeconds: number;
}

export interface AllDayCountDto {
  menuItemId: string;
  itemName: string;
  variantName?: string | null;
  outstandingQuantity: number;
  ticketCount: number;
  oldestAgeSeconds: number;
}

export interface PrinterProfileDto {
  id: string;
  outletId: string;
  name: string;
  target?: string | null;
  paperWidthMm: number;
  isReceiptPrinter: boolean;
  isKitchenPrinter: boolean;
  isLabelPrinter: boolean;
  opensCashDrawer: boolean;
  copiesPerTicket: number;
  headerText?: string | null;
  footerText?: string | null;
  isActive: boolean;
}

// ── Orders ───────────────────────────────────────────────────────────────────

export interface RestaurantOrderDto {
  id: string;
  outletId: string;
  orderNumber: string;
  tokenNumber?: string | null;
  orderType: OrderType;
  channel: OrderChannel;
  status: RestaurantOrderStatus;
  tableId?: string | null;
  tableNumber?: string | null;
  sectionId?: string | null;
  sectionName?: string | null;
  guestCount: number;
  waiterId?: string | null;
  waiterName?: string | null;
  sessionId?: string | null;
  guestProfileId?: string | null;
  customerId?: string | null;
  customerName?: string | null;
  customerPhone?: string | null;
  subTotal: number;
  discountAmount: number;
  serviceChargeAmount: number;
  packagingChargeAmount: number;
  deliveryFeeAmount: number;
  taxAmount: number;
  tipAmount: number;
  roundingAmount: number;
  totalAmount: number;
  paidAmount: number;
  balanceDue: number;
  costAmount: number;
  currencyCode: string;
  openedAt: string;
  firstFiredAt?: string | null;
  servedAt?: string | null;
  billedAt?: string | null;
  closedAt?: string | null;
  promisedAt?: string | null;
  externalSource?: string | null;
  externalReference?: string | null;
  wasOffline: boolean;
  note?: string | null;
  cancelReason?: string | null;
  minutesOpen: number;
  heldLineCount: number;
  unservedLineCount: number;
  lines: RestaurantOrderLineDto[];
  deliveries: RestaurantDeliveryDto[];
  statusHistory: OrderStatusHistoryDto[];
}

export interface RestaurantOrderLineDto {
  id: string;
  orderId: string;
  menuItemId: string;
  variantId?: string | null;
  comboMealId?: string | null;
  parentLineId?: string | null;
  itemName: string;
  variantName?: string | null;
  imageUrl?: string | null;
  quantity: number;
  unitPrice: number;
  modifierAmount: number;
  discountAmount: number;
  taxAmount: number;
  lineTotal: number;
  unitCost: number;
  taxGroupId?: string | null;
  taxPercent: number;
  seatNumber?: number | null;
  course: CourseType;
  courseSequence: number;
  status: OrderLineStatus;
  isHeld: boolean;
  stationId?: string | null;
  stationName?: string | null;
  firedAt?: string | null;
  readyAt?: string | null;
  servedAt?: string | null;
  isVoided: boolean;
  voidReasonId?: string | null;
  voidReasonName?: string | null;
  voidNote?: string | null;
  isComped: boolean;
  specialInstructions?: string | null;
  allergenWarning?: string | null;
  displayOrder: number;
  modifiers: OrderLineModifierDto[];
}

export interface OrderLineModifierDto {
  id: string;
  orderLineId: string;
  modifierId: string;
  modifierGroupId: string;
  modifierName: string;
  groupName?: string | null;
  quantity: number;
  priceDelta: number;
  costDelta: number;
  isRemoval: boolean;
}

export interface OrderStatusHistoryDto {
  id: string;
  fromStatus: RestaurantOrderStatus;
  toStatus: RestaurantOrderStatus;
  occurredAt: string;
  staffId?: string | null;
  staffName?: string | null;
  note?: string | null;
}

export interface OpenOrderDto {
  outletId: string;
  orderType: OrderType;
  channel: OrderChannel;
  tableId?: string | null;
  guestCount: number;
  waiterId?: string | null;
  sessionId?: string | null;
  guestProfileId?: string | null;
  customerId?: string | null;
  customerName?: string | null;
  customerPhone?: string | null;
  note?: string | null;
  idempotencyKey?: string | null;
  delivery?: Partial<RestaurantDeliveryDto> | null;
  lines: AddOrderLineDto[];
}

export interface AddOrderLineDto {
  menuItemId: string;
  variantId?: string | null;
  comboMealId?: string | null;
  quantity: number;
  overridePrice?: number | null;
  seatNumber?: number | null;
  course?: CourseType | null;
  courseSequence?: number | null;
  isHeld: boolean;
  specialInstructions?: string | null;
  modifiers: SelectedModifierDto[];
  comboSelections: ComboSelectionDto[];
}

export interface SelectedModifierDto { modifierId: string; quantity: number; }

export interface ComboSelectionDto {
  comboComponentId: string;
  menuItemId: string;
  variantId?: string | null;
  quantity: number;
  modifiers: SelectedModifierDto[];
}

export interface AddLinesDto {
  orderId: string;
  waiterId?: string | null;
  lines: AddOrderLineDto[];
  fireImmediately: boolean;
  idempotencyKey?: string | null;
}

export interface UpdateOrderLineDto {
  quantity?: number | null;
  seatNumber?: number | null;
  course?: CourseType | null;
  isHeld?: boolean | null;
  specialInstructions?: string | null;
  modifiers?: SelectedModifierDto[] | null;
}

export interface VoidLineDto {
  orderLineId: string;
  voidReasonId?: string | null;
  note?: string | null;
  staffId?: string | null;
  approvalPin?: string | null;
}

export interface FireCourseDto {
  orderId: string;
  course?: CourseType | null;
  lineIds: string[];
  isPriority: boolean;
  staffId?: string | null;
}

export interface MoveLinesDto {
  fromOrderId: string;
  toOrderId: string;
  lineIds: string[];
  toSeatNumber?: number | null;
}

export interface UpdateOrderDto {
  guestCount?: number | null;
  waiterId?: string | null;
  guestProfileId?: string | null;
  customerId?: string | null;
  customerName?: string | null;
  customerPhone?: string | null;
  note?: string | null;
  orderType?: OrderType | null;
}

export interface CancelOrderDto { reason?: string | null; staffId?: string | null; approvalPin?: string | null; }

export interface RestaurantDeliveryDto {
  id: string;
  orderId: string;
  outletId: string;
  status: DeliveryStatus;
  recipientName?: string | null;
  phone?: string | null;
  addressLine?: string | null;
  landmark?: string | null;
  city?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  zoneName?: string | null;
  deliveryFee: number;
  distanceKm: number;
  riderId?: string | null;
  riderName?: string | null;
  riderPhone?: string | null;
  assignedAt?: string | null;
  pickedUpAt?: string | null;
  deliveredAt?: string | null;
  estimatedArrivalAt?: string | null;
  failureReason?: string | null;
  deliveryNote?: string | null;
}

export interface UpdateDeliveryStatusDto {
  status: DeliveryStatus;
  riderId?: string | null;
  riderName?: string | null;
  riderPhone?: string | null;
  failureReason?: string | null;
}

export interface OrderSummaryDto {
  id: string;
  orderNumber: string;
  tokenNumber?: string | null;
  orderType: OrderType;
  channel: OrderChannel;
  status: RestaurantOrderStatus;
  tableNumber?: string | null;
  waiterName?: string | null;
  customerName?: string | null;
  guestCount: number;
  lineCount: number;
  totalAmount: number;
  paidAmount: number;
  openedAt: string;
  closedAt?: string | null;
  minutesOpen: number;
  heldLineCount: number;
  deliveryStatus?: DeliveryStatus | null;
}

// ── Checks ───────────────────────────────────────────────────────────────────

export interface RestaurantCheckDto {
  id: string;
  orderId: string;
  orderNumber?: string | null;
  outletId: string;
  checkNumber: string;
  status: CheckStatus;
  splitMethod: SplitMethod;
  splitIndex: number;
  splitCount: number;
  seatNumbers?: string | null;
  tableNumber?: string | null;
  subTotal: number;
  discountAmount: number;
  serviceChargeAmount: number;
  packagingChargeAmount: number;
  deliveryFeeAmount: number;
  taxAmount: number;
  tipAmount: number;
  roundingAmount: number;
  totalAmount: number;
  paidAmount: number;
  balanceDue: number;
  changeAmount: number;
  currencyCode: string;
  sessionId?: string | null;
  cashierId?: string | null;
  cashierName?: string | null;
  waiterId?: string | null;
  waiterName?: string | null;
  printedAt?: string | null;
  paidAt?: string | null;
  printCount: number;
  salesInvoiceId?: string | null;
  fiscalReference?: string | null;
  isVoided: boolean;
  voidNote?: string | null;
  voidedAt?: string | null;
  lines: CheckLineDto[];
  payments: CheckPaymentDto[];
  discounts: CheckDiscountDto[];
}

export interface CheckLineDto {
  id: string;
  checkId: string;
  orderLineId: string;
  menuItemId: string;
  itemName: string;
  variantName?: string | null;
  modifierSummary?: string | null;
  seatNumber?: number | null;
  quantity: number;
  unitPrice: number;
  discountAmount: number;
  taxAmount: number;
  lineTotal: number;
  unitCost: number;
  displayOrder: number;
}

export interface CheckPaymentDto {
  id: string;
  checkId: string;
  tenderType: TenderType;
  amount: number;
  tenderedAmount: number;
  changeAmount: number;
  tipAmount: number;
  currencyCode: string;
  exchangeRate: number;
  reference?: string | null;
  cardLast4?: string | null;
  cardScheme?: string | null;
  authCode?: string | null;
  giftCardId?: string | null;
  loyaltyPointsUsed?: number | null;
  paidAt: string;
  staffId?: string | null;
  isRefund: boolean;
  refundReason?: string | null;
}

export interface CheckDiscountDto {
  id: string;
  checkId: string;
  orderLineId?: string | null;
  discountReasonId?: string | null;
  reasonName?: string | null;
  kind: DiscountKind;
  value: number;
  amount: number;
  promoCode?: string | null;
  appliedByStaffId?: string | null;
  approvedByStaffId?: string | null;
  appliedAt: string;
}

export interface CreateChecksDto {
  orderId: string;
  splitMethod: SplitMethod;
  splitCount: number;
  parts: CheckSplitPartDto[];
  cashierId?: string | null;
  sessionId?: string | null;
  replaceExisting: boolean;
}

export interface CheckSplitPartDto {
  seatNumbers: number[];
  orderLineIds: string[];
  amount?: number | null;
  percentage?: number | null;
  label?: string | null;
}

export interface TakePaymentDto {
  checkId: string;
  tenderType: TenderType;
  amount: number;
  tenderedAmount: number;
  tipAmount: number;
  currencyCode: string;
  exchangeRate: number;
  reference?: string | null;
  cardLast4?: string | null;
  cardScheme?: string | null;
  authCode?: string | null;
  giftCardId?: string | null;
  loyaltyPointsUsed?: number | null;
  staffId?: string | null;
  sessionId?: string | null;
  idempotencyKey?: string | null;
}

export interface ApplyDiscountDto {
  checkId: string;
  orderLineId?: string | null;
  discountReasonId?: string | null;
  kind: DiscountKind;
  value: number;
  promoCode?: string | null;
  staffId?: string | null;
  approvalPin?: string | null;
}

export interface AddTipDto {
  checkId: string;
  amount: number;
  tenderType: TenderType;
  waiterId?: string | null;
  isDeclared: boolean;
}

export interface VoidCheckDto {
  checkId: string;
  voidReasonId?: string | null;
  note?: string | null;
  staffId?: string | null;
  approvalPin?: string | null;
}

export interface RefundPaymentDto {
  paymentId: string;
  amount: number;
  reason?: string | null;
  staffId?: string | null;
  approvalPin?: string | null;
}

export interface WaiveServiceChargeDto {
  checkId: string;
  reason?: string | null;
  staffId?: string | null;
  approvalPin?: string | null;
}

export interface VoidReasonDto {
  id: string;
  name: string;
  displayOrder: number;
  requiresApproval: boolean;
  countsAsWastage: boolean;
  isActive: boolean;
}

export interface DiscountReasonDto {
  id: string;
  name: string;
  displayOrder: number;
  requiresApproval: boolean;
  maxAmountWithoutApproval: number;
  isComp: boolean;
  isActive: boolean;
}

export interface ServiceChargeRuleDto {
  id: string;
  outletId?: string | null;
  name: string;
  basis: ServiceChargeBasis;
  value: number;
  minPartySize: number;
  applicableOrderTypes?: string | null;
  isTaxable: boolean;
  taxGroupId?: string | null;
  isWaivable: boolean;
  requiresApprovalToWaive: boolean;
  priority: number;
  isActive: boolean;
}

export interface TipRecordDto {
  id: string;
  outletId: string;
  checkId?: string | null;
  checkNumber?: string | null;
  waiterId?: string | null;
  waiterName?: string | null;
  amount: number;
  tenderType: TenderType;
  isDeclared: boolean;
  receivedAt: string;
  tipPoolId?: string | null;
}

export interface TipPoolDto {
  id: string;
  outletId: string;
  name: string;
  periodStart: string;
  periodEnd: string;
  basis: TipDistributionBasis;
  totalAmount: number;
  distributedAmount: number;
  kitchenSharePercent: number;
  isFinalised: boolean;
  finalisedAt?: string | null;
  distributions: TipDistributionDto[];
}

export interface TipDistributionDto {
  id: string;
  tipPoolId: string;
  staffId: string;
  staffName?: string | null;
  role: StaffRole;
  hoursWorked: number;
  salesAmount: number;
  sharePercent: number;
  amount: number;
  isPaidOut: boolean;
  paidOutAt?: string | null;
}

export interface CreateTipPoolDto {
  outletId: string;
  name: string;
  periodStart: string;
  periodEnd: string;
  basis: TipDistributionBasis;
  kitchenSharePercent: number;
}

// ── Front of house ───────────────────────────────────────────────────────────

export interface ReservationDto {
  id: string;
  outletId: string;
  reservationNumber: string;
  status: ReservationStatus;
  guestProfileId?: string | null;
  guestName: string;
  phone?: string | null;
  email?: string | null;
  isVipGuest: boolean;
  partySize: number;
  reservedFor: string;
  durationMinutes: number;
  tableId?: string | null;
  tableNumber?: string | null;
  sectionId?: string | null;
  sectionName?: string | null;
  floorId?: string | null;
  occasion?: string | null;
  specialRequests?: string | null;
  allergyNotes?: string | null;
  isHighChairNeeded: boolean;
  isWheelchairAccess: boolean;
  depositAmount: number;
  isDepositPaid: boolean;
  confirmedAt?: string | null;
  seatedAt?: string | null;
  completedAt?: string | null;
  cancelledAt?: string | null;
  cancelReason?: string | null;
  orderId?: string | null;
  reminderSent: boolean;
  source: OrderChannel;
  note?: string | null;
  minutesUntil: number;
  isLate: boolean;
}

export interface SaveReservationDto {
  outletId: string;
  guestProfileId?: string | null;
  guestName: string;
  phone?: string | null;
  email?: string | null;
  partySize: number;
  reservedFor: string;
  durationMinutes: number;
  tableId?: string | null;
  sectionId?: string | null;
  floorId?: string | null;
  occasion?: string | null;
  specialRequests?: string | null;
  allergyNotes?: string | null;
  isHighChairNeeded: boolean;
  isWheelchairAccess: boolean;
  depositAmount: number;
  isDepositPaid: boolean;
  source: OrderChannel;
  note?: string | null;
}

export interface ChangeReservationStatusDto {
  status: ReservationStatus;
  tableId?: string | null;
  reason?: string | null;
}

export interface ReservationAvailabilityDto {
  outletId: string;
  requestedFor: string;
  partySize: number;
  durationMinutes: number;
  availableTables: AvailableTableDto[];
  conflictingReservations: ReservationDto[];
  alternativeTimes: string[];
}

export interface AvailableTableDto {
  tableId: string;
  tableNumber: string;
  seats: number;
  sectionId?: string | null;
  sectionName?: string | null;
  floorName?: string | null;
  currentState: TableState;
  fitScore: number;
}

export interface WaitlistEntryDto {
  id: string;
  outletId: string;
  guestName: string;
  phone?: string | null;
  partySize: number;
  status: WaitlistStatus;
  joinedAt: string;
  quotedWaitMinutes: number;
  notifiedAt?: string | null;
  seatedAt?: string | null;
  leftAt?: string | null;
  tableId?: string | null;
  tableNumber?: string | null;
  orderId?: string | null;
  guestProfileId?: string | null;
  preferredSectionId?: string | null;
  preferredSectionName?: string | null;
  pagerNumber?: string | null;
  note?: string | null;
  position: number;
  waitedMinutes: number;
  isOverQuote: boolean;
}

export interface SaveWaitlistEntryDto {
  outletId: string;
  guestName: string;
  phone?: string | null;
  partySize: number;
  quotedWaitMinutes: number;
  preferredSectionId?: string | null;
  guestProfileId?: string | null;
  pagerNumber?: string | null;
  note?: string | null;
}

export interface ChangeWaitlistStatusDto {
  status: WaitlistStatus;
  tableId?: string | null;
  note?: string | null;
}

export interface GuestProfileDto {
  id: string;
  fullName: string;
  phone?: string | null;
  email?: string | null;
  customerId?: string | null;
  birthday?: string | null;
  anniversary?: string | null;
  dietaryPreferences?: string | null;
  allergies?: string | null;
  favouriteItems?: string | null;
  preferredSeating?: string | null;
  visitCount: number;
  lifetimeSpend: number;
  averageCheck: number;
  firstVisitAt?: string | null;
  lastVisitAt?: string | null;
  noShowCount: number;
  isVip: boolean;
  isBlacklisted: boolean;
  blacklistReason?: string | null;
  loyaltyPoints: number;
  loyaltyTier?: string | null;
  notes?: string | null;
  isActive: boolean;
}

export type SaveGuestProfileDto = Omit<
  GuestProfileDto,
  'id' | 'visitCount' | 'lifetimeSpend' | 'averageCheck' | 'firstVisitAt' | 'lastVisitAt' | 'noShowCount' | 'loyaltyPoints'
>;

export interface CustomerFeedbackDto {
  id: string;
  outletId: string;
  orderId?: string | null;
  orderNumber?: string | null;
  checkId?: string | null;
  guestProfileId?: string | null;
  waiterId?: string | null;
  waiterName?: string | null;
  tableId?: string | null;
  tableNumber?: string | null;
  overallRating: number;
  foodRating?: number | null;
  serviceRating?: number | null;
  ambienceRating?: number | null;
  valueRating?: number | null;
  comment?: string | null;
  guestName?: string | null;
  phone?: string | null;
  submittedAt: string;
  isResolved: boolean;
  resolutionNote?: string | null;
  resolvedAt?: string | null;
}

// ── Staff & cash ─────────────────────────────────────────────────────────────

export interface RestaurantStaffDto {
  id: string;
  code?: string | null;
  outletId: string;
  outletName?: string | null;
  fullName: string;
  displayName?: string | null;
  role: StaffRole;
  userId?: string | null;
  employeeId?: string | null;
  phone?: string | null;
  email?: string | null;
  photoUrl?: string | null;
  hasPin: boolean;
  isLocked: boolean;
  canTakeOrders: boolean;
  canVoidLines: boolean;
  canApplyDiscounts: boolean;
  canApproveDiscounts: boolean;
  canOpenCashDrawer: boolean;
  canCloseSession: boolean;
  canRunReports: boolean;
  canEditMenu: boolean;
  canManageTables: boolean;
  canServeAlcohol: boolean;
  defaultSectionId?: string | null;
  defaultSectionName?: string | null;
  hourlyRate?: number | null;
  tipSharePercent?: number | null;
  hiredOn?: string | null;
  isActive: boolean;
  note?: string | null;
  isOnShift: boolean;
  openTableCount: number;
}

export type SaveRestaurantStaffDto = Omit<
  RestaurantStaffDto,
  'id' | 'outletName' | 'hasPin' | 'isLocked' | 'defaultSectionName' | 'isOnShift' | 'openTableCount'
>;

export interface StaffSessionDto {
  staffId: string;
  fullName: string;
  displayName?: string | null;
  role: StaffRole;
  outletId: string;
  sectionId?: string | null;
  shiftId?: string | null;
  isOnShift: boolean;
  canTakeOrders: boolean;
  canVoidLines: boolean;
  canApplyDiscounts: boolean;
  canApproveDiscounts: boolean;
  canOpenCashDrawer: boolean;
  canCloseSession: boolean;
  canRunReports: boolean;
  canEditMenu: boolean;
  canManageTables: boolean;
  canServeAlcohol: boolean;
}

export interface StaffShiftDto {
  id: string;
  outletId: string;
  staffId: string;
  staffName?: string | null;
  shiftDate: string;
  scheduledStart: string;
  scheduledEnd: string;
  status: ShiftStatus;
  actualStart?: string | null;
  actualEnd?: string | null;
  breakMinutes: number;
  hoursWorked: number;
  sectionId?: string | null;
  sectionName?: string | null;
  role: StaffRole;
  salesAmount: number;
  ordersHandled: number;
  coversServed: number;
  tipsEarned: number;
  note?: string | null;
}

export interface SaveStaffShiftDto {
  outletId: string;
  staffId: string;
  shiftDate: string;
  scheduledStart: string;
  scheduledEnd: string;
  sectionId?: string | null;
  role: StaffRole;
  note?: string | null;
}

export interface ClockDto {
  staffId: string;
  outletId: string;
  shiftId?: string | null;
  isBreak: boolean;
  note?: string | null;
}

export interface TimeClockEntryDto {
  id: string;
  staffId: string;
  staffName?: string | null;
  shiftId?: string | null;
  clockedInAt: string;
  clockedOutAt?: string | null;
  isBreak: boolean;
  hours: number;
  isAdjusted: boolean;
  note?: string | null;
}

export interface RestaurantSessionDto {
  id: string;
  outletId: string;
  outletName?: string | null;
  sessionNumber: string;
  status: SessionStatus;
  cashierId?: string | null;
  cashierName?: string | null;
  terminalName?: string | null;
  openedAt: string;
  closedAt?: string | null;
  openingFloat: number;
  expectedCash: number;
  expectedCard: number;
  expectedOther: number;
  countedCash: number;
  countedCard: number;
  countedOther: number;
  cashVariance: number;
  isBlindClose: boolean;
  totalSales: number;
  totalDiscounts: number;
  totalVoids: number;
  totalRefunds: number;
  totalTips: number;
  totalTax: number;
  totalServiceCharge: number;
  orderCount: number;
  coverCount: number;
  checkCount: number;
  xReadCount: number;
  zReadAt?: string | null;
  closingNote?: string | null;
  cashMovements: SessionCashMovementDto[];
}

export interface OpenSessionDto {
  outletId: string;
  cashierId?: string | null;
  terminalName?: string | null;
  openingFloat: number;
  isBlindClose: boolean;
}

export interface CloseSessionDto {
  sessionId: string;
  countedCash: number;
  countedCard: number;
  countedOther: number;
  closingNote?: string | null;
  staffId?: string | null;
  approvalPin?: string | null;
}

export interface SessionCashMovementDto {
  id: string;
  sessionId: string;
  movementType: CashMovementType;
  amount: number;
  reason?: string | null;
  reference?: string | null;
  staffId?: string | null;
  staffName?: string | null;
  occurredAt: string;
}

export interface AddCashMovementDto {
  sessionId: string;
  movementType: CashMovementType;
  amount: number;
  reason?: string | null;
  reference?: string | null;
  staffId?: string | null;
}

export interface ReadReportDto {
  sessionId: string;
  sessionNumber: string;
  reportType: string;
  outletName: string;
  cashierName?: string | null;
  terminalName?: string | null;
  openedAt: string;
  closedAt?: string | null;
  generatedAt: string;
  currencyCode: string;
  openingFloat: number;
  grossSales: number;
  discounts: number;
  serviceCharge: number;
  tax: number;
  netSales: number;
  tips: number;
  voids: number;
  refunds: number;
  expectedCash: number;
  countedCash: number;
  cashVariance: number;
  orderCount: number;
  checkCount: number;
  coverCount: number;
  averageCheck: number;
  averagePerCover: number;
  tenderBreakdown: TenderBreakdownDto[];
  categoryBreakdown: CategorySalesDto[];
  cashMovements: SessionCashMovementDto[];
}

export interface TenderBreakdownDto {
  tenderType: TenderType;
  tenderName: string;
  count: number;
  amount: number;
  tipAmount: number;
  sharePercent: number;
}

// ── Recipes & cost ───────────────────────────────────────────────────────────

export interface RecipeDto {
  id: string;
  code?: string | null;
  menuItemId?: string | null;
  menuItemName?: string | null;
  variantId?: string | null;
  variantName?: string | null;
  name: string;
  yieldQuantity: number;
  yieldUom: string;
  isSubRecipe: boolean;
  outputInventoryItemId?: string | null;
  totalCost: number;
  prepTimeMinutes?: number | null;
  cookTimeMinutes?: number | null;
  instructions?: string | null;
  platingNotes?: string | null;
  version: number;
  isActive: boolean;
  description?: string | null;
  sellingPrice: number;
  costPerPortion: number;
  foodCostPercent: number;
  contributionMargin: number;
  ingredients: RecipeIngredientDto[];
}

export interface SaveRecipeDto {
  code?: string | null;
  menuItemId?: string | null;
  variantId?: string | null;
  name: string;
  yieldQuantity: number;
  yieldUom: string;
  isSubRecipe: boolean;
  outputInventoryItemId?: string | null;
  prepTimeMinutes?: number | null;
  cookTimeMinutes?: number | null;
  instructions?: string | null;
  platingNotes?: string | null;
  isActive: boolean;
  description?: string | null;
  ingredients: RecipeIngredientDto[];
}

export interface RecipeIngredientDto {
  id: string;
  recipeId: string;
  inventoryItemId?: string | null;
  subRecipeId?: string | null;
  ingredientName: string;
  quantity: number;
  uom: string;
  yieldPercent: number;
  wastePercent: number;
  unitCost: number;
  lineCost: number;
  isOptional: boolean;
  displayOrder: number;
  note?: string | null;
}

export interface WastageLogDto {
  id: string;
  outletId: string;
  outletName?: string | null;
  occurredAt: string;
  reason: WastageReason;
  menuItemId?: string | null;
  inventoryItemId?: string | null;
  itemName: string;
  quantity: number;
  uom: string;
  unitCost: number;
  totalCost: number;
  staffId?: string | null;
  staffName?: string | null;
  orderLineId?: string | null;
  stationId?: string | null;
  stationName?: string | null;
  isStockAdjusted: boolean;
  note?: string | null;
}

export interface SaveWastageDto {
  outletId: string;
  occurredAt?: string | null;
  reason: WastageReason;
  menuItemId?: string | null;
  inventoryItemId?: string | null;
  itemName: string;
  quantity: number;
  uom: string;
  unitCost: number;
  staffId?: string | null;
  stationId?: string | null;
  note?: string | null;
}

export interface RestaurantSettingsDto {
  id: string;
  requireWaiterPin: boolean;
  requireGuestCountOnSeat: boolean;
  requireSeatNumbers: boolean;
  autoFireOnSend: boolean;
  seatedAttentionMinutes: number;
  servedAttentionMinutes: number;
  allowTableMerge: boolean;
  allowTableTransfer: boolean;
  allowSplitBill: boolean;
  pricesIncludeTax: boolean;
  tipsEnabled: boolean;
  tipPresetPercents?: string | null;
  tipPoolingEnabled: boolean;
  tipDistributionBasis: TipDistributionBasis;
  kitchenTipSharePercent: number;
  cashRoundingIncrement: number;
  packagingChargePerOrder: number;
  voidRequiresReason: boolean;
  discountRequiresReason: boolean;
  discountApprovalThreshold: number;
  kitchenDisplayEnabled: boolean;
  printKitchenTickets: boolean;
  expoScreenEnabled: boolean;
  kdsWarningMinutes: number;
  autoBumpOnServe: boolean;
  showAllergenWarnings: boolean;
  depleteStockOnCheckClose: boolean;
  auto86OnZeroStock: boolean;
  trackWastage: boolean;
  reservationsEnabled: boolean;
  waitlistEnabled: boolean;
  reservationHoldMinutes: number;
  defaultReservationDuration: number;
  requireDepositForLargeParty: boolean;
  largePartyThreshold: number;
  printReceiptAutomatically: boolean;
  emailReceiptEnabled: boolean;
  receiptHeader?: string | null;
  receiptFooter?: string | null;
  showCalories: boolean;
  feedbackPromptEnabled: boolean;
}

// ── Reports ──────────────────────────────────────────────────────────────────

export interface ReportFilterDto {
  outletId?: string | null;
  from?: string | null;
  to?: string | null;
  waiterId?: string | null;
  stationId?: string | null;
  categoryId?: string | null;
  orderType?: OrderType | null;
  top: number;
}

export interface RestaurantDashboardDto {
  outletId?: string | null;
  outletName?: string | null;
  generatedAt: string;
  currencyCode: string;
  salesToday: number;
  salesYesterday: number;
  salesChangePercent: number;
  ordersToday: number;
  coversToday: number;
  averageCheck: number;
  averagePerCover: number;
  tipsToday: number;
  discountsToday: number;
  voidsToday: number;
  foodCostToday: number;
  foodCostPercent: number;
  wastageToday: number;
  openOrders: number;
  openOrderValue: number;
  occupiedTables: number;
  totalTables: number;
  occupancyPercent: number;
  seatedGuests: number;
  kitchenTicketsOpen: number;
  kitchenTicketsOverdue: number;
  waitlistLength: number;
  upcomingReservations: number;
  staffOnShift: number;
  tablesNeedingAttention: number;
  items86: number;
  averageTableTurnMinutes: number;
  averagePrepMinutes: number;
  salesByHour: HourlySalesDto[];
  topCategories: CategorySalesDto[];
  topItems: ItemSalesDto[];
  topWaiters: WaiterPerformanceDto[];
  recentOrders: OrderSummaryDto[];
  nextReservations: ReservationDto[];
}

export interface HourlySalesDto {
  hour: number;
  label: string;
  amount: number;
  orderCount: number;
  coverCount: number;
}

export interface CategorySalesDto {
  categoryId: string;
  categoryName: string;
  quantity: number;
  amount: number;
  costAmount: number;
  marginAmount: number;
  sharePercent: number;
}

export interface ItemSalesDto {
  menuItemId: string;
  itemName: string;
  categoryName?: string | null;
  quantity: number;
  amount: number;
  costAmount: number;
  marginAmount: number;
  marginPercent: number;
  sharePercent: number;
}

export interface MenuEngineeringRowDto {
  menuItemId: string;
  itemName: string;
  categoryName?: string | null;
  quantitySold: number;
  revenue: number;
  unitPrice: number;
  unitCost: number;
  contributionMargin: number;
  totalMargin: number;
  foodCostPercent: number;
  popularityPercent: number;
  classification: MenuEngineeringClass;
  classificationName: string;
  recommendation: string;
}

export interface MenuEngineeringReportDto {
  from: string;
  to: string;
  outletId?: string | null;
  averageMargin: number;
  popularityThreshold: number;
  starCount: number;
  plowhorseCount: number;
  puzzleCount: number;
  dogCount: number;
  rows: MenuEngineeringRowDto[];
}

export interface WaiterPerformanceDto {
  staffId: string;
  staffName: string;
  orderCount: number;
  coverCount: number;
  salesAmount: number;
  averageCheck: number;
  averagePerCover: number;
  tipsEarned: number;
  tipPercent: number;
  discountAmount: number;
  voidAmount: number;
  voidCount: number;
  averageTurnMinutes: number;
  hoursWorked: number;
  salesPerHour: number;
  upsellRate: number;
}

export interface TableTurnoverDto {
  tableId: string;
  tableNumber: string;
  sectionName?: string | null;
  seats: number;
  turnCount: number;
  coverCount: number;
  revenue: number;
  revenuePerSeat: number;
  averageTurnMinutes: number;
  occupancyPercent: number;
}

export interface KitchenPerformanceDto {
  stationId: string;
  stationName: string;
  ticketCount: number;
  itemCount: number;
  averagePrepMinutes: number;
  medianPrepMinutes: number;
  longestPrepMinutes: number;
  slaBreachCount: number;
  slaBreachPercent: number;
  recallCount: number;
  remakeCount: number;
}

export interface VoidAuditRowDto {
  occurredAt: string;
  orderNumber: string;
  tableNumber?: string | null;
  itemName: string;
  quantity: number;
  amount: number;
  reasonName?: string | null;
  note?: string | null;
  staffName?: string | null;
  approvedByName?: string | null;
  wasFired: boolean;
  kind: string;
}

export interface WastageSummaryDto {
  reason: WastageReason;
  reasonName: string;
  entryCount: number;
  quantity: number;
  totalCost: number;
  sharePercent: number;
}

export interface SalesSummaryReportDto {
  from: string;
  to: string;
  outletId?: string | null;
  currencyCode: string;
  grossSales: number;
  discounts: number;
  serviceCharge: number;
  packagingCharge: number;
  deliveryFees: number;
  tax: number;
  netSales: number;
  tips: number;
  voids: number;
  refunds: number;
  foodCost: number;
  grossMargin: number;
  grossMarginPercent: number;
  orderCount: number;
  checkCount: number;
  coverCount: number;
  averageCheck: number;
  averagePerCover: number;
  byHour: HourlySalesDto[];
  byCategory: CategorySalesDto[];
  byItem: ItemSalesDto[];
  byOrderType: OrderTypeSalesDto[];
  byTender: TenderBreakdownDto[];
  byDay: DailySalesDto[];
}

export interface OrderTypeSalesDto {
  orderType: OrderType;
  orderTypeName: string;
  orderCount: number;
  coverCount: number;
  amount: number;
  averageCheck: number;
  sharePercent: number;
}

export interface DailySalesDto {
  date: string;
  amount: number;
  orderCount: number;
  coverCount: number;
  averageCheck: number;
}

export interface LookupItemDto {
  value: number;
  name: string;
  label?: string | null;
}
