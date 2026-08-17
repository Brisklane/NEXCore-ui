import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { MenuService, RecipeService } from '../../services/restaurant.services';
import {
  MenuItemDto, RecipeDto, RecipeIngredientDto, SaveRecipeDto, WastageLogDto,
} from '../../models/restaurant.models';
import { WASTAGE_REASON_LABELS, WastageReason, enumOptions } from '../../models/restaurant.enums';
import { OutletPickerComponent } from '../shared/outlet-picker';
import { PageHelpComponent } from '../shared/page-help';
import {
  FieldErrorComponent, FieldErrors, between, digits, email, greaterThanField, inFuture,
  maxLength, minLength, notNegative, positive, required, summarise, validate,
} from '../shared/validation';

type Tab = 'recipes' | 'wastage';

/**
 * Recipes, food cost and the wastage log.
 *
 * The cost figure on each recipe is the one number that makes menu pricing an argument about
 * facts, so the editor shows yield and waste per line explicitly: 1kg of onion is not 1kg of
 * usable onion, and a recipe that ignores that under-states cost in the direction that closes
 * restaurants.
 */
@Component({
  standalone: true,
  selector: 'lib-restaurant-recipes',
  imports: [CommonModule, FormsModule, OutletPickerComponent, PageHelpComponent, FieldErrorComponent],
  templateUrl: './recipes.html',
  styleUrls: ['../restaurant-shared.css', './recipes.css'],
})
export class RecipesComponent {
  private recipes = inject(RecipeService);
  private menu = inject(MenuService);
  private cdr = inject(ChangeDetectorRef);

  tab: Tab = 'recipes';
  outletId: string | null = null;

  list: RecipeDto[] = [];
  items: MenuItemDto[] = [];
  wastage: WastageLogDto[] = [];

  from = new Date(Date.now() - 29 * 864e5).toISOString().slice(0, 10);
  to = new Date().toISOString().slice(0, 10);

  loading = true;
  busy = false;
  error = '';

  /** Per-field messages for whichever dialog is open. Rebuilt on every save attempt. */
  fieldErrors: FieldErrors = {};
  notice = '';

  editing: SaveRecipeDto | null = null;
  editingId: string | null = null;

  logging: {
    itemName: string; quantity: number; uom: string; unitCost: number;
    reason: WastageReason; menuItemId: string; note: string;
  } | null = null;

  readonly reasonOptions = enumOptions(WASTAGE_REASON_LABELS);
  readonly reasonLabels = WASTAGE_REASON_LABELS;

  async onOutlet(id: string | null): Promise<void> {
    this.outletId = id;
    await this.loadAll();
  }

  async loadAll(): Promise<void> {
    this.loading = true;

    const [recipes, items] = await Promise.all([
      firstValueFrom(this.recipes.getAll(undefined, true)).catch(() => null),
      firstValueFrom(this.menu.getItems({ size: 200 })).catch(() => null),
    ]);

    this.list = recipes?.data ?? [];
    this.items = items?.data ?? [];

    if (this.tab === 'wastage') await this.loadWastage();

    this.loading = false;
    this.cdr.detectChanges();
  }

  async loadWastage(): Promise<void> {
    if (!this.outletId) return;

    const res = await firstValueFrom(this.recipes.getWastage(
      this.outletId,
      new Date(this.from).toISOString(),
      new Date(this.to + 'T23:59:59').toISOString(),
    )).catch(() => null);

    this.wastage = res?.data ?? [];
    this.cdr.detectChanges();
  }

  async switchTab(tab: Tab): Promise<void> {
    this.tab = tab;
    if (tab === 'wastage') await this.loadWastage();
  }

  get wastageTotal(): number {
    return this.wastage.reduce((sum, w) => sum + w.totalCost, 0);
  }

  costTone(percent: number): string {
    if (percent === 0) return 'tone-neutral';
    if (percent <= 33) return 'tone-success';
    if (percent <= 45) return 'tone-warning';
    return 'tone-danger';
  }

  // ── Recipe editor ──────────────────────────────────────────────────

  newRecipe(): void {
    this.fieldErrors = {};
    this.editingId = null;
    this.editing = {
      code: null,
      menuItemId: null,
      variantId: null,
      name: '',
      yieldQuantity: 1,
      yieldUom: 'portion',
      isSubRecipe: false,
      outputInventoryItemId: null,
      prepTimeMinutes: null,
      cookTimeMinutes: null,
      instructions: null,
      platingNotes: null,
      isActive: true,
      description: null,
      ingredients: [],
    };
    this.error = '';
  }

  async edit(r: RecipeDto): Promise<void> {
    this.fieldErrors = {};
    const res = await firstValueFrom(this.recipes.getById(r.id)).catch(() => null);
    const full = res?.data ?? r;

    this.editingId = full.id;
    this.editing = {
      code: full.code ?? null,
      menuItemId: full.menuItemId ?? null,
      variantId: full.variantId ?? null,
      name: full.name,
      yieldQuantity: full.yieldQuantity,
      yieldUom: full.yieldUom,
      isSubRecipe: full.isSubRecipe,
      outputInventoryItemId: full.outputInventoryItemId ?? null,
      prepTimeMinutes: full.prepTimeMinutes ?? null,
      cookTimeMinutes: full.cookTimeMinutes ?? null,
      instructions: full.instructions ?? null,
      platingNotes: full.platingNotes ?? null,
      isActive: full.isActive,
      description: full.description ?? null,
      ingredients: full.ingredients ?? [],
    };

    this.error = '';
    this.cdr.detectChanges();
  }

