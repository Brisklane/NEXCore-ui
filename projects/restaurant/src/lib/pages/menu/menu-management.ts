import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { KitchenService, MenuService } from '../../services/restaurant.services';
import {
  AvailabilityDto, ComboMealDto, KitchenStationDto, MenuCardDto, MenuCategoryDto, MenuItemDto,
  ModifierGroupDto, SaveMenuItemDto,
} from '../../models/restaurant.models';
import {
  COURSE_LABELS, CourseType, DAYPART_LABELS, MenuDaypart, ModifierSelectionMode, SPICE_LABELS,
  SpiceLevel, enumOptions,
} from '../../models/restaurant.enums';
import { OutletPickerComponent } from '../shared/outlet-picker';
import { PageHelpComponent } from '../shared/page-help';
import {
  FieldErrorComponent, FieldErrors, between, digits, email, greaterThanField, inFuture,
  maxLength, minLength, notNegative, positive, required, summarise, validate,
} from '../shared/validation';

type Tab = 'items' | 'menus' | 'modifiers' | 'combos' | 'availability';

/**
 * Menu maintenance in one place: menus, categories, dishes, modifier groups, combos and the
 * 86 list.
 *
 * Kept as one screen with tabs rather than six sidebar entries because they are edited together
 * — adding a dish means picking its category and its modifier groups, and bouncing between three
 * pages to do it is how menus end up half-configured.
 */
@Component({
  standalone: true,
  selector: 'lib-restaurant-menu',
  imports: [CommonModule, FormsModule, OutletPickerComponent, PageHelpComponent, FieldErrorComponent],
  templateUrl: './menu-management.html',
  styleUrls: ['../restaurant-shared.css', './menu-management.css'],
})
export class MenuManagementComponent {
  private menu = inject(MenuService);
  private kitchen = inject(KitchenService);
  private route = inject(ActivatedRoute);
  private cdr = inject(ChangeDetectorRef);

  tab: Tab = 'items';
  outletId: string | null = null;

  menus: MenuCardDto[] = [];
  categories: MenuCategoryDto[] = [];
  items: MenuItemDto[] = [];
  groups: ModifierGroupDto[] = [];
  combos: ComboMealDto[] = [];
  unavailable: AvailabilityDto[] = [];
  stations: KitchenStationDto[] = [];

  filterMenuId = '';
  filterCategoryId = '';
  search = '';

  loading = true;
  busy = false;
  error = '';

  /** Per-field messages for whichever dialog is open. Rebuilt on every save attempt. */
  fieldErrors: FieldErrors = {};
  notice = '';

  // Item editor
  editing: SaveMenuItemDto | null = null;
  editingId: string | null = null;

  // Category editor
  editingCategory: MenuCategoryDto | null = null;

  // Menu editor
  editingMenu: MenuCardDto | null = null;

  // 86 dialog
  eightySixItem: MenuItemDto | null = null;
  eightySixReason = '';

  readonly courseOptions = enumOptions(COURSE_LABELS);
  readonly spiceOptions = enumOptions(SPICE_LABELS);
  readonly daypartOptions = enumOptions(DAYPART_LABELS);
  readonly courseLabels = COURSE_LABELS;
  readonly ModifierSelectionMode = ModifierSelectionMode;

  async onOutlet(id: string | null): Promise<void> {
    this.outletId = id;

    const tabParam = this.route.snapshot.data['tab'] as Tab | undefined;
    if (tabParam) this.tab = tabParam;

    await this.loadAll();
  }

  async loadAll(): Promise<void> {
    this.loading = true;

    const [menus, categories, groups, combos, stations] = await Promise.all([
      firstValueFrom(this.menu.getMenus(this.outletId ?? undefined)).catch(() => null),
      firstValueFrom(this.menu.getCategories()).catch(() => null),
      firstValueFrom(this.menu.getModifierGroups()).catch(() => null),
      firstValueFrom(this.menu.getCombos(this.outletId ?? undefined)).catch(() => null),
      this.outletId
        ? firstValueFrom(this.kitchen.getStations(this.outletId)).catch(() => null)
        : Promise.resolve(null),
    ]);

    this.menus = menus?.data ?? [];
    this.categories = categories?.data ?? [];
    this.groups = groups?.data ?? [];
    this.combos = combos?.data ?? [];
    this.stations = stations?.data ?? [];

    await this.loadItems();
    await this.load86();

    this.loading = false;
    this.cdr.detectChanges();
  }

