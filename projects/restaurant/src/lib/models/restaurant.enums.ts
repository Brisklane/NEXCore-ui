/**
 * Numeric enums mirroring `Restaurant.Domain.Enums`.
 *
 * Kept in sync by hand rather than generated, so a value that drifts shows up as a wrong label
 * in review rather than a silent runtime mismatch. The `*_LABELS` maps beside each one are what
 * the UI renders — never `enum[value]`, which would show "QuickService" to a restaurant manager.
 */

export enum ServiceStyle {
  FineDining = 1,
  CasualDining = 2,
  QuickService = 3,
  Cafe = 4,
  Bar = 5,
  CloudKitchen = 6,
  FoodTruck = 7,
  Buffet = 8,
}

export const SERVICE_STYLE_LABELS: Record<ServiceStyle, string> = {
  [ServiceStyle.FineDining]: 'Fine dining',
  [ServiceStyle.CasualDining]: 'Casual dining',
  [ServiceStyle.QuickService]: 'Quick service',
  [ServiceStyle.Cafe]: 'Café',
  [ServiceStyle.Bar]: 'Bar',
  [ServiceStyle.CloudKitchen]: 'Cloud kitchen',
  [ServiceStyle.FoodTruck]: 'Food truck',
  [ServiceStyle.Buffet]: 'Buffet',
};

export enum TableShape {
  Round = 1,
  Square = 2,
  Rectangle = 3,
  Oval = 4,
  Booth = 5,
  BarStool = 6,
  HighTop = 7,
  Sofa = 8,
}

export const TABLE_SHAPE_LABELS: Record<TableShape, string> = {
  [TableShape.Round]: 'Round',
  [TableShape.Square]: 'Square',
  [TableShape.Rectangle]: 'Rectangle',
  [TableShape.Oval]: 'Oval',
  [TableShape.Booth]: 'Booth',
  [TableShape.BarStool]: 'Bar stool',
  [TableShape.HighTop]: 'High top',
  [TableShape.Sofa]: 'Sofa',
};

export enum TableState {
  Free = 1,
  Reserved = 2,
  Seated = 3,
  Ordered = 4,
  Served = 5,
  BillPrinted = 6,
  Paid = 7,
  NeedsCleaning = 8,
  Blocked = 9,
}

export const TABLE_STATE_LABELS: Record<TableState, string> = {
  [TableState.Free]: 'Free',
  [TableState.Reserved]: 'Reserved',
  [TableState.Seated]: 'Seated',
  [TableState.Ordered]: 'Ordered',
  [TableState.Served]: 'Served',
  [TableState.BillPrinted]: 'Bill printed',
  [TableState.Paid]: 'Paid',
  [TableState.NeedsCleaning]: 'Needs cleaning',
  [TableState.Blocked]: 'Out of service',
};

/** CSS modifier suffix per state — the floor plan colours tiles from this. */
export const TABLE_STATE_CLASS: Record<TableState, string> = {
  [TableState.Free]: 'free',
  [TableState.Reserved]: 'reserved',
  [TableState.Seated]: 'seated',
  [TableState.Ordered]: 'ordered',
  [TableState.Served]: 'served',
  [TableState.BillPrinted]: 'billed',
  [TableState.Paid]: 'paid',
  [TableState.NeedsCleaning]: 'cleaning',
  [TableState.Blocked]: 'blocked',
};

export enum FloorFixtureKind {
  Wall = 1,
  Door = 2,
  Window = 3,
  BarCounter = 4,
  Plant = 5,
  Pillar = 6,
  Stairs = 7,
  KitchenPass = 8,
  Restroom = 9,
  Label = 10,
}

