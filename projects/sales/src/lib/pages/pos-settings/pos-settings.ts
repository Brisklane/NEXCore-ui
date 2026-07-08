import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PosSettingsService } from '../../services/pos-settings.service';
import { PosReceiptTemplatesComponent } from '../pos-receipt-templates/pos-receipt-templates';
import { DocumentSequencesComponent } from '../document-sequences/document-sequences';
import { PosSettingsDto, UpdatePosSettingsDto, PaperSize } from '../../models/pos-settings.model';
import { LedgerAccountService, LedgerAccountDto } from '@nexcore/accounting';
import { CurrencyService } from '../../services/currency.service';
import { GeoCurrencyDto } from '../../models/currency.model';

type Tab =
  | 'general'
  | 'payments'
  | 'display'
  | 'session'
  | 'promotions'
  | 'receipt'
  | 'appearance'
  | 'templates'
  | 'sequences';

@Component({
  selector: 'lib-pos-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, PosReceiptTemplatesComponent, DocumentSequencesComponent],
  templateUrl: './pos-settings.html',
  styleUrl: './pos-settings.css',
})
export class PosSettingsComponent implements OnInit {
  activeTab: Tab = 'general';
  loading = false;
  saving = false;
  error = '';
  successMsg = '';

  settings: PosSettingsDto | null = null;
  form: UpdatePosSettingsDto = {};
  glAccounts: LedgerAccountDto[] = [];
  currencies: GeoCurrencyDto[] = [];

  readonly paperSizes: PaperSize[] = ['Thermal58mm', 'Thermal80mm', 'A4'];

  readonly tabs: { key: Tab; label: string; icon: string }[] = [
    { key: 'general',    label: 'General',           icon: 'tune' },
    { key: 'payments',   label: 'Payments',          icon: 'payments' },
    { key: 'display',    label: 'Display',           icon: 'grid_view' },
    { key: 'session',    label: 'Session',           icon: 'schedule' },
    { key: 'promotions', label: 'Promotions',        icon: 'local_offer' },
    { key: 'receipt',    label: 'Receipt',           icon: 'receipt_long' },
    { key: 'appearance', label: 'Appearance',        icon: 'palette' },
    { key: 'templates',  label: 'Templates',         icon: 'description' },
    { key: 'sequences',  label: 'Doc Sequences',     icon: 'format_list_numbered' },
  ];

  private readonly configTabs: Tab[] = [
    'general', 'payments', 'display', 'session', 'promotions', 'receipt', 'appearance',
  ];

  get isConfigTab(): boolean {
    return this.configTabs.includes(this.activeTab);
  }

  constructor(
    private svc: PosSettingsService,
    private ledgerAccountSvc: LedgerAccountService,
    private currencySvc: CurrencyService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.load();
    this.loadGlAccounts();
    this.loadCurrencies();
  }

  private loadCurrencies() {
    this.currencySvc.getGeoCurrencies().subscribe({
      next: (res) => {
        this.currencies = (res.data ?? []).filter(c => c.isActive);
        if (!this.form.defaultCurrencyCode) {
          this.form.defaultCurrencyCode = 'PKR';
        }
        this.cdr.detectChanges();
      },
      error: () => { /* dropdown stays empty */ },
    });
  }

  private loadGlAccounts() {
    this.ledgerAccountSvc.getAll({ pageNumber: 1, pageSize: 500 }).subscribe({
      next: (res) => { this.glAccounts = res.data ?? []; this.cdr.detectChanges(); },
      error: () => { /* silently ignore — dropdown will be empty */ },
    });
  }

  load() {
    this.loading = true;
    this.error = '';
    this.svc.getSettings().subscribe({
      next: (res) => {
        this.settings = res.data ?? null;
        this.rebuildForm();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'Failed to load POS settings.';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  private rebuildForm() {
    if (!this.settings) { this.form = {}; return; }
    this.form = { ...this.settings } as UpdatePosSettingsDto;
    if (!this.form.defaultCurrencyCode) this.form.defaultCurrencyCode = 'PKR';
  }

  setTab(tab: Tab) {
    this.activeTab = tab;
    this.successMsg = '';
  }

  save() {
    this.saving = true;
    this.error = '';
    this.successMsg = '';
    this.svc.updateSettings(this.form).subscribe({
      next: (res) => {
        this.settings = res.data ?? null;
        this.rebuildForm();
        this.successMsg = 'Settings saved successfully.';
        this.saving = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = this.apiError(err) || 'Failed to save settings.';
        this.saving = false;
        this.cdr.detectChanges();
      },
    });
  }

  resetToDefaults() {
    if (!confirm('Reset all POS settings to factory defaults? This cannot be undone.')) return;
    this.saving = true;
    this.error = '';
    this.successMsg = '';
    this.svc.resetSettings().subscribe({
      next: (res) => {
        this.settings = res.data ?? null;
        this.rebuildForm();
        this.successMsg = 'Settings reset to factory defaults.';
        this.saving = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'Failed to reset settings.';
        this.saving = false;
        this.cdr.detectChanges();
      },
    });
  }

  private apiError(err: any): string {
    const body = err?.error;
    return body?.message ?? body?.errors?.[0] ?? '';
  }
}