  async loadItems(): Promise<void> {
    const res = await firstValueFrom(this.menu.getItems({
      menuId: this.filterMenuId || undefined,
      categoryId: this.filterCategoryId || undefined,
      search: this.search || undefined,
      size: 200,
    })).catch(() => null);

    this.items = res?.data ?? [];
    this.cdr.detectChanges();
  }

  async load86(): Promise<void> {
    if (!this.outletId) return;
    const res = await firstValueFrom(this.menu.get86List(this.outletId, true)).catch(() => null);
    this.unavailable = res?.data ?? [];
  }

  categoriesForMenu(menuId: string): MenuCategoryDto[] {
    return this.categories.filter(c => c.menuId === menuId);
  }

  categoryName(id: string): string {
    return this.categories.find(c => c.id === id)?.name ?? '';
  }

  // ── Item editing ───────────────────────────────────────────────────

  newItem(): void {
    this.fieldErrors = {};
    this.editingId = null;
    this.editing = {
      code: null,
      categoryId: this.filterCategoryId || this.categories[0]?.id || '',
      name: '',
      shortName: null,
      imageUrl: null,
      description: null,
      displayOrder: this.items.length,
      basePrice: 0,
      standardCost: 0,
      taxGroupId: null,
      taxPercent: 0,
      inventoryItemId: null,
      stationId: null,
      defaultCourse: CourseType.Main,
      prepTimeMinutes: 10,
      isVegetarian: false,
      isVegan: false,
      isHalal: false,
      isGlutenFree: false,
      containsNuts: false,
      containsDairy: false,
      containsShellfish: false,
      spiceLevel: SpiceLevel.None,
      calories: null,
      allergens: null,
      isAlcohol: false,
      isSoldByWeight: false,
      isOpenPrice: false,
      isFeatured: false,
      isActive: true,
      kitchenNote: null,
      barcode: null,
      variants: [],
      prices: [],
      modifierGroupIds: [],
    };
    this.error = '';
  }

  async editItem(item: MenuItemDto): Promise<void> {
    this.fieldErrors = {};
    const res = await firstValueFrom(this.menu.getItem(item.id)).catch(() => null);
    const full = res?.data ?? item;

    this.editingId = full.id;
    this.editing = {
      code: full.code ?? null,
      categoryId: full.categoryId,
      name: full.name,
      shortName: full.shortName ?? null,
      imageUrl: full.imageUrl ?? null,
      description: full.description ?? null,
      displayOrder: full.displayOrder,
      basePrice: full.basePrice,
      standardCost: full.standardCost,
      taxGroupId: full.taxGroupId ?? null,
      taxPercent: full.taxPercent,
      inventoryItemId: full.inventoryItemId ?? null,
      stationId: full.stationId ?? null,
      defaultCourse: full.defaultCourse,
      prepTimeMinutes: full.prepTimeMinutes,
      isVegetarian: full.isVegetarian,
      isVegan: full.isVegan,
      isHalal: full.isHalal,
      isGlutenFree: full.isGlutenFree,
      containsNuts: full.containsNuts,
      containsDairy: full.containsDairy,
      containsShellfish: full.containsShellfish,
      spiceLevel: full.spiceLevel,
      calories: full.calories ?? null,
      allergens: full.allergens ?? null,
      isAlcohol: full.isAlcohol,
      isSoldByWeight: full.isSoldByWeight,
      isOpenPrice: full.isOpenPrice,
      isFeatured: full.isFeatured,
      isActive: full.isActive,
      kitchenNote: full.kitchenNote ?? null,
      barcode: full.barcode ?? null,
      variants: full.variants ?? [],
      prices: full.prices ?? [],
      modifierGroupIds: (full.modifierGroups ?? []).map(g => g.modifierGroupId),
    };

    this.error = '';
    this.cdr.detectChanges();
  }

  toggleGroupOnItem(groupId: string): void {
    if (!this.editing) return;
    const ids = this.editing.modifierGroupIds;
    this.editing.modifierGroupIds = ids.includes(groupId)
      ? ids.filter(x => x !== groupId)
      : [...ids, groupId];
  }