export const FIXTURE_LABELS: Record<FloorFixtureKind, string> = {
  [FloorFixtureKind.Wall]: 'Wall',
  [FloorFixtureKind.Door]: 'Door',
  [FloorFixtureKind.Window]: 'Window',
  [FloorFixtureKind.BarCounter]: 'Bar counter',
  [FloorFixtureKind.Plant]: 'Plant',
  [FloorFixtureKind.Pillar]: 'Pillar',
  [FloorFixtureKind.Stairs]: 'Stairs',
  [FloorFixtureKind.KitchenPass]: 'Kitchen pass',
  [FloorFixtureKind.Restroom]: 'Restroom',
  [FloorFixtureKind.Label]: 'Label',
};

export enum OrderType {
  DineIn = 1,
  Takeaway = 2,
  Delivery = 3,
  DriveThru = 4,
  Curbside = 5,
  RoomService = 6,
  BarTab = 7,
  Counter = 8,
}

export const ORDER_TYPE_LABELS: Record<OrderType, string> = {
  [OrderType.DineIn]: 'Dine in',
  [OrderType.Takeaway]: 'Takeaway',
  [OrderType.Delivery]: 'Delivery',
  [OrderType.DriveThru]: 'Drive-thru',
  [OrderType.Curbside]: 'Curbside',
  [OrderType.RoomService]: 'Room service',
  [OrderType.BarTab]: 'Bar tab',
  [OrderType.Counter]: 'Counter',
};

export const ORDER_TYPE_ICONS: Record<OrderType, string> = {
  [OrderType.DineIn]: 'restaurant',
  [OrderType.Takeaway]: 'takeout_dining',
  [OrderType.Delivery]: 'delivery_dining',
  [OrderType.DriveThru]: 'directions_car',
  [OrderType.Curbside]: 'local_parking',
  [OrderType.RoomService]: 'hotel',
  [OrderType.BarTab]: 'local_bar',
  [OrderType.Counter]: 'point_of_sale',
};

export enum OrderChannel {
  InHouse = 1,
  Phone = 2,
  Online = 3,
  QrSelfOrder = 4,
  Aggregator = 5,
  Kiosk = 6,
}

export const ORDER_CHANNEL_LABELS: Record<OrderChannel, string> = {
  [OrderChannel.InHouse]: 'In house',
  [OrderChannel.Phone]: 'Phone',
  [OrderChannel.Online]: 'Online',
  [OrderChannel.QrSelfOrder]: 'QR self-order',
  [OrderChannel.Aggregator]: 'Marketplace',
  [OrderChannel.Kiosk]: 'Kiosk',
};

export enum RestaurantOrderStatus {
  Draft = 1,
  Open = 2,
  Fired = 3,
  PartiallyServed = 4,
  Served = 5,
  Billed = 6,
  Paid = 7,
  Closed = 8,
  Cancelled = 9,
}

export const ORDER_STATUS_LABELS: Record<RestaurantOrderStatus, string> = {
  [RestaurantOrderStatus.Draft]: 'Draft',
  [RestaurantOrderStatus.Open]: 'Open',
  [RestaurantOrderStatus.Fired]: 'In kitchen',
  [RestaurantOrderStatus.PartiallyServed]: 'Part served',
  [RestaurantOrderStatus.Served]: 'Served',
  [RestaurantOrderStatus.Billed]: 'Billed',
  [RestaurantOrderStatus.Paid]: 'Paid',
  [RestaurantOrderStatus.Closed]: 'Closed',
  [RestaurantOrderStatus.Cancelled]: 'Cancelled',
};

export enum CourseType {
  None = 0,
  Appetizer = 1,
  Soup = 2,
  Salad = 3,
  Main = 4,
  Side = 5,
  Dessert = 6,
  Beverage = 7,
}

export const COURSE_LABELS: Record<CourseType, string> = {
  [CourseType.None]: 'No course',
  [CourseType.Appetizer]: 'Starter',
  [CourseType.Soup]: 'Soup',
  [CourseType.Salad]: 'Salad',
  [CourseType.Main]: 'Main',
  [CourseType.Side]: 'Side',
  [CourseType.Dessert]: 'Dessert',
  [CourseType.Beverage]: 'Drink',
};

