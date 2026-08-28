import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ListingService } from '../../services/realestate.services';
import { RealEstateContextService } from '../../services/realestate-context.service';
import type * as M from '../../models/realestate.models';
import {
  AGENCY_BASIS_LABELS, FEE_BASIS_LABELS, FUNDING_KIND_LABELS, LISTING_KIND_LABELS,
  LISTING_STATUS_LABELS, ListingStatus, OFFER_STATUS_LABELS, PORTAL_PUBLISH_STATE_LABELS,
  PortalPublishState, RENT_FREQUENCY_LABELS, VIEWING_STATUS_LABELS,
} from '../../models/realestate.enums';
import {
  DetailPageComponent, type DetailAction, type DetailFigure, type DetailPill, type DetailTab,
} from '../shared/detail-page';
import {
  FactsComponent, MiniListComponent, SectionComponent, type Fact, type MiniRow,
} from '../shared/detail-bits';
import {
  DrawerComponent, GateComponent, PillComponent, ToastComponent, type GateCondition,
} from '../shared/ui';

/* =====================================================================================
 * A listing.
 *
 * A property offered to the market at a price, on an instruction, through some set of portals.
 *
 * Two numbers govern it. Days on market, which is the honest measure of whether the price is
 * right; and days since the last viewing at the current price, which is the earlier signal — a
 * listing that has stopped attracting viewings has been priced wrong for a fortnight before the
 * days-on-market figure starts to look bad.
 *
 * Publishing is gated. Portals reject listings with missing media or an absent energy rating, and
 * a rejected push is discovered days later by nobody. So the checklist is enforced first.
 * ===================================================================================== */

