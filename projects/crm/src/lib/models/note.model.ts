export interface NoteDto {
  id: string;
  title: string | null;
  body: string | null;
  parentId: string;
  parentType: string | null;
  createdAt: string;
}

export interface CreateNoteDto {
  title?: string | null;
  body?: string | null;
  parentId: string;
  parentType?: string | null;
}

export interface UpdateNoteDto {
  title?: string | null;
  body?: string | null;
}
