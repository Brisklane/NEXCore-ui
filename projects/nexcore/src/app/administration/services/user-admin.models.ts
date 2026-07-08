export interface AdminUserDto {
  id: string;
  username: string;
  email: string;
  fullName: string;
  phoneNumber?: string | null;
  companyId: string;
  branchId?: string | null;
  businessUnitId?: string | null;
  isActive: boolean;
  isEmailVerified: boolean;
  lastLoginAt?: string | null;
  roles: string[];
  permissions: string[];
  /** Client-side only — true while the account is locked (we don't get this back from the API yet, so it's tracked from the lock/unlock action). */
  isLockedOut?: boolean;
}

export interface UpdateUserRequest {
  fullName: string;
  phoneNumber?: string | null;
  isActive: boolean;
}

export interface InviteUserRequest {
  email: string;
  password: string;
  fullName: string;
  userName: string;
  phoneNumber?: string;
  branchId?: string | null;
  businessUnitId?: string | null;
  roleId?: string | null;
}

export interface RolePermissionDto {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  isActive: boolean;
}

export interface RoleDto {
  id: string;
  companyId: string;
  code: string;
  name: string;
  description?: string | null;
  isActive: boolean;
  permissions: RolePermissionDto[];
}
