import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import {
  ClaimService, CreditService, OrderService, PartnerService, ReturnService, SecondarySalesService,
} from '../../services/distribution.services';
import {
  ChannelInventoryDto, ClaimSummaryDto, CreditSnapshotDto, OrderSummaryDto,
  PartnerDataQualityDto, PartnerDocumentDto, PartnerDto, ReturnSummaryDto,
} from '../../models/distribution.models';
import {
  CLAIM_KIND_LABELS, CLAIM_STATUS_LABELS, CLAIM_STATUS_TONE, CAPTURE_MODE_LABELS,
  ORDER_STATUS_LABELS, ORDER_STATUS_TONE, PARTNER_STATUS_LABELS, PARTNER_STATUS_TONE,
  PARTNER_TYPE_LABELS, RETURN_STATUS_LABELS, RETURN_STATUS_TONE, SERVICING_MODEL_LABELS,
} from '../../models/distribution.enums';
import { PageHelpComponent } from '../shared/page-help';
import { StatusPillComponent } from '../shared/ui-bits';
import { CollectionSheetComponent } from '../shared/collection-sheet';

type Tab = 'trade' | 'credit' | 'claims' | 'stock' | 'returns' | 'documents' | 'details';

/**
 * One partner: what they buy from you, what they sell onward, and everything outstanding between
 * you.
 *
 * The gap between primary and secondary is the number this page exists for. A distributor who
 * bought a hundred cases and declared sixty is either sitting on stock or not reporting — both
 * are worth knowing, and neither shows up on a sales report.
 */
@Component({
  standalone: true,
  selector: 'lib-partner-360',
  imports: [
    CommonModule, FormsModule, RouterLink, PageHelpComponent,
    StatusPillComponent, CollectionSheetComponent,
  ],
  templateUrl: './partner-360.html',
  styleUrls: ['../distribution-shared.css', './partner-360.css'],
})
export class Partner360Component implements OnInit {
  private partners = inject(PartnerService);
  private credit = inject(CreditService);
  private orders = inject(OrderService);
  private claimsSvc = inject(ClaimService);
  private returns = inject(ReturnService);
  private secondary = inject(SecondarySalesService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  partner: PartnerDto | null = null;
  snapshot: CreditSnapshotDto | null = null;
  recentOrders: OrderSummaryDto[] = [];
  claims: ClaimSummaryDto[] = [];
  returnRows: ReturnSummaryDto[] = [];
  documents: PartnerDocumentDto[] = [];
  channelStock: ChannelInventoryDto | null = null;
  dataQuality: PartnerDataQualityDto | null = null;

  loading = true;
  error = '';
  tab: Tab = 'trade';
  showCollection = false;

  readonly typeLabels = PARTNER_TYPE_LABELS;
  readonly statusLabels = PARTNER_STATUS_LABELS;
  readonly statusTone = PARTNER_STATUS_TONE;
  readonly modelLabels = SERVICING_MODEL_LABELS;
  readonly captureLabels = CAPTURE_MODE_LABELS;
  readonly orderStatusLabels = ORDER_STATUS_LABELS;
  readonly orderStatusTone = ORDER_STATUS_TONE;
  readonly claimStatusLabels = CLAIM_STATUS_LABELS;
  readonly claimStatusTone = CLAIM_STATUS_TONE;
  readonly claimKindLabels = CLAIM_KIND_LABELS;
  readonly returnStatusLabels = RETURN_STATUS_LABELS;
  readonly returnStatusTone = RETURN_STATUS_TONE;

  async ngOnInit(): Promise<void> {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) { this.error = 'No partner was asked for.'; this.loading = false; return; }
    await this.load(id);
  }

  async load(id?: string): Promise<void> {
    const partnerId = id ?? this.partner?.id;
    if (!partnerId) return;

    this.loading = true;
    this.cdr.detectChanges();

    const now = new Date();
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
    const periodEnd = now.toISOString().slice(0, 10);

    // Fired together because the page is worthless in pieces — a credit position without the
    // claims sitting against it invites the wrong decision.
    const [partnerRes, snapRes, ordersRes, claimsRes, returnsRes, docsRes, stockRes, qualityRes] =
      await Promise.all([
        firstValueFrom(this.partners.get(partnerId)).catch(() => null),
        firstValueFrom(this.credit.snapshot({ partnerId })).catch(() => null),
        firstValueFrom(this.orders.list({ partnerId, pageSize: 12 })).catch(() => null),
        firstValueFrom(this.claimsSvc.list({ partnerId, pageSize: 20 })).catch(() => null),
        firstValueFrom(this.returns.list({ partnerId, pageSize: 12 })).catch(() => null),
        firstValueFrom(this.partners.documents(partnerId)).catch(() => null),
        firstValueFrom(this.secondary.channelInventory({ partnerId })).catch(() => null),
        firstValueFrom(this.secondary.dataQuality(periodStart, periodEnd)).catch(() => null),
      ]);

    this.partner = partnerRes?.data ?? null;
    this.snapshot = snapRes?.data ?? null;
    this.recentOrders = ordersRes?.data ?? [];
    this.claims = claimsRes?.data ?? [];
    this.returnRows = returnsRes?.data ?? [];
    this.documents = docsRes?.data ?? [];
    this.channelStock = stockRes?.data ?? null;
    this.dataQuality = (qualityRes?.data ?? []).find(q => q.partnerId === partnerId) ?? null;

    if (!this.partner) this.error = 'Could not load this partner.';

    this.loading = false;
    this.cdr.detectChanges();
  }

  back(): void { void this.router.navigate(['/distribution/partners']); }

  onCollectionRecorded(): void {
    this.showCollection = false;
    void this.load();
  }

  async verifyDocument(doc: PartnerDocumentDto): Promise<void> {
    await firstValueFrom(this.partners.verifyDocument(doc.id, 'Verified from the partner page')).catch(() => null);
    await this.load();
  }

  get openClaimValue(): number {
    return this.claims.reduce((sum, c) => sum + (c.claimedAmount - c.approvedAmount), 0);
  }

  get creditUsedPercent(): number {
    const limit = this.snapshot?.effectiveLimit ?? 0;
    if (limit <= 0) return 0;
    return Math.min(100, Math.round(((this.snapshot?.outstandingAmount ?? 0) / limit) * 100));
  }

  /** Primary bought minus secondary declared — the number that says whether stock is stuck. */
  get sellThroughGap(): number {
    const stock = this.channelStock;
    if (!stock) return 0;
    return stock.primarySalesValue - stock.secondarySalesValue;
  }

  documentTone(doc: PartnerDocumentDto): string {
    if (!doc.isVerified) return 'warn';
    if (doc.daysToExpiry != null && doc.daysToExpiry < 0) return 'bad';
    if (doc.daysToExpiry != null && doc.daysToExpiry < 30) return 'warn';
    return 'good';
  }

  documentLabel(doc: PartnerDocumentDto): string {
    if (!doc.isVerified) return 'Not verified';
    if (doc.daysToExpiry != null && doc.daysToExpiry < 0) return 'Expired';
    if (doc.daysToExpiry != null && doc.daysToExpiry < 30) return `${doc.daysToExpiry} days left`;
    return 'Verified';
  }

  trackId = (_: number, row: { id: string }) => row.id;
}
