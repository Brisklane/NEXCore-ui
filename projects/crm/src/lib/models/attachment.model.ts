export interface AttachmentDto {
  id: string;
  fileName: string | null;
  fileExtension: string | null;
  fileSizeBytes: number;
  contentType: string | null;
  storagePath: string | null;
  parentId: string;
  parentType: string | null;
  description: string | null;
  createdAt: string;
}

export interface CreateAttachmentDto {
  fileName?: string | null;
  fileExtension?: string | null;
  fileSizeBytes: number;
  contentType?: string | null;
  storagePath?: string | null;
  parentId: string;
  parentType?: string | null;
  description?: string | null;
}
