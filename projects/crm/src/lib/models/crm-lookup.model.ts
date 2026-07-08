export interface CrmLookupItemDto {
  value: string | null;
  label: string | null;
}

export interface CrmLookupsDto {
  leadStatuses: CrmLookupItemDto[] | null;
  salutations: CrmLookupItemDto[] | null;
  leadSources: CrmLookupItemDto[] | null;
  industries: CrmLookupItemDto[] | null;
  countries: CrmLookupItemDto[] | null;
  statesProvinces: CrmLookupItemDto[] | null;
}
