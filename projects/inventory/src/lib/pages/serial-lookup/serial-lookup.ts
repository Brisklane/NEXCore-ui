import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ItemSerialService } from '../../services/item-serial.service';
import { SerialLookupResultDto } from '../../models/item-serial.model';

/** Serial status → semantic pill class + human label (single mapping reused across the module). */
export const SERIAL_STATUS_META: Record<string, { pill: string; label: string }> = {
  InStock:     { pill: 'pill-instock2',  label: 'In stock' },
  Reserved:    { pill: 'pill-reserved',  label: 'Reserved' },
  Sold:        { pill: 'pill-sold',      label: 'Sold' },
  Returned:    { pill: 'pill-returned',  label: 'Returned' },
  InTransit:   { pill: 'pill-intransit', label: 'In transit' },
  Defective:   { pill: 'pill-defective', label: 'Defective' },
  UnderRepair: { pill: 'pill-repair',    label: 'Under repair' },
  Scrapped:    { pill: 'pill-scrapped',  label: 'Scrapped' },
  Lost:        { pill: 'pill-lost',      label: 'Lost' },
};

@Component({
  selector: 'lib-serial-lookup',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './serial-lookup.html',
  styleUrl: './serial-lookup.css',
})
export class SerialLookupPage {
  query = '';
  loading = false;
  searched = false;
  error = '';
  result: SerialLookupResultDto | null = null;

  constructor(private serials: ItemSerialService, private cdr: ChangeDetectorRef) {}

  search(): void {
    const value = this.query.trim();
    if (!value) return;
    this.loading = true;
    this.searched = true;
    this.error = '';
    this.result = null;
    this.serials.lookup(value).subscribe({
      next: (res) => { this.result = res.data ?? null; this.loading = false; this.cdr.detectChanges(); },
      error: () => { this.error = 'Lookup failed. Please try again.'; this.loading = false; this.cdr.detectChanges(); },
    });
  }

  clear(): void {
    this.query = '';
    this.result = null;
    this.searched = false;
    this.error = '';
  }

  statusPill(status: string | null): string {
    return SERIAL_STATUS_META[status ?? '']?.pill ?? 'pill-muted';
  }
  statusLabel(status: string | null): string {
    return SERIAL_STATUS_META[status ?? '']?.label ?? (status ?? '—');
  }

  /** Warranty freshness for the fact tile: 'none' | 'active' | 'soon' | 'expired'. */
  warrantyState(end: string | null): 'none' | 'active' | 'soon' | 'expired' {
    if (!end) return 'none';
    const days = Math.floor((new Date(end).getTime() - Date.now()) / 86400000);
    if (days < 0) return 'expired';
    if (days <= 30) return 'soon';
    return 'active';
  }

  eventIcon(eventType: string): string {
    switch (eventType) {
      case 'Received': return 'input';
      case 'Sold': return 'sell';
      case 'Returned': return 'keyboard_return';
      case 'Transferred': return 'swap_horiz';
      case 'Scrapped': return 'delete_forever';
      default: return 'history';
    }
  }
}