@Component({
  standalone: true,
  selector: 'lib-re-listing-detail',
  imports: [
    CommonModule, FormsModule, DetailPageComponent, SectionComponent, FactsComponent,
    MiniListComponent, GateComponent, PillComponent, DrawerComponent, ToastComponent,
  ],
  templateUrl: './listing-detail.html',
  styleUrls: [
    '../realestate-shared.css', '../shared/ui.css', '../shared/detail-bits.css',
    './listing-detail.css',
  ],
})
export class ListingDetailComponent implements OnInit {
  private listings = inject(ListingService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  protected ctx = inject(RealEstateContextService);

  readonly data = signal<M.ListingDetailDto | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly notFound = signal(false);
  readonly toast = signal<string | null>(null);
  readonly tab = signal('overview');

  readonly repricing = signal(false);
  readonly newPrice = signal<number | null>(null);
  readonly priceReason = signal('');
  readonly notifyApplicants = signal(true);
  readonly saving = signal(false);

  readonly failedPortals = computed(() =>
    (this.data()?.publications ?? []).filter(p => p.state === PortalPublishState.Failed));

  readonly blockers = computed(() =>
    (this.data()?.publishChecklist ?? []).filter(c => !c.isSatisfied && c.isMandatory));

  /** The stale signal: no viewings for a while at the price it is now. */
  readonly isStale = computed(() => {
    const d = this.data();
    return !!d && (d.daysSinceLastViewing ?? 0) > 21 && d.status === ListingStatus.Live;
  });

  readonly tabs = computed<DetailTab[]>(() => {
    const d = this.data();
    if (!d) return [];

    return [
      { key: 'overview', label: 'Overview', icon: 'info' },
      { key: 'marketing', label: 'Copy and media', icon: 'photo_library', count: d.media.length },
      { key: 'portals', label: 'Portals', icon: 'hub',
        count: this.failedPortals().length,
        tone: this.failedPortals().length ? 'danger' : 'neutral' },
      { key: 'interest', label: 'Interest', icon: 'visibility',
        count: d.viewings.length + d.offers.length },
      { key: 'price', label: 'Price history', icon: 'trending_down',
        count: d.priceHistory.length },
      { key: 'instruction', label: 'Instruction', icon: 'gavel' },
    ];
  });

  readonly pills = computed<DetailPill[]>(() => {
    const d = this.data();
    if (!d) return [];

    const pills: DetailPill[] = [
      { label: LISTING_STATUS_LABELS[d.status], tone: this.statusTone(d.status) },
      { label: LISTING_KIND_LABELS[d.kind] },
    ];

    if (d.isFeatured) pills.push({ label: 'Featured', tone: 'accent', icon: 'star' });
    if (d.isChainFree) pills.push({ label: 'Chain free', tone: 'positive' });
    if (d.tenantInSitu) pills.push({ label: 'Tenant in situ', tone: 'warning' });
    if (this.isStale()) {
      pills.push({ label: 'No viewings for ' + d.daysSinceLastViewing + ' days', tone: 'danger' });
    }
    if (this.failedPortals().length) {
      pills.push({ label: 'Portal push failing', tone: 'danger', icon: 'sync_problem' });
    }

    return pills;
  });

  readonly figures = computed<DetailFigure[]>(() => {
    const d = this.data();
    if (!d) return [];

    return [
      {
        label: 'Price',
        value: d.priceOnApplication ? 'On application' : this.money(d.askingPrice),
        hint: d.rentFrequency !== undefined ? RENT_FREQUENCY_LABELS[d.rentFrequency] : null,
      },
      {
        label: 'On market', value: (d.daysOnMarket ?? 0) + ' days',
        hint: d.listedOn ? 'since ' + new Date(d.listedOn).toLocaleDateString() : null,
      },
      {
        label: 'Interest', value: d.enquiryCount + ' enquiries',
        hint: d.viewingCount + ' viewings, ' + d.offerCount + ' offers',
      },
      {
        label: 'Published', value: d.publishedPortalCount + ' portals',
        hint: d.failedPortalCount ? d.failedPortalCount + ' failing' : 'all healthy',
      },
    ];
  });

  readonly actions = computed<DetailAction[]>(() => {
    const d = this.data();
    if (!d) return [];

    return [
      {
        key: 'publish', label: 'Publish', icon: 'publish', tone: 'primary',
        disabled: !d.canPublish,
        reason: !d.canPublish
          ? 'Something on the publish checklist is not satisfied. Portals would reject it.' : null,
      },
      { key: 'reprice', label: 'Change price', icon: 'trending_down' },
      { key: 'property', label: 'The property', icon: 'home_work' },
    ];
  });

  readonly publishGate = computed<GateCondition[]>(() =>
    (this.data()?.publishChecklist ?? []).map(c => ({
      label: c.label,
      satisfied: c.isSatisfied,
      mandatory: c.isMandatory,
      reason: c.note ?? null,
      route: c.url ?? null,
      canOverride: false,
    })));

  // ── Tab contents ──────────────────────────────────────────────────

  readonly summary = computed<Fact[]>(() => {
    const d = this.data();
    if (!d) return [];

    return [
      { label: 'Reference', value: d.reference },
      { label: 'Property', value: d.propertyReference },
      { label: 'Address', value: d.addressOneLine, wide: true },
      { label: 'Kind', value: LISTING_KIND_LABELS[d.kind] },
      { label: 'Area', value: d.area?.displayText },
      { label: 'Bedrooms', value: d.bedrooms },
      { label: 'Bathrooms', value: d.bathrooms },
      { label: 'Agent', value: d.listingAgentName },
      {
        label: 'Basis',
        value: d.agencyBasis !== undefined ? AGENCY_BASIS_LABELS[d.agencyBasis] : null,
      },
      {
        label: 'Listed', value: d.listedOn ? new Date(d.listedOn).toLocaleDateString() : null,
      },
      {
        label: 'Expires', value: d.expiresOn ? new Date(d.expiresOn).toLocaleDateString() : null,
      },
      {
        label: 'Available from',
        value: d.availableFrom ? new Date(d.availableFrom).toLocaleDateString() : null,
      },
      { label: 'Vacant possession', value: d.vacantPossession ? 'Yes' : 'No' },
      {
        label: 'Notice required',
        value: d.noticeRequiredDays ? d.noticeRequiredDays + ' days' : null,
      },
      { label: 'Energy rating', value: d.energyRating },
      { label: 'Council tax band', value: d.councilTaxBand },
      { label: 'Service charge', value: this.money(d.serviceChargeAmount) },
      { label: 'Permit number', value: d.regulatoryPermitNumber },
    ];
  });

  readonly publications = computed<MiniRow[]>(() =>
    (this.data()?.publications ?? []).map(p => ({
      id: p.id,
      title: p.portalName,
      sub: p.lastError ?? p.portalUrl ?? null,
      meta: PORTAL_PUBLISH_STATE_LABELS[p.state]
        + (p.lastPushedAt ? ', pushed ' + new Date(p.lastPushedAt).toLocaleString() : '')
        + (p.failureCount ? ' · ' + p.failureCount + ' failures' : ''),
      value: p.leads ? p.leads + ' leads' : null,
      valueSub: p.impressions
        ? p.impressions.toLocaleString() + ' views, ' + p.clicks + ' clicks' : null,
      tone: p.state === PortalPublishState.Failed ? 'alert'
        : p.state === PortalPublishState.Published ? 'good' : 'neutral',
      icon: p.isFeatured ? 'star' : 'hub',
    })));

  readonly viewings = computed<MiniRow[]>(() =>
    (this.data()?.viewings ?? []).map(v => ({
      id: v.id,
      title: v.applicantName ?? 'Viewing',
      sub: v.agentName ? 'with ' + v.agentName : null,
      meta: new Date(v.scheduledAt).toLocaleString() + ' · ' + VIEWING_STATUS_LABELS[v.status],
      valueSub: v.feedbackReceived ? 'feedback in' : 'no feedback yet',
      tone: v.feedbackReceived ? 'good' : 'neutral',
      icon: 'visibility',
    })));

  readonly offers = computed<MiniRow[]>(() =>
    (this.data()?.offers ?? []).map(o => ({
      id: o.id,
      title: o.buyerName,
      sub: [
        FUNDING_KIND_LABELS[o.funding],
        o.proofOfFundsProvided ? 'funds proved' : 'funds not proved',
        o.isChainFree ? 'chain free' : (o.chainLength ? 'chain of ' + o.chainLength : null),
        o.isBestAndFinal ? 'best and final' : null,
      ].filter(Boolean).join(' · '),
      meta: OFFER_STATUS_LABELS[o.status]
        + ' · round ' + o.roundNumber
        + ' · ' + new Date(o.submittedAt).toLocaleDateString(),
      value: this.money(o.amount),
      valueSub: o.differencePercent !== undefined
        ? (o.differencePercent >= 0 ? '+' : '') + o.differencePercent.toFixed(1) + '% on asking'
        : null,
      tone: o.strengthScore >= 75 ? 'good' : o.strengthScore < 40 ? 'warn' : 'neutral',
      icon: 'gavel',
    })));

  readonly priceHistory = computed<MiniRow[]>(() =>
    (this.data()?.priceHistory ?? []).map(p => ({
      id: p.id,
      title: (p.fromPrice ? this.money(p.fromPrice) + ' → ' : 'Listed at ')
        + this.money(p.toPrice),
      sub: p.reason ?? p.note ?? null,
      meta: new Date(p.changedOn).toLocaleDateString()
        + (p.changedByName ? ' · ' + p.changedByName : ''),
      value: p.fromPrice ? (p.changePercent >= 0 ? '+' : '') + p.changePercent.toFixed(1) + '%' : null,
      valueSub: p.viewingsAtPreviousPrice
        ? p.viewingsAtPreviousPrice + ' viewings at the old price'
        : 'no viewings at the old price',
      tone: p.changePercent < 0 ? 'warn' : 'neutral',
      icon: p.changePercent < 0 ? 'trending_down' : 'trending_up',
    })));

  readonly instructionFacts = computed<Fact[]>(() => {
    const i = this.data()?.instruction;
    if (!i) return [];

    return [
      { label: 'Reference', value: i.reference },
      { label: 'Owner', value: i.ownerName },
      { label: 'Basis', value: AGENCY_BASIS_LABELS[i.basis] },
      { label: 'Instructed', value: new Date(i.instructedOn).toLocaleDateString() },
      {
        label: 'Expires', value: i.expiresOn ? new Date(i.expiresOn).toLocaleDateString() : null,
        hint: i.daysToExpiry !== undefined ? i.daysToExpiry + ' days left' : null,
        tone: (i.daysToExpiry ?? 999) < 30 ? 'warning' : 'neutral',
      },
      { label: 'Notice period', value: i.noticePeriodDays + ' days' },
      {
        label: 'Tail period', value: i.tailPeriodDays + ' days',
        hint: 'fee still due if the buyer we introduced completes later',
      },
      { label: 'Fee basis', value: FEE_BASIS_LABELS[i.feeBasis] },
      {
        label: 'Fee',
        value: i.feePercent ? i.feePercent.toFixed(2) + '%' : this.money(i.feeFixedAmount),
        hint: i.feeIncludesTax ? 'inclusive of tax' : 'plus tax at ' + i.taxPercent + '%',
      },
      { label: 'Minimum fee', value: this.money(i.minimumFee) },
      { label: 'Withdrawal fee', value: this.money(i.withdrawalFee) },
      { label: 'Marketing budget', value: this.money(i.marketingBudget) },
      { label: 'Estimated fee', value: this.money(i.estimatedFee), tone: 'positive' },
      { label: 'Signed', value: i.signedOn ? new Date(i.signedOn).toLocaleDateString() : 'Not signed' },
    ];
  });

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

    const res = await firstValueFrom(this.listings.get(id)).catch(() => null);

    if (res?.data) this.data.set(res.data);
    else this.notFound.set(true);

    this.loading.set(false);
  }

