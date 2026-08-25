/**
 * Numeric enums mirroring `Fitness.Domain.Enums`.
 *
 * Kept in sync by hand rather than generated at build time, so a value that drifts shows up as
 * a wrong label in review rather than a silent runtime mismatch. The `*_LABELS` maps beside each
 * one are what the UI renders — never `enum[value]`, which would show "MembershipFrozen" to a
 * receptionist instead of "Membership frozen".
 */

/**
 * What kind of club this is. Drives which screens are worth showing: a PT studio has no class
 * timetable worth speaking of, and a box lives on the programming screen a big-box gym never
 * opens.
 */
export enum ClubType {
  Gym = 1,
  BoutiqueStudio = 2,
  CrossFitBox = 3,
  MartialArtsAcademy = 4,
  PersonalTrainingStudio = 5,
  LeisureCentre = 6,
  HotelClub = 7,
  YogaPilatesStudio = 8,
  SwimSchool = 9,
  ClimbingGym = 10,
}

export const CLUB_TYPE_LABELS: Record<ClubType, string> = {
  [ClubType.Gym]: 'Gym',
  [ClubType.BoutiqueStudio]: 'Boutique studio',
  [ClubType.CrossFitBox]: 'CrossFit box',
  [ClubType.MartialArtsAcademy]: 'Martial arts academy',
  [ClubType.PersonalTrainingStudio]: 'Personal training studio',
  [ClubType.LeisureCentre]: 'Leisure centre',
  [ClubType.HotelClub]: 'Hotel club',
  [ClubType.YogaPilatesStudio]: 'Yoga & Pilates studio',
  [ClubType.SwimSchool]: 'Swim school',
  [ClubType.ClimbingGym]: 'Climbing gym',
};

/** A bookable or access-controlled part of a club. */
export enum AreaKind {
  GymFloor = 1,
  Studio = 2,
  Pool = 3,
  Spa = 4,
  Sauna = 5,
  Court = 6,
  FunctionalZone = 7,
  Creche = 8,
  ChangingRoom = 9,
  Reception = 10,
  Office = 11,
  Cafe = 12,
  Parking = 13,
}

export const AREA_KIND_LABELS: Record<AreaKind, string> = {
  [AreaKind.GymFloor]: 'Gym floor',
  [AreaKind.Studio]: 'Studio',
  [AreaKind.Pool]: 'Pool',
  [AreaKind.Spa]: 'Spa',
  [AreaKind.Sauna]: 'Sauna',
  [AreaKind.Court]: 'Court',
  [AreaKind.FunctionalZone]: 'Functional zone',
  [AreaKind.Creche]: 'Creche',
  [AreaKind.ChangingRoom]: 'Changing room',
  [AreaKind.Reception]: 'Reception',
  [AreaKind.Office]: 'Office',
  [AreaKind.Cafe]: 'Cafe',
  [AreaKind.Parking]: 'Parking',
};

/**
 * Where a person is in their relationship with the club.
 *
 * <see cref="Frozen"/> and <see cref="Suspended"/> are deliberately different states: a freeze
 * is something the member asked for and the club agreed to, a suspension is something the club
 * imposed. Collapsing them would hide the churn signal, because a suspended member is much
 * closer to leaving than a frozen one.
 */
export enum MemberStatus {
  Lead = 1,
  Trial = 2,
  Active = 3,
  Frozen = 4,
  PastDue = 5,
  Suspended = 6,
  Cancelled = 7,
  Expired = 8,
  /** Cancelled and later rejoined — tracked separately because win-back is a different funnel. */
  WonBack = 9,
}

export const MEMBER_STATUS_LABELS: Record<MemberStatus, string> = {
  [MemberStatus.Lead]: 'Lead',
  [MemberStatus.Trial]: 'Trial',
  [MemberStatus.Active]: 'Active',
  [MemberStatus.Frozen]: 'Frozen',
  [MemberStatus.PastDue]: 'In arrears',
  [MemberStatus.Suspended]: 'Suspended',
  [MemberStatus.Cancelled]: 'Cancelled',
  [MemberStatus.Expired]: 'Expired',
  [MemberStatus.WonBack]: 'Won back',
};

export enum Gender {
  Unspecified = 0,
  Female = 1,
  Male = 2,
  Other = 3,
  PreferNotToSay = 4,
}

export const GENDER_LABELS: Record<Gender, string> = {
  [Gender.Unspecified]: 'Unspecified',
  [Gender.Female]: 'Female',
  [Gender.Male]: 'Male',
  [Gender.Other]: 'Other',
  [Gender.PreferNotToSay]: 'Prefer not to say',
};

/** What kind of thing a note or timeline entry on a member record is. */
export enum InteractionKind {
  Note = 1,
  Call = 2,
  Email = 3,
  Sms = 4,
  WhatsApp = 5,
  InPerson = 6,
  Complaint = 7,
  Compliment = 8,
  SystemEvent = 9,
}

export const INTERACTION_KIND_LABELS: Record<InteractionKind, string> = {
  [InteractionKind.Note]: 'Note',
  [InteractionKind.Call]: 'Call',
  [InteractionKind.Email]: 'Email',
  [InteractionKind.Sms]: 'SMS',
  [InteractionKind.WhatsApp]: 'WhatsApp',
  [InteractionKind.InPerson]: 'In person',
  [InteractionKind.Complaint]: 'Complaint',
  [InteractionKind.Compliment]: 'Compliment',
  [InteractionKind.SystemEvent]: 'System event',
};

/** Severity of a flag raised on a member record. */
export enum AlertSeverity {
  Info = 1,
  Warning = 2,
  Blocking = 3,
}

export const ALERT_SEVERITY_LABELS: Record<AlertSeverity, string> = {
  [AlertSeverity.Info]: 'Info',
  [AlertSeverity.Warning]: 'Warning',
  [AlertSeverity.Blocking]: 'Blocking',
};

/** Why a member alert exists. Drives its icon, its colour, and whether it blocks entry. */
export enum MemberAlertKind {
  OutstandingBalance = 1,
  WaiverMissing = 2,
  WaiverExpired = 3,
  MedicalClearanceRequired = 4,
  CardExpiring = 5,
  Birthday = 6,
  FirstVisit = 7,
  VisitMilestone = 8,
  NoShowStreak = 9,
  Banned = 10,
  ContractEnding = 11,
  CreditsExhausted = 12,
  Custom = 13,
}

export const MEMBER_ALERT_KIND_LABELS: Record<MemberAlertKind, string> = {
  [MemberAlertKind.OutstandingBalance]: 'Outstanding balance',
  [MemberAlertKind.WaiverMissing]: 'Waiver missing',
  [MemberAlertKind.WaiverExpired]: 'Waiver expired',
  [MemberAlertKind.MedicalClearanceRequired]: 'Medical clearance required',
  [MemberAlertKind.CardExpiring]: 'Card expiring',
  [MemberAlertKind.Birthday]: 'Birthday',
  [MemberAlertKind.FirstVisit]: 'First visit',
  [MemberAlertKind.VisitMilestone]: 'Visit milestone',
  [MemberAlertKind.NoShowStreak]: 'No show streak',
  [MemberAlertKind.Banned]: 'Banned',
  [MemberAlertKind.ContractEnding]: 'Contract ending',
  [MemberAlertKind.CreditsExhausted]: 'Credits exhausted',
  [MemberAlertKind.Custom]: 'Custom',
};

/** How a member is related to the household they belong to. */
export enum HouseholdRole {
  Primary = 1,
  Partner = 2,
  Child = 3,
  Dependent = 4,
  Other = 5,
}

export const HOUSEHOLD_ROLE_LABELS: Record<HouseholdRole, string> = {
  [HouseholdRole.Primary]: 'Primary',
  [HouseholdRole.Partner]: 'Partner',
  [HouseholdRole.Child]: 'Child',
  [HouseholdRole.Dependent]: 'Dependent',
  [HouseholdRole.Other]: 'Other',
};

/**
 * The six shapes of thing a club sells. These are genuinely different — a recurring membership
 * bills forever, a pack is consumed, a pass expires — and modelling them as one "product" with
 * flags is how these systems end up unable to answer "what do we owe in unused sessions?".
 */
export enum PlanKind {
  /** Bills every period until someone cancels it. */
  RecurringMembership = 1,
  /** Fixed length with a defined end; paid up front or in instalments. */
  TermMembership = 2,
  /** N credits, optionally expiring. */
  SessionPack = 3,
  /** Day, week, holiday, guest or trial pass. */
  TimePass = 4,
  /** A single deliverable: a PT session, an assessment, a locker term. */
  Service = 5,
  /** A stocked item owned by Inventory and sold through the pro shop. */
  RetailProduct = 6,
}

export const PLAN_KIND_LABELS: Record<PlanKind, string> = {
  [PlanKind.RecurringMembership]: 'Recurring membership',
  [PlanKind.TermMembership]: 'Term membership',
  [PlanKind.SessionPack]: 'Session pack',
  [PlanKind.TimePass]: 'Time pass',
  [PlanKind.Service]: 'Service',
  [PlanKind.RetailProduct]: 'Retail product',
};

/** How often a recurring plan bills. */
export enum BillingPeriod {
  Weekly = 1,
  Fortnightly = 2,
  FourWeekly = 3,
  Monthly = 4,
  Quarterly = 5,
  SemiAnnual = 6,
  Annual = 7,
  /** Charged once — packs, passes, services and products. */
  OneOff = 8,
}

export const BILLING_PERIOD_LABELS: Record<BillingPeriod, string> = {
  [BillingPeriod.Weekly]: 'Weekly',
  [BillingPeriod.Fortnightly]: 'Fortnightly',
  [BillingPeriod.FourWeekly]: 'Four weekly',
  [BillingPeriod.Monthly]: 'Monthly',
  [BillingPeriod.Quarterly]: 'Quarterly',
  [BillingPeriod.SemiAnnual]: 'Semi annual',
  [BillingPeriod.Annual]: 'Annual',
  [BillingPeriod.OneOff]: 'One-off',
};

/** When in the period the charge is raised. */
export enum BillingAnchor {
  /** Bills on the same day of the month the member joined. */
  JoinAnniversary = 1,
  /** Bills on a fixed calendar day for everyone, which is what large clubs run. */
  FixedDayOfMonth = 2,
}

export const BILLING_ANCHOR_LABELS: Record<BillingAnchor, string> = {
  [BillingAnchor.JoinAnniversary]: 'Join anniversary',
  [BillingAnchor.FixedDayOfMonth]: 'Fixed day of month',
};

/** How a part-period is charged when a member joins, upgrades, freezes or leaves mid-cycle. */
export enum ProrationRule {
  /** Charge for the days actually served. */
  Daily = 1,
  /** Charge a whole period regardless. */
  FullPeriod = 2,
  /** Charge nothing now; start billing at the next period. */
  None = 3,
  /** Roll the part-period into the first full period's invoice. */
  AddToFirstPeriod = 4,
}

