import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { StaffService } from '../../services/fitness.services';
import {
  RotaDto, SaveStaffDto, StaffCertificationDto, StaffSummaryDto,
} from '../../models/fitness.models';
import {
  CertificationStatus, StaffRoleKind, STAFF_ROLE_KIND_LABELS, enumOptions,
} from '../../models/fitness.enums';
import { ClubPickerComponent } from '../shared/club-picker';
import { PageHelpComponent } from '../shared/page-help';
import { FieldErrorComponent, FieldErrors, digits, required, validate } from '../shared/validation';

/**
 * The team, their qualifications and their rota.
 *
 * Two things on this screen are compliance rather than convenience. Expiring qualifications are
 * surfaced before they lapse, because an instructor teaching on an out-of-date first-aid ticket
 * is an insurance problem rather than an admin one. And a PIN, once set, is never shown again to
 * anybody — including the person who set it.
 */
@Component({
  standalone: true,
  selector: 'lib-fitness-staff',
  imports: [CommonModule, FormsModule, ClubPickerComponent, PageHelpComponent, FieldErrorComponent],
  templateUrl: './staff.html',
  styleUrls: ['../fitness-shared.css', './staff.css'],
})
export class StaffComponent {
  private staff = inject(StaffService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  rows: StaffSummaryDto[] = [];
  certifications: StaffCertificationDto[] = [];
  rota: RotaDto | null = null;
  loading = true;
  error = '';
  notice = '';
  clubId: string | null = null;

  tab: 'people' | 'rota' | 'tickets' = 'people';
  role: StaffRoleKind | null = null;
  search = '';

  /** Week shown on the rota. */
  weekStart = this.mondayOf(new Date());

  /** Editor. */
  draft: SaveStaffDto | null = null;
  editing: StaffSummaryDto | null = null;
  errors: FieldErrors = {};
  saving = false;
  newPin = '';

  readonly roleLabels = STAFF_ROLE_KIND_LABELS;
  readonly roleOptions = enumOptions(STAFF_ROLE_KIND_LABELS);
  readonly CertificationStatus = CertificationStatus;

  async onClub(id: string | null): Promise<void> {
    this.clubId = id;
    await this.load();
  }

  async load(): Promise<void> {
    this.loading = true;
    this.error = '';

    const to = new Date(this.weekStart);
    to.setDate(to.getDate() + 7);

    const [people, certs, rota] = await Promise.all([
      firstValueFrom(this.staff.list({
        clubId: this.clubId ?? undefined,
        role: this.role ?? undefined,
        search: this.search.trim() || undefined,
      })).catch(() => null),
      firstValueFrom(this.staff.getCertifications(this.clubId ?? undefined, undefined, false)).catch(() => null),
      this.clubId
        ? firstValueFrom(this.staff.getRota(this.clubId, this.weekStart.toISOString(), to.toISOString()))
            .catch(() => null)
        : Promise.resolve(null),
    ]);

    this.rows = people?.data ?? [];
    this.certifications = certs?.data ?? [];
    this.rota = rota?.data ?? null;

    if (!people) this.error = 'Could not load the team.';

    this.loading = false;
    this.cdr.detectChanges();
  }

  // ── Editing ────────────────────────────────────────────────────────────

  /**
   * The list only carries what a list needs. Permissions live on the full record, so opening the
   * editor fetches it rather than guessing from the summary.
   */
  async edit(person: StaffSummaryDto): Promise<void> {
    this.editing = person;
    this.errors = {};
    this.newPin = '';

    const res = await firstValueFrom(this.staff.getById(person.id)).catch(() => null);
    const full = res?.data;

    this.draft = {
      clubId: this.clubId ?? person.clubId,
      firstName: person.firstName,
      lastName: person.lastName,
      displayName: person.displayName,
      phone: person.phone,
      email: person.email,
      roleKind: person.roleKind,
      isContractor: person.isContractor,
      canSell: full?.canSell ?? false,
      canTrain: full?.canTrain ?? false,
      canTeach: full?.canTeach ?? false,
      canApproveOverrides: full?.canApproveOverrides ?? false,
      isBookable: person.isBookable,
      isActive: person.isActive,
    } as unknown as SaveStaffDto;

    this.cdr.detectChanges();
  }

  create(): void {
    this.editing = null;
    this.errors = {};
    this.newPin = '';
    this.draft = {
      clubId: this.clubId ?? '',
      firstName: '',
      lastName: '',
      roleKind: StaffRoleKind.Receptionist,
      isContractor: false,
      canSell: false,
      canTrain: false,
      canTeach: false,
      canApproveOverrides: false,
      isBookable: false,
      isActive: true,
    } as unknown as SaveStaffDto;
  }

  async save(): Promise<void> {
    if (!this.draft) return;

    const model = { ...this.draft, pin: this.newPin } as unknown as Record<string, unknown>;

    this.errors = validate(model, {
      firstName: [required('A first name')],
      lastName: [required('A last name')],
      pin: [digits(4, 6, 'The PIN')],
    });

    if (Object.keys(this.errors).length > 0) return;

    this.saving = true;
    const payload = { ...this.draft, pin: this.newPin || null } as unknown as SaveStaffDto;

    const res = this.editing
      ? await firstValueFrom(this.staff.update(this.editing.id, payload)).catch(() => null)
      : await firstValueFrom(this.staff.create(payload)).catch(() => null);

    this.saving = false;

    if (res?.data) {
      this.notice = `${res.data.firstName} ${res.data.lastName} saved.`;
      this.draft = null;
      this.editing = null;
      this.newPin = '';
      await this.load();
    } else {
      this.error = 'Could not save that person.';
    }

    this.cdr.detectChanges();
  }

  shiftWeek(weeks: number): void {
    const next = new Date(this.weekStart);
    next.setDate(next.getDate() + weeks * 7);
    this.weekStart = next;
    void this.load();
  }

  async publishRota(): Promise<void> {
    if (!this.clubId) return;

    const to = new Date(this.weekStart);
    to.setDate(to.getDate() + 7);

    const res = await firstValueFrom(
      this.staff.publishRota(this.clubId, this.weekStart.toISOString(), to.toISOString()),
    ).catch(() => null);

    if (res?.data) {
      this.notice = `Rota published — ${res.data.length} shifts. Everyone rostered has been told.`;
      await this.load();
    } else {
      this.error = 'Could not publish the rota.';
    }
  }

  go(route: string): void { void this.router.navigateByUrl(route); }

  // ── Presentation ───────────────────────────────────────────────────────

  get expiring(): StaffCertificationDto[] {
    return this.certifications.filter(
      c => c.status === CertificationStatus.ExpiringSoon || c.status === CertificationStatus.Expired,
    );
  }

  certClass(c: StaffCertificationDto): string {
    if (c.status === CertificationStatus.Expired) return 'is-alert';
    if (c.status === CertificationStatus.ExpiringSoon) return 'is-warn';
    return '';
  }

  get days(): Date[] {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(this.weekStart);
      d.setDate(d.getDate() + i);
      return d;
    });
  }

  shiftsOn(day: Date) {
    const key = day.toDateString();
    return (this.rota?.shifts ?? []).filter(s => new Date(s.startsAt).toDateString() === key);
  }

  gapsOn(day: Date) {
    const key = day.toDateString();
    return (this.rota?.coverageGaps ?? []).filter(g => new Date(g.from).toDateString() === key);
  }

  initials(name: string): string {
    return name.split(' ').filter(Boolean).slice(0, 2).map(p => p[0]).join('').toUpperCase();
  }

  private mondayOf(date: Date): Date {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
    return d;
  }
}
