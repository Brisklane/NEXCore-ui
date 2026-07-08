import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { LeadService } from '../../../services/lead.service';
import { ActivityService } from '../../../services/activity.service';
import { LeadDto } from '../../../models/lead.model';
import { ActivityDto } from '../../../models/activity.model';
import { LeadConvertModalComponent } from '../lead-convert-modal/lead-convert-modal';
import { EmployeeService } from '@nexcore/hr';

// Unqualified comes 4th; Qualified is displayed as "Converted" (last)
const LEAD_STAGES = [
  { value: 'New',         label: 'New' },
  { value: 'Contacted',   label: 'Contacted' },
  { value: 'Nurturing',   label: 'Nurturing' },
  { value: 'Unqualified', label: 'Unqualified' },
  { value: 'Qualified',   label: 'Converted' },
];

@Component({
  selector: 'lib-lead-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, LeadConvertModalComponent],
  templateUrl: './lead-detail.html',
  styleUrl: './lead-detail.css',
})
export class LeadDetailComponent implements OnInit {
  lead: LeadDto | null = null;
  activities: ActivityDto[] = [];
  loading = true;
  error = '';
  savingStage = false;

  stages = LEAD_STAGES;

  // Stage that the user has clicked but NOT yet saved via the confirm button
  pendingStatus: string | null = null;

  // Convert lead modal
  showConvertModal = false;

