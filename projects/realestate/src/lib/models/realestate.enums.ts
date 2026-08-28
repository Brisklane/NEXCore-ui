/* =====================================================================================
 * Real Estate enumerations.
 *
 * Mirrors RealEstateEnums.cs exactly, values included. The numbers are what crosses the wire, so
 * they are written out rather than left implicit — inserting a member in the middle of a C# enum
 * would otherwise silently reinterpret every stored row.
 *
 * Each enum carries a label map beside it. A screen must never render "GrantedWithConditions" at
 * somebody; it renders "Granted with conditions".
 * ===================================================================================== */

/** Turns a label map into the array a <select> wants, in declaration order. */
export function enumOptions<T extends number>(
  labels: Record<T, string>,
): Array<{ value: T; label: string }> {
  return (Object.keys(labels) as unknown as string[])
    .map(k => Number(k) as T)
    .filter(v => !Number.isNaN(v))
    .map(value => ({ value, label: labels[value] }));
}

/**
 * Acronyms and industry terms that must not be lower-cased or split.
 *
 * Without these, "FireNoc" reads as "Fire noc" and "Kyc" as "Kyc" — which tells a user in this
 * industry that the software was written by somebody who has never worked in it.
 */
const KEEP: Record<string, string> = {
  noc: 'NOC', nocs: 'NOCs', kyc: 'KYC', ipc: 'IPC', boq: 'BOQ', eoi: 'EOI', sla: 'SLA',
  jv: 'JV', qpr: 'QPR', wbs: 'WBS', ppm: 'PPM', cam: 'CAM', otp: 'OTP', rfid: 'RFID',
  url: 'URL', pdf: 'PDF', api: 'API', id: 'ID', qr: 'QR', gst: 'GST', vat: 'VAT',
  tds: 'TDS', emi: 'EMI', poa: 'POA', nda: 'NDA', epc: 'EPC', hvac: 'HVAC', cctv: 'CCTV',
  spv: 'SPV', irr: 'IRR', pnl: 'P&L', wip: 'WIP', eot: 'EOT', ld: 'LD', bg: 'BG',
  sqft: 'sq ft', tbd: 'TBD', ceo: 'CEO', cfo: 'CFO',
};

/**
 * Splits a PascalCase member name into readable words, keeping acronyms intact.
 *
 * Sentence case rather than title case: a dropdown of "Granted With Conditions" and
 * "Under Review" reads like a legal document. "Granted with conditions" reads like English.
 */
function words(value: string): string {
  const parts = value
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    .split(' ')
    .filter(Boolean);

  return parts
    .map((part, index) => {
      const upper = KEEP[part.toLowerCase()];
      if (upper) return upper;
      return index === 0
        ? part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
        : part.toLowerCase();
    })
    .join(' ');
}

/**
 * Which of the four businesses a company runs. Most firms run two or three at once, so this is
 * a set of switches rather than a single choice — see LineOfBusinessConfig.
 */
export enum LineOfBusiness {
  /** Sells and lets other people's property for a fee. */
  Brokerage = 1,
  /** Builds and sells its own stock — societies, towers, plot schemes, marts. */
  Development = 2,
  /** Builds on someone else's land for a contract price. */
  Contracting = 3,
  /** Runs standing stock forever — tenancies, service charges, society dues. */
  EstateManagement = 4,
}

export const LINE_OF_BUSINESS_LABELS: Record<LineOfBusiness, string> = {
  [LineOfBusiness.Brokerage]: words('Brokerage'),
  [LineOfBusiness.Development]: words('Development'),
  [LineOfBusiness.Contracting]: words('Contracting'),
  [LineOfBusiness.EstateManagement]: words('EstateManagement'),
};

export enum OfficeType {
  HeadOffice = 1,
  Branch = 2,
  /** The cabin on the project site where bookings are actually written. */
  ProjectSalesOffice = 3,
  SiteOffice = 4,
  Franchise = 5,
}

export const OFFICE_TYPE_LABELS: Record<OfficeType, string> = {
  [OfficeType.HeadOffice]: words('HeadOffice'),
  [OfficeType.Branch]: words('Branch'),
  [OfficeType.ProjectSalesOffice]: words('ProjectSalesOffice'),
  [OfficeType.SiteOffice]: words('SiteOffice'),
  [OfficeType.Franchise]: words('Franchise'),
};

/**
 * How area is spoken about. The canonical stored value is always square feet; this is what the
 * operator reads and types. A Lahore office says "10 marla" and a Dubai office says "2,722 sq ft"
 * about the same plot, and both must be right.
 */
export enum AreaUnit {
  SquareFeet = 1,
  SquareMetre = 2,
  SquareYard = 3,
  Marla = 4,
  Kanal = 5,
  Acre = 6,
  Hectare = 7,
  Bigha = 8,
  Cent = 9,
  Guntha = 10,
}

export const AREA_UNIT_LABELS: Record<AreaUnit, string> = {
  [AreaUnit.SquareFeet]: words('SquareFeet'),
  [AreaUnit.SquareMetre]: words('SquareMetre'),
  [AreaUnit.SquareYard]: words('SquareYard'),
  [AreaUnit.Marla]: words('Marla'),
  [AreaUnit.Kanal]: words('Kanal'),
  [AreaUnit.Acre]: words('Acre'),
  [AreaUnit.Hectare]: words('Hectare'),
  [AreaUnit.Bigha]: words('Bigha'),
  [AreaUnit.Cent]: words('Cent'),
  [AreaUnit.Guntha]: words('Guntha'),
};

/** Top level of the property taxonomy. The second level is PropertySubType. */
export enum PropertyCategory {
  Residential = 1,
  Commercial = 2,
  Land = 3,
  Industrial = 4,
  Other = 5,
}

export const PROPERTY_CATEGORY_LABELS: Record<PropertyCategory, string> = {
  [PropertyCategory.Residential]: words('Residential'),
  [PropertyCategory.Commercial]: words('Commercial'),
  [PropertyCategory.Land]: words('Land'),
  [PropertyCategory.Industrial]: words('Industrial'),
  [PropertyCategory.Other]: words('Other'),
};

export enum PropertySubType {
  Apartment = 1,
  Studio = 2,
  Penthouse = 3,
  Duplex = 4,
  Villa = 5,
  House = 6,
  Townhouse = 7,
  Farmhouse = 8,
  Room = 9,
  ServantQuarter = 10,
  Shop = 30,
  Showroom = 31,
  Office = 32,
  Floor = 33,
  Building = 34,
  FoodCourtUnit = 35,
  Kiosk = 36,
  MartUnit = 37,
  Warehouse = 38,
  ColdStore = 39,
  Plaza = 40,
  ResidentialPlot = 60,
  CommercialPlot = 61,
  IndustrialPlot = 62,
  AgriculturalLand = 63,
  FarmLand = 64,
  Orchard = 65,
  /** A right to a plot that has not been allotted a number yet. Sold before the ballot. */
  PlotFile = 66,
  Factory = 80,
  Godown = 81,
  IndustrialShed = 82,
  ParkingSpace = 100,
  Storage = 101,
  SignageSpace = 102,
  CommonArea = 103,
  AmenitySpace = 104,
  RoofRights = 105,
  Basement = 106,
}

export const PROPERTY_SUB_TYPE_LABELS: Record<PropertySubType, string> = {
  [PropertySubType.Apartment]: words('Apartment'),
  [PropertySubType.Studio]: words('Studio'),
  [PropertySubType.Penthouse]: words('Penthouse'),
  [PropertySubType.Duplex]: words('Duplex'),
  [PropertySubType.Villa]: words('Villa'),
  [PropertySubType.House]: words('House'),
  [PropertySubType.Townhouse]: words('Townhouse'),
  [PropertySubType.Farmhouse]: words('Farmhouse'),
  [PropertySubType.Room]: words('Room'),
  [PropertySubType.ServantQuarter]: words('ServantQuarter'),
  [PropertySubType.Shop]: words('Shop'),
  [PropertySubType.Showroom]: words('Showroom'),
  [PropertySubType.Office]: words('Office'),
  [PropertySubType.Floor]: words('Floor'),
  [PropertySubType.Building]: words('Building'),
  [PropertySubType.FoodCourtUnit]: words('FoodCourtUnit'),
  [PropertySubType.Kiosk]: words('Kiosk'),
  [PropertySubType.MartUnit]: words('MartUnit'),
  [PropertySubType.Warehouse]: words('Warehouse'),
  [PropertySubType.ColdStore]: words('ColdStore'),
  [PropertySubType.Plaza]: words('Plaza'),
  [PropertySubType.ResidentialPlot]: words('ResidentialPlot'),
  [PropertySubType.CommercialPlot]: words('CommercialPlot'),
  [PropertySubType.IndustrialPlot]: words('IndustrialPlot'),
  [PropertySubType.AgriculturalLand]: words('AgriculturalLand'),
  [PropertySubType.FarmLand]: words('FarmLand'),
  [PropertySubType.Orchard]: words('Orchard'),
  [PropertySubType.PlotFile]: words('PlotFile'),
  [PropertySubType.Factory]: words('Factory'),
  [PropertySubType.Godown]: words('Godown'),
  [PropertySubType.IndustrialShed]: words('IndustrialShed'),
  [PropertySubType.ParkingSpace]: words('ParkingSpace'),
  [PropertySubType.Storage]: words('Storage'),
  [PropertySubType.SignageSpace]: words('SignageSpace'),
  [PropertySubType.CommonArea]: words('CommonArea'),
  [PropertySubType.AmenitySpace]: words('AmenitySpace'),
  [PropertySubType.RoofRights]: words('RoofRights'),
  [PropertySubType.Basement]: words('Basement'),
};

/**
 * The single status vocabulary every board colours by. Deliberately one enum across sale,
 * letting and development: a unit that is Held is held whichever screen you are on.
 */
export enum PropertyStatus {
  Draft = 1,
  Available = 2,
  /** Held for a named lead with an expiry clock. Not a sale, and it auto-releases. */
  Held = 3,
  /** A token or EOI has been taken against it. */
  Reserved = 4,
  Booked = 5,
  Sold = 6,
  /** Deed registered / mutation done. */
  Registered = 7,
  Possessed = 8,
  Let = 9,
  UnderOffer = 10,
  UnderConstruction = 11,
  /** Deliberately off-market — owner quota, landowner share, pledged to a lender. */
  Blocked = 12,
  Litigation = 13,
  Withdrawn = 14,
  NotForSale = 15,
}

export const PROPERTY_STATUS_LABELS: Record<PropertyStatus, string> = {
  [PropertyStatus.Draft]: words('Draft'),
  [PropertyStatus.Available]: words('Available'),
  [PropertyStatus.Held]: words('Held'),
  [PropertyStatus.Reserved]: words('Reserved'),
  [PropertyStatus.Booked]: words('Booked'),
  [PropertyStatus.Sold]: words('Sold'),
  [PropertyStatus.Registered]: words('Registered'),
  [PropertyStatus.Possessed]: words('Possessed'),
  [PropertyStatus.Let]: words('Let'),
  [PropertyStatus.UnderOffer]: words('UnderOffer'),
  [PropertyStatus.UnderConstruction]: words('UnderConstruction'),
  [PropertyStatus.Blocked]: words('Blocked'),
  [PropertyStatus.Litigation]: words('Litigation'),
  [PropertyStatus.Withdrawn]: words('Withdrawn'),
  [PropertyStatus.NotForSale]: words('NotForSale'),
};

export enum OccupancyState {
  Vacant = 1,
  OwnerOccupied = 2,
  Tenanted = 3,
  UnderRenovation = 4,
  UnlawfullyOccupied = 5,
  NotBuilt = 6,
}

export const OCCUPANCY_STATE_LABELS: Record<OccupancyState, string> = {
  [OccupancyState.Vacant]: words('Vacant'),
  [OccupancyState.OwnerOccupied]: words('OwnerOccupied'),
  [OccupancyState.Tenanted]: words('Tenanted'),
  [OccupancyState.UnderRenovation]: words('UnderRenovation'),
  [OccupancyState.UnlawfullyOccupied]: words('UnlawfullyOccupied'),
  [OccupancyState.NotBuilt]: words('NotBuilt'),
};

export enum Tenure {
  Freehold = 1,
  Leasehold = 2,
  ShareOfFreehold = 3,
  Licence = 4,
  /** Allotment from a development authority — common across South Asia. */
  Allotment = 5,
  LeaseToOwn = 6,
}

export const TENURE_LABELS: Record<Tenure, string> = {
  [Tenure.Freehold]: words('Freehold'),
  [Tenure.Leasehold]: words('Leasehold'),
  [Tenure.ShareOfFreehold]: words('ShareOfFreehold'),
  [Tenure.Licence]: words('Licence'),
  [Tenure.Allotment]: words('Allotment'),
  [Tenure.LeaseToOwn]: words('LeaseToOwn'),
};

export enum FurnishingState {
  Unfurnished = 1,
  SemiFurnished = 2,
  Furnished = 3,
  FullyFitted = 4,
  ShellAndCore = 5,
}

export const FURNISHING_STATE_LABELS: Record<FurnishingState, string> = {
  [FurnishingState.Unfurnished]: words('Unfurnished'),
  [FurnishingState.SemiFurnished]: words('SemiFurnished'),
  [FurnishingState.Furnished]: words('Furnished'),
  [FurnishingState.FullyFitted]: words('FullyFitted'),
  [FurnishingState.ShellAndCore]: words('ShellAndCore'),
};

export enum Facing {
  North = 1,
  NorthEast = 2,
  East = 3,
  SouthEast = 4,
  South = 5,
  SouthWest = 6,
  West = 7,
  NorthWest = 8,
}

export const FACING_LABELS: Record<Facing, string> = {
  [Facing.North]: words('North'),
  [Facing.NorthEast]: words('NorthEast'),
  [Facing.East]: words('East'),
  [Facing.SouthEast]: words('SouthEast'),
  [Facing.South]: words('South'),
  [Facing.SouthWest]: words('SouthWest'),
  [Facing.West]: words('West'),
  [Facing.NorthWest]: words('NorthWest'),
};

export enum PropertyCondition {
  NewBuild = 1,
  Excellent = 2,
  Good = 3,
  Fair = 4,
  NeedsRenovation = 5,
  Derelict = 6,
  UnderConstruction = 7,
}

export const PROPERTY_CONDITION_LABELS: Record<PropertyCondition, string> = {
  [PropertyCondition.NewBuild]: words('NewBuild'),
  [PropertyCondition.Excellent]: words('Excellent'),
  [PropertyCondition.Good]: words('Good'),
  [PropertyCondition.Fair]: words('Fair'),
  [PropertyCondition.NeedsRenovation]: words('NeedsRenovation'),
  [PropertyCondition.Derelict]: words('Derelict'),
  [PropertyCondition.UnderConstruction]: words('UnderConstruction'),
};

export enum MediaKind {
  Photo = 1,
  FloorPlan = 2,
  SitePlan = 3,
  Brochure = 4,
  Video = 5,
  VirtualTour = 6,
  Drone = 7,
  Document = 8,
}

export const MEDIA_KIND_LABELS: Record<MediaKind, string> = {
  [MediaKind.Photo]: words('Photo'),
  [MediaKind.FloorPlan]: words('FloorPlan'),
  [MediaKind.SitePlan]: words('SitePlan'),
  [MediaKind.Brochure]: words('Brochure'),
  [MediaKind.Video]: words('Video'),
  [MediaKind.VirtualTour]: words('VirtualTour'),
  [MediaKind.Drone]: words('Drone'),
  [MediaKind.Document]: words('Document'),
};

export enum PropertyRelationKind {
  /** This property physically contains the other (a tower contains a floor). */
  Contains = 1,
  /** This property was created by splitting the other. */
  SubdividedFrom = 2,
  /** This property was created by merging the others. */
  AmalgamatedFrom = 3,
  /** Attached to the other and sold with it — a parking bay to an apartment. */
  AttachedTo = 4,
}

export const PROPERTY_RELATION_KIND_LABELS: Record<PropertyRelationKind, string> = {
  [PropertyRelationKind.Contains]: words('Contains'),
  [PropertyRelationKind.SubdividedFrom]: words('SubdividedFrom'),
  [PropertyRelationKind.AmalgamatedFrom]: words('AmalgamatedFrom'),
  [PropertyRelationKind.AttachedTo]: words('AttachedTo'),
};

export enum TitleInstrument {
  SaleDeed = 1,
  GiftDeed = 2,
  Inheritance = 3,
  Partition = 4,
  CourtDecree = 5,
  AllotmentLetter = 6,
  Exchange = 7,
  LeaseDeed = 8,
  PowerOfAttorney = 9,
  Mutation = 10,
}

