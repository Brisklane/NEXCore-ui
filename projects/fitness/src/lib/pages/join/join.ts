import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import {
  CatalogueService, ComplianceService, LeadService, MemberService,
} from '../../services/fitness.services';
import {
  HealthScreeningAnswerDto, HealthScreeningFormDto, JoinMemberDto, JoinResultDto,
  MembershipPlanDto, SalesCatalogueDto, SaveMemberDto, WaiverTemplateDto,
} from '../../models/fitness.models';
import {
  BillingPeriod, CredentialType, Gender, GENDER_LABELS, MessageChannel,
  PaymentMethod, PAYMENT_METHOD_LABELS, enumOptions,
} from '../../models/fitness.enums';
import { ClubPickerComponent } from '../shared/club-picker';
import { PageHelpComponent } from '../shared/page-help';
import {
  FieldErrorComponent, FieldErrors, email, required, validate,
} from '../shared/validation';

type Step = 'who' | 'plan' | 'health' | 'pay' | 'done';

/**
 * Signing somebody up, start to finish.
 *
 * Four steps, then one request. Everything is committed together on the server — member,
 * consents, waiver, screening, agreement, payment method, first payment and access credential —
 * because a half-joined member is the single most common mess in gym software: signed but not
 * billed, or billed with no fob, or paying with no waiver on file.
 *
 * The health screening gates the rest. A "yes" on any of the flagged questions still lets the
 * membership start, but access waits for a clinician to sign off, and the wizard says so plainly
 * rather than quietly failing at the barrier a week later.
 *
 * No card number is ever typed into this screen. Payment is taken on the terminal and only its
 * reference comes back.
 */
