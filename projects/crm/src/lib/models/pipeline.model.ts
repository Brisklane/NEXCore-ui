export interface PipelineStageDto {
  id: string;
  pipelineId: string;
  stageName: string | null;
  displayOrder: number;
  probabilityPercent: number;
  isWon: boolean;
  isLost: boolean;
  forecastCategory: string | null;
}

export interface CreatePipelineStageDto {
  stageName?: string | null;
  displayOrder: number;
  probabilityPercent: number;
  isWon: boolean;
  isLost: boolean;
  forecastCategory?: string | null;
}

export interface UpdatePipelineStageDto {
  stageName?: string | null;
  displayOrder: number;
  probabilityPercent: number;
  isWon: boolean;
  isLost: boolean;
  forecastCategory?: string | null;
}

export interface PipelineDto {
  id: string;
  pipelineName: string | null;
  description: string | null;
  isDefault: boolean;
  isActive: boolean;
  createdAt: string;
  stages: PipelineStageDto[] | null;
}

export interface CreatePipelineDto {
  pipelineName?: string | null;
  description?: string | null;
  isDefault: boolean;
  isActive: boolean;
  stages?: CreatePipelineStageDto[] | null;
}

export interface UpdatePipelineDto {
  pipelineName?: string | null;
  description?: string | null;
  isDefault?: boolean;
  isActive?: boolean;
}
