export interface AttributeDefinitionDto {
  id: string;
  code: string | null;
  name: string | null;
  dataType: string | null;
  unit: string | null;
  allowedValues: string | null;
  isRequired: boolean;
  isVariant: boolean;
  isActive: boolean;
  displayOrder: number;
}

export interface CreateAttributeDefinitionDto {
  code?: string | null;
  name?: string | null;
  dataType?: string | null;
  unit?: string | null;
  allowedValues?: string | null;
  isRequired: boolean;
  isVariant: boolean;
  displayOrder: number;
}

export interface UpdateAttributeDefinitionDto {
  code?: string | null;
  name?: string | null;
  dataType?: string | null;
  unit?: string | null;
  allowedValues?: string | null;
  isRequired?: boolean | null;
  isVariant?: boolean | null;
  displayOrder?: number | null;
  isActive?: boolean | null;
}
