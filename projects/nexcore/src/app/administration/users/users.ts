import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '@nexcore/core';
import { AppBadgeComponent } from '@nexcore/shared';
import { UserAdminService } from '../services/user-admin.service';
import { RoleService } from '../services/role.service';
import { AdminUserDto, InviteUserRequest, RoleDto } from '../services/user-admin.models';

type StatusFilter = 'all' | 'active' | 'inactive';

@Component({
  standalone: true,
  selector: 'app-admin-users',
  imports: [CommonModule, FormsModule, AppBadgeComponent],
  templateUrl: './users.html',
  styleUrls: ['./users.css'],
})
export class AdminUsers implements OnInit {
  companyId = '';
  currentUserId = '';

  users: AdminUserDto[] = [];
  roles: RoleDto[] = [];

  loading = false;
  error = '';

  search = '';
  statusFilter: StatusFilter = 'all';
  roleFilter = '';

  // ── Invite modal ──────────────────────────────────────────────────────
  showInviteModal = false;
  inviteSaving = false;
  inviteError = '';
  inviteForm: InviteUserRequest & { confirmPassword: string } = this.emptyInviteForm();

  // ── Role assignment modal ────────────────────────────────────────────
  showRoleModal = false;
  roleModalUser: AdminUserDto | null = null;
  roleModalSaving = false;
  roleModalError = '';
  /** Role ids selected in the modal, seeded by matching role NAME against UserDto.roles (the API only returns role names on the user, not ids). */
  roleModalSelectedIds = new Set<string>();

  // ── Pending action (per-row spinner) ─────────────────────────────────
  pendingActionUserId = '';

  constructor(
    private userAdminService: UserAdminService,
    private roleService: RoleService,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    const user = this.authService.getUser();
    this.companyId = user?.companyId ?? '';
    this.currentUserId = user?.id ?? '';
    this.loadAll();
  }

  private emptyInviteForm(): InviteUserRequest & { confirmPassword: string } {
    return {
      email: '',
      password: '',
      confirmPassword: '',
      fullName: '',
      userName: '',
      phoneNumber: '',
      roleId: null,
    };
  }

  loadAll(): void {
    if (!this.companyId) {
      this.error = 'No active company in session.';
      return;
    }
    this.loading = true;
    this.error = '';

    this.roleService.listByCompany(this.companyId).subscribe({
      next: (res) => (this.roles = res.data ?? []),
      error: () => { /* roles are optional for the list view */ },
    });

    this.userAdminService.listByCompany(this.companyId).subscribe({
      next: (res) => {
        this.users = res.data ?? [];
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load users.';
        this.loading = false;
      },
    });
  }

  get filteredUsers(): AdminUserDto[] {
    const q = this.search.trim().toLowerCase();
    return this.users.filter((u) => {
      if (this.statusFilter === 'active' && !u.isActive) return false;
      if (this.statusFilter === 'inactive' && u.isActive) return false;
      if (this.roleFilter && !u.roles.includes(this.roleFilter)) return false;
      if (!q) return true;
      return (
        u.fullName.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.username.toLowerCase().includes(q)
      );
    });
  }

  get activeCount(): number {
    return this.users.filter((u) => u.isActive).length;
  }

  get lockedCount(): number {
    return this.users.filter((u) => u.isLockedOut).length;
  }

