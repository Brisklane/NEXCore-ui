import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CurrencyService } from '../../../../services/currency.service';
import { CurrencyDto, CreateCurrencyDto, UpdateCurrencyDto } from '../../../../models/currency.model';

@Component({
  selector: 'lib-settings-currencies',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './currencies.html',
  styleUrl: './currencies.css',
})
export class SettingsCurrenciesComponent implements OnInit {
  currencies: CurrencyDto[] = [];
  loading = false;
  error = '';
  showForm = false;
  editingCurrency: CurrencyDto | null = null;

  formCurrencyCode = '';
  formCurrencyName = '';
  formSymbol = '';
  formIsActive = true;

  constructor(private service: CurrencyService, private cdr: ChangeDetectorRef) {}

  ngOnInit() { this.loadCurrencies(); }

  loadCurrencies() {
    this.loading = true;
    this.error = '';
    this.service.getAll().subscribe({
      next: (res) => { this.currencies = res.data ?? []; this.loading = false; this.cdr.detectChanges(); },
      error: () => { this.error = 'Failed to load currencies'; this.loading = false; this.cdr.detectChanges(); },
    });
  }

  openCreateForm() { this.editingCurrency = null; this.resetForm(); this.showForm = true; }

  openEditForm(c: CurrencyDto) {
    this.editingCurrency = c;
    this.formCurrencyCode = c.currencyCode ?? '';
    this.formCurrencyName = c.currencyName ?? '';
    this.formSymbol = c.symbol ?? '';
    this.formIsActive = c.isActive;
    this.showForm = true;
  }

  resetForm() {
    this.formCurrencyCode = '';
    this.formCurrencyName = '';
    this.formSymbol = '';
    this.formIsActive = true;
  }

  cancelForm() { this.showForm = false; this.editingCurrency = null; this.resetForm(); }

  saveCurrency() {
    if (!this.formCurrencyCode.trim() || !this.formCurrencyName.trim()) {
      this.error = 'Currency Code and Name are required';
      this.cdr.detectChanges();
      return;
    }
    this.error = '';
    if (this.editingCurrency) {
      const dto: UpdateCurrencyDto = {
        currencyName: this.formCurrencyName,
        symbol: this.formSymbol || undefined,
        isActive: this.formIsActive,
      };
      this.service.update(this.editingCurrency.id, dto).subscribe({
        next: () => { this.showForm = false; this.loadCurrencies(); },
        error: () => { this.error = 'Failed to update currency'; this.cdr.detectChanges(); },
      });
    } else {
      const dto: CreateCurrencyDto = {
        currencyCode: this.formCurrencyCode,
        currencyName: this.formCurrencyName,
        symbol: this.formSymbol || undefined,
      };
      this.service.create(dto).subscribe({
        next: () => { this.showForm = false; this.loadCurrencies(); },
        error: () => { this.error = 'Failed to create currency'; this.cdr.detectChanges(); },
      });
    }
  }

  deleteCurrency(c: CurrencyDto) {
    if (confirm(`Delete currency "${c.currencyName ?? c.currencyCode}"?`)) {
      this.service.delete(c.id).subscribe({
        next: () => this.loadCurrencies(),
        error: () => { this.error = 'Failed to delete currency'; this.cdr.detectChanges(); },
      });
    }
  }
}
