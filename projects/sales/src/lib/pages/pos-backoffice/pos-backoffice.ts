import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

interface BackOfficeLink {
  label: string;
  hint: string;
  icon: string;
  route: string;
  /** Built for the shop floor rather than borrowed from an ERP module. */
  native?: boolean;
}

interface BackOfficeGroup {
  title: string;
  blurb: string;
  icon: string;
  links: BackOfficeLink[];
}

/**
 * The POS back office.
 *
 * Organised by the job a shopkeeper is doing — price something, receive a delivery, pay a
 * supplier, count the stock, close the day — rather than by which ERP module happens to
 * own the screen. Nobody standing at a till thinks "I need the Inventory module"; they
 * think "this delivery arrived".
 *
 * Links marked `native` are POS-first screens. The rest are the ERP's own screens mounted
 * under `/pos-office/*` so the POS sidebar stays put — see the route comment in
 * `app.routes.ts` for why that prefix exists.
 */
@Component({
  standalone: true,
  selector: 'lib-pos-backoffice',
  imports: [CommonModule],
  templateUrl: './pos-backoffice.html',
  styleUrls: ['./pos-backoffice.css'],
})
export class PosBackOfficeComponent {
  private router = inject(Router);

  readonly groups: BackOfficeGroup[] = [
    {
      title: 'Sell',
      blurb: 'The till and what came through it.',
      icon: 'point_of_sale',
      links: [
        { label: 'Open the till', hint: 'Start or resume a session', icon: 'point_of_sale', route: '/sales/pos', native: true },
        { label: 'Sales orders', hint: 'Orders raised at the counter', icon: 'receipt_long', route: '/pos-office/orders' },
        { label: 'Invoices', hint: 'What has been billed', icon: 'description', route: '/pos-office/invoices' },
        { label: 'Payments', hint: 'Money received', icon: 'payments', route: '/pos-office/payments' },
      ],
    },
    {
      title: 'Products & pricing',
      blurb: 'What you sell, what it costs, what it scans as.',
      icon: 'inventory_2',
      links: [
        { label: 'Catalogue', hint: 'Products, barcodes, packs, variants', icon: 'inventory_2', route: '/sales/pos-catalogue', native: true },
        { label: 'Price lists', hint: 'Channel and customer pricing', icon: 'sell', route: '/pos-office/price-lists' },
        { label: 'Promotions', hint: 'Discounts and deals', icon: 'campaign', route: '/pos-office/promotions' },
        { label: 'Store offers', hint: 'Offers for a single store', icon: 'local_activity', route: '/sales/store-offers' },
        { label: 'Categories', hint: 'How the catalogue is grouped', icon: 'category', route: '/pos-office/categories' },
        { label: 'Brands', hint: 'Manufacturer and brand list', icon: 'label', route: '/pos-office/brands' },
        { label: 'Units', hint: 'Each, box, case, kg', icon: 'straighten', route: '/pos-office/units' },
        { label: 'Tax rates', hint: 'Rates applied at the till', icon: 'percent', route: '/pos-office/tax-rates' },
        { label: 'Shelf labels', hint: 'Design and print price tags', icon: 'qr_code_2', route: '/pos-office/labels' },
        { label: 'All products', hint: 'The full item master', icon: 'list_alt', route: '/pos-office/products' },
      ],
    },
    {
      title: 'Stock',
      blurb: 'What is on the shelf, and what changed it.',
      icon: 'inventory',
      links: [
        { label: 'Stock on hand', hint: 'Live quantities per store', icon: 'inventory', route: '/sales/pos-stock', native: true },
        { label: 'Goods received', hint: 'Book in a delivery', icon: 'move_to_inbox', route: '/sales/pos-receipts', native: true },
        { label: 'Adjustments', hint: 'Write-offs, damage, corrections', icon: 'tune', route: '/pos-office/adjustments' },
        { label: 'Stock movements', hint: 'Every document that moved stock', icon: 'swap_horiz', route: '/pos-office/documents' },
        { label: 'Stock valuation', hint: 'What the shelf is worth', icon: 'account_balance_wallet', route: '/pos-office/stock-valuation' },
        { label: 'Warehouses', hint: 'Stock locations behind each store', icon: 'warehouse', route: '/pos-office/warehouses' },
        { label: 'Detailed stock list', hint: 'Full inventory view', icon: 'list_alt', route: '/pos-office/stock-on-hand' },
      ],
    },
    {
      title: 'Buying',
      blurb: 'Suppliers, orders and what you owe them.',
      icon: 'local_shipping',
      links: [
        { label: 'Suppliers', hint: 'Who you buy from', icon: 'local_shipping', route: '/pos-office/suppliers' },
        { label: 'Purchase orders', hint: 'What is on order', icon: 'shopping_cart', route: '/pos-office/purchase-orders' },
        { label: 'Purchase invoices', hint: 'Supplier bills', icon: 'request_quote', route: '/pos-office/purchase-invoices' },
        { label: 'Supplier payments', hint: 'What you have paid out', icon: 'payments', route: '/pos-office/supplier-payments' },
      ],
    },
    {
      title: 'Customers',
      blurb: 'Who buys from you.',
      icon: 'group',
      links: [
        { label: 'Customers', hint: 'Search, add, purchase history', icon: 'group', route: '/sales/pos-customers', native: true },
        { label: 'Coupons', hint: 'Codes redeemable at the till', icon: 'confirmation_number', route: '/pos-office/coupons' },
        { label: 'Deliveries', hint: 'Orders going out to customers', icon: 'local_shipping', route: '/pos-office/deliveries' },
      ],
    },
    {
      title: 'Money & day-end',
      blurb: 'Reads, drawers and how the day finished.',
      icon: 'summarize',
      links: [
        { label: 'Reports', hint: 'X/Z reads, trading, tender mix', icon: 'summarize', route: '/sales/pos-reports', native: true },
        { label: 'Cashiers & sessions', hint: 'Who traded, and their floats', icon: 'badge', route: '/sales/pos-cashiers' },
        { label: 'Terminals', hint: 'Tills registered to each store', icon: 'devices', route: '/sales/pos-terminals' },
      ],
    },
    {
      title: 'Setup',
      blurb: 'Configure once, then forget about it.',
      icon: 'settings',
      links: [
        { label: 'Stores', hint: 'Outlets, hours, default warehouse', icon: 'storefront', route: '/sales/pos-stores' },
        { label: 'POS settings', hint: 'Till behaviour and rules', icon: 'settings', route: '/sales/pos-settings' },
        { label: 'Receipt templates', hint: 'What prints after a sale', icon: 'receipt_long', route: '/sales/receipt-templates' },
        { label: 'Document sequences', hint: 'Numbering for receipts and orders', icon: 'format_list_numbered', route: '/sales/document-sequences' },
      ],
    },
  ];

  go(route: string): void {
    this.router.navigate([route]);
  }
}
