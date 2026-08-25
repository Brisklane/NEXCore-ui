import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { MemberService } from '../../services/fitness.services';
import {
  HouseholdDto, HouseholdMemberDto, MemberSummaryDto, SaveHouseholdDto,
} from '../../models/fitness.models';
import { HOUSEHOLD_ROLE_LABELS, HouseholdRole, enumOptions } from '../../models/fitness.enums';
import { ClubPickerComponent } from '../shared/club-picker';
import { PageHelpComponent } from '../shared/page-help';

/**
 * Families and couples: who is billed together, and who may collect the children.
 *
 * Two questions get asked at the desk that this screen exists to answer. "Can I put this on the
 * family account?" and "is this person allowed to take that child home?" Both need an answer that
 * was written down in advance by somebody with the authority to decide it, not one reception
 * improvises while a queue forms.
 *
 * Taking somebody out of a household does not take them out of the club. They keep every
 * agreement, invoice and visit they ever had, and simply go back to being billed on their own.
 */
@Component({
  standalone: true,
  selector: 'lib-fitness-households',
  imports: [CommonModule, FormsModule, ClubPickerComponent, PageHelpComponent],
  templateUrl: './households.html',
  styleUrls: ['../fitness-shared.css', './households.css'],
})
export class HouseholdsComponent {
  private members = inject(MemberService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  rows: HouseholdDto[] = [];
  loading = true;
  error = '';
  notice = '';
  busy = false;
  clubId: string | null = null;

  search = '';
  total = 0;
  pageNumber = 1;
  readonly pageSize = 30;

  /** The household being written, and the id it belongs to. */
  draft: SaveHouseholdDto | null = null;
  formError = '';

  /** Adding somebody to the family. */
  memberSearch = '';
  memberResults: MemberSummaryDto[] = [];

  readonly roleOptions = enumOptions(HOUSEHOLD_ROLE_LABELS);
  readonly roleLabels = HOUSEHOLD_ROLE_LABELS;
  readonly HouseholdRole = HouseholdRole;

  private searchTimer?: ReturnType<typeof setTimeout>;

  async onClub(id: string | null): Promise<void> {
    this.clubId = id;
    this.pageNumber = 1;
    await this.load();
  }

  async load(): Promise<void> {
    this.loading = true;
    this.error = '';

    const res = await firstValueFrom(this.members.listHouseholds({
      clubId: this.clubId ?? undefined,
      search: this.search.trim() || undefined,
      page: this.pageNumber,
      size: this.pageSize,
    })).catch(() => null);

    this.rows = res?.data ?? [];
    this.total = res?.pagination?.totalCount ?? this.rows.length;

    if (!res) this.error = 'Could not load the households.';

    this.loading = false;
    this.cdr.detectChanges();
  }

  onSearch(): void {
    if (this.searchTimer) clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => {
      this.pageNumber = 1;
      void this.load();
    }, 260);
  }

  turnPage(by: number): void {
    const next = this.pageNumber + by;
    if (next < 1 || (next - 1) * this.pageSize >= this.total) return;
    this.pageNumber = next;
    void this.load();
  }

  get pageCount(): number { return Math.max(1, Math.ceil(this.total / this.pageSize)); }

  // ── Writing a household ────────────────────────────────────────────────

  create(): void {
    this.formError = '';
    this.memberSearch = '';
    this.memberResults = [];
    this.draft = {
      id: null,
      name: '',
      primaryMemberId: '',
      addressLine: null,
      city: null,
      postCode: null,
      // The common case: either parent can collect. A club that needs it tighter turns it off.
      anyAdultMayCheckInChildren: true,
      members: [],
    };
  }

  edit(h: HouseholdDto): void {
    this.formError = '';
    this.memberSearch = '';
    this.memberResults = [];
    this.draft = {
      id: h.id,
      name: h.name,
      primaryMemberId: h.primaryMemberId,
      addressLine: h.addressLine ?? null,
      city: h.city ?? null,
      postCode: h.postCode ?? null,
      anyAdultMayCheckInChildren: h.anyAdultMayCheckInChildren,
      members: h.members.map(m => ({ ...m })),
    };
  }

