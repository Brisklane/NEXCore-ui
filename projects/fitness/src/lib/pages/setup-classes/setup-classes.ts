import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { ClubService, ScheduleService } from '../../services/fitness.services';
import {
  BookingPolicyDto, CancellationPolicyDto, ClassTypeDto, ClubAreaDto,
  RoomDto, RoomSpotDto, SaveClassTypeDto, SaveRoomLayoutDto,
} from '../../models/fitness.models';
import { AREA_KIND_LABELS, AreaKind, enumOptions } from '../../models/fitness.enums';
import { ClubPickerComponent } from '../shared/club-picker';
import { PageHelpComponent } from '../shared/page-help';

/**
 * What a club is made of: the classes it runs and the spaces it runs them in.
 *
 * This is the screen the schedule builder depends on. A club cannot put Reformer Pilates on the
 * timetable until somebody has said what Reformer Pilates is — how long it lasts, how many places
 * there are, what it costs a drop-in and whether it needs a clearance first.
 *
 * A spot map is drawn here rather than described. Cycle and reformer studios book a *specific*
 * bike or bed, and a member who booked bike 7 wants bike 7 — so the grid is laid out by hand,
 * out-of-service equipment included, and the booking screen reads it back exactly as drawn.
 */
@Component({
  standalone: true,
  selector: 'lib-fitness-setup-classes',
  imports: [CommonModule, FormsModule, ClubPickerComponent, PageHelpComponent],
  templateUrl: './setup-classes.html',
  styleUrls: ['../fitness-shared.css', './setup-classes.css'],
})
export class SetupClassesComponent {
  private schedules = inject(ScheduleService);
  private clubs = inject(ClubService);
  private cdr = inject(ChangeDetectorRef);

  classTypes: ClassTypeDto[] = [];
  rooms: RoomDto[] = [];
  areas: ClubAreaDto[] = [];
  bookingPolicies: BookingPolicyDto[] = [];
  cancellationPolicies: CancellationPolicyDto[] = [];

  loading = true;
  error = '';
  notice = '';
  busy = false;
  clubId: string | null = null;

  tab: 'classes' | 'rooms' | 'areas' = 'classes';

  /** The class type being written. */
  typeDraft: SaveClassTypeDto | null = null;
  typeDraftId: string | null = null;

  /** The room layout being drawn. */
  roomDraft: SaveRoomLayoutDto | null = null;

  /** The area being written. */
  areaDraft: ClubAreaDto | null = null;

  formError = '';

  readonly areaKindOptions = enumOptions(AREA_KIND_LABELS);
  readonly areaLabels = AREA_KIND_LABELS;

  /** Enough distinct colours to tell a timetable apart at a glance, all readable on white. */
  readonly palette = [
    '#2b7fff', '#7c5cff', '#e8467c', '#f59e0b', '#16a34a',
    '#22c7e6', '#ef4444', '#0ea5e9', '#84cc16', '#64748b',
  ];

  async onClub(id: string | null): Promise<void> {
    this.clubId = id;
    await this.load();
  }

  async load(): Promise<void> {
    if (!this.clubId) { this.loading = false; return; }

    this.loading = true;
    this.error = '';

    const [types, rooms, areas, booking, cancellation] = await Promise.all([
      firstValueFrom(this.schedules.getClassTypes(this.clubId, false)).catch(() => null),
      firstValueFrom(this.clubs.getRooms(this.clubId)).catch(() => null),
      firstValueFrom(this.clubs.getAreas(this.clubId)).catch(() => null),
      firstValueFrom(this.schedules.getBookingPolicies(this.clubId)).catch(() => null),
      firstValueFrom(this.schedules.getCancellationPolicies(this.clubId)).catch(() => null),
    ]);

    this.classTypes = types?.data ?? [];
    this.rooms = rooms?.data ?? [];
    this.areas = areas?.data ?? [];
    this.bookingPolicies = booking?.data ?? [];
    this.cancellationPolicies = cancellation?.data ?? [];

    if (!types) this.error = 'Could not load the class types.';

    this.loading = false;
    this.cdr.detectChanges();
  }

  // ── Class types ────────────────────────────────────────────────────────

  newClassType(): void {
    this.typeDraftId = null;
    this.formError = '';
    this.typeDraft = {
      code: null,
      name: '',
      discipline: null,
      marketingBlurb: null,
      imageUrl: null,
      colourHex: this.palette[this.classTypes.length % this.palette.length],
      displayOrder: this.classTypes.length + 1,
      defaultDurationMinutes: 45,
      defaultCapacity: 20,
      intensity: 3,
      equipmentNeeded: null,
      minimumAge: null,
      maximumAge: null,
      requiresSkillClearance: false,
      requiredSkillId: null,
      allowsDropIn: true,
      dropInPrice: 0,
      creditCost: 1,
      bookingPolicyId: null,
      cancellationPolicyId: null,
      availableToMarketplace: false,
      isBookable: true,
      isActive: true,
      description: null,
    };
  }

