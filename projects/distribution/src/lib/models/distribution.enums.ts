/**
 * The Distribution vocabulary, mirroring `Distribution.Domain.Enums`.
 *
 * Numeric values must match the server exactly — they travel over the wire as integers. The
 * label and icon maps beside each enum are the single place a display string is decided, so a
 * status reads the same on the dashboard, the list and the detail drawer.
 */

// ── Network & channel ────────────────────────────────────────────────────────

export enum PartnerType {
  Distributor = 1,
  SubDistributor = 2,
  SuperStockist = 3,
  Wholesaler = 4,
  CarryAndForward = 5,
  DirectRetailer = 6,
  ModernTradeAccount = 7,
  Institutional = 8,
  ExportBuyer = 9,
  Franchisee = 10,
}

export const PARTNER_TYPE_LABELS: Record<number, string> = {
  [PartnerType.Distributor]: 'Distributor',
  [PartnerType.SubDistributor]: 'Sub-distributor',
  [PartnerType.SuperStockist]: 'Super stockist',
  [PartnerType.Wholesaler]: 'Wholesaler',
  [PartnerType.CarryAndForward]: 'C&F agent',
  [PartnerType.DirectRetailer]: 'Direct retailer',
  [PartnerType.ModernTradeAccount]: 'Modern trade',
  [PartnerType.Institutional]: 'Institutional',
  [PartnerType.ExportBuyer]: 'Export buyer',
  [PartnerType.Franchisee]: 'Franchisee',
};

export enum ServicingModel {
  VanSales = 1,
  PreSalesAndDelivery = 2,
  DirectDispatch = 3,
  CrossDock = 4,
  DropShip = 5,
  Consignment = 6,
}

export const SERVICING_MODEL_LABELS: Record<number, string> = {
  [ServicingModel.VanSales]: 'Van sales',
  [ServicingModel.PreSalesAndDelivery]: 'Pre-sales & delivery',
  [ServicingModel.DirectDispatch]: 'Direct dispatch',
  [ServicingModel.CrossDock]: 'Cross-dock',
  [ServicingModel.DropShip]: 'Drop-ship',
  [ServicingModel.Consignment]: 'Consignment',
};

export enum PartnerStatus {
  Lead = 1,
  KycSubmitted = 2,
  DocumentsVerified = 3,
  Approved = 4,
  Active = 5,
  Suspended = 6,
  Terminated = 7,
}

export const PARTNER_STATUS_LABELS: Record<number, string> = {
  [PartnerStatus.Lead]: 'Lead',
  [PartnerStatus.KycSubmitted]: 'KYC submitted',
  [PartnerStatus.DocumentsVerified]: 'Documents verified',
  [PartnerStatus.Approved]: 'Approved',
  [PartnerStatus.Active]: 'Active',
  [PartnerStatus.Suspended]: 'Suspended',
  [PartnerStatus.Terminated]: 'Terminated',
};

/** Tone drives the chip colour. Never colour alone — every chip also carries its text. */
export const PARTNER_STATUS_TONE: Record<number, string> = {
  [PartnerStatus.Lead]: 'neutral',
  [PartnerStatus.KycSubmitted]: 'info',
  [PartnerStatus.DocumentsVerified]: 'info',
  [PartnerStatus.Approved]: 'good',
  [PartnerStatus.Active]: 'good',
  [PartnerStatus.Suspended]: 'warn',
  [PartnerStatus.Terminated]: 'bad',
};

export enum OutletChannel {
  GeneralTrade = 1,
  ModernTrade = 2,
  HoReCa = 3,
  Institutional = 4,
  ECommerceDarkStore = 5,
  Pharmacy = 6,
  Chemist = 7,
  Wholesale = 8,
  KioskPanShop = 9,
}

export const OUTLET_CHANNEL_LABELS: Record<number, string> = {
  [OutletChannel.GeneralTrade]: 'General trade',
  [OutletChannel.ModernTrade]: 'Modern trade',
  [OutletChannel.HoReCa]: 'HoReCa',
  [OutletChannel.Institutional]: 'Institutional',
  [OutletChannel.ECommerceDarkStore]: 'Dark store',
  [OutletChannel.Pharmacy]: 'Pharmacy',
  [OutletChannel.Chemist]: 'Chemist',
  [OutletChannel.Wholesale]: 'Wholesale',
  [OutletChannel.KioskPanShop]: 'Kiosk',
};

export const OUTLET_CHANNEL_ICONS: Record<number, string> = {
  [OutletChannel.GeneralTrade]: 'storefront',
  [OutletChannel.ModernTrade]: 'shopping_cart',
  [OutletChannel.HoReCa]: 'restaurant',
  [OutletChannel.Institutional]: 'apartment',
  [OutletChannel.ECommerceDarkStore]: 'warehouse',
  [OutletChannel.Pharmacy]: 'local_pharmacy',
  [OutletChannel.Chemist]: 'medication',
  [OutletChannel.Wholesale]: 'inventory_2',
  [OutletChannel.KioskPanShop]: 'store',
};

export enum OutletGrade { A = 1, B = 2, C = 3, D = 4 }

export const OUTLET_GRADE_LABELS: Record<number, string> = {
  [OutletGrade.A]: 'A', [OutletGrade.B]: 'B', [OutletGrade.C]: 'C', [OutletGrade.D]: 'D',
};

export enum OutletStatus {
  PendingApproval = 1,
  Prospect = 2,
  Active = 3,
  TemporarilyClosed = 4,
  PermanentlyClosed = 5,
  CreditBlocked = 6,
  Blacklisted = 7,
}

export const OUTLET_STATUS_LABELS: Record<number, string> = {
  [OutletStatus.PendingApproval]: 'Pending approval',
  [OutletStatus.Prospect]: 'Prospect',
  [OutletStatus.Active]: 'Active',
  [OutletStatus.TemporarilyClosed]: 'Temporarily closed',
  [OutletStatus.PermanentlyClosed]: 'Permanently closed',
  [OutletStatus.CreditBlocked]: 'Credit blocked',
  [OutletStatus.Blacklisted]: 'Blacklisted',
};

export const OUTLET_STATUS_TONE: Record<number, string> = {
  [OutletStatus.PendingApproval]: 'warn',
  [OutletStatus.Prospect]: 'info',
  [OutletStatus.Active]: 'good',
  [OutletStatus.TemporarilyClosed]: 'neutral',
  [OutletStatus.PermanentlyClosed]: 'neutral',
  [OutletStatus.CreditBlocked]: 'bad',
  [OutletStatus.Blacklisted]: 'bad',
};

export enum OutletAssetKind {
  Cooler = 1, Freezer = 2, DisplayRack = 3, Signage = 4,
  VisiCooler = 5, Dispenser = 6, Shelf = 7, Other = 99,
}

export const ASSET_KIND_LABELS: Record<number, string> = {
  [OutletAssetKind.Cooler]: 'Cooler',
  [OutletAssetKind.Freezer]: 'Freezer',
  [OutletAssetKind.DisplayRack]: 'Display rack',
  [OutletAssetKind.Signage]: 'Signage',
  [OutletAssetKind.VisiCooler]: 'Visi-cooler',
  [OutletAssetKind.Dispenser]: 'Dispenser',
  [OutletAssetKind.Shelf]: 'Shelf',
  [OutletAssetKind.Other]: 'Other',
};

