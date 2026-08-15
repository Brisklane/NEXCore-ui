import { ChangeDetectorRef, Component, ElementRef, EventEmitter, HostListener, OnDestroy, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService, ContextSwitcherService, ThemeService, ThemeMode } from '@nexcore/core';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header implements OnInit, OnDestroy {
  @Output() menuToggle = new EventEmitter<void>();
  @Output() aiToggle = new EventEmitter<void>();
  showMenu = false;
  wsOpen = false;

  toggleWorkspace(event?: MouseEvent): void {
    if (event) event.stopPropagation();
    this.wsOpen = !this.wsOpen;
    this.showMenu = false;
  }
  closeWorkspace(): void { this.wsOpen = false; }

  /** Name of the currently selected company (for the workspace chip). */
  get selectedCompanyName(): string {
    const id = this.contextSwitcher.selectedCompanyId();
    return (
      this.contextSwitcher.companies().find((c) => c.companyId === id)?.companyName ||
      'Select company'
    );
  }
  /** Name of the currently selected branch (subtitle on the chip). */
  get selectedBranchName(): string {
    const id = this.contextSwitcher.selectedBranchId();
    return this.contextSwitcher.branches().find((b) => b.id === id)?.name || 'All branches';
  }
  /** First letter of the company name for the gradient badge. */
  get companyInitial(): string {
    return (this.selectedCompanyName || '?').trim().charAt(0).toUpperCase();
  }

  /** User initials (1–2 letters) for the avatar. */
  get initials(): string {
    const parts = (this.fullName || '').trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return '?';
    const first = parts[0].charAt(0);
    const last = parts.length > 1 ? parts[parts.length - 1].charAt(0) : '';
    return (first + last).toUpperCase();
  }

  /** True when the browser has offered to install the app (PWA). */
  canInstall = false;

  theme: ThemeMode = 'Light';

  fullName = 'Kaynat Waleed';

  role = 'Business Analyst';

  t: Record<string, string> = {};

  private dict = {
    English: {
      myProfile: 'My Profile',
      help: 'Help & Support',
      theme: 'Theme',
      language: 'Language',
      logout: 'Log Out',
      updateSuccessful: 'Update Successful',
    },
    // Urdu: {
    //   myProfile: 'Ù…ÛŒØ±Ø§ Ù¾Ø±ÙˆÙØ§Ø¦Ù„',
    //   help: 'Ù…Ø¯Ø¯ Ø§ÙˆØ± Ø³Ù¾ÙˆØ±Ù¹',
    //   theme: 'ØªÚ¾ÛŒÙ…',
    //   language: 'Ø²Ø¨Ø§Ù†',
    //   logout: 'Ù„Ø§Ú¯ Ø¢Ø¤Ù¹',
    //   updateSuccessful: 'Ú©Ø§Ù…ÛŒØ§Ø¨ÛŒ Ø³Û’ Ø§Ù¾ ÚˆÛŒÙ¹ ÛÙˆ Ú¯ÛŒØ§',
    // },
  } as const;

  constructor(
    private elRef: ElementRef,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    public contextSwitcher: ContextSwitcherService,
    public themeService: ThemeService
  ) {}

  /** The five shipped appearances, straight from the theme service. */
  get themes() { return this.themeService.themes; }

  // Kept as fields so they can be removed on destroy. The deferred prompt is captured
  // in index.html (it can fire before Angular boots); here we just react to its presence.
  private readonly onInstallable = () => { this.canInstall = true; this.cdr.detectChanges(); };
  private readonly onInstalled = () => { this.canInstall = false; this.cdr.detectChanges(); };

  ngOnInit(): void {
    const user = this.authService.getUser();
    if (user?.fullName) this.fullName = user.fullName;
    if (Array.isArray(user?.roles) && user.roles.length) this.role = user.roles[0];

    this.theme = this.themeService.stored();
    window.addEventListener('ui-theme', this.onThemeChanged);

    this.canInstall = !!(window as any).__deferredInstallPrompt;
    window.addEventListener('pwa-installable', this.onInstallable);
    window.addEventListener('pwa-installed', this.onInstalled);

    this.contextSwitcher.loadCompanies().catch(() => {});
  }

  ngOnDestroy(): void {
    window.removeEventListener('pwa-installable', this.onInstallable);
    window.removeEventListener('pwa-installed', this.onInstalled);
    window.removeEventListener('ui-theme', this.onThemeChanged);
  }

  /** Trigger the browser's PWA install flow (installs the app on the local system). */
  async installApp(event?: MouseEvent) {
    if (event) event.stopPropagation();
    const promptEvent = (window as any).__deferredInstallPrompt;
    if (!promptEvent) return;
    this.closeMenu();
    promptEvent.prompt();
    try { await promptEvent.userChoice; } catch { /* user dismissed */ }
    (window as any).__deferredInstallPrompt = null;
    this.canInstall = false;
    this.cdr.detectChanges();
  }

  toggleMenu(event?: MouseEvent) {
    if (event) event.stopPropagation();
    this.showMenu = !this.showMenu;
    // Picks up theme changes made elsewhere (e.g. Administration > Settings) since this component is long-lived.
    if (this.showMenu) {
      const savedTheme = (localStorage.getItem('ui_theme') as ThemeMode) || 'Light';
      this.theme = savedTheme;
    }
  }

  closeMenu() {
    this.showMenu = false;
  }

  goMyProfile(event?: MouseEvent) {
    if (event) event.stopPropagation();
    this.closeMenu();
    // this.router.navigate(['/my-profile']);
  }

  goHelp(event?: MouseEvent) {
    if (event) event.stopPropagation();
    this.closeMenu();
    // this.router.navigate(['/help']);
  }

  setTheme(mode: ThemeMode, event?: MouseEvent) {
    if (event) event.stopPropagation();
    this.theme = mode;
    this.themeService.set(mode);
  }

  /** Keep the header in sync when the theme is changed from Settings. */
  private readonly onThemeChanged = (e: Event) => {
    this.theme = (e as CustomEvent<ThemeMode>).detail ?? this.themeService.stored();
    this.cdr.detectChanges();
  };

  // private applyLang(lang: LangMode) {
  //   this.t = this.dict[lang];
  //   document.documentElement.dir = lang === 'Urdu' ? 'rtl' : 'ltr';
  // }

  async onCompanyChange(companyId: string): Promise<void> {
    this.contextSwitcher.selectedCompanyId.set(companyId);
    await this.contextSwitcher.loadBranches(companyId);
    const branch = this.contextSwitcher.branches()[0];
    const bu = this.contextSwitcher.businessUnits()[0];
    if (branch && bu) {
      const switched = await this.contextSwitcher.switchContext(companyId, branch.id, bu.id);
      if (switched) this.router.navigate(['/']);
    }
  }

  async onBranchChange(branchId: string): Promise<void> {
    this.contextSwitcher.selectedBranchId.set(branchId);
    await this.contextSwitcher.loadBusinessUnits(branchId);
    const bu = this.contextSwitcher.businessUnits()[0];
    if (bu) {
      const switched = await this.contextSwitcher.switchContext(
        this.contextSwitcher.selectedCompanyId(),
        branchId,
        bu.id
      );
      if (switched) this.router.navigate(['/']);
    }
  }

  async onBusinessUnitChange(buId: string): Promise<void> {
    this.contextSwitcher.selectedBusinessUnitId.set(buId);
    const switched = await this.contextSwitcher.switchContext(
      this.contextSwitcher.selectedCompanyId(),
      this.contextSwitcher.selectedBranchId(),
      buId
    );
    if (switched) this.router.navigate(['/']);
  }

  logout(event?: MouseEvent) {
    if (event) event.stopPropagation();
    this.closeMenu();

    this.authService.logout().subscribe(() => {
      this.router.navigate(['/login']);
    });
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const clickedInside = this.elRef.nativeElement.contains(event.target);
    if (!clickedInside) { this.showMenu = false; this.wsOpen = false; }
  }

  @HostListener('document:keydown.escape')
  onEsc() {
    this.showMenu = false;
    this.wsOpen = false;
  }
}