export const PRORATION_RULE_LABELS: Record<ProrationRule, string> = {
  [ProrationRule.Daily]: 'Daily',
  [ProrationRule.FullPeriod]: 'Full period',
  [ProrationRule.None]: 'None',
  [ProrationRule.AddToFirstPeriod]: 'Add to first period',
};

/** What a member may do with their entitlement, expressed as a limit shape. */
export enum EntitlementKind {
  ClubAccess = 1,
  AreaAccess = 2,
  ClassBooking = 3,
  PersonalTraining = 4,
  ResourceBooking = 5,
  GuestPass = 6,
  Locker = 7,
  TowelService = 8,
  Creche = 9,
  Other = 10,
}

export const ENTITLEMENT_KIND_LABELS: Record<EntitlementKind, string> = {
  [EntitlementKind.ClubAccess]: 'Club access',
  [EntitlementKind.AreaAccess]: 'Area access',
  [EntitlementKind.ClassBooking]: 'Class booking',
  [EntitlementKind.PersonalTraining]: 'Personal training',
  [EntitlementKind.ResourceBooking]: 'Resource booking',
  [EntitlementKind.GuestPass]: 'Guest pass',
  [EntitlementKind.Locker]: 'Locker',
  [EntitlementKind.TowelService]: 'Towel service',
  [EntitlementKind.Creche]: 'Creche',
  [EntitlementKind.Other]: 'Other',
};

/** How an entitlement is capped. */
export enum EntitlementLimit {
  Unlimited = 1,
  PerDay = 2,
  PerWeek = 3,
  PerMonth = 4,
  /** A total across the life of the agreement — the "12 PT sessions included" case. */
  PerAgreement = 5,
  NotIncluded = 6,
}

export const ENTITLEMENT_LIMIT_LABELS: Record<EntitlementLimit, string> = {
  [EntitlementLimit.Unlimited]: 'Unlimited',
  [EntitlementLimit.PerDay]: 'Per day',
  [EntitlementLimit.PerWeek]: 'Per week',
  [EntitlementLimit.PerMonth]: 'Per month',
  [EntitlementLimit.PerAgreement]: 'Per agreement',
  [EntitlementLimit.NotIncluded]: 'Not included',
};

/** How a promotion changes the price. */
export enum DiscountKind {
  Percentage = 1,
  FixedAmount = 2,
  /** An explicit price that replaces the plan price for N periods. */
  OverridePrice = 3,
  /** N free periods before normal billing starts. */
  FreePeriods = 4,
  WaiveJoiningFee = 5,
}

export const DISCOUNT_KIND_LABELS: Record<DiscountKind, string> = {
  [DiscountKind.Percentage]: 'Percentage',
  [DiscountKind.FixedAmount]: 'Fixed amount',
  [DiscountKind.OverridePrice]: 'Override price',
  [DiscountKind.FreePeriods]: 'Free periods',
  [DiscountKind.WaiveJoiningFee]: 'Waive joining fee',
};

export enum AgreementStatus {
  Draft = 1,
  /** Signed but the start date has not arrived. */
  Pending = 2,
  Active = 3,
  Frozen = 4,
  /** Cancellation requested; still running until the effective date. */
  NoticeGiven = 5,
  Cancelled = 6,
  Expired = 7,
  /** Ended and replaced by an upgrade/downgrade agreement. */
  Superseded = 8,
}

export const AGREEMENT_STATUS_LABELS: Record<AgreementStatus, string> = {
  [AgreementStatus.Draft]: 'Draft',
  [AgreementStatus.Pending]: 'Pending',
  [AgreementStatus.Active]: 'Active',
  [AgreementStatus.Frozen]: 'Frozen',
  [AgreementStatus.NoticeGiven]: 'Notice given',
  [AgreementStatus.Cancelled]: 'Cancelled',
  [AgreementStatus.Expired]: 'Expired',
  [AgreementStatus.Superseded]: 'Superseded',
};

export enum AgreementChangeKind {
  Upgrade = 1,
  Downgrade = 2,
  AddOn = 3,
  PriceChange = 4,
  HolderTransfer = 5,
  TermExtension = 6,
  PaymentMethodChange = 7,
  Other = 8,
}

export const AGREEMENT_CHANGE_KIND_LABELS: Record<AgreementChangeKind, string> = {
  [AgreementChangeKind.Upgrade]: 'Upgrade',
  [AgreementChangeKind.Downgrade]: 'Downgrade',
  [AgreementChangeKind.AddOn]: 'Add on',
  [AgreementChangeKind.PriceChange]: 'Price change',
  [AgreementChangeKind.HolderTransfer]: 'Holder transfer',
  [AgreementChangeKind.TermExtension]: 'Term extension',
  [AgreementChangeKind.PaymentMethodChange]: 'Payment method change',
  [AgreementChangeKind.Other]: 'Other',
};

export enum FreezeReason {
  Travel = 1,
  Injury = 2,
  Medical = 3,
  Financial = 4,
  Pregnancy = 5,
  Work = 6,
  Seasonal = 7,
  Other = 8,
}

export const FREEZE_REASON_LABELS: Record<FreezeReason, string> = {
  [FreezeReason.Travel]: 'Travel',
  [FreezeReason.Injury]: 'Injury',
  [FreezeReason.Medical]: 'Medical',
  [FreezeReason.Financial]: 'Financial',
  [FreezeReason.Pregnancy]: 'Pregnancy',
  [FreezeReason.Work]: 'Work',
  [FreezeReason.Seasonal]: 'Seasonal',
  [FreezeReason.Other]: 'Other',
};

export enum SuspensionReason {
  UnpaidBalance = 1,
  Conduct = 2,
  MissingWaiver = 3,
  MissingMedicalClearance = 4,
  ExpiredDocument = 5,
  Administrative = 6,
  Other = 7,
}

export const SUSPENSION_REASON_LABELS: Record<SuspensionReason, string> = {
  [SuspensionReason.UnpaidBalance]: 'Unpaid balance',
  [SuspensionReason.Conduct]: 'Conduct',
  [SuspensionReason.MissingWaiver]: 'Missing waiver',
  [SuspensionReason.MissingMedicalClearance]: 'Missing medical clearance',
  [SuspensionReason.ExpiredDocument]: 'Expired document',
  [SuspensionReason.Administrative]: 'Administrative',
  [SuspensionReason.Other]: 'Other',
};

/** Why someone left. The single most valuable field in the whole app. */
export enum LeaveReason {
  TooExpensive = 1,
  MovedAway = 2,
  NotUsingIt = 3,
  Injury = 4,
  Medical = 5,
  Pregnancy = 6,
  ChangedJob = 7,
  UnhappyWithFacility = 8,
  UnhappyWithStaff = 9,
  TooBusy = 10,
  WentToCompetitor = 11,
  ClassesNotSuitable = 12,
  TemporaryBreak = 13,
  Deceased = 14,
  Other = 15,
}

export const LEAVE_REASON_LABELS: Record<LeaveReason, string> = {
  [LeaveReason.TooExpensive]: 'Too expensive',
  [LeaveReason.MovedAway]: 'Moved away',
  [LeaveReason.NotUsingIt]: 'Not using it',
  [LeaveReason.Injury]: 'Injury',
  [LeaveReason.Medical]: 'Medical',
  [LeaveReason.Pregnancy]: 'Pregnancy',
  [LeaveReason.ChangedJob]: 'Changed job',
  [LeaveReason.UnhappyWithFacility]: 'Unhappy with facility',
  [LeaveReason.UnhappyWithStaff]: 'Unhappy with staff',
  [LeaveReason.TooBusy]: 'Too busy',
  [LeaveReason.WentToCompetitor]: 'Went to competitor',
  [LeaveReason.ClassesNotSuitable]: 'Classes not suitable',
  [LeaveReason.TemporaryBreak]: 'Temporary break',
  [LeaveReason.Deceased]: 'Deceased',
  [LeaveReason.Other]: 'Other',
};

/** What was offered to keep a leaving member, and whether it worked. */
export enum SaveOfferKind {
  FreezeInstead = 1,
  DowngradeInstead = 2,
  FreeMonth = 3,
  DiscountedPeriods = 4,
  FreePtSession = 5,
  PlanChange = 6,
  Other = 7,
}

export const SAVE_OFFER_KIND_LABELS: Record<SaveOfferKind, string> = {
  [SaveOfferKind.FreezeInstead]: 'Freeze instead',
  [SaveOfferKind.DowngradeInstead]: 'Downgrade instead',
  [SaveOfferKind.FreeMonth]: 'Free month',
  [SaveOfferKind.DiscountedPeriods]: 'Discounted periods',
  [SaveOfferKind.FreePtSession]: 'Free PT session',
  [SaveOfferKind.PlanChange]: 'Plan change',
  [SaveOfferKind.Other]: 'Other',
};

export enum InvoiceStatus {
  Draft = 1,
  Issued = 2,
  PartiallyPaid = 3,
  Paid = 4,
  Overdue = 5,
  /** Collection failed and the dunning ladder is running. */
  InDunning = 6,
  WrittenOff = 7,
  Cancelled = 8,
  Refunded = 9,
}

export const INVOICE_STATUS_LABELS: Record<InvoiceStatus, string> = {
  [InvoiceStatus.Draft]: 'Draft',
  [InvoiceStatus.Issued]: 'Issued',
  [InvoiceStatus.PartiallyPaid]: 'Partially paid',
  [InvoiceStatus.Paid]: 'Paid',
  [InvoiceStatus.Overdue]: 'Overdue',
  [InvoiceStatus.InDunning]: 'In dunning',
  [InvoiceStatus.WrittenOff]: 'Written off',
  [InvoiceStatus.Cancelled]: 'Cancelled',
  [InvoiceStatus.Refunded]: 'Refunded',
};

/** What a line on an invoice is for. Drives revenue reporting and GL mapping. */
export enum ChargeKind {
  MembershipDues = 1,
  Instalment = 2,
  JoiningFee = 3,
  AdminFee = 4,
  AnnualMaintenanceFee = 5,
  ProRata = 6,
  FreezeFee = 7,
  LateFee = 8,
  NoShowFee = 9,
  LateCancelFee = 10,
  SessionPackage = 11,
  PersonalTraining = 12,
  ClassDropIn = 13,
  DayPass = 14,
  GuestFee = 15,
  LockerRental = 16,
  ResourceBooking = 17,
  Retail = 18,
  CrossClubVisit = 19,
  EarlyTerminationFee = 20,
  CardReplacement = 21,
  Course = 22,
  Adjustment = 23,
  Other = 24,
}