export enum AssetCondition {
  Working = 1, NeedsService = 2, Faulty = 3, Missing = 4, Retrieved = 5,
}

export const ASSET_CONDITION_LABELS: Record<number, string> = {
  [AssetCondition.Working]: 'Working',
  [AssetCondition.NeedsService]: 'Needs service',
  [AssetCondition.Faulty]: 'Faulty',
  [AssetCondition.Missing]: 'Missing',
  [AssetCondition.Retrieved]: 'Retrieved',
};

export const ASSET_CONDITION_TONE: Record<number, string> = {
  [AssetCondition.Working]: 'good',
  [AssetCondition.NeedsService]: 'warn',
  [AssetCondition.Faulty]: 'bad',
  [AssetCondition.Missing]: 'bad',
  [AssetCondition.Retrieved]: 'neutral',
};

// ── Routes & journey planning ────────────────────────────────────────────────

export enum RouteKind {
  VanSales = 1, PreSales = 2, Delivery = 3, Merchandiser = 4, CollectionOnly = 5,
}

export const ROUTE_KIND_LABELS: Record<number, string> = {
  [RouteKind.VanSales]: 'Van sales',
  [RouteKind.PreSales]: 'Pre-sales',
  [RouteKind.Delivery]: 'Delivery',
  [RouteKind.Merchandiser]: 'Merchandiser',
  [RouteKind.CollectionOnly]: 'Collection only',
};

export const ROUTE_KIND_ICONS: Record<number, string> = {
  [RouteKind.VanSales]: 'local_shipping',
  [RouteKind.PreSales]: 'assignment',
  [RouteKind.Delivery]: 'package_2',
  [RouteKind.Merchandiser]: 'shelves',
  [RouteKind.CollectionOnly]: 'payments',
};

export enum VisitFrequency {
  Daily = 1, AlternateDay = 2, Weekly = 3, Fortnightly = 4, Monthly = 5, Custom = 6,
}

export const FREQUENCY_LABELS: Record<number, string> = {
  [VisitFrequency.Daily]: 'Daily',
  [VisitFrequency.AlternateDay]: 'Alternate day',
  [VisitFrequency.Weekly]: 'Weekly',
  [VisitFrequency.Fortnightly]: 'Fortnightly',
  [VisitFrequency.Monthly]: 'Monthly',
  [VisitFrequency.Custom]: 'Custom',
};

export enum JourneyPlanDayStatus {
  Planned = 1, InProgress = 2, Completed = 3, Skipped = 4, Reassigned = 5,
}

export const PLAN_DAY_LABELS: Record<number, string> = {
  [JourneyPlanDayStatus.Planned]: 'Planned',
  [JourneyPlanDayStatus.InProgress]: 'In progress',
  [JourneyPlanDayStatus.Completed]: 'Completed',
  [JourneyPlanDayStatus.Skipped]: 'Skipped',
  [JourneyPlanDayStatus.Reassigned]: 'Reassigned',
};

// ── Field force ──────────────────────────────────────────────────────────────

export enum FieldRole {
  SalesRep = 1, VanSalesman = 2, DeliveryDriver = 3, Merchandiser = 4,
  TeamLeader = 5, AreaSalesManager = 6, RegionalManager = 7,
}

export const FIELD_ROLE_LABELS: Record<number, string> = {
  [FieldRole.SalesRep]: 'Sales rep',
  [FieldRole.VanSalesman]: 'Van salesman',
  [FieldRole.DeliveryDriver]: 'Delivery driver',
  [FieldRole.Merchandiser]: 'Merchandiser',
  [FieldRole.TeamLeader]: 'Team leader',
  [FieldRole.AreaSalesManager]: 'Area sales manager',
  [FieldRole.RegionalManager]: 'Regional manager',
};

export enum FieldDayStatus { NotStarted = 1, Started = 2, Closed = 3, ForceClosed = 4 }

export const DAY_STATUS_LABELS: Record<number, string> = {
  [FieldDayStatus.NotStarted]: 'Not started',
  [FieldDayStatus.Started]: 'In the market',
  [FieldDayStatus.Closed]: 'Closed',
  [FieldDayStatus.ForceClosed]: 'Force-closed',
};

export const DAY_STATUS_TONE: Record<number, string> = {
  [FieldDayStatus.NotStarted]: 'neutral',
  [FieldDayStatus.Started]: 'good',
  [FieldDayStatus.Closed]: 'info',
  [FieldDayStatus.ForceClosed]: 'warn',
};

export enum VisitStatus {
  Pending = 1, CheckedIn = 2, InProgress = 3, OrderTaken = 4,
  NoOrder = 5, CheckedOut = 6, Skipped = 7,
}

export const VISIT_STATUS_LABELS: Record<number, string> = {
  [VisitStatus.Pending]: 'Pending',
  [VisitStatus.CheckedIn]: 'Checked in',
  [VisitStatus.InProgress]: 'In progress',
  [VisitStatus.OrderTaken]: 'Order taken',
  [VisitStatus.NoOrder]: 'No order',
  [VisitStatus.CheckedOut]: 'Done',
  [VisitStatus.Skipped]: 'Skipped',
};

export const VISIT_STATUS_TONE: Record<number, string> = {
  [VisitStatus.Pending]: 'neutral',
  [VisitStatus.CheckedIn]: 'info',
  [VisitStatus.InProgress]: 'info',
  [VisitStatus.OrderTaken]: 'good',
  [VisitStatus.NoOrder]: 'warn',
  [VisitStatus.CheckedOut]: 'good',
  [VisitStatus.Skipped]: 'neutral',
};

export enum GeoValidation {
  InsideFence = 1, OutsideFence = 2, NoFix = 3, NoOutletGeo = 4,
}

export const GEO_LABELS: Record<number, string> = {
  [GeoValidation.InsideFence]: 'At the outlet',
  [GeoValidation.OutsideFence]: 'Outside geofence',
  [GeoValidation.NoFix]: 'No location fix',
  [GeoValidation.NoOutletGeo]: 'Outlet has no coordinates',
};

export enum SurveyQuestionKind {
  SingleChoice = 1, MultiChoice = 2, Numeric = 3, Text = 4,
  Photo = 5, Signature = 6, Rating = 7, YesNo = 8, Date = 9,
}

export const QUESTION_KIND_LABELS: Record<number, string> = {
  [SurveyQuestionKind.SingleChoice]: 'Single choice',
  [SurveyQuestionKind.MultiChoice]: 'Multiple choice',
  [SurveyQuestionKind.Numeric]: 'Number',
  [SurveyQuestionKind.Text]: 'Text',
  [SurveyQuestionKind.Photo]: 'Photo',
  [SurveyQuestionKind.Signature]: 'Signature',
  [SurveyQuestionKind.Rating]: 'Rating',
  [SurveyQuestionKind.YesNo]: 'Yes / No',
  [SurveyQuestionKind.Date]: 'Date',
};