export const TITLE_INSTRUMENT_LABELS: Record<TitleInstrument, string> = {
  [TitleInstrument.SaleDeed]: words('SaleDeed'),
  [TitleInstrument.GiftDeed]: words('GiftDeed'),
  [TitleInstrument.Inheritance]: words('Inheritance'),
  [TitleInstrument.Partition]: words('Partition'),
  [TitleInstrument.CourtDecree]: words('CourtDecree'),
  [TitleInstrument.AllotmentLetter]: words('AllotmentLetter'),
  [TitleInstrument.Exchange]: words('Exchange'),
  [TitleInstrument.LeaseDeed]: words('LeaseDeed'),
  [TitleInstrument.PowerOfAttorney]: words('PowerOfAttorney'),
  [TitleInstrument.Mutation]: words('Mutation'),
};

export enum EncumbranceKind {
  Mortgage = 1,
  Charge = 2,
  Lien = 3,
  Lease = 4,
  Easement = 5,
  RightOfWay = 6,
  Tenancy = 7,
  Litigation = 8,
  Attachment = 9,
  AcquisitionNotice = 10,
}

export const ENCUMBRANCE_KIND_LABELS: Record<EncumbranceKind, string> = {
  [EncumbranceKind.Mortgage]: words('Mortgage'),
  [EncumbranceKind.Charge]: words('Charge'),
  [EncumbranceKind.Lien]: words('Lien'),
  [EncumbranceKind.Lease]: words('Lease'),
  [EncumbranceKind.Easement]: words('Easement'),
  [EncumbranceKind.RightOfWay]: words('RightOfWay'),
  [EncumbranceKind.Tenancy]: words('Tenancy'),
  [EncumbranceKind.Litigation]: words('Litigation'),
  [EncumbranceKind.Attachment]: words('Attachment'),
  [EncumbranceKind.AcquisitionNotice]: words('AcquisitionNotice'),
};

export enum EncumbranceStatus {
  Active = 1,
  UnderClearance = 2,
  Cleared = 3,
  Disputed = 4,
}

export const ENCUMBRANCE_STATUS_LABELS: Record<EncumbranceStatus, string> = {
  [EncumbranceStatus.Active]: words('Active'),
  [EncumbranceStatus.UnderClearance]: words('UnderClearance'),
  [EncumbranceStatus.Cleared]: words('Cleared'),
  [EncumbranceStatus.Disputed]: words('Disputed'),
};

export enum VerificationVerdict {
  Pending = 1,
  Passed = 2,
  Failed = 3,
  /** Passed subject to a condition that must be satisfied before completion. */
  Conditional = 4,
  NotApplicable = 5,
}

export const VERIFICATION_VERDICT_LABELS: Record<VerificationVerdict, string> = {
  [VerificationVerdict.Pending]: words('Pending'),
  [VerificationVerdict.Passed]: words('Passed'),
  [VerificationVerdict.Failed]: words('Failed'),
  [VerificationVerdict.Conditional]: words('Conditional'),
  [VerificationVerdict.NotApplicable]: words('NotApplicable'),
};

export enum AcquisitionStageKind {
  Identified = 1,
  UnderNegotiation = 2,
  TermSheet = 3,
  DueDiligence = 4,
  AgreementToSell = 5,
  AdvancePaid = 6,
  Registration = 7,
  Mutation = 8,
  PossessionTaken = 9,
  Aborted = 10,
}

export const ACQUISITION_STAGE_KIND_LABELS: Record<AcquisitionStageKind, string> = {
  [AcquisitionStageKind.Identified]: words('Identified'),
  [AcquisitionStageKind.UnderNegotiation]: words('UnderNegotiation'),
  [AcquisitionStageKind.TermSheet]: words('TermSheet'),
  [AcquisitionStageKind.DueDiligence]: words('DueDiligence'),
  [AcquisitionStageKind.AgreementToSell]: words('AgreementToSell'),
  [AcquisitionStageKind.AdvancePaid]: words('AdvancePaid'),
  [AcquisitionStageKind.Registration]: words('Registration'),
  [AcquisitionStageKind.Mutation]: words('Mutation'),
  [AcquisitionStageKind.PossessionTaken]: words('PossessionTaken'),
  [AcquisitionStageKind.Aborted]: words('Aborted'),
};

export enum ProjectKind {
  HousingSociety = 1,
  PlotScheme = 2,
  ApartmentTower = 3,
  MixedUse = 4,
  /** A mart / shopping centre — units let or sold to retailers. */
  ShoppingCentre = 5,
  CommercialPlaza = 6,
  GatedVillaCommunity = 7,
  IndustrialEstate = 8,
  FarmhouseScheme = 9,
  SingleBuilding = 10,
  /** A turnkey build on the customer's own land. Has no sales inventory. */
  ClientBuild = 11,
}

export const PROJECT_KIND_LABELS: Record<ProjectKind, string> = {
  [ProjectKind.HousingSociety]: words('HousingSociety'),
  [ProjectKind.PlotScheme]: words('PlotScheme'),
  [ProjectKind.ApartmentTower]: words('ApartmentTower'),
  [ProjectKind.MixedUse]: words('MixedUse'),
  [ProjectKind.ShoppingCentre]: words('ShoppingCentre'),
  [ProjectKind.CommercialPlaza]: words('CommercialPlaza'),
  [ProjectKind.GatedVillaCommunity]: words('GatedVillaCommunity'),
  [ProjectKind.IndustrialEstate]: words('IndustrialEstate'),
  [ProjectKind.FarmhouseScheme]: words('FarmhouseScheme'),
  [ProjectKind.SingleBuilding]: words('SingleBuilding'),
  [ProjectKind.ClientBuild]: words('ClientBuild'),
};

export enum ProjectStatus {
  Concept = 1,
  Planning = 2,
  Approved = 3,
  Launched = 4,
  UnderConstruction = 5,
  Completed = 6,
  HandedOver = 7,
  Closed = 8,
  OnHold = 9,
}

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  [ProjectStatus.Concept]: words('Concept'),
  [ProjectStatus.Planning]: words('Planning'),
  [ProjectStatus.Approved]: words('Approved'),
  [ProjectStatus.Launched]: words('Launched'),
  [ProjectStatus.UnderConstruction]: words('UnderConstruction'),
  [ProjectStatus.Completed]: words('Completed'),
  [ProjectStatus.HandedOver]: words('HandedOver'),
  [ProjectStatus.Closed]: words('Closed'),
  [ProjectStatus.OnHold]: words('OnHold'),
};

/** A level in the project tree. The same entity models all of them so the tree can be any depth. */
export enum ProjectNodeKind {
  Phase = 1,
  Block = 2,
  Sector = 3,
  Tower = 4,
  Street = 5,
  Wing = 6,
  Cluster = 7,
  /** A storey inside a tower. Carries the floor number every unit on it inherits. */
  Floor = 8,
}

export const PROJECT_NODE_KIND_LABELS: Record<ProjectNodeKind, string> = {
  [ProjectNodeKind.Phase]: words('Phase'),
  [ProjectNodeKind.Block]: words('Block'),
  [ProjectNodeKind.Sector]: words('Sector'),
  [ProjectNodeKind.Tower]: words('Tower'),
  [ProjectNodeKind.Street]: words('Street'),
  [ProjectNodeKind.Wing]: words('Wing'),
  [ProjectNodeKind.Cluster]: words('Cluster'),
  [ProjectNodeKind.Floor]: words('Floor'),
};

export enum MilestoneStatus {
  NotStarted = 1,
  InProgress = 2,
  /** Reached, but not yet certified by the engineer. Does not release a demand. */
  Reached = 3,
  /** Certified. This is the state that raises a customer demand and allows a claim. */
  Certified = 4,
  Skipped = 5,
}

export const MILESTONE_STATUS_LABELS: Record<MilestoneStatus, string> = {
  [MilestoneStatus.NotStarted]: words('NotStarted'),
  [MilestoneStatus.InProgress]: words('InProgress'),
  [MilestoneStatus.Reached]: words('Reached'),
  [MilestoneStatus.Certified]: words('Certified'),
  [MilestoneStatus.Skipped]: words('Skipped'),
};

export enum HoldStatus {
  Active = 1,
  Converted = 2,
  Expired = 3,
  ReleasedManually = 4,
}

export const HOLD_STATUS_LABELS: Record<HoldStatus, string> = {
  [HoldStatus.Active]: words('Active'),
  [HoldStatus.Converted]: words('Converted'),
  [HoldStatus.Expired]: words('Expired'),
  [HoldStatus.ReleasedManually]: words('ReleasedManually'),
};

export enum BlockReason {
  OwnerQuota = 1,
  LandownerShare = 2,
  DealerAllocation = 3,
  PledgedToLender = 4,
  Litigation = 5,
  StructuralIssue = 6,
  ManagementHold = 7,
  StaffQuota = 8,
}

export const BLOCK_REASON_LABELS: Record<BlockReason, string> = {
  [BlockReason.OwnerQuota]: words('OwnerQuota'),
  [BlockReason.LandownerShare]: words('LandownerShare'),
  [BlockReason.DealerAllocation]: words('DealerAllocation'),
  [BlockReason.PledgedToLender]: words('PledgedToLender'),
  [BlockReason.Litigation]: words('Litigation'),
  [BlockReason.StructuralIssue]: words('StructuralIssue'),
  [BlockReason.ManagementHold]: words('ManagementHold'),
  [BlockReason.StaffQuota]: words('StaffQuota'),
};

/** What a premium or charge attaches to, which decides how it is computed. */
export enum ChargeBasis {
  /** A flat amount per unit. */
  Fixed = 1,
  /** A rate multiplied by the unit's saleable area. */
  PerAreaUnit = 2,
  /** A percentage of the base price. */
  PercentOfBase = 3,
  /** A percentage of the total consideration including other premiums. */
  PercentOfTotal = 4,
  /** A rate per floor above a datum — the floor-rise premium. */
  PerFloor = 5,
}

export const CHARGE_BASIS_LABELS: Record<ChargeBasis, string> = {
  [ChargeBasis.Fixed]: words('Fixed'),
  [ChargeBasis.PerAreaUnit]: words('PerAreaUnit'),
  [ChargeBasis.PercentOfBase]: words('PercentOfBase'),
  [ChargeBasis.PercentOfTotal]: words('PercentOfTotal'),
  [ChargeBasis.PerFloor]: words('PerFloor'),
};

export enum ChargeKind {
  BasePrice = 1,
  FloorRise = 2,
  Corner = 3,
  ParkFacing = 4,
  MainRoadFacing = 5,
  Boulevard = 6,
  View = 7,
  /** Preferential location charge — the catch-all premium. */
  Plc = 8,
  DevelopmentCharge = 9,
  ClubMembership = 10,
  UtilityConnection = 11,
  Parking = 12,
  MaintenanceAdvance = 13,
  CorpusFund = 14,
  Documentation = 15,
  StampDuty = 16,
  RegistrationFee = 17,
  Tax = 18,
  TransferFee = 19,
  PossessionCharge = 20,
  Other = 99,
}

export const CHARGE_KIND_LABELS: Record<ChargeKind, string> = {
  [ChargeKind.BasePrice]: words('BasePrice'),
  [ChargeKind.FloorRise]: words('FloorRise'),
  [ChargeKind.Corner]: words('Corner'),
  [ChargeKind.ParkFacing]: words('ParkFacing'),
  [ChargeKind.MainRoadFacing]: words('MainRoadFacing'),
  [ChargeKind.Boulevard]: words('Boulevard'),
  [ChargeKind.View]: words('View'),
  [ChargeKind.Plc]: words('Plc'),
  [ChargeKind.DevelopmentCharge]: words('DevelopmentCharge'),
  [ChargeKind.ClubMembership]: words('ClubMembership'),
  [ChargeKind.UtilityConnection]: words('UtilityConnection'),
  [ChargeKind.Parking]: words('Parking'),
  [ChargeKind.MaintenanceAdvance]: words('MaintenanceAdvance'),
  [ChargeKind.CorpusFund]: words('CorpusFund'),
  [ChargeKind.Documentation]: words('Documentation'),
  [ChargeKind.StampDuty]: words('StampDuty'),
  [ChargeKind.RegistrationFee]: words('RegistrationFee'),
  [ChargeKind.Tax]: words('Tax'),
  [ChargeKind.TransferFee]: words('TransferFee'),
  [ChargeKind.PossessionCharge]: words('PossessionCharge'),
  [ChargeKind.Other]: words('Other'),
};

export enum ListingKind {
  ForSale = 1,
  ForRent = 2,
  ForLease = 3,
  ForAuction = 4,
  /** Off-plan / pre-launch developer stock. */
  OffPlan = 5,
  Resale = 6,
  Exchange = 7,
  /** A requirement advertised rather than a property — "wanted". */
  Wanted = 8,
}

export const LISTING_KIND_LABELS: Record<ListingKind, string> = {
  [ListingKind.ForSale]: words('ForSale'),
  [ListingKind.ForRent]: words('ForRent'),
  [ListingKind.ForLease]: words('ForLease'),
  [ListingKind.ForAuction]: words('ForAuction'),
  [ListingKind.OffPlan]: words('OffPlan'),
  [ListingKind.Resale]: words('Resale'),
  [ListingKind.Exchange]: words('Exchange'),
  [ListingKind.Wanted]: words('Wanted'),
};

export enum ListingStatus {
  Draft = 1,
  PendingApproval = 2,
  Live = 3,
  UnderOffer = 4,
  /** Sold or let subject to contract — still ours, not yet completed. */
  SubjectToContract = 5,
  Completed = 6,
  Withdrawn = 7,
  Expired = 8,
  Rejected = 9,
}

export const LISTING_STATUS_LABELS: Record<ListingStatus, string> = {
  [ListingStatus.Draft]: words('Draft'),
  [ListingStatus.PendingApproval]: words('PendingApproval'),
  [ListingStatus.Live]: words('Live'),
  [ListingStatus.UnderOffer]: words('UnderOffer'),
  [ListingStatus.SubjectToContract]: words('SubjectToContract'),
  [ListingStatus.Completed]: words('Completed'),
  [ListingStatus.Withdrawn]: words('Withdrawn'),
  [ListingStatus.Expired]: words('Expired'),
  [ListingStatus.Rejected]: words('Rejected'),
};

/** The agency terms. Decides whether a fee is earned when someone else sells it. */
export enum AgencyBasis {
  SoleAgency = 1,
  SoleSellingRights = 2,
  JointSole = 3,
  MultipleAgency = 4,
  /** The firm is the owner. No instruction, no third-party fee. */
  OwnStock = 5,
}

export const AGENCY_BASIS_LABELS: Record<AgencyBasis, string> = {
  [AgencyBasis.SoleAgency]: words('SoleAgency'),
  [AgencyBasis.SoleSellingRights]: words('SoleSellingRights'),
  [AgencyBasis.JointSole]: words('JointSole'),
  [AgencyBasis.MultipleAgency]: words('MultipleAgency'),
  [AgencyBasis.OwnStock]: words('OwnStock'),
};

export enum FeeBasis {
  PercentOfPrice = 1,
  FixedAmount = 2,
  Tiered = 3,
  /** A number of weeks' or months' rent — the letting norm. */
  PeriodsOfRent = 4,
}

export const FEE_BASIS_LABELS: Record<FeeBasis, string> = {
  [FeeBasis.PercentOfPrice]: words('PercentOfPrice'),
  [FeeBasis.FixedAmount]: words('FixedAmount'),
  [FeeBasis.Tiered]: words('Tiered'),
  [FeeBasis.PeriodsOfRent]: words('PeriodsOfRent'),
};

export enum PortalPublishState {
  NotPublished = 1,
  Queued = 2,
  Published = 3,
  UpdatePending = 4,
  WithdrawPending = 5,
  Withdrawn = 6,
  Failed = 7,
  /** The portal accepted it but flagged content problems. */
  PublishedWithWarnings = 8,
}

export const PORTAL_PUBLISH_STATE_LABELS: Record<PortalPublishState, string> = {
  [PortalPublishState.NotPublished]: words('NotPublished'),
  [PortalPublishState.Queued]: words('Queued'),
  [PortalPublishState.Published]: words('Published'),
  [PortalPublishState.UpdatePending]: words('UpdatePending'),
  [PortalPublishState.WithdrawPending]: words('WithdrawPending'),
  [PortalPublishState.Withdrawn]: words('Withdrawn'),
  [PortalPublishState.Failed]: words('Failed'),
  [PortalPublishState.PublishedWithWarnings]: words('PublishedWithWarnings'),
};

/**
 * A party's role is additive: the same person is frequently a buyer on one unit and a landlord
 * of another, and the 360 has to show both.
 */
export enum PartyRoleKind {
  Lead = 1,
  Buyer = 2,
  Seller = 3,
  Landlord = 4,
  Tenant = 5,
  Investor = 6,
  Guarantor = 7,
  Nominee = 8,
  CoApplicant = 9,
  Resident = 10,
  ChannelPartner = 11,
  Contractor = 12,
  Supplier = 13,
  Solicitor = 14,
  Lender = 15,
  Landowner = 16,
  Client = 17,
}