  addVariant(): void {
    this.fieldErrors = {};
    if (!this.editing) return;
    this.editing.variants = [...this.editing.variants, {
      id: '00000000-0000-0000-0000-000000000000',
      menuItemId: this.editingId ?? '',
      name: '',
      displayOrder: this.editing.variants.length,
      price: this.editing.basePrice,
      standardCost: this.editing.standardCost,
      isDefault: this.editing.variants.length === 0,
      barcode: null,
      inventoryItemId: null,
      isAvailable: true,
      isActive: true,
    }];
  }

  removeVariant(index: number): void {
    if (!this.editing) return;
    this.editing.variants = this.editing.variants.filter((_, i) => i !== index);
  }

  /** Food cost as a share of price — the number to watch while typing a price in. */
  get editingCostPercent(): number {
    const e = this.editing;
    if (!e || e.basePrice <= 0) return 0;
    return Math.round((e.standardCost / e.basePrice) * 1000) / 10;
  }

  async saveItem(): Promise<void> {
    if (!this.editing) return;

    this.fieldErrors = validate(this.editing as unknown as Record<string, unknown>, {
      name: [required('A dish name'), maxLength(200, 'The dish name')],
      shortName: [maxLength(60, 'The short name')],
      code: [maxLength(40, 'The code')],
      categoryId: [required('A category')],
      basePrice: [notNegative('The price')],
      standardCost: [notNegative('The cost')],
      taxPercent: [between(0, 100, 'Tax')],
      prepTimeMinutes: [notNegative('Prep time')],
      calories: [notNegative('Calories')],
    });
    if (Object.keys(this.fieldErrors).length) { this.error = summarise(this.fieldErrors); return; }

    this.busy = true;
    this.error = '';

    const call = this.editingId
      ? this.menu.updateItem(this.editingId, this.editing)
      : this.menu.createItem(this.editing);

    const res = await firstValueFrom(call).catch((e: { error?: { message?: string } }) => {
      this.error = e?.error?.message ?? 'Could not save the dish.';
      return null;
    });

    this.busy = false;

    if (res?.data) {
      this.notice = this.editingId ? 'Dish saved.' : 'Dish added.';
      this.editing = null;
      this.editingId = null;
      await this.loadItems();
    }

    this.cdr.detectChanges();
  }

  async deleteItem(item: MenuItemDto): Promise<void> {
    this.busy = true;
    const res = await firstValueFrom(this.menu.deleteItem(item.id))
      .catch((e: { error?: { message?: string } }) => {
        this.error = e?.error?.message ?? 'Could not remove the dish.';
        return null;
      });

    this.busy = false;
    if (res) { this.notice = 'Dish removed.'; await this.loadItems(); }
    this.cdr.detectChanges();
  }

  // ── Category ───────────────────────────────────────────────────────

  newCategory(): void {
    this.fieldErrors = {};
    this.editingCategory = {
      id: '',
      menuId: this.filterMenuId || this.menus[0]?.id || '',
      parentCategoryId: null,
      name: '',
      displayOrder: this.categories.length,
      colorHex: '#2b7fff',
      iconName: 'restaurant',
      imageUrl: null,
      defaultStationId: null,
      isActive: true,
      description: null,
      itemCount: 0,
    };
  }

  async saveCategory(): Promise<void> {
    const c = this.editingCategory;
    if (!c) return;

    this.fieldErrors = validate(c as unknown as Record<string, unknown>, {
      name: [required('A category name'), maxLength(120, 'The category name')],
      menuId: [required('A menu to put this category on')],
      displayOrder: [notNegative('The display order')],
    });
    if (Object.keys(this.fieldErrors).length) { this.error = summarise(this.fieldErrors); return; }

    this.busy = true;
    const payload = { ...c } as unknown as Parameters<MenuService['createCategory']>[0];

    const call = c.id ? this.menu.updateCategory(c.id, payload) : this.menu.createCategory(payload);
    const res = await firstValueFrom(call).catch((e: { error?: { message?: string } }) => {
      this.error = e?.error?.message ?? 'Could not save the category.';
      return null;
    });

    this.busy = false;
    if (res?.data) { this.notice = 'Category saved.'; this.editingCategory = null; await this.loadAll(); }
    this.cdr.detectChanges();
  }