/** Courses in the order a meal is actually served — used to order the coursing rail. */
export const COURSE_ORDER: CourseType[] = [
  CourseType.Beverage,
  CourseType.Appetizer,
  CourseType.Soup,
  CourseType.Salad,
  CourseType.Main,
  CourseType.Side,
  CourseType.Dessert,
];

export enum OrderLineStatus {
  New = 1,
  Held = 2,
  Fired = 3,
  Preparing = 4,
  Ready = 5,
  Served = 6,
  Voided = 7,
}

export const LINE_STATUS_LABELS: Record<OrderLineStatus, string> = {
  [OrderLineStatus.New]: 'New',
  [OrderLineStatus.Held]: 'Held',
  [OrderLineStatus.Fired]: 'Sent',
  [OrderLineStatus.Preparing]: 'Cooking',
  [OrderLineStatus.Ready]: 'Ready',
  [OrderLineStatus.Served]: 'Served',
  [OrderLineStatus.Voided]: 'Voided',
};

export enum KitchenTicketStatus {
  New = 1,
  Acknowledged = 2,
  InProgress = 3,
  Ready = 4,
  Bumped = 5,
  Recalled = 6,
  Cancelled = 7,
}

export const TICKET_STATUS_LABELS: Record<KitchenTicketStatus, string> = {
  [KitchenTicketStatus.New]: 'New',
  [KitchenTicketStatus.Acknowledged]: 'Seen',
  [KitchenTicketStatus.InProgress]: 'Cooking',
  [KitchenTicketStatus.Ready]: 'Ready',
  [KitchenTicketStatus.Bumped]: 'Served',
  [KitchenTicketStatus.Recalled]: 'Recalled',
  [KitchenTicketStatus.Cancelled]: 'Cancelled',
};

export enum StationType {
  Grill = 1,
  Fryer = 2,
  ColdStation = 3,
  PizzaOven = 4,
  Tandoor = 5,
  Wok = 6,
  Bar = 7,
  Barista = 8,
  Dessert = 9,
  Expo = 10,
  Prep = 11,
}

export const STATION_TYPE_LABELS: Record<StationType, string> = {
  [StationType.Grill]: 'Grill',
  [StationType.Fryer]: 'Fryer',
  [StationType.ColdStation]: 'Cold station',
  [StationType.PizzaOven]: 'Pizza oven',
  [StationType.Tandoor]: 'Tandoor',
  [StationType.Wok]: 'Wok',
  [StationType.Bar]: 'Bar',
  [StationType.Barista]: 'Barista',
  [StationType.Dessert]: 'Dessert',
  [StationType.Expo]: 'Pass / expo',
  [StationType.Prep]: 'Prep',
};

export enum RoutingMatchType {
  AllItems = 1,
  Category = 2,
  Item = 3,
  OrderType = 4,
}

export const ROUTING_MATCH_LABELS: Record<RoutingMatchType, string> = {
  [RoutingMatchType.AllItems]: 'Everything',
  [RoutingMatchType.Category]: 'By category',
  [RoutingMatchType.Item]: 'By dish',
  [RoutingMatchType.OrderType]: 'By order type',
};

export enum CheckStatus {
  Open = 1,
  Printed = 2,
  PartiallyPaid = 3,
  Paid = 4,
  Voided = 5,
  Refunded = 6,
}

export const CHECK_STATUS_LABELS: Record<CheckStatus, string> = {
  [CheckStatus.Open]: 'Open',
  [CheckStatus.Printed]: 'Printed',
  [CheckStatus.PartiallyPaid]: 'Part paid',
  [CheckStatus.Paid]: 'Paid',
  [CheckStatus.Voided]: 'Voided',
  [CheckStatus.Refunded]: 'Refunded',
};

export enum SplitMethod {
  None = 0,
  BySeat = 1,
  ByItem = 2,
  Evenly = 3,
  ByAmount = 4,
  ByPercentage = 5,
}