export enum AuditKind {
  Planogram = 1, ShareOfShelf = 2, OnShelfAvailability = 3,
  PriceCompliance = 4, PosmPresence = 5, PerfectStore = 6,
}

export const AUDIT_KIND_LABELS: Record<number, string> = {
  [AuditKind.Planogram]: 'Planogram',
  [AuditKind.ShareOfShelf]: 'Share of shelf',
  [AuditKind.OnShelfAvailability]: 'On-shelf availability',
  [AuditKind.PriceCompliance]: 'Price compliance',
  [AuditKind.PosmPresence]: 'POSM presence',
  [AuditKind.PerfectStore]: 'Perfect store',
};

// ── Van sales ────────────────────────────────────────────────────────────────

export enum VanLoadStatus {
  Draft = 1, Requested = 2, Approved = 3, Picked = 4, Loaded = 5, Rejected = 6, Cancelled = 7,
}

export const LOAD_STATUS_LABELS: Record<number, string> = {
  [VanLoadStatus.Draft]: 'Draft',
  [VanLoadStatus.Requested]: 'Requested',
  [VanLoadStatus.Approved]: 'Approved',
  [VanLoadStatus.Picked]: 'Picked',
  [VanLoadStatus.Loaded]: 'Loaded',
  [VanLoadStatus.Rejected]: 'Rejected',
  [VanLoadStatus.Cancelled]: 'Cancelled',
};

export const LOAD_STATUS_TONE: Record<number, string> = {
  [VanLoadStatus.Draft]: 'neutral',
  [VanLoadStatus.Requested]: 'info',
  [VanLoadStatus.Approved]: 'info',
  [VanLoadStatus.Picked]: 'info',
  [VanLoadStatus.Loaded]: 'good',
  [VanLoadStatus.Rejected]: 'bad',
  [VanLoadStatus.Cancelled]: 'neutral',
};

export enum VanCompartment {
  Sellable = 1, SaleableReturn = 2, Damaged = 3, Expired = 4, Posm = 5, FreeIssue = 6,
}

export const COMPARTMENT_LABELS: Record<number, string> = {
  [VanCompartment.Sellable]: 'Sellable',
  [VanCompartment.SaleableReturn]: 'Saleable return',
  [VanCompartment.Damaged]: 'Damaged',
  [VanCompartment.Expired]: 'Expired',
  [VanCompartment.Posm]: 'POSM',
  [VanCompartment.FreeIssue]: 'Free issue',
};

export const COMPARTMENT_TONE: Record<number, string> = {
  [VanCompartment.Sellable]: 'good',
  [VanCompartment.SaleableReturn]: 'info',
  [VanCompartment.Damaged]: 'warn',
  [VanCompartment.Expired]: 'bad',
  [VanCompartment.Posm]: 'neutral',
  [VanCompartment.FreeIssue]: 'neutral',
};

export enum VanMovementKind {
  LoadOut = 1, Sale = 2, FreeIssue = 3, CustomerReturn = 4,
  TransferIn = 5, TransferOut = 6, LoadIn = 7, CountAdjustment = 8, Damage = 9,
}

export const MOVEMENT_LABELS: Record<number, string> = {
  [VanMovementKind.LoadOut]: 'Loaded out',
  [VanMovementKind.Sale]: 'Sale',
  [VanMovementKind.FreeIssue]: 'Free issue',
  [VanMovementKind.CustomerReturn]: 'Customer return',
  [VanMovementKind.TransferIn]: 'Transfer in',
  [VanMovementKind.TransferOut]: 'Transfer out',
  [VanMovementKind.LoadIn]: 'Loaded in',
  [VanMovementKind.CountAdjustment]: 'Count adjustment',
  [VanMovementKind.Damage]: 'Damage',
};

// ── Orders & fulfilment ──────────────────────────────────────────────────────

export enum OrderSource {
  FieldTerminal = 1, VanSale = 2, Telesales = 3,
  DistributorPortal = 4, BackOffice = 5, ApiInbound = 6, Marketplace = 7,
}

export const ORDER_SOURCE_LABELS: Record<number, string> = {
  [OrderSource.FieldTerminal]: 'Field terminal',
  [OrderSource.VanSale]: 'Van sale',
  [OrderSource.Telesales]: 'Telesales',
  [OrderSource.DistributorPortal]: 'Distributor portal',
  [OrderSource.BackOffice]: 'Back office',
  [OrderSource.ApiInbound]: 'API',
  [OrderSource.Marketplace]: 'Marketplace',
};

export enum DistributionOrderKind {
  Standard = 1, Urgent = 2, SchemeDriven = 3, Sample = 4,
  FreeIssue = 5, Replacement = 6, ConsignmentFill = 7, DropShip = 8,
}

export const ORDER_KIND_LABELS: Record<number, string> = {
  [DistributionOrderKind.Standard]: 'Standard',
  [DistributionOrderKind.Urgent]: 'Urgent',
  [DistributionOrderKind.SchemeDriven]: 'Scheme-driven',
  [DistributionOrderKind.Sample]: 'Sample',
  [DistributionOrderKind.FreeIssue]: 'Free issue',
  [DistributionOrderKind.Replacement]: 'Replacement',
  [DistributionOrderKind.ConsignmentFill]: 'Consignment fill',
  [DistributionOrderKind.DropShip]: 'Drop-ship',
};

export enum DistributionOrderStatus {
  Draft = 1, Submitted = 2, PendingApproval = 3, Approved = 4, Allocated = 5,
  Picking = 6, Picked = 7, Packed = 8, Loaded = 9, Dispatched = 10,
  PartiallyDelivered = 11, Delivered = 12, Invoiced = 13, Closed = 14,
  OnHold = 15, Rejected = 16, Cancelled = 17,
}

export const ORDER_STATUS_LABELS: Record<number, string> = {
  [DistributionOrderStatus.Draft]: 'Draft',
  [DistributionOrderStatus.Submitted]: 'Submitted',
  [DistributionOrderStatus.PendingApproval]: 'Awaiting approval',
  [DistributionOrderStatus.Approved]: 'Approved',
  [DistributionOrderStatus.Allocated]: 'Allocated',
  [DistributionOrderStatus.Picking]: 'Picking',
  [DistributionOrderStatus.Picked]: 'Picked',
  [DistributionOrderStatus.Packed]: 'Packed',
  [DistributionOrderStatus.Loaded]: 'Loaded',
  [DistributionOrderStatus.Dispatched]: 'Dispatched',
  [DistributionOrderStatus.PartiallyDelivered]: 'Partly delivered',
  [DistributionOrderStatus.Delivered]: 'Delivered',
  [DistributionOrderStatus.Invoiced]: 'Invoiced',
  [DistributionOrderStatus.Closed]: 'Closed',
  [DistributionOrderStatus.OnHold]: 'On hold',
  [DistributionOrderStatus.Rejected]: 'Rejected',
  [DistributionOrderStatus.Cancelled]: 'Cancelled',
};

