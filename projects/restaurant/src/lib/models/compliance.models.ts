import { StaffRole } from './restaurant.enums';

/** Mirrors `Restaurant.Domain.Enums.TemperatureCheckpointKind`. */
export enum TemperatureCheckpointKind {
  Refrigerator = 1,
  Freezer = 2,
  HotHolding = 3,
  DeliveryIntake = 4,
  CookedCore = 5,
  Reheated = 6,
  AmbientStore = 7,
  DishwasherRinse = 8,
}

export const CHECKPOINT_KIND_LABELS: Record<TemperatureCheckpointKind, string> = {
  [TemperatureCheckpointKind.Refrigerator]: 'Fridge',
  [TemperatureCheckpointKind.Freezer]: 'Freezer',
  [TemperatureCheckpointKind.HotHolding]: 'Hot holding',
  [TemperatureCheckpointKind.DeliveryIntake]: 'Delivery intake',
  [TemperatureCheckpointKind.CookedCore]: 'Cooked core',
  [TemperatureCheckpointKind.Reheated]: 'Reheated',
  [TemperatureCheckpointKind.AmbientStore]: 'Dry store',
  [TemperatureCheckpointKind.DishwasherRinse]: 'Dishwasher rinse',
};

export enum ChecklistFrequency {
  Opening = 1,
  Closing = 2,
  Daily = 3,
  Weekly = 4,
  Monthly = 5,
  OnDemand = 6,
}

export const CHECKLIST_FREQUENCY_LABELS: Record<ChecklistFrequency, string> = {
  [ChecklistFrequency.Opening]: 'Opening',
  [ChecklistFrequency.Closing]: 'Closing',
  [ChecklistFrequency.Daily]: 'Daily',
  [ChecklistFrequency.Weekly]: 'Weekly',
  [ChecklistFrequency.Monthly]: 'Monthly',
  [ChecklistFrequency.OnDemand]: 'On demand',
};

export enum ChecklistAnswerType {
  YesNo = 1,
  Numeric = 2,
  Text = 3,
  Acknowledge = 4,
}

export const ANSWER_TYPE_LABELS: Record<ChecklistAnswerType, string> = {
  [ChecklistAnswerType.YesNo]: 'Yes / no',
  [ChecklistAnswerType.Numeric]: 'A measured value',
  [ChecklistAnswerType.Text]: 'Free text',
  [ChecklistAnswerType.Acknowledge]: 'Acknowledge',
};

export interface TemperatureCheckpointDto {
  id: string;
  outletId: string;
  name: string;
  kind: TemperatureCheckpointKind;
  minSafeCelsius: number;
  maxSafeCelsius: number;
  checkIntervalHours: number;
  displayOrder: number;
  location?: string | null;
  stationId?: string | null;
  stationName?: string | null;
  isActive: boolean;
  description?: string | null;
  lastReadingCelsius?: number | null;
  lastReadingAt?: string | null;
  lastReadingOutOfRange: boolean;
  isDue: boolean;
  openBreachCount: number;
}

export type SaveTemperatureCheckpointDto = Omit<
  TemperatureCheckpointDto,
  'id' | 'stationName' | 'lastReadingCelsius' | 'lastReadingAt' | 'lastReadingOutOfRange' | 'isDue' | 'openBreachCount'
>;

export interface TemperatureLogDto {
  id: string;
  checkpointId: string;
  checkpointName?: string | null;
  checkpointKind: TemperatureCheckpointKind;
  minSafeCelsius: number;
  maxSafeCelsius: number;
  outletId: string;
  readingCelsius: number;
  recordedAt: string;
  staffId?: string | null;
  staffName?: string | null;
  isOutOfRange: boolean;
  correctiveAction?: string | null;
  isResolved: boolean;
  resolvedAt?: string | null;
  note?: string | null;
}

export interface RecordTemperatureDto {
  checkpointId: string;
  readingCelsius: number;
  staffId?: string | null;
  correctiveAction?: string | null;
  note?: string | null;
}

export interface ResolveBreachDto {
  logId: string;
  correctiveAction: string;
  staffId?: string | null;
}

export interface ChecklistItemDto {
  id: string;
  checklistId: string;
  text: string;
  answerType: ChecklistAnswerType;
  minValue?: number | null;
  maxValue?: number | null;
  unit?: string | null;
  isCritical: boolean;
  displayOrder: number;
  guidance?: string | null;
}