export const SPLIT_LABELS: Record<SplitMethod, string> = {
  [SplitMethod.None]: 'One bill',
  [SplitMethod.BySeat]: 'By seat',
  [SplitMethod.ByItem]: 'By item',
  [SplitMethod.Evenly]: 'Split evenly',
  [SplitMethod.ByAmount]: 'By amount',
  [SplitMethod.ByPercentage]: 'By percentage',
};

export enum TenderType {
  Cash = 1,
  Card = 2,
  Wallet = 3,
  GiftCard = 4,
  LoyaltyPoints = 5,
  RoomCharge = 6,
  HouseAccount = 7,
  Voucher = 8,
  BankTransfer = 9,
  Online = 10,
}

export const TENDER_LABELS: Record<TenderType, string> = {
  [TenderType.Cash]: 'Cash',
  [TenderType.Card]: 'Card',
  [TenderType.Wallet]: 'Wallet',
  [TenderType.GiftCard]: 'Gift card',
  [TenderType.LoyaltyPoints]: 'Points',
  [TenderType.RoomCharge]: 'Room charge',
  [TenderType.HouseAccount]: 'House account',
  [TenderType.Voucher]: 'Voucher',
  [TenderType.BankTransfer]: 'Bank transfer',
  [TenderType.Online]: 'Online',
};

export const TENDER_ICONS: Record<TenderType, string> = {
  [TenderType.Cash]: 'payments',
  [TenderType.Card]: 'credit_card',
  [TenderType.Wallet]: 'account_balance_wallet',
  [TenderType.GiftCard]: 'card_giftcard',
  [TenderType.LoyaltyPoints]: 'loyalty',
  [TenderType.RoomCharge]: 'hotel',
  [TenderType.HouseAccount]: 'receipt_long',
  [TenderType.Voucher]: 'confirmation_number',
  [TenderType.BankTransfer]: 'account_balance',
  [TenderType.Online]: 'language',
};

export enum DiscountKind {
  Percentage = 1,
  Amount = 2,
  Comp = 3,
}

export const DISCOUNT_KIND_LABELS: Record<DiscountKind, string> = {
  [DiscountKind.Percentage]: 'Percentage',
  [DiscountKind.Amount]: 'Amount',
  [DiscountKind.Comp]: 'Comp (free)',
};

export enum ServiceChargeBasis {
  Percentage = 1,
  FixedAmount = 2,
  PerCover = 3,
}

export const SERVICE_CHARGE_BASIS_LABELS: Record<ServiceChargeBasis, string> = {
  [ServiceChargeBasis.Percentage]: 'Percentage of the bill',
  [ServiceChargeBasis.FixedAmount]: 'Fixed amount',
  [ServiceChargeBasis.PerCover]: 'Per guest',
};

export enum TipDistributionBasis {
  ByHoursWorked = 1,
  BySales = 2,
  EqualShare = 3,
  FixedPercentage = 4,
}

export const TIP_BASIS_LABELS: Record<TipDistributionBasis, string> = {
  [TipDistributionBasis.ByHoursWorked]: 'By hours worked',
  [TipDistributionBasis.BySales]: 'By sales',
  [TipDistributionBasis.EqualShare]: 'Equal share',
  [TipDistributionBasis.FixedPercentage]: 'Fixed percentage',
};

export enum MenuDaypart {
  AllDay = 0,
  Breakfast = 1,
  Brunch = 2,
  Lunch = 3,
  HighTea = 4,
  Dinner = 5,
  LateNight = 6,
}

export const DAYPART_LABELS: Record<MenuDaypart, string> = {
  [MenuDaypart.AllDay]: 'All day',
  [MenuDaypart.Breakfast]: 'Breakfast',
  [MenuDaypart.Brunch]: 'Brunch',
  [MenuDaypart.Lunch]: 'Lunch',
  [MenuDaypart.HighTea]: 'High tea',
  [MenuDaypart.Dinner]: 'Dinner',
  [MenuDaypart.LateNight]: 'Late night',
};