  editClassType(t: ClassTypeDto): void {
    this.typeDraftId = t.id;
    this.formError = '';
    this.typeDraft = {
      code: t.code ?? null,
      name: t.name,
      discipline: t.discipline ?? null,
      marketingBlurb: t.marketingBlurb ?? null,
      imageUrl: t.imageUrl ?? null,
      colourHex: t.colourHex ?? this.palette[0],
      displayOrder: t.displayOrder,
      defaultDurationMinutes: t.defaultDurationMinutes,
      defaultCapacity: t.defaultCapacity,
      intensity: t.intensity,
      equipmentNeeded: t.equipmentNeeded ?? null,
      minimumAge: t.minimumAge ?? null,
      maximumAge: t.maximumAge ?? null,
      requiresSkillClearance: t.requiresSkillClearance,
      requiredSkillId: t.requiredSkillId ?? null,
      allowsDropIn: t.allowsDropIn,
      dropInPrice: t.dropInPrice,
      creditCost: t.creditCost,
      bookingPolicyId: t.bookingPolicyId ?? null,
      cancellationPolicyId: t.cancellationPolicyId ?? null,
      availableToMarketplace: t.availableToMarketplace,
      isBookable: t.isBookable,
      isActive: t.isActive,
      description: null,
    };
  }

  async saveClassType(): Promise<void> {
    if (!this.typeDraft) return;

    this.formError = '';

    if (!this.typeDraft.name.trim()) { this.formError = 'Give the class a name.'; return; }
    if (this.typeDraft.defaultDurationMinutes < 5) { this.formError = 'A class has to last at least five minutes.'; return; }
    if (this.typeDraft.defaultCapacity < 1) { this.formError = 'A class needs at least one place.'; return; }

    if (this.typeDraft.minimumAge != null && this.typeDraft.maximumAge != null
      && this.typeDraft.minimumAge > this.typeDraft.maximumAge) {
      this.formError = 'The minimum age cannot be above the maximum age.';
      return;
    }

    this.busy = true;
    const res = await firstValueFrom(
      this.schedules.saveClassType(this.typeDraft, this.typeDraftId ?? undefined)).catch(() => null);
    this.busy = false;

    if (res?.data) {
      this.notice = `${this.typeDraft.name} saved.`;
      this.typeDraft = null;
      this.typeDraftId = null;
      await this.load();
    } else {
      this.formError = 'Could not save that class type.';
    }

    this.cdr.detectChanges();
  }

  /**
   * Retiring a class type rather than deleting it.
   *
   * The API refuses to delete one that has been scheduled, because the history of what members
   * attended has to keep making sense. Marking it inactive keeps it out of new schedules.
   */
  async retireClassType(t: ClassTypeDto): Promise<void> {
    this.busy = true;
    const res = await firstValueFrom(this.schedules.deleteClassType(t.id)).catch(() => null);
    this.busy = false;

    if (res) {
      this.notice = `${t.name} retired. Classes already on the timetable are untouched.`;
      await this.load();
    } else {
      this.error = `Could not retire ${t.name}. It may still be on the timetable.`;
    }

    this.cdr.detectChanges();
  }

  // ── Rooms and spot maps ────────────────────────────────────────────────

  newRoom(): void {
    if (!this.clubId) return;

    this.formError = '';
    this.roomDraft = {
      roomId: null,
      clubId: this.clubId,
      areaId: null,
      name: '',
      capacity: 20,
      hasSpotMap: false,
      gridColumns: 5,
      gridRows: 4,
      equipmentNote: null,
      spots: [],
    };
  }

  editRoom(r: RoomDto): void {
    this.formError = '';
    this.roomDraft = {
      roomId: r.id,
      clubId: r.clubId,
      areaId: r.areaId ?? null,
      name: r.name,
      capacity: r.capacity,
      hasSpotMap: r.hasSpotMap,
      gridColumns: r.gridColumns || 5,
      gridRows: r.gridRows || 4,
      equipmentNote: r.equipmentNote ?? null,
      spots: r.spots.map(s => ({ ...s })),
    };
  }

  spotAt(column: number, row: number): RoomSpotDto | null {
    return this.roomDraft?.spots.find(s => s.gridColumn === column && s.gridRow === row) ?? null;
  }

  /**
   * Click a square to place a bike, click it again to take it away.
   *
   * Labels follow the order they were placed, which is how an instructor calls them out. A gap in
   * the grid is a real thing — a pillar, a door, the space the instructor stands in.
   */
  toggleSpot(column: number, row: number): void {
    if (!this.roomDraft) return;

    const existing = this.spotAt(column, row);

    if (existing) {
      this.roomDraft.spots = this.roomDraft.spots.filter(s => s !== existing);
      return;
    }

    this.roomDraft.spots = [...this.roomDraft.spots, {
      id: '00000000-0000-0000-0000-000000000000',
      roomId: this.roomDraft.roomId ?? '00000000-0000-0000-0000-000000000000',
      label: String(this.roomDraft.spots.length + 1),
      gridColumn: column,
      gridRow: row,
      equipmentAssetId: null,
      isReserved: false,
      reservedNote: null,
      isOutOfService: false,
      bookedByMemberId: null,
      bookedByName: null,
    }];
  }