export const ORDER_STATUS_TONE: Record<number, string> = {
  [DistributionOrderStatus.Draft]: 'neutral',
  [DistributionOrderStatus.Submitted]: 'info',
  [DistributionOrderStatus.PendingApproval]: 'warn',
  [DistributionOrderStatus.Approved]: 'info',
  [DistributionOrderStatus.Allocated]: 'info',
  [DistributionOrderStatus.Picking]: 'info',
  [DistributionOrderStatus.Picked]: 'info',
  [DistributionOrderStatus.Packed]: 'info',
  [DistributionOrderStatus.Loaded]: 'info',
  [DistributionOrderStatus.Dispatched]: 'good',
  [DistributionOrderStatus.PartiallyDelivered]: 'warn',
  [DistributionOrderStatus.Delivered]: 'good',
  [DistributionOrderStatus.Invoiced]: 'good',
  [DistributionOrderStatus.Closed]: 'neutral',
  [DistributionOrderStatus.OnHold]: 'warn',
  [DistributionOrderStatus.Rejected]: 'bad',
  [DistributionOrderStatus.Cancelled]: 'bad',
};

export enum AllocationStrategy {
  Fefo = 1, Fifo = 2, BatchSpecific = 3, WarehousePriority = 4, CustomerReserved = 5,
}

export const ALLOCATION_LABELS: Record<number, string> = {
  [AllocationStrategy.Fefo]: 'FEFO — first expired, first out',
  [AllocationStrategy.Fifo]: 'FIFO',
  [AllocationStrategy.BatchSpecific]: 'Batch specific',
  [AllocationStrategy.WarehousePriority]: 'Warehouse priority',
  [AllocationStrategy.CustomerReserved]: 'Customer reserved',
};

export enum PickStrategy { Discrete = 1, Batch = 2, Zone = 3, Cluster = 4, Wave = 5 }

export const PICK_STRATEGY_LABELS: Record<number, string> = {
  [PickStrategy.Discrete]: 'Discrete — one order at a time',
  [PickStrategy.Batch]: 'Batch — many orders, one pass',
  [PickStrategy.Zone]: 'Zone — a picker per aisle range',
  [PickStrategy.Cluster]: 'Cluster — multi-order trolley',
  [PickStrategy.Wave]: 'Wave — released against a cut-off',
};

export enum PickTaskStatus {
  Released = 1, Assigned = 2, InProgress = 3, Picked = 4, ShortPicked = 5, Cancelled = 6,
}

export const PICK_STATUS_LABELS: Record<number, string> = {
  [PickTaskStatus.Released]: 'Released',
  [PickTaskStatus.Assigned]: 'Assigned',
  [PickTaskStatus.InProgress]: 'Picking',
  [PickTaskStatus.Picked]: 'Picked',
  [PickTaskStatus.ShortPicked]: 'Short picked',
  [PickTaskStatus.Cancelled]: 'Cancelled',
};

export const PICK_STATUS_TONE: Record<number, string> = {
  [PickTaskStatus.Released]: 'neutral',
  [PickTaskStatus.Assigned]: 'info',
  [PickTaskStatus.InProgress]: 'info',
  [PickTaskStatus.Picked]: 'good',
  [PickTaskStatus.ShortPicked]: 'warn',
  [PickTaskStatus.Cancelled]: 'bad',
};

export enum PackageKind { Carton = 1, Pallet = 2, Crate = 3, Bag = 4, Loose = 5 }

export const PACKAGE_KIND_LABELS: Record<number, string> = {
  [PackageKind.Carton]: 'Carton', [PackageKind.Pallet]: 'Pallet',
  [PackageKind.Crate]: 'Crate', [PackageKind.Bag]: 'Bag', [PackageKind.Loose]: 'Loose',
};

// ── Logistics ────────────────────────────────────────────────────────────────

export enum VehicleKind { Van = 1, Truck = 2, ThreeWheeler = 3, Motorcycle = 4, Reefer = 5, Pickup = 6 }

export const VEHICLE_KIND_LABELS: Record<number, string> = {
  [VehicleKind.Van]: 'Van', [VehicleKind.Truck]: 'Truck',
  [VehicleKind.ThreeWheeler]: 'Three-wheeler', [VehicleKind.Motorcycle]: 'Motorcycle',
  [VehicleKind.Reefer]: 'Refrigerated', [VehicleKind.Pickup]: 'Pickup',
};

export enum VehicleOwnership { Owned = 1, Leased = 2, Contracted = 3, ThirdParty = 4 }

export const OWNERSHIP_LABELS: Record<number, string> = {
  [VehicleOwnership.Owned]: 'Owned', [VehicleOwnership.Leased]: 'Leased',
  [VehicleOwnership.Contracted]: 'Contracted', [VehicleOwnership.ThirdParty]: 'Third party',
};

export enum VehicleComplianceKind {
  Insurance = 1, Fitness = 2, Permit = 3, PollutionCertificate = 4, RoadTax = 5, Registration = 6,
}

export const COMPLIANCE_LABELS: Record<number, string> = {
  [VehicleComplianceKind.Insurance]: 'Insurance',
  [VehicleComplianceKind.Fitness]: 'Fitness',
  [VehicleComplianceKind.Permit]: 'Permit',
  [VehicleComplianceKind.PollutionCertificate]: 'Pollution certificate',
  [VehicleComplianceKind.RoadTax]: 'Road tax',
  [VehicleComplianceKind.Registration]: 'Registration',
};

export enum TripStatus {
  Planned = 1, Loaded = 2, Departed = 3, InProgress = 4, Returned = 5, Settled = 6, Cancelled = 7,
}

export const TRIP_STATUS_LABELS: Record<number, string> = {
  [TripStatus.Planned]: 'Planned', [TripStatus.Loaded]: 'Loaded',
  [TripStatus.Departed]: 'Departed', [TripStatus.InProgress]: 'On the road',
  [TripStatus.Returned]: 'Returned', [TripStatus.Settled]: 'Settled',
  [TripStatus.Cancelled]: 'Cancelled',
};

export const TRIP_STATUS_TONE: Record<number, string> = {
  [TripStatus.Planned]: 'neutral', [TripStatus.Loaded]: 'info',
  [TripStatus.Departed]: 'info', [TripStatus.InProgress]: 'good',
  [TripStatus.Returned]: 'info', [TripStatus.Settled]: 'good',
  [TripStatus.Cancelled]: 'bad',
};

export enum TripStopStatus {
  Pending = 1, Arrived = 2, Delivered = 3, PartiallyDelivered = 4,
  Refused = 5, Rescheduled = 6, Failed = 7,
}

export const STOP_STATUS_LABELS: Record<number, string> = {
  [TripStopStatus.Pending]: 'Pending', [TripStopStatus.Arrived]: 'Arrived',
  [TripStopStatus.Delivered]: 'Delivered', [TripStopStatus.PartiallyDelivered]: 'Part delivered',
  [TripStopStatus.Refused]: 'Refused', [TripStopStatus.Rescheduled]: 'Rescheduled',
  [TripStopStatus.Failed]: 'Failed',
};

