import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CampaignService } from '../../services/campaign.service';
import { CampaignDto, CreateCampaignDto, UpdateCampaignDto } from '../../models/campaign.model';
import { LookupDropdownComponent } from '../../components/lookup-dropdown/lookup-dropdown';

@Component({
  selector: 'lib-campaigns',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, LookupDropdownComponent],
  templateUrl: './campaigns.html',
  styleUrl: './campaigns.css',
})
export class CampaignsComponent implements OnInit {
  campaigns: CampaignDto[] = [];
  loading = false;
  error = '';
  showForm = false;
  editingCampaign: CampaignDto | null = null;

  page            = 1;
  pageSize        = 10;
  pageSizeOptions = [10, 25, 50, 100];
  searchTerm      = '';

  private get _sortedCampaigns(): CampaignDto[] {
    return [...this.campaigns].sort((a, b) =>
      new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime()
    );
  }

  private get _searchFiltered(): CampaignDto[] {
    const q = this.searchTerm.toLowerCase().trim();
    if (!q) return this._sortedCampaigns;
    return this._sortedCampaigns.filter(c =>
      `${c.campaignName ?? ''} ${c.type ?? ''} ${c.status ?? ''}`.toLowerCase().includes(q)
    );
  }

  get totalCount(): number { return this._searchFiltered.length; }
  get totalPages(): number { return Math.max(1, Math.ceil(this.totalCount / Number(this.pageSize))); }
  get firstEntry(): number { return this.totalCount === 0 ? 0 : (this.page - 1) * Number(this.pageSize) + 1; }
  get lastEntry():  number { return Math.min(this.page * Number(this.pageSize), this.totalCount); }

  get filteredCampaigns(): CampaignDto[] {
    const start = (this.page - 1) * Number(this.pageSize);
    return this._searchFiltered.slice(start, start + Number(this.pageSize));
  }

  // ── Basic Info ────────────────────────────────────────────────────
  formCampaignName = '';
  formActive = true;
  formStatus = 'Planned';
  formType = '';

  // ── Schedule & Hierarchy ──────────────────────────────────────────
  formStartDate = '';
  formEndDate = '';
  formParentCampaignId = '';
  parentCampaignOptions: Array<{ value: string; label: string }> = [];

  // ── Financials & Stats ────────────────────────────────────────────
  formExpectedRevenue: number | null = null;
  formBudgetedCost: number | null = null;
  formActualCost: number | null = null;
  formNumSent: number | null = null;
  formExpectedResponsePercent: number | null = null;

  // ── Additional ────────────────────────────────────────────────────
  formDescription = '';

  readonly statusOptions = ['Planned', 'In Progress', 'Completed', 'Aborted'];
  readonly typeOptions = [
    'Email', 'Social Media', 'Webinar', 'Trade Show',
    'Direct Mail', 'Conference', 'Telemarketing', 'Other',
  ];