  /** A bike out for repair stays on the map and stays unbookable, so nobody is sold it. */
  toggleSpotOutOfService(spot: RoomSpotDto, event: Event): void {
    event.stopPropagation();
    spot.isOutOfService = !spot.isOutOfService;
  }

  /** Fill every square, for the common case of a room that is simply rows of bikes. */
  fillGrid(): void {
    if (!this.roomDraft) return;

    const spots: RoomSpotDto[] = [];
    let n = 1;

    for (let row = 1; row <= this.roomDraft.gridRows; row++) {
      for (let col = 1; col <= this.roomDraft.gridColumns; col++) {
        const existing = this.spotAt(col, row);
        spots.push(existing
          ? { ...existing, label: existing.label || String(n) }
          : {
            id: '00000000-0000-0000-0000-000000000000',
            roomId: this.roomDraft.roomId ?? '00000000-0000-0000-0000-000000000000',
            label: String(n),
            gridColumn: col,
            gridRow: row,
            equipmentAssetId: null,
            isReserved: false,
            reservedNote: null,
            isOutOfService: false,
            bookedByMemberId: null,
            bookedByName: null,
          });
        n++;
      }
    }

    this.roomDraft.spots = spots;
  }

  clearGrid(): void {
    if (this.roomDraft) this.roomDraft.spots = [];
  }

  get placedSpots(): number { return this.roomDraft?.spots.length ?? 0; }

  get bookableSpots(): number {
    return (this.roomDraft?.spots ?? []).filter(s => !s.isOutOfService).length;
  }

  async saveRoom(): Promise<void> {
    if (!this.roomDraft) return;

    this.formError = '';

    if (!this.roomDraft.name.trim()) { this.formError = 'Give the room a name.'; return; }
    if (this.roomDraft.capacity < 1) { this.formError = 'A room needs at least one place.'; return; }

    if (this.roomDraft.hasSpotMap && this.bookableSpots === 0) {
      this.formError = 'A room with a spot map needs at least one bookable spot on it.';
      return;
    }

    // A spot map that holds fewer people than the room says is the number members will actually
    // be able to book, so say so rather than letting the class oversell itself.
    if (this.roomDraft.hasSpotMap && this.bookableSpots < this.roomDraft.capacity) {
      this.roomDraft.capacity = this.bookableSpots;
    }

    this.busy = true;
    const res = await firstValueFrom(this.clubs.saveRoomLayout(this.roomDraft)).catch(() => null);
    this.busy = false;

    if (res?.data) {
      this.notice = `${this.roomDraft.name} saved.`;
      this.roomDraft = null;
      await this.load();
    } else {
      this.formError = 'Could not save that room.';
    }

    this.cdr.detectChanges();
  }

  // ── Areas ──────────────────────────────────────────────────────────────

  newArea(): void {
    if (!this.clubId) return;

    this.formError = '';
    this.areaDraft = {
      id: '',
      clubId: this.clubId,
      name: '',
      kind: AreaKind.Studio,
      displayOrder: this.areas.length + 1,
      capacity: null,
      currentOccupancy: 0,
      requiresEntitlement: false,
      minimumAge: null,
      maxParticipantsPerStaff: null,
      isOutOfService: false,
      outOfServiceNote: null,
      isActive: true,
      doorCount: 0,
    };
  }

  editArea(a: ClubAreaDto): void {
    this.formError = '';
    this.areaDraft = { ...a };
  }

  async saveArea(): Promise<void> {
    if (!this.areaDraft) return;

    this.formError = '';

    if (!this.areaDraft.name.trim()) { this.formError = 'Give the area a name.'; return; }

    if (this.areaDraft.isOutOfService && !this.areaDraft.outOfServiceNote?.trim()) {
      this.formError = 'Say why it is out of service — reception will be asked.';
      return;
    }

    this.busy = true;
    const res = await firstValueFrom(
      this.clubs.saveArea(this.areaDraft, this.areaDraft.id || undefined)).catch(() => null);
    this.busy = false;

    if (res?.data) {
      this.notice = `${this.areaDraft.name} saved.`;
      this.areaDraft = null;
      await this.load();
    } else {
      this.formError = 'Could not save that area.';
    }

    this.cdr.detectChanges();
  }

  // ── Presentation ───────────────────────────────────────────────────────

  get gridColumns(): number[] {
    return Array.from({ length: this.roomDraft?.gridColumns ?? 0 }, (_, i) => i + 1);
  }

  get gridRows(): number[] {
    return Array.from({ length: this.roomDraft?.gridRows ?? 0 }, (_, i) => i + 1);
  }

  intensityLabel(level: number): string {
    return ['', 'Very gentle', 'Gentle', 'Moderate', 'Hard', 'Very hard'][level] ?? 'Moderate';
  }

  roomsInArea(areaId: string): number {
    return this.rooms.filter(r => r.areaId === areaId).length;
  }
}
