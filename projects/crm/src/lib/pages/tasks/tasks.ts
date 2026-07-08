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
  selector: 'lib-tasks',
  standalone: true,
  imports: [CommonModule, FormsModule, LookupDropdownComponent],
  templateUrl: './tasks.html',
  styleUrl: './tasks.css',
})
export class TasksComponent implements OnInit {
  tasks: ActivityDto[] = [];
  loading = false;
  error = '';
  showForm = false;
  editingTask: ActivityDto | null = null;

  formSubject = '';
  formDescription = '';
  formDueDate = '';
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

  openTasksSearch = '';   openTasksPage = 1;   openTasksPageSize = 5;
  closedTasksSearch = ''; closedTasksPage = 1; closedTasksPageSize = 5;

  constructor(
    private activityService: ActivityService,
    private leadService: LeadService,
    private contactService: ContactService,
    private accountService: AccountService,
    private caseService: CaseService,
    private campaignService: CampaignService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() { this.loadTasks(); this.loadLookups(); }

  loadTasks() {
    this.loading = true;
    this.error = '';
    this.activityService.getAll().subscribe({
      next: (res) => { this.tasks = (res.data ?? []).filter(a => a.type === 'Task'); this.loading = false; this.cdr.detectChanges(); },
      error: () => { this.error = 'Failed to load tasks'; this.loading = false; this.cdr.detectChanges(); },
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
  get total()       { return this.tasks.length; }
  get highPriority(){ return this.tasks.filter(t => t.priority === 'High').length; }
  get inProgress()  { return this.tasks.filter(t => t.status === 'In Progress').length; }
  get notStarted()  { return this.tasks.filter(t => !t.status || t.status === 'Not Started').length; }
  get completed()   { return this.tasks.filter(t => t.status === 'Completed').length; }
  get overdue()     { return this.tasks.filter(t => this.isOverdue(t)).length; }

  // ── Pagination ─────────────────────────────────────────────────────
  private get openTasksList()   { return this.tasks.filter(t => t.status !== 'Completed'); }
  private get closedTasksList() { return this.tasks.filter(t => t.status === 'Completed'); }

  get openTasksCount()   { return this.openTasksList.length; }
  get closedTasksCount() { return this.closedTasksList.length; }

  private get searchedOpenTasks() {
    const q = this.openTasksSearch.toLowerCase().trim();
    return q ? this.openTasksList.filter(t => (t.subject ?? '').toLowerCase().includes(q)) : this.openTasksList;
  }
  private get searchedClosedTasks() {
    const q = this.closedTasksSearch.toLowerCase().trim();
    return q ? this.closedTasksList.filter(t => (t.subject ?? '').toLowerCase().includes(q)) : this.closedTasksList;
  }

  get pagedOpenTasks()        { const s = (this.openTasksPage - 1) * this.openTasksPageSize; return this.searchedOpenTasks.slice(s, s + this.openTasksPageSize); }
  get openTasksTotalPages()   { return Math.max(1, Math.ceil(this.searchedOpenTasks.length / this.openTasksPageSize)); }
  get openTasksFirstEntry()   { return this.searchedOpenTasks.length === 0 ? 0 : (this.openTasksPage - 1) * this.openTasksPageSize + 1; }
  get openTasksLastEntry()    { return Math.min(this.openTasksPage * this.openTasksPageSize, this.searchedOpenTasks.length); }
  get openTasksTotal()        { return this.searchedOpenTasks.length; }

  get pagedClosedTasks()      { const s = (this.closedTasksPage - 1) * this.closedTasksPageSize; return this.searchedClosedTasks.slice(s, s + this.closedTasksPageSize); }
  get closedTasksTotalPages() { return Math.max(1, Math.ceil(this.searchedClosedTasks.length / this.closedTasksPageSize)); }
  get closedTasksFirstEntry() { return this.searchedClosedTasks.length === 0 ? 0 : (this.closedTasksPage - 1) * this.closedTasksPageSize + 1; }
  get closedTasksLastEntry()  { return Math.min(this.closedTasksPage * this.closedTasksPageSize, this.searchedClosedTasks.length); }
  get closedTasksTotal()      { return this.searchedClosedTasks.length; }

  goToOpenTasksPage(p: number)      { if (p >= 1 && p <= this.openTasksTotalPages)   this.openTasksPage   = p; }
  goToClosedTasksPage(p: number)    { if (p >= 1 && p <= this.closedTasksTotalPages) this.closedTasksPage = p; }
  onOpenTasksSearch()               { this.openTasksPage   = 1; }
  onClosedTasksSearch()             { this.closedTasksPage = 1; }
  onOpenTasksPageSizeChange()       { this.openTasksPage   = 1; }
  onClosedTasksPageSizeChange()     { this.closedTasksPage = 1; }

  // ── Form ──────────────────────────────────────────────────────────
  openCreateForm() { this.editingTask = null; this.resetForm(); this.showForm = true; }

  openEditForm(t: ActivityDto) {
    this.editingTask = t;
    this.formSubject     = t.subject ?? '';
    this.formDescription = t.description ?? '';
    this.formDueDate     = t.dueDate ? new Date(t.dueDate).toISOString().slice(0,10) : '';
    this.formPriority    = t.priority ?? 'Normal';
    this.formStatus      = t.status ?? 'Not Started';
    this.formNameType    = t.nameType ?? 'Lead';
    this.formNameId      = t.nameId ?? '';
    this.formRelatedToType = t.relatedToType ?? 'Account';
    this.formRelatedToId   = t.relatedToId ?? '';
    this.showForm = true;
  }

  resetForm() {
    this.formSubject = ''; this.formDescription = ''; this.formDueDate = '';
    this.formPriority = 'Normal'; this.formStatus = 'Not Started';
    this.formNameType = 'Lead'; this.formNameId = '';
    this.formRelatedToType = 'Account'; this.formRelatedToId = '';
  }

  cancelForm() { this.showForm = false; this.editingTask = null; this.resetForm(); }

  saveTask() {
    const dto: CreateActivityDto = {
      type: 'Task',
      subject:       this.formSubject || null,
      description:   this.formDescription || null,
      dueDate:       this.formDueDate ? `${this.formDueDate}T00:00:00` : null,
      priority:      this.formPriority || null,
      status:        this.formStatus || null,
      nameId:        this.formNameId || null,
      nameType:      this.formNameId ? this.formNameType : null,
      relatedToId:   this.formRelatedToId || null,
      relatedToType: this.formRelatedToId ? this.formRelatedToType : null,
    };
    if (this.editingTask) {
      this.activityService.update(this.editingTask.id, dto as UpdateActivityDto).subscribe({
        next: () => { this.showForm = false; this.loadTasks(); },
        error: () => { this.error = 'Failed to update'; this.cdr.detectChanges(); },
      });
    } else {
      this.activityService.create(dto).subscribe({
        next: () => { this.showForm = false; this.loadTasks(); },
        error: () => { this.error = 'Failed to create'; this.cdr.detectChanges(); },
      });
    }
  }

  markDone(t: ActivityDto) {
    const { id, createdAt, ...rest } = t;
    this.activityService.update(id, { ...rest, status: 'Completed' }).subscribe({
      next: () => this.loadTasks(),
      error: () => { this.error = 'Failed to update'; this.cdr.detectChanges(); },
    });
  }

  deleteTask(id: string) {
    if (!confirm('Delete this task?')) return;
    this.activityService.delete(id).subscribe({ next: () => this.loadTasks() });
  }

  // ── Lookups ───────────────────────────────────────────────────────
  onNameTypeChange()      { this.formNameId = ''; }
  onRelatedToTypeChange() { this.formRelatedToId = ''; }

  // ── Helpers ───────────────────────────────────────────────────────
  isOverdue(t: ActivityDto) {
    if (t.status === 'Completed' || !t.dueDate) return false;
    const due = new Date(t.dueDate); due.setHours(0, 0, 0, 0);
    const today = new Date(); today.setHours(0, 0, 0, 0);
    return due < today;
  }
  isDone(t: ActivityDto)    { return t.status === 'Completed'; }

  getNameDisplay(a: ActivityDto) { if (!a.nameId) return '—'; const src = a.nameType === 'Lead' ? this.leads : this.contacts; return src.find(o => o.id === a.nameId)?.label ?? `${a.nameType} (…)`; }
  getRelatedDisplay(a: ActivityDto) { if (!a.relatedToId) return '—'; const src = a.relatedToType === 'Case' ? this.cases : a.relatedToType === 'Campaign' ? this.campaigns : this.accounts; return src.find(o => o.id === a.relatedToId)?.label ?? `${a.relatedToType} (…)`; }
  getPriorityClass(p: string | null) { if (p === 'High') return 'badge-high'; if (p === 'Low') return 'badge-low'; return 'badge-normal'; }
  getStatusClass(s: string | null) { if (s === 'Completed') return 'badge-completed'; if (s === 'In Progress') return 'badge-in-progress'; if (s === 'Deferred') return 'badge-deferred'; return 'badge-pending'; }

  private resolveLabel(id: string | null, type: string | null): string {
    if (!id || !type) return '';
    const map: Record<string, LookupOption[]> = { Lead: this.leads, Contact: this.contacts, Account: this.accounts, Case: this.cases, Campaign: this.campaigns };
    return map[type]?.find(o => o.id === id)?.label ?? '';
  }
}
