export interface ActivityDto {
  id: string;
  type: string | null;
  subject: string | null;
  dueDate: string | null;
  startDateTime: string | null;
  endDateTime: string | null;
  status: string | null;
  priority: string | null;
  durationMinutes: number | null;
  callType: string | null;
  callPurpose: string | null;
  callResult: string | null;
  description: string | null;
  comments: string | null;
  relatedToId: string | null;
  relatedToType: string | null;
  nameId: string | null;
  nameType: string | null;
  assignedToId: string | null;
  createdAt: string;
}

export interface CreateActivityDto {
  type?: string | null;
  subject?: string | null;
  dueDate?: string | null;
  startDateTime?: string | null;
  endDateTime?: string | null;
  status?: string | null;
  priority?: string | null;
  durationMinutes?: number | null;
  callType?: string | null;
  callPurpose?: string | null;
  callResult?: string | null;
  description?: string | null;
  comments?: string | null;
  relatedToId?: string | null;
  relatedToType?: string | null;
  nameId?: string | null;
  nameType?: string | null;
  assignedToId?: string | null;
}

export interface UpdateActivityDto {
  type?: string | null;
  subject?: string | null;
  dueDate?: string | null;
  startDateTime?: string | null;
  endDateTime?: string | null;
  status?: string | null;
  priority?: string | null;
  durationMinutes?: number | null;
  callType?: string | null;
  callPurpose?: string | null;
  callResult?: string | null;
  description?: string | null;
  comments?: string | null;
  relatedToId?: string | null;
  relatedToType?: string | null;
  nameId?: string | null;
  nameType?: string | null;
  assignedToId?: string | null;
}
