import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { JobPostingChannelService } from '../../../../services/job-posting-channel.service';
import { ChannelTemplateService } from '../../../../services/channel-template.service';
import { LookupService } from '../../../../services/lookup.service';
import { HrAuthHelper } from '../../../../services/hr-auth-helper';
import { HR_API } from '../../../../services/hr-api-config';
import { JobPostingChannelDto, CreateJobPostingChannelDto, UpdateJobPostingChannelDto } from '../../../../models/job-posting-channel.model';
import { ChannelTemplateDto, CreateChannelTemplateDto, UpdateChannelTemplateDto } from '../../../../models/channel-template.model';
import { LookupValueDto } from '../../../../models/lookup.model';
import { JobPostingStatus, LookupTypeCode } from '../../../../models/hr-enums';
import { ApiResponse } from '../../../../models/api-response.model';

@Component({
  selector: 'lib-settings-job-posting-channels',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './job-posting-channels.html',
  styleUrl: '../../../shared-styles.css',
})
export class SettingsJobPostingChannelsComponent implements OnInit {
  // ── Tabs ──────────────────────────────────────────────────────────────────
  activeTab: 'channels' | 'templates' = 'channels';

  // ── Posting Channels ──────────────────────────────────────────────────────
  channels: JobPostingChannelDto[] = [];
  jobs: { id: string; title: string }[] = [];
  templates: ChannelTemplateDto[] = [];
  channelTypeValues: LookupValueDto[] = [];
  statusValues: LookupValueDto[] = [];

  loading = false;
  error = '';
  saving = false;
  saveError = '';

  showForm = false;
  editingChannel: JobPostingChannelDto | null = null;

  formJobId = '';
  formChannelTemplateId = '';
  formChannelNameSnapshot = '';
  formChannelTypeLookupValueId = '';
  formSourceTrackingCode = '';
  formPostingUrl = '';
  formOpenDate = '';
  formCloseDate = '';
  formStatusLookupValueId = '';
  formIsSponsored = false;
  formSponsoredBudget: number | '' = '';

  // ── Channel Templates ─────────────────────────────────────────────────────
  ctLoading = false;
  ctError = '';
  ctSaving = false;
  ctSaveError = '';
  showCtForm = false;
  editingTemplate: ChannelTemplateDto | null = null;

  ctFormChannelCode = '';
  ctFormChannelName = '';
  ctFormChannelTypeLookupValueId = '';
  ctFormIsActive = true;
  ctFormSupportsAutoPosting = false;
  ctFormRequiresApproval = false;
  ctFormApiEndpoint = '';
  ctFormTrackingPrefix = '';
  ctFormDefaultStatusLookupValueId = '';

  constructor(
    private service: JobPostingChannelService,
    private ctService: ChannelTemplateService,
    private lookupService: LookupService,
    private auth: HrAuthHelper,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadChannels();
    this.loadTemplates();
    this.loadDropdowns();
  }

  switchTab(tab: 'channels' | 'templates') {
    this.activeTab = tab;
  }

  // ── Dropdowns ─────────────────────────────────────────────────────────────
  loadDropdowns() {
    this.http.get<ApiResponse<any[]>>(HR_API.jobRequisition.getAll, { headers: this.auth.getAuthHeaders() }).subscribe({
      next: (res) => {
        this.jobs = (res.data ?? []).map(j => ({ id: j.id, title: j.jobTitle ?? j.title ?? j.id }));
        this.cdr.detectChanges();
      },
      error: () => {},
    });

    this.lookupService.getAllTypes().subscribe({
      next: (res) => {
        const types = res.data ?? [];
        const channelType = types.find(t => t.code === LookupTypeCode.ChannelType);
        const statusType = types.find(t => t.code === LookupTypeCode.PostingStatus);
        if (channelType) {
          this.lookupService.getValuesByType(channelType.id).subscribe({
            next: (r) => { this.channelTypeValues = r.data ?? []; this.cdr.detectChanges(); },
            error: () => {},
          });
        }
        if (statusType) {
          this.lookupService.getValuesByType(statusType.id).subscribe({
            next: (r) => { this.statusValues = r.data ?? []; this.cdr.detectChanges(); },
            error: () => {},
          });
        }
        this.cdr.detectChanges();
      },
      error: () => {},
    });
  }

  // ── Posting Channels ──────────────────────────────────────────────────────
  loadChannels() {
    this.loading = true;
    this.error = '';
    this.service.getAll().subscribe({
      next: (res: any) => { this.channels = Array.isArray(res) ? res : (res.data ?? []); this.loading = false; this.cdr.detectChanges(); },
      error: () => { this.error = 'Failed to load posting channels.'; this.loading = false; this.cdr.detectChanges(); },
    });
  }

