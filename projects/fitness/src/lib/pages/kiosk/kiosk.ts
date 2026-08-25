import { ChangeDetectorRef, Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { AccessService } from '../../services/fitness.services';
import { FitnessContextService } from '../../services/fitness-context.service';
import { AccessDecisionDto } from '../../models/fitness.models';
import { AccessDecision, CredentialType, ReaderDirection } from '../../models/fitness.enums';

/**
 * Self check-in, on the tablet by the barrier.
 *
 * Everything here is bigger than the rest of the app on purpose: it is read at arm's length, by
 * somebody in a hurry, often with cold hands and a bag on their shoulder. There is no navigation,
 * because a member who wanders into the staff screens from an unattended tablet is a data breach.
 *
 * The result clears itself after a few seconds so the next person does not see the last person's
 * name — which matters more than it sounds when the tablet faces a queue.
 */
@Component({
  standalone: true,
  selector: 'lib-fitness-kiosk',
  imports: [CommonModule, FormsModule],
  templateUrl: './kiosk.html',
  styleUrls: ['../fitness-shared.css', './kiosk.css'],
})
export class KioskComponent implements OnInit, OnDestroy {
  private access = inject(AccessService);
  private ctx = inject(FitnessContextService);
  private cdr = inject(ChangeDetectorRef);

  clubId: string | null = null;
  clubName = '';

  entry = '';
  busy = false;
  decision: AccessDecisionDto | null = null;

  readonly AccessDecision = AccessDecision;

  private clearTimer?: ReturnType<typeof setTimeout>;

  async ngOnInit(): Promise<void> {
    await this.ctx.ensureLoaded();
    this.clubId = this.ctx.clubId();
    this.clubName = this.ctx.current?.name ?? '';
    this.cdr.detectChanges();
  }

  ngOnDestroy(): void {
    if (this.clearTimer) clearTimeout(this.clearTimer);
  }

  press(key: string): void {
    if (this.entry.length >= 24) return;
    this.entry += key;
  }

  backspace(): void {
    this.entry = this.entry.slice(0, -1);
  }

  clear(): void {
    this.entry = '';
  }

  async submit(): Promise<void> {
    const identifier = this.entry.trim();
    if (!identifier || !this.clubId || this.busy) return;

    this.busy = true;
    const res = await firstValueFrom(this.access.decide({
      clubId: this.clubId,
      credentialIdentifier: identifier,
      method: CredentialType.MembershipQr,
      direction: ReaderDirection.In,
      wasOfflineDecision: false,
    })).catch(() => null);

    this.busy = false;
    this.entry = '';

    this.decision = res?.data ?? {
      decision: AccessDecision.Denied,
      denialReason: 0,
      message: 'We could not check that just now. Please see the desk.',
      alerts: [],
      clubOccupancy: 0,
      visitNumber: 0,
      isMilestoneVisit: false,
      isBirthday: false,
      decisionMs: 0,
    } as unknown as AccessDecisionDto;

    this.cdr.detectChanges();
    this.scheduleClear();
  }

  /**
   * Clears the result so the next person in the queue does not read the last person's name.
   *
   * A refusal is held a little longer, because the member needs time to read why and decide what
   * to do about it.
   */
  private scheduleClear(): void {
    if (this.clearTimer) clearTimeout(this.clearTimer);
    const hold = this.decision?.decision === AccessDecision.Denied ? 12_000 : 6_000;
    this.clearTimer = setTimeout(() => {
      this.decision = null;
      this.cdr.detectChanges();
    }, hold);
  }

  dismiss(): void {
    if (this.clearTimer) clearTimeout(this.clearTimer);
    this.decision = null;
  }

  // ── Presentation ───────────────────────────────────────────────────────

  decisionClass(d: AccessDecisionDto): string {
    if (d.decision === AccessDecision.Denied) return 'is-denied';
    if (d.decision === AccessDecision.GrantedWithWarning) return 'is-warned';
    return 'is-allowed';
  }

  decisionIcon(d: AccessDecisionDto): string {
    if (d.decision === AccessDecision.Denied) return 'block';
    if (d.decision === AccessDecision.GrantedWithWarning) return 'warning';
    return 'check_circle';
  }

  headline(d: AccessDecisionDto): string {
    const name = d.preferredName || d.memberName?.split(' ')[0] || '';
    if (d.decision === AccessDecision.Denied) return name ? `Sorry, ${name}` : 'Sorry';
    if (d.isBirthday) return name ? `Happy birthday, ${name}!` : 'Happy birthday!';
    if (d.isMilestoneVisit) return name ? `${name} — visit ${d.visitNumber}!` : `Visit ${d.visitNumber}!`;
    return name ? `Welcome, ${name}` : 'Welcome';
  }
}