export const CHARGE_KIND_LABELS: Record<ChargeKind, string> = {
  [ChargeKind.MembershipDues]: 'Membership dues',
  [ChargeKind.Instalment]: 'Instalment',
  [ChargeKind.JoiningFee]: 'Joining fee',
  [ChargeKind.AdminFee]: 'Admin fee',
  [ChargeKind.AnnualMaintenanceFee]: 'Annual maintenance fee',
  [ChargeKind.ProRata]: 'Pro rata',
  [ChargeKind.FreezeFee]: 'Freeze fee',
  [ChargeKind.LateFee]: 'Late fee',
  [ChargeKind.NoShowFee]: 'No-show fee',
  [ChargeKind.LateCancelFee]: 'Late-cancel fee',
  [ChargeKind.SessionPackage]: 'Session package',
  [ChargeKind.PersonalTraining]: 'Personal training',
  [ChargeKind.ClassDropIn]: 'Class drop-in',
  [ChargeKind.DayPass]: 'Day pass',
  [ChargeKind.GuestFee]: 'Guest fee',
  [ChargeKind.LockerRental]: 'Locker rental',
  [ChargeKind.ResourceBooking]: 'Resource booking',
  [ChargeKind.Retail]: 'Retail',
  [ChargeKind.CrossClubVisit]: 'Cross club visit',
  [ChargeKind.EarlyTerminationFee]: 'Early termination fee',
  [ChargeKind.CardReplacement]: 'Card replacement',
  [ChargeKind.Course]: 'Course',
  [ChargeKind.Adjustment]: 'Adjustment',
  [ChargeKind.Other]: 'Other',
};

/**
 * How money arrived. Recorded, never processed — see the PCI note in the module README: no PAN,
 * no CVV, no track data is accepted or stored anywhere in this model.
 */
export enum PaymentMethod {
  Cash = 1,
  Card = 2,
  DirectDebit = 3,
  BankTransfer = 4,
  StandingOrder = 5,
  Wallet = 6,
  GiftCard = 7,
  MemberCredit = 8,
  Cheque = 9,
  CorporateAccount = 10,
  ThirdPartyPayer = 11,
  Marketplace = 12,
  Other = 13,
}

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  [PaymentMethod.Cash]: 'Cash',
  [PaymentMethod.Card]: 'Card',
  [PaymentMethod.DirectDebit]: 'Direct debit',
  [PaymentMethod.BankTransfer]: 'Bank transfer',
  [PaymentMethod.StandingOrder]: 'Standing order',
  [PaymentMethod.Wallet]: 'Wallet',
  [PaymentMethod.GiftCard]: 'Gift card',
  [PaymentMethod.MemberCredit]: 'Member credit',
  [PaymentMethod.Cheque]: 'Cheque',
  [PaymentMethod.CorporateAccount]: 'Corporate account',
  [PaymentMethod.ThirdPartyPayer]: 'Third party payer',
  [PaymentMethod.Marketplace]: 'Marketplace',
  [PaymentMethod.Other]: 'Other',
};

export enum PaymentStatus {
  Pending = 1,
  Succeeded = 2,
  Failed = 3,
  Refunded = 4,
  PartiallyRefunded = 5,
  ChargedBack = 6,
  Cancelled = 7,
}

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  [PaymentStatus.Pending]: 'Pending',
  [PaymentStatus.Succeeded]: 'Succeeded',
  [PaymentStatus.Failed]: 'Failed',
  [PaymentStatus.Refunded]: 'Refunded',
  [PaymentStatus.PartiallyRefunded]: 'Partially refunded',
  [PaymentStatus.ChargedBack]: 'Charged back',
  [PaymentStatus.Cancelled]: 'Cancelled',
};

/** Why a collection attempt failed. Drives which dunning ladder step is appropriate. */
export enum PaymentFailureReason {
  InsufficientFunds = 1,
  CardExpired = 2,
  CardDeclined = 3,
  MandateCancelled = 4,
  AccountClosed = 5,
  Disputed = 6,
  TechnicalError = 7,
  NoPaymentMethod = 8,
  Other = 9,
}

export const PAYMENT_FAILURE_REASON_LABELS: Record<PaymentFailureReason, string> = {
  [PaymentFailureReason.InsufficientFunds]: 'Insufficient funds',
  [PaymentFailureReason.CardExpired]: 'Card expired',
  [PaymentFailureReason.CardDeclined]: 'Card declined',
  [PaymentFailureReason.MandateCancelled]: 'Mandate cancelled',
  [PaymentFailureReason.AccountClosed]: 'Account closed',
  [PaymentFailureReason.Disputed]: 'Disputed',
  [PaymentFailureReason.TechnicalError]: 'Technical error',
  [PaymentFailureReason.NoPaymentMethod]: 'No payment method',
  [PaymentFailureReason.Other]: 'Other',
};

/** What a dunning step actually does when it fires. */
export enum DunningAction {
  Retry = 1,
  SendEmail = 2,
  SendSms = 3,
  SendPush = 4,
  /** Ask the member to update a card that is failing or about to. */
  RequestCardUpdate = 5,
  /** Raise a task for a human to phone them. */
  CreateCallTask = 6,
  AddLateFee = 7,
  SuspendAccess = 8,
  CancelAgreement = 9,
  WriteOff = 10,
  /** Hand to an external collections agency; recorded, not performed. */
  ReferToCollections = 11,
}

export const DUNNING_ACTION_LABELS: Record<DunningAction, string> = {
  [DunningAction.Retry]: 'Retry',
  [DunningAction.SendEmail]: 'Send email',
  [DunningAction.SendSms]: 'Send SMS',
  [DunningAction.SendPush]: 'Send push',
  [DunningAction.RequestCardUpdate]: 'Request card update',
  [DunningAction.CreateCallTask]: 'Create call task',
  [DunningAction.AddLateFee]: 'Add late fee',
  [DunningAction.SuspendAccess]: 'Suspend access',
  [DunningAction.CancelAgreement]: 'Cancel agreement',
  [DunningAction.WriteOff]: 'Write off',
  [DunningAction.ReferToCollections]: 'Refer to collections',
};

export enum DunningCaseStatus {
  Open = 1,
  Recovered = 2,
  Suspended = 3,
  WrittenOff = 4,
  Cancelled = 5,
  Escalated = 6,
}

export const DUNNING_CASE_STATUS_LABELS: Record<DunningCaseStatus, string> = {
  [DunningCaseStatus.Open]: 'Open',
  [DunningCaseStatus.Recovered]: 'Recovered',
  [DunningCaseStatus.Suspended]: 'Suspended',
  [DunningCaseStatus.WrittenOff]: 'Written off',
  [DunningCaseStatus.Cancelled]: 'Cancelled',
  [DunningCaseStatus.Escalated]: 'Escalated',
};

export enum BillingRunStatus {
  Draft = 1,
  Previewing = 2,
  Running = 3,
  Completed = 4,
  CompletedWithErrors = 5,
  Failed = 6,
  Cancelled = 7,
}

export const BILLING_RUN_STATUS_LABELS: Record<BillingRunStatus, string> = {
  [BillingRunStatus.Draft]: 'Draft',
  [BillingRunStatus.Previewing]: 'Previewing',
  [BillingRunStatus.Running]: 'Running',
  [BillingRunStatus.Completed]: 'Completed',
  [BillingRunStatus.CompletedWithErrors]: 'Completed with errors',
  [BillingRunStatus.Failed]: 'Failed',
  [BillingRunStatus.Cancelled]: 'Cancelled',
};

/** Direction of a member ledger movement, so a running balance never guesses. */
export enum LedgerEntryKind {
  Charge = 1,
  Payment = 2,
  Refund = 3,
  CreditNote = 4,
  WriteOff = 5,
  Adjustment = 6,
  CreditApplied = 7,
  CreditIssued = 8,
}

export const LEDGER_ENTRY_KIND_LABELS: Record<LedgerEntryKind, string> = {
  [LedgerEntryKind.Charge]: 'Charge',
  [LedgerEntryKind.Payment]: 'Payment',
  [LedgerEntryKind.Refund]: 'Refund',
  [LedgerEntryKind.CreditNote]: 'Credit note',
  [LedgerEntryKind.WriteOff]: 'Write off',
  [LedgerEntryKind.Adjustment]: 'Adjustment',
  [LedgerEntryKind.CreditApplied]: 'Credit applied',
  [LedgerEntryKind.CreditIssued]: 'Credit issued',
};

/** Why deferred revenue was released — time passing, or a credit being consumed. */
export enum RevenueRecognitionBasis {
  /** Earned evenly across the service period. */
  StraightLine = 1,
  /** Earned when a session or class credit is redeemed. */
  OnConsumption = 2,
  /** Earned immediately — a joining fee, a retail sale. */
  Immediate = 3,
}

export const REVENUE_RECOGNITION_BASIS_LABELS: Record<RevenueRecognitionBasis, string> = {
  [RevenueRecognitionBasis.StraightLine]: 'Straight line',
  [RevenueRecognitionBasis.OnConsumption]: 'On consumption',
  [RevenueRecognitionBasis.Immediate]: 'Immediate',
};

/** How a person identified themselves at the door or the desk. */
export enum CredentialType {
  RfidFob = 1,
  BarcodeKeyTag = 2,
  MembershipQr = 3,
  MobileCredential = 4,
  Pin = 5,
  FacialRecognition = 6,
  Fingerprint = 7,
  /** Staff looked them up and let them in by hand. */
  ManualLookup = 8,
  TemporaryPass = 9,
}

export const CREDENTIAL_TYPE_LABELS: Record<CredentialType, string> = {
  [CredentialType.RfidFob]: 'RFID fob',
  [CredentialType.BarcodeKeyTag]: 'Barcode key tag',
  [CredentialType.MembershipQr]: 'Membership QR',
  [CredentialType.MobileCredential]: 'Mobile credential',
  [CredentialType.Pin]: 'PIN',
  [CredentialType.FacialRecognition]: 'Facial recognition',
  [CredentialType.Fingerprint]: 'Fingerprint',
  [CredentialType.ManualLookup]: 'Manual lookup',
  [CredentialType.TemporaryPass]: 'Temporary pass',
};

export enum CredentialStatus {
  Active = 1,
  Lost = 2,
  Stolen = 3,
  Replaced = 4,
  Deactivated = 5,
  Expired = 6,
}

export const CREDENTIAL_STATUS_LABELS: Record<CredentialStatus, string> = {
  [CredentialStatus.Active]: 'Active',
  [CredentialStatus.Lost]: 'Lost',
  [CredentialStatus.Stolen]: 'Stolen',
  [CredentialStatus.Replaced]: 'Replaced',
  [CredentialStatus.Deactivated]: 'Deactivated',
  [CredentialStatus.Expired]: 'Expired',
};

/** Which way a reader faces. In/out is what makes anti-passback and occupancy possible. */
export enum ReaderDirection {
  In = 1,
  Out = 2,
  /** A single reader used for both, where the hardware cannot tell. */
  Bidirectional = 3,
}

export const READER_DIRECTION_LABELS: Record<ReaderDirection, string> = {
  [ReaderDirection.In]: 'In',
  [ReaderDirection.Out]: 'Out',
  [ReaderDirection.Bidirectional]: 'Bidirectional',
};