export const STOP_STATUS_TONE: Record<number, string> = {
  [TripStopStatus.Pending]: 'neutral', [TripStopStatus.Arrived]: 'info',
  [TripStopStatus.Delivered]: 'good', [TripStopStatus.PartiallyDelivered]: 'warn',
  [TripStopStatus.Refused]: 'bad', [TripStopStatus.Rescheduled]: 'warn',
  [TripStopStatus.Failed]: 'bad',
};

export enum TripExpenseKind {
  Fuel = 1, Toll = 2, Parking = 3, LoadingLabour = 4,
  DriverAllowance = 5, Repair = 6, Fine = 7, Other = 99,
}

export const EXPENSE_LABELS: Record<number, string> = {
  [TripExpenseKind.Fuel]: 'Fuel', [TripExpenseKind.Toll]: 'Toll',
  [TripExpenseKind.Parking]: 'Parking', [TripExpenseKind.LoadingLabour]: 'Loading labour',
  [TripExpenseKind.DriverAllowance]: 'Driver allowance', [TripExpenseKind.Repair]: 'Repair',
  [TripExpenseKind.Fine]: 'Fine', [TripExpenseKind.Other]: 'Other',
};

export enum PodLineOutcome { Accepted = 1, ShortReceived = 2, Damaged = 3, Rejected = 4 }

export const POD_OUTCOME_LABELS: Record<number, string> = {
  [PodLineOutcome.Accepted]: 'Accepted', [PodLineOutcome.ShortReceived]: 'Short',
  [PodLineOutcome.Damaged]: 'Damaged', [PodLineOutcome.Rejected]: 'Rejected',
};

export const POD_OUTCOME_TONE: Record<number, string> = {
  [PodLineOutcome.Accepted]: 'good', [PodLineOutcome.ShortReceived]: 'warn',
  [PodLineOutcome.Damaged]: 'bad', [PodLineOutcome.Rejected]: 'bad',
};

// ── Returns ──────────────────────────────────────────────────────────────────

export enum ReturnKind {
  SaleableMarketReturn = 1, Damaged = 2, Expired = 3, NearExpiryBuyback = 4,
  WrongSupply = 5, QualityComplaint = 6, RecallReturn = 7,
  SalesReturnAgainstInvoice = 8, UnbilledPickup = 9,
}

export const RETURN_KIND_LABELS: Record<number, string> = {
  [ReturnKind.SaleableMarketReturn]: 'Saleable market return',
  [ReturnKind.Damaged]: 'Damaged',
  [ReturnKind.Expired]: 'Expired',
  [ReturnKind.NearExpiryBuyback]: 'Near-expiry buyback',
  [ReturnKind.WrongSupply]: 'Wrong supply',
  [ReturnKind.QualityComplaint]: 'Quality complaint',
  [ReturnKind.RecallReturn]: 'Recall return',
  [ReturnKind.SalesReturnAgainstInvoice]: 'Return against invoice',
  [ReturnKind.UnbilledPickup]: 'Unbilled pickup',
};

export enum ReturnStatus {
  Requested = 1, Approved = 2, Rejected = 3, Collected = 4,
  Received = 5, Inspected = 6, Credited = 7, Closed = 8, Cancelled = 9,
}

export const RETURN_STATUS_LABELS: Record<number, string> = {
  [ReturnStatus.Requested]: 'Requested', [ReturnStatus.Approved]: 'Approved',
  [ReturnStatus.Rejected]: 'Rejected', [ReturnStatus.Collected]: 'Collected',
  [ReturnStatus.Received]: 'Received', [ReturnStatus.Inspected]: 'Inspected',
  [ReturnStatus.Credited]: 'Credited', [ReturnStatus.Closed]: 'Closed',
  [ReturnStatus.Cancelled]: 'Cancelled',
};

export const RETURN_STATUS_TONE: Record<number, string> = {
  [ReturnStatus.Requested]: 'warn', [ReturnStatus.Approved]: 'info',
  [ReturnStatus.Rejected]: 'bad', [ReturnStatus.Collected]: 'info',
  [ReturnStatus.Received]: 'info', [ReturnStatus.Inspected]: 'info',
  [ReturnStatus.Credited]: 'good', [ReturnStatus.Closed]: 'neutral',
  [ReturnStatus.Cancelled]: 'neutral',
};

export enum ReturnDispositionKind {
  Restock = 1, Repack = 2, DiscountAndSell = 3, Scrap = 4, ReturnToSupplier = 5, InsuranceClaim = 6,
}

export const DISPOSITION_LABELS: Record<number, string> = {
  [ReturnDispositionKind.Restock]: 'Restock',
  [ReturnDispositionKind.Repack]: 'Repack',
  [ReturnDispositionKind.DiscountAndSell]: 'Discount and sell',
  [ReturnDispositionKind.Scrap]: 'Scrap',
  [ReturnDispositionKind.ReturnToSupplier]: 'Return to supplier',
  [ReturnDispositionKind.InsuranceClaim]: 'Insurance claim',
};

export enum ReturnValuationBasis { OriginalInvoicePrice = 1, CurrentPrice = 2, PolicyPercentage = 3 }

export const VALUATION_LABELS: Record<number, string> = {
  [ReturnValuationBasis.OriginalInvoicePrice]: 'Original invoice price',
  [ReturnValuationBasis.CurrentPrice]: 'Current price',
  [ReturnValuationBasis.PolicyPercentage]: 'Policy percentage',
};

// ── Pricing & schemes ────────────────────────────────────────────────────────

export enum PriceScope {
  Company = 1, Channel = 2, Territory = 3, PartnerTier = 4, Partner = 5, Outlet = 6, Contract = 7,
}

export const PRICE_SCOPE_LABELS: Record<number, string> = {
  [PriceScope.Company]: 'Company', [PriceScope.Channel]: 'Channel',
  [PriceScope.Territory]: 'Territory', [PriceScope.PartnerTier]: 'Partner tier',
  [PriceScope.Partner]: 'Partner', [PriceScope.Outlet]: 'Outlet',
  [PriceScope.Contract]: 'Contract',
};

export enum TradeSchemeKind {
  QuantityFreeGoods = 1, QuantitySlab = 2, ValueSlab = 3, PercentageDiscount = 4,
  FlatAmountOff = 5, ComboAssortment = 6, Display = 7, CashDiscount = 8,
  LoyaltyPoints = 9, SamplingFreeIssue = 10, Liquidation = 11, TradeOfferBundle = 12,
}

export const SCHEME_KIND_LABELS: Record<number, string> = {
  [TradeSchemeKind.QuantityFreeGoods]: 'Buy N get M free',
  [TradeSchemeKind.QuantitySlab]: 'Quantity slab (QPS)',
  [TradeSchemeKind.ValueSlab]: 'Value slab',
  [TradeSchemeKind.PercentageDiscount]: 'Percentage discount',
  [TradeSchemeKind.FlatAmountOff]: 'Flat amount off',
  [TradeSchemeKind.ComboAssortment]: 'Combo / assortment',
  [TradeSchemeKind.Display]: 'Display scheme',
  [TradeSchemeKind.CashDiscount]: 'Cash discount',
  [TradeSchemeKind.LoyaltyPoints]: 'Loyalty points',
  [TradeSchemeKind.SamplingFreeIssue]: 'Sampling / free issue',
  [TradeSchemeKind.Liquidation]: 'Liquidation',
  [TradeSchemeKind.TradeOfferBundle]: 'Trade offer bundle',
};

