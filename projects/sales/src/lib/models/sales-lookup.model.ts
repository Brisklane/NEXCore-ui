export interface EnumLookupDto {
  value: string;
  label: string;
  /** @deprecated API returns 'label', kept for backward compatibility */
  name?: string;
}
