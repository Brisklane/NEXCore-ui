export interface TaxCodeDto {
  id: string;
  companyId: string;
  code: string | null;
  name: string | null;
  percentage: number;
  isRecoverable: boolean;
  isActive: boolean;
  description: string | null;
}