export enum AccessDecision {
  Granted = 1,
  Denied = 2,
  /** Let through, but something was wrong and staff should know. */
  GrantedWithWarning = 3,
  /** Staff opened the door by hand, overriding the decision. */
  ManualOverride = 4,
}

export const ACCESS_DECISION_LABELS: Record<AccessDecision, string> = {
  [AccessDecision.Granted]: 'Granted',
  [AccessDecision.Denied]: 'Denied',
  [AccessDecision.GrantedWithWarning]: 'Granted with warning',
  [AccessDecision.ManualOverride]: 'Manual override',
};

/**
 * Why entry was refused. Every one of these maps to a sentence a member can act on — "your
 * membership is frozen until 3 March" beats "access denied" every time.
 */
export enum AccessDenialReason {
  None = 0,
  NoActiveMembership = 1,
  MembershipFrozen = 2,
  MembershipSuspended = 3,
  MembershipExpired = 4,
  MembershipCancelled = 5,
  OutstandingBalance = 6,
  WaiverNotSigned = 7,
  MedicalClearanceRequired = 8,
  OutsideAccessHours = 9,
  ClubClosed = 10,
  ClubNotPermitted = 11,
  AreaNotPermitted = 12,
  VisitAllowanceExhausted = 13,
  AntiPassback = 14,
  OccupancyFull = 15,
  Banned = 16,
  CredentialInactive = 17,
  CredentialUnknown = 18,
  NoClassBooked = 19,
  UnderAge = 20,
  GuardianRequired = 21,
}

export const ACCESS_DENIAL_REASON_LABELS: Record<AccessDenialReason, string> = {
  [AccessDenialReason.None]: 'None',
  [AccessDenialReason.NoActiveMembership]: 'No active membership',
  [AccessDenialReason.MembershipFrozen]: 'Membership frozen',
  [AccessDenialReason.MembershipSuspended]: 'Membership suspended',
  [AccessDenialReason.MembershipExpired]: 'Membership expired',
  [AccessDenialReason.MembershipCancelled]: 'Membership cancelled',
  [AccessDenialReason.OutstandingBalance]: 'Outstanding balance',
  [AccessDenialReason.WaiverNotSigned]: 'Waiver not signed',
  [AccessDenialReason.MedicalClearanceRequired]: 'Medical clearance required',
  [AccessDenialReason.OutsideAccessHours]: 'Outside access hours',
  [AccessDenialReason.ClubClosed]: 'Club closed',
  [AccessDenialReason.ClubNotPermitted]: 'Club not permitted',
  [AccessDenialReason.AreaNotPermitted]: 'Area not permitted',
  [AccessDenialReason.VisitAllowanceExhausted]: 'Visit allowance exhausted',
  [AccessDenialReason.AntiPassback]: 'Card already inside',
  [AccessDenialReason.OccupancyFull]: 'Occupancy full',
  [AccessDenialReason.Banned]: 'Banned',
  [AccessDenialReason.CredentialInactive]: 'Credential inactive',
  [AccessDenialReason.CredentialUnknown]: 'Credential unknown',
  [AccessDenialReason.NoClassBooked]: 'No class booked',
  [AccessDenialReason.UnderAge]: 'Under age',
  [AccessDenialReason.GuardianRequired]: 'Guardian required',
};

/** How strictly a credential must exit before it may enter again. */
export enum AntiPassbackMode {
  Off = 1,
  /** Refuse a second entry with no exit in between. */
  Hard = 2,
  /** Allow it, but flag it for the manager's report. */
  Soft = 3,
  /** Refuse only within a window (the classic "not twice in ten minutes"). */
  Timed = 4,
}

export const ANTI_PASSBACK_MODE_LABELS: Record<AntiPassbackMode, string> = {
  [AntiPassbackMode.Off]: 'Off',
  [AntiPassbackMode.Hard]: 'Hard',
  [AntiPassbackMode.Soft]: 'Soft',
  [AntiPassbackMode.Timed]: 'Timed',
};

/** What a controller does when it cannot reach the server. */
export enum OfflineAccessPolicy {
  /** Let anyone with a known active credential in. The usual choice for a staffed club. */
  AllowKnownActive = 1,
  /** Refuse everything. Correct for high-security or unstaffed sites. */
  DenyAll = 2,
  /** Honour the last decision cached for that credential. */
  LastKnownDecision = 3,
  /** Let everyone in and sort it out later — a fire-safety or grand-opening setting. */
  AllowAll = 4,
}

export const OFFLINE_ACCESS_POLICY_LABELS: Record<OfflineAccessPolicy, string> = {
  [OfflineAccessPolicy.AllowKnownActive]: 'Allow known active',
  [OfflineAccessPolicy.DenyAll]: 'Deny all',
  [OfflineAccessPolicy.LastKnownDecision]: 'Last known decision',
  [OfflineAccessPolicy.AllowAll]: 'Allow all',
};

export enum VisitKind {
  Member = 1,
  Guest = 2,
  DayPass = 3,
  Trial = 4,
  Staff = 5,
  Contractor = 6,
  Marketplace = 7,
}

export const VISIT_KIND_LABELS: Record<VisitKind, string> = {
  [VisitKind.Member]: 'Member',
  [VisitKind.Guest]: 'Guest',
  [VisitKind.DayPass]: 'Day pass',
  [VisitKind.Trial]: 'Trial',
  [VisitKind.Staff]: 'Staff',
  [VisitKind.Contractor]: 'Contractor',
  [VisitKind.Marketplace]: 'Marketplace',
};

export enum ClassOccurrenceStatus {
  Scheduled = 1,
  /** Published and open for booking. */
  Open = 2,
  Full = 3,
  /** Booking closed but the class has not started. */
  Locked = 4,
  InProgress = 5,
  Completed = 6,
  Cancelled = 7,
}

export const CLASS_OCCURRENCE_STATUS_LABELS: Record<ClassOccurrenceStatus, string> = {
  [ClassOccurrenceStatus.Scheduled]: 'Scheduled',
  [ClassOccurrenceStatus.Open]: 'Open',
  [ClassOccurrenceStatus.Full]: 'Full',
  [ClassOccurrenceStatus.Locked]: 'Locked',
  [ClassOccurrenceStatus.InProgress]: 'In progress',
  [ClassOccurrenceStatus.Completed]: 'Completed',
  [ClassOccurrenceStatus.Cancelled]: 'Cancelled',
};

export enum BookingStatus {
  Booked = 1,
  Waitlisted = 2,
  CheckedIn = 3,
  Attended = 4,
  NoShow = 5,
  /** Cancelled inside the free window — nothing charged, credit returned. */
  Cancelled = 6,
  /** Cancelled after the window — credit forfeited or a fee raised. */
  LateCancelled = 7,
  /** The club cancelled the class; credits are always returned. */
  ClassCancelled = 8,
}

export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  [BookingStatus.Booked]: 'Booked',
  [BookingStatus.Waitlisted]: 'Waitlisted',
  [BookingStatus.CheckedIn]: 'Checked in',
  [BookingStatus.Attended]: 'Attended',
  [BookingStatus.NoShow]: 'No-show',
  [BookingStatus.Cancelled]: 'Cancelled',
  [BookingStatus.LateCancelled]: 'Late cancelled',
  [BookingStatus.ClassCancelled]: 'Class cancelled',
};

/** How a booking was paid for, which decides what happens when it is cancelled late. */
export enum BookingPaymentKind {
  Entitlement = 1,
  PackCredit = 2,
  DropInPayment = 3,
  CoursePlace = 4,
  Marketplace = 5,
  Complimentary = 6,
}

export const BOOKING_PAYMENT_KIND_LABELS: Record<BookingPaymentKind, string> = {
  [BookingPaymentKind.Entitlement]: 'Entitlement',
  [BookingPaymentKind.PackCredit]: 'Pack credit',
  [BookingPaymentKind.DropInPayment]: 'Drop in payment',
  [BookingPaymentKind.CoursePlace]: 'Course place',
  [BookingPaymentKind.Marketplace]: 'Marketplace',
  [BookingPaymentKind.Complimentary]: 'Complimentary',
};

/** What the club does when someone cancels too late or does not turn up. */
export enum PolicyOutcome {
  Nothing = 1,
  ForfeitCredit = 2,
  ChargeFee = 3,
  ForfeitCreditAndFee = 4,
  /** Counts against a strike threshold that eventually suspends booking rights. */
  Strike = 5,
}

export const POLICY_OUTCOME_LABELS: Record<PolicyOutcome, string> = {
  [PolicyOutcome.Nothing]: 'Nothing',
  [PolicyOutcome.ForfeitCredit]: 'Forfeit credit',
  [PolicyOutcome.ChargeFee]: 'Charge fee',
  [PolicyOutcome.ForfeitCreditAndFee]: 'Forfeit credit and fee',
  [PolicyOutcome.Strike]: 'Strike',
};

export enum BookingChannel {
  FrontDesk = 1,
  MemberApp = 2,
  WebPortal = 3,
  Kiosk = 4,
  Phone = 5,
  Marketplace = 6,
  Instructor = 7,
}

export const BOOKING_CHANNEL_LABELS: Record<BookingChannel, string> = {
  [BookingChannel.FrontDesk]: 'Front desk',
  [BookingChannel.MemberApp]: 'Member App',
  [BookingChannel.WebPortal]: 'Web portal',
  [BookingChannel.Kiosk]: 'Kiosk',
  [BookingChannel.Phone]: 'Phone',
  [BookingChannel.Marketplace]: 'Marketplace',
  [BookingChannel.Instructor]: 'Instructor',
};

export enum AppointmentStatus {
  Requested = 1,
  Confirmed = 2,
  CheckedIn = 3,
  Completed = 4,
  NoShow = 5,
  Cancelled = 6,
  LateCancelled = 7,
  Rescheduled = 8,
}

export const APPOINTMENT_STATUS_LABELS: Record<AppointmentStatus, string> = {
  [AppointmentStatus.Requested]: 'Requested',
  [AppointmentStatus.Confirmed]: 'Confirmed',
  [AppointmentStatus.CheckedIn]: 'Checked in',
  [AppointmentStatus.Completed]: 'Completed',
  [AppointmentStatus.NoShow]: 'No-show',
  [AppointmentStatus.Cancelled]: 'Cancelled',
  [AppointmentStatus.LateCancelled]: 'Late cancelled',
  [AppointmentStatus.Rescheduled]: 'Rescheduled',
};

export enum AppointmentKind {
  PersonalTraining = 1,
  Assessment = 2,
  Consultation = 3,
  Induction = 4,
  SemiPrivate = 5,
  SmallGroup = 6,
  Physiotherapy = 7,
  Massage = 8,
  Nutrition = 9,
  SwimLesson = 10,
  Other = 11,
}