export enum SchemeSettlementMode { OnInvoice = 1, Deferred = 2, FreeGoodsIssue = 3, CreditNote = 4 }

export const SETTLEMENT_MODE_LABELS: Record<number, string> = {
  [SchemeSettlementMode.OnInvoice]: 'On invoice',
  [SchemeSettlementMode.Deferred]: 'Deferred — becomes a claim',
  [SchemeSettlementMode.FreeGoodsIssue]: 'Free goods issue',
  [SchemeSettlementMode.CreditNote]: 'Credit note',
};

export enum SchemeStacking { Exclusive = 1, Combinable = 2, BestOfGroup = 3 }

export const STACKING_LABELS: Record<number, string> = {
  [SchemeStacking.Exclusive]: 'Exclusive — wins alone',
  [SchemeStacking.Combinable]: 'Combinable',
  [SchemeStacking.BestOfGroup]: 'Best of group',
};

export enum SchemeStatus {
  Draft = 1, PendingApproval = 2, Approved = 3, Active = 4,
  Paused = 5, Exhausted = 6, Expired = 7, Cancelled = 8,
}

export const SCHEME_STATUS_LABELS: Record<number, string> = {
  [SchemeStatus.Draft]: 'Draft', [SchemeStatus.PendingApproval]: 'Awaiting approval',
  [SchemeStatus.Approved]: 'Approved', [SchemeStatus.Active]: 'Active',
  [SchemeStatus.Paused]: 'Paused', [SchemeStatus.Exhausted]: 'Budget exhausted',
  [SchemeStatus.Expired]: 'Expired', [SchemeStatus.Cancelled]: 'Cancelled',
};

export const SCHEME_STATUS_TONE: Record<number, string> = {
  [SchemeStatus.Draft]: 'neutral', [SchemeStatus.PendingApproval]: 'warn',
  [SchemeStatus.Approved]: 'info', [SchemeStatus.Active]: 'good',
  [SchemeStatus.Paused]: 'warn', [SchemeStatus.Exhausted]: 'bad',
  [SchemeStatus.Expired]: 'neutral', [SchemeStatus.Cancelled]: 'bad',
};

// ── Claims & money ───────────────────────────────────────────────────────────

export enum ClaimKind {
  Scheme = 1, Damage = 2, Expiry = 3, Freight = 4, Display = 5,
  MarketReturn = 6, PriceProtection = 7, Chargeback = 8, Manual = 99,
}

export const CLAIM_KIND_LABELS: Record<number, string> = {
  [ClaimKind.Scheme]: 'Scheme', [ClaimKind.Damage]: 'Damage', [ClaimKind.Expiry]: 'Expiry',
  [ClaimKind.Freight]: 'Freight', [ClaimKind.Display]: 'Display',
  [ClaimKind.MarketReturn]: 'Market return', [ClaimKind.PriceProtection]: 'Price protection',
  [ClaimKind.Chargeback]: 'Chargeback', [ClaimKind.Manual]: 'Manual',
};

export enum ClaimStatus {
  Draft = 1, Submitted = 2, UnderReview = 3, QueryRaised = 4, Resubmitted = 5,
  Approved = 6, PartiallyApproved = 7, Rejected = 8, Settled = 9, Cancelled = 10,
}

export const CLAIM_STATUS_LABELS: Record<number, string> = {
  [ClaimStatus.Draft]: 'Draft', [ClaimStatus.Submitted]: 'Submitted',
  [ClaimStatus.UnderReview]: 'Under review', [ClaimStatus.QueryRaised]: 'Query raised',
  [ClaimStatus.Resubmitted]: 'Resubmitted', [ClaimStatus.Approved]: 'Approved',
  [ClaimStatus.PartiallyApproved]: 'Partly approved', [ClaimStatus.Rejected]: 'Rejected',
  [ClaimStatus.Settled]: 'Settled', [ClaimStatus.Cancelled]: 'Cancelled',
};

export const CLAIM_STATUS_TONE: Record<number, string> = {
  [ClaimStatus.Draft]: 'neutral', [ClaimStatus.Submitted]: 'info',
  [ClaimStatus.UnderReview]: 'info', [ClaimStatus.QueryRaised]: 'warn',
  [ClaimStatus.Resubmitted]: 'info', [ClaimStatus.Approved]: 'good',
  [ClaimStatus.PartiallyApproved]: 'warn', [ClaimStatus.Rejected]: 'bad',
  [ClaimStatus.Settled]: 'good', [ClaimStatus.Cancelled]: 'neutral',
};

export enum ClaimSettlementMode {
  CreditNote = 1, CashPayment = 2, AdjustAgainstNextInvoice = 3, OffsetOutstanding = 4,
}

export const CLAIM_SETTLEMENT_LABELS: Record<number, string> = {
  [ClaimSettlementMode.CreditNote]: 'Credit note',
  [ClaimSettlementMode.CashPayment]: 'Cash payment',
  [ClaimSettlementMode.AdjustAgainstNextInvoice]: 'Adjust against next invoice',
  [ClaimSettlementMode.OffsetOutstanding]: 'Offset outstanding',
};

export enum PaymentTender {
  Cash = 1, Cheque = 2, BankTransfer = 3, Upi = 4, Wallet = 5, Card = 6, CreditAdjustment = 7,
}

export const TENDER_LABELS: Record<number, string> = {
  [PaymentTender.Cash]: 'Cash', [PaymentTender.Cheque]: 'Cheque',
  [PaymentTender.BankTransfer]: 'Bank transfer', [PaymentTender.Upi]: 'UPI',
  [PaymentTender.Wallet]: 'Wallet', [PaymentTender.Card]: 'Card',
  [PaymentTender.CreditAdjustment]: 'Credit adjustment',
};

export const TENDER_ICONS: Record<number, string> = {
  [PaymentTender.Cash]: 'payments', [PaymentTender.Cheque]: 'receipt_long',
  [PaymentTender.BankTransfer]: 'account_balance', [PaymentTender.Upi]: 'qr_code_2',
  [PaymentTender.Wallet]: 'wallet', [PaymentTender.Card]: 'credit_card',
  [PaymentTender.CreditAdjustment]: 'swap_horiz',
};

export enum ChequeStatus {
  Received = 1, Deposited = 2, Cleared = 3, Bounced = 4, Cancelled = 5, Held = 6,
}

export const CHEQUE_STATUS_LABELS: Record<number, string> = {
  [ChequeStatus.Received]: 'Received', [ChequeStatus.Deposited]: 'Deposited',
  [ChequeStatus.Cleared]: 'Cleared', [ChequeStatus.Bounced]: 'Bounced',
  [ChequeStatus.Cancelled]: 'Cancelled', [ChequeStatus.Held]: 'Post-dated',
};

