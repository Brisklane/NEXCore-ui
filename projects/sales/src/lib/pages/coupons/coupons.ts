import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CouponService } from '../../services/coupon.service';
import { CouponDto } from '../../models/coupon.model';
import { ContactService, ContactDto } from '@nexcore/crm';

@Component({
  selector: 'lib-coupons',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './coupons.html',
  styleUrl: './coupons.css',
})
export class CouponsComponent implements OnInit {
  coupons: CouponDto[] = [];
  loading = false;
  error = '';

  contacts: ContactDto[] = [];
  searchQuery = '';

  validateCode = '';
  validateCustomerId = '';
  validationResult: CouponDto | null = null;
  validationError = '';

  sortBy = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  sort(column: string): void {
    if (this.sortBy === column) this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    else { this.sortBy = column; this.sortDirection = 'asc'; }
    this.cdr.detectChanges();
  }

  get filteredCoupons(): CouponDto[] {
    const q = this.searchQuery.toLowerCase().trim();
    const filteredRows = !q ? this.coupons : this.coupons.filter(c =>
      (c.code ?? '').toLowerCase().includes(q) ||
      (c.description ?? '').toLowerCase().includes(q) ||
      (c.discountType ?? '').toLowerCase().includes(q)
    );
    const rows = [...filteredRows];
    if (this.sortBy) {
      const dir = this.sortDirection === 'asc' ? 1 : -1;
      rows.sort((a: any, b: any) => {
        const av = a?.[this.sortBy], bv = b?.[this.sortBy];
        if (av == null && bv == null) return 0;
        if (av == null) return 1;
        if (bv == null) return -1;
        if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * dir;
        return String(av).localeCompare(String(bv), undefined, { numeric: true }) * dir;
      });
    }
    return rows;
  }

  constructor(
    private couponService: CouponService,
    private contactService: ContactService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.load();
    this.contactService.getAll().subscribe({
      next: (res) => { this.contacts = res.data ?? []; this.cdr.detectChanges(); },
      error: () => {},
    });
  }

  load() {
    this.loading = true;
    this.error = '';
    this.couponService.getActive().subscribe({
      next: (res) => {
        this.coupons = res.data ?? [];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'Failed to load coupons.';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  validateCoupon() {
    if (!this.validateCode) return;
    this.validationResult = null;
    this.validationError = '';
    this.couponService.validate(this.validateCode, this.validateCustomerId || undefined).subscribe({
      next: (res) => {
        this.validationResult = res.data ?? null;
        this.cdr.detectChanges();
      },
      error: () => {
        this.validationError = 'Coupon is invalid or cannot be applied.';
        this.cdr.detectChanges();
      },
    });
  }

  clearValidation() {
    this.validateCode = '';
    this.validateCustomerId = '';
    this.validationResult = null;
    this.validationError = '';
  }
}
