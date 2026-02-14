import type { Content } from "../model";

/** 編集用コンテンツ（下書きデータを含む） */
export interface ContentForEdit extends Content {
  editData: Record<string, unknown>;
}
