export interface JobLocationDto {
  id: string;
  companyId?: string;
  locationCode?: string;
  locationName?: string;
  address?: string;
  city?: string;
  stateProvince?: string;
  postalCode?: string;
  country?: string;
  isActive: boolean;
  createdAt: string;
  modifiedAt?: string;
}

export interface CreateJobLocationDto {
  locationCode?: string;
  locationName?: string;
  address?: string;
  city?: string;
  stateProvince?: string;
  postalCode?: string;
  country?: string;
}

export interface UpdateJobLocationDto {
  locationName?: string;
  address?: string;
  city?: string;
  stateProvince?: string;
  postalCode?: string;
  country?: string;
  isActive?: boolean;
}