  addIngredient(): void {
    this.fieldErrors = {};
    if (!this.editing) return;
    this.editing.ingredients = [...this.editing.ingredients, {
      id: '00000000-0000-0000-0000-000000000000',
      recipeId: this.editingId ?? '',
      inventoryItemId: null,
      subRecipeId: null,
      ingredientName: '',
      quantity: 0,
      uom: 'g',
      yieldPercent: 100,
      wastePercent: 0,
      unitCost: 0,
      lineCost: 0,
      isOptional: false,
      displayOrder: this.editing.ingredients.length,
      note: null,
    }];
  }

  removeIngredient(index: number): void {
    if (!this.editing) return;
    this.editing.ingredients = this.editing.ingredients.filter((_, i) => i !== index);
  }

  /**
   * Live cost of one ingredient line. Mirrors the server's roll-up exactly: yield divides
   * (you buy more than you use), waste multiplies (you lose some of what you prepped).
   */
  lineCost(line: RecipeIngredientDto): number {
    const yieldFactor = line.yieldPercent > 0 ? line.yieldPercent / 100 : 1;
    const wasteFactor = 1 + (line.wastePercent || 0) / 100;
    return Math.round((line.quantity / yieldFactor) * wasteFactor * line.unitCost * 10000) / 10000;
  }

  get editingTotal(): number {
    if (!this.editing) return 0;
    return this.editing.ingredients.reduce((sum, l) => sum + this.lineCost(l), 0);
  }

  get editingPerPortion(): number {
    const yieldQty = this.editing?.yieldQuantity ?? 1;
    return yieldQty > 0 ? this.editingTotal / yieldQty : this.editingTotal;
  }

  async save(): Promise<void> {
    if (!this.editing) return;
    this.fieldErrors = validate(this.editing as unknown as Record<string, unknown>, {
      name: [required('A recipe name'), maxLength(200, 'The recipe name')],
      yieldQuantity: [required('A yield'), positive('The yield')],
      yieldUom: [required('A unit for the yield')],
      prepTimeMinutes: [notNegative('Prep time')],
      cookTimeMinutes: [notNegative('Cook time')],
    });
    if (Object.keys(this.fieldErrors).length) { this.error = summarise(this.fieldErrors); return; }

    this.busy = true;
    this.error = '';

    const call = this.editingId
      ? this.recipes.update(this.editingId, this.editing)
      : this.recipes.create(this.editing);

    const res = await firstValueFrom(call).catch((e: { error?: { message?: string } }) => {
      this.error = e?.error?.message ?? 'Could not save the recipe.';
      return null;
    });

    this.busy = false;

    if (res?.data) {
      this.notice = 'Recipe saved and re-costed.';
      this.editing = null;
      await this.loadAll();
    }

    this.cdr.detectChanges();
  }

  async remove(r: RecipeDto): Promise<void> {
    this.busy = true;
    const res = await firstValueFrom(this.recipes.delete(r.id))
      .catch((e: { error?: { message?: string } }) => {
        this.error = e?.error?.message ?? 'Could not remove the recipe.';
        return null;
      });

    this.busy = false;
    if (res) { this.notice = 'Recipe removed.'; await this.loadAll(); }
    this.cdr.detectChanges();
  }

  async recostAll(): Promise<void> {
    this.busy = true;
    const res = await firstValueFrom(this.recipes.recalculateAll()).catch(() => null);
    this.busy = false;
    if (res) { this.notice = `Re-costed ${res.data} recipes.`; await this.loadAll(); }
    this.cdr.detectChanges();
  }

  // ── Wastage ────────────────────────────────────────────────────────

  startLog(): void {
    this.fieldErrors = {};
    this.logging = {
      itemName: '', quantity: 1, uom: 'portion', unitCost: 0,
      reason: WastageReason.Spoilage, menuItemId: '', note: '',
    };
    this.error = '';
  }

  onWastageItem(): void {
    const l = this.logging;
    if (!l?.menuItemId) return;

    const item = this.items.find(i => i.id === l.menuItemId);
    if (item) { l.itemName = item.name; l.unitCost = item.standardCost; }
  }

  async saveLog(): Promise<void> {
    const l = this.logging;
    if (!l || !this.outletId) return;
    this.fieldErrors = validate(l as unknown as Record<string, unknown>, {
      itemName: [required('What was wasted'), maxLength(200, 'The item name')],
      quantity: [required('A quantity'), positive('The quantity')],
      unitCost: [notNegative('The unit cost')],
    });
    if (Object.keys(this.fieldErrors).length) { this.error = summarise(this.fieldErrors); return; }

    this.busy = true;
    const res = await firstValueFrom(this.recipes.logWastage({
      outletId: this.outletId,
      reason: l.reason,
      menuItemId: l.menuItemId || null,
      itemName: l.itemName,
      quantity: l.quantity,
      uom: l.uom,
      unitCost: l.unitCost,
      note: l.note || null,
    })).catch((e: { error?: { message?: string } }) => {
      this.error = e?.error?.message ?? 'Could not record that.';
      return null;
    });

    this.busy = false;

    if (res?.data) {
      this.notice = 'Wastage recorded.';
      this.logging = null;
      await this.loadWastage();
    }

    this.cdr.detectChanges();
  }

  trackRecipe = (_: number, r: RecipeDto) => r.id;
  trackWaste = (_: number, w: WastageLogDto) => w.id;
}