export enum ModifierSelectionMode {
  Single = 1,
  Multiple = 2,
}

export enum ComboComponentMode {
  Fixed = 1,
  ChooseOne = 2,
  ChooseMany = 3,
}

export const COMBO_MODE_LABELS: Record<ComboComponentMode, string> = {
  [ComboComponentMode.Fixed]: 'Always included',
  [ComboComponentMode.ChooseOne]: 'Choose one',
  [ComboComponentMode.ChooseMany]: 'Choose several',
};

export enum PriceScope {
  Base = 0,
  DineIn = 1,
  Takeaway = 2,
  Delivery = 3,
  DriveThru = 4,
  Online = 5,
}

export const PRICE_SCOPE_LABELS: Record<PriceScope, string> = {
  [PriceScope.Base]: 'Base price',
  [PriceScope.DineIn]: 'Dine in',
  [PriceScope.Takeaway]: 'Takeaway',
  [PriceScope.Delivery]: 'Delivery',
  [PriceScope.DriveThru]: 'Drive-thru',
  [PriceScope.Online]: 'Online',
};

export enum SpiceLevel {
  None = 0,
  Mild = 1,
  Medium = 2,
  Hot = 3,
  ExtraHot = 4,
}

export const SPICE_LABELS: Record<SpiceLevel, string> = {
  [SpiceLevel.None]: 'Not spicy',
  [SpiceLevel.Mild]: 'Mild',
  [SpiceLevel.Medium]: 'Medium',
  [SpiceLevel.Hot]: 'Hot',
  [SpiceLevel.ExtraHot]: 'Extra hot',
};

export enum MenuEngineeringClass {
  Star = 1,
  Plowhorse = 2,
  Puzzle = 3,
  Dog = 4,
}

export const MENU_CLASS_LABELS: Record<MenuEngineeringClass, string> = {
  [MenuEngineeringClass.Star]: 'Star',
  [MenuEngineeringClass.Plowhorse]: 'Plowhorse',
  [MenuEngineeringClass.Puzzle]: 'Puzzle',
  [MenuEngineeringClass.Dog]: 'Dog',
};

export enum ReservationStatus {
  Requested = 1,
  Confirmed = 2,
  Seated = 3,
  Completed = 4,
  Cancelled = 5,
  NoShow = 6,
}

export const RESERVATION_STATUS_LABELS: Record<ReservationStatus, string> = {
  [ReservationStatus.Requested]: 'Requested',
  [ReservationStatus.Confirmed]: 'Confirmed',
  [ReservationStatus.Seated]: 'Seated',
  [ReservationStatus.Completed]: 'Completed',
  [ReservationStatus.Cancelled]: 'Cancelled',
  [ReservationStatus.NoShow]: 'No show',
};

export enum WaitlistStatus {
  Waiting = 1,
  Notified = 2,
  Seated = 3,
  Left = 4,
  Cancelled = 5,
}

export const WAITLIST_STATUS_LABELS: Record<WaitlistStatus, string> = {
  [WaitlistStatus.Waiting]: 'Waiting',
  [WaitlistStatus.Notified]: 'Called',
  [WaitlistStatus.Seated]: 'Seated',
  [WaitlistStatus.Left]: 'Left',
  [WaitlistStatus.Cancelled]: 'Cancelled',
};

export enum DeliveryStatus {
  Pending = 1,
  Assigned = 2,
  PickedUp = 3,
  EnRoute = 4,
  Delivered = 5,
  Failed = 6,
  Cancelled = 7,
}

export const DELIVERY_STATUS_LABELS: Record<DeliveryStatus, string> = {
  [DeliveryStatus.Pending]: 'Pending',
  [DeliveryStatus.Assigned]: 'Assigned',
  [DeliveryStatus.PickedUp]: 'Picked up',
  [DeliveryStatus.EnRoute]: 'On the way',
  [DeliveryStatus.Delivered]: 'Delivered',
  [DeliveryStatus.Failed]: 'Failed',
  [DeliveryStatus.Cancelled]: 'Cancelled',
};

