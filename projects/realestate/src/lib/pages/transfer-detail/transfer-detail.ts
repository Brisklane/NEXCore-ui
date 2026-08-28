import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ExitService } from '../../services/realestate.services';
import { RealEstateContextService } from '../../services/realestate-context.service';
import type * as M from '../../models/realestate.models';
import {
  TRANSFER_KIND_LABELS, TRANSFER_STATUS_LABELS, TransferStatus,
} from '../../models/realestate.enums';
import {
  DetailPageComponent, type DetailAction, type DetailFigure, type DetailPill, type DetailTab,
} from '../shared/detail-page';
import {
  FactsComponent, MiniListComponent, SectionComponent, type Fact, type MiniRow,
} from '../shared/detail-bits';
import {
  ConfirmComponent, GateComponent, PillComponent, ToastComponent, type GateCondition,
} from '../shared/ui';

/* =====================================================================================
 * A transfer.
 *
 * Moving a unit or a plot file from one owner to another. In a plot society this is the single
 * most fraud-prone transaction in the business, so it is deliberately made of four gates that
 * have to be passed in order and cannot be skipped:
 *
 *   1. Dues cleared — nothing outstanding on the file, evidenced by a dated clearance that
 *      itself expires.
 *   2. No objection issued — the developer or society confirms no bar to the transfer.
 *   3. Transfer fee paid — the fee is computed from the schedule, not negotiated at the desk.
 *   4. Session held — both parties present, identities checked, witnesses recorded.
 *
 * Only when all four are green does the ownership chain get a new entry. The chain itself is
 * append-only: nothing is edited, ever, so the record of who owned what and when survives.
 * ===================================================================================== */

