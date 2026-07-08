import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivityService } from '../../services/activity.service';
import { LeadService } from '../../services/lead.service';
import { ContactService } from '../../services/contact.service';
import { AccountService } from '../../services/account.service';
import { CaseService } from '../../services/case.service';
import { CampaignService } from '../../services/campaign.service';
import { ActivityDto, CreateActivityDto, UpdateActivityDto } from '../../models/activity.model';
import { LookupDropdownComponent } from '../../components/lookup-dropdown/lookup-dropdown';

interface LookupOption { id: string; label: string; }

@Component({
  selector: 'lib-calls',
  standalone: true,
  imports: [CommonModule, FormsModule, LookupDropdownComponent],
  templateUrl: './calls.html',
  styleUrl: './calls.css',
})
export class CallsComponent implements OnInit {
  calls: ActivityDto[] = [];
  loading = false;
  error = '';
  showForm = false;
  editingCall: ActivityDto | null = null;

  formSubject = '';
  formComments = '';
  formCallMode: 'log' | 'schedule' = 'log';
  formCallType = '';
  formCallPurpose = '';
  formCallResult = '';
  formDurationMinutes: number | null = null;
  formPriority = 'Normal';
  formDueDate = '';
  formDueTime = '';

  formNameType = 'Lead';
  formNameId = '';

  formRelatedToType = 'Account';
  formRelatedToId = '';

  leads: LookupOption[] = [];
  contacts: LookupOption[] = [];
  accounts: LookupOption[] = [];
  cases: LookupOption[] = [];
  campaigns: LookupOption[] = [];

  get nameOptions() {
    const src = this.formNameType === 'Lead' ? this.leads : this.contacts;
    return src.map(o => ({ value: o.id, label: o.label }));
  }

  get relatedToOptions() {
    const src = this.formRelatedToType === 'Case' ? this.cases
              : this.formRelatedToType === 'Campaign' ? this.campaigns
              : this.accounts;
    return src.map(o => ({ value: o.id, label: o.label }));
  }

  readonly priorityOptions = ['Low', 'Normal', 'High'];
  readonly callTypeOptions = ['Inbound', 'Outbound'];
  readonly callPurposeOptions = ['Prospecting', 'Follow-up', 'Demo', 'Support', 'Other'];
  readonly callResultOptions = ['Connected', 'Left Voicemail', 'No Answer', 'Wrong Number', 'Other'];
  readonly nameTypeOptions = ['Lead', 'Contact'];
  readonly relatedToTypeOptions = ['Account', 'Case', 'Campaign'];
  readonly pageSizeOptions = [5, 10, 25, 50];

  openCallsSearch = '';   openCallsPage = 1;   openCallsPageSize = 5;
  closedCallsSearch = ''; closedCallsPage = 1; closedCallsPageSize = 5;

  constructor(
    private activityService: ActivityService,
    private leadService: LeadService,
    private contactService: ContactService,
    private accountService: AccountService,
    private caseService: CaseService,
    private campaignService: CampaignService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.loadCalls();
    this.loadLookups();
  }

