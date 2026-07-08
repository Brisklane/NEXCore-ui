import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { forkJoin } from 'rxjs';
import { CampaignService } from '../../services/campaign.service';
import { CampaignDto } from '../../models/campaign.model';

interface CampaignStat {
  campaign: CampaignDto;
  leadCount: number;
  budgetUsedPct: number;
}

@Component({
  selector: 'lib-campaign-performance',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './campaign-performance.html',
  styleUrl: './campaign-performance.css',
})
export class CampaignPerformanceComponent implements OnInit {
  loading = false;
  error = '';
  stats: CampaignStat[] = [];

  totalCampaigns = 0;
  activeCampaigns = 0;
  totalLeads = 0;
  topCampaign: CampaignStat | null = null;

  constructor(
    private campaignService: CampaignService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.error = '';
    this.campaignService.getAll().subscribe({
      next: (res) => {
        const campaigns = res.data ?? [];
        if (campaigns.length === 0) {
          this.stats = [];
          this.computeSummary();
          this.loading = false;
          this.cdr.detectChanges();
          return;
        }
        forkJoin(campaigns.map(c => this.campaignService.getMembers(c.id))).subscribe({
          next: (results) => {
            this.stats = campaigns
              .map((campaign, i) => {
                const leadCount = (results[i].data ?? []).filter(m => m.leadId !== null).length;
                const budgetUsedPct =
                  campaign.budgetedCost && campaign.budgetedCost > 0 && campaign.actualCost != null
                    ? Math.round((campaign.actualCost / campaign.budgetedCost) * 100)
                    : 0;
                return { campaign, leadCount, budgetUsedPct };
              })
              .sort((a, b) => b.leadCount - a.leadCount);
            this.computeSummary();
            this.loading = false;
            this.cdr.detectChanges();
          },
          error: () => {
            this.error = 'Failed to load campaign members. Please try again.';
            this.loading = false;
            this.cdr.detectChanges();
          },
        });
      },
      error: () => {
        this.error = 'Failed to load campaigns. Please try again.';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  private computeSummary(): void {
    this.totalCampaigns = this.stats.length;
    this.activeCampaigns = this.stats.filter(s => s.campaign.active).length;
    this.totalLeads = this.stats.reduce((sum, s) => sum + s.leadCount, 0);
    this.topCampaign = this.stats.find(s => s.leadCount > 0) ?? null;
  }

  getBarWidth(count: number): number {
    const max = Math.max(...this.stats.map(s => s.leadCount), 1);
    return Math.round((count / max) * 100);
  }

  getBudgetBarWidth(pct: number): number {
    return Math.min(pct, 100);
  }

  getBudgetBarClass(pct: number): string {
    if (pct >= 100) return 'budget-bar-over';
    if (pct >= 75) return 'budget-bar-warn';
    return 'budget-bar-ok';
  }

  getCampaignStatusClass(status: string | null): string {
    const map: Record<string, string> = {
      'Planned': 'badge-planned',
      'In Progress': 'badge-in-progress',
      'Completed': 'badge-completed',
      'Aborted': 'badge-aborted',
    };
    return map[status ?? ''] ?? 'badge-planned';
  }

  formatCurrency(value: number | null): string {
    if (value == null) return '—';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value);
  }

  formatDate(date: string | null): string {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }
}
