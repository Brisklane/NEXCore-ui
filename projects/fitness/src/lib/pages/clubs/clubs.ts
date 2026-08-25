import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { ClubService } from '../../services/fitness.services';
import {
  ClubAreaDto, ClubDto, ClubScheduleDto, RoomDto, SaveClubDto,
} from '../../models/fitness.models';
import {
  AntiPassbackMode, ANTI_PASSBACK_MODE_LABELS, AreaKind, AREA_KIND_LABELS,
  ClubType, CLUB_TYPE_LABELS, OfflineAccessPolicy, OFFLINE_ACCESS_POLICY_LABELS,
  UnitSystem, UNIT_SYSTEM_LABELS, enumOptions,
} from '../../models/fitness.enums';
import { PageHelpComponent } from '../shared/page-help';
import { FieldErrorComponent, FieldErrors, required, validate } from '../shared/validation';

/**
 * Sites, opening hours, areas and rooms.
 *
 * Opening hours and staffed hours are stored separately because they answer different questions:
 * a 24-hour club is open at 3am with nobody in it, and the access engine, the class scheduler and
 * the incident rules all need to know which is which. The editor keeps them side by side so the
 * distinction is obvious rather than buried in a second tab.
 */
@Component({
  standalone: true,
  selector: 'lib-fitness-clubs',
  imports: [CommonModule, FormsModule, PageHelpComponent, FieldErrorComponent],
  templateUrl: './clubs.html',
  styleUrls: ['../fitness-shared.css', './clubs.css'],
})
export class ClubsComponent implements OnInit {
  private clubs = inject(ClubService);
  private cdr = inject(ChangeDetectorRef);

  rows: ClubDto[] = [];
  loading = true;
  error = '';
  notice = '';

  /** The club being edited, with its hours and spaces. */
  selected: ClubDto | null = null;
  draft: SaveClubDto | null = null;
  schedules: ClubScheduleDto[] = [];
  areas: ClubAreaDto[] = [];
  rooms: RoomDto[] = [];
  tab: 'details' | 'hours' | 'spaces' = 'details';
  errors: FieldErrors = {};
  saving = false;

  readonly dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  readonly typeLabels = CLUB_TYPE_LABELS;
  readonly areaLabels = AREA_KIND_LABELS;
  readonly typeOptions = enumOptions(CLUB_TYPE_LABELS);
  readonly unitOptions = enumOptions(UNIT_SYSTEM_LABELS);
  readonly passbackOptions = enumOptions(ANTI_PASSBACK_MODE_LABELS);
  readonly offlineOptions = enumOptions(OFFLINE_ACCESS_POLICY_LABELS);
  readonly areaOptions = enumOptions(AREA_KIND_LABELS);

  async ngOnInit(): Promise<void> {
    await this.load();
  }

  async load(): Promise<void> {
    this.loading = true;
    const res = await firstValueFrom(this.clubs.getAll(false)).catch(() => null);

    if (!res?.data) this.error = 'Could not load clubs.';
    else this.rows = res.data;

    this.loading = false;
    this.cdr.detectChanges();
  }

  async select(club: ClubDto): Promise<void> {
    this.selected = club;
    this.draft = { ...club } as unknown as SaveClubDto;
    this.tab = 'details';
    this.errors = {};

    const [hours, areas, rooms] = await Promise.all([
      firstValueFrom(this.clubs.getSchedules(club.id)).catch(() => null),
      firstValueFrom(this.clubs.getAreas(club.id)).catch(() => null),
      firstValueFrom(this.clubs.getRooms(club.id)).catch(() => null),
    ]);

    this.schedules = hours?.data ?? this.blankWeek(club.id);
    this.areas = areas?.data ?? [];
    this.rooms = rooms?.data ?? [];
    this.cdr.detectChanges();
  }

  create(): void {
    this.selected = null;
    this.errors = {};
    this.tab = 'details';
    this.draft = {
      name: '',
      clubType: ClubType.Gym,
      currencyCode: 'USD',
      unitSystem: UnitSystem.Metric,
      defaultTaxPercent: 0,
      accessBalanceThreshold: 50,
      antiPassback: AntiPassbackMode.Soft,
      antiPassbackMinutes: 60,
      offlinePolicy: OfflineAccessPolicy.AllowKnownActive,
      minimumAge: 16,
      guardianRequiredBelowAge: 14,
      requiresWaiver: true,
      requiresHealthScreening: true,
      allowsCrossClubVisits: true,
      crossClubVisitFee: 0,
      isTemporarilyClosed: false,
      isActive: true,
    } as unknown as SaveClubDto;
    this.schedules = this.blankWeek('');
    this.areas = [];
    this.rooms = [];
  }

  async save(): Promise<void> {
    if (!this.draft) return;

    this.errors = validate(this.draft as unknown as Record<string, unknown>, {
      name: [required('A club name')],
      currencyCode: [required('A currency')],
    });

    if (Object.keys(this.errors).length > 0) { this.tab = 'details'; return; }

    this.saving = true;
    const res = this.selected
      ? await firstValueFrom(this.clubs.update(this.selected.id, this.draft)).catch(() => null)
      : await firstValueFrom(this.clubs.create(this.draft)).catch(() => null);

    if (res?.data && this.schedules.length > 0) {
      await firstValueFrom(this.clubs.saveSchedules(res.data.id, this.schedules)).catch(() => null);
    }

    this.saving = false;

    if (res?.data) {
      this.notice = `${res.data.name} saved.`;
      this.draft = null;
      this.selected = null;
      await this.load();
    } else {
      this.error = 'Could not save that club.';
    }

    this.cdr.detectChanges();
  }

  /** A blank week, so a new club has seven rows to fill in rather than an empty table. */
  private blankWeek(clubId: string): ClubScheduleDto[] {
    return Array.from({ length: 7 }, (_, day) => ({
      id: '',
      clubId,
      dayOfWeek: day,
      opensAt: '06:00:00',
      closesAt: '22:00:00',
      staffedFrom: '06:30:00',
      staffedTo: '21:30:00',
      isClosed: false,
    } as unknown as ClubScheduleDto));
  }
}