@Component({
  standalone: true,
  selector: 'lib-re-transfer-detail',
  imports: [
    CommonModule, DetailPageComponent, SectionComponent, FactsComponent, MiniListComponent,
    GateComponent, PillComponent, ConfirmComponent, ToastComponent,
  ],
  templateUrl: './transfer-detail.html',
  styleUrls: [
    '../realestate-shared.css', '../shared/ui.css', '../shared/detail-bits.css',
    './transfer-detail.css',
  ],
})
export class TransferDetailComponent implements OnInit {
  private exit = inject(ExitService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  protected ctx = inject(RealEstateContextService);

  readonly data = signal<M.TransferRequestDetailDto | null>(null);
  readonly chain = signal<M.OwnershipChainEntryDto[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly notFound = signal(false);
  readonly toast = signal<string | null>(null);
  readonly tab = signal('gates');
  readonly completing = signal(false);
  readonly working = signal(false);

  readonly gates = computed<GateCondition[]>(() =>
    (this.data()?.gates ?? []).map(g => ({
      label: g.label,
      satisfied: g.isSatisfied,
      mandatory: true,
      reason: g.blockingReason ?? null,
      route: null,
      canOverride: g.canOverride,
    })));

  readonly allGatesPassed = computed(() =>
    (this.data()?.gates ?? []).every(g => g.isSatisfied));

  readonly outstandingDocs = computed(() =>
    (this.data()?.documentChecklist ?? []).filter(c => !c.isSatisfied && c.isMandatory));

  readonly tabs = computed<DetailTab[]>(() => {
    const d = this.data();
    if (!d) return [];

    return [
      { key: 'gates', label: 'The four gates', icon: 'lock',
        count: (d.gates ?? []).filter(g => !g.isSatisfied).length,
        tone: this.allGatesPassed() ? 'neutral' : 'warning' },
      { key: 'parties', label: 'Parties', icon: 'group', count: d.parties.length },
      { key: 'fees', label: 'Fees', icon: 'payments', count: d.feeLines.length },
      { key: 'session', label: 'Session', icon: 'handshake' },
      { key: 'documents', label: 'Documents', icon: 'folder',
        count: this.outstandingDocs().length,
        tone: this.outstandingDocs().length ? 'warning' : 'neutral' },
      { key: 'chain', label: 'Ownership chain', icon: 'link', count: this.chain().length },
    ];
  });

  readonly pills = computed<DetailPill[]>(() => {
    const d = this.data();
    if (!d) return [];

    const pills: DetailPill[] = [
      { label: TRANSFER_STATUS_LABELS[d.status], tone: this.statusTone(d.status) },
      { label: TRANSFER_KIND_LABELS[d.kind] },
    ];

    if (d.blockedByLitigation) {
      pills.push({ label: 'Blocked by litigation', tone: 'danger', icon: 'gavel' });
    }
    if (d.duesCleared) pills.push({ label: 'Dues cleared', tone: 'positive' });
    if (d.nocIssued) pills.push({ label: 'NOC issued', tone: 'positive' });
    if (d.feesCleared) pills.push({ label: 'Fees paid', tone: 'positive' });

    return pills;
  });

  readonly figures = computed<DetailFigure[]>(() => {
    const d = this.data();
    if (!d) return [];

    return [
      { label: 'From', value: d.transferorName },
      { label: 'To', value: d.transfereeName ?? 'Not yet named' },
      {
        label: 'Transfer fee', value: this.money(d.totalTransferFee),
        hint: d.feesPaid >= d.totalTransferFee
          ? 'paid' : this.money(d.totalTransferFee - d.feesPaid) + ' still due',
      },
      {
        label: 'Open', value: d.daysOpen + ' days',
        hint: d.completedOn ? 'completed' : 'in progress',
      },
    ];
  });

  readonly actions = computed<DetailAction[]>(() => {
    const d = this.data();
    if (!d) return [];

    const actions: DetailAction[] = [];

    if (d.status !== TransferStatus.Completed) {
      actions.push({
        key: 'complete', label: 'Complete the transfer', icon: 'check', tone: 'success',
        disabled: !this.allGatesPassed(),
        reason: !this.allGatesPassed()
          ? 'Every gate has to be passed before ownership can change hands.' : null,
      });
      actions.push({ key: 'fees', label: 'Recompute fees', icon: 'calculate' });
      actions.push({ key: 'reject', label: 'Reject', icon: 'close', tone: 'danger' });
    }

    if (d.bookingId) {
      actions.push({ key: 'booking', label: 'The booking', icon: 'open_in_new' });
    }

    return actions;
  });

  // ── Tab contents ──────────────────────────────────────────────────

  readonly summary = computed<Fact[]>(() => {
    const d = this.data();
    if (!d) return [];

    return [
      { label: 'Reference', value: d.reference },
      { label: 'Kind', value: TRANSFER_KIND_LABELS[d.kind] },
      { label: 'Requested', value: new Date(d.requestedOn).toLocaleDateString() },
      { label: 'Project', value: d.projectName },
      { label: 'Unit', value: d.unitNumber ?? d.fileNumber },
      { label: 'Booking', value: d.bookingReference },
      { label: 'Sale consideration', value: this.money(d.saleConsideration) },
      {
        label: 'Outstanding when requested', value: this.money(d.outstandingAtRequest),
        tone: d.outstandingAtRequest > 0 ? 'warning' : 'positive',
      },
      {
        label: 'Share transferred',
        value: d.shareTransferredPercent ? d.shareTransferredPercent.toFixed(2) + '%' : 'All of it',
      },
      { label: 'Succession certificate', value: d.successionCertificateNumber },
      { label: 'Court decree', value: d.courtDecreeReference },
      { label: 'Handled by', value: d.handledByName },
      { label: 'Completed', value: d.completedOn ? new Date(d.completedOn).toLocaleDateString() : null },
      { label: 'Rejected because', value: d.rejectReason, tone: 'danger', wide: true },
      { label: 'Note', value: d.note, wide: true },
    ];
  });

  readonly duesFacts = computed<Fact[]>(() => {
    const c = this.data()?.duesClearance;
    if (!c) return [];

    return [
      { label: 'Reference', value: c.reference },
      { label: 'Issued', value: new Date(c.issuedOn).toLocaleDateString() },
      {
        label: 'Valid until', value: new Date(c.validUntil).toLocaleDateString(),
        tone: c.isExpired ? 'danger' : 'positive',
        hint: c.isExpired ? 'expired — a fresh clearance is needed' : null,
      },
      { label: 'Instalments', value: this.money(c.instalmentsOutstanding) },
      { label: 'Surcharge', value: this.money(c.surchargeOutstanding) },
      { label: 'Maintenance', value: this.money(c.maintenanceOutstanding) },
      { label: 'Utilities', value: this.money(c.utilityOutstanding) },
      { label: 'Other', value: this.money(c.otherOutstanding) },
      {
        label: 'Total outstanding', value: this.money(c.totalOutstanding),
        tone: c.isClear ? 'positive' : 'danger',
        hint: c.isClear ? 'nothing owed' : 'must be settled before transfer', wide: true,
      },
      { label: 'Issued by', value: c.issuedByName },
    ];
  });

  readonly parties = computed<MiniRow[]>(() =>
    (this.data()?.parties ?? []).map(p => ({
      id: p.id ?? p.partyId,
      title: p.name,
      sub: [p.side, p.identityNumber, p.phone].filter(Boolean).join(' · ') || null,
      value: p.sharePercent !== undefined ? p.sharePercent.toFixed(2) + '%' : null,
      tone: p.identityVerified ? 'good' : 'warn',
      icon: p.identityVerified ? 'verified_user' : 'person',
    })));

  readonly feeLines = computed<MiniRow[]>(() =>
    (this.data()?.feeLines ?? []).map(f => ({
      id: f.id,
      title: f.label,
      sub: f.payableBy ? 'payable by the ' + f.payableBy.toLowerCase() : null,
      value: this.money(f.amount),
      valueSub: f.isWaived ? 'waived' : f.isPaid ? 'paid' : 'unpaid',
      tone: f.isWaived ? 'neutral' : f.isPaid ? 'good' : 'warn',
      icon: 'payments',
    })));

  readonly sessionFacts = computed<Fact[]>(() => {
    const s = this.data()?.session;
    if (!s) return [];

    return [
      { label: 'Scheduled', value: new Date(s.scheduledAt).toLocaleString() },
      { label: 'Venue', value: s.venue },
      { label: 'Conducted by', value: s.conductedByName },
      {
        label: 'Transferor present', value: s.transferorPresent ? 'Yes' : 'No',
        tone: s.transferorPresent ? 'positive' : 'danger',
      },
      {
        label: 'Transferee present', value: s.transfereePresent ? 'Yes' : 'No',
        tone: s.transfereePresent ? 'positive' : 'danger',
      },
      {
        label: 'Identities checked', value: s.identitiesVerified ? 'Yes' : 'No',
        tone: s.identitiesVerified ? 'positive' : 'danger',
      },
      { label: 'Deed number', value: s.deedNumber },
      { label: 'Started', value: s.startedAt ? new Date(s.startedAt).toLocaleString() : null },
      { label: 'Completed', value: s.completedAt ? new Date(s.completedAt).toLocaleString() : null },
      { label: 'Aborted because', value: s.abortReason, tone: 'danger', wide: true },
    ];
  });

  readonly witnesses = computed<MiniRow[]>(() =>
    (this.data()?.session?.witnesses ?? []).map(w => ({
      id: w.id ?? w.name,
      title: w.name,
      sub: [w.identityNumber, w.phone].filter(Boolean).join(' · ') || null,
      meta: w.address ?? null,
      icon: 'how_to_reg',
    })));

  readonly chainRows = computed<MiniRow[]>(() =>
    [...this.chain()]
      .sort((a, b) => a.sequenceNumber - b.sequenceNumber)
      .map(c => ({
        id: c.id,
        title: c.ownerName + (c.isCurrent ? ' (current)' : ''),
        sub: [c.fatherOrGuardianName, c.identityNumber, c.documentReference]
          .filter(Boolean).join(' · ') || null,
        meta: new Date(c.fromDate).toLocaleDateString()
          + ' — ' + (c.toDate ? new Date(c.toDate).toLocaleDateString() : 'present')
          + (c.heldForDays ? ' · held ' + c.heldForDays + ' days' : ''),
        value: c.consideration ? this.money(c.consideration) : null,
        valueSub: c.sharePercent < 100 ? c.sharePercent.toFixed(2) + '% share' : null,
        tone: c.isCurrent ? 'good' : 'neutral',
        icon: 'person',
      })));

  async ngOnInit(): Promise<void> {
    await this.ctx.ensureLoaded();
    await this.load();
  }

  async load(): Promise<void> {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.notFound.set(true);
      this.loading.set(false);
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    const res = await firstValueFrom(this.exit.getTransfer(id)).catch(() => null);

    if (res?.data) {
      this.data.set(res.data);

      const chain = await firstValueFrom(
        this.exit.getOwnershipChain(res.data.unitId, res.data.propertyId, res.data.plotFileId),
      ).catch(() => null);

      this.chain.set(chain?.data ?? []);
    } else {
      this.notFound.set(true);
    }

    this.loading.set(false);
  }

  act(key: string): void {
    const d = this.data();
    if (!d) return;

    switch (key) {
      case 'complete':
        this.completing.set(true);
        break;
      case 'fees':
        void this.recomputeFees();
        break;
      case 'reject':
        void this.reject();
        break;
      case 'booking':
        if (d.bookingId) void this.router.navigate(['/realestate/bookings', d.bookingId]);
        break;
    }
  }

  async complete(): Promise<void> {
    const d = this.data();
    if (!d) return;

    this.working.set(true);
    const res = await firstValueFrom(this.exit.completeTransfer(d.id)).catch(() => null);
    this.working.set(false);
    this.completing.set(false);

    if (res?.data) {
      this.toast.set('Transferred. The ownership chain now has a new entry, and the old one is '
        + 'closed rather than deleted.');
      await this.load();
    } else {
      this.toast.set('The transfer did not complete. Ownership has not changed.');
    }
  }

  private async recomputeFees(): Promise<void> {
    const d = this.data();
    if (!d) return;

    const res = await firstValueFrom(this.exit.computeFees(d.id)).catch(() => null);

    if (res?.data) {
      this.data.set(res.data);
      this.toast.set('Fees recomputed from the current schedule.');
    } else {
      this.toast.set('Fees could not be recomputed.');
    }
  }

  private async reject(): Promise<void> {
    const d = this.data();
    if (!d) return;

    const res = await firstValueFrom(this.exit.rejectTransfer(d.id)).catch(() => null);

    if (res?.data) {
      this.data.set(res.data);
      this.toast.set('Rejected. Nothing has changed hands.');
    } else {
      this.toast.set('That could not be rejected.');
    }
  }

  private statusTone(s: TransferStatus): DetailPill['tone'] {
    if (s === TransferStatus.Completed) return 'positive';
    if (s === TransferStatus.Rejected || s === TransferStatus.Cancelled) return 'danger';
    return 'warning';
  }

  money(v: number | undefined | null): string {
    if (v === undefined || v === null) return '—';
    const c = this.data()?.currencyCode ?? this.ctx.currency();
    return c + ' ' + v.toLocaleString(undefined, { maximumFractionDigits: 0 });
  }
}