export const PARTY_ROLE_KIND_LABELS: Record<PartyRoleKind, string> = {
  [PartyRoleKind.Lead]: words('Lead'),
  [PartyRoleKind.Buyer]: words('Buyer'),
  [PartyRoleKind.Seller]: words('Seller'),
  [PartyRoleKind.Landlord]: words('Landlord'),
  [PartyRoleKind.Tenant]: words('Tenant'),
  [PartyRoleKind.Investor]: words('Investor'),
  [PartyRoleKind.Guarantor]: words('Guarantor'),
  [PartyRoleKind.Nominee]: words('Nominee'),
  [PartyRoleKind.CoApplicant]: words('CoApplicant'),
  [PartyRoleKind.Resident]: words('Resident'),
  [PartyRoleKind.ChannelPartner]: words('ChannelPartner'),
  [PartyRoleKind.Contractor]: words('Contractor'),
  [PartyRoleKind.Supplier]: words('Supplier'),
  [PartyRoleKind.Solicitor]: words('Solicitor'),
  [PartyRoleKind.Lender]: words('Lender'),
  [PartyRoleKind.Landowner]: words('Landowner'),
  [PartyRoleKind.Client]: words('Client'),
};

export enum PartyKind {
  Individual = 1,
  Organisation = 2,
  /** Two or more people buying together as one applicant set. */
  Joint = 3,
  Trust = 4,
  GovernmentBody = 5,
}

export const PARTY_KIND_LABELS: Record<PartyKind, string> = {
  [PartyKind.Individual]: words('Individual'),
  [PartyKind.Organisation]: words('Organisation'),
  [PartyKind.Joint]: words('Joint'),
  [PartyKind.Trust]: words('Trust'),
  [PartyKind.GovernmentBody]: words('GovernmentBody'),
};

export enum IdentityKind {
  NationalId = 1,
  Passport = 2,
  DrivingLicence = 3,
  TaxNumber = 4,
  CompanyRegistration = 5,
  ResidencePermit = 6,
  Other = 99,
}

export const IDENTITY_KIND_LABELS: Record<IdentityKind, string> = {
  [IdentityKind.NationalId]: words('NationalId'),
  [IdentityKind.Passport]: words('Passport'),
  [IdentityKind.DrivingLicence]: words('DrivingLicence'),
  [IdentityKind.TaxNumber]: words('TaxNumber'),
  [IdentityKind.CompanyRegistration]: words('CompanyRegistration'),
  [IdentityKind.ResidencePermit]: words('ResidencePermit'),
  [IdentityKind.Other]: words('Other'),
};

export enum KycStatus {
  NotStarted = 1,
  InProgress = 2,
  PendingVerification = 3,
  Verified = 4,
  Rejected = 5,
  Expired = 6,
  /** Verified but flagged for enhanced due diligence — PEP, high value, high-risk market. */
  EnhancedReview = 7,
}

export const KYC_STATUS_LABELS: Record<KycStatus, string> = {
  [KycStatus.NotStarted]: words('NotStarted'),
  [KycStatus.InProgress]: words('InProgress'),
  [KycStatus.PendingVerification]: words('PendingVerification'),
  [KycStatus.Verified]: words('Verified'),
  [KycStatus.Rejected]: words('Rejected'),
  [KycStatus.Expired]: words('Expired'),
  [KycStatus.EnhancedReview]: words('EnhancedReview'),
};

export enum RiskRating {
  Low = 1,
  Medium = 2,
  High = 3,
  Prohibited = 4,
}

export const RISK_RATING_LABELS: Record<RiskRating, string> = {
  [RiskRating.Low]: words('Low'),
  [RiskRating.Medium]: words('Medium'),
  [RiskRating.High]: words('High'),
  [RiskRating.Prohibited]: words('Prohibited'),
};

export enum EnquiryStage {
  New = 1,
  Contacted = 2,
  Qualified = 3,
  ViewingBooked = 4,
  Viewed = 5,
  Revisit = 6,
  Negotiation = 7,
  OfferMade = 8,
  /** Token or EOI taken — developer path. */
  Tokened = 9,
  Agreed = 10,
  Booked = 11,
  Completed = 12,
  Lost = 13,
  /** Parked in the nurture list rather than lost. */
  Dormant = 14,
}

export const ENQUIRY_STAGE_LABELS: Record<EnquiryStage, string> = {
  [EnquiryStage.New]: words('New'),
  [EnquiryStage.Contacted]: words('Contacted'),
  [EnquiryStage.Qualified]: words('Qualified'),
  [EnquiryStage.ViewingBooked]: words('ViewingBooked'),
  [EnquiryStage.Viewed]: words('Viewed'),
  [EnquiryStage.Revisit]: words('Revisit'),
  [EnquiryStage.Negotiation]: words('Negotiation'),
  [EnquiryStage.OfferMade]: words('OfferMade'),
  [EnquiryStage.Tokened]: words('Tokened'),
  [EnquiryStage.Agreed]: words('Agreed'),
  [EnquiryStage.Booked]: words('Booked'),
  [EnquiryStage.Completed]: words('Completed'),
  [EnquiryStage.Lost]: words('Lost'),
  [EnquiryStage.Dormant]: words('Dormant'),
};

export enum EnquiryChannel {
  Website = 1,
  Portal = 2,
  Phone = 3,
  WhatsApp = 4,
  WalkIn = 5,
  Referral = 6,
  Campaign = 7,
  QrCode = 8,
  ChannelPartner = 9,
  Exhibition = 10,
  ColdCall = 11,
  Chatbot = 12,
  Email = 13,
  SocialMedia = 14,
  Manual = 15,
}

export const ENQUIRY_CHANNEL_LABELS: Record<EnquiryChannel, string> = {
  [EnquiryChannel.Website]: words('Website'),
  [EnquiryChannel.Portal]: words('Portal'),
  [EnquiryChannel.Phone]: words('Phone'),
  [EnquiryChannel.WhatsApp]: words('WhatsApp'),
  [EnquiryChannel.WalkIn]: words('WalkIn'),
  [EnquiryChannel.Referral]: words('Referral'),
  [EnquiryChannel.Campaign]: words('Campaign'),
  [EnquiryChannel.QrCode]: words('QrCode'),
  [EnquiryChannel.ChannelPartner]: words('ChannelPartner'),
  [EnquiryChannel.Exhibition]: words('Exhibition'),
  [EnquiryChannel.ColdCall]: words('ColdCall'),
  [EnquiryChannel.Chatbot]: words('Chatbot'),
  [EnquiryChannel.Email]: words('Email'),
  [EnquiryChannel.SocialMedia]: words('SocialMedia'),
  [EnquiryChannel.Manual]: words('Manual'),
};

export enum BuyingPurpose {
  OwnUse = 1,
  Investment = 2,
  RentalYield = 3,
  Resale = 4,
  BusinessPremises = 5,
}

export const BUYING_PURPOSE_LABELS: Record<BuyingPurpose, string> = {
  [BuyingPurpose.OwnUse]: words('OwnUse'),
  [BuyingPurpose.Investment]: words('Investment'),
  [BuyingPurpose.RentalYield]: words('RentalYield'),
  [BuyingPurpose.Resale]: words('Resale'),
  [BuyingPurpose.BusinessPremises]: words('BusinessPremises'),
};

export enum FundingKind {
  Cash = 1,
  Mortgage = 2,
  Instalments = 3,
  SaleOfExisting = 4,
  CompanyFunds = 5,
  Undecided = 6,
}

export const FUNDING_KIND_LABELS: Record<FundingKind, string> = {
  [FundingKind.Cash]: words('Cash'),
  [FundingKind.Mortgage]: words('Mortgage'),
  [FundingKind.Instalments]: words('Instalments'),
  [FundingKind.SaleOfExisting]: words('SaleOfExisting'),
  [FundingKind.CompanyFunds]: words('CompanyFunds'),
  [FundingKind.Undecided]: words('Undecided'),
};

export enum ActivityKind {
  Call = 1,
  WhatsApp = 2,
  Email = 3,
  Sms = 4,
  Meeting = 5,
  Viewing = 6,
  SiteVisit = 7,
  Note = 8,
  DocumentSent = 9,
  PortalMessage = 10,
  StatusChange = 11,
  Task = 12,
}

export const ACTIVITY_KIND_LABELS: Record<ActivityKind, string> = {
  [ActivityKind.Call]: words('Call'),
  [ActivityKind.WhatsApp]: words('WhatsApp'),
  [ActivityKind.Email]: words('Email'),
  [ActivityKind.Sms]: words('Sms'),
  [ActivityKind.Meeting]: words('Meeting'),
  [ActivityKind.Viewing]: words('Viewing'),
  [ActivityKind.SiteVisit]: words('SiteVisit'),
  [ActivityKind.Note]: words('Note'),
  [ActivityKind.DocumentSent]: words('DocumentSent'),
  [ActivityKind.PortalMessage]: words('PortalMessage'),
  [ActivityKind.StatusChange]: words('StatusChange'),
  [ActivityKind.Task]: words('Task'),
};

export enum ActivityDirection {
  Outbound = 1,
  Inbound = 2,
  Internal = 3,
}

export const ACTIVITY_DIRECTION_LABELS: Record<ActivityDirection, string> = {
  [ActivityDirection.Outbound]: words('Outbound'),
  [ActivityDirection.Inbound]: words('Inbound'),
  [ActivityDirection.Internal]: words('Internal'),
};

export enum TaskState {
  Open = 1,
  Done = 2,
  Cancelled = 3,
  Overdue = 4,
}

export const TASK_STATE_LABELS: Record<TaskState, string> = {
  [TaskState.Open]: words('Open'),
  [TaskState.Done]: words('Done'),
  [TaskState.Cancelled]: words('Cancelled'),
  [TaskState.Overdue]: words('Overdue'),
};

export enum ViewingStatus {
  Scheduled = 1,
  Confirmed = 2,
  Completed = 3,
  Cancelled = 4,
  NoShow = 5,
  Rescheduled = 6,
}

export const VIEWING_STATUS_LABELS: Record<ViewingStatus, string> = {
  [ViewingStatus.Scheduled]: words('Scheduled'),
  [ViewingStatus.Confirmed]: words('Confirmed'),
  [ViewingStatus.Completed]: words('Completed'),
  [ViewingStatus.Cancelled]: words('Cancelled'),
  [ViewingStatus.NoShow]: words('NoShow'),
  [ViewingStatus.Rescheduled]: words('Rescheduled'),
};

export enum InterestLevel {
  NotInterested = 1,
  Lukewarm = 2,
  Interested = 3,
  VeryInterested = 4,
  ReadyToProceed = 5,
}

export const INTEREST_LEVEL_LABELS: Record<InterestLevel, string> = {
  [InterestLevel.NotInterested]: words('NotInterested'),
  [InterestLevel.Lukewarm]: words('Lukewarm'),
  [InterestLevel.Interested]: words('Interested'),
  [InterestLevel.VeryInterested]: words('VeryInterested'),
  [InterestLevel.ReadyToProceed]: words('ReadyToProceed'),
};

export enum AccessArrangement {
  AgentHasKeys = 1,
  KeySafe = 2,
  VendorPresent = 3,
  TenantPresent = 4,
  Concierge = 5,
  SiteOffice = 6,
}

export const ACCESS_ARRANGEMENT_LABELS: Record<AccessArrangement, string> = {
  [AccessArrangement.AgentHasKeys]: words('AgentHasKeys'),
  [AccessArrangement.KeySafe]: words('KeySafe'),
  [AccessArrangement.VendorPresent]: words('VendorPresent'),
  [AccessArrangement.TenantPresent]: words('TenantPresent'),
  [AccessArrangement.Concierge]: words('Concierge'),
  [AccessArrangement.SiteOffice]: words('SiteOffice'),
};

export enum TransportArrangement {
  OwnTransport = 1,
  CompanyCab = 2,
  PickUp = 3,
  Shuttle = 4,
}

export const TRANSPORT_ARRANGEMENT_LABELS: Record<TransportArrangement, string> = {
  [TransportArrangement.OwnTransport]: words('OwnTransport'),
  [TransportArrangement.CompanyCab]: words('CompanyCab'),
  [TransportArrangement.PickUp]: words('PickUp'),
  [TransportArrangement.Shuttle]: words('Shuttle'),
};

export enum OfferStatus {
  Submitted = 1,
  UnderConsideration = 2,
  Countered = 3,
  Accepted = 4,
  Rejected = 5,
  Withdrawn = 6,
  Lapsed = 7,
}

export const OFFER_STATUS_LABELS: Record<OfferStatus, string> = {
  [OfferStatus.Submitted]: words('Submitted'),
  [OfferStatus.UnderConsideration]: words('UnderConsideration'),
  [OfferStatus.Countered]: words('Countered'),
  [OfferStatus.Accepted]: words('Accepted'),
  [OfferStatus.Rejected]: words('Rejected'),
  [OfferStatus.Withdrawn]: words('Withdrawn'),
  [OfferStatus.Lapsed]: words('Lapsed'),
};

export enum OfferConditionKind {
  SubjectToSurvey = 1,
  SubjectToMortgage = 2,
  SubjectToSaleOfOwn = 3,
  SubjectToPlanning = 4,
  ChainFree = 5,
  VacantPossession = 6,
  Other = 99,
}

export const OFFER_CONDITION_KIND_LABELS: Record<OfferConditionKind, string> = {
  [OfferConditionKind.SubjectToSurvey]: words('SubjectToSurvey'),
  [OfferConditionKind.SubjectToMortgage]: words('SubjectToMortgage'),
  [OfferConditionKind.SubjectToSaleOfOwn]: words('SubjectToSaleOfOwn'),
  [OfferConditionKind.SubjectToPlanning]: words('SubjectToPlanning'),
  [OfferConditionKind.ChainFree]: words('ChainFree'),
  [OfferConditionKind.VacantPossession]: words('VacantPossession'),
  [OfferConditionKind.Other]: words('Other'),
};

export enum ReservationStatus {
  Active = 1,
  ConvertedToBooking = 2,
  Expired = 3,
  Refunded = 4,
  Forfeited = 5,
  Cancelled = 6,
}

export const RESERVATION_STATUS_LABELS: Record<ReservationStatus, string> = {
  [ReservationStatus.Active]: words('Active'),
  [ReservationStatus.ConvertedToBooking]: words('ConvertedToBooking'),
  [ReservationStatus.Expired]: words('Expired'),
  [ReservationStatus.Refunded]: words('Refunded'),
  [ReservationStatus.Forfeited]: words('Forfeited'),
  [ReservationStatus.Cancelled]: words('Cancelled'),
};

export enum BookingStatus {
  /** Written but not yet paid for. The unit is held, not sold. */
  Provisional = 1,
  PendingApproval = 2,
  Confirmed = 3,
  AgreementSigned = 4,
  /** Behind on the plan and inside the dunning ladder. */
  Defaulting = 5,
  UnderCancellation = 6,
  Cancelled = 7,
  Transferred = 8,
  PossessionOffered = 9,
  Possessed = 10,
  Completed = 11,
}

export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  [BookingStatus.Provisional]: words('Provisional'),
  [BookingStatus.PendingApproval]: words('PendingApproval'),
  [BookingStatus.Confirmed]: words('Confirmed'),
  [BookingStatus.AgreementSigned]: words('AgreementSigned'),
  [BookingStatus.Defaulting]: words('Defaulting'),
  [BookingStatus.UnderCancellation]: words('UnderCancellation'),
  [BookingStatus.Cancelled]: words('Cancelled'),
  [BookingStatus.Transferred]: words('Transferred'),
  [BookingStatus.PossessionOffered]: words('PossessionOffered'),
  [BookingStatus.Possessed]: words('Possessed'),
  [BookingStatus.Completed]: words('Completed'),
};

export enum SourcingChannel {
  /** Walked in or came through our own marketing. No third-party commission. */
  Direct = 1,
  InHouseAgent = 2,
  ChannelPartner = 3,
  Referral = 4,
  OnlinePortal = 5,
  Campaign = 6,
}

export const SOURCING_CHANNEL_LABELS: Record<SourcingChannel, string> = {
  [SourcingChannel.Direct]: words('Direct'),
  [SourcingChannel.InHouseAgent]: words('InHouseAgent'),
  [SourcingChannel.ChannelPartner]: words('ChannelPartner'),
  [SourcingChannel.Referral]: words('Referral'),
  [SourcingChannel.OnlinePortal]: words('OnlinePortal'),
  [SourcingChannel.Campaign]: words('Campaign'),
};

export enum BallotStatus {
  Draft = 1,
  PoolLocked = 2,
  Drawn = 3,
  Published = 4,
  Cancelled = 5,
}

export const BALLOT_STATUS_LABELS: Record<BallotStatus, string> = {
  [BallotStatus.Draft]: words('Draft'),
  [BallotStatus.PoolLocked]: words('PoolLocked'),
  [BallotStatus.Drawn]: words('Drawn'),
  [BallotStatus.Published]: words('Published'),
  [BallotStatus.Cancelled]: words('Cancelled'),
};

export enum AllotmentStatus {
  Issued = 1,
  Reissued = 2,
  Superseded = 3,
  Cancelled = 4,
}

