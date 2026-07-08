export interface DeductionDto {
  id: string;
  name: string;
  code: string;
  deductionType: string;
  amount?: number;
  percentage?: number;
  isActive: boolean;
  createdAt: string;
  modifiedAt: string;
}

export interface CreateDeductionDto {
  name: string;
  code: string;
  deductionType: string;
  amount?: number;
  percentage?: number;
}

export interface UpdateDeductionDto {
  name?: string;
  code?: string;
  deductionType?: string;
  amount?: number;
  percentage?: number;
  isActive?: boolean;
}