export const APPOINTMENT_KIND_LABELS: Record<AppointmentKind, string> = {
  [AppointmentKind.PersonalTraining]: 'Personal training',
  [AppointmentKind.Assessment]: 'Assessment',
  [AppointmentKind.Consultation]: 'Consultation',
  [AppointmentKind.Induction]: 'Induction',
  [AppointmentKind.SemiPrivate]: 'Semi private',
  [AppointmentKind.SmallGroup]: 'Small group',
  [AppointmentKind.Physiotherapy]: 'Physiotherapy',
  [AppointmentKind.Massage]: 'Massage',
  [AppointmentKind.Nutrition]: 'Nutrition',
  [AppointmentKind.SwimLesson]: 'Swim lesson',
  [AppointmentKind.Other]: 'Other',
};

/** Why a session credit moved. The ledger that stops "how many do I have left?" arguments. */
export enum SessionCreditMovementKind {
  Purchased = 1,
  Granted = 2,
  Consumed = 3,
  Refunded = 4,
  Expired = 5,
  Transferred = 6,
  /** Taken because the member did not turn up. */
  ForfeitedNoShow = 7,
  Adjusted = 8,
}

export const SESSION_CREDIT_MOVEMENT_KIND_LABELS: Record<SessionCreditMovementKind, string> = {
  [SessionCreditMovementKind.Purchased]: 'Purchased',
  [SessionCreditMovementKind.Granted]: 'Granted',
  [SessionCreditMovementKind.Consumed]: 'Consumed',
  [SessionCreditMovementKind.Refunded]: 'Refunded',
  [SessionCreditMovementKind.Expired]: 'Expired',
  [SessionCreditMovementKind.Transferred]: 'Transferred',
  [SessionCreditMovementKind.ForfeitedNoShow]: 'Forfeited no show',
  [SessionCreditMovementKind.Adjusted]: 'Adjusted',
};

/** How a workout result is measured, which decides how a leaderboard sorts it. */
export enum ScoreType {
  ForTime = 1,
  RoundsAndReps = 2,
  Reps = 3,
  MaxLoad = 4,
  Distance = 5,
  Calories = 6,
  TimeUnderLoad = 7,
  PassFail = 8,
  Points = 9,
}

export const SCORE_TYPE_LABELS: Record<ScoreType, string> = {
  [ScoreType.ForTime]: 'For time',
  [ScoreType.RoundsAndReps]: 'Rounds and reps',
  [ScoreType.Reps]: 'Reps',
  [ScoreType.MaxLoad]: 'Max load',
  [ScoreType.Distance]: 'Distance',
  [ScoreType.Calories]: 'Calories',
  [ScoreType.TimeUnderLoad]: 'Time under load',
  [ScoreType.PassFail]: 'Pass fail',
  [ScoreType.Points]: 'Points',
};

export enum WorkoutSectionKind {
  WarmUp = 1,
  Strength = 2,
  Skill = 3,
  Metcon = 4,
  Accessory = 5,
  Conditioning = 6,
  CoolDown = 7,
  Emom = 8,
  Amrap = 9,
  Tabata = 10,
  Interval = 11,
  Note = 12,
}

export const WORKOUT_SECTION_KIND_LABELS: Record<WorkoutSectionKind, string> = {
  [WorkoutSectionKind.WarmUp]: 'Warm up',
  [WorkoutSectionKind.Strength]: 'Strength',
  [WorkoutSectionKind.Skill]: 'Skill',
  [WorkoutSectionKind.Metcon]: 'Metcon',
  [WorkoutSectionKind.Accessory]: 'Accessory',
  [WorkoutSectionKind.Conditioning]: 'Conditioning',
  [WorkoutSectionKind.CoolDown]: 'Cool down',
  [WorkoutSectionKind.Emom]: 'Emom',
  [WorkoutSectionKind.Amrap]: 'Amrap',
  [WorkoutSectionKind.Tabata]: 'Tabata',
  [WorkoutSectionKind.Interval]: 'Interval',
  [WorkoutSectionKind.Note]: 'Note',
};

export enum ExerciseCategory {
  Barbell = 1,
  Dumbbell = 2,
  Kettlebell = 3,
  Bodyweight = 4,
  Machine = 5,
  Cable = 6,
  Cardio = 7,
  Gymnastics = 8,
  Olympic = 9,
  Mobility = 10,
  Plyometric = 11,
  Band = 12,
  Other = 13,
}

export const EXERCISE_CATEGORY_LABELS: Record<ExerciseCategory, string> = {
  [ExerciseCategory.Barbell]: 'Barbell',
  [ExerciseCategory.Dumbbell]: 'Dumbbell',
  [ExerciseCategory.Kettlebell]: 'Kettlebell',
  [ExerciseCategory.Bodyweight]: 'Bodyweight',
  [ExerciseCategory.Machine]: 'Machine',
  [ExerciseCategory.Cable]: 'Cable',
  [ExerciseCategory.Cardio]: 'Cardio',
  [ExerciseCategory.Gymnastics]: 'Gymnastics',
  [ExerciseCategory.Olympic]: 'Olympic',
  [ExerciseCategory.Mobility]: 'Mobility',
  [ExerciseCategory.Plyometric]: 'Plyometric',
  [ExerciseCategory.Band]: 'Band',
  [ExerciseCategory.Other]: 'Other',
};

/** Heart-rate zone bands, the standard five used by every wearable platform. */
export enum EffortZone {
  Grey = 1,
  Blue = 2,
  Green = 3,
  Yellow = 4,
  Red = 5,
}

export const EFFORT_ZONE_LABELS: Record<EffortZone, string> = {
  [EffortZone.Grey]: 'Grey',
  [EffortZone.Blue]: 'Blue',
  [EffortZone.Green]: 'Green',
  [EffortZone.Yellow]: 'Yellow',
  [EffortZone.Red]: 'Red',
};

export enum RankAwardStatus {
  InProgress = 1,
  EligibleForGrading = 2,
  Graded = 3,
  Awarded = 4,
  Failed = 5,
}

export const RANK_AWARD_STATUS_LABELS: Record<RankAwardStatus, string> = {
  [RankAwardStatus.InProgress]: 'In progress',
  [RankAwardStatus.EligibleForGrading]: 'Eligible for grading',
  [RankAwardStatus.Graded]: 'Graded',
  [RankAwardStatus.Awarded]: 'Awarded',
  [RankAwardStatus.Failed]: 'Failed',
};

/** What kind of number a measure holds, which decides its input control and its chart. */
export enum MeasureType {
  Weight = 1,
  Length = 2,
  Percentage = 3,
  Count = 4,
  Duration = 5,
  Pressure = 6,
  Rate = 7,
  Score = 8,
  Text = 9,
  Boolean = 10,
}

export const MEASURE_TYPE_LABELS: Record<MeasureType, string> = {
  [MeasureType.Weight]: 'Weight',
  [MeasureType.Length]: 'Length',
  [MeasureType.Percentage]: 'Percentage',
  [MeasureType.Count]: 'Count',
  [MeasureType.Duration]: 'Duration',
  [MeasureType.Pressure]: 'Pressure',
  [MeasureType.Rate]: 'Rate',
  [MeasureType.Score]: 'Score',
  [MeasureType.Text]: 'Text',
  [MeasureType.Boolean]: 'Boolean',
};

/** Whether a bigger number is better, so progress arrows point the right way. */
export enum MeasureDirection {
  HigherIsBetter = 1,
  LowerIsBetter = 2,
  /** Neither — a raw measurement like height. */
  Neutral = 3,
  /** Best inside a band, worse outside it in either direction — blood pressure, body fat. */
  RangeIsBetter = 4,
}

export const MEASURE_DIRECTION_LABELS: Record<MeasureDirection, string> = {
  [MeasureDirection.HigherIsBetter]: 'Higher is better',
  [MeasureDirection.LowerIsBetter]: 'Lower is better',
  [MeasureDirection.Neutral]: 'Neutral',
  [MeasureDirection.RangeIsBetter]: 'Range is better',
};

export enum GoalStatus {
  Active = 1,
  Achieved = 2,
  Missed = 3,
  Abandoned = 4,
  Paused = 5,
}

export const GOAL_STATUS_LABELS: Record<GoalStatus, string> = {
  [GoalStatus.Active]: 'Active',
  [GoalStatus.Achieved]: 'Achieved',
  [GoalStatus.Missed]: 'Missed',
  [GoalStatus.Abandoned]: 'Abandoned',
  [GoalStatus.Paused]: 'Paused',
};

export enum LeadStatus {
  New = 1,
  Contacted = 2,
  TourBooked = 3,
  Toured = 4,
  Trialling = 5,
  Negotiating = 6,
  Won = 7,
  Lost = 8,
  /** Not now, but worth another call later. */
  Nurturing = 9,
}

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  [LeadStatus.New]: 'New',
  [LeadStatus.Contacted]: 'Contacted',
  [LeadStatus.TourBooked]: 'Tour booked',
  [LeadStatus.Toured]: 'Toured',
  [LeadStatus.Trialling]: 'Trialling',
  [LeadStatus.Negotiating]: 'Negotiating',
  [LeadStatus.Won]: 'Won',
  [LeadStatus.Lost]: 'Lost',
  [LeadStatus.Nurturing]: 'Nurturing',
};

export enum LeadSourceKind {
  WalkIn = 1,
  WebForm = 2,
  Phone = 3,
  Referral = 4,
  SocialMedia = 5,
  PaidAds = 6,
  Event = 7,
  Corporate = 8,
  Marketplace = 9,
  WinBack = 10,
  Import = 11,
  Other = 12,
}

export const LEAD_SOURCE_KIND_LABELS: Record<LeadSourceKind, string> = {
  [LeadSourceKind.WalkIn]: 'Walk-in',
  [LeadSourceKind.WebForm]: 'Web form',
  [LeadSourceKind.Phone]: 'Phone',
  [LeadSourceKind.Referral]: 'Referral',
  [LeadSourceKind.SocialMedia]: 'Social media',
  [LeadSourceKind.PaidAds]: 'Paid ads',
  [LeadSourceKind.Event]: 'Event',
  [LeadSourceKind.Corporate]: 'Corporate',
  [LeadSourceKind.Marketplace]: 'Marketplace',
  [LeadSourceKind.WinBack]: 'Win-back',
  [LeadSourceKind.Import]: 'Import',
  [LeadSourceKind.Other]: 'Other',
};

export enum LeadActivityKind {
  Call = 1,
  Email = 2,
  Sms = 3,
  WhatsApp = 4,
  Meeting = 5,
  Tour = 6,
  TrialIssued = 7,
  QuoteSent = 8,
  Note = 9,
  StageChange = 10,
  TaskCreated = 11,
}