export const ALLOTMENT_STATUS_LABELS: Record<AllotmentStatus, string> = {
  [AllotmentStatus.Issued]: words('Issued'),
  [AllotmentStatus.Reissued]: words('Reissued'),
  [AllotmentStatus.Superseded]: words('Superseded'),
  [AllotmentStatus.Cancelled]: words('Cancelled'),
};

export enum InstalmentKind {
  BookingAmount = 1,
  ConfirmationAmount = 2,
  /** The regular periodic instalment. */
  Periodic = 3,
  /** The extra half-yearly or annual lump South Asian plans layer on top. */
  Balloon = 4,
  /** Falls due when a construction milestone is certified, not on a date. */
  MilestoneLinked = 5,
  PossessionBalance = 6,
  PostPossession = 7,
  Charge = 8,
}

export const INSTALMENT_KIND_LABELS: Record<InstalmentKind, string> = {
  [InstalmentKind.BookingAmount]: words('BookingAmount'),
  [InstalmentKind.ConfirmationAmount]: words('ConfirmationAmount'),
  [InstalmentKind.Periodic]: words('Periodic'),
  [InstalmentKind.Balloon]: words('Balloon'),
  [InstalmentKind.MilestoneLinked]: words('MilestoneLinked'),
  [InstalmentKind.PossessionBalance]: words('PossessionBalance'),
  [InstalmentKind.PostPossession]: words('PostPossession'),
  [InstalmentKind.Charge]: words('Charge'),
};

export enum InstalmentFrequency {
  Monthly = 1,
  BiMonthly = 2,
  Quarterly = 3,
  HalfYearly = 4,
  Yearly = 5,
  OneOff = 6,
  Custom = 7,
}

export const INSTALMENT_FREQUENCY_LABELS: Record<InstalmentFrequency, string> = {
  [InstalmentFrequency.Monthly]: words('Monthly'),
  [InstalmentFrequency.BiMonthly]: words('BiMonthly'),
  [InstalmentFrequency.Quarterly]: words('Quarterly'),
  [InstalmentFrequency.HalfYearly]: words('HalfYearly'),
  [InstalmentFrequency.Yearly]: words('Yearly'),
  [InstalmentFrequency.OneOff]: words('OneOff'),
  [InstalmentFrequency.Custom]: words('Custom'),
};

export enum InstalmentStatus {
  NotDue = 1,
  Due = 2,
  PartiallyPaid = 3,
  Paid = 4,
  Overdue = 5,
  Waived = 6,
  Cancelled = 7,
  /** Rolled into a restructured plan; kept for history but no longer collectable. */
  Restructured = 8,
}

export const INSTALMENT_STATUS_LABELS: Record<InstalmentStatus, string> = {
  [InstalmentStatus.NotDue]: words('NotDue'),
  [InstalmentStatus.Due]: words('Due'),
  [InstalmentStatus.PartiallyPaid]: words('PartiallyPaid'),
  [InstalmentStatus.Paid]: words('Paid'),
  [InstalmentStatus.Overdue]: words('Overdue'),
  [InstalmentStatus.Waived]: words('Waived'),
  [InstalmentStatus.Cancelled]: words('Cancelled'),
  [InstalmentStatus.Restructured]: words('Restructured'),
};

export enum DemandStatus {
  Draft = 1,
  Generated = 2,
  Sent = 3,
  Acknowledged = 4,
  Settled = 5,
  Cancelled = 6,
  Failed = 7,
}

export const DEMAND_STATUS_LABELS: Record<DemandStatus, string> = {
  [DemandStatus.Draft]: words('Draft'),
  [DemandStatus.Generated]: words('Generated'),
  [DemandStatus.Sent]: words('Sent'),
  [DemandStatus.Acknowledged]: words('Acknowledged'),
  [DemandStatus.Settled]: words('Settled'),
  [DemandStatus.Cancelled]: words('Cancelled'),
  [DemandStatus.Failed]: words('Failed'),
};

/** How the late-payment surcharge accrues. Getting this wrong is the top dispute source. */
export enum SurchargeBasis {
  /** Rate per day on the overdue amount. */
  PerDayOnOverdue = 1,
  /** Rate per month on the overdue amount, part months counted whole. */
  PerMonthOnOverdue = 2,
  /** Rate per month on the whole outstanding balance, not just what is late. */
  PerMonthOnOutstanding = 3,
  /** A flat penalty per missed instalment, regardless of how late. */
  FlatPerInstalment = 4,
}

export const SURCHARGE_BASIS_LABELS: Record<SurchargeBasis, string> = {
  [SurchargeBasis.PerDayOnOverdue]: words('PerDayOnOverdue'),
  [SurchargeBasis.PerMonthOnOverdue]: words('PerMonthOnOverdue'),
  [SurchargeBasis.PerMonthOnOutstanding]: words('PerMonthOnOutstanding'),
  [SurchargeBasis.FlatPerInstalment]: words('FlatPerInstalment'),
};

export enum PaymentInstrument {
  Cash = 1,
  Cheque = 2,
  BankTransfer = 3,
  Online = 4,
  Card = 5,
  DemandDraft = 6,
  PayOrder = 7,
  /** Adjusted against a credit the customer already holds. */
  Adjustment = 8,
  Cryptocurrency = 9,
}

export const PAYMENT_INSTRUMENT_LABELS: Record<PaymentInstrument, string> = {
  [PaymentInstrument.Cash]: words('Cash'),
  [PaymentInstrument.Cheque]: words('Cheque'),
  [PaymentInstrument.BankTransfer]: words('BankTransfer'),
  [PaymentInstrument.Online]: words('Online'),
  [PaymentInstrument.Card]: words('Card'),
  [PaymentInstrument.DemandDraft]: words('DemandDraft'),
  [PaymentInstrument.PayOrder]: words('PayOrder'),
  [PaymentInstrument.Adjustment]: words('Adjustment'),
  [PaymentInstrument.Cryptocurrency]: words('Cryptocurrency'),
};

export enum ChequeState {
  Received = 1,
  Deposited = 2,
  Cleared = 3,
  Bounced = 4,
  /** Handed back to the customer, usually on cancellation. */
  Returned = 5,
  /** Post-dated and not yet at its maturity date. */
  Pending = 6,
  StopPayment = 7,
}

export const CHEQUE_STATE_LABELS: Record<ChequeState, string> = {
  [ChequeState.Received]: words('Received'),
  [ChequeState.Deposited]: words('Deposited'),
  [ChequeState.Cleared]: words('Cleared'),
  [ChequeState.Bounced]: words('Bounced'),
  [ChequeState.Returned]: words('Returned'),
  [ChequeState.Pending]: words('Pending'),
  [ChequeState.StopPayment]: words('StopPayment'),
};

export enum ReceiptStatus {
  Draft = 1,
  Posted = 2,
  /** Money in, but not yet applied to any instalment. Visible, never lost. */
  OnAccount = 3,
  Reversed = 4,
  Cancelled = 5,
}

export const RECEIPT_STATUS_LABELS: Record<ReceiptStatus, string> = {
  [ReceiptStatus.Draft]: words('Draft'),
  [ReceiptStatus.Posted]: words('Posted'),
  [ReceiptStatus.OnAccount]: words('OnAccount'),
  [ReceiptStatus.Reversed]: words('Reversed'),
  [ReceiptStatus.Cancelled]: words('Cancelled'),
};

/** The order a receipt is consumed in. Configurable, because firms genuinely differ. */
export enum AllocationOrder {
  /** Surcharge, then oldest instalment, then charges. The common default. */
  SurchargeFirstThenOldest = 1,
  /** Oldest instalment first, surcharge last. Customer-friendly. */
  OldestFirstThenSurcharge = 2,
  /** Principal only; surcharge is chased separately. */
  PrincipalOnly = 3,
  /** Nothing automatic — a human decides every time. */
  Manual = 4,
}

export const ALLOCATION_ORDER_LABELS: Record<AllocationOrder, string> = {
  [AllocationOrder.SurchargeFirstThenOldest]: words('SurchargeFirstThenOldest'),
  [AllocationOrder.OldestFirstThenSurcharge]: words('OldestFirstThenSurcharge'),
  [AllocationOrder.PrincipalOnly]: words('PrincipalOnly'),
  [AllocationOrder.Manual]: words('Manual'),
};

export enum LedgerEntryKind {
  Demand = 1,
  Receipt = 2,
  Surcharge = 3,
  SurchargeWaiver = 4,
  Adjustment = 5,
  Refund = 6,
  Forfeiture = 7,
  Discount = 8,
  Tax = 9,
  Reversal = 10,
  OpeningBalance = 11,
  TransferIn = 12,
  TransferOut = 13,
}

export const LEDGER_ENTRY_KIND_LABELS: Record<LedgerEntryKind, string> = {
  [LedgerEntryKind.Demand]: words('Demand'),
  [LedgerEntryKind.Receipt]: words('Receipt'),
  [LedgerEntryKind.Surcharge]: words('Surcharge'),
  [LedgerEntryKind.SurchargeWaiver]: words('SurchargeWaiver'),
  [LedgerEntryKind.Adjustment]: words('Adjustment'),
  [LedgerEntryKind.Refund]: words('Refund'),
  [LedgerEntryKind.Forfeiture]: words('Forfeiture'),
  [LedgerEntryKind.Discount]: words('Discount'),
  [LedgerEntryKind.Tax]: words('Tax'),
  [LedgerEntryKind.Reversal]: words('Reversal'),
  [LedgerEntryKind.OpeningBalance]: words('OpeningBalance'),
  [LedgerEntryKind.TransferIn]: words('TransferIn'),
  [LedgerEntryKind.TransferOut]: words('TransferOut'),
};

export enum DunningAction {
  None = 1,
  SendReminder = 2,
  CreateCallTask = 3,
  ApplySurcharge = 4,
  IssueNotice = 5,
  IssueFinalNotice = 6,
  SuspendServices = 7,
  ReferToLegal = 8,
  ProposeCancellation = 9,
}

export const DUNNING_ACTION_LABELS: Record<DunningAction, string> = {
  [DunningAction.None]: words('None'),
  [DunningAction.SendReminder]: words('SendReminder'),
  [DunningAction.CreateCallTask]: words('CreateCallTask'),
  [DunningAction.ApplySurcharge]: words('ApplySurcharge'),
  [DunningAction.IssueNotice]: words('IssueNotice'),
  [DunningAction.IssueFinalNotice]: words('IssueFinalNotice'),
  [DunningAction.SuspendServices]: words('SuspendServices'),
  [DunningAction.ReferToLegal]: words('ReferToLegal'),
  [DunningAction.ProposeCancellation]: words('ProposeCancellation'),
};

export enum NotificationChannel {
  InApp = 1,
  Email = 2,
  Sms = 3,
  WhatsApp = 4,
  Push = 5,
  Post = 6,
  Call = 7,
}

export const NOTIFICATION_CHANNEL_LABELS: Record<NotificationChannel, string> = {
  [NotificationChannel.InApp]: words('InApp'),
  [NotificationChannel.Email]: words('Email'),
  [NotificationChannel.Sms]: words('Sms'),
  [NotificationChannel.WhatsApp]: words('WhatsApp'),
  [NotificationChannel.Push]: words('Push'),
  [NotificationChannel.Post]: words('Post'),
  [NotificationChannel.Call]: words('Call'),
};

export enum PromiseState {
  Open = 1,
  Kept = 2,
  Broken = 3,
  Cancelled = 4,
}

export const PROMISE_STATE_LABELS: Record<PromiseState, string> = {
  [PromiseState.Open]: words('Open'),
  [PromiseState.Kept]: words('Kept'),
  [PromiseState.Broken]: words('Broken'),
  [PromiseState.Cancelled]: words('Cancelled'),
};

export enum CancellationTrigger {
  CustomerWithdrawal = 1,
  Default = 2,
  /** The developer cancelled — project abandoned, plan changed, regulatory. */
  DeveloperInitiated = 3,
  MutualAgreement = 4,
  DeathOfApplicant = 5,
  Fraud = 6,
}

export const CANCELLATION_TRIGGER_LABELS: Record<CancellationTrigger, string> = {
  [CancellationTrigger.CustomerWithdrawal]: words('CustomerWithdrawal'),
  [CancellationTrigger.Default]: words('Default'),
  [CancellationTrigger.DeveloperInitiated]: words('DeveloperInitiated'),
  [CancellationTrigger.MutualAgreement]: words('MutualAgreement'),
  [CancellationTrigger.DeathOfApplicant]: words('DeathOfApplicant'),
  [CancellationTrigger.Fraud]: words('Fraud'),
};

export enum DeductionBasis {
  ForfeitBookingAmount = 1,
  PercentOfPrice = 2,
  PercentOfPaid = 3,
  /** A slab that depends on how far into the plan the cancellation falls. */
  SlabByElapsed = 4,
  FlatAmount = 5,
  NoDeduction = 6,
}

export const DEDUCTION_BASIS_LABELS: Record<DeductionBasis, string> = {
  [DeductionBasis.ForfeitBookingAmount]: words('ForfeitBookingAmount'),
  [DeductionBasis.PercentOfPrice]: words('PercentOfPrice'),
  [DeductionBasis.PercentOfPaid]: words('PercentOfPaid'),
  [DeductionBasis.SlabByElapsed]: words('SlabByElapsed'),
  [DeductionBasis.FlatAmount]: words('FlatAmount'),
  [DeductionBasis.NoDeduction]: words('NoDeduction'),
};

export enum RefundStatus {
  Requested = 1,
  Calculated = 2,
  Approved = 3,
  Scheduled = 4,
  PartiallyPaid = 5,
  Paid = 6,
  Rejected = 7,
  /** Payable only once the unit resells — a real and common term. */
  AwaitingResale = 8,
}

export const REFUND_STATUS_LABELS: Record<RefundStatus, string> = {
  [RefundStatus.Requested]: words('Requested'),
  [RefundStatus.Calculated]: words('Calculated'),
  [RefundStatus.Approved]: words('Approved'),
  [RefundStatus.Scheduled]: words('Scheduled'),
  [RefundStatus.PartiallyPaid]: words('PartiallyPaid'),
  [RefundStatus.Paid]: words('Paid'),
  [RefundStatus.Rejected]: words('Rejected'),
  [RefundStatus.AwaitingResale]: words('AwaitingResale'),
};

export enum TransferKind {
  Sale = 1,
  Gift = 2,
  Inheritance = 3,
  CourtDecree = 4,
  PowerOfAttorney = 5,
  /** Only part of a share moves; both parties remain owners. */
  PartialShare = 6,
  /** Same owner, different unit. */
  UnitChange = 7,
  NameCorrection = 8,
}

export const TRANSFER_KIND_LABELS: Record<TransferKind, string> = {
  [TransferKind.Sale]: words('Sale'),
  [TransferKind.Gift]: words('Gift'),
  [TransferKind.Inheritance]: words('Inheritance'),
  [TransferKind.CourtDecree]: words('CourtDecree'),
  [TransferKind.PowerOfAttorney]: words('PowerOfAttorney'),
  [TransferKind.PartialShare]: words('PartialShare'),
  [TransferKind.UnitChange]: words('UnitChange'),
  [TransferKind.NameCorrection]: words('NameCorrection'),
};

export enum TransferStatus {
  Requested = 1,
  DuesCheckPending = 2,
  /** Dues outstanding. Blocked until cleared or an authority overrides. */
  BlockedOnDues = 3,
  DocumentsPending = 4,
  NocIssued = 5,
  FeesPending = 6,
  SessionScheduled = 7,
  Completed = 8,
  Rejected = 9,
  Cancelled = 10,
}

export const TRANSFER_STATUS_LABELS: Record<TransferStatus, string> = {
  [TransferStatus.Requested]: words('Requested'),
  [TransferStatus.DuesCheckPending]: words('DuesCheckPending'),
  [TransferStatus.BlockedOnDues]: words('BlockedOnDues'),
  [TransferStatus.DocumentsPending]: words('DocumentsPending'),
  [TransferStatus.NocIssued]: words('NocIssued'),
  [TransferStatus.FeesPending]: words('FeesPending'),
  [TransferStatus.SessionScheduled]: words('SessionScheduled'),
  [TransferStatus.Completed]: words('Completed'),
  [TransferStatus.Rejected]: words('Rejected'),
  [TransferStatus.Cancelled]: words('Cancelled'),
};

export enum PossessionStatus {
  NotEligible = 1,
  Eligible = 2,
  Offered = 3,
  AppointmentSet = 4,
  InspectionDone = 5,
  /** Critical snags found. Handover blocked until they close. */
  SnagsOutstanding = 6,
  HandedOver = 7,
  Declined = 8,
}

export const POSSESSION_STATUS_LABELS: Record<PossessionStatus, string> = {
  [PossessionStatus.NotEligible]: words('NotEligible'),
  [PossessionStatus.Eligible]: words('Eligible'),
  [PossessionStatus.Offered]: words('Offered'),
  [PossessionStatus.AppointmentSet]: words('AppointmentSet'),
  [PossessionStatus.InspectionDone]: words('InspectionDone'),
  [PossessionStatus.SnagsOutstanding]: words('SnagsOutstanding'),
  [PossessionStatus.HandedOver]: words('HandedOver'),
  [PossessionStatus.Declined]: words('Declined'),
};

