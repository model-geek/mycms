/**
 * メディア管理のドメイン型定義
 */

export interface Media {
  id: string;
  serviceId: string;
  fileName: string;
  url: string;
  blobPath: string;
  mimeType: string;
  size: number;
  width: number | null;
  height: number | null;
  createdAt: Date;
}

export interface ListMediaParams {
  serviceId: string;
  limit?: number;
  offset?: number;
}

export interface ListMediaResult {
  media: Media[];
  totalCount: number;
  limit: number;
  offset: number;
}