  getJobTitle(id: string): string {
    return this.jobs.find(j => j.id === id)?.title ?? id;
  }

  getTemplateName(id: string): string {
    const t = this.templates.find(t => t.id === id);
    return t?.channelName ?? t?.channelCode ?? id;
  }

  getChannelTypeName(id: string): string {
    return this.channelTypeValues.find(v => v.id === id)?.name ?? id;
  }

  getStatusName(id: string): string {
    return this.statusValues.find(v => v.id === id)?.name ?? id;
  }

  openCreateForm() { this.editingChannel = null; this.resetForm(); this.showForm = true; this.saveError = ''; }

  openEditForm(ch: JobPostingChannelDto) {
    this.editingChannel = ch;
    this.formJobId = ch.jobId;
    this.formChannelTemplateId = ch.channelTemplateId;
    this.formChannelNameSnapshot = ch.channelNameSnapshot ?? '';
    this.formChannelTypeLookupValueId = ch.channelTypeLookupValueId;
    this.formSourceTrackingCode = ch.sourceTrackingCode ?? '';
    this.formPostingUrl = ch.postingUrl ?? '';
    this.formOpenDate = ch.openDate ? ch.openDate.substring(0, 10) : '';
    this.formCloseDate = ch.closeDate ? ch.closeDate.substring(0, 10) : '';
    this.formStatusLookupValueId = ch.statusLookupValueId;
    this.formIsSponsored = ch.isSponsored ?? false;
    this.formSponsoredBudget = ch.sponsoredBudget ?? '';
    this.showForm = true;
    this.saveError = '';
  }

  resetForm() {
    this.formJobId = '';
    this.formChannelTemplateId = '';
    this.formChannelNameSnapshot = '';
    this.formChannelTypeLookupValueId = '';
    this.formSourceTrackingCode = '';
    this.formPostingUrl = '';
    this.formOpenDate = '';
    this.formCloseDate = '';
    this.formStatusLookupValueId = '';
    this.formIsSponsored = false;
    this.formSponsoredBudget = '';
  }

  cancelForm() { this.showForm = false; this.editingChannel = null; this.resetForm(); this.saveError = ''; }

  saveChannel() {
    if (!this.formJobId || !this.formChannelTemplateId || !this.formChannelTypeLookupValueId || !this.formOpenDate || !this.formStatusLookupValueId) {
      this.saveError = 'Job, Channel Template, Channel Type, Open Date, and Status are required.';
      return;
    }
    this.saving = true;
    this.saveError = '';

    if (this.editingChannel) {
      const dto: UpdateJobPostingChannelDto = {
        channelTemplateId: this.formChannelTemplateId,
        channelNameSnapshot: this.formChannelNameSnapshot || undefined,
        postingUrl: this.formPostingUrl || undefined,
        closeDate: this.formCloseDate ? new Date(this.formCloseDate).toISOString() : undefined,
        statusLookupValueId: this.formStatusLookupValueId,
        isSponsored: this.formIsSponsored,
        sponsoredBudget: this.formSponsoredBudget !== '' ? Number(this.formSponsoredBudget) : undefined,
      };
      this.service.update(this.editingChannel.id, dto).subscribe({
        next: () => { this.saving = false; this.cancelForm(); this.loadChannels(); },
        error: () => { this.saving = false; this.saveError = 'Failed to update channel.'; this.cdr.detectChanges(); },
      });
    } else {
      const dto: CreateJobPostingChannelDto = {
        jobId: this.formJobId,
        channelTemplateId: this.formChannelTemplateId,
        channelNameSnapshot: this.formChannelNameSnapshot || undefined,
        channelTypeLookupValueId: this.formChannelTypeLookupValueId,
        sourceTrackingCode: this.formSourceTrackingCode || undefined,
        postingUrl: this.formPostingUrl || undefined,
        openDate: new Date(this.formOpenDate).toISOString(),
        closeDate: this.formCloseDate ? new Date(this.formCloseDate).toISOString() : undefined,
        statusLookupValueId: this.formStatusLookupValueId,
      };
      this.service.create(dto).subscribe({
        next: () => { this.saving = false; this.cancelForm(); this.loadChannels(); },
        error: () => { this.saving = false; this.saveError = 'Failed to create posting channel.'; this.cdr.detectChanges(); },
      });
    }
  }

  deleteChannel(ch: JobPostingChannelDto) {
    if (!confirm(`Delete this job posting channel?`)) return;
    this.service.delete(ch.id).subscribe({
      next: () => this.loadChannels(),
      error: () => { this.error = 'Failed to delete channel.'; this.cdr.detectChanges(); },
    });
  }

