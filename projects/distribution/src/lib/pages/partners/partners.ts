import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { PartnerService } from '../../services/distribution.services';
import {
  PaginationMetadata, PartnerDocumentDto, PartnerDto, PartnerTreeNodeDto, SavePartnerDto,
} from '../../models/distribution.models';
import {
  CreditEnforcement, PARTNER_STATUS_LABELS, PARTNER_STATUS_TONE, PARTNER_TYPE_LABELS,
  PartnerStatus, PartnerType, SERVICING_MODEL_LABELS, SecondaryCaptureMode, ServicingModel,
  CAPTURE_MODE_LABELS, enumOptions,
} from '../../models/distribution.enums';
import { PageHelpComponent } from '../shared/page-help';
import { ScopeBarComponent } from '../shared/scope-bar';
import { EmptyStateComponent, PagerComponent, StatusPillComponent } from '../shared/ui-bits';
import { FieldErrorComponent, FieldErrors, email, notNegative, phone, required, validate } from '../shared/validation';

/** A tree node flattened for rendering, carrying its depth so the hierarchy reads as indentation. */
interface FlatNode { node: PartnerTreeNodeDto; depth: number; hasChildren: boolean; expanded: boolean }

/**
 * Channel partners: the tier structure between you and the shop.
 *
 * The tree is the point. A distributor's own sub-dealers are where secondary sales actually
 * happen, and a flat list hides the two facts that matter — who supplies whom, and how much of
 * your money is sitting one tier down where you cannot see it.
 *
 * The document panel is not administrative trivia: a distributor trading on a lapsed licence is
 * a problem that surfaces during an inspection, not during a review.
 */
@Component({
  standalone: true,
  selector: 'lib-distribution-partners',
  imports: [
    CommonModule, FormsModule, PageHelpComponent, ScopeBarComponent,
    PagerComponent, EmptyStateComponent, StatusPillComponent, FieldErrorComponent,
  ],
  templateUrl: './partners.html',
  styleUrls: ['../distribution-shared.css', './partners.css'],
})
export class PartnersComponent implements OnInit {
  private partners = inject(PartnerService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  view: 'tree' | 'list' = 'tree';

  tree: PartnerTreeNodeDto[] = [];
  flat: FlatNode[] = [];
  collapsed = new Set<string>();

  rows: PartnerDto[] = [];
  meta: PaginationMetadata | null = null;
  expiring: PartnerDocumentDto[] = [];

  loading = true;
  error = '';
  saving = false;

  filters = { search: '', partnerType: '' as '' | number, status: '' as '' | number };
  page = 1;
  pageSize = 25;
  territoryId: string | null = null;

  showEditor = false;
  editing: SavePartnerDto & { id?: string } = this.blank();
  editorErrors: FieldErrors = {};

  statusTarget: PartnerDto | null = null;
  statusChoice: PartnerStatus = PartnerStatus.Active;
  statusReason = '';

  readonly typeOptions = enumOptions(PARTNER_TYPE_LABELS);
  readonly statusOptions = enumOptions(PARTNER_STATUS_LABELS);
  readonly modelOptions = enumOptions(SERVICING_MODEL_LABELS);
  readonly captureOptions = enumOptions(CAPTURE_MODE_LABELS);
  readonly typeLabels = PARTNER_TYPE_LABELS;
  readonly statusLabels = PARTNER_STATUS_LABELS;
  readonly statusTone = PARTNER_STATUS_TONE;
  readonly modelLabels = SERVICING_MODEL_LABELS;
  readonly captureLabels = CAPTURE_MODE_LABELS;

  private searchTimer?: ReturnType<typeof setTimeout>;

  async ngOnInit(): Promise<void> {
    const res = await firstValueFrom(this.partners.expiringDocuments(45)).catch(() => null);
    this.expiring = res?.data ?? [];
    this.cdr.detectChanges();
  }

  async onScope(scope: { territoryId: string | null }): Promise<void> {
    this.territoryId = scope.territoryId;
    this.page = 1;
    await this.load();
  }

  async load(): Promise<void> {
    this.loading = true;
    this.cdr.detectChanges();

    if (this.view === 'tree') {
      const res = await firstValueFrom(this.partners.tree()).catch(() => null);
      this.tree = res?.data ?? [];
      this.rebuildFlat();
      if (!res) this.error = 'Could not load the partner network.';
    } else {
      const res = await firstValueFrom(this.partners.list({
        page: this.page,
        pageSize: this.pageSize,
        search: this.filters.search || undefined,
        partnerType: this.filters.partnerType || undefined,
        status: this.filters.status || undefined,
        territoryId: this.territoryId || undefined,
      })).catch(() => null);

      this.rows = res?.data ?? [];
      this.meta = res?.pagination ?? null;
      if (!res) this.error = 'Could not load the partner list.';
    }

    this.loading = false;
    this.cdr.detectChanges();
  }

  async setView(view: 'tree' | 'list'): Promise<void> {
    this.view = view;
    await this.load();
  }

  onSearch(): void {
    if (this.searchTimer) clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => { this.page = 1; void this.load(); }, 320);
  }