export enum StaffRole {
  Waiter = 1,
  Host = 2,
  Bartender = 3,
  Barista = 4,
  Chef = 5,
  LineCook = 6,
  KitchenPorter = 7,
  Cashier = 8,
  Supervisor = 9,
  Manager = 10,
}

export const STAFF_ROLE_LABELS: Record<StaffRole, string> = {
  [StaffRole.Waiter]: 'Waiter',
  [StaffRole.Host]: 'Host',
  [StaffRole.Bartender]: 'Bartender',
  [StaffRole.Barista]: 'Barista',
  [StaffRole.Chef]: 'Chef',
  [StaffRole.LineCook]: 'Line cook',
  [StaffRole.KitchenPorter]: 'Kitchen porter',
  [StaffRole.Cashier]: 'Cashier',
  [StaffRole.Supervisor]: 'Supervisor',
  [StaffRole.Manager]: 'Manager',
};

export enum ShiftStatus {
  Scheduled = 1,
  Started = 2,
  OnBreak = 3,
  Ended = 4,
  Absent = 5,
}

export const SHIFT_STATUS_LABELS: Record<ShiftStatus, string> = {
  [ShiftStatus.Scheduled]: 'Scheduled',
  [ShiftStatus.Started]: 'On shift',
  [ShiftStatus.OnBreak]: 'On break',
  [ShiftStatus.Ended]: 'Finished',
  [ShiftStatus.Absent]: 'Absent',
};

export enum SessionStatus {
  Open = 1,
  Closed = 2,
  Suspended = 3,
}

export const SESSION_STATUS_LABELS: Record<SessionStatus, string> = {
  [SessionStatus.Open]: 'Open',
  [SessionStatus.Closed]: 'Closed',
  [SessionStatus.Suspended]: 'Suspended',
};

export enum CashMovementType {
  OpeningFloat = 1,
  CashIn = 2,
  CashOut = 3,
  Drop = 4,
  Payout = 5,
  ClosingCount = 6,
}

export const CASH_MOVEMENT_LABELS: Record<CashMovementType, string> = {
  [CashMovementType.OpeningFloat]: 'Opening float',
  [CashMovementType.CashIn]: 'Cash in',
  [CashMovementType.CashOut]: 'Cash out',
  [CashMovementType.Drop]: 'Safe drop',
  [CashMovementType.Payout]: 'Payout',
  [CashMovementType.ClosingCount]: 'Closing count',
};

export enum WastageReason {
  Spoilage = 1,
  Burnt = 2,
  Dropped = 3,
  OverPortioned = 4,
  GuestReturn = 5,
  StaffMeal = 6,
  Expired = 7,
  Training = 8,
  Other = 99,
}

export const WASTAGE_REASON_LABELS: Record<WastageReason, string> = {
  [WastageReason.Spoilage]: 'Spoilage',
  [WastageReason.Burnt]: 'Burnt',
  [WastageReason.Dropped]: 'Dropped',
  [WastageReason.OverPortioned]: 'Over-portioned',
  [WastageReason.GuestReturn]: 'Sent back',
  [WastageReason.StaffMeal]: 'Staff meal',
  [WastageReason.Expired]: 'Expired',
  [WastageReason.Training]: 'Training',
  [WastageReason.Other]: 'Other',
};

/** Builds `[{value,label}]` for a select, from an enum and its label map. */
export function enumOptions<T extends number>(
  labels: Record<T, string>,
): { value: T; label: string }[] {
  return (Object.keys(labels) as unknown as string[])
    .map(k => Number(k) as T)
    .filter(v => !Number.isNaN(v))
    .map(v => ({ value: v, label: labels[v] }));
}