  // ── Channel Templates ─────────────────────────────────────────────────────
  loadTemplates() {
    this.ctLoading = true;
    this.ctError = '';
    this.ctService.getAll().subscribe({
      next: (res: any) => {
        this.templates = Array.isArray(res) ? res : (res.data ?? []);
        this.ctLoading = false;
        this.cdr.detectChanges();
      },
      error: () => { this.ctError = 'Failed to load channel templates.'; this.ctLoading = false; this.cdr.detectChanges(); },
    });
  }

  openCreateCtForm() { this.editingTemplate = null; this.resetCtForm(); this.showCtForm = true; this.ctSaveError = ''; }

  openEditCtForm(t: ChannelTemplateDto) {
    this.editingTemplate = t;
    this.ctFormChannelCode = t.channelCode ?? '';
    this.ctFormChannelName = t.channelName ?? '';
    this.ctFormChannelTypeLookupValueId = t.channelTypeLookupValueId;
    this.ctFormIsActive = t.isActive;
    this.ctFormSupportsAutoPosting = t.supportsAutoPosting;
    this.ctFormRequiresApproval = t.requiresApproval;
    this.ctFormApiEndpoint = t.apiEndpoint ?? '';
    this.ctFormTrackingPrefix = t.trackingPrefix ?? '';
    this.ctFormDefaultStatusLookupValueId = t.defaultStatusLookupValueId ?? '';
    this.showCtForm = true;
    this.ctSaveError = '';
  }

  resetCtForm() {
    this.ctFormChannelCode = '';
    this.ctFormChannelName = '';
    this.ctFormChannelTypeLookupValueId = '';
    this.ctFormIsActive = true;
    this.ctFormSupportsAutoPosting = false;
    this.ctFormRequiresApproval = false;
    this.ctFormApiEndpoint = '';
    this.ctFormTrackingPrefix = '';
    this.ctFormDefaultStatusLookupValueId = '';
  }

  cancelCtForm() { this.showCtForm = false; this.editingTemplate = null; this.resetCtForm(); this.ctSaveError = ''; }

  saveTemplate() {
    if (!this.ctFormChannelTypeLookupValueId) {
      this.ctSaveError = 'Channel Type is required.';
      return;
    }
    this.ctSaving = true;
    this.ctSaveError = '';

    if (this.editingTemplate) {
      const dto: UpdateChannelTemplateDto = {
        channelName: this.ctFormChannelName || undefined,
        channelTypeLookupValueId: this.ctFormChannelTypeLookupValueId || undefined,
        isActive: this.ctFormIsActive,
        supportsAutoPosting: this.ctFormSupportsAutoPosting,
        requiresApproval: this.ctFormRequiresApproval,
        apiEndpoint: this.ctFormApiEndpoint || undefined,
        trackingPrefix: this.ctFormTrackingPrefix || undefined,
        defaultStatusLookupValueId: this.ctFormDefaultStatusLookupValueId || undefined,
      };
      this.ctService.update(this.editingTemplate.id, dto).subscribe({
        next: () => { this.ctSaving = false; this.cancelCtForm(); this.loadTemplates(); },
        error: () => { this.ctSaving = false; this.ctSaveError = 'Failed to update template.'; this.cdr.detectChanges(); },
      });
    } else {
      const dto: CreateChannelTemplateDto = {
        channelCode: this.ctFormChannelCode || undefined,
        channelName: this.ctFormChannelName || undefined,
        channelTypeLookupValueId: this.ctFormChannelTypeLookupValueId,
        supportsAutoPosting: this.ctFormSupportsAutoPosting,
        requiresApproval: this.ctFormRequiresApproval,
        apiEndpoint: this.ctFormApiEndpoint || undefined,
        trackingPrefix: this.ctFormTrackingPrefix || undefined,
        defaultStatusLookupValueId: this.ctFormDefaultStatusLookupValueId || undefined,
      };
      this.ctService.create(dto).subscribe({
        next: () => { this.ctSaving = false; this.cancelCtForm(); this.loadTemplates(); },
        error: () => { this.ctSaving = false; this.ctSaveError = 'Failed to create template.'; this.cdr.detectChanges(); },
      });
    }
  }

  deleteTemplate(t: ChannelTemplateDto) {
    if (!confirm(`Delete channel template "${t.channelName ?? t.channelCode}"?`)) return;
    this.ctService.delete(t.id).subscribe({
      next: () => this.loadTemplates(),
      error: () => { this.ctError = 'Failed to delete template.'; this.cdr.detectChanges(); },
    });
  }
}
