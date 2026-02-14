/**
 * APIキー管理のドメイン型定義
 */

export interface ApiKey {
  id: string;
  serviceId: string;
  name: string;
  keyHash: string;
  keyPrefix: string;
  permission: string;
  endpoints: unknown;
  lastUsedAt: Date | null;
  createdAt: Date;
}

export interface ApiKeyListItem {
  id: string;
  name: string;
  keyPrefix: string;
  permission: string;
  lastUsedAt: Date | null;
  createdAt: Date;
}

export interface CreateApiKeyResult {
  id: string;
  name: string;
  key: string;
  keyPrefix: string;
  permission: string;
}
