export interface JobOfferDto {
  id: string;
  applicationId: string;
  offerDate: string;
  expiryDate: string;
  salary: number;
  currency: string;
  status: string;
  notes?: string;
  createdAt: string;
  modifiedAt: string;
}

export interface CreateJobOfferDto {
  applicationId: string;
  offerDate: string;
  expiryDate: string;
  salary: number;
  currency?: string;
  notes?: string;
}

export interface UpdateJobOfferDto {
  expiryDate?: string;
  salary?: number;
  currency?: string;
  status?: string;
  notes?: string;
}