export const LEAD_ACTIVITY_KIND_LABELS: Record<LeadActivityKind, string> = {
  [LeadActivityKind.Call]: 'Call',
  [LeadActivityKind.Email]: 'Email',
  [LeadActivityKind.Sms]: 'SMS',
  [LeadActivityKind.WhatsApp]: 'WhatsApp',
  [LeadActivityKind.Meeting]: 'Meeting',
  [LeadActivityKind.Tour]: 'Tour',
  [LeadActivityKind.TrialIssued]: 'Trial issued',
  [LeadActivityKind.QuoteSent]: 'Quote sent',
  [LeadActivityKind.Note]: 'Note',
  [LeadActivityKind.StageChange]: 'Stage change',
  [LeadActivityKind.TaskCreated]: 'Task created',
};

/**
 * How likely this member is to leave. A band rather than a raw score, because a coach can act
 * on "high risk, has not been in for 21 days" and cannot act on "0.71".
 */
export enum ChurnRiskBand {
  Healthy = 1,
  Watch = 2,
  AtRisk = 3,
  Critical = 4,
  /** Already gone; kept so win-back lists can be built from the same table. */
  Lost = 5,
}

export const CHURN_RISK_BAND_LABELS: Record<ChurnRiskBand, string> = {
  [ChurnRiskBand.Healthy]: 'Healthy',
  [ChurnRiskBand.Watch]: 'Watch',
  [ChurnRiskBand.AtRisk]: 'At risk',
  [ChurnRiskBand.Critical]: 'Critical',
  [ChurnRiskBand.Lost]: 'Lost',
};

/** The evidence behind a risk band, listed on the at-risk board so the call has a hook. */
export enum ChurnFactorKind {
  NoRecentVisit = 1,
  VisitFrequencyDropped = 2,
  NeverAttendedAfterJoining = 3,
  NoClassBooked = 4,
  NoUpcomingBooking = 5,
  PaymentFailed = 6,
  OutstandingBalance = 7,
  ContractEndingSoon = 8,
  ComplaintOpen = 9,
  LowNpsScore = 10,
  CreditsUnused = 11,
  PtPackageExpired = 12,
  RepeatedNoShows = 13,
  FrozenTooLong = 14,
  ShortTenure = 15,
}

export const CHURN_FACTOR_KIND_LABELS: Record<ChurnFactorKind, string> = {
  [ChurnFactorKind.NoRecentVisit]: 'No recent visit',
  [ChurnFactorKind.VisitFrequencyDropped]: 'Visit frequency dropped',
  [ChurnFactorKind.NeverAttendedAfterJoining]: 'Never attended after joining',
  [ChurnFactorKind.NoClassBooked]: 'No class booked',
  [ChurnFactorKind.NoUpcomingBooking]: 'No upcoming booking',
  [ChurnFactorKind.PaymentFailed]: 'Payment failed',
  [ChurnFactorKind.OutstandingBalance]: 'Outstanding balance',
  [ChurnFactorKind.ContractEndingSoon]: 'Contract ending soon',
  [ChurnFactorKind.ComplaintOpen]: 'Complaint open',
  [ChurnFactorKind.LowNpsScore]: 'Low NPS score',
  [ChurnFactorKind.CreditsUnused]: 'Credits unused',
  [ChurnFactorKind.PtPackageExpired]: 'PT package expired',
  [ChurnFactorKind.RepeatedNoShows]: 'Repeated no shows',
  [ChurnFactorKind.FrozenTooLong]: 'Frozen too long',
  [ChurnFactorKind.ShortTenure]: 'Short tenure',
};

export enum JourneyTrigger {
  MemberJoined = 1,
  FirstVisit = 2,
  NoVisitForDays = 3,
  PaymentFailed = 4,
  ContractEndingInDays = 5,
  Birthday = 6,
  JoinAnniversary = 7,
  ClassAttended = 8,
  ClassMissed = 9,
  Cancelled = 10,
  TrialStarted = 11,
  TrialEnding = 12,
  CreditsExpiring = 13,
  RiskBandChanged = 14,
  MilestoneReached = 15,
  LeadCreated = 16,
  Manual = 17,
}

export const JOURNEY_TRIGGER_LABELS: Record<JourneyTrigger, string> = {
  [JourneyTrigger.MemberJoined]: 'Member joined',
  [JourneyTrigger.FirstVisit]: 'First visit',
  [JourneyTrigger.NoVisitForDays]: 'No visit for days',
  [JourneyTrigger.PaymentFailed]: 'Payment failed',
  [JourneyTrigger.ContractEndingInDays]: 'Contract ending in days',
  [JourneyTrigger.Birthday]: 'Birthday',
  [JourneyTrigger.JoinAnniversary]: 'Join anniversary',
  [JourneyTrigger.ClassAttended]: 'Class attended',
  [JourneyTrigger.ClassMissed]: 'Class missed',
  [JourneyTrigger.Cancelled]: 'Cancelled',
  [JourneyTrigger.TrialStarted]: 'Trial started',
  [JourneyTrigger.TrialEnding]: 'Trial ending',
  [JourneyTrigger.CreditsExpiring]: 'Credits expiring',
  [JourneyTrigger.RiskBandChanged]: 'Risk band changed',
  [JourneyTrigger.MilestoneReached]: 'Milestone reached',
  [JourneyTrigger.LeadCreated]: 'Lead created',
  [JourneyTrigger.Manual]: 'Manual',
};

export enum JourneyStepKind {
  Wait = 1,
  SendEmail = 2,
  SendSms = 3,
  SendPush = 4,
  SendWhatsApp = 5,
  CreateTask = 6,
  AddTag = 7,
  RemoveTag = 8,
  GrantOffer = 9,
  GrantLoyaltyPoints = 10,
  Condition = 11,
  ExitJourney = 12,
}

export const JOURNEY_STEP_KIND_LABELS: Record<JourneyStepKind, string> = {
  [JourneyStepKind.Wait]: 'Wait',
  [JourneyStepKind.SendEmail]: 'Send email',
  [JourneyStepKind.SendSms]: 'Send SMS',
  [JourneyStepKind.SendPush]: 'Send push',
  [JourneyStepKind.SendWhatsApp]: 'Send WhatsApp',
  [JourneyStepKind.CreateTask]: 'Create task',
  [JourneyStepKind.AddTag]: 'Add tag',
  [JourneyStepKind.RemoveTag]: 'Remove tag',
  [JourneyStepKind.GrantOffer]: 'Grant offer',
  [JourneyStepKind.GrantLoyaltyPoints]: 'Grant loyalty points',
  [JourneyStepKind.Condition]: 'Condition',
  [JourneyStepKind.ExitJourney]: 'Exit journey',
};

export enum MessageChannel {
  Email = 1,
  Sms = 2,
  Push = 3,
  WhatsApp = 4,
  InApp = 5,
  DeskAlert = 6,
}

export const MESSAGE_CHANNEL_LABELS: Record<MessageChannel, string> = {
  [MessageChannel.Email]: 'Email',
  [MessageChannel.Sms]: 'SMS',
  [MessageChannel.Push]: 'Push',
  [MessageChannel.WhatsApp]: 'WhatsApp',
  [MessageChannel.InApp]: 'In App',
  [MessageChannel.DeskAlert]: 'Desk alert',
};

export enum MessageStatus {
  Queued = 1,
  Sent = 2,
  Delivered = 3,
  Opened = 4,
  Clicked = 5,
  Failed = 6,
  Bounced = 7,
  /** Not sent because the member has not consented on that channel. */
  SuppressedNoConsent = 8,
  /** Held back by quiet hours; will go out later. */
  Deferred = 9,
}

export const MESSAGE_STATUS_LABELS: Record<MessageStatus, string> = {
  [MessageStatus.Queued]: 'Queued',
  [MessageStatus.Sent]: 'Sent',
  [MessageStatus.Delivered]: 'Delivered',
  [MessageStatus.Opened]: 'Opened',
  [MessageStatus.Clicked]: 'Clicked',
  [MessageStatus.Failed]: 'Failed',
  [MessageStatus.Bounced]: 'Bounced',
  [MessageStatus.SuppressedNoConsent]: 'Suppressed no consent',
  [MessageStatus.Deferred]: 'Deferred',
};

export enum LoyaltyEventKind {
  Visit = 1,
  ClassAttended = 2,
  PtSession = 3,
  Referral = 4,
  ChallengeCompleted = 5,
  ReviewLeft = 6,
  Purchase = 7,
  Streak = 8,
  Milestone = 9,
  ManualAward = 10,
  Redemption = 11,
  Expiry = 12,
  Adjustment = 13,
}

export const LOYALTY_EVENT_KIND_LABELS: Record<LoyaltyEventKind, string> = {
  [LoyaltyEventKind.Visit]: 'Visit',
  [LoyaltyEventKind.ClassAttended]: 'Class attended',
  [LoyaltyEventKind.PtSession]: 'PT session',
  [LoyaltyEventKind.Referral]: 'Referral',
  [LoyaltyEventKind.ChallengeCompleted]: 'Challenge completed',
  [LoyaltyEventKind.ReviewLeft]: 'Review left',
  [LoyaltyEventKind.Purchase]: 'Purchase',
  [LoyaltyEventKind.Streak]: 'Streak',
  [LoyaltyEventKind.Milestone]: 'Milestone',
  [LoyaltyEventKind.ManualAward]: 'Manual award',
  [LoyaltyEventKind.Redemption]: 'Redemption',
  [LoyaltyEventKind.Expiry]: 'Expiry',
  [LoyaltyEventKind.Adjustment]: 'Adjustment',
};

export enum ChallengeMetric {
  Visits = 1,
  Classes = 2,
  EffortPoints = 3,
  Distance = 4,
  Calories = 5,
  WeightLifted = 6,
  Streak = 7,
  Custom = 8,
}

export const CHALLENGE_METRIC_LABELS: Record<ChallengeMetric, string> = {
  [ChallengeMetric.Visits]: 'Visits',
  [ChallengeMetric.Classes]: 'Classes',
  [ChallengeMetric.EffortPoints]: 'Effort points',
  [ChallengeMetric.Distance]: 'Distance',
  [ChallengeMetric.Calories]: 'Calories',
  [ChallengeMetric.WeightLifted]: 'Weight lifted',
  [ChallengeMetric.Streak]: 'Streak',
  [ChallengeMetric.Custom]: 'Custom',
};

/**
 * What someone does here. Not a permission set on its own — permissions are granted separately —
 * but it drives defaults, the rota, and which screens are worth putting in front of them.
 */
export enum StaffRoleKind {
  Owner = 1,
  Manager = 2,
  DutyManager = 3,
  Receptionist = 4,
  SalesConsultant = 5,
  PersonalTrainer = 6,
  GroupInstructor = 7,
  Coach = 8,
  Physiotherapist = 9,
  Nutritionist = 10,
  Cleaner = 11,
  Maintenance = 12,
  Lifeguard = 13,
  Childcare = 14,
  Other = 15,
}

