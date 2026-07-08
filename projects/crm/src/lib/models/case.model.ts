export interface CaseDto {
  id: string;
  caseNumber: string | null;
  status: string | null;
  caseOrigin: string | null;
  priority: string | null;
  contactId: string | null;
  contactName: string | null;
  accountId: string | null;
  accountName: string | null;
  entitlementId: string | null;
  subject: string | null;
  description: string | null;
  sendNotificationEmail: boolean;
  ownerId: string | null;
  createdAt: string;
}

export interface CreateCaseDto {
  status?: string | null;
  caseOrigin?: string | null;
  priority?: string | null;
  contactId?: string | null;
  accountId?: string | null;
  entitlementId?: string | null;
  subject?: string | null;
  description?: string | null;
  sendNotificationEmail: boolean;
  ownerId?: string | null;
}

export interface UpdateCaseDto {
  status?: string | null;
  caseOrigin?: string | null;
  priority?: string | null;
  contactId?: string | null;
  accountId?: string | null;
  entitlementId?: string | null;
  subject?: string | null;
  description?: string | null;
  sendNotificationEmail?: boolean;
  ownerId?: string | null;
}

export interface CaseCommentDto {
  id: string;
  caseId: string;
  commentBody: string | null;
  isPublished: boolean;
  isInternal: boolean;
  authorId: string | null;
  isCustomerComment: boolean;
  createdAt: string;
}

export interface CreateCaseCommentDto {
  commentBody?: string | null;
  isPublished: boolean;
  isInternal: boolean;
}
