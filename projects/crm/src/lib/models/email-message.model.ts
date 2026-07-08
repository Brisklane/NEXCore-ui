export interface EmailMessageDto {
  id: string;
  subject: string | null;
  htmlBody: string | null;
  textBody: string | null;
  fromAddress: string | null;
  fromName: string | null;
  toAddress: string | null;
  ccAddress: string | null;
  incoming: boolean;
  messageDate: string | null;
  isRead: boolean;
  isTracked: boolean;
  openCount: number;
  clickCount: number;
  relatedToId: string | null;
  relatedToType: string | null;
  sentByUserId: string | null;
  createdAt: string;
}

export interface CreateEmailMessageDto {
  subject?: string | null;
  htmlBody?: string | null;
  textBody?: string | null;
  fromAddress?: string | null;
  fromName?: string | null;
  toAddress?: string | null;
  ccAddress?: string | null;
  bccAddress?: string | null;
  incoming: boolean;
  messageDate?: string | null;
  isTracked: boolean;
  relatedToId?: string | null;
  relatedToType?: string | null;
  messageId?: string | null;
  inReplyToId?: string | null;
  threadIdentifier?: string | null;
}
