export interface CountryDto {
  code: string | null;
  code3: string | null;
  numericCode: number;
  name: string | null;
  officialName: string | null;
  region: string | null;
  subRegion: string | null;
  currencyCode: string | null;
  phoneCode: string | null;
  timeZone: string | null;
  flagEmoji: string | null;
  postalCodePattern: string | null;
  addressFormat: string | null;
  stateLabel: string | null;
  postalCodeLabel: string | null;
  isActive: boolean;
}

export interface SubdivisionDto {
  code: string | null;
  countryCode: string | null;
  name: string | null;
  subdivisionType: string | null;
  isActive: boolean;
}

export interface CityDto {
  id: number;
  name: string | null;
  countryCode: string | null;
  subdivisionCode: string | null;
  postalCode: string | null;
  cityCode: string | null;
  latitude: number | null;
  longitude: number | null;
  population: number;
}
