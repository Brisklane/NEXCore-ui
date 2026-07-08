export interface AccountCategoryDto {
  id: string;
  companyId: string;
  name: string | null;
  type: string | null;
  normalBalance: string | null;
  description: string | null;
  isActive: boolean;
}
