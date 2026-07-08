export interface RoutingDto {
  id: string;
  productId: string;
  productName: string | null;
  name: string | null;
  version: number;
  isActive: boolean;
  description: string | null;
  operations: RoutingOperationDto[];
  createdAt: string;
  modifiedAt: string | null;
}

export interface CreateRoutingDto {
  productId: string;
  name: string;
  version: number;
  description?: string | null;
}

export interface UpdateRoutingDto {
  name?: string | null;
  version?: number | null;
  isActive?: boolean | null;
  description?: string | null;
}

export interface RoutingOperationDto {
  id: string;
  routingId: string;
  sequenceNo: number;
  operationName: string | null;
  workCenterId: string;
  workCenterName: string | null;
  standardHours: number;
  setupHours: number;
  laborHours: number;
  machineHours: number;
  notes: string | null;
}

export interface CreateRoutingOperationDto {
  sequenceNo: number;
  operationName?: string | null;
  workCenterId: string;
  standardHours: number;
  setupHours?: number;
  laborHours?: number;
  machineHours?: number;
  notes?: string | null;
}

export interface UpdateRoutingOperationDto {
  sequenceNo?: number | null;
  operationName?: string | null;
  workCenterId?: string | null;
  standardHours?: number | null;
  setupHours?: number | null;
  laborHours?: number | null;
  machineHours?: number | null;
  notes?: string | null;
}