export enum SnagSeverity {
  /** Must be fixed before handover. Blocks possession. */
  Critical = 1,
  /** Fixed within the agreed window after handover. */
  Major = 2,
  /** Cosmetic. Fixed inside the defect liability period. */
  Minor = 3,
}

export const SNAG_SEVERITY_LABELS: Record<SnagSeverity, string> = {
  [SnagSeverity.Critical]: words('Critical'),
  [SnagSeverity.Major]: words('Major'),
  [SnagSeverity.Minor]: words('Minor'),
};

export enum SnagZone {
  Structure = 1,
  WallsAndFinishes = 2,
  Floors = 3,
  DoorsAndWindows = 4,
  Electrical = 5,
  PlumbingAndSanitary = 6,
  Hvac = 7,
  ExternalAndCommon = 8,
}

export const SNAG_ZONE_LABELS: Record<SnagZone, string> = {
  [SnagZone.Structure]: words('Structure'),
  [SnagZone.WallsAndFinishes]: words('WallsAndFinishes'),
  [SnagZone.Floors]: words('Floors'),
  [SnagZone.DoorsAndWindows]: words('DoorsAndWindows'),
  [SnagZone.Electrical]: words('Electrical'),
  [SnagZone.PlumbingAndSanitary]: words('PlumbingAndSanitary'),
  [SnagZone.Hvac]: words('Hvac'),
  [SnagZone.ExternalAndCommon]: words('ExternalAndCommon'),
};

export enum SnagStatus {
  Open = 1,
  Assigned = 2,
  InProgress = 3,
  Fixed = 4,
  /** Fixed and re-inspected. Only this state closes it. */
  Verified = 5,
  Rejected = 6,
  Deferred = 7,
}

export const SNAG_STATUS_LABELS: Record<SnagStatus, string> = {
  [SnagStatus.Open]: words('Open'),
  [SnagStatus.Assigned]: words('Assigned'),
  [SnagStatus.InProgress]: words('InProgress'),
  [SnagStatus.Fixed]: words('Fixed'),
  [SnagStatus.Verified]: words('Verified'),
  [SnagStatus.Rejected]: words('Rejected'),
  [SnagStatus.Deferred]: words('Deferred'),
};

export enum DefectCategory {
  Structural = 1,
  Workmanship = 2,
  Services = 3,
  Waterproofing = 4,
  Finishes = 5,
  Equipment = 6,
}

export const DEFECT_CATEGORY_LABELS: Record<DefectCategory, string> = {
  [DefectCategory.Structural]: words('Structural'),
  [DefectCategory.Workmanship]: words('Workmanship'),
  [DefectCategory.Services]: words('Services'),
  [DefectCategory.Waterproofing]: words('Waterproofing'),
  [DefectCategory.Finishes]: words('Finishes'),
  [DefectCategory.Equipment]: words('Equipment'),
};

export enum DealStatus {
  Agreed = 1,
  Progressing = 2,
  /** Contracts exchanged / agreement registered. Effectively certain. */
  Exchanged = 3,
  Completed = 4,
  FellThrough = 5,
  Cancelled = 6,
  OnHold = 7,
}

export const DEAL_STATUS_LABELS: Record<DealStatus, string> = {
  [DealStatus.Agreed]: words('Agreed'),
  [DealStatus.Progressing]: words('Progressing'),
  [DealStatus.Exchanged]: words('Exchanged'),
  [DealStatus.Completed]: words('Completed'),
  [DealStatus.FellThrough]: words('FellThrough'),
  [DealStatus.Cancelled]: words('Cancelled'),
  [DealStatus.OnHold]: words('OnHold'),
};

export enum DealPartyRole {
  Buyer = 1,
  Seller = 2,
  BuyerSolicitor = 3,
  SellerSolicitor = 4,
  MortgageBroker = 5,
  Lender = 6,
  Surveyor = 7,
  Notary = 8,
  ListingAgent = 9,
  SellingAgent = 10,
  Registrar = 11,
}

export const DEAL_PARTY_ROLE_LABELS: Record<DealPartyRole, string> = {
  [DealPartyRole.Buyer]: words('Buyer'),
  [DealPartyRole.Seller]: words('Seller'),
  [DealPartyRole.BuyerSolicitor]: words('BuyerSolicitor'),
  [DealPartyRole.SellerSolicitor]: words('SellerSolicitor'),
  [DealPartyRole.MortgageBroker]: words('MortgageBroker'),
  [DealPartyRole.Lender]: words('Lender'),
  [DealPartyRole.Surveyor]: words('Surveyor'),
  [DealPartyRole.Notary]: words('Notary'),
  [DealPartyRole.ListingAgent]: words('ListingAgent'),
  [DealPartyRole.SellingAgent]: words('SellingAgent'),
  [DealPartyRole.Registrar]: words('Registrar'),
};

export enum FallThroughCause {
  BuyerWithdrew = 1,
  SellerWithdrew = 2,
  MortgageDeclined = 3,
  SurveyIssues = 4,
  ChainCollapse = 5,
  TitleProblem = 6,
  Gazumped = 7,
  ValuationShortfall = 8,
  Personal = 9,
  Other = 99,
}

export const FALL_THROUGH_CAUSE_LABELS: Record<FallThroughCause, string> = {
  [FallThroughCause.BuyerWithdrew]: words('BuyerWithdrew'),
  [FallThroughCause.SellerWithdrew]: words('SellerWithdrew'),
  [FallThroughCause.MortgageDeclined]: words('MortgageDeclined'),
  [FallThroughCause.SurveyIssues]: words('SurveyIssues'),
  [FallThroughCause.ChainCollapse]: words('ChainCollapse'),
  [FallThroughCause.TitleProblem]: words('TitleProblem'),
  [FallThroughCause.Gazumped]: words('Gazumped'),
  [FallThroughCause.ValuationShortfall]: words('ValuationShortfall'),
  [FallThroughCause.Personal]: words('Personal'),
  [FallThroughCause.Other]: words('Other'),
};

export enum CommissionPlanKind {
  FlatSplit = 1,
  /** Split improves as the agent crosses thresholds. */
  GraduatedSplit = 2,
  /** 100% to the agent once they have paid the house a capped amount in the year. */
  CappedSplit = 3,
  FixedFeePerDeal = 4,
  SalaryPlusBonus = 5,
  /** Developer-side: slab on booking value or collection. */
  SlabOnValue = 6,
}

export const COMMISSION_PLAN_KIND_LABELS: Record<CommissionPlanKind, string> = {
  [CommissionPlanKind.FlatSplit]: words('FlatSplit'),
  [CommissionPlanKind.GraduatedSplit]: words('GraduatedSplit'),
  [CommissionPlanKind.CappedSplit]: words('CappedSplit'),
  [CommissionPlanKind.FixedFeePerDeal]: words('FixedFeePerDeal'),
  [CommissionPlanKind.SalaryPlusBonus]: words('SalaryPlusBonus'),
  [CommissionPlanKind.SlabOnValue]: words('SlabOnValue'),
};

export enum CommissionTrigger {
  /** Earned the moment the booking is confirmed. Risky — cancellations claw back. */
  OnBooking = 1,
  /** Earned in proportion to what the customer has actually paid. The safe default. */
  OnCollection = 2,
  OnAgreementSigned = 3,
  OnCompletion = 4,
  OnPossession = 5,
}

export const COMMISSION_TRIGGER_LABELS: Record<CommissionTrigger, string> = {
  [CommissionTrigger.OnBooking]: words('OnBooking'),
  [CommissionTrigger.OnCollection]: words('OnCollection'),
  [CommissionTrigger.OnAgreementSigned]: words('OnAgreementSigned'),
  [CommissionTrigger.OnCompletion]: words('OnCompletion'),
  [CommissionTrigger.OnPossession]: words('OnPossession'),
};

export enum CommissionStatus {
  Accrued = 1,
  Approved = 2,
  PartiallyPaid = 3,
  Paid = 4,
  /** Reversed because the booking cancelled or the customer defaulted. */
  ClawedBack = 5,
  Disputed = 6,
  Cancelled = 7,
}

export const COMMISSION_STATUS_LABELS: Record<CommissionStatus, string> = {
  [CommissionStatus.Accrued]: words('Accrued'),
  [CommissionStatus.Approved]: words('Approved'),
  [CommissionStatus.PartiallyPaid]: words('PartiallyPaid'),
  [CommissionStatus.Paid]: words('Paid'),
  [CommissionStatus.ClawedBack]: words('ClawedBack'),
  [CommissionStatus.Disputed]: words('Disputed'),
  [CommissionStatus.Cancelled]: words('Cancelled'),
};

export enum DeductionKind {
  FranchiseRoyalty = 1,
  BrokerageRetention = 2,
  ReferralFee = 3,
  MentorOverride = 4,
  TeamLeadOverride = 5,
  DeskFee = 6,
  TransactionFee = 7,
  PostCapFee = 8,
  Withholding = 9,
  AdvanceRecovery = 10,
  Other = 99,
}

export const DEDUCTION_KIND_LABELS: Record<DeductionKind, string> = {
  [DeductionKind.FranchiseRoyalty]: words('FranchiseRoyalty'),
  [DeductionKind.BrokerageRetention]: words('BrokerageRetention'),
  [DeductionKind.ReferralFee]: words('ReferralFee'),
  [DeductionKind.MentorOverride]: words('MentorOverride'),
  [DeductionKind.TeamLeadOverride]: words('TeamLeadOverride'),
  [DeductionKind.DeskFee]: words('DeskFee'),
  [DeductionKind.TransactionFee]: words('TransactionFee'),
  [DeductionKind.PostCapFee]: words('PostCapFee'),
  [DeductionKind.Withholding]: words('Withholding'),
  [DeductionKind.AdvanceRecovery]: words('AdvanceRecovery'),
  [DeductionKind.Other]: words('Other'),
};

export enum PartnerStatus {
  Applied = 1,
  UnderReview = 2,
  Active = 3,
  Suspended = 4,
  Blacklisted = 5,
  Expired = 6,
}

export const PARTNER_STATUS_LABELS: Record<PartnerStatus, string> = {
  [PartnerStatus.Applied]: words('Applied'),
  [PartnerStatus.UnderReview]: words('UnderReview'),
  [PartnerStatus.Active]: words('Active'),
  [PartnerStatus.Suspended]: words('Suspended'),
  [PartnerStatus.Blacklisted]: words('Blacklisted'),
  [PartnerStatus.Expired]: words('Expired'),
};

export enum LeadRegistrationStatus {
  Registered = 1,
  /** Someone else already had this lead. Rejected immediately, not at payout time. */
  DuplicateRejected = 2,
  Expired = 3,
  Converted = 4,
  Withdrawn = 5,
}

export const LEAD_REGISTRATION_STATUS_LABELS: Record<LeadRegistrationStatus, string> = {
  [LeadRegistrationStatus.Registered]: words('Registered'),
  [LeadRegistrationStatus.DuplicateRejected]: words('DuplicateRejected'),
  [LeadRegistrationStatus.Expired]: words('Expired'),
  [LeadRegistrationStatus.Converted]: words('Converted'),
  [LeadRegistrationStatus.Withdrawn]: words('Withdrawn'),
};

export enum TenancyKind {
  AssuredShorthold = 1,
  CommercialLease = 2,
  Licence = 3,
  MonthToMonth = 4,
  FixedTerm = 5,
  Periodic = 6,
  Sublease = 7,
  LeaseToOwn = 8,
  ShortStay = 9,
  /** A day-to-year pitch in a mall concourse. */
  KioskLicence = 10,
}

export const TENANCY_KIND_LABELS: Record<TenancyKind, string> = {
  [TenancyKind.AssuredShorthold]: words('AssuredShorthold'),
  [TenancyKind.CommercialLease]: words('CommercialLease'),
  [TenancyKind.Licence]: words('Licence'),
  [TenancyKind.MonthToMonth]: words('MonthToMonth'),
  [TenancyKind.FixedTerm]: words('FixedTerm'),
  [TenancyKind.Periodic]: words('Periodic'),
  [TenancyKind.Sublease]: words('Sublease'),
  [TenancyKind.LeaseToOwn]: words('LeaseToOwn'),
  [TenancyKind.ShortStay]: words('ShortStay'),
  [TenancyKind.KioskLicence]: words('KioskLicence'),
};

export enum TenancyStatus {
  Application = 1,
  Referencing = 2,
  Offered = 3,
  AgreementPending = 4,
  Active = 5,
  NoticeGiven = 6,
  Expiring = 7,
  Renewed = 8,
  Ended = 9,
  Terminated = 10,
  Abandoned = 11,
  InEviction = 12,
}

export const TENANCY_STATUS_LABELS: Record<TenancyStatus, string> = {
  [TenancyStatus.Application]: words('Application'),
  [TenancyStatus.Referencing]: words('Referencing'),
  [TenancyStatus.Offered]: words('Offered'),
  [TenancyStatus.AgreementPending]: words('AgreementPending'),
  [TenancyStatus.Active]: words('Active'),
  [TenancyStatus.NoticeGiven]: words('NoticeGiven'),
  [TenancyStatus.Expiring]: words('Expiring'),
  [TenancyStatus.Renewed]: words('Renewed'),
  [TenancyStatus.Ended]: words('Ended'),
  [TenancyStatus.Terminated]: words('Terminated'),
  [TenancyStatus.Abandoned]: words('Abandoned'),
  [TenancyStatus.InEviction]: words('InEviction'),
};

export enum RentFrequency {
  Weekly = 1,
  Fortnightly = 2,
  Monthly = 3,
  Quarterly = 4,
  HalfYearly = 5,
  Yearly = 6,
}

export const RENT_FREQUENCY_LABELS: Record<RentFrequency, string> = {
  [RentFrequency.Weekly]: words('Weekly'),
  [RentFrequency.Fortnightly]: words('Fortnightly'),
  [RentFrequency.Monthly]: words('Monthly'),
  [RentFrequency.Quarterly]: words('Quarterly'),
  [RentFrequency.HalfYearly]: words('HalfYearly'),
  [RentFrequency.Yearly]: words('Yearly'),
};

export enum EscalationKind {
  None = 1,
  FixedPercent = 2,
  /** Tied to a published index, usually with a floor and a cap. */
  IndexLinked = 3,
  SteppedSchedule = 4,
  OpenMarketReview = 5,
  FixedAmount = 6,
}

export const ESCALATION_KIND_LABELS: Record<EscalationKind, string> = {
  [EscalationKind.None]: words('None'),
  [EscalationKind.FixedPercent]: words('FixedPercent'),
  [EscalationKind.IndexLinked]: words('IndexLinked'),
  [EscalationKind.SteppedSchedule]: words('SteppedSchedule'),
  [EscalationKind.OpenMarketReview]: words('OpenMarketReview'),
  [EscalationKind.FixedAmount]: words('FixedAmount'),
};

export enum LeaseOptionKind {
  Break = 1,
  Renewal = 2,
  Expansion = 3,
  Contraction = 4,
  RightOfFirstRefusal = 5,
  Purchase = 6,
}

export const LEASE_OPTION_KIND_LABELS: Record<LeaseOptionKind, string> = {
  [LeaseOptionKind.Break]: words('Break'),
  [LeaseOptionKind.Renewal]: words('Renewal'),
  [LeaseOptionKind.Expansion]: words('Expansion'),
  [LeaseOptionKind.Contraction]: words('Contraction'),
  [LeaseOptionKind.RightOfFirstRefusal]: words('RightOfFirstRefusal'),
  [LeaseOptionKind.Purchase]: words('Purchase'),
};

export enum DepositScheme {
  /** Held by us in the client account — no statutory scheme in this market. */
  HeldInClientAccount = 1,
  /** Handed to a custodial scheme for the term. */
  Custodial = 2,
  /** Held by us but insured with a scheme. */
  Insured = 3,
  HeldByLandlord = 4,
  NoDeposit = 5,
}

export const DEPOSIT_SCHEME_LABELS: Record<DepositScheme, string> = {
  [DepositScheme.HeldInClientAccount]: words('HeldInClientAccount'),
  [DepositScheme.Custodial]: words('Custodial'),
  [DepositScheme.Insured]: words('Insured'),
  [DepositScheme.HeldByLandlord]: words('HeldByLandlord'),
  [DepositScheme.NoDeposit]: words('NoDeposit'),
};

export enum ReferencingOutcome {
  Pending = 1,
  Pass = 2,
  PassWithGuarantor = 3,
  PassWithConditions = 4,
  Fail = 5,
  Withdrawn = 6,
}

