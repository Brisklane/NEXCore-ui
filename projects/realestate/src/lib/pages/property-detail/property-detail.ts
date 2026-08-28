import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { PropertyService } from '../../services/realestate.services';
import { RealEstateContextService } from '../../services/realestate-context.service';
import type * as M from '../../models/realestate.models';
import {
  COMPLIANCE_CERTIFICATE_KIND_LABELS, ENCUMBRANCE_KIND_LABELS, ENCUMBRANCE_STATUS_LABELS,
  EncumbranceStatus, FACING_LABELS, LISTING_STATUS_LABELS,
  FURNISHING_STATE_LABELS, OCCUPANCY_STATE_LABELS, PROPERTY_CATEGORY_LABELS,
  PROPERTY_CONDITION_LABELS, PROPERTY_STATUS_LABELS, PROPERTY_SUB_TYPE_LABELS,
  PropertyStatus, TENURE_LABELS, TITLE_INSTRUMENT_LABELS,
} from '../../models/realestate.enums';
import {
  DetailPageComponent, type DetailAction, type DetailFigure, type DetailPill, type DetailTab,
} from '../shared/detail-page';
import {
  FactsComponent, MiniListComponent, SectionComponent, type Fact, type MiniRow,
} from '../shared/detail-bits';
import { PillComponent, TimelineComponent, ToastComponent, type TimelineItem } from '../shared/ui';

/* =====================================================================================
 * A property.
 *
 * The register entry for one physical thing — a flat, a plot, a shop, a warehouse — independent
 * of whether it is currently for sale, let, or doing nothing at all.
 *
 * The tab that matters most is Title. An encumbrance that blocks a transaction is shown at the
 * top of the screen as a badge, not buried four tabs deep, because the expensive failure in this
 * business is agreeing a sale on a property that cannot legally be sold.
 * ===================================================================================== */