export const CHEQUE_STATUS_TONE: Record<number, string> = {
  [ChequeStatus.Received]: 'info', [ChequeStatus.Deposited]: 'info',
  [ChequeStatus.Cleared]: 'good', [ChequeStatus.Bounced]: 'bad',
  [ChequeStatus.Cancelled]: 'neutral', [ChequeStatus.Held]: 'warn',
};

export enum CreditEnforcement { Off = 1, Warn = 2, Block = 3 }

export const ENFORCEMENT_LABELS: Record<number, string> = {
  [CreditEnforcement.Off]: 'Informational only',
  [CreditEnforcement.Warn]: 'Warn and continue',
  [CreditEnforcement.Block]: 'Block until overridden',
};

export enum SettlementStatus {
  Open = 1, Submitted = 2, PendingApproval = 3, Approved = 4, Closed = 5, Reversed = 6,
}

export const SETTLEMENT_STATUS_LABELS: Record<number, string> = {
  [SettlementStatus.Open]: 'Open', [SettlementStatus.Submitted]: 'Submitted',
  [SettlementStatus.PendingApproval]: 'Awaiting approval', [SettlementStatus.Approved]: 'Approved',
  [SettlementStatus.Closed]: 'Closed', [SettlementStatus.Reversed]: 'Reversed',
};

export const SETTLEMENT_STATUS_TONE: Record<number, string> = {
  [SettlementStatus.Open]: 'warn', [SettlementStatus.Submitted]: 'info',
  [SettlementStatus.PendingApproval]: 'warn', [SettlementStatus.Approved]: 'info',
  [SettlementStatus.Closed]: 'good', [SettlementStatus.Reversed]: 'bad',
};

export enum VarianceKind {
  CashShort = 1, CashOver = 2, StockShort = 3, StockExcess = 4,
  UnbilledReturn = 5, UnexplainedDiscount = 6,
}

export const VARIANCE_LABELS: Record<number, string> = {
  [VarianceKind.CashShort]: 'Cash short', [VarianceKind.CashOver]: 'Cash over',
  [VarianceKind.StockShort]: 'Stock short', [VarianceKind.StockExcess]: 'Stock excess',
  [VarianceKind.UnbilledReturn]: 'Unbilled return',
  [VarianceKind.UnexplainedDiscount]: 'Unexplained discount',
};

// ── Secondary sales ──────────────────────────────────────────────────────────

export enum SecondaryCaptureMode { Transactional = 1, Uploaded = 2, Declared = 3 }

export const CAPTURE_MODE_LABELS: Record<number, string> = {
  [SecondaryCaptureMode.Transactional]: 'Transactional',
  [SecondaryCaptureMode.Uploaded]: 'File upload',
  [SecondaryCaptureMode.Declared]: 'Declared',
};

export enum UploadBatchStatus {
  Received = 1, Validating = 2, PartiallyMapped = 3, Mapped = 4, Posted = 5, Rejected = 6,
}

export const UPLOAD_STATUS_LABELS: Record<number, string> = {
  [UploadBatchStatus.Received]: 'Received', [UploadBatchStatus.Validating]: 'Validating',
  [UploadBatchStatus.PartiallyMapped]: 'Partly mapped', [UploadBatchStatus.Mapped]: 'Mapped',
  [UploadBatchStatus.Posted]: 'Posted', [UploadBatchStatus.Rejected]: 'Rejected',
};

export const UPLOAD_STATUS_TONE: Record<number, string> = {
  [UploadBatchStatus.Received]: 'neutral', [UploadBatchStatus.Validating]: 'info',
  [UploadBatchStatus.PartiallyMapped]: 'warn', [UploadBatchStatus.Mapped]: 'info',
  [UploadBatchStatus.Posted]: 'good', [UploadBatchStatus.Rejected]: 'bad',
};

export enum ReconciliationOutcome { Balanced = 1, ShortDeclared = 2, OverDeclared = 3, Missing = 4 }

export const RECONCILIATION_LABELS: Record<number, string> = {
  [ReconciliationOutcome.Balanced]: 'Balanced',
  [ReconciliationOutcome.ShortDeclared]: 'Short declared',
  [ReconciliationOutcome.OverDeclared]: 'Over declared',
  [ReconciliationOutcome.Missing]: 'No declaration',
};

export const RECONCILIATION_TONE: Record<number, string> = {
  [ReconciliationOutcome.Balanced]: 'good',
  [ReconciliationOutcome.ShortDeclared]: 'bad',
  [ReconciliationOutcome.OverDeclared]: 'warn',
  [ReconciliationOutcome.Missing]: 'bad',
};

// ── Targets & performance ────────────────────────────────────────────────────

export enum TargetMetric {
  SalesValue = 1, SalesVolume = 2, Collection = 3, Coverage = 4, ProductiveCalls = 5,
  NewOutlets = 6, MustSellCompliance = 7, LinesPerCall = 8, RangeSelling = 9,
}

export const METRIC_LABELS: Record<number, string> = {
  [TargetMetric.SalesValue]: 'Sales value', [TargetMetric.SalesVolume]: 'Sales volume',
  [TargetMetric.Collection]: 'Collection', [TargetMetric.Coverage]: 'Coverage',
  [TargetMetric.ProductiveCalls]: 'Productive calls', [TargetMetric.NewOutlets]: 'New outlets',
  [TargetMetric.MustSellCompliance]: 'Must-sell compliance',
  [TargetMetric.LinesPerCall]: 'Lines per call', [TargetMetric.RangeSelling]: 'Range selling',
};

export enum TargetPeriod { Monthly = 1, Quarterly = 2, Annual = 3, Weekly = 4 }

export const PERIOD_LABELS: Record<number, string> = {
  [TargetPeriod.Monthly]: 'Monthly', [TargetPeriod.Quarterly]: 'Quarterly',
  [TargetPeriod.Annual]: 'Annual', [TargetPeriod.Weekly]: 'Weekly',
};

export enum TargetScope { Company = 1, Territory = 2, Route = 3, FieldRep = 4, Partner = 5, Outlet = 6 }

export const SCOPE_LABELS: Record<number, string> = {
  [TargetScope.Company]: 'Company', [TargetScope.Territory]: 'Territory',
  [TargetScope.Route]: 'Route', [TargetScope.FieldRep]: 'Field rep',
  [TargetScope.Partner]: 'Partner', [TargetScope.Outlet]: 'Outlet',
};

export enum IncentiveBasis { Slab = 1, Linear = 2, Gated = 3, Team = 4, Spiff = 5 }

export const INCENTIVE_BASIS_LABELS: Record<number, string> = {
  [IncentiveBasis.Slab]: 'Slab', [IncentiveBasis.Linear]: 'Linear',
  [IncentiveBasis.Gated]: 'Gated', [IncentiveBasis.Team]: 'Team', [IncentiveBasis.Spiff]: 'Spiff',
};

// ── Planning ─────────────────────────────────────────────────────────────────

export enum ForecastBasis {
  SecondarySalesHistory = 1, PrimarySalesHistory = 2, Manual = 3, SeasonalAdjusted = 4,
}