  async changePage(page: number): Promise<void> { this.page = page; await this.load(); }
  async changeSize(size: number): Promise<void> { this.pageSize = size; this.page = 1; await this.load(); }

  // ── Tree ───────────────────────────────────────────────────────────────────

  private rebuildFlat(): void {
    const out: FlatNode[] = [];

    const walk = (nodes: PartnerTreeNodeDto[], depth: number): void => {
      for (const node of nodes ?? []) {
        const hasChildren = (node.children?.length ?? 0) > 0;
        const expanded = !this.collapsed.has(node.id);
        out.push({ node, depth, hasChildren, expanded });
        if (hasChildren && expanded) walk(node.children, depth + 1);
      }
    };

    walk(this.tree, 0);
    this.flat = out;
  }

  toggle(id: string): void {
    if (this.collapsed.has(id)) this.collapsed.delete(id);
    else this.collapsed.add(id);
    this.rebuildFlat();
    this.cdr.detectChanges();
  }

  open(id: string): void {
    void this.router.navigate(['/distribution/partners', id]);
  }

  // ── Editor ─────────────────────────────────────────────────────────────────

  private blank(): SavePartnerDto {
    return {
      name: '',
      partnerType: PartnerType.Distributor,
      servicingModel: ServicingModel.PreSalesAndDelivery,
      status: PartnerStatus.Lead,
      secondaryCaptureMode: SecondaryCaptureMode.Uploaded,
      creditEnforcement: CreditEnforcement.Warn,
      creditLimit: 0,
      creditDays: 30,
      marginPercent: 0,
      minimumMonthlyOfftake: 0,
      currencyCode: 'USD',
    };
  }

  create(): void {
    this.editing = this.blank();
    this.editorErrors = {};
    this.showEditor = true;
  }

  async edit(row: PartnerDto): Promise<void> {
    const res = await firstValueFrom(this.partners.get(row.id)).catch(() => null);
    const p = res?.data ?? row;
    this.editing = { ...p };
    this.editorErrors = {};
    this.showEditor = true;
    this.cdr.detectChanges();
  }

  async save(): Promise<void> {
    this.editorErrors = validate(this.editing as unknown as Record<string, unknown>, {
      name: [required('A partner name')],
      phone: [phone('The phone number')],
      email: [email('The email address')],
      creditLimit: [notNegative('The credit limit')],
      creditDays: [notNegative('Credit days')],
    });

    if (Object.keys(this.editorErrors).length > 0) { this.cdr.detectChanges(); return; }

    this.saving = true;
    this.cdr.detectChanges();

    const id = this.editing.id;
    const res = await firstValueFrom(
      id ? this.partners.update(id, this.editing) : this.partners.create(this.editing),
    ).catch(() => null);

    if (res?.data) {
      this.showEditor = false;
      await this.load();
    } else {
      this.error = 'The partner could not be saved.';
    }

    this.saving = false;
    this.cdr.detectChanges();
  }

  // ── Status ─────────────────────────────────────────────────────────────────

  startStatus(row: PartnerDto): void {
    this.statusTarget = row;
    this.statusChoice = row.status;
    this.statusReason = '';
  }

  get statusNeedsReason(): boolean {
    return this.statusChoice === PartnerStatus.Suspended || this.statusChoice === PartnerStatus.Terminated;
  }

  async applyStatus(): Promise<void> {
    if (!this.statusTarget) return;
    if (this.statusNeedsReason && !this.statusReason.trim()) return;

    const res = await firstValueFrom(this.partners.changeStatus(this.statusTarget.id, {
      status: this.statusChoice,
      reason: this.statusReason || undefined,
    })).catch(() => null);

    if (res?.data) {
      this.statusTarget = null;
      await this.load();
    } else {
      this.error = 'The status change did not go through.';
    }

    this.cdr.detectChanges();
  }

  trackFlat = (_: number, n: FlatNode) => n.node.id;
  trackRow = (_: number, row: PartnerDto) => row.id;
  trackDoc = (_: number, d: PartnerDocumentDto) => d.id;
}
