export interface PosTerminalDto {
  id: string;
  terminalCode: string | null;
  terminalName: string | null;
  posStoreId: string;
  deviceIdentifier: string | null;
  ipAddress: string | null;
  cashDrawerId: string | null;
  receiptTemplateId: string | null;
  isActive: boolean;
  isOnline: boolean;
  currentSessionId: string | null;
  createdAt: string;
  modifiedAt: string | null;
}

export interface CreatePosTerminalDto {
  terminalCode: string;
  terminalName: string;
  posStoreId: string;
  deviceIdentifier?: string | null;
  ipAddress?: string | null;
  cashDrawerId?: string | null;
  receiptTemplateId?: string | null;
}

export interface UpdatePosTerminalDto {
  terminalName?: string | null;
  deviceIdentifier?: string | null;
  ipAddress?: string | null;
  cashDrawerId?: string | null;
  receiptTemplateId?: string | null;
  isActive?: boolean | null;
  isOnline?: boolean | null;
}

export interface TerminalHeartbeatDto {
  ipAddress?: string | null;
  deviceIdentifier?: string | null;
}
