export interface LeadDto {
  id: string;
  salutation: string | null;
  firstName: string | null;
  lastName: string | null;
  company: string | null;
  title: string | null;
  website: string | null;
  phone: string | null;
  email: string | null;
  street: string | null;
  city: string | null;
  state: string | null;
  postalCode: string | null;
  country: string | null;
  numberOfEmployees: number | null;
  annualRevenue: number | null;
  leadSource: string | null;
  industry: string | null;
  status: string | null;
  ownerId: string | null;
  assignedEmployeeId: string | null;
  description: string | null;
  emailOptOut: boolean;
  isConverted: boolean;
  convertedAt: string | null;
  createdAt: string;
}

export interface CreateLeadDto {
  salutation?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  company?: string | null;
  title?: string | null;
  website?: string | null;
  phone?: string | null;
  email?: string | null;
  street?: string | null;
  city?: string | null;
  state?: string | null;
  postalCode?: string | null;
  country?: string | null;
  numberOfEmployees?: number | null;
  annualRevenue?: number | null;
  leadSource?: string | null;
  industry?: string | null;
  status?: string | null;
  ownerId?: string | null;
  assignedEmployeeId?: string | null;
  description?: string | null;
  emailOptOut: boolean;
}

export interface UpdateLeadDto {
  salutation?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  company?: string | null;
  title?: string | null;
  website?: string | null;
  phone?: string | null;
  email?: string | null;
  street?: string | null;
  city?: string | null;
  state?: string | null;
  postalCode?: string | null;
  country?: string | null;
  numberOfEmployees?: number | null;
  annualRevenue?: number | null;
  leadSource?: string | null;
  industry?: string | null;
  status?: string | null;
  ownerId?: string | null;
  assignedEmployeeId?: string | null;
  description?: string | null;
  emailOptOut?: boolean;
}

export interface ConvertLeadDto {
  createAccount: boolean;
  createContact: boolean;
  createDeal: boolean;
  dealName?: string | null;
  dealAmount?: number | null;
  dealCloseDate?: string | null;
}
