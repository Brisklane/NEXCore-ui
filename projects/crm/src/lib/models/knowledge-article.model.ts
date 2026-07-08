export enum ArticleStatus {
  Draft = 0,
  Published = 1,
  Archived = 2,
}

export const ArticleStatusLabels: Record<number, string> = {
  [ArticleStatus.Draft]: 'Draft',
  [ArticleStatus.Published]: 'Published',
  [ArticleStatus.Archived]: 'Archived',
};

export interface KnowledgeArticleDto {
  id: string;
  articleNumber: string | null;
  title: string | null;
  urlName: string | null;
  articleType: string | null;
  categoryGroup: string | null;
  status: ArticleStatus;
  summary: string | null;
  body: string | null;
  isVisibleInApp: boolean;
  isVisibleInCsp: boolean;
  isVisibleInPkb: boolean;
  publishedDate: string | null;
  versionNumber: number;
  ownerId: string | null;
  createdAt: string;
}

export interface CreateKnowledgeArticleDto {
  title?: string | null;
  urlName?: string | null;
  articleType?: string | null;
  categoryGroup?: string | null;
  summary?: string | null;
  body?: string | null;
  isVisibleInApp: boolean;
  isVisibleInCsp: boolean;
  isVisibleInPkb: boolean;
  ownerId?: string | null;
}

export interface UpdateKnowledgeArticleDto {
  title?: string | null;
  urlName?: string | null;
  articleType?: string | null;
  categoryGroup?: string | null;
  summary?: string | null;
  body?: string | null;
  isVisibleInApp?: boolean;
  isVisibleInCsp?: boolean;
  isVisibleInPkb?: boolean;
  ownerId?: string | null;
}