export const REFERENCING_OUTCOME_LABELS: Record<ReferencingOutcome, string> = {
  [ReferencingOutcome.Pending]: words('Pending'),
  [ReferencingOutcome.Pass]: words('Pass'),
  [ReferencingOutcome.PassWithGuarantor]: words('PassWithGuarantor'),
  [ReferencingOutcome.PassWithConditions]: words('PassWithConditions'),
  [ReferencingOutcome.Fail]: words('Fail'),
  [ReferencingOutcome.Withdrawn]: words('Withdrawn'),
};

export enum ReferencingCheckKind {
  Identity = 1,
  RightToRent = 2,
  Employment = 3,
  Income = 4,
  Credit = 5,
  PreviousLandlord = 6,
  Guarantor = 7,
  CompanyCheck = 8,
  Bank = 9,
}

export const REFERENCING_CHECK_KIND_LABELS: Record<ReferencingCheckKind, string> = {
  [ReferencingCheckKind.Identity]: words('Identity'),
  [ReferencingCheckKind.RightToRent]: words('RightToRent'),
  [ReferencingCheckKind.Employment]: words('Employment'),
  [ReferencingCheckKind.Income]: words('Income'),
  [ReferencingCheckKind.Credit]: words('Credit'),
  [ReferencingCheckKind.PreviousLandlord]: words('PreviousLandlord'),
  [ReferencingCheckKind.Guarantor]: words('Guarantor'),
  [ReferencingCheckKind.CompanyCheck]: words('CompanyCheck'),
  [ReferencingCheckKind.Bank]: words('Bank'),
};

export enum InspectionKind {
  MoveIn = 1,
  MoveOut = 2,
  Periodic = 3,
  Interim = 4,
  PreHandover = 5,
  CommonArea = 6,
  Safety = 7,
}

export const INSPECTION_KIND_LABELS: Record<InspectionKind, string> = {
  [InspectionKind.MoveIn]: words('MoveIn'),
  [InspectionKind.MoveOut]: words('MoveOut'),
  [InspectionKind.Periodic]: words('Periodic'),
  [InspectionKind.Interim]: words('Interim'),
  [InspectionKind.PreHandover]: words('PreHandover'),
  [InspectionKind.CommonArea]: words('CommonArea'),
  [InspectionKind.Safety]: words('Safety'),
};

export enum ConditionGrade {
  New = 1,
  Good = 2,
  Fair = 3,
  Poor = 4,
  Damaged = 5,
  Missing = 6,
}

export const CONDITION_GRADE_LABELS: Record<ConditionGrade, string> = {
  [ConditionGrade.New]: words('New'),
  [ConditionGrade.Good]: words('Good'),
  [ConditionGrade.Fair]: words('Fair'),
  [ConditionGrade.Poor]: words('Poor'),
  [ConditionGrade.Damaged]: words('Damaged'),
  [ConditionGrade.Missing]: words('Missing'),
};

export enum ComplianceCertificateKind {
  GasSafety = 1,
  Electrical = 2,
  EnergyPerformance = 3,
  FireRiskAssessment = 4,
  Legionella = 5,
  PortableAppliance = 6,
  AlarmTest = 7,
  LiftInspection = 8,
  LicenceToRent = 9,
  BuildingInsurance = 10,
  StructuralSafety = 11,
  Other = 99,
}

export const COMPLIANCE_CERTIFICATE_KIND_LABELS: Record<ComplianceCertificateKind, string> = {
  [ComplianceCertificateKind.GasSafety]: words('GasSafety'),
  [ComplianceCertificateKind.Electrical]: words('Electrical'),
  [ComplianceCertificateKind.EnergyPerformance]: words('EnergyPerformance'),
  [ComplianceCertificateKind.FireRiskAssessment]: words('FireRiskAssessment'),
  [ComplianceCertificateKind.Legionella]: words('Legionella'),
  [ComplianceCertificateKind.PortableAppliance]: words('PortableAppliance'),
  [ComplianceCertificateKind.AlarmTest]: words('AlarmTest'),
  [ComplianceCertificateKind.LiftInspection]: words('LiftInspection'),
  [ComplianceCertificateKind.LicenceToRent]: words('LicenceToRent'),
  [ComplianceCertificateKind.BuildingInsurance]: words('BuildingInsurance'),
  [ComplianceCertificateKind.StructuralSafety]: words('StructuralSafety'),
  [ComplianceCertificateKind.Other]: words('Other'),
};

export enum ApportionmentBasis {
  ProRataByArea = 1,
  FixedPercent = 2,
  EqualShare = 3,
  ByUnitCount = 4,
  ByMeteredConsumption = 5,
  BespokeSchedule = 6,
}

export const APPORTIONMENT_BASIS_LABELS: Record<ApportionmentBasis, string> = {
  [ApportionmentBasis.ProRataByArea]: words('ProRataByArea'),
  [ApportionmentBasis.FixedPercent]: words('FixedPercent'),
  [ApportionmentBasis.EqualShare]: words('EqualShare'),
  [ApportionmentBasis.ByUnitCount]: words('ByUnitCount'),
  [ApportionmentBasis.ByMeteredConsumption]: words('ByMeteredConsumption'),
  [ApportionmentBasis.BespokeSchedule]: words('BespokeSchedule'),
};

export enum ServiceChargeHead {
  Security = 1,
  Cleaning = 2,
  Landscaping = 3,
  Lifts = 4,
  Hvac = 5,
  CommonElectricity = 6,
  Water = 7,
  GeneratorFuel = 8,
  Insurance = 9,
  ManagementFee = 10,
  Repairs = 11,
  WasteDisposal = 12,
  PestControl = 13,
  SinkingFund = 14,
  MarketingFund = 15,
  Other = 99,
}

export const SERVICE_CHARGE_HEAD_LABELS: Record<ServiceChargeHead, string> = {
  [ServiceChargeHead.Security]: words('Security'),
  [ServiceChargeHead.Cleaning]: words('Cleaning'),
  [ServiceChargeHead.Landscaping]: words('Landscaping'),
  [ServiceChargeHead.Lifts]: words('Lifts'),
  [ServiceChargeHead.Hvac]: words('Hvac'),
  [ServiceChargeHead.CommonElectricity]: words('CommonElectricity'),
  [ServiceChargeHead.Water]: words('Water'),
  [ServiceChargeHead.GeneratorFuel]: words('GeneratorFuel'),
  [ServiceChargeHead.Insurance]: words('Insurance'),
  [ServiceChargeHead.ManagementFee]: words('ManagementFee'),
  [ServiceChargeHead.Repairs]: words('Repairs'),
  [ServiceChargeHead.WasteDisposal]: words('WasteDisposal'),
  [ServiceChargeHead.PestControl]: words('PestControl'),
  [ServiceChargeHead.SinkingFund]: words('SinkingFund'),
  [ServiceChargeHead.MarketingFund]: words('MarketingFund'),
  [ServiceChargeHead.Other]: words('Other'),
};

export enum ReconciliationOutcome {
  /** Actual exceeded what was billed on account — the tenant owes the difference. */
  BalancingCharge = 1,
  /** Billed more than was spent — the tenant is credited. */
  BalancingCredit = 2,
  Nil = 3,
}

export const RECONCILIATION_OUTCOME_LABELS: Record<ReconciliationOutcome, string> = {
  [ReconciliationOutcome.BalancingCharge]: words('BalancingCharge'),
  [ReconciliationOutcome.BalancingCredit]: words('BalancingCredit'),
  [ReconciliationOutcome.Nil]: words('Nil'),
};

export enum TurnoverRentBasis {
  /** Breakpoint derived by dividing base rent by the percentage. */
  NaturalBreakpoint = 1,
  /** A negotiated sales figure, unrelated to the base rent. */
  ArtificialBreakpoint = 2,
  /** Percentage of every rupee of sales, with no base rent at all. */
  FromFirstUnit = 3,
  /** Percentage varies by sales band. */
  SlabByBand = 4,
}

export const TURNOVER_RENT_BASIS_LABELS: Record<TurnoverRentBasis, string> = {
  [TurnoverRentBasis.NaturalBreakpoint]: words('NaturalBreakpoint'),
  [TurnoverRentBasis.ArtificialBreakpoint]: words('ArtificialBreakpoint'),
  [TurnoverRentBasis.FromFirstUnit]: words('FromFirstUnit'),
  [TurnoverRentBasis.SlabByBand]: words('SlabByBand'),
};

export enum ManagementService {
  /** Find the tenant and hand over. No ongoing management. */
  LetOnly = 1,
  RentCollection = 2,
  FullManagement = 3,
  /** We own it. No landlord, no management fee. */
  OwnPortfolio = 4,
}

export const MANAGEMENT_SERVICE_LABELS: Record<ManagementService, string> = {
  [ManagementService.LetOnly]: words('LetOnly'),
  [ManagementService.RentCollection]: words('RentCollection'),
  [ManagementService.FullManagement]: words('FullManagement'),
  [ManagementService.OwnPortfolio]: words('OwnPortfolio'),
};

export enum ClientAccountKind {
  LandlordFunds = 1,
  TenantDeposit = 2,
  BuyerDeposit = 3,
  ServiceChargeFund = 4,
  SinkingFund = 5,
  SocietyFund = 6,
}

export const CLIENT_ACCOUNT_KIND_LABELS: Record<ClientAccountKind, string> = {
  [ClientAccountKind.LandlordFunds]: words('LandlordFunds'),
  [ClientAccountKind.TenantDeposit]: words('TenantDeposit'),
  [ClientAccountKind.BuyerDeposit]: words('BuyerDeposit'),
  [ClientAccountKind.ServiceChargeFund]: words('ServiceChargeFund'),
  [ClientAccountKind.SinkingFund]: words('SinkingFund'),
  [ClientAccountKind.SocietyFund]: words('SocietyFund'),
};

export enum ClientMoneyExceptionKind {
  /** A client balance has gone negative — a regulatory breach, not a rounding issue. */
  OverdrawnClientBalance = 1,
  UnreconciledDifference = 2,
  StaleUnallocatedReceipt = 3,
  MissingBankStatement = 4,
  ReconciliationOverdue = 5,
}

export const CLIENT_MONEY_EXCEPTION_KIND_LABELS: Record<ClientMoneyExceptionKind, string> = {
  [ClientMoneyExceptionKind.OverdrawnClientBalance]: words('OverdrawnClientBalance'),
  [ClientMoneyExceptionKind.UnreconciledDifference]: words('UnreconciledDifference'),
  [ClientMoneyExceptionKind.StaleUnallocatedReceipt]: words('StaleUnallocatedReceipt'),
  [ClientMoneyExceptionKind.MissingBankStatement]: words('MissingBankStatement'),
  [ClientMoneyExceptionKind.ReconciliationOverdue]: words('ReconciliationOverdue'),
};

export enum MaintenanceBasis {
  FlatRatePerUnit = 1,
  PerAreaUnit = 2,
  SlabBySize = 3,
  ByUnitType = 4,
  ByUsage = 5,
  OneTime = 6,
  AdHoc = 7,
}

export const MAINTENANCE_BASIS_LABELS: Record<MaintenanceBasis, string> = {
  [MaintenanceBasis.FlatRatePerUnit]: words('FlatRatePerUnit'),
  [MaintenanceBasis.PerAreaUnit]: words('PerAreaUnit'),
  [MaintenanceBasis.SlabBySize]: words('SlabBySize'),
  [MaintenanceBasis.ByUnitType]: words('ByUnitType'),
  [MaintenanceBasis.ByUsage]: words('ByUsage'),
  [MaintenanceBasis.OneTime]: words('OneTime'),
  [MaintenanceBasis.AdHoc]: words('AdHoc'),
};

export enum ResidentKind {
  Owner = 1,
  Tenant = 2,
  FamilyMember = 3,
  /** Lives there with the owner's permission but holds no interest. */
  Occupant = 4,
  DomesticStaff = 5,
}

export const RESIDENT_KIND_LABELS: Record<ResidentKind, string> = {
  [ResidentKind.Owner]: words('Owner'),
  [ResidentKind.Tenant]: words('Tenant'),
  [ResidentKind.FamilyMember]: words('FamilyMember'),
  [ResidentKind.Occupant]: words('Occupant'),
  [ResidentKind.DomesticStaff]: words('DomesticStaff'),
};

export enum VisitorKind {
  Guest = 1,
  Delivery = 2,
  Cab = 3,
  ServiceProvider = 4,
  Contractor = 5,
  DomesticStaff = 6,
  Vendor = 7,
  Emergency = 8,
}

export const VISITOR_KIND_LABELS: Record<VisitorKind, string> = {
  [VisitorKind.Guest]: words('Guest'),
  [VisitorKind.Delivery]: words('Delivery'),
  [VisitorKind.Cab]: words('Cab'),
  [VisitorKind.ServiceProvider]: words('ServiceProvider'),
  [VisitorKind.Contractor]: words('Contractor'),
  [VisitorKind.DomesticStaff]: words('DomesticStaff'),
  [VisitorKind.Vendor]: words('Vendor'),
  [VisitorKind.Emergency]: words('Emergency'),
};

export enum GateEntryStatus {
  Expected = 1,
  AwaitingApproval = 2,
  Approved = 3,
  Denied = 4,
  CheckedIn = 5,
  CheckedOut = 6,
  Expired = 7,
}

export const GATE_ENTRY_STATUS_LABELS: Record<GateEntryStatus, string> = {
  [GateEntryStatus.Expected]: words('Expected'),
  [GateEntryStatus.AwaitingApproval]: words('AwaitingApproval'),
  [GateEntryStatus.Approved]: words('Approved'),
  [GateEntryStatus.Denied]: words('Denied'),
  [GateEntryStatus.CheckedIn]: words('CheckedIn'),
  [GateEntryStatus.CheckedOut]: words('CheckedOut'),
  [GateEntryStatus.Expired]: words('Expired'),
};

export enum AmenityBookingStatus {
  Requested = 1,
  Approved = 2,
  Rejected = 3,
  Cancelled = 4,
  Completed = 5,
  NoShow = 6,
}

export const AMENITY_BOOKING_STATUS_LABELS: Record<AmenityBookingStatus, string> = {
  [AmenityBookingStatus.Requested]: words('Requested'),
  [AmenityBookingStatus.Approved]: words('Approved'),
  [AmenityBookingStatus.Rejected]: words('Rejected'),
  [AmenityBookingStatus.Cancelled]: words('Cancelled'),
  [AmenityBookingStatus.Completed]: words('Completed'),
  [AmenityBookingStatus.NoShow]: words('NoShow'),
};

export enum ComplaintCategory {
  Plumbing = 1,
  Electrical = 2,
  Lift = 3,
  Security = 4,
  Cleanliness = 5,
  Parking = 6,
  Noise = 7,
  Water = 8,
  CommonArea = 9,
  Billing = 10,
  Pest = 11,
  Internet = 12,
  Other = 99,
}

export const COMPLAINT_CATEGORY_LABELS: Record<ComplaintCategory, string> = {
  [ComplaintCategory.Plumbing]: words('Plumbing'),
  [ComplaintCategory.Electrical]: words('Electrical'),
  [ComplaintCategory.Lift]: words('Lift'),
  [ComplaintCategory.Security]: words('Security'),
  [ComplaintCategory.Cleanliness]: words('Cleanliness'),
  [ComplaintCategory.Parking]: words('Parking'),
  [ComplaintCategory.Noise]: words('Noise'),
  [ComplaintCategory.Water]: words('Water'),
  [ComplaintCategory.CommonArea]: words('CommonArea'),
  [ComplaintCategory.Billing]: words('Billing'),
  [ComplaintCategory.Pest]: words('Pest'),
  [ComplaintCategory.Internet]: words('Internet'),
  [ComplaintCategory.Other]: words('Other'),
};

export enum TicketStatus {
  Open = 1,
  Acknowledged = 2,
  Assigned = 3,
  InProgress = 4,
  OnHold = 5,
  Resolved = 6,
  Closed = 7,
  Reopened = 8,
  /** Past its SLA and escalated to the next level. */
  Escalated = 9,
}

export const TICKET_STATUS_LABELS: Record<TicketStatus, string> = {
  [TicketStatus.Open]: words('Open'),
  [TicketStatus.Acknowledged]: words('Acknowledged'),
  [TicketStatus.Assigned]: words('Assigned'),
  [TicketStatus.InProgress]: words('InProgress'),
  [TicketStatus.OnHold]: words('OnHold'),
  [TicketStatus.Resolved]: words('Resolved'),
  [TicketStatus.Closed]: words('Closed'),
  [TicketStatus.Reopened]: words('Reopened'),
  [TicketStatus.Escalated]: words('Escalated'),
};

export enum TicketPriority {
  Low = 1,
  Normal = 2,
  High = 3,
  /** A lift with somebody in it, a burst main, a fire panel. Minutes, not days. */
  Emergency = 4,
}

export const TICKET_PRIORITY_LABELS: Record<TicketPriority, string> = {
  [TicketPriority.Low]: words('Low'),
  [TicketPriority.Normal]: words('Normal'),
  [TicketPriority.High]: words('High'),
  [TicketPriority.Emergency]: words('Emergency'),
};