export interface ChecklistDto {
  id: string;
  outletId: string;
  name: string;
  frequency: ChecklistFrequency;
  activeDays?: string | null;
  dueAt?: string | null;
  assignedRole?: StaffRole | null;
  displayOrder: number;
  isActive: boolean;
  description?: string | null;
  items: ChecklistItemDto[];
  todayRunId?: string | null;
  isDueToday: boolean;
  isCompletedToday: boolean;
  hasOpenCriticalFailure: boolean;
}

export type SaveChecklistDto = Omit<
  ChecklistDto, 'id' | 'todayRunId' | 'isDueToday' | 'isCompletedToday' | 'hasOpenCriticalFailure'
>;

export interface ChecklistAnswerDto {
  id: string;
  runId: string;
  checklistItemId: string;
  itemText: string;
  answerType: ChecklistAnswerType;
  yesNoValue?: boolean | null;
  numericValue?: number | null;
  textValue?: string | null;
  isPass: boolean;
  isCritical: boolean;
  correctiveAction?: string | null;
  answeredAt: string;
  displayOrder: number;
}

export interface ChecklistRunDto {
  id: string;
  checklistId: string;
  checklistName?: string | null;
  frequency: ChecklistFrequency;
  outletId: string;
  dueOn: string;
  startedAt?: string | null;
  completedAt?: string | null;
  completedByStaffId?: string | null;
  completedByStaffName?: string | null;
  passCount: number;
  failCount: number;
  hasCriticalFailure: boolean;
  correctiveAction?: string | null;
  note?: string | null;
  answers: ChecklistAnswerDto[];
}

export interface SubmitChecklistRunDto {
  checklistId: string;
  runId?: string | null;
  outletId: string;
  staffId?: string | null;
  note?: string | null;
  correctiveAction?: string | null;
  answers: Partial<ChecklistAnswerDto>[];
}

export interface PrepBatchDto {
  id: string;
  outletId: string;
  batchCode: string;
  itemName: string;
  recipeId?: string | null;
  menuItemId?: string | null;
  inventoryItemId?: string | null;
  quantity: number;
  uom: string;
  preparedAt: string;
  useByAt: string;
  preparedByStaffId?: string | null;
  preparedByStaffName?: string | null;
  supplierBatchRefs?: string | null;
  isDiscarded: boolean;
  discardedAt?: string | null;
  discardReason?: string | null;
  storageLocation?: string | null;
  note?: string | null;
  hoursRemaining: number;
  isExpired: boolean;
}

export interface SavePrepBatchDto {
  outletId: string;
  itemName: string;
  recipeId?: string | null;
  menuItemId?: string | null;
  inventoryItemId?: string | null;
  quantity: number;
  uom: string;
  preparedAt?: string | null;
  shelfLifeHours?: number | null;
  useByAt?: string | null;
  preparedByStaffId?: string | null;
  supplierBatchRefs?: string | null;
  storageLocation?: string | null;
  note?: string | null;
}

export interface ComplianceBoardDto {
  outletId: string;
  generatedAt: string;
  checksDue: number;
  checksOverdue: number;
  temperatureChecksDue: number;
  openBreaches: number;
  batchesExpiringSoon: number;
  batchesExpired: number;
  compliancePercent: number;
  checkpoints: TemperatureCheckpointDto[];
  checklists: ChecklistDto[];
  openBreachLogs: TemperatureLogDto[];
  expiringBatches: PrepBatchDto[];
}

export interface DeliveryZoneDto {
  id: string;
  outletId: string;
  name: string;
  deliveryFee: number;
  minimumOrderValue: number;
  radiusKm: number;
  estimatedMinutes: number;
  freeDeliveryThreshold: number;
  coveredAreas?: string | null;
  displayOrder: number;
  colorHex?: string | null;
  isActive: boolean;
  description?: string | null;
}

export interface DeliveryQuoteDto {
  canDeliver: boolean;
  reason?: string | null;
  zoneId?: string | null;
  zoneName?: string | null;
  deliveryFee: number;
  minimumOrderValue: number;
  estimatedMinutes: number;
  distanceKm: number;
  qualifiesForFreeDelivery: boolean;
}

export interface DeliveryQuoteRequestDto {
  outletId: string;
  latitude?: number | null;
  longitude?: number | null;
  area?: string | null;
  orderValue: number;
}
