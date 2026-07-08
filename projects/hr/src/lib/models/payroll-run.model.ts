export interface PayrollRunDto {
  id: string;
  name: string;
  periodStart: string;
  periodEnd: string;
  status: string;
  totalAmount: number;
  currency: string;
  processedAt?: string;
  createdAt: string;
  modifiedAt: string;
}

export interface CreatePayrollRunDto {
  name: string;
  periodStart: string;
  periodEnd: string;
  currency?: string;
}

export interface UpdatePayrollRunDto {
  name?: string;
  status?: string;
}