export const STAFF_ROLE_KIND_LABELS: Record<StaffRoleKind, string> = {
  [StaffRoleKind.Owner]: 'Owner',
  [StaffRoleKind.Manager]: 'Manager',
  [StaffRoleKind.DutyManager]: 'Duty manager',
  [StaffRoleKind.Receptionist]: 'Receptionist',
  [StaffRoleKind.SalesConsultant]: 'Sales consultant',
  [StaffRoleKind.PersonalTrainer]: 'Personal trainer',
  [StaffRoleKind.GroupInstructor]: 'Group instructor',
  [StaffRoleKind.Coach]: 'Coach',
  [StaffRoleKind.Physiotherapist]: 'Physiotherapist',
  [StaffRoleKind.Nutritionist]: 'Nutritionist',
  [StaffRoleKind.Cleaner]: 'Cleaner',
  [StaffRoleKind.Maintenance]: 'Maintenance',
  [StaffRoleKind.Lifeguard]: 'Lifeguard',
  [StaffRoleKind.Childcare]: 'Childcare',
  [StaffRoleKind.Other]: 'Other',
};

/** How a commission line is worked out. A single payslip can carry several of these. */
export enum CommissionBasis {
  PerSessionDelivered = 1,
  PerClassTaught = 2,
  PerClassHead = 3,
  PercentOfSessionValue = 4,
  PercentOfMembershipSold = 5,
  PercentOfPackageSold = 6,
  PercentOfRetailSold = 7,
  FlatPerPeriod = 8,
  TargetBonus = 9,
}

export const COMMISSION_BASIS_LABELS: Record<CommissionBasis, string> = {
  [CommissionBasis.PerSessionDelivered]: 'Per session delivered',
  [CommissionBasis.PerClassTaught]: 'Per class taught',
  [CommissionBasis.PerClassHead]: 'Per class head',
  [CommissionBasis.PercentOfSessionValue]: 'Percent of session value',
  [CommissionBasis.PercentOfMembershipSold]: 'Percent of membership sold',
  [CommissionBasis.PercentOfPackageSold]: 'Percent of package sold',
  [CommissionBasis.PercentOfRetailSold]: 'Percent of retail sold',
  [CommissionBasis.FlatPerPeriod]: 'Flat per period',
  [CommissionBasis.TargetBonus]: 'Target bonus',
};

export enum CommissionStatementStatus {
  Draft = 1,
  Submitted = 2,
  Approved = 3,
  /** Handed to HR payroll as a single posted total. */
  Exported = 4,
  Paid = 5,
  Rejected = 6,
}

export const COMMISSION_STATEMENT_STATUS_LABELS: Record<CommissionStatementStatus, string> = {
  [CommissionStatementStatus.Draft]: 'Draft',
  [CommissionStatementStatus.Submitted]: 'Submitted',
  [CommissionStatementStatus.Approved]: 'Approved',
  [CommissionStatementStatus.Exported]: 'Exported',
  [CommissionStatementStatus.Paid]: 'Paid',
  [CommissionStatementStatus.Rejected]: 'Rejected',
};

export enum ShiftStatus {
  Draft = 1,
  Published = 2,
  /** Nobody assigned; staff can claim it. */
  Open = 3,
  SwapRequested = 4,
  Confirmed = 5,
  Completed = 6,
  NoShow = 7,
  Cancelled = 8,
}

export const SHIFT_STATUS_LABELS: Record<ShiftStatus, string> = {
  [ShiftStatus.Draft]: 'Draft',
  [ShiftStatus.Published]: 'Published',
  [ShiftStatus.Open]: 'Open',
  [ShiftStatus.SwapRequested]: 'Swap requested',
  [ShiftStatus.Confirmed]: 'Confirmed',
  [ShiftStatus.Completed]: 'Completed',
  [ShiftStatus.NoShow]: 'No-show',
  [ShiftStatus.Cancelled]: 'Cancelled',
};

export enum CertificationStatus {
  Valid = 1,
  ExpiringSoon = 2,
  Expired = 3,
  Missing = 4,
  Suspended = 5,
}

export const CERTIFICATION_STATUS_LABELS: Record<CertificationStatus, string> = {
  [CertificationStatus.Valid]: 'Valid',
  [CertificationStatus.ExpiringSoon]: 'Expiring soon',
  [CertificationStatus.Expired]: 'Expired',
  [CertificationStatus.Missing]: 'Missing',
  [CertificationStatus.Suspended]: 'Suspended',
};

export enum LockerStatus {
  Free = 1,
  Rented = 2,
  /** Issued for today only and swept overnight. */
  DayUse = 3,
  OutOfOrder = 4,
  Reserved = 5,
}

export const LOCKER_STATUS_LABELS: Record<LockerStatus, string> = {
  [LockerStatus.Free]: 'Free',
  [LockerStatus.Rented]: 'Rented',
  [LockerStatus.DayUse]: 'Day use',
  [LockerStatus.OutOfOrder]: 'Out of order',
  [LockerStatus.Reserved]: 'Reserved',
};

export enum LockerSize {
  Small = 1,
  Medium = 2,
  Large = 3,
  FullHeight = 4,
}

export const LOCKER_SIZE_LABELS: Record<LockerSize, string> = {
  [LockerSize.Small]: 'Small',
  [LockerSize.Medium]: 'Medium',
  [LockerSize.Large]: 'Large',
  [LockerSize.FullHeight]: 'Full height',
};

export enum ResourceKind {
  SquashCourt = 1,
  TennisCourt = 2,
  BadmintonCourt = 3,
  PoolLane = 4,
  Sauna = 5,
  SteamRoom = 6,
  MassageRoom = 7,
  MeetingRoom = 8,
  StudioHire = 9,
  Equipment = 10,
  PitchOrField = 11,
  ClimbingWall = 12,
  Other = 13,
}

export const RESOURCE_KIND_LABELS: Record<ResourceKind, string> = {
  [ResourceKind.SquashCourt]: 'Squash court',
  [ResourceKind.TennisCourt]: 'Tennis court',
  [ResourceKind.BadmintonCourt]: 'Badminton court',
  [ResourceKind.PoolLane]: 'Pool lane',
  [ResourceKind.Sauna]: 'Sauna',
  [ResourceKind.SteamRoom]: 'Steam room',
  [ResourceKind.MassageRoom]: 'Massage room',
  [ResourceKind.MeetingRoom]: 'Meeting room',
  [ResourceKind.StudioHire]: 'Studio hire',
  [ResourceKind.Equipment]: 'Equipment',
  [ResourceKind.PitchOrField]: 'Pitch or field',
  [ResourceKind.ClimbingWall]: 'Climbing wall',
  [ResourceKind.Other]: 'Other',
};

export enum ResourceBookingStatus {
  Booked = 1,
  CheckedIn = 2,
  Completed = 3,
  NoShow = 4,
  Cancelled = 5,
  LateCancelled = 6,
  Blocked = 7,
}

export const RESOURCE_BOOKING_STATUS_LABELS: Record<ResourceBookingStatus, string> = {
  [ResourceBookingStatus.Booked]: 'Booked',
  [ResourceBookingStatus.CheckedIn]: 'Checked in',
  [ResourceBookingStatus.Completed]: 'Completed',
  [ResourceBookingStatus.NoShow]: 'No-show',
  [ResourceBookingStatus.Cancelled]: 'Cancelled',
  [ResourceBookingStatus.LateCancelled]: 'Late cancelled',
  [ResourceBookingStatus.Blocked]: 'Blocked',
};

export enum AssetStatus {
  InService = 1,
  OutOfOrder = 2,
  UnderMaintenance = 3,
  AwaitingParts = 4,
  Retired = 5,
  Disposed = 6,
}

export const ASSET_STATUS_LABELS: Record<AssetStatus, string> = {
  [AssetStatus.InService]: 'In service',
  [AssetStatus.OutOfOrder]: 'Out of order',
  [AssetStatus.UnderMaintenance]: 'Under maintenance',
  [AssetStatus.AwaitingParts]: 'Awaiting parts',
  [AssetStatus.Retired]: 'Retired',
  [AssetStatus.Disposed]: 'Disposed',
};

export enum WorkOrderStatus {
  Open = 1,
  Assigned = 2,
  InProgress = 3,
  AwaitingParts = 4,
  AwaitingContractor = 5,
  Completed = 6,
  Cancelled = 7,
}

export const WORK_ORDER_STATUS_LABELS: Record<WorkOrderStatus, string> = {
  [WorkOrderStatus.Open]: 'Open',
  [WorkOrderStatus.Assigned]: 'Assigned',
  [WorkOrderStatus.InProgress]: 'In progress',
  [WorkOrderStatus.AwaitingParts]: 'Awaiting parts',
  [WorkOrderStatus.AwaitingContractor]: 'Awaiting contractor',
  [WorkOrderStatus.Completed]: 'Completed',
  [WorkOrderStatus.Cancelled]: 'Cancelled',
};

export enum WorkOrderPriority {
  Low = 1,
  Normal = 2,
  High = 3,
  /** A safety issue — the machine comes out of service immediately. */
  Critical = 4,
}

export const WORK_ORDER_PRIORITY_LABELS: Record<WorkOrderPriority, string> = {
  [WorkOrderPriority.Low]: 'Low',
  [WorkOrderPriority.Normal]: 'Normal',
  [WorkOrderPriority.High]: 'High',
  [WorkOrderPriority.Critical]: 'Critical',
};

export enum MaintenanceTrigger {
  /** Every N days. */
  Interval = 1,
  /** Every N usage hours the equipment reports. */
  UsageHours = 2,
  /** Only when something breaks. */
  OnFault = 3,
}

export const MAINTENANCE_TRIGGER_LABELS: Record<MaintenanceTrigger, string> = {
  [MaintenanceTrigger.Interval]: 'Interval',
  [MaintenanceTrigger.UsageHours]: 'Usage hours',
  [MaintenanceTrigger.OnFault]: 'On fault',
};

export enum DocumentKind {
  Waiver = 1,
  HealthScreening = 2,
  MedicalClearance = 3,
  Agreement = 4,
  PhotoConsent = 5,
  IdDocument = 6,
  GuardianConsent = 7,
  CorporateProof = 8,
  StudentProof = 9,
  InsuranceCertificate = 10,
  Certification = 11,
  Other = 12,
}

export const DOCUMENT_KIND_LABELS: Record<DocumentKind, string> = {
  [DocumentKind.Waiver]: 'Waiver',
  [DocumentKind.HealthScreening]: 'Health screening',
  [DocumentKind.MedicalClearance]: 'Medical clearance',
  [DocumentKind.Agreement]: 'Agreement',
  [DocumentKind.PhotoConsent]: 'Photo consent',
  [DocumentKind.IdDocument]: 'ID document',
  [DocumentKind.GuardianConsent]: 'Guardian consent',
  [DocumentKind.CorporateProof]: 'Corporate proof',
  [DocumentKind.StudentProof]: 'Student proof',
  [DocumentKind.InsuranceCertificate]: 'Insurance certificate',
  [DocumentKind.Certification]: 'Certification',
  [DocumentKind.Other]: 'Other',
};

