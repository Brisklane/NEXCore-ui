import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

type ThemeMode = 'Light' | 'Dark' | 'Midnight';
type SettingsTab = 'general' | 'appearance' | 'security' | 'notifications';

interface SettingsForm {
  timezone: string;
  dateFormat: string;
  fiscalYearStart: string;
  landingPage: string;
  theme: ThemeMode;
  sessionTimeoutMinutes: number;
  emailNotifications: boolean;
  productUpdates: boolean;
  securityAlerts: boolean;
}

const STORAGE_KEY = 'admin_settings_v1';

@Component({
  standalone: true,
  selector: 'app-admin-settings',
  imports: [CommonModule, FormsModule],
  templateUrl: './settings.html',
  styleUrls: ['./settings.css'],
})
export class AdminSettings implements OnInit {
  tabs: { key: SettingsTab; label: string; icon: string }[] = [
    { key: 'general', label: 'General', icon: 'tune' },
    { key: 'appearance', label: 'Appearance', icon: 'palette' },
    { key: 'security', label: 'Security', icon: 'shield_lock' },
    { key: 'notifications', label: 'Notifications', icon: 'notifications' },
  ];
  activeTab: SettingsTab = 'general';

  saved = false;

  /** 'rail' = two-tier icon rail (default) · 'classic' = single-column sidebar. */
  sidebarLayout: 'rail' | 'classic' = 'rail';

  form: SettingsForm = this.defaults();

  ngOnInit(): void {
    this.form = { ...this.defaults(), ...this.readStored() };
    // Appearance always reflects whatever theme is actually applied right now, even if it
    // was changed elsewhere (header dropdown) since this page was last saved.
    this.form.theme = (localStorage.getItem('ui_theme') as ThemeMode) || this.form.theme;
    this.sidebarLayout = localStorage.getItem('ui_sidebar_layout') === 'classic' ? 'classic' : 'rail';
  }

  setTab(tab: SettingsTab): void {
    this.activeTab = tab;
  }

  private defaults(): SettingsForm {
    return {
      timezone: 'UTC',
      dateFormat: 'DD/MM/YYYY',
      fiscalYearStart: 'January',
      landingPage: '/dashboard',
      theme: 'Light',
      sessionTimeoutMinutes: 30,
      emailNotifications: true,
      productUpdates: true,
      securityAlerts: true,
    };
  }

  private readStored(): Partial<SettingsForm> {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }

  selectTheme(mode: ThemeMode): void {
    this.form.theme = mode;
    localStorage.setItem('ui_theme', mode);
    document.body.classList.remove('theme-dark', 'theme-midnight');
    if (mode === 'Dark') document.body.classList.add('theme-dark');
    else if (mode === 'Midnight') document.body.classList.add('theme-midnight');
  }

  /** Switch sidebar layout — persists + notifies the shell to swap immediately. */
  selectSidebarLayout(layout: 'rail' | 'classic'): void {
    this.sidebarLayout = layout;
    localStorage.setItem('ui_sidebar_layout', layout);
    window.dispatchEvent(new Event('ui-sidebar-layout'));
  }

  save(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.form));
    this.saved = true;
    setTimeout(() => (this.saved = false), 2500);
  }
}
