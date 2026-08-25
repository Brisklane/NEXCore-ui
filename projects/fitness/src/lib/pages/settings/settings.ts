import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { ClubService } from '../../services/fitness.services';
import { FitnessSettingsDto } from '../../models/fitness.models';
import {
  BILLING_ANCHOR_LABELS, PRORATION_RULE_LABELS, enumOptions,
} from '../../models/fitness.enums';
import { PageHelpComponent } from '../shared/page-help';

/**
 * How the app behaves for this company.
 *
 * Grouped by the decision each setting represents rather than by the table it lives in, and every
 * one carries a sentence saying what it actually does. A settings screen full of unexplained
 * numbers is a settings screen nobody touches — which means the defaults become the product.
 */
@Component({
  standalone: true,
  selector: 'lib-fitness-settings',
  imports: [CommonModule, FormsModule, PageHelpComponent],
  templateUrl: './settings.html',
  styleUrls: ['../fitness-shared.css', './settings.css'],
})
export class SettingsComponent implements OnInit {
  private clubs = inject(ClubService);
  private cdr = inject(ChangeDetectorRef);

  settings: FitnessSettingsDto | null = null;
  loading = true;
  saving = false;
  error = '';
  notice = '';

  readonly anchorOptions = enumOptions(BILLING_ANCHOR_LABELS);
  readonly prorationOptions = enumOptions(PRORATION_RULE_LABELS);

  async ngOnInit(): Promise<void> {
    const res = await firstValueFrom(this.clubs.getSettings()).catch(() => null);

    if (!res?.data) this.error = 'Could not load settings.';
    else this.settings = res.data;

    this.loading = false;
    this.cdr.detectChanges();
  }

  async save(): Promise<void> {
    if (!this.settings) return;

    this.saving = true;
    this.error = '';

    const res = await firstValueFrom(this.clubs.saveSettings(this.settings)).catch(() => null);

    this.saving = false;

    if (res?.data) {
      this.settings = res.data;
      this.notice = 'Settings saved.';
    } else {
      this.error = 'Could not save those settings.';
    }

    this.cdr.detectChanges();
  }
}
