export interface ContactListDto {
  id: string;
  listName: string | null;
  description: string | null;
  isDynamic: boolean;
  filterCriteria: string | null;
  ownerId: string | null;
  memberCount: number;
  createdAt: string;
}

export interface CreateContactListDto {
  listName?: string | null;
  description?: string | null;
  isDynamic: boolean;
  filterCriteria?: string | null;
  ownerId?: string | null;
}

export interface UpdateContactListDto {
  listName?: string | null;
  description?: string | null;
  isDynamic?: boolean;
  filterCriteria?: string | null;
  ownerId?: string | null;
}

export interface ContactListMemberDto {
  id: string;
  contactListId: string;
  contactId: string | null;
  contactName: string | null;
  leadId: string | null;
  leadName: string | null;
  memberType: string | null;
  createdAt: string;
}

export interface CreateContactListMemberDto {
  contactId?: string | null;
  leadId?: string | null;
  memberType?: string | null;
}