  initials(name: string): string {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return '?';
    return (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase();
  }

  formatLastLogin(iso?: string | null): string {
    if (!iso) return 'Never';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return 'Never';
    return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  }

  // ── Invite ───────────────────────────────────────────────────────────
  openInvite(): void {
    this.inviteForm = this.emptyInviteForm();
    this.inviteError = '';
    this.showInviteModal = true;
  }

  closeInvite(): void {
    this.showInviteModal = false;
  }

  submitInvite(): void {
    this.inviteError = '';

    if (!this.inviteForm.fullName.trim() || !this.inviteForm.userName.trim() || !this.inviteForm.email.trim()) {
      this.inviteError = 'Full name, username and email are required.';
      return;
    }
    if (this.inviteForm.password.length < 8) {
      this.inviteError = 'Password must be at least 8 characters.';
      return;
    }
    if (this.inviteForm.password !== this.inviteForm.confirmPassword) {
      this.inviteError = 'Passwords do not match.';
      return;
    }

    this.inviteSaving = true;
    const { confirmPassword, ...payload } = this.inviteForm;

    this.userAdminService.invite(payload).subscribe({
      next: () => {
        this.inviteSaving = false;
        this.showInviteModal = false;
        this.loadAll();
      },
      error: (err) => {
        this.inviteSaving = false;
        this.inviteError = err?.error?.message || 'Could not invite user.';
      },
    });
  }

  // ── Status / lock actions ───────────────────────────────────────────
  toggleActive(u: AdminUserDto): void {
    this.pendingActionUserId = u.id;
    const action$ = u.isActive ? this.userAdminService.deactivate(u.id) : this.userAdminService.activate(u.id);
    action$.subscribe({
      next: () => {
        u.isActive = !u.isActive;
        this.pendingActionUserId = '';
      },
      error: () => {
        this.error = 'Action failed.';
        this.pendingActionUserId = '';
      },
    });
  }

  toggleLock(u: AdminUserDto): void {
    this.pendingActionUserId = u.id;
    const action$ = u.isLockedOut ? this.userAdminService.unlock(u.id) : this.userAdminService.lock(u.id);
    action$.subscribe({
      next: () => {
        u.isLockedOut = !u.isLockedOut;
        this.pendingActionUserId = '';
      },
      error: () => {
        this.error = 'Action failed.';
        this.pendingActionUserId = '';
      },
    });
  }

  // ── Role assignment modal ───────────────────────────────────────────
  openRoleModal(u: AdminUserDto): void {
    this.roleModalUser = u;
    this.roleModalError = '';
    this.roleModalSelectedIds = new Set(
      this.roles.filter((r) => u.roles.includes(r.name)).map((r) => r.id),
    );
    this.showRoleModal = true;
  }

  closeRoleModal(): void {
    this.showRoleModal = false;
    this.roleModalUser = null;
  }

  toggleRoleSelection(roleId: string): void {
    if (this.roleModalSelectedIds.has(roleId)) {
      this.roleModalSelectedIds.delete(roleId);
    } else {
      this.roleModalSelectedIds.add(roleId);
    }
  }

  saveRoleAssignments(): void {
    if (!this.roleModalUser) return;
    const user = this.roleModalUser;
    const originalIds = new Set(this.roles.filter((r) => user.roles.includes(r.name)).map((r) => r.id));

    const toAssign = [...this.roleModalSelectedIds].filter((id) => !originalIds.has(id));
    const toRemove = [...originalIds].filter((id) => !this.roleModalSelectedIds.has(id));

    if (!toAssign.length && !toRemove.length) {
      this.closeRoleModal();
      return;
    }

    this.roleModalSaving = true;
    const calls = [
      ...toAssign.map((roleId) => this.roleService.assign(user.id, roleId)),
      ...toRemove.map((roleId) => this.roleService.remove(user.id, roleId)),
    ];

    let remaining = calls.length;
    let failed = false;
    calls.forEach((call$) => {
      call$.subscribe({
        next: () => {
          remaining--;
          if (remaining === 0) this.finishRoleSave(failed);
        },
        error: () => {
          failed = true;
          remaining--;
          if (remaining === 0) this.finishRoleSave(failed);
        },
      });
    });
  }

  private finishRoleSave(failed: boolean): void {
    this.roleModalSaving = false;
    if (failed) {
      this.roleModalError = 'Some role changes could not be saved.';
      return;
    }
    const roleNames = this.roles
      .filter((r) => this.roleModalSelectedIds.has(r.id))
      .map((r) => r.name);
    if (this.roleModalUser) this.roleModalUser.roles = roleNames;
    this.closeRoleModal();
  }
}