export enum SignatureStatus {
  NotSigned = 1,
  Signed = 2,
  /** Signed against an older template version; needs re-signing. */
  Superseded = 3,
  Expired = 4,
  Declined = 5,
  /** Sent for remote signature and not yet returned. */
  Pending = 6,
}

export const SIGNATURE_STATUS_LABELS: Record<SignatureStatus, string> = {
  [SignatureStatus.NotSigned]: 'Not signed',
  [SignatureStatus.Signed]: 'Signed',
  [SignatureStatus.Superseded]: 'Superseded',
  [SignatureStatus.Expired]: 'Expired',
  [SignatureStatus.Declined]: 'Declined',
  [SignatureStatus.Pending]: 'Pending',
};

/** How a health-screening answer is captured, and whether it can gate participation. */
export enum ScreeningAnswerKind {
  YesNo = 1,
  Text = 2,
  Number = 3,
  SingleChoice = 4,
  MultiChoice = 5,
  Date = 6,
}

export const SCREENING_ANSWER_KIND_LABELS: Record<ScreeningAnswerKind, string> = {
  [ScreeningAnswerKind.YesNo]: 'Yes no',
  [ScreeningAnswerKind.Text]: 'Text',
  [ScreeningAnswerKind.Number]: 'Number',
  [ScreeningAnswerKind.SingleChoice]: 'Single choice',
  [ScreeningAnswerKind.MultiChoice]: 'Multi choice',
  [ScreeningAnswerKind.Date]: 'Date',
};

export enum ClearanceStatus {
  NotRequired = 1,
  Required = 2,
  Submitted = 3,
  Approved = 4,
  Rejected = 5,
  Expired = 6,
}

export const CLEARANCE_STATUS_LABELS: Record<ClearanceStatus, string> = {
  [ClearanceStatus.NotRequired]: 'Not required',
  [ClearanceStatus.Required]: 'Required',
  [ClearanceStatus.Submitted]: 'Submitted',
  [ClearanceStatus.Approved]: 'Approved',
  [ClearanceStatus.Rejected]: 'Rejected',
  [ClearanceStatus.Expired]: 'Expired',
};

export enum IncidentKind {
  Injury = 1,
  Illness = 2,
  NearMiss = 3,
  EquipmentFailure = 4,
  Slip = 5,
  Aggression = 6,
  Theft = 7,
  PropertyDamage = 8,
  FirstAidGiven = 9,
  AedUsed = 10,
  AmbulanceCalled = 11,
  Safeguarding = 12,
  Other = 13,
}

export const INCIDENT_KIND_LABELS: Record<IncidentKind, string> = {
  [IncidentKind.Injury]: 'Injury',
  [IncidentKind.Illness]: 'Illness',
  [IncidentKind.NearMiss]: 'Near miss',
  [IncidentKind.EquipmentFailure]: 'Equipment failure',
  [IncidentKind.Slip]: 'Slip',
  [IncidentKind.Aggression]: 'Aggression',
  [IncidentKind.Theft]: 'Theft',
  [IncidentKind.PropertyDamage]: 'Property damage',
  [IncidentKind.FirstAidGiven]: 'First aid given',
  [IncidentKind.AedUsed]: 'Aed used',
  [IncidentKind.AmbulanceCalled]: 'Ambulance called',
  [IncidentKind.Safeguarding]: 'Safeguarding',
  [IncidentKind.Other]: 'Other',
};

export enum IncidentSeverity {
  Minor = 1,
  Moderate = 2,
  Serious = 3,
  /** Reportable to a regulator under the market's rules. */
  Reportable = 4,
}

export const INCIDENT_SEVERITY_LABELS: Record<IncidentSeverity, string> = {
  [IncidentSeverity.Minor]: 'Minor',
  [IncidentSeverity.Moderate]: 'Moderate',
  [IncidentSeverity.Serious]: 'Serious',
  [IncidentSeverity.Reportable]: 'Reportable',
};

export enum IncidentStatus {
  Open = 1,
  UnderInvestigation = 2,
  ActionRequired = 3,
  Closed = 4,
  Escalated = 5,
}

export const INCIDENT_STATUS_LABELS: Record<IncidentStatus, string> = {
  [IncidentStatus.Open]: 'Open',
  [IncidentStatus.UnderInvestigation]: 'Under investigation',
  [IncidentStatus.ActionRequired]: 'Action required',
  [IncidentStatus.Closed]: 'Closed',
  [IncidentStatus.Escalated]: 'Escalated',
};

export enum ComplaintStatus {
  Open = 1,
  Acknowledged = 2,
  InProgress = 3,
  Resolved = 4,
  Closed = 5,
  Escalated = 6,
}

export const COMPLAINT_STATUS_LABELS: Record<ComplaintStatus, string> = {
  [ComplaintStatus.Open]: 'Open',
  [ComplaintStatus.Acknowledged]: 'Acknowledged',
  [ComplaintStatus.InProgress]: 'In progress',
  [ComplaintStatus.Resolved]: 'Resolved',
  [ComplaintStatus.Closed]: 'Closed',
  [ComplaintStatus.Escalated]: 'Escalated',
};

export enum LostPropertyStatus {
  Held = 1,
  Claimed = 2,
  Donated = 3,
  Disposed = 4,
}

export const LOST_PROPERTY_STATUS_LABELS: Record<LostPropertyStatus, string> = {
  [LostPropertyStatus.Held]: 'Held',
  [LostPropertyStatus.Claimed]: 'Claimed',
  [LostPropertyStatus.Donated]: 'Donated',
  [LostPropertyStatus.Disposed]: 'Disposed',
};

export enum FacilityCheckKind {
  Opening = 1,
  Closing = 2,
  Cleaning = 3,
  Safety = 4,
  PoolChemistry = 5,
  Temperature = 6,
  EquipmentSweep = 7,
  FireCheck = 8,
  Custom = 9,
}

export const FACILITY_CHECK_KIND_LABELS: Record<FacilityCheckKind, string> = {
  [FacilityCheckKind.Opening]: 'Opening',
  [FacilityCheckKind.Closing]: 'Closing',
  [FacilityCheckKind.Cleaning]: 'Cleaning',
  [FacilityCheckKind.Safety]: 'Safety',
  [FacilityCheckKind.PoolChemistry]: 'Pool chemistry',
  [FacilityCheckKind.Temperature]: 'Temperature',
  [FacilityCheckKind.EquipmentSweep]: 'Equipment sweep',
  [FacilityCheckKind.FireCheck]: 'Fire check',
  [FacilityCheckKind.Custom]: 'Custom',
};

export enum CorporateBillingModel {
  /** The employer pays one invoice for everybody. */
  EmployerPaysAll = 1,
  /** The employee pays a discounted rate themselves. */
  EmployeePaysDiscounted = 2,
  /** Split — the employer covers a fixed amount or percentage. */
  Subsidised = 3,
}

export const CORPORATE_BILLING_MODEL_LABELS: Record<CorporateBillingModel, string> = {
  [CorporateBillingModel.EmployerPaysAll]: 'Employer pays all',
  [CorporateBillingModel.EmployeePaysDiscounted]: 'Employee pays discounted',
  [CorporateBillingModel.Subsidised]: 'Subsidised',
};

export enum EligibilityProof {
  None = 1,
  EmailDomain = 2,
  EmployeeId = 3,
  EmployeeList = 4,
  UploadedDocument = 5,
  AccessCode = 6,
}

export const ELIGIBILITY_PROOF_LABELS: Record<EligibilityProof, string> = {
  [EligibilityProof.None]: 'None',
  [EligibilityProof.EmailDomain]: 'Email domain',
  [EligibilityProof.EmployeeId]: 'Employee ID',
  [EligibilityProof.EmployeeList]: 'Employee list',
  [EligibilityProof.UploadedDocument]: 'Uploaded document',
  [EligibilityProof.AccessCode]: 'Access code',
};

export enum CashSessionStatus {
  Open = 1,
  /** Counted without seeing the expected figure, which is how variance stays honest. */
  BlindCounted = 2,
  Reconciled = 3,
  Closed = 4,
}

export const CASH_SESSION_STATUS_LABELS: Record<CashSessionStatus, string> = {
  [CashSessionStatus.Open]: 'Open',
  [CashSessionStatus.BlindCounted]: 'Blind counted',
  [CashSessionStatus.Reconciled]: 'Reconciled',
  [CashSessionStatus.Closed]: 'Closed',
};

export enum CashMovementKind {
  OpeningFloat = 1,
  Sale = 2,
  Refund = 3,
  PaidIn = 4,
  PaidOut = 5,
  Drop = 6,
  ClosingCount = 7,
  Variance = 8,
}

export const CASH_MOVEMENT_KIND_LABELS: Record<CashMovementKind, string> = {
  [CashMovementKind.OpeningFloat]: 'Opening float',
  [CashMovementKind.Sale]: 'Sale',
  [CashMovementKind.Refund]: 'Refund',
  [CashMovementKind.PaidIn]: 'Paid in',
  [CashMovementKind.PaidOut]: 'Paid out',
  [CashMovementKind.Drop]: 'Drop',
  [CashMovementKind.ClosingCount]: 'Closing count',
  [CashMovementKind.Variance]: 'Variance',
};

/** Coarse period selector shared by every report so the filters look the same everywhere. */
export enum ReportPeriod {
  Today = 1,
  Yesterday = 2,
  ThisWeek = 3,
  LastWeek = 4,
  ThisMonth = 5,
  LastMonth = 6,
  ThisQuarter = 7,
  ThisYear = 8,
  Last7Days = 9,
  Last30Days = 10,
  Last90Days = 11,
  Custom = 12,
}

export const REPORT_PERIOD_LABELS: Record<ReportPeriod, string> = {
  [ReportPeriod.Today]: 'Today',
  [ReportPeriod.Yesterday]: 'Yesterday',
  [ReportPeriod.ThisWeek]: 'This week',
  [ReportPeriod.LastWeek]: 'Last week',
  [ReportPeriod.ThisMonth]: 'This month',
  [ReportPeriod.LastMonth]: 'Last month',
  [ReportPeriod.ThisQuarter]: 'This quarter',
  [ReportPeriod.ThisYear]: 'This year',
  [ReportPeriod.Last7Days]: 'Last7 days',
  [ReportPeriod.Last30Days]: 'Last30 days',
  [ReportPeriod.Last90Days]: 'Last90 days',
  [ReportPeriod.Custom]: 'Custom',
};

/** How a member's units are shown. A body-composition chart in the wrong unit is worse than no chart. */
export enum UnitSystem {
  Metric = 1,
  Imperial = 2,
}

export const UNIT_SYSTEM_LABELS: Record<UnitSystem, string> = {
  [UnitSystem.Metric]: 'Metric',
  [UnitSystem.Imperial]: 'Imperial',
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