@Component({
  standalone: true,
  selector: 'lib-re-property-detail',
  imports: [
    CommonModule, DetailPageComponent, SectionComponent, FactsComponent, MiniListComponent,
    TimelineComponent, PillComponent, ToastComponent,
  ],
  templateUrl: './property-detail.html',
  styleUrls: [
    '../realestate-shared.css', '../shared/ui.css', '../shared/detail-bits.css',
    './property-detail.css',
  ],
})
export class PropertyDetailComponent implements OnInit {
  private properties = inject(PropertyService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  protected ctx = inject(RealEstateContextService);

  readonly data = signal<M.PropertyDetailDto | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly notFound = signal(false);
  readonly toast = signal<string | null>(null);
  readonly tab = signal('overview');
  readonly heroIndex = signal(0);

  readonly blockingEncumbrances = computed(() =>
    (this.data()?.encumbrances ?? [])
      .filter(e => e.blocksTransaction && e.status !== EncumbranceStatus.Cleared));

  readonly tabs = computed<DetailTab[]>(() => {
    const d = this.data();
    if (!d) return [];

    return [
      { key: 'overview', label: 'Overview', icon: 'info' },
      { key: 'title', label: 'Title and owners', icon: 'gavel',
        count: this.blockingEncumbrances().length,
        tone: this.blockingEncumbrances().length ? 'danger' : 'neutral' },
      { key: 'media', label: 'Photos', icon: 'photo_library', count: d.media.length },
      { key: 'listings', label: 'Listings', icon: 'storefront', count: d.listings.length },
      { key: 'documents', label: 'Documents', icon: 'folder', count: d.documents.length },
      { key: 'compliance', label: 'Compliance', icon: 'verified',
        count: d.certificates.filter(c => c.isExpired).length,
        tone: d.certificates.some(c => c.isExpired) ? 'danger' : 'neutral' },
      { key: 'history', label: 'History', icon: 'history' },
    ];
  });

  readonly pills = computed<DetailPill[]>(() => {
    const d = this.data();
    if (!d) return [];

    const pills: DetailPill[] = [
      { label: PROPERTY_STATUS_LABELS[d.status], tone: this.statusTone(d.status) },
      { label: OCCUPANCY_STATE_LABELS[d.occupancy] },
      { label: TENURE_LABELS[d.tenure] },
    ];

    if (this.blockingEncumbrances().length) {
      pills.push({ label: 'Cannot be transacted', tone: 'danger', icon: 'block' });
    }
    if (d.hasLitigation) pills.push({ label: 'Under litigation', tone: 'danger', icon: 'gavel' });
    if (d.isMortgaged) pills.push({ label: 'Mortgaged', tone: 'warning', icon: 'account_balance' });
    if (d.isLandownerShare) pills.push({ label: 'Landowner share', tone: 'warning' });

    return pills;
  });

  readonly figures = computed<DetailFigure[]>(() => {
    const d = this.data();
    if (!d) return [];

    const figures: DetailFigure[] = [];

    if (d.askingPrice) {
      figures.push({
        label: 'Asking', value: this.money(d.askingPrice),
        hint: d.ratePerSqFt ? this.money(d.ratePerSqFt) + ' per sq ft' : null,
      });
    }
    if (d.monthlyRent) {
      figures.push({ label: 'Rent', value: this.money(d.monthlyRent), hint: 'a month' });
    }
    if (d.saleableArea) {
      figures.push({ label: 'Area', value: d.saleableArea.displayText, hint: 'saleable' });
    }
    if (d.outstandingDues > 0) {
      figures.push({ label: 'Owed', value: this.money(d.outstandingDues), hint: 'on this unit' });
    }
    if (d.openWorkOrders > 0) {
      figures.push({ label: 'Open jobs', value: String(d.openWorkOrders), hint: 'maintenance' });
    }

    return figures.slice(0, 4);
  });

  readonly actions = computed<DetailAction[]>(() => {
    const d = this.data();
    if (!d) return [];

    const blocked = this.blockingEncumbrances().length > 0;

    return [
      { key: 'list', label: 'List it', icon: 'storefront', tone: 'primary',
        disabled: blocked,
        reason: blocked ? 'An encumbrance on this property blocks any transaction.' : null },
      { key: 'edit', label: 'Edit', icon: 'edit' },
    ];
  });

  // ── Tab contents ──────────────────────────────────────────────────

  readonly identity = computed<Fact[]>(() => {
    const d = this.data();
    if (!d) return [];

    return [
      { label: 'Reference', value: d.reference },
      { label: 'Category', value: PROPERTY_CATEGORY_LABELS[d.category] },
      { label: 'Type', value: PROPERTY_SUB_TYPE_LABELS[d.subType] },
      { label: 'Tenure', value: TENURE_LABELS[d.tenure] },
      { label: 'Project', value: d.projectName },
      { label: 'Block', value: d.blockName },
      { label: 'Floor', value: d.floorLabel ?? d.floorNumber },
      { label: 'Unit', value: d.unitNumber },
      { label: 'Address', value: d.address.oneLine, wide: true },
      { label: 'Area', value: d.areaPath, wide: true },
    ];
  });

  readonly measurements = computed<Fact[]>(() => {
    const d = this.data();
    if (!d) return [];

    const area = (a?: M.AreaDto) => a?.displayText ?? null;

    return [
      { label: 'Plot', value: area(d.plotArea) },
      { label: 'Covered', value: area(d.coveredArea) },
      { label: 'Built up', value: area(d.builtUpArea) },
      { label: 'Saleable', value: area(d.saleableArea) },
      { label: 'Carpet', value: area(d.carpetArea) },
      { label: 'Terrace', value: area(d.terraceArea) },
      {
        label: 'Loading factor',
        value: d.loadingFactorPercent ? d.loadingFactorPercent.toFixed(1) + '%' : null,
        hint: d.loadingFactorPercent ? 'saleable over carpet' : null,
      },
      { label: 'Frontage', value: d.frontageFt ? d.frontageFt + ' ft' : null },
      { label: 'Depth', value: d.depthFt ? d.depthFt + ' ft' : null },
      { label: 'Road width', value: d.roadWidthFt ? d.roadWidthFt + ' ft' : null },
    ].filter(f => f.value !== null && f.value !== undefined);
  });

  readonly accommodation = computed<Fact[]>(() => {
    const d = this.data();
    if (!d) return [];

    return [
      { label: 'Bedrooms', value: d.bedrooms },
      { label: 'Bathrooms', value: d.bathrooms },
      { label: 'Half baths', value: d.halfBaths },
      { label: 'Kitchens', value: d.kitchens },
      { label: 'Living rooms', value: d.livingRooms },
      { label: 'Servant rooms', value: d.servantRooms },
      { label: 'Stores', value: d.storeRooms },
      { label: 'Parking', value: d.parkingBays },
      { label: 'Floors in unit', value: d.floorsInUnit },
      { label: 'Facing', value: d.facing !== undefined ? FACING_LABELS[d.facing] : null },
      { label: 'Corner', value: d.isCorner ? 'Yes' : 'No' },
      {
        label: 'Furnishing',
        value: d.furnishing !== undefined ? FURNISHING_STATE_LABELS[d.furnishing] : null,
      },
      {
        label: 'Condition',
        value: d.condition !== undefined ? PROPERTY_CONDITION_LABELS[d.condition] : null,
      },
      { label: 'Built', value: d.yearBuilt },
      { label: 'View', value: d.viewDescription, wide: true },
    ].filter(f => f.value !== null && f.value !== undefined && f.value !== 0);
  });

  readonly moneyFacts = computed<Fact[]>(() => {
    const d = this.data();
    if (!d) return [];

    const facts: Fact[] = [
      { label: 'Asking price', value: d.askingPrice ? this.money(d.askingPrice) : null },
      {
        label: 'Reserve', value: d.reservePrice ? this.money(d.reservePrice) : null,
        hint: 'the lowest that will be accepted', tone: 'muted',
      },
      { label: 'Rate', value: d.ratePerSqFt ? this.money(d.ratePerSqFt) + ' / sq ft' : null },
      { label: 'Monthly rent', value: d.monthlyRent ? this.money(d.monthlyRent) : null },
      {
        label: 'Last sold', value: d.lastSoldPrice ? this.money(d.lastSoldPrice) : null,
        hint: d.lastSoldOn ? new Date(d.lastSoldOn).toLocaleDateString() : null,
      },
      { label: 'Valuation', value: d.currentValuation ? this.money(d.currentValuation) : null },
      {
        label: 'Service charge',
        value: d.serviceChargeRatePerSqFt
          ? this.money(d.serviceChargeRatePerSqFt) + ' / sq ft' : null,
      },
      { label: 'Property tax', value: d.annualPropertyTax ? this.money(d.annualPropertyTax) : null },
    ];

    return facts.filter(f => f.value !== null);
  });

  readonly highlights = computed(() =>
    (this.data()?.features ?? []).filter(f => f.isHighlight));

  readonly otherFeatures = computed(() =>
    (this.data()?.features ?? []).filter(f => !f.isHighlight));

  readonly owners = computed<MiniRow[]>(() =>
    (this.data()?.owners ?? []).map(o => ({
      id: o.id,
      title: o.ownerName + (o.isPrimaryOwner ? ' (primary)' : ''),
      sub: [
        o.fatherOrGuardianName ? 'child of ' + o.fatherOrGuardianName : null,
        o.identityNumber,
        o.phone,
      ].filter(Boolean).join(' · ') || null,
      meta: o.acquiredBy !== undefined
        ? TITLE_INSTRUMENT_LABELS[o.acquiredBy] + (o.deedNumber ? ' ' + o.deedNumber : '')
        : null,
      value: o.sharePercent.toFixed(2) + '%',
      valueSub: o.fromDate ? 'since ' + new Date(o.fromDate).toLocaleDateString() : null,
      icon: 'person',
    })));

  readonly ownershipHistory = computed<MiniRow[]>(() =>
    (this.data()?.ownershipHistory ?? []).map(o => ({
      id: o.id,
      title: o.ownerName,
      sub: o.deedNumber ? 'Deed ' + o.deedNumber : null,
      meta: [
        o.fromDate ? new Date(o.fromDate).toLocaleDateString() : null,
        o.toDate ? new Date(o.toDate).toLocaleDateString() : 'to date',
      ].filter(Boolean).join(' — '),
      value: o.considerationAmount ? this.money(o.considerationAmount) : null,
      icon: 'history',
    })));

  readonly encumbrances = computed<MiniRow[]>(() =>
    (this.data()?.encumbrances ?? []).map(e => ({
      id: e.id,
      title: ENCUMBRANCE_KIND_LABELS[e.kind] + (e.holderName ? ' — ' + e.holderName : ''),
      sub: e.note ?? e.referenceNumber ?? null,
      meta: ENCUMBRANCE_STATUS_LABELS[e.status]
        + (e.expectedClearanceDate
          ? ', expected ' + new Date(e.expectedClearanceDate).toLocaleDateString() : ''),
      value: e.amount ? this.money(e.amount) : null,
      tone: e.blocksTransaction && e.status !== EncumbranceStatus.Cleared ? 'alert'
        : e.status === EncumbranceStatus.Cleared ? 'good' : 'warn',
      icon: e.blocksTransaction ? 'block' : 'info',
    })));

  readonly documents = computed<MiniRow[]>(() =>
    (this.data()?.documents ?? []).map(doc => ({
      id: doc.id,
      title: doc.title ?? doc.documentType,
      sub: doc.verifiedByName ? 'verified by ' + doc.verifiedByName : null,
      meta: doc.expiresOn
        ? (doc.isExpired ? 'expired ' : 'expires ')
          + new Date(doc.expiresOn).toLocaleDateString()
        : (doc.issuedOn ? 'issued ' + new Date(doc.issuedOn).toLocaleDateString() : null),
      tone: doc.isExpired ? 'alert' : 'neutral',
      icon: doc.isConfidential ? 'lock' : 'description',
    })));

  readonly certificates = computed<MiniRow[]>(() =>
    (this.data()?.certificates ?? []).map(c => ({
      id: c.id,
      title: COMPLIANCE_CERTIFICATE_KIND_LABELS[c.kind],
      sub: c.issuerName ?? c.certificateNumber ?? null,
      meta: c.expiresOn ? 'expires ' + new Date(c.expiresOn).toLocaleDateString() : null,
      tone: c.isExpired ? 'alert' : c.isExpiringSoon ? 'warn' : 'good',
      icon: 'verified',
    })));

  readonly listings = computed<MiniRow[]>(() =>
    (this.data()?.listings ?? []).map(l => ({
      id: l.id,
      title: l.reference,
      sub: l.headline ?? null,
      meta: LISTING_STATUS_LABELS[l.status],
      value: l.askingPrice ? this.money(l.askingPrice)
        : (l.priceOnApplication ? 'On application' : null),
      icon: 'storefront',
    })));

  readonly timeline = computed<TimelineItem[]>(() =>
    (this.data()?.timeline ?? []).map(t => ({
      id: t.id,
      occurredAt: t.occurredAt,
      kind: t.kind,
      title: t.title,
      detail: t.detail ?? null,
      icon: t.icon ?? null,
      tone: t.tone ?? null,
      actorName: t.actorName ?? null,
      amount: t.amount ?? null,
    })));

  readonly hero = computed(() => {
    const media = this.data()?.media ?? [];
    if (!media.length) return null;
    return media[Math.min(this.heroIndex(), media.length - 1)];
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

    const res = await firstValueFrom(this.properties.get(id)).catch(() => null);

    if (res?.data) this.data.set(res.data);
    else this.notFound.set(true);

    this.loading.set(false);
  }

  act(key: string): void {
    const d = this.data();
    if (!d) return;

    if (key === 'list') {
      void this.router.navigate(['/realestate/listings'], {
        queryParams: { propertyId: d.id, create: 1 },
      });
    } else if (key === 'edit') {
      void this.router.navigate(['/realestate/properties'], {
        queryParams: { edit: d.id },
      });
    }
  }

  openListing(id: string): void {
    void this.router.navigate(['/realestate/listings', id]);
  }

  private statusTone(s: PropertyStatus): DetailPill['tone'] {
    if (s === PropertyStatus.Available) return 'positive';
    if (s === PropertyStatus.Litigation || s === PropertyStatus.Blocked) return 'danger';
    if (s === PropertyStatus.Held || s === PropertyStatus.Reserved) return 'warning';
    return 'neutral';
  }

  money(v: number | undefined | null): string {
    if (v === undefined || v === null) return '—';
    const c = this.data()?.currencyCode ?? this.ctx.currency();
    return c + ' ' + v.toLocaleString(undefined, { maximumFractionDigits: 0 });
  }
}
