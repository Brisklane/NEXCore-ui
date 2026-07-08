export interface TagDto {
  id: string;
  tagName: string | null;
  color: string | null;
  description: string | null;
}

export interface CreateTagDto {
  tagName?: string | null;
  color?: string | null;
  description?: string | null;
}

export interface UpdateTagDto {
  tagName?: string | null;
  color?: string | null;
  description?: string | null;
}

export interface AssignTagDto {
  tagId: string;
  entityId: string;
  entityType?: string | null;
}

export interface EntityTagDto {
  id: string;
  tagId: string;
  tagName: string | null;
  entityId: string;
  entityType: string | null;
}
