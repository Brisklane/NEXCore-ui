import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { ActivityService } from '../../services/activity.service';
import { LeadService } from '../../services/lead.service';
import { ContactService } from '../../services/contact.service';
import { AccountService } from '../../services/account.service';
import { CaseService } from '../../services/case.service';
import { CampaignService } from '../../services/campaign.service';
import { ActivityDto, CreateActivityDto, UpdateActivityDto } from '../../models/activity.model';
import { LookupDropdownComponent } from '../../components/lookup-dropdown/lookup-dropdown';

interface LookupOption { id: string; label: string; }

type EventsFilter = 'all' | 'upcoming' | 'active' | 'completed';
type TasksFilter  = 'all' | 'upcoming' | 'active' | 'deferred' | 'completed';

@Component({
  selector: 'lib-activities',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, LookupDropdownComponent],
  templateUrl: './activities.html',
  styleUrl: './activities.css',
})
export class ActivitiesComponent implements OnInit {
  activeTab: 'calls' | 'events' | 'tasks' = 'calls';

  activities: ActivityDto[] = [];
  loading = false;
  error   = '';
  showForm = false;
  editingActivity: ActivityDto | null = null;

  // ── Form fields ────────────────────────────────────────────────────
  formSubject = '';
  formDescription = '';
  formComments = '';
  formPriority = 'Normal';
  formStatus   = 'Not Started';

  formCallMode: 'log' | 'schedule' = 'log';
  formCallType = '';
  formCallPurpose = '';
  formCallResult  = '';
  formDurationMinutes: number | null = null;
  formDueDate  = '';
  formDueTime  = '';

  formStartDate = '';
  formStartTime = '';
  formEndDate   = '';
  formEndTime   = '';

  formNameType      = 'Lead';
  formNameId        = '';
  formRelatedToType = 'Account';
  formRelatedToId   = '';

  // ── Lookup caches ──────────────────────────────────────────────────
  leads:     LookupOption[] = [];
  contacts:  LookupOption[] = [];
  accounts:  LookupOption[] = [];
  cases:     LookupOption[] = [];
  campaigns: LookupOption[] = [];

  get nameOptions() {
    return (this.formNameType === 'Lead' ? this.leads : this.contacts)
      .map(o => ({ value: o.id, label: o.label }));
  }
  get relatedToOptions() {
    const src = this.formRelatedToType === 'Case'     ? this.cases
              : this.formRelatedToType === 'Campaign' ? this.campaigns
              : this.accounts;
    return src.map(o => ({ value: o.id, label: o.label }));
  }

  readonly priorityOptions      = ['Low', 'Normal', 'High'];
  readonly taskStatusOptions    = ['Not Started', 'In Progress', 'Completed', 'Waiting', 'Deferred'];
  readonly callTypeOptions      = ['Inbound', 'Outbound'];
  readonly callPurposeOptions   = ['Prospecting', 'Follow-up', 'Demo', 'Support', 'Other'];
  readonly callResultOptions    = ['Connected', 'Left Voicemail', 'No Answer', 'Wrong Number', 'Other'];
  readonly nameTypeOptions      = ['Lead', 'Contact'];
  readonly relatedToTypeOptions = ['Account', 'Case', 'Campaign'];
  readonly pageSizeOptions      = [5, 10, 25, 50];

  // ── Pagination ─────────────────────────────────────────────────────
  callsSearch  = ''; callsPage  = 1; callsPageSize  = 10;
  eventsSearch = ''; eventsPage = 1; eventsPageSize = 10;
  tasksSearch  = ''; tasksPage  = 1; tasksPageSize  = 10;

  // ── Category filters ───────────────────────────────────────────────
  eventsFilter: EventsFilter = 'all';
  tasksFilter:  TasksFilter  = 'all';

  constructor(
    private activityService: ActivityService,
    private leadService:     LeadService,
    private contactService:  ContactService,
    private accountService:  AccountService,
    private caseService:     CaseService,
    private campaignService: CampaignService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.loadActivities();
    this.loadLookupData();
  }

