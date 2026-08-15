import { Injectable, signal } from '@angular/core';

/**
 * The shipped appearances.
 *
 * Light + Graphite are the conservative pair — same restraint, same blue accent,
 * one light and one dark. The rest carry deliberate character.
 */
export type ThemeMode = 'Light' | 'Graphite' | 'Slate' | 'Carbon' | 'Obsidian' | 'Sepia';

export interface ThemeOption {
  /** Stored + emitted identifier. */
  id: ThemeMode;
  /** Human label shown in the header menu and Appearance settings. */
  label: string;
  /** One-line description for the settings cards. */
  description: string;
  /** Body class applied for this theme ('' for Light). */
  className: string;
  /** True for the dark appearances — lets callers pick contrasting assets. */
  dark: boolean;
  /** Two representative colours for the preview swatch: [surface, accent]. */
  swatch: [string, string];
}

const STORAGE_KEY = 'ui_theme';

/**
 * What a visitor with no saved preference gets — on the auth screens and, once
 * they are in, across the app. Change this one constant to change the product's
 * default face; anyone who has picked a theme keeps theirs.
 */
export const DEFAULT_THEME: ThemeMode = 'Graphite';

/** Older builds stored these names; map them onto the closest new theme. */
const LEGACY_ALIASES: Record<string, ThemeMode> = {
  Dark: 'Carbon',
  Midnight: 'Slate',
};

/**
 * Single source of truth for the active appearance.
 *
 * Applying a theme only swaps a class on <body> — every colour in the app
 * resolves from the design tokens defined for that class in styles.css, so no
 * component needs to know which theme is active.
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly themes: readonly ThemeOption[] = [
    {
      id: 'Light',
      label: 'Light',
      description: 'Clean white surfaces with the NexCore blue accent.',
      className: '',
      dark: false,
      swatch: ['#ffffff', '#2b7fff'],
    },
    {
      id: 'Graphite',
      label: 'Graphite',
      description: 'Neutral dark grey with the standard blue accent.',
      className: 'theme-graphite',
      dark: true,
      swatch: ['#1b1b1b', '#3b8cff'],
    },
    {
      id: 'Slate',
      label: 'Slate',
      description: 'Deep navy panels with an electric blue accent.',
      className: 'theme-slate',
      dark: true,
      swatch: ['#111c30', '#3b8cff'],
    },
    {
      id: 'Carbon',
      label: 'Carbon',
      description: 'Neutral graphite with a warm amber accent.',
      className: 'theme-carbon',
      dark: true,
      swatch: ['#141414', '#f5921e'],
    },
    {
      id: 'Obsidian',
      label: 'Obsidian',
      description: 'True black for OLED screens, violet accent.',
      className: 'theme-obsidian',
      dark: true,
      swatch: ['#0e0e12', '#8b5cf6'],
    },
    {
      id: 'Sepia',
      label: 'Sepia',
      description: 'Warm paper tones with a deep teal accent.',
      className: 'theme-sepia',
      dark: false,
      swatch: ['#faf5ea', '#0f766e'],
    },
  ];

  /** Currently applied theme. Read it anywhere; it updates on every change. */
  readonly current = signal<ThemeMode>(DEFAULT_THEME);

  /** Every class this service manages — removed before each apply. */
  private get managedClasses(): string[] {
    return [
      ...this.themes.map((t) => t.className).filter(Boolean),
      'theme-dark',
      'theme-midnight',
    ];
  }

  /**
   * Apply the persisted theme. Called once from the root component so that
   * every page — including login and register, which render before the shell —
   * starts with the right class on <body>.
   */
  init(): ThemeMode {
    const raw = localStorage.getItem(STORAGE_KEY);
    const mode = this.resolve(raw);
    this.apply(mode);

    // Normalise a legacy value ('Dark'/'Midnight') so later reads are migrated.
    // Nothing is written when storage was empty: an untouched visitor keeps
    // following DEFAULT_THEME rather than silently owning a choice they never made.
    if (raw && raw !== mode) localStorage.setItem(STORAGE_KEY, mode);

    return mode;
  }

  /** Persist and apply a theme, then notify any other open switcher. */
  set(mode: ThemeMode): void {
    const resolved = this.resolve(mode);
    localStorage.setItem(STORAGE_KEY, resolved);
    this.apply(resolved);
    window.dispatchEvent(new CustomEvent('ui-theme', { detail: resolved }));
  }

  /** Read the stored theme without applying it. */
  stored(): ThemeMode {
    return this.resolve(localStorage.getItem(STORAGE_KEY));
  }

  /** Look up an option by id (falls back to Light). */
  option(mode: ThemeMode): ThemeOption {
    return this.themes.find((t) => t.id === mode) ?? this.themes[0];
  }

  /** True when the given theme is one of the dark appearances. */
  isDark(mode: ThemeMode): boolean {
    return this.option(mode).dark;
  }

  /** Coerce anything — legacy name, junk, null — into a valid ThemeMode. */
  private resolve(raw: string | null | undefined): ThemeMode {
    if (!raw) return DEFAULT_THEME;
    if (this.themes.some((t) => t.id === raw)) return raw as ThemeMode;
    return LEGACY_ALIASES[raw] ?? DEFAULT_THEME;
  }

  private apply(mode: ThemeMode): void {
    const body = document.body;
    body.classList.remove(...this.managedClasses);

    const className = this.option(mode).className;
    if (className) body.classList.add(className);

    this.current.set(mode);
  }
}
