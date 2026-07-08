// Mirrors the backend Rider contract. HomeBranchId carries the rider's POS store id
// (the column has no FK), so the UI can pick a store and resolve its name.
export interface RiderDto {
  id: string;
  riderCode: string | null;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  email: string | null;
  vehicleType: number;
  vehiclePlateNumber: string | null;
  status: number;
  isActive: boolean;
  homeBranchId: string | null;
}

export interface CreateRiderDto {
  riderCode?: string;
  firstName: string;
  lastName?: string | null;
  phone: string;
  email?: string | null;
  vehicleType?: number;
  vehiclePlateNumber?: string | null;
  homeBranchId?: string | null;
}

export interface UpdateRiderDto {
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  email?: string | null;
  vehicleType?: number | null;
  vehiclePlateNumber?: string | null;
  homeBranchId?: string | null;
  isActive?: boolean | null;
}

export interface RiderAssignmentDto {
  id: string;
  riderId: string;
  riderName: string | null;
  orderId: string;
  orderNumber: string | null;
  assignedAt: string;
  completedAt: string | null;
}

export interface CreateRiderAssignmentDto {
  riderId: string;
  orderId: string;
}
