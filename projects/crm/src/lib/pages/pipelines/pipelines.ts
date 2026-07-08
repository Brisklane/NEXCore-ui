import { Component, OnInit, HostListener, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragDropModule, CdkDragDrop, transferArrayItem } from '@angular/cdk/drag-drop';
import { DealService } from '../../services/deal.service';
import { DealDto } from '../../models/deal.model';

interface Deal {
  id: string;
  name: string;
  accountName: string;
  closeDate: string;
  amount: number;
  /** Full original DTO kept so we can pass required fields on update */
  original: DealDto;
}

interface Stage {
  id: string;
  name: string;
  isWon: boolean;
  deals: Deal[];
}

// Five visible columns — Closed Lost is the hidden header drop zone, not a column
const PIPELINE_STAGES: Omit<Stage, 'deals'>[] = [
  { id: 'qualify',      name: 'Qualify',          isWon: false },
  { id: 'meet-present', name: 'Meet and Present',  isWon: false },
  { id: 'propose',      name: 'Propose',           isWon: false },
  { id: 'negotiate',    name: 'Negotiate',         isWon: false },
  { id: 'closed-won',   name: 'Closed Won',        isWon: true  },
];

@Component({
  selector: 'lib-pipelines',
  standalone: true,
  imports: [CommonModule, DragDropModule],
  templateUrl: './pipelines.html',
  styleUrl: './pipelines.css',
})
export class PipelinesComponent implements OnInit {
  stages: Stage[]  = [];
  isDragging       = false;
  closedLostDeals: Deal[] = []; // receives deals dropped on the header zone

  activeDropdown: { dealId: string; fromStageId: string } | null = null;

  loading = true;
  error   = '';

  constructor(
    private dealService: DealService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadDeals();
  }

  get totalDeals(): number {
    return this.stages.reduce((sum, s) => sum + s.deals.length, 0);
  }

  // ── Data ──────────────────────────────────────────────────────────

  loadDeals(): void {
    this.loading = true;
    this.error   = '';
    this.dealService.getAll().subscribe({
      next: (res: any) => {
        const raw: DealDto[] = Array.isArray(res) ? res : (res?.data ?? res?.items ?? []);
        this.buildBoard(raw);
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error   = 'Failed to load deals.';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  private buildBoard(deals: DealDto[]): void {
    this.stages = PIPELINE_STAGES.map(s => ({ ...s, deals: [] }));

    for (const d of deals) {
      if (!d.stage) continue;
      const stage = this.stages.find(
        s => s.name.toLowerCase() === d.stage!.toLowerCase()
      );
      if (!stage) continue; // Closed Lost and unrecognised stages are not shown
      stage.deals.push({
        id:          d.id,
        name:        d.opportunityName ?? '—',
        accountName: d.accountName     ?? '—',
        closeDate:   d.closeDate,
        amount:      d.amount ?? 0,
        original:    d,
      });
    }
  }

  // ── Stage-select dropdown ─────────────────────────────────────────

  toggleDropdown(deal: Deal, stage: Stage, event: MouseEvent): void {
    event.stopPropagation();
    this.activeDropdown =
      this.activeDropdown?.dealId === deal.id
        ? null
        : { dealId: deal.id, fromStageId: stage.id };
  }

  moveDealToStage(deal: Deal, fromStageId: string, toStageId: string): void {
    this.activeDropdown = null;
    if (fromStageId === toStageId) return;
    const from = this.stages.find(s => s.id === fromStageId);
    const to   = this.stages.find(s => s.id === toStageId);
    if (!from || !to) return;

    const idx = from.deals.indexOf(deal);
    if (idx > -1) { from.deals.splice(idx, 1); to.deals.push(deal); }

    this.persistStage(deal, to.name);
  }

  @HostListener('document:click')
  onDocumentClick(): void { this.activeDropdown = null; }

  // ── Drag & Drop ───────────────────────────────────────────────────

  onDragStarted(): void {
    this.isDragging = true;
    this.activeDropdown = null;
  }

  onDrop(event: CdkDragDrop<Deal[]>): void {
    this.isDragging = false;
    if (event.previousContainer === event.container) return;

    const deal = event.previousContainer.data[event.previousIndex];

    if (event.container.id === 'closed-lost') {
      // Remove from its column and mark as Closed Lost in the API
      event.previousContainer.data.splice(event.previousIndex, 1);
      this.persistStage(deal, 'Closed Lost');
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );
      const toStage = this.stages.find(s => s.id === event.container.id);
      if (toStage) this.persistStage(deal, toStage.name);
    }
  }

  private persistStage(deal: Deal, newStageName: string): void {
    const o = deal.original;
    this.dealService.update(deal.id, {
      accountId:        o.accountId,
      closeDate:        o.closeDate,
      stage:            newStageName,
      opportunityName:  o.opportunityName,
      amount:           o.amount,
      probability:      o.probability,
      nextStep:         o.nextStep,
      description:      o.description,
    }).subscribe({
      // On error reload to restore the true server state
      error: () => this.loadDeals(),
    });
  }

  // ── Helpers ───────────────────────────────────────────────────────

  total(deals: Deal[]): number {
    return deals.reduce((s, d) => s + d.amount, 0);
  }
}
