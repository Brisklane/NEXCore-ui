export interface AccountDto {
  id: string;
  accountName: string | null;
  website: string | null;
  phone: string | null;
  type: string | null;
  industry: string | null;
  billingStreet: string | null;
  billingCity: string | null;
  billingState: string | null;
  billingPostalCode: string | null;
  billingCountry: string | null;
  shippingStreet: string | null;
  shippingCity: string | null;
  shippingState: string | null;
  shippingPostalCode: string | null;
  shippingCountry: string | null;
  parentAccountId: string | null;
  ownerId: string | null;
  description: string | null;
  createdAt: string;
}

export interface CreateAccountDto {
  accountName?: string | null;
  website?: string | null;
  phone?: string | null;
  type?: string | null;
  industry?: string | null;
  billingStreet?: string | null;
  billingCity?: string | null;
  billingState?: string | null;
  billingPostalCode?: string | null;
  billingCountry?: string | null;
  shippingStreet?: string | null;
  shippingCity?: string | null;
  shippingState?: string | null;
  shippingPostalCode?: string | null;
  shippingCountry?: string | null;
  parentAccountId?: string | null;
  ownerId?: string | null;
  description?: string | null;
}

export interface UpdateAccountDto {
  accountName?: string | null;
  website?: string | null;
  phone?: string | null;
  type?: string | null;
  industry?: string | null;
  billingStreet?: string | null;
  billingCity?: string | null;
  billingState?: string | null;
  billingPostalCode?: string | null;
  billingCountry?: string | null;
  shippingStreet?: string | null;
  shippingCity?: string | null;
  shippingState?: string | null;
  shippingPostalCode?: string | null;
  shippingCountry?: string | null;
  parentAccountId?: string | null;
  ownerId?: string | null;
  description?: string | null;
}