  onMemberSearch(): void {
    if (this.searchTimer) clearTimeout(this.searchTimer);
    if (this.memberSearch.trim().length < 2) { this.memberResults = []; return; }

    this.searchTimer = setTimeout(async () => {
      const res = await firstValueFrom(this.members.search({
        query: this.memberSearch.trim(),
        clubId: this.clubId,
        includeInactive: false,
        limit: 6,
      })).catch(() => null);

      const already = new Set((this.draft?.members ?? []).map(m => m.memberId));
      this.memberResults = (res?.data ?? []).filter(m => !already.has(m.id));
      this.cdr.detectChanges();
    }, 240);
  }

  addMember(m: MemberSummaryDto): void {
    if (!this.draft) return;

    this.draft.members = [...this.draft.members, {
      id: '00000000-0000-0000-0000-000000000000',
      householdId: this.draft.id ?? '00000000-0000-0000-0000-000000000000',
      memberId: m.id,
      memberName: m.fullName,
      photoUrl: m.photoUrl ?? null,
      memberStatus: m.status,
      age: null,
      role: this.draft.members.length === 0 ? HouseholdRole.Primary : HouseholdRole.Partner,
      mayCollectChildren: true,
      agesOutOn: null,
      agesOutSoon: false,
    } as HouseholdMemberDto];

    // The first person added is the one the combined invoice goes to, until somebody says otherwise.
    if (!this.draft.primaryMemberId) this.draft.primaryMemberId = m.id;
    if (!this.draft.name.trim()) this.draft.name = `${m.fullName.split(' ').slice(-1)[0]} household`;

    this.memberSearch = '';
    this.memberResults = [];
  }

  removeMember(row: HouseholdMemberDto): void {
    if (!this.draft) return;

    this.draft.members = this.draft.members.filter(m => m !== row);

    if (this.draft.primaryMemberId === row.memberId) {
      this.draft.primaryMemberId = this.draft.members[0]?.memberId ?? '';
    }
  }

  /** A child cannot be the person the invoice goes to. */
  canBePrimary(row: HouseholdMemberDto): boolean {
    return row.role !== HouseholdRole.Child;
  }

  async save(): Promise<void> {
    if (!this.draft) return;

    this.formError = '';

    if (!this.draft.name.trim()) { this.formError = 'Give the household a name.'; return; }
    if (this.draft.members.length < 2) {
      this.formError = 'A household needs at least two people. One person is just a member.';
      return;
    }

    if (!this.draft.primaryMemberId) {
      this.formError = 'Say who the invoice goes to.';
      return;
    }

    const primary = this.draft.members.find(m => m.memberId === this.draft!.primaryMemberId);
    if (!primary || !this.canBePrimary(primary)) {
      this.formError = 'A child cannot be the person the invoice goes to.';
      return;
    }

    if (this.draft.members.some(m => m.role === HouseholdRole.Child)
      && !this.draft.members.some(m => m.role !== HouseholdRole.Child && m.mayCollectChildren)) {
      this.formError = 'At least one adult has to be allowed to collect the children.';
      return;
    }

    this.busy = true;
    const res = await firstValueFrom(this.members.saveHousehold(this.draft)).catch(() => null);
    this.busy = false;

    if (res?.data) {
      this.notice = `${this.draft.name} saved.`;
      this.draft = null;
      await this.load();
    } else {
      this.formError = 'Could not save that household.';
    }

    this.cdr.detectChanges();
  }

  openMember(memberId: string): void {
    void this.router.navigateByUrl(`/fitness/members/${memberId}`);
  }

  // ── Presentation ───────────────────────────────────────────────────────

  adults(h: HouseholdDto): number {
    return h.members.filter(m => m.role !== HouseholdRole.Child).length;
  }

  children(h: HouseholdDto): number {
    return h.members.filter(m => m.role === HouseholdRole.Child).length;
  }

  /** Juniors close enough to eighteen that the family plan needs revisiting before it lapses. */
  agingOut(h: HouseholdDto): HouseholdMemberDto[] {
    return h.members.filter(m => m.agesOutSoon);
  }

  collectors(h: HouseholdDto): HouseholdMemberDto[] {
    return h.members.filter(m => m.mayCollectChildren && m.role !== HouseholdRole.Child);
  }

  initials(name: string): string {
    return name.split(' ').filter(Boolean).slice(0, 2).map(p => p[0]).join('').toUpperCase();
  }
}
