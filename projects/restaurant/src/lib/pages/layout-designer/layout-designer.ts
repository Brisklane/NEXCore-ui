import { ChangeDetectorRef, Component, ElementRef, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { FloorService } from '../../services/restaurant.services';
import {
  FixtureDto, FloorDto, SaveTableDto, SectionDto, TableDto,
} from '../../models/restaurant.models';
import {
  FIXTURE_LABELS, FloorFixtureKind, TABLE_SHAPE_LABELS, TableShape, TableState, enumOptions,
} from '../../models/restaurant.enums';
import { OutletPickerComponent } from '../shared/outlet-picker';
import { PageHelpComponent } from '../shared/page-help';
import {
  FieldErrorComponent, FieldErrors, between, maxLength, required, summarise, validate,
} from '../shared/validation';

interface Draft extends SaveTableDto { isNew?: boolean; }

/**
 * The floor plan editor.
 *
 * Direct manipulation: drag a table where it goes, because a form with X and Y coordinates is a
 * terrible way to describe a room. Movement snaps to a 10px grid so a hand-arranged floor still
 * lines up, and the canvas is the same one the live floor renders — what you draw is exactly
 * what the host sees.
 *
 * The whole layout saves in one call. Saving each object as it moves would leave a half-applied
 * floor if the connection dropped mid-drag, and a half-applied floor is worse than none.
 */
@Component({
  standalone: true,
  selector: 'lib-restaurant-layout-designer',
  imports: [CommonModule, FormsModule, OutletPickerComponent, PageHelpComponent, FieldErrorComponent],
  templateUrl: './layout-designer.html',
  styleUrls: ['../restaurant-shared.css', './layout-designer.css'],
})
export class LayoutDesignerComponent {
  private floors = inject(FloorService);
  private cdr = inject(ChangeDetectorRef);

  @ViewChild('canvas') canvasRef?: ElementRef<HTMLElement>;

  outletId: string | null = null;
  floorList: FloorDto[] = [];
  sections: SectionDto[] = [];
  activeFloorId: string | null = null;

  tables: Draft[] = [];
  fixtures: FixtureDto[] = [];
  liveStates = new Map<string, TableState>();

  deletedTableIds: string[] = [];
  deletedFixtureIds: string[] = [];

  selectedId: string | null = null;
  selectedIsFixture = false;

  canvasWidth = 1200;
  canvasHeight = 800;

  loading = true;
  busy = false;
  dirty = false;
  error = '';
  notice = '';

  // Floor / section editors
  floorEditor: { id: string; name: string; width: number; height: number } | null = null;
  sectionEditor: SectionDto | null = null;

  private dragId: string | null = null;
  private dragIsFixture = false;
  private dragOffsetX = 0;
  private dragOffsetY = 0;

  /** Snap step. Small enough to feel free, large enough that a hand-placed room lines up. */
  private static readonly GRID = 10;

  readonly shapeOptions = enumOptions(TABLE_SHAPE_LABELS);
  readonly fixtureOptions = enumOptions(FIXTURE_LABELS);
  readonly shapeLabels = TABLE_SHAPE_LABELS;
  readonly fixtureLabels = FIXTURE_LABELS;
  readonly TableState = TableState;

  async onOutlet(id: string | null): Promise<void> {
    this.outletId = id;
    await this.load();
  }

  async load(): Promise<void> {
    if (!this.outletId) { this.loading = false; return; }
    this.loading = true;

    const [plan, sections] = await Promise.all([
      firstValueFrom(this.floors.getPlan(this.outletId)).catch(() => null),
      firstValueFrom(this.floors.getSections(this.outletId)).catch(() => null),
    ]);

    this.floorList = plan?.data?.floors ?? [];
    this.sections = sections?.data ?? [];

    if (!this.activeFloorId || !this.floorList.some(f => f.id === this.activeFloorId)) {
      this.activeFloorId = this.floorList[0]?.id ?? null;
    }

    this.loadFloor();
    this.loading = false;
    this.cdr.detectChanges();
  }

  private loadFloor(): void {
    const floor = this.floorList.find(f => f.id === this.activeFloorId);
    if (!floor) { this.tables = []; this.fixtures = []; return; }

    this.canvasWidth = floor.canvasWidth;
    this.canvasHeight = floor.canvasHeight;

    this.liveStates = new Map(floor.tables.map(t => [t.id, t.state]));

    this.tables = floor.tables.map(t => ({
      id: t.id,
      outletId: t.outletId,
      floorId: t.floorId,
      sectionId: t.sectionId ?? null,
      tableNumber: t.tableNumber,
      shape: t.shape,
      seats: t.seats,
      minPartySize: t.minPartySize ?? null,
      maxPartySize: t.maxPartySize ?? null,
      positionX: t.positionX,
      positionY: t.positionY,
      width: t.width,
      height: t.height,
      rotation: t.rotation,
      isActive: t.isActive,
      note: t.note ?? null,
    }));

    this.fixtures = floor.fixtures.map(f => ({ ...f }));
    this.deletedTableIds = [];
    this.deletedFixtureIds = [];
    this.dirty = false;
    this.selectedId = null;
  }

  async switchFloor(id: string): Promise<void> {
    if (this.dirty && !confirm('You have unsaved changes. Discard them?')) return;
    this.activeFloorId = id;
    this.loadFloor();
    this.cdr.detectChanges();
  }

  // ── Selection ──────────────────────────────────────────────────────

  get selectedTable(): Draft | undefined {
    return this.selectedIsFixture ? undefined : this.tables.find(t => t.id === this.selectedId);
  }

  get selectedFixture(): FixtureDto | undefined {
    return this.selectedIsFixture ? this.fixtures.find(f => f.id === this.selectedId) : undefined;
  }

  select(id: string, isFixture: boolean): void {
    this.selectedId = id;
    this.selectedIsFixture = isFixture;
  }

  sectionColour(id?: string | null): string | null {
    if (!id) return null;
    return this.sections.find(s => s.id === id)?.colorHex ?? null;
  }

  /** A table currently holding a party cannot be deleted — the live plan would go out of step. */
  isInService(id: string): boolean {
    const state = this.liveStates.get(id);
    return state != null && state !== TableState.Free && state !== TableState.Blocked;
  }

  // ── Drag ───────────────────────────────────────────────────────────

  startDrag(event: PointerEvent, id: string, isFixture: boolean): void {
    this.fieldErrors = {};
    event.preventDefault();
    this.select(id, isFixture);

    const target = isFixture
      ? this.fixtures.find(f => f.id === id)
      : this.tables.find(t => t.id === id);

    if (!target) return;

    const rect = this.canvasRef?.nativeElement.getBoundingClientRect();
    if (!rect) return;

    this.dragId = id;
    this.dragIsFixture = isFixture;
    this.dragOffsetX = event.clientX - rect.left - target.positionX;
    this.dragOffsetY = event.clientY - rect.top - target.positionY;

    (event.target as HTMLElement).setPointerCapture?.(event.pointerId);
  }

  onDrag(event: PointerEvent): void {
    if (!this.dragId) return;

    const rect = this.canvasRef?.nativeElement.getBoundingClientRect();
    if (!rect) return;

    const target = this.dragIsFixture
      ? this.fixtures.find(f => f.id === this.dragId)
      : this.tables.find(t => t.id === this.dragId);

    if (!target) return;

    const grid = LayoutDesignerComponent.GRID;
    const x = Math.round((event.clientX - rect.left - this.dragOffsetX) / grid) * grid;
    const y = Math.round((event.clientY - rect.top - this.dragOffsetY) / grid) * grid;

    // Keep everything inside the room — an object dragged off the canvas is unreachable.
    target.positionX = Math.max(0, Math.min(this.canvasWidth - target.width, x));
    target.positionY = Math.max(0, Math.min(this.canvasHeight - target.height, y));

    this.dirty = true;
  }

  endDrag(): void {
    this.dragId = null;
  }

  // ── Add & remove ───────────────────────────────────────────────────

  addTable(): void {
    this.fieldErrors = {};
    if (!this.outletId || !this.activeFloorId) {
      this.error = 'Create a floor first — tables live on one.';
      return;
    }

    const id = crypto.randomUUID();
    const next = this.tables.length + 1;

    this.tables = [...this.tables, {
      id,
      outletId: this.outletId,
      floorId: this.activeFloorId,
      sectionId: this.sections[0]?.id ?? null,
      tableNumber: String(next),
      shape: TableShape.Square,
      seats: 4,
      minPartySize: null,
      maxPartySize: null,
      // Placed in a loose grid so ten new tables do not land on top of each other.
      positionX: 40 + ((next - 1) % 8) * 110,
      positionY: 40 + Math.floor((next - 1) / 8) * 110,
      width: 80,
      height: 80,
      rotation: 0,
      isActive: true,
      note: null,
      isNew: true,
    }];

    this.select(id, false);
    this.dirty = true;
  }

  addFixture(kind: FloorFixtureKind): void {
    this.fieldErrors = {};
    if (!this.activeFloorId) return;

    const id = crypto.randomUUID();
    this.fixtures = [...this.fixtures, {
      id,
      floorId: this.activeFloorId,
      kind,
      label: this.fixtureLabels[kind],
      positionX: 40,
      positionY: 40,
      width: kind === FloorFixtureKind.Wall ? 200 : 90,
      height: kind === FloorFixtureKind.Wall ? 12 : 50,
      rotation: 0,
      colorHex: null,
    }];

    this.select(id, true);
    this.dirty = true;
  }

  removeSelected(): void {
    if (!this.selectedId) return;

    if (this.selectedIsFixture) {
      this.deletedFixtureIds = [...this.deletedFixtureIds, this.selectedId];
      this.fixtures = this.fixtures.filter(f => f.id !== this.selectedId);
    } else {
      const table = this.tables.find(t => t.id === this.selectedId);
      if (table && this.isInService(table.id)) {
        this.error = `Table ${table.tableNumber} is in service. Clear it before removing it.`;
        return;
      }
      if (!table?.isNew) this.deletedTableIds = [...this.deletedTableIds, this.selectedId];
      this.tables = this.tables.filter(t => t.id !== this.selectedId);
    }

    this.selectedId = null;
    this.dirty = true;
    this.error = '';
  }

  duplicateSelected(): void {
    const table = this.selectedTable;
    if (!table) return;

    const id = crypto.randomUUID();
    const numeric = Number(table.tableNumber);

    this.tables = [...this.tables, {
      ...table,
      id,
      tableNumber: Number.isFinite(numeric) ? String(numeric + 1) : table.tableNumber + '-copy',
      positionX: Math.min(this.canvasWidth - table.width, table.positionX + table.width + 20),
      isNew: true,
    }];

    this.select(id, false);
    this.dirty = true;
  }

  rotateSelected(): void {
    const target = this.selectedIsFixture ? this.selectedFixture : this.selectedTable;
    if (!target) return;
    target.rotation = (target.rotation + 15) % 360;
    this.dirty = true;
  }

  // ── Save ───────────────────────────────────────────────────────────

  async save(): Promise<void> {
    if (!this.activeFloorId) return;

    this.busy = true;
    this.error = '';

    const res = await firstValueFrom(this.floors.saveLayout({
      floorId: this.activeFloorId,
      canvasWidth: this.canvasWidth,
      canvasHeight: this.canvasHeight,
      tables: this.tables.map(({ isNew, ...rest }) => rest),
      fixtures: this.fixtures,
      deletedTableIds: this.deletedTableIds,
      deletedFixtureIds: this.deletedFixtureIds,
    })).catch((e: { error?: { message?: string } }) => {
      this.error = e?.error?.message ?? 'Could not save the layout.';
      return null;
    });

    this.busy = false;

    if (res?.data) {
      this.notice = 'Layout saved.';
      this.dirty = false;
      await this.load();
    }

    this.cdr.detectChanges();
  }

  // ── Floors & sections ──────────────────────────────────────────────

  newFloor(): void {
    this.fieldErrors = {};
    this.floorEditor = { id: '', name: '', width: 1200, height: 800 };
    this.error = '';
  }

  editFloor(): void {
    this.fieldErrors = {};
    const f = this.floorList.find(x => x.id === this.activeFloorId);
    if (!f) return;
    this.floorEditor = { id: f.id, name: f.name, width: f.canvasWidth, height: f.canvasHeight };
  }

  /** Per-field messages for whichever dialog is open. Cleared on every fresh attempt. */
  fieldErrors: FieldErrors = {};

  async saveFloor(): Promise<void> {
    const f = this.floorEditor;
    if (!f) return;

    // Never fail silently. A Save button that does nothing is the worst possible feedback, and
    // it is exactly what happens when the app has not been provisioned for this company yet.
    if (!this.outletId) {
      this.error = 'No outlet is set up yet. Reload the page — the app will provision itself — '
                 + 'or create an outlet under Setup → Settings → Outlets.';
      return;
    }

    this.fieldErrors = validate(f as unknown as Record<string, unknown>, {
      name: [required('A floor name'), maxLength(120, 'The floor name')],
      width: [between(400, 6000, 'Canvas width')],
      height: [between(300, 6000, 'Canvas height')],
    });

    if (Object.keys(this.fieldErrors).length) { this.error = summarise(this.fieldErrors); return; }

    this.busy = true;
    const payload = {
      outletId: this.outletId,
      name: f.name,
      displayOrder: this.floorList.length,
      canvasWidth: f.width,
      canvasHeight: f.height,
      isActive: true,
    };

    const call = f.id ? this.floors.updateFloor(f.id, payload) : this.floors.createFloor(payload);
    const res = await firstValueFrom(call).catch((e: { error?: { message?: string } }) => {
      this.error = e?.error?.message ?? 'Could not save the floor.';
      return null;
    });

    this.busy = false;

    if (res?.data) {
      this.notice = 'Floor saved.';
      this.activeFloorId = res.data.id;
      this.floorEditor = null;
      await this.load();
    }

    this.cdr.detectChanges();
  }

  newSection(): void {
    this.fieldErrors = {};
    if (!this.activeFloorId) return;
    this.sectionEditor = {
      id: '',
      floorId: this.activeFloorId,
      name: '',
      displayOrder: this.sections.length,
      colorHex: '#2b7fff',
      isSmoking: false,
      isOutdoor: false,
      isPrivate: false,
      minimumSpend: null,
      isActive: true,
      tableCount: 0,
      seatCount: 0,
    };
    this.error = '';
  }

  async saveSection(): Promise<void> {
    const s = this.sectionEditor;
    if (!s) return;

    this.fieldErrors = validate(s as unknown as Record<string, unknown>, {
      name: [required('A section name'), maxLength(120, 'The section name')],
    });

    if (Object.keys(this.fieldErrors).length) { this.error = summarise(this.fieldErrors); return; }

    this.busy = true;
    const payload = {
      floorId: s.floorId,
      name: s.name,
      displayOrder: s.displayOrder,
      colorHex: s.colorHex,
      isSmoking: s.isSmoking,
      isOutdoor: s.isOutdoor,
      isPrivate: s.isPrivate,
      minimumSpend: s.minimumSpend,
      isActive: s.isActive,
    };

    const call = s.id ? this.floors.updateSection(s.id, payload) : this.floors.createSection(payload);
    const res = await firstValueFrom(call).catch((e: { error?: { message?: string } }) => {
      this.error = e?.error?.message ?? 'Could not save the section.';
      return null;
    });

    this.busy = false;
    if (res?.data) { this.notice = 'Section saved.'; this.sectionEditor = null; await this.load(); }
    this.cdr.detectChanges();
  }

  get totalSeats(): number {
    return this.tables.filter(t => t.isActive).reduce((sum, t) => sum + t.seats, 0);
  }

  trackTable = (_: number, t: Draft) => t.id;
  trackFixture = (_: number, f: FixtureDto) => f.id;
}