  async deleteCategory(c: MenuCategoryDto): Promise<void> {
    this.busy = true;
    const res = await firstValueFrom(this.menu.deleteCategory(c.id))
      .catch((e: { error?: { message?: string } }) => {
        this.error = e?.error?.message ?? 'Could not remove the category.';
        return null;
      });

    this.busy = false;
    if (res) { this.notice = 'Category removed.'; await this.loadAll(); }
    this.cdr.detectChanges();
  }

  // ── Menu card ──────────────────────────────────────────────────────

  newMenu(): void {
    this.fieldErrors = {};
    this.editingMenu = {
      id: '',
      outletId: this.outletId,
      name: '',
      daypart: MenuDaypart.AllDay,
      availableFrom: null,
      availableTo: null,
      activeDays: null,
      effectiveFrom: null,
      effectiveTo: null,
      displayOrder: this.menus.length,
      isDefault: this.menus.length === 0,
      isActive: true,
      description: null,
      categoryCount: 0,
      itemCount: 0,
      isCurrentlyActive: false,
    };
  }

  async saveMenu(): Promise<void> {
    const m = this.editingMenu;
    if (!m) return;

    this.fieldErrors = validate(m as unknown as Record<string, unknown>, {
      name: [required('A menu name'), maxLength(120, 'The menu name')],
      displayOrder: [notNegative('The display order')],
    });
    if (Object.keys(this.fieldErrors).length) { this.error = summarise(this.fieldErrors); return; }

    this.busy = true;
    const payload = { ...m } as unknown as Parameters<MenuService['createMenu']>[0];

    const call = m.id ? this.menu.updateMenu(m.id, payload) : this.menu.createMenu(payload);
    const res = await firstValueFrom(call).catch((e: { error?: { message?: string } }) => {
      this.error = e?.error?.message ?? 'Could not save the menu.';
      return null;
    });

    this.busy = false;
    if (res?.data) { this.notice = 'Menu saved.'; this.editingMenu = null; await this.loadAll(); }
    this.cdr.detectChanges();
  }

  async deleteMenu(m: MenuCardDto): Promise<void> {
    this.busy = true;
    const res = await firstValueFrom(this.menu.deleteMenu(m.id))
      .catch((e: { error?: { message?: string } }) => {
        this.error = e?.error?.message ?? 'Could not remove the menu.';
        return null;
      });

    this.busy = false;
    if (res) { this.notice = 'Menu removed.'; await this.loadAll(); }
    this.cdr.detectChanges();
  }

  // ── 86 list ────────────────────────────────────────────────────────

  start86(item: MenuItemDto): void {
    this.eightySixItem = item;
    this.eightySixReason = '';
    this.error = '';
  }

  async confirm86(available: boolean): Promise<void> {
    if (!this.outletId) return;

    const item = this.eightySixItem;
    if (!item) return;

    this.busy = true;
    const res = await firstValueFrom(this.menu.set86({
      outletId: this.outletId,
      menuItemId: item.id,
      isAvailable: available,
      reason: this.eightySixReason || null,
    })).catch((e: { error?: { message?: string } }) => {
      this.error = e?.error?.message ?? 'Could not change availability.';
      return null;
    });

    this.busy = false;

    if (res?.data) {
      this.notice = available ? `${item.name} is back on.` : `${item.name} taken off the menu.`;
      this.eightySixItem = null;
      await this.loadItems();
      await this.load86();
    }

    this.cdr.detectChanges();
  }

  async putBack(row: AvailabilityDto): Promise<void> {
    if (!this.outletId) return;

    this.busy = true;
    await firstValueFrom(this.menu.set86({
      outletId: this.outletId,
      menuItemId: row.menuItemId,
      variantId: row.variantId,
      isAvailable: true,
    })).catch(() => null);

    this.busy = false;
    this.notice = `${row.menuItemName} is back on.`;
    await this.loadItems();
    await this.load86();
    this.cdr.detectChanges();
  }

  trackItem = (_: number, i: MenuItemDto) => i.id;
  trackCat = (_: number, c: MenuCategoryDto) => c.id;
  trackGroup = (_: number, g: ModifierGroupDto) => g.id;
}