export enum BuildingApplicationStatus {
  Submitted = 1,
  UnderScrutiny = 2,
  QueryRaised = 3,
  Approved = 4,
  ApprovedWithConditions = 5,
  Rejected = 6,
  Expired = 7,
  /** Building without approval, or beyond it. Stop-work served. */
  ViolationNoticed = 8,
}

export const BUILDING_APPLICATION_STATUS_LABELS: Record<BuildingApplicationStatus, string> = {
  [BuildingApplicationStatus.Submitted]: words('Submitted'),
  [BuildingApplicationStatus.UnderScrutiny]: words('UnderScrutiny'),
  [BuildingApplicationStatus.QueryRaised]: words('QueryRaised'),
  [BuildingApplicationStatus.Approved]: words('Approved'),
  [BuildingApplicationStatus.ApprovedWithConditions]: words('ApprovedWithConditions'),
  [BuildingApplicationStatus.Rejected]: words('Rejected'),
  [BuildingApplicationStatus.Expired]: words('Expired'),
  [BuildingApplicationStatus.ViolationNoticed]: words('ViolationNoticed'),
};

export enum WorkOrderSource {
  TenantRequest = 1,
  ResidentComplaint = 2,
  OwnerRequest = 3,
  Inspection = 4,
  Snag = 5,
  DefectClaim = 6,
  PlannedMaintenance = 7,
  MeterAlarm = 8,
  Internal = 9,
}

export const WORK_ORDER_SOURCE_LABELS: Record<WorkOrderSource, string> = {
  [WorkOrderSource.TenantRequest]: words('TenantRequest'),
  [WorkOrderSource.ResidentComplaint]: words('ResidentComplaint'),
  [WorkOrderSource.OwnerRequest]: words('OwnerRequest'),
  [WorkOrderSource.Inspection]: words('Inspection'),
  [WorkOrderSource.Snag]: words('Snag'),
  [WorkOrderSource.DefectClaim]: words('DefectClaim'),
  [WorkOrderSource.PlannedMaintenance]: words('PlannedMaintenance'),
  [WorkOrderSource.MeterAlarm]: words('MeterAlarm'),
  [WorkOrderSource.Internal]: words('Internal'),
};

export enum WorkOrderStatus {
  Raised = 1,
  AwaitingAuthorisation = 2,
  Authorised = 3,
  Assigned = 4,
  AppointmentSet = 5,
  InProgress = 6,
  AwaitingParts = 7,
  Completed = 8,
  /** Signed off by the occupier. Only this state allows invoicing. */
  SignedOff = 9,
  Cancelled = 10,
  Rejected = 11,
}

export const WORK_ORDER_STATUS_LABELS: Record<WorkOrderStatus, string> = {
  [WorkOrderStatus.Raised]: words('Raised'),
  [WorkOrderStatus.AwaitingAuthorisation]: words('AwaitingAuthorisation'),
  [WorkOrderStatus.Authorised]: words('Authorised'),
  [WorkOrderStatus.Assigned]: words('Assigned'),
  [WorkOrderStatus.AppointmentSet]: words('AppointmentSet'),
  [WorkOrderStatus.InProgress]: words('InProgress'),
  [WorkOrderStatus.AwaitingParts]: words('AwaitingParts'),
  [WorkOrderStatus.Completed]: words('Completed'),
  [WorkOrderStatus.SignedOff]: words('SignedOff'),
  [WorkOrderStatus.Cancelled]: words('Cancelled'),
  [WorkOrderStatus.Rejected]: words('Rejected'),
};

export enum CostBearer {
  Landlord = 1,
  Tenant = 2,
  Society = 3,
  /** A defect inside the liability period. Ours, not the customer's. */
  Developer = 4,
  Contractor = 5,
  Insurance = 6,
  Shared = 7,
}

export const COST_BEARER_LABELS: Record<CostBearer, string> = {
  [CostBearer.Landlord]: words('Landlord'),
  [CostBearer.Tenant]: words('Tenant'),
  [CostBearer.Society]: words('Society'),
  [CostBearer.Developer]: words('Developer'),
  [CostBearer.Contractor]: words('Contractor'),
  [CostBearer.Insurance]: words('Insurance'),
  [CostBearer.Shared]: words('Shared'),
};

export enum AssetKind {
  Lift = 1,
  Generator = 2,
  Transformer = 3,
  WaterPump = 4,
  Chiller = 5,
  FirePanel = 6,
  Cctv = 7,
  SewageTreatment = 8,
  SolarArray = 9,
  Gate = 10,
  Boiler = 11,
  Hvac = 12,
  Other = 99,
}

export const ASSET_KIND_LABELS: Record<AssetKind, string> = {
  [AssetKind.Lift]: words('Lift'),
  [AssetKind.Generator]: words('Generator'),
  [AssetKind.Transformer]: words('Transformer'),
  [AssetKind.WaterPump]: words('WaterPump'),
  [AssetKind.Chiller]: words('Chiller'),
  [AssetKind.FirePanel]: words('FirePanel'),
  [AssetKind.Cctv]: words('Cctv'),
  [AssetKind.SewageTreatment]: words('SewageTreatment'),
  [AssetKind.SolarArray]: words('SolarArray'),
  [AssetKind.Gate]: words('Gate'),
  [AssetKind.Boiler]: words('Boiler'),
  [AssetKind.Hvac]: words('Hvac'),
  [AssetKind.Other]: words('Other'),
};

export enum MeterKind {
  Electricity = 1,
  Water = 2,
  Gas = 3,
  Heat = 4,
  /** Reads the whole building; unit sub-meters hang under it. */
  BulkSupply = 5,
}

export const METER_KIND_LABELS: Record<MeterKind, string> = {
  [MeterKind.Electricity]: words('Electricity'),
  [MeterKind.Water]: words('Water'),
  [MeterKind.Gas]: words('Gas'),
  [MeterKind.Heat]: words('Heat'),
  [MeterKind.BulkSupply]: words('BulkSupply'),
};

export enum ReadingSource {
  Manual = 1,
  PhotoVerified = 2,
  AutomaticMeterReading = 3,
  Estimated = 4,
  CustomerSubmitted = 5,
}

export const READING_SOURCE_LABELS: Record<ReadingSource, string> = {
  [ReadingSource.Manual]: words('Manual'),
  [ReadingSource.PhotoVerified]: words('PhotoVerified'),
  [ReadingSource.AutomaticMeterReading]: words('AutomaticMeterReading'),
  [ReadingSource.Estimated]: words('Estimated'),
  [ReadingSource.CustomerSubmitted]: words('CustomerSubmitted'),
};

export enum WbsKind {
  Project = 1,
  Package = 2,
  Activity = 3,
  Task = 4,
}

export const WBS_KIND_LABELS: Record<WbsKind, string> = {
  [WbsKind.Project]: words('Project'),
  [WbsKind.Package]: words('Package'),
  [WbsKind.Activity]: words('Activity'),
  [WbsKind.Task]: words('Task'),
};

export enum BoqLineKind {
  Measured = 1,
  /** An allowance for work not yet designed. Adjusted when it is. */
  ProvisionalSum = 2,
  /** An allowance for goods to be selected later — the marble the client picks. */
  PrimeCostSum = 3,
  DayWork = 4,
  Contingency = 5,
  Preliminaries = 6,
}

export const BOQ_LINE_KIND_LABELS: Record<BoqLineKind, string> = {
  [BoqLineKind.Measured]: words('Measured'),
  [BoqLineKind.ProvisionalSum]: words('ProvisionalSum'),
  [BoqLineKind.PrimeCostSum]: words('PrimeCostSum'),
  [BoqLineKind.DayWork]: words('DayWork'),
  [BoqLineKind.Contingency]: words('Contingency'),
  [BoqLineKind.Preliminaries]: words('Preliminaries'),
};

export enum ProgressMethod {
  ByQuantity = 1,
  ByCost = 2,
  ByMilestone = 3,
  /** The engineer's judgement, recorded with a reason. */
  PhysicalAssessment = 4,
}

export const PROGRESS_METHOD_LABELS: Record<ProgressMethod, string> = {
  [ProgressMethod.ByQuantity]: words('ByQuantity'),
  [ProgressMethod.ByCost]: words('ByCost'),
  [ProgressMethod.ByMilestone]: words('ByMilestone'),
  [ProgressMethod.PhysicalAssessment]: words('PhysicalAssessment'),
};

export enum ContractKind {
  LumpSum = 1,
  CostPlusPercent = 2,
  CostPlusFixedFee = 3,
  /** The dominant South Asian turnkey shape: a rate per covered square foot. */
  PerAreaUnitRate = 4,
  GuaranteedMaximumPrice = 5,
  /** We are the client's agent, paid a fee to manage others. */
  ManagementContract = 6,
  Measured = 7,
}

export const CONTRACT_KIND_LABELS: Record<ContractKind, string> = {
  [ContractKind.LumpSum]: words('LumpSum'),
  [ContractKind.CostPlusPercent]: words('CostPlusPercent'),
  [ContractKind.CostPlusFixedFee]: words('CostPlusFixedFee'),
  [ContractKind.PerAreaUnitRate]: words('PerAreaUnitRate'),
  [ContractKind.GuaranteedMaximumPrice]: words('GuaranteedMaximumPrice'),
  [ContractKind.ManagementContract]: words('ManagementContract'),
  [ContractKind.Measured]: words('Measured'),
};

export enum SpecificationGrade {
  Economy = 1,
  Standard = 2,
  Premium = 3,
  Luxury = 4,
  Bespoke = 5,
}

export const SPECIFICATION_GRADE_LABELS: Record<SpecificationGrade, string> = {
  [SpecificationGrade.Economy]: words('Economy'),
  [SpecificationGrade.Standard]: words('Standard'),
  [SpecificationGrade.Premium]: words('Premium'),
  [SpecificationGrade.Luxury]: words('Luxury'),
  [SpecificationGrade.Bespoke]: words('Bespoke'),
};

export enum CertificateStatus {
  Draft = 1,
  SubmittedForCertification = 2,
  Certified = 3,
  Approved = 4,
  Paid = 5,
  Rejected = 6,
  Cancelled = 7,
}

export const CERTIFICATE_STATUS_LABELS: Record<CertificateStatus, string> = {
  [CertificateStatus.Draft]: words('Draft'),
  [CertificateStatus.SubmittedForCertification]: words('SubmittedForCertification'),
  [CertificateStatus.Certified]: words('Certified'),
  [CertificateStatus.Approved]: words('Approved'),
  [CertificateStatus.Paid]: words('Paid'),
  [CertificateStatus.Rejected]: words('Rejected'),
  [CertificateStatus.Cancelled]: words('Cancelled'),
};

export enum VariationOrigin {
  ClientRequest = 1,
  DesignChange = 2,
  SiteCondition = 3,
  StatutoryRequirement = 4,
  ErrorCorrection = 5,
  ValueEngineering = 6,
}

export const VARIATION_ORIGIN_LABELS: Record<VariationOrigin, string> = {
  [VariationOrigin.ClientRequest]: words('ClientRequest'),
  [VariationOrigin.DesignChange]: words('DesignChange'),
  [VariationOrigin.SiteCondition]: words('SiteCondition'),
  [VariationOrigin.StatutoryRequirement]: words('StatutoryRequirement'),
  [VariationOrigin.ErrorCorrection]: words('ErrorCorrection'),
  [VariationOrigin.ValueEngineering]: words('ValueEngineering'),
};

export enum VariationStatus {
  Proposed = 1,
  Quoted = 2,
  /** Priced and accepted. Only now does the contract value move. */
  Approved = 3,
  Instructed = 4,
  Measured = 5,
  Rejected = 6,
  Withdrawn = 7,
}

export const VARIATION_STATUS_LABELS: Record<VariationStatus, string> = {
  [VariationStatus.Proposed]: words('Proposed'),
  [VariationStatus.Quoted]: words('Quoted'),
  [VariationStatus.Approved]: words('Approved'),
  [VariationStatus.Instructed]: words('Instructed'),
  [VariationStatus.Measured]: words('Measured'),
  [VariationStatus.Rejected]: words('Rejected'),
  [VariationStatus.Withdrawn]: words('Withdrawn'),
};

export enum TenderStatus {
  Draft = 1,
  Invited = 2,
  BidsOpen = 3,
  UnderEvaluation = 4,
  Negotiating = 5,
  Awarded = 6,
  Cancelled = 7,
}

export const TENDER_STATUS_LABELS: Record<TenderStatus, string> = {
  [TenderStatus.Draft]: words('Draft'),
  [TenderStatus.Invited]: words('Invited'),
  [TenderStatus.BidsOpen]: words('BidsOpen'),
  [TenderStatus.UnderEvaluation]: words('UnderEvaluation'),
  [TenderStatus.Negotiating]: words('Negotiating'),
  [TenderStatus.Awarded]: words('Awarded'),
  [TenderStatus.Cancelled]: words('Cancelled'),
};

export enum SubcontractStatus {
  Draft = 1,
  Awarded = 2,
  Active = 3,
  Suspended = 4,
  Completed = 5,
  Terminated = 6,
  /** Work done, retention still held. Not finished until it is released. */
  InDefectsPeriod = 7,
  Closed = 8,
}

export const SUBCONTRACT_STATUS_LABELS: Record<SubcontractStatus, string> = {
  [SubcontractStatus.Draft]: words('Draft'),
  [SubcontractStatus.Awarded]: words('Awarded'),
  [SubcontractStatus.Active]: words('Active'),
  [SubcontractStatus.Suspended]: words('Suspended'),
  [SubcontractStatus.Completed]: words('Completed'),
  [SubcontractStatus.Terminated]: words('Terminated'),
  [SubcontractStatus.InDefectsPeriod]: words('InDefectsPeriod'),
  [SubcontractStatus.Closed]: words('Closed'),
};

export enum ContraChargeKind {
  MaterialIssued = 1,
  PlantHire = 2,
  Utilities = 3,
  Damages = 4,
  Rework = 5,
  Cleaning = 6,
  SafetyPenalty = 7,
  DelayPenalty = 8,
  Other = 99,
}

export const CONTRA_CHARGE_KIND_LABELS: Record<ContraChargeKind, string> = {
  [ContraChargeKind.MaterialIssued]: words('MaterialIssued'),
  [ContraChargeKind.PlantHire]: words('PlantHire'),
  [ContraChargeKind.Utilities]: words('Utilities'),
  [ContraChargeKind.Damages]: words('Damages'),
  [ContraChargeKind.Rework]: words('Rework'),
  [ContraChargeKind.Cleaning]: words('Cleaning'),
  [ContraChargeKind.SafetyPenalty]: words('SafetyPenalty'),
  [ContraChargeKind.DelayPenalty]: words('DelayPenalty'),
  [ContraChargeKind.Other]: words('Other'),
};

export enum RetentionMovement {
  Held = 1,
  ReleasedAtCompletion = 2,
  ReleasedAtDefectsEnd = 3,
  ForfeitedForDefects = 4,
  ReleasedEarlyAgainstBond = 5,
}

export const RETENTION_MOVEMENT_LABELS: Record<RetentionMovement, string> = {
  [RetentionMovement.Held]: words('Held'),
  [RetentionMovement.ReleasedAtCompletion]: words('ReleasedAtCompletion'),
  [RetentionMovement.ReleasedAtDefectsEnd]: words('ReleasedAtDefectsEnd'),
  [RetentionMovement.ForfeitedForDefects]: words('ForfeitedForDefects'),
  [RetentionMovement.ReleasedEarlyAgainstBond]: words('ReleasedEarlyAgainstBond'),
};

export enum SafetySeverity {
  NearMiss = 1,
  FirstAid = 2,
  MedicalTreatment = 3,
  LostTime = 4,
  Major = 5,
  Fatal = 6,
}

export const SAFETY_SEVERITY_LABELS: Record<SafetySeverity, string> = {
  [SafetySeverity.NearMiss]: words('NearMiss'),
  [SafetySeverity.FirstAid]: words('FirstAid'),
  [SafetySeverity.MedicalTreatment]: words('MedicalTreatment'),
  [SafetySeverity.LostTime]: words('LostTime'),
  [SafetySeverity.Major]: words('Major'),
  [SafetySeverity.Fatal]: words('Fatal'),
};

export enum JvShareBasis {
  /** A percentage of collections or net sales revenue. */
  RevenueShare = 1,
  /** Specific units handed to the landowner, excluded from our saleable stock. */
  BuiltUpAreaShare = 2,
  /** A percentage of saleable area, allocated to units at an agreed stage. */
  SaleableAreaShare = 3,
  /** We manage, they own. A fee on cost or on revenue. */
  DevelopmentFee = 4,
  ProfitShare = 5,
}

export const JV_SHARE_BASIS_LABELS: Record<JvShareBasis, string> = {
  [JvShareBasis.RevenueShare]: words('RevenueShare'),
  [JvShareBasis.BuiltUpAreaShare]: words('BuiltUpAreaShare'),
  [JvShareBasis.SaleableAreaShare]: words('SaleableAreaShare'),
  [JvShareBasis.DevelopmentFee]: words('DevelopmentFee'),
  [JvShareBasis.ProfitShare]: words('ProfitShare'),
};

