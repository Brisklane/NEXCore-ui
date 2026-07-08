export interface ItemCategoryDto {
  id: string;
  code: string | null;
  name: string | null;
  description: string | null;
  parentCategoryId: string | null;
  isActive: boolean;
  inventoryAccountId: string | null;
  cogsAccountId: string | null;
  purchaseAccountId: string | null;
  salesAccountId: string | null;
}

export interface CreateItemCategoryDto {
  code?: string | null;
  name?: string | null;
  description?: string | null;
  parentCategoryId?: string | null;
  parentInventoryAccountNo?: string | null;
  parentCogsAccountNo?: string | null;
  parentPurchaseAccountNo?: string | null;
  parentSalesAccountNo?: string | null;
  inventoryAccountId?: string | null;
  cogsAccountId?: string | null;
  purchaseAccountId?: string | null;
  salesAccountId?: string | null;
}

export interface GenerateCategoryGlAccountsDto {
  parentInventoryAccountNo?: string | null;
  parentCogsAccountNo?: string | null;
  parentPurchaseAccountNo?: string | null;
  parentSalesAccountNo?: string | null;
}

export interface UpdateItemCategoryDto {
  code?: string | null;
  name?: string | null;
  description?: string | null;
  parentCategoryId?: string | null;
  isActive?: boolean | null;
  inventoryAccountId?: string | null;
  cogsAccountId?: string | null;
  purchaseAccountId?: string | null;
  salesAccountId?: string | null;
  clearGlAccounts: boolean;
}