  constructor(
    private campaignService: CampaignService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() { this.loadCampaigns(); }

  loadCampaigns() {
    this.loading = true;
    this.error = '';
    this.campaignService.getAll({ pageSize: 10000 }).subscribe({
      next: (res) => {
        this.campaigns = res.data ?? [];
        this.parentCampaignOptions = this.campaigns.map(c => ({
          value: c.id,
          label: c.campaignName || 'Unnamed Campaign',
        }));
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => { this.error = 'Failed to load campaigns'; this.loading = false; this.cdr.detectChanges(); },
    });
  }

  goToPage(p: number): void {
    if (p < 1 || p > this.totalPages) return;
    this.page = p;
    this.cdr.detectChanges();
  }

  onPageSizeChange(): void {
    this.pageSize = Number(this.pageSize);
    this.page = 1;
    this.cdr.detectChanges();
  }

  onSearchChange(): void {
    this.page = 1;
    this.cdr.detectChanges();
  }

  openCreateForm() {
    this.editingCampaign = null;
    this.parentCampaignOptions = this.campaigns.map(c => ({
      value: c.id,
      label: c.campaignName || 'Unnamed Campaign',
    }));
    this.resetForm();
    this.showForm = true;
  }

  openEditForm(campaign: CampaignDto) {
    this.editingCampaign = campaign;
    this.parentCampaignOptions = this.campaigns
      .filter(c => c.id !== campaign.id)
      .map(c => ({ value: c.id, label: c.campaignName || 'Unnamed Campaign' }));
    this.formCampaignName            = campaign.campaignName ?? '';
    this.formActive                  = campaign.active;
    this.formStatus                  = campaign.status ?? 'Planned';
    this.formType                    = campaign.type ?? '';
    this.formStartDate               = campaign.startDate ? campaign.startDate.slice(0, 10) : '';
    this.formEndDate                 = campaign.endDate ? campaign.endDate.slice(0, 10) : '';
    this.formParentCampaignId        = campaign.parentCampaignId ?? '';
    this.formExpectedRevenue         = campaign.expectedRevenue ?? null;
    this.formBudgetedCost            = campaign.budgetedCost ?? null;
    this.formActualCost              = campaign.actualCost ?? null;
    this.formNumSent                 = campaign.numSent ?? null;
    this.formExpectedResponsePercent = campaign.expectedResponsePercent ?? null;
    this.formDescription             = campaign.description ?? '';
    this.showForm = true;
  }

  resetForm() {
    this.formCampaignName = ''; this.formActive = true; this.formStatus = 'Planned'; this.formType = '';
    this.formStartDate = ''; this.formEndDate = '';
    this.formParentCampaignId = '';
    this.formExpectedRevenue = null; this.formBudgetedCost = null; this.formActualCost = null;
    this.formNumSent = null; this.formExpectedResponsePercent = null;
    this.formDescription = '';
  }

  cancelForm() { this.showForm = false; this.editingCampaign = null; this.resetForm(); }

  saveCampaign() {
    const base = {
      campaignName:             this.formCampaignName,
      active:                   this.formActive,
      status:                   this.formStatus || null,
      type:                     this.formType || null,
      startDate:                this.formStartDate || null,
      endDate:                  this.formEndDate || null,
      parentCampaignId:         this.formParentCampaignId || null,
      expectedRevenue:          this.formExpectedRevenue,
      budgetedCost:             this.formBudgetedCost,
      actualCost:               this.formActualCost,
      numSent:                  this.formNumSent,
      expectedResponsePercent:  this.formExpectedResponsePercent,
      description:              this.formDescription || null,
    };

    if (this.editingCampaign) {
      this.campaignService.update(this.editingCampaign.id, base as UpdateCampaignDto).subscribe({
        next: () => { this.showForm = false; this.loadCampaigns(); },
        error: () => { this.error = 'Failed to update campaign'; this.cdr.detectChanges(); },
      });
    } else {
      this.campaignService.create(base as CreateCampaignDto).subscribe({
        next: () => { this.showForm = false; this.loadCampaigns(); },
        error: () => { this.error = 'Failed to create campaign'; this.cdr.detectChanges(); },
      });
    }
  }

  deleteCampaign(id: string) {
    if (!confirm('Delete this campaign?')) return;
    this.campaignService.delete(id).subscribe({
      next: () => this.loadCampaigns(),
      error: () => { this.error = 'Failed to delete campaign'; this.cdr.detectChanges(); },
    });
  }

  // ── Helpers ───────────────────────────────────────────────────────

  getStatusClass(s: string | null) {
    if (s === 'Completed') return 'badge-completed';
    if (s === 'In Progress') return 'badge-in-progress';
    if (s === 'Aborted') return 'badge-aborted';
    return 'badge-planned';
  }

  getParentName(id: string | null) {
    if (!id) return '—';
    return this.campaigns.find(c => c.id === id)?.campaignName || '—';
  }
}