  act(key: string): void {
    const d = this.data();
    if (!d) return;

    if (key === 'publish') void this.publish();
    else if (key === 'reprice') {
      this.newPrice.set(d.askingPrice ?? null);
      this.priceReason.set('');
      this.repricing.set(true);
    } else if (key === 'property') {
      void this.router.navigate(['/realestate/properties', d.propertyId]);
    }
  }

  private async publish(): Promise<void> {
    const d = this.data();
    if (!d) return;

    // An empty portal list means "every portal this listing is mapped to" — the server owns
    // that mapping, and duplicating it here would drift.
    const res = await firstValueFrom(this.listings.publish({
      listingIds: [d.id],
      portalChannelIds: [],
      operation: 'publish',
      asFeatured: d.isFeatured,
    })).catch(() => null);

    if (res?.data) {
      this.toast.set('Pushed to the portals. Any that reject it will show on the Portals tab.');
      await this.load();
    } else {
      this.toast.set('The push did not go out.');
    }
  }

  async reprice(): Promise<void> {
    const d = this.data();
    const price = this.newPrice();
    if (!d || price === null) return;

    this.saving.set(true);

    const res = await firstValueFrom(this.listings.changePrice({
      listingId: d.id,
      newPrice: price,
      note: this.priceReason() || undefined,
      notifyMatchedApplicants: this.notifyApplicants(),
    })).catch(() => null);

    this.saving.set(false);

    if (res?.data) {
      this.data.set(res.data);
      this.repricing.set(false);
      this.toast.set('Price changed. Portals will pick it up on the next push.');
    } else {
      this.toast.set('The price was not changed.');
    }
  }

  private statusTone(s: ListingStatus): DetailPill['tone'] {
    if (s === ListingStatus.Live) return 'positive';
    if (s === ListingStatus.Withdrawn) return 'danger';
    if (s === ListingStatus.Draft) return 'warning';
    return 'neutral';
  }

  money(v: number | undefined | null): string {
    if (v === undefined || v === null) return '—';
    const c = this.data()?.currencyCode ?? this.ctx.currency();
    return c + ' ' + v.toLocaleString(undefined, { maximumFractionDigits: 0 });
  }
}
