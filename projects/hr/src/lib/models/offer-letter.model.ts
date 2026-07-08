export interface OfferLetterDto {
  id: string;
  applicationId?: string;
  candidateId?: string;
  jobId?: string;
  jobOfferId?: string;
  letterContent?: string;
  issuedDate?: string;
  expiryDate?: string;
  statusLookupValueId?: string;
  generatedByEmployeeId?: string;
  notes?: string;
  createdAt?: string;
  modifiedAt?: string;
}

export interface CreateOfferLetterDto {
  applicationId?: string;
  candidateId?: string;
  jobId?: string;
  jobOfferId?: string;
  letterContent?: string;
  issuedDate?: string;
  expiryDate?: string;
  statusLookupValueId?: string;
  generatedByEmployeeId?: string;
  notes?: string;
}

export interface UpdateOfferLetterDto {
  letterContent?: string;
  issuedDate?: string;
  expiryDate?: string;
  statusLookupValueId?: string;
  generatedByEmployeeId?: string;
  notes?: string;
}
