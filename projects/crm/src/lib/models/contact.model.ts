export interface ContactDto {
  id: string;
  salutation: string | null;
  firstName: string | null;
  lastName: string | null;
  accountId: string | null;
  accountName: string | null;
  title: string | null;
  reportsToId: string | null;
  phone: string | null;
  email: string | null;
  mailingStreet: string | null;
  mailingCity: string | null;
  mailingState: string | null;
  mailingPostalCode: string | null;
  mailingCountry: string | null;
  emailOptOut: boolean;
  ownerId: string | null;
  description: string | null;
  createdAt: string;
  isAnonymous: boolean;
}

export interface CreateContactDto {
  salutation?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  accountId?: string | null;
  title?: string | null;
  reportsToId?: string | null;
  phone?: string | null;
  email?: string | null;
  mailingStreet?: string | null;
  mailingCity?: string | null;
  mailingState?: string | null;
  mailingPostalCode?: string | null;
  mailingCountry?: string | null;
  emailOptOut: boolean;
  ownerId?: string | null;
  description?: string | null;
}

export interface UpdateContactDto {
  salutation?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  accountId?: string | null;
  title?: string | null;
  reportsToId?: string | null;
  phone?: string | null;
  email?: string | null;
  mailingStreet?: string | null;
  mailingCity?: string | null;
  mailingState?: string | null;
  mailingPostalCode?: string | null;
  mailingCountry?: string | null;
  emailOptOut?: boolean;
  ownerId?: string | null;
  description?: string | null;
}