export enum ProjectAccountKind {
  /** The regulated account. Withdrawals require certified progress. */
  Escrow = 1,
  /** The unrestricted balance of collections. */
  Free = 2,
  Operating = 3,
  LoanDisbursement = 4,
}

export const PROJECT_ACCOUNT_KIND_LABELS: Record<ProjectAccountKind, string> = {
  [ProjectAccountKind.Escrow]: words('Escrow'),
  [ProjectAccountKind.Free]: words('Free'),
  [ProjectAccountKind.Operating]: words('Operating'),
  [ProjectAccountKind.LoanDisbursement]: words('LoanDisbursement'),
};

export enum EscrowMovementKind {
  CollectionCredit = 1,
  Withdrawal = 2,
  InterestCredit = 3,
  BankCharge = 4,
  TransferToFree = 5,
  Adjustment = 6,
}

export const ESCROW_MOVEMENT_KIND_LABELS: Record<EscrowMovementKind, string> = {
  [EscrowMovementKind.CollectionCredit]: words('CollectionCredit'),
  [EscrowMovementKind.Withdrawal]: words('Withdrawal'),
  [EscrowMovementKind.InterestCredit]: words('InterestCredit'),
  [EscrowMovementKind.BankCharge]: words('BankCharge'),
  [EscrowMovementKind.TransferToFree]: words('TransferToFree'),
  [EscrowMovementKind.Adjustment]: words('Adjustment'),
};

export enum GuaranteeKind {
  Performance = 1,
  AdvancePayment = 2,
  Retention = 3,
  Mobilisation = 4,
  Bid = 5,
  Maintenance = 6,
}

export const GUARANTEE_KIND_LABELS: Record<GuaranteeKind, string> = {
  [GuaranteeKind.Performance]: words('Performance'),
  [GuaranteeKind.AdvancePayment]: words('AdvancePayment'),
  [GuaranteeKind.Retention]: words('Retention'),
  [GuaranteeKind.Mobilisation]: words('Mobilisation'),
  [GuaranteeKind.Bid]: words('Bid'),
  [GuaranteeKind.Maintenance]: words('Maintenance'),
};

export enum LoanStatus {
  Applied = 1,
  Sanctioned = 2,
  PartiallyDrawn = 3,
  FullyDrawn = 4,
  Repaying = 5,
  Closed = 6,
  Defaulted = 7,
}

export const LOAN_STATUS_LABELS: Record<LoanStatus, string> = {
  [LoanStatus.Applied]: words('Applied'),
  [LoanStatus.Sanctioned]: words('Sanctioned'),
  [LoanStatus.PartiallyDrawn]: words('PartiallyDrawn'),
  [LoanStatus.FullyDrawn]: words('FullyDrawn'),
  [LoanStatus.Repaying]: words('Repaying'),
  [LoanStatus.Closed]: words('Closed'),
  [LoanStatus.Defaulted]: words('Defaulted'),
};

/**
 * The IFRIC 15 determination, made per contract and recorded with its reasoning because the
 * auditor will ask. It changes the P&amp;L completely.
 */
export enum RecognitionBasis {
  /** Sale of a completed product. Everything collected is a liability until handover. */
  PointInTime = 1,
  /** Sale of a construction service. Recognised as the building goes up. */
  OverTime = 2,
}

export const RECOGNITION_BASIS_LABELS: Record<RecognitionBasis, string> = {
  [RecognitionBasis.PointInTime]: words('PointInTime'),
  [RecognitionBasis.OverTime]: words('OverTime'),
};

export enum CostAllocationBasis {
  ByArea = 1,
  ByValue = 2,
  ByUnitCount = 3,
  Direct = 4,
}

export const COST_ALLOCATION_BASIS_LABELS: Record<CostAllocationBasis, string> = {
  [CostAllocationBasis.ByArea]: words('ByArea'),
  [CostAllocationBasis.ByValue]: words('ByValue'),
  [CostAllocationBasis.ByUnitCount]: words('ByUnitCount'),
  [CostAllocationBasis.Direct]: words('Direct'),
};

export enum WithholdingKind {
  OnCommission = 1,
  OnRent = 2,
  OnContractorPayment = 3,
  OnProfessionalFee = 4,
  OnPropertySale = 5,
}

export const WITHHOLDING_KIND_LABELS: Record<WithholdingKind, string> = {
  [WithholdingKind.OnCommission]: words('OnCommission'),
  [WithholdingKind.OnRent]: words('OnRent'),
  [WithholdingKind.OnContractorPayment]: words('OnContractorPayment'),
  [WithholdingKind.OnProfessionalFee]: words('OnProfessionalFee'),
  [WithholdingKind.OnPropertySale]: words('OnPropertySale'),
};

export enum ApprovalKind {
  LayoutPlan = 1,
  BuildingPlan = 2,
  EnvironmentalClearance = 3,
  FireNoc = 4,
  LiftNoc = 5,
  HeightClearance = 6,
  WaterAndSewerage = 7,
  ElectricityLoad = 8,
  GasNoc = 9,
  RoadCut = 10,
  TreeCutting = 11,
  LabourRegistration = 12,
  CommencementCertificate = 13,
  CompletionCertificate = 14,
  OccupancyCertificate = 15,
  ProjectRegistration = 16,
  LandUseConversion = 17,
  Other = 99,
}

export const APPROVAL_KIND_LABELS: Record<ApprovalKind, string> = {
  [ApprovalKind.LayoutPlan]: words('LayoutPlan'),
  [ApprovalKind.BuildingPlan]: words('BuildingPlan'),
  [ApprovalKind.EnvironmentalClearance]: words('EnvironmentalClearance'),
  [ApprovalKind.FireNoc]: words('FireNoc'),
  [ApprovalKind.LiftNoc]: words('LiftNoc'),
  [ApprovalKind.HeightClearance]: words('HeightClearance'),
  [ApprovalKind.WaterAndSewerage]: words('WaterAndSewerage'),
  [ApprovalKind.ElectricityLoad]: words('ElectricityLoad'),
  [ApprovalKind.GasNoc]: words('GasNoc'),
  [ApprovalKind.RoadCut]: words('RoadCut'),
  [ApprovalKind.TreeCutting]: words('TreeCutting'),
  [ApprovalKind.LabourRegistration]: words('LabourRegistration'),
  [ApprovalKind.CommencementCertificate]: words('CommencementCertificate'),
  [ApprovalKind.CompletionCertificate]: words('CompletionCertificate'),
  [ApprovalKind.OccupancyCertificate]: words('OccupancyCertificate'),
  [ApprovalKind.ProjectRegistration]: words('ProjectRegistration'),
  [ApprovalKind.LandUseConversion]: words('LandUseConversion'),
  [ApprovalKind.Other]: words('Other'),
};

export enum ApprovalState {
  NotStarted = 1,
  Preparing = 2,
  Submitted = 3,
  UnderReview = 4,
  QueryRaised = 5,
  Granted = 6,
  GrantedWithConditions = 7,
  Rejected = 8,
  Expired = 9,
  RenewalDue = 10,
}

export const APPROVAL_STATE_LABELS: Record<ApprovalState, string> = {
  [ApprovalState.NotStarted]: words('NotStarted'),
  [ApprovalState.Preparing]: words('Preparing'),
  [ApprovalState.Submitted]: words('Submitted'),
  [ApprovalState.UnderReview]: words('UnderReview'),
  [ApprovalState.QueryRaised]: words('QueryRaised'),
  [ApprovalState.Granted]: words('Granted'),
  [ApprovalState.GrantedWithConditions]: words('GrantedWithConditions'),
  [ApprovalState.Rejected]: words('Rejected'),
  [ApprovalState.Expired]: words('Expired'),
  [ApprovalState.RenewalDue]: words('RenewalDue'),
};

/** The NOCs we issue outward, as opposed to the approvals we seek inward. */
export enum NocKind {
  Transfer = 1,
  Construction = 2,
  Mortgage = 3,
  UtilityConnection = 4,
  Possession = 5,
  Demolition = 6,
  Renovation = 7,
  Sale = 8,
  Occupancy = 9,
}

export const NOC_KIND_LABELS: Record<NocKind, string> = {
  [NocKind.Transfer]: words('Transfer'),
  [NocKind.Construction]: words('Construction'),
  [NocKind.Mortgage]: words('Mortgage'),
  [NocKind.UtilityConnection]: words('UtilityConnection'),
  [NocKind.Possession]: words('Possession'),
  [NocKind.Demolition]: words('Demolition'),
  [NocKind.Renovation]: words('Renovation'),
  [NocKind.Sale]: words('Sale'),
  [NocKind.Occupancy]: words('Occupancy'),
};

export enum NocStatus {
  Requested = 1,
  DuesCheckPending = 2,
  Approved = 3,
  Issued = 4,
  Expired = 5,
  Revoked = 6,
  Rejected = 7,
}

export const NOC_STATUS_LABELS: Record<NocStatus, string> = {
  [NocStatus.Requested]: words('Requested'),
  [NocStatus.DuesCheckPending]: words('DuesCheckPending'),
  [NocStatus.Approved]: words('Approved'),
  [NocStatus.Issued]: words('Issued'),
  [NocStatus.Expired]: words('Expired'),
  [NocStatus.Revoked]: words('Revoked'),
  [NocStatus.Rejected]: words('Rejected'),
};

export enum DocumentState {
  Required = 1,
  Received = 2,
  Verified = 3,
  Rejected = 4,
  Expired = 5,
  Waived = 6,
}

export const DOCUMENT_STATE_LABELS: Record<DocumentState, string> = {
  [DocumentState.Required]: words('Required'),
  [DocumentState.Received]: words('Received'),
  [DocumentState.Verified]: words('Verified'),
  [DocumentState.Rejected]: words('Rejected'),
  [DocumentState.Expired]: words('Expired'),
  [DocumentState.Waived]: words('Waived'),
};

export enum SignatureMethod {
  Electronic = 1,
  WetSignature = 2,
  /** Still the legal norm across much of South Asia. */
  ThumbImpression = 3,
  DigitalCertificate = 4,
}

export const SIGNATURE_METHOD_LABELS: Record<SignatureMethod, string> = {
  [SignatureMethod.Electronic]: words('Electronic'),
  [SignatureMethod.WetSignature]: words('WetSignature'),
  [SignatureMethod.ThumbImpression]: words('ThumbImpression'),
  [SignatureMethod.DigitalCertificate]: words('DigitalCertificate'),
};

export enum SignatureState {
  Pending = 1,
  Sent = 2,
  Viewed = 3,
  Signed = 4,
  Declined = 5,
  Expired = 6,
  Cancelled = 7,
}

export const SIGNATURE_STATE_LABELS: Record<SignatureState, string> = {
  [SignatureState.Pending]: words('Pending'),
  [SignatureState.Sent]: words('Sent'),
  [SignatureState.Viewed]: words('Viewed'),
  [SignatureState.Signed]: words('Signed'),
  [SignatureState.Declined]: words('Declined'),
  [SignatureState.Expired]: words('Expired'),
  [SignatureState.Cancelled]: words('Cancelled'),
};

export enum LegalCaseStatus {
  Filed = 1,
  Pending = 2,
  Hearing = 3,
  Reserved = 4,
  Decided = 5,
  Appealed = 6,
  Settled = 7,
  Withdrawn = 8,
  Dismissed = 9,
}

export const LEGAL_CASE_STATUS_LABELS: Record<LegalCaseStatus, string> = {
  [LegalCaseStatus.Filed]: words('Filed'),
  [LegalCaseStatus.Pending]: words('Pending'),
  [LegalCaseStatus.Hearing]: words('Hearing'),
  [LegalCaseStatus.Reserved]: words('Reserved'),
  [LegalCaseStatus.Decided]: words('Decided'),
  [LegalCaseStatus.Appealed]: words('Appealed'),
  [LegalCaseStatus.Settled]: words('Settled'),
  [LegalCaseStatus.Withdrawn]: words('Withdrawn'),
  [LegalCaseStatus.Dismissed]: words('Dismissed'),
};

export enum PhysicalFileState {
  InRecordRoom = 1,
  IssuedToStaff = 2,
  WithLegal = 3,
  WithAuditor = 4,
  /** Handed to the owner at possession. No longer ours to produce. */
  ReleasedToOwner = 5,
  Missing = 6,
  Destroyed = 7,
  Archived = 8,
}

export const PHYSICAL_FILE_STATE_LABELS: Record<PhysicalFileState, string> = {
  [PhysicalFileState.InRecordRoom]: words('InRecordRoom'),
  [PhysicalFileState.IssuedToStaff]: words('IssuedToStaff'),
  [PhysicalFileState.WithLegal]: words('WithLegal'),
  [PhysicalFileState.WithAuditor]: words('WithAuditor'),
  [PhysicalFileState.ReleasedToOwner]: words('ReleasedToOwner'),
  [PhysicalFileState.Missing]: words('Missing'),
  [PhysicalFileState.Destroyed]: words('Destroyed'),
  [PhysicalFileState.Archived]: words('Archived'),
};

export enum ApprovalOutcome {
  Pending = 1,
  Approved = 2,
  Rejected = 3,
  /** Sent back for correction rather than refused outright. */
  Returned = 4,
  Escalated = 5,
  Withdrawn = 6,
  /** Auto-approved because it fell under the threshold. */
  AutoApproved = 7,
}

export const APPROVAL_OUTCOME_LABELS: Record<ApprovalOutcome, string> = {
  [ApprovalOutcome.Pending]: words('Pending'),
  [ApprovalOutcome.Approved]: words('Approved'),
  [ApprovalOutcome.Rejected]: words('Rejected'),
  [ApprovalOutcome.Returned]: words('Returned'),
  [ApprovalOutcome.Escalated]: words('Escalated'),
  [ApprovalOutcome.Withdrawn]: words('Withdrawn'),
  [ApprovalOutcome.AutoApproved]: words('AutoApproved'),
};

export enum AlertSeverity {
  Info = 1,
  Warning = 2,
  Critical = 3,
}

export const ALERT_SEVERITY_LABELS: Record<AlertSeverity, string> = {
  [AlertSeverity.Info]: words('Info'),
  [AlertSeverity.Warning]: words('Warning'),
  [AlertSeverity.Critical]: words('Critical'),
};

export enum ImportEntityKind {
  Properties = 1,
  Units = 2,
  PriceList = 3,
  Parties = 4,
  Bookings = 5,
  PaymentHistory = 6,
  Tenancies = 7,
  Residents = 8,
  Meters = 9,
  Listings = 10,
  ChannelPartners = 11,
  BoqLines = 12,
}

export const IMPORT_ENTITY_KIND_LABELS: Record<ImportEntityKind, string> = {
  [ImportEntityKind.Properties]: words('Properties'),
  [ImportEntityKind.Units]: words('Units'),
  [ImportEntityKind.PriceList]: words('PriceList'),
  [ImportEntityKind.Parties]: words('Parties'),
  [ImportEntityKind.Bookings]: words('Bookings'),
  [ImportEntityKind.PaymentHistory]: words('PaymentHistory'),
  [ImportEntityKind.Tenancies]: words('Tenancies'),
  [ImportEntityKind.Residents]: words('Residents'),
  [ImportEntityKind.Meters]: words('Meters'),
  [ImportEntityKind.Listings]: words('Listings'),
  [ImportEntityKind.ChannelPartners]: words('ChannelPartners'),
  [ImportEntityKind.BoqLines]: words('BoqLines'),
};

export enum ImportBatchStatus {
  Uploaded = 1,
  Validating = 2,
  /** Validated and previewed, but nothing written yet. The user still has to commit. */
  DryRunComplete = 3,
  Importing = 4,
  Completed = 5,
  CompletedWithErrors = 6,
  Failed = 7,
  Cancelled = 8,
}

export const IMPORT_BATCH_STATUS_LABELS: Record<ImportBatchStatus, string> = {
  [ImportBatchStatus.Uploaded]: words('Uploaded'),
  [ImportBatchStatus.Validating]: words('Validating'),
  [ImportBatchStatus.DryRunComplete]: words('DryRunComplete'),
  [ImportBatchStatus.Importing]: words('Importing'),
  [ImportBatchStatus.Completed]: words('Completed'),
  [ImportBatchStatus.CompletedWithErrors]: words('CompletedWithErrors'),
  [ImportBatchStatus.Failed]: words('Failed'),
  [ImportBatchStatus.Cancelled]: words('Cancelled'),
};

export enum PortalAudience {
  Customer = 1,
  Tenant = 2,
  Owner = 3,
  Partner = 4,
  Resident = 5,
}

export const PORTAL_AUDIENCE_LABELS: Record<PortalAudience, string> = {
  [PortalAudience.Customer]: words('Customer'),
  [PortalAudience.Tenant]: words('Tenant'),
  [PortalAudience.Owner]: words('Owner'),
  [PortalAudience.Partner]: words('Partner'),
  [PortalAudience.Resident]: words('Resident'),
};