export const FORECAST_BASIS_LABELS: Record<number, string> = {
  [ForecastBasis.SecondarySalesHistory]: 'Secondary sales — real demand',
  [ForecastBasis.PrimarySalesHistory]: 'Primary sales — pipeline',
  [ForecastBasis.Manual]: 'Manual',
  [ForecastBasis.SeasonalAdjusted]: 'Seasonally adjusted',
};

export enum ReplenishmentTargetKind { Distributor = 1, Van = 2, Warehouse = 3 }

export const REPLENISH_TARGET_LABELS: Record<number, string> = {
  [ReplenishmentTargetKind.Distributor]: 'Distributor',
  [ReplenishmentTargetKind.Van]: 'Van',
  [ReplenishmentTargetKind.Warehouse]: 'Warehouse',
};

export enum TransferRequestStatus {
  Draft = 1, Requested = 2, Approved = 3, InTransit = 4, Received = 5, Rejected = 6, Cancelled = 7,
}

export const TRANSFER_STATUS_LABELS: Record<number, string> = {
  [TransferRequestStatus.Draft]: 'Draft', [TransferRequestStatus.Requested]: 'Requested',
  [TransferRequestStatus.Approved]: 'Approved', [TransferRequestStatus.InTransit]: 'In transit',
  [TransferRequestStatus.Received]: 'Received', [TransferRequestStatus.Rejected]: 'Rejected',
  [TransferRequestStatus.Cancelled]: 'Cancelled',
};

// ── Traceability ─────────────────────────────────────────────────────────────

export enum ColdChainPointKind {
  ColdRoom = 1, Freezer = 2, ReeferVehicle = 3, OutletCooler = 4, ReceivingDock = 5,
}

export const COLD_POINT_LABELS: Record<number, string> = {
  [ColdChainPointKind.ColdRoom]: 'Cold room', [ColdChainPointKind.Freezer]: 'Freezer',
  [ColdChainPointKind.ReeferVehicle]: 'Reefer vehicle',
  [ColdChainPointKind.OutletCooler]: 'Outlet cooler',
  [ColdChainPointKind.ReceivingDock]: 'Receiving dock',
};

export enum RecallStatus { Draft = 1, Announced = 2, InProgress = 3, Completed = 4, Cancelled = 5 }

export const RECALL_STATUS_LABELS: Record<number, string> = {
  [RecallStatus.Draft]: 'Draft', [RecallStatus.Announced]: 'Announced',
  [RecallStatus.InProgress]: 'In progress', [RecallStatus.Completed]: 'Completed',
  [RecallStatus.Cancelled]: 'Cancelled',
};

export const RECALL_STATUS_TONE: Record<number, string> = {
  [RecallStatus.Draft]: 'neutral', [RecallStatus.Announced]: 'bad',
  [RecallStatus.InProgress]: 'warn', [RecallStatus.Completed]: 'good',
  [RecallStatus.Cancelled]: 'neutral',
};

export enum RecallSeverity { ClassI = 1, ClassII = 2, ClassIII = 3, Withdrawal = 4 }

export const SEVERITY_LABELS: Record<number, string> = {
  [RecallSeverity.ClassI]: 'Class I — serious health risk',
  [RecallSeverity.ClassII]: 'Class II — reversible consequence',
  [RecallSeverity.ClassIII]: 'Class III — unlikely to harm',
  [RecallSeverity.Withdrawal]: 'Voluntary withdrawal',
};

export enum ReasonSurface {
  NoOrder = 1, VisitSkipped = 2, OutOfFenceCheckIn = 3, OrderCancellation = 4,
  OrderRejection = 5, ShortPick = 6, DeliveryFailure = 7, Return = 8,
  StockVariance = 9, CashVariance = 10, CreditOverride = 11, FefoOverride = 12,
  ClaimRejection = 13, PriceOverride = 14, Wastage = 15,
}

export const REASON_SURFACE_LABELS: Record<number, string> = {
  [ReasonSurface.NoOrder]: 'No order', [ReasonSurface.VisitSkipped]: 'Visit skipped',
  [ReasonSurface.OutOfFenceCheckIn]: 'Out-of-fence check-in',
  [ReasonSurface.OrderCancellation]: 'Order cancellation',
  [ReasonSurface.OrderRejection]: 'Order rejection', [ReasonSurface.ShortPick]: 'Short pick',
  [ReasonSurface.DeliveryFailure]: 'Delivery failure', [ReasonSurface.Return]: 'Return',
  [ReasonSurface.StockVariance]: 'Stock variance', [ReasonSurface.CashVariance]: 'Cash variance',
  [ReasonSurface.CreditOverride]: 'Credit override', [ReasonSurface.FefoOverride]: 'FEFO override',
  [ReasonSurface.ClaimRejection]: 'Claim rejection', [ReasonSurface.PriceOverride]: 'Price override',
  [ReasonSurface.Wastage]: 'Wastage',
};

export enum DistributionAlertKind {
  OrderApproved = 1, OrderRejected = 2, CreditLimitBreached = 3, ChequeBounced = 4,
  DeliveryFailed = 5, RouteUnsettled = 6, StockVarianceHigh = 7, ClaimApproved = 8,
  ClaimRejected = 9, ClaimQueried = 10, SchemeBudgetExhausted = 11, NearExpiryThreshold = 12,
  LicenceExpiring = 13, TargetMilestone = 14, DayNotStarted = 15,
  RecallAnnounced = 16, ColdChainExcursion = 17,
}

export enum AlertSeverity { Info = 1, Warning = 2, Critical = 3 }

export const SEVERITY_TONE: Record<number, string> = {
  [AlertSeverity.Info]: 'info', [AlertSeverity.Warning]: 'warn', [AlertSeverity.Critical]: 'bad',
};

/** Icons for the exception queue, keyed by the server's `kind` string. */
export const EXCEPTION_ICONS: Record<string, string> = {
  UnsettledRoute: 'account_balance_wallet',
  UnexplainedVariance: 'rule',
  CreditBreach: 'credit_card_off',
  NearExpiry: 'schedule',
  UnmappedSecondary: 'link_off',
  OverdueClaim: 'gavel',
  ExpiringLicence: 'badge',
  OutOfFenceVisit: 'location_off',
  DeliveryException: 'local_shipping',
  ColdChainExcursion: 'ac_unit',
  StaleDevice: 'phonelink_off',
};

/** Weekday mask helpers — routes store days as "0,1,2" with 0 = Sunday. */
export const WEEKDAYS = [
  { value: 0, short: 'Sun', label: 'Sunday' },
  { value: 1, short: 'Mon', label: 'Monday' },
  { value: 2, short: 'Tue', label: 'Tuesday' },
  { value: 3, short: 'Wed', label: 'Wednesday' },
  { value: 4, short: 'Thu', label: 'Thursday' },
  { value: 5, short: 'Fri', label: 'Friday' },
  { value: 6, short: 'Sat', label: 'Saturday' },
];

/** Turns an enum object into `{ value, label }` rows for a select, in declaration order. */
export function enumOptions(
  labels: Record<number, string>,
): { value: number; label: string }[] {
  return Object.keys(labels)
    .map(Number)
    .filter(n => !Number.isNaN(n))
    .map(value => ({ value, label: labels[value] }));
}