  // ── Helpers ────────────────────────────────────────────────────────
  private sorted(list: ActivityDto[]): ActivityDto[] {
    return [...list].sort((a, b) =>
      new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime()
    );
  }
  private get now():   Date { return new Date(); }
  private get today(): Date { const d = new Date(); d.setHours(0, 0, 0, 0); return d; }

  // ── Initial load – fetch all pages ────────────────────────────────
  loadActivities() {
    this.loading = true;
    this.error   = '';
    const PAGE_SIZE = 100;

    this.activityService.getAll({ pageSize: PAGE_SIZE, page: 1 }).subscribe({
      next: (res) => {
        const page1: ActivityDto[] = Array.isArray(res.data) ? res.data : [];
        const totalPages = res.totalPages ?? res.pagination?.totalPages ?? 1;
        const morePages  = Math.max(
          totalPages - 1,
          page1.length === PAGE_SIZE ? 1 : 0   // assume more if we got a full page
        );

        if (morePages === 0) {
          this.activities = this.sorted(page1);
          this.loading = false;
          this.cdr.detectChanges();
          return;
        }

        forkJoin(
          Array.from({ length: morePages }, (_, i) =>
            this.activityService.getAll({ pageSize: PAGE_SIZE, page: i + 2 })
          )
        ).subscribe({
          next: (pages) => {
            const rest = pages.flatMap(r => Array.isArray(r.data) ? r.data : []);
            this.activities = this.sorted([...page1, ...rest]);
            this.loading = false;
            this.cdr.detectChanges();
          },
          error: () => {
            this.activities = this.sorted(page1);
            this.loading = false;
            this.cdr.detectChanges();
          },
        });
      },
      error: () => {
        this.error   = 'Failed to load activities';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  loadLookupData() {
    this.leadService.getAll({ pageSize: 500 }).subscribe(res => {
      this.leads = (res.data ?? []).map(l => ({
        id: l.id,
        label: [l.firstName, l.lastName].filter(Boolean).join(' ') || 'Unnamed Lead',
      }));
    });
    this.contactService.getAll({ pageSize: 500 }).subscribe(res => {
      this.contacts = (res.data ?? []).map(c => ({
        id: c.id,
        label: [c.firstName, c.lastName].filter(Boolean).join(' ') || 'Unnamed Contact',
      }));
    });
    this.accountService.getAll({ pageSize: 500 }).subscribe(res => {
      this.accounts = (res.data ?? []).map(a => ({ id: a.id, label: a.accountName || 'Unnamed Account' }));
    });
    this.caseService.getAll({ pageSize: 500 }).subscribe(res => {
      this.cases = (res.data ?? []).map(c => ({
        id: c.id,
        label: c.subject || c.caseNumber || 'Unnamed Case',
      }));
    });
    this.campaignService.getAll({ pageSize: 500 }).subscribe(res => {
      this.campaigns = (res.data ?? []).map(c => ({ id: c.id, label: c.campaignName || 'Unnamed Campaign' }));
    });
  }

  // ── Summary cards ──────────────────────────────────────────────────
  get totalCount()     { return this.activities.length; }
  get callsCount()     { return this.activities.filter(a => a.type === 'Call').length; }
  get eventsCount()    { return this.activities.filter(a => a.type === 'Event').length; }
  get tasksCount()     { return this.activities.filter(a => a.type === 'Task').length; }
  get completedCount() { return this.activities.filter(a => a.status === 'Completed').length; }
  get overdueCount()   { return this.activities.filter(a => this.isOverdue(a)).length; }

  // ── Calls list (flat, no category) ────────────────────────────────
  private get allCallsList(): ActivityDto[] { return this.activities.filter(a => a.type === 'Call'); }

  private get searchedCalls(): ActivityDto[] {
    const q = this.callsSearch.toLowerCase().trim();
    return q ? this.allCallsList.filter(a => (a.subject ?? '').toLowerCase().includes(q)) : this.allCallsList;
  }
  get pagedCalls():      ActivityDto[] { const s = (this.callsPage - 1) * this.callsPageSize; return this.searchedCalls.slice(s, s + this.callsPageSize); }
  get callsTotalPages(): number { return Math.max(1, Math.ceil(this.searchedCalls.length / this.callsPageSize)); }
  get callsFirstEntry(): number { return this.searchedCalls.length === 0 ? 0 : (this.callsPage - 1) * this.callsPageSize + 1; }
  get callsLastEntry():  number { return Math.min(this.callsPage * this.callsPageSize, this.searchedCalls.length); }
  get callsTotal():      number { return this.searchedCalls.length; }

  // ── Events: category counts ────────────────────────────────────────
  //
  // Upcoming  = not Completed + start is in the future (or no date set)
  // Active    = not Completed + start date has already passed  (event started, needs follow-up)
  // Completed = status Completed
  //
  get upcomingEventsCount(): number {
    return this.activities.filter(a =>
      a.type === 'Event' && a.status !== 'Completed' &&
      (!a.startDateTime || new Date(a.startDateTime) > this.now)
    ).length;
  }
  get activeEventsCount(): number {
    return this.activities.filter(a =>
      a.type === 'Event' && a.status !== 'Completed' &&
      !!a.startDateTime && new Date(a.startDateTime) <= this.now
    ).length;
  }
  get completedEventsCount(): number {
    return this.activities.filter(a => a.type === 'Event' && a.status === 'Completed').length;
  }

  // ── Events: filtered + paginated ──────────────────────────────────
  private get displayedEventsList(): ActivityDto[] {
    const now = this.now;
    switch (this.eventsFilter) {
      case 'upcoming':
        return this.activities.filter(a =>
          a.type === 'Event' && a.status !== 'Completed' &&
          (!a.startDateTime || new Date(a.startDateTime) > now)
        );
      case 'active':
        return this.activities.filter(a =>
          a.type === 'Event' && a.status !== 'Completed' &&
          !!a.startDateTime && new Date(a.startDateTime) <= now
        );
      case 'completed':
        return this.activities.filter(a => a.type === 'Event' && a.status === 'Completed');
      default:
        return this.activities.filter(a => a.type === 'Event');
    }
  }

  private get searchedEvents(): ActivityDto[] {
    const q = this.eventsSearch.toLowerCase().trim();
    return q ? this.displayedEventsList.filter(a => (a.subject ?? '').toLowerCase().includes(q)) : this.displayedEventsList;
  }
  get pagedEvents():      ActivityDto[] { const s = (this.eventsPage - 1) * this.eventsPageSize; return this.searchedEvents.slice(s, s + this.eventsPageSize); }
  get eventsTotalPages(): number { return Math.max(1, Math.ceil(this.searchedEvents.length / this.eventsPageSize)); }
  get eventsFirstEntry(): number { return this.searchedEvents.length === 0 ? 0 : (this.eventsPage - 1) * this.eventsPageSize + 1; }
  get eventsLastEntry():  number { return Math.min(this.eventsPage * this.eventsPageSize, this.searchedEvents.length); }
  get eventsTotal():      number { return this.searchedEvents.length; }

  // ── Tasks: category counts ─────────────────────────────────────────
  //
  // Upcoming  = Not Started, due date is today or future (or no due date)
  // Active    = In Progress; OR Waiting; OR overdue (Not Started with past due date)
  // Deferred  = status Deferred  (explicitly postponed)
  // Completed = status Completed
  //
  get upcomingTasksCount(): number {
    const today = this.today;
    return this.activities.filter(a =>
      a.type === 'Task' && a.status === 'Not Started' &&
      (!a.dueDate || new Date(a.dueDate) >= today)
    ).length;
  }
  get activeTasksCount(): number {
    const today = this.today;
    return this.activities.filter(a =>
      a.type === 'Task' && a.status !== 'Completed' && a.status !== 'Deferred' && (
        a.status === 'In Progress' ||
        a.status === 'Waiting' ||
        (a.dueDate && new Date(a.dueDate) < today)  // overdue
      )
    ).length;
  }
  get deferredTasksCount(): number {
    return this.activities.filter(a => a.type === 'Task' && a.status === 'Deferred').length;
  }
  get completedTasksCount(): number {
    return this.activities.filter(a => a.type === 'Task' && a.status === 'Completed').length;
  }

  // ── Tasks: filtered + paginated ────────────────────────────────────
  private get displayedTasksList(): ActivityDto[] {
    const today = this.today;
    switch (this.tasksFilter) {
      case 'upcoming':
        return this.activities.filter(a =>
          a.type === 'Task' && a.status === 'Not Started' &&
          (!a.dueDate || new Date(a.dueDate) >= today)
        );
      case 'active':
        return this.activities.filter(a =>
          a.type === 'Task' && a.status !== 'Completed' && a.status !== 'Deferred' && (
            a.status === 'In Progress' ||
            a.status === 'Waiting' ||
            (a.dueDate && new Date(a.dueDate) < today)
          )
        );
      case 'deferred':
        return this.activities.filter(a => a.type === 'Task' && a.status === 'Deferred');
      case 'completed':
        return this.activities.filter(a => a.type === 'Task' && a.status === 'Completed');
      default:
        return this.activities.filter(a => a.type === 'Task');
    }
  }

  private get searchedTasks(): ActivityDto[] {
    const q = this.tasksSearch.toLowerCase().trim();
    return q ? this.displayedTasksList.filter(a => (a.subject ?? '').toLowerCase().includes(q)) : this.displayedTasksList;
  }
  get pagedTasks():      ActivityDto[] { const s = (this.tasksPage - 1) * this.tasksPageSize; return this.searchedTasks.slice(s, s + this.tasksPageSize); }
  get tasksTotalPages(): number { return Math.max(1, Math.ceil(this.searchedTasks.length / this.tasksPageSize)); }
  get tasksFirstEntry(): number { return this.searchedTasks.length === 0 ? 0 : (this.tasksPage - 1) * this.tasksPageSize + 1; }
  get tasksLastEntry():  number { return Math.min(this.tasksPage * this.tasksPageSize, this.searchedTasks.length); }
  get tasksTotal():      number { return this.searchedTasks.length; }

  // ── Navigation ─────────────────────────────────────────────────────
  goToCallsPage(p: number):  void { if (p >= 1 && p <= this.callsTotalPages)  this.callsPage  = p; }
  goToEventsPage(p: number): void { if (p >= 1 && p <= this.eventsTotalPages) this.eventsPage = p; }
  goToTasksPage(p: number):  void { if (p >= 1 && p <= this.tasksTotalPages)  this.tasksPage  = p; }

  onCallsPageSizeChange():  void { this.callsPage  = 1; }
  onEventsPageSizeChange(): void { this.eventsPage = 1; }
  onTasksPageSizeChange():  void { this.tasksPage  = 1; }

  onCallsSearchChange():  void { this.callsPage  = 1; }
  onEventsSearchChange(): void { this.eventsPage = 1; }
  onTasksSearchChange():  void { this.tasksPage  = 1; }

  setEventsFilter(f: EventsFilter): void { this.eventsFilter = f; this.eventsPage = 1; }
  setTasksFilter(f: TasksFilter):   void { this.tasksFilter  = f; this.tasksPage  = 1; }

  // ── Tab switching ──────────────────────────────────────────────────
  setTab(tab: 'calls' | 'events' | 'tasks') {
    this.activeTab = tab;
    this.showForm  = false;
    this.resetForm();
  }

  // ── Form lifecycle ─────────────────────────────────────────────────
  openCreateForm() {
    this.editingActivity = null;
    this.resetForm();
    // Pre-fill today's date for events so the Save button is never blocked
    if (this.activeTab === 'events') {
      const today = new Date().toISOString().slice(0, 10);
      this.formStartDate = today;
      this.formEndDate   = today;
    }
    this.showForm = true;
  }

  openEditForm(activity: ActivityDto) {
    this.editingActivity     = activity;
    this.formSubject         = activity.subject         ?? '';
    this.formDescription     = activity.description     ?? '';
    this.formComments        = activity.comments        ?? '';
    this.formPriority        = activity.priority        ?? 'Normal';
    this.formStatus          = activity.status          ?? 'Not Started';
    this.formCallType        = activity.callType        ?? '';
    this.formCallPurpose     = activity.callPurpose     ?? '';
    this.formCallResult      = activity.callResult      ?? '';
    this.formDurationMinutes = activity.durationMinutes ?? null;
    this.formNameType        = activity.nameType        ?? 'Lead';
    this.formNameId          = activity.nameId          ?? '';
    this.formRelatedToType   = activity.relatedToType   ?? 'Account';
    this.formRelatedToId     = activity.relatedToId     ?? '';

    this.formCallMode = activity.dueDate ? 'schedule' : 'log';

    if (activity.dueDate) {
      const d = new Date(activity.dueDate);
      this.formDueDate = d.toISOString().slice(0, 10);
      this.formDueTime = d.toTimeString().slice(0, 5);
    }
    if (activity.startDateTime) {
      const d = new Date(activity.startDateTime);
      this.formStartDate = d.toISOString().slice(0, 10);
      this.formStartTime = d.toTimeString().slice(0, 5);
    }
    if (activity.endDateTime) {
      const d = new Date(activity.endDateTime);
      this.formEndDate = d.toISOString().slice(0, 10);
      this.formEndTime = d.toTimeString().slice(0, 5);
    }

    this.showForm = true;
  }

  resetForm() {
    this.formSubject = ''; this.formDescription = ''; this.formComments = '';
    this.formPriority = 'Normal'; this.formStatus = 'Not Started';
    this.formCallMode = 'log'; this.formCallType = ''; this.formCallPurpose = '';
    this.formCallResult = ''; this.formDurationMinutes = null;
    this.formDueDate = ''; this.formDueTime = '';
    this.formStartDate = ''; this.formStartTime = '';
    this.formEndDate   = ''; this.formEndTime   = '';
    this.formNameType = 'Lead'; this.formNameId = '';
    this.formRelatedToType = 'Account'; this.formRelatedToId = '';
  }

  cancelForm() { this.showForm = false; this.editingActivity = null; this.resetForm(); }

  // ── Save / update ──────────────────────────────────────────────────
  saveActivity() {
    this.error = '';
    const type = this.activeTab === 'calls' ? 'Call'
               : this.activeTab === 'events' ? 'Event' : 'Task';

    const dto: CreateActivityDto = {
      type,
      subject:         this.formSubject         || null,
      description:     this.formDescription     || null,
      comments:        this.formComments        || null,
      priority:        this.formPriority        || null,
      status:          this.formStatus          || null,
      callType:        this.formCallType        || null,
      callPurpose:     this.formCallPurpose     || null,
      callResult:      this.formCallResult      || null,
      durationMinutes: this.formDurationMinutes || null,
      nameId:          this.formNameId          || null,
      nameType:        this.formNameId          ? this.formNameType      : null,
      relatedToId:     this.formRelatedToId     || null,
      relatedToType:   this.formRelatedToId     ? this.formRelatedToType : null,
      dueDate:         this.buildDateTime(this.formDueDate,   this.formDueTime),
      startDateTime:   this.buildDateTime(this.formStartDate, this.formStartTime),
      endDateTime:     this.buildDateTime(this.formEndDate,   this.formEndTime),
    };

    if (this.editingActivity) {
      const id = this.editingActivity.id;
      this.activityService.update(id, dto as UpdateActivityDto).subscribe({
        next: (res) => {
          if (!res.success) {
            this.error = res.message || 'Failed to update activity';
            this.cdr.detectChanges();
            return;
          }
          const updated: ActivityDto = res.data
            ? res.data
            : { ...this.editingActivity!, ...(dto as Partial<ActivityDto>) };
          this.activities      = this.sorted(this.activities.map(a => a.id === id ? updated : a));
          this.showForm        = false;
          this.editingActivity = null;
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.error = err?.error?.message || 'Failed to update activity';
          this.cdr.detectChanges();
        },
      });

    } else {
      this.activityService.create(dto).subscribe({
        next: (res) => {
          if (!res.success) {
            this.error = res.message || 'Failed to create activity';
            this.cdr.detectChanges();
            return;
          }
          if (res.data) {
            this.activities = this.sorted([res.data, ...this.activities]);
          }
          // Jump to page 1 so the new item is always visible
          if (type === 'Call')  this.callsPage  = 1;
          if (type === 'Event') this.eventsPage = 1;
          if (type === 'Task')  this.tasksPage  = 1;
          // Also reset filter to 'all' on create so user sees the new item
          if (type === 'Event') this.eventsFilter = 'all';
          if (type === 'Task')  this.tasksFilter  = 'all';
          this.showForm = false;
          this.resetForm();
          if (!res.data) { this.loadActivities(); }
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.error = err?.error?.message || 'Failed to create activity';
          this.cdr.detectChanges();
        },
      });
    }
  }

  markDone(activity: ActivityDto) {
    this.activityService.update(activity.id, { status: 'Completed' } as UpdateActivityDto).subscribe({
      next: (res) => {
        if (!res.success) {
          this.error = res.message || 'Failed to mark as done';
          this.cdr.detectChanges();
          return;
        }
        this.activities = this.activities.map(a =>
          a.id === activity.id ? { ...a, status: 'Completed' } : a
        );
        this.cdr.detectChanges();
      },
      error: () => { this.error = 'Failed to mark as done'; this.cdr.detectChanges(); },
    });
  }

  deleteActivity(id: string) {
    if (!confirm('Delete this activity?')) return;
    this.activityService.delete(id).subscribe({
      next: () => {
        this.activities = this.activities.filter(a => a.id !== id);
        if (this.callsPage  > this.callsTotalPages)  this.callsPage  = this.callsTotalPages;
        if (this.eventsPage > this.eventsTotalPages) this.eventsPage = this.eventsTotalPages;
        if (this.tasksPage  > this.tasksTotalPages)  this.tasksPage  = this.tasksTotalPages;
        this.cdr.detectChanges();
      },
      error: () => { this.error = 'Failed to delete'; this.cdr.detectChanges(); },
    });
  }

  onNameTypeChange()      { this.formNameId      = ''; }
  onRelatedToTypeChange() { this.formRelatedToId = ''; }

  // ── Display helpers ────────────────────────────────────────────────
  isOverdue(a: ActivityDto): boolean {
    if (a.status === 'Completed') return false;
    const now = this.now;
    if (a.dueDate && (a.type === 'Call' || a.type === 'Task')) return new Date(a.dueDate) < now;
    if (a.endDateTime && a.type === 'Event') return new Date(a.endDateTime) < now;
    return false;
  }

  isOverdueTask(a: ActivityDto): boolean {
    if (a.status === 'Completed' || !a.dueDate) return false;
    return new Date(a.dueDate) < this.today;
  }

  getCallModeLabel(a: ActivityDto): string { return a.dueDate ? 'Scheduled' : 'Logged'; }

  getDateDisplay(a: ActivityDto): string {
    const fmt = (s: string | null) => s
      ? new Date(s).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })
      : '—';
    if (a.type === 'Task')  return a.dueDate ? new Date(a.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';
    if (a.type === 'Call')  return a.dueDate ? fmt(a.dueDate) : 'Logged';
    if (a.type === 'Event') return a.startDateTime ? fmt(a.startDateTime) : '—';
    return '—';
  }

  getNameDisplay(a: ActivityDto): string {
    if (!a.nameId) return '—';
    const src = a.nameType === 'Lead' ? this.leads : this.contacts;
    return src.find(o => o.id === a.nameId)?.label ?? `${a.nameType} (${a.nameId.slice(0, 6)}…)`;
  }

  getRelatedToDisplay(a: ActivityDto): string {
    if (!a.relatedToId) return '—';
    let src: LookupOption[] = [];
    if (a.relatedToType === 'Account')  src = this.accounts;
    if (a.relatedToType === 'Case')     src = this.cases;
    if (a.relatedToType === 'Campaign') src = this.campaigns;
    return src.find(o => o.id === a.relatedToId)?.label ?? `${a.relatedToType} (${a.relatedToId.slice(0, 6)}…)`;
  }

  getPriorityClass(p: string | null) {
    if (p === 'High') return 'badge-priority-high';
    if (p === 'Low')  return 'badge-priority-low';
    return 'badge-priority-normal';
  }

  getStatusClass(s: string | null) {
    if (s === 'Completed')   return 'badge-completed';
    if (s === 'In Progress') return 'badge-in-progress';
    if (s === 'Waiting')     return 'badge-waiting';
    if (s === 'Deferred')    return 'badge-deferred';
    return 'badge-not-started';
  }

  get isScheduleCall() { return this.formCallMode === 'schedule'; }

  private buildDateTime(date: string, time: string): string | null {
    if (!date) return null;
    return `${date}T${time || '00:00'}:00`;
  }
}
