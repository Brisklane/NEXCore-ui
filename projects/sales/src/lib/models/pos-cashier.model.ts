export interface DenominationCountDto {
  denomination: number;
  count: number;
  isCoin: boolean;
  lineTotal: number;
}

export interface PosCashierDto {
  id: string;
  employeeId: string | null;
  displayName: string | null;
  badgeNumber: string | null;
  branchId: string;
  canApplyManualDiscount: boolean;
  maxManualDiscountPercentage: number | null;
  canVoidTransaction: boolean;
  canIssueRefund: boolean;
  canOpenDrawer: boolean;
  canOverridePrices: boolean;
  canApplyCoupons: boolean;
  canAccessReports: boolean;
  isActive: boolean;
}

// PosSessionStatus: 0=Open, 1=Closed, 2=Suspended, 3=Abandoned
export type PosSessionStatus = number;

export interface PosSessionDto {
  id: string;
  sessionNumber: string | null;
  posTerminalId: string;
  posCashierId: string;
  status: PosSessionStatus;
  openedAt: string;
  closedAt: string | null;
  openingFloat: number;
  openingNotes: string | null;
  openingDenominations: DenominationCountDto[] | null;
  closingFloat: number;
  expectedClosingFloat: number;
  floatVariance: number;
  closingDenominations: DenominationCountDto[] | null;
  totalSalesAmount: number;
  totalRefundsAmount: number;
  totalDiscountsAmount: number;
  totalTaxAmount: number;
  netSalesAmount: number;
  cashCollected: number;
  cardCollected: number;
  walletCollected: number;
  otherCollected: number;
  transactionCount: number;
  closingNotes: string | null;
}

/**
 * Matches `Sales.Domain.Enums.PosCashMovementType`.
 *
 * SafeDrop and PettyCash are money that left the drawer, so they reduce what should be in
 * it at close — a fact the previous comment here got wrong (it called 2 and 3 "Float" and
 * "Adjustment").
 */
export enum PosCashMovementType {
  CashIn = 0,
  CashOut = 1,
  SafeDrop = 2,
  PettyCash = 3,
  OpeningFloat = 4,
  ClosingFloat = 5,
}

export interface PosCashMovementDto {
  id: string;
  posSessionId: string;
  posCashierId: string;
  movementType: PosCashMovementType;
  amount: number;
  reason: string | null;
  movementDate: string;
}

// Swagger CreatePosCashierDto uses posStoreId (not branchId) for the store reference
export interface CreatePosCashierDto {
  employeeId?: string | null;
  displayName: string;
  badgeNumber?: string | null;
  posStoreId: string;
  canApplyManualDiscount?: boolean;
  maxManualDiscountPercentage?: number | null;
  canVoidTransaction?: boolean;
  canIssueRefund?: boolean;
  canOpenDrawer?: boolean;
  canOverridePrices?: boolean;
  canApplyCoupons?: boolean;
  canAccessReports?: boolean;
}

// Swagger UpdatePosCashierDto keeps branchId for the store reference
export interface UpdatePosCashierDto {
  displayName?: string | null;
  badgeNumber?: string | null;
  branchId?: string | null;
  canApplyManualDiscount?: boolean | null;
  maxManualDiscountPercentage?: number | null;
  canVoidTransaction?: boolean | null;
  canIssueRefund?: boolean | null;
  canOpenDrawer?: boolean | null;
  canOverridePrices?: boolean | null;
  canApplyCoupons?: boolean | null;
  canAccessReports?: boolean | null;
  isActive?: boolean | null;
}

export interface SetCashierPinDto {
  pin: string;
}

export interface ChangeCashierPinDto {
  currentPin: string;
  newPin: string;
}

export interface CashierPinLoginDto {
  pin: string;
  storeId: string;
}

export interface CashierCheckInDto {
  cashierId: string;
  terminalId: string;
  openingFloat: number;
  openingNotes?: string | null;
  denominations?: DenominationCountDto[] | null;
}

export interface CashierCheckOutDto {
  closingFloat: number;
  notes?: string | null;
  denominations?: DenominationCountDto[] | null;
}

export interface CashMovementDto {
  cashierId?: string | null;
  amount: number;
  reason?: string | null;
}