  employeeOptions: Array<{ label: string; value: string }> = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private leadService: LeadService,
    private activityService: ActivityService,
    private employeeService: EmployeeService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) { this.location.back(); return; }
    this.loadLead(id);
    this.loadActivities(id);
    this.loadEmployees();
  }

  // ── Data loading ─────────────────────────────────────────────────

  private loadLead(id: string): void {
    this.leadService.getById(id).subscribe({
      next: (res) => {
        this.lead = res.data ?? null;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'Failed to load lead.';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  private loadActivities(leadId: string): void {
    this.activityService.getAll({ pageSize: 1000 }).subscribe({
      next: (res) => {
        const all: ActivityDto[] = res.data ?? [];
        this.activities = all
          .filter(a =>
            (a.nameId === leadId && (a.nameType ?? '').toLowerCase() === 'lead') ||
            (a.relatedToId === leadId && (a.relatedToType ?? '').toLowerCase() === 'lead')
          )
          .sort((a, b) =>
            new Date(b.dueDate ?? b.startDateTime ?? b.createdAt).getTime() -
            new Date(a.dueDate ?? a.startDateTime ?? a.createdAt).getTime()
          );
        this.cdr.detectChanges();
      },
      error: () => { this.cdr.detectChanges(); },
    });
  }

  // ── Stage selection (preview only — does NOT call API) ───────────

  selectStage(value: string): void {
    if (!this.lead || this.savingStage) return;
    const confirmed = this.lead.status ?? '';

    if (value === confirmed || value === this.pendingStatus) {
      // Clicking confirmed stage or clicking pending again → cancel preview
      this.pendingStatus = null;
    } else {
      this.pendingStatus = value;
    }
    this.cdr.detectChanges();
  }

  // ── Confirm button → actually saves the pending (or current) stage ─

  confirmStage(): void {
    if (!this.lead || this.savingStage) return;
    const target = this.pendingStatus ?? this.lead.status ?? '';
    if (!target) return;

    // Qualified (Converted) triggers the convert modal instead of a direct save
    if (target === 'Qualified' && !this.lead.isConverted) {
      this.showConvertModal = true;
      return;
    }

    this.savingStage = true;
    this.cdr.detectChanges();

    const l = this.lead;
    this.leadService.update(l.id, {
      salutation:        l.salutation,
      firstName:         l.firstName,
      lastName:          l.lastName,
      company:           l.company,
      title:             l.title,
      website:           l.website,
      phone:             l.phone,
      email:             l.email,
      street:            l.street,
      city:              l.city,
      state:             l.state,
      postalCode:        l.postalCode,
      country:           l.country,
      numberOfEmployees: l.numberOfEmployees,
      annualRevenue:     l.annualRevenue,
      leadSource:        l.leadSource,
      industry:          l.industry,
      status:            target,
      description:       l.description,
      emailOptOut:       l.emailOptOut,
    }).subscribe({
      next: () => {
        this.lead!.status = target;
        this.pendingStatus = null;
        this.savingStage = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.pendingStatus = null;
        this.savingStage = false;
        this.cdr.detectChanges();
      },
    });
  }

  // ── Stage index helpers ───────────────────────────────────────────

  get confirmedIndex(): number {
    return this.stages.findIndex(s => s.value === (this.lead?.status ?? ''));
  }

  get pendingIndex(): number {
    return this.pendingStatus
      ? this.stages.findIndex(s => s.value === this.pendingStatus)
      : -1;
  }

  /**
   * Returns a CSS class for each chip based on confirmed + pending state:
   *  s-past      → green ✓  (before the earlier of confirmed/pending)
   *  s-current   → dark navy (confirmed, no pending change)
   *  s-confirmed → outlined  (confirmed stage while a different pending exists)
   *  s-pending   → dark navy (pending selection not yet saved)
   *  s-future    → grey      (after active stage, or between confirmed and pending)
   */
  getChipClass(idx: number): string {
    const cIdx = this.confirmedIndex;
    const pIdx = this.pendingIndex;

    if (pIdx === -1) {
      // No pending change — simple linear view
      if (idx < cIdx)  return 's-past';
      if (idx === cIdx) return 's-current';
      return 's-future';
    }

    // Pending differs from confirmed
    const minIdx = Math.min(cIdx, pIdx);
    if (idx < minIdx)   return 's-past';
    if (idx === pIdx)   return 's-pending';
    if (idx === cIdx)   return 's-confirmed';
    return 's-future';
  }

  // ── Button helpers ────────────────────────────────────────────────

  // The "effective" stage driving the button label
  private get activeStageLabel(): string {
    const value = this.pendingStatus ?? this.lead?.status ?? '';
    return this.stages.find(s => s.value === value)?.label ?? '';
  }

  get buttonLabel(): string {
    return this.activeStageLabel === 'Converted'
      ? 'Select Converted Status'
      : '✓ Mark Status as Complete';
  }

  get isConvertedActive(): boolean {
    return this.activeStageLabel === 'Converted';
  }

  get hasPendingChange(): boolean {
    return this.pendingStatus !== null && this.pendingStatus !== this.lead?.status;
  }

  // ── Other helpers ─────────────────────────────────────────────────

  private loadEmployees(): void {
    this.employeeService.getAll().subscribe({
      next: (res) => {
        const list = Array.isArray(res) ? res : (res?.data ?? []);
        this.employeeOptions = list
          .filter((e: any) => e.isActive)
          .map((e: any) => ({
            value: e.id,
            label: [e.firstName, e.lastName].filter(Boolean).join(' ') || e.employeeCode || e.id,
          }));
        this.cdr.detectChanges();
      },
      error: () => {},
    });
  }

  getEmployeeName(id: string | null): string {
    if (!id) return '—';
    return this.employeeOptions.find(e => e.value === id)?.label ?? '—';
  }

  goBack(): void { this.location.back(); }

  onLeadConverted(): void {
    this.showConvertModal = false;
    this.pendingStatus    = null;
    // Navigate back to the leads list after successful conversion
    this.router.navigate(['..'], { relativeTo: this.route });
  }

  onConvertCancelled(): void {
    this.showConvertModal = false;
    this.pendingStatus    = null;   // discard the pending Qualified selection
    this.cdr.detectChanges();
  }

  getLeadName(): string {
    if (!this.lead) return '';
    return [this.lead.salutation, this.lead.firstName, this.lead.lastName]
      .filter(Boolean).join(' ') || '—';
  }

  getActivityIcon(type: string | null): string {
    switch ((type ?? '').toLowerCase()) {
      case 'call':    return '📞';
      case 'meeting': return '📅';
      case 'task':    return '✅';
      default:        return '📋';
    }
  }

  getActivityDate(a: ActivityDto): string {
    return a.startDateTime ?? a.dueDate ?? a.createdAt;
  }

  getActivityTypeClass(type: string | null): string {
    switch ((type ?? '').toLowerCase()) {
      case 'call':    return 'type-call';
      case 'meeting': return 'type-meeting';
      case 'task':    return 'type-task';
      default:        return 'type-other';
    }
  }

  getLeadStatusClass(status: string | null): string {
    return `status-${(status ?? 'new').toLowerCase().replace(/\s+/g, '-')}`;
  }

  getActivityStatusClass(status: string | null): string {
    return `astatus-${(status ?? '').toLowerCase().replace(/[\s/]+/g, '-')}`;
  }

  formatCurrency(value: number | null): string {
    if (value === null || value === undefined) return '—';
    return '$' + value.toLocaleString();
  }
}
