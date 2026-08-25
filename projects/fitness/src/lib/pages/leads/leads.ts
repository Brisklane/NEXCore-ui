import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { LeadService } from '../../services/fitness.services';
import {
  LeadBoardDto, LeadDetailDto, LeadSourceDto, LeadSummaryDto, SaveLeadDto,
} from '../../models/fitness.models';
import { LeadActivityKind, LeadStatus, LEAD_STATUS_LABELS } from '../../models/fitness.enums';
import { ClubPickerComponent } from '../shared/club-picker';
import { PageHelpComponent } from '../shared/page-help';
import { FieldErrorComponent, FieldErrors, required, validate } from '../shared/validation';

/**
 * The enquiry pipeline.
 *
 * The board is ordered left to right the way a sale actually progresses, and the SLA strip above
 * it is the point of the screen: conversion falls off a cliff after the first few minutes, so an
 * enquiry nobody has answered is shown as a countable, named failure rather than a colour.
 *
 * Logging the first contact is one tap from the card, because the thing that most improves
 * conversion is making that action as cheap as possible.
 */
@Component({
  standalone: true,
  selector: 'lib-fitness-leads',
  imports: [CommonModule, FormsModule, ClubPickerComponent, PageHelpComponent, FieldErrorComponent],
  templateUrl: './leads.html',
  styleUrls: ['../fitness-shared.css', './leads.css'],
})
export class LeadsComponent {
  private leads = inject(LeadService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  board: LeadBoardDto | null = null;
  sources: LeadSourceDto[] = [];
  loading = true;
  error = '';
  notice = '';
  clubId: string | null = null;

  /** New-enquiry dialog. */
  creating = false;
  draft: SaveLeadDto = this.blankLead();
  errors: FieldErrors = {};
  saving = false;

  /** Contact-logging dialog. */
  contacting: LeadSummaryDto | null = null;
  contactSummary = '';
  contactKind = LeadActivityKind.Call;
  contactSuccessful = true;

  readonly statusLabels = LEAD_STATUS_LABELS;
  readonly LeadStatus = LeadStatus;
  readonly LeadActivityKind = LeadActivityKind;

  async onClub(id: string | null): Promise<void> {
    this.clubId = id;
    await Promise.all([this.load(), this.loadSources()]);
  }

  async load(): Promise<void> {
    this.loading = true;
    this.error = '';

    const res = await firstValueFrom(this.leads.getBoard(this.clubId ?? undefined)).catch(() => null);

    if (!res?.data) this.error = 'Could not load the pipeline.';
    else this.board = res.data;

    this.loading = false;
    this.cdr.detectChanges();
  }

  private async loadSources(): Promise<void> {
    const res = await firstValueFrom(this.leads.getSources(this.clubId ?? undefined)).catch(() => null);
    this.sources = res?.data ?? [];
  }

  // ── New enquiry ────────────────────────────────────────────────────────

  startCreate(): void {
    this.draft = this.blankLead();
    this.errors = {};
    this.creating = true;
  }

  async saveLead(): Promise<void> {
    this.errors = validate(this.draft as unknown as Record<string, unknown>, {
      firstName: [required('A first name')],
    });

    // A phone number or an email — one of the two, or there is no way to answer them.
    if (!this.draft.phone?.trim() && !this.draft.email?.trim()) {
      this.errors['phone'] = 'Give a phone number or an email, or there is no way to reply.';
    }

    if (Object.keys(this.errors).length > 0) return;

    this.saving = true;
    const res = await firstValueFrom(this.leads.create({
      ...this.draft,
      clubId: this.clubId ?? this.draft.clubId,
    })).catch(() => null);

    this.saving = false;

    if (res?.data) {
      this.creating = false;
      this.notice = `Enquiry logged for ${res.data.firstName}.`;
      await this.load();
    } else {
      this.error = 'Could not save that enquiry.';
    }

    this.cdr.detectChanges();
  }

  // ── Contact ────────────────────────────────────────────────────────────

  startContact(lead: LeadSummaryDto): void {
    this.contacting = lead;
    this.contactSummary = '';
    this.contactKind = LeadActivityKind.Call;
    this.contactSuccessful = true;
  }

  async logContact(): Promise<void> {
    if (!this.contacting) return;

    this.saving = true;
    const res = await firstValueFrom(this.leads.logActivity({
      leadId: this.contacting.id,
      kind: this.contactKind,
      summary: this.contactSummary.trim() || null,
      wasSuccessfulContact: this.contactSuccessful,
    } as never)).catch(() => null);

    this.saving = false;

    if (res?.data) {
      this.contacting = null;
      this.notice = 'Contact logged.';
      await this.load();
    } else {
      this.error = 'Could not log that.';
    }

    this.cdr.detectChanges();
  }

  async moveStage(lead: LeadSummaryDto, status: LeadStatus): Promise<void> {
    const res = await firstValueFrom(this.leads.moveStage(lead.id, status)).catch(() => null);
    if (res?.data) await this.load();
    else this.error = 'Could not move that enquiry.';
  }

  open(lead: LeadSummaryDto): void {
    void this.router.navigateByUrl(`/fitness/leads/${lead.id}`);
  }

  convert(lead: LeadSummaryDto): void {
    void this.router.navigateByUrl(`/fitness/join?leadId=${lead.id}`);
  }

  go(route: string): void { void this.router.navigateByUrl(route); }

  // ── Presentation ───────────────────────────────────────────────────────

  /** "12 minutes ago" is more useful on this screen than a timestamp. */
  waiting(receivedAt: string): string {
    const minutes = Math.round((Date.now() - new Date(receivedAt).getTime()) / 60000);
    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes} min ago`;
    const hours = Math.round(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.round(hours / 24)}d ago`;
  }

  private blankLead(): SaveLeadDto {
    return {
      clubId: this.clubId ?? '',
      firstName: '',
      lastName: null,
      phone: null,
      email: null,
      leadSourceId: null,
      goal: null,
      notes: null,
    } as SaveLeadDto;
  }
}
