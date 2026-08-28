import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { AdminService } from '../../services/realestate.services';
import { RealEstateContextService } from '../../services/realestate-context.service';
import type * as M from '../../models/realestate.models';
import {
  ALLOCATION_ORDER_LABELS, AllocationOrder, AREA_UNIT_LABELS, AreaUnit,
} from '../../models/realestate.enums';
import { SkeletonComponent, ToastComponent } from '../shared/ui';
import { SectionComponent } from '../shared/detail-bits';

/* =====================================================================================
 * Settings.
 *
 * The four switches at the top change what the whole product looks like: turn brokerage off and
 * the deals, chains and commission screens leave the sidebar entirely. That is a large enough
 * consequence to be stated on the screen rather than discovered afterwards.
 *
 * Everything below is a rule the software will enforce on somebody's behalf later — a hold that
 * auto-releases, a discount that needs approval, a transfer blocked while money is owed. Each one
 * is written as the sentence it will produce when it fires, because a setting whose effect can
 * only be learned by tripping over it is a setting that gets configured wrongly once and left.
 * ===================================================================================== */

@Component({
  standalone: true,
  selector: 'lib-re-settings',
  imports: [
    CommonModule, FormsModule, SkeletonComponent, ToastComponent, SectionComponent,
  ],
  templateUrl: './settings.html',
  styleUrls: [
    '../realestate-shared.css', '../shared/ui.css', '../shared/detail-bits.css', './settings.css',
  ],
})
export class SettingsComponent implements OnInit {
  private admin = inject(AdminService);
  protected ctx = inject(RealEstateContextService);

  readonly model = signal<M.RealEstateSettingsDto | null>(null);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);
  readonly toast = signal<string | null>(null);
  readonly dirty = signal(false);

  readonly areaUnits = Object.entries(AREA_UNIT_LABELS)
    .map(([value, label]) => ({ value: Number(value) as AreaUnit, label }));

  readonly allocationOrders = Object.entries(ALLOCATION_ORDER_LABELS)
    .map(([value, label]) => ({ value: Number(value) as AllocationOrder, label }));

  /** At least one line has to be on, or the product has no screens at all. */
  readonly linesValid = computed(() => {
    const l = this.model()?.linesOfBusiness;
    return !!l && (l.brokerage || l.development || l.contracting || l.estateManagement);
  });

  async ngOnInit(): Promise<void> {
    const res = await firstValueFrom(this.admin.getSettings()).catch(() => null);

    if (res?.data) this.model.set(res.data);
    else this.error.set('We could not load your settings.');

    this.loading.set(false);
  }

  /** Patches one field. Signals rather than a reactive form: this is a flat object of scalars. */
  set<K extends keyof M.RealEstateSettingsDto>(key: K, value: M.RealEstateSettingsDto[K]): void {
    const current = this.model();
    if (!current) return;

    this.model.set({ ...current, [key]: value });
    this.dirty.set(true);
  }

  setLine(key: keyof M.LinesOfBusinessDto, value: boolean): void {
    const current = this.model();
    if (!current) return;

    this.model.set({
      ...current,
      linesOfBusiness: { ...current.linesOfBusiness, [key]: value },
    });
    this.dirty.set(true);
  }

  async save(): Promise<void> {
    const m = this.model();
    if (!m || !this.linesValid()) return;

    this.saving.set(true);
    this.error.set(null);

    const res = await firstValueFrom(this.admin.updateSettings(m)).catch(() => null);

    this.saving.set(false);

    if (res?.data) {
      this.model.set(res.data);
      this.dirty.set(false);
      this.toast.set('Saved. Some screens will change the next time they are opened.');

      // The sidebar and every scoped screen read these, so the cached copy has to go.
      await this.ctx.ensureLoaded(true);
    } else {
      this.error.set('That did not save. Your settings are unchanged.');
    }
  }
}
