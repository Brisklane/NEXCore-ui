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
  selector: 'lib-meetings',
  standalone: true,
  imports: [CommonModule, FormsModule, LookupDropdownComponent],
  templateUrl: './meetings.html',
  styleUrl: './meetings.css',
})
export class MeetingsComponent implements OnInit {
  meetings: ActivityDto[] = [];
  loading = false;
  error = '';
  showForm = false;
  editingMeeting: ActivityDto | null = null;

  formSubject = '';
  formDescription = '';
  formStartDate = '';
  formStartTime = '';
  formEndDate = '';
  formEndTime = '';
  formPriority = 'Normal';
  formStatus = 'Not Started';

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
  readonly statusOptions = ['Not Started', 'In Progress', 'Completed', 'Waiting', 'Deferred'];
  readonly nameTypeOptions = ['Lead', 'Contact'];
  readonly relatedToTypeOptions = ['Account', 'Case', 'Campaign'];
  readonly pageSizeOptions = [5, 10, 25, 50];

  openMeetingsSearch = '';   openMeetingsPage = 1;   openMeetingsPageSize = 5;
  closedMeetingsSearch = ''; closedMeetingsPage = 1; closedMeetingsPageSize = 5;

  constructor(
    private activityService: ActivityService,
    private leadService: LeadService,
    private contactService: ContactService,
    private accountService: AccountService,
    private caseService: CaseService,
    private campaignService: CampaignService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() { this.loadMeetings(); this.loadLookups(); }

  loadMeetings() {
    this.loading = true;
    this.error = '';
    this.activityService.getAll().subscribe({
      next: (res) => { this.meetings = (res.data ?? []).filter(a => a.type === 'Event'); this.loading = false; this.cdr.detectChanges(); },
      error: () => { this.error = 'Failed to load meetings'; this.loading = false; this.cdr.detectChanges(); },
    });
  }

  loadLookups() {
    this.leadService.getAll({ pageSize: 500 }).subscribe(r => { this.leads = (r.data ?? []).map(l => ({ id: l.id, label: [l.firstName, l.lastName].filter(Boolean).join(' ') || 'Unnamed' })); });
    this.contactService.getAll({ pageSize: 500 }).subscribe(r => { this.contacts = (r.data ?? []).map(c => ({ id: c.id, label: [c.firstName, c.lastName].filter(Boolean).join(' ') || 'Unnamed' })); });
    this.accountService.getAll({ pageSize: 500 }).subscribe(r => { this.accounts = (r.data ?? []).map(a => ({ id: a.id, label: a.accountName || 'Unnamed' })); });
    this.caseService.getAll({ pageSize: 500 }).subscribe(r => { this.cases = (r.data ?? []).map(c => ({ id: c.id, label: c.subject || c.caseNumber || 'Unnamed' })); });
    this.campaignService.getAll({ pageSize: 500 }).subscribe(r => { this.campaigns = (r.data ?? []).map(c => ({ id: c.id, label: c.campaignName || 'Unnamed' })); });
  }

  // ── Cards ─────────────────────────────────────────────────────────
  get total()     { return this.meetings.length; }
  get upcoming()  { return this.meetings.filter(m => m.startDateTime && new Date(m.startDateTime) > new Date() && m.status !== 'Completed').length; }
  get today()     { const t = new Date().toDateString(); return this.meetings.filter(m => m.startDateTime && new Date(m.startDateTime).toDateString() === t).length; }
  get completed() { return this.meetings.filter(m => m.status === 'Completed').length; }
  get overdue()   { return this.meetings.filter(m => this.isOverdue(m)).length; }
  get thisWeek()  {
    const now = new Date(); const end = new Date(); end.setDate(now.getDate() + 7);
    return this.meetings.filter(m => m.startDateTime && new Date(m.startDateTime) >= now && new Date(m.startDateTime) <= end).length;
  }

  // ── Pagination ─────────────────────────────────────────────────────
  private get openMeetingsList()   { return this.meetings.filter(m => m.status !== 'Completed'); }
  private get closedMeetingsList() { return this.meetings.filter(m => m.status === 'Completed'); }

  get openMeetingsCount()   { return this.openMeetingsList.length; }
  get closedMeetingsCount() { return this.closedMeetingsList.length; }

  private get searchedOpenMeetings() {
    const q = this.openMeetingsSearch.toLowerCase().trim();
    return q ? this.openMeetingsList.filter(m => (m.subject ?? '').toLowerCase().includes(q)) : this.openMeetingsList;
  }
  private get searchedClosedMeetings() {
    const q = this.closedMeetingsSearch.toLowerCase().trim();
    return q ? this.closedMeetingsList.filter(m => (m.subject ?? '').toLowerCase().includes(q)) : this.closedMeetingsList;
  }

  get pagedOpenMeetings()        { const s = (this.openMeetingsPage - 1) * this.openMeetingsPageSize; return this.searchedOpenMeetings.slice(s, s + this.openMeetingsPageSize); }
  get openMeetingsTotalPages()   { return Math.max(1, Math.ceil(this.searchedOpenMeetings.length / this.openMeetingsPageSize)); }
  get openMeetingsFirstEntry()   { return this.searchedOpenMeetings.length === 0 ? 0 : (this.openMeetingsPage - 1) * this.openMeetingsPageSize + 1; }
  get openMeetingsLastEntry()    { return Math.min(this.openMeetingsPage * this.openMeetingsPageSize, this.searchedOpenMeetings.length); }
  get openMeetingsTotal()        { return this.searchedOpenMeetings.length; }

  get pagedClosedMeetings()      { const s = (this.closedMeetingsPage - 1) * this.closedMeetingsPageSize; return this.searchedClosedMeetings.slice(s, s + this.closedMeetingsPageSize); }
  get closedMeetingsTotalPages() { return Math.max(1, Math.ceil(this.searchedClosedMeetings.length / this.closedMeetingsPageSize)); }
  get closedMeetingsFirstEntry() { return this.searchedClosedMeetings.length === 0 ? 0 : (this.closedMeetingsPage - 1) * this.closedMeetingsPageSize + 1; }
  get closedMeetingsLastEntry()  { return Math.min(this.closedMeetingsPage * this.closedMeetingsPageSize, this.searchedClosedMeetings.length); }
  get closedMeetingsTotal()      { return this.searchedClosedMeetings.length; }

  goToOpenMeetingsPage(p: number)      { if (p >= 1 && p <= this.openMeetingsTotalPages)   this.openMeetingsPage   = p; }
  goToClosedMeetingsPage(p: number)    { if (p >= 1 && p <= this.closedMeetingsTotalPages) this.closedMeetingsPage = p; }
  onOpenMeetingsSearch()               { this.openMeetingsPage   = 1; }
  onClosedMeetingsSearch()             { this.closedMeetingsPage = 1; }
  onOpenMeetingsPageSizeChange()       { this.openMeetingsPage   = 1; }
  onClosedMeetingsPageSizeChange()     { this.closedMeetingsPage = 1; }

  // ── Form ──────────────────────────────────────────────────────────
  openCreateForm() { this.editingMeeting = null; this.resetForm(); this.showForm = true; }

  openEditForm(m: ActivityDto) {
    this.editingMeeting = m;
    this.formSubject     = m.subject ?? '';
    this.formDescription = m.description ?? '';
    this.formPriority    = m.priority ?? 'Normal';
    this.formStatus      = m.status ?? 'Not Started';
    this.formNameType    = m.nameType ?? 'Lead';
    this.formNameId      = m.nameId ?? '';
    this.formRelatedToType = m.relatedToType ?? 'Account';
    this.formRelatedToId   = m.relatedToId ?? '';
    if (m.startDateTime) { const d = new Date(m.startDateTime); this.formStartDate = d.toISOString().slice(0,10); this.formStartTime = d.toTimeString().slice(0,5); }
    if (m.endDateTime)   { const d = new Date(m.endDateTime);   this.formEndDate   = d.toISOString().slice(0,10); this.formEndTime   = d.toTimeString().slice(0,5); }
    this.showForm = true;
  }

  resetForm() {
    this.formSubject = ''; this.formDescription = '';
    this.formStartDate = ''; this.formStartTime = ''; this.formEndDate = ''; this.formEndTime = '';
    this.formPriority = 'Normal'; this.formStatus = 'Not Started';
    this.formNameType = 'Lead'; this.formNameId = '';
    this.formRelatedToType = 'Account'; this.formRelatedToId = '';
  }

  cancelForm() { this.showForm = false; this.editingMeeting = null; this.resetForm(); }

  saveMeeting() {
    const dto: CreateActivityDto = {
      type: 'Event',
      subject:       this.formSubject || null,
      description:   this.formDescription || null,
      priority:      this.formPriority || null,
      status:        this.formStatus || null,
      nameId:        this.formNameId || null,
      nameType:      this.formNameId ? this.formNameType : null,
      relatedToId:   this.formRelatedToId || null,
      relatedToType: this.formRelatedToId ? this.formRelatedToType : null,
      startDateTime: this.buildDT(this.formStartDate, this.formStartTime),
      endDateTime:   this.buildDT(this.formEndDate, this.formEndTime),
    };
    if (this.editingMeeting) {
      this.activityService.update(this.editingMeeting.id, dto as UpdateActivityDto).subscribe({
        next: () => { this.showForm = false; this.loadMeetings(); },
        error: () => { this.error = 'Failed to update'; this.cdr.detectChanges(); },
      });
    } else {
      this.activityService.create(dto).subscribe({
        next: () => { this.showForm = false; this.loadMeetings(); },
        error: () => { this.error = 'Failed to create'; this.cdr.detectChanges(); },
      });
    }
  }

  markDone(m: ActivityDto) {
    const { id, createdAt, ...rest } = m;
    this.activityService.update(id, { ...rest, status: 'Completed' }).subscribe({
      next: () => this.loadMeetings(),
      error: () => { this.error = 'Failed to update'; this.cdr.detectChanges(); },
    });
  }

  deleteMeeting(id: string) {
    if (!confirm('Delete this meeting?')) return;
    this.activityService.delete(id).subscribe({ next: () => this.loadMeetings() });
  }

  // ── Lookups ───────────────────────────────────────────────────────
  onNameTypeChange()      { this.formNameId = ''; }
  onRelatedToTypeChange() { this.formRelatedToId = ''; }

  // ── Helpers ───────────────────────────────────────────────────────
  isOverdue(m: ActivityDto) { return m.status !== 'Completed' && !!m.endDateTime && new Date(m.endDateTime) < new Date(); }
  isDone(m: ActivityDto)    { return m.status === 'Completed'; }

  getNameDisplay(a: ActivityDto) { if (!a.nameId) return '—'; const src = a.nameType === 'Lead' ? this.leads : this.contacts; return src.find(o => o.id === a.nameId)?.label ?? `${a.nameType} (…)`; }
  getRelatedDisplay(a: ActivityDto) { if (!a.relatedToId) return '—'; const src = a.relatedToType === 'Case' ? this.cases : a.relatedToType === 'Campaign' ? this.campaigns : this.accounts; return src.find(o => o.id === a.relatedToId)?.label ?? `${a.relatedToType} (…)`; }
  getPriorityClass(p: string | null) { if (p === 'High') return 'badge-high'; if (p === 'Low') return 'badge-low'; return 'badge-normal'; }
  getStatusClass(s: string | null) { if (s === 'Completed') return 'badge-completed'; if (s === 'In Progress') return 'badge-in-progress'; return 'badge-pending'; }

  private buildDT(date: string, time: string) { return date ? `${date}T${time || '00:00'}:00` : null; }
  private resolveLabel(id: string | null, type: string | null): string {
    if (!id || !type) return '';
    const map: Record<string, LookupOption[]> = { Lead: this.leads, Contact: this.contacts, Account: this.accounts, Case: this.cases, Campaign: this.campaigns };
    return map[type]?.find(o => o.id === id)?.label ?? '';
  }
}
