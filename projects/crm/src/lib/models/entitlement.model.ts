export interface EntitlementDto {
  id: string;
  entitlementName: string | null;
  accountId: string;
  accountName: string | null;
  contactId: string | null;
  serviceLevelName: string | null;
  type: string | null;
  isPerIncident: boolean;
  startDate: string | null;
  endDate: string | null;
  casesPerEntitlement: number | null;
  casesUsed: number;
  isActive: boolean;
  createdAt: string;
}

export interface CreateEntitlementDto {
  entitlementName?: string | null;
  accountId: string;
  contactId?: string | null;
  serviceLevelName?: string | null;
  type?: string | null;
  isPerIncident: boolean;
  startDate?: string | null;
  endDate?: string | null;
  casesPerEntitlement?: number | null;
  isActive: boolean;
}

export interface UpdateEntitlementDto {
  entitlementName?: string | null;
  accountId: string;
  contactId?: string | null;
  serviceLevelName?: string | null;
  type?: string | null;
  isPerIncident?: boolean;
  startDate?: string | null;
  endDate?: string | null;
  casesPerEntitlement?: number | null;
  isActive?: boolean;
}
