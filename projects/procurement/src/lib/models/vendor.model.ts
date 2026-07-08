export enum VendorStatus {
  PendingApproval = 0,
  Active = 1,
  Inactive = 2,
  Blocked = 3,
  Archived = 4,
}

export enum VendorType {
  Company = 0,
  Individual = 1,
}

export enum VendorAddressType {
  Billing = 0,
  Shipping = 1,
  Both = 2,
  Registered = 3,
}

export enum VendorOnboardingStatus {
  Draft = 0,
  Submitted = 1,
  UnderReview = 2,
  Approved = 3,
  Rejected = 4,
}

export enum PaymentTerms {
  Immediate = 0,
  Net15 = 1,
  Net30 = 2,
  Net45 = 3,
  Net60 = 4,
  Net90 = 5,
  TwoTenNet30 = 6,
  EndOfMonth = 7,
  CashOnDelivery = 8,
  AdvancePayment = 9,
}

export const PAYMENT_TERMS_LABELS: Record<PaymentTerms, string> = {
  [PaymentTerms.Immediate]: 'Immediate',
  [PaymentTerms.Net15]: 'Net 15',
  [PaymentTerms.Net30]: 'Net 30',
  [PaymentTerms.Net45]: 'Net 45',
  [PaymentTerms.Net60]: 'Net 60',
  [PaymentTerms.Net90]: 'Net 90',
  [PaymentTerms.TwoTenNet30]: '2/10 Net 30',
  [PaymentTerms.EndOfMonth]: 'End of Month',
  [PaymentTerms.CashOnDelivery]: 'Cash on Delivery',
  [PaymentTerms.AdvancePayment]: 'Advance Payment',
};

export const VENDOR_STATUS_LABELS: Record<VendorStatus, string> = {
  [VendorStatus.PendingApproval]: 'Pending Approval',
  [VendorStatus.Active]: 'Active',
  [VendorStatus.Inactive]: 'Inactive',
  [VendorStatus.Blocked]: 'Blocked',
  [VendorStatus.Archived]: 'Archived',
};

export const VENDOR_TYPE_LABELS: Record<VendorType, string> = {
  [VendorType.Company]: 'Company',
  [VendorType.Individual]: 'Individual',
};

export const VENDOR_ADDRESS_TYPE_LABELS: Record<VendorAddressType, string> = {
  [VendorAddressType.Billing]: 'Billing',
  [VendorAddressType.Shipping]: 'Shipping',
  [VendorAddressType.Both]: 'Both',
  [VendorAddressType.Registered]: 'Registered',
};

export const VENDOR_ONBOARDING_LABELS: Record<VendorOnboardingStatus, string> = {
  [VendorOnboardingStatus.Draft]: 'Draft',
  [VendorOnboardingStatus.Submitted]: 'Submitted',
  [VendorOnboardingStatus.UnderReview]: 'Under Review',
  [VendorOnboardingStatus.Approved]: 'Approved',
  [VendorOnboardingStatus.Rejected]: 'Rejected',
};

export interface VendorContactDto {
  id: string;
  firstName: string;
  lastName?: string;
  jobTitle?: string;
  email?: string;
  phone?: string;
  mobile?: string;
  isPrimary: boolean;
}

export interface VendorAddressDto {
  id: string;
  addressType: VendorAddressType;
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  isDefault: boolean;
}

export interface VendorBankAccountDto {
  id: string;
  accountName: string;
  accountNumber: string;
  bankName?: string;
  branchName?: string;
  iban?: string;
  swiftCode?: string;
  currencyCode: string;
  isDefault: boolean;
  isActive: boolean;
}

export interface VendorDto {
  id: string;
  vendorNumber: string;
  name: string;
  shortName?: string;
  type: VendorType;
  status: VendorStatus;
  onboardingStatus: VendorOnboardingStatus;
  taxRegistrationNumber?: string;
  companyRegistrationNumber?: string;
  vatNumber?: string;
  website?: string;
  vendorCategoryId?: string;
  vendorCategoryName?: string;
  primaryEmail?: string;
  primaryPhone?: string;
  primaryMobile?: string;
  currencyCode: string;
  paymentTerms: PaymentTerms;
  leadTimeDays: number;
  creditLimit: number;
  isPreferredVendor: boolean;
  apLedgerAccountId?: string;
  subledgerType: number;
  overallRating?: number;
  onTimeDeliveryRate?: number;
  qualityScore?: number;
  isBlocked: boolean;
  blockReason?: string;
  blockedAt?: string;
  notes?: string;
  internalNotes?: string;
  contacts: VendorContactDto[];
  addresses: VendorAddressDto[];
  bankAccounts: VendorBankAccountDto[];
}

export interface CreateVendorDto {
  name: string;
  shortName?: string;
  type?: VendorType;
  taxRegistrationNumber?: string;
  companyRegistrationNumber?: string;
  vatNumber?: string;
  website?: string;
  vendorCategoryId?: string;
  primaryEmail?: string;
  primaryPhone?: string;
  primaryMobile?: string;
  currencyCode?: string;
  paymentTerms?: PaymentTerms;
  leadTimeDays?: number;
  creditLimit?: number;
  isPreferredVendor?: boolean;
  apLedgerAccountId?: string;
  notes?: string;
  internalNotes?: string;
}

export interface UpdateVendorDto {
  name?: string;
  shortName?: string;
  type?: VendorType;
  taxRegistrationNumber?: string;
  companyRegistrationNumber?: string;
  vatNumber?: string;
  website?: string;
  vendorCategoryId?: string;
  primaryEmail?: string;
  primaryPhone?: string;
  primaryMobile?: string;
  currencyCode?: string;
  paymentTerms?: PaymentTerms;
  leadTimeDays?: number;
  creditLimit?: number;
  isPreferredVendor?: boolean;
  apLedgerAccountId?: string;
  notes?: string;
  internalNotes?: string;
}

export interface BlockVendorDto {
  blockReason: string;
}