  loadCalls() {
    this.loading = true;
    this.error = '';
    this.activityService.getAll().subscribe({
      next: (res) => {
        this.calls = (res.data ?? []).filter(a => a.type === 'Call');
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => { this.error = 'Failed to load calls'; this.loading = false; this.cdr.detectChanges(); },
    });
  }

  loadLookups() {
    this.leadService.getAll({ pageSize: 500 }).subscribe(r => {
      this.leads = (r.data ?? []).map(l => ({ id: l.id, label: [l.firstName, l.lastName].filter(Boolean).join(' ') || 'Unnamed' }));
    });
    this.contactService.getAll({ pageSize: 500 }).subscribe(r => {
      this.contacts = (r.data ?? []).map(c => ({ id: c.id, label: [c.firstName, c.lastName].filter(Boolean).join(' ') || 'Unnamed' }));
    });
    this.accountService.getAll({ pageSize: 500 }).subscribe(r => {
      this.accounts = (r.data ?? []).map(a => ({ id: a.id, label: a.accountName || 'Unnamed' }));
    });
    this.caseService.getAll({ pageSize: 500 }).subscribe(r => {
      this.cases = (r.data ?? []).map(c => ({ id: c.id, label: c.subject || c.caseNumber || 'Unnamed' }));
    });
    this.campaignService.getAll({ pageSize: 500 }).subscribe(r => {
      this.campaigns = (r.data ?? []).map(c => ({ id: c.id, label: c.campaignName || 'Unnamed' }));
    });
  }

  // ── Cards ─────────────────────────────────────────────────────────
  get total()     { return this.calls.length; }
  get outbound()  { return this.calls.filter(c => c.callType === 'Outbound').length; }
  get inbound()   { return this.calls.filter(c => c.callType === 'Inbound').length; }
  get completed() { return this.calls.filter(c => c.status === 'Completed').length; }
  get scheduled() { return this.calls.filter(c => c.dueDate && c.status !== 'Completed').length; }
  get overdue()   { return this.calls.filter(c => this.isOverdue(c)).length; }

  // ── Pagination ─────────────────────────────────────────────────────
  private get openCallsList()   { return this.calls.filter(c => c.status !== 'Completed'); }
  private get closedCallsList() { return this.calls.filter(c => c.status === 'Completed'); }

  get openCallsCount()   { return this.openCallsList.length; }
  get closedCallsCount() { return this.closedCallsList.length; }

  private get searchedOpenCalls() {
    const q = this.openCallsSearch.toLowerCase().trim();
    return q ? this.openCallsList.filter(c => (c.subject ?? '').toLowerCase().includes(q)) : this.openCallsList;
  }
  private get searchedClosedCalls() {
    const q = this.closedCallsSearch.toLowerCase().trim();
    return q ? this.closedCallsList.filter(c => (c.subject ?? '').toLowerCase().includes(q)) : this.closedCallsList;
  }

  get pagedOpenCalls()        { const s = (this.openCallsPage - 1) * this.openCallsPageSize; return this.searchedOpenCalls.slice(s, s + this.openCallsPageSize); }
  get openCallsTotalPages()   { return Math.max(1, Math.ceil(this.searchedOpenCalls.length / this.openCallsPageSize)); }
  get openCallsFirstEntry()   { return this.searchedOpenCalls.length === 0 ? 0 : (this.openCallsPage - 1) * this.openCallsPageSize + 1; }
  get openCallsLastEntry()    { return Math.min(this.openCallsPage * this.openCallsPageSize, this.searchedOpenCalls.length); }
  get openCallsTotal()        { return this.searchedOpenCalls.length; }

  get pagedClosedCalls()      { const s = (this.closedCallsPage - 1) * this.closedCallsPageSize; return this.searchedClosedCalls.slice(s, s + this.closedCallsPageSize); }
  get closedCallsTotalPages() { return Math.max(1, Math.ceil(this.searchedClosedCalls.length / this.closedCallsPageSize)); }
  get closedCallsFirstEntry() { return this.searchedClosedCalls.length === 0 ? 0 : (this.closedCallsPage - 1) * this.closedCallsPageSize + 1; }
  get closedCallsLastEntry()  { return Math.min(this.closedCallsPage * this.closedCallsPageSize, this.searchedClosedCalls.length); }
  get closedCallsTotal()      { return this.searchedClosedCalls.length; }

  goToOpenCallsPage(p: number)      { if (p >= 1 && p <= this.openCallsTotalPages)   this.openCallsPage   = p; }
  goToClosedCallsPage(p: number)    { if (p >= 1 && p <= this.closedCallsTotalPages) this.closedCallsPage = p; }
  onOpenCallsSearch()               { this.openCallsPage   = 1; }
  onClosedCallsSearch()             { this.closedCallsPage = 1; }
  onOpenCallsPageSizeChange()       { this.openCallsPage   = 1; }
  onClosedCallsPageSizeChange()     { this.closedCallsPage = 1; }

  // ── Form ──────────────────────────────────────────────────────────
  openCreateForm() { this.editingCall = null; this.resetForm(); this.showForm = true; }

  openEditForm(call: ActivityDto) {
    this.editingCall = call;
    this.formSubject       = call.subject ?? '';
    this.formComments      = call.comments ?? '';
    this.formCallType      = call.callType ?? '';
    this.formCallPurpose   = call.callPurpose ?? '';
    this.formCallResult    = call.callResult ?? '';
    this.formDurationMinutes = call.durationMinutes ?? null;
    this.formPriority      = call.priority ?? 'Normal';
    this.formNameType      = call.nameType ?? 'Lead';
    this.formNameId        = call.nameId ?? '';
    this.formRelatedToType = call.relatedToType ?? 'Account';
    this.formRelatedToId   = call.relatedToId ?? '';
    if (call.dueDate) {
      const d = new Date(call.dueDate);
      this.formDueDate = d.toISOString().slice(0, 10);
      this.formDueTime = d.toTimeString().slice(0, 5);
      this.formCallMode = 'schedule';
    }
    this.showForm = true;
  }

  resetForm() {
    this.formSubject = ''; this.formComments = ''; this.formCallMode = 'log';
    this.formCallType = ''; this.formCallPurpose = ''; this.formCallResult = '';
    this.formDurationMinutes = null; this.formPriority = 'Normal';
    this.formDueDate = ''; this.formDueTime = '';
    this.formNameType = 'Lead'; this.formNameId = '';
    this.formRelatedToType = 'Account'; this.formRelatedToId = '';
  }

  cancelForm() { this.showForm = false; this.editingCall = null; this.resetForm(); }

  saveCall() {
    const dto: CreateActivityDto = {
      type: 'Call',
      subject:         this.formSubject || null,
      comments:        this.formComments || null,
      callType:        this.formCallType || null,
      callPurpose:     this.formCallPurpose || null,
      callResult:      this.formCallResult || null,
      durationMinutes: this.formDurationMinutes || null,
      priority:        this.formPriority || null,
      status:          this.formCallMode === 'log' ? 'Completed' : 'Not Started',
      nameId:          this.formNameId || null,
      nameType:        this.formNameId ? this.formNameType : null,
      relatedToId:     this.formRelatedToId || null,
      relatedToType:   this.formRelatedToId ? this.formRelatedToType : null,
      dueDate:         this.formCallMode === 'schedule' ? this.buildDT(this.formDueDate, this.formDueTime) : null,
    };
    if (this.editingCall) {
      this.activityService.update(this.editingCall.id, dto as UpdateActivityDto).subscribe({
        next: () => { this.showForm = false; this.loadCalls(); },
        error: () => { this.error = 'Failed to update'; this.cdr.detectChanges(); },
      });
    } else {
      this.activityService.create(dto).subscribe({
        next: () => { this.showForm = false; this.loadCalls(); },
        error: () => { this.error = 'Failed to create'; this.cdr.detectChanges(); },
      });
    }
  }

  markDone(call: ActivityDto) {
    const { id, createdAt, ...rest } = call;
    this.activityService.update(id, { ...rest, status: 'Completed' }).subscribe({
      next: () => this.loadCalls(),
      error: () => { this.error = 'Failed to update'; this.cdr.detectChanges(); },
    });
  }

  deleteCall(id: string) {
    if (!confirm('Delete this call?')) return;
    this.activityService.delete(id).subscribe({ next: () => this.loadCalls() });
  }

  // ── Lookups ───────────────────────────────────────────────────────
  onNameTypeChange()      { this.formNameId = ''; }
  onRelatedToTypeChange() { this.formRelatedToId = ''; }

  // ── Display helpers ───────────────────────────────────────────────
  isOverdue(c: ActivityDto) { return c.status !== 'Completed' && !!c.dueDate && new Date(c.dueDate) < new Date(); }
  isDone(c: ActivityDto)    { return c.status === 'Completed'; }
  get isSchedule()          { return this.formCallMode === 'schedule'; }

  getNameDisplay(a: ActivityDto) {
    if (!a.nameId) return '—';
    const src = a.nameType === 'Lead' ? this.leads : this.contacts;
    return src.find(o => o.id === a.nameId)?.label ?? `${a.nameType} (…)`;
  }

  getRelatedDisplay(a: ActivityDto) {
    if (!a.relatedToId) return '—';
    const src = a.relatedToType === 'Case' ? this.cases : a.relatedToType === 'Campaign' ? this.campaigns : this.accounts;
    return src.find(o => o.id === a.relatedToId)?.label ?? `${a.relatedToType} (…)`;
  }

  getPriorityClass(p: string | null) {
    if (p === 'High') return 'badge-high'; if (p === 'Low') return 'badge-low'; return 'badge-normal';
  }

  private buildDT(date: string, time: string) { return date ? `${date}T${time || '00:00'}:00` : null; }

  private resolveLabel(id: string | null, type: string | null): string {
    if (!id || !type) return '';
    const map: Record<string, LookupOption[]> = { Lead: this.leads, Contact: this.contacts, Account: this.accounts, Case: this.cases, Campaign: this.campaigns };
    return map[type]?.find(o => o.id === id)?.label ?? '';
  }
}