@Component({
  standalone: true,
  selector: 'lib-fitness-join',
  imports: [
    CommonModule, FormsModule, ClubPickerComponent, PageHelpComponent, FieldErrorComponent,
  ],
  templateUrl: './join.html',
  styleUrls: ['../fitness-shared.css', './join.css'],
})
export class JoinComponent {
  private members = inject(MemberService);
  private catalogue = inject(CatalogueService);
  private compliance = inject(ComplianceService);
  private leads = inject(LeadService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  step: Step = 'who';
  loading = false;
  saving = false;
  error = '';
  clubId: string | null = null;
  leadId: string | null = null;

  catalogueData: SalesCatalogueDto | null = null;
  screeningForm: HealthScreeningFormDto | null = null;
  waiver: WaiverTemplateDto | null = null;
  result: JoinResultDto | null = null;

  errors: FieldErrors = {};

  member: SaveMemberDto = this.blankMember();
  planId: string | null = null;
  promoCode = '';
  promoMessage = '';
  promoOk: boolean | null = null;

  answers: HealthScreeningAnswerDto[] = [];
  waiverAccepted = false;
  marketingEmail = false;
  marketingSms = false;

  paymentMethod = PaymentMethod.DirectDebit;
  takeFirstPaymentNow = true;
  paymentReference = '';
  credentialIdentifier = '';

  readonly genderOptions = enumOptions(GENDER_LABELS);
  readonly methodOptions = enumOptions(PAYMENT_METHOD_LABELS);
  readonly PaymentMethod = PaymentMethod;
  readonly BillingPeriod = BillingPeriod;

  readonly steps: { key: Step; label: string }[] = [
    { key: 'who', label: 'Who they are' },
    { key: 'plan', label: 'What they are buying' },
    { key: 'health', label: 'Health and waiver' },
    { key: 'pay', label: 'Payment' },
  ];

  async onClub(id: string | null): Promise<void> {
    this.clubId = id;
    this.leadId = this.route.snapshot.queryParamMap.get('leadId');
    if (!id) return;

    this.loading = true;

    const [cat, form, waivers] = await Promise.all([
      firstValueFrom(this.catalogue.getSalesCatalogue(id)).catch(() => null),
      firstValueFrom(this.compliance.getScreeningForm(id)).catch(() => null),
      firstValueFrom(this.compliance.getWaiverTemplates(id, true)).catch(() => null),
    ]);

    this.catalogueData = cat?.data ?? null;
    this.screeningForm = form?.data ?? null;
    this.answers = (form?.data?.questions ?? []).map(q => ({ ...q, booleanAnswer: false }));
    this.waiver = waivers?.data?.[0] ?? null;

    // Coming from an enquiry: carry across what they already told us.
    if (this.leadId) {
      const lead = await firstValueFrom(this.leads.getById(this.leadId)).catch(() => null);
      if (lead?.data) {
        this.member.firstName = lead.data.firstName;
        this.member.lastName = lead.data.lastName ?? '';
        this.member.phone = lead.data.phone ?? null;
        this.member.email = lead.data.email ?? null;
        this.member.leadSourceId = lead.data.leadSourceId ?? null;
      }
    }

    this.loading = false;
    this.cdr.detectChanges();
  }

  // ── Navigation ─────────────────────────────────────────────────────────

  stepIndex(step: Step): number { return this.steps.findIndex(s => s.key === step); }

  isDone(step: Step): boolean { return this.stepIndex(step) < this.stepIndex(this.step); }

  next(): void {
    if (!this.validateStep()) return;

    const order: Step[] = ['who', 'plan', 'health', 'pay'];
    const i = order.indexOf(this.step);
    if (i >= 0 && i < order.length - 1) this.step = order[i + 1];
  }

  back(): void {
    const order: Step[] = ['who', 'plan', 'health', 'pay'];
    const i = order.indexOf(this.step);
    if (i > 0) this.step = order[i - 1];
  }

  private validateStep(): boolean {
    this.errors = {};

    if (this.step === 'who') {
      this.errors = validate(this.member as unknown as Record<string, unknown>, {
        firstName: [required('A first name')],
        lastName: [required('A last name')],
        email: [email('Email')],
      });

      if (!this.member.phone?.trim() && !this.member.email?.trim()) {
        this.errors['phone'] = 'Give a phone number or an email — we need a way to reach them.';
      }

      if (!this.member.dateOfBirth) {
        this.errors['dateOfBirth'] = 'A date of birth is needed. Several rules depend on age.';
      }
    }

    if (this.step === 'plan' && !this.planId) {
      this.errors['planId'] = 'Pick what they are joining on.';
    }

    if (this.step === 'health' && !this.waiverAccepted) {
      this.errors['waiver'] = 'The waiver has to be accepted before they can use the club.';
    }

    return Object.keys(this.errors).length === 0;
  }

  // ── Plan ───────────────────────────────────────────────────────────────

  get chosenPlan(): MembershipPlanDto | null {
    const all = [
      ...(this.catalogueData?.memberships ?? []),
      ...(this.catalogueData?.packs ?? []),
      ...(this.catalogueData?.passes ?? []),
    ];
    return all.find(p => p.id === this.planId) ?? null;
  }

  get joiningFee(): number { return this.chosenPlan?.joiningFee ?? 0; }

  get dueToday(): number {
    if (!this.chosenPlan) return 0;
    return this.chosenPlan.price + this.joiningFee;
  }

  async checkPromo(): Promise<void> {
    if (!this.promoCode.trim() || !this.clubId || !this.planId) return;

    const res = await firstValueFrom(this.catalogue.checkPromoCode({
      codeText: this.promoCode.trim(),
      clubId: this.clubId,
      planId: this.planId,
    })).catch(() => null);

    const r = res?.data;
    this.promoOk = r?.isValid ?? false;

    // A refusal already comes back as a sentence somebody can read out to the member; a valid
    // code is turned into one here, so both halves of this control speak the same way.
    this.promoMessage = r?.isValid
      ? `${r.promotionName ?? 'Applied'}`
        + (r.discountedPrice != null ? ` — ${r.discountedPrice.toFixed(2)} instead of ${(r.originalPrice ?? 0).toFixed(2)}` : '')
        + (r.periodCount > 0 ? ` for ${r.periodCount} period${r.periodCount === 1 ? '' : 's'}` : '')
      : r?.reason ?? 'That code was not recognised.';
    this.cdr.detectChanges();
  }

  // ── Health ─────────────────────────────────────────────────────────────

  /** Any flagged question answered yes means access waits for a clinician. */
  get needsClearance(): boolean {
    return this.answers.some(a => a.isGatingQuestion && a.booleanAnswer === true);
  }

  // ── Submit ─────────────────────────────────────────────────────────────

  async submit(): Promise<void> {
    if (!this.clubId || !this.planId) return;

    this.saving = true;
    this.error = '';

    const payload: JoinMemberDto = {
      member: { ...this.member, homeClubId: this.clubId },
      planId: this.planId,
      clubId: this.clubId,
      startsOn: new Date().toISOString(),
      promoCodeText: this.promoOk ? this.promoCode.trim() : null,
      waiveJoiningFee: false,
      paymentMethod: this.paymentMethod,
      takeFirstPaymentNow: this.takeFirstPaymentNow,
      leadId: this.leadId,
      waiverTemplateId: this.waiver?.id ?? null,
      healthScreening: this.screeningForm
        ? { answers: this.answers, templateVersion: this.screeningForm.templateVersion }
        : null,
      credentialType: this.credentialIdentifier.trim() ? CredentialType.RfidFob : null,
      credentialIdentifier: this.credentialIdentifier.trim() || null,
      consents: [
        {
          channel: MessageChannel.Email, purpose: 'Marketing',
          granted: this.marketingEmail, capturedVia: 'Join wizard',
        },
        {
          channel: MessageChannel.Sms, purpose: 'Marketing',
          granted: this.marketingSms, capturedVia: 'Join wizard',
        },
      ],
    } as unknown as JoinMemberDto;

    const res = this.leadId
      ? await firstValueFrom(this.leads.convert(this.leadId, payload)).catch(() => null)
      : await firstValueFrom(this.members.join(payload)).catch(() => null);

    this.saving = false;

    if (res?.data) {
      this.result = res.data;
      this.step = 'done';
    } else {
      this.error = 'That did not go through. Nothing has been saved — try again.';
    }

    this.cdr.detectChanges();
  }

  openMember(): void {
    if (this.result) void this.router.navigateByUrl(`/fitness/members/${this.result.memberId}`);
  }

  startAgain(): void {
    this.result = null;
    this.member = this.blankMember();
    this.planId = null;
    this.promoCode = '';
    this.promoOk = null;
    this.credentialIdentifier = '';
    this.waiverAccepted = false;
    this.step = 'who';
  }

  private blankMember(): SaveMemberDto {
    return {
      firstName: '',
      lastName: '',
      gender: Gender.Unspecified,
      preferredChannel: MessageChannel.Email,
      homeClubId: '',
    } as unknown as SaveMemberDto;
  }
}
