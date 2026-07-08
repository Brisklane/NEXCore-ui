// ─── Response DTOs ────────────────────────────────────────────────────────────

export interface SalesTeamMemberDto {
  id: string;
  userId: string;
  userName: string | null;
  isActive: boolean;
}

export interface SalesTeamDto {
  id: string;
  name: string | null;
  alias: string | null;
  teamLeaderUserId: string | null;
  teamLeaderName: string | null;
  description: string | null;
  isActive: boolean;
  members: SalesTeamMemberDto[];
}

// ─── Create / Update DTOs ─────────────────────────────────────────────────────

export interface CreateSalesTeamDto {
  name?: string | null;
  alias?: string | null;
  teamLeaderUserId?: string | null;
  teamLeaderName?: string | null;
  description?: string | null;
}

export interface UpdateSalesTeamDto {
  name?: string | null;
  alias?: string | null;
  teamLeaderUserId?: string | null;
  teamLeaderName?: string | null;
  description?: string | null;
  isActive?: boolean | null;
}

export interface AddSalesTeamMemberDto {
  userId: string;
  userName?: string | null;
}
